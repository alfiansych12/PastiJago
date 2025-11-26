// components/LearningToolsJS.tsx
'use client';
import { useState } from 'react';
import CodeVisualizer from './CodeVisualizer';
import VariableWatcher from './VariableWatcher';
import ErrorHighlighter from './ErrorHighlighter';

interface LearningToolsJSProps {
  code: string;
  output: string;
}

export default function LearningToolsJS({ code, output }: LearningToolsJSProps) {
  const [showTools, setShowTools] = useState(true);

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
          <div className="col-lg-6">
            <CodeVisualizer code={code} />
          </div>
          <div className="col-lg-6">
            <VariableWatcher code={code} />
            <ErrorHighlighter code={code} output={output} />
          </div>
        </div>
      </div>
    </div>
  );
}
