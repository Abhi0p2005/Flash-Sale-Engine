import React from 'react';
import Marketplace from './MarketPlace';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start p-6">
      {/* Render the full dynamic product grid marketplace */}
      <Marketplace />
    </div>
  );
}

export default App;