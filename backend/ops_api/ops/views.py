from models import AdministrativeAndSupportProject, Notification, Project
from models.base import BaseModel
from models.cans import (
    CAN,
    Agreement,
    BudgetLineItem,
    CANFiscalYear,
    ContractAgreement,
    ProductServiceCode,
    ServicesComponent,
)
from models.history import OpsDBHistory
from models.portfolios import Division, Portfolio, PortfolioStatus
from models.procurement_shops import ProcurementShop
from models.projects import ResearchProject, ResearchType
from models.users import User
from models.workflows import (
    AcquisitionPlanning,
    Award,
    Evaluation,
    Package,
    PackageSnapshot,
    PreAward,
    PreSolicitation,
    Solicitation,
    WorkflowInstance,
    WorkflowStepInstance,
    WorkflowStepTemplate,
    WorkflowTemplate,
)
from ops_api.ops.resources.administrative_and_support_projects import (
    AdministrativeAndSupportProjectItemAPI,
    AdministrativeAndSupportProjectListAPI,
)
from ops_api.ops.resources.agreement_history import AgreementHistoryListAPI
from ops_api.ops.resources.agreements import (
    AgreementItemAPI,
    AgreementListAPI,
    AgreementReasonListAPI,
    AgreementTypeListAPI,
)
from ops_api.ops.resources.auth import AuthLoginAPI, AuthLogoutAPI, AuthRefreshAPI
from ops_api.ops.resources.budget_line_items import BudgetLineItemsItemAPI, BudgetLineItemsListAPI
from ops_api.ops.resources.can_fiscal_year import CANFiscalYearItemAPI, CANFiscalYearListAPI
from ops_api.ops.resources.can_funding_summary import CANFundingSummaryItemAPI
from ops_api.ops.resources.cans import CANItemAPI, CANListAPI, CANsByPortfolioAPI
from ops_api.ops.resources.contract import ContractItemAPI, ContractListAPI
from ops_api.ops.resources.divisions import DivisionsItemAPI, DivisionsListAPI
from ops_api.ops.resources.health_check import HealthCheckAPI
from ops_api.ops.resources.history import OpsDBHistoryListAPI
from ops_api.ops.resources.notifications import NotificationItemAPI, NotificationListAPI
from ops_api.ops.resources.package import PackageItemAPI, PackageListAPI, PackageSnapshotItemAPI, PackageSnapshotListAPI
from ops_api.ops.resources.portfolio_calculate_funding import PortfolioCalculateFundingAPI
from ops_api.ops.resources.portfolio_cans import PortfolioCansAPI
from ops_api.ops.resources.portfolio_funding_summary import PortfolioFundingSummaryItemAPI
from ops_api.ops.resources.portfolio_status import PortfolioStatusItemAPI, PortfolioStatusListAPI
from ops_api.ops.resources.portfolios import PortfolioItemAPI, PortfolioListAPI
from ops_api.ops.resources.procurement_shops import ProcurementShopsItemAPI, ProcurementShopsListAPI
from ops_api.ops.resources.procurement_steps import (
    AcquisitionPlanningItemAPI,
    AcquisitionPlanningListAPI,
    AwardItemAPI,
    AwardListAPI,
    EvaluationItemAPI,
    EvaluationListAPI,
    PreSolicitationItemAPI,
    PreSolicitationListAPI,
    SolicitationItemAPI,
    SolicitationListAPI,
)
from ops_api.ops.resources.product_service_code import ProductServiceCodeItemAPI, ProductServiceCodeListAPI
from ops_api.ops.resources.projects import ProjectItemAPI, ProjectListAPI
from ops_api.ops.resources.research_project_funding_summary import ResearchProjectFundingSummaryListAPI
from ops_api.ops.resources.research_projects import ResearchProjectItemAPI, ResearchProjectListAPI
from ops_api.ops.resources.research_type import ResearchTypeListAPI
from ops_api.ops.resources.services_component import ServicesComponentItemAPI, ServicesComponentListAPI
from ops_api.ops.resources.users import UsersItemAPI, UsersListAPI
from ops_api.ops.resources.workflow_approve import WorkflowApprovalListApi
from ops_api.ops.resources.workflow_instance import WorkflowInstanceItemAPI, WorkflowInstanceListAPI
from ops_api.ops.resources.workflow_step_template import WorkflowStepTemplateItemAPI, WorkflowStepTemplateListAPI
from ops_api.ops.resources.workflow_submit import WorkflowSubmisionListApi
from ops_api.ops.resources.workflow_template import WorkflowTemplateItemAPI, WorkflowTemplateListAPI

