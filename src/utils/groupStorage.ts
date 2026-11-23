/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ParticipantGroup } from '../types/game';
import { MAX_PARTICIPANTS, MIN_PARTICIPANTS } from '../constants/gameConfig';

const STORAGE_KEY = 'ladder_saved_participant_groups_v1';

export const DEFAULT_GROUPS: ParticipantGroup[] = [
  {
    id: 'group-default-1',
    name: '🏢 우리 팀 (10명)',
    members: ['김민수', '이지은', '박서준', '정지우', '최예은', '강하준', '윤수빈', '임도현', '한유나', '송태민'],
    createdAt: Date.now() - 120000,
  },
  {
    id: 'group-default-2',
    name: '💻 개발본부 스쿼드 (16명)',
    members: [
      '팀장 철수', '프론트 영희', '백엔드 민호', '인프라 지수',
      '데이터 준혁', 'QA 수진', '모바일 태양', 'UI/UX 아름',
      '프로덕트 진우', '서버 성민', '데브옵스 채원', '보안 기훈',
      'ML엔지니어 소희', '클라우드 동건', '플랫폼 혜진', '테스터 도균'
    ],
    createdAt: Date.now() - 90000,
  },
  {
    id: 'group-default-3',
    name: '☕ 소모임 / 스터디 (6명)',
    members: ['서연', '민재', '하린', '도윤', '시우', '채원'],
    createdAt: Date.now() - 60000,
  },
];

export function getSavedGroups(): ParticipantGroup[] {
  if (typeof window === 'undefined') return DEFAULT_GROUPS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_GROUPS));
      return DEFAULT_GROUPS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_GROUPS;
  } catch {
    return DEFAULT_GROUPS;
  }
}

export function saveNewGroup(name: string, members: string[]): ParticipantGroup[] {
  const current = getSavedGroups();
  const trimmedName = name.trim() || `그룹 ${current.length + 1}`;
  const validMembers = members
    .map((m) => m.trim())
    .filter(Boolean)
    .slice(0, MAX_PARTICIPANTS);

  const fallbackMembers = Array.from({ length: Math.max(MIN_PARTICIPANTS, validMembers.length) }, (_, i) => `참여자 ${i + 1}`);

  const newGroup: ParticipantGroup = {
    id: `group-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: trimmedName,
    members: validMembers.length >= MIN_PARTICIPANTS ? validMembers : fallbackMembers,
    createdAt: Date.now(),
  };

  const updated = [newGroup, ...current];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

export function deleteSavedGroup(groupId: string): ParticipantGroup[] {
  const current = getSavedGroups();
  const updated = current.filter((g) => g.id !== groupId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

export function updateSavedGroup(groupId: string, name: string, members: string[]): ParticipantGroup[] {
  const current = getSavedGroups();
  const validMembers = members
    .map((m) => m.trim())
    .filter(Boolean)
    .slice(0, MAX_PARTICIPANTS);

  const updated = current.map((g) => {
    if (g.id === groupId) {
      return {
        ...g,
        name: name.trim() || g.name,
        members: validMembers.length >= MIN_PARTICIPANTS ? validMembers : g.members,
      };
    }
    return g;
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

