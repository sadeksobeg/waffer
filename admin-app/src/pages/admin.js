// Minimal admin page with no dependencies
export default function Admin() {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333' }}>Admin Page</h1>
      <p>This is a minimal admin page with no external dependencies.</p>
      
      <div style={{ marginTop: '20px' }}>
        <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>Back to Home</a>
      </div>
    </div>
  )
}
