import type {
  ClassRecord,
  Lesson,
  Material,
  Mark,
  Notice,
  ResultRow,
  Student,
  User,
} from "./types";

export const currentUser: User = {
  user_id: "u_1024",
  f_name: "Sahan",
  l_name: "Wickramasinghe",
  nic: "200218401329",
  address: "No. 42, Temple Road, Maharagama",
  email: "sahan.w@gmail.com",
  mobile: "+94 71 884 2210",
};

export const currentClass: ClassRecord = {
  class_id: "c_2027",
  class_name: "2027 A/L Theory — Combined Maths",
  end_year: 2027,
};

export const currentStudent: Student = {
  user_id: "u_1024",
  callup_no: "CM-1042",
  school: "Royal College, Colombo",
  class_id: "c_2027",
};

export const lessons: Lesson[] = [
  { lesson_id: "l_01", lesson_name: "Limits & Continuity" },
  { lesson_id: "l_02", lesson_name: "Differentiation" },
  { lesson_id: "l_03", lesson_name: "Integration" },
  { lesson_id: "l_04", lesson_name: "Complex Numbers" },
  { lesson_id: "l_05", lesson_name: "Statics" },
  { lesson_id: "l_06", lesson_name: "Dynamics" },
  { lesson_id: "l_07", lesson_name: "Probability" },
  { lesson_id: "l_08", lesson_name: "Statistics" },
];

export const lessonName = (id: string) =>
  lessons.find((l) => l.lesson_id === id)?.lesson_name ?? "—";

const POSTER_A =
  "https://images.unsplash.com/photo-1561089489-f13d5e730d72?w=1200&h=675&fit=crop&auto=format";
const POSTER_B =
  "https://images.unsplash.com/photo-1758685733685-7e0f30c35a17?w=1200&h=675&fit=crop&auto=format";
const POSTER_C =
  "https://images.unsplash.com/photo-1736066330610-c102cab4e942?w=1200&h=675&fit=crop&auto=format";

export const materials: Material[] = [
  {
    material_id: "m_20",
    material_name: "Integration by Parts — Worked Examples",
    lesson_id: "l_03",
    source_url: "#",
    date_added: "2026-06-10",
    description:
      "Step-by-step worked solutions covering the LIATE rule and repeated integration by parts.",
    type: "PDF",
    pages: 14,
  },
  {
    material_id: "m_19",
    material_name: "Dynamics — Projectile Motion Recording",
    lesson_id: "l_06",
    source_url: "#",
    date_added: "2026-06-08",
    description:
      "Full theory class recording on projectiles, range, and time of flight with past-paper drills.",
    type: "Recording",
    poster: POSTER_A,
    duration: "1:24:05",
  },
  {
    material_id: "m_18",
    material_name: "Complex Numbers — Argand Diagram Notes",
    lesson_id: "l_04",
    source_url: "#",
    date_added: "2026-06-05",
    description:
      "Modulus, argument, and loci on the Argand plane with annotated diagrams.",
    type: "PDF",
    pages: 9,
  },
  {
    material_id: "m_17",
    material_name: "Statics — Equilibrium of Rigid Bodies",
    lesson_id: "l_05",
    source_url: "#",
    date_added: "2026-06-01",
    description:
      "Moments, couples, and conditions for equilibrium. Includes the ladder problem set.",
    type: "PDF",
    pages: 18,
  },
  {
    material_id: "m_16",
    material_name: "Differentiation — Chain Rule Masterclass",
    lesson_id: "l_02",
    source_url: "#",
    date_added: "2026-05-27",
    description: "Recorded session on composite functions and implicit differentiation.",
    type: "Recording",
    poster: POSTER_B,
    duration: "58:12",
  },
  {
    material_id: "m_15",
    material_name: "Probability — Conditional & Bayes",
    lesson_id: "l_07",
    source_url: "#",
    date_added: "2026-05-22",
    description: "Tree diagrams, conditional probability and Bayes' theorem applications.",
    type: "PDF",
    pages: 11,
  },
  {
    material_id: "m_14",
    material_name: "Limits — One-Sided & Infinite",
    lesson_id: "l_01",
    source_url: "#",
    date_added: "2026-05-18",
    description: "Evaluating one-sided limits and limits at infinity, with continuity tests.",
    type: "PDF",
    pages: 8,
  },
  {
    material_id: "m_13",
    material_name: "Statistics — Regression Recording",
    lesson_id: "l_08",
    source_url: "#",
    date_added: "2026-05-12",
    description: "Least squares regression and correlation coefficient walkthrough.",
    type: "Recording",
    poster: POSTER_C,
    duration: "1:06:40",
  },
  {
    material_id: "m_12",
    material_name: "Differentiation — Tangents & Normals",
    lesson_id: "l_02",
    source_url: "#",
    date_added: "2026-05-06",
    description: "Finding gradients, tangent and normal lines, and rates of change problems.",
    type: "PDF",
    pages: 12,
  },
  {
    material_id: "m_11",
    material_name: "Complex Numbers — De Moivre's Theorem",
    lesson_id: "l_04",
    source_url: "#",
    date_added: "2026-04-29",
    description: "Powers and roots of complex numbers using De Moivre's theorem.",
    type: "Recording",
    poster: POSTER_B,
    duration: "47:30",
  },
  {
    material_id: "m_10",
    material_name: "Statics — Friction & Inclined Planes",
    lesson_id: "l_05",
    source_url: "#",
    date_added: "2026-04-18",
    description: "Limiting friction, angle of friction and equilibrium on rough inclined planes.",
    type: "PDF",
    pages: 16,
  },
  {
    material_id: "m_09",
    material_name: "Probability — Distributions Crash Course",
    lesson_id: "l_07",
    source_url: "#",
    date_added: "2026-04-04",
    description: "Binomial and normal distributions with exam-style applications.",
    type: "Recording",
    poster: POSTER_A,
    duration: "1:12:18",
  },
];

