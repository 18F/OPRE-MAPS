import pytest
from models.cans import Agreement


@pytest.mark.usefixtures("app_ctx")
def test_agreement_lookup(loaded_db):
    agreement = loaded_db.session.get(Agreement, 1)
    assert agreement is not None
    assert agreement.name == "NIH VIQI"


def test_agreement_creation():
    agreement = Agreement(name="Agreement-2", agreement_type_id=4)
    assert agreement.to_dict()["name"] == "Agreement-2"
