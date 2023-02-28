import pytest
from models.cans import FundingSource


@pytest.mark.usefixtures("app_ctx")
def test_funding_source_lookup(loaded_db):
    funding_source = loaded_db.session.query(FundingSource).filter(FundingSource.id == 1).one()
    assert funding_source is not None
    assert funding_source.id == 1
    assert funding_source.name == "Children's Bureau"
    assert funding_source.nickname == "Children's Bureau"
    assert funding_source.cans == []  # CAN(#1) was assigned this funding source


def test_finding_source_creation():
    funding_source = FundingSource(name="Funding-Source-3", nickname="FS3")
    assert funding_source.to_dict()["name"] == "Funding-Source-3"
