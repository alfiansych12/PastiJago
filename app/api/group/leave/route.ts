import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'No auth token' }, { status: 401 });

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData?.user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    const userId = userData.user.id;

    const { group_id } = await req.json();
    if (!group_id) return NextResponse.json({ error: 'Missing group_id' }, { status: 400 });

    const { error: delError } = await supabaseAdmin.from('group_members').delete().eq('group_id', group_id).eq('user_id', userId);
    if (delError) return NextResponse.json({ error: delError.message }, { status: 500 });

    // check remaining members
    const { data: remaining, error: remErr } = await supabaseAdmin.from('group_members').select('user_id').eq('group_id', group_id);
    if (remErr) return NextResponse.json({ error: remErr.message }, { status: 500 });

    if (!remaining || remaining.length === 0) {
      await supabaseAdmin.from('groups').delete().eq('id', group_id);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
