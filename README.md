# York Develops

Personal portfolio and hub site for Cody York — Cloud Data Engineer.

Live at **[yorkdevelops.com](https://yorkdevelops.com)**

---

## Stack

Pure HTML/CSS/JS. No frameworks, no build tools, no npm. Zero dependencies — open any file in a browser or deploy directly to GitHub Pages.

- **Fonts**: Google Fonts (Space Grotesk, Inter, JetBrains Mono) — loaded via CDN
- **Icons**: Inline SVG and Unicode — no icon libraries
- **Analytics**: None. No tracking, no cookies.

---

## Structure

```
/
├── index.html              # Home
├── about/index.html        # About
├── work/index.html         # Work & Skills
├── projects/index.html     # Projects
├── prompt-kitchen/         # The Prompt Kitchen bridge page
│   └── index.html
├── contact/index.html      # Contact
├── css/style.css           # Full design system
├── js/main.js              # Theme toggle, mobile nav, smooth scroll
├── CNAME                   # yorkdevelops.com (GitHub Pages custom domain)
├── sitemap.xml
├── robots.txt
└── README.md
```

---

## Local development

No build step required. Serve the root directory with any static file server:

```bash
# Python 3
python -m http.server 8000

# Node (npx)
npx serve .

# VS Code
# Use the Live Server extension — right-click index.html → Open with Live Server
```

Then open `http://localhost:8000`.

> **Note:** Opening `index.html` directly as a `file://` URL works for most things, but root-relative paths (`/css/style.css`) won't resolve correctly without a server. Use one of the options above.

---

## Deployment (GitHub Pages)

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set source to `main` branch, root folder
4. Add custom domain: `yorkdevelops.com`
5. Enable **Enforce HTTPS**

The `CNAME` file is already included — GitHub Pages picks it up automatically.

### DNS configuration

At your DNS provider, add:

| Type  | Name | Value                   |
|-------|------|-------------------------|
| A     | @    | 185.199.108.153         |
| A     | @    | 185.199.109.153         |
| A     | @    | 185.199.110.153         |
| A     | @    | 185.199.111.153         |
| CNAME | www  | cyork95.github.io |

---

## Customization

Before deploying, replace these placeholders across all files:

| Placeholder          | Replace with                        |
|----------------------|-------------------------------------|
| `Cody York`        | Your actual name                    |
| `cyork95`  | Your GitHub handle                  |
| `coyofroyo@yorkdevelops.com`     | Your Proton Mail address            |
| `https://www.linkedin.com/in/cody-york-data-engineer/`     | Your LinkedIn profile URL           |

Quick find-and-replace in VS Code: `Ctrl+Shift+H` (Windows) or `Cmd+Shift+H` (Mac).

---

## Features

- **Dark/light mode** — toggles via button, persists in `localStorage`, respects `prefers-color-scheme` on first visit
- **Mobile nav** — hamburger menu with smooth open/close, closes on link click or outside click
- **Smooth scroll** — anchor links scroll smoothly with nav offset
- **Scroll reveal** — elements with `data-reveal` fade in as they enter the viewport
- **Copy buttons** — any element with `data-copy="text"` copies text to clipboard on click
- **No FOUC** — theme applied immediately before DOM ready to prevent flash of wrong theme

---

## Sister site

**[The Prompt Kitchen](https://thepromptkitchen.fyi)** — a free AI knowledge base for everyday people. Separate site, separate repo.

---

## License

Content is personal and not licensed for reuse. Code structure is fair game — if the CSS or JS is useful to you, take it.
