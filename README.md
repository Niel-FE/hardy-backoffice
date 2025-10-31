# UD Innovation Backoffice

창업교육 프로그램 관리를 위한 백오피스 시스템 - 관리자용 플랫폼

## 프로젝트 개요

UD Innovation Backoffice는 창업 교육 프로그램을 효율적으로 관리하기 위한 종합 관리 시스템입니다. 학생, 코치, 프로그램, 교육 콘텐츠를 통합 관리하며, 데이터 분석과 리포팅 기능을 제공합니다.

## 관리 대상 프로그램

1. **YEEEYEP 인도네시아** (16주) - 인도네시아 청년 창업가 양성
2. **하나유니브** (12주) - 대학생 예비 창업가 양성
3. **SuTEAM** (10주) - 팀 기반 창업 프로젝트

## 주요 기능

### 📊 대시보드
- 전체 시스템 통계 (학생, 프로그램, 코치 수)
- 최근 활동 타임라인
- 주요 지표 요약 (진도율, 출석률, 제출 현황)
- 4-컬럼 통계 카드 레이아웃

### 📚 교육 관리
- **VOD 세트 관리**: 비디오 콘텐츠 생성, 편집, 순서 관리 (드래그 앤 드롭)
- **KPI 관리**: KPI 템플릿 생성, 제출 승인/반려, 피드백 제공
- **과제 관리**: 과제 생성, 제출물 검토, 평가 및 채점
- **출석 관리**: 세션별/개별 출석 추적, 출석률 계산

### 👨‍🎓 학생 관리
- **학생 데이터베이스**: CSV/Excel 가져오기/내보내기, 대량 등록
- **팀 관리**: 팀 생성, 팀원 배정, 팀 성과 추적
- **팀 KPI**: 팀별 KPI 배정, 제출 현황 모니터링
- **검색 & 필터**: 이름, 이메일, 프로그램, 팀별 검색

### 👔 코치 관리
- **코치 인재풀**: 코치 등록, 프로필 관리, 전문 분야 관리
- **배정 관리**: 학생/팀 배정, 담당 현황 조회
- **평가 시스템**: 코치 평가, 피드백 수집

### 🎯 프로그램 관리
- **프로그램 기획**: 커리큘럼 설계, VOD 세트 배치 (드래그 앤 드롭)
- **지원자 심사**: 지원서 검토, 승인/반려 처리
- **프로그램 분석**: 참가자 통계, 완료율, 성과 지표

### 📈 분석 & 리포팅
- 프로그램별 진도율 차트
- 출석률 추이 그래프
- 과제 완료율 통계
- 활동 로그 및 감사 추적

## 기술 스택

- **Framework**: Next.js 14.2.5 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: 커스텀 컴포넌트 + Heroicons
- **Charts**: Recharts (데이터 시각화)
- **Drag & Drop**: dnd-kit (프로그램 기획)
- **Data Import/Export**: xlsx, papaparse (CSV/Excel)
- **State Management**: localStorage (Phase 1)

## 프로젝트 구조

```
backoffice/
├── src/
│   ├── app/                    # Next.js App Router 페이지
│   │   ├── page.tsx            # 대시보드 (메인)
│   │   ├── coaches/            # 코치 관리
│   │   │   ├── list/           # 코치 목록
│   │   │   ├── register/       # 코치 등록
│   │   │   ├── evaluation/     # 코치 평가
│   │   │   └── [id]/           # 코치 상세
│   │   ├── education/          # 교육 관리
│   │   │   ├── vod-sets/       # VOD 콘텐츠 관리
│   │   │   ├── kpi/            # KPI 관리
│   │   │   ├── assignment/     # 과제 관리
│   │   │   └── attendance/     # 출석 관리
│   │   ├── programs/           # 프로그램 관리
│   │   │   ├── planning/       # 프로그램 기획
│   │   │   ├── applicants/     # 지원자 심사
│   │   │   ├── sessions/       # 세션 관리
│   │   │   └── analytics/      # 분석
│   │   ├── students/           # 학생 관리
│   │   │   ├── list/           # 학생 목록
│   │   │   ├── teams/          # 팀 관리
│   │   │   └── [id]/           # 학생 상세
│   │   └── settings/           # 설정
│   ├── components/             # 재사용 가능한 컴포넌트
│   │   ├── Sidebar.tsx         # 왼쪽 사이드바
│   │   ├── Modal.tsx           # 모달 컴포넌트
│   │   ├── Toast.tsx           # 토스트 알림
│   │   ├── CSVUploader.tsx     # CSV 업로드
│   │   ├── BulkActionBar.tsx   # 대량 작업 바
│   │   └── charts/             # 차트 컴포넌트
│   ├── hooks/                  # 커스텀 훅
│   ├── lib/                    # 유틸리티 함수
│   └── types/                  # TypeScript 타입 정의
├── public/                     # 정적 파일
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## 시작하기

### 필수 요구사항
- Node.js 18.0 이상
- npm 9.0 이상

### 저장소 클론

```bash
# HTTPS 사용
git clone https://github.com/ud-hardy/backoffice.git
cd backoffice

