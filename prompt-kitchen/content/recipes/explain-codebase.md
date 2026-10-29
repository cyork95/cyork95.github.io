---
title: "Explain This Codebase to a New Developer"
category: "Coding"
difficulty: "home-cook"
tags: ["code documentation", "onboarding", "architecture", "codebase", "software engineering", "tech lead"]
teaser: "Paste a directory structure or core file — get back a 10,000-foot view, data flow trace, design patterns identified, and the landmines to avoid."
bestFor: "Joining a new codebase, onboarding teammates, understanding legacy code, or getting context before making a first commit"
whenToUse: "Any time you need to understand a codebase you didn't write — before modifying it, reviewing it, or explaining it to someone else"
featured: false
---

Unfamiliar code is expensive to navigate without context. This recipe generates a structured orientation — architecture overview, data flow trace, design patterns in use, and the specific parts of the code most likely to break if you touch them.

**Note:** Send the recipe first, then paste your directory structure or code when the model asks for it.

## The Recipe

```
Act as a Senior Tech Lead onboarding a mid-level developer to a new repository. Your goal is to give me immediate context, mental models, and architectural clarity so I can confidently make my first commit without breaking things.

I am going to provide a directory structure or a core file from my codebase.

When I do, please break your explanation down into these clean sections:
- The 10,000-Foot View: What is the primary responsibility of this specific code/module within the larger system architecture?
- Data Flow & Lifecycle: How does data enter this file, how is it transformed, and where does it exit? Trace the state.
- Structural Patterns: Highlight any specific design patterns (e.g., Factory, Singleton, Observer, Middleware) or architectural choices being used here.
- The "Landmines": Point out the most complex, brittle, or highly-coupled parts of this code that I need to modify with extreme caution.

Ask me to provide the codebase text or directory structure to get started.
```

## The four sections

| Section | What it gives you |
|---|---|
| 10,000-Foot View | The module's role in the system — so changes don't break things elsewhere |
| Data Flow & Lifecycle | Where data enters, transforms, and exits — the thread through the code |
| Structural Patterns | The architectural decisions and conventions you need to follow |
| Landmines | The specific places not to touch without understanding consequences |

## What to paste

**Directory tree:** Shows structure and module boundaries — good for high-level orientation.

**Core file or entry point:** Shows actual patterns and data flow — better for understanding how the code actually works.

**Both:** Best — structure first, then the key file.

You can also paste multiple files and ask the model to trace a specific data path or user action through all of them.

## 🔁 Leftover Remixes

**🌶️ Spicy:** *"Now that you've explained it, what changes would you make to improve the architecture — and in what order would you make them to minimize risk?"*

**🧊 Mild:** *"Just tell me the landmines. I understand the architecture — I need to know what not to break."*

**💰 Budget:** *"Explain this function in plain English: [paste function]. What does it do, what does it expect, and what breaks if I change it?"*
