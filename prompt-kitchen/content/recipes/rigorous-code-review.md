---
title: "Code Review That Actually Helps"
category: "Coding"
difficulty: "home-cook"
tags: ["code review", "software engineering", "refactoring", "security", "performance", "pull request"]
teaser: "Four review lenses — readability, performance, security, and idiomatic refactoring — with a before/after comparison that shows exactly how an expert would improve it."
bestFor: "Pre-PR self-review, getting a second opinion on complex logic, learning better patterns from your own code"
whenToUse: "Before you open a pull request, or whenever you want a level-up review rather than just an LGTM"
featured: false
---

Most AI code review says "looks good" or offers surface-level style comments. This recipe runs your code through four distinct lenses that surface the issues that actually matter in production — and shows you the improved version, not just the problem.

## The Recipe

```
Act as an empathetic but incredibly thorough Senior Peer Reviewer. I want you to perform a rigorous code review on a Pull Request I'm preparing. Do not just say "Looks good to me (LGTM)." I want constructive feedback that levels up my coding standards.

Here is the code I want you to review:
[INSERT CODE HERE]

Please evaluate my code through these 4 lenses and provide specific lines/blocks that can be improved:
1. Readability & Maintainability: Are there cognitive complexities, magic numbers, or poorly named variables that will confuse future maintainers?
2. Performance & Efficiency: Are there hidden performance bottlenecks (e.g., O(n²) loops, redundant database queries, inefficient memory allocation)?
3. Security & Robustness: Are there unvalidated inputs, potential race conditions, or unhandled exceptions?
4. Idiomatic Refactoring: Show me a "Before vs. After" comparison of how a true expert would refactor a specific section of this code to be cleaner or more idiomatic.
```

## The four lenses

| Lens | What it catches | Example issue |
|---|---|---|
| Readability | Magic numbers, unclear names, nested complexity | `if x > 86400` → `if seconds > SECONDS_PER_DAY` |
| Performance | Algorithmic inefficiency, N+1 queries, unnecessary work | Loop inside a loop over large datasets |
| Security | Unvalidated input, SQL injection risk, exposed secrets | `query = "SELECT * WHERE id=" + user_input` |
| Idiomatic refactoring | Patterns that work but aren't how experts write the language | Manual list building vs. list comprehension |

## The before/after is where the learning happens

The refactoring section doesn't just say "this could be cleaner" — it shows you the expert version side by side so you can see exactly what changed and why. This is the most useful part for skill development.

## What to paste

Paste the actual code — not a description of it. The more complete the context (imports, related functions, how it's called), the more useful the security and performance analysis.

*Note: if you already have a `code-review-partner` recipe on the site, this one goes deeper — four explicit lenses plus before/after instead of general commentary.*

## 🔁 Leftover Remixes

**🌶️ Spicy:** *"Now apply the security lens only, assuming this code is exposed to untrusted user input in a production web app. What's the worst-case attack surface?"*

**🧊 Mild:** *"Just do the idiomatic refactoring section — show me the before and after for the messiest part of this code."*

**💰 Budget:** *"What's the single highest-priority fix in this code — the one a senior engineer would make first?"*
