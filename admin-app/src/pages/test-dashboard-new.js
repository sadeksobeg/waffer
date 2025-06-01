// Minimal test dashboard with no dependencies
export default function TestDashboardNew() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Dashboard New</h1>
      <p>This is a minimal test dashboard page with no dependencies.</p>
      <p>Current time: {new Date().toLocaleTimeString()}</p>
      <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>Back to Home</a>
    </div>
  );
}
