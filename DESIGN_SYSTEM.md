# Agrivus Mobile Design System

## Neumorphic Design Language v1.0

---

## 1. Color Palette

### Primary Colors (Green System)

The primary green palette establishes brand identity and is used for CTAs, active states, and key interactions.

| Shade | Hex Code  | Usage                             |
| ----- | --------- | --------------------------------- |
| 50    | `#E8F5E9` | Backgrounds, very light fills     |
| 100   | `#C8E6C9` | Hover backgrounds, disabled fills |
| 200   | `#A5D6A7` | Light accents, progress fills     |
| 300   | `#81C784` | Secondary buttons, tags           |
| 400   | `#66BB6A` | Medium emphasis elements          |
| 500   | `#4CAF50` | **Primary brand color**           |
| 600   | `#43A047` | **Primary CTAs, buttons**         |
| 700   | `#388E3C` | Pressed states, strong emphasis   |
| 800   | `#2E7D32` | Dark accents, text on light       |
| 900   | `#1B5E20` | Darkest accent, headers           |

### Neumorphic Base Colors

These colors create the soft, tactile neumorphic surface aesthetic.

| Name            | Hex Code  | Usage                               |
| --------------- | --------- | ----------------------------------- |
| Base Background | `#E8E8EC` | Main screen backgrounds             |
| Card Surface    | `#FAFAFA` | Card backgrounds, elevated surfaces |
| Input Surface   | `#F0F0F4` | Input field backgrounds             |
| Pressed Surface | `#DCDCE0` | Pressed/inset states                |
| Shadow Dark     | `#BEBEC3` | Dark shadow component               |
| Shadow Light    | `#FFFFFF` | Light shadow component              |

### Secondary Colors (Orange/Amber)

For alerts, warnings, and secondary actions.

| Shade | Hex Code  | Usage                     |
| ----- | --------- | ------------------------- |
| 50    | `#FFF3E0` | Light warning backgrounds |
| 500   | `#FF9800` | Warning indicators        |
| 600   | `#FB8C00` | Secondary CTAs            |
| 700   | `#F57C00` | Pressed warning states    |

### Semantic Colors

| Purpose | Hex Code  | Usage                           |
| ------- | --------- | ------------------------------- |
| Success | `#4CAF50` | Confirmations, completed states |
| Warning | `#FF9800` | Alerts, pending states          |
| Error   | `#F44336` | Errors, destructive actions     |
| Info    | `#2196F3` | Information, links              |

### Text Colors

| Name      | Hex Code  | Contrast | Usage                            |
| --------- | --------- | -------- | -------------------------------- |
| Primary   | `#2C2C2C` | 8.2:1 ✓  | Main text, headings              |
| Secondary | `#666666` | 5.1:1 ✓  | Descriptions, labels             |
| Tertiary  | `#999999` | 3.5:1    | Placeholders, hints              |
| Inverse   | `#FFFFFF` | N/A      | Text on dark/colored backgrounds |
| Accent    | `#2E7D32` | 4.8:1 ✓  | Links, emphasis                  |

---

## 2. Background Patterns

### Leaf Motif Specifications

Decorative leaf patterns extend the agricultural theme throughout the app.

#### Pattern Configuration by Screen Type

| Screen Type           | Leaf Count | Opacity    | Positions                      |
| --------------------- | ---------- | ---------- | ------------------------------ |
| Auth (Login/Register) | 4          | 30% (0.3)  | Corners + floating             |
| Dashboard/Home        | 3          | 25% (0.25) | Top-right, bottom-left, center |
| List Views            | 2          | 15% (0.15) | Top-right, bottom-left         |
| Detail Pages          | 1          | 10% (0.1)  | Top-right corner               |
| Forms                 | 1          | 10% (0.1)  | Bottom-right corner            |
| Profile               | 3          | 20% (0.2)  | Behind avatar, corners         |

#### Leaf Positions

```
Auth Screen Layout:
┌─────────────────────────┐
│  🍃              🍃    │
│         LOGO           │
│                        │
│      [  Form  ]        │
│                        │
│  🍃              🍃    │
└─────────────────────────┘

Dashboard Layout:
┌─────────────────────────┐
│                   🍃   │
│      Stats Cards       │
│           🍃           │
│      Quick Actions     │
│  🍃                    │
└─────────────────────────┘
```

#### Leaf SVG Specifications

- **Color**: Primary green with opacity
- **Size Range**: 40px - 120px
- **Rotation**: Varied (-45° to 45°)
- **Blur**: 0px (crisp) to 2px (soft background)

---

## 3. Shadow Hierarchy

### Neumorphic Shadow System

The shadow system creates depth and tactile feedback.

