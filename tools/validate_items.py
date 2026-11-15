"""Check content/items.yaml against content/sessions.yaml and content/test-outs.md.

Run: python3 tools/validate_items.py content/items.yaml content/sessions.yaml content/test-outs.md
Exit 1 on any problem.

Kept apart from validate.py on purpose: validate.py is shared with the print
book (its home is the claude.ai project), so app-only rules live here.
"""
import re
import sys

import yaml

TYPES = {"order", "type_word", "strike", "self_check", "speak_timed", "choice"}
USES = {"lesson", "review", "test_out"}
OWNERS = {"MINE", "AI DRAFT", "MECHANICAL"}
STATUSES = {"empty", "draft", "approved"}
PICTURES = ["The World", "Egypt", "The Land", "The Cross"]
STRUCK = ["The World", "Egypt", "The Land"]  # the cross is never struck
SLOT_FIELDS = ("prompt", "answer", "accept")


def load_testouts(md_text):
    """Return {item_id: points} from the test-out tables, e.g. {'T1.1': 4}."""
    pts = {}
    for line in md_text.splitlines():
        m = re.match(r"\|\s*(T\d\.\d+)\s*\|[^|]*\|\s*(\d+)\s*\|", line)
        if m:
            pts[m.group(1)] = int(m.group(2))
    return pts


def resolve(ref, sessions):
    """'L1-01.key_event' -> (session, slot dict) or (None, None)."""
    if not isinstance(ref, str) or "." not in ref:
        return None, None
    sid, slot = ref.split(".", 1)
    s = sessions.get(sid)
    if s is None or slot not in s or not isinstance(s[slot], dict):
        return s, None
    return s, s[slot]


def is_approved(item):
    """An item is approved when every slot it carries is approved."""
    for f in SLOT_FIELDS:
        sl = item.get(f)
        if sl is None:
            continue
        if sl.get("status") != "approved":
            return False
    return True