# 또는 SSH 사용
git clone git@github.com:ud-hardy/backoffice.git
cd backoffice
```

### 의존성 설치

```bash
npm install
```

이 명령은 다음을 수행합니다:
- Next.js 및 React 설치
- Tailwind CSS 설정
- dnd-kit (드래그 앤 드롭)
- xlsx, papaparse (CSV/Excel 처리)
- Heroicons (아이콘)
- Recharts (차트)

**설치 시간**: 약 2-3분 소요 (네트워크 속도에 따라)

### 개발 서버 실행

```bash
npm run dev
```

성공적으로 실행되면 다음 메시지가 표시됩니다:
```
  ▲ Next.js 14.2.5
  - Local:        http://localhost:3001
  - ready in 2s
```

**포트**: 3001 (package.json에 `-p 3001`로 설정)

브라우저에서 [http://localhost:3001](http://localhost:3001)을 열어 확인하세요.

**자동으로 대시보드가 표시**됩니다.

### 프로덕션 빌드

```bash
# 프로덕션 빌드 생성
npm run build

# 빌드된 애플리케이션 실행
npm start
```

빌드 완료 시간: 약 1-2분

### Lint 실행

```bash
npm run lint
```

## 빠른 실행 가이드

### 1단계: 프로젝트 설정
```bash
git clone https://github.com/ud-hardy/backoffice.git
cd backoffice
npm install
```

### 2단계: 개발 서버 시작
```bash
npm run dev
```

### 3단계: 브라우저에서 확인
- URL: http://localhost:3001
- 대시보드가 기본 화면으로 표시됩니다

### 주요 경로
- 대시보드: http://localhost:3001/
- VOD 관리: http://localhost:3001/education/vod-sets
- KPI 관리: http://localhost:3001/education/kpi
- 과제 관리: http://localhost:3001/education/assignment
- 출석 관리: http://localhost:3001/education/attendance
- 학생 목록: http://localhost:3001/students/list
- 팀 관리: http://localhost:3001/students/teams
- 코치 목록: http://localhost:3001/coaches/list
- 프로그램 기획: http://localhost:3001/programs/planning
- 지원자 심사: http://localhost:3001/programs/applicants

## 문제 해결

### 포트 3001이 이미 사용 중인 경우
```bash
# 다른 포트로 실행 (예: 3002)
npm run dev -- -p 3002
```

또는 package.json의 dev 스크립트를 수정:
```json
"dev": "next dev -p 3002"
```

### node_modules 관련 오류
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules
npm install
```

### 빌드 오류
```bash
# 캐시 삭제 후 재빌드
rm -rf .next
npm run build
```

### TypeScript 오류
```bash
# TypeScript 캐시 삭제
rm -f tsconfig.tsbuildinfo
npm run dev
```

## 주요 화면 설명

### 대시보드 (`/`)
- **통계 카드**: 4개 컬럼 (총 학생, 활성 프로그램, 코치 수, 평균 진도율)
- **최근 활동**: 타임라인 형태로 최근 제출, 승인, 반려 내역
- **빠른 액션**: 자주 사용하는 기능 바로가기

