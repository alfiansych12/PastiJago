// app/page.tsx
"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Dashboard() {
    // ...existing code...
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [particles, setParticles] = useState([]);
  const [rocketLaunch, setRocketLaunch] = useState(false);
  const [dashboardFade, setDashboardFade] = useState(false);
  useEffect(() => {
    // Generate particles only on client after mount
    setParticles(Array.from({ length: 24 }, (_, i) => ({
      key: i,
      left: Math.random() * 100 + '%',
      top: Math.random() * 100 + '%',
      delay: Math.random() * 1.5,
      size: Math.random() * 18 + 8,
      color: `rgba(255,193,7,${Math.random() * 0.5 + 0.2})`,
    })));
  }, []);
  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => setFadeOut(true), 1800);
      const timer2 = setTimeout(() => setShowSplash(false), 2200);
      return () => {
        clearTimeout(timer);
        clearTimeout(timer2);
      };
    }
  }, [showSplash]);
  const text = 'Selamat Datang di PastiJago';
  const words = text.split(' ');
  // Sisi animasi: kiri, kanan, atas, bawah, diagonal
  const sides = [
    { x: '-100vw', y: 0 }, // kiri
    { x: '100vw', y: 0 },  // kanan
    { x: 0, y: '-100vh' }, // atas
    { x: 0, y: '100vh' },  // bawah
    { x: '-100vw', y: '-100vh' }, // kiri atas
    { x: '100vw', y: '100vh' },   // kanan bawah
    { x: '-100vw', y: '100vh' },  // kiri bawah
    { x: '100vw', y: '-100vh' },  // kanan atas
  ];
  if (showSplash) {
    // ...existing splash code...
  }
    return (
      <div className={`min-vh-100 text-light position-relative overflow-hidden${dashboardFade ? ' dashboard-fade-out' : ''}`}>
        <div className="container py-5 position-relative" style={{zIndex: 2}}>
          <div className="row align-items-center min-vh-100 py-5">
            <div className="col-lg-6 mb-5 mb-lg-0">
              <div className="mb-4">
                <span className="badge glass-effect border-0 px-4 py-2 mb-3 pulse-glow">
                  🚀 Platform Belajar Programming Interaktif
                </span>
                <h1 className="display-3 fw-bold mb-4">
                  Jadilah Expert
                  <span className="gradient-text d-block" style={{fontSize: '1.2em', fontWeight: '900'}}>Developer Profesional</span>
                </h1>
                <p className="lead fs-4 text-secondary mb-5">
                  Kuasai programming dari dasar hingga mahir melalui tantangan coding interaktif.
                  <span className="d-block">Dirancang untuk pemula sampai profesional.</span>
                </p>
              </div>
              <div className="d-flex flex-column flex-sm-row gap-3" style={{ position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                  <motion.button
                    className="btn btn-primary btn-lg px-5 py-3 fw-bold border-0 position-relative overflow-visible"
                    style={{ minWidth: 260 }}
                    onClick={() => {
                      setRocketLaunch(true);
                      setTimeout(() => setDashboardFade(true), 700);
                      setTimeout(() => {
                        window.location.href = '/belajar';
                      }, 1400);
                    }}
                    disabled={rocketLaunch}
                  >
                    <span style={{ position: 'relative', display: 'inline-block', width: 32, height: 32, marginRight: 12 }}>
                      <motion.span
                        initial={{ x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 }}
                        animate={rocketLaunch ? {
                          x: [0, 120, 320, 420],
                          y: [0, -60, -520, -840],
                          scale: [1, 1.2, 0.9, 0.6],
                          rotate: [0, 25, 40, 60],
                          opacity: [1, 1, 0.7, 0.3, 0],
                        } : { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 }}
                        transition={rocketLaunch ? {
                          duration: 1.2,
                          ease: 'easeInOut',
                        } : {}}
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          fontSize: '2rem',
                          zIndex: 2,
                          filter: 'drop-shadow(0 2px 16px #ffd700) drop-shadow(0 0px 32px #fffbe7)',
                          textShadow: '0 0 24px #fffbe7, 0 2px 12px #ffc10788',
                        }}
                      >
                        🚀
                      </motion.span>
                      {/* Rocket trail effect - more luxurious */}
                      {rocketLaunch && (
                        <motion.div
                          initial={{ opacity: 0.8, scaleY: 0.7 }}
                          animate={{
                            opacity: [0.8, 0.5, 0.2, 0],
                            scaleY: [0.7, 1.5, 2.2, 2.8],
                            boxShadow: [
                              '0 0 16px 8px #ffd70088',
                              '0 0 32px 16px #fffbe7aa',
                              '0 0 48px 24px #ffc10744',
                              '0 0 0px 0px transparent'
                            ],
                          }}
                          transition={{ duration: 1.1, ease: 'easeOut' }}
                          style={{
                            position: 'absolute',
                            left: '50%',
                            top: '80%',
                            width: 12,
                            height: 48,
                            background: 'linear-gradient(180deg, #ffd700 0%, #fffbe7 80%, transparent 100%)',
                            borderRadius: 12,
                            transform: 'translateX(-50%)',
                            zIndex: 1,
                            filter: 'blur(3px)',
                          }}
                        />
                      )}
                    </span>
                    Mulai Belajar Sekarang
                  </motion.button>
                  <button className="btn btn-outline-light btn-lg px-5 py-3 fw-bold glass-effect">
                    <i className="fas fa-play-circle me-2"></i>
                    Lihat Demo
                  </button>
                </div>
              </div>
              <div className="row mt-5 pt-4">
                <div className="col-4">
                  <div className="text-center">
                    <h3 className="text-warning fw-bold display-6">10+</h3>
                    <small className="text-muted">Level Kesulitan</small>
                  </div>
                </div>
                <div className="col-4">
                  <div className="text-center">
                    <h3 className="text-primary fw-bold display-6">50+</h3>
                    <small className="text-muted">Tantangan</small>
                  </div>
                </div>
                <div className="col-4">
                  <div className="text-center">
                    <h3 className="text-success fw-bold display-6">100+</h3>
                    <small className="text-muted">Konsep</small>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="position-relative">
                <div className="glass-effect rounded-4 p-5 hover-lift">
                  <div className="text-center mb-4">
                    <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                      <i className="fas fa-code text-white fs-2"></i>
                    </div>
                    <h4 className="text-warning mb-3">💻 Coba JavaScript Editor</h4>
                  </div>
                  <div className="bg-dark rounded-3 p-4 mb-4">
                    <pre className="text-light mb-0 font-monospace" style={{fontSize: '0.9rem'}}>
                      <code>{`// Contoh kode JavaScript modern\nconst sapa = (nama) => \`Halo, \${nama}!\`;\n\nconst user = {\n  nama: "Developer",\n  level: "Beginner"\n};\n\nconsole.log(sapa(user.nama));\nconsole.log(\`Level: \${user.level}\`);`}</code>
                    </pre>
                  </div>
                  <div className="bg-success rounded-2 p-3">
                    <small className="text-white">
                      <i className="fas fa-play me-2"></i>
                      Output: &quot;Halo, Developer!&quot; &quot;Level: Beginner&quot;
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Features Section */}
          <div className="row py-5 mt-5">
            <div className="col-12 text-center mb-5">
              <h2 className="display-5 fw-bold gradient-text mb-3">Kenapa Belajar di Sini?</h2>
              <p className="text-muted fs-5">Metode belajar yang dirancang untuk membuat kamu cepat paham</p>
            </div>
            <div className="col-md-4 mb-4">
              <div className="glass-effect rounded-4 p-4 h-100 hover-lift text-center">
                <div className="bg-gradient-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{width: '80px', height: '80px'}}>
                  <i className="fas fa-laptop-code text-white fs-3"></i>
                </div>
                <h5 className="text-warning mb-3">Editor Interaktif</h5>
                <p className="text-muted">Praktik langsung dengan editor code seperti VS Code. Langsung lihat hasil kode kamu secara real-time.</p>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="glass-effect rounded-4 p-4 h-100 hover-lift text-center">
                <div className="bg-gradient-warning rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{width: '80px', height: '80px'}}>
                  <i className="fas fa-gamepad text-white fs-3"></i>
                </div>
                <h5 className="text-primary mb-3">Belajar Sambil Bermain</h5>
                <p className="text-muted">Sistem level dan achievement yang membuat belajar programming seru seperti bermain game.</p>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="glass-effect rounded-4 p-4 h-100 hover-lift text-center">
                <div className="bg-gradient-success rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{width: '80px', height: '80px'}}>
                  <i className="fas fa-trophy text-white fs-3"></i>
                </div>
                <h5 className="text-success mb-3">Komunitas Aktif</h5>
                <p className="text-muted">Bersaing dengan developer lain di leaderboard dan dapatkan pengakuan untuk skill kamu.</p>
              </div>
            </div>
          </div>
        </div>
        <style jsx global>{`
          .dashboard-fade-out {
            opacity: 0;
            transition: opacity 0.7s cubic-bezier(0.4,0.8,0.6,1);
          }
        `}</style>
      </div>
    );
}