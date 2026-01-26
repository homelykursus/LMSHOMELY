export default function TestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: 'blue', fontSize: '32px' }}>Test Page - Web Berfungsi!</h1>
      <p style={{ fontSize: '18px', margin: '20px 0' }}>
        Ini adalah halaman test untuk memastikan rendering berfungsi dengan baik.
      </p>
      <div style={{ 
        backgroundColor: '#f0f0f0', 
        padding: '20px', 
        borderRadius: '8px',
        border: '2px solid #ccc'
      }}>
        <h2>Status Components:</h2>
        <ul>
          <li>✅ HTML Rendering: Berfungsi</li>
          <li>✅ CSS Styling: Berfungsi</li>
          <li>✅ Next.js: Berfungsi</li>
          <li>✅ Server: Berjalan di port 3000</li>
        </ul>
      </div>
      <button 
        style={{
          backgroundColor: '#0070f3',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          fontSize: '16px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
        onClick={() => alert('Button berfungsi!')}
      >
        Test Button
      </button>
    </div>
  )
}