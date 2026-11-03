Every AI tool has a context window: a finite amount of space, measured in **tokens** (roughly three-quarters of a word each), that holds everything the model can see at once. Your prompt goes in there. So does every document you paste, the entire conversation so far, and everything the model has already said back. One counter, shared by all of it.

Windows vary by tool — tens of thousands of tokens on the small end, over a million on the large end — but the budgeting habit matters at every size, for two reasons:

**Space spent is attention spent.** A window crammed with material doesn't just cost tokens; it dilutes. The model reads the beginning of a long context and the most recent exchange most reliably — the deep middle is where instructions go to be forgotten. Fill the counter with raw dumps and your one critical constraint ends up buried in the exact spot least likely to be honoured.

**Full isn't free.** On many tools, longer contexts mean slower, pricier responses. Even where you never see a bill, you pay in the only currency that matters here: answer quality.

So budget like it matters, because it does:

- **Spend where it changes decisions.** Lesson 4's test is the budget rule: if a chunk wouldn't change what the model decides, it doesn't earn its tokens.
- **Summaries beat dumps.** A 200-word brief *you* distilled carries your judgment about what matters. Twelve raw pages carry everything, including the parts that contradict it.
- **Put the crown jewels at the edges.** The instruction you absolutely cannot lose goes at the start or restated in one line at the very end — not in paragraph nine.
- **Know when to start a fresh tab.** A conversation that has dragged its whole history through twenty turns is spending most of its window re-reading itself. Restarting with a tight summary is often cheaper *and* better. (That's Lesson 6.)

### Before / after

❌ **The whole pantry, dumped**

> Why is my job failing? Here's the full log *[3,000 lines pasted]* and the whole script *[800 lines pasted]*.

Somewhere in the middle of those 3,000 lines is the actual error. The model skims the same swamp you'd skim, lands on a plausible-sounding warning from line 400, and sends you debugging the wrong thing with great confidence.

✅ **A budgeted spend**

> A Spark job fails at the write step. Exact error: *[the 12-line traceback]*. Environment: Spark 3.5, writing Parquet to S3. Reads succeed; the failure started after Tuesday's schema change. Here's the write function: *[40 lines]*. What's the likely cause?

Count the spend: the error itself, the environment, the one recent change, the relevant code — and nothing else. Every token is aimed at the decision the model has to make, so the answer is too.

### Try it

Take your longest recent prompt and estimate its size — word count × 1.3 is close enough for tokens. Now cut a third of it using Lesson 4's test, and move your single most important instruction to the very end, restated in one plain line.

Re-run it. Most people find the trimmed, re-aimed version doesn't just match the original — it beats it. That's the budget lesson in one experiment: the window was never the limit. The spending was.

*Next lesson: Memory across sessions — carrying context between chats and tools, honestly.*
