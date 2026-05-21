"""
SDK metadata tag key constants.

This module contains immutable constants for SDK-specific metadata tags
used in OpenAPI extensions and schema properties.
"""

# x-sdk prefix (future migration target)
X_SDK_PREFIX = "x-sdk-"
X_SDK_NAME = "x-sdk-name"
X_SDK_FOLDER = "x-sdk-folder"
X_SDK_CLASS = "x-sdk-class"
X_SDK_SKIP = "x-sdk-skip"
X_SDK_KIND = "x-sdk-kind"
X_SDK_GROUP = "x-sdk-group"
X_SDK_OPERATION_NAME = "x-sdk-operation-name"
X_SDK_DOMAIN = "x-sdk-domain"

# x-sdk-kind values
SDK_KIND_PRIMITIVE = "primitive"
SDK_KIND_MODEL = "model"
SDK_KIND_DTO = "dto"
SDK_KIND_ENUM = "enum"
SDK_KIND_SKIP = "skip"

# Legacy sdk: tags
SDK_TAG_PREFIX = "sdk:"
SDK_NAME_TAG = "sdk:name"
SDK_FOLDER_TAG = "sdk:folder"
SDK_CLASS_TAG = "sdk:class"

SDK_NAME_PREFIX = "sdk:name="
SDK_FOLDER_PREFIX = "sdk:folder="
SDK_CLASS_PREFIX = "sdk:class="
