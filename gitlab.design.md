---
version: alpha
name: GitLab
website: "https://about.gitlab.com"
description: >-
  A white-canvas DevSecOps marketing surface anchored on near-black ink "#171321" against pure "#ffffff" with a single structural purple "#7759c2" carrying every hairline border and link rest, plus a warm sunrise gradient ("#ffc2a0" → "#ff9a55" → "#ff7a2f" → "#c65a2e") reserved for the hero orb illustration. Display type runs GitLab Sans at weight "660" — a custom semibold cut that lands between weight 600 and 700 — from "96px" hero down to "32px" sub-display, with aggressive negative tracking ("-2.88px" at "96px"). Action buttons hold a flat "4px" radius and feature-card surfaces hit "16px"; the primary CTA paints near-black on near-black ("#171321" on "#171321") with a white "47px"-tall pill. The brand reads as a courthouse-formal DevSecOps platform built for procurement-led enterprises, with the warm orange atmospheric scoped to a single hero illustration and zero chromatic CTAs anywhere on the page.

seo:
  title: "GitLab's Purple-Hairline Design System for React"
  metaDescription: "Near-black ink on white, one structural purple for hairlines and links, a sunrise-gradient orb and GitLab Sans at weight 660. For React and AI tools."
  highlights:
    - "Achromatic CTA strategy — primary button paints #171321 on #ffffff at 47px height and 4px radius; the page ships zero chromatic action buttons"
    - "Purple as hairline voltage — #7759c2 holds 98 occurrences split evenly across text (49) and border (49), never as a fill"
    - "Single warm atmospheric — the orange-to-coral gradient (#ffc2a0 → #ff9a55 → #ff7a2f → #c65a2e) lives only inside the hero orb illustration"
    - "Weight 660 as display signature — GitLab Sans hits a custom variable cut at 660 across hero, h2, and h3, not the standard 700 semibold"
    - "Two-tier radius dialect — 4px for buttons and chips (25 occurrences), 16px for feature-cards (20 occurrences)"
  tags:
    - "Developer Tools & IDEs"
  lastUpdated: "2026-05-13"
  author:
    name: "Dov Azencot"
    url: "https://x.com/dovazencot"
  opening: |
    GitLab's marketing canvas is the courthouse register of DevSecOps — a pure "#ffffff" page floor with near-black "#171321" ink and a structural purple "#7759c2" that runs every hairline border, link rest, and divider rule. Where most developer platforms reach for a saturated brand voltage on the primary CTA, GitLab paints "Get free trial" in white text on the same "#171321" ink that holds the headline, giving the page zero chromatic action surfaces. The single warm atmospheric is a sunrise gradient — "#ffc2a0" through "#ff9a55", "#ff7a2f", and "#c65a2e" — scoped exclusively to the hero orb illustration. Outside that one band the page is monochrome ink-on-paper with purple structural rules, a register closer to a financial-services prospectus than a typical SaaS landing page.

    This page packages the surface into one DESIGN.md file written to the Google Labs spec. Inside: 18 color tokens grouped into canvas, ink, purple structural, the sunrise-gradient stops, plus support tokens for the dark-card surface ("#1f1c2e") and pale lavender wash ("#f6f3fe"); 11 typography tiers covering GitLab Sans from "96px" hero weight 660 with "-2.88px" tracking down to "14px" body weight 400; a five-step radius scale running 4 / 16 / 28 / "999px" pill / 50% circle; an eight-step spacing scale anchored at the 8px base unit (73 occurrences) and topping out at "96px" for section padding; and 17 component definitions covering the top nav, primary and secondary CTAs, feature cards, the dark code surface, customer logo strip, industry chip, and the email-capture text input.

    Feed the file to Claude, Cursor, or Copilot and the agent reproduces GitLab's procurement-formal restraint — achromatic CTA, purple-as-hairline, weight-660 display, two-tier radius dialect, single warm atmospheric — rather than a generic SaaS landing with a tangerine fill button and lavender gradient backgrounds. Or reference the tokens directly: every hex, font name, radius, and spacing value is a quoted scalar you can paste into Tailwind config, CSS variables, or a shadcn theme registry. GitLab is worth studying because it threads a narrow needle. The page reads as enterprise-serious without going corporate-gray, with a chromatic budget of one purple structural rule and one warm hero gradient. Nothing else on the surface carries color.
  related:
    - href: "/design"
      title: "Browse all design systems"
      description: "The full directory of DESIGN.md files on shadcn.io, with live mockups for each."
    - href: "https://about.gitlab.com"
      title: "GitLab — official site"
      description: "The live source — see the achromatic CTA, the purple hairline rules, and the sunrise hero orb in their native habitat."
    - href: "https://github.com/google-labs-code/design.md"
      title: "The DESIGN.md specification"
      description: "Google Labs' open spec for machine-readable design system files — the format this page is built on."
  questions:
    - id: "primary-color"
      title: "What is GitLab's primary brand color?"
      answer: "GitLab's load-bearing structural color is near-black \"#171321\" — frequency 294, split across text (145), border (142), and bg (7). It carries headlines, body ink, hairline rules, and the primary CTA fill. The chromatic structural token is purple \"#7759c2\" — frequency 98, split evenly across text (49) and border (49). It runs link rests and divider rules but never fills a button. The warm sunrise gradient (\"#ffc2a0\", \"#ff9a55\", \"#ff7a2f\", \"#c65a2e\") is a single-region atmospheric inside the hero orb, not a system token. The page ships zero chromatic CTAs."
    - id: "dark-mode"
      title: "Does GitLab's marketing site have a dark mode?"
      answer: "No — the public marketing canvas is light-only. The page floor is pure \"#ffffff\" (524 occurrences, the dominant color). Surface inversion happens inside individual feature-cards — the \"end-to-end DevOps process\" card and the security-card hit \"#1f1c2e\" near-black backgrounds with \"#ffffff\" text to show product-screenshot mockups in their native dark theme. The GitLab product itself ships a dark theme inside the in-app surfaces shown in those mockups, but it is not represented in this DESIGN.md, which captures the public light marketing experience."
    - id: "typography"
      title: "What typography does GitLab use, and what should I use if GitLab Sans isn't available?"
      answer: "GitLab runs GitLab Sans as the single sans family across every display and body tier. The hero hits \"96px\" at weight 660 with \"-2.88px\" letter-spacing — a custom variable-weight cut that sits between semibold (600) and bold (700). H3 card titles run \"40px\" at weight 660 with \"-0.8px\" tracking; sub-display \"32px\" at weight 400 with \"-0.64px\"; body large \"18px\" at weight 400; body medium \"16px\" at weight 400; small \"14px\" at weight 400 with \"22px\" leading. GitLab Sans is published as a custom-licensed family. The closest free fallback is Inter at weights 400/600 with \"-1.5%\" tracking on display, or Geist at the equivalent weights for a similar geometric register."
    - id: "shapes-and-depth"
      title: "What is GitLab's shape and elevation language?"
      answer: "A two-tier radius dialect plus support pills. Button \"4px\" (25 occurrences, the page's dominant value) carries the primary and secondary CTAs and the industry chips. Card \"16px\" (20 occurrences) covers feature-cards, the customer-logo backdrop, and the dark code-surface panel. Avatar \"50%\" (5 occurrences) handles industry-icon circles. Pill \"999px\" (5 occurrences) sits on the eyebrow tags above feature sections. Depth comes from canvas inversion — feature cards switch from \"#ffffff\" to \"#1f1c2e\" (17 occurrences as bg) — rather than drop shadows. No elevation tiers, no soft-edge floating surfaces."
    - id: "warm-gradient"
      title: "What's the orange-to-coral gradient for, and where can I use it?"
      answer: "The warm sunrise gradient lives only inside the hero orb illustration as a single atmospheric moment — composed of \"#ffc2a0\" (peach), \"#ff9a55\" (orange), \"#ff7a2f\" (coral), and \"#c65a2e\" (burnt sienna) bleeding through a circular glow. It is the page's only chromatic atmosphere and is strictly scoped to the hero region. Using it on feature-cards, CTA buttons, or section backgrounds would break the brand's procurement-formal register — the rest of the page reads as ink-on-paper with purple hairlines, and a tangerine fill button would land as a different brand entirely."
    - id: "use-in-project"
      title: "Can I use this DESIGN.md to build my own React DevSecOps landing?"
      answer: "Yes — the file is structured to be fed into Claude, Cursor, or any AI tool that reads design tokens. The agent will reproduce GitLab's restraint: white canvas, near-black ink, purple-as-hairline structural color \"#7759c2\", achromatic CTA painting \"#171321\" on \"#ffffff\", GitLab Sans display at weight 660 with aggressive negative tracking, and the two-tier 4px/16px radius dialect. Reference the tokens directly inside Tailwind config or CSS variables — every color, type style, radius, and spacing value is a quoted scalar. The 17 component definitions cover the top nav, primary and secondary buttons, feature-cards (both light and dark variants), the customer-logo strip, the industry-chip, the email input, and the hero orb container."

