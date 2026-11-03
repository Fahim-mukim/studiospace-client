# StudioSpace Brand Guidelines

## Brand direction

**Cinematic Editorial × Modern Creative Marketplace.** StudioSpace is a
considered, inventive, welcoming, dependable guide to premium places for
creative work. Use expressive, documentary-style imagery and editorial
typography with calm, legible interface patterns. Avoid generic SaaS styling,
stock startup imagery, excessive ornament, and unverified trust claims.

## Logo

The original abstract aperture-frame uses six geometric blades around an open
center. The open center suggests a doorway and a space for making. It is not a
literal camera shutter or a recreation of another photography brand.

- Use `StudioSpaceLogo` from `src/components/brand/studiospace-logo.jsx`.
- `horizontal` is the primary lockup, `compact` is for constrained wordmark
  placement, and `icon` is for icon-only use.
- Use `StudioSpaceMark` when the icon needs an explicit size.
- Keep clear space of at least one quarter of the mark width around it. Do not
  stretch, rotate, add outlines, or place it on noisy imagery.
- The mark uses `currentColor` in the React component and inherits the active
  foreground token. The app SVG icon uses a fixed warm-ivory tile for browser
  legibility.

## Palette and semantic tokens

Brand palette:

| Color | Value | Use |
|---|---|---|
| Deep Ink | `#1B211F` | Light-theme foreground |
| Warm Ivory | `#F4F1E8` | Light-theme background |
| Soft Surface | `#FFFDF8` | Light cards and popovers |
| Interactive Copper | `#A94F31` | Light-theme primary actions and focus |
| Decorative Copper | `#C66A45` | Illustration and large decorative accents |
| Interactive Sage | `#59664F` | Light-theme accent text/surfaces |
| Decorative Sage | `#78836B` | Large decorative accents |
| Muted Text | `#626B65` | Light-theme secondary text |

Use the CSS variables in `src/app/globals.css` for semantic component classes:
`background`, `foreground`, `card`, `popover`, `primary`, `secondary`,
`accent`, `muted`, `border`, `input`, `ring`, `destructive`, `success`, and
`warning`, each with a foreground token where applicable. These values switch
under `.dark`. Do not hard-code light/dark color pairs in components.

Decorative Copper and Sage are not small-text colors on light surfaces. Use
the interactive darker variants for text and controls. Keep status meaning in
visible labels/icons as well as color.

## Theme values

| Token | Light | Dark |
|---|---|---|
| Background / foreground | `#F4F1E8` / `#1B211F` | `#151A18` / `#F4F1E8` |
| Card / card foreground | `#FFFDF8` / `#1B211F` | `#1C2320` / `#F4F1E8` |
| Popover / foreground | `#FFFDF8` / `#1B211F` | `#232B27` / `#F4F1E8` |
| Primary / foreground | `#A94F31` / `#FFFFFF` | `#E08A65` / `#1B211F` |
| Secondary / foreground | `#E5E8DF` / `#1B211F` | `#2A342E` / `#F4F1E8` |
| Accent / foreground | `#59664F` / `#FFFFFF` | `#A6B094` / `#151A18` |
| Muted / foreground | `#ECEAE2` / `#626B65` | `#252D29` / `#B4BDB5` |
| Border / input / ring | `#DDDCD3` / `#C9C8BD` / `#A94F31` | `#3A4540` / `#46514B` / `#E08A65` |
| Destructive / foreground | `#B42318` / `#FFFFFF` | `#FF7A70` / `#151A18` |
| Success / foreground | `#2F6F4E` / `#FFFFFF` | `#7BCC9B` / `#151A18` |
| Warning / foreground | `#805000` / `#FFFFFF` | `#F5BD5C` / `#151A18` |

## Typography

- **Display:** Instrument Serif, regular and italic, for major editorial
  headings and selected emphasis.
- **Interface/body:** Geist for navigation, buttons, forms, cards, labels, and
  reading text. Geist Mono is available only for technical values when useful.
- **Scale:** display `clamp(3.5rem, 7vw, 5.5rem)`; page heading
  `clamp(2.75rem, 5vw, 4.5rem)`; section heading
  `clamp(2rem, 3.5vw, 3rem)`; card title 21–28px; body 16–18px; secondary
  14–16px; metadata 12–13px.
- Use 400–600 weights for most content. Keep uppercase tracking to short
  metadata labels. Body line height should remain comfortable (about 1.5–1.65).
- Fonts are loaded with `next/font` in the root layout; do not add remote CSS
  font URLs or unlicensed files.
- Set the client-only `NEXT_PUBLIC_SITE_URL` to the canonical frontend origin
  for production metadata and social-image URLs. It is public configuration,
  not a secret; local development falls back to `http://localhost:3000`.

## Component principles

The shadcn CLI is configured in `components.json` for `new-york` style,
JavaScript (`tsx: false`), RSC, Lucide, Tailwind v4 CSS variables, and the
existing `@/*` alias. UI primitives live in `src/components/ui`; reusable
helpers live in `src/lib`.

- **Button:** accessible copper primary, calm secondary, and outlined/ghost
  variants. Maintain visible focus and generous hit areas.
- **Card:** warm semantic surface, quiet border, restrained shadow, and
  editorial composition. Studio cards should later be custom image-led
  components, not generic admin tiles.
- **Badge:** short category/status labels; use semantic status variants and
  readable text.
- **Input/Label:** persistent visible labels, clear errors, and obvious focus.
- **Dialog/Sheet/Dropdown/Tooltip:** use accessible shadcn primitives; keep
  focus behavior and keyboard interaction intact.
- **Separator/Skeleton:** use subtle borders and low-contrast loading states.
- Build reusable compositions such as StudioCard, CategoryCard, navigation,
  and trust notes from these foundations only when needed.

## Layout, spacing, shape, and motion

- Main content max width: about 1320px; use responsive 20–48px page gutters.
- Use an 8px spacing rhythm. Large editorial sections generally need 48–96px
  vertical breathing room, adjusted by viewport and content.
- Base radius is 14px; inputs and buttons are 12–16px; cards 20–24px.
- Use borders/surface changes for ordinary cards and reserve shadows for
  floating menus, dialogs, and selected depth.
- Transitions are tokenized as fast 140ms, base 200ms, slow 320ms with a
  standard ease curve. CSS handles simple hover/focus interactions.
- Respect `prefers-reduced-motion`; avoid motion that delays content or shifts
  layout.

## Icons and assets

Lucide React is the single UI icon system. Use consistent 16–20px icons,
matching stroke weight, and `aria-hidden` when nearby text already names the
action. Icon-only controls need accessible names.

Keep brand assets in `public/brand/`, editorial imagery in
`public/images/hero/`, `public/images/categories/`, and
`public/images/studios/<slug>/`, illustrations in
`public/images/illustrations/`, and licensed local fonts in `public/fonts/`.
Use original, commissioned, or documented licensed media. The social preview
is generated by the App Router Open Graph image route.

## Accessibility

- Target WCAG AA: at least 4.5:1 for normal text and 3:1 for large text and
  meaningful UI graphics.
- Never communicate status by color alone. Use labels/icons in addition to
  semantic colors.
- Keep landmarks and heading order semantic. Use visible keyboard focus,
  associated form labels, accessible names for icon-only buttons, and
  keyboard-operable menus and dialogs.
- Provide useful image alt text; use empty alt text for decoration.
- Verify contrast for final component states, not just palette samples.
- Preserve reduced-motion preferences and responsive behavior.
