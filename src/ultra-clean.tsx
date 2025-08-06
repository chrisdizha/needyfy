import React from 'react'
import { createRoot } from 'react-dom/client'

// ULTRA CLEAN - Zero dependencies except React
console.log('🧹 ULTRA CLEAN: Pure React only at', new Date().toISOString());

const UltraCleanApp = () => {
  const [status, setStatus] = React.useState('✅ React is working!');
  const [clicks, setClicks] = React.useState(0);

  React.useEffect(() => {
    console.log('✅ useEffect working');
    setStatus('✅ All React hooks working perfectly!');
  }, []);

  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      color: 'white'
    }
  }, 
    React.createElement('div', {
      style: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: '20px',
        padding: '40px',
        textAlign: 'center',
        color: '#333',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        width: '90%'
      }
    },
      React.createElement('h1', {
        style: { fontSize: '36px', margin: '0 0 20px 0', color: '#667eea' }
      }, '🚀 Needyfy - Ultra Clean'),
      React.createElement('p', {
        style: { fontSize: '18px', margin: '20px 0', color: '#28a745' }
      }, status),
      React.createElement('p', {
        style: { fontSize: '16px', margin: '15px 0' }
      }, `Button clicked: ${clicks} times`),
      React.createElement('button', {
        onClick: () => setClicks(c => c + 1),
        style: {
          backgroundColor: '#667eea',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '16px',
          cursor: 'pointer',
          margin: '10px',
          transition: 'all 0.3s ease'
        },
        onMouseOver: (e) => e.target.style.backgroundColor = '#5a6fd8',
        onMouseOut: (e) => e.target.style.backgroundColor = '#667eea'
      }, 'Test React'),
      React.createElement('div', {
        style: { marginTop: '30px', fontSize: '14px', color: '#666' }
      }, 'Pure React app - no external dependencies. Ready to add features back.')
    )
  );
};

const root = createRoot(document.getElementById("root"));
root.render(React.createElement(React.StrictMode, null, React.createElement(UltraCleanApp)));