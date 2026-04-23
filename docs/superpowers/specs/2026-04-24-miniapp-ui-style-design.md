# Mini App UI Style Design

## Goal

Refactor the sample WeChat mini program pages into a more distinctive visual language inspired by the provided reference, while keeping the existing routing and core business flow intact.

## Design Direction

The new direction is "young and playful with a warm cream base". It should keep the reference image's comfortable, rounded, low-pressure feeling, but move away from direct imitation by introducing a more branded mix of cream, moss green, apricot orange, and dark ink text.

This product should feel like a lively social app for finding companions, not a generic utility app.

## Visual Principles

### 1. Tone

- Warm cream backgrounds instead of plain white
- Soft floating surfaces instead of heavy cards
- Rounded geometry with layered radii
- Higher contrast for key actions and important status
- More playful accents in badges, chips, and highlight areas

### 2. Color System

- Background: warm cream, off-white, light beige gradients
- Primary: moss/sage green for active states and trusted actions
- Accent: apricot orange for playful highlights and CTA glow
- Text: deep ink for titles, warm gray for secondary information
- Border/shadow: low-contrast foggy edges instead of hard lines

### 3. Components

- Header areas should feel branded and breathable, not like plain nav bars
- Tabs and chips should feel touchable, soft, and stateful
- Cards should use layered content blocks with subtle glow and badge treatments
- Bottom action areas should feel anchored and easier to tap one-handed
- Personal center should look like a profile hub, not a settings sheet

## Sample Page Scope

### Home

Keep the current discovery/feed logic but upgrade the experience into:

- A branded top hero area
- More expressive tab and filter controls
- Activity cards that communicate mood, status, and trust more clearly
- Better spacing rhythm between cards, metadata, and actions

### Detail

Turn the current information page into a more immersive decision page:

- Richer hero section
- Group key facts into digestible cards
- Emphasize activity atmosphere and host credibility
- Rebuild the bottom action bar with clearer primary/secondary priority

### Profile

Turn the current settings-like page into a personal hub:

- Strong profile identity card
- Function entries grouped as action cards
- Better separation between user info, social assets, and utility actions

## Interaction Boundaries

Allowed:

- Improve visual hierarchy
- Improve spacing, grouping, and readability
- Improve filter panel presentation
- Improve bottom action layout
- Improve perceived touch comfort

Not allowed:

- Change page routing
- Change core data fields
- Change join/apply flow semantics
- Rebuild unrelated pages in this pass

## Technical Notes

- The codebase is a WeChat mini program using WXML/WXSS/JS
- Shared variables already exist in `app.wxss` and should be redesigned rather than bypassed
- `components/customTabBar` should be visually aligned with the three sample pages
- This repo is not a git repository in the current workspace, so the design doc cannot be committed from here