export const notices: Notice[] = [
  {
    notice_id: "n_3",
    title: "June Monthly Test — Integration",
    description:
      "The June graded test covers Integration (Lessons 1–3). Sit it this Saturday 9.00 AM at the Maharagama hall. Bring your callup card.",
    date: "2026-06-12",
    pinned: true,
  },
  {
    notice_id: "n_2",
    title: "New recording uploaded: Projectile Motion",
    description:
      "The Dynamics projectile motion class is now available under Materials. Watch before next week's paper class.",
    date: "2026-06-08",
  },
  {
    notice_id: "n_1",
    title: "Poya day — no class this Wednesday",
    description:
      "There will be no theory class on Poya day. The Complex Numbers session moves to Thursday 4.00 PM.",
    date: "2026-06-03",
  },
  {
    notice_id: "n_0b",
    title: "Revision seminar — Applied Maths",
    description:
      "A free Applied Maths revision seminar covering Statics & Dynamics is scheduled for the last Sunday of June. Seats are limited.",
    date: "2026-05-28",
  },
  {
    notice_id: "n_0a",
    title: "Model paper pack released",
    description:
      "The 2026 model paper pack (Pure & Applied) is now available under Materials. New papers are added every fortnight.",
    date: "2026-05-20",
  },
];

// Inspirational dashboard content.
export const studyStreak = 3; // consecutive tests with an improved mark
export const quotes = [
  { text: "Pure mathematics is, in its way, the poetry of logical ideas.", author: "Albert Einstein" },
  { text: "It's not that I'm so smart, it's just that I stay with problems longer.", author: "Albert Einstein" },
  { text: "Mathematics is the music of reason.", author: "James J. Sylvester" },
];
export const dailyQuote = quotes[new Date().getDate() % quotes.length];

// Marks history (chronological). mark out of 100, rank within class.
export const marks: Mark[] = [
  { student_id: "u_1024", material_id: "m_14", mark: 62, date: "2026-01-18", comments: "Lost marks on limit notation. Revise one-sided limits." },
  { student_id: "u_1024", material_id: "m_16", mark: 68, date: "2026-02-15", comments: "Good chain rule. Watch implicit differentiation signs." },
  { student_id: "u_1024", material_id: "m_17", mark: 71, date: "2026-03-14", comments: "Strong on moments. Free-body diagrams need labelling." },
  { student_id: "u_1024", material_id: "m_18", mark: 78, date: "2026-04-11", comments: "Excellent loci work. Keep it up." },
  { student_id: "u_1024", material_id: "m_15", mark: 74, date: "2026-05-02", comments: "Solid on tree diagrams; Bayes setup was rushed." },
  { student_id: "u_1024", material_id: "m_19", mark: 83, date: "2026-05-23", comments: "Best paper yet — clean projectile working." },
  { student_id: "u_1024", material_id: "m_20", mark: 88, date: "2026-06-11", comments: "Outstanding. Top quartile on integration." },
];

// Rank per test date (lower is better).
const rankHistory: Record<string, number> = {
  "2026-01-18": 24,
  "2026-02-15": 19,
  "2026-03-14": 17,
  "2026-04-11": 12,
  "2026-05-02": 14,
  "2026-05-23": 8,
  "2026-06-11": 5,
};

const materialName = (id: string) =>
  materials.find((m) => m.material_id === id)?.material_name ?? "Graded Test";

export const results: ResultRow[] = [...marks]
  .sort((a, b) => (a.date < b.date ? 1 : -1))
  .map((m) => ({
    material_id: m.material_id,
    test_name: materialName(m.material_id),
    lesson_name: lessonName(
      materials.find((x) => x.material_id === m.material_id)?.lesson_id ?? "",
    ),
    date: m.date,
    mark: m.mark,
    rank: rankHistory[m.date] ?? 0,
    comments: m.comments,
  }));

// Class average mark per test date (for the benchmark line on the chart).
const classAvgByDate: Record<string, number> = {
  "2026-01-18": 56,
  "2026-02-15": 59,
  "2026-03-14": 62,
  "2026-04-11": 65,
  "2026-05-02": 63,
  "2026-05-23": 68,
  "2026-06-11": 71,
};

// Chart series (chronological order).
export const markSeries = [...marks]
  .sort((a, b) => (a.date > b.date ? 1 : -1))
  .map((m) => ({
    date: m.date,
    label: formatShort(m.date),
    mark: m.mark,
    classAvg: classAvgByDate[m.date] ?? null,
  }));

export const classAverageMark = Math.round(
  Object.values(classAvgByDate).reduce((s, v) => s + v, 0) /
    Object.values(classAvgByDate).length,
);

export const rankSeries = Object.entries(rankHistory)
  .sort(([a], [b]) => (a > b ? 1 : -1))
  .map(([date, rank]) => ({ date, label: formatShort(date), rank }));

// Derived stat values.
export const averageMark = Math.round(
  marks.reduce((s, m) => s + m.mark, 0) / marks.length,
);
export const latestMark = markSeries[markSeries.length - 1].mark;
export const currentRank = rankSeries[rankSeries.length - 1].rank;
export const bestRank = Math.min(...rankSeries.map((r) => r.rank));
export const totalMaterials = materials.length;
export const classSize = 42;

export function formatShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export function formatLong(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
