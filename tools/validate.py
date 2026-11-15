"""Check sessions.yaml. Prints problems and a fill report. Exit 1 on structural errors.
Run: python3 validate.py sessions.yaml
"""
import sys, yaml, collections

ORDER = ["Adam", "Ark", "Abraham", "Bondage", "Break Free", "Battle",
         "Crowned", "Cut", "Captivity", "Christ", "Church", "Consummation"]
STAGE_OF = {w: k for k, ws in [("A", ORDER[0:3]), ("B", ORDER[3:6]),
                              ("C1", ORDER[6:9]), ("C2", ORDER[9:12])] for w in ws}
SLOTS = ["title", "key_event", "christ_point", "covenant", "read", "find_it",
         "one_line", "teaching_note", "go_further", "leader_note"]
EXPECT = {1: 4, 2: 12, 3: 26}


def main(path):
    s = yaml.safe_load(open(path))["sessions"]
    errs, fill = [], collections.Counter()
    ids = [x["id"] for x in s]
    if len(ids) != len(set(ids)):
        errs.append("duplicate ids")
    for lvl, n in EXPECT.items():
        got = sum(1 for x in s if x["level"] == lvl)
        if got != n:
            errs.append(f"Level {lvl}: {got} sessions, expected {n}")
    for x in s:
        w = x.get("word")
        if w:
            if w not in ORDER:
                errs.append(f"{x['id']}: unknown word {w}")
                continue
            if STAGE_OF[w] != x["stage_key"]:
                errs.append(f"{x['id']}: {w} is in stage {STAGE_OF[w]}, not {x['stage_key']}")
            if x["step_order"] != ORDER.index(w) + 1:
                errs.append(f"{x['id']}: step_order wrong for {w}")
            if x["rail"]["recall"] != ORDER[:ORDER.index(w)]:
                errs.append(f"{x['id']}: recall list does not match the words before {w}")
        if x["kind"] == "lesson" and x["level"] in (2, 3) and x.get("part") != 2:
            if isinstance(x.get("date"), str) and "ASK GEB" in x["date"]:
                errs.append(f"{x['id']}: missing date ({x['date']})")
        for k in SLOTS:
            sl = x[k]
            fill[(sl["owner"], sl["status"])] += 1
        im = x["image"]
        if im["status"] != "empty" and not im.get("license"):
            errs.append(f"{x['id']}: image has no license recorded")
        if x["kind"] in ("lesson", "review") and not x["prepares_for"]:
            fill[("LINK", "no test-out item")] += 1
    # level order: words in each level must run in timeline order
    for lvl in (2, 3):
        seq = [x["step_order"] for x in s if x["level"] == lvl and x["kind"] == "lesson"]
        if seq != sorted(seq):
            errs.append(f"Level {lvl}: lessons out of timeline order")
    for x in s:
        if x["level"] == 3 and x["kind"] == "lesson" and x["christ_point"]["owner"] != "AI DRAFT":
            errs.append(f"{x['id']}: Level 3 lesson needs a Christ slot")
    # every lesson linked to the test-outs, every test-out item covered
    items = {f"T1.{i}" for i in range(1, 7)} | {f"T2.{i}" for i in range(1, 8)} | {f"T3.{i}" for i in range(1, 6)}
    used = set()
    for x in s:
        for t in x["prepares_for"]:
            if t not in items:
                errs.append(f"{x['id']}: unknown test-out item {t}")
            used.add(t)
    for t in sorted(items - used):
        if t != "T2.1":  # pictures: covered by stage openers, not lessons
            errs.append(f"test-out item {t} has no session preparing for it")
    # Level 3: both parts of a word carry Christ content
    for x in s:
        if x["level"] == 3 and x["kind"] == "lesson" and x["christ_point"]["status"] == "empty":
            errs.append(f"{x['id']}: Level 3 lesson has no Christ point yet")
    for x in s:
        if x["kind"] == "lesson":
            qs = x["find_it"]["value"] or []
            if len(qs) != 5:
                errs.append(f"{x['id']}: {len(qs)} questions, expected 5")
    print(f"{len(s)} sessions checked.")
    for e in errs:
        print("PROBLEM:", e)
    print("Slot fill (owner, status): count")
    for k, v in sorted(fill.items()):
        print(f"  {k[0]:<11} {k[1]:<18} {v}")
    return 1 if any("expected" in e or "duplicate" in e or "order" in e for e in errs) else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))
