// components/CodeEditor.tsx
'use client';
import { useState } from 'react';
import EnhancedCodeEditor from './EnhancedCodeEditor';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  width?: string;
  height?: string;
  language?: 'javascript' | 'html' | 'css';
  readOnly?: boolean;
}

// Fallback editor dengan fixed dimensions
const SimpleEditor = ({ 
  code, 
  onChange, 
  width = '100%', 
  height = '400px', 
  language = 'javascript' 
}: CodeEditorProps) => {
  return (
    <div 
      className="simple-editor-container"
      style={{
        width: width,
        height: height,
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #334155',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#0f172a'
      }}
    >
      <div className="bg-dark text-warning p-2 small d-flex justify-content-between border-bottom border-secondary">
        <span>
          <i className="fas fa-exclamation-triangle me-2"></i>
          Basic Editor ({language})
        </span>
        <span className="text-muted">Enhanced editor not available</span>
      </div>
      <textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          flex: 1,
          background: '#0f172a',
          color: '#f8fafc',
          border: 'none',
          padding: '16px',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '14px',
          lineHeight: '1.5',
          resize: 'none',
          outline: 'none'
        }}
        spellCheck={false}
        placeholder={`Write your ${language} code here...`}
      />
    </div>
  );
};

export default function CodeEditor(props: CodeEditorProps) {
  const [useFallback, setUseFallback] = useState(false);

  // Jika EnhancedCodeEditor error, fallback ke SimpleEditor
  if (useFallback) {
    return <SimpleEditor {...props} />;
  }

  return (
    <div onError={() => setUseFallback(true)}>
      <EnhancedCodeEditor {...props} />
    </div>
  );
}