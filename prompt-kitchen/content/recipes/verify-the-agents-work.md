---
title: "Verify the Agent's Work"
category: "AI & Prompting"
difficulty: "sous-chef"
tags: ["agents", "verification", "evaluation", "quality", "review"]
teaser: "An agent's confident summary is not evidence. Audit its claims, sources, and changes — with spot-checks you choose, not ones it picks for you."
bestFor: "Anyone accepting multi-step work from an AI agent — research, drafts, data cleanup, or code changes"
whenToUse: "Before you use, send, publish, or build on anything an agent produced while you weren't watching"
featured: false
---

Briefing an agent well is half the job. The other half is refusing to take its word for the result. Agents summarise their own work generously, skip the step that failed quietly, and present a guess in the same tone as a verified fact. Verification isn't distrust — it's the checkpoint that makes delegation safe to repeat.

This is the companion to Brief the Agent: that recipe ends at a definition of done; this one checks whether done actually happened.

## The Recipe

Run this in a fresh session where you can, with the agent's deliverable and — if it kept one — its work log:

```
Audit this work. Do not improve it, extend it, or rewrite it — your only job is to check it.

The original brief:
[PASTE THE BRIEF, INCLUDING ITS DEFINITION OF DONE]

The deliverable:
[PASTE OR ATTACH IT]

The work log / sources, if any:
[PASTE, OR WRITE "none provided"]

Audit in this order:

1. Definition-of-done check. Go through the brief's definition of done line by line. For each line: MET, PARTLY MET, or NOT MET — with the evidence from the deliverable quoted or pointed to.

2. Claims audit. List every factual claim in the deliverable that a reader would rely on. For each one mark it:
   - Supported — the source or evidence is right there
   - Unsupported — stated as fact, with nothing behind it
   - Unverifiable here — I would need to check [name the place] myself

3. Silent gaps. What did the brief ask for that the deliverable never mentions at all — not even to say it couldn't be done? Silence is a finding.

4. Pick my spot-checks. Choose the 3 claims or changes whose failure would cost me the most, and tell me exactly how to check each one myself in under two minutes. Do not choose the easiest three.

Finish with a verdict in one line: ACCEPT, ACCEPT WITH FIXES LISTED, or SEND BACK — and if SEND BACK, the one-sentence brief for the return trip.
```

## Example — The research brief that looked finished

An agent delivered a tidy comparison of three tools, with prices. The audit found: definition of done mostly met, but the "guest access" line was PARTLY MET — answered for two tools, silent on the third. The claims audit flagged four prices as Supported, one as Unverifiable here (a pricing page that now shows a sale price), and one as Unsupported — a "free tier" that appeared in no source the agent cited. The costliest spot-check took ninety seconds: open the third tool's pricing page and search for "guest". Verdict: ACCEPT WITH FIXES LISTED. Without the audit, the free-tier claim would have gone to a manager as fact.

## Tips for better results

- Audit in a different session than the one that did the work, when the tool allows it. The author grades generously; a stranger just grades.
- "None provided" is a valid work log — and it changes the verdict. Work with no trail can still be right, but every claim in it starts at Unsupported.
- Always run at least one spot-check yourself. The audit narrows twenty claims to the three that matter; your own eyes on one of them is what keeps the whole chain honest.
- Send work back with the audit attached, not a fresh complaint. "Line 2 of the definition of done, NOT MET, here's the evidence" gets fixed in one round. "This isn't right" gets a new guess.

## 🔁 Leftover Remixes

**🌶️ Spicy:** *"Now argue the other side: assume this deliverable is wrong in one important way that your audit missed. Where would the error most plausibly be hiding?"*

**🧊 Mild:** Just the gaps: *"Read this brief and this deliverable. List only what the brief asked for that the deliverable never mentions."*

**💰 Budget:** No brief to audit against? Reconstruct one first: *"From this deliverable alone, write the definition of done it seems to have been working to — then show me where it falls short of its own standard."*
