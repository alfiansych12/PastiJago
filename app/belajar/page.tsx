// app/belajar/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  totalLevels: number;
  completedLevels: number;
  progress: number;
  available: boolean;
}

export default function BelajarPage() {
  const { isAuthenticated, user, getUserProgress } = useAuth();
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      if (isAuthenticated) {
        try {
          // Simulasi progress untuk setiap learning path
          const paths: LearningPath[] = [
            {
              id: 'javascript',
              title: 'JavaScript Fundamentals',
              description: 'Pelajari dasar-dasar pemrograman dengan JavaScript modern. Mulai dari variabel hingga konsep advanced seperti async/await.',
              icon: 'fab fa-js-square',
              color: 'warning',
              gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              totalLevels: 20,
              completedLevels: 0,
              progress: 0,
              available: true
            },
            {
              id: 'html',
              title: 'HTML & Web Structure',
              description: 'Kuasi struktur web dengan HTML5. Belajar semantic elements, forms, tables, dan best practices untuk accessibility.',
              icon: 'fab fa-html5',
              color: 'danger',
              gradient: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              totalLevels: 15,
              completedLevels: 0,
              progress: 0,
              available: true
            },
            {
              id: 'css',
              title: 'CSS & Web Design',
              description: 'Jadi master styling dengan CSS3. Pelajari Flexbox, Grid, Animations, Responsive Design, dan modern CSS frameworks.',
              icon: 'fab fa-css3-alt',
              color: 'info',
              gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
              totalLevels: 15,
              completedLevels: 0,
              progress: 0,
              available: true
            },
            {
              id: 'sql',
              title: 'SQL & Database',
              description: 'Belajar query dasar SQL: SELECT, INSERT, UPDATE, DELETE, dan lain-lain. Coba langsung di editor interaktif!',
              icon: 'fas fa-database',
              color: 'primary',
              gradient: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
              totalLevels: 5,
              completedLevels: 0,
              progress: 0,
              available: true
            }
          ];

          // Load progress untuk JavaScript (existing)
          let jsCompleted = 0;
          for (let i = 1; i <= 20; i++) {
            const completed = await getUserProgress(i);
            if (completed) jsCompleted++;
          }
          
          paths[0].completedLevels = jsCompleted;
          paths[0].progress = Math.floor((jsCompleted / 20) * 100);

          setLearningPaths(paths);
        } catch (error) {
          console.error('Error loading progress:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [isAuthenticated, getUserProgress]);

  if (!isAuthenticated) {
    return (
      <div className="min-vh-100 text-light position-relative py-5 mt-5">
        <div className="container position-relative z-2">
          <div className="row justify-content-center">
            <div className="col-md-6 text-center">
              <div className="glass-effect rounded-4 p-5">
                <i className="fas fa-lock text-warning display-1 mb-4"></i>
                <h2 className="text-warning mb-3">Akses Ditolak</h2>
                <p className="text-light mb-4">
                  Anda perlu login terlebih dahulu untuk mengakses halaman belajar.
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
              <div className="spinner-border text-warning" style={{width: '3rem', height: '3rem'}} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading learning paths...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 text-light position-relative py-5 mt-5">
      <div className="container position-relative z-2">
        {/* Header Section */}
        <div className="row mb-5">
          <div className="col-12 text-center">
            <span className="badge glass-effect border-0 px-4 py-2 mb-3">
              🎓 Learning Paths
            </span>
            <h1 className="display-4 fw-bold gradient-text mb-3">
              Pilih Jalur Belajar
            </h1>
            <p className="text-muted fs-5">
              Pilih bahasa pemrograman yang ingin Anda kuasai. Setiap path dirancang step-by-step dari dasar hingga mahir.
            </p>
          </div>
        </div>

        {/* User Progress Summary */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="glass-effect rounded-4 p-4">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h4 className="text-warning mb-1">Halo, {user?.username}! 👋</h4>
                  <p className="text-muted mb-0">
                    Lanjutkan perjalanan belajar programming-mu. Pilih path yang sesuai dengan goals-mu.
                  </p>
                </div>
                <div className="col-md-4 text-md-end">
                  <div className="d-inline-flex gap-3">
                    <div className="bg-dark rounded-3 px-3 py-2">
                      <small className="text-muted">Total EXP</small>
                      <div className="text-warning fw-bold fs-4">{user?.exp || 0}</div>
                    </div>
                    <div className="bg-dark rounded-3 px-3 py-2">
                      <small className="text-muted">Level</small>
                      <div className="text-warning fw-bold fs-4">{user?.level ?? 1}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Paths Grid */}
        <div className="row g-4">
          {learningPaths.map((path) => (
            <div key={path.id} className="col-lg-4 col-md-6">
              <div 
                className={`glass-effect rounded-4 p-4 h-100 hover-lift position-relative overflow-hidden ${
                  !path.available ? 'opacity-50' : ''
                }`}
                style={{
                  border: `2px solid transparent`,
                  background: `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%), ${path.gradient}`
                }}
              >
                {/* Path Header */}
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: '60px',
                      height: '60px',
                      background: path.gradient
                    }}
                  >
                    <i className={`${path.icon} text-white fs-4`}></i>
                  </div>
                  <div className="text-end">
                    <span className="badge bg-dark text-light">
                      {path.completedLevels}/{path.totalLevels} Level
                    </span>
                  </div>
                </div>

                {/* Path Content */}
                <h4 className="text-light mb-3">{path.title}</h4>
                <p className="text-light mb-4 opacity-75" style={{ lineHeight: '1.6' }}>
                  {path.description}
                </p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-light small">Progress</span>
                    <span className="text-light fw-bold">{path.progress}%</span>
                  </div>
                  <div className="progress glass-effect" style={{ height: '8px' }}>
                    <div 
                      className="progress-bar"
                      style={{ 
                        width: `${path.progress}%`,
                        background: path.gradient
                      }}
                    ></div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    {path.available ? (
                      <span className="badge bg-success px-3 py-2">
                        <i className="fas fa-lock-open me-2"></i>
                        Available
                      </span>
                    ) : (
                      <span className="badge bg-secondary px-3 py-2">
                        <i className="fas fa-lock me-2"></i>
                        Coming Soon
                      </span>
                    )}
                  </div>
                  
                  {path.available ? (
                    <Link 
                      href={`/belajar/${path.id}`}
                      className="btn btn-light btn-sm px-4 py-2 fw-bold"
                      style={{ color: path.gradient.includes('#f59e0b') ? '#d97706' : 
                               path.gradient.includes('#dc2626') ? '#b91c1c' : '#0369a1' }}
                    >
                      Lanjutkan
                      <i className="fas fa-arrow-right ms-2 pulse-glow"></i>
                    </Link>
                  ) : (
                    <button className="btn btn-secondary btn-sm px-4 py-2" disabled>
                      Segera Hadir
                    </button>
                  )}
                </div>

                {/* Decorative Elements */}
                <div className="position-absolute bottom-0 start-0 w-100">
                  <div 
                    className="opacity-25" 
                    style={{
                      height: '4px',
                      width: '100%',
                      background: path.gradient
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Learning Tips */}
        <div className="row mt-5">
          <div className="col-12">
            <div className="glass-effect rounded-4 p-4">
              <h5 className="text-warning mb-3">
                <i className="fas fa-lightbulb me-2"></i>
                Tips Belajar Efektif
              </h5>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <div className="d-flex align-items-start">
                    <i className="fas fa-code text-warning me-3 mt-1"></i>
                    <div>
                      <h6 className="text-light mb-2">Practice Regularly</h6>
                      <p className="text-muted small mb-0">
                        Luangkan waktu 30 menit setiap hari untuk coding practice.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="d-flex align-items-start">
                    <i className="fas fa-project-diagram text-primary me-3 mt-1"></i>
                    <div>
                      <h6 className="text-light mb-2">Build Projects</h6>
                      <p className="text-muted small mb-0">
                        Aplikasikan konsep dengan membangun project nyata.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="d-flex align-items-start">
                    <i className="fas fa-users text-success me-3 mt-1"></i>
                    <div>
                      <h6 className="text-light mb-2">Join Community</h6>
                      <p className="text-muted small mb-0">
                        Bergabung dengan grup belajar untuk diskusi dan kolaborasi.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}