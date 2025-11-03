/**
 * Mock VOD Data
 * 백오피스와 ud-office에서 공유하는 VOD Mock 데이터
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

// AI Chat 컨텐츠
export interface AIChatContent {
  enabled: boolean;
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
  vods?: VODContent[];
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
  category: string;
  programId: number;
  programName: string;
  order: number;
  status: 'draft' | 'active' | 'archived';
  adminNotes?: string;
  createdDate: string;
  sessions: Session[];
}

export const mockVODSets: VODSet[] = [
  {
    id: 1,
    name: 'Week 1: 비즈니스 모델 캔버스',
    description: '비즈니스 모델 캔버스의 기본 개념을 학습합니다',
    category: '비즈니스 전략',
    programId: 1,
    programName: 'YEEEYEP 인도네시아',
    order: 1,
    status: 'active',
    createdDate: '2025-10-01',
    sessions: [
      {
        id: 101,
        setId: 1,
        name: '1-1. 비즈니스 모델 작성하기',
        order: 1,
        contents: {
          vods: [
            {
              url: 'https://youtube.com/watch?v=example1',
              description: '비즈니스 모델 캔버스의 9가지 요소를 설명합니다',
              duration: '45:30',
            },
          ],
          actCanvas: {
            questions: [
              { id: 1, question: '비즈니스 모델 캔버스의 9가지 요소를 설명하세요', type: 'essay', required: true, order: 1 },
            ],
          },
        },
      },
    ],
  },
  {
    id: 2,
    name: 'Week 2: 고객 발견 및 검증',
    description: '고객 발견과 검증 방법론을 학습합니다',
    category: '마케팅',
    programId: 1,
    programName: 'YEEEYEP 인도네시아',
    order: 2,
    status: 'draft',
    createdDate: '2025-10-05',
    sessions: [],
  },
];
