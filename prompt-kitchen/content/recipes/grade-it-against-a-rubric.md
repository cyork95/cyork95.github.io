---
title: "Grade It Against a Rubric"
category: "AI & Prompting"
difficulty: "sous-chef"
tags: ["evaluation", "rubric", "quality", "review"]
teaser: "Stop asking 'is this good?' — score any output against explicit criteria, with evidence quoted for every score and a fix list in priority order."
bestFor: "Writers, reviewers, and anyone quality-checking AI output or human drafts"
whenToUse: "When you have a draft — yours or the model's — and need a judgment you can act on, not a vibe"
featured: false
---

"Is this good?" gets you a polite paragraph and no information. A rubric gets you numbers tied to evidence: which criterion failed, the exact line that proves it, and the one change that would help most. It works on the model's drafts, on your own, and — used in a fresh chat — it stops the authoring session from grading its own homework generously.

## The Recipe

```
Grade the text below against this rubric. Score each criterion from 1 to 5.

Criteria:
1. [Accuracy — every claim is supported; nothing invented]
2. [Clarity — a busy reader gets the point in one pass]
3. [Fit — matches the brief: audience, length, tone]
4. [Evidence — claims are backed, not just asserted]

Rules:
- For each criterion: give the score, quote the exact line that most influenced it, and name the single change that would raise the score most.
- Do not average away a fatal flaw. If any criterion scores 1, lead with that.
- Finish with a fix list: the changes ordered by improvement per effort.

The brief it was written to:
[PASTE THE BRIEF, IF THERE WAS ONE]

The text:
[PASTE THE TEXT]
```

## Example — Grading a product announcement

Run the recipe on a draft announcement and you'll get back something like: *Clarity: 4 — "Night owls, rejoice" carries the news in four words; Fit: 2 — the brief said under 60 words for a changelog and this is 140, and the tone drifts salesy at "game-changing".* That second line is the whole value: a score, the evidence, and the fix, in one breath.

## Tips for better results

- Write the criteria before you see the output. Criteria written after reading the draft quietly bend toward whatever the draft already does.
- Grade in a fresh chat. The session that wrote the text will defend it; a session with no authorship pride just grades.
- Demand the quotes. A score without a quoted line behind it is astrology — send it back.
- Grade your own writing with the same rubric you use for the model's. The criteria don't care who typed it, and neither should the scores.

## 🔁 Leftover Remixes

**🌶️ Spicy:** Run two graders independently, then: *"Here are two rubric gradings of the same text. Where they disagree, tell me which one is right and why."*

**🧊 Mild:** One criterion only: *"Grade just the clarity of this, 1–5, with the line that decided it."*

**💰 Budget:** Don't have a rubric? *"What 4 criteria should I grade a [job posting / announcement / cover letter] on? Define each so a score of 3 vs 5 is unmistakable."*
