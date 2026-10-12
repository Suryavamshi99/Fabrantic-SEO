# QA report: Fabrantic prototype

**Date:** 12 Oct 2026
**Before:** `fabrantic_site_merged.html` (single file, hash routes)
**After:** `site/` (seven real pages, one URL each)

## How this was tested

- **Browser:** the in-app Chromium browser pane, at 375×812 and 1440×900.
- **Page checks:** a script injected into each page measured control sizes, hidden text, head tags, overflow and duplicate IDs. For the "after" build, each page was loaded in a 375px and a 1440px iframe.
- **Menu and form:** tested with real key presses (Tab, Shift+Tab, Escape, Enter).
- **Contrast:** computed with the WCAG 2.x relative-luminance formula (`contrast.py`), against the lightest and darkest point of each background gradient, not the midpoint.
- **Copy:** compared with the rendered text of fabrantic.com (1,661 words, fetched 12 Oct 2026) by counting shared 5-word runs.
- **Lighthouse: not run.** The faster route was chosen, so there are no Lighthouse scores, before or after. See "Not verified" at the end.

## 1. The review's claims, tested

| Claim in `fabrantic_production_vs_prototype.md` | Result | Evidence |
|---|---|---|
| "Every control is 44px or larger" | **False** | Under 44px at 375px: 3–7 controls per page; at 1440px: 4–8. See table 2. |
| "No blank screens; motion never hides content" | **True, with a caveat** | No non-decorative text below 0.15 effective opacity on any page. Scroll-reveal wrappers start at opacity 0.35, not 0, and are only applied by JavaScript. The only text below 0.15 is decorative and `aria-hidden` (outlined marquee and strip). |
| "Mobile navigation works" | **Partly true** | The menu lists Home, VoiceRouter, AI Co-Founder, Compare, Press and Open positions. `aria-expanded` changes, Escape closes it and focus returns to the button. **No focus trap:** after 7 Tabs, focus had left the menu ("Join the waitlist" in the page). |
| "Better waitlist forms" (Enter submits, inline errors, spinner then success) | **True, with gaps** | Enter submits. Empty and invalid emails show errors with `aria-invalid="true"`. Success appears. Gaps: errors use `role="status"` (polite), not `role="alert"`, and no "nothing is sent" note is visible before submitting. |
| "Readable step text" | **True** | The inactive demo step text is 6.7:1 or better against the lightest navy. |
| "Respects reduced motion" | **Not verified** | Confirmed only by reading the code (`prefers-reduced-motion` rules exist). It was not emulated in this browser. |
| "Content always visible / horizontal overflow" | **True** | No horizontal overflow at 375px on any page. |
| Live site: "24 of 31 controls too small" | **Measured earlier, not re-measured** | Measured on fabrantic.com in this session (visible links and buttons under 44px tall at 375px). Not repeated in this pass. |
| Live site: "blank screens when scrolling fast" | **Observed earlier, not re-measured** | Seen in this session while jump-scrolling fabrantic.com. Not repeated in this pass. |

## 2. Touch targets (controls under 44×44 CSS px)

**Effective target size:**
- For inputs inside a `<label>`, the label box counts.
- For links inside a sentence, the invisible `::after` hit area (44px tall) counts.

| Page | Before, 375px | Before, 1440px | After, 375px | After, 1440px |
|---|---|---|---|---|
| `/` | 3 of 24 | 4 of 27 | **0 of 23** | **0 of 27** |
| `/voicerouter/` | 7 of 34 | 8 of 37 | **0 of 33** | **0 of 37** |
| `/ai-co-founder/` | 3 of 24 | 4 of 27 | **0 of 23** | **0 of 27** |
| `/compare/` | 3 of 20 | 4 of 23 | **0 of 19** | **0 of 23** |
| `/compare/wispr-flow-alternative/` | 6 of 26 | 7 of 29 | **0 of 23** | **0 of 27** |
| `/compare/superwhisper-vs-wispr-flow/` | 6 of 26 | 7 of 29 | **0 of 23** | **0 of 27** |
| `/press/` | 4 of 20 | 6 of 23 | **0 of 19** | **0 of 23** |

**Controls that failed before** (width × height in px):
- "See share previews" ribbon link: 113.7 × 17.5
- "VoiceRouter is live →" pill: 184.7 × 35.9
- Footer "Press": 39.4 × 44
- Breadcrumb "FABRANTIC": 74.6 × 15; "COMPARE": 58 × 15
- "↻ Replay": 93.3 × 36
- Waitlist checkbox at 1440px: 20 × 20, with a one-line label under 44px tall
- Inline source and guide links: 18.5–23px tall. These were "pricing summary", "review", "SuperWhisper pricing", "Wispr Flow pricing", "comparisons", "Wispr Flow", "SuperWhisper" and "Learn more about VoiceRouter / AI Co-Founder".

