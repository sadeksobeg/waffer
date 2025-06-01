// Minimal page with no dependencies
export default function Minimal() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Minimal Test Page</h1>
      <p>This is a minimal test page with no dependencies.</p>
      <p>Current time: {new Date().toLocaleTimeString()}</p>
    </div>
  )
}
