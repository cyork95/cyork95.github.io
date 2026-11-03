Here's the honest version of how AI memory works: a fresh chat usually remembers nothing about you. Some tools do keep notes about you between sessions, but even then, you can't see exactly what's stored unless you go looking — and neither can the model, quite the way you'd hope.

People make two opposite mistakes with this. The first: opening a new chat and saying "continue where we left off," as if the model has been thinking about your project all week. It hasn't. It will answer with confidence anyway, building on a blank slate — or worse, on a guess about what your project might be. The second: assuming the model forgot everything, when the tool does keep notes, and handing it something you'd rather it never stored.

Carrying context between sessions is your job, and there are three honest ways to do it:

The recap block. Start a new session by pasting a short summary of where things stand — decisions made, open questions, current state. It's a pantry block (Lesson 3) for an ongoing project, and it's the most reliable method there is, because you can see exactly what the model sees.

The handoff note. At the end of a long session, ask the model to write a status note for you: decisions, open questions, next steps. Then read it before you reuse it — a handoff note is a colleague's notes, and colleagues get things wrong. Correct it, then it becomes your recap block for next time.

Tool memory, verified. If your tool has a memory feature, check what it actually stored — most tools have a way to view it. Correct what's wrong, delete what you don't want kept, and know where the off switch is. Don't put secrets into a memory you haven't checked. And never accept "yes, I remember" as evidence: the model will claim to remember things it plainly doesn't. Evidence is using the facts correctly, not claiming them.

### Before / after

❌ Trusting the blank slate

Continue where we left off on the migration plan.

The model cheerfully "continues" — inventing a plan that sounds like yours, with dates and vendors you never chose. You spend the next ten minutes untangling what it made up from what you actually decided, if you notice at all.

✅ Carrying the note

[Handoff note — migration plan] Decisions: vendor is Northwind (final); go-live is May 19 (moved from March); schema change landed Tuesday. Open: warehouse credentials, owner Priya. Next: finish backfill job review.
>
Using only this note, repeat back the three decisions, then help me draft the backfill review request.

The recap goes in first, and the first thing asked is a check: repeat the decisions back. If the model can't, the note — not the model — is what needs fixing, and you find out before any real work starts.

### Try it

End your next long chat by asking for a ten-line handoff note: decisions, open questions, next steps. Next time you open a fresh chat, paste it first and ask the model to repeat the three most important facts back before you continue.

That little test is the whole lesson: context you can verify beats memory you're told to trust.

That's the track. Ingredients on the counter, examples instead of adjectives, a stocked pantry, the clutter cleared, a budget spent where it counts, and a note carried honestly between sessions. The summary still lives at Kitchen Prep — and the Recipe Book is where it all becomes practice. Now go cook something.
