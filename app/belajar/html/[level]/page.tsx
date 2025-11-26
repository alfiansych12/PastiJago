// app/belajar/html/[level]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Swal from 'sweetalert2';
import { useAuth } from '@/contexts/AuthContext';

// Import HTML data
import htmlLevels from '@/data/htmlLevelData.json';

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
const LearningToolsHTML = dynamic(() => import('@/components/LearningToolsHTML'), { ssr: false });

interface ExpectedStructure {
  doctype: string;
  html: {
    head?: {
      title?: string;
    };
    body: {
      [key: string]: string | string[] | any;
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

// HtmlValidator Component
function HtmlValidator({ 
  code, 
  expectedStructure, 
  onValidationResult 
}: { 
  code: string; 
  expectedStructure: ExpectedStructure; 
  onValidationResult: (isValid: boolean, message: string) => void;
}) {
  
  const validateHtml = () => {
    try {
      // Parse HTML code
      const parser = new DOMParser();
      const doc = parser.parseFromString(code, 'text/html');
      
      // Check for parsing errors
      const parseErrors = doc.querySelectorAll('parsererror');
      if (parseErrors.length > 0) {
        onValidationResult(false, 'HTML syntax error: ' + parseErrors[0].textContent);
        return;
      }
      
      // Check doctype
      if (expectedStructure.doctype === 'html') {
        if (!code.includes('<!DOCTYPE html>')) {
          onValidationResult(false, 'Missing DOCTYPE html declaration');
          return;
        }
      }
      
      // Check HTML structure
      const htmlElement = doc.documentElement;
      if (!htmlElement) {
        onValidationResult(false, 'Missing HTML element');
        return;
      }
      
      // Check head and title
      if (expectedStructure.html.head?.title) {
        const head = htmlElement.querySelector('head');
        const title = head?.querySelector('title');
        if (!title || title.textContent?.trim() !== expectedStructure.html.head.title) {
          onValidationResult(false, `Title should be '${expectedStructure.html.head.title}'`);
          return;
        }
      }
      
      // Check body elements
      const body = htmlElement.querySelector('body');
      if (!body) {
        onValidationResult(false, 'Missing body element');
        return;
      }
      
      // Validate each expected element in body
      for (const [tag, expectedValue] of Object.entries(expectedStructure.html.body)) {
        // Handle special cases for multiple same tags (like h2_2)
        const actualTag = tag.replace(/_\\d+$/, ''); // Remove suffix like _2
        
        const elements = body.querySelectorAll(actualTag);
        
        if (Array.isArray(expectedValue)) {
          // Multiple elements expected
          if (elements.length < expectedValue.length) {
            onValidationResult(false, `Expected at least ${expectedValue.length} ${actualTag} elements`);
            return;
          }
          
          // Check content if specified
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
            // Any content is acceptable, but element must exist
            if (elements.length === 0) {
              onValidationResult(false, `Missing ${actualTag} element`);
              return;
            }
          } else {
            // Specific content expected
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
  };
  
  // Auto-validate when code changes
  useEffect(() => {
    validateHtml();
  }, [code]);
  
  return null;
}

export default function HtmlLevelPage() {
  const params = useParams();
  const router = useRouter();
  const levelId = params.level as string;
  
  const { isAuthenticated, updateUserProgress, getUserProgress, user } = useAuth();
  
  const [code, setCode] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showPreview, setShowPreview] = useState<boolean>(true);
  const [parseError, setParseError] = useState<string>('');

  const currentLevel = (htmlLevels as LevelDataMap)[levelId];

  // Redirect jika belum login
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, isLoading, router]);

  // Initialize code and check progress
  useEffect(() => {
    const initializeLevel = async () => {
      if (currentLevel && isAuthenticated) {
        setCode(currentLevel.challenge.starterCode);
        
        try {
          // Check progress dari database (HTML levels start from 100)
          const progress = await getUserProgress(parseInt(levelId) + 100);
          setIsCompleted(progress);
        } catch (error) {
          console.error('Error checking progress:', error);
          setIsCompleted(false);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    initializeLevel();
  }, [currentLevel, isAuthenticated, levelId, getUserProgress]);

  const handleValidationResult = (valid: boolean, message: string) => {
    setIsValid(valid);
    setValidationMessage(message);
    
    if (message.includes('HTML syntax error')) {
      setParseError(message);
    } else {
      setParseError('');
    }
    
    if (valid && !isCompleted) {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!currentLevel) return;
    
    if (!isCompleted) {
      setIsCompleted(true);
      try {
        // HTML levels start from 100 to avoid conflict with JavaScript
        await updateUserProgress(parseInt(levelId) + 100, true);
        Swal.fire({icon: 'success', title: 'Sukses', text: `Selamat! Level HTML ${levelId} completed 🎉`, toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
      } catch (error) {
        console.error('Error updating progress:', error);
        Swal.fire({icon: 'error', title: 'Gagal', text: 'Gagal menyimpan progress', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
      }
    }
  };

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
    if ((htmlLevels as LevelDataMap)[nextLevelId.toString()]) {
      router.push(`/belajar/html/${nextLevelId}`);
    } else {
      Swal.fire({icon: 'success', title: 'Sukses', text: 'Selamat! Anda telah menyelesaikan semua level HTML 🎊', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
      router.push('/belajar/html');
    }
  };

  // Loading state
  if (!isAuthenticated || isLoading) {
    return (
      <div className="container-fluid bg-dark text-light min-vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <div className="spinner-border text-warning" style={{width: '3rem', height: '3rem'}} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading...</p>
        </div>
      </div>
    );
  }

  // Level not found
  if (!currentLevel) {
    return (
      <div className="container-fluid bg-dark text-light min-vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-warning display-1 mb-4"></i>
          <h2 className="text-warning">Level HTML tidak ditemukan</h2>
          <p className="text-light">Level HTML yang Anda cari tidak tersedia.</p>
          <button 
            onClick={() => router.push('/belajar/html')}
            className="btn btn-warning mt-3"
          >
            <i className="fas fa-arrow-left me-2"></i>
            Kembali ke Daftar Level HTML
          </button>
        </div>
      </div>
    );
  }

  // Helper function to render preview based on expected structure
  const renderExpectedPreview = () => {
        const { body } = currentLevel.challenge.expectedStructure.html;
        // Fallbacks for advanced form and table/form preview
        if (body.form === 'form' && currentLevel.title?.toLowerCase().includes('lanjutan')) {
          return (
            <div className="border p-3 bg-white text-dark mt-2 rounded" style={{minHeight: '100px'}}>
              <form style={{margin: '10px 0'}}>
                <label htmlFor="nama">Nama Lengkap:</label><br/>
                  <input type="text" id="nama" placeholder="Nama Anda..." style={{padding:'5px',border:'1px solid #ddd',borderRadius:'3px',marginBottom:'5px',width:'100%',color:'white',background:'#222'}} /><br/>
                <label htmlFor="email">Email:</label><br/>
                  <input type="email" id="email" placeholder="Email Anda..." style={{padding:'5px',border:'1px solid #ddd',borderRadius:'3px',marginBottom:'5px',width:'100%',color:'white',background:'#222'}} /><br/>
                <label htmlFor="password">Password:</label><br/>
                  <input type="password" id="password" placeholder="Password..." style={{padding:'5px',border:'1px solid #ddd',borderRadius:'3px',marginBottom:'5px',width:'100%',color:'white',background:'#222'}} /><br/>
                <label>Jenis Kelamin:</label><br/>
                <input type="radio" id="laki" name="jenis-kelamin" value="laki" /> <label htmlFor="laki">Laki-laki</label>
                <input type="radio" id="perempuan" name="jenis-kelamin" value="perempuan" style={{marginLeft:'10px',color:'white',background:'#222'}} /> <label htmlFor="perempuan">Perempuan</label><br/>
                <label>Hobi:</label><br/>
                <input type="checkbox" id="membaca" name="hobi" value="membaca" /> <label htmlFor="membaca">Membaca</label>
                <input type="checkbox" id="olahraga" name="hobi" value="olahraga" style={{marginLeft:'10px',color:'white',background:'#222'}} /> <label htmlFor="olahraga">Olahraga</label><br/>
                <button type="submit" style={{padding:'5px 10px',backgroundColor:'#007bff',color:'white',border:'none',borderRadius:'3px',marginTop:'10px'}}>Daftar</button>
              </form>
            </div>
          );
        }
        if (body.table === 'table' && body.form === 'form' && currentLevel.title?.toLowerCase().includes('tabel')) {
          return (
            <div className="border p-3 bg-white text-dark mt-2 rounded" style={{minHeight: '100px'}}>
              <h5>Data Produk</h5>
              <table border={1} style={{width: '100%', borderCollapse: 'collapse', margin: '10px 0'}}>
                <thead>
                  <tr>
                    <th style={{padding: '5px', border: '1px solid #ddd'}}>Produk</th>
                    <th style={{padding: '5px', border: '1px solid #ddd'}}>Harga</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{padding: '5px', border: '1px solid #ddd'}}>Kopi</td>
                    <td style={{padding: '5px', border: '1px solid #ddd'}}>Rp 20.000</td>
                  </tr>
                  <tr>
                    <td style={{padding: '5px', border: '1px solid #ddd'}}>Teh</td>
                    <td style={{padding: '5px', border: '1px solid #ddd'}}>Rp 10.000</td>
                  </tr>
                </tbody>
              </table>
              <h5>Form Pendaftaran</h5>
              <form style={{margin: '10px 0'}}>
                <label htmlFor="nama">Nama:</label>
                  <input type="text" id="nama" placeholder="Nama Anda..." style={{padding:'5px',border:'1px solid #ddd',borderRadius:'3px',marginBottom:'5px',width:'100%',color:'white',background:'#222'}} />
                <button type="submit" style={{padding:'5px 10px',backgroundColor:'#007bff',color:'white',border:'none',borderRadius:'3px',marginLeft:'10px'}}>Submit</button>
              </form>
            </div>
          );
        }
        // ...existing code...
        // Remove duplicate declaration below
    return (
      <div className="border p-3 bg-white text-dark mt-2 rounded" style={{minHeight: '100px'}}>
        {/* Headings */}
        {body.h1 && (
          <h1 style={{color: '#333', margin: '0 0 10px 0', fontSize: '24px'}}>
            {body.h1 || 'Contoh Judul Halaman' }
          </h1>
        )}
        {body.h2 && (
          <h2 style={{color: '#666', margin: '0 0 10px 0', fontSize: '20px'}}>
            {body.h2 || 'Contoh Subjudul' }
          </h2>
        )}
        {body.h2_2 && (
          <h2 style={{color: '#666', margin: '20px 0 10px 0', fontSize: '20px'}}>
            {body.h2_2 || 'Contoh Subjudul 2' }
          </h2>
        )}
        {/* Paragraphs */}
        {body.p && Array.isArray(body.p) && (
          <>
            <p style={{color: '#333', margin: '0 0 10px 0'}}>{body.p[0] || 'Contoh paragraf pertama.'}</p>
            <p style={{color: '#333', margin: '0'}}>{body.p[1] || 'Contoh paragraf kedua.'}</p>
          </>
        )}
        {body.p && typeof body.p === 'string' && body.p !== 'any' && (
          <p style={{color: '#333', margin: '0'}}>{body.p || 'Contoh paragraf.'}</p>
        )}
        {body.p === 'any' && (
          <p style={{color: '#333', margin: '0'}}>Contoh paragraf.</p>
        )}
        {/* Lists */}
        {body.ul === 'any' && (
          <ul style={{margin: '10px 0', paddingLeft: '20px'}}>
            <li>Item daftar 1</li>
            <li>Item daftar 2</li>
            <li>Item daftar 3</li>
          </ul>
        )}
        {body.ol === 'any' && (
          <ol style={{margin: '10px 0', paddingLeft: '20px'}}>
            <li>Langkah pertama</li>
            <li>Langkah kedua</li>
            <li>Langkah ketiga</li>
          </ol>
        )}
        {/* Link */}
        {body.a && (
          <a href="#" style={{color: '#007bff', textDecoration: 'none'}}>{body.a || 'Contoh Link'}</a>
        )}
        {/* Image */}
        {body.img === 'any' && (
          <div style={{
            width: '100px', 
            height: '100px', 
            backgroundColor: '#f0f0f0', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px solid #ddd',
            margin: '10px 0'
          }}>
            <span style={{color:'#888'}}>Contoh Gambar</span>
          </div>
        )}
        {/* Table */}
        {body.table === 'any' && (
          <table border={1} style={{width: '100%', borderCollapse: 'collapse', margin: '10px 0'}}>
            <thead>
              <tr>
                <th style={{padding: '5px', border: '1px solid #ddd'}}>Produk</th>
                <th style={{padding: '5px', border: '1px solid #ddd'}}>Harga</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{padding: '5px', border: '1px solid #ddd'}}>Kopi</td>
                <td style={{padding: '5px', border: '1px solid #ddd'}}>Rp 20.000</td>
              </tr>
              <tr>
                <td style={{padding: '5px', border: '1px solid #ddd'}}>Teh</td>
                <td style={{padding: '5px', border: '1px solid #ddd'}}>Rp 10.000</td>
              </tr>
            </tbody>
          </table>
        )}
        {/* Form */}
        {body.form === 'any' && (
          <form style={{margin: '10px 0'}}>
            <label htmlFor="nama">Nama:</label>
            <input
              type="text"
              id="nama"
              placeholder="Nama Anda..."
              style={{
                color: 'white',
                background: '#222',
                padding: '5px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                marginBottom: '5px',
                width: '100%'
              }}
            />
            <button 
              type="submit"
              style={{
                padding: '5px 10px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                marginLeft: '10px'
              }}
            >
              Submit
            </button>
          </form>
        )}
        {/* Multimedia: Audio */}
        {body.audio === 'audio' && (
          <div style={{margin: '10px 0'}}>
            <h5>Audio Player</h5>
            <audio controls style={{width: '100%'}}>
              <source src="audio.mp3" type="audio/mpeg" />
              Browser Anda tidak support audio element.
            </audio>
          </div>
        )}
        {/* Multimedia: Video */}
        {body.video === 'video' && (
          <div style={{margin: '10px 0'}}>
            <h5>Video Player</h5>
            <video width="320" height="180" controls>
              <source src="video.mp4" type="video/mp4" />
              Browser Anda tidak support video element.
            </video>
          </div>
        )}
        {/* Multimedia: Iframe (YouTube) */}
        {body.iframe === 'iframe' && (
          <div style={{margin: '10px 0'}}>
            <h5>YouTube Video</h5>
            <iframe
              width="320"
              height="180"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              frameBorder="0"
              allowFullScreen
              title="YouTube Preview"
            />
          </div>
        )}
        {/* Semantic HTML */}
        {body.header === 'header' && (
          <header style={{background: '#eee', padding: '10px', marginBottom: '10px'}}>
            <h2>Header Halaman</h2>
          </header>
        )}
        {body.nav === 'nav' && (
          <nav style={{background: '#ddd', padding: '8px', marginBottom: '10px'}}>
            <a href="#home" style={{marginRight: '10px'}}>Home</a>
            <a href="#about" style={{marginRight: '10px'}}>About</a>
            <a href="#contact">Contact</a>
          </nav>
        )}
        {body.main === 'main' && (
          <main style={{background: '#fafafa', padding: '10px', marginBottom: '10px'}}>
            <article>
              <h3>Judul Artikel</h3>
              <p>Isi artikel...</p>
            </article>
          </main>
        )}
        {body.footer === 'footer' && (
          <footer style={{background: '#eee', padding: '10px', marginTop: '10px'}}>
            <p>&copy; 2024 Website Saya</p>
          </footer>
        )}
        {/* Multimedia: Audio */}
        {body.audio === 'audio' && (
          <div style={{margin: '10px 0'}}>
            <h5>Audio Player</h5>
            <audio controls style={{width: '100%'}}>
              <source src="audio.mp3" type="audio/mpeg" />
              Browser Anda tidak support audio element.
            </audio>
          </div>
        )}
        {/* Multimedia: Video */}
        {body.video === 'video' && (
          <div style={{margin: '10px 0'}}>
            <h5>Video Player</h5>
            <video width="320" height="180" controls>
              <source src="video.mp4" type="video/mp4" />
              Browser Anda tidak support video element.
            </video>
          </div>
        )}
        {/* Multimedia: Iframe (YouTube) */}
        {body.iframe === 'iframe' && (
          <div style={{margin: '10px 0'}}>
            <h5>YouTube Video</h5>
            <iframe
              width="320"
              height="180"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              frameBorder="0"
              allowFullScreen
              title="YouTube Preview"
            />
          </div>
        )}
        {/* Semantic HTML */}
        {body.header === 'header' && (
          <header style={{background: '#eee', padding: '10px', marginBottom: '10px'}}>
            <h2>Header Halaman</h2>
          </header>
        )}
        {body.nav === 'nav' && (
          <nav style={{background: '#ddd', padding: '8px', marginBottom: '10px'}}>
            <a href="#home" style={{marginRight: '10px'}}>Home</a>
            <a href="#about" style={{marginRight: '10px'}}>About</a>
            <a href="#contact">Contact</a>
          </nav>
        )}
        {body.main === 'main' && (
          <main style={{background: '#fafafa', padding: '10px', marginBottom: '10px'}}>
            <article>
              <h3>Judul Artikel</h3>
              <p>Isi artikel...</p>
            </article>
          </main>
        )}
        {body.footer === 'footer' && (
          <footer style={{background: '#eee', padding: '10px', marginTop: '10px'}}>
            <p>&copy; 2024 Website Saya</p>
          </footer>
        )}
      </div>
    );
  };

  return (
    <div className="container-fluid bg-dark text-light vh-100 pt-5">
      <div className="row h-100 g-0">
        {/* Panel Teori - Left Sidebar */}
        <div className="col-md-4 border-end border-secondary p-4" style={{ 
          height: '100vh', 
          overflowY: 'auto',
          borderLeft: '4px solid #dc2626'
        }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <button 
                onClick={() => router.push('/belajar/html')}
                className="btn btn-outline-danger btn-sm me-3"
              >
                <i className="fas fa-arrow-left me-2"></i>
                Back
              </button>
              <span className="badge bg-danger">HTML Level {levelId}</span>
            </div>
            <div className="d-flex align-items-center">
              {isCompleted && (
                <span className="badge bg-success fs-6 me-2">
                  <i className="fas fa-check me-1"></i>
                  Completed
                </span>
              )}
              <div className="text-warning fw-bold">
                <i className="fas fa-star me-1"></i>
                {user?.exp || 0} EXP
              </div>
            </div>
          </div>
          
          <h4 className="text-warning mb-3">{currentLevel.title}</h4>
          
          {/* Theory Content dengan Background Color */}
          <div 
            className="theory-content bg-secondary rounded-4 p-4 mb-4"
            style={{
              background: 'linear-gradient(135deg, rgba(55,65,81,0.8) 0%, rgba(31,41,55,0.9) 100%)',
              border: '1px solid rgba(75,85,99,0.5)'
            }}
            dangerouslySetInnerHTML={{
              __html: currentLevel.theory
                .replace(/\`\`\`html\n([\s\S]*?)\n\`\`\`/g, (match, code) => {
                  // Escape HTML special chars so code is always readable as text
                  const escaped = code
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/\"/g, '&quot;')
                    .replace(/'/g, '&#39;');
                  return `<pre class="bg-dark p-3 rounded mt-3 mb-3 border border-warning"><code class="text-warning font-monospace small">${escaped}</code></pre>`;
                })
                .replace(/\`\`\`css\n([\s\S]*?)\n\`\`\`/g, (match, code) => {
                  // Escape CSS special chars for code blocks
                  const escaped = code
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/\"/g, '&quot;')
                    .replace(/'/g, '&#39;');
                  return `<pre class="bg-dark p-3 rounded mt-3 mb-3 border border-info"><code class="text-info font-monospace small">${escaped}</code></pre>`;
                })
                .replace(/# (.*?)\n/g, '<h6 class="text-warning mt-4 mb-3 fw-bold">$1</h6>')
                .replace(/## (.*?)\n/g, '<h6 class="text-light mt-3 mb-2 fw-bold border-bottom border-gray-700 pb-2">$1</h6>')
                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-warning">$1</strong>')
                .replace(/\*(.*?)\*/g, '<em class="text-light">$1</em>')
                .replace(/\n/g, '<br>')
            }}
          />

          {/* Challenge Section */}
          <div 
            className="challenge-section mt-4 p-4 rounded-4 mb-4"
            style={{
              background: 'linear-gradient(135deg, rgba(220,38,38,0.1) 0%, rgba(185,28,28,0.15) 100%)',
              border: '1px solid rgba(220,38,38,0.3)'
            }}
          >
            <h6 className="text-warning mb-3 d-flex align-items-center">
              <i className="fas fa-bullseye me-2"></i>
              🎯 Tantangan HTML
            </h6>
            <p className="text-light mb-3">{currentLevel.challenge.description}</p>
             {params.level === '3' && (
               <div className="alert alert-info mt-2">
                 <strong>Petunjuk:</strong> Untuk membuat daftar belanja gunakan tag <code>&lt;ul&gt;</code> dan <code>&lt;li&gt;</code>. Untuk langkah membuat teh gunakan tag <code>&lt;ol&gt;</code> dan <code>&lt;li&gt;</code>.
                 <br />
                 <span>Contoh sintaks:</span>
                 <pre style={{background:'#f8f9fa',padding:'8px',borderRadius:'4px'}}>{`<ul>
    <li>Item 1</li>
    <li>Item 2</li>
  </ul>
  <ol>
    <li>Langkah 1</li>
    <li>Langkah 2</li>
  </ol>`}</pre>
               </div>
             )}
            <div 
              className="bg-dark p-3 rounded-3 border border-danger"
              style={{
                background: 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(30,41,59,0.9) 100%)'
              }}
            >
              <small className="text-warning d-block mb-1">
                <i className="fas fa-lightbulb me-1"></i>
                Yang akan Anda lihat di browser:
              </small>
              {renderExpectedPreview()}
            </div>
          </div>

          {/* HTML Tips Section */}
          <div 
            className="tips-section mt-4 p-4 rounded-4"
            style={{
              background: 'linear-gradient(135deg, rgba(14,165,233,0.1) 0%, rgba(3,105,161,0.15) 100%)',
              border: '1px solid rgba(14,165,233,0.3)'
            }}
          >
            <h6 className="text-light mb-2 d-flex align-items-center">
              <i className="fab fa-html5 me-2"></i>
              💡 Tips HTML
            </h6>
            <small className="text-light">
              • Selalu gunakan <code className="bg-dark px-1 rounded">&lt;!DOCTYPE html&gt;</code> di awal<br/>
              • Pastikan tag ditutup dengan benar<br/>
              • Gunakan semantic elements untuk accessibility<br/>
              • Validasi kode HTML Anda secara berkala
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
              {isCompleted && (htmlLevels as LevelDataMap)[(parseInt(levelId) + 1).toString()] && (
                <button 
                  onClick={nextLevel}
                  className="btn btn-success btn-sm"
                >
                  Next Level <i className="fas fa-arrow-right ms-1"></i>
                </button>
              )}
            </div>
          </div>

          {/* Editor dan Preview Layout - FIXED 25 BARIS */}
          <div className="flex-grow-1 d-flex" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
            {/* Code Editor - Fixed 25 Lines Height */}
            <div className={`${showPreview ? 'col-6' : 'col-12'} border-end border-secondary h-100`}>
              <div className="d-flex flex-column h-100">
                {/* Editor Header */}
                <div className="p-2 border-bottom border-secondary bg-dark d-flex justify-content-between align-items-center">
                  <h6 className="text-warning mb-0 d-flex align-items-center">
                    <i className="fab fa-html5 me-2"></i>
                    HTML Editor
                    <span className="badge bg-warning text-dark ms-2">Tinggi tetap 23 baris</span>
                  </h6>
                  <small className="text-muted">Scroll dalam editor</small>
                </div>
                {/* Editor Container dengan Fixed Height untuk 23 baris, scrollable */}
                <div 
                  className="flex-grow-1 position-relative"
                  style={{ 
                    height: 'calc(19 * 1.5rem)', // 20 lines * line height
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
                    Live Preview
                  </h6>
                  <small className="text-muted">Real-time hasil kode HTML Anda</small>
                </div>
                <div 
                  className="flex-grow-1 bg-white position-relative"
                  style={{ overflow: 'auto' }}
                >
                  <iframe
                    srcDoc={code}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      border: 'none',
                      minHeight: '100%'
                    }}
                    title="HTML Preview"
                    sandbox="allow-same-origin"
                  />
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
                <h6 className="text-warning mb-0 d-flex align-items-center">
                  <i className="fas fa-check-circle me-2"></i>
                  Validation:
                </h6>
                <div className="d-flex gap-2">
                  <span className={`badge ${isValid ? 'bg-success' : 'bg-warning'}`}>
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
                    {validationMessage || 'Edit kode HTML di atas dan lihat preview secara real-time. Validator akan otomatis memeriksa struktur HTML Anda.'}
                  </p>
                )}
              </div>
              
              {/* Progress Indicator */}
              {!isValid && !parseError && (
                <div className="mt-2">
                  <div className="progress glass-effect" style={{ height: '4px' }}>
                    <div 
                      className="progress-bar bg-warning" 
                      style={{ width: '50%' }}
                    ></div>
                  </div>
                  <small className="text-muted">Menunggu kode HTML yang valid...</small>
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
            <LearningToolsHTML code={code} output={code} />
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