# AGREEMENT ENDPOINTS
AGREEMENT_ITEM_API_VIEW_FUNC = AgreementItemAPI.as_view("agreements-item", Agreement)
AGREEMENT_LIST_API_VIEW_FUNC = AgreementListAPI.as_view("agreements-group", Agreement)
AGREEMENT_REASON_LIST_API_VIEW_FUNC = AgreementReasonListAPI.as_view("agreement-reason-list")
# Agreement History Endpoint - specialized from OpsDBHistory
AGREEMENT_HISTORY_LIST_API_VIEW_FUNC = AgreementHistoryListAPI.as_view("agreement-history-group", OpsDBHistory)

# AGREEMENT-TYPE ENDPOINTS
AGREEMENT_TYPE_LIST_API_VIEW_FUNC = AgreementTypeListAPI.as_view("agreement-type-list")

# CONTRACT ENDPOINTS
CONTRACT_ITEM_API_VIEW_FUNC = ContractItemAPI.as_view("contract-item", ContractAgreement)
CONTRACT_LIST_API_VIEW_FUNC = ContractListAPI.as_view("contract-list", ContractListAPI)

# Auth endpoints
AUTH_LOGIN_API_VIEW_FUNC = AuthLoginAPI.as_view("auth-login", BaseModel)
AUTH_LOGOUT_API_VIEW_FUNC = AuthLogoutAPI.as_view("auth-logout", BaseModel)
AUTH_REFRESH_API_VIEW_FUNC = AuthRefreshAPI.as_view("auth-refresh", BaseModel)

# Portfolio endpoints
PORTFOLIO_CALCULATE_FUNDING_API_VIEW_FUNC = PortfolioCalculateFundingAPI.as_view(
    "portfolio-calculate-funding", Portfolio
)
PORTFOLIO_CANS_API_VIEW_FUNC = PortfolioCansAPI.as_view("portfolio-cans", CANFiscalYear)
PORTFOLIO_ITEM_API_VIEW_FUNC = PortfolioItemAPI.as_view("portfolio-item", Portfolio)
PORTFOLIO_LIST_API_VIEW_FUNC = PortfolioListAPI.as_view("portfolio-group", Portfolio)

# CAN ENDPOINTS
CAN_ITEM_API_VIEW_FUNC = CANItemAPI.as_view("can-item", CAN)
CAN_LIST_API_VIEW_FUNC = CANListAPI.as_view("can-group", CAN)
CANS_BY_PORTFOLIO_API_VIEW_FUNC = CANsByPortfolioAPI.as_view("can-portfolio", BaseModel)

# CAN FISCAL YEAR ENDPOINTS
CAN_FISCAL_YEAR_ITEM_API_VIEW_FUNC = CANFiscalYearItemAPI.as_view("can-fiscal-year-item", CANFiscalYear)
CAN_FISCAL_YEAR_LIST_API_VIEW_FUNC = CANFiscalYearListAPI.as_view("can-fiscal-year-group", CANFiscalYear)

# BUDGET LINE ITEM ENDPOINTS
BUDGET_LINE_ITEMS_ITEM_API_VIEW_FUNC = BudgetLineItemsItemAPI.as_view("budget-line-items-item", BudgetLineItem)
BUDGET_LINE_ITEMS_LIST_API_VIEW_FUNC = BudgetLineItemsListAPI.as_view("budget-line-items-group", BudgetLineItem)

# PACKAGE ENDPOINTS
PACKAGE_ITEM_API_VIEW_FUNC = PackageItemAPI.as_view("package-item", Package)
PACKAGE_LIST_API_VIEW_FUNC = PackageListAPI.as_view("package-group", Package)

PACKAGE_SNAPSHOT_ITEM_API_VIEW_FUNC = PackageSnapshotItemAPI.as_view("package-snapshot-item", PackageSnapshot)
PACKAGE_SNAPSHOT_LIST_API_VIEW_FUNC = PackageSnapshotListAPI.as_view("package-snapshot-group", PackageSnapshot)

# PRODUCT SERVICE CODES ENDPOINTS
PRODUCT_SERVICE_CODE_ITEM_API_VIEW_FUNC = ProductServiceCodeItemAPI.as_view(
    "product-service-code-item", ProductServiceCode
)
PRODUCT_SERVICE_CODE_LIST_API_VIEW_FUNC = ProductServiceCodeListAPI.as_view(
    "product-service-code-group", ProductServiceCode
)

