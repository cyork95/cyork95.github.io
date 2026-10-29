---
title: "Code Review Partner"
category: "Coding"
difficulty: "sous-chef"
tags: ["coding", "code-review", "technical", "software"]
teaser: "Get a thorough code review that covers correctness, edge cases, security, and readability — not just style."
bestFor: "Any code before it ships, solo projects without a reviewer"
whenToUse: "Before merging or deploying code"
featured: false
---

Working solo means no one reviews your code before it goes out. This recipe fills that gap — give AI your code and specific context, and get the kind of feedback a senior developer would give in a thorough review.

## The Recipe

```
Please review this code as a senior [language] developer with a strong focus on [your priorities — e.g., security, performance, readability, maintainability].

Context:
- What this code does: [brief description]
- Where it runs: [production / prototype / internal tool / etc.]
- My experience level: [approximate]
- Languages/frameworks: [relevant stack]

Code:
[paste your code]

Review it for:
1. Correctness — will this actually do what I think it does?
2. Edge cases — what inputs or states could break it?
3. [Your priority — e.g., security vulnerabilities / performance / readability]
4. Anything I'll regret in 6 months

Be specific. For each issue, tell me the line or section and exactly what to change.
```

## Example priorities for the review

| Context | Priority to add |
|---|---|
| User-facing production | "Security vulnerabilities and input validation" |
| Performance-sensitive | "Inefficiencies and N+1 queries" |
| Long-term codebase | "Maintainability and what will be confusing to the next dev" |
| Prototype | "Correctness — are there any logic errors?" |

## 🔁 Leftover Remixes

**🌶️ Spicy:** *"After the review, rewrite the worst part in a way that fixes all the issues you identified."*

**🧊 Mild:** *"Just tell me the single most serious issue in this code. One thing."*

**💰 Budget:** *"Read this code and tell me: what's the most likely bug that will show up in production?"*
