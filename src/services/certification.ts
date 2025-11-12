// src/services/certification.service.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../lib/database.types";

type DB = SupabaseClient<Database>;

type RowCert = Database["public"]["Tables"]["certifications"]["Row"];
type RowProf = Database["public"]["Tables"]["professors"]["Row"];
type RowUser = Database["public"]["Tables"]["users"]["Row"];

export type CertificationRow = RowCert;

export type CertificationWithProfessorUser = RowCert & {
  professor: (RowProf & { user: RowUser | null }) | null;
};

export type ProjectStatus = Database["public"]["Enums"]["project_status"]; // "Draft" | "Published" | "Certified"

/* ------------------------------------------------------------------ */
/* Basic guards                                                        */
/* ------------------------------------------------------------------ */

export async function ensureProjectExists(supabase: DB, projectId: string) {
  const { data, error } = await supabase
    .from("projects")
    .select("project_id")
    .eq("project_id", projectId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Project not found");
}

export async function ensureProfessor(supabase: DB, userId: string) {
  const { data, error } = await supabase
    .from("professors")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Only professors can perform this action");
}

/* ------------------------------------------------------------------ */
/* Core certification operations                                       */
/* ------------------------------------------------------------------ */

/**
 * Idempotent per (project_id, professor_user_id).
 * Requires composite PK on (project_id, professor_user_id).
 */
export async function upsertCertification(
  supabase: DB,
  projectId: string,
  professorUserId: string,
  certificationDate?: string,
): Promise<CertificationRow> {
  const { data, error } = await supabase
    .from("certifications")
    .upsert(
      {
        project_id: projectId,
        professor_user_id: professorUserId,
        certification_date: certificationDate ?? new Date().toISOString(),
      },
      { onConflict: "project_id,professor_user_id", ignoreDuplicates: false },
    )
    .select("*")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Upsert returned no data");
  return data;
}

export async function deleteMyCertification(
  supabase: DB,
  projectId: string,
  professorUserId: string,
) {
  const { error } = await supabase
    .from("certifications")
    .delete()
    .eq("project_id", projectId)
    .eq("professor_user_id", professorUserId);

  if (error) throw error;
  return { success: true };
}

export async function listCertificationsByProjectWithProfessor(
  supabase: DB,
  projectId: string,
): Promise<{ count: number; data: CertificationWithProfessorUser[] }> {
  const { data, count, error } = await supabase
    .from("certifications")
    .select(
      `
      *,
      professor:professors!certifications_professor_user_id_fkey(
        *,
        user:users(*)
      )
    `,
      { count: "exact" }, // enables returning total count
    )
    .eq("project_id", projectId)
    .order("certification_date", { ascending: false });

  if (error) throw error;
  return {
    count: count ?? 0,
    data: (data ?? []) as CertificationWithProfessorUser[],
  };
}

/* ------------------------------------------------------------------ */
/* Helpers for auto-status logic                                       */
/* ------------------------------------------------------------------ */

export async function countProjectCerts(
  supabase: DB,
  projectId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("certifications")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId);

  if (error) throw error;
  return count ?? 0;
}

export async function setProjectStatus(
  supabase: DB,
  projectId: string,
  status: ProjectStatus,
): Promise<void> {
  const { error } = await supabase
    .from("projects")
    .update({ status })
    .eq("project_id", projectId);

  if (error) throw error;
}

/**
 * Upsert + auto-status:
 * - After upsert, if this is the FIRST certification, set status = "Certified".
 */
export async function upsertCertificationWithAutoStatus(
  supabase: DB,
  projectId: string,
  professorUserId: string,
  certificationDate?: string,
): Promise<{ row: CertificationRow; statusUpdated?: ProjectStatus }> {
  const row = await upsertCertification(
    supabase,
    projectId,
    professorUserId,
    certificationDate,
  );

  let statusUpdated: ProjectStatus | undefined;

  try {
    const total = await countProjectCerts(supabase, projectId);
    if (total === 1) {
      await setProjectStatus(supabase, projectId, "Certified");
      statusUpdated = "Certified";
    }
  } catch {
    // swallow: status update is best-effort; route can log if needed
  }

  return { row, statusUpdated };
}

/**
 * Delete + auto-status:
 * - After delete, if NO certifications remain, set status = "Published".
 */
export async function deleteMyCertificationWithAutoStatus(
  supabase: DB,
  projectId: string,
  professorUserId: string,
): Promise<{ success: true; statusUpdated?: ProjectStatus }> {
  const _res = await deleteMyCertification(
    supabase,
    projectId,
    professorUserId,
  );

  let statusUpdated: ProjectStatus | undefined;

  try {
    const total = await countProjectCerts(supabase, projectId);
    if (total === 0) {
      await setProjectStatus(supabase, projectId, "Published");
      statusUpdated = "Published";
    }
  } catch {
    // swallow: best-effort
  }

  return { success: true as const, statusUpdated };
}
