'use client';

import { CheckIcon, XMarkIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

interface BulkActionBarProps {
  selectedCount: number;
  onApprove?: () => void;
  onReject?: () => void;
  onExport?: () => void;
  onClear: () => void;
  actions?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'success' | 'danger' | 'secondary';
    icon?: any;
  }[];
}

export default function BulkActionBar({
  selectedCount,
  onApprove,
  onReject,
  onExport,
  onClear,
  actions,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-gray-900 text-white rounded-lg shadow-2xl px-6 py-4 flex items-center gap-4 min-w-[400px]">
        {/* Selected Count */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-sm font-bold">
            {selectedCount}
          </div>
          <span className="text-sm font-medium">{selectedCount}개 선택됨</span>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-700" />

        {/* Default Actions */}
        <div className="flex items-center gap-2">
          {onApprove && (
            <button
              onClick={onApprove}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-colors"
            >
              <CheckIcon className="w-4 h-4" />
              승인
            </button>
          )}
          {onReject && (
            <button
              onClick={onReject}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
              반려
            </button>
          )}
          {onExport && (
            <button
              onClick={onExport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              내보내기
            </button>
          )}

          {/* Custom Actions */}
          {actions?.map((action, index) => {
            const bgColors = {
              primary: 'bg-primary-600 hover:bg-primary-700',
              success: 'bg-green-600 hover:bg-green-700',
              danger: 'bg-red-600 hover:bg-red-700',
              secondary: 'bg-gray-600 hover:bg-gray-700',
            };
            const bgClass = bgColors[action.variant || 'primary'];

            return (
              <button
                key={index}
                onClick={action.onClick}
                className={`flex items-center gap-1.5 px-3 py-1.5 ${bgClass} rounded text-sm font-medium transition-colors`}
              >
                {action.icon && <action.icon className="w-4 h-4" />}
                {action.label}
              </button>
            );
          })}
        </div>

        {/* Clear Button */}
        <button
          onClick={onClear}
          className="ml-auto text-gray-400 hover:text-white transition-colors"
          aria-label="Clear selection"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
