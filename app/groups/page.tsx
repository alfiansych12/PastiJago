"use client";

import React, { useState } from "react";

// Overlay/modal harus di luar komponen utama agar tidak error
function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: "rgba(0,0,0,0.7)", zIndex: 9999 }}>
      <div className="bg-dark rounded-4 p-4 shadow-lg position-relative" style={{ minWidth: 320, maxWidth: 400 }}>
        <button type="button" className="btn-close position-absolute top-0 end-0 m-3" aria-label="Close" onClick={onClose}></button>
        {children}
      </div>
    </div>
  );
}
import Link from "next/link";
import { useGroup } from "@/contexts/GroupContext";
import { useAuth } from "@/contexts/AuthContext";

export default function GroupsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { userGroups, isLoading: groupLoading, createGroup, joinGroup } = useGroup();

  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (authLoading || groupLoading) {
    return (
      <div className="min-vh-100 text-light position-relative py-5 mt-5">
        <div className="container position-relative z-2 text-center">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Memuat daftar grup...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-vh-100 text-light position-relative py-5 mt-5">
        <div className="container position-relative z-2 text-center">
          <h2 className="text-warning mb-3">Anda belum login</h2>
          <Link href="/login" className="btn btn-warning btn-lg">Login</Link>
        </div>
      </div>
    );
  }


  return (
    <div className="min-vh-100 text-light position-relative py-5 mt-5">
      <div className="container position-relative z-2">
        <div className="row mb-4">
          <div className="col-12 d-flex justify-content-between align-items-center">
            <h1 className="text-warning mb-1">
              <i className="fas fa-users me-2" />Daftar Grup
            </h1>
            <div>
              <button className="btn btn-warning me-2" onClick={() => { setShowCreate(true); setErrorMsg(""); }}>
                <i className="fas fa-plus me-2" />Buat Grup Baru
              </button>
              <button className="btn btn-outline-warning" onClick={() => { setShowJoin(true); setErrorMsg(""); }}>
                <i className="fas fa-sign-in-alt me-2" />Gabung Grup
              </button>
            </div>
          </div>
        </div>
        <div className="row">
          {userGroups.length === 0 ? (
            <div className="col-12 text-center py-5">
              <i className="fas fa-users text-muted display-4 mb-3" />
              <h5 className="text-muted mb-2">Belum Bergabung Grup</h5>
              <p className="text-muted small">Gabung atau buat grup baru untuk mulai diskusi!</p>
            </div>
          ) : (
            userGroups.map((group) => (
              <div key={group.id} className="col-md-6 col-lg-4 mb-4">
                <div className="glass-effect rounded-4 p-4 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <h4 className="text-warning mb-2">
                      <i className="fas fa-users me-2" />{group.name}
                    </h4>
                    <p className="text-muted mb-2">{group.description}</p>
                    <div className="mb-2">
                      <span className="badge bg-warning text-dark me-2">{group.members.length} anggota</span>
                      <span className="badge bg-dark text-light">Kode: {group.joinCode || group.join_code}</span>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <Link href={`/groups/${group.id}`} className="btn btn-outline-warning">
                      <i className="fas fa-comments me-2" />Masuk Grup
                    </Link>
                    <span className="text-muted small">Dibuat: {new Date(group.createdAt).toLocaleDateString("id-ID")}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Overlay Buat Grup */}
      {showCreate && (
        <Overlay onClose={() => { setShowCreate(false); setGroupName(""); setGroupDesc(""); setErrorMsg(""); }}>
          <h4 className="text-warning mb-3">Buat Grup Baru</h4>
          <form onSubmit={async (e) => {
            e.preventDefault();
            setLoadingAction(true);
            setErrorMsg("");
            const ok = await createGroup(groupName, groupDesc);
            setLoadingAction(false);
            if (ok) {
              setShowCreate(false);
              setGroupName("");
              setGroupDesc("");
            } else {
              setErrorMsg("Gagal membuat grup. Pastikan data valid.");
            }
          }}>
            <div className="mb-3">
              <label className="form-label text-light">Nama Grup</label>
              <input type="text" className="form-control" value={groupName} onChange={e => setGroupName(e.target.value)} required minLength={3} maxLength={32} />
            </div>
            <div className="mb-3">
              <label className="form-label text-light">Deskripsi</label>
              <textarea className="form-control" value={groupDesc} onChange={e => setGroupDesc(e.target.value)} rows={2} maxLength={128} />
            </div>
            {errorMsg && <div className="alert alert-danger py-2">{errorMsg}</div>}
            <button type="submit" className="btn btn-warning w-100" disabled={loadingAction}>{loadingAction ? "Membuat..." : "Buat Grup"}</button>
          </form>
        </Overlay>
      )}

      {/* Overlay Gabung Grup */}
      {showJoin && (
        <Overlay onClose={() => { setShowJoin(false); setJoinCode(""); setErrorMsg(""); }}>
          <h4 className="text-warning mb-3">Gabung Grup</h4>
          <form onSubmit={async (e) => {
            e.preventDefault();
            setLoadingAction(true);
            setErrorMsg("");
            const ok = await joinGroup(joinCode);
            setLoadingAction(false);
            if (ok) {
              setShowJoin(false);
              setJoinCode("");
            } else {
              setErrorMsg("Gagal gabung grup. Pastikan kode benar.");
            }
          }}>
            <div className="mb-3">
              <label className="form-label text-light">Kode Grup</label>
              <input type="text" className="form-control" value={joinCode} onChange={e => setJoinCode(e.target.value)} required minLength={6} maxLength={6} style={{ textTransform: "uppercase", letterSpacing: 2 }} />
            </div>
            {errorMsg && <div className="alert alert-danger py-2">{errorMsg}</div>}
            <button type="submit" className="btn btn-warning w-100" disabled={loadingAction}>{loadingAction ? "Menggabungkan..." : "Gabung Grup"}</button>
          </form>
        </Overlay>
      )}
    </div>
  );
}
