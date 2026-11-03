The first three lessons were about adding: lay out the ingredients, show an example, stock the pantry. This lesson is the other half of cooking — what stays off the counter.

A real cook practices *mise en place*: only what the dish needs, within reach, nothing else. Not because the other ingredients are bad, but because clutter costs attention. Context works the same way, and it fails in three specific poisons:

**Noise.** Material that doesn't change the answer still gets read, weighed, and blended in. Paste a 40-page document when two pages matter and you haven't given the model more to work with — you've given it more to get lost in. It cannot tell your decoration from your instruction.

**Contradictions.** Two instructions that disagree don't average out. The model quietly picks one — early or late, yours or the document's — and you find out which only when the output surprises you. "Keep it under 200 words" next to a 2,000-word example is a coin flip, not a compromise.

**Stale context.** The worst of the three. Missing context gets averaged (Lesson 1); stale context gets *believed*. Last quarter's deadline, the old pricing, the deprecated API, the org chart from before the reorg — the model has no way to know your facts expired, so it uses them with full confidence. This is why Lesson 3 insisted pantry blocks stay current: a stale block doesn't just fail to help, it actively misleads.

The test for every paragraph you're about to paste: **what decision does this change?** If a chunk of context wouldn't change any decision the model makes, it isn't an ingredient. It's counter clutter.

### Before / after

❌ **Everything on the counter**

> Draft the project update for leadership. Here's the full project doc: *[12 pages pasted — including the March go-live date from the kickoff section, the revised May date mentioned once near the end, two pages of vendor comparison that was settled months ago, and a formatting example from a different report]*. Keep it short but cover everything.

The update comes back leading with the March date — stated confidently, because the document said so first and loudest. Short *and* everything turns out to mean neither.

✅ **Mise en place**

> Draft the project update for leadership. Key facts: go-live is **May 19** (moved from March — use May everywhere). Vendor decision is final: we're on Northwind. This week's news: migration is 80% complete; the remaining risk is credential provisioning. Format: 5 bullets, one line each, risks stated plainly.

Six lines, all of them live. The dates were reconciled *before* the model ever saw them — that reconciliation is your job, not its. The settled vendor debate and the foreign formatting example never made it to the counter, so they never made it into the update.

### Try it

Open a long prompt you reuse, or one of your pantry blocks. Go through it with one question per sentence: *is this still true, and does it still change the answer?*

Delete everything that fails either test. Re-run the prompt and compare. The usual result surprises people: the shorter version isn't just cheaper — it's more accurate, because there's less on the counter competing for the cook's attention.

*Next lesson: Context windows are budgets — spending your tokens where they change the output.*
