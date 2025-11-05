export interface ApiResponse<T = any> {
  status: "ok" | "error";
  message: string;
  data?: T;
  error?: string;
}

export interface Project {
  project_id: string;
  title: string;
  content: string | null;
  badge: string;
  preview_image_url: string | null;
  short_description: string | null;
  status: "Draft" | "Published" | "Certified";
  like_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectDto {
  title: string;
  content?: string;
  badge: string;
  preview_image_url?: string;
  short_description?: string;
  status?: "Draft" | "Published" | "Certified";
}

export interface UpdateProjectDto {
  title?: string;
  content?: string;
  badge?: string;
  preview_image_url?: string;
  short_description?: string;
  status?: "Draft" | "Published" | "Certified";
}
