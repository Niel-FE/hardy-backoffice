'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import CSVUploader from '@/components/CSVUploader';
import { CSVStudent } from '@/lib/csvParser';
import WorkflowGuide from '@/components/WorkflowGuide';

interface ProgramHistory {
  programName: string;
  enrollDate: string;
  endDate: string;
  status: 'completed' | 'dropped';
  finalVodProgress: number;
  finalAttendanceRate: number;
}

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  program: string; // 현재 프로그램
  programHistory?: ProgramHistory[]; // 과거 프로그램 히스토리
  team: string;
  coach: string;
  status: 'active' | 'inactive' | 'completed' | 'dropped';
  enrollDate: string;
  programEndDate: string;
  vodProgress: number; // VOD 시청 기반 진도율
  attendanceRate: number;
}

const mockStudents: Student[] = [
  {
    id: 1,
    name: '김철수',
    email: 'kim.cs@example.com',
    phone: '010-1234-5678',
    program: 'YEEEYEP 인도네시아',
    team: '이노베이터스',
    coach: '박코치',
    status: 'active',
    enrollDate: '2025-09-01',
    programEndDate: '2025-12-31',
    vodProgress: 75,
    attendanceRate: 95,
  },
  {
    id: 2,
    name: '이영희',
    email: 'lee.yh@example.com',
    phone: '010-2345-6789',
    program: '하나유니브',
    programHistory: [
      {
        programName: 'YEEEYEP 인도네시아',
        enrollDate: '2025-03-01',
        endDate: '2025-06-01',
        status: 'completed',
        finalVodProgress: 100,
        finalAttendanceRate: 98,
      },
    ],
    team: '스타트업랩',
    coach: '김코치',
    status: 'active',
    enrollDate: '2025-09-01',
    programEndDate: '2025-12-31',
    vodProgress: 88,
    attendanceRate: 98,
  },
  {
    id: 3,
    name: '박민수',
    email: 'park.ms@example.com',
    phone: '010-3456-7890',
    program: 'YEEEYEP 인도네시아',
    team: '벤처스',
    coach: '박코치',
    status: 'active',
    enrollDate: '2025-09-01',
    programEndDate: '2025-12-31',
    vodProgress: 65,
    attendanceRate: 85,
  },
  {
    id: 4,
    name: '정수진',
    email: 'jung.sj@example.com',
    phone: '010-4567-8901',
    program: 'SuTEAM',
    programHistory: [
      {
        programName: '하나유니브',
        enrollDate: '2024-12-01',
        endDate: '2025-03-01',
        status: 'completed',
        finalVodProgress: 95,
        finalAttendanceRate: 92,
      },
    ],
    team: '이노베이터스',
    coach: '최코치',
    status: 'active',
    enrollDate: '2025-08-15',
    programEndDate: '2025-11-30',
    vodProgress: 92,
    attendanceRate: 100,
  },
  {
    id: 5,
    name: '최동욱',
    email: 'choi.du@example.com',
    phone: '010-5678-9012',
    program: 'YEEEYEP 인도네시아',
    team: '스타트업랩',
    coach: '박코치',
    status: 'completed',
    enrollDate: '2025-06-01',
    programEndDate: '2025-09-01',
    vodProgress: 100,
    attendanceRate: 96,
  },
  {
    id: 6,
    name: '강민지',
    email: 'kang.mj@example.com',
    phone: '010-6789-0123',
    program: '하나유니브',
    programHistory: [
      {
        programName: 'SuTEAM',
        enrollDate: '2025-03-01',
        endDate: '2025-05-15',
        status: 'dropped',
        finalVodProgress: 45,
        finalAttendanceRate: 60,
      },
    ],
    team: '이노베이터스',
    coach: '박코치',
    status: 'dropped',
    enrollDate: '2025-09-01',
    programEndDate: '2025-12-31',
    vodProgress: 30,
    attendanceRate: 45,
  },
];

