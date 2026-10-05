import React, { useState, useEffect } from 'react';
import { Cpu, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

export const DemoEngineStatusBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [status, setStatus] = useState<string>('TraceBack Intelligence • Demo Engine');
  const [isLive, setIsLive] = useState<boolean>(false);

  useEffect(() => {
    api.getAiStatus()
      .then((res) => {
        setStatus(res.engine);
        setIsLive(res.is_live_ai);
      })
      .catch(() => {
        setStatus('TraceBack Intelligence • Demo Engine');
      });
  }, []);

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border backdrop-blur-md transition-all ${
        isLive
          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
          : 'bg-blue-950/40 border-blue-500/30 text-blue-300'
      } ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isLive ? 'bg-emerald-400' : 'bg-blue-400'
          }`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isLive ? 'bg-emerald-500' : 'bg-blue-500'
          }`}
        />
      </span>
      <span className="font-semibold">{status}</span>
    </div>
  );
};
