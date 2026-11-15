"""Fail on banned words and marks in learner-facing content and app source.

Run: python3 tools/lint_content.py            (checks the default paths)
     python3 tools/lint_content.py FILE...    (checks only these files)
Exit 1 if anything is found.

Banned (plan section 2): em dashes, "Stage Four", "twelve steps", "Chaos",
"Four Pictures". docs/ and tools/ are not checked: they name the banned
terms on purpose.
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
DEFAULT_GLOBS = ["content/*.yaml", "content/*.md", "src/**/*.ts", "src/**/*.tsx",
                 "src/**/*.css", "index.html", "public/**/*.json"]
BANNED = [
    ("em dash", re.compile("—")),
    ("Stage Four", re.compile(r"\bstage\s+four\b", re.I)),
    ("twelve steps", re.compile(r"\b(twelve|12)\s+steps\b", re.I)),
    ("Chaos", re.compile(r"\bchaos\b", re.I)),
    ("Four Pictures", re.compile(r"\bFour\s+Pictures\b")),
]
# Reported, not failed: "four pictures" in plain prose may be fine, but the
# course frames it as three pictures and the cross. Geb decides.
WARN = [("four pictures (check wording)", re.compile(r"\bfour\s+pictures\b"))]


def scan_text(text):
    """Yield (line_number, label, line) for each banned hit."""
    for n, line in enumerate(text.splitlines(), 1):
        for label, rx in BANNED:
            if rx.search(line):
                yield n, label, line.strip()


def scan_warnings(text):
    for n, line in enumerate(text.splitlines(), 1):
        for label, rx in WARN:
            if rx.search(line):
                yield n, label, line.strip()


def files(args):
    if args:
        return [pathlib.Path(a) for a in args]
    out = []
    for g in DEFAULT_GLOBS:
        # Tests name the banned terms on purpose, to prove they are caught.
        out.extend(p for p in ROOT.glob(g) if p.is_file() and ".test." not in p.name)
    return sorted(set(out))


def main(args):
    hits = warns = 0
    checked = files(args)
    for p in checked:
        text = p.read_text(encoding="utf-8")
        name = p.relative_to(ROOT) if p.is_absolute() else p
        for n, label, line in scan_text(text):
            hits += 1
            print(f"PROBLEM {name}:{n}: {label}: {line[:100]}")
        for n, label, line in scan_warnings(text):
            warns += 1
            print(f"note    {name}:{n}: {label}: {line[:100]}")
    print(f"{len(checked)} files checked, {hits} problems, {warns} notes.")
    return 1 if hits else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
