# TDFC Companion App — Color palette & dark mode implementation guide

Paste this whole file to Claude Code. It applies to the Laravel + React (Inertia / shadcn + Tailwind v4) app. The HTML mockups in this project are the visual reference: `tdfc.css` (tokens), `auth.css`, `settings.css`, `theme.js`, `loan-calculator.html`.

## 0. Goal

1. Replace the approximate brand colors with the **exact colors sampled from the TDFC logo**.
2. Make light and dark themes fully token-driven so **no page has hardcoded light colors** (unreadable text in dark mode was the main bug in the mockups).
3. Add one quick light/dark toggle in the app shell header, shared by every page.

Do not redesign layouts. This is a color/token change only.

**Final decisions (do not revisit):** (1) brand colors = logo colors; (2) dark mode: bright logo red `#DA5655` surfaces with dark ink text; (3) light mode: white text on a slightly deeper logo red `#CB4A49` (AA contrast); (4) no pale/soft red surfaces and no brick/maroon large surfaces; (5) default theme dark.

## 1. Brand palette (sampled from the logo `Header.png`)

| Role | Hex | Notes |
|---|---|---|
| Brand red / coral | `#DA5655` | Logo red |
| Brand yellow | `#F9DE7C` | Highlights, third data series, "current" row tint |
| Brand blue | `#1074DF` | Focus ring fallback, links/info, avatar tint |
| Logo black | `#010101` | Logo wordmark only |

The old values `#F57979`, `#FFE57E`, `#3B82F6` were lighter approximations. Remove them everywhere.

### Red-family surfaces (active nav pill, hero banners, loan calculator results panel, primary coral buttons, mobile header)

| Token | Light | Dark |
|---|---|---|
| `--brand-surface` | `#CB4A49` (logo red `#DA5655`, ~8% deeper so white text passes AA: 4.55:1) | `#DA5655` (logo red) |
| `--on-brand-surface` | `#fff` | `oklch(.16 .03 24)` near-black ink (4.8:1) |

Rules: **light mode = white text on the slightly deeper logo red; dark mode = dark ink on the bright logo red.** Never put white text on bright `#DA5655` (4.2:1) or dark text on `#CB4A49`. Hover on red surfaces: `color-mix(in oklch, var(--brand-surface) 88%, black)`. Remove the old `oklch(.2 .05 24)` text color everywhere.

## 2. Tokens

Put these in `resources/css/app.css` (shadcn variable names; map to Tailwind via `@theme inline` as the project already does). Light is `:root`, dark is `.dark`.

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(.145 0 0);
  --muted: oklch(.97 0 0);
  --muted-foreground: oklch(.5 0 0);
  --border: oklch(.922 0 0);
  --input: oklch(.922 0 0);
  --ring: oklch(.708 0 0);
  --primary: oklch(.205 0 0);
  --primary-foreground: oklch(.985 0 0);
  --destructive: oklch(.577 .245 27.3);
  --sidebar: oklch(.985 0 0);
  --page: oklch(.975 0 0);

  /* brand (from logo) */
  --brand-red: #DA5655;
  --brand-yellow: #F9DE7C;
  --brand-blue: #1074DF;
  --brand-ink: oklch(.16 .03 24);            /* text on small bright red/yellow chips */
  --brand-surface: #CB4A49;                  /* large red-family surfaces (logo red, AA with white) */
  --on-brand-surface: #fff;                  /* text/icons on --brand-surface */
  --red-text: oklch(.52 .16 24);             /* red as TEXT/links on light bg */
  --yellow-text: oklch(.45 .09 85);
  --blue-text: oklch(.5 .19 258);
  --red-soft: color-mix(in oklch, var(--brand-red) 16%, white);
  --yellow-soft: color-mix(in oklch, var(--brand-yellow) 35%, white);
  --blue-soft: color-mix(in oklch, var(--brand-blue) 12%, white);
  --success: oklch(.55 .14 155);
  --success-soft: oklch(.96 .04 155);
  --radius: .625rem;
}

