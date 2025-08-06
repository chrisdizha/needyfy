import React from 'react';

// EMERGENCY MINIMAL APP - Bypass all complex components
console.log('🚨 EMERGENCY APP: Loading minimal version');

export default function App() {
  const [count, setCount] = React.useState(0);
  const [status, setStatus] = React.useState('Minimal app loading...');

  React.useEffect(() => {
    console.log('✅ App.tsx: React hooks working!');
    setStatus('✅ Minimal App.tsx working!');
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      margin: 0,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        maxWidth: '400px'
      }}>
        <h1 style={{ color: '#333', marginBottom: '20px' }}>
          🚨 Emergency App
        </h1>
        <p style={{ color: '#666', marginBottom: '10px' }}>
          {status}
        </p>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Count: {count}
        </p>
        <button
          onClick={() => setCount(c => c + 1)}
          style={{
            background: '#667eea',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            marginRight: '10px'
          }}
        >
          Test Counter
        </button>
        <button
          onClick={() => setStatus('🎉 State update works!')}
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Test State
        </button>
        <p style={{ marginTop: '20px', fontSize: '12px', color: '#999' }}>
          Bypassing all providers and complex components
        </p>
      </div>
    </div>
  );
}