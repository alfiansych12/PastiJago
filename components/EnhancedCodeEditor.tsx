// components/EnhancedCodeEditor.tsx
'use client';
import { useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { oneDark } from '@codemirror/theme-one-dark';

interface EnhancedCodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  width?: string;
  height?: string;
  language?: 'javascript' | 'html' | 'css';
  readOnly?: boolean;
}

export default function EnhancedCodeEditor({ 
  code, 
  onChange, 
  width = '100%',
  height = '400px',
  language = 'javascript',
  readOnly = false
}: EnhancedCodeEditorProps) {
  
  const getLanguageExtension = useCallback(() => {
    switch (language) {
      case 'html': 
        return html({
          autoCloseTags: true,
          matchClosingTags: true
        });
      case 'css': 
        return css();
      case 'javascript':
      default: 
        return javascript({
          jsx: true,
          typescript: false
        });
    }
  }, [language]);

  const handleChange = useCallback((value: string) => {
    onChange(value);
  }, [onChange]);

  return (
    <div 
      className="enhanced-code-editor-container"
      style={{
        width: width,
        height: height,
        overflow: 'hidden', // Container tidak scroll
        border: '1px solid #334155',
        borderRadius: '8px',
        backgroundColor: '#0f172a'
      }}
    >
      <CodeMirror
        value={code}
        width="100%"
        height="100%"
        extensions={[getLanguageExtension()]}
        onChange={handleChange}
        theme={oneDark}
        readOnly={readOnly}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          bracketMatching: true,
          autocompletion: true,
          indentOnInput: true,
          syntaxHighlighting: true,
          foldGutter: true,
          dropCursor: true,
          allowMultipleSelections: true,
          history: true,
          defaultKeymap: true,
          historyKeymap: true,
          searchKeymap: true,
        }}
        style={{
          fontSize: '14px',
          fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
          height: '100%',
          width: '100%',
        }}
      />
    </div>
  );
}