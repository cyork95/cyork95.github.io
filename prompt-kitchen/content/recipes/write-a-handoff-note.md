---
title: "Write a Handoff Note"
category: "Communication"
difficulty: "beginner"
tags: ["handoff", "context", "collaboration", "documentation"]
teaser: "End a session — with an AI, a teammate, or future you — with a note that lets the next person start working in two minutes instead of twenty questions."
bestFor: "Anyone pausing work mid-stream: ending an AI chat, handing a task to a teammate, or stopping for the day"
whenToUse: "In the last five minutes of any work session that someone — including you, tomorrow — will need to pick back up"
featured: false
---

Work rarely restarts where it stopped. It restarts with "wait, where were we?" — a fresh AI chat with no memory of yesterday, a teammate covering for you, or you on Monday staring at Friday's tabs. A handoff note is the cheapest context there is: five short sections, written while the state is still in your head, that turn a cold restart into a warm one. It is Lesson 6 — memory across sessions — reduced to a form you can fill in.

## The Recipe

Run this at the end of a session, in the session itself — it already holds the context:

```
Write a handoff note for this work, so a capable person (or a fresh AI session) who knows nothing about it can pick it up in two minutes.

Use exactly these sections, and keep the whole note under 250 words:

## Where this stands
[One or two sentences: what this work is, and its current state — not its history.]

## Done
- [Finished things only, stated as facts]

## Decided
- [Each decision, with its reason in a few words — decisions are the first thing a restart re-litigates]

## Watch out
- [Traps, dead ends already tried, and anything that looks true but isn't]

## Next step
[The single next action, specific enough to start immediately — not "continue working on it."]

Rules: if something belongs in a section and you don't know it, write "unknown" — do not fill gaps with plausible guesses. Do not include anything that was only discussed and rejected unless it belongs in Watch out.
```

## Example — Friday to Monday, same person

```
## Where this stands
Drafting the Q1 pricing page rewrite. Structure is settled; the pricing table section is half-drafted.

## Done
- New headline and intro approved by Dana
- Competitor prices checked Nov 5 — ours are mid-range, not cheapest

## Decided
- Lead on reliability, not price — because the support stats are stronger than the discount story
- No annual/monthly toggle in v1 — engineering time isn't there

## Watch out
- The old page's "unlimited" claim is not true on the current plan — do not carry it over
- The first draft of the table used last quarter's prices

## Next step
Finish the pricing table using the Nov 5 checked prices, then send the full draft to Dana for tone review.
```

Monday's restart took one read. No archaeology, no re-deciding the toggle, and the false "unlimited" claim died in Watch out instead of shipping.

## Tips for better results

- Write it while the session is still open. The model — and you — still hold the dead ends and the reasons. An hour later, both are reconstruction.
- Decided is the section people skip, and the one that saves the most time. A restart rarely re-does finished work; it cheerfully re-opens settled decisions.
- Keep it under 250 words on purpose. A handoff that takes ten minutes to read is a document, not a handoff — and nobody reads it at restart time.
- Paste the note at the top of the next session, before your first request. Context given after the first answer arrives too late to shape it.

## 🔁 Leftover Remixes

**🌶️ Spicy:** *"Write the handoff — then read it back as the stranger receiving it, and list the first three questions you'd have to ask. If there are any, revise the note to answer them."*

**🧊 Mild:** The two-line version for small tasks: *"In two lines: where this stands, and the exact next step."*

**💰 Budget:** Reverse it at restart time: *"Here is a handoff note from a previous session: [PASTE]. Before we start, repeat back what's done, what's decided, and what the next step is — and flag anything in it that looks stale or contradictory."*
