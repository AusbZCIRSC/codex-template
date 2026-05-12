# Feature: Design System

## Status

Draft

## Goal

Build the spark-tutor UI in a Bundeswehr-aligned visual style.

## Brand assets

Use provided assets:

- Bundeswehr logo
- Bundeswehr Sonderform logo
- Polygon vector/background asset
- Bundeswehr corporate design handbooks

## Typography

- Headlines: Bebas Neue if available.
- Body text: PT Sans if available.
- Fallback headlines: Arial Narrow, Arial, sans-serif.
- Fallback body: Arial, sans-serif.

## Colors

Core brand color:

```css
--bw-blue: rgb(0, 68, 113);
--bw-gray-logo: rgb(174, 187, 196);
```

Neutral UI colors should use accessible digital gray tones.

Accent colors must be used sparingly.

TSK/OrgBereich colors must only be used when the content clearly belongs to that organization.

## Layout

* Use a 12-column responsive grid.
* Support at least:
    * Desktop: 1404px
    * Tablet: 768px
    * Mobile: 320px
* Mobile should simplify to mostly single-column layouts.

## UI character

The UI should feel:

* clear
* focused
* structured
* robust
* calm
* official
* modern

Avoid:

* playful consumer-app styling
* excessive rounded corners
* random gradients
* unapproved colors
* distorted logos
* busy polygon backgrounds behind body text

## Components needed first

* Login page
* Chat layout
* Message bubbles
* Prompt input
* Attachment upload
* Settings panel
* Navigation/header
* Admin-only visual separation later

## Acceptance criteria

* UI uses shared design tokens.
* Logo is not distorted or recolored.
* Layout is responsive.
* Text has sufficient contrast.
* Polygon is used as a controlled decorative element, not as random background noise.