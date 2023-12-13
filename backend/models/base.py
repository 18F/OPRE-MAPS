"""Base model and other useful tools for project models."""
import enum
from typing import cast

import sqlalchemy
from marshmallow import fields
from marshmallow.exceptions import MarshmallowError
from marshmallow_enum import EnumField
from sqlalchemy import Column, DateTime, ForeignKey, func
from sqlalchemy.orm import declarative_base, declared_attr, registry, relationship
from typing_extensions import Any

Base = declarative_base()
reg = registry(metadata=Base.metadata)

from marshmallow_sqlalchemy import ModelConversionError, SQLAlchemyAutoSchema


def setup_schema(base: Base) -> callable:
    def setup_schema_fn():
        for class_ in base.registry._class_registry.values():
            if hasattr(class_, "__tablename__"):
                if class_.__name__.endswith("Schema"):
                    raise ModelConversionError(
                        "For safety, setup_schema can not be used when a"
                        "Model class ends with 'Schema'"
                    )

                class Meta(object):
                    model = class_
                    dateformat = "%Y-%m-%d"
                    datetimeformat = "%Y-%m-%dT%H:%M:%S.%fZ"
                    include_relationships = True
                    load_instance = True
                    include_fk = True

                schema_class_name = f"{class_.__name__}Schema"

                schema_class = type(
                    schema_class_name, (SQLAlchemyAutoSchema,), {"Meta": Meta}
                )

                for column in class_.__mapper__.columns:
                    # handle enums
                    if isinstance(column.type, sqlalchemy.sql.sqltypes.Enum):
                        schema_class._declared_fields[column.key] = EnumField(
                            column.type.enum_class
                        )

                    # handle list of enums
                    if isinstance(column.type, sqlalchemy.types.ARRAY) and isinstance(
                        column.type.item_type.enum_class, enum.EnumMeta
                    ):
                        schema_class._declared_fields[column.key] = fields.List(
                            EnumField(column.type.item_type.enum_class),
                            default=[],
                            allow_none=True,
                        )

                    # handle Decimal
                    if isinstance(column.type, sqlalchemy.types.Numeric):
                        schema_class._declared_fields[column.key] = fields.Decimal(
                            as_string=True
                        )

                setattr(class_, "__marshmallow__", schema_class)

    return setup_schema_fn


from sqlalchemy_continuum import make_versioned

# init sqlalchemy_continuum
make_versioned(user_cls=None)


class BaseModel(Base):  # type: ignore [misc, valid-type]
    __versioned__ = {}
    __abstract__ = True

    @classmethod
    def model_lookup_by_table_name(cls, table_name):
        registry_instance = getattr(cls, "registry")
        for mapper_ in registry_instance.mappers:
            model = mapper_.class_
            model_class_name = model.__table__.name
            if model_class_name == table_name:
                return model

    def to_dict(self):
        if not hasattr(self, "__marshmallow__"):
            raise MarshmallowError(
                f"Model {self.__class__.__name__} does not have a marshmallow schema"
            )
        schema = self.__marshmallow__()
        return schema.dump(self)

    @declared_attr
    def created_by(cls):
        return Column("created_by", ForeignKey("user.id"))

    @declared_attr
    def created_by_user(cls):
        return relationship("User", foreign_keys=[cls.created_by])

    created_on = Column(DateTime, default=func.now())
    updated_on = Column(DateTime, default=func.now(), onupdate=func.now())

    @property
    def display_name(self):
        """A property that can be used to provide a name for display purposes of any instance
        (this should be overridden in subclasses for a better name than this default)"""
        return f"{self.__class__.__name__}#{self.id}"

    @display_name.setter
    def display_name(self, value):
        """a no-op setter for display_name, this prevents errors during binding in API, etc"""
        pass

    class Validator:
        @staticmethod
        def validate(item, data):  # type: ignore [no-untyped-def]
            pass

    def to_slim_dict(self) -> dict[str, Any]:
        d = {
            "id": self.id,
            "display_name": self.display_name,
        }
        return cast(dict[str, Any], d)
