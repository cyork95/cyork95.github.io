---
title: "Team Retrospective Facilitator"
cookbook: "engineering-manager-os"
category: "Process"
difficulty: "home-cook"
tags: ["retrospective", "agile", "scrum", "process improvement", "team", "velocity"]
teaser: "A structured Retrospective Roadmap: a 2-minute sentiment warm-up, Tri-Lens questions across velocity accelerators / breakdowns / immediate changes, and a markdown Continuous Improvement Tracker with owners and verification loops."
order: 5
---

**Role: The Agile Team Coach.** Objective: run a retro that produces one concrete, owned operational change — not a list of problems everyone forgets by Monday.

## The Recipe

```
Act as an expert Scrum Master and agile team coach. I want to facilitate an internal Team Retrospective at the close of our recent project sprint to evaluate our engineering processes, unearth hidden bottlenecks, and continuously optimize our velocity.

Our recent sprint topic/project was: [INSERT SPRINT BRIEF]

Please generate a comprehensive, highly interactive "Retrospective Roadmap" structured into these clean phases:
- The Visual Warm-up: A quick, low-friction, 2-minute prompt to gather the team's high-level sentiment (e.g., "On a scale of 1-5, rate our current technical debt friction").
- The Standard Tri-Lens Prompt: Provide distinct, thought-provoking questions to extract bullet points across three specific buckets:
  1. What accelerated our velocity? (What tooling, documentation, or habits worked beautifully?)
  2. Where did we break down? (What unexpected blockers, manual tasks, or communication gaps paralyzed our speed?)
  3. What must we change immediately? (What is one concrete, single-responsibility operational shift we will commit to next sprint?)
- The Continuous Improvement Tracker: A clean markdown template to archive the top action items, including explicit owners and target verification loops.
```

## The three retrospective phases

| Phase | Duration | Output |
|---|---|---|
| Visual Warm-up | 2 minutes | Team sentiment signal — surfaces tension before the formal discussion |
| Tri-Lens Prompts | 20–25 minutes | Structured observations across what worked, what broke, and what changes |
| Continuous Improvement Tracker | 5 minutes | One owned action item per theme, with a verification date |

## The Tri-Lens structure — why three buckets specifically

Most retrospectives collapse into a "complaints session" without structure. The three-lens format separates what's working (which needs reinforcement, not just discussion) from what broke (which needs diagnosis) from what changes (which needs ownership). Without the "what worked" lens, teams gradually erode practices that were quietly functioning well.

## "What must we change immediately" — the single-responsibility rule

The most common retro failure is producing five action items with no owner and forgetting all of them by the next sprint. The format specifically constrains the third lens to one operational shift per theme, assigned to a named owner with a verification date. "We will add a pre-merge linting step" owned by no one is theater. "Cody will configure the CI linting gate before the next sprint start (verified at standup on Monday)" is an operational change.

## The Continuous Improvement Tracker markdown template

```markdown
## Sprint Retro — [Date]

### What Accelerated Velocity
- [observation] — reinforce by: [specific habit or tooling to preserve]

### What Broke Down
- [bottleneck] — root cause: [one-sentence diagnosis]

### Committed Change
- **Action:** [specific operational shift]
- **Owner:** [name]
- **Verified by:** [date / standup / PR review]
```
