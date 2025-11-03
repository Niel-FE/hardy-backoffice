/**
 * Mock Students Data
 * 백오피스와 ud-office에서 공유하는 학생 Mock 데이터
 */

// 프로그램 히스토리
export interface ProgramHistory {
  programName: string;
  enrollDate: string;
  endDate: string;
  status: 'completed' | 'dropped';
  finalVodProgress: number;
  finalAttendanceRate: number;
}

// 출석 상세 정보
export interface AttendanceDetail {
  attended: number;         // 출석 횟수
  absent: number;           // 결석 횟수
  late: number;             // 지각 횟수
  excused: number;          // 사유결석 횟수
  completedSessions: number; // 현재까지 진행된 세션 수
  totalSessions: number;     // 전체 세션 수 (프로그램 전체)
  nextSession?: string;      // 다음 세션 날짜 (선택)
  lastAttendanceDate?: string; // 마지막 출석 날짜 (선택)
}

// 출석률 계산 헬퍼 함수
export const calculateAttendanceRate = (detail: AttendanceDetail): number => {
  if (detail.completedSessions === 0) return 0;
  // 순수 출석만 계산 (지각은 별도)
  return Math.round((detail.attended / detail.completedSessions) * 100);
};

// 진행률 계산 헬퍼 함수
export const calculateProgressRate = (detail: AttendanceDetail): number => {
  if (detail.totalSessions === 0) return 0;
  return Math.round((detail.completedSessions / detail.totalSessions) * 100);
};

// 학생
export interface Student {
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
  attendanceDetail?: AttendanceDetail; // 출석 상세 정보
}

export const mockStudents: Student[] = [
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
    programEndDate: '2025-11-09', // 10주 후
    vodProgress: 75,
    attendanceRate: 100, // 4/4 = 100% (현재까지)
    attendanceDetail: {
      attended: 4,           // 현재까지 4회 출석
      absent: 0,
      late: 0,
      excused: 0,
      completedSessions: 4,  // 2주차: 4회 완료
      totalSessions: 20,     // 10주 × 주2회 = 20회
      nextSession: '2025-09-18',
      lastAttendanceDate: '2025-09-15',
    },
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
    programEndDate: '2025-11-09',
    vodProgress: 88,
    attendanceRate: 75, // 3/4 = 75% (지각 1회)
    attendanceDetail: {
      attended: 3,
      absent: 0,
      late: 1,            // 1회 지각
      excused: 0,
      completedSessions: 4,
      totalSessions: 20,
      nextSession: '2025-09-18',
      lastAttendanceDate: '2025-09-15',
    },
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
    programEndDate: '2025-11-09',
    vodProgress: 65,
    attendanceRate: 75, // 3/4 = 75% (결석 1회)
    attendanceDetail: {
      attended: 3,
      absent: 1,          // 1회 결석
      late: 0,
      excused: 0,
      completedSessions: 4,
      totalSessions: 20,
      nextSession: '2025-09-18',
      lastAttendanceDate: '2025-09-15',
    },
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
    programEndDate: '2025-10-24', // 10주 후
    vodProgress: 92,
    attendanceRate: 100, // 4/4 = 100%
    attendanceDetail: {
      attended: 4,
      absent: 0,
      late: 0,
      excused: 0,
      completedSessions: 4,
      totalSessions: 20,
      nextSession: '2025-09-18',
      lastAttendanceDate: '2025-09-15',
    },
  },
  {
    id: 5,
    name: '최동욱',
    email: 'choi.du@example.com',
    phone: '010-5678-9012',
    program: 'YEEEYEP 인도네시아',
    team: '스타트업랩',
    coach: '박코치',
    status: 'completed', // 완료된 학생
    enrollDate: '2025-06-01',
    programEndDate: '2025-08-10',
    vodProgress: 100,
    attendanceRate: 96, // 24/25 = 96% (완료)
    attendanceDetail: {
      attended: 24,
      absent: 0,
      late: 1,
      excused: 0,
      completedSessions: 25, // 완료
      totalSessions: 25,     // 10주 프로그램이었지만 보강 1회
    },
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
    status: 'dropped', // 중도 탈락
    enrollDate: '2025-09-01',
    programEndDate: '2025-11-09',
    vodProgress: 30,
    attendanceRate: 50, // 2/4 = 50% (중도 탈락)
    attendanceDetail: {
      attended: 2,
      absent: 2,
      late: 0,
      excused: 0,
      completedSessions: 4,
      totalSessions: 20,
    },
  },
];
