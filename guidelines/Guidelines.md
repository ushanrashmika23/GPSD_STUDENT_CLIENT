# AxiomMaths — Student Portal Design Guidelines

A premium, minimal student portal for a Sri Lankan Combined Mathematics tuition institute.
Aesthetic reference: **Linear · Stripe Dashboard · Notion**. Calm, precise, generous whitespace.
Never resemble Moodle / Blackboard / Google Classroom.

## Stance
Modern SaaS product surface. Quiet by default, expressive on interaction. Content breathes.
No clutter, no heavy borders, no loud gradients. Confidence through restraint.

## Type
- Display / headings: **Inter Tight** (`font-display`) — tight tracking, medium/semibold weight.
- Body / UI: **Inter** (`font-sans`).
- Numerals, stat values, codes (callup no., NIC): **JetBrains Mono** (`font-mono`, use `tabular-nums`).
- Lean on base element type styles; only override sizes intentionally for display numbers and labels.

## Color tokens (use mapped Tailwind classes, never raw hex)
- `bg-background` #F8FAFC — page ground
- `bg-card` #FFFFFF — surfaces / cards
- `text-foreground` #0F172A — primary text
- `text-muted-foreground` #64748B — labels, captions
- `bg-primary` / `text-primary` #4F46E5 — indigo, interactive emphasis (sparingly)
- `bg-accent` #EEF2FF — soft indigo wash for active nav / highlights
- `border-border` #E2E8F0 — hairline rules
- `text-success` / `bg-success` #22C55E — positive deltas, "up" trends

## Surfaces
- Cards: `rounded-2xl border border-border bg-card` + soft shadow
  (`shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)]`).
- Generous padding (p-6 / p-8). Section gaps `gap-6`/`gap-8`.
- Hover: subtle lift + border tint, never large scale jumps.

## Layout
- Desktop: fixed left **sidebar** (4 items) + main content max-w-6xl, mx-auto, px-8.
- Mobile (<lg): sidebar hidden, **bottom navigation** bar; content px-4/5 with bottom padding for the nav.
- Page header: title + subtitle, then sections.

## Motion (`motion/react`)
- Entrance: fade + 8–12px rise, staggered (0.04–0.06s), ease-out ~0.35s.
- Calm — no bounce, no spin. Hover transitions 150–200ms. Skeleton shimmer for loading.

## Navigation (ONLY these)
1. Dashboard 2. Materials 3. Performance 4. Profile — plus a standalone Login screen.

## Content
Realistic Sri Lankan A/L Combined Maths context: real lesson names (Calculus, Statics, Dynamics,
Complex Numbers, Probability), school names, real names. Never lorem ipsum.