colors:
  canvas: "#ffffff"
  ink: "#171321"
  ink-card-dark: "#1f1c2e"
  ink-mid: "#74717a"
  ink-pure: "#000000"
  ink-deep: "#060a0f"
  hairline: "#d1d0d3"
  purple-structural: "#7759c2"
  lavender-wash: "#f6f3fe"
  lavender-mid: "#eee7fd"
  pink-blush: "#ffd4d8"
  sunrise-peach: "#ffc2a0"
  sunrise-orange: "#ff9a55"
  sunrise-coral: "#ff7a2f"
  sunrise-burnt: "#c65a2e"
  link-classic: "#0000ee"
  ink-on-card: "#ffffff"
  ink-eyebrow: "#74717a"

typography:
  display-hero:
    fontFamily: "GitLab Sans, system-ui, sans-serif"
    fontSize: 96px
    fontWeight: 660
    lineHeight: 1.04
    letterSpacing: "-2.88px"
  display-h2:
    fontFamily: "GitLab Sans, system-ui, sans-serif"
    fontSize: 96px
    fontWeight: 660
    lineHeight: 1.04
    letterSpacing: "-2.88px"
  display-h3:
    fontFamily: "GitLab Sans, system-ui, sans-serif"
    fontSize: 40px
    fontWeight: 660
    lineHeight: 1.05
    letterSpacing: "-0.8px"
  sub-display:
    fontFamily: "GitLab Sans, system-ui, sans-serif"
    fontSize: 32px
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: "-0.64px"
  lead-md:
    fontFamily: "GitLab Sans, system-ui, sans-serif"
    fontSize: 24px
    fontWeight: 400
    lineHeight: 1.17
    letterSpacing: "-0.48px"
  heading-card:
    fontFamily: "GitLab Sans, system-ui, sans-serif"
    fontSize: 18px
    fontWeight: 660
    lineHeight: 1.56
    letterSpacing: 0px
  body-lg:
    fontFamily: "GitLab Sans, system-ui, sans-serif"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.56
    letterSpacing: 0px
  body-md:
    fontFamily: "GitLab Sans, system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0px
  nav-link:
    fontFamily: "GitLab Sans, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.57
    letterSpacing: 0px
  button-label:
    fontFamily: "GitLab Sans, system-ui, sans-serif"
    fontSize: 18px
    fontWeight: 660
    lineHeight: 1.25
    letterSpacing: 0px
  caption:
    fontFamily: "GitLab Sans, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 660
    lineHeight: 1.5
    letterSpacing: 0px