# PROCUREMENT SHOP ENDPOINTS
PROCUREMENT_SHOPS_ITEM_API_VIEW_FUNC = ProcurementShopsItemAPI.as_view("procurement-shops-item", ProcurementShop)
PROCUREMENT_SHOPS_LIST_API_VIEW_FUNC = ProcurementShopsListAPI.as_view("procurement-shops-group", ProcurementShop)

# PORTFOLIO STATUS ENDPOINTS
PORTFOLIO_STATUS_ITEM_API_VIEW_FUNC = PortfolioStatusItemAPI.as_view(
    "portfolio-status-item",
    PortfolioStatus,
)
PORTFOLIO_STATUS_LIST_API_VIEW_FUNC = PortfolioStatusListAPI.as_view(
    "portfolio-status-group",
    PortfolioStatus,
)

# DIVISION ENDPOINTS
DIVISIONS_ITEM_API_VIEW_FUNC = DivisionsItemAPI.as_view("divisions-item", Division)
DIVISIONS_LIST_API_VIEW_FUNC = DivisionsListAPI.as_view("divisions-group", Division)

# USER ENDPOINTS
USERS_ITEM_API_VIEW_FUNC = UsersItemAPI.as_view("users-item", User)
USERS_LIST_API_VIEW_FUNC = UsersListAPI.as_view("users-group", User)

# FUNDING SUMMARY ENDPOINTS
CAN_FUNDING_SUMMARY_ITEM_API_VIEW_FUNC = CANFundingSummaryItemAPI.as_view("can-funding-summary-item", CAN)
PORTFOLIO_FUNDING_SUMMARY_ITEM_API_VIEW_FUNC = PortfolioFundingSummaryItemAPI.as_view(
    "portfolio-funding-summary-item", Portfolio
)
RESEARCH_PROJECT_FUNDING_SUMMARY_LIST_API_VIEW_FUNC = ResearchProjectFundingSummaryListAPI.as_view(
    "research-project-funding-summary-group", ResearchProject
)

# PROJECT ENDPOINTS
PROJECT_ITEM_API_VIEW_FUNC = ProjectItemAPI.as_view("projects-item", Project)
PROJECT_LIST_API_VIEW_FUNC = ProjectListAPI.as_view("projects-group", Project)

# RESEARCH PROJECT ENDPOINTS
RESEARCH_PROJECT_ITEM_API_VIEW_FUNC = ResearchProjectItemAPI.as_view("research-projects-item", ResearchProject)
RESEARCH_PROJECT_LIST_API_VIEW_FUNC = ResearchProjectListAPI.as_view("research-projects-group", ResearchProject)

# ADMINISTRATIVE AND SUPPORT PROJECT ENDPOINTS
ADMINISTRATIVE_AND_SUPPORT_PROJECT_ITEM_API_VIEW_FUNC = AdministrativeAndSupportProjectItemAPI.as_view(
    "administrative-and-support-projects-item", AdministrativeAndSupportProject
)
ADMINISTRATIVE_AND_SUPPORT_PROJECT_LIST_API_VIEW_FUNC = AdministrativeAndSupportProjectListAPI.as_view(
    "administrative-and-support-projects-group", AdministrativeAndSupportProject
)

# RESEARCH TYPE ENDPOINTS
RESEARCH_TYPE_LIST_API_VIEW_FUNC = ResearchTypeListAPI.as_view("research-type-group", ResearchType)

# HEALTH CHECK
HEALTH_CHECK_VIEW_FUNC = HealthCheckAPI.as_view("health-check")

# OPS DB HISTORY ENDPOINTS
OPS_DB_HISTORY_LIST_API_VIEW_FUNC = OpsDBHistoryListAPI.as_view("ops-db-history-group", OpsDBHistory)

# NOTIFICATIONS ENDPOINTS
NOTIFICATIONS_ITEM_API_VIEW_FUNC = NotificationItemAPI.as_view("notifications-item", Notification)
NOTIFICATIONS_LIST_API_VIEW_FUNC = NotificationListAPI.as_view("notifications-group", Notification)

# WORKFLOW INSTANCE ENDPOINTS
WORKFLOW_INSTANCE_ITEM_API_VIEW_FUNC = WorkflowInstanceItemAPI.as_view("workflow-instance-item", WorkflowInstance)
WORKFLOW_INSTANCE_LIST_API_VIEW_FUNC = WorkflowInstanceListAPI.as_view("workflow-instance-group", WorkflowInstance)

