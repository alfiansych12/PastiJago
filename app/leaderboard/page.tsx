// app/leaderboard/page.js
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function LeaderboardPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState('weekly');

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from('users')
      .select('id, username, exp, created_at')
      .order('exp', { ascending: false })
      .limit(50);
    if (data) setUsers(data);
  };

  const top3 = users.slice(0, 3);
  const rest = users.slice(3);

  return (
    <div className="leaderboard-bg min-vh-100 py-5">
      <div className="container">
        <h1 className="leaderboard-title mb-4">🏆 Leaderboard</h1>
        <div className="d-flex justify-content-end mb-3">
          <select
            className="form-select select-small"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            style={{ maxWidth: 140, fontSize: '0.95rem', padding: '0.3rem 0.7rem' }}
          >
            <option value="weekly">Minggu Ini</option>
            <option value="monthly">Bulan Ini</option>
            <option value="alltime">All Time</option>
          </select>
        </div>

        {/* Top 3 Cards */}
        <div className="row g-3 mb-4">
          {top3.map((user, idx) => (
            <div className="col-12 col-md-4" key={user.id}>
              <div className={`top-card top-rank-${idx+1} animate-pop-in`}>
                <div className="top-badge">
                  {idx === 0 && <span className="gold-glow">🥇</span>}
                  {idx === 1 && <span className="silver-glow">🥈</span>}
                  {idx === 2 && <span className="bronze-glow">🥉</span>}
                </div>
                <div className="top-username">{user.username}</div>
                <div className="top-exp">{user.exp.toLocaleString()} EXP</div>
                <div className="top-level">Level {Math.floor(user.exp / 100) + 1}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Rest of leaderboard */}
        <div className="card glass-card shadow-sm">
          <div className="card-body p-0">
            <table className="table table-borderless table-hover align-middle mb-0 leaderboard-table">
              <thead>
                <tr>
                  <th className="text-center">Rank</th>
                  <th>Username</th>
                  <th className="text-end">EXP</th>
                  <th className="text-end">Level</th>
                </tr>
              </thead>
              <tbody>
                {rest.map((user, index) => (
                  <tr key={user.id} className="row-small">
                    <td className="text-center">
                      <span className="rank-badge">#{index + 4}</span>
                    </td>
                    <td>{user.username}</td>
                    <td className="text-end text-gold">{user.exp.toLocaleString()}</td>
                    <td className="text-end">Level {Math.floor(user.exp / 100) + 1}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        .leaderboard-bg {
          background: linear-gradient(135deg, #181c2f 0%, #232946 100%);
          min-height: 100vh;
        }
        .leaderboard-title {
          font-size: 2.2rem;
          font-weight: 800;
          letter-spacing: 1px;
          color: #ffe066;
          text-shadow: 0 0 10px #ffe066, 0 2px 8px #232946;
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .select-small {
          background: rgba(30,34,54,0.8);
          color: #ffe066;
          border: 1.2px solid #ffe066;
          border-radius: 10px;
          font-weight: 600;
          box-shadow: 0 2px 8px #23294622;
          font-size: 0.95rem;
          padding: 0.3rem 0.7rem;
        }
        .top-card {
          background: rgba(255,255,255,0.07);
          border-radius: 1.2rem;
          box-shadow: 0 4px 16px 0 #23294633;
          border: 2px solid #ffe066;
          padding: 1.2rem 0.7rem 1.1rem 0.7rem;
          text-align: center;
          position: relative;
          min-height: 150px;
          transition: transform 0.18s;
        }
        .top-card:hover {
          transform: translateY(-4px) scale(1.025);
          box-shadow: 0 8px 24px 0 #ffe06677;
        }
        .top-badge {
          font-size: 1.5rem;
          margin-bottom: 0.3rem;
        }
        .gold-glow {
          color: #ffd700;
          text-shadow: 0 0 8px #ffd700, 0 2px 8px #fffbe6;
        }
        .silver-glow {
          color: #c0c0c0;
          text-shadow: 0 0 6px #c0c0c0, 0 2px 8px #e0e0e0;
        }
        .bronze-glow {
          color: #cd7f32;
          text-shadow: 0 0 6px #cd7f32, 0 2px 8px #fffbe6;
        }
        .top-username {
          font-size: 1.1rem;
          font-weight: 700;
          color: #ffe066;
          margin-bottom: 0.2rem;
          letter-spacing: 0.5px;
        }
        .top-exp {
          font-size: 1rem;
          color: #fffbe6;
          font-weight: 600;
        }
        .top-level {
          font-size: 0.98rem;
          color: #b8b8b8;
          margin-bottom: 0.2rem;
        }
        .glass-card {
          background: rgba(255,255,255,0.10);
          border-radius: 1rem;
          border: 1.2px solid #ffe06644;
          backdrop-filter: blur(6px);
        }
        .leaderboard-table th, .leaderboard-table td {
          font-size: 0.98rem;
        }
        .leaderboard-table th {
          color: #ffe066;
          font-weight: 700;
          background: transparent;
        }
        .row-small {
          border-bottom: 1px solid #ffe06618;
          transition: background 0.18s;
        }
        .row-small:hover {
          background: rgba(255,224,102,0.05);
        }
        .rank-badge {
          display: inline-block;
          min-width: 2rem;
          padding: 0.2rem 0.5rem;
          border-radius: 0.8rem;
          background: linear-gradient(90deg, #232946 0%, #ffe066 100%);
          color: #232946;
          font-weight: 700;
          font-size: 0.95rem;
          box-shadow: 0 2px 8px #ffe06633;
        }
        .text-gold {
          color: #ffe066;
          font-weight: 700;
        }
        .animate-pop-in {
          animation: pop-in 0.7s cubic-bezier(.23,1.12,.67,.99);
        }
        @keyframes pop-in {
          0% { opacity: 0; transform: scale(0.7) translateY(40px); }
          80% { opacity: 1; transform: scale(1.05) translateY(-8px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}