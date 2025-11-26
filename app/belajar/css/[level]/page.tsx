// app/belajar/css/[level]/page.tsx
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Swal from 'sweetalert2';
import { useAuth } from '@/contexts/AuthContext';
import cssLevels from '@/data/cssLevelData.json';

const CodeEditor = dynamic(() => import('@/components/CodeEditor'), {
  ssr: false,
  loading: () => (
    <div className="d-flex justify-content-center align-items-center h-100">
      <div className="spinner-border text-warning" role="status">
        <span className="visually-hidden">Loading editor...</span>
      </div>
    </div>
  )
});
const LearningToolsCSS = dynamic(() => import('@/components/LearningToolsCSS'), { ssr: false });

interface ExpectedStructure {
  doctype: string;
  html: {
    head?: {
      title?: string;
    };
    body: {
      [key: string]: string | string[] | object;
    };
  };
}

interface LevelData {
  title: string;
  theory: string;
  challenge: {
    description: string;
    expectedStructure: ExpectedStructure;
    starterCode: string;
  };
}

interface LevelDataMap {
  [key: string]: LevelData;
}

function HtmlValidator({ code, expectedStructure, onValidationResult }: {
  code: string;
  expectedStructure: ExpectedStructure;
  onValidationResult: (isValid: boolean, message: string) => void;
}) {
  useEffect(() => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(code, 'text/html');
      const parseErrors = doc.querySelectorAll('parsererror');
      if (parseErrors.length > 0) {
        onValidationResult(false, 'HTML syntax error: ' + parseErrors[0].textContent);
        return;
      }
      if (expectedStructure.doctype === 'html') {
        if (!code.includes('<!DOCTYPE html>')) {
          onValidationResult(false, 'Missing DOCTYPE html declaration');
          return;
        }
      }
      const htmlElement = doc.documentElement;
      if (!htmlElement) {
        onValidationResult(false, 'Missing HTML element');
        return;
      }
      if (expectedStructure.html.head?.title) {
        const head = htmlElement.querySelector('head');
        const title = head?.querySelector('title');
        if (!title || title.textContent?.trim() !== expectedStructure.html.head.title) {
          onValidationResult(false, `Title should be '${expectedStructure.html.head.title}'`);
          return;
        }
      }
      const body = htmlElement.querySelector('body');
      if (!body) {
        onValidationResult(false, 'Missing body element');
        return;
      }
      for (const [tag, expectedValue] of Object.entries(expectedStructure.html.body)) {
        const actualTag = tag.replace(/_\d+$/, '');
        const elements = body.querySelectorAll(actualTag);
        if (Array.isArray(expectedValue)) {
          if (elements.length < expectedValue.length) {
            onValidationResult(false, `Expected at least ${expectedValue.length} ${actualTag} elements`);
            return;
          }
          expectedValue.forEach((expectedContent, index) => {
            if (expectedContent !== 'any' && elements[index]) {
              const elementText = elements[index].textContent?.trim();
              if (elementText !== expectedContent) {
                onValidationResult(false, `${actualTag} ${index + 1} should contain '${expectedContent}'`);
                return;
              }
            }
          });
        } else if (typeof expectedValue === 'string') {
          if (expectedValue === 'any') {
            if (elements.length === 0) {
              onValidationResult(false, `Missing ${actualTag} element`);
              return;
            }
          } else {
            const element = elements[0];
            if (!element || element.textContent?.trim() !== expectedValue) {
              onValidationResult(false, `${actualTag} should contain '${expectedValue}'`);
              return;
            }
          }
        }
      }
      onValidationResult(true, 'Struktur HTML benar! 🎉');
    } catch (error) {
      onValidationResult(false, 'Error parsing HTML: ' + error);
    }
  }, [code, expectedStructure, onValidationResult]);
  return null;
}