#### Level 1 - Minimal (Subtle elements)

```
Light Shadow: offset(-2, -2), blur: 4px, color: #FFFFFF, opacity: 0.7
Dark Shadow: offset(2, 2), blur: 4px, color: #BEBEC3, opacity: 0.15
```

**Usage**: Disabled buttons, subtle dividers, background elements

#### Level 2 - Subtle (Default cards)

```
Light Shadow: offset(-3, -3), blur: 6px, color: #FFFFFF, opacity: 0.8
Dark Shadow: offset(3, 3), blur: 6px, color: #BEBEC3, opacity: 0.2
```

**Usage**: Cards at rest, input fields, list items

#### Level 3 - Medium (Interactive elements)

```
Light Shadow: offset(-4, -4), blur: 8px, color: #FFFFFF, opacity: 0.9
Dark Shadow: offset(4, 4), blur: 8px, color: #BEBEC3, opacity: 0.25
```

**Usage**: Buttons, active cards, floating action buttons

#### Level 4 - Elevated (Focused/Hover)

```
Light Shadow: offset(-6, -6), blur: 12px, color: #FFFFFF, opacity: 1.0
Dark Shadow: offset(6, 6), blur: 12px, color: #BEBEC3, opacity: 0.3
```

**Usage**: Hovered cards, modal backgrounds, dropdowns

#### Level 5 - Maximum (Modals/Overlays)

```
Light Shadow: offset(-8, -8), blur: 16px, color: #FFFFFF, opacity: 1.0
Dark Shadow: offset(8, 8), blur: 16px, color: #BEBEC3, opacity: 0.35
```

**Usage**: Modals, bottom sheets, floating panels

### Inset Shadows (Pressed states)

```
Inset Light: inset offset(2, 2), blur: 4px, color: #FFFFFF, opacity: 0.5
Inset Dark: inset offset(-2, -2), blur: 4px, color: #BEBEC3, opacity: 0.2
```

**Usage**: Pressed buttons, active inputs, selected items

### Colored Glow (Primary buttons)

```
Glow: offset(0, 6), blur: 12px, color: #4CAF50, opacity: 0.3
```

**Usage**: Primary CTAs, success states, active elements

---

## 4. Background Treatments

### Screen Backgrounds

#### Primary Screen Background

```css
background: linear-gradient(135deg, #e8e8ec 0%, #f0f0f4 50%, #e8e8ec 100%);
```

#### Auth Screen Background

```css
background: linear-gradient(180deg, #e8f5e9 0%, #e8e8ec 30%, #e8e8ec 100%);
```

### Card Backgrounds

#### Default Card

```
background: #FAFAFA
border-radius: 16px
```

#### Elevated Card

```
background: linear-gradient(135deg, #FFFFFF 0%, #F8F8FA 100%)
border-radius: 16px
```

### Input Field Backgrounds

```
background: #F0F0F4
border-radius: 12px
border: 1px solid rgba(0, 0, 0, 0.05)
```

### Section Headers

```
background: transparent to linear-gradient(90deg, transparent, #E8E8EC, transparent)
```

---

## 5. Button Specifications

### Primary Button (Green)

**Default State:**

```
background: linear-gradient(135deg, #4CAF50 0%, #43A047 100%)
border-radius: 28px
padding: 18px 24px
shadow: 0 6px 12px rgba(76, 175, 80, 0.3)
```

**Pressed State:**

```
background: #388E3C
transform: scale(0.98)
shadow: 0 2px 4px rgba(76, 175, 80, 0.2)
```

**Disabled State:**

```
background: #C8E6C9
opacity: 0.6
shadow: none
```

### Secondary Button (Outlined)

**Default State:**

```
background: transparent
border: 2px solid #4CAF50
border-radius: 28px
color: #4CAF50
```

**Pressed State:**

```
background: rgba(76, 175, 80, 0.1)
transform: scale(0.98)
```

### Tertiary Button (Ghost)

**Default State:**

```
background: transparent
color: #4CAF50
padding: 12px 16px
```

### Icon Button

**Default State:**

```
background: #FAFAFA
border-radius: 50%
width/height: 48px
shadow: Level 2 neumorphic
```

### Button Sizes

| Size   | Height | Horizontal Padding | Font Size | Icon Size |
| ------ | ------ | ------------------ | --------- | --------- |
| Small  | 40px   | 16px               | 14px      | 18px      |
| Medium | 48px   | 24px               | 16px      | 20px      |
| Large  | 56px   | 32px               | 18px      | 24px      |

---

## 6. Component Library

### Cards

#### Standard Card

```
background: #FAFAFA
border-radius: 16px
padding: 16px
shadow: Level 2 neumorphic
```

