import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'No auth token' }, { status: 401 });

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData?.user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    const userId = userData.user.id;

    const { join_code } = await req.json();
    if (!join_code) return NextResponse.json({ error: 'Missing join_code' }, { status: 400 });

    const { data: group } = await supabaseAdmin.from('groups').select('*').eq('join_code', join_code.trim().toUpperCase()).maybeSingle();
    if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 });

    // Check existing membership
    const { data: existing } = await supabaseAdmin.from('group_members').select('*').eq('group_id', group.id).eq('user_id', userId).maybeSingle();
    if (existing) return NextResponse.json({ error: 'Already member' }, { status: 400 });

    const { error: insertError } = await supabaseAdmin.from('group_members').insert({ group_id: group.id, user_id: userId, role: 'student' });
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

    return NextResponse.json({ ok: true, group }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
