# Mini App UI Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the shared theme, home page, detail page, and profile page into a distinctive warm-and-playful branded UI while preserving existing mini program behavior.

**Architecture:** Update the global design tokens in `app.wxss`, align the shared custom tab bar with the new system, then refactor each sample page's WXML/WXSS in place so layout logic and JS bindings remain intact. Keep JS changes minimal and focused on UI-facing derived data only.

**Tech Stack:** WeChat mini program (`WXML`, `WXSS`, `JavaScript`)

---

## File Map

- Modify: `app.wxss`
- Modify: `components/customTabBar/customTabBar.wxml`
- Modify: `components/customTabBar/customTabBar.wxss`
- Modify: `pages/index/index.wxml`
- Modify: `pages/index/index.wxss`
- Modify: `pages/detail/detail.wxml`
- Modify: `pages/detail/detail.wxss`
- Modify: `pages/profile/profile.wxml`
- Modify: `pages/profile/profile.wxss`

### Task 1: Establish Shared Theme

**Files:**
- Modify: `app.wxss`
- Modify: `components/customTabBar/customTabBar.wxml`
- Modify: `components/customTabBar/customTabBar.wxss`

- [ ] Replace the existing warm-pink token set in `app.wxss` with a clearer cream, moss green, apricot, and ink system.
- [ ] Add reusable surface, chip, floating-card, and action-bar styles for the new visual language.
- [ ] Refactor the custom tab bar markup to support a cleaner icon badge + label structure.
- [ ] Restyle the custom tab bar so it matches the new theme and remains visually consistent on home and profile pages.

### Task 2: Refactor Home Page

**Files:**
- Modify: `pages/index/index.wxml`
- Modify: `pages/index/index.wxss`

- [ ] Rebuild the home page header into a branded hero section with comfortable spacing and clearer entry points.
- [ ] Restyle the category tabs and filter launcher into softer, more tactile controls.
- [ ] Redesign the filter panel to feel like a floating bottom sheet tied to the new theme.
- [ ] Refactor activity cards to better emphasize cover mood, title, metadata, host, and join action.

### Task 3: Refactor Detail Page

**Files:**
- Modify: `pages/detail/detail.wxml`
- Modify: `pages/detail/detail.wxss`

- [ ] Recompose the detail page into a layered hero + content card experience.
- [ ] Group the key facts into scannable stat/info sections.
- [ ] Rebuild the descriptive sections and host module into higher-trust content blocks.
- [ ] Redesign the fixed bottom action area with stronger primary emphasis and one-handed usability.

### Task 4: Refactor Profile Page

**Files:**
- Modify: `pages/profile/profile.wxml`
- Modify: `pages/profile/profile.wxss`

- [ ] Turn the top area into a personal brand card with identity and status emphasis.
- [ ] Replace the plain function list with grouped action cards and better visual priority.
- [ ] Add a lighter utility area for logout and secondary actions.
- [ ] Ensure the page still works with the shared custom tab bar and existing handlers.

### Task 5: Verify

**Files:**
- Modify: none

- [ ] Run a repository-wide search for obsolete class names that were unintentionally left behind.
- [ ] Read the changed files to ensure bindings and component references still match existing JS.
- [ ] Report that no automated mini program visual test harness exists in this workspace and provide manual verification notes instead.

## Self-Review

- Spec coverage: shared visual system, tab bar, home/detail/profile redesign, and safe interaction updates are all covered.
- Placeholder scan: no TODO/TBD placeholders remain.
- Scope check: the plan is constrained to three sample pages plus the shared theme layer.
