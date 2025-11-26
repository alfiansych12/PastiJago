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

    // Check if user is teacher of this group
    const { data: group, error: groupError } = await supabaseAdmin
      .from('groups')
      .select('teacher_id')
      .eq('id', group_id)
      .single();

    if (groupError || !group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    if (String(group.teacher_id) !== String(userId)) {
      return NextResponse.json({ error: 'Only teacher can delete group' }, { status: 403 });
    }

    // Delete group messages first
    await supabaseAdmin.from('group_messages').delete().eq('group_id', group_id);

    // Delete group members
    await supabaseAdmin.from('group_members').delete().eq('group_id', group_id);

    // Delete group
    const { error: deleteError } = await supabaseAdmin
      .from('groups')
      .delete()
      .eq('id', group_id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: 'Group deleted successfully' }, { status: 200 });
  } catch (err: any) {
    console.error('Error deleting group:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
