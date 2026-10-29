---
title: "Maximum [X] Words"
shelf: "constraint"
whenToUse: "When AI tends to over-produce or you need a tight output"
combineWith: ["format-table", "constraints-guardrails"]
order: 5
---

Add this constraint to any prompt where length matters.

```
Maximum [X] words. [Or: "Keep this to [X] sentences / bullet points / paragraphs"]
```

**Why it works:** Without length constraints, AI will often produce comprehensive answers when you need a crisp one. A word limit forces prioritization.

**Common length targets:**
- Tweet: 280 characters
- Email subject line: 6–9 words
- Quick summary: 50–100 words
- Executive summary: 150–200 words
- Standard summary: 300–500 words
