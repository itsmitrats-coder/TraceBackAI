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
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#EAEAEA]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#E53935] block mb-1">
            SECURITY & AUDIT
          </span>
          <h1 className="text-3xl font-black text-[#171717] tracking-tight">
            Institutional Audit Trail
          </h1>
          <p className="text-xs text-[#666666]">
            Transparent timeline of student reports, claim decisions, and verified physical handovers.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="px-3.5 py-2 rounded-xl bg-white border border-[#EAEAEA] text-[#666666] hover:text-[#171717] hover:bg-[#F9F9F9] text-xs font-semibold flex items-center gap-2 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {['all', 'REPORT_LOST', 'REPORT_FOUND', 'CLAIM', 'MARK_RECOVERED', 'FINGERPRINT'].map((act) => (
          <button
            key={act}
            onClick={() => setFilterAction(act)}
            className={`px-3 py-1.5 rounded-full capitalize text-xs transition ${
              filterAction === act
                ? 'bg-[#E53935] text-white font-bold'
                : 'bg-white text-[#666666] hover:text-[#171717] border border-[#EAEAEA]'
            }`}
          >
            {act.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Timeline View */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-4 border-[#FFF0F0] border-t-[#E53935] animate-spin mx-auto" />
          <p className="text-xs text-[#666666]">Loading audit history...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="py-16 text-center text-[#666666] rounded-3xl bg-white border border-[#EAEAEA]">
          <FileText className="w-10 h-10 mx-auto mb-2 text-[#666666]" />
          <p className="text-sm font-bold text-[#171717]">No audit records found.</p>
        </div>
      ) : (
        <div className="relative border-l-2 border-[#EAEAEA] ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-6">
          {logs.map((log) => {
            const isRecovery = log.action.includes('RECOVERED');
            const isApproval = log.action.includes('APPROVED');
            const isClaim = log.action.includes('CLAIM');

            return (
              <div key={log.id} className="relative group">
                {/* Node on vertical line */}
                <div
                  className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                    isRecovery
                      ? 'bg-emerald-500 ring-4 ring-emerald-100'
                      : isApproval
                      ? 'bg-[#E53935] ring-4 ring-[#FFF0F0]'
                      : isClaim
                      ? 'bg-blue-500 ring-4 ring-blue-100'
                      : 'bg-neutral-400'
                  }`}
                />

                <div className="p-5 rounded-2xl bg-white border border-[#EAEAEA] group-hover:border-[#171717]/20 transition space-y-2 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-[#FFF0F0] text-[#E53935] border border-[#E53935]/20">
                        {log.action}
                      </span>
                      <span className="text-xs font-bold text-[#171717]">
                        Target: {log.target_type} ({log.target_id.slice(-6)})
                      </span>
                    </div>

                    <span className="text-xs text-[#666666]">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#666666]">
                    <User className="w-3.5 h-3.5 text-[#E53935]" />
                    <span>Actor: <strong className="text-[#171717]">{log.actor_name}</strong> ({log.actor_role})</span>
                  </div>

                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="p-3 rounded-xl bg-[#FFF7F7] border border-[#EAEAEA] text-xs text-[#666666] font-mono">
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
