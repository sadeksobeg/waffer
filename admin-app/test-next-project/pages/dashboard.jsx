// Simple dashboard page
import React from 'react';

export default function Dashboard() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Dashboard Page</h1>
      <p>This is a simple dashboard page to verify routing.</p>
      
      <div style={{ marginTop: '20px' }}>
        <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>Back to Home</a>
      </div>
    </div>
  )
}
