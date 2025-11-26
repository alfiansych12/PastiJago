// components/CodeVisualizer.tsx
'use client';
import { useState, useEffect } from 'react';

interface ExecutionStep {
  lineNumber: number;
  variables: Record<string, any>;
  output: string;
  callStack: string[];
}

interface CodeVisualizerProps {
  code: string;
}

export default function CodeVisualizer({ code }: CodeVisualizerProps) {
  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Parse code dan generate execution steps
  const analyzeCode = () => {
    const newSteps: ExecutionStep[] = [];
    let variables: Record<string, any> = {};
    let output = '';
    
    // Simulasi execution steps
    const lines = code.split('\n').filter(line => line.trim() !== '');
    
    lines.forEach((line, index) => {
      if (line.includes('let ') || line.includes('const ') || line.includes('var ')) {
        // Variable declaration
        const match = line.match(/(let|const|var)\s+(\w+)\s*=\s*(.+)/);
        if (match) {
          const [, , varName, value] = match;
          try {
            // Remove semicolon if exists and evaluate
            const cleanValue = value.replace(/;$/,'').trim();
            variables[varName] = eval(cleanValue);
          } catch {
            variables[varName] = 'undefined';
          }
        }
      } else if (line.includes('console.log')) {
        // Output generation
        const match = line.match(/console\.log\((.+)\)/);
        if (match) {
          try {
            const logValue = eval(match[1]);
            output += String(logValue) + '\n';
          } catch (error) {
            output += 'Error: ' + String(error) + '\n';
          }
        }
      }
      
      newSteps.push({
        lineNumber: index + 1,
        variables: { ...variables },
        output,
        callStack: [] // bisa dikembangkan untuk function calls
      });
    });
    
    setSteps(newSteps);
    setCurrentStep(0);
  };

  useEffect(() => {
    analyzeCode();
  }, [code]);

  const currentStepData = steps[currentStep] || {
    lineNumber: 0,
    variables: {},
    output: '',
    callStack: []
  };

  return (
    <div className="glass-effect rounded-4 p-4">
      <h5 className="text-warning mb-3">
        <i className="fas fa-play-circle me-2"></i>
        Code Visualizer
      </h5>
      
      {/* Control Buttons */}
      <div className="d-flex gap-2 mb-3 flex-wrap">
        <button 
          className="btn btn-sm btn-outline-warning"
          onClick={() => setCurrentStep(0)}
          disabled={currentStep === 0}
        >
          <i className="fas fa-step-backward me-1"></i>
          Start
        </button>
        <button 
          className="btn btn-sm btn-warning"
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          disabled={currentStep === 0}
        >
          <i className="fas fa-backward me-1"></i>
          Prev
        </button>
        <button 
          className="btn btn-sm btn-success"
          onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
          disabled={currentStep === steps.length - 1}
        >
          <i className="fas fa-forward me-1"></i>
          Next
        </button>
        <button 
          className="btn btn-sm btn-outline-success"
          onClick={() => setCurrentStep(steps.length - 1)}
          disabled={currentStep === steps.length - 1}
        >
          <i className="fas fa-step-forward me-1"></i>
          End
        </button>
      </div>

      {/* Step Indicator */}
      <div className="mb-3">
        <small className="text-muted">
          Step {currentStep + 1} of {steps.length}
        </small>
        <div className="progress glass-effect" style={{height: '6px'}}>
          <div 
            className="progress-bar bg-warning"
            style={{width: `${((currentStep + 1) / steps.length) * 100}%`}}
          ></div>
        </div>
      </div>

      {/* Code Display dengan Highlight */}
      <div className="bg-black rounded-3 p-3 mb-3" style={{maxHeight: '200px', overflowY: 'auto'}}>
        <pre className="text-light mb-0">
          {code.split('\n').map((line, index) => (
            <div 
              key={index}
              className={`p-1 ${currentStep === index ? 'bg-warning text-dark rounded fw-bold' : ''}`}
            >
              <span className="text-muted me-3" style={{minWidth: '25px', display: 'inline-block'}}>
                {index + 1}
              </span>
              {line || '\u00A0'}
            </div>
          ))}
        </pre>
      </div>

      {/* Variable Watch Panel */}
      <div className="bg-secondary rounded-3 p-3 mb-3">
        <h6 className="text-warning mb-2">
          <i className="fas fa-eye me-2"></i>
          Variable Watcher
        </h6>
        <div className="row g-2">
          {Object.entries(currentStepData.variables).map(([key, value]) => (
            <div key={key} className="col-6 col-md-4">
              <div className="bg-dark rounded p-2">
                <small className="text-muted d-block">{key}</small>
                <code className="text-warning">{JSON.stringify(value)}</code>
              </div>
            </div>
          ))}
          {Object.keys(currentStepData.variables).length === 0 && (
            <div className="col-12 text-center text-muted py-2">
              <i className="fas fa-search me-2"></i>
              No variables yet
            </div>
          )}
        </div>
      </div>

      {/* Output Panel */}
      <div className="bg-dark rounded-3 p-3">
        <h6 className="text-warning mb-2">
          <i className="fas fa-terminal me-2"></i>
          Output
        </h6>
        <pre className="text-light mb-0" style={{minHeight: '40px'}}>
          {currentStepData.output || 'No output yet...'}
        </pre>
      </div>
    </div>
  );
}