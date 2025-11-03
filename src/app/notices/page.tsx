'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  BellAlertIcon,
} from '@heroicons/react/24/outline';
import { Notice, NoticePriority, NoticeTargetType } from '@/types/notice';
import { mockNotices } from '@/data/mockNotices';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

export default function NoticesPage() {
  const router = useRouter();
  const { toasts, success, error, hideToast } = useToast();

  const [notices, setNotices] = useState<Notice[]>(mockNotices);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<'all' | NoticePriority>('all');
  const [filterTarget, setFilterTarget] = useState<'all' | 'program' | 'team' | 'individual'>('all');
  const [filterProgramId, setFilterProgramId] = useState<number | 'all'>('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  // 프로그램 목록 (하드코딩)
  const programs = [
    { id: 1, title: 'YEEEYEP 인도네시아' },
    { id: 2, title: '하나유니브' },
    { id: 3, title: 'SuTEAM' },
    { id: 4, title: 'YEEEYEP 인도네시아 2기' },
  ];


  // 필터링된 공지사항
  const filteredNotices = useMemo(() => {
    return notices.filter((notice) => {
      // 검색어 필터
      const matchesSearch =
        notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notice.content.toLowerCase().includes(searchTerm.toLowerCase());

      // 중요도 필터
      const matchesPriority = filterPriority === 'all' || notice.priority === filterPriority;

      // 대상 타입 필터
      const matchesTarget = filterTarget === 'all' || notice.targetType === filterTarget;

      // 프로그램 필터
      const matchesProgram =
        filterProgramId === 'all' ||
        notice.targetType === 'all' ||
        notice.programIds.length === 0 ||
        notice.programIds.includes(Number(filterProgramId));

      return matchesSearch && matchesPriority && matchesTarget && matchesProgram;
    });
  }, [notices, searchTerm, filterPriority, filterTarget, filterProgramId]);

  // 고정된 공지사항과 일반 공지사항 분리
  const pinnedNotices = filteredNotices.filter((n) => n.isPinned);
  const regularNotices = filteredNotices.filter((n) => !n.isPinned);

  // 통계 계산
  const stats = useMemo(() => {
    const totalNotices = filteredNotices.length;
    const urgentNotices = filteredNotices.filter(n => n.priority === 'urgent').length;
    const pinnedCount = filteredNotices.filter(n => n.isPinned).length;
    const totalViews = filteredNotices.reduce((sum, n) => sum + n.viewCount, 0);

    return {
      totalNotices,
      urgentNotices,
      pinnedCount,
      totalViews,
    };
  }, [filteredNotices]);

  // 중요도 뱃지
  const getPriorityBadge = (priority: NoticePriority) => {
    const styles = {
      urgent: 'bg-red-100 text-red-800 border-red-200',
      important: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      normal: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    const labels = {
      urgent: '🔴 긴급',
      important: '🟡 중요',
      normal: '⚪ 일반',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[priority]}`}>
        {labels[priority]}
      </span>
    );
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 삭제 확인 모달 열기
  const handleDeleteClick = (notice: Notice) => {
    setSelectedNotice(notice);
    setShowDeleteModal(true);
  };

  // 공지사항 삭제
  const handleDelete = () => {
    if (!selectedNotice) return;

    setNotices(notices.filter((n) => n.id !== selectedNotice.id));
    success('공지사항이 삭제되었습니다');
    setShowDeleteModal(false);
    setSelectedNotice(null);
  };

  // 대상 표시
  const getTargetLabel = (notice: Notice) => {
    if (notice.targetType === 'all' || notice.programIds.length === 0) {
      return '전체';
    }

    // 프로그램 ID를 이름으로 변환
    const programNames = notice.programIds
      .map(id => programs.find(p => p.id === id)?.title)
      .filter(Boolean);

    if (programNames.length === 0) return '전체';
    if (programNames.length === 1) return programNames[0];
    return `${programNames[0]} 외 ${programNames.length - 1}개`;
  };


  return (
    <div className="p-6">
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
        <h1 className="text-3xl font-bold text-gray-900">공지사항 관리</h1>
        <p className="text-gray-600 mt-2">교육생에게 전달할 공지사항을 작성하고 관리합니다</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">전체 공지사항</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalNotices}</p>
            </div>
            <BellAlertIcon className="w-12 h-12 text-primary-600" />
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">긴급 공지</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.urgentNotices}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-2xl">
              🔴
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">고정 공지</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pinnedCount}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-2xl">
              📌
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총 조회수</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalViews}</p>
            </div>
            <EyeIcon className="w-12 h-12 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="제목 또는 내용 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">전체 중요도</option>
            <option value="urgent">긴급</option>
            <option value="important">중요</option>
            <option value="normal">일반</option>
          </select>

          {/* Target Type Filter */}
          <select
            value={filterTarget}
            onChange={(e) => setFilterTarget(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">전체 대상</option>
            <option value="program">프로그램별</option>
            <option value="team">팀별</option>
            <option value="individual">개인별</option>
          </select>

          {/* Program Filter */}
          <select
            value={filterProgramId}
            onChange={(e) => setFilterProgramId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">전체 프로그램</option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.title}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-4">
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterPriority('all');
              setFilterTarget('all');
              setFilterProgramId('all');
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            필터 초기화
          </button>
          <button
            onClick={() => router.push('/notices/create')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            새 공지 작성
          </button>
        </div>
      </div>

      {/* Pinned Notices */}
      {pinnedNotices.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            📌 상단 고정
          </h2>
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">제목</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">대상</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">중요도</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">조회수</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작성일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pinnedNotices.map((notice) => (
                  <tr
                    key={notice.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/notices/${notice.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{notice.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{getTargetLabel(notice)}</span>
                    </td>
                    <td className="px-6 py-4">{getPriorityBadge(notice.priority)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <EyeIcon className="w-4 h-4" />
                        {notice.viewCount}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{formatDate(notice.createdAt)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Regular Notices */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          최근 공지사항 ({regularNotices.length})
        </h2>
        <div className="bg-white border rounded-lg overflow-hidden">
          {regularNotices.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchTerm || filterPriority !== 'all'
                ? '검색 결과가 없습니다'
                : '등록된 공지사항이 없습니다'}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">제목</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">대상</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">중요도</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">조회수</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작성일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {regularNotices.map((notice) => (
                  <tr
                    key={notice.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/notices/${notice.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{notice.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{getTargetLabel(notice)}</span>
                    </td>
                    <td className="px-6 py-4">{getPriorityBadge(notice.priority)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <EyeIcon className="w-4 h-4" />
                        {notice.viewCount}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{formatDate(notice.createdAt)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedNotice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">공지사항 삭제</h3>
            <p className="text-gray-600 mb-6">
              "{selectedNotice.title}" 공지사항을 삭제하시겠습니까?
              <br />
              <span className="text-sm text-red-600">이 작업은 되돌릴 수 없습니다.</span>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