rounded:
  none: "0px"
  sm: "4px"
  lg: "16px"
  xl: "28px"
  pill: "999px"
  circle: "50%"

spacing:
  xxs: "2px"
  xs: "4px"
  sm: "8px"
  md: "12px"
  base: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
  xxxl: "64px"
  section: "96px"

components:
  top-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    rounded: "{rounded.none}"
    height: 64px
    padding: "0 24px"
    border: "0"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    rounded: "{rounded.none}"
    padding: "8px 0"
    height: 40px
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.canvas}"
    typography: "{typography.button-label}"
    rounded: "{rounded.sm}"
    padding: "11px 16px"
    height: 47px
    border: "1px solid {colors.ink}"
  button-primary-hover:
    backgroundColor: "{colors.ink-card-dark}"
    textColor: "{colors.canvas}"
    typography: "{typography.button-label}"
    rounded: "{rounded.sm}"
    padding: "11px 16px"
    height: 47px
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button-label}"
    rounded: "{rounded.sm}"
    padding: "11px 16px"
    height: 47px
    border: "1px solid {colors.ink}"
  button-tertiary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button-label}"
    rounded: "{rounded.sm}"
    padding: "11px 16px 11px 0px"
    height: 47px
    border: "0"
  feature-card-light:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.lg}"
    padding: "32px"
    border: "1px solid {colors.hairline}"
  feature-card-dark:
    backgroundColor: "{colors.ink-card-dark}"
    textColor: "{colors.ink-on-card}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.lg}"
    padding: "32px"
    border: "0"
  heading-block:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.display-h3}"
    rounded: "{rounded.none}"
    padding: "0"
  industry-chip:
    backgroundColor: "{colors.lavender-wash}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: "8px"
    height: 32px
  industry-icon:
    backgroundColor: "{colors.lavender-mid}"
    textColor: "{colors.purple-structural}"
    typography: "{typography.caption}"
    rounded: "{rounded.circle}"
    height: 48px
    padding: "12px"
  eyebrow-tag:
    backgroundColor: "transparent"
    textColor: "{colors.purple-structural}"
    typography: "{typography.caption}"
    rounded: "{rounded.none}"
    padding: "0"
  customer-logo-strip:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-mid}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
    padding: "48px 0"
    border: "0"
  hero-orb:
    backgroundColor: "{colors.sunrise-coral}"
    textColor: "{colors.canvas}"
    typography: "{typography.body-md}"
    rounded: "{rounded.circle}"
    padding: "0"
    border: "0"
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: "11px 16px"
    height: 47px
    border: "1px solid {colors.hairline}"
  divider-rule:
    backgroundColor: "{colors.purple-structural}"
    textColor: "{colors.purple-structural}"
    typography: "{typography.caption}"
    rounded: "{rounded.none}"
    height: 1px
    padding: "0"
  footer:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-mid}"
    typography: "{typography.caption}"
    rounded: "{rounded.none}"
    padding: "64px 24px"
