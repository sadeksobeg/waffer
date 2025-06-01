// Simple admin page
import React from 'react';

export default function Admin() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Admin Page</h1>
      <p>This is a simple admin page to verify routing.</p>
      
      <div style={{ marginTop: '20px' }}>
        <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>Back to Home</a>
      </div>
    </div>
  )
}
