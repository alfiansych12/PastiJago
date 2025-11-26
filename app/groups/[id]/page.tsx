"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { useAuth } from '@/contexts/AuthContext';
import { useGroup } from '@/contexts/GroupContext';
import type { Group as CtxGroup, GroupMember as CtxGroupMember, GroupMessage as CtxGroupMessage } from '@/contexts/GroupContext';

export default function GroupChatPage() {
  const params = useParams() as { id?: string };
  const router = useRouter();
  const groupId = params?.id ?? '';

  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { groups, currentGroup, setCurrentGroup, sendMessage, isLoading: groupLoading } = useGroup();

  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [localMessages, setLocalMessages] = useState<CtxGroupMessage[]>([]);
  const [latestId, setLatestId] = useState<string | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!groupLoading && groups && groupId) {
      const found = (groups as CtxGroup[]).find((g) => g.id === groupId);
      if (found) setCurrentGroup(found);
      else if (!groupLoading && groups) {
        Swal.fire({ icon: 'error', title: 'Gagal', text: 'Grup tidak ditemukan', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
        router.push('/groups');
      }
    }
  }, [groupLoading, groups, groupId, setCurrentGroup, router]);

  useEffect(() => {
    // Sync local messages when context messages change
    const msgs = (currentGroup?.messages ?? []) as CtxGroupMessage[];
    // If initial load or messages appended, update local state
    setLocalMessages(msgs);
    if (msgs.length) setLatestId(msgs[msgs.length - 1].id);
    // scroll if at bottom
    if (isAtBottom) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentGroup?.messages]);

  // Track scroll position to detect if user is at bottom
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const handler = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 20;
      setIsAtBottom(atBottom);
      if (atBottom) setUnreadCount(0);
    };
    el.addEventListener('scroll', handler);
    handler();
    return () => el.removeEventListener('scroll', handler);
  }, [messagesContainerRef.current]);

  // When localMessages changes, if new message arrives and user not at bottom, increase unread
  useEffect(() => {
    const msgs = localMessages;
    if (!msgs.length) return;
    const last = msgs[msgs.length - 1];
    if (last.id !== latestId) {
      if (!isAtBottom) setUnreadCount(c => c + 1);
      setLatestId(last.id);
    }
  }, [localMessages]);

  const handleSendMessage = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      const text = newMessage.trim();
      if (!text || !currentGroup) return;
      setIsSending(true);
      try {
        const ok = await sendMessage?.(currentGroup.id, text);
        if (ok) setNewMessage('');
        else Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal mengirim pesan', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
      } finally {
        setIsSending(false);
      }
    },
    [newMessage, currentGroup, sendMessage]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  const formatTime = (ts: string) => new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (ts: string) => new Date(ts).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

  if (authLoading || groupLoading || !isAuthenticated) {
    return (
      <div className="min-vh-100 text-light position-relative py-5 mt-5">
        <div className="container position-relative z-2 text-center">
          <div className="spinner-border text-warning" role="status"><span className="visually-hidden">Loading...</span></div>
          <p className="mt-3">Memuat grup chat...</p>
        </div>
      </div>
    );
  }

  const group = currentGroup as CtxGroup | undefined;
  if (!group) {
    return (
      <div className="min-vh-100 text-light position-relative py-5 mt-5">
        <div className="container position-relative z-2">
          <div className="row justify-content-center">
            <div className="col-md-6 text-center">
              <div className="glass-effect rounded-4 p-5">
                <i className="fas fa-exclamation-triangle text-warning display-1 mb-4" />
                <h2 className="text-warning mb-3">Grup Tidak Ditemukan</h2>
                <p className="text-light mb-4">Grup yang Anda cari tidak tersedia atau telah dihapus.</p>
                <Link href="/groups" className="btn btn-warning btn-lg">Kembali ke Grup</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const messages = (group?.messages ?? []) as CtxGroupMessage[];
  const isTeacher = group.teacherId === user?.id;

  return (
    <div className="min-vh-100 text-light position-relative py-5 mt-5">
      <div className="container position-relative z-2">
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <Link href="/groups" className="btn btn-outline-warning btn-sm mb-3">Kembali</Link>
                <h1 className="text-warning mb-1"><i className="fas fa-comments me-2" />{group.name}</h1>
                <p className="text-muted mb-0">{group.description}</p>
              </div>
              <div className="text-end">
                <div className="badge bg-warning text-dark fs-6 mb-2">{isTeacher ? '👨‍🏫 Admin' : '👨‍🎓 Siswa'}</div>
                <div className="text-muted small"><i className="fas fa-users me-1" />{group.members.length} anggota • <code className="text-light ms-1">{group.joinCode}</code></div>
              </div>
            </div>
          </div>
        </div>

        <div className="row h-100">
          <div className="col-lg-3 col-md-4 mb-4">
            <div className="glass-effect rounded-4 p-3 h-100">
              <h6 className="text-warning mb-3"><i className="fas fa-users me-2" /> Anggota Grup</h6>
              <div className="members-list" style={{ maxHeight: 300, overflowY: 'auto' }}>
                {group.members.map((m: CtxGroupMember) => (
                  <div key={m.userId} className="d-flex align-items-center p-2 bg-dark rounded-3 mb-2">
                    <div className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${m.role === 'teacher' ? 'bg-warning' : 'bg-primary'}`} style={{ width: 36, height: 36, minWidth: 36 }}>
                      <i className={`fas ${m.role === 'teacher' ? 'fa-user-tie' : 'fa-user'} text-dark`} />
                    </div>
                    <div className="flex-grow-1">
                      <div className="text-light small fw-bold text-truncate">{m.username}</div>
                      <div className="d-flex justify-content-between align-items-center"><small className="text-muted">{m.role === 'teacher' ? 'Admin' : 'Siswa'}</small>{m.userId === user?.id && <span className="badge bg-success small">Anda</span>}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-secondary rounded-3">
                <h6 className="text-warning mb-2"><i className="fas fa-info-circle me-2" /> Info Grup</h6>
                <div className="small">
                  <div className="mb-1">Dibuat: {new Date(group.createdAt).toLocaleDateString('id-ID')}</div>
                  <div className="mb-1">{messages.length} pesan</div>
                  <div>Kode: <code className="text-warning">{group.joinCode}</code></div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-9 col-md-8">
            <div className="glass-effect rounded-4 h-100 d-flex flex-column" style={{ minHeight: 600 }}>
              <div className="p-3 border-bottom border-secondary d-flex justify-content-between align-items-center">
                <h5 className="text-warning mb-0"><i className="fas fa-comments me-2" />Obrolan Grup</h5>
                <span className="badge bg-dark text-light">{messages.length} pesan</span>
              </div>
              <div className="flex-grow-1 p-3" style={{ height: 450, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                {localMessages.length === 0 ? (
                  <div className="text-center py-5 my-auto">
                    <i className="fas fa-comments text-muted display-4 mb-3" />
                    <h5 className="text-muted mb-2">Belum Ada Pesan</h5>
                    <p className="text-muted small">Mulai percakapan dengan mengirim pesan pertama!</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {localMessages.map((msg: CtxGroupMessage, i: number) => {
                      const isOwn = msg.userId === user?.id;
                      const showDate = i === 0 || new Date(msg.timestamp).toDateString() !== new Date(messages[i - 1].timestamp).toDateString();
                      return (
                        <div key={msg.id} className="d-flex flex-column">
                          {showDate && <div className="text-center my-2"><span className="badge bg-secondary px-3 py-2">{formatDate(msg.timestamp)}</span></div>}
                          <div className={`d-flex ${isOwn ? 'justify-content-end' : 'justify-content-start'}`}>
                            <div className="d-flex flex-column" style={{ maxWidth: '70%' }}>
                              <div className="mb-1 d-flex align-items-center">
                                <span className="text-light small fw-bold me-2">{msg.username}</span>
                                {msg.userId === group.teacherId && <span className="badge bg-warning text-dark ms-1" title="Admin">Admin</span>}
                                {msg.userId === user?.id && <span className="badge bg-success ms-1">Anda</span>}
                              </div>
                              <div className={`p-3 rounded-4 ${isOwn ? 'bg-warning text-dark' : 'bg-secondary text-light'}`}>
                                <div className="message-content">
                                  {msg.type === 'code' ? <pre className="bg-dark p-2 rounded text-light mb-1 small"><code>{msg.message}</code></pre> : <div className="mb-1" style={{ lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>{msg.message}</div>}
                                </div>
                                <div className={`text-end small ${isOwn ? 'text-dark' : 'text-muted'}`}>{formatTime(msg.timestamp)}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              <div className="p-3 border-top border-secondary">
                <form onSubmit={(e) => { e.preventDefault(); void handleSendMessage(e); }}>
                  <div className="input-group">
                    <input type="text" className="form-control glass-effect border-0 text-light" placeholder="Ketik pesan di sini... (Enter untuk kirim)" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={handleKeyDown} disabled={isSending} />
                    <button type="submit" className="btn btn-warning px-3" disabled={!newMessage.trim() || isSending}>{isSending ? <span className="spinner-border spinner-border-sm" /> : <i className="fas fa-paper-plane" />}</button>
                  </div>
                </form>
                <small className="text-muted mt-2"><i className="fas fa-info-circle me-1" />Tekan Enter untuk mengirim pesan</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