---

## Overview

GitLab's marketing canvas is the courthouse register of DevSecOps — a pure `{colors.canvas}` ("#ffffff") page floor with near-black `{colors.ink}` ("#171321") carrying headlines, body, and the primary CTA fill, plus a structural purple `{colors.purple-structural}` ("#7759c2") that runs every hairline border and link rest. The single warm atmospheric is a sunrise gradient — `{colors.sunrise-peach}` through `{colors.sunrise-orange}`, `{colors.sunrise-coral}`, and `{colors.sunrise-burnt}` — scoped exclusively to the hero orb illustration. Where most developer platforms paint the primary CTA in a saturated brand voltage, GitLab paints "Get free trial" in `{colors.canvas}` text on `{colors.ink}` ink, giving the page zero chromatic action surfaces.

**Achromatic CTA discipline**: the page ships no chromatic action buttons. Primary CTA paints near-black on white at `47px` height and `4px` radius; secondary CTA inverts to white on white with a near-black 1px stroke; tertiary CTA is a borderless ink label on canvas. Where the convention across DevSecOps marketing is a tangerine, indigo, or electric-green primary fill that competes with the headline for attention, GitLab keeps every action surface inside the same `#171321` ink ladder. The visual interest is carried by typography weight and the single hero orb atmospheric — not by a fill voltage.

**Purple-as-hairline**: the structural purple `{colors.purple-structural}` ("#7759c2") shows frequency 98, split evenly across text (49) and border (49), with zero occurrences as a background fill. It carries link rests and divider rules but never paints a surface. The chromatic budget is one purple structural color for hairlines and one warm gradient for the hero orb. Outside those two events the page is monochrome ink-on-paper.

Display type runs **GitLab Sans at weight 660** — a custom variable cut that lands between semibold (600) and bold (700), used across hero, h2, and h3. The hero hits "96px" at weight 660 with "-2.88px" letter-spacing — aggressive negative tracking that gives the headline editorial density rather than tech-bombastic shout. H3 card titles run "40px" at weight 660 with "-0.8px" tracking. Body sits at "18px" weight 400 with "28px" leading. Unlike the convention of cranking display to weight 700, GitLab parks every display tier at 660 — the variable-weight micro-band is the entire display strategy.

