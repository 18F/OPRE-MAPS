import pytest
from models import ContractAgreement, GrantAgreement
from models.cans import Agreement, AgreementType, ContractType
from sqlalchemy import func, select, update


@pytest.mark.usefixtures("app_ctx")
def test_agreement_retrieve(loaded_db):
    stmt = select(Agreement).where(Agreement.id == 1)
    agreement = loaded_db.scalar(stmt)

    assert agreement is not None
    assert agreement.number == "AGR0001"
    assert agreement.name == "Contract #1: African American Child and Family Research Center"
    assert agreement.id == 1
    assert agreement.agreement_type.name == "CONTRACT"


@pytest.mark.usefixtures("app_ctx")
def test_agreements_get_all(auth_client, loaded_db):
    stmt = select(func.count()).select_from(Agreement)
    count = loaded_db.scalar(stmt)
    assert count == 8

    response = auth_client.get("/api/v1/agreements/")
    assert response.status_code == 200
    assert len(response.json) == count


@pytest.mark.usefixtures("app_ctx")
def test_agreements_get_by_id(auth_client, loaded_db):
    response = auth_client.get("/api/v1/agreements/1")
    assert response.status_code == 200
    assert response.json["name"] == "Contract #1: African American Child and Family Research Center"


@pytest.mark.usefixtures("app_ctx")
def test_agreements_get_by_id_404(auth_client, loaded_db):
    response = auth_client.get("/api/v1/agreements/1000")
    assert response.status_code == 404


@pytest.mark.usefixtures("app_ctx")
def test_agreements_serialization(auth_client, loaded_db):
    response = auth_client.get("/api/v1/agreements/1")
    assert response.status_code == 200

    # Remove extra keys that make test flaky or noisy
    json_to_compare = response.json  # response.json seems to be immutable
    del json_to_compare["created_on"]
    del json_to_compare["updated_on"]
    del json_to_compare["budget_line_items"]
    del json_to_compare["research_project"]
    del json_to_compare["procurement_shop"]
    del json_to_compare["product_service_code"]
    del json_to_compare["team_members"][0]["created_on"]
    del json_to_compare["team_members"][0]["date_joined"]
    del json_to_compare["team_members"][0]["updated_on"]
    del json_to_compare["team_members"][1]["created_on"]
    del json_to_compare["team_members"][1]["date_joined"]
    del json_to_compare["team_members"][1]["updated_on"]

    assert json_to_compare == {
        "agreement_reason": "NEW_REQ",
        "agreement_type": "CONTRACT",
        "contract_number": "CT00XX1",
        "contract_type": "RESEARCH",
        "created_by": 4,
        "delivered_status": False,
        "description": "Test description",
        "id": 1,
        "incumbent": "",
        "name": "Contract #1: African American Child and Family Research Center",
        "notes": None,
        "number": "AGR0001",
        "procurement_shop_id": 1,
        "product_service_code_id": 1,
        "project_officer": 1,
        "research_project_id": 1,
        "support_contacts": [],
        "team_members": [
            {
                "created_by": None,
                "division": 1,
                "email": "chris.fortunato@example.com",
                "first_name": "Chris",
                "full_name": "Chris Fortunato",
                "id": 1,
                "last_name": "Fortunato",
                "oidc_id": "00000000-0000-1111-a111-000000000001",
                "updated": None,
            },
            {
                "created_by": None,
                "division": 2,
                "email": "Amelia.Popham@example.com",
                "first_name": "Amelia",
                "full_name": "Amelia Popham",
                "id": 4,
                "last_name": "Popham",
                "oidc_id": "00000000-0000-1111-a111-000000000004",
                "updated": None,
            },
        ],
        "vendor": "Vendor 1",
    }


@pytest.mark.skip("Need to consult whether this should return ALL or NONE if the value is empty")
@pytest.mark.usefixtures("app_ctx")
def test_agreements_with_research_project_empty(auth_client, loaded_db):
    response = auth_client.get("/api/v1/agreements/?research_project_id=")
    assert response.status_code == 200
    assert len(response.json) == 6


@pytest.mark.usefixtures("app_ctx")
def test_agreements_with_research_project_found(auth_client, loaded_db):
    response = auth_client.get("/api/v1/agreements/?research_project_id=1")
    assert response.status_code == 200
    assert len(response.json) == 2

    assert response.json[0]["id"] == 1
    assert response.json[1]["id"] == 2


