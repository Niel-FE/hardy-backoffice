'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Notice, NoticePriority, NoticeTargetType } from '@/types/notice';
import { mockNotices } from '@/data/mockNotices';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

export default function NoticeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toasts, success, error, hideToast } = useToast();

  const [notice, setNotice] = useState<Notice | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedNotice, setEditedNotice] = useState<Notice | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 공지사항 로드
  useEffect(() => {
    const id = Number(params.id);
    const found = mockNotices.find((n) => n.id === id);
    if (found) {
      setNotice(found);
      setEditedNotice(found);
    } else {
      error('공지사항을 찾을 수 없습니다');
      setTimeout(() => router.push('/notices'), 1500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  // 수정 모드 전환
  const handleEditMode = () => {
    setIsEditMode(true);
    setEditedNotice(notice);
  };

  // 수정 취소
  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedNotice(notice);
  };

  // 수정 저장
  const handleSaveEdit = () => {
    if (!editedNotice) return;

    if (!editedNotice.title.trim()) {
      error('제목을 입력해주세요');
      return;
    }

    if (!editedNotice.content.trim()) {
      error('내용을 입력해주세요');
      return;
    }

    // Mock: 실제로는 API 호출
    const updated = {
      ...editedNotice,
      updatedAt: new Date().toISOString(),
    };

    setNotice(updated);
    setIsEditMode(false);
    success('공지사항이 수정되었습니다');
  };

  // 삭제
  const handleDelete = () => {
    success('공지사항이 삭제되었습니다');
    setTimeout(() => router.push('/notices'), 1000);
  };

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
      <span className={`px-3 py-1 text-sm font-medium rounded-full border ${styles[priority]}`}>
        {labels[priority]}
      </span>
    );
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!notice) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-gray-500">로딩 중...</div>
      </div>
    );
  }

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
        <button
          onClick={() => router.push('/notices')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          목록으로
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">공지사항 상세</h1>
            <p className="text-gray-600 mt-2">공지사항 내용을 확인하고 관리합니다</p>
          </div>
          {!isEditMode && (
            <div className="flex gap-2">
              <button
                onClick={handleEditMode}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PencilIcon className="w-5 h-5" />
                수정
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <TrashIcon className="w-5 h-5" />
                삭제
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {!isEditMode ? (
        // 읽기 모드
        <div className="max-w-4xl">
          <div className="bg-white border rounded-lg p-6 mb-6">
            {/* 제목 */}
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex-1">{notice.title}</h2>
              {notice.isPinned && (
                <span className="px-3 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full">
                  📌 고정됨
                </span>
              )}
            </div>

            {/* 메타 정보 */}
            <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">작성자:</span>
                <span>{notice.author}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">작성일:</span>
                <span>{formatDate(notice.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <EyeIcon className="w-4 h-4" />
                <span>{notice.viewCount}명 조회</span>
              </div>
              <div>{getPriorityBadge(notice.priority)}</div>
            </div>

            {/* 내용 */}
            <div className="prose prose-sm max-w-none">
              {notice.content.split('\n').map((line, index) => (
                <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                  {line || <br />}
                </p>
              ))}
            </div>
          </div>

          {/* 통계 정보 */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">통계</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{notice.viewCount}</p>
                <p className="text-sm text-gray-600 mt-1">조회수</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">78%</p>
                <p className="text-sm text-gray-600 mt-1">읽음률</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-600">
                  {notice.targetType === 'all' ? '전체' : '일부'}
                </p>
                <p className="text-sm text-gray-600 mt-1">대상</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // 수정 모드
        <div className="max-w-4xl">
          <div className="bg-white border rounded-lg p-6 space-y-6">
            {/* 제목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editedNotice?.title || ''}
                onChange={(e) =>
                  setEditedNotice(editedNotice ? { ...editedNotice, title: e.target.value } : null)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* 중요도 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">중요도</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    value="normal"
                    checked={editedNotice?.priority === 'normal'}
                    onChange={(e) =>
                      setEditedNotice(
                        editedNotice
                          ? { ...editedNotice, priority: e.target.value as NoticePriority }
                          : null
                      )
                    }
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="text-sm text-gray-700">⚪ 일반</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    value="important"
                    checked={editedNotice?.priority === 'important'}
                    onChange={(e) =>
                      setEditedNotice(
                        editedNotice
                          ? { ...editedNotice, priority: e.target.value as NoticePriority }
                          : null
                      )
                    }
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="text-sm text-gray-700">🟡 중요</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    value="urgent"
                    checked={editedNotice?.priority === 'urgent'}
                    onChange={(e) =>
                      setEditedNotice(
                        editedNotice
                          ? { ...editedNotice, priority: e.target.value as NoticePriority }
                          : null
                      )
                    }
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="text-sm text-gray-700">🔴 긴급</span>
                </label>
              </div>
            </div>

            {/* 상단 고정 */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editedNotice?.isPinned || false}
                  onChange={(e) =>
                    setEditedNotice(
                      editedNotice ? { ...editedNotice, isPinned: e.target.checked } : null
                    )
                  }
                  className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">상단 고정</span>
              </label>
            </div>

            {/* 내용 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={editedNotice?.content || ''}
                onChange={(e) =>
                  setEditedNotice(
                    editedNotice ? { ...editedNotice, content: e.target.value } : null
                  )
                }
                rows={15}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
              />
            </div>

            {/* 버튼 */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <XMarkIcon className="w-5 h-5" />
                취소
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <CheckIcon className="w-5 h-5" />
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">공지사항 삭제</h3>
            <p className="text-gray-600 mb-6">
              "{notice.title}" 공지사항을 삭제하시겠습니까?
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
