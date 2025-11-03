/**
 * Mock Teams Data
 * 백오피스와 ud-office에서 공유하는 팀 Mock 데이터
 */

// 팀
export interface Team {
  id: number;
  name: string;
  programId: number;
  program: string;
  coach: string;
  memberCount: number;
  status: 'active' | 'inactive' | 'completed';
  createdDate: string;
  goal: string;
  description?: string;
}

// 팀 멤버
export interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: 'leader' | 'member';
  joinDate: string;
}

export const mockTeams: Team[] = [
  {
    id: 1,
    name: '이노베이터스',
    programId: 1,
    program: 'YEEEYEP 인도네시아',
    coach: '박코치',
    memberCount: 5,
    status: 'active',
    createdDate: '2025-09-01',
    goal: '주차별 마일스톤 100% 달성',
    description: '혁신적인 솔루션으로 시장을 선도하는 팀',
  },
  {
    id: 2,
    name: '스타트업랩',
    programId: 2,
    program: '하나유니브',
    coach: '김코치',
    memberCount: 6,
    status: 'active',
    createdDate: '2025-09-01',
    goal: '투자 유치 달성',
    description: '대학생 창업가들의 실험실',
  },
  {
    id: 3,
    name: '벤처스',
    programId: 3,
    program: 'SuTEAM',
    coach: '박코치',
    memberCount: 4,
    status: 'active',
    createdDate: '2025-09-01',
    goal: 'MVP 출시 및 시장 검증',
    description: '빠른 실행력으로 시장을 검증하는 팀',
  },
  {
    id: 4,
    name: '임팩터스',
    programId: 1,
    program: 'YEEEYEP 인도네시아',
    coach: '최코치',
    memberCount: 7,
    status: 'active',
    createdDate: '2025-08-15',
    goal: '사회적 가치 창출',
    description: '사회 문제 해결을 위한 소셜 벤처 팀',
  },
  {
    id: 5,
    name: '글로벌리더스',
    programId: 2,
    program: '하나유니브',
    coach: '박코치',
    memberCount: 5,
    status: 'completed',
    createdDate: '2025-06-01',
    goal: '해외 시장 진출',
    description: '글로벌 시장을 타겟으로 하는 창업 팀',
  },
];

// 팀 멤버 목록 (teamId를 key로 하는 맵)
export const mockTeamMembers: { [key: number]: TeamMember[] } = {
  1: [
    { id: 1, name: '김철수', email: 'kim@example.com', role: 'leader', joinDate: '2025-09-01' },
    { id: 2, name: '이영희', email: 'lee@example.com', role: 'member', joinDate: '2025-09-01' },
    { id: 3, name: '박민수', email: 'park@example.com', role: 'member', joinDate: '2025-09-01' },
    { id: 4, name: '정수진', email: 'jung@example.com', role: 'member', joinDate: '2025-09-01' },
    { id: 5, name: '최동욱', email: 'choi@example.com', role: 'member', joinDate: '2025-09-01' },
  ],
  2: [
    { id: 6, name: '강민지', email: 'kang@example.com', role: 'leader', joinDate: '2025-09-01' },
    { id: 7, name: '윤서준', email: 'yoon@example.com', role: 'member', joinDate: '2025-09-01' },
    { id: 8, name: '한지우', email: 'han@example.com', role: 'member', joinDate: '2025-09-01' },
    { id: 9, name: '서예은', email: 'seo@example.com', role: 'member', joinDate: '2025-09-01' },
    { id: 10, name: '임도현', email: 'lim@example.com', role: 'member', joinDate: '2025-09-01' },
    { id: 11, name: '조하은', email: 'cho@example.com', role: 'member', joinDate: '2025-09-01' },
  ],
};
