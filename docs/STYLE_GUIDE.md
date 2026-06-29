# NexaBank Design System & Style Guide

Welcome to the NexaBank design system. This document lists the typographic pairings, color palettes, button presets, form structures, animation curves, and accessibility standards that define our visual signature.

---

## 🎨 Color Palette

NexaBank uses an elegant, dark slate aesthetic centered on precision and contrast.

### Zinc/Slate Neutrals
Used for layouts, negative space, panels, and borders:
*   **Deep Canvas (Background)**: `#09090b` (`bg-zinc-950`)
*   **Elevated Card (Panels)**: `#18181b` (`bg-zinc-900`)
*   **Border/Lines**: `#27272a` (`border-zinc-800`)
*   **Subtle Text**: `#71717a` (`text-zinc-500` / `text-zinc-400`)
*   **Primary Text**: `#fafafa` (`text-zinc-50`)

### Dynamic Brand Accents
Used for buttons, highlights, balance charts, and interactive focus states:
*   **Brand Emerald**: `#10b981` (`emerald-500` - Success/Credit)
*   **Brand Amber**: `#f59e0b` (`amber-500` - Pending/In-progress)
*   **Brand Rose**: `#f43f5e` (`rose-500` - Debit/Error)
*   **Premium Gold**: `#eab308` (`yellow-500` - Premium upgrades)

---

## 🔠 Typography Hierarchy

Our system pairs modern geometric sans-serif fonts with monospaced accents for mechanical data points:

### Sans-Serif: **Inter** & **Geometrics**
*   **Display Header**: `font-sans font-bold text-3xl tracking-tight`
*   **Card Title**: `font-sans font-semibold text-lg text-zinc-100`
*   **Body Copy**: `font-sans font-normal text-sm text-zinc-300`

### Monospaced: **JetBrains Mono**
*   **Balance Figures**: `font-mono text-4xl font-semibold tracking-tighter text-white`
*   **Ledger Ledger Codes / References**: `font-mono text-xs text-zinc-500`
*   **Time Indexes**: `font-mono text-xs text-zinc-400`

---

## 🔘 Interactive Buttons

Buttons feature micro-animations on hover and active states.

### Primary Emerald Button
Used for actions:
*   **Class**: `bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg px-4 py-2 transition-all active:scale-[0.98]`

### Secondary Outline Button
Used for secondary actions:
*   **Class**: `border border-zinc-800 hover:border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 px-4 py-2 rounded-lg transition-all`

---

## 📝 Input Forms & Security PADS

Forms emphasize high visibility and legible active borders:

*   **Standard Inputs**:
    *   **Class**: `w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg p-3 text-white transition-all outline-none`
*   **Security PIN Code Pad Buttons**:
    *   **Class**: `w-14 h-14 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-xl font-semibold transition-all flex items-center justify-center border border-zinc-800 hover:border-zinc-700 active:scale-95`

---

## 🎴 Visual Panels & Cards

Containers emphasize layered depths without generic clutter:

```
┌──────────────────────────────────────────────────┐
│  Card (bg-zinc-900 border-zinc-800 rounded-xl)   │
│                                                  │
│   ┌──────────────────────────────────────────┐   │
│   │  Inside Panel (bg-zinc-950)              │   │
│   └──────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

*   **Main Container Card**: `bg-zinc-900/50 backdrop-blur-md border border-zinc-800/80 rounded-xl p-6 shadow-xl`
*   **Nested Panel (Inset)**: `bg-zinc-950/80 border border-zinc-800 rounded-lg p-4`

---

## 🔄 Motion Curves & Animations

All transitions use standard Framer Motion dynamic curves:

*   **Layout Transitions (Staggered)**:
    ```typescript
    const containerVariants = {
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };
    const itemVariants = {
      hidden: { opacity: 0, y: 15 },
      show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
    };
    ```
*   **Drawer Slide**:
    *   Stiffness: `120`, damping: `18`.

---

## 📱 Responsive Principles

NexaBank is optimized for all screen form-factors:

*   **Mobile Screen Bounds (`< 640px`)**: Sidebars are hidden, revealing a bottom navigation bar. Spacing is compressed to `p-4` with touch target areas enlarged to a minimum of `48px`.
*   **Tablet Bound (`640px - 1024px`)**: Navigation collapses to compact sidebars.
*   **Desktop Expand (`> 1024px`)**: Fully expanded visual layouts.

---

## ♿ Accessibility Rules

To ensure accessible and comfortable usage:
*   **High Contrast Limits**: Body copy enforces contrast ratios above **4.5:1** against underlying dark panels. No low-contrast dark-on-dark text is allowed.
*   **Dynamic Touch Targets**: Interactive buttons and inputs maintain a minimum vertical touch area of **44px** on mobile breakpoints.
*   **Keyboard Controls**: Focus states include active outlines (`focus-visible:ring-2 focus-visible:ring-emerald-500`) to support keyboard navigation.

For API guides or deployment procedures, see:
*   [API Specification](./API.md)
*   [Production Deployment Manual](./DEPLOYMENT.md)

---

**Author**: Luckman World
