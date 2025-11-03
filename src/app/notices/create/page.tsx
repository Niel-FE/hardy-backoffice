'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Notice, NoticePriority, NoticeTargetType } from '@/types/notice';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

export default function CreateNoticePage() {
  const router = useRouter();
  const { toasts, success, error, hideToast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal' as NoticePriority,
    targetType: 'all' as NoticeTargetType,
    isPinned: false,
    selectedProgramIds: [] as number[],
  });

  const [programSearchTerm, setProgramSearchTerm] = useState('');

  // 프로그램 목록
  const programs = [
    { id: 1, title: 'YEEEYEP 인도네시아' },
    { id: 2, title: '하나유니브' },
    { id: 3, title: 'SuTEAM' },
    { id: 4, title: 'YEEEYEP 인도네시아 2기' },
  ];

  // 검색된 프로그램 목록
  const filteredPrograms = useMemo(() => {
    if (!programSearchTerm.trim()) return programs;
    return programs.filter(program =>
      program.title.toLowerCase().includes(programSearchTerm.toLowerCase())
    );
  }, [programSearchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.title.trim()) {
      error('제목을 입력해주세요');
      return;
    }

    if (!formData.content.trim()) {
      error('내용을 입력해주세요');
      return;
    }

    // 대상 검증
    if (formData.targetType === 'program' && formData.selectedProgramIds.length === 0) {
      error('프로그램을 선택해주세요');
      return;
    }

    // 새 공지사항 생성 (Mock)
    const newNotice: Notice = {
      id: Date.now(),
      title: formData.title,
      content: formData.content,
      author: '김매니저',
      authorId: 1,
      programIds: formData.targetType === 'program' ? formData.selectedProgramIds : [],
      targetType: formData.targetType,
      targetIds: formData.targetType === 'program' ? formData.selectedProgramIds : [],
      priority: formData.priority,
      isPinned: formData.isPinned,
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('새 공지사항:', newNotice);
    success('공지사항이 등록되었습니다');

    // 목록으로 이동
    setTimeout(() => {
      router.push('/notices');
    }, 1000);
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
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          뒤로 가기
        </button>
        <h1 className="text-3xl font-bold text-gray-900">공지사항 작성</h1>
        <p className="text-gray-600 mt-2">교육생에게 전달할 공지사항을 작성합니다</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="bg-white border rounded-lg p-6 space-y-6">
          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="공지사항 제목을 입력하세요"
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
                  checked={formData.priority === 'normal'}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value as NoticePriority })
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
                  checked={formData.priority === 'important'}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value as NoticePriority })
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
                  checked={formData.priority === 'urgent'}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value as NoticePriority })
                  }
                  className="w-4 h-4 text-primary-600"
                />
                <span className="text-sm text-gray-700">🔴 긴급</span>
              </label>
            </div>
          </div>

          {/* 공지 대상 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">공지 대상</label>
            <div className="flex gap-4 mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="targetType"
                  value="all"
                  checked={formData.targetType === 'all'}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      targetType: e.target.value as NoticeTargetType,
                      selectedProgramIds: []
                    });
                  }}
                  className="w-4 h-4 text-primary-600"
                />
                <span className="text-sm text-gray-700">전체 교육생</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="targetType"
                  value="program"
                  checked={formData.targetType === 'program'}
                  onChange={(e) =>
                    setFormData({ ...formData, targetType: e.target.value as NoticeTargetType })
                  }
                  className="w-4 h-4 text-primary-600"
                />
                <span className="text-sm text-gray-700">특정 프로그램</span>
              </label>
            </div>

            {/* 프로그램 선택 */}
            {formData.targetType === 'program' && (
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                {/* 선택된 프로그램 표시 */}
                {formData.selectedProgramIds.length > 0 && (
                  <div className="mb-3 pb-3 border-b border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-2">
                      선택된 프로그램 ({formData.selectedProgramIds.length}개)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {formData.selectedProgramIds.map(id => {
                        const program = programs.find(p => p.id === id);
                        return program ? (
                          <span
                            key={id}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded"
                          >
                            {program.title}
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  selectedProgramIds: formData.selectedProgramIds.filter(pid => pid !== id)
                                });
                              }}
                              className="hover:text-primary-900"
                            >
                              ×
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* 검색 */}
                <div className="mb-3">
                  <div className="relative">
                    <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="프로그램 검색..."
                      value={programSearchTerm}
                      onChange={(e) => setProgramSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* 프로그램 목록 */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filteredPrograms.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">검색 결과가 없습니다</p>
                  ) : (
                    filteredPrograms.map((program) => (
                      <label key={program.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={formData.selectedProgramIds.includes(program.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                selectedProgramIds: [...formData.selectedProgramIds, program.id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                selectedProgramIds: formData.selectedProgramIds.filter(id => id !== program.id)
                              });
                            }
                          }}
                          className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{program.title}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 상단 고정 */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPinned}
                onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">상단 고정</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              상단에 고정된 공지사항은 목록 최상단에 항상 표시됩니다
            </p>
          </div>

          {/* 내용 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="공지사항 내용을 입력하세요&#10;&#10;마크다운 문법을 사용할 수 있습니다.&#10;- 리스트&#10;**굵은 글씨**&#10;[링크](https://example.com)"
              rows={15}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              마크다운 문법을 지원합니다 (**, *, [], # 등)
            </p>
          </div>

          {/* 미리보기 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">미리보기</label>
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[200px]">
              {formData.content ? (
                <div className="prose prose-sm max-w-none">
                  {formData.content.split('\n').map((line, index) => (
                    <p key={index} className="mb-2">
                      {line || <br />}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">내용을 입력하면 미리보기가 표시됩니다</p>
              )}
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              등록하기
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
