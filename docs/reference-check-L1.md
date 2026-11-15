# Level 1 reference check (T1.3)

Checked 2026-11-15 by Opus against the ESV text served by the TheologAI Bible tool. Scope: every reference and model answer in L1-01 to L1-04, and the Level 1 items in `content/items.yaml`.

## Result

Every reference resolves to a real passage. Every model answer matches the verse, with one wording fix below.

| Session | Reference | Check |
|---|---|---|
| L1-01 | Genesis 1:1-2:3, Genesis 3 | Resolve |
| L1-01 | Genesis 1:31 | "very good" matches |
| L1-01 | Genesis 3:15 | "he shall bruise your head" matches "Bruise his head" |
| L1-02 | Exodus 12:1-13, 14:21-31, 20:1-3 | Resolve (14:31 is the last verse of the chapter) |
| L1-02 | Exodus 14:30 | "the LORD saved Israel that day" matches |
| L1-02 | Exodus 20:2 | "out of the land of Egypt, out of the house of slavery" matches |
| L1-02 | Exodus 12:13 | "when I see the blood, I will pass over you" matches |
| L1-03 | 2 Samuel 7:12-16, 1 Kings 12:16-20, 2 Kings 25:8-12 | Resolve |
| L1-03 | 2 Samuel 7:16 | House, kingdom, throne "forever" matches |
| L1-03 | 2 Kings 25:9-11 | Burned the house of the LORD, the king's house, all the houses; people carried into exile. Matches |
| L1-04 | 1 Corinthians 15:1-8, 1 Timothy 1:15 | Resolve |
| L1-04 | 1 Timothy 1:15 | "came into the world to save sinners" matches |
| L1-04 | 1 Corinthians 15:3-4 | Died, buried, raised on the third day. Matches |

## One fix for Geb (not made here)

L1-04, Think It Through question 3 quotes "according to the Scriptures." The ESV says **"in accordance with the Scriptures"** (1 Corinthians 15:3). Change the question to:

> Why did Christ die, and what does "in accordance with the Scriptures" tell you?

I did not edit it. Session content lives in the claude.ai project, where the book work also edits it. The fix belongs there, then the repo copy is refreshed.

## By design

L1-03 (The Land) has no Christ point. The plan and the book plan both note this. It is Geb's call whether to add one.

## Empty slots

No AI DRAFT slot in L1-01 to L1-04 is empty except the covenant slots, which do not apply to Level 1, and the L1-03 Christ point above. Nothing was filled.