**Key Characteristics:**
- Achromatic CTA — primary button paints `{colors.ink}` on `{colors.canvas}` at "47px" height and "4px" radius; the page ships zero chromatic action buttons.
- Purple-as-hairline — `{colors.purple-structural}` ("#7759c2") at frequency 98, evenly split between text (49) and border (49), never bg.
- Single warm atmospheric — the sunrise gradient is scoped to the hero orb only, four stops from peach through burnt sienna.
- Weight 660 across every display tier — GitLab Sans custom semibold, not the standard 700.
- Two-tier radius dialect — `{rounded.sm}` "4px" for buttons and chips (25 occurrences) and `{rounded.lg}` "16px" for feature-cards (20 occurrences).
- Canvas inversion at feature-cards — `{colors.ink-card-dark}` ("#1f1c2e") backgrounds host product-screenshot mockups; the rest of the page is white.
- 8px base unit — frequency 73 in spacing, the dominant rhythm anchor; section padding hits "96px".

## Colors

The palette reads as a monochrome ink ladder around the white canvas, with one purple structural rule, one warm hero gradient, and one dark-card surface for product mockups.

- **Canvas (`#ffffff`)** — frequency 524. Used as text (261), border (256), bg (7). The dominant page color and the inverse text token on the primary CTA and dark feature-cards. Carries every section that isn't a deliberate inversion.
- **Ink (`#171321`)** — frequency 294. Used as text (145), border (142), bg (7). The near-black workhorse that holds headlines, body, hairline rules, and the primary CTA fill. The page's most load-bearing structural token.
- **Ink card dark (`#1f1c2e`)** — frequency 17. Used as bg (17). The canvas-inversion surface for feature-cards that host product-screenshot mockups — the "end-to-end DevOps" and the "Be proactive with security" cards.
- **Ink mid (`#74717a`)** — frequency 58. Used as text (27), border (27), bg (4). The eyebrow-text and disabled-state gray. Carries customer-logo strip text and secondary captions.
- **Ink pure (`#000000`)** — frequency 22. Used as text (10), border (8), shadow (3), bg (1). The deepest black, reserved for pure-black logo strokes and the rare drop-shadow tint.
- **Ink deep (`#060a0f`)** — frequency 1. Used as bg (1). A near-pure-black surface for a single product-mockup region; mapped as a one-off rather than a system token.
- **Hairline (`#d1d0d3`)** — frequency 2. Used as border (2). The light gray divider rule on the customer-logo backdrop and the text-input stroke.
- **Purple structural (`#7759c2`)** — frequency 98. Used as text (49), border (49). The chromatic structural token, split evenly between text and border, with zero occurrences as a background fill. Runs link rests, divider rules, and the industry-icon strokes.
- **Lavender wash (`#f6f3fe`)** — frequency 3. Used as gradient (3). The palest lavender tint, scoped to the industry-chip backgrounds in the "Built to meet your industry's demands" section.
- **Lavender mid (`#eee7fd`)** — frequency 3. Used as gradient (3). The mid-tone lavender, used inside industry-icon circles behind the `{colors.purple-structural}` stroke.
- **Pink blush (`#ffd4d8`)** — frequency 3. Used as gradient (3). The pale pink edge of a subtle decorative gradient on a marketing region, the only true brand-pink in the system.
- **Sunrise peach (`#ffc2a0`)** — frequency 1. Used as gradient (1). The lightest stop in the hero orb gradient — the warm-edge boundary that bleeds into the white canvas.
- **Sunrise orange (`#ff9a55`)** — frequency 1. Used as gradient (1). The mid-tone of the hero orb radial, the color that reads as the visual center of the orb.
- **Sunrise coral (`#ff7a2f`)** — frequency 1. Used as gradient (1). The saturated coral stop in the orb gradient, where the warmth is most concentrated.
- **Sunrise burnt (`#c65a2e`)** — frequency 1. Used as gradient (1). The deepest burnt-sienna stop, anchoring the orb's bottom edge against the canvas.
- **Link classic (`#0000ee`)** — frequency 2. Used as text (1), border (1). A default browser-blue link rest that appears on a single legacy anchor — almost certainly an unstyled tag rather than a system token.
- **Ink on card (`#ffffff`)** — alias of canvas, scoped to text-on-dark-card surfaces. Used as the text color inside `{colors.ink-card-dark}` panels.
- **Ink eyebrow (`#74717a`)** — alias of ink-mid for semantic clarity on caption and customer-logo text.

