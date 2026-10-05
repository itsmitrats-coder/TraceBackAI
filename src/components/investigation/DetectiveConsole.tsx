import React, { useState } from 'react';
import { DetectiveQuestion, DetectiveAnswerResponse } from '../../types';
import { api } from '../../services/api';
import { Sparkles, Check, X, HelpCircle, RefreshCw, ArrowUpRight } from 'lucide-react';

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
    <div className="rounded-[18px] bg-white border border-[#EAEAEA] p-6 shadow-sm space-y-4">
      {/* Friendly Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#F0F0F0]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">👀</span>
            <h3 className="text-base font-extrabold text-[#171717]">
              One more thing...
            </h3>
          </div>
          <p className="text-xs text-[#666666] mt-0.5">
            A quick detail could help us confirm which item is yours.
          </p>
        </div>

        <button
          onClick={fetchQuestion}
          disabled={isLoadingQuestion || isSubmitting}
          className="px-3 py-1.5 rounded-full bg-[#F5F5F5] hover:bg-[#EAEAEA] text-[#666666] text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingQuestion ? 'animate-spin' : ''}`} />
          <span>New question</span>
        </button>
      </div>

      {/* Submitting State */}
      {isSubmitting ? (
        <div className="py-8 text-center space-y-2 animate-fade-in">
          <div className="w-8 h-8 rounded-full border-3 border-[#E53935] border-t-transparent animate-spin mx-auto" />
          <p className="text-sm font-bold text-[#171717]">Checking the clues...</p>
          <p className="text-xs text-[#666666]">Adjusting match rankings based on your answer</p>
        </div>
      ) : lastResult ? (
        /* Friendly Success Response */
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 rounded-[14px] bg-[#FFF0F0] border border-[#FFCDD2]">
            <div className="flex items-center gap-2 text-[#C62828] font-bold text-xs uppercase mb-1">
              <Sparkles className="w-4 h-4 text-[#E53935]" />
              Nice. That helped narrow it down.
            </div>
            <p className="text-xs text-[#171717] font-medium leading-relaxed">
              {lastResult.explanation}
            </p>
          </div>

          {/* Ranking Adjustments */}
          {lastResult.score_deltas && lastResult.score_deltas.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#666666] uppercase block">
                Rankings updated:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {lastResult.score_deltas.slice(0, 3).map((delta) => {
                  const isPositive = delta.delta > 0;
                  return (
                    <div
                      key={delta.match_id}
                      className="p-3 rounded-[12px] bg-[#FAFAFA] border border-[#EAEAEA] flex items-center justify-between"
                    >
                      <div className="overflow-hidden pr-2">
                        <span className="text-xs font-bold text-[#171717] truncate block">
                          {delta.title}
                        </span>
                        <span className="text-[10px] text-[#666666]">
                          {delta.score_before}% → {delta.score_after}%
                        </span>
                      </div>
                      <div
                        className={`flex items-center text-xs font-bold px-2 py-0.5 rounded ${
                          isPositive
                            ? 'text-[#C62828] bg-[#FFF0F0]'
                            : 'text-[#666666] bg-[#EAEAEA]'
                        }`}
                      >
                        {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : null}
                        <span>{delta.delta > 0 ? `+${delta.delta}%` : `${delta.delta}%`}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              onClick={fetchQuestion}
              className="text-xs text-[#E53935] hover:text-[#C62828] font-bold underline"
            >
              Ask another question
            </button>
          </div>
        </div>
      ) : question ? (
        /* The Targeted Question */
        <div className="space-y-4">
          <div className="p-4 rounded-[14px] bg-[#FAFAFA] border border-[#EAEAEA]">
            <p className="text-sm text-[#171717] font-bold leading-relaxed mb-1">
              "{question.question}"
            </p>
            {question.context && (
              <p className="text-xs text-[#666666]">
                {question.context}
              </p>
            )}
          </div>

          {/* Student-Friendly Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleAnswer('YES')}
              className="flex-1 min-w-[120px] py-2.5 px-4 rounded-[12px] bg-[#E53935] hover:bg-[#C62828] text-white font-bold text-xs uppercase tracking-wide transition shadow-xs"
            >
              YES, IT DID
            </button>

            <button
              onClick={() => handleAnswer('NO')}
              className="flex-1 min-w-[120px] py-2.5 px-4 rounded-[12px] bg-white hover:bg-[#FAFAFA] text-[#171717] border border-[#D4D4D4] font-bold text-xs uppercase tracking-wide transition"
            >
              NOPE
            </button>

            <button
              onClick={() => handleAnswer("I DON'T KNOW")}
              className="flex-1 min-w-[140px] py-2.5 px-4 rounded-[12px] bg-[#F5F5F5] hover:bg-[#EAEAEA] text-[#666666] font-semibold text-xs uppercase tracking-wide transition"
            >
              I DON'T REMEMBER
            </button>
          </div>
        </div>
      ) : (
        <div className="py-4 text-center text-[#666666] text-xs">
          <button
            onClick={fetchQuestion}
            className="px-4 py-2 rounded-[12px] bg-[#FFF0F0] text-[#E53935] border border-[#FFCDD2] font-bold text-xs hover:bg-[#FFE4E6] transition"
          >
            Check if a question can help narrow it down
          </button>
        </div>
      )}
    </div>
  );
};
