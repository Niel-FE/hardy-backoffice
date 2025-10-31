'use client';

import { useState } from 'react';
import {
  MagnifyingGlassIcon,
  StarIcon,
  ClockIcon,
  ChatBubbleLeftIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface CoachEvaluation {
  id: number;
  coachName: string;
  program: string;
  period: string;
  stats: {
    totalFeedbacks: number;
    avgResponseTime: string;
    feedbackQuality: number;
    studentSatisfaction: number;
  };
  recentFeedbacks: {
    id: number;
    student: string;
    date: string;
    content: string;
    rating: number;
  }[];
  performance: {
    category: string;
    score: number;
  }[];
}

const mockEvaluations: CoachEvaluation[] = [
  {
    id: 1,
    coachName: '박코치',
    program: 'YEEEYEP 인도네시아',
    period: '2025-09-01 ~ 2025-12-31',
    stats: {
      totalFeedbacks: 145,
      avgResponseTime: '2.3시간',
      feedbackQuality: 4.7,
      studentSatisfaction: 4.8,
    },
    recentFeedbacks: [
      {
        id: 1,
        student: '김철수',
        date: '2025-10-14',
        content:
          '매우 상세하고 구체적인 피드백을 주셔서 실질적인 도움이 되었습니다. 다음 스텝에 대한 가이드도 명확했습니다.',
        rating: 5,
      },
      {
        id: 2,
        student: '이영희',
        date: '2025-10-12',
        content:
          '코드 리뷰가 꼼꼼했고, 개선 방향을 제시해주셔서 좋았습니다. 다만 조금 더 빠른 응답이 있었으면 더 좋았을 것 같습니다.',
        rating: 4,
      },
    ],
    performance: [
      { category: '응답 속도', score: 85 },
      { category: '피드백 품질', score: 95 },
      { category: '전문성', score: 92 },
      { category: '의사소통', score: 88 },
      { category: '열정', score: 90 },
    ],
  },
  {
    id: 2,
    coachName: '김코치',
    program: 'YEEEYEP 인도네시아',
    period: '2025-09-01 ~ 2025-12-31',
    stats: {
      totalFeedbacks: 98,
      avgResponseTime: '1.8시간',
      feedbackQuality: 4.9,
      studentSatisfaction: 4.9,
    },
    recentFeedbacks: [
      {
        id: 3,
        student: '박민수',
        date: '2025-10-15',
        content: '빠른 응답과 함께 정확한 피드백을 주셔서 감사합니다. 항상 도움이 됩니다!',
        rating: 5,
      },
    ],
    performance: [
      { category: '응답 속도', score: 98 },
      { category: '피드백 품질', score: 97 },
      { category: '전문성', score: 95 },
      { category: '의사소통', score: 92 },
      { category: '열정', score: 93 },
    ],
  },
  {
    id: 3,
    coachName: '최코치',
    program: '하나유니브',
    period: '2025-08-15 ~ 2025-11-30',
    stats: {
      totalFeedbacks: 112,
      avgResponseTime: '3.5시간',
      feedbackQuality: 4.5,
      studentSatisfaction: 4.6,
    },
    recentFeedbacks: [
      {
        id: 4,
        student: '정수진',
        date: '2025-10-13',
        content:
          '데이터 분석에 대한 전문적인 조언을 주셔서 많은 도움이 되었습니다. 실무 경험을 공유해주셔서 감사합니다.',
        rating: 5,
      },
    ],
    performance: [
      { category: '응답 속도', score: 75 },
      { category: '피드백 품질', score: 90 },
      { category: '전문성', score: 95 },
      { category: '의사소통', score: 85 },
      { category: '열정', score: 88 },
    ],
  },
];

export default function CoachEvaluationPage() {
  const [evaluations, setEvaluations] = useState<CoachEvaluation[]>(mockEvaluations);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvaluation, setSelectedEvaluation] = useState<CoachEvaluation | null>(null);

  const filteredEvaluations = evaluations.filter((evaluation) =>
    evaluation.coachName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evaluation.program.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">코치 평가</h1>
        <p className="text-gray-600 mt-2">코치 성과 평가 및 피드백 품질 관리</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600">활동 코치</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{evaluations.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600">평균 피드백 품질</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {(
              evaluations.reduce((sum, e) => sum + e.stats.feedbackQuality, 0) / evaluations.length
            ).toFixed(1)}{' '}
            ★
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600">평균 만족도</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {(
              evaluations.reduce((sum, e) => sum + e.stats.studentSatisfaction, 0) /
              evaluations.length
            ).toFixed(1)}{' '}
            / 5.0
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600">총 피드백</p>
          <p className="text-2xl font-bold text-primary-600 mt-1">
            {evaluations.reduce((sum, e) => sum + e.stats.totalFeedbacks, 0)}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="코치 이름 또는 프로그램으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Evaluations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEvaluations.map((evaluation) => (
          <div
            key={evaluation.id}
            className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedEvaluation(evaluation)}
          >
            {/* Coach Header */}
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {evaluation.coachName}
              </h3>
              <p className="text-sm text-gray-600">{evaluation.program}</p>
              <p className="text-xs text-gray-500">{evaluation.period}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <ChatBubbleLeftIcon className="w-4 h-4" />
                  <span className="text-xs">총 피드백</span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {evaluation.stats.totalFeedbacks}건
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <ClockIcon className="w-4 h-4" />
                  <span className="text-xs">평균 응답 시간</span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {evaluation.stats.avgResponseTime}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <StarIcon className="w-4 h-4" />
                  <span className="text-xs">피드백 품질</span>
                </div>
                <p className="text-lg font-bold text-yellow-600">
                  {evaluation.stats.feedbackQuality} ★
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <ChartBarIcon className="w-4 h-4" />
                  <span className="text-xs">학생 만족도</span>
                </div>
                <p className="text-lg font-bold text-green-600">
                  {evaluation.stats.studentSatisfaction} / 5.0
                </p>
              </div>
            </div>

            {/* Recent Feedback */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">최근 학생 피드백</h4>
              <div className="space-y-2">
                {evaluation.recentFeedbacks.slice(0, 1).map((feedback) => (
                  <div key={feedback.id} className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-blue-900">{feedback.student}</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={
                              i < feedback.rating ? 'text-yellow-400 text-xs' : 'text-gray-300 text-xs'
                            }
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-blue-800 line-clamp-2">{feedback.content}</p>
                    <p className="text-xs text-blue-600 mt-1">{feedback.date}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* View Details Button */}
            <button className="mt-4 w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
              상세 평가 보기
            </button>
          </div>
        ))}
      </div>

      {filteredEvaluations.length === 0 && (
        <div className="text-center py-12 bg-white border rounded-lg">
          <p className="text-gray-500">검색 결과가 없습니다.</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedEvaluation && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={() => setSelectedEvaluation(null)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedEvaluation.coachName} 평가
                  </h2>
                  <p className="text-gray-600">{selectedEvaluation.program}</p>
                </div>
                <button
                  onClick={() => setSelectedEvaluation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Performance Metrics */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">성과 지표</h3>
                <div className="space-y-3">
                  {selectedEvaluation.performance.map((perf) => (
                    <div key={perf.category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{perf.category}</span>
                        <span className="font-medium text-gray-900">{perf.score}점</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            perf.score >= 90
                              ? 'bg-green-600'
                              : perf.score >= 80
                              ? 'bg-blue-600'
                              : perf.score >= 70
                              ? 'bg-yellow-600'
                              : 'bg-red-600'
                          }`}
                          style={{ width: `${perf.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* All Feedbacks */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">학생 피드백</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedEvaluation.recentFeedbacks.map((feedback) => (
                    <div key={feedback.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{feedback.student}</span>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={
                                  i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                                }
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">{feedback.date}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{feedback.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-primary-900 mb-2">종합 평가</h3>
                <p className="text-sm text-primary-800">
                  {selectedEvaluation.coachName}님은 평균 {selectedEvaluation.stats.avgResponseTime}{' '}
                  내 응답을 제공하며, 피드백 품질 {selectedEvaluation.stats.feedbackQuality}점,
                  학생 만족도 {selectedEvaluation.stats.studentSatisfaction}점을 기록하고 있습니다.
                  지속적인 고품질 피드백으로 학생들의 학습에 큰 도움을 주고 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">코치 평가 시스템</h3>
        <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
          <li>코치별 피드백 작성 현황 및 품질 평가</li>
          <li>평균 응답 시간 추적</li>
          <li>학생 만족도 및 피드백 분석</li>
          <li>성과 지표별 점수 시각화</li>
          <li>우수 코치 식별 및 인센티브 제공</li>
        </ul>
      </div>
    </div>
  );
}
