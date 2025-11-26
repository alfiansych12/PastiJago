// app/projects/page.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import projectData from '@/data/projectData.json';

interface Project {
  id: number;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  prerequisites: number[];
  skills: string[];
  features: string[];
}

export default function ProjectsPage() {
  const { isAuthenticated, user, getUserProgress } = useAuth();
  const [userProgress, setUserProgress] = useState<Record<number, boolean>>({});
  const [completedLevels, setCompletedLevels] = useState<number>(0);

  useEffect(() => {
    if (isAuthenticated) {
      // Hitung level yang sudah completed (await async checks)
      const loadProgress = async () => {
        const progress: Record<number, boolean> = {};
        let count = 0;

        const checks = await Promise.all(
          Array.from({ length: 10 }, (_, idx) => getUserProgress(idx + 1))
        );

        checks.forEach((completed, idx) => {
          const level = idx + 1;
          progress[level] = !!completed;
          if (completed) count++;
        });

        setUserProgress(progress);
        setCompletedLevels(count);
      };

      loadProgress();
    }
  }, [isAuthenticated, getUserProgress]);

  const canAccessProject = (prerequisites: number[]): boolean => {
    return prerequisites.every(level => userProgress[level]);
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-success';
      case 'Intermediate': return 'bg-warning';
      case 'Advanced': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

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
                  Anda perlu login terlebih dahulu untuk mengakses halaman projects.
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

  return (
    <div className="min-vh-100 text-light position-relative py-5 mt-5">
      <div className="container position-relative z-2">
        {/* Header Section */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="glass-effect rounded-4 p-4 mb-4">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <span className="badge glass-effect border-0 px-3 py-2 mb-2">
                    🛠️ Project-Based Learning
                  </span>
                  <h1 className="display-5 fw-bold gradient-text mb-3">
                    Real World Projects
                  </h1>
                  <p className="text-muted fs-5 mb-0">
                    Terapkan skill JavaScript-mu dengan membangun project nyata. 
                    <span className="d-block">Sempurnakan portfolio dan persiapkan karir di dunia programming.</span>
                  </p>
                </div>
                <div className="col-md-4 text-md-end">
                  <div className="bg-dark rounded-4 p-3 d-inline-block">
                    <div className="text-center">
                      <div className="text-warning fw-bold display-6">{completedLevels}/10</div>
                      <small className="text-muted">Level Completed</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="bg-secondary rounded-4 p-4">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <h5 className="text-warning mb-2">Progress Belajar</h5>
                  <p className="text-light mb-0">
                    Complete lebih banyak level untuk membuka project yang lebih advanced
                  </p>
                </div>
                <div className="col-md-6">
                  <div className="progress glass-effect" style={{height: '20px'}}>
                    <div 
                      className="progress-bar bg-warning" 
                      style={{width: `${(completedLevels / 10) * 100}%`}}
                    >
                      <span className="fw-bold">{completedLevels}/10 Level</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="row g-4">
          {projectData.projects.map((project: Project) => {
            const canAccess = canAccessProject(project.prerequisites);
            const completedPrerequisites = project.prerequisites.filter(level => userProgress[level]).length;
            
            return (
              <div key={project.id} className="col-lg-6">
                <div className={`glass-effect rounded-4 p-4 h-100 hover-lift position-relative ${
                  !canAccess ? 'opacity-50' : ''
                }`}>
                  
                  {/* Project Header */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <span className={`badge ${getLevelBadgeColor(project.level)} me-2`}>
                        {project.level}
                      </span>
                      <span className="badge bg-primary">
                        Project #{project.id}
                      </span>
                    </div>
                    <div className="text-warning">
                      <i className="fas fa-star me-1"></i>
                      {project.prerequisites.length} Prerequisites
                    </div>
                  </div>

                  {/* Project Content */}
                  <h4 className="text-warning mb-3">{project.title}</h4>
                  <p className="text-light mb-4">{project.description}</p>

                  {/* Skills */}
                  <div className="mb-3">
                    <h6 className="text-warning mb-2">Skills yang Dipelajari:</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {project.skills.map((skill, index) => (
                        <span key={index} className="badge bg-dark text-light">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-4">
                    <h6 className="text-warning mb-2">Fitur:</h6>
                    <ul className="text-light small">
                      {project.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Prerequisites */}
                  <div className="mb-4">
                    <h6 className="text-warning mb-2">Prerequisites:</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {project.prerequisites.map(level => (
                        <span 
                          key={level} 
                          className={`badge ${
                            userProgress[level] ? 'bg-success' : 'bg-secondary'
                          }`}
                        >
                          Level {level} {userProgress[level] ? '✓' : '✗'}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      {!canAccess ? (
                        <span className="text-muted small">
                          Complete {completedPrerequisites}/{project.prerequisites.length} prerequisites
                        </span>
                      ) : (
                        <span className="badge bg-success">
                          <i className="fas fa-lock-open me-1"></i>
                          Ready to Start
                        </span>
                      )}
                    </div>
                    
                    <Link 
                      href={canAccess ? `/projects/${project.id}` : '#'}
                      className={`btn btn-sm ${
                        canAccess 
                          ? 'btn-warning text-dark fw-bold' 
                          : 'btn-secondary disabled'
                      }`}
                    >
                      {canAccess ? 'Start Project' : 'Locked'}
                      <i className={`fas fa-arrow-right ms-2 ${
                        canAccess ? 'pulse-glow' : ''
                      }`}></i>
                    </Link>
                  </div>

                  {/* Lock Overlay */}
                  {!canAccess && (
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center rounded-4 bg-dark bg-opacity-75">
                      <div className="text-center">
                        <i className="fas fa-lock text-warning display-6 mb-3"></i>
                        <p className="text-light mb-0">Complete prerequisites to unlock</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="row mt-5">
          <div className="col-12 text-center">
            <div className="glass-effect rounded-4 p-5">
              <i className="fas fa-rocket text-warning display-1 mb-4"></i>
              <h3 className="text-warning mb-3">Ready for More Challenges?</h3>
              <p className="text-light mb-4">
                Complete all projects to build an impressive portfolio and prepare for real-world development.
              </p>
              <Link href="/belajar" className="btn btn-warning btn-lg">
                <i className="fas fa-graduation-cap me-2"></i>
                Continue Learning
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}