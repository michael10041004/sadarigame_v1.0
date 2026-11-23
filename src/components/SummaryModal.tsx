/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Trophy, Copy, Check, RotateCcw, Settings, X, Sparkles, PartyPopper, Download } from 'lucide-react';
import { ParticipantResult } from '../types/game';
import { exportResultsToJpg } from '../utils/exportImage';

interface SummaryModalProps {
  results: ParticipantResult[];
  onClose: () => void;
  onPlayAgain: () => void;
  onGoToSetup: () => void;
  onReplayBalloon: (result: ParticipantResult) => void;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({
  results,
  onClose,
  onPlayAgain,
  onGoToSetup,
  onReplayBalloon,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const specialWinners = results.filter((r) => r.isSpecial);

  const handleSaveImage = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportSuccess(false);

    const success = await exportResultsToJpg(results, '윤관의 랜덤 사다리~~ 게임 최종 결과');
    setIsExporting(false);
    if (success) {
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    }
  };

  const handleCopy = () => {
    const lines = [
      '🎉 [윤관의 랜덤 사다리~~ 게임 최종 결과] 🎉',
      '----------------------------------------',
      ...results.map((r, idx) => {
        const specialMark = r.isSpecial ? ' 🎈 [★특별 경품★]' : '';
        return `${idx + 1}. ${r.participantName}  ➡️  ${r.prizeName}${specialMark}`;
      }),
      '----------------------------------------',
      '모두 축하드립니다! 🎁',
    ];

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xs">
              <Trophy className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                윤관의 랜덤 사다리~~ 게임 최종 결과
              </h2>
              <p className="text-xs sm:text-sm text-white/90">
                총 {results.length}명의 참여자에게 경품이 성공적으로 매핑되었습니다
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Special Winner Highlight Banner */}
        {specialWinners.length > 0 && (
          <div className="bg-amber-50 border-b border-amber-200 p-4 shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎈</span>
                <div>
                  <div className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>특별 지정 경품 당첨자</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {specialWinners.map((w) => `${w.participantName} (${w.prizeName})`).join(', ')}
                  </div>
                </div>
              </div>

              {specialWinners[0] && (
                <button
                  onClick={() => onReplayBalloon(specialWinners[0])}
                  className="px-3 py-1.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0 active:scale-95"
                >
                  <PartyPopper className="w-3.5 h-3.5" />
                  <span>축하 풍선 다시 보기</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Scrollable Results List */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-2.5 flex-1">
          {results.map((item, idx) => (
            <div
              key={item.participantId}
              className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                item.isSpecial
                  ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-300/60 shadow-xs'
                  : 'bg-slate-50/80 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs"
                  style={{ backgroundColor: item.participantColor }}
                >
                  {idx + 1}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 truncate">
                    {item.participantName}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    참여자 #{idx + 1}
                  </div>
                </div>
              </div>

              <div className="text-right flex items-center gap-2">
                <div className="text-right">
                  <div
                    className={`text-sm font-extrabold truncate max-w-[180px] sm:max-w-xs ${
                      item.isSpecial ? 'text-amber-950 font-black' : 'text-slate-900'
                    }`}
                  >
                    {item.prizeName}
                  </div>
                  {item.isSpecial && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700">
                      <span>🎈 특별 지정 경품</span>
                    </span>
                  )}
                </div>

                {item.isSpecial && (
                  <button
                    onClick={() => onReplayBalloon(item)}
                    title="풍선 연출 다시 보기"
                    className="p-1.5 text-xs text-amber-800 bg-amber-200 hover:bg-amber-300 rounded-lg transition-colors ml-1"
                  >
                    🎈
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center flex-wrap gap-2">
            {/* JPG Image Save Button */}
            <button
              onClick={handleSaveImage}
              disabled={isExporting}
              className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-all shadow-xs flex items-center gap-2 active:scale-95"
            >
              {exportSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>JPG 저장 완료!</span>
                </>
              ) : isExporting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>이미지 생성 중...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>결과 이미지(JPG) 저장</span>
                </>
              )}
            </button>

            {/* Clipboard Copy Button */}
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-all shadow-xs flex items-center gap-2 active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">복사 완료!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span>텍스트 복사</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onGoToSetup}
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>설정 수정</span>
            </button>

            <button
              onClick={onPlayAgain}
              className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>사다리 다시 타기</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
