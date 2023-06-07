import os
from typing import Optional, Tuple

import models.cans
import models.portfolios
import models.procurement_shops
import models.research_projects
import models.users
import sqlalchemy.engine
from data_tools.environment.azure import AzureConfig
from data_tools.environment.cloudgov import CloudGovConfig
from data_tools.environment.common import DataToolsConfig
from data_tools.environment.dev import DevConfig
from data_tools.environment.local import LocalConfig
from data_tools.environment.pytest import PytestConfig
from data_tools.environment.test import TestConfig
from models.base import BaseModel
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine

# Adding these print statements to suppress unused import warnings
print("Loading models for CANs", models.cans)
print("Loading models for Portfolios", models.portfolios)
print("Loading models for Research Projects", models.research_projects)
print("Loading models for Users", models.users)
print("Loading models for Procurement Shop", models.procurement_shops)


def init_db(
    config: DataToolsConfig, db: Optional[Engine] = None
) -> Tuple[sqlalchemy.engine.Engine, sqlalchemy.MetaData]:
    if not db:
        engine = create_engine(
            config.db_connection_string, echo=config.verbosity, future=True
        )
    else:
        engine = db
    return engine, BaseModel.metadata


def get_config(environment_name: Optional[str] = None) -> DataToolsConfig:
    config: DataToolsConfig
    print(f"----------- LOADING CONFIG: {environment_name}")
    match environment_name:
        case "azure":
            config = AzureConfig()
        case "cloudgov":
            config = CloudGovConfig()
        case "local":
            config = LocalConfig()
        case "test":
            config = TestConfig()
        case "pytest":
            config = PytestConfig()
        case _:
            config = DevConfig()
    return config


def delete_and_create(engine: sqlalchemy.engine.Engine) -> None:
    BaseModel.metadata.drop_all(engine)
    BaseModel.metadata.create_all(engine)


if __name__ == "__main__":
    script_env = os.getenv("ENV")
    script_config = get_config(script_env)
    print(f"--------------- CONNECTION STRING: {script_config.db_connection_string}")

    db_engine, db_metadata_obj = init_db(script_config)

    delete_and_create(db_engine)

    print("Data removed from DB.")
