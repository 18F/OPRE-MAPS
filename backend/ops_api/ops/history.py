import logging
from collections import namedtuple
from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from types import NoneType

from flask import current_app
from flask_jwt_extended import verify_jwt_in_request
from flask_jwt_extended.exceptions import NoAuthorizationError
from models import OpsDBHistory, OpsDBHistoryType, OpsEvent, User, Agreement, BaseModel
from ops_api.ops.utils.user import get_user_from_token
from sqlalchemy.cyextension.collections import IdentitySet
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import get_history

DbRecordAudit = namedtuple("DbRecordAudit", "row_key original diff changes")


def convert_for_jsonb(value):
    if isinstance(value, (str, bool, int, float, NoneType)):
        return value
    if isinstance(value, Enum):
        return value.name
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, date):
        return value.isoformat()
    if isinstance(value, BaseModel):
        if callable(getattr(value, "to_slim_dict", None)):
            return value.to_slim_dict()
        return value.to_dict()
    if isinstance(value, (list, tuple)):
        return [convert_for_jsonb(item) for item in value]
    return str(value)


def find_relationship_by_fk(obj, col_key):
    for rel in obj.__mapper__.relationships:
        for lcl in rel.local_columns:
            local_key = obj.__mapper__.get_property_by_column(lcl).key
            if local_key == col_key:
                # rel_obj = getattr(obj, rel.key)
                return rel
    return None


def build_audit(obj, event_type: OpsDBHistoryType) -> DbRecordAudit:
    row_key = "|".join([str(getattr(obj, pk)) for pk in obj.primary_keys])

    original = {}
    diff = {}
    changes = {}

    mapper = obj.__mapper__

    # collect changes in column values
    auditable_columns = list(filter(lambda c: c.key in obj.__dict__, mapper.columns))
    for col in auditable_columns:
        key = col.key
        hist = get_history(obj, key)
        if hist.has_changes():
            # this assumes columns are primitives, not lists
            old_val = convert_for_jsonb(hist.deleted[0]) if hist.deleted else None
            new_val = convert_for_jsonb(hist.added[0]) if hist.added else None
            if old_val:
                original[key] = old_val
            diff[key] = new_val
            if event_type == OpsDBHistoryType.NEW:
                if new_val:
                    changes[key] = {
                        "new": new_val,
                    }
            else:
                changes[key] = {
                    "new": new_val,
                    "old": old_val,
                }
        elif hist.unchanged[0]:
            original[key] = convert_for_jsonb(hist.unchanged[0])

    # collect changes in relationships, such as agreement.team_members
    # limit this to relationships that aren't being logged as their own Classes
    # and only include them on the editable side
    auditable_relationships = list(
        filter(lambda rel: rel.secondary is not None and not rel.viewonly, mapper.relationships)
    )

    for relationship in auditable_relationships:
        key = relationship.key
        hist = get_history(obj, key)
        if hist.has_changes():
            related_class_name = (
                relationship.argument if isinstance(relationship.argument, str) else relationship.argument.__name__
            )
            changes[key] = {
                "related_class_name": related_class_name,
                "added": convert_for_jsonb(hist.added),
            }
            if event_type != OpsDBHistoryType.NEW:
                changes[key]["deleted"] = convert_for_jsonb(hist.deleted)
            old_val = convert_for_jsonb(hist.unchanged + hist.deleted) if hist.unchanged or hist.deleted else None
            new_val = convert_for_jsonb(hist.unchanged + hist.added) if hist.unchanged or hist.added else None
            original[key] = old_val
            diff[key] = new_val
        elif hist.unchanged:
            original[key] = convert_for_jsonb(hist.unchanged)
    return DbRecordAudit(row_key, original, diff, changes)


def track_db_history_before(session: Session):
    session.add_all(add_obj_to_db_history(session.deleted, OpsDBHistoryType.DELETED))
    session.add_all(add_obj_to_db_history(session.dirty, OpsDBHistoryType.UPDATED))


def track_db_history_after(session: Session):
    session.add_all(add_obj_to_db_history(session.new, OpsDBHistoryType.NEW))


def track_db_history_catch_errors(exception_context):
    ops_db = OpsDBHistory(
        event_type=OpsDBHistoryType.ERROR,
        event_details={
            "statement": exception_context.statement,
            "parameters": exception_context.parameters,
            "original_exception": f"{exception_context.original_exception}",
            "sqlalchemy_exception": f"{exception_context.sqlalchemy_exception}",
        },
    )
    with Session(current_app.engine) as session:
        session.add(ops_db)
        session.commit()
        current_app.logger.error(f"SQLAlchemy error added to {OpsDBHistory.__tablename__} with id {ops_db.id}")


def add_obj_to_db_history(objs: IdentitySet, event_type: OpsDBHistoryType):
    result = []

    # Get the current user for setting created_by.  This depends on there being a web request with a valid JWT.
    # If a user cannot be obtained, it will still add the history record without the user.id
    user: User | None = None
    try:
        token = verify_jwt_in_request()
        user = get_user_from_token(token[1] if token else None)
    except NoAuthorizationError:
        current_app.logger.warning("JWT is invalid")
    except Exception as e:
        # Is there's not a request, then a RuntimeError occurs
        current_app.logger.info(f"Failed trying to get the user from the request. {type(e)}: {e}")

    for obj in objs:
        if not isinstance(obj, OpsEvent) and not isinstance(obj, OpsDBHistory):  # not interested in tracking these
            db_audit = build_audit(obj, event_type)
            if event_type == OpsDBHistoryType.UPDATED and not db_audit.changes:
                logging.info(
                    f"No changes found for {obj.__class__.__name__} with row_key={db_audit.row_key}, "
                    f"an OpsDBHistory record will not be created for this UPDATED event."
                )
                continue
            agreement_id = getattr(obj, "agreement_id", None)
            if isinstance(obj, Agreement):
                agreement_id = obj.id

            ops_db = OpsDBHistory(
                event_type=event_type,
                event_details=obj.to_dict(),
                created_by=user.id if user else None,
                class_name=obj.__class__.__name__,
                row_key=db_audit.row_key,
                original=db_audit.original,
                diff=db_audit.diff,
                changes=db_audit.changes,
                agreement_id=agreement_id,
            )
            result.append(ops_db)
    return result
