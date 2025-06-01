// Simple home page
import React from 'react';

export default function Home() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Test Next.js Project</h1>
      <p>This is a simple test project to verify routing.</p>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Navigation</h2>
        <ul>
          <li><a href="/admin">Admin Page</a></li>
          <li><a href="/dashboard">Dashboard Page</a></li>
        </ul>
      </div>
    </div>
  )
}