@pytest.mark.parametrize(
    "key,value",
    (
        ("agreement_reason", "NEW_REQ"),
        ("contract_number", "CT00XX1"),
        ("contract_type", "RESEARCH"),
        ("agreement_type", "CONTRACT"),
        ("delivered_status", False),
        ("number", "AGR0001"),
        ("procurement_shop_id", 1),
        ("project_officer", 1),
        ("research_project_id", 1),
        ("foa", "This is an FOA value"),
        ("name", "Contract #1: African American Child and Family Research Center"),
    ),
)
@pytest.mark.usefixtures("app_ctx")
def test_agreements_with_filter(auth_client, key, value, loaded_db):
    response = auth_client.get(f"/api/v1/agreements/?{key}={value}")
    assert response.status_code == 200

    success = all(item[key] == value for item in response.json)

    if not success:
        from pprint import pprint

        pprint([item[key] for item in response.json])
        pprint(value)
    assert success


@pytest.mark.usefixtures("app_ctx")
def test_agreements_with_research_project_not_found(auth_client, loaded_db):
    response = auth_client.get("/api/v1/agreements/?research_project_id=1000")
    assert response.status_code == 200
    assert len(response.json) == 0


def test_agreement_search(auth_client, loaded_db):
    response = auth_client.get("/api/v1/agreements/?search=")

    assert response.status_code == 200
    assert len(response.json) == 0

    response = auth_client.get("/api/v1/agreements/?search=contract")
    assert response.status_code == 200
    assert len(response.json) == 2

    response = auth_client.get("/api/v1/agreements/?search=fcl")

    assert response.status_code == 200
    assert len(response.json) == 2


@pytest.mark.usefixtures("app_ctx")
def test_agreements_get_by_id_auth(client, loaded_db):
    response = client.get("/api/v1/agreements/1")
    assert response.status_code == 401


@pytest.mark.usefixtures("app_ctx")
def test_agreements_auth(client, loaded_db):
    response = client.get("/api/v1/agreements/")
    assert response.status_code == 401


@pytest.mark.usefixtures("app_ctx")
def test_agreement_as_contract_has_contract_fields(loaded_db):
    stmt = select(Agreement).where(Agreement.id == 1)
    agreement = loaded_db.scalar(stmt)

    assert agreement.agreement_type.name == "CONTRACT"
    assert agreement.contract_number == "CT00XX1"


@pytest.mark.usefixtures("app_ctx")
def test_agreement_create_contract_agreement(loaded_db):
    contract_agreement = ContractAgreement(
        name="CTXX12399",
        number="AGRXX003459217-B",
        contract_number="CT0002",
        contract_type=ContractType.RESEARCH,
        product_service_code_id=2,
        agreement_type=AgreementType.CONTRACT,
    )
    loaded_db.add(contract_agreement)
    loaded_db.commit()

    stmt = select(Agreement).where(Agreement.id == contract_agreement.id)
    agreement = loaded_db.scalar(stmt)

    assert agreement.contract_number == "CT0002"
    assert agreement.contract_type == ContractType.RESEARCH


@pytest.mark.usefixtures("app_ctx")
def test_agreement_create_grant_agreement(loaded_db):
    grant_agreement = GrantAgreement(
        name="GNTXX12399",
        number="AGRXX003459217-A",
        foa="NIH",
        agreement_type=AgreementType.GRANT,
    )
    loaded_db.add(grant_agreement)
    loaded_db.commit()

    stmt = select(Agreement).where(Agreement.id == grant_agreement.id)
    agreement = loaded_db.scalar(stmt)

    # assert agreement.grant_agreement. == "GR0002"
    assert agreement.foa == "NIH"


@pytest.fixture()
def test_contract(loaded_db):
    contract_agreement = ContractAgreement(
        name="CTXX12399",
        number="AGRXX003459217-B",
        contract_number="CT0002",
        contract_type=ContractType.RESEARCH,
        product_service_code_id=2,
        agreement_type=AgreementType.CONTRACT,
        research_project_id=1,
        created_by=4,
    )
    loaded_db.add(contract_agreement)
    loaded_db.commit()

    yield contract_agreement

    loaded_db.delete(contract_agreement)
    loaded_db.commit()