**Fixes:**
- **Breadcrumbs, footer links, pill, Replay:** given a 44px minimum height or width.
- **Checkbox:** the label row is at least 44px tall, with padding around the 22px box.
- **Links in sentences:** class `.inl`, with an invisible 44px-tall `::after` hit area that doesn't change the layout.
- **Press page links:** now block-level `card-link` elements.
- **Ribbon link:** removed together with the share-previews page.

## 3. Hidden text before scrolling

| | Before | After |
|---|---|---|
| Non-decorative text below 0.15 effective opacity, or blurred | 0 on every page | 0 on every page |
| Decorative `aria-hidden` text below 0.15 (outlined marquee and strip) | 4–6 per page | 4–6 per page (by design) |
| Scroll-reveal wrappers (`.rv-p`) dimmed on load | Yes, at opacity 0.35 (e.g. 2 on `/`) | **None.** Reveal removed; nothing is dimmed or hidden. |

## 4. Mobile menu (375px)

| Check | Before | After |
|---|---|---|
| Lists every site section | Yes (Home, VoiceRouter, AI Co-Founder, Compare, Press, Open positions) | Yes (Home, VoiceRouter, AI Co-Founder, Compare, Press, Careers) |
| `aria-expanded` false → true → false | Yes | Yes |
| Focus moves into the menu when it opens | No | Yes (first link: "Home") |
| Focus trapped while open | **No** (left the menu after 7 Tabs) | **Yes.** After 9 Tabs focus was still inside ("AI Co-Founder"); Shift+Tab wraps to the menu button. |
| Escape closes the menu and returns focus to the button | Yes | Yes |
| Closes when a link is clicked | Yes | Yes |

## 5. Waitlist form

| Check | Before | After |
|---|---|---|
| Enter submits | Yes | Yes (real Enter key) |
| Empty email | "Enter your email address…" with `aria-invalid` | "Add your email so we know where to write." with `aria-invalid` |
| Invalid email (`bad@`) | Error shown | "Check the email address: it looks incomplete." |
| Missing consent | Error, focus moves to the checkbox | Error, focus moves to the checkbox |
| Error region | `role="status"` with `aria-live="polite"` | **`role="alert"`** |
| Success region | Same element, `role="status"` | Separate `role="status"` element |
| `aria-describedby` | Email → message | Email → error and note; consent → error. All IDs resolve. |
| "Nothing is sent" note visible before submitting | **No** | **Yes:** "Prototype: nothing is sent." |

## 6. Horizontal overflow at 375px

No overflow on any page, before or after (`scrollWidth` equals `clientWidth`). The comparison tables scroll inside their own container by design.

## 7. Head tags and SEO

| Page | Title length (before → after) | Description length (before → after) | Canonical | OG + Twitter + image | JSON-LD types (after) | H1 |
|---|---|---|---|---|---|---|
| `/` | 43 → 47 | 127 → 138 | none → ✅ | none → ✅ | Organization, WebSite | 1, unique |
| `/voicerouter/` | 57 → 57 | 130 → 143 | none → ✅ | none → ✅ | Organization, SoftwareApplication, FAQPage, BreadcrumbList | 1, unique |
| `/ai-co-founder/` | 58 → 58 | 143 → 152 | none → ✅ | none → ✅ | Organization, SoftwareApplication, FAQPage, BreadcrumbList | 1, unique |
| `/compare/` | 54 → 54 | 137 → 133 | none → ✅ | none → ✅ | Organization, BreadcrumbList | 1, unique |
| `/compare/wispr-flow-alternative/` | 56 → 56 | 131 → 135 | none → ✅ | none → ✅ | Organization, FAQPage, BreadcrumbList | 1, unique |
| `/compare/superwhisper-vs-wispr-flow/` | 53 → 53 | **114** → 139 | none → ✅ | none → ✅ | Organization, FAQPage, BreadcrumbList | 1, unique |
| `/press/` | 31 → 48 | **91** → 139 | none → ✅ | none → ✅ | Organization, BreadcrumbList | 1, unique |

**Before:**
- One URL; titles and descriptions changed only through JavaScript.
- 4 duplicate IDs in the document.
- No JSON-LD, sitemap or robots file.

**After:**
- 7 files, each at its own route, with titles under 60 characters and descriptions of 120–160 characters.
- 0 duplicate IDs per page.
- JSON-LD parses on every page.
- `sitemap.xml` lists 7 URLs, each returning **200** when served locally; `robots.txt` references the sitemap.
- All 7 `og:image` files exist and are 1200×630 PNGs.

## 8. Contrast (WCAG 2.x, worst case across each gradient)

**Before: 7 failing pairs.**