.dark {
  --background: oklch(.145 0 0);
  --foreground: oklch(.985 0 0);
  --card: oklch(.175 0 0);
  --card-foreground: oklch(.985 0 0);
  --muted: oklch(.24 0 0);
  --muted-foreground: oklch(.76 0 0);
  --border: oklch(.27 0 0);
  --input: oklch(.32 0 0);
  --ring: oklch(.55 0 0);
  --primary: oklch(.985 0 0);
  --primary-foreground: oklch(.205 0 0);
  --destructive: oklch(.7 .19 25);
  --sidebar: oklch(.145 0 0);
  --page: oklch(.145 0 0);

  --brand-surface: #DA5655;                  /* bright logo red in dark */
  --on-brand-surface: oklch(.16 .03 24);
  --red-text: oklch(.74 .14 24);
  --yellow-text: oklch(.86 .1 90);
  --blue-text: oklch(.76 .12 258);
  --red-soft: color-mix(in oklch, var(--brand-red) 20%, var(--card));
  --yellow-soft: color-mix(in oklch, var(--brand-yellow) 18%, var(--card));
  --blue-soft: color-mix(in oklch, var(--brand-blue) 22%, var(--card));
  --success: oklch(.72 .15 155);
  --success-soft: color-mix(in oklch, var(--success) 18%, var(--card));
}
```

Brand colors (`--brand-*`) are the **same in both themes**. Only the `*-text`, `*-soft`, neutrals and state colors change.

Expose them to Tailwind (`@theme inline`): `--color-brand-red`, `--color-brand-yellow`, `--color-brand-blue`, `--color-brand-ink`, `--color-brand-surface`, `--color-on-brand-surface`, `--color-red-text`, `--color-red-soft`, etc., so components use `bg-brand-red text-brand-ink`, `text-red-text`, `bg-red-soft`.

## 3. Rules for components

1. **Never hardcode colors in components or CSS.** No `#fff`, `white`, `black`, `#000`, `bg-white`, `text-black`, `text-gray-*`, `bg-gray-*`, `bg-slate-*`, `border-gray-*`, `rgba(0,0,0,…)` for text, or `oklch(0 0 0 / x)` for text. Use tokens: `bg-card`, `bg-background`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `border-border`.
2. **Translucent text** must be derived from the foreground: `color-mix(in oklch, var(--foreground) 72%, transparent)`, not black.
3. **Red as text/links** uses `--red-text` (readable in both themes). Red as a **large surface** uses `--brand-surface` with `--on-brand-surface` text; red as a **small chip/badge** uses `--brand-red` with `--brand-ink` text.
4. **Soft tints** (badges, notices, zebra rows, highlighted rows) use `--red-soft`, `--yellow-soft`, `--blue-soft`, `--success-soft`. Never `color-mix(… white)` inline; that is what breaks dark mode.
5. **State colors**: error → `--destructive` (text) with `color-mix(in oklch, var(--destructive) 15%, var(--card))` background; success → `--success`; warning → yellow soft + `--yellow-text`.
6. **Table zebra rows**: `color-mix(in oklch, var(--muted) 45%, transparent)`. Sticky table headers/footers: `bg-muted`.
7. **Form controls** (inputs, selects, textareas): `bg-background text-foreground border-input`. Placeholder `text-muted-foreground`. Select/dropdown popovers use `bg-card`.
8. **Focus**: every focusable element keeps a visible `:focus-visible` ring (`--ring`; on red surfaces use an `--on-brand-surface` ring).
9. **Hover**: change background lightness by ±0.06–0.12 L, or border/shadow. Never move the text color toward the background.
10. **Contrast**: normal text ≥ 4.5:1, large text/icons ≥ 3:1, in **both** themes. Check any new pairing.

### Specific components
- **Sidebar active item**: `bg-brand-surface text-on-brand-surface font-semibold` (pill). Inactive hover: `bg-muted`.
- **Sidebar logo tile**: transparent in dark, `--primary` in light (the white logo needs a dark tile in light mode only).
- **Primary buttons** (`--primary`): black in light, white in dark (token swap, no per-component code).
- **Brand button / banners / hero / mobile header**: `bg-brand-surface text-on-brand-surface`; hover `color-mix(in oklch, var(--brand-surface) 88%, black)`. Sign-in/Register CTA uses the same.
- **Loan Calculator results panel**: `bg-brand-surface text-on-brand-surface`. Inner cards (deductions, monthly payment, total repayable) are white with near-black text (`oklch(.2 0 0)`, secondary `oklch(.45 0 0)`, border `oklch(.9 0 0)`) in both themes. "Apply for this loan": near-black `oklch(.18 .04 24)` with white text in both themes. Links and focus rings on the panel use `--on-brand-surface`.
- **Selected chips / term shortcuts**: deep maroon `oklch(.24 .07 24)` background with white text, in both themes (light chips on white use `oklch(.2 .05 24)`; hover `oklch(.3 .08 24)`).
- **Repayment bar**: light: `#fff` (you receive), `oklch(.2 .05 24)` (fees), `--brand-yellow` (interest); dark: ink (you receive), `#fff` (fees), yellow (interest). Track: `oklch(1 0 0 / .3)`.
- **Warning notice** ("You still owe …"): yellow soft background, `oklch(.3 .07 70)` text, `oklch(.85 .1 85)` border, same in both themes.
- **Dark photo viewers / crop stages** (`#111`, `rgb(0 0 0 / .5)` scrims): intentionally dark in both themes; leave as is.
- **Settings profile banner** (blue gradient): intentionally fixed; leave as is.

