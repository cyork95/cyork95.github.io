---
title: "Cook From What You've Got"
category: "Creativity"
difficulty: "home-cook"
tags: ["cooking", "recipes", "food", "image-analysis", "multimodal"]
teaser: "Point AI at your fridge or pantry and get a real recipe. Works with a photo, a list, or just whatever you can remember is in there."
bestFor: "Reducing food waste, quick meal planning, using up random ingredients before they go bad"
whenToUse: "When you have ingredients but no idea what to make with them"
featured: false
---

This is one of the most immediately practical things you can do with AI. You've got stuff. You don't know what to make. AI does. Works three ways: describe what you have, paste a list, or upload a photo of your fridge.

## The Recipe (text version)

```
I have the following ingredients and I want to make something for [meal / number of people]:

[List your ingredients — be honest about quantities if it matters]

Dietary constraints: [none / vegetarian / gluten-free / etc.]
Skill level: [beginner / intermediate / I can handle anything]
Time available: [15 mins / 30 mins / an hour]

Give me one creative recipe I can actually make right now with step-by-step instructions. 
Highlight any substitutions I can make if I'm missing something minor.
```

## The Recipe (photo version)

If you're using a multimodal model (ChatGPT-4o, Claude, Gemini):

```
[Attach a photo of your fridge, pantry, or ingredient spread]

Based on the ingredients you can see in this image, suggest a creative recipe 
with step-by-step instructions. Be adventurous — I want something I wouldn't 
have thought of myself. Call out anything I might be missing that would 
significantly improve the dish.
```

## Two-step chain for better results

For more interesting results, run it as a quick chain:

**Step 1 — Generate options:**
```
Here are my ingredients: [list]. Give me 3 completely different recipe ideas 
(not just variations of the same thing) I could make with these. One word + 
one sentence each. I'll pick one.
```

**Step 2 — Build the winner:**
```
Let's go with [option you chose]. Give me a full recipe with:
- Exact quantities
- Step-by-step method in order
- One tip that makes the difference between okay and great
- What I could add next time if I had it
```

## 🔁 Leftover Remixes

**🌶️ Spicy:** *"I have [weird combination of ingredients]. What's the most interesting thing I could make? Don't play it safe."*

**🧊 Mild:** *"I have [ingredients]. I don't want to cook much. What's the laziest good meal I can make in under 15 minutes?"*

**💰 Budget:** *"Based on these ingredients, what's missing that would unlock 3 or 4 totally different meals? Keep it to basics I can grab cheaply."*

---
*Prompt concept via [Ryan Morrison / Tom's Guide](https://www.tomsguide.com/ai/google-gemini/7-prompts-to-get-started-with-google-gemini-this-weekend). Adapted and expanded for The Prompt Kitchen.*
