"""Shared contracts between app, inference, languages, and emission.

Contracts define stable boundaries. Implementation packages may import
contracts, but contracts must not import implementation packages.
"""

from contracts.api import (
    ApiContract,
    ApiDocumentInfo,
    ApiEnumValue,
    ApiField,
    ApiOperation,
    ApiParameter,
    ApiRequestBody,
    ApiResource,
    ApiResponse,
    ApiSchema,
)
from contracts.emission import EmissionFile, EmissionPlan, EmissionResult, EmissionWriteResult
from contracts.events import EventLevel, ProgressSink, RuntimeEvent
from contracts.language import LanguageAdapter, LanguagePostAction, LanguagePostResult
from contracts.names import ContractName
from contracts.template import (
    TemplateContract,
    TemplateEmit,
    TemplateField,
    TemplateLanguage,
    TemplateOperation,
    TemplateParameter,
    TemplateProject,
    TemplateResource,
    TemplateResponse,
    TemplateSchema,
)

__all__ = [
    "ApiContract",
    "ApiDocumentInfo",
    "ApiEnumValue",
    "ApiField",
    "ApiOperation",
    "ApiParameter",
    "ApiRequestBody",
    "ApiResource",
    "ApiResponse",
    "ApiSchema",
    "ContractName",
    "EmissionFile",
    "EmissionPlan",
    "EmissionResult",
    "EmissionWriteResult",
    "EventLevel",
    "LanguageAdapter",
    "LanguagePostAction",
    "LanguagePostResult",
    "ProgressSink",
    "RuntimeEvent",
    "TemplateContract",
    "TemplateEmit",
    "TemplateField",
    "TemplateLanguage",
    "TemplateOperation",
    "TemplateParameter",
    "TemplateProject",
    "TemplateResource",
    "TemplateResponse",
    "TemplateSchema",
]
