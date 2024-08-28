import pytest

from scripts.tools import FepIndex


@pytest.mark.skip("Only is correct for main branch and not pull requests")
def test_index():
    with open("index.md") as f:
        lines = f.readlines()

    expected = FepIndex().content

    assert lines == expected
