/**
 * VOD Set 관련 타입 정의
 */

// ActCanvas 질문 타입
export interface ActCanvasQuestion {
  id: number;
  question: string;
  type: 'text' | 'essay' | 'choice' | 'file';
  required: boolean;
  order: number;
}

// ActCanvas 컨텐츠
export interface ActCanvasContent {
  questions: ActCanvasQuestion[];
}

// AI Chat 컨텐츠 (추후 정의)
export interface AIChatContent {
  enabled: boolean;
  // ... 추후 정의
}

// VOD 컨텐츠
export interface VODContent {
  url: string;
  description: string;
  duration?: string;
  thumbnailUrl?: string;
}

// 세션 컨텐츠
export interface SessionContent {
  vods?: VODContent[];  // Changed to array to support multiple VODs
  aiChat?: AIChatContent;
  actCanvas?: ActCanvasContent;
}

// 세션
export interface Session {
  id: number;
  setId: number;
  name: string;
  order: number;
  contents: SessionContent;
}

// VOD 세트
export interface VODSet {
  id: number;
  name: string;
  description: string;
  category: string;  // 세트의 카테고리/분야
  programId: number;
  programName: string;
  order: number;
  status: 'draft' | 'active' | 'archived';
  adminNotes?: string; // 관리자 메모 (관리자끼리 공유)
  createdDate: string;
  sessions: Session[];
}
