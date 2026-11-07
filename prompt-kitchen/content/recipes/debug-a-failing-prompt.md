---
title: "Debug a Failing Prompt"
category: "Prompt Engineering"
difficulty: "home-cook"
tags: ["prompt engineering", "debugging", "troubleshooting", "iteration"]
teaser: "When a prompt keeps giving you the wrong thing, stop rewriting it at random — isolate the failure, name the cause, and fix one variable at a time."
bestFor: "Anyone with a saved prompt that used to work, almost works, or works except when it matters"
whenToUse: "After the second disappointing output from the same prompt — before the third rewrite from scratch"
featured: false
---

Most failing prompts don't fail for the reason you think. You rewrite the opening line, the output changes a little, you rewrite the ending, it changes back — and an hour later you have a different prompt with the same problem. Debugging beats rewriting: reproduce the failure, change one thing, and watch what actually moves.

## The Recipe

Paste your prompt and its bad output into a fresh chat, then run this:

```
You are helping me debug a prompt, not just rerun it.

My prompt:
[PASTE THE PROMPT]

The output I got:
[PASTE THE BAD OUTPUT — OR DESCRIBE EXACTLY WHAT WAS WRONG WITH IT]

What I actually wanted:
[ONE OR TWO SENTENCES — BE SPECIFIC ABOUT THE GAP]

Do this, in order:

1. Diagnose before you fix. Check these five causes, in this order, and say which ones are present — quoting the exact line from my prompt that proves it:
   - Conflicting instructions — two lines that pull in different directions
   - Missing context — a fact the model would need, that I never gave it
   - Vague success criteria — "good", "professional", or "engaging" with no example or standard behind them
   - Example mismatch — my examples teach a different pattern than my instructions ask for
   - Buried instruction — the important rule is lost in the middle of a long prompt

2. Rank the causes. Name the single most likely culprit first, and say why.

3. Propose the smallest fix for that one cause only. Show the changed lines as before → after. Do not rewrite the whole prompt.

4. Tell me how to test it: what output would prove the fix worked, and what output would mean the cause was something else.
```

## Example — The summary that kept editorialising

The prompt asked for a "neutral, factual summary" of a meeting transcript — and also told the model to "highlight the decisions that matter most and flag anything risky." The diagnosis came back as a clean conflict: *neutral and factual* versus *decide what matters and judge risk*. The smallest fix wasn't a rewrite; it was splitting the job:

Before → *"Summarise this meeting neutrally and factually, highlighting the decisions that matter most and flagging anything risky."*

After → *"Summarise this meeting in factual language only — no judgements, no recommendations. Then, under a separate heading called Flags, list anything that looks risky or undecided."*

Same model, same transcript — the summary stayed clean because the judging now had its own, labelled place to go.

## Tips for better results

- Debug in a fresh chat. The session that produced the bad output will keep defending the assumptions that caused it.
- Change one variable at a time. If you fix three things at once and it works, you learned nothing — and the next failure starts from zero again.
- Keep the bad output. "It was too salesy" is an opinion; the actual paragraph is evidence the diagnosis can quote.
- If no cause from the list fits, say so in the prompt and ask for a sixth. A forced diagnosis is worse than an honest "none of these."

## 🔁 Leftover Remixes

**🌶️ Spicy:** *"Run my prompt on this test case three times. If the outputs disagree with each other, the prompt — not the model — is underspecified. Show me where."*

**🧊 Mild:** One cause only: *"Read this prompt and tell me only whether any two instructions conflict. Quote both lines if they do."*

**💰 Budget:** Before you debug, shrink: *"Here is my prompt and the output I wanted. Which lines in the prompt changed nothing? Delete them and show me what's left."* Half of all prompt bugs live in lines that were never doing anything.
