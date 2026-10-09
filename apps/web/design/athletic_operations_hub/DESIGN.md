---
name: Athletic Operations Hub
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#5b403d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#8f6f6c'
  outline-variant: '#e4beb9'
  surface-tint: '#b91c1c'
  primary: '#93000b'
  on-primary: '#ffffff'
  primary-container: '#b91c1c'
  on-primary-container: '#ffcdc7'
  inverse-primary: '#ffb4ab'
  secondary: '#575e6e'
  on-secondary: '#ffffff'
  secondary-container: '#dce2f5'
  on-secondary-container: '#5d6474'
  tertiary: '#004a73'
  on-tertiary: '#ffffff'
  tertiary-container: '#006397'
  on-tertiary-container: '#b8dcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad6'
  primary-fixed-dim: '#ffb4ab'
  on-primary-fixed: '#410002'
  on-primary-fixed-variant: '#93000b'
  secondary-fixed: '#dce2f5'
  secondary-fixed-dim: '#c0c6d8'
  on-secondary-fixed: '#151c29'
  on-secondary-fixed-variant: '#404755'
  tertiary-fixed: '#cce5ff'
  tertiary-fixed-dim: '#93ccff'
  on-tertiary-fixed: '#001d31'
  on-tertiary-fixed-variant: '#004b73'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-md:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  metric-display:
    fontFamily: JetBrains Mono
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  metric-inline:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  gutter-lg: 2rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

The design system establishes a high-performance sports management console built for athletic directors, coaches, and match analysts. It balances rigorous data density with athletic dynamism.

### Personality & Tone
- **Authoritative & Tactical:** Structured, purposeful, and free of extraneous decoration. Every pixel prioritizes tactical clarity, player metrics, and operational readiness.
- **Dynamic & Athletic:** Grounded in a commanding crimson accent that energizes the operational canvas without overwhelming administrative tasks.
- **Technical & Precision-First:** Employs crisp card architecture, tabular figure alignment, and strict status hierarchies suited for rapid sideline assessments and post-match analytics.

### Visual Style
The system adopts an engineered **Dual-Tone Console** aesthetic:
- A high-contrast, deep charcoal navigational rail evokes specialized sports analytics terminals.
- An ultra-clean, clinical canvas hosts dense modular cards with crisp borders and measured micro-elevations.
- Status badges borrow from pitch-side conventions (starting vs. bench, active vs. injured, win vs. loss) using unmistakable, high-legibility semantic pigments.

## Colors

The palette balances deep tactical tones with a clean administrative canvas and high-visibility status cues.

### Core Architecture
- **Primary Athletic Crimson (`#B91C1C`):** Primary action states, team badges, focus rings, and high-impact key performance indicators (KPIs). Hover: `#991B1B`. Soft tint: `#FEF2F2`.
- **Navigation & Surface Dark (`#0E121A` to `#181F2C`):** Houses the persistent control bar and primary command hierarchies. Text within this layer stays anchored to `#F8FAFC` and `#94A3B8`.
- **Canvas (`#F8FAFC`):** The primary view background, creating contrast against crisp white data cards.
- **Card Surface (`#FFFFFF`):** High-clarity workspace containers bounded by subtle structural dividers (`#E2E8F0`).

### Semantic Status Palette (Sports-Specific)
- **Emerald (`#059669` / Surface: `#ECFDF5`):** Present, match win, active roster clearance, fitness optimal.
- **Amber (`#D97706` / Surface: `#FFFBEB`):** Late, pending check-in, upcoming match fixture, caution/warning.
- **Rose (`#E11D48` / Surface: `#FFF1F2`):** Absent, match loss, acute injury flag, medical restriction.
- **Blue (`#0284C7` / Surface: `#F0F9FF`):** Starting lineup, male division/player tag.
- **Purple (`#7C3AED` / Surface: `#F5F3FF`):** Tactical substitute, female division/player tag.

## Typography

Typography prioritizes density, immediate scanning speed, and strict vertical alignment across tables and roster grids.

### Font Roles
- **Primary Interface Font (Geist):** Used across headlines, structural labels, navigation items, and descriptive running copy. Clean geometric curves deliver high legibility even at compact 12px scales.
- **Data & Metric Font (JetBrains Mono):** Applied to roster jersey numbers, game clock values, tactical statistics, box scores, and metric headers. Always rendered with tabular figures (`font-variant-numeric: tabular-nums`) to prevent horizontal jitter during live stat refreshes.

### Hierarchy Guidelines
- Match statistics, player shot percentages, and running point tallies must always employ `metric-display` or `metric-inline`.
- Badges and structural pills utilize `label-sm` with explicit uppercase transformation and tracking.

## Layout & Spacing

The layout is built around a persistent, fixed-width command rail paired with a fluid, multi-column dashboard grid.

