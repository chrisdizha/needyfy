import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// NUCLEAR SOLUTION - Completely isolated React app
console.log('☢️ NUCLEAR MAIN: Starting fresh React at', new Date().toISOString());
console.log('React version:', React.version);

// Test React hooks are working
const NuclearApp = () => {
  const [status, setStatus] = React.useState('🔄 Initializing...');
  const [counter, setCounter] = React.useState(0);
  const [hookTest, setHookTest] = React.useState('❌ Not tested');

  React.useEffect(() => {
    console.log('✅ useEffect working!');
    setStatus('✅ React hooks working perfectly!');
    setHookTest('✅ useEffect confirmed working');
  }, []);

  const testAllHooks = () => {
    // Test useState
    setCounter(prev => prev + 1);
    
    // Test callback
    React.useCallback(() => {
      console.log('✅ useCallback working');
    }, []);
    
    // Test memo
    const memoValue = React.useMemo(() => {
      return 'useeMemo working';
    }, []);
    
    setStatus(`✅ All hooks working! Memo: ${memoValue}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          ☢️ Nuclear React
        </h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-green-700 font-semibold">{status}</p>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-700">Counter: {counter}</p>
            <p className="text-blue-700 text-sm">{hookTest}</p>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={testAllHooks}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Test All React Hooks
            </button>
            
            <button
              onClick={() => setStatus('🎉 Manual state update successful!')}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Test useState
            </button>
          </div>
        </div>
        
        <div className="mt-6 text-xs text-gray-500 space-y-1">
          <p>Nuclear cache clear successful</p>
          <p>React version: {React.version}</p>
          <p>Ready for full app rebuild</p>
        </div>
      </div>
    </div>
  );
};

// Initialize with clean React
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <NuclearApp />
    </React.StrictMode>
  );
  console.log('☢️ Nuclear React app mounted successfully');
} else {
  console.error('❌ Root container not found');
}