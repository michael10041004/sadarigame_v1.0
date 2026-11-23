/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Participant {
  id: string;
  name: string;
  color: string; // Hex color
  bgLight: string; // Tailwind background or CSS color
  border: string; // CSS border color
  textColor: string;
  avatarChar: string;
}

export interface Prize {
  id: string;
  name: string;
  isSpecial: boolean; // 특정 지정한 경품 (당첨 시 대형 풍선 연출 발동)
  icon?: string;
}

export interface LadderRung {
  id: string;
  leftCol: number; // 0-indexed column
  rightCol: number; // leftCol + 1
  yFraction: number; // 0.0 to 1.0 (relative vertical height)
}

export interface Point {
  x: number;
  y: number;
}

export interface ParticipantResult {
  participantId: string;
  participantName: string;
  participantColor: string;
  prizeId: string;
  prizeName: string;
  isSpecial: boolean;
  endCol: number;
  path: Point[];
}

export type GameScreen = 'SETUP' | 'LADDER' | 'SUMMARY';

export interface ParticipantGroup {
  id: string;
  name: string;
  members: string[];
  createdAt: number;
}
