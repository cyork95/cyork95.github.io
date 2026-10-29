---
title: "Make AI Check Its Work"
category: "Research"
difficulty: "home-cook"
tags: ["fact-checking", "hallucinations", "accuracy", "verification", "research"]
teaser: "Force AI to verify its own claims before presenting them — and flag anything it can't actually confirm."
bestFor: "Research that matters, anything you'll cite or share, factual questions where errors have consequences"
whenToUse: "When accuracy matters more than speed, or when you've been burned by confident AI nonsense before"
featured: false
---

AI models are confidently wrong more often than they seem. The same fluency that makes their answers readable also makes their mistakes invisible — they state invented facts with the same tone as verified ones. This recipe forces the model to audit itself before handing you an answer.

## The Recipe (for factual questions)

```
[Your question]

Before answering: 
1. Search the web for current information on this from the last 30 days 
   [use with a model that has web access]
2. List the 3 primary sources you found — name them explicitly
3. For any claim in your answer that you cannot verify from those sources, 
   state "I cannot verify this" instead of estimating or inferring
4. Flag anything where your training data might be out of date

Then give me the answer.
```

## The Recipe (self-audit after the fact)

If you've already got a response and want to check it:

```
Review your previous response. 

For every factual claim you made:
1. Rate your confidence: high (you'd stake your reputation on it), 
   medium (probably right but worth checking), or low (you're inferring)
2. For any medium or low confidence claims, explain why you're uncertain
3. List what a person should actually verify before using this information

Be honest. I'd rather know what you're uncertain about than get false confidence.
```

## The "audit first" approach for complex problems

```
Solve [problem].

Do NOT give me the final answer yet. First:
1. Break the problem into 5 logical sub-steps
2. For each sub-step, explain your reasoning
3. At each step, flag any assumption you're making that might be wrong
4. Only after completing this audit, give me the final answer

Show your working.
```

## When to use each approach

| Situation | Best approach |
|---|---|
| Quick factual question | Ask for source list before answering |
| Complex analysis or calculation | Audit-first (sub-steps) |
| Response you've already got | Self-audit / confidence rating |
| Anything you're going to publish or present | All three, then verify externally |

## What AI is actually uncertain about

AI models are less reliable on:
- Specific numbers, statistics, and dates
- Recent events (post training cutoff)
- Niche or specialized topics with less training data
- Anything where the "true answer" is genuinely contested

They're more reliable on:
- Well-documented, stable facts with broad consensus
- Conceptual explanations of established topics
- Reasoning and analysis tasks (not retrieval)
- Patterns and structures, not specific instances

## 🔁 Leftover Remixes

**🌶️ Spicy:** *"What's the most likely way your previous answer is wrong? What would I find if I looked this up and you were mistaken?"*

**🧊 Mild:** *"Which parts of your answer are you most confident in, and which parts should I double-check before relying on them?"*

**💰 Budget:** *"Is this a topic where AI tends to hallucinate or make things up? What should I watch out for?"*

---
*Prompt concept via [Elton Jones / Tom's Guide](https://www.tomsguide.com/ai/i-fixed-geminis-biggest-weaknesses-these-10-prompts-give-me-the-best-answers-every-time). Adapted and expanded for The Prompt Kitchen.*
