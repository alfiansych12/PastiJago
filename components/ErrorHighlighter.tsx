// components/ErrorHighlighter.tsx
'use client';
import { useState, useEffect } from 'react';

interface ErrorInfo {
  line: number;
  message: string;
  type: 'syntax' | 'runtime' | 'logical';
  suggestion: string;
}

interface ErrorHighlighterProps {
  code: string;
  output: string;
}

export default function ErrorHighlighter({ code, output }: ErrorHighlighterProps) {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);

  useEffect(() => {
    const detectedErrors: ErrorInfo[] = [];
    const lines = code.split('\n');

    // Basic syntax error detection
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const trimmedLine = line.trim();

      // Skip empty lines
      if (!trimmedLine) return;

      // Unclosed string
      if ((trimmedLine.match(/'/g) || []).length % 2 !== 0 || (trimmedLine.match(/"/g) || []).length % 2 !== 0) {
        detectedErrors.push({
          line: lineNumber,
          message: 'Unclosed string literal',
          type: 'syntax',
          suggestion: 'Pastikan string diawali dan diakhiri dengan quote yang sama'
        });
      }

      // Missing semicolon pattern (basic) - hanya untuk statement sederhana
      if (trimmedLine && 
          !trimmedLine.endsWith(';') && 
          !trimmedLine.endsWith('{') && 
          !trimmedLine.endsWith('}') &&
          !trimmedLine.startsWith('//') &&
          !trimmedLine.startsWith('if') && 
          !trimmedLine.startsWith('function') &&
          !trimmedLine.startsWith('for') &&
          !trimmedLine.startsWith('while') &&
          !trimmedLine.includes('console.log')) {
        detectedErrors.push({
          line: lineNumber,
          message: 'Missing semicolon',
          type: 'syntax',
          suggestion: 'Tambahkan ; di akhir statement'
        });
      }

      // console.log without parentheses
      if (trimmedLine.includes('console.log') && !trimmedLine.includes('(')) {
        detectedErrors.push({
          line: lineNumber,
          message: 'Invalid console.log statement',
          type: 'syntax',
          suggestion: 'Gunakan console.log(value) dengan parentheses'
        });
      }
    });

    // Runtime error detection from output
    if (output.includes('Error') || output.includes('error') || output.includes('undefined')) {
      detectedErrors.push({
        line: 0, // General error
        message: 'Runtime error detected in output',
        type: 'runtime',
        suggestion: 'Periksa nilai variabel dan tipe data yang digunakan'
      });
    }

    setErrors(detectedErrors);
  }, [code, output]);

  if (errors.length === 0) return null;

  return (
    <div className="glass-effect rounded-4 p-3 border border-danger">
      <h6 className="text-danger mb-3">
        <i className="fas fa-exclamation-triangle me-2"></i>
        Error Detection
      </h6>
      
      <div className="space-y-2">
        {errors.map((error, index) => (
          <div key={index} className="bg-dark rounded p-3">
            <div className="d-flex align-items-start">
              <i className="fas fa-bug text-danger mt-1 me-2"></i>
              <div className="flex-grow-1">
                <div className="text-light fw-bold">
                  {error.message}
                  {error.line > 0 && <span className="text-muted"> - Line {error.line}</span>}
                </div>
                <div className="text-warning small mt-1">
                  <i className="fas fa-lightbulb me-1"></i>
                  {error.suggestion}
                </div>
              </div>
              <span className={`badge ${
                error.type === 'syntax' ? 'bg-danger' : 
                error.type === 'runtime' ? 'bg-warning' : 'bg-info'
              }`}>
                {error.type}
              </span>
            </div>
            
            {/* Show problematic line */}
            {error.line > 0 && (
              <div className="mt-2 p-2 bg-black rounded">
                <code className="text-light">
                  {code.split('\n')[error.line - 1]}
                </code>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}