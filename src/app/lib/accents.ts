// A curated multi-accent palette layered on top of the indigo primary.
// Keeps the product colourful and inspirational while staying cohesive.

export type Tone =
  | "indigo"
  | "violet"
  | "sky"
  | "emerald"
  | "amber"
  | "rose"
  | "cyan"
  | "fuchsia";

interface ToneClasses {
  soft: string; // soft tinted surface + matching text (for icon chips / tags)
  text: string; // standalone text colour
  solid: string; // solid background + readable foreground
  ring: string; // ring/border tint
  hex: string; // raw hex for charts / inline styles
}

export const tones: Record<Tone, ToneClasses> = {
  indigo: { soft: "bg-indigo-50 text-indigo-600", text: "text-indigo-600", solid: "bg-indigo-600 text-white", ring: "ring-indigo-200", hex: "#4f46e5" },
  violet: { soft: "bg-violet-50 text-violet-600", text: "text-violet-600", solid: "bg-violet-600 text-white", ring: "ring-violet-200", hex: "#7c3aed" },
  sky: { soft: "bg-sky-50 text-sky-600", text: "text-sky-600", solid: "bg-sky-600 text-white", ring: "ring-sky-200", hex: "#0284c7" },
  emerald: { soft: "bg-emerald-50 text-emerald-600", text: "text-emerald-600", solid: "bg-emerald-600 text-white", ring: "ring-emerald-200", hex: "#059669" },
  amber: { soft: "bg-amber-50 text-amber-600", text: "text-amber-600", solid: "bg-amber-500 text-white", ring: "ring-amber-200", hex: "#d97706" },
  rose: { soft: "bg-rose-50 text-rose-600", text: "text-rose-600", solid: "bg-rose-500 text-white", ring: "ring-rose-200", hex: "#e11d48" },
  cyan: { soft: "bg-cyan-50 text-cyan-600", text: "text-cyan-600", solid: "bg-cyan-600 text-white", ring: "ring-cyan-200", hex: "#0891b2" },
  fuchsia: { soft: "bg-fuchsia-50 text-fuchsia-600", text: "text-fuchsia-600", solid: "bg-fuchsia-600 text-white", ring: "ring-fuchsia-200", hex: "#c026d3" },
};

// Each lesson gets a stable accent so tags/icons read as a colourful taxonomy.
export const lessonTone: Record<string, Tone> = {
  l_01: "sky",
  l_02: "indigo",
  l_03: "violet",
  l_04: "fuchsia",
  l_05: "amber",
  l_06: "rose",
  l_07: "emerald",
  l_08: "cyan",
};

export const toneFor = (lessonId: string): ToneClasses =>
  tones[lessonTone[lessonId] ?? "indigo"];