def check(items, sessions_list, testout_pts):
    errs = []
    sessions = {s["id"]: s for s in sessions_list}
    ids = [i.get("id") for i in items]
    for d in sorted({x for x in ids if ids.count(x) > 1}):
        errs.append(f"duplicate item id {d}")

    covered = {}
    for it in items:
        iid = it.get("id", "?")
        # required fields
        if not it.get("test_out"):
            errs.append(f"{iid}: no test_out")
        elif it["test_out"] not in testout_pts:
            errs.append(f"{iid}: unknown test_out {it['test_out']}")
        t = it.get("type")
        if t not in TYPES:
            errs.append(f"{iid}: unknown type {t}")
        uses = it.get("use") or []
        if not uses or any(u not in USES for u in uses):
            errs.append(f"{iid}: use must be a list from {sorted(USES)}")
        lvl = it.get("level")
        for sid in it.get("sessions") or []:
            s = sessions.get(sid)
            if s is None:
                errs.append(f"{iid}: unknown session {sid}")
            elif s["level"] != lvl:
                errs.append(f"{iid}: session {sid} is not Level {lvl}")
        if not it.get("sessions"):
            errs.append(f"{iid}: no sessions")

        # recognition is never allowed outside a lesson
        if t == "choice" and ({"review", "test_out"} & set(uses)):
            errs.append(f"{iid}: choice items may only be used in lessons")

        # slots: owner and status present and valid
        for f in SLOT_FIELDS:
            sl = it.get(f)
            if sl is None:
                continue
            if sl.get("owner") not in OWNERS:
                errs.append(f"{iid}.{f}: bad owner {sl.get('owner')}")
            if sl.get("status") not in STATUSES:
                errs.append(f"{iid}.{f}: bad status {sl.get('status')}")
            if "from" in sl:
                s, slot = resolve(sl["from"], sessions)
                if slot is None:
                    errs.append(f"{iid}.{f}: cannot find {sl['from']}")
            elif sl.get("status") != "empty" and sl.get("value") in (None, "", []):
                errs.append(f"{iid}.{f}: status {sl.get('status')} but no value")
        if it.get("prompt") is None:
            errs.append(f"{iid}: no prompt")

        # an approved item must not lean on an empty or unapproved MINE slot
        if is_approved(it):
            leans = list(it.get("depends_on") or [])
            for f in SLOT_FIELDS:
                sl = it.get(f) or {}
                if "from" in sl:
                    leans.append(sl["from"])
                if sl.get("owner") == "MINE" and sl.get("value") in (None, "", []) and "from" not in sl:
                    errs.append(f"{iid}: approved, but its {f} is an empty MINE slot")
            for ref in leans:
                s, slot = resolve(ref, sessions)
                if slot is None:
                    errs.append(f"{iid}: cannot find {ref}")
                elif slot.get("status") != "approved" or slot.get("value") in (None, "", []):
                    errs.append(f"{iid}: approved, but it leans on {ref}, which is {slot.get('status')}")

        # type rules
        ans = (it.get("answer") or {}).get("value")
        if t == "order" and ans is not None:
            if sorted(ans) != sorted(set(ans)) or any(p not in PICTURES for p in ans):
                errs.append(f"{iid}: order answer must be distinct pictures")
        if t == "strike" and ans is not None:
            if "The Cross" in ans:
                errs.append(f"{iid}: the cross is never struck")
            if sorted(ans) != sorted(STRUCK):
                errs.append(f"{iid}: strike answer must be the three pictures")
        if t == "type_word":
            acc = (it.get("accept") or {}).get("value")
            if not acc and (it.get("accept") or {}).get("status") != "empty":
                errs.append(f"{iid}: type_word needs an accept list")
        if t == "choice":
            opts = it.get("options") or []
            if len(opts) < 2:
                errs.append(f"{iid}: choice needs at least two options")
            elif ans is not None and ans not in opts:
                errs.append(f"{iid}: choice answer is not one of the options")
        if t == "speak_timed":
            if not isinstance(it.get("seconds"), int) or it["seconds"] <= 0:
                errs.append(f"{iid}: speak_timed needs seconds")
            if not it.get("checks"):
                errs.append(f"{iid}: speak_timed needs checks")

        # test-out points
        if "test_out" in uses:
            p = it.get("points")
            if not isinstance(p, int) or p <= 0:
                errs.append(f"{iid}: test-out items need points")
            else:
                if t == "speak_timed" and len(it.get("checks") or []) != p:
                    errs.append(f"{iid}: points must equal the number of checks")
                if t == "order" and ans is not None and len(ans) != p:
                    errs.append(f"{iid}: points must equal the number of pictures")
                covered.setdefault(it.get("test_out"), 0)
                covered[it.get("test_out")] += p
        elif "points" in it:
            errs.append(f"{iid}: points are only for test-out items")

    # every Level 1 test-out item has items, and their points add up
    for tid, pts in sorted(testout_pts.items()):
        if not tid.startswith("T1."):
            continue
        if not any(i.get("test_out") == tid for i in items):
            errs.append(f"test-out item {tid} has no item")
        got = covered.get(tid, 0)
        if got != pts:
            errs.append(f"test-out item {tid}: test-out items give {got} points, expected {pts}")

    # every Level 1 lesson has three to five check items
    for s in sessions_list:
        if s["level"] == 1 and s["kind"] == "lesson":
            n = sum(1 for i in items if s["id"] in (i.get("sessions") or []) and "lesson" in (i.get("use") or []))
            if not 3 <= n <= 5:
                errs.append(f"{s['id']}: {n} lesson items, expected 3 to 5")
    return errs


def main(items_path, sessions_path, testouts_path):
    items = yaml.safe_load(open(items_path))["items"]
    sessions = yaml.safe_load(open(sessions_path))["sessions"]
    pts = load_testouts(open(testouts_path).read())
    errs = check(items, sessions, pts)
    print(f"{len(items)} items checked.")
    for e in errs:
        print("PROBLEM:", e)
    return 1 if errs else 0


if __name__ == "__main__":
    sys.exit(main(*sys.argv[1:4]))
