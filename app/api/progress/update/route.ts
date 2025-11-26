import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'No auth token' }, { status: 401 });

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData?.user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    const userId = userData.user.id;

    const { level_id, completed = false, code = null } = await req.json();
    if (!level_id) return NextResponse.json({ error: 'Missing level_id' }, { status: 400 });

    // Fetch existing progress to decide whether to award EXP
    const { data: existingProgress } = await supabaseAdmin
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('level_id', level_id)
      .maybeSingle();

    const upsertPayload: any = { user_id: userId, level_id, completed };
    if (code !== null) upsertPayload.code = code;

    // attempts / completed_at / exp_earned handling
    if (existingProgress) {
      upsertPayload.attempts = (existingProgress.attempts || 0) + 1;
      upsertPayload.updated_at = new Date().toISOString();
      upsertPayload.completed_at = completed ? new Date().toISOString() : existingProgress.completed_at;
      upsertPayload.exp_earned = completed && !existingProgress.completed ? 100 : (existingProgress.exp_earned || 0);
    } else {
      upsertPayload.attempts = 1;
      upsertPayload.completed_at = completed ? new Date().toISOString() : null;
      upsertPayload.exp_earned = completed ? 100 : 0;
    }

    const { data, error } = await supabaseAdmin
      .from('user_progress')
      .upsert(upsertPayload, { onConflict: ['user_id', 'level_id'] })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error); // <--- Tambahkan ini!
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If user just completed the level (wasn't completed before) and exp is awarded, update users.exp
    const shouldAwardExp = !!(data?.exp_earned) && !!completed && !(existingProgress?.completed);
    if (shouldAwardExp) {
      const expToAdd = data.exp_earned || 0;
      // Fetch current exp and increment safely
      const { data: userRow } = await supabaseAdmin.from('users').select('exp').eq('id', userId).maybeSingle();
      const currentExp = (userRow?.exp as number) || 0;
      await supabaseAdmin.from('users').update({ exp: currentExp + expToAdd }).eq('id', userId);
    }

    return NextResponse.json({ ok: true, progress: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
