import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
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
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
        isLive
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-[#FFF7F7] border-[#EAEAEA] text-[#666666]'
      } ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isLive ? 'bg-emerald-400' : 'bg-[#E53935]'
          }`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isLive ? 'bg-emerald-500' : 'bg-[#E53935]'
          }`}
        />
      </span>
      <span className="font-medium text-[11px] text-[#171717]">{status}</span>
    </div>
  );
};
