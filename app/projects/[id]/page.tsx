// app/projects/[id]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { useAuth } from '@/contexts/AuthContext';
import projectData from '@/data/projectData.json';
import dynamic from 'next/dynamic';

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

interface Project {
  id: number;
  title: string;
  description: string;
  level: string;
  prerequisites: number[];
  skills: string[];
  features: string[];
  starterCode: {
    html: string;
    css: string;
    js: string;
  };
  expectedOutput: string;
  learningObjectives: string[];
}

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = parseInt(params.id as string);
  
  const { isAuthenticated, user, getUserProgress, updateUserProgress, getUserProgressRow } = useAuth();
  
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [jsCode, setJsCode] = useState('');
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js' | 'preview'>('html');
  const [isCompleted, setIsCompleted] = useState(false);

  const project = (projectData.projects as Project[]).find(p => p.id === projectId);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!project) {
      router.push('/projects');
      return;
    }

    // Check if user can access this project (await async checks)
    const checkAccess = async () => {
      const results = await Promise.all(
        project.prerequisites.map(level => getUserProgress(level))
      );

      const canAccess = results.every(Boolean);
      if (!canAccess) {
        router.push('/projects');
        return;
      }
    };

    // run async access check and continue
    checkAccess();

    // Load project-specific progress from DB (if exists)
    const loadProjectProgress = async () => {
      try {
        const progressRow = await getUserProgressRow(projectId + 10);
        if (progressRow) {
          setIsCompleted(!!progressRow.completed);
          if (progressRow.code) {
            setHtmlCode(progressRow.code.html || project.starterCode.html);
            setCssCode(progressRow.code.css || project.starterCode.css);
            setJsCode(progressRow.code.js || project.starterCode.js);
          }
        }
      } catch (err) {
        console.error('Error loading project progress row:', err);
      }
    };

    loadProjectProgress();

    // Load starter code
    setHtmlCode(project.starterCode.html);
    setCssCode(project.starterCode.css);
    setJsCode(project.starterCode.js);

    // Check if project is already completed
    const projectProgress = localStorage.getItem(`project_${projectId}`);
    if (projectProgress) {
      const progress = JSON.parse(projectProgress);
      setIsCompleted(progress.completed);
      if (progress.code) {
        setHtmlCode(progress.code.html);
        setCssCode(progress.code.css);
        setJsCode(progress.code.js);
      }
    }
  }, [isAuthenticated, project, projectId, router, getUserProgress]);

  const saveProgress = async () => {
    const progress = {
      completed: isCompleted,
      code: { html: htmlCode, css: cssCode, js: jsCode },
      completedAt: isCompleted ? new Date().toISOString() : undefined
    };

    // Save to localStorage for quick client-side restore
    localStorage.setItem(`project_${projectId}`, JSON.stringify(progress));

    // Also try to persist completed state and code to Supabase
    try {
      await updateUserProgress(projectId + 10, isCompleted, {
        html: htmlCode,
        css: cssCode,
        js: jsCode
      });

      Swal.fire({icon: 'success', title: 'Sukses', text: 'Progress tersimpan ke database', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
    } catch (err) {
      console.error('Error saving progress to DB:', err);
      Swal.fire({icon: 'error', title: 'Gagal', text: 'Gagal menyimpan progress ke database', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
    }
  };

  const handleComplete = async () => {
    setIsCompleted(true);
    try {
      await updateUserProgress(projectId + 10, true, {
        html: htmlCode,
        css: cssCode,
        js: jsCode
      });

      Swal.fire({icon: 'success', title: 'Sukses', text: 'Project ditandai selesai dan tersimpan ke database', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
    } catch (err) {
      console.error('Error marking complete in DB:', err);
      Swal.fire({icon: 'error', title: 'Gagal', text: 'Gagal menandai complete di database', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
    }

    await saveProgress();
  };

  const previewCode = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>${cssCode}</style>
    </head>
    <body>
      ${htmlCode}
      <script>${jsCode}</script>
    </body>
    </html>
  `;

  if (!project) {
    return (
      <div className="container-fluid bg-dark text-light min-vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-warning display-1 mb-4"></i>
          <h2 className="text-warning">Project tidak ditemukan</h2>
          <button 
            onClick={() => router.push('/projects')}
            className="btn btn-warning mt-3"
          >
            Kembali ke Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid bg-dark text-light vh-100 pt-5">
      <div className="row h-100 g-0">
        {/* Project Info Sidebar */}
        <div className="col-md-3 border-end border-secondary p-4" style={{ height: '100vh', overflowY: 'auto' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <button 
              onClick={() => router.push('/projects')}
              className="btn btn-outline-warning btn-sm"
            >
              <i className="fas fa-arrow-left me-2"></i>
              Back
            </button>
            {isCompleted && (
              <span className="badge bg-success">
                <i className="fas fa-check me-1"></i>
                Completed
              </span>
            )}
          </div>

          <h4 className="text-warning mb-3">{project.title}</h4>
          <p className="text-light mb-4">{project.description}</p>

          <div className="mb-4">
            <h6 className="text-warning mb-2">Learning Objectives:</h6>
            <ul className="text-light small">
              {project.learningObjectives.map((objective, index) => (
                <li key={index}>{objective}</li>
              ))}
            </ul>
          </div>

          <div className="mb-4">
            <h6 className="text-warning mb-2">Expected Output:</h6>
            <p className="text-light small">{project.expectedOutput}</p>
          </div>

          <div className="mb-4">
            <h6 className="text-warning mb-2">Features to Implement:</h6>
            <ul className="text-light small">
              {project.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>

          {!isCompleted && (
            <button 
              onClick={handleComplete}
              className="btn btn-success w-100"
            >
              <i className="fas fa-check me-2"></i>
              Mark as Complete
            </button>
          )}
        </div>

        {/* Code Editor & Preview */}
        <div className="col-md-9 d-flex flex-column h-100">
          {/* Tab Navigation */}
          <div className="border-bottom border-secondary">
            <nav className="nav nav-pills">
              <button 
                className={`nav-link ${activeTab === 'html' ? 'active bg-warning text-dark' : 'text-light'}`}
                onClick={() => setActiveTab('html')}
              >
                <i className="fas fa-code me-2"></i>
                HTML
              </button>
              <button 
                className={`nav-link ${activeTab === 'css' ? 'active bg-warning text-dark' : 'text-light'}`}
                onClick={() => setActiveTab('css')}
              >
                <i className="fas fa-palette me-2"></i>
                CSS
              </button>
              <button 
                className={`nav-link ${activeTab === 'js' ? 'active bg-warning text-dark' : 'text-light'}`}
                onClick={() => setActiveTab('js')}
              >
                <i className="fab fa-js-square me-2"></i>
                JavaScript
              </button>
              <button 
                className={`nav-link ${activeTab === 'preview' ? 'active bg-warning text-dark' : 'text-light'}`}
                onClick={() => setActiveTab('preview')}
              >
                <i className="fas fa-eye me-2"></i>
                Preview
              </button>
            </nav>
          </div>

          {/* Editor/Preview Content */}
          <div className="flex-grow-1 position-relative">
            {activeTab === 'html' && (
              <CodeEditor 
                code={htmlCode} 
                onChange={setHtmlCode}
                height="100%"
                language="html"
              />
            )}
            
            {activeTab === 'css' && (
              <CodeEditor 
                code={cssCode} 
                onChange={setCssCode}
                height="100%"
                language="css"
              />
            )}
            
            {activeTab === 'js' && (
              <CodeEditor 
                code={jsCode} 
                onChange={setJsCode}
                height="100%"
                language="javascript"
              />
            )}
            
            {activeTab === 'preview' && (
              <iframe
                srcDoc={previewCode}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Preview"
                sandbox="allow-scripts"
              />
            )}
          </div>

          {/* Save Button */}
          <div className="border-top border-secondary p-3 bg-dark">
            <button 
              onClick={saveProgress}
              className="btn btn-outline-warning"
            >
              <i className="fas fa-save me-2"></i>
              Save Progress
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}