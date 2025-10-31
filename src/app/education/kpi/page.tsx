'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { getFromStorage, saveToStorage, STORAGE_KEYS, generateId, formatDate } from '@/lib/storage';
import { KPITemplate } from '@/types/kpi';
import WorkflowGuide from '@/components/WorkflowGuide';

const initialKPITemplates: KPITemplate[] = [
  {
    id: 1,
    name: '출석률',
    description: '주간 출석률을 측정합니다',
    unit: '%',
    language: 'ko',
    isActive: true,
    createdAt: '2025-10-01',
    updatedAt: '2025-10-01',
  },
  {
    id: 2,
    name: '과제 제출률',
    description: '주간 과제 제출률을 측정합니다',
    unit: '%',
    language: 'ko',
    isActive: true,
    createdAt: '2025-10-02',
    updatedAt: '2025-10-02',
  },
  {
    id: 3,
    name: '학습 시간',
    description: '주간 학습 시간을 측정합니다',
    unit: '시간',
    language: 'ko',
    isActive: true,
    createdAt: '2025-10-03',
    updatedAt: '2025-10-03',
  },
];

export default function KPIManagementPage() {
  const router = useRouter();
  const { toasts, success, error, hideToast } = useToast();

  const [kpiTemplates, setKpiTemplates] = useState<KPITemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<KPITemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unit: '%',
    language: 'ko' as 'ko' | 'en' | 'ja',
    isActive: true,
  });

  // Load KPI templates from LocalStorage
  useEffect(() => {
    const stored = getFromStorage<KPITemplate>(STORAGE_KEYS.KPI_TEMPLATES);
    if (stored.length > 0) {
      setKpiTemplates(stored);
    } else {
      setKpiTemplates(initialKPITemplates);
      saveToStorage(STORAGE_KEYS.KPI_TEMPLATES, initialKPITemplates);
    }
  }, []);

  // Save KPI templates to LocalStorage
  useEffect(() => {
    if (kpiTemplates.length > 0) {
      saveToStorage(STORAGE_KEYS.KPI_TEMPLATES, kpiTemplates);
    }
  }, [kpiTemplates]);

  // Filtered templates
  const filteredTemplates = kpiTemplates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && template.isActive) ||
      (filterStatus === 'inactive' && !template.isActive);
    return matchesSearch && matchesStatus;
  });

  // Handle create template
  const handleCreate = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      description: '',
      unit: '%',
      language: 'ko',
      isActive: true,
    });
    setShowModal(true);
  };

  // Handle edit template
  const handleEdit = (template: KPITemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      unit: template.unit,
      language: template.language,
      isActive: template.isActive,
    });
    setShowModal(true);
  };

  // Handle delete template
  const handleDelete = (template: KPITemplate) => {
    if (confirm(`"${template.name}" KPI 템플릿을 삭제하시겠습니까?`)) {
      setKpiTemplates((prev) => prev.filter((t) => t.id !== template.id));
      success('KPI 템플릿이 삭제되었습니다');
    }
  };

  // Handle save template
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      error('KPI 이름을 입력해주세요');
      return;
    }
    if (!formData.description.trim()) {
      error('설명을 입력해주세요');
      return;
    }

    if (editingTemplate) {
      // Update existing template
      setKpiTemplates((prev) =>
        prev.map((t) =>
          t.id === editingTemplate.id
            ? {
                ...t,
                name: formData.name,
                description: formData.description,
                unit: formData.unit,
                language: formData.language,
                isActive: formData.isActive,
                updatedAt: formatDate(),
              }
            : t
        )
      );
      success('KPI 템플릿이 수정되었습니다');
    } else {
      // Create new template
      const newTemplate: KPITemplate = {
        id: generateId(),
        name: formData.name,
        description: formData.description,
        unit: formData.unit,
        language: formData.language,
        isActive: formData.isActive,
        createdAt: formatDate(),
        updatedAt: formatDate(),
      };
      setKpiTemplates((prev) => [...prev, newTemplate]);
      success('KPI 템플릿이 생성되었습니다');
    }

    setShowModal(false);
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}
      >
        {isActive ? '활성' : '비활성'}
      </span>
    );
  };

  return (
    <div>
      {/* Toasts */}
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => hideToast(toast.id)} />
      ))}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">KPI 관리</h1>
        <p className="text-gray-600 mt-2">KPI 템플릿을 생성하고 관리합니다</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600">전체 KPI</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{kpiTemplates.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600">활성 KPI</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {kpiTemplates.filter((t) => t.isActive).length}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600">비활성 KPI</p>
          <p className="text-2xl font-bold text-gray-600 mt-1">
            {kpiTemplates.filter((t) => !t.isActive).length}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="KPI 이름 또는 설명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {['all', 'active', 'inactive'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? '전체' : status === 'active' ? '활성' : '비활성'}
              </button>
            ))}
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreate}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            KPI 생성
          </button>
        </div>
      </div>

      {/* KPI Templates Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                KPI 이름
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                설명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                단위
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                언어
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                생성일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                수정일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTemplates.map((template) => (
              <tr key={template.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{template.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600">{template.description}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600">{template.unit}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {template.language === 'ko' ? '한국어' : template.language === 'en' ? 'English' : '日本語'}
                  </span>
                </td>
                <td className="px-6 py-4">{getStatusBadge(template.isActive)}</td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600">{template.createdAt}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600">{template.updatedAt}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(template)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="수정"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(template)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="삭제"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>

      {/* Create/Edit Template Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {editingTemplate ? 'KPI 템플릿 수정' : 'KPI 템플릿 생성'}
            </h3>

            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  KPI 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="예: 출석률"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명 <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="KPI에 대한 설명을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  단위 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="예: %, 점, 시간, 회"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  언어 <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value as 'ko' | 'en' | 'ja' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="ko">한국어</option>
                  <option value="en">English</option>
                  <option value="ja">日本語</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 text-primary-600 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">활성 상태</span>
                    <p className="text-xs text-gray-500">
                      활성화된 템플릿만 프로그램 할당 시 선택할 수 있습니다
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  {editingTemplate ? '수정하기' : '생성하기'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTemplate(null);
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workflow Guide */}
      <WorkflowGuide
        title="📊 KPI 관리 워크플로우"
        description="KPI 템플릿을 생성하고 관리하는 전체 과정을 안내합니다"
        steps={[
          {
            step: 1,
            title: 'KPI 템플릿 생성',
            description: '"새 템플릿" 버튼을 클릭하여 측정할 KPI 항목을 정의합니다. 이름, 설명, 단위를 명확히 입력하세요.',
          },
          {
            step: 2,
            title: '템플릿 활성화 상태 관리',
            description: '생성된 템플릿의 활성화 여부를 설정합니다. 비활성화된 템플릿은 프로그램에 배정할 수 없습니다.',
          },
          {
            step: 3,
            title: '템플릿 검색 및 필터링',
            description: '검색창과 상태 필터를 사용하여 원하는 KPI 템플릿을 빠르게 찾을 수 있습니다.',
          },
          {
            step: 4,
            title: '템플릿 수정 및 삭제',
            description: '기존 템플릿을 수정하거나 더 이상 사용하지 않는 템플릿을 삭제합니다.',
          },
        ]}
        keyFeatures={[
          'KPI 템플릿 생성 및 편집',
          '템플릿 활성화/비활성화 관리',
          '이름 및 설명 검색',
          '상태별 필터링 (전체/활성/비활성)',
          '템플릿 삭제',
          '단위 설정 (%, 시간, 점 등)',
          '다국어 지원 (한국어, 영어, 일본어)',
        ]}
        tips={[
          'KPI 이름은 "출석률", "과제 제출률"처럼 측정 항목을 명확히 표현하세요.',
          '설명란에는 KPI 측정 방법과 기준을 구체적으로 작성하면 운영자 간 혼란을 줄일 수 있습니다.',
          '비활성화된 템플릿은 목록에는 보이지만 프로그램 배정 시 선택할 수 없습니다.',
          '템플릿을 삭제하면 해당 KPI가 배정된 프로그램에 영향을 줄 수 있으니 신중히 결정하세요.',
        ]}
      />
    </div>
  );
}
