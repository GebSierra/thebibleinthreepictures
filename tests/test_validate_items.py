"""Tests for tools/validate_items.py (plan task T1.1)."""
import copy
import pathlib
import sys

import yaml

ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import validate_items as v  # noqa: E402

ITEMS = yaml.safe_load((ROOT / "content/items.yaml").read_text())["items"]
SESSIONS = yaml.safe_load((ROOT / "content/sessions.yaml").read_text())["sessions"]
PTS = v.load_testouts((ROOT / "content/test-outs.md").read_text())


def run(items=None, sessions=None):
    return v.check(items if items is not None else copy.deepcopy(ITEMS),
                   sessions if sessions is not None else copy.deepcopy(SESSIONS), PTS)


def find(items, iid):
    return next(i for i in items if i["id"] == iid)


def approve_all(item):
    for f in v.SLOT_FIELDS:
        if f in item:
            item[f]["status"] = "approved"


def test_real_content_passes():
    assert run() == []


def test_testout_points_parsed():
    assert PTS["T1.1"] == 4 and PTS["T1.6"] == 2
    assert sum(p for k, p in PTS.items() if k.startswith("T1.")) == 14


def test_fails_when_item_has_no_test_out():
    items = copy.deepcopy(ITEMS)
    del find(items, "I1-promise-words")["test_out"]
    assert any("I1-promise-words: no test_out" in e for e in run(items))


def test_fails_when_level1_testout_item_has_no_item():
    items = [i for i in copy.deepcopy(ITEMS) if i["test_out"] != "T1.5"]
    assert any("T1.5 has no item" in e for e in run(items))


def test_fails_when_choice_is_tagged_for_review():
    items = copy.deepcopy(ITEMS)
    find(items, "I1-first-picture")["use"] = ["lesson", "review"]
    assert any("choice items may only be used in lessons" in e for e in run(items))


def test_fails_when_choice_is_tagged_for_test_out():
    items = copy.deepcopy(ITEMS)
    it = find(items, "I1-second-picture")
    it["use"] = ["lesson", "test_out"]
    it["points"] = 1
    assert any("choice items may only be used in lessons" in e for e in run(items))


def test_fails_when_approved_item_leans_on_empty_mine_slot():
    items = copy.deepcopy(ITEMS)
    approve_all(find(items, "I1-key-event-world"))  # answer comes from L1-01.key_event, still empty
    errs = run(items)
    assert any("I1-key-event-world: approved, but it leans on L1-01.key_event" in e for e in errs)


def test_approved_item_passes_once_its_mine_slot_is_approved():
    items = copy.deepcopy(ITEMS)
    sessions = copy.deepcopy(SESSIONS)
    approve_all(find(items, "I1-key-event-world"))
    ke = next(s for s in sessions if s["id"] == "L1-01")["key_event"]
    ke.update(status="approved", value="TEST ONLY")
    assert run(items, sessions) == []


def test_fails_when_cross_is_struck():
    items = copy.deepcopy(ITEMS)
    find(items, "I1-strike")["answer"]["value"] = ["The World", "Egypt", "The Land", "The Cross"]
    assert any("the cross is never struck" in e for e in run(items))


def test_fails_when_testout_points_do_not_add_up():
    items = copy.deepcopy(ITEMS)
    find(items, "I1-tell-story")["points"] = 1
    errs = run(items)
    assert any("T1.6: test-out items give 1 points, expected 2" in e for e in errs)


def test_fails_when_lesson_has_too_few_items():
    items = [i for i in copy.deepcopy(ITEMS) if i["id"] != "I1-before-land"]
    assert any("L1-03: 2 lesson items" in e for e in run(items))


def test_fails_on_unknown_session_and_type():
    items = copy.deepcopy(ITEMS)
    find(items, "I1-before-land")["sessions"] = ["L1-09"]
    find(items, "I1-before-land")["type"] = "matching"
    errs = run(items)
    assert any("unknown session L1-09" in e for e in errs)
    assert any("unknown type matching" in e for e in errs)
