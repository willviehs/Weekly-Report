import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// ── 리포트 저장 (upsert)
export async function saveReport(data) {
  const { error } = await supabase
    .from('reports')
    .upsert({
      user_id: data.userId,
      user_name: data.userName,
      week_key: data.weekKey,
      week_label: data.weekLabel,
      this_rows: data.thisRows,
      prev_rows: data.prevRows,
      extras: data.extras,
      submitted: data.submitted,
      submitted_at: data.submittedAt,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,week_key' })
  if (error) throw error
}

// ── 리포트 단건 조회
export async function getReport(userId, weekKey) {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', userId)
    .eq('week_key', weekKey)
    .maybeSingle()
  if (error) throw error
  return data
}

// ── 주간 전체 리포트 조회 (검토자용)
export async function getAllReports(weekKey) {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('week_key', weekKey)
  if (error) throw error
  return data || []
}

// ── 코멘트 저장 (upsert)
export async function saveComment(weekKey, userId, text, reviewerName) {
  const { error } = await supabase
    .from('comments')
    .upsert({
      week_key: weekKey,
      user_id: userId,
      text,
      reviewer_name: reviewerName,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'week_key,user_id' })
  if (error) throw error
}

// ── 주간 코멘트 전체 조회
export async function getAllComments(weekKey) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('week_key', weekKey)
  if (error) throw error
  // { userId: commentObj } 형태로 변환
  const map = {}
  ;(data || []).forEach(c => {
    map[c.user_id] = { text: c.text, reviewerName: c.reviewer_name, at: c.updated_at }
  })
  return map
}
