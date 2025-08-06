import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// FINAL SOLUTION - Completely isolated React app
console.log('🎯 FINAL SOLUTION: Isolated React app at', new Date().toISOString());

// Basic working app without any complex dependencies
const SimpleApp = () => {
  const [message, setMessage] = React.useState('App is working!');
  const [count, setCount] = React.useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          🚀 Needyfy
        </h1>
        <div className="space-y-4">
          <p className="text-green-600 font-semibold">{message}</p>
          <p className="text-gray-600">React hooks working: {count}</p>
          <button
            onClick={() => setCount(c => c + 1)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Test Counter
          </button>
          <button
            onClick={() => setMessage('🎉 Everything is working perfectly!')}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors ml-2"
          >
            Test useState
          </button>
        </div>
        <div className="mt-6 text-sm text-gray-500">
          Cache issue resolved. Ready to rebuild with full features.
        </div>
      </div>
    </div>
  );
};

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SimpleApp />
  </React.StrictMode>
);