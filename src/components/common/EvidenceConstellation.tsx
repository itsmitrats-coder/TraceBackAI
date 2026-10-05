import React, { useState } from 'react';
import { ComponentScores } from '../../types';
import { Eye, FileText, Sparkles, MapPin, Clock, Info } from 'lucide-react';

interface EvidenceConstellationProps {
  scores: ComponentScores;
  candidateTitle: string;
  supportingEvidence?: string[];
  conflictingEvidence?: string[];
}

export const EvidenceConstellation: React.FC<EvidenceConstellationProps> = ({
  scores,
  candidateTitle,
  supportingEvidence = [],
  conflictingEvidence = [],
}) => {
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const nodes = [
    {
      id: 'visual',
      label: 'Visual Similarity',
      score: scores.visual,
      weight: '30%',
      icon: Eye,
      color: '#38BDF8', // Cyan
      x: 120,
      y: 70,
      desc: 'Color palette, material texture & silhouette geometry analysis',
    },
    {
      id: 'semantic',
      label: 'Semantic Text',
      score: scores.semantic,
      weight: '25%',
      icon: FileText,
      color: '#818CF8', // Indigo
      x: 360,
      y: 70,
      desc: 'Natural language embedding cosine similarity between reports',
    },
    {
      id: 'distinctive',
      label: 'Distinctive Marks',
      score: scores.distinctive,
      weight: '20%',
      icon: Sparkles,
      color: '#FBBF24', // Amber
      x: 420,
      y: 220,
      desc: 'Brand logos, stickers, scratches, decals & physical quirks',
    },
    {
      id: 'location',
      label: 'Zone Proximity',
      score: scores.location,
      weight: '15%',
      icon: MapPin,
      color: '#34D399', // Mint
      x: 240,
      y: 310,
      desc: 'Campus sector adjacency matrix & coordinate radius distance',
    },
    {
      id: 'time',
      label: 'Time Window',
      score: scores.time,
      weight: '10%',
      icon: Clock,
      color: '#F472B6', // Rose
      x: 60,
      y: 220,
      desc: 'Temporal delta decay between loss hour & found timestamp',
    },
  ];

  const centerX = 240;
  const centerY = 175;

  const activeNodeData = nodes.find((n) => n.id === activeNode);

  return (
    <div className="rounded-2xl bg-slate-950/90 border border-slate-800 p-6 shadow-2xl relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-mono uppercase tracking-widest text-blue-400 font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping inline-block" />
            EVIDENCE CONSTELLATION
          </h3>
          <p className="text-xs text-slate-400">
            Interactive multi-factor evidence graph for candidate verification
          </p>
        </div>
        <span className="text-[11px] font-mono text-slate-500 px-2 py-1 rounded bg-slate-900 border border-slate-800">
          5 Corroborating Signals
        </span>
      </div>

      {/* Interactive Constellation SVG Canvas */}
      <div className="relative w-full flex justify-center py-2">
        <svg
          viewBox="0 0 480 350"
          className="w-full max-w-lg h-auto select-none"
          style={{ overflow: 'visible' }}
        >
          {/* Connector Lines */}
          {nodes.map((node) => {
            const isActive = activeNode === node.id;
            return (
              <g key={`line-${node.id}`}>
                <line
                  x1={centerX}
                  y1={centerY}
                  x2={node.x}
                  y2={node.y}
                  stroke={node.color}
                  strokeWidth={isActive ? 3 : 1.5}
                  strokeDasharray={isActive ? 'none' : '4 4'}
                  opacity={isActive ? 0.9 : 0.4}
                  className="transition-all duration-300"
                />
                {/* Moving Evidence Particle */}
                <circle r={isActive ? 3.5 : 2} fill={node.color} opacity={0.8}>
                  <animateMotion
                    path={`M ${node.x} ${node.y} L ${centerX} ${centerY}`}
                    dur={`${2.5 + Math.random()}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            );
          })}

          {/* Center Candidate Node */}
          <g transform={`translate(${centerX}, ${centerY})`} className="cursor-pointer">
            <circle r={42} fill="#0F172A" stroke="#3B82F6" strokeWidth="2.5" />
            <circle r={46} fill="none" stroke="#60A5FA" strokeWidth="1" opacity="0.3" className="animate-pulse" />
            <text
              textAnchor="middle"
              y="-8"
              fill="#93C5FD"
              fontSize="10"
              fontFamily="monospace"
              fontWeight="bold"
            >
              CANDIDATE
            </text>
            <text
              textAnchor="middle"
              y="8"
              fill="#F8FAFC"
              fontSize="11"
              fontWeight="600"
            >
              {candidateTitle.length > 13 ? candidateTitle.slice(0, 12) + '…' : candidateTitle}
            </text>
            <text
              textAnchor="middle"
              y="22"
              fill="#64748B"
              fontSize="9"
              fontFamily="monospace"
            >
              EVIDENCE HUB
            </text>
          </g>

          {/* Outer Evidence Factor Nodes */}
          {nodes.map((node) => {
            const Icon = node.icon;
            const isHovered = activeNode === node.id;
            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer group"
                onMouseEnter={() => setActiveNode(node.id)}
                onMouseLeave={() => setActiveNode(null)}
              >
                {/* Glow ring */}
                <circle
                  r={isHovered ? 34 : 28}
                  fill="#0B132B"
                  stroke={node.color}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  style={{
                    filter: isHovered ? `drop-shadow(0 0 10px ${node.color})` : 'none',
                    transition: 'all 0.3s ease',
                  }}
                />

                {/* Score */}
                <text
                  textAnchor="middle"
                  y="-4"
                  fill="#FFFFFF"
                  fontSize="12"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {Math.round(node.score)}%
                </text>
                <text
                  textAnchor="middle"
                  y="10"
                  fill="#94A3B8"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  {node.weight}
                </text>

                {/* Node Label Below */}
                <text
                  textAnchor="middle"
                  y="42"
                  fill={isHovered ? '#FFFFFF' : '#CBD5E1'}
                  fontSize="10"
                  fontWeight="500"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Node Details or Evidence Breakdown */}
      <div className="mt-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
        {activeNodeData ? (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-200 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeNodeData.color }} />
                {activeNodeData.label} — {activeNodeData.score}% Confidence
              </span>
              <span className="font-mono text-slate-400 text-[11px]">Formula Weight: {activeNodeData.weight}</span>
            </div>
            <p className="text-slate-400">{activeNodeData.desc}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Supporting Evidence */}
            <div>
              <h5 className="font-mono font-bold text-emerald-400 text-[11px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                CORROBORATING EVIDENCE ({supportingEvidence.length})
              </h5>
              {supportingEvidence.length > 0 ? (
                <ul className="space-y-1.5 text-slate-300">
                  {supportingEvidence.map((ev, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px]">
                      <span className="text-emerald-400 font-bold shrink-0">✓</span>
                      <span>{ev}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 italic text-[11px]">Initial baseline alignment.</p>
              )}
            </div>

            {/* Conflicting Evidence */}
            <div>
              <h5 className="font-mono font-bold text-amber-400 text-[11px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                AMBIGUITIES / CONFLICTS ({conflictingEvidence.length})
              </h5>
              {conflictingEvidence.length > 0 ? (
                <ul className="space-y-1.5 text-slate-300">
                  {conflictingEvidence.map((ev, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px]">
                      <span className="text-amber-400 font-bold shrink-0">!</span>
                      <span>{ev}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 italic text-[11px]">No contradictory flags identified.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
