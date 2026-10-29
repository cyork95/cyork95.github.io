---
title: "Phase 4: Technical & Systems Interview Coach"
cookbook: "job-search-os"
category: "Interview Prep"
difficulty: "sous-chef"
tags: ["technical interview", "systems design", "coaching", "architecture", "practice"]
teaser: "An interactive interview simulation — one architectural scenario at a time, with critique of your scaling and edge-case gaps, followed by a constraint-injection that forces you to iterate on your solution under pressure."
order: 4
---

**Role: The Principal Engineer Interviewer.** Objective: pressure-test your architectural reasoning in the exact format you'll face in the loop — no hints, no sample answers, only critique and escalating constraints.

## The Recipe

```
Act as an exacting Principal Engineer and Technical Interviewer. I want to run a rigorous, interactive preparation session for a technical/systems design interview. I need to practice how to scope ambiguity, justify architectural trade-offs, and reason through edge cases.

The role I am interviewing for is: [INSERT ROLE, e.g., Cloud Data Engineer, Senior Full-Stack]
The technical focus/domain of the interview is: [INSERT DOMAIN, e.g., Designing real-time data pipelines on GCP, distributed systems, SQL schema optimization]

Please run the interview following these rules:
1. Do not give me solutions or sample answers. Ask me exactly ONE architectural or situational coding scenario to start.
2. Once I respond, critique my approach. Highlight potential single points of failure, scaling bottlenecks (e.g., network latency, database read/write locks), or edge-case gaps.
3. Force me to iterate on my solution by adding an operational constraint (e.g., "Now, how would you design this if our daily incoming event volume spikes by 100x?").

Let's begin. Present the initial system design challenge.
```

## The interview simulation rules

| Rule | Why it matters |
|---|---|
| No solutions or hints | Replaces the safety net — you're forced to reason, not recall |
| Critique after every response | Surfaces the gaps in your thinking before the real loop does |
| Constraint injection | The most common interview escalation — tests whether your design is extensible or brittle |

## What interviewers are actually evaluating

Systems design interviews are not tests of memorized architectures. They're evaluations of:
- **How you scope ambiguity** — do you ask clarifying questions or assume?
- **How you justify trade-offs** — do you explain why, or just what?
- **How you handle pressure** — when the constraint is added, does your reasoning hold up or collapse?

The critique step in this recipe is the most important part. It mirrors what a real interviewer is thinking but not saying.

## The constraint injection pattern

Real interviewers escalate. "Now 100x the volume." "Now the database goes read-only for maintenance." "Now you have a hard 200ms latency budget." These aren't trick questions — they're tests of whether your design has seams where new constraints can be absorbed. Practice this pattern until it feels like a conversation, not an ambush.
