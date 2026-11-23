/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useCallback } from 'react';
import { Participant, Prize, GameScreen, ParticipantResult } from './types/game';
import { generateLadderRungs, computeAllResults } from './utils/ladderGenerator';
import { soundManager } from './utils/audio';
import { TopBar } from './components/TopBar';
import { SetupView } from './components/SetupView';
import { LadderBoard } from './components/LadderBoard';
import { BalloonWinnerModal } from './components/BalloonWinnerModal';
import { SummaryModal } from './components/SummaryModal';
import { DEFAULT_NAMES, getPaletteForIndex } from './constants/gameConfig';

const INITIAL_PRIZES: Prize[] = [
  { id: 'prize-1', name: '1등: 백화점 상품권 10만원', isSpecial: true },
  { id: 'prize-2', name: '2등: 한우 선물세트', isSpecial: false },
  { id: 'prize-3', name: '3등: 치킨 기프티콘', isSpecial: false },
  { id: 'prize-4', name: '배달의민족 2만원권', isSpecial: false },
  { id: 'prize-5', name: '스타벅스 디저트 세트', isSpecial: false },
  { id: 'prize-6', name: '올리브영 1만원권', isSpecial: false },
  { id: 'prize-7', name: '영화 2인 관람권', isSpecial: false },
  { id: 'prize-8', name: '편의점 5천원권', isSpecial: false },
  { id: 'prize-9', name: '비타500 한 상자', isSpecial: false },
  { id: 'prize-10', name: '다음 기회에 (참가상)', isSpecial: false },
];

export default function App() {
  // 10 Initial Participants (can expand up to 20)
  const [participants, setParticipants] = useState<Participant[]>(() =>
    DEFAULT_NAMES.slice(0, 10).map((name, i) => {
      const pal = getPaletteForIndex(i);
      return {
        id: `p-${i + 1}`,
        name,
        color: pal.color,
        bgLight: pal.bgLight,
        border: pal.border,
        textColor: pal.text,
        avatarChar: name.charAt(0),
      };
    })
  );

  // 10 Prizes
  const [prizes, setPrizes] = useState<Prize[]>(INITIAL_PRIZES);

  // Current screen
  const [screen, setScreen] = useState<GameScreen>('SETUP');

  // Sound mute state
  const [isMuted, setIsMuted] = useState(false);

  // Reshuffle seed trigger
  const [ladderSeed, setLadderSeed] = useState(1);

  // Special Winner Balloon Modal state
  const [specialWinnerForBalloon, setSpecialWinnerForBalloon] = useState<ParticipantResult | null>(null);

  // Generate rungs whenever participant count or seed changes
  const rungs = useMemo(() => {
    // ladderSeed triggers re-generation
    void ladderSeed;
    return generateLadderRungs(participants.length, 'normal');
  }, [participants.length, ladderSeed]);

  // Compute results
  const results = useMemo(() => {
    return computeAllResults(participants, prizes, rungs);
  }, [participants, prizes, rungs]);

  const handleReshuffleRungs = useCallback(() => {
    setLadderSeed((s) => s + 1);
  }, []);

  const handleToggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const hasSpecialPrize = prizes.some((p) => p.isSpecial);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-amber-200">
      {/* Top Bar Navigation */}
      <TopBar
        currentScreen={screen}
        onNavigate={(newScreen) => setScreen(newScreen)}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        onResetOrShuffle={handleReshuffleRungs}
        hasSpecialPrize={hasSpecialPrize}
      />

      {/* Main Content Areas */}
      <main className="flex-1 pb-16">
        {screen === 'SETUP' && (
          <SetupView
            participants={participants}
            prizes={prizes}
            onUpdateParticipants={setParticipants}
            onUpdatePrizes={setPrizes}
            onStartGame={() => setScreen('LADDER')}
          />
        )}

        {screen === 'LADDER' && (
          <LadderBoard
            participants={participants}
            prizes={prizes}
            rungs={rungs}
            results={results}
            onReshuffleRungs={handleReshuffleRungs}
            onRevealSpecialWinner={(winner) => setSpecialWinnerForBalloon(winner)}
            onViewSummary={() => setScreen('SUMMARY')}
          />
        )}

        {screen === 'SUMMARY' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <SummaryModal
              results={results}
              onClose={() => setScreen('LADDER')}
              onPlayAgain={() => {
                handleReshuffleRungs();
                setScreen('LADDER');
              }}
              onGoToSetup={() => setScreen('SETUP')}
              onReplayBalloon={(result) => setSpecialWinnerForBalloon(result)}
            />
          </div>
        )}
      </main>

      {/* Giant Balloon Modal for Special Prize Winner (Celebration Centerpiece) */}
      <BalloonWinnerModal
        winner={specialWinnerForBalloon}
        onClose={() => setSpecialWinnerForBalloon(null)}
        onViewSummary={() => {
          setSpecialWinnerForBalloon(null);
          setScreen('SUMMARY');
        }}
      />
    </div>
  );
}
