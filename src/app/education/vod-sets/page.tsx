'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  PlusIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { getFromStorage, saveToStorage, STORAGE_KEYS, generateId, formatDate } from '@/lib/storage';
import { VODSet } from '@/types/vod';
import { mockVODSets as initialVODSets } from '@ud/shared';
import WorkflowGuide from '@/components/WorkflowGuide';

const initialPrograms = [
  { id: 1, name: 'YEEEYEP 인도네시아' },
  { id: 2, name: '하나유니브' },
  { id: 3, name: 'SuTEAM' },
];

const initialCategories = ['창업 기초', '비즈니스 전략', '마케팅', '재무', '피칭', '기타'];

export default function VODSetsPage() {
  const router = useRouter();
  const [vodSets, setVodSets] = useState<VODSet[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<number>(0);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { toasts, success, error, hideToast } = useToast();

  // LocalStorage에서 데이터 로드
  useEffect(() => {
    const stored = getFromStorage<VODSet>(STORAGE_KEYS.VOD_SETS || 'ud_backoffice_vod_sets');
    if (stored.length > 0) {
      setVodSets(stored);
    } else {
      setVodSets(initialVODSets);
      saveToStorage(STORAGE_KEYS.VOD_SETS || 'ud_backoffice_vod_sets', initialVODSets);
    }
  }, []);

  // vodSets 변경 시 LocalStorage에 저장
  useEffect(() => {
    if (vodSets.length > 0) {
      saveToStorage(STORAGE_KEYS.VOD_SETS || 'ud_backoffice_vod_sets', vodSets);
    }
  }, [vodSets]);

  // 필터링된 VOD 세트
  const filteredVodSets = vodSets.filter((set) => {
    const matchesProgram = selectedProgramId === 0 || set.programId === selectedProgramId;
    const matchesStatus = selectedStatus === 'all' || set.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || set.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      set.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      set.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProgram && matchesStatus && matchesCategory && matchesSearch;
  });

  // VOD 세트 생성
  const handleCreateSet = () => {
    router.push('/education/vod-sets/create');
  };

  // VOD 세트 수정
  const handleEditSet = (set: VODSet) => {
    router.push(`/education/vod-sets/${set.id}/edit`);
  };

  // VOD 세트 삭제
  const handleDeleteSet = (set: VODSet) => {
    if (confirm(`"${set.name}" VOD 세트를 삭제하시겠습니까?\n하위 세션도 모두 삭제됩니다.`)) {
      setVodSets((prev) => prev.filter((s) => s.id !== set.id));
      success('VOD 세트가 삭제되었습니다');
    }
  };

  // VOD 세트 복사
  const handleCopySet = (set: VODSet) => {
    const newSet: VODSet = {
      ...set,
      id: generateId(),
      name: `${set.name} (복사본)`,
      status: 'draft',
      createdDate: formatDate(),
      sessions: set.sessions.map((session) => ({
        ...session,
        id: generateId(),
        setId: generateId(),
      })),
    };
    setVodSets((prev) => [...prev, newSet]);
    success('VOD 세트가 복사되었습니다');
  };

  // VOD 세트 상세 보기 (클릭)
  const handleViewSet = (set: VODSet) => {
    router.push(`/education/vod-sets/${set.id}`);
  };

  const getStatusBadge = (status: VODSet['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      active: '활성',
      draft: '임시저장',
      archived: '보관됨',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div>
      {/* Toasts */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => hideToast(toast.id)}
        />
      ))}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">VOD 세트 관리</h1>
        <p className="text-gray-600 mt-2">VOD 세트를 생성하고 관리합니다</p>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex gap-4 items-center flex-wrap">
          {/* 프로그램 필터 */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">프로그램:</label>
            <select
              value={selectedProgramId}
              onChange={(e) => setSelectedProgramId(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={0}>전체</option>
              {initialPrograms.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
          </div>

          {/* 상태 필터 */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">상태:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">전체</option>
              <option value="active">활성</option>
              <option value="draft">임시저장</option>
              <option value="archived">보관됨</option>
            </select>
          </div>

          {/* 카테고리 필터 */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">카테고리:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">전체</option>
              {initialCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* 검색 */}
          <div className="flex items-center gap-2 flex-1">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="세트 이름, 설명으로 검색..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* 생성 버튼 */}
          <button
            onClick={handleCreateSet}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            세트 생성
          </button>
        </div>
      </div>

      {/* VOD Sets List */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 border-b">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 text-sm font-medium text-gray-700">
            <div className="col-span-4">세트명</div>
            <div className="col-span-2">프로그램</div>
            <div className="col-span-1">카테고리</div>
            <div className="col-span-1">상태</div>
            <div className="col-span-1 text-center">세션 수</div>
            <div className="col-span-2">생성일</div>
            <div className="col-span-1 text-center">관리</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y">
          {filteredVodSets.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              {searchQuery || selectedProgramId !== 0 || selectedStatus !== 'all' || selectedCategory !== 'all'
                ? '검색 결과가 없습니다.'
                : 'VOD 세트가 없습니다. 세트를 생성해주세요.'}
            </div>
          ) : (
            filteredVodSets.map((set) => (
              <div
                key={set.id}
                className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleViewSet(set)}
              >
                {/* 세트명 */}
                <div className="col-span-4">
                  <h3 className="font-semibold text-gray-900">{set.name}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-1">{set.description}</p>
                </div>

                {/* 프로그램 */}
                <div className="col-span-2 flex items-center">
                  <span className="text-sm text-gray-700">{set.programName}</span>
                </div>

                {/* 카테고리 */}
                <div className="col-span-1 flex items-center">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {set.category}
                  </span>
                </div>

                {/* 상태 */}
                <div className="col-span-1 flex items-center">{getStatusBadge(set.status)}</div>

                {/* 세션 수 */}
                <div className="col-span-1 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-900">{set.sessions.length}</span>
                </div>

                {/* 생성일 */}
                <div className="col-span-2 flex items-center">
                  <span className="text-sm text-gray-600">{set.createdDate}</span>
                </div>

                {/* 관리 버튼 */}
                <div className="col-span-1 flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopySet(set);
                    }}
                    className="text-sm text-green-600 hover:text-green-700 hover:underline font-medium"
                  >
                    복사
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSet(set);
                    }}
                    className="text-sm text-red-600 hover:text-red-700 hover:underline font-medium"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 결과 요약 */}
      {filteredVodSets.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          전체 {vodSets.length}개 중 {filteredVodSets.length}개 표시
        </div>
      )}

      {/* Workflow Guide */}
      <WorkflowGuide
        title="📚 VOD 세트 관리 워크플로우"
        description="VOD 세트 생성부터 프로그램 배정까지의 전체 과정을 안내합니다"
        steps={[
          {
            step: 1,
            title: '검색 및 필터링',
            description: '프로그램, 상태, 카테고리 필터를 사용하여 원하는 VOD 세트를 찾습니다. 검색창에서 이름이나 설명으로도 검색할 수 있습니다.',
          },
          {
            step: 2,
            title: 'VOD 세트 선택',
            description: '목록에서 VOD 세트를 클릭하여 상세 정보를 확인합니다. 세션 구성, 영상 목록, 과제 등을 미리 볼 수 있습니다.',
          },
          {
            step: 3,
            title: '상세보기 또는 편집',
            description: '상세 페이지에서 VOD 세트의 모든 정보를 확인하거나, 편집 모드로 전환하여 내용을 수정합니다.',
          },
          {
            step: 4,
            title: '상태 관리',
            description: 'VOD 세트의 상태를 "임시저장", "활성", "보관됨" 중에서 변경하여 공개 여부를 제어합니다.',
          },
        ]}
        keyFeatures={[
          '프로그램/상태/카테고리별 필터링',
          'VOD 세트 생성 및 편집',
          '기존 세트 복사하여 새 세트 만들기',
          'VOD 세트 삭제 (하위 세션 포함)',
          '세트명 및 설명 검색',
          '세션 개수 및 생성일 확인',
        ]}
        tips={[
          '세트를 복사하면 모든 세션과 과제가 함께 복사되므로, 유사한 구조의 세트를 빠르게 만들 수 있습니다.',
          '"활성" 상태의 세트만 학생들에게 표시됩니다. 준비 중인 세트는 "임시저장"으로 관리하세요.',
          '세트를 삭제하면 복구할 수 없으니, 보관이 필요한 경우 "보관됨" 상태로 변경하는 것을 권장합니다.',
          '검색은 세트 이름과 설명 모두에서 작동합니다. 키워드를 활용하여 빠르게 찾으세요.',
        ]}
      />
    </div>
  );
}
