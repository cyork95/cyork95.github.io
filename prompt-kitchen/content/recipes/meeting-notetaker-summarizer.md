---
title: "AI Meeting Notetaker & Summarizer"
category: "Productivity"
difficulty: "home-cook"
tags: ["meetings", "notes", "summarization", "productivity", "team", "communication"]
teaser: "Paste a raw transcript and get a 4-part structured archive: 3-sentence Executive Summary, Strategic Decision Matrix (decision + rationale + dissent), Action Item Tracker (owner + deadline + dependency), and an Undercurrents Note surfacing the tensions nobody named."
bestFor: "Any meeting whose output needs to be archived, acted on, or shared with stakeholders"
whenToUse: "Immediately after a meeting — while context is fresh but before you've lost track of what was decided"
featured: false
---

**A raw transcript is not a record — it's a transcript.** The value is in the decisions made, the tasks assigned, and the tensions that didn't get resolved. This recipe extracts all four layers from any meeting, however chaotic the source material.

## The Recipe

```
Act as an elite Executive Assistant and Chief of Staff. I am going to paste a raw, chaotic, and disorganized meeting transcript. I need you to parse the text, separate the signal from the noise, and synthesize it into a clean, professional corporate archive.

Please ask me to paste the transcript text. Once I do, process it into a highly scannable document structured exactly as follows:
- Executive Summary: A crisp, 3-sentence narrative overview of the meeting's primary objective and overall outcome.
- Strategic Decision Matrix: A markdown table listing the major decisions made, the core rationale behind them, and any dissenting viewpoints raised.
- Action Item Tracker: A bulleted list of explicit tasks. Each task must have a clear Owner, a definitive Deadline (if mentioned), and a prerequisite dependency.
- The "Undercurrents" Note: A short section highlighting unvoiced tensions, recurring bottlenecks, or hidden assumptions that need to be addressed before the next meeting.

Give me the instructions on how to submit my transcript.
```

## The four output sections

| Section | What it captures |
|---|---|
| Executive Summary | The 3-sentence version anyone can read in 15 seconds — objective, outcome, and what comes next |
| Strategic Decision Matrix | Every major decision with the reason it was made and any dissent that was raised |
| Action Item Tracker | Tasks with owners, deadlines, and dependencies — not vague follow-ups |
| Undercurrents Note | The tensions, assumptions, and bottlenecks that were *implied* but never directly addressed |

## The Undercurrents section — the one most tools skip

AI meeting summarizers produce excellent action items and decision logs. What they don't usually produce is the subtext layer: *the budget question nobody wanted to raise directly*, *the implicit disagreement between two teams that keeps surfacing as process complaints*, *the assumption the whole plan rests on that nobody has verified*. The Undercurrents section specifically names these — they're often the most important thing to address before the next meeting.

## Action Item Tracker — three required fields

Most meeting summaries produce bullet points like "Follow up on X." This format requires three fields:
- **Owner** — a specific named person, not "the team"
- **Deadline** — a specific date, or explicit that none was stated
- **Prerequisite dependency** — what has to happen first before this task can begin

An action item without an owner is a wish, not a task.

## 🔁 Leftover Remixes

**🌶️ Spicy:** *"After the archive, give me a draft follow-up email I can send to all attendees summarizing the decisions, action items, and next meeting agenda."*

**🧊 Mild:** *"Skip the full archive. Just give me the Action Item Tracker and the Undercurrents Note."*