## Typography

A single sans family does all the lifting — GitLab Sans across every display, body, and caption tier. The mono surface visible inside the dark code-mockup card is rendered as a flat product screenshot rather than live text, so no monospace family is declared as a system token.

**GitLab Sans (custom variable)** is the single sans family. The hero hits "96px" at weight 660 with "-2.88px" letter-spacing — a custom variable-weight cut that lands between semibold (600) and bold (700), compressed by aggressive negative tracking for editorial headline density. The same display tier serves the h2 at the same "96px" size and weight, used in the "Built for how you work" headline. H3 card titles run "40px" at weight 660 with "-0.8px" tracking. The sub-display at "32px" weight 400 carries hero supporting copy. Lead "24px" weight 400 with "-0.48px" tracking handles introduction paragraphs. Body large is "18px" weight 400 with "28px" leading; body medium is "16px" weight 400 with "24px" leading; nav links sit at "14px" weight 400 with "22px" leading.

GitLab Sans is a custom-licensed family. If substitution is required, Inter at weights 400/600 with "-1.5%" tracking on display is the closest free equivalent. Geist Sans is a reasonable alternative for the same geometric register, though its lowercase descenders sit slightly tighter.

The signature typographic move is **weight 660 across every display tier**. Where most marketing canvases ladder from weight 700 hero down to weight 600 h2 and weight 500 h3, GitLab parks all three display tiers at the same custom 660 cut, varying only by size and tracking. The 660 micro-band is the entire display strategy.

## Layout

The system runs on an 8px base unit — frequency 73 across spacing values, the dominant rhythm anchor. Standard padding values: 8, 12, 16, 24, 32, 48, 64, 96. The "96px" value handles section-top padding (the "96px 0px 0px" tuple appears twice). Card internal padding holds "32px" consistently — frequency 24, the second-most-used spacing value — giving feature-cards room to breathe around their internal heading + body + screenshot composition. Button padding uses the asymmetric "11px 16px" tuple (frequency 8) on horizontal CTAs and "11px 16px 11px 0px" (frequency 7) on text-link CTAs that hug their left edge. The container strategy alternates: hero text caps at a reading column (~640-924px), while the feature-card grid spans wider with two-column splits at the "Built for how you work" section.

## Elevation & Depth

Elevation is achieved through **canvas inversion at feature-cards** — not through shadows. The marketing surface carries near-zero box-shadows on cards or buttons. Hierarchy lifts via the canvas swap from `{colors.canvas}` ("#ffffff") to `{colors.ink-card-dark}` ("#1f1c2e") on selected feature-cards that host product-screenshot mockups — the "end-to-end DevOps process in one place" card and the "Be proactive with security" card invert to near-black backgrounds with white text. The hero orb sits on the only true atmospheric — the sunrise gradient composed of `{colors.sunrise-peach}` through `{colors.sunrise-burnt}` — scoped to that one circular illustration. No drop-shadow tokens, no elevation tiers, no soft-edge cards floating over canvas. The page reads flat with deliberate ink-density steps rather than layered surface depth.

## Shapes

