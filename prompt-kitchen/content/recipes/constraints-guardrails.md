---
title: "Constraints & Guardrails"
category: "Writing"
difficulty: "beginner"
tags: ["constraints", "writing", "control", "format"]
teaser: "Tell AI what NOT to do — guardrails are just as powerful as instructions for getting usable output."
bestFor: "Any writing task where AI tends to over-produce or miss the mark"
whenToUse: "When you keep getting outputs that are too long, too formal, or miss the point"
featured: false
---

Most people tell AI what to do. Fewer people tell it what *not* to do — and that second part is where the real control lives. Guardrails constrain AI's natural tendencies (too long, too hedge-y, too formal) and steer it toward what you actually want.

## The Recipe

Add any of these constraint phrases to your existing prompts:

```
Constraints:
- Maximum [X] words / sentences / bullet points
- No [jargon / buzzwords / passive voice / clichés / filler phrases]
- Do not start with [a question / "Certainly!" / "Great question!"]
- Avoid [giving advice I didn't ask for / adding a disclaimer / moralizing]
- Write as [a human would / a friend would / a [specific style]]
- Do not use [headers / bullet points / numbered lists] — just prose
- Never say [specific phrase you hate]
```

## Example — Email that sounds human

```
Write a follow-up email to a client after our discovery call.

Context: We had a 45-minute call. They're interested but not committed. I want to remind them of the key value I can offer and suggest a next step.

Constraints:
- Maximum 150 words
- Conversational tone — like an email from a person, not a corporation
- No buzzwords ("synergies", "leverage", "value-add")
- Don't start with "I hope this email finds you well"
- No bullet points — just short paragraphs
- End with a specific, low-pressure next step
```

## Most useful constraints by situation

| Situation | Constraint to add |
|---|---|
| AI is too long | "Maximum [X] words" or "Give me just the key points, not a full essay" |
| AI sounds robotic | "Write like a human talking to a friend" |
| AI keeps adding disclaimers | "Skip the caveats — just answer the question" |
| AI starts with pleasantries | "Do not open with affirmations like 'Great question!'" |
| AI is too formal | "Casual tone, like a Slack message, not an email" |

## 🔁 Leftover Remixes

**🌶️ Spicy:** Ask AI to write its own constraints first: *"Before writing this, tell me what constraints you think I should apply given my goal. Then apply them."*

**🧊 Mild:** Single constraint: *"Same prompt, but this time: maximum 3 sentences."*

**💰 Budget:** *"Write this in the most minimal way possible. What's the single sentence version?"*
