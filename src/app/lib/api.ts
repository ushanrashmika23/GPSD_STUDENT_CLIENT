import axios from "axios";

// Same backend as the admin app — endpoints used here:
//   POST /api/auth/firebase-login  (exchange a Firebase ID token for a JWT)
//   POST /api/auth/auto-login      (restore a session from the stored JWT)
const api = axios.create({
  // VITE_API_URL=/api routes dev requests through the Vite proxy (same-origin).
  // Falls back to a direct URL otherwise.
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 60000,
});

// Attach the stored JWT to every request (auto-login relies on the Bearer header)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface StudentUser {
  id: string;
  email: string;
  roles: string;
  first_name: string;
  last_name: string;
  mobile: string;
  address: string;
  is_active: boolean;
  lastLogin: string;
}

// Backend success body shape: { success, msg, data }
export interface LoginResult {
  success: boolean;
  msg?: string;
  data?: { token?: string; user?: StudentUser };
}

// Exchange a Firebase ID token (Google or email/password sign-in) for a backend JWT.
// No refresh token is used anywhere — just this single access token exchange.
export const firebaseLogin = async (idToken: string): Promise<LoginResult> => {
  const res = await api.post("/auth/firebase-login", { idToken });
  return res.data;
};

// Restore a session from the JWT in localStorage (sent as a Bearer header above)
export const autoLogin = async (): Promise<LoginResult> => {
  const res = await api.post("/auth/auto-login");
  return res.data;
};

// ── Student profile ─────────────────────────────────────────────────────
export interface StudentProfile {
  call_up_no: string;
  school: string;
  parent_name: string;
  parent_mobile: string;
  batch_id: string;
  user: StudentUser;
  batch: {
    id: string;
    name: string;
    day: string;
    start_time: string;
    end_time: string;
  };
}

// GET /api/students/profile/:userId — the logged-in student's own profile.
// The userId comes from the user object stored in localStorage at login.
export const getStudentProfile = async (): Promise<StudentProfile> => {
  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;
  if (!user?.id) throw new Error("No logged-in user found");
  const res = await api.get(`/students/profile/${user.id}`);
  return res.data?.data;
};

// ── Student performance ─────────────────────────────────────────────────
export interface PerformancePaper {
  paper_id: string;
  paper_name: string;
  paper_date: string;
  class_avg: number | null;
  is_mark_released: boolean;
  lesson_id: string | null;
  lesson_title: string;
  lesson_type: string | null;
  mark: number;
  rank: number | null;
  comments: string;
}

export interface StudentPerformance {
  call_up_no: string;
  batch_id: string;
  classSize: number;
  papers: PerformancePaper[];
  summary: {
    currentRank: number | null;
    bestRank: number | null;
    averageMark: number | null;
    latestMark: number | null;
  };
}

// GET /api/marks/student-performance/:userId — the logged-in student's own
// performance (released marks, per-paper ranks, summary stats).
export const getStudentPerformance = async (): Promise<StudentPerformance> => {
  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;
  if (!user?.id) throw new Error("No logged-in user found");
  const res = await api.get(`/marks/student-performance/${user.id}`);
  return res.data?.data;
};

// ── Student materials ───────────────────────────────────────────────────
export interface StudentMaterial {
  material_id: string;
  material_name: string;
  description: string;
  type: string; // backend stores "DOCUMENT" | "VIDEO"
  lesson_id: string;
  lesson_title: string;
  lesson_type: string | null;
  material_url: string; // R2 object key
  date_added: string; // ISO — when access was granted to the batch
  expiry_date: string;
}

export interface StudentMaterials {
  batch_id: string;
  total: number;
  materials: StudentMaterial[];
}

// GET /api/materials/student/:userId — materials accessible to the logged-in
// student's batch (expired access excluded), newest first.
export const getStudentMaterials = async (): Promise<StudentMaterials> => {
  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;
  if (!user?.id) throw new Error("No logged-in user found");
  const res = await api.get(`/materials/student/${user.id}`);
  return res.data?.data;
};

// GET /api/materials/:id/signed-url — a short-lived signed R2 URL for viewing
// a material's file. The student PDF viewer uses it to render the document and
// to download it; the video player uses it as the video source.
export const getMaterialSignedUrl = async (
  materialId: string,
): Promise<{ url: string; type: string }> => {
  const res = await api.get(`/materials/${materialId}/signed-url`);
  return res.data?.data;
};