A two-tier radius dialect with three support shapes. **Button "4px"** (25 occurrences, the page's dominant radius) carries the primary, secondary, and tertiary CTAs, the text-input field, and the industry chips when not pilled. **Card "16px"** (20 occurrences) covers feature-cards, the customer-logo backdrop, and the dark product-mockup panels. **Avatar 50%** (5 occurrences) handles industry-icon circles inside the "Built to meet your industry's demands" grid. **Pill "999px"** (5 occurrences) sits on eyebrow tags and the round industry-chip variants. **Outer-card "28px"** (1 occurrence) on a single oversized feature-card container — a one-off rather than a system token. Everything else stays at "0px" — full-bleed bands have no rounded corners, the wordmark sits flat, and the customer-logo strip is flush-edged.

## Components

The component vocabulary covers the top nav, three button variants plus a tertiary text-link, two feature-card surfaces (light and dark), the heading block, the industry chip and icon, the eyebrow tag, the customer-logo strip, the hero orb container, the email-capture text input, the purple divider rule, and the footer. The **top-nav** sits on `{colors.canvas}` at "64px" height with `{typography.nav-link}` at "14px". The **button-primary** is the achromatic Get-free-trial CTA: `{colors.ink}` background, `{colors.canvas}` label, "4px" radius, "11px 16px" padding, "47px" height — the page's most visually-loaded interactive element, painted entirely in the structural ink ladder. The **button-secondary** inverts to `{colors.canvas}` with a 1px `{colors.ink}` stroke for "Get free trial" duplicates and secondary actions. The **feature-card-light** holds `{rounded.lg}` "16px" corners with a `{colors.hairline}` 1px stroke; the **feature-card-dark** mirrors the geometry but switches to `{colors.ink-card-dark}` for product-screenshot regions. The **industry-chip** runs `{rounded.pill}` "999px" with `{colors.lavender-wash}` fill and `{colors.ink}` label. The **industry-icon** holds `{rounded.circle}` 50% with `{colors.lavender-mid}` fill and `{colors.purple-structural}` icon stroke. The **divider-rule** is a 1px `{colors.purple-structural}` hairline used between sections.

## Do's and Don'ts

- Do paint the primary CTA in `{colors.ink}` ("#171321") on `{colors.canvas}` ("#ffffff") at "47px" height and "4px" radius. The page ships zero chromatic action buttons — painting "Get free trial" in tangerine or purple breaks the achromatic discipline that defines the brand register.
- Don't use `{colors.purple-structural}` ("#7759c2") as a background fill. Its 98 occurrences are split evenly between text (49) and border (49) with zero as bg — it is mapped exclusively as a hairline and link-rest token. For purple-tinted surfaces, use `{colors.lavender-wash}` ("#f6f3fe") instead.
- Do reserve the sunrise gradient (`{colors.sunrise-peach}` → `{colors.sunrise-orange}` → `{colors.sunrise-coral}` → `{colors.sunrise-burnt}`) for the hero orb illustration only. It is the page's single warm atmospheric.
- Don't apply the sunrise gradient to CTA buttons, feature-cards, or section backgrounds. The four orange stops are scoped to the hero orb; using them anywhere else breaks the chromatic budget of "one purple structural rule + one warm hero gradient" that defines the surface.
- Do hold every display tier at GitLab Sans weight 660. The hero at "96px", h2 at "96px", and h3 at "40px" all share the same custom semibold cut — only size and tracking vary.
- Don't crank display to weight 700. GitLab parks all three display tiers at weight 660 — the variable-weight micro-band is the entire display strategy. Bold display breaks the editorial register.
- Do use "4px" radius for buttons and chips, "16px" for feature-cards. The two-tier radius dialect is the page's dominant shape language (25 + 20 occurrences combined).
- Don't use "8px" or "12px" radius on action buttons. Those values do not exist in the page's radius scale — the gap between "4px" buttons and "16px" cards is deliberate and prevents radius creep.
- Do invert canvas at feature-cards to `{colors.ink-card-dark}` ("#1f1c2e") when the card hosts a product-screenshot mockup. The 17 occurrences of this near-black bg are all scoped to product-mockup panels — using it for non-product cards flattens the canvas-inversion signal that distinguishes "marketing content" from "product surface".
- Don't add drop-shadows to cards or buttons. The system uses zero shadow tokens — hierarchy lifts through canvas inversion and hairline rules, not layered depth.

## Known Gaps

- Dark mode is not documented because the public marketing surface is light-only. The GitLab product itself ships a dark theme inside the in-app surfaces shown in the dark feature-card mockups; those tokens are not represented here.
- Motion timings (the hero orb animation, the feature-card hover-lift, the customer-logo carousel auto-advance) are out of scope — only static surface tokens captured.
- GitLab Sans is a custom-licensed family — a variable-font runtime is required to reproduce the weight 660 cut accurately. Inter or Geist at weight 600 is the closest substitute.
- Form-field error and validation states beyond the email-capture input are not visible on the inspected marketing surface.
- The single `{colors.link-classic}` ("#0000ee") occurrence is almost certainly an unstyled `<a>` rather than a system token — treat it as legacy chrome rather than a design decision.
- The hero orb gradient is captured as four discrete stops from the extracted color list; the actual rendered orb uses a continuous radial blend with intermediate hues, which is out of scope for a token spec.
