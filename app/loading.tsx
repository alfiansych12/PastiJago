"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoadingSplash() {
  const router = useRouter();
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/dashboard"); // Change to your dashboard route
    }, 2200);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="splash-bg min-vh-100 d-flex flex-column justify-content-center align-items-center">
      <div className="splash-logo mb-4">
        {/* Replace with your actual logo image or SVG */}
        <img src="/logo.png" alt="PastiJago Logo" style={{ width: 120, height: 120 }} />
      </div>
      <h1 className="text-warning mb-2" style={{ fontWeight: 700, fontSize: "2.5rem" }}>Selamat Datang di PastiJago</h1>
      <p className="text-light mb-4 fs-5">Belajar coding jadi mudah dan seru!</p>
      <div className="spinner-border text-warning" role="status" style={{ width: 48, height: 48 }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <style jsx global>{`
        .splash-bg {
          background: linear-gradient(135deg, #232526 0%, #414345 100%);
        }
        .splash-logo img {
          filter: drop-shadow(0 2px 12px #ffc10788);
        }
      `}</style>
    </div>
  );
}
