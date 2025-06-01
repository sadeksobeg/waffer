// Alternative dashboard page
export default function Dash() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Alternative Dashboard</h1>
      <p>This is an alternative dashboard page with a different route.</p>
      <p>Current time: {new Date().toLocaleTimeString()}</p>
    </div>
  )
}
