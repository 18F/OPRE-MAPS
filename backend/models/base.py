"""Base model and other useful tools for project models."""
import decimal
from typing import Annotated, ClassVar, Final, TypeAlias, TypedDict, TypeVar, cast

from marshmallow import Schema as MMSchema
from models.mixins.repr import ReprMixin
from models.mixins.serialize import SerializeMixin
from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, func
from sqlalchemy.orm import declarative_base, declared_attr, mapped_column, registry, relationship
from typing_extensions import Any, override

Base = declarative_base()
reg = registry(metadata=Base.metadata)

intpk = Annotated[int, mapped_column(init=False, repr=True, primary_key=True)]
required_str = Annotated[str, mapped_column(nullable=False)]
optional_str = Annotated[str, mapped_column(nullable=True)]
currency = Annotated[decimal.Decimal, mapped_column(Numeric(12, 2), default=0.00)]
# This is a simple type to make a standard int-base primary key field.

_T = TypeVar("_T")
_dict_registry: dict[str, TypeAlias] = {}


class _DictVar:
    """Dynamically create a TypedDict for the object.

    This is implemented as a descriptor so that all the fields can be
    defined for the class prior to the TypedDict being created.
    """

    def __get__(self, obj: _T, objtype: type[_T] | None = None) -> TypeAlias:
        """Get or create the schema for this object type.

        Note:
            This expects to be used at the class-level, rather than
            instance-level, so it expects that objtype will not be None.
        """
        if objtype is None:
            raise ValueError("Must be set at class-level.")
        name = objtype.__qualname__  # type: ignore [union-attr]
        try:
            return _dict_registry[name]
        except KeyError:
            _dict_registry[name] = TypedDict(  # type: ignore [operator]
                f"{objtype.__name__}.Dict",  # type: ignore [union-attr]
                objtype.__annotations__,
            )
            return _dict_registry[name]


class BaseData:
    """Base class used for dataclass models.

    This provides some convenience attributes and methods to ease the
    development of models. Schema is a simple marshmallow Schema that
    is automatically generated for the dataclass model. Dict is an
    automatically generated TypedDict.

    Note:
        This means that "<Classname>" is the dataclass,
        while "<Classname>.Dict" is a TypedDict that has keys that match the dataclass
        attributes.
    """

    Schema: ClassVar[MMSchema]
    Dict: Final[TypeAlias] = _DictVar()  # type: ignore [valid-type]

    @classmethod
    def from_dict(cls, data: "BaseData.Dict") -> "BaseData":  # type: ignore [name-defined]
        """Load the instance data from the given dict structure."""
        return cls.Schema.load(data)  # type: ignore [no-any-return]

    def to_dict(self) -> "BaseData.Dict":  # type: ignore [name-defined]
        """Dump the instance data into a dict structure."""
        return self.Schema.dump(self)

    @classmethod
    def from_json(cls, data: str) -> "BaseData":
        """Load the instance data from the given json string."""
        return cls.Schema.loads(data)  # type: ignore [no-any-return]

    def to_json(self) -> str:
        """Dump the instance data into a json string."""
        return cast(str, self.Schema.dumps(self))


from sqlalchemy_continuum import make_versioned

make_versioned(user_cls=None)


class BaseModel(Base, SerializeMixin, ReprMixin):  # type: ignore [misc, valid-type]
    __abstract__ = True
    __repr__ = ReprMixin.__repr__

    @classmethod
    def model_lookup_by_table_name(cls, table_name):
        registry_instance = getattr(cls, "registry")
        for mapper_ in registry_instance.mappers:
            model = mapper_.class_
            model_class_name = model.__table__.name
            if model_class_name == table_name:
                return model

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

    @override
    def to_dict(self) -> dict[str, Any]:  # type: ignore [override]
        d = super().to_dict()  # type: ignore [no-untyped-call]

        d.update(
            {
                "created_on": self.created_on.isoformat() if self.created_on else None,
                "updated_on": self.updated_on.isoformat() if self.updated_on else None,
                "display_name": self.display_name,
            }
        )

        return cast(dict[str, Any], d)

    def to_slim_dict(self) -> dict[str, Any]:
        d = {
            "id": self.id,
            "display_name": self.display_name,
        }
        return cast(dict[str, Any], d)
