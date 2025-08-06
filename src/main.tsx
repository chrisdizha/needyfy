import React from 'react'
import { createRoot } from 'react-dom/client'

// ABSOLUTE MINIMAL REACT - No imports, no CSS, nothing that could cache
console.log('🔥 MINIMAL REACT: Starting completely isolated React');

// Completely isolated test component
function MinimalTest() {
  const [count, setCount] = React.useState(0);
  
  React.useEffect(() => {
    console.log('✅ React hooks confirmed working!');
  }, []);

  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      margin: 0,
      padding: '20px'
    }
  }, 
    React.createElement('div', {
      style: {
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        maxWidth: '400px'
      }
    },
      React.createElement('h1', {
        style: { color: '#333', marginBottom: '20px' }
      }, '🔥 Minimal React Test'),
      React.createElement('p', {
        style: { color: '#666', marginBottom: '20px' }
      }, `Clicks: ${count}`),
      React.createElement('button', {
        onClick: () => setCount(c => c + 1),
        style: {
          background: '#667eea',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '16px'
        }
      }, 'Test React Hooks'),
      React.createElement('p', {
        style: { marginTop: '20px', fontSize: '12px', color: '#999' }
      }, 'If this works, React is functional')
    )
  );
}

// Mount the minimal app
const root = document.getElementById('root');
if (root) {
  createRoot(root).render(React.createElement(MinimalTest));
  console.log('✅ Minimal React mounted successfully');
} else {
  console.error('❌ Root element not found');
}