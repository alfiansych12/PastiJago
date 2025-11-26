// app/belajar/sql/SqlEditor.tsx
'use client';
import React, { useState, useLayoutEffect } from 'react';
import Swal from 'sweetalert2';
import alasql from 'alasql';

type User = { id: number; name: string; age: number };

export default function SqlEditor({ onLiveUpdate, onError }: { onLiveUpdate?: (users: User[]) => void; onError?: (errMsg: string) => void }) {
  const [query, setQuery] = useState('SELECT * FROM users;');
  const [error, setError] = useState('');

  useLayoutEffect(() => {
    // Inisialisasi database demo dengan alasql
    if (!alasql.tables.users) {
      alasql('CREATE TABLE users (id INT, name STRING, age INT)');
      alasql('INSERT INTO users VALUES (1, "Alice", 22), (2, "Bob", 30), (3, "Charlie", 25)');
    }
  }, []);

  const runQuery = () => {
    setError('');
    try {
      alasql(query);
      if (onLiveUpdate) {
        const users = alasql('SELECT * FROM users') as User[];
        if (Array.isArray(users)) onLiveUpdate(users);
      }
      Swal.fire({
        icon: 'success',
        title: 'Query Berhasil!',
        text: 'Query berhasil dijalankan.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err: unknown) {
      let errMsg = 'Unknown error';
      if (err instanceof Error) {
        setError(err.message);
        errMsg = err.message;
      }
      if (onError) onError(errMsg);
    }
  };

  return (
    <div className="glass-effect rounded-4 p-4">
      <h5 className="text-warning mb-3">SQL Editor</h5>
      <textarea
        className="form-control mb-3 text-dark bg-light"
        rows={4}
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{fontFamily: 'monospace'}}
      />
      <button className="btn btn-primary mb-3" onClick={runQuery}>
        Jalankan Query
      </button>
      {error && <div className="alert alert-danger mt-2">{error}</div>}
    </div>
  );
}
