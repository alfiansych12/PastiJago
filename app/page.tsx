// app/page.tsx
import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="min-vh-100 text-light position-relative overflow-hidden">
      {/* Background gradient matching other pages */}
      <div className="position-absolute w-100 h-100 top-0 left-0" style={{
        background: 'linear-gradient(135deg, #0a0f1c 0%, #0f172a 50%, #1a2847 100%)',
        zIndex: 0
      }}></div>

      {/* Subtle background shapes */}
      <div className="position-absolute w-100 h-100 top-0 left-0" style={{zIndex: 1}}>
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          top: '-100px',
          right: '-100px',
          filter: 'blur(40px)'
        }}></div>
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.06) 0%, transparent 70%)',
          borderRadius: '50%',
          bottom: '-50px',
          left: '-50px',
          filter: 'blur(40px)'
        }}></div>
      </div>

      <div className="container py-5 position-relative" style={{zIndex: 2}}>
        {/* Hero Section */}
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

            <div className="d-flex flex-column flex-sm-row gap-3">
              <Link href="/belajar" className="btn btn-primary btn-lg px-5 py-3 fw-bold border-0">
                <i className="fas fa-rocket me-2"></i>
                Mulai Belajar Sekarang
              </Link>
              <button className="btn btn-outline-light btn-lg px-5 py-3 fw-bold glass-effect">
                <i className="fas fa-play-circle me-2"></i>
                Lihat Demo
              </button>
            </div>

            {/* Stats */}
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
            {/* Hero Illustration */}
            <div className="position-relative">
              <div className="glass-effect rounded-4 p-5 hover-lift">
                <div className="text-center mb-4">
                  <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{width: '80px', height: '80px'}}>
                    <i className="fas fa-code text-white fs-2"></i>
                  </div>
                  <h4 className="text-warning mb-3">💻 Coba JavaScript Editor</h4>
                </div>
                
                <div className="bg-dark rounded-3 p-4 mb-4">
                  <pre className="text-light mb-0 font-monospace" style={{fontSize: '0.9rem'}}>
                    <code>{`// Contoh kode JavaScript modern
const sapa = (nama) => \`Halo, \${nama}!\`;

const user = {
  nama: "Developer",
  level: "Beginner"
};

console.log(sapa(user.nama));
console.log(\`Level: \${user.level}\`);`}</code>
                  </pre>
                </div>
                
                <div className="bg-success rounded-2 p-3">
                  <small className="text-white">
                    <i className="fas fa-play me-2"></i>
                    Output: "Halo, Developer!" "Level: Beginner"
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
              <div className="bg-gradient-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-4" 
                   style={{width: '80px', height: '80px'}}>
                <i className="fas fa-laptop-code text-white fs-3"></i>
              </div>
              <h5 className="text-warning mb-3">Editor Interaktif</h5>
              <p className="text-muted">
                Praktik langsung dengan editor code seperti VS Code. Langsung lihat hasil kode kamu secara real-time.
              </p>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="glass-effect rounded-4 p-4 h-100 hover-lift text-center">
              <div className="bg-gradient-warning rounded-circle d-inline-flex align-items-center justify-content-center mb-4" 
                   style={{width: '80px', height: '80px'}}>
                <i className="fas fa-gamepad text-white fs-3"></i>
              </div>
              <h5 className="text-primary mb-3">Belajar Sambil Bermain</h5>
              <p className="text-muted">
                Sistem level dan achievement yang membuat belajar programming seru seperti bermain game.
              </p>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="glass-effect rounded-4 p-4 h-100 hover-lift text-center">
              <div className="bg-gradient-success rounded-circle d-inline-flex align-items-center justify-content-center mb-4" 
                   style={{width: '80px', height: '80px'}}>
                <i className="fas fa-trophy text-white fs-3"></i>
              </div>
              <h5 className="text-success mb-3">Komunitas Aktif</h5>
              <p className="text-muted">
                Bersaing dengan developer lain di leaderboard dan dapatkan pengakuan untuk skill kamu.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}