// app/login/page.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Swal from 'sweetalert2';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      Swal.fire({icon: 'error', title: 'Gagal', text: 'Email dan password harus diisi', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
      return;
    }

    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      Swal.fire({icon: 'success', title: 'Sukses', text: 'Login berhasil!', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
      router.push('/');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login gagal';
      
      if (errorMessage.includes('Invalid login credentials')) {
        Swal.fire({icon: 'error', title: 'Gagal', text: 'Email atau password salah', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
      } else if (errorMessage.includes('Email not confirmed')) {
        Swal.fire({icon: 'error', title: 'Gagal', text: 'Email belum dikonfirmasi. Silakan cek email Anda.', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
      } else {
        Swal.fire({icon: 'error', title: 'Gagal', text: errorMessage, toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 text-light position-relative d-flex align-items-center py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-sm-10 col-md-6 col-lg-5">
            <div className="glass-effect rounded-4 p-4 hover-lift">
              <div className="text-center mb-3">
                <Link href="/" className="text-decoration-none">
                  <span className="gradient-text fs-3 fw-bold">🚀 PastiJago</span>
                </Link>
                <h2 className="text-warning mt-2 mb-1" style={{fontSize: '1.5rem'}}>Welcome Back</h2>
                <p className="text-muted" style={{fontSize: '0.9rem'}}>Sign in to continue your learning journey</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-2">
                  <label htmlFor="email" className="form-label text-light" style={{fontSize: '0.9rem'}}>Email</label>
                  <input
                    style={{ color: 'white', background: '#222' }}
                    type="email"
                    className="form-control glass-effect border-0 text-light py-2"
                    style={{ color: 'white', background: '#222' }}
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label text-light" style={{fontSize: '0.9rem'}}>Password</label>
                  <input
                    type="password"
                    className="form-control glass-effect border-0 text-light py-2"
                    style={{ color: 'white', background: '#222' }}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-warning w-100 py-2 fw-bold border-0 mb-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt me-2"></i>
                      Sign In
                    </>
                  )}
                </button>

                <div className="text-center">
                  <span className="text-muted" style={{fontSize: '0.9rem'}}>Don't have an account? </span>
                  <Link href="/register" className="text-warning text-decoration-none" style={{fontSize: '0.9rem'}}>
                    Sign up here
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}