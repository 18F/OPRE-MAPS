export const budgetLine = {
    active_workflow_current_step_id: null,
    agreement_id: 1,
    amount: 1_000_000,
    can: {
        appropriation_date: "2023-10-01T00:00:00.000000Z",
        appropriation_term: 1,
        authorizer_id: 26,
        description: "Head Start Research",
        expiration_date: "2024-09-01T00:00:00.000000Z",
        id: 5,
        managing_portfolio_id: 2,
        nickname: "HS",
        number: "G994426",
        purpose: "",
        display_name: "G994426"
    },
    can_id: 5,
    change_requests_in_review: null,
    comments: "comment one",
    created_by: null,
    created_on: "2024-05-27T13:56:50.363964Z",
    date_needed: "2043-06-13",
    fiscal_year: 2043,
    has_active_workflow: false,
    id: 1,
    in_review: false,
    line_description: "LI 1",
    portfolio_id: 2,
    proc_shop_fee_percentage: 0,
    services_component_id: 1,
    status: "DRAFT",
    team_members: [
        '{email: "chris.fortunato@example.com", full_name: "…}',
        '{email: "Amelia.Popham@example.com", full_name: "Am…}',
        '{email: "admin.demo@email.com", full_name: "Admin D…}',
        '{email: "dave.director@email.com", full_name: "Dave…}'
    ],
    updated_on: "2024-05-27T13:56:50.363964Z"
};

export const agreement = {
    agreement_reason: "RECOMPETE",
    agreement_type: "CONTRACT",
    budget_line_items: [
        {
            active_workflow_current_step_id: null,
            agreement_id: 1,
            amount: 1_000_000,
            can: {
                appropriation_date: "2023-10-01T00:00:00.000000Z",
                appropriation_term: 1,
                authorizer_id: 26,
                description: "Head Start Research",
                expiration_date: "2024-09-01T00:00:00.000000Z",
                id: 5,
                managing_portfolio_id: 2,
                nickname: "HS",
                number: "G994426",
                purpose: "",
                display_name: "G994426"
            },
            can_id: 5,
            change_requests_in_review: null,
            comments: "",
            created_by: null,
            created_on: "2024-05-27T19:20:46.105099Z",
            date_needed: "2043-06-13",
            fiscal_year: 2043,
            has_active_workflow: false,
            id: 1,
            in_review: false,
            line_description: "LI 1",
            portfolio_id: 2,
            proc_shop_fee_percentage: 0,
            services_component_id: 1,
            status: "DRAFT",
            team_members: [
                {
                    email: "chris.fortunato@example.com",
                    full_name: "Chris Fortunato",
                    id: 1
                },
                {
                    email: "Amelia.Popham@example.com",
                    full_name: "Amelia Popham",
                    id: 4
                },
                {
                    email: "admin.demo@email.com",
                    full_name: "Admin Demo",
                    id: 21
                },
                {
                    email: "dave.director@email.com",
                    full_name: "Dave Director",
                    id: 23
                }
            ],
            updated_on: "2024-05-27T19:20:46.105099Z"
        },
        {
            active_workflow_current_step_id: null,
            agreement_id: 1,
            amount: 1_000_000,
            can: {
                appropriation_date: "2023-10-01T00:00:00.000000Z",
                appropriation_term: 1,
                authorizer_id: 26,
                description: "Head Start Research",
                expiration_date: "2024-09-01T00:00:00.000000Z",
                id: 5,
                managing_portfolio_id: 2,
                nickname: "HS",
                number: "G994426",
                purpose: "",
                display_name: "G994426"
            },
            can_id: 5,
            change_requests_in_review: null,
            comments: "",
            created_by: null,
            created_on: "2024-05-27T19:20:46.118542Z",
            date_needed: "2043-06-13",
            fiscal_year: 2043,
            has_active_workflow: false,
            id: 2,
            in_review: false,
            line_description: "LI 2",
            portfolio_id: 2,
            proc_shop_fee_percentage: 0,
            services_component_id: null,
            status: "DRAFT",
            team_members: [
                {
                    email: "chris.fortunato@example.com",
                    full_name: "Chris Fortunato",
                    id: 1
                },
                {
                    email: "Amelia.Popham@example.com",
                    full_name: "Amelia Popham",
                    id: 4
                },
                {
                    email: "admin.demo@email.com",
                    full_name: "Admin Demo",
                    id: 21
                },
                {
                    email: "dave.director@email.com",
                    full_name: "Dave Director",
                    id: 23
                }
            ],
            updated_on: "2024-05-27T19:20:46.118542Z"
        }
    ],
    contract_number: "XXXX000000001",
    contract_type: "LABOR_HOUR",
    created_by: 4,
    created_on: "2024-05-27T19:20:43.774009Z",
    delivered_status: false,
    description: "Test description",
    display_name: "Contract #1: African American Child and Family Research Center",
    id: 1,
    incumbent: "Vendor 1",
    incumbent_id: 1,
    name: "Contract #1: African American Child and Family Research Center",
    notes: "",
    procurement_shop: {
        abbr: "PSC",
        fee: 0,
        id: 1,
        name: "Product Service Center"
    },
    procurement_shop_id: 1,
    procurement_tracker_workflow_id: null,
    product_service_code: {
        description: "",
        id: 1,
        naics: 541690,
        name: "Other Scientific and Technical Consulting Services",
        support_code: "R410 - Research"
    },
    product_service_code_id: 1,
    project: {
        description:
            "This contract will conduct interoperability activities to facilitate the exchange of information within, between, and from states and tribal organizations by facilitating lower-burden, interoperable data reporting and exchange to other state agencies and to ACF. The contract will focus on developing content that facilitates streamlined, interoperable reporting to ACF. The contract will also conduct research and evaluation activities with states and tribal organizations to assess the effectiveness of providing these interoperability artifacts for these organizations to use. The ability to share data and develop interoperable data systems is important for effective operation and oversight of these programs. This contract is designed to address these requirements and deliver needed and practical tools to accelerate implementation of data sharing and interoperable initiatives.",
        id: 1,
        project_type: "RESEARCH",
        short_title: "HSS",
        title: "Human Services Interoperability Support",
        url: "https://www.acf.hhs.gov/opre/project/acf-human-services-interoperability-support"
    },
    project_id: 1,
    project_officer_id: 1,
    service_requirement_type: "NON_SEVERABLE",
    support_contacts: [],
    team_members: [
        {
            email: "chris.fortunato@example.com",
            full_name: "Chris Fortunato",
            id: 1
        },
        {
            email: "Amelia.Popham@example.com",
            full_name: "Amelia Popham",
            id: 4
        },
        {
            email: "admin.demo@email.com",
            full_name: "Admin Demo",
            id: 21
        },
        {
            email: "dave.director@email.com",
            full_name: "Dave Director",
            id: 23
        }
    ],
    updated_by: null,
    updated_on: "2024-05-27T19:20:43.774009Z",
    vendor: "Vendor 1",
    vendor_id: 1
};

