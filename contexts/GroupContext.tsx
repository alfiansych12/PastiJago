'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import Swal from 'sweetalert2';
import { supabase } from '@/lib/supabase';

export interface GroupMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
  type: 'text' | 'code' | 'system';
}

export interface GroupMember {
  userId: string;
  username: string;
  joinedAt: string;
  role: 'student' | 'assistant' | 'teacher';
}

export interface Group {
  id: string;
  name: string;
  description: string;
  joinCode: string;
  teacherId: string;
  createdAt: string;
  members: GroupMember[];
  messages: GroupMessage[];
}

interface GroupContextType {
  groups: Group[];
  currentGroup: Group | null;
  userGroups: Group[];
  isLoading: boolean;
  joinGroup: (joinCode: string) => Promise<boolean>;
  createGroup: (name: string, description: string) => Promise<boolean>;
  leaveGroup: (groupId: string) => void;
  deleteGroup: (groupId: string) => Promise<boolean>;
  setCurrentGroup: (group: Group | null) => void;
  sendMessage: (groupId: string, message: string, type?: 'text' | 'code') => Promise<boolean>;
  refreshGroups: () => void;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export function GroupProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messageChannel, setMessageChannel] = useState<any>(null);
  const [groupChannel, setGroupChannel] = useState<any>(null);

  const refreshGroups = useCallback(() => {
    const load = async () => {
      setIsLoading(true);
      if (!isAuthenticated || !user) {
        console.log('Not authenticated or no user, clearing groups');
        setGroups([]);
        setUserGroups([]);
        setCurrentGroup(null);
        setIsLoading(false);
        return;
      }

      console.log('Refreshing groups for user:', user.id);

      try {
        // Fetch via server endpoint yang menggunakan service_role untuk bypass RLS
        const session = await supabase.auth.getSession();
        const token = session.data?.session?.access_token;
        
        const res = await fetch('/api/group/list', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error('Error fetching groups via API:', err);
          setGroups([]);
          setUserGroups([]);
          setCurrentGroup(null);
          setIsLoading(false);
          return;
        }

        const { groups: fetchedGroups } = await res.json();
        console.log('Fetched groups count:', fetchedGroups.length);

        setGroups(fetchedGroups);

        const userGroupList = fetchedGroups.filter((group: Group) => 
          String(group.teacherId) === String(user.id) || 
          group.members.some(member => member.userId === user.id)
        );
        console.log('User groups (teach or member):', userGroupList.length, userGroupList.map((g: Group) => g.name));
        setUserGroups(userGroupList);

        if (currentGroup) {
          const updatedCurrentGroup = fetchedGroups.find((g: Group) => g.id === currentGroup.id);
          if (updatedCurrentGroup) setCurrentGroup(updatedCurrentGroup);
        }
      } catch (error) {
        console.error('Error loading groups from API:', error);
        setGroups([]);
        setUserGroups([]);
        setCurrentGroup(null);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    // Only refresh groups when auth is done loading AND user state is determined
    if (!authLoading) {
      refreshGroups();
    }
  }, [isAuthenticated, user?.id, authLoading]);

  // Supabase realtime subscription for group messages
  useEffect(() => {
    if (!currentGroup?.id) return;

    // Unsubscribe previous channel
    if (messageChannel) {
      supabase.removeChannel(messageChannel);
      setMessageChannel(null);
    }

    // Subscribe to new messages for current group
    const channel = supabase.channel(`group-messages-${currentGroup.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${currentGroup.id}`
        },
        (payload) => {
          const newMsg = payload.new;
          if (!newMsg) return;
          const newMessage = {
            id: newMsg.id,
            userId: newMsg.user_id,
            username: newMsg.username,
            message: newMsg.message,
            timestamp: newMsg.created_at,
            type: newMsg.type || 'text',
          };
          setGroups(prevGroups => prevGroups.map(group => {
            if (group.id === currentGroup.id) {
              return {
                ...group,
                messages: [...(group.messages || []), newMessage]
              };
            }
            return group;
          }));
          setCurrentGroup(prev => prev ? {
            ...prev,
            messages: [...(prev.messages || []), newMessage]
          } : null);
        }
      );
    channel.subscribe();
    setMessageChannel(channel);

    // Cleanup on unmount or group change
    return () => {
      if (channel) supabase.removeChannel(channel);
      setMessageChannel(null);
    };
  }, [currentGroup?.id]);

  // Supabase realtime subscription for groups and group_members
  useEffect(() => {
    // Unsubscribe previous channel
    if (groupChannel) {
      supabase.removeChannel(groupChannel);
      setGroupChannel(null);
    }

    // Subscribe to changes in groups and group_members
    const channel = supabase.channel('groups-and-members')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'groups'
      }, () => {
        refreshGroups();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'group_members'
      }, () => {
        refreshGroups();
      });
    channel.subscribe();
    setGroupChannel(channel);

    // Cleanup on unmount
    return () => {
      if (channel) supabase.removeChannel(channel);
      setGroupChannel(null);
    };
  }, [isAuthenticated, user?.id]);

  const generateJoinCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const existingGroup = groups.find(g => g.joinCode === result);
    if (existingGroup) {
      return generateJoinCode();
    }
    
    return result;
  };

  const sendMessage = async (groupId: string, message: string, type: 'text' | 'code' = 'text'): Promise<boolean> => {
    if (!user) return false;

    try {
      // Persist message via server endpoint (service_role)
      const session = await supabase.auth.getSession();
      const token = session.data?.session?.access_token;
      const res = await fetch('/api/group/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ group_id: groupId, message, type })
      });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error('Error inserting group message via API:', err);
          Swal.fire({icon: 'error', title: 'Gagal', text: 'Gagal menyimpan pesan ke database', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
          return false;
        }      const { message: inserted } = await res.json();

      const newMessage: GroupMessage = {
        id: inserted?.id || Date.now().toString(),
        userId: user.id,
        username: user.username || user.email?.split('@')[0] || 'User',
        message: message,
        timestamp: inserted?.created_at || new Date().toISOString(),
        type: type
      };

      const updatedGroups = groups.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            messages: [...(group.messages || []), newMessage]
          };
        }
        return group;
      });

      setGroups(updatedGroups);
      
      if (currentGroup?.id === groupId) {
        setCurrentGroup(prev => prev ? {
          ...prev,
          messages: [...(prev.messages || []), newMessage]
        } : null);
      }

      const updatedUserGroups = userGroups.map(group => 
        group.id === groupId 
          ? { ...group, messages: [...(group.messages || []), newMessage] }
          : group
      );
      setUserGroups(updatedUserGroups);

      // Do not persist to localStorage; DB is the single source of truth
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      Swal.fire({icon: 'error', title: 'Gagal', text: 'Gagal mengirim pesan', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
      return false;
    }
  };

  const createGroup = async (name: string, description: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const session = await supabase.auth.getSession();
      const token = session.data?.session?.access_token;
      const res = await fetch('/api/group/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, description })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Error creating group via API:', err);
        Swal.fire({icon: 'error', title: 'Gagal', text: 'Gagal membuat grup (DB)', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
        return false;
      }

      const { group: insertedGroup } = await res.json();

      const newGroup: Group = {
        id: String(insertedGroup.id),
        name: insertedGroup.name,
        description: insertedGroup.description,
        joinCode: insertedGroup.join_code,
        teacherId: insertedGroup.teacher_id,
        createdAt: insertedGroup.created_at,
        members: [{
          userId: user.id,
          username: user.username || user.email?.split('@')[0] || 'Teacher',
          joinedAt: new Date().toISOString(),
          role: 'teacher'
        }],
        messages: []
      };

      const updatedGroups = [...groups, newGroup];
      setGroups(updatedGroups);
      setUserGroups(prev => [...prev, newGroup]);
      setCurrentGroup(newGroup);

      // Do not persist to localStorage; DB is the single source of truth

      Swal.fire({icon: 'success', title: 'Berhasil!', text: 'Grup berhasil dibuat!', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
      return true;
    } catch (error) {
      console.error('Error creating group:', error);
      Swal.fire({icon: 'error', title: 'Gagal', text: 'Gagal membuat grup', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
      return false;
    }
  };

  const joinGroup = async (joinCode: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const session = await supabase.auth.getSession();
      const token = session.data?.session?.access_token;
      const res = await fetch('/api/group/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ join_code: joinCode.trim().toUpperCase() })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Error joining group via API:', err);
        Swal.fire({icon: 'error', title: 'Gagal', text: err?.error || 'Kode grup tidak valid', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
        return false;
      }

      const { group } = await res.json();

      const updatedGroups = groups.map(g => {
        if (String(g.id) === String(group.id)) {
          return {
            ...g,
            members: [...(g.members || []), {
              userId: user.id,
              username: user.username || user.email?.split('@')[0] || 'User',
              joinedAt: new Date().toISOString(),
              role: 'student'
            }]
          };
        }
        return g;
      });

      // If group wasn't in local list, append
      if (!updatedGroups.find(g => String(g.id) === String(group.id))) {
        updatedGroups.push({
          id: String(group.id),
          name: group.name,
          description: group.description,
          joinCode: group.join_code,
          teacherId: group.teacher_id,
          createdAt: group.created_at,
          members: [{ userId: user.id, username: user.username || user.email?.split('@')[0] || 'User', joinedAt: new Date().toISOString(), role: 'student' }],
          messages: []
        });
      }

      setGroups(updatedGroups);
      setUserGroups(prev => [...prev, updatedGroups.find(g => String(g.id) === String(group.id))!]);
      setCurrentGroup(updatedGroups.find(g => String(g.id) === String(group.id)) || null);

      // Do not persist to localStorage; DB is the single source of truth

      Swal.fire({icon: 'success', title: 'Berhasil!', text: 'Berhasil bergabung dengan grup!', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
      return true;

    } catch (error) {
      console.error('Error joining group:', error);
      Swal.fire({icon: 'error', title: 'Gagal', text: 'Gagal bergabung dengan grup', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
      return false;
    }
  };

  const leaveGroup = (groupId: string) => {
    // server-side leave (delete membership)
    if (!user) return;

    (async () => {
      try {
        const session = await supabase.auth.getSession();
        const token = session.data?.session?.access_token;
        const res = await fetch('/api/group/leave', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ group_id: groupId })
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error('Error leaving group via API:', err);
          Swal.fire({icon: 'error', title: 'Gagal', text: 'Gagal keluar dari grup (DB)', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
          return;
        }

        // update local state
        const updatedGroups = groups.map(group => {
          if (group.id === groupId) {
            return {
              ...group,
              members: group.members.filter(member => member.userId !== user.id)
            };
          }
          return group;
        }).filter(group => group.members.length > 0);

        setGroups(updatedGroups);
        setUserGroups(prev => prev.filter(group => group.id !== groupId));
        
        if (currentGroup?.id === groupId) {
          setCurrentGroup(prev => prev?.id === groupId ? null : prev);
        }

        // Do not persist to localStorage; DB is the single source of truth

        Swal.fire({icon: 'success', title: 'Berhasil!', text: 'Berhasil keluar dari grup', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
      } catch (error) {
        console.error('Error leaving group:', error);
        Swal.fire({icon: 'error', title: 'Gagal', text: 'Gagal keluar dari grup', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
      }
    })();
  };

  const deleteGroup = async (groupId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const session = await supabase.auth.getSession();
      const token = session.data?.session?.access_token;
      const res = await fetch('/api/group/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ group_id: groupId })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Error deleting group via API:', err);
        Swal.fire({icon: 'error', title: 'Gagal', text: err?.error || 'Gagal menghapus grup', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
        return false;
      }

      // Update local state
      const updatedGroups = groups.filter(g => g.id !== groupId);
      setGroups(updatedGroups);
      setUserGroups(prev => prev.filter(g => g.id !== groupId));

      if (currentGroup?.id === groupId) {
        setCurrentGroup(null);
      }

      Swal.fire({icon: 'success', title: 'Berhasil!', text: 'Grup berhasil dihapus', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
      return true;
    } catch (error) {
      console.error('Error deleting group:', error);
      Swal.fire({icon: 'error', title: 'Gagal', text: 'Gagal menghapus grup', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
      return false;
    }
  };  return (
    <GroupContext.Provider value={{
      groups,
      currentGroup,
      userGroups,
      isLoading,
      joinGroup,
      createGroup,
      leaveGroup,
      deleteGroup,
      setCurrentGroup,
      sendMessage,
      refreshGroups
    }}>
      {children}
    </GroupContext.Provider>
  );
}

export function useGroup() {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error('useGroup must be used within a GroupProvider');
  }
  return context;
}