| Pair | Ratio | Needed |
|---|---|---|
| White on blue where the hero's light glow brightens it | 3.48:1 | 4.5 |
| 80% white `.dim` / `.lead` on `#2766ff` | 2.57:1 | 4.5 |
| Eyebrow and breadcrumb `#b9f1f8` on `#2766ff` | 3.84:1 | 4.5 |
| H1 accent gradient stop `#3fb4e6` on `#2766ff` (large text) | 1.47:1 | 3 |
| Hero pill arrow `#6fd8e6` | 3.31:1 | 4.5 |
| Teal `#3fc3d6` text on blue | 2.25:1 | 4.5 |
| Input placeholder | 4.20:1 | 4.5 |

**After: 0 failing pairs out of 21.**
- Reference: white on `#2766ff` is 4.74:1 and on `#1a46ff` is 6.24:1 (matches the brief).
- **Text on blue:** all text is now white.
- **Accent gradient:** now `#b4fff2` → `#b3e8ff`, at least 3.59:1 (large text).
- **Hero glows:** now only darken the background, so contrast can't fall below the 4.74:1 base.
- **Primary teal button:** dark `#06121a` text is 9.01:1 on `#3fc3d6`, 9.17:1 on `#49c4d8` and at least 9:1 on the hover colour `#6fd8e6`. It already passed before.

The brief says Lighthouse flagged the primary button. **Not reproduced:** the formula says it passes, and Lighthouse wasn't run.

## 9. Content rules

| Check | Before | After |
|---|---|---|
| 5-word runs shared with fabrantic.com | **306** | **0** |
| Third-party pricing sites cited, or "per one review" | 6 (getvoibe ×3, spokenly ×1, "per one review" ×2) | **0** |
| Share-previews page included in the build | Yes | **No** |
| Demo example | Live-site thought and destinations | Original example marked "Illustrative only" |

**Allowed exceptions** (not counted as overlap):
- the tagline "Build more. Own more."
- the brand and product names
- the AI Co-Founder diagram's feature-area labels (Investor, Memory, Blueprint, …), kept as product structure

**Competitor facts** now come only from the vendor details given in the brief (wisprflow.ai/pricing and superwhisper.com, checked 11 Oct 2026):
- **Wispr Flow:** prices marked "vary by region".
- **Google Eloquent:** marked "confirm before publishing", with no Android claim.
- **Wispr Flow offline use:** "Not stated on the pricing page we checked".
- **SuperWhisper languages:** "Not checked".

## 10. Performance (measured size only, no Lighthouse)

| | Before | After |
|---|---|---|
| HTML per page | 337,874 bytes (one file) | 51,911–60,270 bytes |
| Inline `<style>` | 268,553 bytes, including 6 base64 share-preview JPEGs and a 20 KB grain PNG | 42,116 bytes (small generated grain tile) |
| Scroll-driven animations | 7 rules using `animation-timeline: view()` | None |
| Scroll-reveal opacity | Yes (0.35 → 1) | None |
| Script | 16,095 bytes inline | One cached `/assets/site.js` (12,729 bytes), loaded with `defer` |
| Google Fonts | `preload` + `onload` swap, `display=swap`, noscript fallback | Same |

**Unknown:** whether this raises the Lighthouse performance score from 55–59 to the 99–100 our earlier build reached. That needs a Lighthouse run.

## 11. Bugs found and fixed while testing the new build

- **VoiceRouter H1 text joined its lines** ("VoiceRouterSay it once…"). Spaces added between the lines.
- **Links to `#demo`, `#table` or `#modes` from another page landed at the top**, because the site-wide smooth scrolling never finished in this browser. The page now jumps to the target instantly on load; verified at 72px from the top (just under the sticky header) on 3 pages.
- **Phone header button read only "Get".** It now reads "Early access" on phones.

## Not verified (and what would verify it)

| Item | Why it isn't verified | How to verify |
|---|---|---|
| Lighthouse accessibility and performance, before and after, every page | Not run (faster route) | `npx lighthouse <url> --form-factor=mobile` on each of the 7 URLs, or PageSpeed Insights after deploying |
| The brief's "55–59 performance" and "color-contrast on the primary button" findings | Lighthouse not run | Same as above |
| `prefers-reduced-motion` behaviour | Not emulated in this browser | Chrome DevTools → Rendering → Emulate CSS `prefers-reduced-motion: reduce` |
| Google Fonts loading and `font-display: swap` timing | Not inspected over the network | DevTools Network panel, or Lighthouse "Ensure text remains visible during webfont load" |
| Live-site touch-target and blank-screen figures | Measured earlier in the session, not repeated | Re-run `_qa/check.js` on fabrantic.com |
| JSON-LD rich-result eligibility | JSON parses, but Google's Rich Results Test wasn't run. `SoftwareApplication` has no `offers` or ratings because pricing isn't announced, so it may not qualify for rich results. | Google Rich Results Test after deploying |
| The single-file preview | It works, but holds all pages in one document, so section IDs such as `#faq` and `#waitlist` repeat. It's for review only; the per-page files are the deliverable. | n/a |
