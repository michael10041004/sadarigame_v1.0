/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, FastForward, Eye, EyeOff, RotateCcw, Trophy, Sparkles, CheckCircle2, Download } from 'lucide-react';
import { LadderRung, Participant, ParticipantResult, Prize, Point } from '../types/game';
import { soundManager } from '../utils/audio';
import { exportResultsToJpg } from '../utils/exportImage';

interface LadderBoardProps {
  participants: Participant[];
  prizes: Prize[];
  rungs: LadderRung[];
  results: ParticipantResult[];
  onReshuffleRungs: () => void;
  onRevealSpecialWinner: (result: ParticipantResult) => void;
  onViewSummary: () => void;
}

export const LadderBoard: React.FC<LadderBoardProps> = ({
  participants,
  prizes,
  rungs,
  results,
  onReshuffleRungs,
  onRevealSpecialWinner,
  onViewSummary,
}) => {
  const numCols = participants.length;
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [activeParticipantId, setActiveParticipantId] = useState<string | null>(null);
  const [activePoint, setActivePoint] = useState<Point | null>(null);
  const [isBlind, setIsBlind] = useState(false);
  const [speed, setSpeed] = useState<1 | 1.5 | 2>(1.5);
  const [revealedAll, setRevealedAll] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [imageSavedSuccess, setImageSavedSuccess] = useState(false);

  // Keep track of which special winners have already triggered the balloon modal
  const triggeredSpecialsRef = useRef<Set<string>>(new Set());
  const animationCancelRef = useRef<(() => void) | null>(null);
  const isAutoPlayingRef = useRef(false);
  const completedIdsRef = useRef<Set<string>>(new Set());

  // Keep completedIdsRef in sync
  useEffect(() => {
    completedIdsRef.current = completedIds;
  }, [completedIds]);

  // Clear animation on unmount
  useEffect(() => {
    return () => {
      isAutoPlayingRef.current = false;
      if (animationCancelRef.current) {
        animationCancelRef.current();
      }
    };
  }, []);

  // Animate a single participant down their path
  const startTrace = useCallback(
    (participantId: string, onComplete?: () => void) => {
      const result = results.find((r) => r.participantId === participantId);
      if (!result) return;

      if (animationCancelRef.current) {
        animationCancelRef.current();
        animationCancelRef.current = null;
      }

      setActiveParticipantId(participantId);
      const path = result.path;
      if (path.length < 2) return;

      // Calculate total path distance in grid units
      let totalDist = 0;
      const segmentDists: number[] = [];
      for (let i = 0; i < path.length - 1; i++) {
        const dx = Math.abs(path[i + 1].x - path[i].x);
        const dy = Math.abs(path[i + 1].y - path[i].y);
        const dist = dx + dy;
        segmentDists.push(dist);
        totalDist += dist;
      }

      const duration = (2000 / speed) * Math.min(1.3, Math.max(0.65, totalDist));
      let startTime: number | null = null;
      let cancelled = false;
      let lastSegmentIndex = -1;

      animationCancelRef.current = () => {
        cancelled = true;
      };

      const targetResult = result;

      function step(timestamp: number) {
        if (cancelled) return;
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(1, elapsed / duration);

        const currentTargetDist = progress * totalDist;
        let accumulated = 0;
        let currentSeg = 0;

        while (currentSeg < segmentDists.length && accumulated + segmentDists[currentSeg] < currentTargetDist) {
          accumulated += segmentDists[currentSeg];
          currentSeg++;
        }

        if (currentSeg !== lastSegmentIndex) {
          lastSegmentIndex = currentSeg;
          // Sound tick on turns
          if (currentSeg > 0 && path[currentSeg]) {
            const prev = path[currentSeg - 1];
            const curr = path[currentSeg];
            if (prev.x !== curr.x) {
              soundManager.playTurn();
            } else {
              soundManager.playStep();
            }
          }
        }

        if (currentSeg < segmentDists.length) {
          const segProgress = (currentTargetDist - accumulated) / segmentDists[currentSeg];
          const p1 = path[currentSeg];
          const p2 = path[currentSeg + 1];
          const interpX = p1.x + (p2.x - p1.x) * segProgress;
          const interpY = p1.y + (p2.y - p1.y) * segProgress;
          setActivePoint({ x: interpX, y: interpY });
        } else {
          const last = path[path.length - 1];
          setActivePoint(last);
        }

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          // Arrived at destination!
          setActivePoint(null);
          setActiveParticipantId(null);
          setCompletedIds((prev) => {
            const nextSet = new Set([...prev, participantId]);
            completedIdsRef.current = nextSet;
            return nextSet;
          });
          soundManager.playArrival();

          // Check if this prize is a special designated prize!
          const isSpecial = targetResult.isSpecial && !triggeredSpecialsRef.current.has(participantId);
          if (isSpecial) {
            triggeredSpecialsRef.current.add(participantId);
            setTimeout(() => {
              onRevealSpecialWinner(targetResult);
            }, 350);
          }

          if (onComplete) {
            const pauseTime = isSpecial ? 2200 : 500;
            setTimeout(() => {
              if (isAutoPlayingRef.current) {
                onComplete();
              }
            }, pauseTime);
          }
        }
      }

      requestAnimationFrame(step);
    },
    [results, speed, onRevealSpecialWinner]
  );

  // Auto-sequence recursion step
  const runNextAutoStep = useCallback(() => {
    if (!isAutoPlayingRef.current) return;

    // Find next uncompleted participant in order
    const next = participants.find((p) => !completedIdsRef.current.has(p.id));
    if (next) {
      startTrace(next.id, () => {
        runNextAutoStep();
      });
    } else {
      isAutoPlayingRef.current = false;
      setIsAutoPlaying(false);
      setRevealedAll(true);
    }
  }, [participants, startTrace]);

  // Toggle or start sequential auto-trace
  const handleToggleAutoSequence = () => {
    if (isAutoPlaying) {
      // Pause
      isAutoPlayingRef.current = false;
      setIsAutoPlaying(false);
      if (animationCancelRef.current) {
        animationCancelRef.current();
        animationCancelRef.current = null;
      }
      setActiveParticipantId(null);
      setActivePoint(null);
    } else {
      // Start sequential animation
      isAutoPlayingRef.current = true;
      setIsAutoPlaying(true);
      runNextAutoStep();
    }
  };

  // Find next single uncompleted participant to trace manually
  const handleTraceNext = () => {
    if (isAutoPlaying) {
      isAutoPlayingRef.current = false;
      setIsAutoPlaying(false);
    }
    const next = participants.find((p) => !completedIds.has(p.id));
    if (next) {
      startTrace(next.id);
    }
  };

  // Instant skip to reveal all results (for users who want to skip the remaining animation)
  const handleSkipToInstant = () => {
    isAutoPlayingRef.current = false;
    setIsAutoPlaying(false);
    if (animationCancelRef.current) {
      animationCancelRef.current();
      animationCancelRef.current = null;
    }
    setActiveParticipantId(null);
    setActivePoint(null);
    setRevealedAll(true);
    const allIds = new Set(participants.map((p) => p.id));
    setCompletedIds(allIds);
    completedIdsRef.current = allIds;

    // If there is any special prize winner not yet celebrated, celebrate the first one
    const specialResult = results.find((r) => r.isSpecial && !triggeredSpecialsRef.current.has(r.participantId));
    if (specialResult) {
      triggeredSpecialsRef.current.add(specialResult.participantId);
      setTimeout(() => {
        onRevealSpecialWinner(specialResult);
      }, 300);
    }
  };

  const handleReset = () => {
    isAutoPlayingRef.current = false;
    setIsAutoPlaying(false);
    if (animationCancelRef.current) {
      animationCancelRef.current();
      animationCancelRef.current = null;
    }
    setActiveParticipantId(null);
    setActivePoint(null);
    setCompletedIds(new Set());
    completedIdsRef.current = new Set();
    setRevealedAll(false);
    triggeredSpecialsRef.current.clear();
    onReshuffleRungs();
  };

  const handleExportJpg = async () => {
    if (isSavingImage) return;
    setIsSavingImage(true);
    setImageSavedSuccess(false);

    const success = await exportResultsToJpg(results, '윤관의 랜덤 사다리~~ 게임 최종 결과');
    setIsSavingImage(false);
    if (success) {
      setImageSavedSuccess(true);
      setTimeout(() => setImageSavedSuccess(false), 3000);
    }
  };

  // Map endCol -> prize
  const completedResults = results.filter((r) => completedIds.has(r.participantId));
  const allCompleted = completedIds.size === participants.length;
  const currentRunningParticipant = participants.find((p) => p.id === activeParticipantId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 select-none">
      {/* Control Action Strip */}
      <div className="mb-4 p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center flex-wrap gap-2">
          {/* Main Requested Feature: 전체 결과 순차 애니메이션 추첨 */}
          <button
            onClick={handleToggleAutoSequence}
            disabled={allCompleted && !isAutoPlaying}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 active:scale-95 ${
              isAutoPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
                : 'bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-40 disabled:pointer-events-none'
            }`}
          >
            {isAutoPlaying ? (
              <>
                <span className="w-2 h-2 rounded-full bg-white animate-ping mr-0.5" />
                <span>순차 추첨 일시 정지</span>
              </>
            ) : (
              <>
                <FastForward className="w-3.5 h-3.5 fill-white text-white" />
                <span>전체 결과 순차 추첨</span>
              </>
            )}
          </button>

          {/* 한 명씩 개별 추첨 */}
          <button
            onClick={handleTraceNext}
            disabled={allCompleted || isAutoPlaying || activeParticipantId !== null}
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Play className="w-3.5 h-3.5 text-slate-700" />
            <span>다음 1명 추첨</span>
          </button>

          {/* 애니메이션 진행 중 즉시 스킵 버튼 */}
          {(isAutoPlaying || (activeParticipantId && !allCompleted)) && (
            <button
              onClick={handleSkipToInstant}
              className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-xl transition-all flex items-center gap-1 active:scale-95"
            >
              <span>즉시 전체 완료 (스킵)</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Blind Mode Toggle */}
          <button
            onClick={() => setIsBlind(!isBlind)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${
              isBlind
                ? 'bg-purple-100 border-purple-300 text-purple-900 font-bold'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {isBlind ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isBlind ? '블라인드 ON' : '블라인드 OFF'}</span>
          </button>

          {/* Speed Toggle: 1x, 1.5x, 2x */}
          <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200 text-xs">
            {([1, 1.5, 2] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => setSpeed(spd)}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  speed === spd
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Reshuffle */}
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>다시 섞기</span>
          </button>

          {allCompleted && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleExportJpg}
                disabled={isSavingImage}
                className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all flex items-center gap-1.5 shadow-xs active:scale-95 disabled:opacity-50"
              >
                {imageSavedSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    <span>JPG 저장 완료!</span>
                  </>
                ) : isSavingImage ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>저장 중...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-white" />
                    <span>결과 JPG 저장</span>
                  </>
                )}
              </button>

              <button
                onClick={onViewSummary}
                className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-amber-400 text-slate-900 hover:bg-amber-300 transition-all flex items-center gap-1.5 shadow-xs animate-bounce active:scale-95"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>결과표 보기</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sequential Animation Status Live Banner */}
      {isAutoPlaying && currentRunningParticipant && (
        <div className="mb-4 p-2.5 px-4 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border border-amber-300/80 rounded-2xl flex items-center justify-between text-xs animate-pulse">
          <div className="flex items-center gap-2">
            <span className="text-base">🎬</span>
            <span className="font-bold text-slate-900">
              순차 추첨 진행 중: [{currentRunningParticipant.name}] 님의 사다리를 타고 내려가는 중입니다...
            </span>
          </div>
          <div className="text-slate-600 font-mono font-bold">
            {completedIds.size + 1} / {participants.length}
          </div>
        </div>
      )}

      {/* Horizontal Scroll Hint for many participants */}
      {numCols >= 10 && (
        <div className="mb-2 text-right text-[11px] text-slate-400 font-medium">
          ↔ 좌우로 스크롤하여 {numCols}명의 사다리를 모두 확인할 수 있습니다
        </div>
      )}

      {/* ============================================================== */}
      {/* THE LADDER BOARD CONTAINER */}
      {/* ============================================================== */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm overflow-x-auto">
        <div style={{ minWidth: `${Math.max(760, numCols * 80)}px` }} className="relative mx-auto">
          {/* Top Row: Participants */}
          <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))` }}>
            {participants.map((p, idx) => {
              const isCompleted = completedIds.has(p.id);
              const isActive = activeParticipantId === p.id;
              const result = results.find((r) => r.participantId === p.id);

              return (
                <button
                  key={p.id}
                  onClick={() => !isActive && startTrace(p.id)}
                  title={`${p.name} 사다리 타기`}
                  className={`group relative flex flex-col items-center p-2 rounded-2xl border text-center transition-all cursor-pointer ${
                    isActive
                      ? 'ring-2 ring-indigo-500 scale-105 shadow-md bg-indigo-50/60 border-indigo-300'
                      : isCompleted
                      ? 'bg-slate-50 border-slate-200 opacity-90'
                      : 'hover:border-slate-400 hover:shadow-xs bg-white border-slate-200'
                  }`}
                >
                  {/* Number Badge */}
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-xs mb-1.5 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: p.color }}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>

                  <span className="text-xs font-bold text-slate-900 truncate w-full px-1">
                    {p.name}
                  </span>

                  {isCompleted && result && (
                    <span className="text-[10px] text-slate-500 truncate w-full mt-0.5 font-medium">
                      → {result.prizeName}
                    </span>
                  )}

                  {!isCompleted && !isActive && (
                    <span className="text-[10px] text-indigo-600 font-semibold mt-0.5 group-hover:underline">
                      클릭 추첨
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ========================================================== */}
          {/* SVG LADDER CANVAS */}
          {/* ========================================================== */}
          <div className="relative w-full h-[460px] my-1 bg-gradient-to-b from-slate-50/80 via-white to-slate-50/80 rounded-2xl border border-slate-200/90 overflow-hidden shadow-inner">
            {/* Blind Mode Curtain Overlay */}
            {isBlind && !revealedAll && (
              <div className="absolute inset-0 z-10 pointer-events-none bg-slate-900/10 backdrop-blur-md flex items-center justify-center">
                <div className="px-5 py-2.5 rounded-2xl bg-white/95 border border-slate-200 shadow-xl text-center">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 justify-center">
                    <EyeOff className="w-4 h-4 text-purple-600" />
                    <span>미스터리 블라인드 모드 작동 중</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    사다리 경로가 가려져 있습니다. 참여자를 클릭하여 결과를 확인하세요!
                  </p>
                </div>
              </div>
            )}

            <svg className="w-full h-full" preserveAspectRatio="none">
              <defs>
                {/* Glow filter for active moving path */}
                <filter id="activeGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Background Vertical Column Lines */}
              {Array.from({ length: numCols }).map((_, col) => {
                const xPercent = ((col + 0.5) / numCols) * 100;
                return (
                  <line
                    key={`v-col-${col}`}
                    x1={`${xPercent}%`}
                    y1="0%"
                    x2={`${xPercent}%`}
                    y2="100%"
                    stroke="#CBD5E1"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                );
              })}

              {/* Background Horizontal Rungs */}
              {rungs.map((rung) => {
                const x1Percent = ((rung.leftCol + 0.5) / numCols) * 100;
                const x2Percent = ((rung.rightCol + 0.5) / numCols) * 100;
                const yPercent = rung.yFraction * 100;

                return (
                  <line
                    key={rung.id}
                    x1={`${x1Percent}%`}
                    y1={`${yPercent}%`}
                    x2={`${x2Percent}%`}
                    y2={`${yPercent}%`}
                    stroke="#94A3B8"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                );
              })}

              {/* Completed Participant Paths (Permanent Highlight) */}
              {completedResults.map((res) => {
                const pathStr = res.path
                  .map((pt, i) => {
                    const xPercent = ((pt.x + 0.5) / numCols) * 100;
                    const yPercent = pt.y * 100;
                    return `${i === 0 ? 'M' : 'L'} ${xPercent}% ${yPercent}%`;
                  })
                  .join(' ');

                return (
                  <path
                    key={`path-${res.participantId}`}
                    d={pathStr}
                    fill="none"
                    stroke={res.participantColor}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeOpacity="0.8"
                  />
                );
              })}

              {/* Active Runner Path In-Progress */}
              {activeParticipantId && (
                (() => {
                  const activeRes = results.find((r) => r.participantId === activeParticipantId);
                  if (!activeRes) return null;

                  const fullPath = activeRes.path;
                  // Construct path up to activePoint
                  const pts: { x: number; y: number }[] = [];
                  if (activePoint) {
                    for (let i = 0; i < fullPath.length; i++) {
                      const p = fullPath[i];
                      const next = fullPath[i + 1];
                      pts.push(p);

                      if (next) {
                        // Check if activePoint is on this segment
                        const minX = Math.min(p.x, next.x);
                        const maxX = Math.max(p.x, next.x);
                        const minY = Math.min(p.y, next.y);
                        const maxY = Math.max(p.y, next.y);

                        if (
                          activePoint.x >= minX - 0.001 &&
                          activePoint.x <= maxX + 0.001 &&
                          activePoint.y >= minY - 0.001 &&
                          activePoint.y <= maxY + 0.001
                        ) {
                          pts.push(activePoint);
                          break;
                        }
                      }
                    }
                  }

                  const activePathStr = pts
                    .map((pt, i) => {
                      const xPercent = ((pt.x + 0.5) / numCols) * 100;
                      const yPercent = pt.y * 100;
                      return `${i === 0 ? 'M' : 'L'} ${xPercent}% ${yPercent}%`;
                    })
                    .join(' ');

                  return (
                    <path
                      d={activePathStr}
                      fill="none"
                      stroke={activeRes.participantColor}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="url(#activeGlow)"
                    />
                  );
                })()
              )}
            </svg>

            {/* Moving Head/Avatar Runner on Active Point */}
            {activeParticipantId && activePoint && (
              (() => {
                const activeParticipant = participants.find((p) => p.id === activeParticipantId);
                const xPercent = ((activePoint.x + 0.5) / numCols) * 100;
                const yPercent = activePoint.y * 100;

                return (
                  <div
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none transition-all duration-75 flex flex-col items-center"
                    style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
                  >
                    <div
                      className="w-7 h-7 rounded-full border-2 border-white shadow-lg flex items-center justify-center font-bold text-xs text-white animate-pulse"
                      style={{
                        backgroundColor: activeParticipant?.color || '#3B82F6',
                        boxShadow: `0 0 16px ${activeParticipant?.color || '#3B82F6'}`,
                      }}
                    >
                      {activeParticipant?.avatarChar || '★'}
                    </div>
                  </div>
                );
              })()
            )}
          </div>

          {/* Bottom Row: Prizes */}
          <div className="grid gap-2 mt-3" style={{ gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))` }}>
            {prizes.map((prize, idx) => {
              // Check if any participant has reached this column
              const winnerResult = results.find(
                (r) => r.endCol === idx && completedIds.has(r.participantId)
              );

              return (
                <div
                  key={prize.id}
                  title={prize.name}
                  className={`relative flex flex-col items-center p-2.5 rounded-2xl border text-center transition-all ${
                    prize.isSpecial
                      ? 'bg-gradient-to-b from-amber-50 to-orange-50 border-amber-300 ring-2 ring-amber-300/60 shadow-sm'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  {/* Special Prize Indicator Badge */}
                  {prize.isSpecial && (
                    <div className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[10px] font-black shadow-xs flex items-center gap-1">
                      <span>🎈</span>
                      <span>특별 경품</span>
                    </div>
                  )}

                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold mb-1 ${
                      prize.isSpecial
                        ? 'bg-amber-400 text-amber-950 font-black'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {idx + 1}
                  </div>

                  <span
                    className={`text-xs font-bold leading-tight truncate w-full px-1 ${
                      prize.isSpecial ? 'text-amber-900 font-extrabold' : 'text-slate-800'
                    }`}
                  >
                    {prize.name}
                  </span>

                  {/* Winner Display Badge */}
                  {winnerResult ? (
                    <div
                      className={`mt-2 w-full py-1 px-1.5 rounded-xl text-center text-xs font-bold border transition-all ${
                        prize.isSpecial
                          ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-xs'
                          : 'bg-slate-900 text-white border-slate-900'
                      }`}
                      style={{
                        borderColor: winnerResult.participantColor,
                      }}
                    >
                      <div className="text-[10px] opacity-80 font-normal">당첨자</div>
                      <div className="truncate font-black">{winnerResult.participantName}</div>
                    </div>
                  ) : (
                    <div className="mt-2 text-[10px] text-slate-400 font-medium py-1">
                      미추첨
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Helper Footer strip */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 px-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span>🎈 특별 지정 경품 (당첨 시 대형 축하 풍선 발동)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
            <span>일반 경품</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span>진행 상황: {completedIds.size} / {participants.length} 완료</span>
          {allCompleted && (
            <button
              onClick={onViewSummary}
              className="font-bold text-amber-600 hover:text-amber-700 underline underline-offset-2"
            >
              전체 결과표 바로가기 →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
