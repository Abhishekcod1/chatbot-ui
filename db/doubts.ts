import { supabase } from "@/lib/supabase/browser-client"
import { TablesInsert, TablesUpdate } from "@/supabase/types"

export const getDoubts = async (workspaceId?: string) => {
  let query = supabase.from("doubts").select("*")
  if (workspaceId) {
    query = query.eq("workspace_id", workspaceId)
  }
  const { data: doubts, error } = await query.order("created_at", {
    ascending: false
  })

  if (!doubts) {
    throw new Error(error.message)
  }

  return doubts
}

export const createDoubt = async (doubt: TablesInsert<"doubts">) => {
  const { data: createdDoubt, error } = await supabase
    .from("doubts")
    .insert([doubt])
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return createdDoubt
}

export const updateDoubt = async (
  doubtId: string,
  doubt: TablesUpdate<"doubts">
) => {
  const { data: updatedDoubt, error } = await supabase
    .from("doubts")
    .update(doubt)
    .eq("id", doubtId)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return updatedDoubt
}
