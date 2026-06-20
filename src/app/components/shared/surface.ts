// Shared surface treatment for cards across the app.
export const softShadow =
  "shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-14px_rgba(15,23,42,0.10)]";

export const cardSurface =
  "rounded-2xl border border-border bg-card " + softShadow;

export const interactiveCard =
  cardSurface +
  " transition-all duration-200 hover:border-primary/30 hover:shadow-[0_2px_4px_rgba(15,23,42,0.05),0_16px_36px_-18px_rgba(79,70,229,0.22)]";
