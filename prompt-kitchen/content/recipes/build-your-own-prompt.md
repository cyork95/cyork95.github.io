---
title: "Build Your Own Prompt"
category: "Prompt Engineering"
difficulty: "sous-chef"
tags: ["meta-prompting", "prompt design", "prompt engineering", "frameworks", "advanced"]
teaser: "Use AI to engineer a high-quality prompt for any task — with a four-part structure that forces specificity every time."
bestFor: "Complex tasks where vague prompts keep getting vague results, recurring workflows you want to systematize, anything you'll run repeatedly"
whenToUse: "When you're not getting what you want and suspect the prompt is the problem, not the model"
featured: false
---

Most bad AI outputs are bad prompts in disguise. This recipe turns the model into your prompt engineer — you describe what you're trying to do, and it hands you a production-ready prompt with all the hard structural thinking already done.

## The Recipe

```
Design a high-quality prompt for the following task:

[Describe your goal in 1–2 sentences. Be specific about the output you want, 
the audience it's for, and any format requirements.]

Structure the prompt with these four sections:

**Role & Persona** — Who Claude should be for this task. Include domain expertise, 
tone (formal/casual/blunt/encouraging), and any relevant context about the 
situation or stakeholder.

**Input Context** — What information will be provided in the prompt, and what 
the model should explicitly ignore or not infer beyond.

**Constraints** — What it must never do. Output format rules. Length limits. 
Anything that would make the result unusable if violated.

**Output Template** — The exact structure the response should follow. 
Use headers, bullets, or a fill-in skeleton if needed.

Be specific in every section. Vague prompts get vague prompts back.
```

## Example output (for a weekly status report)

Here's what the model generates when you feed it *"Write a weekly status update for my manager that summarizes what I accomplished, what's blocked, and what I'm doing next week."*

```
## Role & Persona
You are a clear, direct communicator who values brevity over padding. 
Tone is professional but not stiff — write like a competent colleague 
updating their manager, not a consultant writing a deliverable.

## Input Context
You will be given: a list of tasks worked on this week, any blockers 
encountered, and a rough plan for next week. Do not infer work that 
wasn't mentioned. Do not add filler phrases like "I'm pleased to report."

## Constraints
- Maximum 200 words total
- No bullet points with more than 8 words
- Never use the phrases "synergy," "bandwidth," or "circle back"
- Do not mention tasks unless they have a concrete outcome or status

## Output Template
**Week of [date]**

**Done**
- [accomplishment + outcome/impact, 1 line each]

**Blocked**
- [blocker — what it is and what you need to unblock it]
*(Remove section if nothing is blocked)*

**Next week**
- [planned task + expected output, 1 line each]
```

## When this technique pays off

| Situation | What it gives you |
|---|---|
| Recurring workflow | A repeatable prompt you run every time |
| Vague brief from stakeholder | Forces clarity before you start |
| Team prompt library | Documented, consistent structure anyone can use |
| You keep tweaking the same prompt | One meta-prompt generates better v1s than manual iteration |

## What makes a strong task description

The better your input, the better the generated prompt. Include:
- **The output format** — report, email, list, code, table?
- **The audience** — your manager, a client, a developer, yourself?
- **The success criteria** — what makes the result good vs. mediocre?
- **The failure mode** — what would make it useless or wrong?

Bad: *"Write a prompt for summarizing articles."*  
Good: *"Write a prompt that summarizes technical blog posts into a 3-bullet TL;DR for non-technical readers, without losing the key insight from the author."*

## 🔁 Leftover Remixes

**🌶️ Spicy:** *After generating the prompt, ask: "What's the most likely way this prompt produces a bad output? Rewrite the Constraints section to prevent it."*

**🧊 Mild:** *Just ask for the Role and Output Template sections only — that's often enough to get dramatically better results without the full framework.*

**💰 Budget:** *"Rewrite this prompt to be more specific: [paste your existing prompt]"* — same structural improvement, less scaffolding.

---
*Inspired by the Meta-Prompt Engine framework. Adapted for practical daily use at The Prompt Kitchen.*
