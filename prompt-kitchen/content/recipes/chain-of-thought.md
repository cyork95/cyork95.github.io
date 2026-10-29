---
title: "Chain of Thought"
category: "Problem Solving"
difficulty: "home-cook"
tags: ["reasoning", "problem-solving", "analysis", "thinking"]
teaser: "Make AI show its work — force step-by-step reasoning to get more accurate answers on complex problems."
bestFor: "Math problems, logic puzzles, multi-step analysis, decisions with many variables"
whenToUse: "When you need accurate reasoning, not just a fast answer"
featured: false
---

AI produces better answers when it reasons out loud. Without prompting, it often jumps straight to a conclusion — which can be wrong on complex problems. "Chain of thought" prompting forces it to think step by step, catching errors in its own reasoning.

## The Recipe

```
[Your question or problem]

Before giving me your answer, think through this step by step. Show your reasoning at each stage. Only give me your final answer after you've worked through it.
```

Or alternatively:

```
Let's think through this carefully. Walk me through each step of your reasoning before reaching a conclusion. If any step depends on assumptions, call them out.
```

## Example — A tricky word problem

```
A shop buys items for £8 each and sells them for £10. But 20% of items sold get returned, and returned items can't be resold. If they sell 100 items, what's their profit?

Before giving me your answer, think through this step by step. Show your reasoning at each stage.
```

## When to use chain of thought

- Math problems with multiple steps
- Logic puzzles
- Decisions with several variables (e.g., "should I take the job offer?")
- Anything where you've gotten a suspiciously fast confident answer
- Medical, financial, or legal explanations (forces it to be more careful)

## 🔁 Leftover Remixes

**🌶️ Spicy:** *"Now challenge your own reasoning. What's the weakest step in your chain of thought? What assumption is most likely to be wrong?"*

**🧊 Mild:** After getting a fast answer you're unsure about: *"Walk me through how you got that — I want to check the reasoning."*

**💰 Budget:** *"Just give me the key equation or logic principle this question turns on."*
