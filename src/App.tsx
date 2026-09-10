import React, { useState, useEffect } from 'react';
import { TradingMode } from './types';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { db } from './lib/firebase';
import { doc, getDocFromServer } from 'firebase/firestore';

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  const handleAnalyze = async (
    asset: string,
    mode: TradingMode,
    imageBase64?: string,
    accountSize?: number,
    riskPct?: number,
    newsUpdate?: string
  ) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(new Error("Analysis request timed out after 210 seconds.")), 210000);
    try {
      const response = await fetch('/api/analyze', {
        signal: controller.signal,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asset, mode, image: imageBase64, accountSize, riskPct, newsUpdate }),
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Analysis request failed with status ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError' || err.message?.includes('aborted') || err.message?.includes('abort')) {
        throw new Error("Analysis timed out while computing institutional order flow and running AI models. Please retry.");
      }
      throw err;
    }
  };

  if (!hasStarted) {
    return <LandingPage onStart={() => setHasStarted(true)} />;
  }

  return (
    <div className="relative">
      <Dashboard onAnalyze={handleAnalyze} />
    </div>
  );
}

