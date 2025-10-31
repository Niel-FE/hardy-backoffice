/**
 * 과제 관련 타입 정의
 */

// 과제 (세션에 할당)
export interface Assignment {
  id: number;
  vodSetId: number;
  vodSetName: string;
  sessionId: number;
  sessionTitle: string;
  title: string;
  description: string;
  dueDate?: string;
  isRequired: boolean; // 필수 과제 여부
  createdAt: string;
  updatedAt: string;
}

// 과제 제출물
export interface AssignmentSubmission {
  id: number;
  assignmentId: number;
  assignmentTitle: string;
  studentId: number;
  studentName: string;
  teamId: number;
  teamName: string;
  programId: number;
  programName: string;
  submitDate: string;
  status: 'pending' | 'approved' | 'rejected';
  coachId: number;
  coachName: string;
  rating?: number; // 1-5
  feedback?: string;
  submissionUrl?: string; // 제출물 URL (GitHub, 노션 등)
  submissionNote?: string; // 제출 노트
}
