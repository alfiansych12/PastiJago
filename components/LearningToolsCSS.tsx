// components/LearningToolsCSS.tsx
'use client';
import { useState } from 'react';

interface LearningToolsCSSProps {
  code: string;
  output: string;
}

export default function LearningToolsCSS({ code, output }: LearningToolsCSSProps) {
  const [showTools, setShowTools] = useState(true);

  if (!code) return null;

  return (
    <div className="row mt-4">
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="text-info mb-0">
            <i className="fab fa-css3-alt me-2"></i>
            Learning Tools CSS
          </h6>
          <button 
            className="btn btn-sm btn-outline-info"
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
          <div className="col-lg-6">
            <div className="bg-dark p-3 rounded-3 mb-3">
              <h6 className="text-info mb-2"><i className="fas fa-paint-brush me-2"></i>CSS Preview</h6>
              <iframe
                title="CSS Preview"
                srcDoc={`<style>${code}</style><div class='css-preview'>Preview area</div>`}
                style={{width:'100%',height:'180px',background:'#fff',border:'1px solid #0ea5e9',borderRadius:'6px'}}
              />
            </div>
          </div>
          <div className="col-lg-6">
            <div className="bg-dark p-3 rounded-3 mb-3">
              <h6 className="text-warning mb-2"><i className="fas fa-exclamation-triangle me-2"></i>Output & Tips</h6>
              <pre className="bg-black p-2 rounded text-light font-monospace mb-0" style={{maxHeight:'120px',overflowY:'auto'}}>{output || 'Tidak ada output.'}</pre>
              <ul className="text-light mt-2 mb-0">
                <li>Gunakan selector dan properti CSS dengan benar.</li>
                <li>Preview area di atas akan menampilkan hasil styling.</li>
                <li>Periksa penulisan dan urutan properti.</li>
                <li>Eksperimen dengan warna, layout, dan animasi CSS.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
