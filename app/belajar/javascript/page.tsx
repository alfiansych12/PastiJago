// app/belajar/javascript/page.tsx

'use client';
import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import levelData from '@/data/levelData.json';

export default function BelajarJavascriptPage() {
  const { isAuthenticated, getUserProgress, user } = useAuth();
  const [userProgress, setUserProgress] = React.useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadProgress = async () => {
      if (isAuthenticated) {
        const progress: Record<string, boolean> = {};
        for (const key in levelData.javascript) {
          try {
            const completed = await getUserProgress(parseInt(key));
            progress[key] = completed;
          } catch {
            progress[key] = false;
          }
        }
        setUserProgress(progress);
      }
      setIsLoading(false);
    };
    loadProgress();
  }, [isAuthenticated, getUserProgress]);

  if (!isAuthenticated) {
    return (
      <div className="min-vh-100 text-light d-flex justify-content-center align-items-center">
        <div className="glass-effect rounded-4 p-5 text-center">
          <i className="fas fa-lock text-warning display-1 mb-4"></i>
          <h2 className="text-warning mb-3">Akses Ditolak</h2>
          <p className="text-light mb-4">Anda perlu login untuk mengakses halaman belajar JavaScript.</p>
          <Link href="/login" className="btn btn-warning btn-lg">
            <i className="fas fa-sign-in-alt me-2"></i>Login Sekarang
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-vh-100 text-light d-flex justify-content-center align-items-center">
        <div className="spinner-border text-warning" style={{width: '3rem', height: '3rem'}} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading progress...</p>
      </div>
    );
  }

  const levels = Object.entries(levelData.javascript).map(([key, value]) => ({
    ...value,
    id: parseInt(key),
    level_number: parseInt(key),
    exp_reward: 100
  }));
  const completedLevels = levels.filter(lvl => userProgress[lvl.id]).length;
  const totalExp = completedLevels * 100;

  return (
    <div className="min-vh-100 text-light position-relative py-5 mt-5">
      <div className="container position-relative z-2">
        {/* User Info */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="glass-effect rounded-4 p-4" style={{borderLeft: '4px solid #f59e42'}}>
              <div className="row align-items-center">
                <div className="col-md-6">
                  <h4 className="text-warning mb-1">Halo, {user?.username}! 👋</h4>
                  <p className="text-muted mb-0">Mari kuasai JavaScript dan bangun aplikasi interaktif</p>
                </div>
                <div className="col-md-6 text-md-end">
                  <div className="d-inline-flex gap-3">
                    <div className="bg-dark rounded-3 px-3 py-2">
                      <small className="text-muted">JS Levels Completed</small>
                      <div className="text-warning fw-bold fs-4">{completedLevels}/{levels.length}</div>
                    </div>
                    <div className="bg-dark rounded-3 px-3 py-2">
                      <small className="text-muted">Total EXP</small>
                      <div className="text-warning fw-bold fs-4">{totalExp}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-5">
          <div className="col-12 text-center">
            <span className="badge glass-effect border-0 px-4 py-2 mb-3" style={{background: 'linear-gradient(135deg, #f59e42 0%, #fbbf24 100%)'}}>
              <i className="fab fa-js-square me-2"></i>
              JavaScript Learning Path
            </span>
            <h1 className="display-4 fw-bold mb-3" style={{background: 'linear-gradient(135deg, #f59e42 0%, #fbbf24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
              Master JavaScript
            </h1>
            <p className="text-muted fs-5">
              Pelajari logika pemrograman dan aplikasi web modern dengan JavaScript. Dari dasar hingga advanced dalam 20 level terstruktur
            </p>
          </div>
        </div>
        <div className="row g-4">
          {levels.map((level) => (
            <div key={level.id} className="col-xl-6">
              <div className={`glass-effect rounded-4 p-4 h-100 hover-lift position-relative overflow-hidden ${userProgress[level.id] ? 'border-success' : 'border-warning'}`} style={{border: '2px solid transparent', paddingTop: '4rem', paddingRight: '1.5rem'}}>
                {/* Level Number Badge */}
                <div className="position-absolute top-0 end-0" style={{margin: '0.75rem', zIndex: 2}}>
                  <div className={`rounded-circle d-flex align-items-center justify-content-center ${userProgress[level.id] ? 'bg-success' : 'bg-warning'}`} style={{width: '36px', height: '36px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)'}}>
                    <span className="fw-bold text-dark" style={{fontSize: '1rem'}}>{level.level_number}</span>
                  </div>
                </div>
                {/* Progress Indicator & EXP */}
                <div className="mb-3" style={{marginTop: '0.5rem'}}>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-muted small">Progress</span>
                    <span className="text-warning fw-bold">{level.exp_reward} EXP</span>
                  </div>
                  <div className="progress glass-effect" style={{height: '6px'}}>
                    <div className={`progress-bar ${userProgress[level.id] ? 'bg-success' : 'bg-warning'}`} style={{width: userProgress[level.id] ? '100%' : '0%'}}></div>
                  </div>
                </div>
                {/* Content */}
                <h5 className="text-warning mb-3">{level.title}</h5>
                <p className="text-light mb-4">{level.challenge.description}</p>
                {/* Action Button */}
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    {userProgress[level.id] ? (
                      <span className="badge bg-success px-3 py-2">
                        <i className="fas fa-check me-2"></i>
                        Completed
                      </span>
                    ) : (
                      <span className="badge glass-effect px-3 py-2 text-warning">
                        <i className="fas fa-lock-open me-2"></i>
                        Available
                      </span>
                    )}
                  </div>
                  <Link href={`/belajar/javascript/${level.level_number}`} className={`btn btn-sm px-4 py-2 ${userProgress[level.id] ? 'btn-outline-success' : 'btn-warning text-dark fw-bold'}`}>
                    {userProgress[level.id] ? 'Review' : 'Start'}
                    <i className={`fas fa-arrow-right ms-2 ${userProgress[level.id] ? '' : 'pulse-glow'}`}></i>
                  </Link>
                </div>
                {/* Decorative Elements */}
                <div className="position-absolute bottom-0 start-0 w-100">
                  <div className={`${userProgress[level.id] ? 'bg-success' : 'bg-warning'} opacity-25`} style={{height: '3px', width: '100%'}}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Progress Summary */}
        <div className="row mt-5">
          <div className="col-12">
            <div className="glass-effect rounded-4 p-4 text-center" style={{borderLeft: '4px solid #f59e42'}}>
              <h4 className="text-warning mb-3">JS Progress Summary</h4>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <div className="bg-dark rounded-3 p-3">
                    <div className="text-warning fw-bold display-6">{completedLevels}</div>
                    <small className="text-muted">JS Levels Completed</small>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="bg-dark rounded-3 p-3">
                    <div className="text-warning fw-bold display-6">{totalExp}</div>
                    <small className="text-muted">Total EXP</small>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="bg-dark rounded-3 p-3">
                    <div className="text-warning fw-bold display-6">{Math.floor((completedLevels / levels.length) * 100)}%</div>
                    <small className="text-muted">JS Progress</small>
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
