import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'No auth token' }, { status: 401 });

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData?.user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    const userId = userData.user.id;

    const body = await req.json();
    const { group_id, message, type = 'text' } = body;
    if (!group_id || !message) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from('group_messages')
      .insert({ group_id, user_id: userId, message, type })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, message: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