## 4. Theme switching (one shared behavior)

- Theme is stored in `localStorage['tdfc-theme']` with values `light | dark | system`. **Default: `dark`** if nothing is stored. (Confirm with the team whether first-time users should instead follow the OS: use `system` as the default in that case.)
- Apply by toggling the `dark` class on `<html>` (shadcn convention). Resolve `system` with `matchMedia('(prefers-color-scheme: dark)')` and re-resolve on change.
- **Prevent flash of wrong theme**: add a tiny inline script in the root Blade layout (`resources/views/app.blade.php`) `<head>` that reads `tdfc-theme` and sets the class before paint.
- Settings → Appearance (Light / Dark / System) and the header toggle must write the **same key** and stay in sync (also listen to the `storage` event for other tabs).
- **Header toggle**: a pill button at the right end of the app shell header (breadcrumb bar), on every authenticated page. Icon + label showing the action ("Light" while dark, "Dark" while light), `aria-label="Switch to light mode"` / `"Switch to dark mode"`, 36px high (44px touch target on mobile; the mobile header stays visible with only the toggle). On pages without the shell (login, register, password flows, error pages, welcome) render it as a fixed top-right floating pill.
- Implement as a single React component (`<ThemeToggle />`) + a `useTheme()` hook; no per-page copies.

## 5. Migration steps

1. Update the tokens in `resources/css/app.css` exactly as in section 2.
2. Replace the old brand hexes and ink:
   - `#F57979`, `#f57979` → `#DA5655` (or the `brand-red` token)
   - `#FFE57E`, `#ffe57e` → `#F9DE7C`
   - `#3B82F6`, `#3b82f6` → `#1074DF`
   - `oklch(.2 .05 24)` text on red → `--on-brand-surface` on `--brand-surface` (large surfaces) or `oklch(.16 .03 24)` (small bright chips)
   - Any `bg-[#DA5655]` / `background: var(--coral)` on large surfaces → `--brand-surface` (with `--on-brand-surface` text)
3. Audit for hardcoded light colors and fix each with a token (commands below). Review every hit; some are intentional (see exceptions above).
4. Build `<ThemeToggle />`, `useTheme()`, and the blade head script. Wire Settings → Appearance to the same hook.
5. Update shadcn components that ship hardcoded colors (e.g. `badge`, `alert`, `table`, `select`, `input`, `checkbox`) to use tokens only.
6. Verify (section 6).

### Audit commands
```bash
# hardcoded white/black/gray utilities
rg -n "bg-white|text-black|text-white|bg-black|(bg|text|border|ring|divide)-(gray|slate|zinc|neutral|stone)-[0-9]+" resources/js resources/css resources/views

# raw color literals
rg -n "#[0-9a-fA-F]{3,8}\b|rgba?\(|oklch\(0 0 0|oklch\(1 0 0\)|\bwhite\b|\bblack\b" resources/js resources/css resources/views

# old brand values
rg -n -i "f57979|ffe57e|3b82f6|oklch\(\.2 \.05 24\)" resources
```

## 6. Verification checklist

For **every page, in both light and dark**, at desktop and mobile widths:
- Auth: login, register (all wizard steps + crop modal), forgot/reset/confirm password, verify email, registration status, welcome, 403/404/500.
- Client: dashboard, loan transactions (all tabs + schedule + official document), savings transactions, loan calculator, settings (profile, password, appearance).
- Admin: dashboard, registrations, client management (+ drawer, image viewer), products.

Check:
- [ ] All text is readable (no black-on-dark or white-on-light), including placeholders, helper text, error/success messages, disabled states.
- [ ] Inputs, selects, dropdown popovers, tables (zebra, sticky headers, hover), modals/drawers use theme surfaces.
- [ ] Badges and notices (success, warning, error, info) readable in both themes.
- [ ] Red surfaces: light = white text on `#CB4A49`; dark = ink on `#DA5655`. Red text/links use `--red-text`.
- [ ] Focus rings visible on every interactive element, hover states keep contrast.
- [ ] Toggle works on every page, persists across reload and between pages, and Settings → Appearance (incl. System) stays in sync. No flash of the wrong theme on load.
- [ ] Print layouts (official loan document) remain white regardless of theme.
- [ ] Run an automated contrast check (axe / Lighthouse) in both themes; fix anything under 4.5:1.

## 7. Out of scope

Layouts, copy, spacing, typography, component structure, and data. If a fix needs more than a color/token change, note it and leave it.
