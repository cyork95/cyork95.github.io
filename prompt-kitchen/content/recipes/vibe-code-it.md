---
title: "Vibe Code It"
category: "Coding"
difficulty: "sous-chef"
tags: ["coding", "vibe-coding", "apps", "no-code", "tools", "automation"]
teaser: "Build a working app, tool, or script by describing what you want in plain English — no programming knowledge required."
bestFor: "Simple web apps, personal tools, data trackers, calculators, automations, scripts, dashboards"
whenToUse: "When you want something built but don't know how to code — or when you do know how to code and want a fast first draft"
featured: false
---

Vibe coding is the art of building software by describing what you want in plain language and iterating with the AI until it works. You don't need to understand the code — you just need to be clear about what the thing should do. This recipe works best with ChatGPT (Canvas), Claude (Artifacts), or Gemini (Canvas).

## The Recipe

```
Build me [describe what you want in plain English].

What it needs to do:
1. [Core function 1]
2. [Core function 2]
3. [Any other requirements]

User interface: [describe how it should look and behave — e.g. "simple, 
one-page app", "mobile-friendly", "dark mode"]

Output: [what format — e.g. "a single HTML file I can open in a browser", 
"a Python script", "a Google Apps Script"]

Keep it simple. I'd rather have something that works than something complex 
that doesn't. Build the minimum version first.
```

## Example prompts that work well

**Personal tracker:**
```
Build a simple daily water intake tracker as a single HTML file.
It should have a button to log a glass of water, show today's total, 
and have a progress bar toward a goal of 8 glasses. 
Save progress using localStorage so it persists between sessions.
```

**Calculation tool:**
```
Build a freelance rate calculator in HTML/CSS/JS.
Inputs: target annual income, weeks vacation, hours per week, overhead percentage.
Output: minimum hourly rate, daily rate, and a recommended rate with 20% buffer.
Make it clean and simple. Single page, no frameworks.
```

**Text processing script:**
```
Write a Python script that reads a CSV file, removes duplicate rows, 
sorts by the second column alphabetically, and saves the result as a new CSV.
Add comments explaining each step. I'll run it from the command line.
```

## Iterating once you have a first draft

Vibe coding works best as a conversation. Once you have a first version:

```
This works but I want to change a few things:
1. [Specific change 1]
2. [Specific change 2]
Keep everything else the same.
```

Or if something broke:
```
When I [do X], it [does Y instead of Z]. 
Fix only that — don't change anything else.
```

## Tips

**Start minimal** — ask for the smallest working version first, then add features one at a time. Trying to spec everything upfront leads to complicated code that breaks in hard-to-debug ways.

**Describe behavior, not implementation** — "When I click the button, the counter goes up by 1" is better than "use an onclick event listener to increment a variable." You don't need to know how; just describe what.

**Test as you go** — run or open the output after each change, not after 10 iterations. Bugs compound.

## 🔁 Leftover Remixes

**🌶️ Spicy:** *"Now add [feature]. Before you code it, tell me the two simplest ways to implement it and which one you'd recommend and why."*

**🧊 Mild:** *"Explain what this code does in plain English, section by section. Assume I might want to maintain it myself."*

**💰 Budget:** *"This is more complex than I need. Simplify it — remove any features that aren't essential to the core function."*

---
*Prompt concept via [Amanda Caswell / Tom's Guide](https://www.tomsguide.com/ai/i-had-10-000-unread-emails-here-is-the-exact-gemini-3-5-flash-prompt-i-used-to-clear-them-in-5-minutes). Adapted and expanded for The Prompt Kitchen.*
