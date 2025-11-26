// components/VariableWatcher.tsx
'use client';
import { useState, useEffect } from 'react';

export interface VariableState {
  [key: string]: {
    value: any;
    type: string;
    history: any[];
  };
}

interface VariableWatcherProps {
  code: string;
}

export default function VariableWatcher({ code }: VariableWatcherProps) {
  const [variables, setVariables] = useState<VariableState>({});

  useEffect(() => {
    // Extract variables from code
    const variableRegex = /(let|const|var)\s+(\w+)\s*=\s*(.+?)(?=;|$)/g;
    const matches = [...code.matchAll(variableRegex)];
    
    const newVariables: VariableState = {};
    
    matches.forEach(match => {
      const [, , varName, valueExpression] = match;
      try {
        // Clean value expression
        const cleanValue = valueExpression.replace(/;$/,'').trim();
        const value = eval(cleanValue);
        newVariables[varName] = {
          value,
          type: typeof value,
          history: [value]
        };
      } catch (error) {
        newVariables[varName] = {
          value: 'undefined',
          type: 'unknown',
          history: ['undefined']
        };
      }
    });
    
    setVariables(newVariables);
  }, [code]);

  return (
    <div className="glass-effect rounded-4 p-3 mb-3">
      <h6 className="text-warning mb-3">
        <i className="fas fa-binoculars me-2"></i>
        Live Variable Watcher
      </h6>
      
      <div className="row g-2">
        {Object.entries(variables).map(([name, data]) => (
          <div key={name} className="col-12 col-sm-6">
            <div className="bg-dark rounded p-2 border-start border-warning border-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <span className="text-light fw-bold">{name}</span>
                  <small className="text-muted d-block">Type: {data.type}</small>
                </div>
                <span className="badge bg-warning text-dark">
                  {JSON.stringify(data.value)}
                </span>
              </div>
              
              {/* Value History */}
              {data.history.length > 1 && (
                <div className="mt-2">
                  <small className="text-muted">History:</small>
                  <div className="d-flex gap-1 mt-1 flex-wrap">
                    {data.history.slice(-3).map((val, idx) => (
                      <span 
                        key={idx}
                        className="badge bg-secondary text-light"
                        style={{ fontSize: '0.6rem' }}
                      >
                        {JSON.stringify(val)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {Object.keys(variables).length === 0 && (
          <div className="col-12 text-center text-muted py-3">
            <i className="fas fa-search fa-lg mb-2 d-block"></i>
            No variables detected
          </div>
        )}
      </div>
    </div>
  );
}