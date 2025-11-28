import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: Request) {
  try {
    // Ambil semua grup tanpa filter user
    const { data: allGroups, error: groupError } = await supabaseAdmin
      .from('groups')
      .select('*');

    if (groupError) {
      return NextResponse.json({ error: groupError.message }, { status: 500 });
    }

    // Ambil detail member dan pesan untuk setiap grup
    const groupsWithDetails: any[] = [];
    for (const g of allGroups || []) {
      try {
        const { data: members, error: membersError } = await supabaseAdmin
          .from('group_members')
          .select('user_id, joined_at, role, users(username)')
          .eq('group_id', g.id);

        const formattedMembers = (members || []).map((m: any) => ({
          userId: m.user_id,
          username: m.users?.username || '',
          joinedAt: m.joined_at,
          role: m.role
        }));

        let messages: any[] = [];
        try {
          const { data: msgs, error: msgError } = await supabaseAdmin
            .from('group_messages')
            .select('id, user_id, message, type, created_at')
            .eq('group_id', g.id)
            .order('created_at', { ascending: true })
            .limit(200);
          messages = msgs || [];
        } catch {
          messages = [];
        }

        const formattedMessages = (messages || []).map((m: any) => ({
          id: m.id,
          userId: m.user_id,
          username: '',
          message: m.message,
          timestamp: m.created_at,
          type: m.type || 'text'
        }));

        groupsWithDetails.push({
          id: String(g.id),
          name: g.name,
          description: g.description,
          join_code: g.join_code, // gunakan snake_case agar konsisten dengan frontend
          teacherId: g.teacher_id,
          createdAt: g.created_at,
          members: formattedMembers,
          messages: formattedMessages
        });
      } catch {
        continue;
      }
    }

    return NextResponse.json({ groups: groupsWithDetails }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
