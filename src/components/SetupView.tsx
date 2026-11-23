/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Trophy,
  Shuffle,
  RotateCcw,
  Plus,
  Trash2,
  Gift,
  Users,
  BookmarkPlus,
  Check,
  X,
  Settings2,
  Edit3,
  UserPlus,
  UserMinus,
  FileText,
  List
} from 'lucide-react';
import { Participant, Prize, ParticipantGroup } from '../types/game';
import {
  MIN_PARTICIPANTS,
  MAX_PARTICIPANTS,
  QUICK_COUNT_OPTIONS,
  DEFAULT_NAMES,
  PALETTES,
  getPaletteForIndex
} from '../constants/gameConfig';
import {
  getSavedGroups,
  saveNewGroup,
  deleteSavedGroup,
  updateSavedGroup,
  DEFAULT_GROUPS
} from '../utils/groupStorage';

interface SetupViewProps {
  participants: Participant[];
  prizes: Prize[];
  onUpdateParticipants: (participants: Participant[]) => void;
  onUpdatePrizes: (prizes: Prize[]) => void;
  onStartGame: () => void;
}

const PRESET_THEMES = [
  {
    name: '🎉 회식 & 모임 선물 (20종)',
    prizes: [
      { name: '1등: 백화점 상품권 10만원', isSpecial: true },
      { name: '2등: 한우 선물세트', isSpecial: false },
      { name: '3등: 치킨 기프티콘', isSpecial: false },
      { name: '배달의민족 3만원권', isSpecial: false },
      { name: '배달의민족 2만원권', isSpecial: false },
      { name: '스타벅스 디저트 세트', isSpecial: false },
      { name: '올리브영 2만원권', isSpecial: false },
      { name: '올리브영 1만원권', isSpecial: false },
      { name: '영화 2인 관람권', isSpecial: false },
      { name: '편의점 1만원권', isSpecial: false },
      { name: '편의점 5천원권', isSpecial: false },
      { name: '비타500 한 상자', isSpecial: false },
      { name: '홍삼 스틱 1박스', isSpecial: false },
      { name: '베스킨라빈스 파인트', isSpecial: false },
      { name: '맘스터치 싸이버거 세트', isSpecial: false },
      { name: '이디야 커피 쿠폰', isSpecial: false },
      { name: '따뜻한 유자차 쿠폰', isSpecial: false },
      { name: '에너지 드링크 2캔', isSpecial: false },
      { name: '초콜릿 간식 꾸러미', isSpecial: false },
      { name: '다음 기회에 (참가상)', isSpecial: false },
    ],
  },
  {
    name: '🏆 1등~20등 순위형',
    prizes: [
      { name: '1등 (★대박 대상)', isSpecial: true },
      { name: '2등 (최우수상)', isSpecial: false },
      { name: '3등 (우수상)', isSpecial: false },
      { name: '4등 (장려상)', isSpecial: false },
      { name: '5등 (특별상)', isSpecial: false },
      { name: '6등 (인기상)', isSpecial: false },
      { name: '7등', isSpecial: false },
      { name: '8등', isSpecial: false },
      { name: '9등', isSpecial: false },
      { name: '10등 (행운상)', isSpecial: false },
      { name: '11등', isSpecial: false },
      { name: '12등', isSpecial: false },
      { name: '13등', isSpecial: false },
      { name: '14등', isSpecial: false },
      { name: '15등', isSpecial: false },
      { name: '16등', isSpecial: false },
      { name: '17등', isSpecial: false },
      { name: '18등', isSpecial: false },
      { name: '19등 (아차상)', isSpecial: false },
      { name: '20등 (파이팅상)', isSpecial: false },
    ],
  },
  {
    name: '☕ 카페 & 디저트 (20종)',
    prizes: [
      { name: '스타벅스 텀블러 세트', isSpecial: true },
      { name: '투썸플레이스 홀케이크', isSpecial: false },
      { name: '배스킨라빈스 쿼터', isSpecial: false },
      { name: '스타벅스 아메리카노 2잔', isSpecial: false },
      { name: '투썸 조각케이크 세트', isSpecial: false },
      { name: '공차 밀크티 L', isSpecial: false },
      { name: '설빙 인절미빙수', isSpecial: false },
      { name: '이디야 바닐라라떼', isSpecial: false },
      { name: '컴포즈 커피 쿠폰', isSpecial: false },
      { name: '메가커피 아메리카노', isSpecial: false },
      { name: '던킨도너츠 6개팩', isSpecial: false },
      { name: '크리스피크림 도넛 1박스', isSpecial: false },
      { name: '맥도날드 소프트콘 5개', isSpecial: false },
      { name: '서브웨이 쿠키 3개 세트', isSpecial: false },
      { name: '파리바게뜨 롤케이크', isSpecial: false },
      { name: '뚜레쥬르 식빵 세트', isSpecial: false },
      { name: '달콤한 딸기 마카롱 2개', isSpecial: false },
      { name: '편의점 바나나우유', isSpecial: false },
      { name: '생과일주스 1잔', isSpecial: false },
      { name: '막대사탕 1개 (기분UP)', isSpecial: false },
    ],
  },
  {
    name: '🎯 복불복 & 꽝 믹스',
    prizes: [
      { name: '★ 황금 열쇠 (초대박)', isSpecial: true },
      { name: '치킨 콤보 세트', isSpecial: false },
      { name: '커피 기프티콘', isSpecial: false },
      { name: '꽝 (다음 기회에)', isSpecial: false },
      { name: '꽝 (자리 정리 당번)', isSpecial: false },
      { name: '편의점 1만원권', isSpecial: false },
      { name: '꽝 (물 떠오기 당번)', isSpecial: false },
      { name: '꽝 (모두에게 하트 발사)', isSpecial: false },
      { name: '간식 꾸러미', isSpecial: false },
      { name: '꽝 (박수 갈채 받기)', isSpecial: false },
      { name: '꽝 (커피 심부름 당번)', isSpecial: false },
      { name: '배달의민족 1만원권', isSpecial: false },
      { name: '꽝 (30초 동안 칭찬 듣기)', isSpecial: false },
      { name: '꽝 (노래 한 소절 부르기)', isSpecial: false },
      { name: '문화상품권 5천원', isSpecial: false },
      { name: '꽝 (쓰레기통 비우기)', isSpecial: false },
      { name: '아이스크림 1개', isSpecial: false },
      { name: '꽝 (하이파이브 릴레이)', isSpecial: false },
      { name: '꽝 (다음 게임 진행자)', isSpecial: false },
      { name: '꽝 (따뜻한 응원 한마디)', isSpecial: false },
    ],
  },
];

