export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      categories: {
        Row: {
          category_id: string;
          category_name: string;
        };
        Insert: {
          category_id?: string;
          category_name: string;
        };
        Update: {
          category_id?: string;
          category_name?: string;
        };
        Relationships: [];
      };
      certifications: {
        Row: {
          certification_date: string;
          professor_user_id: string;
          project_id: string;
        };
        Insert: {
          certification_date?: string;
          professor_user_id: string;
          project_id: string;
        };
        Update: {
          certification_date?: string;
          professor_user_id?: string;
          project_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "certifications_professor_user_id_fkey";
            columns: ["professor_user_id"];
            isOneToOne: false;
            referencedRelation: "professors";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "certifications_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: true;
            referencedRelation: "projects";
            referencedColumns: ["project_id"];
          }
        ];
      };
      comments: {
        Row: {
          comment_id: string;
          content: string;
          project_id: string;
          timestamp: string | null;
          user_id: string;
        };
        Insert: {
          comment_id?: string;
          content: string;
          project_id: string;
          timestamp?: string | null;
          user_id: string;
        };
        Update: {
          comment_id?: string;
          content?: string;
          project_id?: string;
          timestamp?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["project_id"];
          },
          {
            foreignKeyName: "comments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          }
        ];
      };
      contributors: {
        Row: {
          department: string;
          external_contact: Json | null;
          faculty: string;
          introduction_content: string | null;
          program: string;
          user_id: string;
          year: number | null;
        };
        Insert: {
          department: string;
          external_contact?: Json | null;
          faculty: string;
          introduction_content?: string | null;
          program: string;
          user_id: string;
          year?: number | null;
        };
        Update: {
          department?: string;
          external_contact?: Json | null;
          faculty?: string;
          introduction_content?: string | null;
          program?: string;
          user_id?: string;
          year?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "contributors_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          }
        ];
      };
      likes: {
        Row: {
          project_id: string;
          user_id: string;
        };
        Insert: {
          project_id: string;
          user_id: string;
        };
        Update: {
          project_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "likes_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["project_id"];
          },
          {
            foreignKeyName: "likes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          }
        ];
      };
      professors: {
        Row: {
          department: string;
          external_contact: Json | null;
          faculty: string;
          introduction_content: string | null;
          position: string;
          user_id: string;
        };
        Insert: {
          department: string;
          external_contact?: Json | null;
          faculty: string;
          introduction_content?: string | null;
          position: string;
          user_id: string;
        };
        Update: {
          department?: string;
          external_contact?: Json | null;
          faculty?: string;
          introduction_content?: string | null;
          position?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "professors_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          }
        ];
      };
      project_categories: {
        Row: {
          category_id: string;
          project_id: string;
        };
        Insert: {
          category_id: string;
          project_id: string;
        };
        Update: {
          category_id?: string;
          project_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_categories_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["category_id"];
          },
          {
            foreignKeyName: "project_categories_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["project_id"];
          }
        ];
      };
      project_collaborators: {
        Row: {
          contributor_user_id: string;
          project_id: string;
        };
        Insert: {
          contributor_user_id: string;
          project_id: string;
        };
        Update: {
          contributor_user_id?: string;
          project_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_collaborators_contributor_user_id_fkey";
            columns: ["contributor_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "project_collaborators_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["project_id"];
          }
        ];
      };
      project_external_links: {
        Row: {
          link_url: string;
          project_id: string;
        };
        Insert: {
          link_url: string;
          project_id: string;
        };
        Update: {
          link_url?: string;
          project_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_external_links_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["project_id"];
          }
        ];
      };
      project_files: {
        Row: {
          file_id: string;
          file_url: string;
          project_id: string;
        };
        Insert: {
          file_id?: string;
          file_url: string;
          project_id: string;
        };
        Update: {
          file_id?: string;
          file_url?: string;
          project_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["project_id"];
          }
        ];
      };
      projects: {
        Row: {
          badge: string;
          content: string | null;
          created_at: string | null;
          like_count: number | null;
          preview_image_url: string | null;
          project_id: string;
          short_description: string | null;
          status: string | null;
          title: string;
          updated_at: string | null;
          view_count: number | null;
        };
        Insert: {
          badge: string;
          content?: string | null;
          created_at?: string | null;
          like_count?: number | null;
          preview_image_url?: string | null;
          project_id?: string;
          short_description?: string | null;
          status?: string | null;
          title: string;
          updated_at?: string | null;
          view_count?: number | null;
        };
        Update: {
          badge?: string;
          content?: string | null;
          created_at?: string | null;
          like_count?: number | null;
          preview_image_url?: string | null;
          project_id?: string;
          short_description?: string | null;
          status?: string | null;
          title?: string;
          updated_at?: string | null;
          view_count?: number | null;
        };
        Relationships: [];
      };
      users: {
        Row: {
          created_at: string | null;
          deleted_at: string | null;
          email: string;
          fullname: string;
          profile_image_url: string | null;
          role: string | null;
          updated_at: string | null;
          user_id: string;
          username: string | null;
        };
        Insert: {
          created_at?: string | null;
          deleted_at?: string | null;
          email: string;
          fullname: string;
          profile_image_path?: string | null;
          role?: string | null;
          updated_at?: string | null;
          user_id?: string;
          username?: string | null;
        };
        Update: {
          created_at?: string | null;
          deleted_at?: string | null;
          email?: string;
          fullname?: string;
          profile_image_path?: string | null;
          role?: string | null;
          updated_at?: string | null;
          user_id?: string;
          username?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
