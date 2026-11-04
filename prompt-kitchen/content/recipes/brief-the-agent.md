---
title: "Brief the Agent"
category: "Productivity"
difficulty: "home-cook"
tags: ["agents", "delegation", "workflows", "automation"]
teaser: "Hand a task to an AI agent the way you'd brief a sharp contractor — outcome, context, guardrails, checkpoints, and a clear definition of done."
bestFor: "Anyone delegating multi-step work to AI agents or assistants"
whenToUse: "Before any task where the AI will work in several steps — research, drafting, coding, data cleanup — instead of one prompt at a time"
featured: false
---

Agents rarely fail because they can't do the work. They fail because the brief never said what "done" looks like, what not to touch, or when to stop and ask. A good brief takes three minutes and saves the thirty you'd spend untangling an overconfident wrong turn.

## The Recipe

```
## Task
[The outcome you want, in one or two sentences. Describe what "done" looks like — not just the activity.]

## Context
[What the agent needs to know: the background, the audience, where things live, what already exists. Paste or point at the source material — don't make it guess.]

## Guardrails
- Work only on [scope]. Do not change [the things that are off-limits].
- If you hit [a specific uncertainty you can name], stop and ask instead of guessing.
- Never [send / pay / delete / publish] anything — prepare it for my review.

## Checkpoints
After [first milestone], show me [the artifact] before you continue.

## Definition of done
[The deliverable, its format, and the standard you'll judge it by.]
```

## Example — Research with a deliverable

```
## Task
Compare the top 3 project-management tools for a 6-person team and give me a recommendation I can act on. Done = a one-page brief I could forward to my manager as-is.

## Context
We currently use spreadsheets and hate them. Budget ceiling is $15/person/month. We need guest access for clients. The tools on our radar are Asana, Monday, and ClickUp, but add a fourth if one clearly beats them for small teams.

## Guardrails
- Use current public pricing pages — if a price can't be verified, mark it unverified rather than estimating.
- If "small team" pricing differs from headline pricing, use the small-team number.
- Never sign up for trials or contact vendors — prepare findings only.

## Checkpoints
After your research, show me the comparison table before you write the recommendation.

## Definition of done
A table (price, guest access, the one standout strength, the one real weakness per tool), then your recommendation in under 200 words with the deciding factor named.
```

## Tips for better results

- Brief the outcome, not the steps — the agent is usually better at sequencing than you are, and worse at knowing what you actually want.
- Put the stop-and-ask triggers in writing. "If you're unsure" never fires; "if two sources disagree on the price, stop and show me both" does.
- On anything big, add one line: *"Before you start, give me your plan and any questions."* Reading its plan is the cheapest checkpoint there is.
- Review the first checkpoint properly. An agent that survives checkpoint one with corrections will finish the task with them baked in.

## 🔁 Leftover Remixes

**🌶️ Spicy:** Add: *"Before starting, list the three most likely ways this task goes wrong, and what you'll do to avoid each."*

**🧊 Mild:** The one-paragraph version: *"I want [outcome]. Here's the context: [2–3 lines]. Don't [guardrail]. Show me [checkpoint artifact] before you finish."*

**💰 Budget:** Run the same brief past two different tools and compare their plans before letting either one execute — the better plan usually predicts the better result.
