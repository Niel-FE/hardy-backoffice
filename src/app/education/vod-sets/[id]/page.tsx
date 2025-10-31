'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import Modal from '@/components/Modal';
import { getFromStorage, saveToStorage, STORAGE_KEYS, generateId, formatDate } from '@/lib/storage';
import { VODSet, Session, SessionContent, ActCanvasQuestion } from '@/types/vod';
import { Assignment } from '@/types/assignment';
import WorkflowGuide from '@/components/WorkflowGuide';

// Sortable Session Item Component
function SortableSessionItem({
  session,
  onEdit,
  onDelete,
  assignmentCount,
}: {
  session: Session;
  onEdit: (session: Session) => void;
  onDelete: (session: Session) => void;
  assignmentCount: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: session.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getContentSummary = (contents: SessionContent) => {
    const parts = [];
    if (contents.vods && contents.vods.length > 0) {
      parts.push(`VOD (${contents.vods.length})`);
    }
    if (contents.actCanvas && contents.actCanvas.questions.length > 0) {
      parts.push(`ActCanvas (${contents.actCanvas.questions.length})`);
    }
    if (contents.aiChat?.enabled) {
      parts.push('AI Chat');
    }
    if (assignmentCount > 0) {
      parts.push(`과제 (${assignmentCount})`);
    }
    return parts.join(', ') || '컨텐츠 없음';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:bg-gray-100 transition-colors cursor-pointer"
      onClick={() => onEdit(session)}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="p-2 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing mt-1"
          title="드래그하여 순서 변경"
        >
          <Bars3Icon className="w-5 h-5" />
        </button>

        {/* Session Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900">{session.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{getContentSummary(session.contents)}</p>
            </div>

            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(session);
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
              title="삭제"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VODSetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toasts, success, error, hideToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [vodSet, setVodSet] = useState<VODSet | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);

  // Session form state
  const [sessionForm, setSessionForm] = useState({
    name: '',
    vods: [] as { url: string; description: string }[],
    actCanvasQuestions: [] as ActCanvasQuestion[],
  });

  // Assignment management state
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    isRequired: true,
  });

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load VOD Set
  useEffect(() => {
    const vodSets = getFromStorage<VODSet>(STORAGE_KEYS.VOD_SETS || 'ud_backoffice_vod_sets');
    const id = Number(params.id);
    const found = vodSets.find((set) => set.id === id);

    if (found) {
      setVodSet(found);
      // Load assignments for this VOD set
      const allAssignments = getFromStorage<Assignment>(STORAGE_KEYS.SESSION_ASSIGNMENTS);
      const vodSetAssignments = allAssignments.filter((a) => a.vodSetId === found.id);
      setAssignments(vodSetAssignments);
    } else {
      error('VOD 세트를 찾을 수 없습니다');
      setTimeout(() => {
        router.push('/education/vod-sets');
      }, 1500);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  // Get assignment count for a session
  const getAssignmentCount = (sessionId: number) => {
    return assignments.filter((a) => a.sessionId === sessionId).length;
  };

  // Save VOD Set to storage
  const saveVodSet = (updatedSet: VODSet) => {
    const vodSets = getFromStorage<VODSet>(STORAGE_KEYS.VOD_SETS || 'ud_backoffice_vod_sets');
    const updatedSets = vodSets.map((set) => (set.id === updatedSet.id ? updatedSet : set));
    saveToStorage(STORAGE_KEYS.VOD_SETS || 'ud_backoffice_vod_sets', updatedSets);
    setVodSet(updatedSet);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!vodSet || !over || active.id === over.id) return;

    const oldIndex = vodSet.sessions.findIndex((s) => s.id === active.id);
    const newIndex = vodSet.sessions.findIndex((s) => s.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedSessions = arrayMove(vodSet.sessions, oldIndex, newIndex);
      // Update order numbers
      const updatedSessions = reorderedSessions.map((session, index) => ({
        ...session,
        order: index + 1,
      }));

      const updatedSet = { ...vodSet, sessions: updatedSessions };
      saveVodSet(updatedSet);
      success('세션 순서가 변경되었습니다');
    }
  };

  // Open create session modal
  const handleCreateSession = () => {
    setEditingSession(null);
    setCurrentSession(null);
    setSessionForm({
      name: '',
      vods: [],
      actCanvasQuestions: [],
    });
    setAssignmentForm({
      title: '',
      description: '',
      dueDate: '',
      isRequired: true,
    });
    setShowSessionModal(true);
  };

  // Open edit session modal
  const handleEditSession = (session: Session) => {
    setEditingSession(session);
    setCurrentSession(session);
    setSessionForm({
      name: session.name,
      vods: session.contents.vods || [],
      actCanvasQuestions: session.contents.actCanvas?.questions || [],
    });
    // Reset assignment form
    setAssignmentForm({
      title: '',
      description: '',
      dueDate: '',
      isRequired: true,
    });
    setShowSessionModal(true);
  };

  // Delete session
  const handleDeleteSession = (session: Session) => {
    if (!vodSet) return;

    if (confirm(`"${session.name}" 세션을 삭제하시겠습니까?`)) {
      const updatedSessions = vodSet.sessions
        .filter((s) => s.id !== session.id)
        .map((s, index) => ({ ...s, order: index + 1 }));

      const updatedSet = {
        ...vodSet,
        sessions: updatedSessions,
      };

      saveVodSet(updatedSet);
      success('세션이 삭제되었습니다');
    }
  };

  // Save session
  const handleSaveSession = () => {
    if (!vodSet) return;

    if (!sessionForm.name.trim()) {
      error('세션명을 입력해주세요');
      return;
    }

    const sessionContents: SessionContent = {};

    // Add VODs if provided
    if (sessionForm.vods.length > 0) {
      sessionContents.vods = sessionForm.vods;
    }

    // Add ActCanvas if questions exist
    if (sessionForm.actCanvasQuestions.length > 0) {
      sessionContents.actCanvas = {
        questions: sessionForm.actCanvasQuestions,
      };
    }

    if (editingSession) {
      // Update existing session
      const updatedSessions = vodSet.sessions.map((s) =>
        s.id === editingSession.id
          ? {
              ...s,
              name: sessionForm.name,
              contents: sessionContents,
            }
          : s
      );

      const updatedSet = {
        ...vodSet,
        sessions: updatedSessions,
      };

      saveVodSet(updatedSet);
      success('세션이 수정되었습니다');
    } else {
      // Create new session
      const newSession: Session = {
        id: generateId(),
        setId: vodSet.id,
        name: sessionForm.name,
        order: vodSet.sessions.length + 1,
        contents: sessionContents,
      };

      const updatedSet = {
        ...vodSet,
        sessions: [...vodSet.sessions, newSession],
      };

      saveVodSet(updatedSet);
      success('세션이 생성되었습니다');

      // Set current session for assignment management
      setCurrentSession(newSession);
      setEditingSession(newSession);
    }

    setShowSessionModal(false);
  };

  // Add VOD
  const handleAddVOD = () => {
    setSessionForm({
      ...sessionForm,
      vods: [...sessionForm.vods, { url: '', description: '' }],
    });
  };

  // Remove VOD
  const handleRemoveVOD = (index: number) => {
    setSessionForm({
      ...sessionForm,
      vods: sessionForm.vods.filter((_, i) => i !== index),
    });
  };

  // Update VOD
  const handleUpdateVOD = (index: number, field: 'url' | 'description', value: string) => {
    setSessionForm({
      ...sessionForm,
      vods: sessionForm.vods.map((vod, i) => (i === index ? { ...vod, [field]: value } : vod)),
    });
  };

  // Add ActCanvas question
  const handleAddQuestion = () => {
    const newQuestion: ActCanvasQuestion = {
      id: Date.now(),
      question: '',
      type: 'essay',
      required: false,
      order: sessionForm.actCanvasQuestions.length + 1,
    };

    setSessionForm({
      ...sessionForm,
      actCanvasQuestions: [...sessionForm.actCanvasQuestions, newQuestion],
    });
  };

  // Remove ActCanvas question
  const handleRemoveQuestion = (id: number) => {
    setSessionForm({
      ...sessionForm,
      actCanvasQuestions: sessionForm.actCanvasQuestions
        .filter((q) => q.id !== id)
        .map((q, index) => ({ ...q, order: index + 1 })),
    });
  };

  // Update ActCanvas question
  const handleUpdateQuestion = (id: number, field: string, value: any) => {
    setSessionForm({
      ...sessionForm,
      actCanvasQuestions: sessionForm.actCanvasQuestions.map((q) =>
        q.id === id ? { ...q, [field]: value } : q
      ),
    });
  };

  // Add assignment
  const handleAddAssignment = () => {
    if (!vodSet || !currentSession) return;
    if (!assignmentForm.title.trim()) {
      error('과제명을 입력해주세요');
      return;
    }

    const newAssignment: Assignment = {
      id: generateId(),
      vodSetId: vodSet.id,
      vodSetName: vodSet.name,
      sessionId: currentSession.id,
      sessionTitle: currentSession.name,
      title: assignmentForm.title,
      description: assignmentForm.description,
      dueDate: assignmentForm.dueDate,
      isRequired: assignmentForm.isRequired,
      createdAt: formatDate(),
      updatedAt: formatDate(),
    };

    const allAssignments = getFromStorage<Assignment>(STORAGE_KEYS.SESSION_ASSIGNMENTS);
    const updated = [...allAssignments, newAssignment];
    saveToStorage(STORAGE_KEYS.SESSION_ASSIGNMENTS, updated);
    setAssignments([...assignments, newAssignment]);

    // Reset form
    setAssignmentForm({
      title: '',
      description: '',
      dueDate: '',
      isRequired: true,
    });

    success('과제가 추가되었습니다');
  };

  // Delete assignment
  const handleDeleteAssignment = (assignmentId: number) => {
    if (!confirm('이 과제를 삭제하시겠습니까?')) return;

    const allAssignments = getFromStorage<Assignment>(STORAGE_KEYS.SESSION_ASSIGNMENTS);
    const updated = allAssignments.filter((a) => a.id !== assignmentId);
    saveToStorage(STORAGE_KEYS.SESSION_ASSIGNMENTS, updated);
    setAssignments(assignments.filter((a) => a.id !== assignmentId));

    success('과제가 삭제되었습니다');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (!vodSet) {
    return null;
  }

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
        <button
          onClick={() => router.push('/education/vod-sets')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>목록으로 돌아가기</span>
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{vodSet.name}</h1>
            <p className="text-gray-600 mt-2">{vodSet.description}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
              <span>프로그램: {vodSet.programName}</span>
              <span>카테고리: {vodSet.category}</span>
              <span>세션: {vodSet.sessions.length}개</span>
            </div>
          </div>
          <button
            onClick={() => router.push(`/education/vod-sets/${vodSet.id}/edit`)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            세트 정보 수정
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleCreateSession}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          세션 추가
        </button>
      </div>

      {/* Sessions List */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">세션 목록</h2>

        {vodSet.sessions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>세션이 없습니다.</p>
            <p className="text-sm mt-1">위 버튼을 클릭하여 세션을 추가해주세요.</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={vodSet.sessions.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {vodSet.sessions.map((session) => (
                  <SortableSessionItem
                    key={session.id}
                    session={session}
                    onEdit={handleEditSession}
                    onDelete={handleDeleteSession}
                    assignmentCount={getAssignmentCount(session.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Session Modal */}
      <Modal
        isOpen={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        title={editingSession ? '세션 수정' : '세션 생성'}
      >
        <div className="space-y-6">
          {/* Session Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              세션명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={sessionForm.name}
              onChange={(e) => setSessionForm({ ...sessionForm, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="예: 1-1. 컴포넌트 이해하기"
            />
          </div>

          {/* VOD Section */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">VOD 컨텐츠</h4>
              <button
                onClick={handleAddVOD}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                + VOD 추가
              </button>
            </div>

            {sessionForm.vods.length === 0 ? (
              <p className="text-sm text-gray-500">VOD가 없습니다</p>
            ) : (
              <div className="space-y-3">
                {sessionForm.vods.map((vod, index) => (
                  <div key={index} className="border border-gray-200 rounded p-3">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">VOD {index + 1}</span>
                      <button
                        onClick={() => handleRemoveVOD(index)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        삭제
                      </button>
                    </div>
                    <input
                      type="text"
                      value={vod.url}
                      onChange={(e) => handleUpdateVOD(index, 'url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="VOD URL (예: https://youtube.com/...)"
                    />
                    <textarea
                      value={vod.description}
                      onChange={(e) => handleUpdateVOD(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="VOD 설명..."
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ActCanvas Section */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">ActCanvas 질문</h4>
              <button
                onClick={handleAddQuestion}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                + 질문 추가
              </button>
            </div>

            {sessionForm.actCanvasQuestions.length === 0 ? (
              <p className="text-sm text-gray-500">질문이 없습니다</p>
            ) : (
              <div className="space-y-3">
                {sessionForm.actCanvasQuestions.map((question, index) => (
                  <div key={question.id} className="border border-gray-200 rounded p-3">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">질문 {index + 1}</span>
                      <button
                        onClick={() => handleRemoveQuestion(question.id)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        삭제
                      </button>
                    </div>
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) =>
                        handleUpdateQuestion(question.id, 'question', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="질문 내용"
                    />
                    <div className="flex items-center gap-3">
                      <select
                        value={question.type}
                        onChange={(e) => handleUpdateQuestion(question.id, 'type', e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="text">단답형</option>
                        <option value="essay">서술형</option>
                        <option value="choice">선택형</option>
                        <option value="file">파일</option>
                      </select>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={question.required}
                          onChange={(e) =>
                            handleUpdateQuestion(question.id, 'required', e.target.checked)
                          }
                          className="w-4 h-4 text-primary-600"
                        />
                        <span>필수</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assignment Management Section */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4">과제 관리</h4>

            {!editingSession ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-sm text-blue-800">
                  세션을 먼저 저장한 후 과제를 추가할 수 있습니다.
                </p>
              </div>
            ) : (
              <>
                {/* New Assignment Form */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">새 과제 추가</p>
                  <div className="space-y-3">
                    <div>
                      <input
                        type="text"
                        value={assignmentForm.title}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="과제명 (예: React 컴포넌트 만들기)"
                      />
                    </div>
                    <div>
                      <textarea
                        value={assignmentForm.description}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="과제 설명..."
                      />
                    </div>
                    <div className="flex gap-3 items-center">
                      <input
                        type="date"
                        value={assignmentForm.dueDate}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={assignmentForm.isRequired}
                          onChange={(e) => setAssignmentForm({ ...assignmentForm, isRequired: e.target.checked })}
                          className="w-4 h-4 text-primary-600 rounded"
                        />
                        <span className="text-sm text-gray-700">필수</span>
                      </label>
                    </div>
                    <button
                      onClick={handleAddAssignment}
                      className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      과제 추가
                    </button>
                  </div>
                </div>

                {/* Existing Assignments List */}
                {currentSession && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      등록된 과제 ({getAssignmentCount(currentSession.id)}개)
                    </p>
                    {getAssignmentCount(currentSession.id) === 0 ? (
                      <p className="text-sm text-gray-500">등록된 과제가 없습니다</p>
                    ) : (
                      <div className="space-y-2">
                        {assignments
                          .filter((a) => a.sessionId === currentSession.id)
                          .map((assignment) => (
                            <div key={assignment.id} className="border border-gray-200 rounded p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900 text-sm">{assignment.title}</h5>
                                  {assignment.description && (
                                    <p className="text-xs text-gray-600 mt-1">{assignment.description}</p>
                                  )}
                                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                    {assignment.dueDate && <span>마감: {assignment.dueDate}</span>}
                                    <span className={assignment.isRequired ? 'text-red-600' : 'text-gray-500'}>
                                      {assignment.isRequired ? '필수' : '선택'}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeleteAssignment(assignment.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="삭제"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleSaveSession}
              className="flex-1 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              저장
            </button>
            <button
              onClick={() => setShowSessionModal(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      </Modal>

      {/* Workflow Guide */}
      <WorkflowGuide
        title="🎬 VOD 세트 상세 관리 워크플로우"
        description="세션을 추가하고 컨텐츠를 구성하는 전체 과정을 안내합니다"
        steps={[
          {
            step: 1,
            title: '세션 추가',
            description: '"세션 추가" 버튼을 클릭하여 새로운 세션을 생성합니다. 세션명은 "1-1. 컴포넌트 이해하기"처럼 구체적으로 작성하세요.',
          },
          {
            step: 2,
            title: 'VOD 및 ActCanvas 구성',
            description: '각 세션에 VOD 영상을 추가하고, ActCanvas 질문을 통해 학습 활동을 구성합니다.',
          },
          {
            step: 3,
            title: '과제 추가',
            description: '세션을 저장한 후, 해당 세션에 과제를 추가할 수 있습니다. 필수/선택 여부와 마감일을 설정하세요.',
          },
          {
            step: 4,
            title: '세션 순서 조정',
            description: '드래그 앤 드롭으로 세션 순서를 변경하여 학습 흐름을 최적화합니다.',
          },
          {
            step: 5,
            title: '세트 정보 수정',
            description: '필요시 "세트 정보 수정" 버튼을 클릭하여 세트명, 카테고리, 상태 등을 변경합니다.',
          },
        ]}
        keyFeatures={[
          '세션별 VOD 영상 및 ActCanvas 질문 구성',
          '드래그 앤 드롭으로 세션 순서 변경',
          '세션별 과제 추가 및 관리',
          'VOD URL 및 설명 입력',
          'ActCanvas 질문 유형 설정 (단답형/서술형/선택형/파일)',
          '과제 필수 여부 및 마감일 설정',
          '세션 및 과제 삭제',
        ]}
        tips={[
          'VOD는 YouTube URL을 입력하세요. 여러 개의 VOD를 하나의 세션에 추가할 수 있습니다.',
          'ActCanvas 질문은 VOD 시청 후 학습 내용을 점검하는 용도로 활용하세요.',
          '과제는 세션을 먼저 저장한 후 추가할 수 있습니다. 세션 생성 직후에는 과제 섹션이 활성화됩니다.',
          '세션 순서는 언제든 드래그로 변경 가능하며, 변경사항은 즉시 저장됩니다.',
        ]}
      />
    </div>
  );
}
