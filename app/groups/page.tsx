'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGroup } from '@/contexts/GroupContext';
import Link from 'next/link';
import Swal from 'sweetalert2';

export default function GroupsPage() {
  const { isAuthenticated, user } = useAuth();
  const { userGroups, joinGroup, createGroup, deleteGroup, setCurrentGroup, refreshGroups, isLoading } = useGroup();
  
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null);
  // Hapus state isLoading lokal, gunakan dari context

  useEffect(() => {
    if (isAuthenticated) {
      refreshGroups();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!joinCode.trim()) {
      Swal.fire({icon: 'error', title: 'Gagal', text: 'Masukkan kode grup', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
      return;
    }

    if (joinCode.trim().length !== 6) {
      Swal.fire({icon: 'error', title: 'Gagal', text: 'Kode grup harus 6 karakter', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
      return;
    }

    try {
      const success = await joinGroup(joinCode.trim());
      
      if (success) {
        setShowJoinModal(false);
        setJoinCode('');
      }
    } catch (error) {
      console.error('Join group error:', error);
      Swal.fire({icon: 'error', title: 'Gagal', text: 'Terjadi error saat bergabung dengan grup', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      Swal.fire({icon: 'error', title: 'Gagal', text: 'Nama grup harus diisi', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
      return;
    }

    const success = await createGroup(groupName.trim(), groupDescription.trim());

    if (success) {
      setShowCreateModal(false);
      setGroupName('');
      setGroupDescription('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-vh-100 text-light position-relative py-5 mt-5">
        <div className="container position-relative z-2">
          <div className="row justify-content-center">
            <div className="col-md-6 text-center">
              <div className="glass-effect rounded-4 p-5">
                <i className="fas fa-users text-warning display-1 mb-4"></i>
                <h2 className="text-warning mb-3">Akses Ditolak</h2>
                <p className="text-light mb-4">
                  Anda perlu login terlebih dahulu untuk mengakses grup belajar.
                </p>
                <Link href="/login" className="btn btn-warning btn-lg">
                  <i className="fas fa-sign-in-alt me-2"></i>
                  Login Sekarang
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-vh-100 text-light position-relative py-5 mt-5">
        <div className="container position-relative z-2">
          <div className="row justify-content-center">
            <div className="col-12 text-center">
              <div className="spinner-border text-warning" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Memuat data grup...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 text-light position-relative py-5 mt-5">
      <div className="container position-relative z-2">
        <div className="row mb-5">
          <div className="col-12 text-center">
            <span className="badge glass-effect border-0 px-4 py-2 mb-3">
              👥 Group Learning
            </span>
            <h1 className="display-4 fw-bold gradient-text mb-3">
              Classroom Groups
            </h1>
            <p className="text-muted fs-5">
              Belajar bersama, berkompetisi sehat, dan raih prestasi sebagai tim
            </p>
          </div>
        </div>

        <div className="row mb-5">
          <div className="col-md-6 mb-3">
            <div className="glass-effect rounded-4 p-4 text-center h-100 hover-lift">
              <i className="fas fa-plus-circle text-warning display-1 mb-3"></i>
              <h4 className="text-warning mb-3">Buat Grup Baru</h4>
              <p className="text-light mb-4">
                Sebagai guru, buat grup kelas dan undang siswa dengan kode unik
              </p>
              <button 
                className="btn btn-warning btn-lg"
                onClick={() => setShowCreateModal(true)}
              >
                <i className="fas fa-plus me-2"></i>
                Buat Grup
              </button>
            </div>
          </div>
          
          <div className="col-md-6 mb-3">
            <div className="glass-effect rounded-4 p-4 text-center h-100 hover-lift">
              <i className="fas fa-sign-in-alt text-primary display-1 mb-3"></i>
              <h4 className="text-primary mb-3">Gabung Grup</h4>
              <p className="text-light mb-4">
                Sebagai siswa, gabung grup kelas dengan kode yang diberikan guru
              </p>
              <button 
                className="btn btn-primary btn-lg"
                onClick={() => setShowJoinModal(true)}
              >
                <i className="fas fa-sign-in-alt me-2"></i>
                Gabung Grup
              </button>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <h3 className="text-warning mb-4">
              <i className="fas fa-layer-group me-2"></i>
              Grup Saya ({userGroups.length})
            </h3>
            
            {userGroups.length === 0 ? (
              <div className="glass-effect rounded-4 p-5 text-center">
                <i className="fas fa-users text-muted display-1 mb-4"></i>
                <h4 className="text-muted mb-3">Belum Bergabung dengan Grup</h4>
                <p className="text-muted">
                  Bergabung dengan grup untuk mulai belajar bersama teman sekelas
                </p>
              </div>
            ) : (
              <div className="row g-4">
                {userGroups.map(group => {
                  const isTeacher = group.teacherId === user?.id;
                  const memberCount = group.members.length;
                  
                  return (
                    <div key={group.id} className="col-md-6 col-lg-4">
                      <div className="glass-effect rounded-4 p-4 h-100 hover-lift">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <span className={`badge ${isTeacher ? 'bg-warning' : 'bg-primary'} text-dark`}>
                            {isTeacher ? 'Guru' : 'Siswa'}
                          </span>
                          <span className="text-muted">
                            {memberCount} anggota
                          </span>
                        </div>
                        
                        <h5 className="text-warning mb-2">{group.name}</h5>
                        <p className="text-light small mb-3">{group.description}</p>
                        
                        <div className="mb-3">
                          <small className="text-muted d-block">Kode Gabung:</small>
                          <code className="text-light bg-dark p-2 rounded d-inline-block">
                            {group.joinCode}
                          </code>
                        </div>
                        
                        <div className="d-flex justify-content-between align-items-center gap-2">
                          <small className="text-muted">
                            {group.messages?.length || 0} pesan
                          </small>
                          <div className="d-flex gap-2">
                            {isTeacher && (
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => {
                                  Swal.fire({
                                    title: 'Hapus Grup?',
                                    text: `Apakah Anda yakin ingin menghapus grup \"${group.name}\"? Data grup tidak dapat dipulihkan.`,
                                    icon: 'warning',
                                    showCancelButton: true,
                                    confirmButtonText: 'Hapus',
                                    cancelButtonText: 'Batal'
                                  }).then((result) => {
                                    if (result.isConfirmed) {
                                      setDeletingGroupId(group.id);
                                      deleteGroup(group.id).finally(() => setDeletingGroupId(null));
                                    }
                                  });
                                }}
                                disabled={deletingGroupId === group.id}
                                title="Hapus grup (hanya guru)"
                              >
                                {deletingGroupId === group.id ? (
                                  <span className="spinner-border spinner-border-sm"></span>
                                ) : (
                                  <i className="fas fa-trash"></i>
                                )}
                              </button>
                            )}
                            <Link 
                              href={`/groups/${group.id}`}
                              className="btn btn-outline-warning btn-sm"
                              onClick={() => setCurrentGroup(group)}
                            >
                              Masuk <i className="fas fa-arrow-right ms-1"></i>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {showJoinModal && (
          <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.8)'}}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content glass-effect border-0">
                <div className="modal-header border-0">
                  <h5 className="modal-title text-warning">
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Gabung Grup
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white"
                    onClick={() => setShowJoinModal(false)}
                    disabled={isLoading}
                  ></button>
                </div>
                <form onSubmit={handleJoinGroup}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label text-light">Kode Grup</label>
                      <input
                        style={{ color: 'white', background: '#222' }}
                        type="text"
                        className="form-control glass-effect border-0 text-light"
                        placeholder="Masukkan 6 digit kode grup"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        maxLength={6}
                        required
                        disabled={isLoading}
                      />
                      <div className="form-text text-muted">
                        Minta kode grup kepada guru Anda
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer border-0">
                    <button 
                      type="button" 
                      className="btn btn-outline-light"
                      onClick={() => setShowJoinModal(false)}
                      disabled={isLoading}
                    >
                      Batal
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-warning"
                      disabled={isLoading || !joinCode.trim()}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Bergabung...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-sign-in-alt me-2"></i>
                          Gabung Grup
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showCreateModal && (
          <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.8)'}}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content glass-effect border-0">
                <div className="modal-header border-0">
                  <h5 className="modal-title text-warning">
                    <i className="fas fa-plus-circle me-2"></i>
                    Buat Grup Baru
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white"
                    onClick={() => setShowCreateModal(false)}
                    disabled={isLoading}
                  ></button>
                </div>
                <form onSubmit={handleCreateGroup}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label text-light">Nama Grup</label>
                      <input
                        type="text"
                        className="form-control glass-effect border-0 text-light"
                        placeholder="Contoh: X RPL 1 - JavaScript"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-light">Deskripsi</label>
                      <textarea
                        className="form-control glass-effect border-0 text-light"
                        placeholder="Deskripsi grup (opsional)"
                        rows={3}
                        value={groupDescription}
                        onChange={(e) => setGroupDescription(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="modal-footer border-0">
                    <button 
                      type="button" 
                      className="btn btn-outline-light"
                      onClick={() => setShowCreateModal(false)}
                      disabled={isLoading}
                    >
                      Batal
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-warning"
                      disabled={isLoading || !groupName.trim()}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Membuat...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-plus me-2"></i>
                          Buat Grup
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}