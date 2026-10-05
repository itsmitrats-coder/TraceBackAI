import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AnalyticsData } from '../types';
import { CampusHeatmapWidget } from '../components/common/CampusHeatmapWidget';
import {
  BarChart3, TrendingUp, PieChart, Layers, Flame, Shield,
  CheckCircle2, RefreshCw, Sparkles, Filter, Clock
} from 'lucide-react';

export const AdminAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAnalytics();
      setAnalytics(data);
    } catch (e) {
      console.error('Failed to load analytics', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold block mb-1">
            CAMPUS INTELLIGENCE & RECOVERY METRICS
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Administrative Analytics
          </h1>
          <p className="text-xs text-slate-400">
            System performance KPIs, loss period trends, and institutional recovery throughput
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium flex items-center gap-2 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* KPI Cards (Section 22) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">TOTAL REPORTS</span>
          <span className="text-3xl font-black font-mono text-white">
            {analytics?.kpis.total_reports || 0}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">
            {analytics?.kpis.lost_items || 0} Lost / {analytics?.kpis.found_items || 0} Found
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-blue-500/30">
          <span className="text-[10px] font-mono uppercase text-blue-400 block mb-1">CANDIDATE PAIRS</span>
          <span className="text-3xl font-black font-mono text-cyan-400">
            {analytics?.kpis.potential_matches || 0}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">
            Multimodal matches detected
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">RECOVERED BELONGINGS</span>
          <span className="text-3xl font-black font-mono text-emerald-400">
            {analytics?.kpis.recovered_items || 0}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">
            Successfully closed traces
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">CAMPUS RECOVERY RATE</span>
          <span className="text-3xl font-black font-mono text-purple-400">
            {analytics?.kpis.recovery_rate || 0}%
          </span>
          <span className="text-[10px] text-emerald-400 block mt-1">
            +38% vs legacy paper logs
          </span>
        </div>
      </div>

      {/* Two Column Charts: Categories & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Common Lost Categories (Section 22) */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono font-bold uppercase text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              MOST COMMONLY LOST CATEGORIES
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Volume breakdown</span>
          </div>

          <div className="space-y-3 pt-2">
            {analytics?.category_distribution.map((cat, i) => {
              const maxVal = analytics.category_distribution[0]?.count || 1;
              const pct = (cat.count / maxVal) * 100;

              return (
                <div key={cat.category} className="text-xs">
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span className="font-medium">{cat.category}</span>
                    <span className="font-mono text-slate-400">{cat.count} reports</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 7-Day Loss vs Found Timeline (Section 22) */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono font-bold uppercase text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              7-DAY INCIDENT VELOCITY (LOST VS FOUND)
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Past week throughput</span>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-4 items-end h-44">
            {analytics?.timeline.map((item) => (
              <div key={item.day} className="flex flex-col items-center h-full justify-end text-center">
                <div className="w-full flex items-end justify-center gap-1 h-32">
                  <div
                    className="w-3 rounded-t-sm bg-blue-500 transition-all duration-500"
                    style={{ height: `${(item.lost / 10) * 100}%` }}
                    title={`Lost: ${item.lost}`}
                  />
                  <div
                    className="w-3 rounded-t-sm bg-emerald-400 transition-all duration-500"
                    style={{ height: `${(item.found / 10) * 100}%` }}
                    title={`Found: ${item.found}`}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-400 mt-2">{item.day}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Reported Lost
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" /> Discovered Found
            </span>
          </div>
        </div>
      </div>

      {/* Recovery Funnel & Peak Loss Periods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recovery Funnel (Section 22) */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-mono font-bold uppercase text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            END-TO-END RECOVERY FUNNEL
          </h3>
          <p className="text-xs text-slate-400">
            Conversion rate through each forensic stage of the TraceBack loop
          </p>

          <div className="space-y-3 pt-2">
            {analytics?.recovery_funnel.map((fn) => (
              <div key={fn.step} className="text-xs">
                <div className="flex justify-between text-slate-300 mb-1">
                  <span className="font-semibold">{fn.step}</span>
                  <span className="font-mono text-cyan-400">{fn.rate}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                    style={{ width: `${fn.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Loss Periods (Section 22) */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-mono font-bold uppercase text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            PEAK LOSS DIURNAL PERIODS
          </h3>
          <p className="text-xs text-slate-400">
            Identifies student movement intervals with elevated risk of misplaced items
          </p>

          <div className="space-y-3 pt-2">
            {analytics?.peak_loss_periods.map((p) => (
              <div key={p.period} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-200">{p.period}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-bold">
                  {p.count} incidents
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Campus Interactive Heatmap */}
      <div>
        <CampusHeatmapWidget />
      </div>
    </div>
  );
};
