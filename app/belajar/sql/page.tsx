// app/belajar/sql/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
// ...existing code...

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import sqlLevels from '@/data/sqlLevelData.json';

export default function SqlLearningPage() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-vh-100 text-light d-flex justify-content-center align-items-center">
        <div className="glass-effect rounded-4 p-5 text-center">
          <i className="fas fa-lock text-warning display-1 mb-4"></i>
          <h2 className="text-warning mb-3">Akses Ditolak</h2>
          <p className="text-light mb-4">Anda perlu login untuk mengakses halaman belajar SQL.</p>
          <Link href="/login" className="btn btn-warning btn-lg">
            <i className="fas fa-sign-in-alt me-2"></i>Login Sekarang
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 text-light position-relative py-5 mt-5">
      <div className="container position-relative z-2">
        <div className="row mb-4">
          <div className="col-12">
            <div className="glass-effect rounded-4 p-4" style={{borderLeft: '4px solid #6366f1'}}>
              <div className="row align-items-center">
                <div className="col-md-6">
                  <h4 className="text-warning mb-1">Halo, {user?.username}! 👋</h4>
                  <p className="text-muted mb-0">Mari kuasai SQL dan database relasional</p>
                </div>
                <div className="col-md-6 text-md-end">
                  <div className="d-inline-flex gap-3">
                    <div className="bg-dark rounded-3 px-3 py-2">
                      <small className="text-muted">SQL Levels</small>
                      <div className="text-warning fw-bold fs-4">{Object.keys(sqlLevels).length}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row mb-5">
          <div className="col-12 text-center">
            <span className="badge glass-effect border-0 px-4 py-2 mb-3" style={{background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)'}}>
              <i className="fas fa-database me-2"></i>
              SQL Learning Path
            </span>
            <h1 className="display-4 fw-bold mb-3" style={{background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
              Master SQL
            </h1>
            <p className="text-muted fs-5">
              Pelajari query dasar SQL: SELECT, INSERT, UPDATE, DELETE, dan lain-lain. Coba langsung di editor interaktif!
            </p>
          </div>
        </div>
        <div className="row g-4">
          {Object.entries(sqlLevels).map(([key, level]) => (
            <div key={key} className="col-xl-6">
              <div className="glass-effect rounded-4 p-4 h-100 hover-lift position-relative overflow-hidden border-primary" style={{border: '2px solid transparent', paddingTop: '2rem', paddingRight: '1.5rem'}}>
                <div className="position-absolute top-0 end-0" style={{margin: '0.75rem', zIndex: 2}}>
                  <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary" style={{width: '36px', height: '36px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)'}}>
                    <span className="fw-bold text-light" style={{fontSize: '1rem'}}>{key}</span>
                  </div>
                </div>
                <h5 className="text-warning mb-3">{level.title}</h5>
                <div className="text-light mb-4">
                  {/* Ambil hanya kalimat pertama sebelum <br> atau sebelum tabel */}
                  {level.challenge.description.split('<br>')[0]}
                </div>
                <Link href={`/belajar/sql/${key}`} className="btn btn-primary text-light fw-bold">
                  Mulai Belajar
                  <i className="fas fa-arrow-right ms-2 pulse-glow"></i>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
