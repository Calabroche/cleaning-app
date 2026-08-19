export type Role = "employee" | "admin" | "super_admin";
export type TaskStatus = "pending" | "in_progress" | "done" | "skipped";
export type NotificationType = "reminder" | "urgent" | "info";
export type PhotoRequirement = "none" | "after" | "before_after";
export type PhotoKind = "before" | "after";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  role: Role;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Apartment {
  id: string;
  name: string;
  address: string | null;
  notes: string | null;
  template_id: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  apartment_id: string;
  assigned_to: string | null;
  created_by: string | null;
  title: string;
  description: string | null;
  scheduled_date: string;
  status: TaskStatus;
  is_urgent: boolean;
  validated_at: string | null;
  validated_by: string | null;
  redo_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  created_by: string | null;
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  template_id: string;
  room: string;
  label: string;
  photo_requirement: PhotoRequirement;
  position: number;
  created_at: string;
}

export interface TaskItem {
  id: string;
  task_id: string;
  room: string;
  label: string;
  photo_requirement: PhotoRequirement;
  position: number;
  done_at: string | null;
  done_by: string | null;
}

export interface TaskPhoto {
  id: string;
  task_id: string;
  task_item_id: string | null;
  kind: PhotoKind;
  uploaded_by: string | null;
  storage_path: string;
  caption: string | null;
  created_at: string;
}

export interface AppNotification {
  id: string;
  recipient_id: string | null;
  sender_id: string | null;
  title: string;
  body: string | null;
  type: NotificationType;
  related_task_id: string | null;
  read_at: string | null;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  profile_id: string | null;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
}