# WORKFLOW STEP INSTANCE ENDPOINTS
WORKFLOW_STEP_INSTANCE_ITEM_API_VIEW_FUNC = WorkflowInstanceItemAPI.as_view(
    "workflow-step-instance-item", WorkflowStepInstance
)
WORKFLOW_STEP_INSTANCE_LIST_API_VIEW_FUNC = WorkflowInstanceListAPI.as_view(
    "workflow-step-instance-group", WorkflowStepInstance
)

WORKFLOW_TEMPLATE_LIST_API_VIEW_FUNC = WorkflowTemplateListAPI.as_view("workflow-template-group", WorkflowTemplate)
WORKFLOW_TEMPLATE_ITEM_API_VIEW_FUNC = WorkflowTemplateItemAPI.as_view("workflow-template-item", WorkflowTemplate)

WORKFLOW_STEP_TEMPLATE_ITEM_API_VIEW_FUNC = WorkflowStepTemplateItemAPI.as_view(
    "workflow-step-template-item", WorkflowStepTemplate
)
WORKFLOW_STEP_TEMPLATE_LIST_API_VIEW_FUNC = WorkflowStepTemplateListAPI.as_view(
    "workflow-step-template-group", WorkflowStepTemplate
)

# Workflow Submission ENDPOINTS
WORKFLOW_SUBMISSION_LIST_API_VIEW_FUNC = WorkflowSubmisionListApi.as_view("workflow-submission-list", BaseModel)

# Workflow Approval ENDPOINTS
WORKFLOW_APPROVAL_LIST_API_VIEW_FUNC = WorkflowApprovalListApi.as_view("workflow-approval-list", BaseModel)

# ServicesComponent ENDPOINTS
SERVICES_COMPONENT_ITEM_API_VIEW_FUNC = ServicesComponentItemAPI.as_view("services-component-item", ServicesComponent)
SERVICES_COMPONENT_LIST_API_VIEW_FUNC = ServicesComponentListAPI.as_view("services-component-group", ServicesComponent)


# Procurement: AcquisitionPlanning ENDPOINTS
PROCUREMENT_ACQUISITION_PLANNING_LIST_API_VIEW_FUNC = AcquisitionPlanningListAPI.as_view(
    "procurement-acquisition-planning-group", AcquisitionPlanning
)
PROCUREMENT_ACQUISITION_PLANNING_ITEM_API_VIEW_FUNC = AcquisitionPlanningItemAPI.as_view(
    "procurement-acquisition-planning-item", AcquisitionPlanning
)

# Procurement: PreSolicitation ENDPOINTS
PROCUREMENT_PRE_SOLICITATION_LIST_API_VIEW_FUNC = PreSolicitationListAPI.as_view(
    "procurement-pre-solicitation-group", PreSolicitation
)
PROCUREMENT_PRE_SOLICITATION_ITEM_API_VIEW_FUNC = PreSolicitationItemAPI.as_view(
    "procurement-pre-solicitation-item", PreSolicitation
)

# Procurement: Solicitation ENDPOINTS
PROCUREMENT_SOLICITATION_LIST_API_VIEW_FUNC = SolicitationListAPI.as_view(
    "procurement-solicitation-group", Solicitation
)
PROCUREMENT_SOLICITATION_ITEM_API_VIEW_FUNC = SolicitationItemAPI.as_view("procurement-solicitation-item", Solicitation)

# Procurement: Evaluation ENDPOINTS
PROCUREMENT_EVALUATION_LIST_API_VIEW_FUNC = EvaluationListAPI.as_view("procurement-evaluation-group", Evaluation)
PROCUREMENT_EVALUATION_ITEM_API_VIEW_FUNC = EvaluationItemAPI.as_view("procurement-evaluation-item", Evaluation)

# Procurement: PreAward ENDPOINTS
PROCUREMENT_PRE_AWARD_LIST_API_VIEW_FUNC = EvaluationListAPI.as_view("procurement-pre-award-group", PreAward)
PROCUREMENT_PRE_AWARD_ITEM_API_VIEW_FUNC = EvaluationItemAPI.as_view("procurement-pre-award-item", PreAward)

# Procurement: Award ENDPOINTS
PROCUREMENT_AWARD_LIST_API_VIEW_FUNC = AwardListAPI.as_view("procurement-award-group", Award)
PROCUREMENT_AWARD_ITEM_API_VIEW_FUNC = AwardItemAPI.as_view("procurement-award-item", Award)
