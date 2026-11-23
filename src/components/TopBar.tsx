/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Volume2, VolumeX, Sparkles, RefreshCw, Trophy, Settings } from 'lucide-react';
import { GameScreen } from '../types/game';

interface TopBarProps {
  currentScreen: GameScreen;
  onNavigate: (screen: GameScreen) => void;
  isMuted: boolean;
  onToggleSound: () => void;
  onResetOrShuffle: () => void;
  hasSpecialPrize: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentScreen,
  onNavigate,
  isMuted,
  onToggleSound,
  onResetOrShuffle,
  hasSpecialPrize,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-rose-500/20">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <button
            onClick={() => onNavigate('SETUP')}
            className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 whitespace-nowrap hover:opacity-85 transition-opacity flex items-center gap-1.5"
          >
            <span>윤관의 랜덤 사다리~~ 게임</span>
            {hasSpecialPrize && (
              <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200/80">
                특별 경품 ON
              </span>
            )}
          </button>
        </div>

        {/* Zone 2: Clean single-line nav / actions */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => onNavigate('SETUP')}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              currentScreen === 'SETUP' ? 'text-slate-950 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>참여자 & 경품 설정</span>
          </button>

          <button
            onClick={() => onNavigate('LADDER')}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              currentScreen === 'LADDER' ? 'text-slate-950 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>사다리타기 보드</span>
          </button>

          <button
            onClick={() => onNavigate('SUMMARY')}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              currentScreen === 'SUMMARY' ? 'text-slate-950 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            <Trophy className="w-4 h-4 text-emerald-500" />
            <span>최종 결과 매핑</span>
          </button>

          <button
            onClick={onToggleSound}
            aria-label={isMuted ? '음향 켜기' : '음향 끄기'}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title={isMuted ? '음향 켜기' : '음향 끄기'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onToggleSound}
            aria-label={isMuted ? '음향 켜기' : '음향 끄기'}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>

          {currentScreen === 'SETUP' ? (
            <button
              onClick={() => onNavigate('LADDER')}
              className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm shadow-slate-900/10 whitespace-nowrap shrink-0 flex items-center gap-2 active:scale-95"
            >
              <span>사다리 시작</span>
              <span aria-hidden="true">→</span>
            </button>
          ) : (
            <button
              onClick={onResetOrShuffle}
              className="px-4 py-2 text-sm font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-all shadow-xs whitespace-nowrap shrink-0 flex items-center gap-1.5 active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
              <span>사다리 재배치</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
