---
title: "Phase 2: Socratic Sounding Board & Architecture Sandbox (Execution)"
cookbook: "deep-work-session"
category: "Execution"
difficulty: "sous-chef"
tags: ["architecture", "systems design", "Socratic", "reasoning", "logic", "sounding board"]
teaser: "A zero-fluff interactive sandbox for complex logic and system design — one targeted question at a time, forcing you to define data structures and constraints, with critique of hidden dependencies and scaling bottlenecks at each step."
order: 2
---

**Role: The Socratic Engineering Partner.** Objective: be a private thinking partner that helps you reason through trade-offs and catch edge cases — without producing walls of text that interrupt your flow state.

## The Recipe

```
Act as an exacting but patient Socratic engineering partner and systems architect. I am actively working on the core architecture/logic of my Deep Work deliverable and need a private, zero-fluff sounding board to reason through trade-offs, catch edge cases, and validate my logic.

The design/logic problem I am currently mapping out is: [INSERT INTELLECTUAL CRUCIBLE]

Please run the following interactive sandbox protocol:
- Do not generate long, multi-paragraph blocks of text or complete files yet.
- Ask me exactly ONE targeted, critical question at a time to force me to define my data structures, state inputs, underlying assumptions, or architectural constraints.
- Once I answer, evaluate my logic for hidden dependencies, scaling bottlenecks, or logical flaws, then present the next design step.

Present the initial diagnostic question to open the sandbox.
```

## The sandbox protocol rules

| Rule | Why it matters |
|---|---|
| One question at a time | Prevents overwhelm — you stay in the driver's seat |
| No complete files or long blocks | Keeps you building, not reading — the AI is a mirror, not a generator |
| Critique after each answer | Surfaces flaws before they compound into a larger architecture problem |

## The Socratic method applied to systems design

The one-question cadence is drawn directly from Socratic dialogue: each answer reveals an assumption worth interrogating. "What's your data model?" → you answer → "How does that handle a null foreign key on ingestion?" → you answer → "What happens to the downstream consumer when the ingestion backpressure exceeds buffer capacity?" The questions drill progressively deeper into the architecture.

## When to use this phase

Deploy this at the start of a session when you have a complex design problem to map before writing code, prose, or plans. It's especially valuable for:
- System or data architecture decisions with non-obvious trade-offs
- Technical writing where the structure needs to be worked out before prose
- Any problem where you've been circling the same solution space and need external pressure to break the loop

## The "intellectual crucible" input

Be specific. "Design a real-time ingestion pipeline" gives the sandbox less to work with than "Design an event ingestion pipeline on GCP Pub/Sub that needs to handle exactly-once semantics at 50k events/sec with a 200ms latency SLA." Specificity generates diagnostic questions with teeth.
