---
title: "Build a Context Pack"
category: "Prompt Engineering"
difficulty: "home-cook"
tags: ["context engineering", "context", "prompt engineering", "reusable prompts"]
teaser: "Assemble one reusable context pack for a project — goal, background, constraints, examples, current state — so every new chat starts on second base."
bestFor: "Ongoing projects, client work, codebases, research threads — anything you keep re-explaining"
whenToUse: "When you catch yourself explaining the same project to a fresh chat for the third time"
featured: false
---

Every fresh chat starts from zero, so on any ongoing project you become the courier — retyping the same background, constraints, and status, slightly differently each time. A context pack ends that: one page you write once, paste at the top of any new session, and update in exactly one place as the project moves. (This is the pantry method from the Lessons track, in fill-in form.)

## The Recipe

Fill in this template — then paste the whole thing at the start of a new session, followed by today's task.

```
# Context Pack: [Project name]

## What this is
[Two sentences: the project, its goal, and who it's for.]

## Background the model can't guess
- [A fact that changes decisions — history, relationships, prior choices]
- [Another one]

## Constraints
- [Hard rule: deadline, format, tone, budget, tooling]
- [What to never do]

## What good looks like
[One example of past output you were happy with — or two sentences describing it.]

## Current state  ← the only section that changes
- Done: [...]
- In progress: [...]
- Next: [...]
- Open questions: [...]
```

## Example — A client website project

```
# Context Pack: Harbor Dental Website

## What this is
Rebuilding the website for a two-dentist practice in Bangor. Goal: more new-patient bookings, especially implants. The site is the brochure — the office manager, Dana, approves everything.

## Background the model can't guess
- Current site is WordPress; we're staying on WordPress (Dana can edit it).
- The practice turns away emergency work — never feature it.
- Main competitor is Aspen Dental on Stillwater Ave; we compete on personal continuity ("you see the same dentist every visit").

## Constraints
- Plain language, no dental jargon without a one-line explanation.
- Nothing that sounds like a medical promise — no outcome guarantees, ever.
- Every page draft ends with the booking phone number.

## What good looks like
The About page draft from Oct 12 — warm, short paragraphs, "same dentist every visit" lands in the first three lines.

## Current state
- Done: Home and About drafts approved.
- In progress: Services pages.
- Next: Implants page.
- Open questions: Whether Dana wants a Spanish version this round.
```

## Tips for better results

- Keep the whole pack under a page. It's a budget — every line in it gets re-read on every task, so lines that don't change decisions don't earn their place.
- Only "Current state" should change week to week. If you find yourself editing the background often, the fact probably belongs in Current state.
- A stale pack is worse than no pack: wrong facts get believed with total confidence. When something changes, fix the pack before the next session, not after a bad output.
- Start a session by asking the model to repeat back the three most important facts in the pack. If it can't, the pack — not the model — needs the fix.

## 🔁 Leftover Remixes

**🌶️ Spicy:** *"Read this context pack before we start. Tell me what's missing, what contradicts itself, and what sounds stale — then I'll fix it and we'll begin."*

**🧊 Mild:** The five-line version: what it is, two facts, one constraint, current state in one line. A small pack you maintain beats a perfect one you abandon.

**💰 Budget:** *"Based on everything in this conversation, draft a context pack for this project in the template I give you — I'll correct it."* The model writes the first draft; you just edit.
