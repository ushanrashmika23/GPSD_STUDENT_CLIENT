// Types mirror the institute database schema.

export interface User {
  user_id: string;
  f_name: string;
  l_name: string;
  nic: string;
  address: string;
  email: string;
  mobile: string;
}

export interface ClassRecord {
  class_id: string;
  class_name: string;
  end_year: number;
}

export interface Student {
  user_id: string;
  callup_no: string;
  school: string;
  class_id: string;
}

export interface Lesson {
  lesson_id: string;
  lesson_name: string;
}

export type MaterialType = "PDF" | "Recording";

export interface Material {
  material_id: string;
  material_name: string;
  lesson_id: string;
  source_url: string;
  date_added: string; // ISO date
  description: string;
  type: MaterialType;
  poster?: string; // recording thumbnail
  duration?: string; // recording length, e.g. "1:24:05"
  pages?: number; // pdf page count
}

export interface Mark {
  student_id: string;
  material_id: string;
  mark: number; // out of 100
  date: string; // ISO date
  comments: string;
}

export interface Notice {
  notice_id: string;
  title: string;
  description: string;
  date: string; // ISO date
  pinned?: boolean;
}

// Composed view models used by the UI.
export interface ResultRow {
  material_id: string;
  test_name: string;
  lesson_name: string;
  date: string;
  mark: number;
  rank: number;
  comments: string;
}
