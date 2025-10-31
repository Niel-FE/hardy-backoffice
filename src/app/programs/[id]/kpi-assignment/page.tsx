'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { getFromStorage, saveToStorage, STORAGE_KEYS, generateId, formatDate } from '@/lib/storage';
import { ProgramKPI } from '@/types/program';
import { KPITemplate } from '@/types/kpi';

// Mock programs
const mockPrograms = [
  { id: 1, title: 'YEEEYEP 인도네시아' },
  { id: 2, title: '하나유니브' },
  { id: 3, title: 'SuTEAM' },
];

export default function KPIAssignmentPage() {
  const router = useRouter();
  const params = useParams();
  const { toasts, success, error, hideToast } = useToast();

  const [program, setProgram] = useState<any>(null);
  const [assignedKPIs, setAssignedKPIs] = useState<ProgramKPI[]>([]);
  const [availableKPIs, setAvailableKPIs] = useState<KPITemplate[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [kpiSearchTerm, setKpiSearchTerm] = useState('');
  const [selectedKPIs, setSelectedKPIs] = useState<number[]>([]);
  const [kpiConfigs, setKpiConfigs] = useState<
    Record<number, { targetValue: number; visualizationType: 'chart' | 'progress' | 'value' }>
  >({});

  // Load program data
  useEffect(() => {
    const id = Number(params.id);
    const found = mockPrograms.find((p) => p.id === id);
    if (found) {
      setProgram(found);
    } else {
      error('프로그램을 찾을 수 없습니다');
      setTimeout(() => {
        router.push('/programs/planning');
      }, 1500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  // Load assigned KPIs
  useEffect(() => {
    if (!program) return;
    const kpis = getFromStorage<ProgramKPI>(STORAGE_KEYS.PROGRAM_KPIS);
    const programKPIs = kpis.filter((k) => k.programId === program.id);
    setAssignedKPIs(programKPIs);
  }, [program]);

  // Load KPI templates from storage
  useEffect(() => {
    const templates = getFromStorage<KPITemplate>(STORAGE_KEYS.KPI_TEMPLATES);
    // Only load active templates
    setAvailableKPIs(templates.filter((t) => t.isActive));
  }, []);

  // Get available KPIs (not already assigned) and filter by search term
  const getAvailableKPIsForSelection = () => {
    const assignedIds = assignedKPIs.map((ak) => ak.kpiTemplateId);
    return availableKPIs.filter(
      (kpi) =>
        !assignedIds.includes(kpi.id) &&
        (kpi.name.toLowerCase().includes(kpiSearchTerm.toLowerCase()) ||
          kpi.description.toLowerCase().includes(kpiSearchTerm.toLowerCase()))
    );
  };

  // Handle toggle KPI selection
  const handleToggleKPI = (kpiId: number) => {
    if (selectedKPIs.includes(kpiId)) {
      setSelectedKPIs(selectedKPIs.filter((id) => id !== kpiId));
      // Remove config for this KPI
      const newConfigs = { ...kpiConfigs };
      delete newConfigs[kpiId];
      setKpiConfigs(newConfigs);
    } else {
      setSelectedKPIs([...selectedKPIs, kpiId]);
      // Initialize config with default values
      setKpiConfigs({
        ...kpiConfigs,
        [kpiId]: { targetValue: 0, visualizationType: 'progress' },
      });
    }
  };

  // Handle next step
  const handleNextStep = () => {
    if (selectedKPIs.length === 0) {
      error('최소 1개의 KPI를 선택해주세요');
      return;
    }
    setModalStep(2);
  };

  // Handle back step
  const handleBackStep = () => {
    setModalStep(1);
  };

  // Handle close modal
  const handleCloseKPIModal = () => {
    setShowAssignModal(false);
    setModalStep(1);
    setKpiSearchTerm('');
    setSelectedKPIs([]);
    setKpiConfigs({});
  };

  // Handle update KPI config
  const handleUpdateKPIConfig = (
    kpiId: number,
    field: 'targetValue' | 'visualizationType',
    value: number | 'chart' | 'progress' | 'value'
  ) => {
    setKpiConfigs({
      ...kpiConfigs,
      [kpiId]: {
        ...kpiConfigs[kpiId],
        [field]: value,
      },
    });
  };

  // Handle save KPIs (multiple)
  const handleSaveKPIs = () => {
    if (!program) return;

    // Validate that all selected KPIs have target values
    const invalidKPIs = selectedKPIs.filter((kpiId) => {
      const config = kpiConfigs[kpiId];
      return !config || config.targetValue <= 0;
    });

    if (invalidKPIs.length > 0) {
      error('모든 KPI의 목표값을 입력해주세요');
      return;
    }

    // Create new assignments for all selected KPIs
    const newAssignments: ProgramKPI[] = selectedKPIs.map((kpiId) => {
      const kpi = availableKPIs.find((k) => k.id === kpiId);
      const config = kpiConfigs[kpiId];

      return {
        id: generateId(),
        programId: program.id,
        programName: program.title,
        kpiTemplateId: kpi!.id,
        kpiName: kpi!.name,
        targetValue: config.targetValue,
        unit: kpi!.unit,
        isRequired: true,
        createdAt: formatDate(),
      };
    });

    // Save to storage
    const allKPIs = getFromStorage<ProgramKPI>(STORAGE_KEYS.PROGRAM_KPIS);
    saveToStorage(STORAGE_KEYS.PROGRAM_KPIS, [...allKPIs, ...newAssignments]);

    // Update local state
    setAssignedKPIs([...assignedKPIs, ...newAssignments]);

    // Close modal and reset state
    handleCloseKPIModal();

    success(`${newAssignments.length}개의 KPI가 할당되었습니다`);
  };

  // Handle unassign KPI
  const handleUnassignKPI = (assignment: ProgramKPI) => {
    if (!confirm(`"${assignment.kpiName}" KPI를 제거하시겠습니까?`)) {
      return;
    }

    const allKPIs = getFromStorage<ProgramKPI>(STORAGE_KEYS.PROGRAM_KPIS);
    const updated = allKPIs.filter((k) => k.id !== assignment.id);
    saveToStorage(STORAGE_KEYS.PROGRAM_KPIS, updated);

    setAssignedKPIs(assignedKPIs.filter((k) => k.id !== assignment.id));
    success('KPI가 제거되었습니다');
  };

  if (!program) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Toasts */}
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => hideToast(toast.id)} />
      ))}

      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push(`/programs/${program.id}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>프로그램 상세로 돌아가기</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{program.title} - KPI 할당</h1>
        <p className="text-gray-600 mt-2">프로그램 성과 지표(KPI)를 관리합니다</p>
      </div>

      {/* KPI List */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">할당된 KPI</h2>
            <p className="text-sm text-gray-600 mt-1">이 프로그램의 성과 측정 지표</p>
          </div>
          <button
            onClick={() => setShowAssignModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            KPI 할당
          </button>
        </div>

        {assignedKPIs.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <CheckCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">할당된 KPI가 없습니다</p>
            <p className="text-sm text-gray-400">위 버튼을 클릭하여 KPI를 할당하세요</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignedKPIs.map((assignment, index) => {
              const kpiDetails = availableKPIs.find((k) => k.id === assignment.kpiTemplateId);
              return (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-700 rounded-lg font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{assignment.kpiName}</h3>
                        {assignment.isRequired && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            필수
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {kpiDetails?.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-gray-500">
                          목표값: {assignment.targetValue} {assignment.unit}
                        </span>
                        <span className="text-xs text-gray-500">
                          할당일: {assignment.createdAt}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnassignKPI(assignment)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="제거"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">KPI 할당 안내</h3>
        <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
          <li>프로그램에 적합한 성과 지표를 선택하여 할당합니다</li>
          <li>목표값은 프로그램 특성에 맞게 조정할 수 있습니다</li>
          <li>할당된 KPI는 학생 평가 및 프로그램 성과 분석에 활용됩니다</li>
          <li>KPI는 언제든지 추가하거나 제거할 수 있습니다</li>
        </ul>
      </div>

      {/* Assign KPI Modal - 2 Steps */}
      {showAssignModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={handleCloseKPIModal}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-primary-50 border-b border-primary-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-primary-900">
                  {modalStep === 1 ? 'KPI 선택' : 'KPI 설정'}
                </h2>
                <p className="text-sm text-primary-700 mt-1">
                  {modalStep === 1
                    ? '프로그램에 할당할 KPI를 선택하세요'
                    : '각 KPI의 목표값과 시각화 방법을 설정하세요'}
                </p>
              </div>
              <button
                onClick={handleCloseKPIModal}
                className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-primary-900" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-160px)] p-6">
              {modalStep === 1 ? (
                // Step 1: KPI Selection
                <>
                  {/* Search */}
                  <div className="mb-4">
                    <div className="relative">
                      <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="KPI 검색..."
                        value={kpiSearchTerm}
                        onChange={(e) => setKpiSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  {/* KPI List */}
                  <div className="space-y-2">
                    {getAvailableKPIsForSelection().map((kpi) => (
                      <div
                        key={kpi.id}
                        onClick={() => handleToggleKPI(kpi.id)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedKPIs.includes(kpi.id)
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedKPIs.includes(kpi.id)}
                            onChange={() => {}}
                            className="mt-1 w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-gray-900">{kpi.name}</h4>
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                                {kpi.language === 'ko' ? '한국어' : kpi.language === 'en' ? 'English' : '日本語'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{kpi.description}</p>
                            <p className="text-xs text-gray-500 mt-1">단위: {kpi.unit}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {getAvailableKPIsForSelection().length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        {kpiSearchTerm ? '검색 결과가 없습니다' : '할당 가능한 KPI가 없습니다'}
                      </div>
                    )}
                  </div>

                  {selectedKPIs.length > 0 && (
                    <div className="mt-4 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                      <p className="text-sm text-primary-800">
                        {selectedKPIs.length}개의 KPI가 선택되었습니다
                      </p>
                    </div>
                  )}
                </>
              ) : (
                // Step 2: KPI Configuration
                <div className="space-y-6">
                  {selectedKPIs.map((kpiId) => {
                    const kpi = availableKPIs.find((k) => k.id === kpiId);
                    if (!kpi) return null;

                    return (
                      <div key={kpiId} className="border border-gray-200 rounded-lg p-6">
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-900 text-lg">{kpi.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{kpi.description}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Target Value */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              목표 값
                            </label>
                            <div className="flex gap-2 items-center">
                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={kpiConfigs[kpiId]?.targetValue || 0}
                                onChange={(e) =>
                                  handleUpdateKPIConfig(kpiId, 'targetValue', Number(e.target.value))
                                }
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="목표 값을 입력하세요"
                              />
                              <span className="text-sm text-gray-600 font-medium">{kpi.unit}</span>
                            </div>
                          </div>

                          {/* Visualization Type */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              시각화 방식
                            </label>
                            <select
                              value={kpiConfigs[kpiId]?.visualizationType || 'progress'}
                              onChange={(e) =>
                                handleUpdateKPIConfig(
                                  kpiId,
                                  'visualizationType',
                                  e.target.value as 'chart' | 'progress' | 'value'
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              <option value="progress">프로그레스 바</option>
                              <option value="chart">차트</option>
                              <option value="value">단순 값</option>
                            </select>
                          </div>
                        </div>

                        {/* Preview */}
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-2">미리보기</p>
                          {kpiConfigs[kpiId]?.visualizationType === 'progress' && (
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-700">{kpi.name}</span>
                                <span className="font-medium text-gray-900">
                                  0 / {kpiConfigs[kpiId]?.targetValue || 0} {kpi.unit}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-primary-600 h-2 rounded-full" style={{ width: '0%' }} />
                              </div>
                            </div>
                          )}
                          {kpiConfigs[kpiId]?.visualizationType === 'chart' && (
                            <div className="flex items-center gap-2">
                              <ChartBarIcon className="w-5 h-5 text-primary-600" />
                              <span className="text-sm text-gray-700">차트 형태로 표시됩니다</span>
                            </div>
                          )}
                          {kpiConfigs[kpiId]?.visualizationType === 'value' && (
                            <div className="text-center">
                              <p className="text-3xl font-bold text-gray-900">0</p>
                              <p className="text-sm text-gray-600 mt-1">
                                목표: {kpiConfigs[kpiId]?.targetValue || 0} {kpi.unit}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              {modalStep === 1 ? (
                <>
                  <button
                    onClick={handleCloseKPIModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={selectedKPIs.length === 0}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    다음
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleBackStep}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                  >
                    이전
                  </button>
                  <button
                    onClick={handleSaveKPIs}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    저장
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
