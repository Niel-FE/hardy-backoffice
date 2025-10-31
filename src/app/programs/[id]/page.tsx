'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  Bars3Icon,
  CalendarIcon,
  UsersIcon,
  AcademicCapIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { getFromStorage, saveToStorage, STORAGE_KEYS, generateId, formatDate } from '@/lib/storage';
import { VODSet } from '@/types/vod';
import { ProgramVODSet } from '@/types/progress';

type ServiceRegion = 'ko' | 'en' | 'jp';

interface Program {
  id: number;
  title: string;
  description: string;
  sapCode: string;
  serviceRegions: ServiceRegion[];
  keywords: string[];
  duration: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'recruiting' | 'ongoing' | 'completed';
  targetStudents: number;
  currentStudents: number;
  curriculum: string[];
  coordinator: string;
  budget: number;
}

// Mock programs data - 실제로는 storage에서 가져올 수 있음
const mockPrograms: Program[] = [
  {
    id: 1,
    title: 'YEEEYEP 인도네시아',
    description: '인도네시아 현지 창업가 양성 프로그램',
    sapCode: 'SAP-2025-ST-01',
    serviceRegions: ['ko', 'en'],
    keywords: ['창업', '비즈니스 모델', '린 스타트업', '시장 진입'],
    duration: '16주',
    startDate: '2025-11-01',
    endDate: '2026-02-28',
    status: 'planning',
    targetStudents: 40,
    currentStudents: 0,
    curriculum: ['비즈니스 모델 캔버스', '고객 발견', '시장 조사', 'MVP 개발', '피칭'],
    coordinator: '김매니저',
    budget: 50000000,
  },
  {
    id: 2,
    title: '하나유니브',
    description: '대학생 창업 교육 프로그램',
    sapCode: 'SAP-2025-ST-02',
    serviceRegions: ['ko'],
    keywords: ['창업', '대학생', '아이디어 검증', '팀 빌딩'],
    duration: '16주',
    startDate: '2025-09-01',
    endDate: '2025-12-31',
    status: 'ongoing',
    targetStudents: 35,
    currentStudents: 35,
    curriculum: ['문제 발견', '아이디어 검증', '비즈니스 모델링', '팀 프로젝트'],
    coordinator: '박매니저',
    budget: 50000000,
  },
  {
    id: 3,
    title: 'SuTEAM',
    description: '지속가능한 창업 팀 양성 프로그램',
    sapCode: 'SAP-2025-ST-03',
    serviceRegions: ['ko', 'jp'],
    keywords: ['지속가능성', '소셜임팩트', '팀워크', '스케일업'],
    duration: '12주',
    startDate: '2025-08-15',
    endDate: '2025-11-10',
    status: 'ongoing',
    targetStudents: 45,
    currentStudents: 42,
    curriculum: ['소셜임팩트', '재무 관리', '성장 전략', '실전 프로젝트'],
    coordinator: '최매니저',
    budget: 40000000,
  },
];

