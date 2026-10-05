import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AnalyticsData } from '../types';
import { CampusHeatmapWidget } from '../components/common/CampusHeatmapWidget';
import {
  BarChart3, TrendingUp, Layers, Clock, RefreshCw
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
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#EAEAEA]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#E53935] block mb-1">
            CAMPUS METRICS
          </span>
          <h1 className="text-3xl font-black text-[#171717] tracking-tight">
            Campus Analytics
          </h1>
          <p className="text-xs text-[#666666]">
            Campus-wide item reports, recovery rates, peak loss times, and department throughput.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="px-3.5 py-2 rounded-xl bg-white border border-[#EAEAEA] text-[#666666] hover:text-[#171717] hover:bg-[#F9F9F9] text-xs font-semibold flex items-center gap-2 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-[#EAEAEA] shadow-2xs">
          <span className="text-xs text-[#666666] block mb-1">Total Reports</span>
          <span className="text-3xl font-black text-[#171717]">
            {analytics?.kpis.total_reports || 0}
          </span>
          <span className="text-xs text-[#666666] block mt-1">
            {analytics?.kpis.lost_items || 0} Lost • {analytics?.kpis.found_items || 0} Found
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-[#FFF7F7] border border-[#EAEAEA] shadow-2xs">
          <span className="text-xs font-bold text-[#E53935] block mb-1">Possible Matches</span>
          <span className="text-3xl font-black text-[#E53935]">
            {analytics?.kpis.potential_matches || 0}
          </span>
          <span className="text-xs text-[#666666] block mt-1">
            Identified by matching
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 shadow-2xs">
          <span className="text-xs font-bold text-emerald-800 block mb-1">Items Returned</span>
          <span className="text-3xl font-black text-emerald-700">
            {analytics?.kpis.recovered_items || 0}
          </span>
          <span className="text-xs text-emerald-800 block mt-1">
            Safely handed back
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#EAEAEA] shadow-2xs">
          <span className="text-xs text-[#666666] block mb-1">Campus Recovery Rate</span>
          <span className="text-3xl font-black text-[#171717]">
            {analytics?.kpis.recovery_rate || 0}%
          </span>
          <span className="text-xs text-emerald-700 font-semibold block mt-1">
            +38% vs paper logs
          </span>
        </div>
      </div>

      {/* Two Column Charts: Categories & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Common Lost Categories */}
        <div className="p-6 rounded-3xl bg-white border border-[#EAEAEA] space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#171717] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#E53935]" />
              Most Common Lost Items
            </h3>
            <span className="text-xs text-[#666666]">Volume</span>
          </div>

          <div className="space-y-3 pt-2">
            {analytics?.category_distribution.map((cat) => {
              const maxVal = analytics.category_distribution[0]?.count || 1;
              const pct = (cat.count / maxVal) * 100;

              return (
                <div key={cat.category} className="text-xs">
                  <div className="flex justify-between text-[#171717] mb-1">
                    <span className="font-semibold">{cat.category}</span>
                    <span className="text-[#666666]">{cat.count} items</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#F9F9F9] overflow-hidden">
                    <div
                      className="h-full bg-[#E53935] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 7-Day Loss vs Found Timeline */}
        <div className="p-6 rounded-3xl bg-white border border-[#EAEAEA] space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#171717] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#E53935]" />
              7-Day Activity (Lost vs Found)
            </h3>
            <span className="text-xs text-[#666666]">Past week</span>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-4 items-end h-44">
            {analytics?.timeline.map((item) => (
              <div key={item.day} className="flex flex-col items-center h-full justify-end text-center">
                <div className="w-full flex items-end justify-center gap-1.5 h-32">
                  <div
                    className="w-3 rounded-t-sm bg-[#E53935] transition-all duration-500"
                    style={{ height: `${Math.max((item.lost / 10) * 100, 10)}%` }}
                    title={`Lost: ${item.lost}`}
                  />
                  <div
                    className="w-3 rounded-t-sm bg-emerald-500 transition-all duration-500"
                    style={{ height: `${Math.max((item.found / 10) * 100, 10)}%` }}
                    title={`Found: ${item.found}`}
                  />
                </div>
                <span className="text-xs text-[#666666] mt-2 font-medium">{item.day}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 pt-2 border-t border-[#EAEAEA] text-xs text-[#666666]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#E53935]" /> Reported Lost
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Logged Found
            </span>
          </div>
        </div>
      </div>

      {/* Recovery Funnel & Peak Loss Periods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recovery Funnel */}
        <div className="p-6 rounded-3xl bg-white border border-[#EAEAEA] space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-[#171717] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#E53935]" />
            Recovery Flow Completion
          </h3>
          <p className="text-xs text-[#666666]">
            Proportion of reported items progressing from initial report to verified pickup
          </p>

          <div className="space-y-3 pt-2">
            {analytics?.recovery_funnel.map((fn) => (
              <div key={fn.step} className="text-xs">
                <div className="flex justify-between text-[#171717] mb-1">
                  <span className="font-semibold">{fn.step}</span>
                  <span className="font-bold text-[#E53935]">{fn.rate}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#F9F9F9] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#E53935] to-[#C62828] rounded-full"
                    style={{ width: `${fn.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Loss Periods */}
        <div className="p-6 rounded-3xl bg-white border border-[#EAEAEA] space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-[#171717] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#E53935]" />
            Peak Times Items Go Missing
          </h3>
          <p className="text-xs text-[#666666]">
            Campus intervals with higher rates of forgotten belongings
          </p>

          <div className="space-y-2.5 pt-2">
            {analytics?.peak_loss_periods.map((p) => (
              <div key={p.period} className="p-3 rounded-2xl bg-[#FFF7F7] border border-[#EAEAEA] flex items-center justify-between text-xs">
                <span className="font-semibold text-[#171717]">{p.period}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#EAEAEA] text-[#E53935] font-bold">
                  {p.count} items
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
