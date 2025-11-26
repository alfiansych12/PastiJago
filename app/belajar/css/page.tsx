// app/belajar/css/page.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

// Import data CSS
import cssLevels from '@/data/cssLevelData.json';

interface Level {
  id: number;
  level_number: number;
  title: string;
  description: string;
  theory_content: string;
  exp_reward: number;
}

export default function CssLearningPage() {
  const { isAuthenticated, user, getUserProgress } = useAuth();
  const [userProgress, setUserProgress] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Convert JSON data to levels array
  const levels: Level[] = Object.entries(cssLevels).map(([key, value]) => ({
    id: parseInt(key),
    level_number: parseInt(key),
    title: value.title,
    description: value.challenge.description,
    theory_content: value.theory,
    exp_reward: 100
  }));

  useEffect(() => {
    const loadProgress = async () => {
      if (isAuthenticated) {
        try {
          const progress: Record<number, boolean> = {};
          
          for (const level of levels) {
            try {
              // For CSS levels, we'll use level numbers starting from 200 to avoid conflict
              const completed = await getUserProgress(level.id + 200);
              progress[level.id] = completed;
            } catch (error) {
              console.error(`Error loading progress for CSS level ${level.id}:`, error);
              progress[level.id] = false;
            }
          }
          
          setUserProgress(progress);
        } catch (error) {
          console.error('Error loading CSS progress:', error);
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
                  Anda perlu login terlebih dahulu untuk mengakses halaman belajar CSS.
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
              <p className="mt-3">Loading CSS progress...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const completedLevels = Object.values(userProgress).filter(Boolean).length;
  const totalExp = completedLevels * 100;

  return (
    <div className="min-vh-100 text-light position-relative py-5 mt-5">
      <div className="container position-relative z-2">
        {/* User Info */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="glass-effect rounded-4 p-4" style={{borderLeft: '4px solid #0ea5e9'}}>
              <div className="row align-items-center">
                <div className="col-md-6">
                  <h4 className="text-warning mb-1">Halo, {user?.username}! 👋</h4>
                  <p className="text-muted mb-0">Mari kuasai CSS dan buat website yang menakjubkan</p>
                </div>
                <div className="col-md-6 text-md-end">
                  <div className="d-inline-flex gap-3">
                    <div className="bg-dark rounded-3 px-3 py-2">
                      <small className="text-muted">CSS Levels Completed</small>
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
            <span className="badge glass-effect border-0 px-4 py-2 mb-3" style={{background: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)'}}>
              <i className="fab fa-css3-alt me-2"></i>
              CSS Learning Path
            </span>
            <h1 className="display-4 fw-bold mb-3" style={{background: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
              Master CSS
            </h1>
            <p className="text-muted fs-5">
              Pelajari seni styling web dengan CSS3. Dari dasar hingga konsep layout modern dalam 15 level terstruktur
            </p>
          </div>
        </div>
        
        <div className="row g-4">
          {levels.map((level) => (
            <div key={level.id} className="col-xl-6">
              <div className={`glass-effect rounded-4 p-4 h-100 hover-lift position-relative overflow-hidden ${
                userProgress[level.id] ? 'border-success' : 'border-info'
              }`} style={{border: '2px solid transparent', paddingTop: '4rem', paddingRight: '1.5rem'}}>
                {/* Level Number Badge */}
                <div className="position-absolute top-0 end-0" style={{margin: '0.75rem', zIndex: 2}}>
                  <div className={`rounded-circle d-flex align-items-center justify-content-center ${
                    userProgress[level.id] ? 'bg-success' : 'bg-info'
                  }`} style={{width: '36px', height: '36px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', marginBottom: '1rem'}}>
                    <span className="fw-bold text-dark" style={{fontSize: '1rem'}}>{level.level_number}</span>
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="mb-3" style={{marginTop: '0.5rem'}}>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-muted small">Progress</span>
                    <span className="text-warning fw-bold">{level.exp_reward} EXP</span>
                  </div>
                  <div className="progress glass-effect" style={{height: '6px'}}>
                    <div 
                      className={`progress-bar ${userProgress[level.id] ? 'bg-success' : 'bg-info'}`}
                      style={{width: userProgress[level.id] ? '100%' : '0%'}}
                    ></div>
                  </div>
                </div>

                {/* Content */}
                <h5 className="text-warning mb-3">{level.title}</h5>
                <p className="text-light mb-4">{level.description}</p>

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
                  
                  <Link 
                    href={`/belajar/css/${level.level_number}`}
                    className={`btn btn-sm px-4 py-2 ${
                      userProgress[level.id] 
                        ? 'btn-outline-success' 
                        : 'btn-info text-light fw-bold'
                    }`}
                  >
                    {userProgress[level.id] ? 'Review' : 'Start'}
                    <i className={`fas fa-arrow-right ms-2 ${
                      userProgress[level.id] ? '' : 'pulse-glow'
                    }`}></i>
                  </Link>
                </div>

                {/* Decorative Elements */}
                <div className="position-absolute bottom-0 start-0 w-100">
                  <div className={`${userProgress[level.id] ? 'bg-success' : 'bg-info'} opacity-25`} 
                       style={{height: '3px', width: '100%'}}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress Summary */}
        <div className="row mt-5">
          <div className="col-12">
            <div className="glass-effect rounded-4 p-4 text-center" style={{borderLeft: '4px solid #0ea5e9'}}>
              <h4 className="text-warning mb-3">CSS Progress Summary</h4>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <div className="bg-dark rounded-3 p-3">
                    <div className="text-warning fw-bold display-6">{completedLevels}</div>
                    <small className="text-muted">CSS Levels Completed</small>
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
                    <small className="text-muted">CSS Progress</small>
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