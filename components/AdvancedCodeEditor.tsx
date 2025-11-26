// components/AdvancedCodeEditor.tsx (Optional enhancement)
'use client';
import { useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { oneDark } from '@codemirror/theme-one-dark';
import { customDarkTheme } from '@/lib/themes/custom-dark';

interface AdvancedCodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  height?: string;
  language?: 'javascript' | 'html' | 'css';
  readOnly?: boolean;
  showLineNumbers?: boolean;
}

export default function AdvancedCodeEditor({ 
  code, 
  onChange, 
  height = '100%',
  language = 'javascript',
  readOnly = false,
  showLineNumbers = true
}: AdvancedCodeEditorProps) {
  
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

  const basicSetup = {
    lineNumbers: showLineNumbers,
    highlightActiveLine: true,
    bracketMatching: true,
    autocompletion: true,
    indentOnInput: true,
    syntaxHighlighting: true,
    foldGutter: true,
    dropCursor: true,
    allowMultipleSelections: true,
    history: true,
  };

  return (
    <div className="advanced-code-editor" style={{ height }}>
      <CodeMirror
        value={code}
        height={height}
        extensions={[getLanguageExtension()]}
        onChange={handleChange}
        theme={oneDark} // Bisa ganti dengan customDarkTheme jika mau
        readOnly={readOnly}
        basicSetup={basicSetup}
        style={{
          fontSize: '14px',
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        }}
      />
    </div>
  );
}