export const SetupView: React.FC<SetupViewProps> = ({
  participants,
  prizes,
  onUpdateParticipants,
  onUpdatePrizes,
  onStartGame,
}) => {
  const count = participants.length;
  const [savedGroups, setSavedGroups] = useState<ParticipantGroup[]>(() => getSavedGroups());
  const [groupModalMode, setGroupModalMode] = useState<'NONE' | 'SAVE' | 'MANAGE'>('NONE');
  const [newGroupName, setNewGroupName] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  // Group Editing State
  const [editingGroup, setEditingGroup] = useState<ParticipantGroup | null>(null);
  const [editName, setEditName] = useState('');
  const [editMembers, setEditMembers] = useState<string[]>([]);
  const [addMemberInput, setAddMemberInput] = useState('');
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);
  const [bulkEditText, setBulkEditText] = useState('');

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast((curr) => (curr === message ? null : curr));
    }, 2800);
  };

  const handleLoadGroup = (group: ParticipantGroup) => {
    const members = group.members.slice(0, MAX_PARTICIPANTS);
    if (members.length < MIN_PARTICIPANTS) return;

    const newParticipants: Participant[] = members.map((name, i) => {
      const pal = getPaletteForIndex(i);
      const trimmed = name.trim() || `참여자 ${i + 1}`;
      return {
        id: `p-${i + 1}`,
        name: trimmed,
        color: pal.color,
        bgLight: pal.bgLight,
        border: pal.border,
        textColor: pal.text,
        avatarChar: trimmed.charAt(0) || `${i + 1}`,
      };
    });

    // Adjust prizes to match new participant count
    let newPrizes = [...prizes];
    if (newParticipants.length > prizes.length) {
      for (let i = prizes.length; i < newParticipants.length; i++) {
        newPrizes.push({
          id: `prize-${i + 1}`,
          name: `경품 ${i + 1}`,
          isSpecial: false,
        });
      }
    } else if (newParticipants.length < prizes.length) {
      newPrizes = newPrizes.slice(0, newParticipants.length);
    }

    onUpdateParticipants(newParticipants);
    onUpdatePrizes(newPrizes);
    setGroupModalMode('NONE');
    setEditingGroup(null);
    showToast(`👥 '${group.name}' 그룹 (${members.length}명)을 성공적으로 불러왔습니다!`);
  };

  const handleSaveGroupSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const groupName = newGroupName.trim() || `우리 모임 (${participants.length}명)`;
    const memberNames = participants.map((p) => p.name.trim() || '참여자');
    const updated = saveNewGroup(groupName, memberNames);
    setSavedGroups(updated);
    setNewGroupName('');
    setGroupModalMode('NONE');
    showToast(`💾 '${groupName}' 그룹이 성공적으로 저장되었습니다!`);
  };

  const handleDeleteGroup = (groupId: string, groupName: string) => {
    const updated = deleteSavedGroup(groupId);
    setSavedGroups(updated);
    if (editingGroup?.id === groupId) {
      setEditingGroup(null);
    }
    showToast(`🗑️ '${groupName}' 그룹이 삭제되었습니다.`);
  };

  const handleResetToDefaultGroups = () => {
    try {
      localStorage.setItem('ladder_saved_participant_groups_v1', JSON.stringify(DEFAULT_GROUPS));
      setSavedGroups(DEFAULT_GROUPS);
      showToast('기본 추천 그룹 목록으로 복원되었습니다.');
    } catch {}
  };

  // Open Edit Modal for a specific group
  const handleOpenEditGroup = (group: ParticipantGroup) => {
    setEditingGroup(group);
    setEditName(group.name);
    setEditMembers([...group.members]);
    setAddMemberInput('');
    setIsBulkEditMode(false);
    setBulkEditText(group.members.join('\n'));
  };

  // Open Create New Blank Group
  const handleOpenCreateNewGroup = () => {
    const blankGroup: ParticipantGroup = {
      id: `new-${Date.now()}`,
      name: `새 그룹 (${DEFAULT_NAMES.slice(0, 6).length}명)`,
      members: DEFAULT_NAMES.slice(0, 6),
      createdAt: Date.now(),
    };
    handleOpenEditGroup(blankGroup);
  };

  // Edit individual member name in edit modal
  const handleEditMemberName = (index: number, newName: string) => {
    setEditMembers((prev) => {
      const copy = [...prev];
      copy[index] = newName;
      return copy;
    });
  };

  // Remove member from group in edit modal
  const handleRemoveMemberFromEdit = (index: number) => {
    if (editMembers.length <= MIN_PARTICIPANTS) {
      showToast(`참여자는 최소 ${MIN_PARTICIPANTS}명 이상이어야 합니다.`);
      return;
    }
    setEditMembers((prev) => prev.filter((_, i) => i !== index));
  };

  // Add 1 generic participant in edit modal
  const handleAddOneMemberToEdit = () => {
    if (editMembers.length >= MAX_PARTICIPANTS) {
      showToast(`참여자는 최대 ${MAX_PARTICIPANTS}명까지만 가능합니다.`);
      return;
    }
    const nextIdx = editMembers.length;
    const defaultName = DEFAULT_NAMES[nextIdx] || `참여자 ${nextIdx + 1}`;
    setEditMembers((prev) => [...prev, defaultName]);
  };

  // Remove 1 member from end in edit modal
  const handleRemoveOneMemberFromEdit = () => {
    if (editMembers.length <= MIN_PARTICIPANTS) {
      showToast(`참여자는 최소 ${MIN_PARTICIPANTS}명 이상이어야 합니다.`);
      return;
    }
    setEditMembers((prev) => prev.slice(0, prev.length - 1));
  };

  // Add named participant via input in edit modal
  const handleAddCustomMemberToEdit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = addMemberInput.trim();
    if (!trimmed) return;
    if (editMembers.length >= MAX_PARTICIPANTS) {
      showToast(`최대 ${MAX_PARTICIPANTS}명까지만 추가할 수 있습니다.`);
      return;
    }
    setEditMembers((prev) => [...prev, trimmed]);
    setAddMemberInput('');
  };

  // Toggle Bulk edit mode
  const handleToggleBulkMode = () => {
    if (!isBulkEditMode) {
      setBulkEditText(editMembers.join('\n'));
      setIsBulkEditMode(true);
    } else {
      // Apply bulk edit
      const parsed = bulkEditText
        .split(/[\n,]+/)
        .map((m) => m.trim())
        .filter(Boolean)
        .slice(0, MAX_PARTICIPANTS);

      if (parsed.length < MIN_PARTICIPANTS) {
        showToast(`최소 ${MIN_PARTICIPANTS}명 이상의 이름을 입력해주세요.`);
        return;
      }
      setEditMembers(parsed);
      setIsBulkEditMode(false);
      showToast(`${parsed.length}명의 참여자 목록이 반영되었습니다.`);
    }
  };

  // Save changes to group
  const handleSaveGroupChanges = (applyToGame: boolean = false) => {
    if (!editingGroup) return;

    let finalMembers = isBulkEditMode
      ? bulkEditText
          .split(/[\n,]+/)
          .map((m) => m.trim())
          .filter(Boolean)
      : editMembers.map((m) => m.trim()).filter(Boolean);

    if (finalMembers.length < MIN_PARTICIPANTS) {
      showToast(`참여자는 최소 ${MIN_PARTICIPANTS}명 이상이어야 합니다.`);
      return;
    }

    if (finalMembers.length > MAX_PARTICIPANTS) {
      finalMembers = finalMembers.slice(0, MAX_PARTICIPANTS);
    }

    const finalName = editName.trim() || `그룹 (${finalMembers.length}명)`;

    let updatedList: ParticipantGroup[];
    let targetGroup: ParticipantGroup;

    if (editingGroup.id.startsWith('new-')) {
      // It's a newly created group
      updatedList = saveNewGroup(finalName, finalMembers);
      targetGroup = updatedList[0];
    } else {
      updatedList = updateSavedGroup(editingGroup.id, finalName, finalMembers);
      targetGroup = {
        ...editingGroup,
        name: finalName,
        members: finalMembers,
      };
    }

    setSavedGroups(updatedList);
    setEditingGroup(null);

    if (applyToGame) {
      handleLoadGroup(targetGroup);
      showToast(`✨ '${finalName}' (${finalMembers.length}명) 저장 및 게임에 적용 완료!`);
    } else {
      showToast(`💾 '${finalName}' (${finalMembers.length}명) 그룹이 수정되었습니다.`);
    }
  };

  const handleParticipantNameChange = (index: number, newName: string) => {
    const updated = [...participants];
    updated[index] = {
      ...updated[index],
      name: newName,
      avatarChar: newName.trim().charAt(0) || `${index + 1}`,
    };
    onUpdateParticipants(updated);
  };

  const handlePrizeNameChange = (index: number, newName: string) => {
    const updated = [...prizes];
    updated[index] = {
      ...updated[index],
      name: newName,
    };
    onUpdatePrizes(updated);
  };

  const handleToggleSpecialPrize = (index: number) => {
    const updated = [...prizes];
    updated[index] = {
      ...updated[index],
      isSpecial: !updated[index].isSpecial,
    };
    onUpdatePrizes(updated);
  };

  const handleSetCount = (newCount: number) => {
    if (newCount < MIN_PARTICIPANTS || newCount > MAX_PARTICIPANTS) return;

    let newParticipants = [...participants];
    let newPrizes = [...prizes];

    if (newCount > participants.length) {
      for (let i = participants.length; i < newCount; i++) {
        const pal = getPaletteForIndex(i);
        const defaultName = DEFAULT_NAMES[i] || `참여자 ${i + 1}`;
        newParticipants.push({
          id: `p-${i + 1}`,
          name: defaultName,
          color: pal.color,
          bgLight: pal.bgLight,
          border: pal.border,
          textColor: pal.text,
          avatarChar: defaultName.charAt(0),
        });
        newPrizes.push({
          id: `prize-${i + 1}`,
          name: `경품 ${i + 1}`,
          isSpecial: false,
        });
      }
    } else if (newCount < participants.length) {
      newParticipants = newParticipants.slice(0, newCount);
      newPrizes = newPrizes.slice(0, newCount);
    }

    onUpdateParticipants(newParticipants);
    onUpdatePrizes(newPrizes);
  };

  const handleApplyPreset = (presetIndex: number) => {
    const preset = PRESET_THEMES[presetIndex];
    if (!preset) return;

    const newPrizes: Prize[] = participants.map((_, i) => {
      const template = preset.prizes[i % preset.prizes.length];
      return {
        id: `prize-${i + 1}`,
        name: template.name,
        isSpecial: template.isSpecial,
      };
    });
    onUpdatePrizes(newPrizes);
    showToast(`🎁 '${preset.name}' 경품 프리셋이 적용되었습니다.`);
  };

  const handleShufflePrizes = () => {
    const shuffled = [...prizes];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    onUpdatePrizes(shuffled);
    showToast('🔀 경품 순서가 무작위로 섞였습니다.');
  };

  const handleResetNames = () => {
    const updated = participants.map((p, i) => {
      const defaultName = DEFAULT_NAMES[i] || `참여자 ${i + 1}`;
      return {
        ...p,
        name: defaultName,
        avatarChar: defaultName.charAt(0),
      };
    });
    onUpdateParticipants(updated);
    showToast('기본 참여자 이름으로 초기화되었습니다.');
  };

  const specialPrizesCount = prizes.filter((p) => p.isSpecial).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero Intro */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>공정하고 재미있는 실시간 사다리 경품 추첨 (최대 20명 지원)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          윤관의 랜덤 사다리~~ 게임
        </h1>
        <p className="mt-2.5 text-slate-600 text-base leading-relaxed text-balance">
          최소 {MIN_PARTICIPANTS}명부터 <strong>최대 {MAX_PARTICIPANTS}명</strong>까지 참여자와 경품을 매핑합니다. 특별 경품에 당첨되면 해당 참여자의 이름이 거대한 축하 풍선으로 떠오릅니다!
        </p>

        {/* Count Adjustment Bar */}
        <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-1.5 sm:p-2 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500 pl-2">참여자 인원수</span>
          <div className="flex items-center flex-wrap gap-1">
            {QUICK_COUNT_OPTIONS.map((num) => (
              <button
                key={num}
                onClick={() => handleSetCount(num)}
                className={`px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  count === num
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {num}명
              </button>
            ))}
          </div>
          <div className="flex items-center border-l border-slate-200 pl-2 pr-1 gap-1">
            <button
              onClick={() => handleSetCount(count - 1)}
              disabled={count <= MIN_PARTICIPANTS}
              aria-label="1명 감소"
              className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <span className="text-sm font-extrabold text-slate-900 w-8 text-center tabular-nums">
              {count}명
            </span>
            <button
              onClick={() => handleSetCount(count + 1)}
              disabled={count >= MAX_PARTICIPANTS}
              aria-label="1명 추가"
              className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* PARTICIPANT GROUPS BAR (새 기능: 참여자 수 증감 및 인라인 수정 지원) */}
      {/* ============================================================== */}
      <div className="mb-6 p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2 flex-wrap">
            <Users className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">자주 사용하는 참여자 그룹</h2>
            <span className="text-xs text-slate-500">
              그룹을 클릭하면 게임에 바로 불러오고, <strong>수정 버튼</strong>으로 인원수를 늘리거나 줄일 수 있습니다
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => {
                setNewGroupName(`우리 모임 (${participants.length}명)`);
                setGroupModalMode('SAVE');
              }}
              className="text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 active:scale-95"
            >
              <BookmarkPlus className="w-3.5 h-3.5 text-indigo-600" />
              <span>현재 명단 그룹으로 저장</span>
            </button>

            <button
              onClick={handleOpenCreateNewGroup}
              className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>새 그룹 생성</span>
            </button>

            <button
              onClick={() => setGroupModalMode('MANAGE')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 active:scale-95"
            >
              <Settings2 className="w-3.5 h-3.5 text-slate-500" />
              <span>그룹 관리</span>
            </button>
          </div>
        </div>

        {/* Saved Groups Quick Cards with Edit and Load Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {savedGroups.map((group) => (
            <div
              key={group.id}
              className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-indigo-50/30 hover:border-indigo-300 transition-all flex flex-col justify-between group shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                    {group.name}
                  </span>
                  <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 border border-indigo-200 shrink-0 ml-1.5">
                    {group.members.length}명
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 line-clamp-1 mb-3">
                  {group.members.slice(0, 5).join(', ')}
                  {group.members.length > 5 ? ` 외 ${group.members.length - 5}명` : ''}
                </div>
              </div>

              {/* Action Buttons: Load & Edit Headcount/Names */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200/80">
                <button
                  type="button"
                  onClick={() => handleLoadGroup(group)}
                  className="flex-1 py-1.5 px-2 text-xs font-bold text-indigo-700 bg-white hover:bg-indigo-600 hover:text-white border border-indigo-200 rounded-xl transition-all active:scale-98 text-center shadow-2xs"
                >
                  게임에 불러오기
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEditGroup(group)}
                  title="참여자 수 늘리기/줄이기 및 이름 수정"
                  className="py-1.5 px-2.5 text-xs font-semibold text-slate-700 hover:text-indigo-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all flex items-center gap-1 active:scale-98"
                >
                  <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>수정</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Presets Bar */}
      <div className="mb-8 p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-rose-500" />
            <h2 className="text-sm font-bold text-slate-900">추천 경품 프리셋</h2>
            <span className="text-xs text-slate-500">클릭 한 번으로 최대 20개의 경품명을 자동 입력합니다</span>
          </div>
          <button
            onClick={handleShufflePrizes}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5 text-slate-500" />
            <span>경품 순서 섞기</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESET_THEMES.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(idx)}
              className="px-3 py-2.5 text-left rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all text-xs font-semibold text-slate-800 flex items-center justify-between group active:scale-98"
            >
              <span className="truncate">{preset.name}</span>
              <span className="text-slate-400 group-hover:text-amber-600 font-bold ml-1">적용</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Split: Participants (Left) vs Prizes (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-10">
        {/* Column 1: Participants List */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  게임 참여자 ({count}명)
                </h2>
                <p className="text-xs text-slate-500">참여자 이름을 직접 수정할 수 있습니다 (최대 20명)</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setNewGroupName(`우리 모임 (${participants.length}명)`);
                  setGroupModalMode('SAVE');
                }}
                title="현재 참여자 명단을 새 그룹으로 저장"
                className="text-xs font-medium text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors border border-indigo-200/60"
              >
                <BookmarkPlus className="w-3.5 h-3.5 text-indigo-600" />
                <span>그룹 저장</span>
              </button>
              <button
                onClick={handleResetNames}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>기본 이름</span>
              </button>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {participants.map((participant, index) => (
              <div
                key={participant.id}
                className="flex items-center gap-3 p-2 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/60 transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs"
                  style={{ backgroundColor: participant.color }}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={participant.name}
                    onChange={(e) => handleParticipantNameChange(index, e.target.value)}
                    placeholder={`참여자 ${index + 1}`}
                    maxLength={14}
                    className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 outline-none transition-all"
                  />
                </div>
                <div className="text-xs text-slate-400 font-mono tabular-nums shrink-0 pr-2">
                  #{index + 1} 라인
                </div>
              </div>
            ))}
          </div>

          {/* Quick Add/Remove Participant at Bottom of List */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>참여자 수: {count}명 (최대 {MAX_PARTICIPANTS}명)</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleSetCount(count - 1)}
                disabled={count <= MIN_PARTICIPANTS}
                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold disabled:opacity-40"
              >
                - 1명 빼기
              </button>
              <button
                onClick={() => handleSetCount(count + 1)}
                disabled={count >= MAX_PARTICIPANTS}
                className="px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold disabled:opacity-40"
              >
                + 1명 추가
              </button>
            </div>
          </div>
        </div>

        {/* Column 2: Prizes List */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  경품 명단 ({count}개)
                </h2>
                <p className="text-xs text-slate-500">
                  <span className="text-amber-600 font-semibold">🎈 특별 지정</span> 버튼을 누르면 당첨 시 대형 풍선 축하가 뜹니다
                </p>
              </div>
            </div>
            {specialPrizesCount > 0 && (
              <div className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                특별 경품 {specialPrizesCount}개
              </div>
            )}
          </div>

          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {prizes.map((prize, index) => (
              <div
                key={prize.id}
                className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all ${
                  prize.isSpecial
                    ? 'border-amber-300 bg-amber-50/50 shadow-xs'
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50/60'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    prize.isSpecial
                      ? 'bg-amber-400 text-amber-950 font-black shadow-xs'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {index + 1}
                </div>

                <div className="flex-1">
                  <input
                    type="text"
                    value={prize.name}
                    onChange={(e) => handlePrizeNameChange(index, e.target.value)}
                    placeholder={`경품 ${index + 1}`}
                    maxLength={28}
                    className="w-full bg-white border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 outline-none transition-all"
                  />
                </div>

                {/* Special Prize Toggle Button */}
                <button
                  type="button"
                  onClick={() => handleToggleSpecialPrize(index)}
                  title={prize.isSpecial ? '특별 경품 지정 해제' : '특별 경품으로 지정 (당첨 시 대형 풍선 연출)'}
                  className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 shrink-0 ${
                    prize.isSpecial
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-500 hover:text-amber-700 hover:border-amber-300'
                  }`}
                >
                  <span>🎈</span>
                  <span className="hidden sm:inline">
                    {prize.isSpecial ? '특별 경품' : '지정하기'}
                  </span>
                </button>
              </div>
            ))}
          </div>

          {/* Balloon Special Explanation Callout */}
          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
            <span className="text-base leading-none">🎈</span>
            <p className="leading-relaxed">
              <strong>특별 경품 혜택:</strong> 🎈로 지정된 경품에 당첨되는 참여자가 나오면, 그 참여자의 이름이 화면 전체에 <strong>거대한 3D 축하 풍선</strong>으로 떠오르며 화려한 폭죽과 음악이 함께 울려 퍼집니다!
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Floating Start CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-slate-900 text-white rounded-2xl shadow-xl">
        <div>
          <h3 className="text-lg font-bold">모든 준비가 완료되었습니다!</h3>
          <p className="text-slate-300 text-xs sm:text-sm mt-0.5">
            참여자 {count}명과 경품 {count}개의 사다리타기를 진행합니다.
          </p>
        </div>
        <button
          onClick={onStartGame}
          className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md shadow-amber-400/20 active:scale-95 flex items-center justify-center gap-2 shrink-0"
        >
          <span>사다리타기 시작하기</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: SAVE CURRENT BOARD AS NEW GROUP */}
      {/* ============================================================== */}
      {groupModalMode === 'SAVE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <BookmarkPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">현재 명단 그룹으로 저장</h3>
                  <p className="text-xs text-slate-500">현재 {participants.length}명의 참여자 명단을 그룹으로 기억합니다</p>
                </div>
              </div>
              <button
                onClick={() => setGroupModalMode('NONE')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGroupSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  그룹 이름
                </label>
                <input
                  type="text"
                  autoFocus
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="예: 개발 1팀, 동호회 멤버, 워크샵 스쿼드"
                  maxLength={24}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none transition-all"
                />
              </div>

              <div>
                <span className="block text-xs font-bold text-slate-600 mb-2">
                  포함될 참여자 ({participants.length}명)
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  {participants.map((p) => (
                    <span
                      key={p.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs"
                    >
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: p.color }}
                      />
                      <span>{p.name}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setGroupModalMode('NONE')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs active:scale-95 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>그룹 저장하기</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: MANAGE SAVED PARTICIPANT GROUPS (리스트 관리) */}
      {/* ============================================================== */}
      {groupModalMode === 'MANAGE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                  <Settings2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">참여자 그룹 관리</h3>
                  <p className="text-xs text-slate-500">저장된 그룹의 참여자 수를 늘리거나 줄이고, 이름을 수정합니다</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenCreateNewGroup}
                  className="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-xl border border-indigo-200 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>새 그룹 추가</span>
                </button>
                <button
                  onClick={() => setGroupModalMode('NONE')}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Groups List */}
            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {savedGroups.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  저장된 참여자 그룹이 없습니다.
                </div>
              ) : (
                savedGroups.map((group) => (
                  <div
                    key={group.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900">{group.name}</span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 border border-indigo-200">
                          {group.members.length}명
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditGroup(group)}
                          title="참여자 수 증감 및 이름 수정"
                          className="px-2.5 py-1.5 text-xs font-bold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-all active:scale-95 shadow-2xs flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3 text-indigo-600" />
                          <span>인원/수정</span>
                        </button>
                        <button
                          onClick={() => handleLoadGroup(group)}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all active:scale-95 shadow-2xs"
                        >
                          불러오기
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group.id, group.name)}
                          title="그룹 삭제"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-100 line-clamp-2">
                      {group.members.join(', ')}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={handleResetToDefaultGroups}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 underline underline-offset-2"
              >
                기본 추천 그룹으로 초기화
              </button>

              <button
                type="button"
                onClick={() => setGroupModalMode('NONE')}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: EDIT PARTICIPANT GROUP (핵심 기능: 인원수 증감 & 참여자명 수정) */}
      {/* ============================================================== */}
      {editingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-xl w-full shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    참여자 그룹 수정
                  </h3>
                  <p className="text-xs text-slate-500">
                    인원수를 늘리거나 줄이고, 참여자 이름을 직접 수정합니다 (최대 20명)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingGroup(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="space-y-4 overflow-y-auto flex-1 pr-1">
              {/* Group Name Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  그룹 이름
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="그룹 이름 입력"
                  maxLength={28}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-900 outline-none transition-all"
                />
              </div>

              {/* Headcount Control Toolbar */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-950">참여자 인원수:</span>
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white font-black text-xs">
                    {editMembers.length}명
                  </span>
                  <span className="text-[11px] text-indigo-600 font-medium">
                    (최소 {MIN_PARTICIPANTS}명 ~ 최대 {MAX_PARTICIPANTS}명)
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleRemoveOneMemberFromEdit}
                    disabled={editMembers.length <= MIN_PARTICIPANTS}
                    className="px-2.5 py-1 text-xs font-bold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-lg transition-all flex items-center gap-1 disabled:opacity-40"
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                    <span>- 1명 빼기</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddOneMemberToEdit}
                    disabled={editMembers.length >= MAX_PARTICIPANTS}
                    className="px-2.5 py-1 text-xs font-bold text-indigo-700 bg-white hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all flex items-center gap-1 disabled:opacity-40"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ 1명 추가</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleBulkMode}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 border ${
                      isBulkEditMode
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isBulkEditMode ? <List className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                    <span>{isBulkEditMode ? '목록 모드' : '일괄 붙여넣기'}</span>
                  </button>
                </div>
              </div>

              {/* Add Custom Member Form */}
              {!isBulkEditMode && (
                <form onSubmit={handleAddCustomMemberToEdit} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={addMemberInput}
                    onChange={(e) => setAddMemberInput(e.target.value)}
                    placeholder="새 참여자 이름 추가 (예: 홍길동)"
                    maxLength={14}
                    disabled={editMembers.length >= MAX_PARTICIPANTS}
                    className="flex-1 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-900 outline-none transition-all disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!addMemberInput.trim() || editMembers.length >= MAX_PARTICIPANTS}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 rounded-xl transition-all shadow-2xs flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>추가</span>
                  </button>
                </form>
              )}

              {/* Content Mode 1: Individual Members Grid with Edit & Delete */}
              {!isBulkEditMode ? (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {editMembers.map((member, idx) => {
                    const pal = getPaletteForIndex(idx);
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 p-1.5 px-2 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
                      >
                        <div
                          className="w-7 h-7 rounded-lg text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs"
                          style={{ backgroundColor: pal.color }}
                        >
                          {idx + 1}
                        </div>
                        <input
                          type="text"
                          value={member}
                          onChange={(e) => handleEditMemberName(idx, e.target.value)}
                          placeholder={`참여자 ${idx + 1}`}
                          maxLength={14}
                          className="flex-1 bg-white border border-slate-200 focus:border-indigo-500 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-900 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveMemberFromEdit(idx)}
                          disabled={editMembers.length <= MIN_PARTICIPANTS}
                          title="이 참여자 삭제"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Content Mode 2: Bulk Textarea Edit */
                <div className="space-y-2">
                  <div className="text-xs text-slate-500">
                    줄바꿈(Enter) 또는 쉼표(,)로 구분하여 이름을 입력하세요 (최대 20명):
                  </div>
                  <textarea
                    rows={8}
                    value={bulkEditText}
                    onChange={(e) => setBulkEditText(e.target.value)}
                    placeholder="김민수&#10;이지은&#10;박서준&#10;정지우..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 rounded-xl p-3 text-xs font-semibold text-slate-900 outline-none transition-all font-mono"
                  />
                  <div className="text-[11px] text-slate-400 flex justify-between">
                    <span>입력된 줄 수: {bulkEditText.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean).length}개</span>
                    <span>상한: 최대 {MAX_PARTICIPANTS}명</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-4 mt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setEditingGroup(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                취소
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveGroupChanges(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all shadow-2xs"
                >
                  저장만 하기
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveGroupChanges(true)}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>저장 후 바로 게임에 적용</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
