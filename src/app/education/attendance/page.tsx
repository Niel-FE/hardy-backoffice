'use client';

import { useState } from 'react';
import {
  MagnifyingGlassIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import WorkflowGuide from '@/components/WorkflowGuide';

interface AttendanceRecord {
  id: number;
  student: string;
  team: string;
  program: string;
  date: string;
  sessionType: 'lecture' | 'workshop' | 'mentoring';
  sessionTitle: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  checkInTime?: string;
  note?: string;
}

const mockAttendance: AttendanceRecord[] = [
  {
    id: 1,
    student: '김철수',
    team: '이노베이터스',
    program: 'YEEEYEP 인도네시아',
    date: '2025-10-15',
    sessionType: 'lecture',
    sessionTitle: '비즈니스 모델 캔버스',
    status: 'present',
    checkInTime: '09:02',
  },
  {
    id: 2,
    student: '이영희',
    team: '스타트업랩',
    program: 'YEEEYEP 인도네시아',
    date: '2025-10-15',
    sessionType: 'lecture',
    sessionTitle: '비즈니스 모델 캔버스',
    status: 'late',
    checkInTime: '09:15',
    note: '교통 지연',
  },
  {
    id: 3,
    student: '박민수',
    team: '벤처스',
    program: 'YEEEYEP 인도네시아',
    date: '2025-10-15',
    sessionType: 'lecture',
    sessionTitle: '비즈니스 모델 캔버스',
    status: 'absent',
  },
  {
    id: 4,
    student: '정수진',
    team: '이노베이터스',
    program: '하나유니브',
    date: '2025-10-15',
    sessionType: 'workshop',
    sessionTitle: '고객 인터뷰 실습',
    status: 'present',
    checkInTime: '14:00',
  },
  {
    id: 5,
    student: '최동욱',
    team: '이노베이터스',
    program: 'YEEEYEP 인도네시아',
    date: '2025-10-14',
    sessionType: 'mentoring',
    sessionTitle: '1:1 멘토링',
    status: 'excused',
    note: '사전 승인된 개인 사유',
  },
];

interface AttendanceSession {
  id: number;
  date: string;
  title: string;
  program: string;
  type: 'lecture' | 'workshop' | 'mentoring';
  startTime: string;
  endTime: string;
  expectedCount: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
}

const mockSessions: AttendanceSession[] = [
  {
    id: 1,
    date: '2025-10-15',
    title: '비즈니스 모델 캔버스',
    program: 'YEEEYEP 인도네시아',
    type: 'lecture',
    startTime: '09:00',
    endTime: '12:00',
    expectedCount: 35,
    presentCount: 28,
    lateCount: 5,
    absentCount: 2,
  },
  {
    id: 2,
    date: '2025-10-15',
    title: '고객 인터뷰 실습',
    program: '하나유니브',
    type: 'workshop',
    startTime: '14:00',
    endTime: '17:00',
    expectedCount: 45,
    presentCount: 42,
    lateCount: 2,
    absentCount: 1,
  },
  {
    id: 3,
    date: '2025-10-14',
    title: '시장 조사 프로젝트 실습',
    program: 'YEEEYEP 인도네시아',
    type: 'workshop',
    startTime: '13:00',
    endTime: '18:00',
    expectedCount: 35,
    presentCount: 33,
    lateCount: 1,
    absentCount: 1,
  },
];

export default function AttendanceManagementPage() {
  const [view, setView] = useState<'sessions' | 'records'>('sessions');
  const [sessions, setSessions] = useState<AttendanceSession[]>(mockSessions);
  const [records, setRecords] = useState<AttendanceRecord[]>(mockAttendance);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('2025-10-15');

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !selectedDate || session.date === selectedDate;
    return matchesSearch && matchesDate;
  });

  const filteredRecords = records.filter((record) => {
    const matchesSearch = record.student.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !selectedDate || record.date === selectedDate;
    return matchesSearch && matchesDate;
  });

  const getStatusBadge = (status: AttendanceRecord['status']) => {
    const styles = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800',
      excused: 'bg-blue-100 text-blue-800',
    };
    const labels = {
      present: '출석',
      absent: '결석',
      late: '지각',
      excused: '사유',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getSessionTypeBadge = (type: AttendanceSession['type']) => {
    const styles = {
      lecture: 'bg-purple-100 text-purple-800',
      workshop: 'bg-orange-100 text-orange-800',
      mentoring: 'bg-teal-100 text-teal-800',
    };
    const labels = {
      lecture: '강의',
      workshop: '실습',
      mentoring: '멘토링',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[type]}`}>
        {labels[type]}
      </span>
    );
  };

  const getAttendanceRate = (session: AttendanceSession) => {
    return ((session.presentCount / session.expectedCount) * 100).toFixed(0);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">출석 관리</h1>
        <p className="text-gray-600 mt-2">교육생 출석 현황 및 관리</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600">오늘 세션</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {sessions.filter((s) => s.date === '2025-10-15').length}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600">출석</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {records.filter((r) => r.status === 'present' && r.date === '2025-10-15').length}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600">지각</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {records.filter((r) => r.status === 'late' && r.date === '2025-10-15').length}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600">결석</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {records.filter((r) => r.status === 'absent' && r.date === '2025-10-15').length}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600">평균 출석률</p>
          <p className="text-2xl font-bold text-primary-600 mt-1">
            {sessions.length > 0
              ? (
                  (sessions.reduce((sum, s) => sum + s.presentCount, 0) /
                    sessions.reduce((sum, s) => sum + s.expectedCount, 0)) *
                  100
                ).toFixed(0)
              : 0}
            %
          </p>
        </div>
      </div>

      {/* View Toggle and Filters */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* View Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setView('sessions')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === 'sessions'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              세션별 보기
            </button>
            <button
              onClick={() => setView('records')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === 'records'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              개인별 보기
            </button>
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder={view === 'sessions' ? '세션 제목으로 검색...' : '교육생 이름으로 검색...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-gray-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Sessions View */}
      {view === 'sessions' && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  날짜
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  세션명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  프로그램
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  유형
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  시간
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  출석률
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  출석/지각/결석
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{session.date}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{session.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{session.program}</div>
                  </td>
                  <td className="px-6 py-4">{getSessionTypeBadge(session.type)}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {session.startTime} - {session.endTime}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-gray-900">
                        {getAttendanceRate(session)}%
                      </div>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${getAttendanceRate(session)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3 text-sm">
                      <span className="text-green-600 font-medium">{session.presentCount}</span>
                      <span className="text-yellow-600 font-medium">{session.lateCount}</span>
                      <span className="text-red-600 font-medium">{session.absentCount}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredSessions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">검색 결과가 없습니다.</p>
            </div>
          )}
        </div>
      )}

      {/* Records View */}
      {view === 'records' && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  교육생
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  팀
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  프로그램
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  세션
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  날짜
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  체크인 시간
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  비고
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{record.student}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{record.team}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{record.program}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{record.sessionTitle}</div>
                    <div className="text-xs text-gray-500">{getSessionTypeBadge(record.sessionType)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{record.date}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {record.checkInTime || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(record.status)}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{record.note || '-'}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRecords.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">검색 결과가 없습니다.</p>
            </div>
          )}
        </div>
      )}

      {/* Workflow Guide */}
      <WorkflowGuide
        title="✅ 출석 관리 워크플로우"
        description="세션별 출석 체크 및 출석률 관리 과정을 안내합니다"
        steps={[
          {
            step: 1,
            title: '세션 선택',
            description: '출석을 체크할 세션을 선택합니다. 강의, 워크샵, 멘토링 등 세션 유형별로 조회할 수 있습니다.',
          },
          {
            step: 2,
            title: '출석 현황 확인',
            description: '학생별 출석 상태를 실시간으로 확인합니다. 출석, 지각, 결석, 사유 처리 상태를 한눈에 파악할 수 있습니다.',
          },
          {
            step: 3,
            title: '출석 상태 입력',
            description: '각 학생의 출석 상태를 체크하거나, QR 코드 스캔을 통한 자동 체크인 결과를 확인합니다.',
          },
          {
            step: 4,
            title: '사유 처리',
            description: '결석이나 지각에 대한 사유를 확인하고 승인/반려 처리합니다.',
          },
          {
            step: 5,
            title: '출석률 분석',
            description: '개인별, 팀별, 프로그램별 출석률을 집계하고 통계를 확인합니다.',
          },
        ]}
        keyFeatures={[
          '세션별 출석 체크',
          '출석/지각/결석/사유처리 상태 관리',
          'QR 코드 기반 자동 체크인 (향후 기능)',
          '결석/지각 사유 제출 및 승인',
          '학생별/팀별/프로그램별 출석률 통계',
          '출석 알림 발송 (향후 기능)',
          '출석 데이터 엑셀 다운로드',
          '일자별/세션별 필터링',
        ]}
        tips={[
          '세션 시작 전에 출석 체크를 활성화하면, 학생들이 QR 코드로 체크인할 수 있습니다.',
          '지각 기준 시간은 프로그램 설정에서 조정할 수 있습니다 (일반적으로 10-15분).',
          '출석률이 낮은 학생은 별도로 모니터링하여 학습 이탈을 방지하세요.',
          '사유 처리는 증빙 자료와 함께 제출되므로, 승인 전에 꼼꼼히 확인하세요.',
        ]}
      />
    </div>
  );
}