@pytest.mark.usefixtures("app_ctx")
def test_agreements_put_by_id_400_for_type_change(auth_client, test_contract):
    """400 is returned if the agreement_type is changed"""

    response = auth_client.put(
        f"/api/v1/agreements/{test_contract.id}",
        json={
            "name": "Updated Contract Name",
            "description": "Updated Contract Description",
            "number": "AGR0001",
        },
    )
    print(f"{response.status_code=}")
    assert response.status_code == 400


@pytest.mark.usefixtures("app_ctx")
def test_agreements_put_by_id_400_for_missing_required(auth_client, test_contract):
    """400 is returned required fields are missing"""
    response = auth_client.put(
        f"/api/v1/agreements/{test_contract.id}",
        json={
            "agreement_type": "CONTRACT",
        },
    )
    assert response.status_code == 400


@pytest.mark.usefixtures("app_ctx")
def test_agreements_put_by_id_contract(auth_client, loaded_db, test_contract):
    """PUT CONTRACT Agreement"""
    response = auth_client.put(
        f"/api/v1/agreements/{test_contract.id}",
        json={
            "agreement_type": "CONTRACT",
            "name": "Updated Contract Name",
            "description": "Updated Contract Description",
            "number": "AGR0001",
            "team_members": [{"id": 1}],
            "support_contacts": [{"id": 2}, {"id": 3}],
            "notes": "Test Note",
        },
    )
    assert response.status_code == 200

    stmt = select(Agreement).where(Agreement.id == test_contract.id)
    agreement = loaded_db.scalar(stmt)

    assert agreement.name == "Updated Contract Name"
    assert agreement.description == "Updated Contract Description"
    assert agreement.notes == "Test Note"
    assert [m.id for m in agreement.team_members] == [1]
    assert [m.id for m in agreement.support_contacts] == [2, 3]


@pytest.mark.usefixtures("app_ctx")
def test_agreements_put_by_id_contract_remove_fields(auth_client, loaded_db, test_contract):
    """PUT CONTRACT Agreement and verify missing fields are removed (for PUT)"""
    response = auth_client.put(
        f"/api/v1/agreements/{test_contract.id}",
        json={
            "agreement_type": "CONTRACT",
            "name": "Updated Contract Name",
            "description": "Updated Contract Description",
            "number": "AGR0001",
        },
    )
    assert response.status_code == 200

    stmt = select(Agreement).where(Agreement.id == test_contract.id)
    agreement = loaded_db.scalar(stmt)

    assert agreement.name == "Updated Contract Name"
    assert agreement.description == "Updated Contract Description"
    assert agreement.notes is None
    assert agreement.team_members == []
    assert agreement.support_contacts == []


@pytest.mark.usefixtures("app_ctx")
def test_agreements_put_by_id_grant(auth_client, loaded_db):
    """PUT GRANT Agreement"""
    response = auth_client.put(
        "/api/v1/agreements/3",
        json={
            "agreement_type": "GRANT",
            "name": "Updated Grant Name",
            "description": "Updated Grant Description",
            "number": "AGR0003",
            "team_members": [{"id": 1}, {"id": 2}, {"id": 3}],
        },
    )
    assert response.status_code == 200

    stmt = select(Agreement).where(Agreement.id == 3)
    agreement = loaded_db.scalar(stmt)

    assert agreement.name == "Updated Grant Name"
    assert agreement.description == "Updated Grant Description"
    assert [m.id for m in agreement.team_members] == [1, 2, 3]


@pytest.mark.usefixtures("app_ctx")
def test_agreements_patch_by_id_400_for_type_change(auth_client, loaded_db, test_contract):
    """400 for invalid type change"""
    response = auth_client.patch(
        f"/api/v1/agreements/{test_contract.id}",
        json={
            "agreement_type": "GRANT",
            "name": "Updated Contract Name",
            "description": "Updated Contract Description",
            "number": "AGR0001",
        },
    )
    assert response.status_code == 400