export const servicesComponent = {
    clin_id: 1,
    contract_agreement_id: 1,
    created_by: null,
    created_on: "2024-05-29T20:06:50.973668Z",
    description: "Perform Research",
    display_name: "SC1",
    display_title: "Services Component 1",
    id: 1,
    number: 1,
    optional: false,
    period_end: "2044-06-13",
    period_start: "2043-06-13,",
    updated_on: "2024-05-29T20:06:50.973668Z"
};

export const changeRequests = [
    [
        {
            agreement: 9,
            agreement_id: 9,
            budget_line_item: 22,
            budget_line_item_id: 22,
            created_by: 21,
            created_by_user: {
                full_name: "Admin Demo",
                id: 21
            },
            created_on: "2024-06-12T21:25:25.711734Z",
            display_name: "BudgetLineItemChangeRequest#1",
            id: 1,
            managing_division: 4,
            managing_division_id: 4,
            requested_change_data: {
                date_needed: "2045-06-13"
            },
            requested_change_diff: {
                date_needed: {
                    new: "2045-06-13",
                    old: "2044-06-13"
                }
            },
            requested_change_info: {
                target_display_name: "BL 22"
            },
            reviewed_by_id: null,
            reviewed_on: null,
            status: "IN_REVIEW",
            type: "budget_line_item_change_request",
            updated_by: 21,
            updated_by_user: {
                full_name: "Admin Demo",
                id: 21
            },
            updated_on: "2024-06-12T21:25:25.711734Z",
            versions: [
                {
                    id: 1,
                    transaction_id: 396
                }
            ]
        },
        {
            agreement: 9,
            agreement_id: 9,
            budget_line_item: 22,
            budget_line_item_id: 22,
            created_by: 21,
            created_by_user: {
                full_name: "Admin Demo",
                id: 21
            },
            created_on: "2024-06-12T21:25:25.744930Z",
            display_name: "BudgetLineItemChangeRequest#2",
            id: 2,
            managing_division: 4,
            managing_division_id: 4,
            requested_change_data: {
                can_id: 10
            },
            requested_change_diff: {
                can_id: {
                    new: 10,
                    old: 13
                }
            },
            requested_change_info: {
                target_display_name: "BL 22"
            },
            reviewed_by_id: null,
            reviewed_on: null,
            status: "IN_REVIEW",
            type: "budget_line_item_change_request",
            updated_by: 21,
            updated_by_user: {
                full_name: "Admin Demo",
                id: 21
            },
            updated_on: "2024-06-12T21:25:25.744930Z",
            versions: [
                {
                    id: 2,
                    transaction_id: 397
                }
            ]
        },
        {
            agreement: 9,
            agreement_id: 9,
            budget_line_item: 22,
            budget_line_item_id: 22,
            created_by: 21,
            created_by_user: {
                full_name: "Admin Demo",
                id: 21
            },
            created_on: "2024-06-12T21:25:25.765470Z",
            display_name: "BudgetLineItemChangeRequest#3",
            id: 3,
            managing_division: 4,
            managing_division_id: 4,
            requested_change_data: {
                amount: 33333
            },
            requested_change_diff: {
                amount: {
                    new: 33333,
                    old: 300000
                }
            },
            requested_change_info: {
                target_display_name: "BL 22"
            },
            reviewed_by_id: null,
            reviewed_on: null,
            status: "IN_REVIEW",
            type: "budget_line_item_change_request",
            updated_by: 21,
            updated_by_user: {
                full_name: "Admin Demo",
                id: 21
            },
            updated_on: "2024-06-12T21:25:25.765470Z",
            versions: [
                {
                    id: 3,
                    transaction_id: 398
                }
            ]
        }
    ]
];
