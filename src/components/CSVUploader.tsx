'use client';

import { useState, useRef } from 'react';
import {
  ArrowUpTrayIcon,
  DocumentArrowDownIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { parseCSV, checkDuplicates, downloadCSVTemplate, CSVStudent } from '@/lib/csvParser';

interface CSVUploaderProps {
  onImport: (validStudents: CSVStudent[]) => void;
  existingEmails?: string[];
}

export default function CSVUploader({ onImport, existingEmails = [] }: CSVUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<{
    success: boolean;
    data: CSVStudent[];
    errors: string[];
    validCount: number;
    invalidCount: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      alert('CSV 파일만 업로드 가능합니다.');
      return;
    }

    setFile(selectedFile);

    // Parse CSV
    const text = await selectedFile.text();
    const result = parseCSV(text);

    // Check for duplicates
    const checkedData = checkDuplicates(result.data, existingEmails);
    const validCount = checkedData.filter((s) => !s.errors).length;
    const invalidCount = checkedData.filter((s) => s.errors).length;

    setParseResult({
      ...result,
      data: checkedData,
      validCount,
      invalidCount,
    });
  };

  const handleImport = () => {
    if (!parseResult) return;

    const validStudents = parseResult.data.filter((s) => !s.errors);
    onImport(validStudents);
    handleClose();
  };

  const handleClose = () => {
    setShowModal(false);
    setFile(null);
    setParseResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      {/* Upload Button */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        <ArrowUpTrayIcon className="w-4 h-4" />
        CSV 일괄 등록
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">CSV 일괄 등록</h2>
                <p className="text-sm text-gray-600 mt-1">교육생 정보를 CSV 파일로 한 번에 등록할 수 있습니다.</p>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Template Download */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-blue-900 mb-1">CSV 템플릿 다운로드</h3>
                    <p className="text-sm text-blue-700">
                      먼저 템플릿을 다운로드하여 양식에 맞게 작성해주세요.
                    </p>
                  </div>
                  <button
                    onClick={downloadCSVTemplate}
                    className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    <DocumentArrowDownIcon className="w-4 h-4" />
                    템플릿 다운로드
                  </button>
                </div>
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">CSV 파일 선택</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                />
                {file && (
                  <p className="mt-2 text-sm text-gray-600">
                    선택된 파일: <span className="font-medium">{file.name}</span>
                  </p>
                )}
              </div>

              {/* Parse Result */}
              {parseResult && (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600">전체</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{parseResult.data.length}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-600">유효</p>
                      <p className="text-2xl font-bold text-green-900 mt-1">{parseResult.validCount}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm text-red-600">오류</p>
                      <p className="text-2xl font-bold text-red-900 mt-1">{parseResult.invalidCount}</p>
                    </div>
                  </div>

                  {/* Global Errors */}
                  {parseResult.errors.length > 0 && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="text-sm font-semibold text-red-900 mb-2">파일 오류</h4>
                      <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                        {parseResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Data Preview */}
                  {parseResult.data.length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-900">데이터 미리보기</h4>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">상태</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">이름</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">이메일</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">전화번호</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">프로그램</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">오류</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {parseResult.data.map((student, index) => (
                              <tr key={index} className={student.errors ? 'bg-red-50' : 'hover:bg-gray-50'}>
                                <td className="px-4 py-2">
                                  {student.errors ? (
                                    <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
                                  ) : (
                                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                  )}
                                </td>
                                <td className="px-4 py-2 text-gray-900">{student.name}</td>
                                <td className="px-4 py-2 text-gray-600">{student.email}</td>
                                <td className="px-4 py-2 text-gray-600">{student.phone}</td>
                                <td className="px-4 py-2 text-gray-600">{student.program}</td>
                                <td className="px-4 py-2">
                                  {student.errors && (
                                    <ul className="text-xs text-red-600 space-y-1">
                                      {student.errors.map((error, idx) => (
                                        <li key={idx}>{error}</li>
                                      ))}
                                    </ul>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <p className="text-sm text-gray-600">
                {parseResult && parseResult.validCount > 0
                  ? `${parseResult.validCount}명의 교육생을 등록하시겠습니까?`
                  : '파일을 선택해주세요.'}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                >
                  취소
                </button>
                <button
                  onClick={handleImport}
                  disabled={!parseResult || parseResult.validCount === 0}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {parseResult ? `${parseResult.validCount}명 등록` : '등록'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
