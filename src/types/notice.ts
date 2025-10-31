// 공지사항 타입 정의

export type NoticePriority = 'normal' | 'important' | 'urgent';
export type NoticeTargetType = 'all' | 'program' | 'team' | 'individual';

export interface Notice {
  id: number;
  title: string;
  content: string;
  author: string; // 작성자 이름
  authorId: number; // 관리자 ID
  programIds: number[]; // 대상 프로그램 (빈 배열이면 전체)
  targetType: NoticeTargetType;
  targetIds: number[]; // 팀 ID 또는 학생 ID (targetType에 따라)
  priority: NoticePriority;
  isPinned: boolean; // 상단 고정 여부
  attachments?: NoticeAttachment[];
  startDate?: string; // 게시 시작일 (ISO 8601)
  endDate?: string; // 게시 종료일 (ISO 8601)
  viewCount: number; // 조회수
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface NoticeAttachment {
  id: number;
  name: string;
  url: string;
  size: number; // bytes
  type: string; // MIME type
}

export interface NoticeReadStatus {
  id: number;
  noticeId: number;
  studentId: number;
  readAt: string; // ISO 8601
}

// 공지사항 생성/수정 폼 데이터
export interface NoticeFormData {
  title: string;
  content: string;
  programIds: number[];
  targetType: NoticeTargetType;
  targetIds: number[];
  priority: NoticePriority;
  isPinned: boolean;
  startDate?: string;
  endDate?: string;
}

// 공지사항 통계
export interface NoticeStats {
  totalNotices: number;
  totalViews: number;
  avgReadRate: number; // 평균 읽음률 (%)
  unreadCount: number; // 안읽은 공지사항 수
}
