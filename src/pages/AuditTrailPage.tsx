import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AuditLogItem } from '../types';
import { Shield, Clock, FileText, CheckCircle2, User, RefreshCw, Filter } from 'lucide-react';

export const AuditTrailPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [filterAction, setFilterAction] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAuditLogs(filterAction !== 'all' ? filterAction : undefined);
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterAction]);

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold block mb-1">
            ACCOUNTABILITY LAYER
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Institutional Audit Trail
          </h1>
          <p className="text-xs text-slate-400">
            Immutable timeline of critical claim decisions, forensic fingerprint syntheses, and custody handovers
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium flex items-center gap-2 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Audit</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {['all', 'REPORT_LOST', 'REPORT_FOUND', 'CLAIM', 'MARK_RECOVERED', 'FINGERPRINT'].map((act) => (
          <button
            key={act}
            onClick={() => setFilterAction(act)}
            className={`px-3 py-1.5 rounded-xl capitalize font-mono text-[11px] transition ${
              filterAction === act
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {act.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Timeline View (Section 27) */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Loading audit logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="py-16 text-center text-slate-400 rounded-3xl bg-slate-900 border border-slate-800">
          <FileText className="w-10 h-10 mx-auto mb-2 text-slate-600" />
          <p className="text-sm font-semibold text-white">No audit records found.</p>
        </div>
      ) : (
        <div className="relative border-l-2 border-slate-800 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-6">
          {logs.map((log) => {
            const isRecovery = log.action.includes('RECOVERED');
            const isApproval = log.action.includes('APPROVED');
            const isClaim = log.action.includes('CLAIM');

            return (
              <div key={log.id} className="relative group">
                {/* Node on vertical line */}
                <div
                  className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-5 h-5 rounded-full border-2 border-slate-950 flex items-center justify-center ${
                    isRecovery
                      ? 'bg-emerald-500 ring-4 ring-emerald-500/20'
                      : isApproval
                      ? 'bg-blue-500 ring-4 ring-blue-500/20'
                      : isClaim
                      ? 'bg-purple-500 ring-4 ring-purple-500/20'
                      : 'bg-slate-700'
                  }`}
                />

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 group-hover:border-slate-700 transition space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase bg-slate-950 border border-slate-800 text-cyan-400">
                        {log.action}
                      </span>
                      <span className="text-xs font-semibold text-white">
                        Target: {log.target_type} ({log.target_id})
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <span>Actor: <strong className="text-white">{log.actor_name}</strong> ({log.actor_role})</span>
                  </div>

                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-400">
                      <pre className="overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
