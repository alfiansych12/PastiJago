// app/belajar/javascript/[level]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Swal from 'sweetalert2';
import { useAuth } from '@/contexts/AuthContext';
import AIAssistant from '@/components/AIAssistant';
import levelData from '@/data/levelData.json';
const CodeEditor = dynamic(() => import('@/components/CodeEditor'), { ssr: false });
const LearningToolsJS = dynamic(() => import('@/components/LearningToolsJS'), { ssr: false });

export default function LevelPage() {
  const params = useParams();
  const router = useRouter();
  const levelId = params.level as string;
  const { isAuthenticated, updateUserProgress, getUserProgress, user } = useAuth();
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

  const currentLevel = levelData.javascript[levelId];

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const initializeLevel = async () => {
      if (currentLevel && isAuthenticated) {
        setCode(currentLevel.challenge.starterCode);
        try {
          const progress = await getUserProgress(parseInt(levelId));
          setIsCompleted(progress);
        } catch {
          setIsCompleted(false);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    initializeLevel();
  }, [currentLevel, isAuthenticated, levelId, getUserProgress]);

  const runCode = () => {
    if (isRunning) return;
    setIsRunning(true);
    setOutput('');
    try {
      let outputText = '';
      const originalLog = console.log;
      console.log = (...args) => { outputText += args.join(' ') + '\n'; };
      eval(code);
      console.log = originalLog;
      setOutput(outputText);
      checkCompletion(outputText);
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      Swal.fire({icon: 'error', title: 'Gagal', text: 'Terjadi error saat menjalankan kode', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
    } finally {
      setIsRunning(false);
    }
  };

  const checkCompletion = async (output) => {
    if (!currentLevel) return;
    const cleanOutput = output.trim();
    const expectedOutput = currentLevel.challenge.expectedOutput.trim();
    if (cleanOutput === expectedOutput) {
      if (!isCompleted) {
        setIsCompleted(true);
        try {
          await updateUserProgress(parseInt(levelId), true);
          Swal.fire({icon: 'success', title: 'Sukses', text: `Selamat! Level ${levelId} completed 🎉`, toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
        } catch {
          Swal.fire({icon: 'error', title: 'Gagal', text: 'Gagal menyimpan progress', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
        }
      } else {
        Swal.fire({icon: 'success', title: 'Sukses', text: 'Kode berhasil dijalankan! ✅', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
      }
    } else {
      Swal.fire({icon: 'error', title: 'Gagal', text: 'Output belum sesuai. Coba lagi!', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
    }
  };

  const resetCode = () => {
    if (currentLevel) {
      setCode(currentLevel.challenge.starterCode);
      setOutput('');
      Swal.fire({icon: 'success', title: 'Sukses', text: 'Kode telah direset ke awal', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
    }
  };

  const nextLevel = () => {
    const nextLevelId = (parseInt(levelId) + 1).toString();
    if (levelData.javascript[nextLevelId]) {
      router.push(`/belajar/javascript/${nextLevelId}`);
    } else {
      Swal.fire({icon: 'success', title: 'Sukses', text: 'Selamat! Anda telah menyelesaikan semua level 🎊', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
      router.push('/belajar/javascript');
    }
  };

  if (!isAuthenticated || isLoading) {
    return (
      <div className="container-fluid bg-dark text-light min-vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <div className="spinner-border text-warning" style={{width: '3rem', height: '3rem'}} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentLevel) {
    return (
      <div className="container-fluid bg-dark text-light min-vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-warning display-1 mb-4"></i>
          <h2 className="text-warning">Level tidak ditemukan</h2>
          <p className="text-light">Level yang Anda cari tidak tersedia.</p>
          <button onClick={() => router.push('/belajar/javascript')} className="btn btn-warning mt-3">
            <i className="fas fa-arrow-left me-2"></i>Kembali ke Daftar Level
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid bg-dark text-light vh-100 pt-5">
      <div className="row h-100 g-0">
        <div className="col-md-4 border-end border-secondary p-4" style={{height: '100vh', overflowY: 'auto'}}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <button onClick={() => router.push('/belajar/javascript')} className="btn btn-outline-warning btn-sm me-3">
                <i className="fas fa-arrow-left me-2"></i>Back
              </button>
              <span className="badge bg-warning text-dark">Level {levelId}</span>
            </div>
            <div className="d-flex align-items-center">
              {isCompleted && (
                <span className="badge bg-success fs-6 me-2"><i className="fas fa-check me-1"></i>Completed</span>
              )}
              <div className="text-warning fw-bold"><i className="fas fa-star me-1"></i>{user?.exp || 0} EXP</div>
            </div>
          </div>
          <h4 className="text-warning mb-3">{currentLevel.title}</h4>
          <div className="theory-content text-light" dangerouslySetInnerHTML={{__html: currentLevel.theory.replace(/\`\`\`javascript\n([\s\S]*?)\n\`\`\`/g, '<pre class="bg-black p-3 rounded mt-3 mb-3"><code class="text-warning font-monospace">$1</code></pre>').replace(/# (.*?)\n/g, '<h6 class="text-warning mt-4 mb-3">$1</h6>').replace(/## (.*?)\n/g, '<h6 class="text-light mt-3 mb-2 fw-bold">$1</h6>').replace(/\n/g, '<br>')}} />
          <div className="challenge-section mt-4 p-4 bg-secondary rounded-4">
            <h6 className="text-warning mb-3 d-flex align-items-center"><i className="fas fa-bullseye me-2"></i>🎯 Tantangan</h6>
            <p className="text-light mb-3">{currentLevel.challenge.description}</p>
            <div className="bg-black p-3 rounded-3">
              <small className="text-warning d-block mb-1"><i className="fas fa-flag me-1"></i>Expected Output:</small>
              <code className="text-light font-monospace">{currentLevel.challenge.expectedOutput}</code>
            </div>
          </div>
          <div className="tips-section mt-4 p-3 bg-primary rounded-4">
            <h6 className="text-light mb-2 d-flex align-items-center"><i className="fas fa-lightbulb me-2"></i>💡 Tips</h6>
            <small className="text-light">• Gunakan <code>console.log()</code> untuk menampilkan output<br/>• Pastikan output sesuai dengan yang diharapkan<br/>• Klik "Run Code" untuk menguji solusi Anda</small>
          </div>
        </div>
        <div className="col-md-8 d-flex flex-column h-100">
          <div className="p-3 border-bottom border-secondary d-flex justify-content-between align-items-center bg-dark">
            <h5 className="text-warning mb-0 d-flex align-items-center"><i className="fas fa-code me-2"></i>Editor JavaScript</h5>
            <div className="d-flex gap-2">
              <button onClick={resetCode} className="btn btn-outline-warning btn-sm" disabled={isRunning}><i className="fas fa-redo me-1"></i>Reset</button>
              <button onClick={runCode} className="btn btn-warning btn-sm" disabled={isRunning || isCompleted}>
                {isRunning ? (<><span className="spinner-border spinner-border-sm me-1" role="status"></span>Running...</>) : isCompleted ? (<><i className="fas fa-check me-1"></i>Completed</>) : (<><i className="fas fa-play me-1"></i>Run Code</>)}
              </button>
              {isCompleted && levelData.javascript[(parseInt(levelId) + 1).toString()] && (
                <button onClick={nextLevel} className="btn btn-success btn-sm">Next Level <i className="fas fa-arrow-right ms-1"></i></button>
              )}
            </div>
          </div>
          <div className="flex-grow-1 position-relative" style={{minHeight: '300px'}}>
            <CodeEditor code={code} onChange={setCode} height="100%" />
          </div>
          <div className="border-top border-secondary" style={{height: '200px', flexShrink: 0}}>
            <div className="p-3 h-100 d-flex flex-column bg-dark">
              <h6 className="text-warning mb-2 d-flex align-items-center"><i className="fas fa-terminal me-2"></i>Output:{output && (<span className={`badge ms-2 ${output.trim() === currentLevel.challenge.expectedOutput.trim() ? 'bg-success' : 'bg-danger'}`}>{output.trim() === currentLevel.challenge.expectedOutput.trim() ? '✓ Sesuai' : '✗ Tidak Sesuai'}</span>)}</h6>
              <pre className="bg-black p-3 rounded flex-grow-1 overflow-auto text-light mb-0 font-monospace">{output || 'Jalankan kode untuk melihat output...'}</pre>
            </div>
          </div>
        </div>
      </div>
      <LearningToolsJS code={code} output={output} />
      <AIAssistant currentCode={code} currentLevel={parseInt(levelId)} />
      <style jsx>{`
        .theory-content { max-height: 60vh; overflow-y: auto; padding-right: 10px; }
        .theory-content::-webkit-scrollbar { width: 6px; }
        .theory-content::-webkit-scrollbar-track { background: #1e293b; border-radius: 3px; }
        .theory-content::-webkit-scrollbar-thumb { background: #475569; border-radius: 3px; }
        .theory-content::-webkit-scrollbar-thumb:hover { background: #64748b; }
        @media (max-height: 768px) { .theory-content { max-height: 50vh; } }
      `}</style>
    </div>
  );
}