#### Interactive Card (Pressable)

```
Default: Standard Card + Level 2 shadow
Pressed: Inset shadow + scale(0.98)
```

#### Stat Card

```
background: linear-gradient(135deg, #FFFFFF 0%, #F8F8FA 100%)
border-radius: 20px
padding: 20px
icon-background: primary[50] with 15% opacity
```

### Inputs

#### Text Input

```
background: #F0F0F4
border-radius: 12px
padding: 16px
border: 1px solid transparent
shadow: inset Level 1
```

**Focused State:**

```
border: 2px solid #4CAF50
shadow: 0 0 0 3px rgba(76, 175, 80, 0.1)
```

#### Search Input

```
background: #FAFAFA
border-radius: 24px
padding: 12px 16px
left-icon: Search icon at 20px
```

### Badges

#### Status Badge

```
padding: 4px 12px
border-radius: 12px
font-size: 12px
font-weight: 600
```

| Status  | Background | Text Color |
| ------- | ---------- | ---------- |
| Success | `#E8F5E9`  | `#2E7D32`  |
| Warning | `#FFF3E0`  | `#E65100`  |
| Error   | `#FFEBEE`  | `#C62828`  |
| Info    | `#E3F2FD`  | `#1565C0`  |
| Neutral | `#F5F5F5`  | `#616161`  |

### Avatars

#### Default Avatar

```
size: 48px (small), 64px (medium), 80px (large)
border-radius: 50%
background: #E8F5E9
border: 3px solid #FAFAFA
shadow: Level 2 neumorphic
```

#### Avatar with Status

```
status-dot: 12px diameter
position: bottom-right, offset -2px
border: 2px solid #FAFAFA
```

---

## 7. Typography Scale

### Headings

| Level | Size | Weight         | Line Height | Letter Spacing |
| ----- | ---- | -------------- | ----------- | -------------- |
| H1    | 32px | Bold (700)     | 1.2         | -0.5px         |
| H2    | 28px | Bold (700)     | 1.25        | -0.5px         |
| H3    | 24px | Semibold (600) | 1.3         | -0.25px        |
| H4    | 20px | Semibold (600) | 1.35        | 0              |
| H5    | 18px | Medium (500)   | 1.4         | 0              |
| H6    | 16px | Medium (500)   | 1.4         | 0              |

### Body Text

| Style      | Size | Weight         | Line Height |
| ---------- | ---- | -------------- | ----------- |
| Body Large | 18px | Regular (400)  | 1.6         |
| Body       | 16px | Regular (400)  | 1.5         |
| Body Small | 14px | Regular (400)  | 1.5         |
| Caption    | 12px | Regular (400)  | 1.4         |
| Overline   | 10px | Semibold (600) | 1.4         |

---

## 8. Spacing System

Based on 4px grid system.

| Token | Value | Usage                            |
| ----- | ----- | -------------------------------- |
| xs    | 4px   | Tight spacing, icon gaps         |
| sm    | 8px   | Related elements, inline spacing |
| md    | 16px  | Standard spacing, card padding   |
| lg    | 24px  | Section spacing, large gaps      |
| xl    | 32px  | Major sections, screen padding   |
| 2xl   | 48px  | Hero sections, large separators  |

---

## 9. Accessibility Guidelines

### Contrast Ratios

- **Primary text on background**: 8.2:1 ✓ (WCAG AAA)
- **Secondary text**: 5.1:1 ✓ (WCAG AA)
- **Interactive elements**: 4.5:1+ minimum
- **Large text (18px+)**: 3:1 minimum

### Touch Targets

- **Minimum size**: 44x44px
- **Recommended size**: 48x48px
- **Spacing between targets**: 8px minimum

### Focus Indicators

```
outline: 2px solid #4CAF50
outline-offset: 2px
```

Or use focus ring:

```
box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.4)
```

### Motion Preferences

Respect `prefers-reduced-motion`:

- Reduce animation durations to 0-100ms
- Remove parallax effects
- Keep essential transitions only

---

## 10. Do's and Don'ts

### ✅ Do's

- Use consistent shadow levels across similar elements
- Maintain the soft, tactile neumorphic aesthetic
- Keep leaf patterns subtle and non-distracting
- Ensure all interactive elements have visible state changes
- Use the primary green for main CTAs only
- Test contrast ratios for accessibility

### ❌ Don'ts

- Don't mix flat design with neumorphic elements
- Don't use hard drop shadows
- Don't overuse colored elements
- Don't make leaf patterns too prominent
- Don't use pure black (#000000) for text
- Don't place interactive elements closer than 8px apart

---

_Last Updated: January 2026_
_Version: 1.0_
