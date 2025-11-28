'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import Swal from 'sweetalert2';
import { getSocket } from '@/lib/socket';

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
  // Socket.io state
  const [socket, setSocket] = useState<any>(null);

  const refreshGroups = useCallback(() => {
    const load = async () => {
      setIsLoading(true);
      if (!isAuthenticated || !user) {
        setGroups([]);
        setUserGroups([]);
        setCurrentGroup(null);
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/group/list');
        const data = await res.json();
        const allGroups = data.groups || [];
        setGroups(allGroups);
        // Filter userGroups berdasarkan anggota
        const myGroups = allGroups.filter(g => g.members.some((m: any) => m.userId === user.id));
        setUserGroups(myGroups);
        setIsLoading(false);
      } catch (err) {
        setGroups([]);
        setUserGroups([]);
        setCurrentGroup(null);
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

  // Socket.io subscription for group messages
  useEffect(() => {
    const sock = getSocket();
    setSocket(sock);
    if (!currentGroup?.id) return;
    sock.on('chat:init', (msgs: GroupMessage[]) => {
      setGroups(prevGroups => prevGroups.map(group => {
        if (group.id === currentGroup.id) {
          return {
            ...group,
            messages: msgs.filter(m => m.groupId === currentGroup.id)
          };
        }
        return group;
      }));
      setCurrentGroup(prev => prev ? {
        ...prev,
        messages: msgs.filter(m => m.groupId === currentGroup.id)
      } : null);
    });
    sock.on('chat:receive', (msg: GroupMessage) => {
      if (msg.groupId !== currentGroup.id) return;
      setGroups(prevGroups => prevGroups.map(group => {
        if (group.id === currentGroup.id) {
          return {
            ...group,
            messages: [...(group.messages || []), msg]
          };
        }
        return group;
      }));
      setCurrentGroup(prev => prev ? {
        ...prev,
        messages: [...(prev.messages || []), msg]
      } : null);
    });
    return () => {
      sock.off('chat:init');
      sock.off('chat:receive');
    };
  }, [currentGroup?.id]);

  // Supabase realtime subscription for groups and group_members
  // Hapus seluruh blok Supabase channel, tidak diperlukan

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
    if (!user || !socket) return false;
    try {
      socket.emit('chat:send', {
        groupId,
        userId: user.id,
        username: user.username || user.email?.split('@')[0] || 'User',
        message,
        type
      });
      return true;
    } catch (error) {
      console.error('Error sending message via socket:', error);
      Swal.fire({icon: 'error', title: 'Gagal', text: 'Gagal mengirim pesan', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
      return false;
    }
  };

  const createGroup = async (name: string, description: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const res = await fetch('/api/group/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, userId: user.id })
      });
      const data = await res.json();
      if (!data.ok || !data.group) {
        Swal.fire({icon: 'error', title: 'Gagal', text: data.error || 'Gagal membuat grup', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
        return false;
      }
      await refreshGroups();
      Swal.fire({icon: 'success', title: 'Berhasil!', text: 'Grup berhasil dibuat!', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
      return true;
    } catch (error) {
      console.error('Error creating group:', error);
      Swal.fire({icon: 'error', title: 'Gagal', text: 'Gagal membuat grup', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
      return false;
    }
  }

  const joinGroup = async (joinCode: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const res = await fetch('/api/group/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ joinCode, userId: user.id })
      });
      const data = await res.json();
      if (!data.ok || !data.group) {
        Swal.fire({icon: 'error', title: 'Gagal', text: data.error || 'Gagal gabung grup', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
        return false;
      }
      await refreshGroups();
      Swal.fire({icon: 'success', title: 'Berhasil!', text: 'Berhasil bergabung dengan grup!', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
      return true;
    } catch (error) {
      console.error('Error joining group:', error);
      Swal.fire({icon: 'error', title: 'Gagal', text: 'Gagal bergabung dengan grup', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
      return false;
    }
  };

  const leaveGroup = (groupId: string) => {
    if (!user) return;
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
      setCurrentGroup(null);
    }
    Swal.fire({icon: 'success', title: 'Berhasil!', text: 'Berhasil keluar dari grup', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
  }

  const deleteGroup = async (groupId: string): Promise<boolean> => {
    if (!user) return false;
    try {
      // Simulasi hapus grup tanpa Supabase
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
  };

  return (
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