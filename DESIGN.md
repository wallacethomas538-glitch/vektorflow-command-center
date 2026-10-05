---
name: Cybernetic Mission Deck
colors:
  surface: '#10141a'
  surface-dim: '#10141a'
  surface-bright: '#353940'
  surface-container-lowest: '#0a0e14'
  surface-container-low: '#181c22'
  surface-container: '#1c2026'
  surface-container-high: '#262a31'
  surface-container-highest: '#31353c'
  on-surface: '#dfe2eb'
  on-surface-variant: '#bac9cc'
  inverse-surface: '#dfe2eb'
  inverse-on-surface: '#2d3137'
  outline: '#849396'
  outline-variant: '#3b494c'
  surface-tint: '#00daf3'
  primary: '#c3f5ff'
  on-primary: '#00363d'
  primary-container: '#00e5ff'
  on-primary-container: '#00626e'
  inverse-primary: '#006875'
  secondary: '#b2c5ff'
  on-secondary: '#002b73'
  secondary-container: '#0065f6'
  on-secondary-container: '#f3f3ff'
  tertiary: '#b1ffbf'
  on-tertiary: '#003918'
  tertiary-container: '#22ef7e'
  on-tertiary-container: '#006731'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#9cf0ff'
  primary-fixed-dim: '#00daf3'
  on-primary-fixed: '#001f24'
  on-primary-fixed-variant: '#004f58'
  secondary-fixed: '#dae2ff'
  secondary-fixed-dim: '#b2c5ff'
  on-secondary-fixed: '#001848'
  on-secondary-fixed-variant: '#0040a1'
  tertiary-fixed: '#62ff96'
  tertiary-fixed-dim: '#00e475'
  on-tertiary-fixed: '#00210b'
  on-tertiary-fixed-variant: '#005226'
  background: '#10141a'
  on-background: '#dfe2eb'
  surface-variant: '#31353c'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-mono-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-mono-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-mono-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 12px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style
The design system establishes a tactical, high-velocity mission control interface engineered for real-time autonomous agent supervision. Drawing inspiration from deep-space telemetry modules, orbital command bridges, and advanced cybernetic HUDs, the aesthetic balances pure utilitarian data density with cinematic sci-fi elegance.

The experience targets AI operators, system engineers, and mission directors overseeing multi-agent operational swarms. The interface evokes uncompromised authority, absolute computational precision, and situational calm under critical system loads.

Visual execution blends dark glassmorphism with high-contrast tactical displays: deep void obsidian foundations, luminous cyan data conduits, low-intensity translucent grid boundaries, and purposeful neon telemetry markers. Monospaced instrumentation readouts anchor high-density data, while sharp, modern grotesque headings command navigational hierarchy.

## Colors
The color architecture operates strictly on an orbital dark spectrum, reserving chromatic saturation for real-time telemetry, agent state communication, and actionable alerts.

- **Primary (`#00e5ff`)**: Neon Cyan. Dedicated to active states, selected nodes, critical directional paths, primary triggers, and high-priority data links.
- **Secondary (`#1e6fff`)**: Electric Cobalt. Used for sub-systems, ambient energy fills, secondary triggers, container framing, and passive structural paths.
- **Tertiary (`#00e676`)**: Orbital Green. Exclusively signals optimal uptime, nominal execution, synchronized agent status, and successful mission verification.
- **Neutral Tier**:
  - `Canvas / Void`: `#0a0e14` (Deepest pitch-charcoal background layer)
  - `Surface 1 / Deck`: `#0f141c` (Primary card and navigation chassis fill)
  - `Surface 2 / Module`: `#151b26` (Elevated modals, inner sensor bays, active popovers)
  - `Surface Border`: `rgba(0, 229, 255, 0.15)` (Subtle reactive edge lighting)
- **Functional Telemetry Accents**:
  - Alert Red (`#ff3d71`): Terminal breaches, system faults, failed agent loops.
  - Busy Amber (`#ffb300`): Intensive computation, token throttling, active queue bottlenecks.
  - Text High Contrast (`#f0f6fc`): Primary headings and critical values.
  - Text Muted (`#62748e`): Labels, timestamps, and secondary operational telemetry.

## Typography
The typographic hierarchy employs a hybrid discipline:
1. **Space Grotesk** directs user attention across high-level mission nodes, sector modules, and page view titles. Its sharp geometric cuts reinforce the advanced avionics environment.
2. **Inter** manages descriptive mission briefings, chat stream dialogs, and continuous conversational logs, ensuring zero eye strain during prolonged monitoring sessions.
3. **JetBrains Mono** delivers terminal-grade telemetry: agent latencies, memory footprints, hash digests, parameters, and timecodes.

All monospaced labels at `label-mono-sm` and `label-mono-md` must be rendered in full uppercase with explicit letter-spacing to mimic avionics HUD telemetry.

## Layout & Spacing
The layout follows a mobile-first, single-column command stack designed for swift thumb traversal and thumb-reach hotzones.

- **Grid Architecture**: 4-column dynamic fluid layout for mobile devices, expanding to 8 columns on tablet viewports. Columns maintain a `1rem` (16px) gutter. Outer margins lock rigidly at `1rem` (16px) on mobile viewports to preserve maximum data real estate while shielding components from curved hardware display borders.
- **Rhythm & Padding**: Component spacing operates strictly on an 8-point baseline grid with a 4-point micro-step (`space-xs`). Tactical cards feature internal container padding of `space-md` (16px). Compact telemetry modules utilize `space-sm` (8px).
- **Safe Area Anchoring**: The canvas reserves dynamic bottom padding (minimum 88px) to account for the elevated bottom bar dock and the operating system home indicator.

