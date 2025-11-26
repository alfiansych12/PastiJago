import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: Request) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'No auth token' }, { status: 401 });

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData?.user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    const userId = userData.user.id;

    // 1) Get all groups where user is member
    const { data: memberships, error: memError } = await supabaseAdmin
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId);

    if (memError) {
      console.warn('Error fetching memberships:', memError);
    }

    const memberGroupIds = (memberships || []).map((m: any) => m.group_id).filter(Boolean);

    // 2) Get all groups where user is teacher
    const { data: teacherGroups, error: teacherError } = await supabaseAdmin
      .from('groups')
      .select('*')
      .eq('teacher_id', userId);

    if (teacherError) {
      console.warn('Error fetching teacher groups:', teacherError);
    }

    // 3) Get all groups that user is member of
    let memberGroups: any[] = [];
    if (memberGroupIds.length > 0) {
      const { data: mg, error: mgError } = await supabaseAdmin
        .from('groups')
        .select('*')
        .in('id', memberGroupIds);

      if (mgError) {
        console.warn('Error fetching member groups:', mgError);
      } else {
        memberGroups = mg || [];
      }
    }

    // 4) Merge unique groups
    const merged = [...(teacherGroups || []), ...memberGroups];
    const uniqueMap = new Map<string, any>();
    for (const g of merged) {
      uniqueMap.set(String(g.id), g);
    }

    const allGroups = Array.from(uniqueMap.values());

    // 5) Load members and messages for each group
    const groupsWithDetails: any[] = [];
    for (const g of allGroups) {
      try {
        const { data: members, error: membersError } = await supabaseAdmin
          .from('group_members')
          .select('user_id, joined_at, role, users(username)')
          .eq('group_id', g.id);

        if (membersError) {
          console.warn(`Error loading members for group ${g.id}:`, membersError);
        }

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

          if (msgError) {
            console.warn('Error loading messages:', msgError);
          }
          messages = msgs || [];
        } catch (msgLoadErr) {
          console.warn(`Failed to load messages for group ${g.id}:`, msgLoadErr);
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
          joinCode: g.join_code,
          teacherId: g.teacher_id,
          createdAt: g.created_at,
          members: formattedMembers,
          messages: formattedMessages
        });
      } catch (grpErr) {
        console.warn(`Skipping group ${g.id} due to error:`, grpErr);
        continue;
      }
    }

    return NextResponse.json({ groups: groupsWithDetails }, { status: 200 });
  } catch (err: any) {
    console.error('Error in GET /api/group/list:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