export default function StudentListPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'completed' | 'dropped'>('all');
  const [filterProgram, setFilterProgram] = useState<string>('all');

  // Add student modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState<Partial<Student>>({
    name: '',
    email: '',
    phone: '',
    program: '',
    team: '',
    coach: '',
    status: 'active',
    enrollDate: new Date().toISOString().split('T')[0],
    programEndDate: '',
    vodProgress: 0,
    attendanceRate: 0,
  });

  const programs = Array.from(new Set(students.map((s) => s.program)));
  const teams = Array.from(new Set(students.map((s) => s.team)));
  const coaches = Array.from(new Set(students.map((s) => s.coach)));

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.team.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    const matchesProgram = filterProgram === 'all' || student.program === filterProgram;
    return matchesSearch && matchesStatus && matchesProgram;
  });

  const getStatusBadge = (status: Student['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      completed: 'bg-blue-100 text-blue-800',
      dropped: 'bg-red-100 text-red-800',
    };
    const labels = {
      active: '활동 중',
      inactive: '비활성',
      completed: '수료',
      dropped: '중도 탈락',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  // Handle add student
  const handleAddStudent = () => {
    // Validation
    if (!newStudent.name?.trim()) {
      alert('이름을 입력해주세요');
      return;
    }
    if (!newStudent.email?.trim()) {
      alert('이메일을 입력해주세요');
      return;
    }
    if (!newStudent.phone?.trim()) {
      alert('전화번호를 입력해주세요');
      return;
    }
    if (!newStudent.program?.trim()) {
      alert('프로그램을 선택해주세요');
      return;
    }

    const student: Student = {
      id: students.length + 1,
      name: newStudent.name,
      email: newStudent.email,
      phone: newStudent.phone,
      program: newStudent.program,
      team: newStudent.team || '이노베이터스',
      coach: newStudent.coach || '박코치',
      status: newStudent.status || 'active',
      enrollDate: newStudent.enrollDate || new Date().toISOString().split('T')[0],
      programEndDate: newStudent.programEndDate || '',
      vodProgress: 0,
      attendanceRate: 0,
    };

    setStudents([...students, student]);
    setShowAddModal(false);
    resetNewStudent();
    alert('교육생이 등록되었습니다');
  };

  // Handle CSV import
  const handleCSVImport = (csvStudents: CSVStudent[]) => {
    const newStudents: Student[] = csvStudents.map((csvStudent, index) => ({
      id: students.length + index + 1,
      name: csvStudent.name,
      email: csvStudent.email,
      phone: csvStudent.phone,
      program: csvStudent.program,
      team: csvStudent.team || '이노베이터스',
      coach: csvStudent.coach || '박코치',
      status: 'active' as const,
      enrollDate: csvStudent.enrollDate || new Date().toISOString().split('T')[0],
      programEndDate: '',
      vodProgress: 0,
      attendanceRate: 0,
    }));

    setStudents([...students, ...newStudents]);
    alert(`${newStudents.length}명의 교육생이 일괄 등록되었습니다`);
  };

  // Reset new student form
  const resetNewStudent = () => {
    setNewStudent({
      name: '',
      email: '',
      phone: '',
      program: '',
      team: '',
      coach: '',
      status: 'active',
      enrollDate: new Date().toISOString().split('T')[0],
      programEndDate: '',
      vodProgress: 0,
      attendanceRate: 0,
    });
  };

  // Update new student field
  const updateNewStudentField = (field: keyof Student, value: any) => {
    setNewStudent({ ...newStudent, [field]: value });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">교육생 관리</h1>
        <p className="text-gray-600 mt-2">전체 교육생 조회 및 정보 관리</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600">전체 교육생</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{students.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600">활동 중</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {students.filter((s) => s.status === 'active').length}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600">수료</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {students.filter((s) => s.status === 'completed').length}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600">평균 VOD 진도율</p>
          <p className="text-2xl font-bold text-primary-600 mt-1">
            {(
              students.reduce((sum, s) => sum + s.vodProgress, 0) / students.length
            ).toFixed(0)}
            %
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="이름, 이메일, 팀명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Add Student Buttons */}
          <div className="flex items-center gap-3">
            <CSVUploader
              onImport={handleCSVImport}
              existingEmails={students.map((s) => s.email)}
            />
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              교육생 등록
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            <span className="text-sm text-gray-600 flex items-center mr-2">상태:</span>
            {['all', 'active', 'inactive', 'completed', 'dropped'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all'
                  ? '전체'
                  : status === 'active'
                  ? '활동 중'
                  : status === 'inactive'
                  ? '비활성'
                  : status === 'completed'
                  ? '수료'
                  : '탈락'}
              </button>
            ))}
          </div>

          {/* Program Filter */}
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-600">프로그램:</span>
            <select
              value={filterProgram}
              onChange={(e) => setFilterProgram(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">전체</option>
              {programs.map((program) => (
                <option key={program} value={program}>
                  {program}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                교육생
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                프로그램
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                팀
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                담당 코치
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                VOD 진도율
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                출석률
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <tr
                key={student.id}
                onClick={() => router.push(`/students/${student.id}`)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <UserCircleIcon className="w-8 h-8 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <EnvelopeIcon className="w-3 h-3" />
                        {student.email}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <PhoneIcon className="w-3 h-3" />
                        {student.phone}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{student.program}</div>
                  <div className="text-xs text-gray-500">등록일: {student.enrollDate}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600">{student.team}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600">{student.coach}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-gray-900">{student.vodProgress}%</div>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${student.vodProgress}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{student.attendanceRate}%</div>
                </td>
                <td className="px-6 py-4">{getStatusBadge(student.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-gray-900">교육생 등록</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetNewStudent();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* 기본 정보 */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">기본 정보</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이름 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newStudent.name || ''}
                      onChange={(e) => updateNewStudentField('name', e.target.value)}
                      placeholder="김철수"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이메일 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={newStudent.email || ''}
                      onChange={(e) => updateNewStudentField('email', e.target.value)}
                      placeholder="student@example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      전화번호 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={newStudent.phone || ''}
                      onChange={(e) => updateNewStudentField('phone', e.target.value)}
                      placeholder="010-1234-5678"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      상태
                    </label>
                    <select
                      value={newStudent.status || 'active'}
                      onChange={(e) => updateNewStudentField('status', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="active">활동 중</option>
                      <option value="inactive">비활성</option>
                      <option value="completed">수료</option>
                      <option value="dropped">중도 탈락</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 프로그램 정보 */}
              <div className="pt-4 border-t">
                <h4 className="font-semibold text-gray-900 mb-3">프로그램 정보</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      프로그램 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newStudent.program || ''}
                      onChange={(e) => updateNewStudentField('program', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">선택하세요</option>
                      {programs.map((program) => (
                        <option key={program} value={program}>
                          {program}
                        </option>
                      ))}
                      <option value="new">직접 입력...</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">팀</label>
                    <select
                      value={newStudent.team || ''}
                      onChange={(e) => updateNewStudentField('team', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">선택하세요</option>
                      {teams.map((team) => (
                        <option key={team} value={team}>
                          {team}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">담당 코치</label>
                    <select
                      value={newStudent.coach || ''}
                      onChange={(e) => updateNewStudentField('coach', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">선택하세요</option>
                      {coaches.map((coach) => (
                        <option key={coach} value={coach}>
                          {coach}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">등록일</label>
                    <input
                      type="date"
                      value={newStudent.enrollDate || ''}
                      onChange={(e) => updateNewStudentField('enrollDate', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">프로그램 종료일</label>
                    <input
                      type="date"
                      value={newStudent.programEndDate || ''}
                      onChange={(e) => updateNewStudentField('programEndDate', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6 pt-6 border-t">
              <button
                onClick={handleAddStudent}
                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                등록하기
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetNewStudent();
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Guide */}
      <WorkflowGuide
        title="👥 교육생 목록 관리 워크플로우"
        description="교육생을 등록하고 정보를 관리하는 전체 과정을 안내합니다"
        steps={[
          {
            step: 1,
            title: '교육생 등록',
            description: '신규 교육생을 개별로 등록하거나, CSV 파일을 업로드하여 일괄 등록합니다.',
          },
          {
            step: 2,
            title: '기본 정보 입력',
            description: '이름, 이메일, 전화번호 등 교육생의 기본 정보를 입력합니다. 이메일은 로그인 ID로 사용됩니다.',
          },
          {
            step: 3,
            title: '검색 및 필터링',
            description: '이름이나 이메일로 교육생을 검색하거나, 프로그램별로 필터링하여 조회합니다.',
          },
          {
            step: 4,
            title: '상세 정보 확인',
            description: '교육생을 클릭하여 프로그램 이력, 학습 진도, KPI 등 상세 정보를 확인합니다.',
          },
          {
            step: 5,
            title: '정보 수정 및 관리',
            description: '교육생 정보를 수정하거나, 프로그램 배정을 변경합니다.',
          },
        ]}
        keyFeatures={[
          '교육생 개별 등록',
          'CSV 파일 일괄 업로드',
          '이름/이메일 검색',
          '프로그램별 필터링',
          '교육생 상세 정보 조회',
          '프로그램 이력 관리',
          '학습 진도 및 KPI 확인',
          '교육생 정보 수정',
        ]}
        tips={[
          'CSV 업로드 시 이메일 중복을 자동으로 체크하므로, 기존 교육생은 건너뜁니다.',
          '교육생 이메일은 로그인 ID로 사용되므로 정확히 입력하세요.',
          '프로그램 이력을 통해 교육생의 과거 참여 현황을 파악할 수 있습니다.',
          '교육생 목록에서 바로 상세 페이지로 이동하여 학습 현황을 모니터링하세요.',
        ]}
      />
    </div>
  );
}
