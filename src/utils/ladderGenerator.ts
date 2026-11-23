/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LadderRung, Participant, ParticipantResult, Prize, Point } from '../types/game';

/**
 * Generates horizontal rungs for N columns.
 * Ensures no two adjacent columns have rungs at the exact same or very close heights.
 */
export function generateLadderRungs(
  numCols: number,
  density: 'low' | 'normal' | 'high' = 'normal'
): LadderRung[] {
  const rungs: LadderRung[] = [];
  // For higher participant counts (up to 20), refine spacing so rungs distribute evenly without grid congestion
  const minSpacing = numCols > 12 ? 0.022 : 0.035;

  const rungsPerGap = density === 'low' ? 3 : density === 'high' ? 6 : 4;
  const numGaps = numCols - 1;
  const totalRungs = numGaps * rungsPerGap;

  // Discrete vertical slots with slight jitter to guarantee clean spacing
  const totalSlots = Math.max(totalRungs * 2, 40);
  const occupiedHeights: { col: number; y: number }[] = [];

  let attempts = 0;
  const maxAttempts = Math.max(2500, numCols * 200);

  for (let gap = 0; gap < numGaps; gap++) {
    let placedForGap = 0;
    while (placedForGap < rungsPerGap && attempts < maxAttempts) {
      attempts++;
      // Choose random slot between 0.08 and 0.92
      const slotIndex = Math.floor(Math.random() * (totalSlots - 2)) + 1;
      const y = 0.08 + (slotIndex / totalSlots) * 0.84 + (Math.random() - 0.5) * 0.015;

      // Check conflict with adjacent columns
      const conflict = occupiedHeights.some((item) => {
        const isSameGap = item.col === gap;
        const isNeighbor = Math.abs(item.col - gap) <= 1;
        const dist = Math.abs(item.y - y);
        if (isSameGap && dist < minSpacing * 1.5) return true;
        if (isNeighbor && dist < minSpacing) return true;
        return false;
      });

      if (!conflict) {
        occupiedHeights.push({ col: gap, y });
        rungs.push({
          id: `rung-${gap}-${placedForGap}-${Math.random().toString(36).slice(2, 6)}`,
          leftCol: gap,
          rightCol: gap + 1,
          yFraction: y,
        });
        placedForGap++;
      }
    }
  }

  // Sort rungs vertically by yFraction
  rungs.sort((a, b) => a.yFraction - b.yFraction);
  return rungs;
}

/**
 * Traces a single participant's path from top to bottom.
 * Returns the sequence of points (col, y) and the final landing column.
 */
export function traceParticipantPath(
  startCol: number,
  rungs: LadderRung[]
): { path: Point[]; endCol: number } {
  let currentCol = startCol;
  let currentY = 0; // 0 is top
  const path: Point[] = [{ x: currentCol, y: 0 }];

  // Sorted list of rungs
  const sortedRungs = [...rungs].sort((a, b) => a.yFraction - b.yFraction);

  for (const rung of sortedRungs) {
    if (rung.yFraction > currentY) {
      if (rung.leftCol === currentCol) {
        // Move down to rung level
        path.push({ x: currentCol, y: rung.yFraction });
        // Move right to next column
        currentCol = rung.rightCol;
        path.push({ x: currentCol, y: rung.yFraction });
        currentY = rung.yFraction;
      } else if (rung.rightCol === currentCol) {
        // Move down to rung level
        path.push({ x: currentCol, y: rung.yFraction });
        // Move left to previous column
        currentCol = rung.leftCol;
        path.push({ x: currentCol, y: rung.yFraction });
        currentY = rung.yFraction;
      }
    }
  }

  // Reach the bottom (y = 1.0)
  path.push({ x: currentCol, y: 1.0 });

  return { path, endCol: currentCol };
}

/**
 * Computes all participant paths and maps them to prizes.
 */
export function computeAllResults(
  participants: Participant[],
  prizes: Prize[],
  rungs: LadderRung[]
): ParticipantResult[] {
  return participants.map((participant, index) => {
    const { path, endCol } = traceParticipantPath(index, rungs);
    const prize = prizes[endCol] || {
      id: `fallback-${endCol}`,
      name: `경품 ${endCol + 1}`,
      isSpecial: false,
    };

    return {
      participantId: participant.id,
      participantName: participant.name,
      participantColor: participant.color,
      prizeId: prize.id,
      prizeName: prize.name,
      isSpecial: prize.isSpecial,
      endCol,
      path,
    };
  });
}
