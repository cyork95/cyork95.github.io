---
title: "Onboard Me to This Codebase"
category: "Coding"
difficulty: "home-cook"
tags: ["coding assistants", "codebase", "onboarding", "documentation"]
teaser: "Point your coding assistant at an unfamiliar repo and get a real orientation — architecture map, entry points, conventions, and the files you shouldn't touch casually."
bestFor: "Developers joining a project, inheriting a codebase, or returning to an old one"
whenToUse: "On day one with any codebase you didn't write — or wrote long enough ago that it counts"
featured: false
---

The first hours in a new codebase are usually spent spelunking — opening files at random and building a mental map the slow way. A coding assistant with access to the repo can draft that map in minutes, *if* you ask for the right artifacts and force it to cite evidence instead of vibes. Run this inside your coding assistant, in the project root.

## The Recipe

```
I'm new to this codebase. Before I change anything, onboard me:

1. Architecture map — the main components, what each one owns, and how data flows between them. One screen, no more.
2. Entry points — where execution starts, and the 5 files a newcomer will touch most often.
3. Conventions — how this project names things, structures tests, and handles errors and configuration. Give one real example of each, from the actual code.
4. Danger zones — files or areas where changes are risky, irreversible, or widely depended on. Say why each one made the list.
5. Glossary — project-specific terms and abbreviations, defined by how the code actually uses them.

Rules: base every claim on files you actually read, and name the file behind each section. Where you can't find evidence, write "not found" — do not fill gaps with plausible guesses.
```

## Example — The follow-up that does the real work

Once the map exists, interrogate it: *"Trace one request end-to-end: a user clicking [the main action] through to the database and back. Name every file it passes through."* A map tells you where things live; a traced request tells you how the system actually behaves — and it exposes any part of the map the assistant invented.

## Tips for better results

- The "not found" rule is the whole recipe. An assistant that must confess gaps gives you a map you can trust; one allowed to guess gives you fan fiction with file names.
- Run it before your first ticket, not during. The danger-zones list is only useful if you read it before you're editing at 4pm.
- Re-run after major refactors and save the output in the repo — the next newcomer's onboarding is then free.
- If the repo is huge, scope it: *"…for the billing subsystem only"* beats a shallow pass over everything.

## 🔁 Leftover Remixes

**🌶️ Spicy:** *"Now quiz me: 5 questions that test whether I understood the danger zones and the request flow. Don't soften them."*

**🧊 Mild:** Just the map: *"One screen: what are the main components of this codebase, what does each own, and how does data flow between them? Cite files."*

**💰 Budget:** Pair it with a human: take the assistant's architecture map to the teammate who's been here longest and ask them to mark what it got wrong. Their corrections are the real documentation.
