import { Notice, NoticeReadStatus } from '@/types/notice';

export const mockNotices: Notice[] = [
  {
    id: 1,
    title: '[긴급] 중간 발표일 변경 안내',
    content: `안녕하세요, 교육생 여러분.

중간 발표 일정이 다음과 같이 변경되었습니다.

**변경 전**: 2025년 11월 15일 (수) 14:00
**변경 후**: 2025년 11월 18일 (토) 10:00

변경 사유는 외부 심사위원 일정 조율로 인한 것이며, 발표 시간은 팀당 15분으로 동일합니다.

준비에 차질 없으시길 바랍니다.

감사합니다.`,
    author: '김매니저',
    authorId: 1,
    programIds: [], // 전체 프로그램
    targetType: 'all',
    targetIds: [],
    priority: 'urgent',
    isPinned: true,
    viewCount: 245,
    createdAt: '2025-10-20T09:30:00Z',
    updatedAt: '2025-10-20T09:30:00Z',
  },
  {
    id: 2,
    title: '[중요] KPI 제출 마감 임박',
    content: `교육생 여러분께,

11월 KPI 제출 마감일이 다가오고 있습니다.

**마감일**: 2025년 11월 1일 (수) 23:59
**제출 방법**: LMS > KPI 페이지에서 직접 제출
**필수 항목**:
- 활동 내용
- 성과 지표
- 증빙 자료 (선택)

아직 제출하지 않으신 팀은 서둘러 주시기 바랍니다.

문의사항은 담당 코치에게 연락 주세요.`,
    author: '박매니저',
    authorId: 2,
    programIds: [2], // 하나유니브만
    targetType: 'program',
    targetIds: [2],
    priority: 'important',
    isPinned: false,
    viewCount: 152,
    createdAt: '2025-10-19T14:20:00Z',
    updatedAt: '2025-10-19T14:20:00Z',
  },
  {
    id: 3,
    title: '팀 활동 우수 사례 공유',
    content: `안녕하세요!

이번 주 팀 활동 우수 사례를 공유합니다.

**우수 팀**: 창업 선봉대
**활동 내용**: 고객 인터뷰 50건 달성 및 데이터 분석 완료
**인사이트**:
- 고객 페인 포인트 5가지 도출
- MVP 방향성 재설정
- 피봇 결정 및 실행 계획 수립

다른 팀들도 참고하시어 좋은 성과 만들어 가시길 바랍니다!`,
    author: '최매니저',
    authorId: 3,
    programIds: [1, 3],
    targetType: 'program',
    targetIds: [1, 3],
    priority: 'normal',
    isPinned: false,
    viewCount: 98,
    createdAt: '2025-10-18T16:45:00Z',
    updatedAt: '2025-10-18T16:45:00Z',
  },
  {
    id: 4,
    title: '온라인 세션 Zoom 링크 안내',
    content: `다음 주 월요일 온라인 세션 Zoom 링크를 안내드립니다.

**일시**: 2025년 10월 28일 (월) 14:00 - 16:00
**주제**: 린 캔버스 작성 워크샵
**Zoom 링크**: https://zoom.us/j/1234567890
**비밀번호**: startup2025

사전 준비물:
- 린 캔버스 템플릿 다운로드
- 본인 아이디어 요약 (1페이지)

많은 참여 부탁드립니다!`,
    author: '김매니저',
    authorId: 1,
    programIds: [],
    targetType: 'all',
    targetIds: [],
    priority: 'normal',
    isPinned: false,
    viewCount: 187,
    createdAt: '2025-10-17T11:00:00Z',
    updatedAt: '2025-10-17T11:00:00Z',
  },
  {
    id: 5,
    title: '멘토링 신청 안내',
    content: `교육생 여러분,

개별 멘토링 신청을 받습니다.

**신청 기간**: 2025년 10월 20일 - 10월 25일
**멘토링 일정**: 2025년 10월 28일 - 11월 8일
**신청 방법**: 구글 폼 작성 (링크는 담당 코치에게 요청)

멘토링 가능 분야:
- 비즈니스 모델 설계
- 마케팅 전략
- 재무 계획
- 피칭 준비

적극적인 신청 바랍니다!`,
    author: '박매니저',
    authorId: 2,
    programIds: [],
    targetType: 'all',
    targetIds: [],
    priority: 'important',
    isPinned: false,
    viewCount: 134,
    createdAt: '2025-10-16T10:15:00Z',
    updatedAt: '2025-10-16T10:15:00Z',
  },
  {
    id: 6,
    title: '휴일 운영 안내',
    content: `다음 주 공휴일 운영 일정을 안내드립니다.

**휴무일**: 2025년 10월 25일 (목) - 개천절 대체 휴일
**LMS 이용**: 24시간 가능
**코치 응대**: 10월 26일 (금)부터 정상 운영
**긴급 문의**: emergency@ud-innovation.com

편안한 휴일 보내세요!`,
    author: '최매니저',
    authorId: 3,
    programIds: [],
    targetType: 'all',
    targetIds: [],
    priority: 'normal',
    isPinned: false,
    viewCount: 203,
    createdAt: '2025-10-15T09:00:00Z',
    updatedAt: '2025-10-15T09:00:00Z',
  },
];

export const mockNoticeReadStatus: NoticeReadStatus[] = [
  // 공지사항 1번 (긴급) - 여러 학생이 읽음
  { id: 1, noticeId: 1, studentId: 1, readAt: '2025-10-20T10:15:00Z' },
  { id: 2, noticeId: 1, studentId: 2, readAt: '2025-10-20T11:30:00Z' },
  { id: 3, noticeId: 1, studentId: 3, readAt: '2025-10-20T14:20:00Z' },

  // 공지사항 2번 (중요) - 일부 학생만 읽음
  { id: 4, noticeId: 2, studentId: 1, readAt: '2025-10-19T15:45:00Z' },
  { id: 5, noticeId: 2, studentId: 4, readAt: '2025-10-19T18:00:00Z' },

  // 공지사항 3번 (일반)
  { id: 6, noticeId: 3, studentId: 2, readAt: '2025-10-18T17:00:00Z' },
  { id: 7, noticeId: 3, studentId: 5, readAt: '2025-10-18T20:30:00Z' },

  // 공지사항 4번
  { id: 8, noticeId: 4, studentId: 1, readAt: '2025-10-17T12:00:00Z' },
  { id: 9, noticeId: 4, studentId: 3, readAt: '2025-10-17T16:45:00Z' },
  { id: 10, noticeId: 4, studentId: 5, readAt: '2025-10-17T19:20:00Z' },
];
