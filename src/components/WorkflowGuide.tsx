'use client';

import { useState } from 'react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  LightBulbIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';

export interface WorkflowStep {
  step: number;
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface WorkflowGuideProps {
  title: string;
  description: string;
  steps: WorkflowStep[];
  keyFeatures?: string[];
  tips?: string[];
  defaultOpen?: boolean;
}

export default function WorkflowGuide({
  title,
  description,
  steps,
  keyFeatures = [],
  tips = [],
  defaultOpen = false,
}: WorkflowGuideProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mt-12 border-t-2 border-gray-200 pt-8">
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg border border-primary-200">
        {/* Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-primary-100/50 transition-colors rounded-lg"
        >
          <div className="flex items-center gap-3">
            <ClipboardDocumentCheckIcon className="w-6 h-6 text-primary-600" />
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          {isOpen ? (
            <ChevronUpIcon className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {/* Content */}
        {isOpen && (
          <div className="px-6 pb-6 space-y-6">
            {/* Workflow Steps */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <span className="bg-primary-600 text-white px-2 py-0.5 rounded text-xs">워크플로우</span>
                주요 사용 흐름
              </h4>
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-4 bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                        {step.step}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900 mb-1">{step.title}</h5>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Features */}
            {keyFeatures.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs">주요 기능</span>
                  이 페이지에서 할 수 있는 작업
                </h4>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {keyFeatures.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Tips */}
            {tips.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <LightBulbIcon className="w-4 h-4 text-yellow-600" />
                  <span className="bg-yellow-600 text-white px-2 py-0.5 rounded text-xs">팁</span>
                  알아두면 유용한 정보
                </h4>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <ul className="space-y-2">
                    {tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-yellow-600 font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
