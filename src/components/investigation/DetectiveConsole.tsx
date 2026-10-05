import React, { useState } from 'react';
import { DetectiveQuestion, DetectiveAnswerResponse } from '../../types';
import { api } from '../../services/api';
import { HelpCircle, Sparkles, Check, X, HelpCircle as QuestionIcon, RefreshCw, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface DetectiveConsoleProps {
  lostItemId: string;
  initialQuestion?: DetectiveQuestion | null;
  onAnswerApplied: (response: DetectiveAnswerResponse) => void;
}

export const DetectiveConsole: React.FC<DetectiveConsoleProps> = ({
  lostItemId,
  initialQuestion,
  onAnswerApplied,
}) => {
  const [question, setQuestion] = useState<DetectiveQuestion | null>(initialQuestion || null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<DetectiveAnswerResponse | null>(null);
  const [additionalNotes, setAdditionalNotes] = useState('');

  const fetchQuestion = async () => {
    setIsLoadingQuestion(true);
    try {
      const q = await api.getClarification(lostItemId);
      setQuestion(q);
      setLastResult(null);
    } catch (e) {
      console.error('Failed to load clarification question', e);
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  const handleAnswer = async (answer: string) => {
    if (!question) return;
    setIsSubmitting(true);
    try {
      const res = await api.answerClarification(lostItemId, question.id, answer, additionalNotes);
      setLastResult(res);
      onAnswerApplied(res);
    } catch (e) {
      console.error('Failed to submit clarification answer', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-950 border border-indigo-500/30 p-6 shadow-2xl">
      {/* Background Cyber Accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-indigo-900/40 mb-5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-xl shadow-inner">
            🕵️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                TRACEBACK DETECTIVE MODE
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 animate-pulse">
                Active Inquiry
              </span>
            </div>
            <p className="text-xs text-slate-400">
              One targeted clarification question to break candidate ambiguity
            </p>
          </div>
        </div>

        <button
          onClick={fetchQuestion}
          disabled={isLoadingQuestion || isSubmitting}
          className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingQuestion ? 'animate-spin' : ''}`} />
          <span>New Probe</span>
        </button>
      </div>

      {/* Re-evaluating State */}
      {isSubmitting ? (
        <div className="py-10 text-center space-y-3">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-ping" />
            <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-sm font-medium text-slate-200">Re-evaluating evidence matrix...</p>
          <p className="text-xs text-slate-400">Recalculating forensic vector weights across candidates</p>
        </div>
      ) : lastResult ? (
        /* Results Breakdown after Answering */
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase font-mono mb-1">
              <Sparkles className="w-4 h-4" />
              EVIDENCE RE-CALIBRATED SUCCESSFULLY
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {lastResult.explanation}
            </p>
          </div>

          {/* Ranking Deltas List */}
          {lastResult.score_deltas && lastResult.score_deltas.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider block">
                CANDIDATE RANKING ADJUSTMENT:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {lastResult.score_deltas.slice(0, 3).map((delta) => {
                  const isPositive = delta.delta > 0;
                  return (
                    <div
                      key={delta.match_id}
                      className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="overflow-hidden pr-2">
                        <span className="text-xs font-semibold text-white truncate block">
                          {delta.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {delta.score_before}% → {delta.score_after}%
                        </span>
                      </div>
                      <div
                        className={`flex items-center gap-0.5 text-xs font-bold font-mono px-2 py-0.5 rounded ${
                          isPositive
                            ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800'
                            : 'text-slate-400 bg-slate-800'
                        }`}
                      >
                        {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        <span>{delta.delta > 0 ? `+${delta.delta}%` : `${delta.delta}%`}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={fetchQuestion}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline flex items-center gap-1"
            >
              Ask another clarifying question
            </button>
          </div>
        </div>
      ) : question ? (
        /* Question Active Prompt */
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20">
            <span className="text-[11px] font-mono uppercase text-indigo-400 tracking-wider block mb-1.5">
              FORENSIC INVESTIGATION QUESTION
            </span>
            <p className="text-base text-white font-medium leading-relaxed">
              "{question.question}"
            </p>
            {question.context && (
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{question.context}</span>
              </p>
            )}
          </div>

          {/* Targeted Answer Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleAnswer('YES')}
              className="flex-1 min-w-[120px] py-3 px-4 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition transform active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>YES</span>
            </button>

            <button
              onClick={() => handleAnswer('NO')}
              className="flex-1 min-w-[120px] py-3 px-4 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-900/30 transition transform active:scale-95"
            >
              <X className="w-4 h-4" />
              <span>NO</span>
            </button>

            <button
              onClick={() => handleAnswer("I DON'T KNOW")}
              className="flex-1 min-w-[140px] py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-700 transition"
            >
              <QuestionIcon className="w-4 h-4 text-slate-400" />
              <span>I DON'T KNOW</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="py-6 text-center text-slate-400 text-xs">
          <p className="mb-3">Detective Mode is ready to probe candidates for distinguishing quirks.</p>
          <button
            onClick={fetchQuestion}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition text-xs shadow-md shadow-indigo-600/30"
          >
            Formulate Disambiguation Question
          </button>
        </div>
      )}
    </div>
  );
};
