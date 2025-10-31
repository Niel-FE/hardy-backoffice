'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  PlayCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { getFromStorage, saveToStorage, STORAGE_KEYS, generateId, formatDateTime } from '@/lib/storage';
import { VODSet } from '@/types/vod';
import { VODViewingHistory } from '@/types/progress';

interface Student {
  id: number;
  name: string;
  email: string;
  program: string;
  programId: number;
}

// Mock students
const mockStudents: Student[] = [
  { id: 1, name: '김철수', email: 'kim.cs@example.com', program: 'YEEEYEP 인도네시아', programId: 1 },
  { id: 2, name: '이영희', email: 'lee.yh@example.com', program: 'YEEEYEP 인도네시아', programId: 1 },
  { id: 3, name: '박민수', email: 'park.ms@example.com', program: 'YEEEYEP 인도네시아', programId: 1 },
];

export default function ViewingHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const { toasts, success, error, hideToast } = useToast();

  const [student, setStudent] = useState<Student | null>(null);
  const [viewingHistory, setViewingHistory] = useState<VODViewingHistory[]>([]);
  const [vodSets, setVodSets] = useState<VODSet[]>([]);
  const [selectedVODSetId, setSelectedVODSetId] = useState<number>(0);

  // Load student data
  useEffect(() => {
    const id = Number(params.id);
    const found = mockStudents.find((s) => s.id === id);
    if (found) {
      setStudent(found);
    } else {
      error('학생을 찾을 수 없습니다');
      setTimeout(() => {
        router.push('/students/list');
      }, 1500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  // Load viewing history and VOD sets
  useEffect(() => {
    if (!student) return;

    const allVODSets = getFromStorage<VODSet>(STORAGE_KEYS.VOD_SETS || 'ud_backoffice_vod_sets');
    setVodSets(allVODSets);

    const history = getFromStorage<VODViewingHistory>(STORAGE_KEYS.VOD_VIEWING_HISTORY);
    const studentHistory = history.filter((h) => h.studentId === student.id);
    setViewingHistory(studentHistory);

    // Initialize mock viewing history if none exists
    if (studentHistory.length === 0) {
      const mockHistory: VODViewingHistory[] = [];

      allVODSets.slice(0, 2).forEach((vodSet) => {
        vodSet.sessions.slice(0, 2).forEach((session) => {
          session.contents.vods?.forEach((vod, vodIndex) => {
            const totalDuration = 2700; // 45 minutes in seconds
            const watchedDuration = Math.floor(Math.random() * totalDuration);
            const completed = watchedDuration >= totalDuration * 0.9;

            const historyItem: VODViewingHistory = {
              id: generateId(),
              studentId: student.id,
              studentName: student.name,
              programId: student.programId,
              vodSetId: vodSet.id,
              sessionId: session.id,
              vodUrl: vod.url,
              vodDescription: vod.description || `${session.name} - VOD ${vodIndex + 1}`,
              watchedDuration,
              totalDuration,
              progressPercentage: Math.round((watchedDuration / totalDuration) * 100),
              completed,
              firstWatchedAt: formatDateTime(new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)),
              lastWatchedAt: formatDateTime(new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)),
              watchCount: Math.floor(Math.random() * 5) + 1,
            };
            mockHistory.push(historyItem);
          });
        });
      });

      saveToStorage(STORAGE_KEYS.VOD_VIEWING_HISTORY, [...history, ...mockHistory]);
      setViewingHistory(mockHistory);
    }
  }, [student]);

  if (!student) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  // Filter history by selected VOD set
  const filteredHistory = selectedVODSetId === 0
    ? viewingHistory
    : viewingHistory.filter((h) => h.vodSetId === selectedVODSetId);

  // Calculate statistics
  const totalWatchTime = viewingHistory.reduce((sum, h) => sum + h.watchedDuration, 0);
  const completedCount = viewingHistory.filter((h) => h.completed).length;
  const avgProgress = viewingHistory.length > 0
    ? Math.round(viewingHistory.reduce((sum, h) => sum + h.progressPercentage, 0) / viewingHistory.length)
    : 0;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    } else if (minutes > 0) {
      return `${minutes}분 ${secs}초`;
    } else {
      return `${secs}초`;
    }
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
          onClick={() => router.push(`/students/${student.id}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>학생 상세로 돌아가기</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{student.name} - VOD 시청 이력</h1>
        <p className="text-gray-600 mt-2">VOD 시청 기록 및 통계</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <ClockIcon className="w-5 h-5 text-primary-600" />
            <p className="text-sm text-gray-600">총 시청 시간</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatDuration(totalWatchTime)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <PlayCircleIcon className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-gray-600">시청한 VOD</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{viewingHistory.length}개</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircleIcon className="w-5 h-5 text-green-600" />
            <p className="text-sm text-gray-600">완료한 VOD</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{completedCount}개</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <ChartBarIcon className="w-5 h-5 text-purple-600" />
            <p className="text-sm text-gray-600">평균 진도율</p>
          </div>
          <p className="text-2xl font-bold text-purple-600">{avgProgress}%</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">VOD 세트 필터:</label>
          <select
            value={selectedVODSetId}
            onChange={(e) => setSelectedVODSetId(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value={0}>전체</option>
            {vodSets.map((vodSet) => (
              <option key={vodSet.id} value={vodSet.id}>
                {vodSet.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Viewing History List */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">시청 이력</h2>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            시청 이력이 없습니다.
          </div>
        ) : (
          <div className="divide-y">
            {filteredHistory.map((history) => {
              const vodSet = vodSets.find((vs) => vs.id === history.vodSetId);
              const session = vodSet?.sessions.find((s) => s.id === history.sessionId);

              return (
                <div key={history.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {history.completed ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        ) : (
                          <PlayCircleIcon className="w-5 h-5 text-blue-600" />
                        )}
                        <h3 className="font-semibold text-gray-900">{history.vodDescription}</h3>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>VOD 세트: {vodSet?.name}</p>
                        <p>세션: {session?.name}</p>
                        <p>URL: <a href={history.vodUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">{history.vodUrl}</a></p>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      {history.completed ? (
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          완료
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          진행중
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>진도율: {history.progressPercentage}%</span>
                      <span>{formatDuration(history.watchedDuration)} / {formatDuration(history.totalDuration)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${history.completed ? 'bg-green-600' : 'bg-blue-600'}`}
                        style={{ width: `${history.progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <p className="text-xs text-gray-500">첫 시청</p>
                      <p className="font-medium">{history.firstWatchedAt}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">마지막 시청</p>
                      <p className="font-medium">{history.lastWatchedAt}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">시청 횟수</p>
                      <p className="font-medium">{history.watchCount}회</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">VOD 시청 이력 정보</h3>
        <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
          <li>VOD 시청 시간은 실제 시청한 누적 시간을 표시합니다</li>
          <li>진도율이 90% 이상이면 완료로 표시됩니다</li>
          <li>시청 횟수는 해당 VOD를 몇 번 재생했는지 나타냅니다</li>
          <li>마지막 시청 시간은 가장 최근에 VOD를 시청한 시각입니다</li>
        </ul>
      </div>
    </div>
  );
}
