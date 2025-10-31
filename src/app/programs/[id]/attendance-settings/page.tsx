'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  ClockIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { getFromStorage, saveToStorage, STORAGE_KEYS, generateId, formatDate } from '@/lib/storage';
import { AttendanceSettings } from '@/types/program';

// Mock programs
const mockPrograms = [
  { id: 1, title: 'YEEEYEP 인도네시아' },
  { id: 2, title: '하나유니브' },
  { id: 3, title: 'SuTEAM' },
];

const weekdayLabels = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

export default function AttendanceSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const { toasts, success, error, hideToast } = useToast();

  const [program, setProgram] = useState<any>(null);
  const [settings, setSettings] = useState<AttendanceSettings | null>(null);
  const [formData, setFormData] = useState({
    checkInTime: '09:00',
    checkOutTime: '18:00',
    lateThreshold: 10, // 10분
    absentThreshold: 30, // 30분
    autoCheckOut: true,
    weekdays: [1, 2, 3, 4, 5], // 월-금
  });

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

  // Load existing settings
  useEffect(() => {
    if (!program) return;

    const allSettings = getFromStorage<AttendanceSettings>(STORAGE_KEYS.ATTENDANCE_SETTINGS);
    const existing = allSettings.find((s) => s.programId === program.id);

    if (existing) {
      setSettings(existing);
      setFormData({
        checkInTime: existing.checkInTime,
        checkOutTime: existing.checkOutTime,
        lateThreshold: existing.lateThreshold,
        absentThreshold: existing.absentThreshold,
        autoCheckOut: existing.autoCheckOut,
        weekdays: existing.weekdays,
      });
    }
  }, [program]);

  // Handle weekday toggle
  const handleToggleWeekday = (day: number) => {
    if (formData.weekdays.includes(day)) {
      setFormData({
        ...formData,
        weekdays: formData.weekdays.filter((d) => d !== day),
      });
    } else {
      setFormData({
        ...formData,
        weekdays: [...formData.weekdays, day].sort(),
      });
    }
  };

  // Handle save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!program) return;

    // 유효성 검사
    if (!formData.checkInTime || !formData.checkOutTime) {
      error('체크인/체크아웃 시간을 입력해주세요');
      return;
    }

    if (formData.weekdays.length === 0) {
      error('출결 체크 요일을 하나 이상 선택해주세요');
      return;
    }

    const allSettings = getFromStorage<AttendanceSettings>(STORAGE_KEYS.ATTENDANCE_SETTINGS);

    if (settings) {
      // 기존 설정 업데이트
      const updated = allSettings.map((s) =>
        s.id === settings.id
          ? {
              ...s,
              checkInTime: formData.checkInTime,
              checkOutTime: formData.checkOutTime,
              lateThreshold: formData.lateThreshold,
              absentThreshold: formData.absentThreshold,
              autoCheckOut: formData.autoCheckOut,
              weekdays: formData.weekdays,
              updatedAt: formatDate(),
            }
          : s
      );
      saveToStorage(STORAGE_KEYS.ATTENDANCE_SETTINGS, updated);
      success('출결관리 설정이 업데이트되었습니다');
    } else {
      // 새 설정 생성
      const newSettings: AttendanceSettings = {
        id: generateId(),
        programId: program.id,
        checkInTime: formData.checkInTime,
        checkOutTime: formData.checkOutTime,
        lateThreshold: formData.lateThreshold,
        absentThreshold: formData.absentThreshold,
        autoCheckOut: formData.autoCheckOut,
        weekdays: formData.weekdays,
        createdAt: formatDate(),
        updatedAt: formatDate(),
      };
      saveToStorage(STORAGE_KEYS.ATTENDANCE_SETTINGS, [...allSettings, newSettings]);
      setSettings(newSettings);
      success('출결관리 설정이 저장되었습니다');
    }
  };

  if (!program) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Toasts */}
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => hideToast(toast.id)} />
      ))}

      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push(`/programs/${program.id}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>프로그램 상세로 돌아가기</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{program.title} - 출결관리 세팅</h1>
        <p className="text-gray-600 mt-2">출결 체크 시간 및 규칙을 설정합니다</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* 출결 시간 설정 */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <ClockIcon className="w-6 h-6 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">출결 시간 설정</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                체크인 시간 <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                required
                value={formData.checkInTime}
                onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">출석 체크를 시작하는 시간</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                체크아웃 시간 <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                required
                value={formData.checkOutTime}
                onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">퇴실 체크를 종료하는 시간</p>
            </div>
          </div>
        </div>

        {/* 지각/결석 기준 */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">지각/결석 기준</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                지각 기준 (분)
              </label>
              <input
                type="number"
                min="1"
                value={formData.lateThreshold}
                onChange={(e) => setFormData({ ...formData, lateThreshold: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                체크인 시간으로부터 이 시간 이내 도착 시 지각 처리
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                결석 기준 (분)
              </label>
              <input
                type="number"
                min="1"
                value={formData.absentThreshold}
                onChange={(e) => setFormData({ ...formData, absentThreshold: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                체크인 시간으로부터 이 시간 이후 도착 시 결석 처리
              </p>
            </div>
          </div>

          <div className="mt-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoCheckOut}
                onChange={(e) => setFormData({ ...formData, autoCheckOut: e.target.checked })}
                className="w-5 h-5 text-primary-600 rounded"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">자동 체크아웃</span>
                <p className="text-xs text-gray-500">
                  체크아웃 시간이 지나면 자동으로 퇴실 처리합니다
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* 출결 체크 요일 */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <CalendarDaysIcon className="w-6 h-6 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              출결 체크 요일 <span className="text-red-500">*</span>
            </h2>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {[0, 1, 2, 3, 4, 5, 6].map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => handleToggleWeekday(day)}
                className={`p-3 rounded-lg border-2 transition-colors text-center ${
                  formData.weekdays.includes(day)
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <div className="text-xs font-medium">{weekdayLabels[day]}</div>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            선택한 요일에만 출결 체크가 진행됩니다
          </p>
        </div>

        {/* 설정 예시 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">현재 설정 요약</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 체크인: {formData.checkInTime} / 체크아웃: {formData.checkOutTime}</li>
            <li>
              • {formData.checkInTime}부터 {formData.lateThreshold}분 이내 도착 → 지각
            </li>
            <li>
              • {formData.checkInTime}부터 {formData.absentThreshold}분 이후 도착 → 결석
            </li>
            <li>
              • 출결 체크 요일: {formData.weekdays.map((d) => weekdayLabels[d]).join(', ')}
            </li>
            <li>
              • 자동 체크아웃: {formData.autoCheckOut ? '활성화' : '비활성화'}
            </li>
          </ul>
        </div>

        {/* Info */}
        <div className="bg-gray-50 border rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">출결관리 안내</h3>
          <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
            <li>설정한 시간과 규칙은 출결 자동 체크 시스템에 적용됩니다</li>
            <li>프로그램 진행 중에도 설정을 수정할 수 있습니다</li>
            <li>지각/결석 기록은 학생 평가 및 출석률 계산에 반영됩니다</li>
            <li>요일별 출결 체크 여부를 커스터마이징할 수 있습니다</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            {settings ? '설정 업데이트' : '설정 저장'}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/programs/${program.id}`)}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
