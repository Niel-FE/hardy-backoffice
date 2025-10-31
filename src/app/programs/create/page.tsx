'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  PlusIcon,
  XMarkIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { getFromStorage, saveToStorage, STORAGE_KEYS, generateId, formatDate } from '@/lib/storage';
import { Program, ServiceRegion, ProgramKPI } from '@/types/program';
import { KPITemplate } from '@/types/kpi';

const serviceRegionLabels: Record<ServiceRegion, string> = {
  ko: '한국',
  en: '영어',
  jp: '일본어',
};

export default function CreateProgramPage() {
  const router = useRouter();
  const { toasts, success, error, hideToast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sapCode: '',
    serviceRegions: [] as ServiceRegion[],
    keywords: [] as string[],
    duration: '',
    startDate: '',
    endDate: '',
    targetStudents: 0,
    curriculum: [] as string[],
    coordinator: '',
    budget: 0,
    adminNotes: '', // 관리자 메모
  });

  const [keywordInput, setKeywordInput] = useState('');
  const [curriculumInput, setCurriculumInput] = useState('');

  // KPI 관련 state
  const [kpiTemplates, setKpiTemplates] = useState<KPITemplate[]>([]);
  const [selectedKPIs, setSelectedKPIs] = useState<{ kpiId: number; targetValue: number }[]>([]);
  const [showKPIModal, setShowKPIModal] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [kpiSearchTerm, setKpiSearchTerm] = useState('');
  const [selectedKPIIds, setSelectedKPIIds] = useState<number[]>([]);
  const [kpiConfigs, setKpiConfigs] = useState<
    Record<number, { targetValue: number; visualizationType: 'chart' | 'progress' | 'value' }>
  >({});

  // Load KPI templates
  useEffect(() => {
    const templates = getFromStorage<KPITemplate>(STORAGE_KEYS.KPI_TEMPLATES);
    setKpiTemplates(templates.filter((t) => t.isActive));
  }, []);

  // 키워드 추가
  const handleAddKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, keywordInput.trim()],
      });
      setKeywordInput('');
    }
  };

  // 키워드 제거
  const handleRemoveKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter((k) => k !== keyword),
    });
  };

  // 커리큘럼 추가
  const handleAddCurriculum = () => {
    if (curriculumInput.trim() && !formData.curriculum.includes(curriculumInput.trim())) {
      setFormData({
        ...formData,
        curriculum: [...formData.curriculum, curriculumInput.trim()],
      });
      setCurriculumInput('');
    }
  };

  // 커리큘럼 제거
  const handleRemoveCurriculum = (item: string) => {
    setFormData({
      ...formData,
      curriculum: formData.curriculum.filter((c) => c !== item),
    });
  };

  // 서비스 지역 토글
  const handleToggleRegion = (region: ServiceRegion) => {
    if (formData.serviceRegions.includes(region)) {
      setFormData({
        ...formData,
        serviceRegions: formData.serviceRegions.filter((r) => r !== region),
      });
    } else {
      setFormData({
        ...formData,
        serviceRegions: [...formData.serviceRegions, region],
      });
    }
  };

  // Get available KPIs (not already assigned) and filter by search term
  const getAvailableKPIsForSelection = () => {
    const assignedIds = selectedKPIs.map((k) => k.kpiId);
    return kpiTemplates.filter(
      (kpi) =>
        !assignedIds.includes(kpi.id) &&
        (kpi.name.toLowerCase().includes(kpiSearchTerm.toLowerCase()) ||
          kpi.description.toLowerCase().includes(kpiSearchTerm.toLowerCase()))
    );
  };

  // Handle toggle KPI selection
  const handleToggleKPI = (kpiId: number) => {
    if (selectedKPIIds.includes(kpiId)) {
      setSelectedKPIIds(selectedKPIIds.filter((id) => id !== kpiId));
      // Remove config for this KPI
      const newConfigs = { ...kpiConfigs };
      delete newConfigs[kpiId];
      setKpiConfigs(newConfigs);
    } else {
      setSelectedKPIIds([...selectedKPIIds, kpiId]);
      // Initialize config with default values
      setKpiConfigs({
        ...kpiConfigs,
        [kpiId]: { targetValue: 0, visualizationType: 'progress' },
      });
    }
  };

  // Handle next step
  const handleNextStep = () => {
    if (selectedKPIIds.length === 0) {
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
    setShowKPIModal(false);
    setModalStep(1);
    setKpiSearchTerm('');
    setSelectedKPIIds([]);
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
    // Validate that all selected KPIs have target values
    const invalidKPIs = selectedKPIIds.filter((kpiId) => {
      const config = kpiConfigs[kpiId];
      return !config || config.targetValue <= 0;
    });

    if (invalidKPIs.length > 0) {
      error('모든 KPI의 목표값을 입력해주세요');
      return;
    }

    // Add to selectedKPIs
    const newKPIs = selectedKPIIds.map((kpiId) => ({
      kpiId,
      targetValue: kpiConfigs[kpiId].targetValue,
    }));

    setSelectedKPIs([...selectedKPIs, ...newKPIs]);
    handleCloseKPIModal();
    success(`${newKPIs.length}개의 KPI가 추가되었습니다`);
  };

  // KPI 제거
  const handleRemoveKPI = (kpiId: number) => {
    setSelectedKPIs(selectedKPIs.filter((k) => k.kpiId !== kpiId));
    success('KPI가 제거되었습니다');
  };

  // 프로그램 저장
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.title) {
      error('프로그램명을 입력해주세요');
      return;
    }
    if (!formData.sapCode) {
      error('SAP 코드를 입력해주세요');
      return;
    }
    if (formData.serviceRegions.length === 0) {
      error('서비스 지역을 하나 이상 선택해주세요');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      error('시작일과 종료일을 입력해주세요');
      return;
    }
    if (!formData.coordinator) {
      error('담당자를 입력해주세요');
      return;
    }

    const newProgram: Program = {
      id: generateId(),
      title: formData.title,
      description: formData.description,
      sapCode: formData.sapCode,
      serviceRegions: formData.serviceRegions,
      keywords: formData.keywords,
      duration: formData.duration,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: 'planning', // 기본값으로 'planning' 설정
      targetStudents: formData.targetStudents,
      currentStudents: 0,
      curriculum: formData.curriculum,
      coordinator: formData.coordinator,
      budget: formData.budget,
      adminNotes: formData.adminNotes,
      createdAt: formatDate(),
      updatedAt: formatDate(),
    };

    // 기존 프로그램 가져오기
    const programs = getFromStorage<Program>(STORAGE_KEYS.PROGRAMS);

    // 새 프로그램 추가
    saveToStorage(STORAGE_KEYS.PROGRAMS, [...programs, newProgram]);

    // 선택된 KPI 저장
    if (selectedKPIs.length > 0) {
      const programKPIs = getFromStorage<ProgramKPI>(STORAGE_KEYS.PROGRAM_KPIS);
      const newKPIs = selectedKPIs.map((selectedKPI) => {
        const kpiTemplate = kpiTemplates.find((t) => t.id === selectedKPI.kpiId);
        if (!kpiTemplate) return null;

        const programKPI: ProgramKPI = {
          id: generateId(),
          programId: newProgram.id,
          programName: newProgram.title,
          kpiTemplateId: kpiTemplate.id,
          kpiName: kpiTemplate.name,
          targetValue: selectedKPI.targetValue,
          unit: kpiTemplate.unit,
          isRequired: true,
          createdAt: formatDate(),
        };
        return programKPI;
      }).filter((kpi): kpi is ProgramKPI => kpi !== null);

      saveToStorage(STORAGE_KEYS.PROGRAM_KPIS, [...programKPIs, ...newKPIs]);
    }

    success('프로그램이 생성되었습니다');

    // 프로그램 목록으로 이동
    setTimeout(() => {
      router.push('/programs/planning');
    }, 1000);
  };

  const handleCancel = () => {
    if (confirm('작성 중인 내용이 삭제됩니다. 계속하시겠습니까?')) {
      router.back();
    }
  };

  return (
    <div>
      {/* Toasts */}
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => hideToast(toast.id)} />
      ))}

      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/programs/planning')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>목록으로 돌아가기</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900">프로그램 생성</h1>
        <p className="text-gray-600 mt-2">새로운 교육 프로그램을 등록합니다</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">기본 정보</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                프로그램명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="예: YEEEYEP 인도네시아"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="프로그램에 대한 설명을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SAP 코드 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.sapCode}
                onChange={(e) => setFormData({ ...formData, sapCode: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="예: SAP-2025-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                담당자 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.coordinator}
                onChange={(e) => setFormData({ ...formData, coordinator: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="예: 김매니저"
              />
            </div>
          </div>
        </div>

        {/* 서비스 지역 */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            서비스 지역 <span className="text-red-500">*</span>
          </h2>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(serviceRegionLabels) as ServiceRegion[]).map((region) => (
              <button
                key={region}
                type="button"
                onClick={() => handleToggleRegion(region)}
                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                  formData.serviceRegions.includes(region)
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                {serviceRegionLabels[region]}
              </button>
            ))}
          </div>
        </div>

        {/* 키워드 */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">키워드</h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddKeyword();
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="키워드 입력 (예: 창업, 비즈니스 모델, 린 스타트업)"
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                추가
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium flex items-center gap-2"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(keyword)}
                    className="hover:text-primary-900"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </span>
              ))}
              {formData.keywords.length === 0 && (
                <p className="text-sm text-gray-500">키워드를 추가해주세요</p>
              )}
            </div>
          </div>
        </div>

        {/* 일정 및 규모 */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">일정 및 규모</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시작일 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                종료일 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">기간</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="예: 16주"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">목표 인원</label>
              <input
                type="number"
                min="0"
                value={formData.targetStudents || ''}
                onChange={(e) => setFormData({ ...formData, targetStudents: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="40"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">예산 (원)</label>
              <input
                type="number"
                min="0"
                value={formData.budget || ''}
                onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="50000000"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                관리자 메모 (내부용)
              </label>
              <textarea
                value={formData.adminNotes}
                onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="프로그램 기획 시 관리자끼리 공유할 내용을 입력하세요 (교육생에게는 노출되지 않습니다)"
              />
              <p className="text-xs text-gray-500 mt-1">
                * 이 메모는 관리자만 볼 수 있으며, 프로그램 협업 시 참고사항 등을 기록할 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* 커리큘럼 */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">커리큘럼</h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={curriculumInput}
                onChange={(e) => setCurriculumInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCurriculum();
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="커리큘럼 항목 입력 (예: 비즈니스 모델 캔버스)"
              />
              <button
                type="button"
                onClick={handleAddCurriculum}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                추가
              </button>
            </div>

            <div className="space-y-2">
              {formData.curriculum.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm text-gray-900">{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCurriculum(item)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {formData.curriculum.length === 0 && (
                <p className="text-sm text-gray-500">커리큘럼 항목을 추가해주세요</p>
              )}
            </div>
          </div>
        </div>

        {/* 필수 KPI 할당 */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">필수 KPI 할당</h2>
              <p className="text-sm text-gray-600 mt-1">프로그램에 필수로 적용할 KPI를 선택하세요 (선택사항)</p>
            </div>
            <button
              type="button"
              onClick={() => setShowKPIModal(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              KPI 추가
            </button>
          </div>

          <div className="space-y-3">
            {selectedKPIs.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                할당된 KPI가 없습니다. 위 버튼을 클릭하여 KPI를 추가하세요.
              </p>
            ) : (
              selectedKPIs.map((selectedKPI, index) => {
                const kpiTemplate = kpiTemplates.find((t) => t.id === selectedKPI.kpiId);
                if (!kpiTemplate) return null;
                return (
                  <div
                    key={selectedKPI.kpiId}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-700 rounded-lg font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{kpiTemplate.name}</h3>
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            필수
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{kpiTemplate.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500">
                            목표값: {selectedKPI.targetValue} {kpiTemplate.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveKPI(selectedKPI.kpiId)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="제거"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 추가 기능 안내 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">필수 KPI vs 팀 KPI</h3>
          <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
            <li><strong>필수 KPI</strong>: 프로그램 생성 시 또는 프로그램 상세 페이지에서 할당. 모든 학생이 개별적으로 달성해야 하는 지표입니다</li>
            <li><strong>팀 KPI</strong>: 팀이 구성된 후 팀 KPI 관리 페이지에서 팀이 자체적으로 설정. 팀원들이 협력하여 달성하는 목표입니다</li>
            <li>프로그램 생성 후: 출결관리 세팅, VOD 세트 할당, 추가 KPI 할당이 가능합니다</li>
          </ul>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            프로그램 생성
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            취소
          </button>
        </div>
      </form>

      {/* KPI 할당 모달 - 2 Steps */}
      {showKPIModal && (
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
                          selectedKPIIds.includes(kpi.id)
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedKPIIds.includes(kpi.id)}
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

                  {selectedKPIIds.length > 0 && (
                    <div className="mt-4 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                      <p className="text-sm text-primary-800">
                        {selectedKPIIds.length}개의 KPI가 선택되었습니다
                      </p>
                    </div>
                  )}
                </>
              ) : (
                // Step 2: KPI Configuration
                <div className="space-y-6">
                  {selectedKPIIds.map((kpiId) => {
                    const kpi = kpiTemplates.find((k) => k.id === kpiId);
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
                    disabled={selectedKPIIds.length === 0}
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