### Layout Model
- **Command Sidebar:** Fixed at 280px wide on desktop screens, collapsible to an 80px icon dock on medium viewports, and accessible as an off-canvas drawer on mobile.
- **Main Canvas:** A 12-column responsive fluid grid operating with `gutter` (24px) spacing and a 32px canvas margin.
- **SectionContainer Module:** The primary architectural layout unit. It spans full or fractional column widths, encapsulating a distinct tactical feature (e.g., Starting Lineup, Injury Log, Match Timeline).

### Responsive Adaptation
- **Desktop (≥ 1280px):** 12-column layout. High-density stat matrices arrange into 3 or 4 horizontal card blocks.
- **Tablet (768px – 1279px):** 8-column layout with 16px gutters. Roster panels and metric splits collapse to 2-column stacked configurations.
- **Mobile (< 768px):** Single-column stacked flow. Margins tighten to 16px (`margin-mobile`), metrics display horizontally scrollable strips, and dense tables switch to summary cards.

## Elevation & Depth

Visual hierarchy uses flat structural containment, crisp perimeter borders, and ambient micro-shadows to keep data readable in direct sunlight or bright sideline conditions.

### Surface Tiers
- **Tier 0 (Backdrop):** Slate tinted ground (`#F8FAFC`).
- **Tier 1 (Base Cards & Modules):** Pure white surfaces (`#FFFFFF`) with a 1px border (`#E2E8F0`). Shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)`.
- **Tier 2 (Dropdowns, Flyouts & Modals):** Pure white surface, 1px border (`#CBD5E1`). Shadow: `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)`.
- **Command Rail Surface:** Deep obsidian `#0E121A` layered with `#181F2C` panel headers and borders softened to `rgba(255, 255, 255, 0.08)`.

### Border Integrity
Avoid high-blur shadows or floating neumorphic bevels. Sharp 1px vector boundaries keep the interface feeling like a professional sports utility.

## Shapes

The interface balances soft modern curves with geometric structure using rounded cards and pill-shaped elements.

### Shape Language
- **Cards & Section Containers:** Styled with modern `rounded-2xl` corners (16px), giving heavy operational cards a contemporary look.
- **Action Buttons & Form Inputs:** Balanced with `rounded-lg` corners (8px) for crisp tap targets.
- **Status Badges & Division Chips:** Full pill radius (`rounded-full` / 9999px) for fast visual separation from rectangular cards and form fields.
- **Header Icon Containers:** Dedicated 36px circular badge (`rounded-full`) in primary athletic red (`#B91C1C`) or primary tint (`#FEF2F2`) to anchor each module.

## Components

### Buttons
- **Primary Athletic:** Background `#B91C1C`, text `#FFFFFF`, radius 8px, font Geist 14px medium. Hover: `#991B1B`. Active: `#7F1D1D`. Focus: 2px offset with ring `#B91C1C`.
- **Secondary / Ghost:** White background, 1px border `#E2E8F0`, text `#1E293B`. Hover: `#F1F5F9`.
- **Dark Rail Action:** Background `#181F2C`, border `rgba(255, 255, 255, 0.1)`, text `#F8FAFC`.

### SectionContainer (Specialized Module)
The primary wrapper for all operational screens:
- Pure white `#FFFFFF` surface with `rounded-2xl` borders and 1px `#E2E8F0` stroke.
- **Header Structure:** 
  - Left: 36px circular primary red container with a crisp white or red icon, accompanied by a Geist 16px semibold section title.
  - Right: Inline key metric summary strip (e.g., `4M / 4F ON COURT • FOULS: 2 • EFF: 84%`) set in `JetBrains Mono` at 12px with muted slate coloring.
- Padding: 20px on desktop, 16px on mobile.

### Status Pills & Badges
All badges use `rounded-full`, 4px vertical / 10px horizontal padding, and `label-sm` uppercase styling:
- **Emerald Pill (Present / Win / Active):** Background `#ECFDF5`, text `#065F46`, dot indicator `#059669`.
- **Amber Pill (Late / Upcoming):** Background `#FFFBEB`, text `#92400E`, dot indicator `#D97706`.
- **Rose Pill (Absent / Loss / Injury):** Background `#FFF1F2`, text `#9F1239`, dot indicator `#E11D48`.
- **Blue Pill (Starting Lineup / Male Division):** Background `#F0F9FF`, text `#075985`, dot indicator `#0284C7`.
- **Purple Pill (Substitute / Female Division):** Background `#F5F3FF`, text `#5B21B6`, dot indicator `#7C3AED`.

### Tables & Roster Lists
- **Header:** Background `#F8FAFC`, uppercase Geist 11px font, `#64748B` color, 1px bottom border `#E2E8F0`.
- **Row:** Height 48px, background `#FFFFFF`, hover `#F8FAFC`, transition duration 150ms.
- **Data Cells:** JetBrains Mono for points, fouls, and shooting percentages. Left-aligned player names with thumbnail circular avatar and jersey number badge.

### Input Fields
- Height 40px, radius 8px, 1px border `#CBD5E1`, background `#FFFFFF`. Focus: `#B91C1C` border with 3px `#FEF2F2` ambient ring. Typography: Geist 14px.