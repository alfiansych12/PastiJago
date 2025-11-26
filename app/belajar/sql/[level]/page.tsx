// app/belajar/sql/[level]/page.tsx
'use client';
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import sqlLevels from '@/data/sqlLevelData.json';
import dynamic from 'next/dynamic';
const SqlEditor = dynamic(() => import('../SqlEditor'), { ssr: false });
const LearningTools = dynamic(() => import('@/components/LearningTools'), { ssr: false });

type User = { id: number; name: string; age: number };

export default function SqlLevelPage({ params }: { params: Promise<{ level: string }> }) {
  const router = useRouter();
  const { level } = React.use(params);
  const levelData = sqlLevels[level];
  const [showTheory, setShowTheory] = useState(true);
  const [exp, setExp] = useState(0);

  // Data default users
  const defaultUsers: User[] = [
    { id: 1, name: 'Alice', age: 22 },
    { id: 2, name: 'Bob', age: 30 },
    { id: 3, name: 'Charlie', age: 25 },
    { id: 4, name: 'Diana', age: 28 },
  ];

  // State untuk live preview
  const [liveUsers, setLiveUsers] = useState<User[]>(defaultUsers);
  const [code, setCode] = useState('SELECT * FROM users;');
  const [output, setOutput] = useState('');

  // Handler untuk update live preview dari SqlEditor
  // Fungsi cek keberhasilan challenge
  const checkChallengeSuccess = (newUsers: User[]) => {
    let isSuccess = false;
    // Level 1: SELECT * FROM users; (cek minimal 3 user ada)
    if (level === '1' && newUsers.length >= 3) isSuccess = true;
    // Level 2: INSERT Diana
    if (level === '2' && newUsers.some(u => u.name === 'Diana' && u.age === 28)) isSuccess = true;
    // Level 3: UPDATE Diana age 29
    if (level === '3' && newUsers.some(u => u.name === 'Diana' && u.age === 29)) isSuccess = true;
    // Level 4: DELETE Bob
    if (level === '4' && !newUsers.some(u => u.name === 'Bob')) isSuccess = true;
    return isSuccess;
  };

  const handleLiveUpdate = (newUsers: User[]) => {
    setLiveUsers(newUsers);
    setOutput(JSON.stringify(newUsers, null, 2));
    if (checkChallengeSuccess(newUsers)) {
      if (exp === 0) {
        setExp(100); // misal 100 exp per challenge
        Swal.fire({
          icon: 'success',
          title: 'Tantangan Berhasil!',
          text: 'Kamu mendapatkan 100 EXP!',
          timer: 1800,
          showConfirmButton: false
        });
      }
    }
  };

  if (!levelData) {
    return (
      <div className="min-vh-100 text-light d-flex justify-content-center align-items-center">
        <div className="glass-effect rounded-4 p-5 text-center">
          <h2 className="text-warning mb-3">Level tidak ditemukan</h2>
          <button className="btn btn-warning" onClick={() => router.push('/belajar/sql')}>Kembali</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid bg-dark text-light vh-100 pt-5">
      <div className="row h-100 g-0">
        {/* Panel Kiri: Theory & Challenge */}
        <div className="col-md-4 border-end border-secondary p-4" style={{height: '100vh', overflowY: 'auto'}}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <button onClick={() => router.push('/belajar/sql')} className="btn btn-outline-info btn-sm me-3">
                <i className="fas fa-arrow-left me-2"></i>Back
              </button>
              <span className="badge bg-primary">Level {level}</span>
            </div>
            <div className="d-flex align-items-center">
              {exp > 0 && (
                <span className="badge bg-success fs-6 me-2"><i className="fas fa-check me-1"></i>Completed</span>
              )}
              <div className="text-warning fw-bold"><i className="fas fa-star me-1"></i>{exp} EXP</div>
            </div>
          </div>
          <h4 className="text-warning mb-3">{levelData.title}</h4>
          <div className="theory-content text-light" dangerouslySetInnerHTML={{__html: levelData.theory}} />
          <div className="challenge-section mt-4 p-4 bg-secondary rounded-4">
            <h6 className="text-warning mb-3 d-flex align-items-center"><i className="fas fa-bullseye me-2"></i>🎯 Tantangan</h6>
            <p className="text-light mb-3" dangerouslySetInnerHTML={{__html: levelData.challenge.description}} />
            <div className="bg-black p-3 rounded-3">
              <small className="text-warning d-block mb-1"><i className="fas fa-flag me-1"></i>Expected Output:</small>
              <code className="text-light font-monospace">{levelData.challenge.expectedOutput}</code>
            </div>
          </div>
          <div className="tips-section mt-4 p-3 bg-primary rounded-4">
            <h6 className="text-light mb-2 d-flex align-items-center"><i className="fas fa-lightbulb me-2"></i>💡 Tips</h6>
            <small className="text-light">• Gunakan query SQL sesuai instruksi<br/>• Pastikan output sesuai dengan yang diharapkan<br/>• Klik "Run Query" untuk menguji solusi Anda</small>
          </div>
        </div>
        {/* Panel Kanan: Editor, Output, Tools */}
        <div className="col-md-8 d-flex flex-column h-100">
          <div className="p-3 border-bottom border-secondary d-flex justify-content-between align-items-center bg-dark">
            <h5 className="text-primary mb-0 d-flex align-items-center"><i className="fas fa-database me-2"></i>SQL Editor</h5>
            <div className="d-flex gap-2">
              {/* Tombol Show/Hide Theory dihapus */}
              <button className="btn btn-secondary btn-sm" onClick={() => router.push('/belajar/sql')}><i className="fas fa-redo me-1"></i>Reset</button>
            </div>
          </div>
          <div className="flex-grow-1 position-relative" style={{minHeight: '300px'}}>
            <SqlEditor 
              onLiveUpdate={handleLiveUpdate}
              onError={(errMsg: string) => {
                let alertMsg = 'Syntax error pada query SQL!';
                if (errMsg.toLowerCase().includes('injection')) {
                  alertMsg += '\nAwas SQL Injection!';
                }
                Swal.fire({
                  icon: 'error',
                  title: 'Query Error',
                  text: alertMsg + '\n' + errMsg,
                  toast: true,
                  position: 'top-end',
                  showConfirmButton: false,
                  timer: 3500
                });
              }}
            />
          </div>
          <div className="border-top border-secondary" style={{height: '200px', flexShrink: 0}}>
            <div className="p-3 h-100 d-flex flex-column bg-dark">
              <h6 className="text-primary mb-2 d-flex align-items-center"><i className="fas fa-terminal me-2"></i>Output:</h6>
              <div className="bg-black p-3 rounded flex-grow-1 overflow-auto text-light mb-0 font-monospace">
                <table className="table table-dark table-bordered mb-0">
                  <thead>
                    <tr>
                      <th>id</th>
                      <th>name</th>
                      <th>age</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveUsers.map((row, idx) => (
                      <tr key={row.id + '-' + idx}>
                        <td>{row.id}</td>
                        <td>{row.name}</td>
                        <td>{row.age}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <LearningTools code={code} output={output} />
      {/* <AIAssistant currentCode={query} currentLevel={parseInt(level)} /> */}
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