### VOD 관리 (`/education/vod-sets`)
- VOD 세트 카드 그리드 레이아웃
- 세트별 VOD 목록 관리
- 드래그 앤 드롭으로 순서 변경
- YouTube ID 기반 비디오 연결

### KPI 관리 (`/education/kpi`)
- 제출 대기 KPI 목록 (표 형태)
- 승인/반려 워크플로우
- 피드백 작성 기능
- 증빙 파일 조회

### 학생 관리 (`/students/list`)
- 20개씩 페이지네이션
- 검색: 이름, 이메일
- 필터: 프로그램, 팀, 상태
- CSV/Excel 가져오기/내보내기
- 대량 작업 (삭제, 팀 변경)

### 팀 관리 (`/students/teams`)
- 팀 카드 레이아웃
- 팀별 통계 (평균 진도율, 출석률)
- 팀원 목록 및 성과
- 팀 KPI 진행 상황

### 프로그램 기획 (`/programs/planning`)
- 드래그 앤 드롭 커리큘럼 설계
- VOD 세트 배치
- 과제 추가 및 순서 지정
- 프로그램 설정 (기간, 참가자 수)

## 디자인 시스템

### 색상 팔레트
- **Primary**: Teal (#0D9488)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)
- **Info**: Blue (#3B82F6)

### 레이아웃
- **사이드바**: 고정 왼쪽, 다크 테마 (bg-gray-900)
- **메인 콘텐츠**: 우측, 라이트 테마
- **통계 카드**: 4-컬럼 그리드
- **데이터 테이블**: 검색, 필터, 페이지네이션, 정렬

### 컴포넌트 패턴
- **카드**: 그림자, 라운드 모서리, 패딩
- **버튼**: Primary, Secondary, Danger 변형
- **모달**: 중앙 정렬, 오버레이 배경
- **토스트**: 우측 상단, 자동 닫힘

## 현재 상태

**Phase 1 완료** (프론트엔드 MVP)
- ✅ 전체 관리 페이지 (11개 주요 섹션)
- ✅ Mock 데이터로 동작
- ✅ CSV/Excel 가져오기/내보내기
- ✅ 드래그 앤 드롭 UI
- ✅ 차트 및 통계
- ✅ 승인/반려 워크플로우

**Phase 2 계획** (백엔드 통합)
- API 개발 (REST or GraphQL)
- 인증 시스템 (관리자 권한)
- 실제 파일 업로드
- 이메일 알림

## 알려진 제한사항

1. **백엔드 없음**: 현재 프론트엔드만 구현, Mock 데이터 사용
2. **인증 없음**: 오픈 액세스, 관리자 세션 없음
3. **파일 저장소 없음**: 파일 업로드 UI만 구현, 실제 저장 기능 없음
4. **데이터베이스 없음**: 페이지 새로고침 시 데이터 리셋 (localStorage 사용)
5. **이메일 없음**: 알림 기능은 UI만 구현

## Vercel 배포 (선택사항)

### 방법 1: GitHub 연동 (권장)

1. [Vercel Dashboard](https://vercel.com/new) 접속
2. GitHub 저장소 연결
3. 프로젝트 import
4. 빌드 설정 (자동으로 감지됨):
   - **Framework**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
5. Deploy 클릭

### 방법 2: Vercel CLI

```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 배포
vercel --prod
```

### 빌드 설정 (`vercel.json`)

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "regions": ["icn1"]
}
```

## 환경 변수 (향후)

현재는 mock data를 사용하므로 환경변수가 필요없습니다. 향후 API 연동 시:

```env
NEXT_PUBLIC_API_URL=your_api_url
NEXT_PUBLIC_API_KEY=your_api_key
DATABASE_URL=your_database_url
```

## 라이선스

Private - UD Innovation 내부 프로젝트

© 2025 UD Innovation. All rights reserved.

## 관련 프로젝트

- **ud-lms**: 학생용 학습 관리 시스템
- **ucCoach**: 코치용 플랫폼

## 지원

문의사항이 있으시면 이슈를 등록해주세요.

## 연락처

UD Innovation - [@ud-hardy](https://github.com/ud-hardy)
