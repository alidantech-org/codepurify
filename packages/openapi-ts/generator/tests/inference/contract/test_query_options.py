"""Tests for query options extraction from x-codegen metadata."""

from __future__ import annotations

from src.inference.contract.query_options import build_query_options, merge_query_options


def test_build_query_options_from_empty_metadata() -> None:
    """Test that empty metadata returns default query options."""
    result = build_query_options(None)
    assert result.filter is False
    assert result.operators == ()
    assert result.sort is False
    assert result.select is False
    assert result.search is False
    assert result.exact is False


def test_build_query_options_from_empty_dict() -> None:
    """Test that empty dict returns default query options."""
    result = build_query_options({})
    assert result.filter is False
    assert result.operators == ()
    assert result.sort is False


def test_build_query_options_without_query_key() -> None:
    """Test that metadata without query key returns default options."""
    result = build_query_options({"kind": "primitive"})
    assert result.filter is False
    assert result.operators == ()


def test_build_query_options_with_filter() -> None:
    """Test extracting filter option."""
    result = build_query_options({"query": {"filter": True}})
    assert result.filter is True
    assert result.operators == ()


def test_build_query_options_with_operators_list() -> None:
    """Test extracting operators as list."""
    result = build_query_options({"query": {"operators": ["eq", "in", "gt"]}})
    assert result.operators == ("eq", "in", "gt")


def test_build_query_options_with_operators_string() -> None:
    """Test extracting operators as string."""
    result = build_query_options({"query": {"operators": "eq"}})
    assert result.operators == ("eq",)


def test_build_query_options_with_sort() -> None:
    """Test extracting sort option."""
    result = build_query_options({"query": {"sort": True}})
    assert result.sort is True


def test_build_query_options_with_select() -> None:
    """Test extracting select option."""
    result = build_query_options({"query": {"select": True}})
    assert result.select is True


def test_build_query_options_with_search() -> None:
    """Test extracting search option."""
    result = build_query_options({"query": {"search": True}})
    assert result.search is True


def test_build_query_options_with_exact() -> None:
    """Test extracting exact option."""
    result = build_query_options({"query": {"exact": True}})
    assert result.exact is True


def test_build_query_options_with_all_options() -> None:
    """Test extracting all query options."""
    result = build_query_options(
        {
            "query": {
                "filter": True,
                "operators": ["eq", "in", "gt", "lt"],
                "sort": True,
                "select": True,
                "search": True,
                "exact": True,
            }
        }
    )
    assert result.filter is True
    assert result.operators == ("eq", "in", "gt", "lt")
    assert result.sort is True
    assert result.select is True
    assert result.search is True
    assert result.exact is True


def test_merge_query_options_primary_wins() -> None:
    """Test that primary query options override fallback."""
    from src.contracts.api import ApiQueryOptions

    primary = ApiQueryOptions(filter=True, operators=("eq",))
    fallback = ApiQueryOptions(filter=False, operators=("in", "gt"))

    result = merge_query_options(primary, fallback)
    assert result.filter is True
    assert result.operators == ("eq",)


def test_merge_query_options_fallback_used() -> None:
    """Test that fallback is used when primary is empty."""
    from src.contracts.api import ApiQueryOptions

    primary = ApiQueryOptions()
    fallback = ApiQueryOptions(filter=True, operators=("eq", "in"))

    result = merge_query_options(primary, fallback)
    assert result.filter is True
    assert result.operators == ("eq", "in")


def test_merge_query_options_both_empty() -> None:
    """Test that empty options remain empty."""
    from src.contracts.api import ApiQueryOptions

    primary = ApiQueryOptions()
    fallback = ApiQueryOptions()

    result = merge_query_options(primary, fallback)
    assert result.filter is False
    assert result.operators == ()


def test_merge_query_options_partial_primary() -> None:
    """Test that partial primary still wins entirely."""
    from src.contracts.api import ApiQueryOptions

    primary = ApiQueryOptions(filter=True)
    fallback = ApiQueryOptions(filter=False, sort=True, operators=("eq",))

    result = merge_query_options(primary, fallback)
    assert result.filter is True
    assert result.sort is False
    assert result.operators == ()