export default function HtmlLevelPage() {
  const params = useParams();
  const router = useRouter();
  const levelId = params.level as string;
  const { isAuthenticated, getUserProgress, user } = useAuth();

  const [code, setCode] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showPreview, setShowPreview] = useState<boolean>(true);
  const [parseError, setParseError] = useState<string>('');

  const currentLevel = (cssLevels as LevelDataMap)[levelId];

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const initializeLevel = async () => {
      if (currentLevel && isAuthenticated) {
        setCode(currentLevel.challenge.starterCode);
        // Check progress
        const completed = await getUserProgress(Number(levelId));
        setIsCompleted(completed);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };
    initializeLevel();
  }, [currentLevel, isAuthenticated, getUserProgress, levelId]);

  const resetCode = () => {
    if (currentLevel) {
      setCode(currentLevel.challenge.starterCode);
      setValidationMessage('');
      setIsValid(false);
      setParseError('');
      Swal.fire({icon: 'success', title: 'Sukses', text: 'Kode telah direset ke awal', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
    }
  };

  const nextLevel = () => {
    const nextLevelId = parseInt(levelId) + 1;
    if ((cssLevels as LevelDataMap)[nextLevelId.toString()]) {
      router.push(`/belajar/css/${nextLevelId}`);
    }
  };

  const handleValidationResult = useCallback((valid: boolean, message: string) => {
    setIsValid(valid);
    setValidationMessage(message);
    setParseError(valid ? '' : message.includes('syntax error') ? message : '');
  }, []);

  const renderExpectedPreview = () => {
    const { body } = currentLevel.challenge.expectedStructure.html;
    // Visual preview for level 1: heading biru, paragraph merah
    if (body.h1 === 'Judul Biru' && body.p === 'Paragraf Merah') {
      return (
        <div className="border p-3 bg-white text-dark mt-2 rounded" style={{minHeight: '100px'}}>
          <h1 style={{color: '#2563eb', margin: '0 0 10px 0', fontSize: '28px', fontWeight: 700}}>Judul Biru</h1>
          <p style={{color: 'red', fontSize: '18px', margin: 0}}>Paragraf Merah</p>
        </div>
      );
    }
    // Default fallback for other levels (can be expanded for more cases)
    return (
      <div className="border p-3 bg-white text-dark mt-2 rounded" style={{minHeight: '100px'}}>
        {typeof body.h1 === 'string' && <h1 style={{color: '#333', margin: '0 0 10px 0', fontSize: '24px'}}>{body.h1}</h1>}
        {typeof body.p === 'string' && <p style={{color: '#333', margin: 0}}>{body.p}</p>}
        {/* ...other elements as before... */}
      </div>
    );
  };

  if (!currentLevel) {
    return (
      <div className="container-fluid bg-dark text-light vh-100 pt-5 d-flex flex-column justify-content-center align-items-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-warning display-1 mb-4"></i>
          <h2 className="text-warning">Level CSS tidak ditemukan</h2>
          <p className="text-light">Level CSS yang Anda cari tidak tersedia.</p>
          <button 
            onClick={() => router.push('/belajar/css')}
            className="btn btn-warning mt-3"
          >
            <i className="fas fa-arrow-left me-2"></i>
            Kembali ke Daftar Level CSS
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid bg-dark text-light vh-100 pt-5">
      <div className="row h-100 g-0">
        {/* Panel Teori - Left Sidebar */}
        <div className="col-md-4 border-end border-secondary p-4" style={{ height: '100vh', overflowY: 'auto', borderLeft: '4px solid #2563eb' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <button 
                onClick={() => router.push('/belajar/css')}
                className="btn btn-outline-primary btn-sm me-3"
              >
                <i className="fas fa-arrow-left me-2"></i>
                Back
              </button>
              <span className="badge bg-primary">CSS Level {levelId}</span>
            </div>
            <div className="d-flex align-items-center">
              {isCompleted && (
                <span className="badge bg-success fs-6 me-2">
                  <i className="fas fa-check me-1"></i>
                  Completed
                </span>
              )}
              <div className="text-info fw-bold">
                <i className="fas fa-star me-1"></i>
                {user?.exp || 0} EXP
              </div>
            </div>
          </div>
          <h4 className="text-info mb-3">{currentLevel.title}</h4>
          <div 
            className="theory-content text-light"
            dangerouslySetInnerHTML={{ 
              __html: currentLevel.theory
                // Escape CSS code blocks
                .replace(/\`\`\`css\n([\s\S]*?)\n\`\`\`/g, (match, code) => {
                  const escaped = code
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;');
                  return `<pre class="bg-dark p-3 rounded mt-3 mb-3 border border-info"><code class="text-info font-monospace small">${escaped}</code></pre>`;
                })
                // Escape HTML code blocks
                .replace(/\`\`\`html\n([\s\S]*?)\n\`\`\`/g, (match, code) => {
                  const escaped = code
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;');
                  return `<pre class="bg-dark p-3 rounded mt-3 mb-3 border border-warning"><code class="text-warning font-monospace small">${escaped}</code></pre>`;
                })
                // Headings
                .replace(/# (.*?)\n/g, '<h6 class="text-info mt-4 mb-3 fw-bold">$1</h6>')
                .replace(/## (.*?)\n/g, '<h6 class="text-light mt-3 mb-2 fw-bold border-bottom border-gray-700 pb-2">$1</h6>')
                // Bold and italic
                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-info">$1</strong>')
                .replace(/\*(.*?)\*/g, '<em class="text-light">$1</em>')
                // Newlines
                .replace(/\n/g, '<br>')
            }} 
          />
          {/* Challenge Section */}
          <div className="challenge-section mt-4 p-4 bg-secondary rounded-4">
            <h6 className="text-info mb-3 d-flex align-items-center">
              <i className="fas fa-bullseye me-2"></i>
              🎯 Tantangan CSS
            </h6>
            <p className="text-light mb-3">{currentLevel.challenge.description}</p>
            <div className="bg-black p-3 rounded-3">
              <small className="text-info d-block mb-1">
                <i className="fas fa-lightbulb me-1"></i>
                Yang akan Anda lihat di browser:
              </small>
              {renderExpectedPreview()}
            </div>
          </div>
          {/* CSS Tips Section */}
          <div className="tips-section mt-4 p-3 bg-primary rounded-4">
            <h6 className="text-light mb-2 d-flex align-items-center">
              <i className="fab fa-css3-alt me-2"></i>
              💡 Tips CSS
            </h6>
            <small className="text-light">
              • Gunakan selector yang spesifik<br/>
              • Manfaatkan class dan id untuk styling<br/>
              • Cek hasil di browser secara berkala<br/>
              • Gunakan devtools untuk debugging CSS<br/>
            </small>
          </div>
        </div>
        {/* Panel Kanan - Editor & Preview */}
        <div className="col-md-8 d-flex flex-column h-100">
          {/* Editor Header */}
          <div className="p-3 border-bottom border-secondary d-flex justify-content-between align-items-center bg-dark">
            <h5 className="text-warning mb-0 d-flex align-items-center">
              <i className="fab fa-html5 me-2"></i>
              HTML Editor
            </h5>
            <div className="d-flex gap-2 align-items-center">
              <button 
                className={`btn btn-sm ${showPreview ? 'btn-info' : 'btn-outline-info'}`}
                onClick={() => setShowPreview(!showPreview)}
              >
                <i className={`fas fa-${showPreview ? 'eye' : 'eye-slash'} me-1`}></i>
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
              <button 
                onClick={resetCode}
                className="btn btn-outline-warning btn-sm"
              >
                <i className="fas fa-redo me-1"></i>
                Reset
              </button>
              {isCompleted && (cssLevels as LevelDataMap)[(parseInt(levelId) + 1).toString()] && (
                <button 
                  onClick={nextLevel}
                  className="btn btn-success btn-sm"
                >
                  Next Level <i className="fas fa-arrow-right ms-1"></i>
                </button>
              )}
            </div>
          </div>
          {/* Editor dan Preview Layout - FIXED 19 BARIS */}
          <div className="flex-grow-1 d-flex" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
            {/* Code Editor - Fixed 19 Lines Height */}
            <div className={`${showPreview ? 'col-6' : 'col-12'} border-end border-secondary h-100`}>
              <div className="d-flex flex-column h-100">
                {/* Editor Header */}
                <div className="p-2 border-bottom border-secondary bg-dark d-flex justify-content-between align-items-center">
                  <h6 className="text-warning mb-0 d-flex align-items-center">
                    <i className="fab fa-html5 me-2"></i>
                    HTML Editor
                    <span className="badge bg-warning text-dark ms-2">Tinggi tetap 19 baris</span>
                  </h6>
                  <small className="text-muted">Scroll dalam editor</small>
                </div>
                {/* Editor Container dengan Fixed Height untuk 19 baris, scrollable */}
                <div 
                  className="flex-grow-1 position-relative"
                  style={{ 
                    height: 'calc(19 * 1.5rem)',
                    minHeight: 'calc(19 * 1.5rem)',
                    maxHeight: 'calc(19 * 1.5rem)',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    background: '#18181b',
                    borderRadius: '0 0 8px 8px'
                  }}
                >
                  <CodeEditor 
                    code={code} 
                    onChange={setCode}
                    height="100%"
                    width="100%"
                    language="html"
                  />
                </div>
              </div>
            </div>
            {/* Live Preview - Same Fixed Dimensions */}
            {showPreview && (
              <div className="col-6 d-flex flex-column h-100">
                <div className="p-2 border-bottom border-secondary bg-dark d-flex justify-content-between align-items-center">
                  <h6 className="text-warning mb-0">
                    <i className="fas fa-eye me-2"></i>
                    Preview Output
                  </h6>
                  <small className="text-muted">Real-time hasil kode HTML Anda</small>
                </div>
                <div 
                  className="flex-grow-1 bg-white position-relative"
                  style={{ overflow: 'auto' }}
                >
                  <div className="p-3">
                    <div dangerouslySetInnerHTML={{ __html: code }} />
                  </div>
                  {parseError && (
                    <div className="position-absolute top-0 start-0 w-100 p-2 bg-danger text-white small">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      {parseError}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          {/* Validation Panel */}
          <div className="border-top border-secondary" style={{ height: '120px', flexShrink: 0 }}>
            <div className="p-3 h-100 d-flex flex-column bg-dark">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="text-info mb-0 d-flex align-items-center">
                  <i className="fas fa-check-circle me-2"></i>
                  Validation:
                </h6>
                <div className="d-flex gap-2">
                  <span className={`badge ${isValid ? 'bg-success' : 'bg-info'}`}>
                    {isValid ? '✓ Valid' : '✗ Checking...'}
                  </span>
                  {isCompleted && (
                    <span className="badge bg-success">
                      <i className="fas fa-check me-1"></i>
                      Level Completed
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-grow-1 overflow-auto">
                {parseError ? (
                  <div className="alert alert-danger small mb-0 p-2">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {parseError}
                  </div>
                ) : (
                  <p className="text-light mb-0 small">
                    {validationMessage || 'Edit kode CSS di atas dan lihat preview secara real-time. Validator akan otomatis memeriksa struktur CSS Anda.'}
                  </p>
                )}
              </div>
              {/* Progress Indicator */}
              {!isValid && !parseError && (
                <div className="mt-2">
                  <div className="progress glass-effect" style={{ height: '4px' }}>
                    <div 
                      className="progress-bar bg-info" 
                      style={{ width: '50%' }}
                    ></div>
                  </div>
                  <small className="text-muted">Menunggu kode CSS yang valid...</small>
                </div>
              )}
            </div>
            {/* Validator Component */}
            {currentLevel?.challenge?.expectedStructure && (
              <HtmlValidator
                code={code}
                expectedStructure={currentLevel.challenge.expectedStructure}
                onValidationResult={handleValidationResult}
              />
            )}
          </div>
        </div>
      </div>
      <div style={{marginTop: '32px'}}>
        <LearningToolsCSS code={code} output={code} />
      </div>
      {/* Custom Styles */}
      <style jsx>{`
        .theory-content {
          max-height: 60vh;
          overflow-y: auto;
          padding-right: 10px;
        }
        .theory-content::-webkit-scrollbar {
          width: 6px;
        }
        .theory-content::-webkit-scrollbar-track {
          background: #1e293b;
          border-radius: 3px;
        }
        .theory-content::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 3px;
        }
        .theory-content::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
        @media (max-height: 768px) {
          .theory-content {
            max-height: 50vh;
          }
        }
      `}</style>
    </div>
  );
}