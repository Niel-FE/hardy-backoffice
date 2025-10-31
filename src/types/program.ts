/**
 * 프로그램 관련 타입 정의
 */

// KPI 타입은 kpi.ts에서 import
export type { ProgramKPI } from './kpi';

export type ProgramStatus = 'planning' | 'recruiting' | 'ongoing' | 'completed';
export type ServiceRegion = 'ko' | 'en' | 'jp';

export interface Program {
  id: number;
  title: string;
  description: string;
  sapCode: string; // SAP 코드명
  serviceRegions: ServiceRegion[]; // 서비스 지역
  keywords: string[]; // 키워드
  duration: string;
  startDate: string;
  endDate: string;
  status: ProgramStatus;
  targetStudents: number;
  currentStudents: number;
  curriculum: string[];
  coordinator: string;
  budget: number;
  adminNotes?: string; // 관리자 메모 (관리자끼리 공유)
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceSettings {
  id: number;
  programId: number;
  checkInTime: string; // HH:mm 형식
  checkOutTime: string;
  lateThreshold: number; // 지각 기준 (분)
  absentThreshold: number; // 결석 기준 (분)
  autoCheckOut: boolean;
  weekdays: number[]; // 0-6 (일-토)
  createdAt: string;
  updatedAt: string;
}
