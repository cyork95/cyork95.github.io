---
title: "Rubber Duck Debugging"
category: "Coding"
difficulty: "home-cook"
tags: ["coding", "debugging", "problem-solving", "technical"]
teaser: "Explain your code or problem to AI like a patient rubber duck — the act of explaining often reveals the bug."
bestFor: "Coding bugs, logical errors, any problem you've been staring at too long"
whenToUse: "When you're stuck and can't see what's wrong"
featured: false
---

The classic rubber duck debugging technique — explain your code to a rubber duck until you spot the bug yourself — works even better with AI. The AI actually responds, asks questions, and spots things you've been staring past for an hour.

## The Recipe

```
I'm trying to [what the code/system is supposed to do].

Here's the problem: [describe what's actually happening vs. what you expect]

Here's the relevant code / setup:
[paste your code or describe your system]

Walk me through what this code is actually doing, step by step. Don't jump straight to a fix — first help me understand where the logic breaks down. Then suggest the fix.
```

## Example — A loop that's not working

```
I'm building a script that should send a reminder email to everyone on a list who hasn't responded in 3 days.

The problem: It's sending reminders to everyone, including people who have responded. I've checked the condition twice and it looks right to me.

Here's the relevant code:
[paste code]

Walk me through what this loop is actually doing, step by step. Don't jump straight to a fix — first help me understand where the logic breaks down.
```

> **Works for non-coders too.** Stuck on a spreadsheet formula? A logic puzzle? A process that isn't working? Use the same approach — describe what you expect vs. what's happening, then ask AI to walk through it step by step.

## 🔁 Leftover Remixes

**🌶️ Spicy:** After the fix: *"Now assume the fix introduces a new bug. What's the most likely unintended consequence of the change you just suggested?"*

**🧊 Mild:** Just paste the code and ask: *"Explain what this code does, line by line, in plain English."*

**💰 Budget:** *"Without fixing it, just tell me: what are the 3 most likely causes of this kind of bug?"*