export default function ProgramDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toasts, success, error, hideToast } = useToast();

  const [program, setProgram] = useState<Program | null>(null);
  const [programVODSets, setProgramVODSets] = useState<ProgramVODSet[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [availableVODSets, setAvailableVODSets] = useState<VODSet[]>([]);
  const [selectedVODSetId, setSelectedVODSetId] = useState<number>(0);

  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedProgram, setEditedProgram] = useState<Program | null>(null);
  const [newKeyword, setNewKeyword] = useState('');
  const [newCurriculumItem, setNewCurriculumItem] = useState('');

  // Load program data
  useEffect(() => {
    const id = Number(params.id);
    const found = mockPrograms.find((p) => p.id === id);
    if (found) {
      setProgram(found);
    } else {
      error('프로그램을 찾을 수 없습니다');
      setTimeout(() => {
        router.push('/programs/planning');
      }, 1500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  // Load assigned VOD sets
  useEffect(() => {
    if (!program) return;
    const stored = getFromStorage<ProgramVODSet>(STORAGE_KEYS.PROGRAM_VOD_SETS);
    const filtered = stored.filter((pv) => pv.programId === program.id && pv.status === 'active');
    setProgramVODSets(filtered);
  }, [program]);

  // Load available VOD sets for assignment
  const loadAvailableVODSets = () => {
    const allVODSets = getFromStorage<VODSet>(STORAGE_KEYS.VOD_SETS || 'ud_backoffice_vod_sets');
    const assignedIds = programVODSets.map((pv) => pv.vodSetId);
    const available = allVODSets.filter((vs) => !assignedIds.includes(vs.id) && vs.status === 'active');
    setAvailableVODSets(available);
  };

  // Handle assign VOD set
  const handleAssignVODSet = () => {
    if (!program) return;
    if (!selectedVODSetId) {
      error('VOD 세트를 선택해주세요');
      return;
    }

    const vodSet = availableVODSets.find((vs) => vs.id === selectedVODSetId);
    if (!vodSet) return;

    const newAssignment: ProgramVODSet = {
      id: generateId(),
      programId: program.id,
      programName: program.title,
      vodSetId: vodSet.id,
      vodSetName: vodSet.name,
      assignedDate: formatDate(),
      order: programVODSets.length + 1,
      status: 'active',
      createdAt: formatDate(),
    };

    const allAssignments = getFromStorage<ProgramVODSet>(STORAGE_KEYS.PROGRAM_VOD_SETS);
    saveToStorage(STORAGE_KEYS.PROGRAM_VOD_SETS, [...allAssignments, newAssignment]);

    setProgramVODSets([...programVODSets, newAssignment]);
    setShowAssignModal(false);
    setSelectedVODSetId(0);
    success('VOD 세트가 프로그램에 할당되었습니다');
  };

  // Handle unassign VOD set
  const handleUnassignVODSet = (assignment: ProgramVODSet) => {
    if (!confirm(`"${assignment.vodSetName}" VOD 세트를 이 프로그램에서 제거하시겠습니까?`)) {
      return;
    }

    const allAssignments = getFromStorage<ProgramVODSet>(STORAGE_KEYS.PROGRAM_VOD_SETS);
    const updated = allAssignments.map((a) =>
      a.id === assignment.id ? { ...a, status: 'archived' as const } : a
    );
    saveToStorage(STORAGE_KEYS.PROGRAM_VOD_SETS, updated);

    setProgramVODSets(programVODSets.filter((a) => a.id !== assignment.id));
    success('VOD 세트가 프로그램에서 제거되었습니다');
  };

  // Enter edit mode
  const handleEditClick = () => {
    if (program) {
      setEditedProgram({ ...program });
      setIsEditMode(true);
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditedProgram(null);
    setIsEditMode(false);
    setNewKeyword('');
    setNewCurriculumItem('');
  };

  // Save edited program
  const handleSaveEdit = () => {
    if (!editedProgram) return;

    // Validation
    if (!editedProgram.title.trim()) {
      error('프로그램명을 입력해주세요');
      return;
    }
    if (!editedProgram.coordinator.trim()) {
      error('담당자를 입력해주세요');
      return;
    }
    if (editedProgram.targetStudents <= 0) {
      error('목표 인원은 0보다 커야 합니다');
      return;
    }

    // Update program
    setProgram(editedProgram);
    setIsEditMode(false);
    success('프로그램 정보가 수정되었습니다');

    // In real app, this would save to backend/storage
    // For now, just update local state
  };

  // Update edited program field
  const updateEditedField = (field: keyof Program, value: any) => {
    if (editedProgram) {
      setEditedProgram({ ...editedProgram, [field]: value });
    }
  };

  // Add keyword
  const handleAddKeyword = () => {
    if (!editedProgram || !newKeyword.trim()) return;
    if (editedProgram.keywords.includes(newKeyword.trim())) {
      error('이미 존재하는 키워드입니다');
      return;
    }
    updateEditedField('keywords', [...editedProgram.keywords, newKeyword.trim()]);
    setNewKeyword('');
  };

  // Remove keyword
  const handleRemoveKeyword = (keyword: string) => {
    if (!editedProgram) return;
    updateEditedField('keywords', editedProgram.keywords.filter((k) => k !== keyword));
  };

  // Add curriculum item
  const handleAddCurriculumItem = () => {
    if (!editedProgram || !newCurriculumItem.trim()) return;
    if (editedProgram.curriculum.includes(newCurriculumItem.trim())) {
      error('이미 존재하는 커리큘럼입니다');
      return;
    }
    updateEditedField('curriculum', [...editedProgram.curriculum, newCurriculumItem.trim()]);
    setNewCurriculumItem('');
  };

  // Remove curriculum item
  const handleRemoveCurriculumItem = (item: string) => {
    if (!editedProgram) return;
    updateEditedField('curriculum', editedProgram.curriculum.filter((c) => c !== item));
  };

  // Toggle service region
  const toggleServiceRegion = (region: ServiceRegion) => {
    if (!editedProgram) return;
    const regions = editedProgram.serviceRegions.includes(region)
      ? editedProgram.serviceRegions.filter((r) => r !== region)
      : [...editedProgram.serviceRegions, region];
    updateEditedField('serviceRegions', regions);
  };

  if (!program) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  const getServiceRegionLabel = (region: ServiceRegion) => {
    const labels: Record<ServiceRegion, string> = {
      ko: '한국',
      en: '영어',
      jp: '일본어',
    };
    return labels[region];
  };

  return (
    <div>
      {/* Toasts */}
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => hideToast(toast.id)} />
      ))}

      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/programs/planning')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>목록으로 돌아가기</span>
        </button>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{program.title}</h1>
            <p className="text-gray-600 mt-2">{program.description}</p>
          </div>
          {!isEditMode ? (
            <button
              onClick={handleEditClick}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <PencilIcon className="w-5 h-5" />
              수정하기
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <CheckIcon className="w-5 h-5" />
                저장
              </button>
              <button
                onClick={handleCancelEdit}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <XMarkIcon className="w-5 h-5" />
                취소
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Program Info */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">프로그램 정보</h2>

        {/* 기본 정보 */}
        {!isEditMode ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">SAP 코드</p>
              <p className="font-medium text-gray-900">{program.sapCode}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">담당자</p>
              <p className="font-medium text-gray-900">{program.coordinator}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">예산</p>
              <p className="font-medium text-gray-900">{(program.budget / 10000).toLocaleString()}만원</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                프로그램명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editedProgram?.title || ''}
                onChange={(e) => updateEditedField('title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SAP 코드</label>
              <input
                type="text"
                value={editedProgram?.sapCode || ''}
                onChange={(e) => updateEditedField('sapCode', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                담당자 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editedProgram?.coordinator || ''}
                onChange={(e) => updateEditedField('coordinator', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">예산 (원)</label>
              <input
                type="number"
                value={editedProgram?.budget || 0}
                onChange={(e) => updateEditedField('budget', Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
              <textarea
                value={editedProgram?.description || ''}
                onChange={(e) => updateEditedField('description', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        )}

        {/* 일정 정보 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">일정 정보</h3>
          {!isEditMode ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">기간</p>
                <p className="font-medium text-gray-900">{program.duration}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">시작일</p>
                <p className="font-medium text-gray-900">{program.startDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">종료일</p>
                <p className="font-medium text-gray-900">{program.endDate}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">기간</label>
                <input
                  type="text"
                  value={editedProgram?.duration || ''}
                  onChange={(e) => updateEditedField('duration', e.target.value)}
                  placeholder="예: 16주"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">시작일</label>
                <input
                  type="date"
                  value={editedProgram?.startDate || ''}
                  onChange={(e) => updateEditedField('startDate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">종료일</label>
                <input
                  type="date"
                  value={editedProgram?.endDate || ''}
                  onChange={(e) => updateEditedField('endDate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* 인원 정보 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">인원 정보</h3>
          {!isEditMode ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">목표 인원</p>
                <p className="font-medium text-gray-900">{program.targetStudents}명</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">현재 인원</p>
                <p className="font-medium text-gray-900">{program.currentStudents}명</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">모집률</p>
                <p className="font-medium text-gray-900">
                  {program.targetStudents > 0
                    ? ((program.currentStudents / program.targetStudents) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  목표 인원 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={editedProgram?.targetStudents || 0}
                  onChange={(e) => updateEditedField('targetStudents', Number(e.target.value))}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">현재 인원</label>
                <input
                  type="number"
                  value={editedProgram?.currentStudents || 0}
                  onChange={(e) => updateEditedField('currentStudents', Number(e.target.value))}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* 서비스 지역 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">서비스 지역</h3>
          {!isEditMode ? (
            <div className="flex flex-wrap gap-2">
              {program.serviceRegions.map((region) => (
                <span key={region} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                  {getServiceRegionLabel(region)}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {(['ko', 'en', 'jp'] as ServiceRegion[]).map((region) => (
                <label key={region} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editedProgram?.serviceRegions.includes(region) || false}
                    onChange={() => toggleServiceRegion(region)}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{getServiceRegionLabel(region)}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* 키워드 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">키워드</h3>
          {!isEditMode ? (
            <div className="flex flex-wrap gap-2">
              {program.keywords.map((keyword, idx) => (
                <span key={idx} className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                  {keyword}
                </span>
              ))}
            </div>
          ) : (
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {editedProgram?.keywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium flex items-center gap-2"
                  >
                    {keyword}
                    <button
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="hover:text-primary-900"
                      type="button"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                  placeholder="키워드 입력 후 추가 버튼 클릭"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={handleAddKeyword}
                  type="button"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  추가
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 커리큘럼 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">커리큘럼</h3>
          {!isEditMode ? (
            <div className="flex flex-wrap gap-2">
              {program.curriculum.map((item, idx) => (
                <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {editedProgram?.curriculum.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm flex items-center gap-2"
                  >
                    {item}
                    <button
                      onClick={() => handleRemoveCurriculumItem(item)}
                      className="hover:text-gray-900"
                      type="button"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCurriculumItem}
                  onChange={(e) => setNewCurriculumItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCurriculumItem()}
                  placeholder="커리큘럼 항목 입력 후 추가 버튼 클릭"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={handleAddCurriculumItem}
                  type="button"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  추가
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => router.push(`/programs/${program.id}/kpi-assignment`)}
          className="bg-white border-2 border-primary-600 text-primary-600 px-6 py-4 rounded-lg hover:bg-primary-50 transition-colors font-medium text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-lg">KPI 할당</div>
              <div className="text-sm text-gray-600 mt-1">프로그램 KPI 지표 관리</div>
            </div>
            <PlusIcon className="w-6 h-6" />
          </div>
        </button>

        <button
          onClick={() => router.push(`/programs/${program.id}/attendance-settings`)}
          className="bg-white border-2 border-green-600 text-green-600 px-6 py-4 rounded-lg hover:bg-green-50 transition-colors font-medium text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-lg">출결관리 세팅</div>
              <div className="text-sm text-gray-600 mt-1">출결 체크 시간 및 규칙 설정</div>
            </div>
            <PlusIcon className="w-6 h-6" />
          </div>
        </button>
      </div>

      {/* VOD Sets Section */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">할당된 VOD 세트</h2>
            <p className="text-sm text-gray-600 mt-1">이 프로그램에 할당된 VOD 세트 목록</p>
          </div>
          <button
            onClick={() => {
              loadAvailableVODSets();
              setShowAssignModal(true);
            }}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            VOD 세트 할당
          </button>
        </div>

        {programVODSets.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <AcademicCapIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">할당된 VOD 세트가 없습니다</p>
            <p className="text-sm text-gray-400">위 버튼을 클릭하여 VOD 세트를 할당하세요</p>
          </div>
        ) : (
          <div className="space-y-3">
            {programVODSets.map((assignment, index) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-700 rounded-lg font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{assignment.vodSetName}</h3>
                    <p className="text-sm text-gray-600">할당일: {assignment.assignedDate}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleUnassignVODSet(assignment)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="제거"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign VOD Set Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">VOD 세트 할당</h3>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                VOD 세트 선택 <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedVODSetId}
                onChange={(e) => setSelectedVODSetId(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value={0}>선택하세요</option>
                {availableVODSets.map((vodSet) => (
                  <option key={vodSet.id} value={vodSet.id}>
                    {vodSet.name} ({vodSet.category})
                  </option>
                ))}
              </select>
              {availableVODSets.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">할당 가능한 VOD 세트가 없습니다</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAssignVODSet}
                disabled={!selectedVODSetId}
                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                할당하기
              </button>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedVODSetId(0);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
