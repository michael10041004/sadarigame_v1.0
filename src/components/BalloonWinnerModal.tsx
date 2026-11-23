/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { Sparkles, Trophy, X, PartyPopper } from 'lucide-react';
import { ParticipantResult } from '../types/game';
import { soundManager } from '../utils/audio';
import { launchConfetti } from '../utils/confetti';

interface BalloonWinnerModalProps {
  winner: ParticipantResult | null;
  onClose: () => void;
  onViewSummary: () => void;
}

export const BalloonWinnerModal: React.FC<BalloonWinnerModalProps> = ({
  winner,
  onClose,
  onViewSummary,
}) => {
  const [isPopped, setIsPopped] = useState(false);
  const [scaleUp, setScaleUp] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (winner) {
      setIsPopped(false);
      setScaleUp(false);

      // Sound fanfare
      soundManager.playBalloonInflate();
      const timer = setTimeout(() => {
        setScaleUp(true);
        soundManager.playSpecialFanfare();
        if (canvasRef.current) {
          launchConfetti(canvasRef.current, { count: 200, spread: 1.2 });
        }
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [winner]);

  if (!winner) return null;

  const handlePopBalloon = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPopped) return;
    setIsPopped(true);
    soundManager.playPop();
    if (canvasRef.current) {
      launchConfetti(canvasRef.current, { count: 300, originX: 0.5, originY: 0.45, spread: 1.8 });
    }
  };

  const balloonColor = winner.participantColor || '#EF4444';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      {/* Fullscreen Confetti Canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-20 w-full h-full"
      />

      <div className="relative z-30 w-full max-w-xl flex flex-col items-center text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-3 right-0 sm:-right-4 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-full transition-colors"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-500/20 border border-amber-400/40 text-amber-300 text-sm font-semibold mb-3 shadow-lg backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
          <span>★ 특별 지정 경품 당첨 ★</span>
          <PartyPopper className="w-4 h-4 text-amber-300" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          행운의 주인공 탄생!
        </h2>
        <p className="text-slate-300 text-sm sm:text-base max-w-md mb-6">
          지정된 최고 특별 경품 <span className="font-bold text-amber-300 underline underline-offset-4 decoration-amber-400">[{winner.prizeName}]</span>의 주인공이 결정되었습니다!
        </p>

        {/* ============================================================== */}
        {/* THE GIANT BALLOON WITH WINNER'S NAME DISPLAYED PROMINENTLY */}
        {/* ============================================================== */}
        <div className="relative my-2 select-none flex flex-col items-center">
          {!isPopped ? (
            <div
              onClick={handlePopBalloon}
              title="풍선을 클릭하면 팡! 터뜨릴 수 있습니다"
              className={`cursor-pointer group relative flex flex-col items-center transition-all duration-700 ease-out transform ${
                scaleUp ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
              }`}
              style={{
                animation: 'balloonFloat 3.6s ease-in-out infinite alternate',
              }}
            >
              {/* Balloon Body (Large SVG with realistic 3D radial highlights and gloss) */}
              <div className="relative w-64 sm:w-76 md:w-80 h-76 sm:h-88 md:h-96 flex items-center justify-center drop-shadow-2xl">
                <svg
                  viewBox="0 0 300 360"
                  className="w-full h-full filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-[1.02]"
                >
                  <defs>
                    {/* Balloon 3D Body Gradient */}
                    <radialGradient id={`balloonGrad-${winner.participantId}`} cx="35%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
                      <stop offset="25%" stopColor={balloonColor} stopOpacity="0.95" />
                      <stop offset="85%" stopColor={balloonColor} />
                      <stop offset="100%" stopColor="#000000" stopOpacity="0.65" />
                    </radialGradient>

                    {/* Specular Highlight Gloss */}
                    <linearGradient id="glossGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
                      <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Main Balloon Sphere/Oval */}
                  <path
                    d="M 150 15 
                       C 235 15, 290 80, 290 170 
                       C 290 250, 215 310, 160 325 
                       L 155 332
                       L 145 332
                       L 140 325
                       C 85 310, 10 250, 10 170 
                       C 10 80, 65 15, 150 15 Z"
                    fill={`url(#balloonGrad-${winner.participantId})`}
                  />

                  {/* Top-Left Gloss Sheen Curve */}
                  <ellipse
                    cx="100"
                    cy="95"
                    rx="55"
                    ry="35"
                    transform="rotate(-25 100 95)"
                    fill="url(#glossGrad)"
                  />

                  {/* Small secondary gloss dot */}
                  <circle cx="80" cy="145" r="7" fill="#FFFFFF" fillOpacity="0.45" />

                  {/* Balloon Tie Knot at the bottom */}
                  <polygon
                    points="140,325 160,325 165,340 135,340"
                    fill={balloonColor}
                    stroke="#000000"
                    strokeOpacity="0.3"
                    strokeWidth="1.5"
                  />
                  <ellipse cx="150" cy="340" rx="8" ry="4" fill="#1E293B" fillOpacity="0.3" />

                  {/* Dangling wavy ribbon string */}
                  <path
                    d="M 150 342 Q 135 375, 165 410 T 140 460"
                    fill="none"
                    stroke="#F1F5F9"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="4 2"
                    opacity="0.85"
                  />
                </svg>

                {/* THE WINNER'S NAME: BIG, BOLD, RADIANT IN THE CENTER OF THE BALLOON */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 pointer-events-none pb-8">
                  {/* Little crown icon */}
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300 mb-2 border border-white/30 shadow-sm animate-pulse">
                    <Trophy className="w-5 h-5 fill-amber-300 text-amber-300" />
                  </div>

                  <span className="text-xs uppercase tracking-widest font-bold text-white/90 drop-shadow mb-1">
                    WINNER
                  </span>

                  {/* Participant Name rendered as the giant balloon text */}
                  <div className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)] px-4 py-1 leading-tight max-w-[240px] truncate">
                    {winner.participantName}
                  </div>

                  {/* Subtle subtitle inside balloon */}
                  <div className="mt-2 text-xs font-semibold px-3 py-1 rounded-full bg-black/35 text-white/95 backdrop-blur-xs border border-white/25 shadow-xs">
                    🎉 당첨을 축하합니다!
                  </div>
                </div>
              </div>

              {/* Balloon Floating Hint / Pop Prompt */}
              <div className="mt-5 text-xs text-slate-300 font-medium flex items-center gap-1.5 bg-slate-900/60 px-3.5 py-1.5 rounded-full border border-slate-700/60">
                <span>🎈 풍선을 클릭하면 팡! 터뜨릴 수 있어요</span>
              </div>
            </div>
          ) : (
            /* Popped State Celebration */
            <div className="py-8 px-6 flex flex-col items-center animate-in zoom-in-75 duration-300">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-white text-4xl shadow-xl mb-4 animate-bounce">
                💥
              </div>
              <h3 className="text-3xl font-black text-white tracking-tight mb-2">
                펑! 축하합니다!
              </h3>
              <div className="text-2xl font-bold text-amber-300 mb-2">
                {winner.participantName} 님
              </div>
              <p className="text-slate-300 text-sm">
                풍선이 터지며 행운이 퍼졌습니다! 특별 경품 획득!
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 w-full">
          {!isPopped && (
            <button
              onClick={handlePopBalloon}
              className="px-5 py-2.5 text-sm font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-lg shadow-amber-500/25 active:scale-95 flex items-center gap-2"
            >
              <span>🎈 풍선 팡! 터뜨리기</span>
            </button>
          )}

          <button
            onClick={onViewSummary}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all active:scale-95 flex items-center gap-2"
          >
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span>전체 결과표 보기</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white bg-transparent hover:bg-slate-800/60 rounded-xl transition-all"
          >
            사다리판으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};