@pytest.mark.usefixtures("app_ctx")
def test_agreements_patch_by_id_contract(auth_client, loaded_db, test_contract):
    """PATCH CONTRACT"""
    response = auth_client.patch(
        f"/api/v1/agreements/{test_contract.id}",
        json={
            "agreement_type": "CONTRACT",
            "name": "Updated Contract Name",
            "description": "Updated Contract Description",
            "number": "AGR0001",
            "team_members": [{"id": 1}],
            "support_contacts": [{"id": 2}, {"id": 3}],
            "notes": "Test Note",
        },
    )
    assert response.status_code == 200

    stmt = select(Agreement).where(Agreement.id == test_contract.id)
    agreement = loaded_db.scalar(stmt)

    assert agreement.name == "Updated Contract Name"
    assert agreement.description == "Updated Contract Description"
    assert agreement.notes == "Test Note"
    assert [m.id for m in agreement.team_members] == [1]
    assert [m.id for m in agreement.support_contacts] == [2, 3]


@pytest.mark.usefixtures("app_ctx")
def test_agreements_patch_by_id_contract_with_nones(auth_client, loaded_db, test_contract):
    """Patch CONTRACT with setting fields to null/empty"""
    # set fields to non-null/non-empty
    response = auth_client.patch(
        f"/api/v1/agreements/{test_contract.id}",
        json={
            "agreement_type": "CONTRACT",
            "name": "Updated Contract Name",
            "description": "Updated Contract Description",
            "number": "AGR0001",
            "team_members": [{"id": 1}],
            "support_contacts": [{"id": 2}, {"id": 3}],
            "notes": "Test Note",
        },
    )
    assert response.status_code == 200

    stmt = select(Agreement).where(Agreement.id == test_contract.id)
    agreement = loaded_db.scalar(stmt)

    assert agreement.name == "Updated Contract Name"
    assert agreement.description == "Updated Contract Description"
    assert agreement.notes == "Test Note"
    assert [m.id for m in agreement.team_members] == [1]
    assert [m.id for m in agreement.support_contacts] == [2, 3]

    # path with null/empty
    response = auth_client.patch(
        f"/api/v1/agreements/{test_contract.id}",
        json={
            "team_members": None,
            "support_contacts": [],
            "notes": None,
        },
    )
    assert response.status_code == 200

    stmt = select(Agreement).where(Agreement.id == test_contract.id)
    agreement = loaded_db.scalar(stmt)

    assert agreement.name == "Updated Contract Name"
    assert agreement.description == "Updated Contract Description"
    assert agreement.notes is None
    assert agreement.team_members == []
    assert agreement.support_contacts == []


@pytest.mark.usefixtures("app_ctx")
def test_agreements_patch_by_id_grant(auth_client, loaded_db):
    """PATCH GRANT"""
    response = auth_client.patch(
        "/api/v1/agreements/3",
        json={
            "agreement_type": "GRANT",
            "name": "Updated Grant Name",
            "description": "Updated Grant Description",
            "number": "AGR0001",
            "team_members": [{"id": 1}],
            "notes": "Test Note",
        },
    )
    assert response.status_code == 200

    stmt = select(Agreement).where(Agreement.id == 3)
    agreement = loaded_db.scalar(stmt)

    assert agreement.name == "Updated Grant Name"
    assert agreement.description == "Updated Grant Description"
    assert agreement.notes == "Test Note"
    assert [m.id for m in agreement.team_members] == [1]


@pytest.mark.usefixtures("app_ctx")
def test_agreements_patch_by_id_just_notes(auth_client, loaded_db):
    """PATCH with just notes to test out other fields being optional"""
    stmt = select(Agreement).where(Agreement.id == 1)
    agreement = loaded_db.scalar(stmt)
    old_notes = agreement.notes
    try:
        response = auth_client.patch(
            "/api/v1/agreements/1",
            json={
                "notes": "Test PATCH",
            },
        )
        assert response.status_code == 200

        stmt = select(Agreement).where(Agreement.id == 1)
        agreement = loaded_db.scalar(stmt)
        assert agreement.notes == "Test PATCH"
    finally:
        stmt = update(Agreement).where(Agreement.id == 1).values(notes=old_notes)
        agreement = loaded_db.execute(stmt)


# @pytest.mark.skip("Not yet implemented")
@pytest.mark.usefixtures("app_ctx")
def test_agreements_delete_by_id(auth_client, loaded_db, test_contract):
    response = auth_client.delete(f"/api/v1/agreements/{test_contract.id}")
    assert response.status_code == 200

    stmt = select(Agreement).where(Agreement.id == test_contract.id)
    agreement = loaded_db.scalar(stmt)

    assert agreement is None
