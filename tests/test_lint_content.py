"""Tests for tools/lint_content.py (plan task T1.4)."""
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import lint_content as lint  # noqa: E402


def labels(text):
    return [label for _, label, _ in lint.scan_text(text)]


def test_catches_each_banned_term():
    assert labels("a — b") == ["em dash"]
    assert labels("This is Stage Four.") == ["Stage Four"]
    assert labels("Learn the twelve steps") == ["twelve steps"]
    assert labels("the 12 steps") == ["twelve steps"]
    assert labels("Crowned, Chaos, Captivity") == ["Chaos"]
    assert labels("The Four Pictures course") == ["Four Pictures"]
    assert labels("all four pictures") == []  # a note, not a failure


def test_allows_clean_text():
    assert labels("Stage C, The Cross. Crowned, Cut, Captivity. Genesis 1:1-2:3") == []


def test_repo_content_is_clean():
    assert lint.main([]) == 0
