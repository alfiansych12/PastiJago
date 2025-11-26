// components/LearningTools.tsx
'use client';
import { useState } from 'react';

interface LearningToolsProps {
  code: string;
  output: string;
}

export default function LearningTools({ code, output }: LearningToolsProps) {
  const [showTools, setShowTools] = useState(true);

  // Deteksi SQL: jika code mengandung SELECT/INSERT/UPDATE/DELETE
  const isSQL = /\b(SELECT|INSERT|UPDATE|DELETE)\b/i.test(code);

  if (!code) return null;

  return (
    <div className="row mt-4">
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="text-warning mb-0">
            <i className="fas fa-tools me-2"></i>
            Learning Tools
          </h6>
          <button 
            className="btn btn-sm btn-outline-warning"
            onClick={() => setShowTools(!showTools)}
          >
            {showTools ? (
              <>
                <i className="fas fa-eye-slash me-1"></i>
                Hide Tools
              </>
            ) : (
              <>
                <i className="fas fa-eye me-1"></i>
                Show Learning Tools
              </>
            )}
          </button>
        </div>
        <div
          className={`row g-3 learning-tools-anim ${showTools ? 'open' : 'closed'}`}
          style={{
            maxHeight: showTools ? 2000 : 0,
            opacity: showTools ? 1 : 0,
            transform: showTools ? 'translateY(0)' : 'translateY(-20px)',
            transition: 'all 2.5s cubic-bezier(.4,0,.2,1)',
            overflow: 'hidden',
            pointerEvents: showTools ? 'auto' : 'none',
            visibility: showTools ? 'visible' : 'hidden'
          }}
        >
          {/* Konten Learning Tools selalu dirender, animasi hide pakai opacity/maxHeight/visibility */}
          {isSQL ? (
            <>
              {/* Query Visualizer */}
              <div className="col-lg-6">
                <div className="bg-dark p-3 rounded-3 mb-3">
                  <h6 className="text-info mb-2"><i className="fas fa-search me-2"></i>Query Visualizer</h6>
                  <pre className="bg-black p-2 rounded text-light font-monospace mb-0">{code}</pre>
                </div>
              </div>
              {/* Result Preview */}
              <div className="col-lg-6">
                <div className="bg-dark p-3 rounded-3 mb-3">
                  <h6 className="text-success mb-2"><i className="fas fa-table me-2"></i>Result Preview</h6>
                  {output ? (
                    <pre className="bg-black p-2 rounded text-light font-monospace mb-0" style={{maxHeight:'180px',overflowY:'auto'}}>{output}</pre>
                  ) : (
                    <span className="text-muted">Jalankan query untuk melihat hasil...</span>
                  )}
                </div>
              </div>
              {/* SQL Tips */}
              <div className="col-12">
                <div className="bg-primary p-3 rounded-3 mb-3">
                  <h6 className="text-light mb-2"><i className="fas fa-lightbulb me-2"></i>SQL Tips</h6>
                  <ul className="text-light mb-0">
                    <li>Periksa penulisan query, hindari typo.</li>
                    <li>Selalu gunakan <b>WHERE</b> untuk UPDATE/DELETE agar tidak mengubah semua data.</li>
                    <li>Jangan pernah mengeksekusi query dari input user tanpa validasi (hindari SQL injection).</li>
                    <li>Gunakan <b>LIMIT</b> untuk membatasi hasil query jika data banyak.</li>
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Tools untuk JS/HTML/CSS */}
              <div className="col-lg-6">
                {/* ...existing code... */}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}