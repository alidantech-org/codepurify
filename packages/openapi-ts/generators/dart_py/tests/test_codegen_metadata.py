"""
Tests for x-codegen metadata reader.
"""

from openapi.codegen_metadata import read_codegen_metadata, CODEGEN_KEY


def test_reads_x_codegen():
    """Test reading x-codegen metadata."""
    schema = {
        CODEGEN_KEY: {
            "kind": "model",
            "resource": "users",
            "group": "users",
            "entity": "User",
            "component": "UserModel",
            "model": "public",
            "skip": False,
        }
    }

    meta = read_codegen_metadata(schema)

    assert meta.kind == "model"
    assert meta.resource == "users"
    assert meta.group == "users"
    assert meta.entity == "User"
    assert meta.component == "UserModel"
    assert meta.model == "public"
    assert meta.skip is False
    assert meta.source == CODEGEN_KEY
    assert meta.is_present is True


def test_property_skip_becomes_skipped():
    """Test that kind: property with skip: true becomes skipped."""
    schema = {
        CODEGEN_KEY: {
            "kind": "property",
            "skip": True,
        }
    }

    meta = read_codegen_metadata(schema)

    assert meta.kind == "property"
    assert meta.skip is True
    assert meta.is_skipped is True


def test_kind_property_without_skip_also_skipped():
    """Test that kind: property is skipped even without explicit skip flag."""
    schema = {
        CODEGEN_KEY: {
            "kind": "property",
        }
    }

    meta = read_codegen_metadata(schema)

    assert meta.kind == "property"
    assert meta.skip is False
    assert meta.is_skipped is True  # property kind is always skipped


def test_kind_enum():
    """Test enum kind classification."""
    schema = {
        CODEGEN_KEY: {
            "kind": "enum",
            "entity": "User",
            "property": "roles",
        }
    }

    meta = read_codegen_metadata(schema)

    assert meta.kind == "enum"
    assert meta.entity == "User"
    assert meta.property_name == "roles"


def test_kind_model():
    """Test model kind classification."""
    schema = {
        CODEGEN_KEY: {
            "kind": "model",
            "entity": "User",
            "model": "public",
        }
    }

    meta = read_codegen_metadata(schema)

    assert meta.kind == "model"
    assert meta.entity == "User"
    assert meta.model == "public"


def test_kind_dto():
    """Test DTO kind classification."""
    schema = {
        CODEGEN_KEY: {
            "kind": "dto",
            "resource": "users",
            "component": "CreateUserBody",
        }
    }

    meta = read_codegen_metadata(schema)

    assert meta.kind == "dto"
    assert meta.resource == "users"
    assert meta.component == "CreateUserBody"


def test_kind_query():
    """Test query kind classification."""
    schema = {
        CODEGEN_KEY: {
            "kind": "query",
            "resource": "users",
            "component": "UserListQuery",
        }
    }

    meta = read_codegen_metadata(schema)

    assert meta.kind == "query"


def test_operation_metadata_reads_query_schema():
    """Test operation metadata reads querySchema."""
    operation = {CODEGEN_KEY: {"kind": "operation", "resource": "users", "querySchema": {"$ref": "#/components/schemas/UserListQuery"}}}

    meta = read_codegen_metadata(operation)

    assert meta.kind == "operation"
    assert meta.resource == "users"
    assert meta.raw is not None
    assert "querySchema" in meta.raw


def test_ref_id_supports_both_formats():
    """Test that both refId and ref_id are supported."""
    schema1 = {
        CODEGEN_KEY: {
            "refId": "resource:users:model:User:public-model",
        }
    }

    meta1 = read_codegen_metadata(schema1)
    assert meta1.ref_id == "resource:users:model:User:public-model"

    schema2 = {
        CODEGEN_KEY: {
            "ref_id": "resource:users:model:User:public-model",
        }
    }

    meta2 = read_codegen_metadata(schema2)
    assert meta2.ref_id == "resource:users:model:User:public-model"


def test_inherits_list():
    """Test inherits field parsing."""
    schema = {
        CODEGEN_KEY: {
            "inherits": [
                {"$ref": "#/components/schemas/BaseEntityPublicModel"},
                {"$ref": "#/components/schemas/TimestampedModel"},
            ]
        }
    }

    meta = read_codegen_metadata(schema)

    assert len(meta.inherits) == 2
    assert meta.inherits[0]["$ref"] == "#/components/schemas/BaseEntityPublicModel"


def test_empty_node_returns_empty_metadata():
    """Test that empty or None node returns empty metadata."""
    assert read_codegen_metadata(None).is_present is False
    assert read_codegen_metadata({}).is_present is False
    assert read_codegen_metadata({"type": "object"}).is_present is False


def test_boolean_status_conversion():
    """Test that status is converted to string."""
    schema = {
        CODEGEN_KEY: {
            "status": "active",
        }
    }

    meta = read_codegen_metadata(schema)
    assert meta.status == "active"

    schema2 = {
        CODEGEN_KEY: {
            "status": None,
        }
    }

    meta2 = read_codegen_metadata(schema2)
    assert meta2.status is None


def test_shared_and_abstract_flags():
    """Test shared and abstract boolean flags."""
    schema = {
        CODEGEN_KEY: {
            "shared": True,
            "abstract": True,
        }
    }

    meta = read_codegen_metadata(schema)

    assert meta.shared is True
    assert meta.abstract is True
