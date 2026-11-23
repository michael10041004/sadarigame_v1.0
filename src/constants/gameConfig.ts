/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const MIN_PARTICIPANTS = 2;
export const MAX_PARTICIPANTS = 20;

export const QUICK_COUNT_OPTIONS = [4, 6, 8, 10, 12, 16, 20];

export const DEFAULT_NAMES: string[] = [
  '김민수', '이지은', '박서준', '정지우', '최예은',
  '강하준', '윤수빈', '임도현', '한유나', '송태민',
  '오세훈', '신다은', '정우성', '배수지', '안효섭',
  '김태리', '이도현', '박보영', '남주혁', '전여빈'
];

export interface PaletteColor {
  color: string;
  bgLight: string;
  border: string;
  text: string;
}

export const PALETTES: PaletteColor[] = [
  { color: '#8B5CF6', bgLight: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700' }, // 1. 보라
  { color: '#3B82F6', bgLight: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700' },       // 2. 파랑
  { color: '#10B981', bgLight: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700' }, // 3. 에메랄드
  { color: '#F59E0B', bgLight: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-800' },     // 4. 호박
  { color: '#F97316', bgLight: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700' },   // 5. 주황
  { color: '#EF4444', bgLight: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-700' },       // 6. 로즈
  { color: '#334155', bgLight: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-800' },    // 7. 슬레이트
  { color: '#14B8A6', bgLight: 'bg-teal-50', border: 'border-teal-300', text: 'text-teal-700' },       // 8. 틸
  { color: '#EC4899', bgLight: 'bg-pink-50', border: 'border-pink-300', text: 'text-pink-700' },       // 9. 핑크
  { color: '#6366F1', bgLight: 'bg-indigo-50', border: 'border-indigo-300', text: 'text-indigo-700' },   // 10. 인디고
  { color: '#06B6D4', bgLight: 'bg-cyan-50', border: 'border-cyan-300', text: 'text-cyan-700' },       // 11. 시안
  { color: '#84CC16', bgLight: 'bg-lime-50', border: 'border-lime-300', text: 'text-lime-700' },       // 12. 라임
  { color: '#7C3AED', bgLight: 'bg-violet-50', border: 'border-violet-300', text: 'text-violet-700' },   // 13. 바이올렛
  { color: '#D946EF', bgLight: 'bg-fuchsia-50', border: 'border-fuchsia-300', text: 'text-fuchsia-700' }, // 14. 푹샤
  { color: '#0284C7', bgLight: 'bg-sky-50', border: 'border-sky-300', text: 'text-sky-700' },           // 15. 스카이
  { color: '#DC2626', bgLight: 'bg-red-50', border: 'border-red-300', text: 'text-red-700' },           // 16. 레드
  { color: '#CA8A04', bgLight: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-800' },   // 17. 옐로우
  { color: '#16A34A', bgLight: 'bg-green-50', border: 'border-green-300', text: 'text-green-700' },     // 18. 그린
  { color: '#52525B', bgLight: 'bg-zinc-100', border: 'border-zinc-300', text: 'text-zinc-800' },       // 19. 징크
  { color: '#C2410C', bgLight: 'bg-orange-100', border: 'border-orange-400', text: 'text-orange-900' },  // 20. 러스트
];

export function getPaletteForIndex(index: number): PaletteColor {
  return PALETTES[index % PALETTES.length];
}
