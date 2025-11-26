import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

function generateJoinCode() {
  const chars = '0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

export async function POST(req: Request) {
  try {
    // Ambil userId dari body request, bukan dari token
    const { name, description, userId } = await req.json();
    if (!name || !userId) return NextResponse.json({ error: 'Missing name or userId' }, { status: 400 });

    // Ensure unique join_code
    let joinCode = generateJoinCode();
    // simple retry if collision
    for (let i = 0; i < 5; i++) {
      const { data: exists } = await supabaseAdmin.from('groups').select('id').eq('join_code', joinCode).maybeSingle();
      if (!exists) break;
      joinCode = generateJoinCode();
    }

    const { data: insertedGroup, error: insertError } = await supabaseAdmin
      .from('groups')
      .insert({ name: name.trim(), description: description || null, join_code: joinCode, teacher_id: userId })
      .select()
      .single();

    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

    const { error: memberError } = await supabaseAdmin.from('group_members').insert({ group_id: insertedGroup.id, user_id: userId, role: 'teacher' });
    if (memberError) {
      // rollback group
      await supabaseAdmin.from('groups').delete().eq('id', insertedGroup.id);
      return NextResponse.json({ error: memberError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, group: insertedGroup }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
