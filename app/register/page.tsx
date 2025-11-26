// app/register/page.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Swal from 'sweetalert2';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    schoolName: '',
    className: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validateForm = (): boolean => {
    if (formData.password.length < 6) {
      Swal.fire({icon: 'error', title: 'Gagal', text: 'Password harus minimal 6 karakter', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Swal.fire({icon: 'error', title: 'Gagal', text: 'Password dan konfirmasi password tidak sama', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
      return false;
    }

    if (formData.username.length < 3) {
      Swal.fire({icon: 'error', title: 'Gagal', text: 'Username harus minimal 3 karakter', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
      return false;
    }

    if (!formData.email.includes('@')) {
      Swal.fire({icon: 'error', title: 'Gagal', text: 'Email tidak valid', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await register(
        formData.email,
        formData.password,
        formData.username,
        formData.fullName,
        formData.schoolName,
        formData.className
      );
      
      Swal.fire({icon: 'success', title: 'Sukses', text: 'Registrasi berhasil! Silakan login.', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
      router.push('/login');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registrasi gagal';
      
      if (errorMessage.includes('Username already exists')) {
        Swal.fire({icon: 'error', title: 'Gagal', text: 'Username sudah digunakan', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
      } else if (errorMessage.includes('Email already registered')) {
        Swal.fire({icon: 'error', title: 'Gagal', text: 'Email sudah terdaftar', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
      } else if (errorMessage.includes('Password should be at least')) {
        Swal.fire({icon: 'error', title: 'Gagal', text: 'Password terlalu lemah', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
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
          <div className="col-sm-10 col-md-8 col-lg-6">
            <div className="glass-effect rounded-4 p-4 hover-lift">
              <div className="text-center mb-3">
                <Link href="/" className="text-decoration-none">
                  <span className="gradient-text fs-3 fw-bold">🚀 PastiJago</span>
                </Link>
                <h2 className="text-warning mt-2 mb-1" style={{fontSize: '1.5rem'}}>Create Account</h2>
                <p className="text-muted" style={{fontSize: '0.9rem'}}>Start your JavaScript learning journey</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row g-2">
                  <div className="col-md-6">
                    <div className="mb-2">
                      <label htmlFor="username" className="form-label text-light" style={{fontSize: '0.85rem'}}>Username *</label>
                      <input
                        style={{ color: 'white', background: '#222' }}
                        type="text"
                        className="form-control glass-effect border-0 text-light py-2"
                        id="username"
                        name="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        minLength={3}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-2">
                      <label htmlFor="email" className="form-label text-light" style={{fontSize: '0.85rem'}}>Email *</label>
                      <input
                        type="email"
                        className="form-control glass-effect border-0 text-light py-2"
                        style={{ color: 'white', background: '#222' }}
                        id="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                <div className="row g-2">
                  <div className="col-md-6">
                    <div className="mb-2">
                      <label htmlFor="password" className="form-label text-light" style={{fontSize: '0.85rem'}}>Password *</label>
                      <input
                        type="password"
                        className="form-control glass-effect border-0 text-light py-2"
                        style={{ color: 'white', background: '#222' }}
                        id="password"
                        name="password"
                        placeholder="Min. 6 chars"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        minLength={6}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-2">
                      <label htmlFor="confirmPassword" className="form-label text-light" style={{fontSize: '0.85rem'}}>Confirm Password *</label>
                      <input
                        type="password"
                        className="form-control glass-effect border-0 text-light py-2"
                        style={{ color: 'white', background: '#222' }}
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="Confirm"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                <div className="row g-2">
                  <div className="col-md-6">
                    <div className="mb-2">
                      <label htmlFor="fullName" className="form-label text-light" style={{fontSize: '0.85rem'}}>Full Name</label>
                      <input
                        type="text"
                        className="form-control glass-effect border-0 text-light py-2"
                        style={{ color: 'white', background: '#222' }}
                        id="fullName"
                        name="fullName"
                        placeholder="Full name"
                        value={formData.fullName}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-2">
                      <label htmlFor="schoolName" className="form-label text-light" style={{fontSize: '0.85rem'}}>School Name</label>
                      <input
                        type="text"
                        className="form-control glass-effect border-0 text-light py-2"
                        style={{ color: 'white', background: '#222' }}
                        id="schoolName"
                        name="schoolName"
                        placeholder="School"
                        value={formData.schoolName}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-2">
                  <label htmlFor="className" className="form-label text-light" style={{fontSize: '0.85rem'}}>Class Name</label>
                  <input
                    type="text"
                    className="form-control glass-effect border-0 text-light py-2"
                    style={{ color: 'white', background: '#222' }}
                    id="className"
                    name="className"
                    placeholder="Class name"
                    value={formData.className}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-warning w-100 py-2 fw-bold border-0 mt-2 mb-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-plus me-2"></i>
                      Create Account
                    </>
                  )}
                </button>

                <div className="text-center">
                  <span className="text-muted" style={{fontSize: '0.9rem'}}>Already have an account? </span>
                  <Link href="/login" className="text-warning text-decoration-none" style={{fontSize: '0.9rem'}}>
                    Sign in here
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