## Elevation & Depth
Depth does not rely on traditional muddy black shadows; it is established through illuminated glass boundaries, luminous diffusion, and multi-tier surface luminosity.

- **Base Void (`#0a0e14`)**: Ground level substrate, 0px elevation.
- **Glass Deck Cards (Elevation Level 1)**:
  - Background: `rgba(15, 20, 28, 0.72)`
  - Backdrop Filter: `blur(16px) saturate(180%)`
  - Border: 1px solid `rgba(0, 229, 255, 0.15)`
  - Ambient Glow: `0 8px 32px 0 rgba(0, 0, 0, 0.45)` with a top edge internal highlight `inset 0 1px 0 0 rgba(0, 229, 255, 0.2)`
- **Interactive Focus / Alert (Elevation Level 2)**:
  - Background: `rgba(21, 27, 38, 0.85)`
  - Backdrop Filter: `blur(20px)`
  - Border: 1px solid `rgba(0, 229, 255, 0.4)`
  - Halo Projection: `0 0 20px -2px rgba(0, 229, 255, 0.25), 0 12px 28px -4px rgba(0, 0, 0, 0.6)`
- **Overlays, Sheets & Modals (Elevation Level 3)**:
  - Background: `#0f141c` with 95% opacity.
  - Border: 1px solid `rgba(30, 111, 255, 0.35)`
  - Diffusion: `0 24px 48px -8px rgba(0, 0, 0, 0.8)`

## Shapes
The system implements a structured corner aesthetic (`roundedness: 2` with standard radii scaled at 16px / `1rem` for major modules and cards).

- **Primary Cards & Mission Containers**: Formed with uniform `16px` (`rounded-lg`) corners.
- **Badges, Status Nodes & Telemetry Tags**: Formed with `8px` (`rounded`) corners to create an engineered, chiseled chip visual.
- **Form Controls & Action Buttons**: Utilize `12px` rounded geometries for fluid tactile handling.
- **Navigation Dock Chassis**: Features `24px` (`rounded-xl`) upper corner radii when floating, or `16px` fully encapsulated pill styling when offset from device boundaries.

## Components

### Buttons
- **Primary Tactical Trigger**: Neon Cyan background (`#00e5ff`) with deep obsidian typography (`#0a0e14`, `font-weight: 700`, `Space Grotesk`). Height: 48px. Glow cast: `0 0 16px rgba(0, 229, 255, 0.4)`. Active state introduces subtle inner contrast scaling.
- **Secondary Systems Trigger**: Dark glass module fill (`#151b26`), 1px solid `rgba(30, 111, 255, 0.4)`, text in `#00e5ff`.
- **Ghost/Tertiary Action**: Transparent fill with `JetBrains Mono` label, framed by `rgba(255, 255, 255, 0.08)` hairline border.

### Status Badges & Telemetry Chips
- Compact, high-readability chips with background opacity at 10% and solid neon borders:
  - **Online**: Background `rgba(0, 230, 118, 0.1)`, text and border `#00e676`. Includes an animated pulsing 6px neon point.
  - **Active / Streaming**: Background `rgba(0, 229, 255, 0.1)`, text and border `#00e5ff`.
  - **Busy**: Background `rgba(255, 179, 0, 0.1)`, text and border `#ffb300`.
  - **Alert / Breach**: Background `rgba(255, 61, 113, 0.12)`, text and border `#ff3d71`.

### Mission & Agent Cards
- Surface: Glassmorphic base container with 16px border-radius.
- Framing: 1px hairline border using `rgba(0, 229, 255, 0.15)`.
- Internal Layout: Card head hosts agent avatar/icon (with status halo), agent name in `Space Grotesk`, and current latency or load in `JetBrains Mono`. Card body isolates dynamic log excerpts or streaming tasks. Card footer houses micro action triggers.

### Inputs & Terminal Fields
- Dark input bays rendered in `#0a0e14` with a 1px border of `rgba(0, 229, 255, 0.2)`. Text renders in `#f0f6fc` using `Inter` for natural language or `JetBrains Mono` for command prompts.
- Focus State: Border transitions to `#00e5ff` with an outer glow `0 0 8px rgba(0, 229, 255, 0.3)`.

### Checkboxes & Toggle Controls
- Custom technical switches with dark rails (`#0a0e14`) framed in `rgba(0, 229, 255, 0.2)`. The thumb glows solid `#00e5ff` on activation, switching the rail to `#1e6fff`.

### 4-Tab Mobile Command Navigation Bar
- **Chassis**: Floating dock pinned 16px above the device bottom margin. Glassmorphic deep charcoal surface (`rgba(15, 20, 28, 0.88)`), 16px radius, backdrop blur `24px`, top edge stroke `rgba(0, 229, 255, 0.2)`.
- **Tabs**: `Home`, `Agents`, `Chat`, `Missions`.
- **Active State Indicator**: Active icon and mono-label ignite in full `#00e5ff` neon illumination, supported by an under-slung horizontal cyan laser indicator line (2px height, 16px width) casting a vertical blur (`0 0 8px #00e5ff`).
- **Inactive State**: Muted telemetry grey (`#62748e`), zero bloom.
