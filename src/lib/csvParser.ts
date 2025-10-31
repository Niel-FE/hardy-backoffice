/**
 * CSV Parser utility for bulk student upload
 */

export interface CSVStudent {
  name: string;
  email: string;
  phone: string;
  program: string;
  team?: string;
  coach?: string;
  enrollDate?: string;
  errors?: string[];
}

export interface CSVParseResult {
  success: boolean;
  data: CSVStudent[];
  errors: string[];
  validCount: number;
  invalidCount: number;
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Korean format)
 */
function isValidPhone(phone: string): boolean {
  const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate student data
 */
function validateStudent(student: any, rowIndex: number): CSVStudent {
  const errors: string[] = [];

  // Required fields
  if (!student.name || student.name.trim() === '') {
    errors.push(`Row ${rowIndex}: 이름이 비어있습니다`);
  }

  if (!student.email || student.email.trim() === '') {
    errors.push(`Row ${rowIndex}: 이메일이 비어있습니다`);
  } else if (!isValidEmail(student.email)) {
    errors.push(`Row ${rowIndex}: 이메일 형식이 올바르지 않습니다`);
  }

  if (!student.phone || student.phone.trim() === '') {
    errors.push(`Row ${rowIndex}: 전화번호가 비어있습니다`);
  } else if (!isValidPhone(student.phone)) {
    errors.push(`Row ${rowIndex}: 전화번호 형식이 올바르지 않습니다`);
  }

  if (!student.program || student.program.trim() === '') {
    errors.push(`Row ${rowIndex}: 프로그램이 비어있습니다`);
  }

  return {
    name: student.name?.trim() || '',
    email: student.email?.trim() || '',
    phone: student.phone?.trim() || '',
    program: student.program?.trim() || '',
    team: student.team?.trim() || '',
    coach: student.coach?.trim() || '',
    enrollDate: student.enrollDate?.trim() || new Date().toISOString().split('T')[0],
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Parse CSV text to student array
 */
export function parseCSV(csvText: string): CSVParseResult {
  const lines = csvText.trim().split('\n');

  if (lines.length === 0) {
    return {
      success: false,
      data: [],
      errors: ['CSV 파일이 비어있습니다'],
      validCount: 0,
      invalidCount: 0,
    };
  }

  // Parse header
  const header = lines[0].split(',').map((h) => h.trim());

  // Expected headers
  const expectedHeaders = ['name', 'email', 'phone', 'program'];
  const optionalHeaders = ['team', 'coach', 'enrollDate'];

  // Validate header
  const missingHeaders = expectedHeaders.filter((h) => !header.includes(h));
  if (missingHeaders.length > 0) {
    return {
      success: false,
      data: [],
      errors: [`필수 컬럼이 누락되었습니다: ${missingHeaders.join(', ')}`],
      validCount: 0,
      invalidCount: 0,
    };
  }

  // Parse data rows
  const data: CSVStudent[] = [];
  const globalErrors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    const values = line.split(',').map((v) => v.trim());

    if (values.length !== header.length) {
      globalErrors.push(`Row ${i + 1}: 컬럼 수가 맞지 않습니다`);
      continue;
    }

    // Create student object
    const student: any = {};
    header.forEach((h, idx) => {
      student[h] = values[idx];
    });

    // Validate student
    const validated = validateStudent(student, i + 1);
    data.push(validated);
  }

  const validCount = data.filter((s) => !s.errors).length;
  const invalidCount = data.filter((s) => s.errors).length;

  return {
    success: invalidCount === 0 && globalErrors.length === 0,
    data,
    errors: globalErrors,
    validCount,
    invalidCount,
  };
}

/**
 * Check for duplicate emails
 */
export function checkDuplicates(students: CSVStudent[], existingEmails: string[]): CSVStudent[] {
  const emails = new Set<string>();

  return students.map((student) => {
    const errors = student.errors || [];

    // Check duplicate in CSV
    if (emails.has(student.email)) {
      errors.push('CSV 내에 중복된 이메일입니다');
    } else {
      emails.add(student.email);
    }

    // Check duplicate with existing data
    if (existingEmails.includes(student.email)) {
      errors.push('이미 등록된 이메일입니다');
    }

    return {
      ...student,
      errors: errors.length > 0 ? errors : undefined,
    };
  });
}

/**
 * Generate CSV template
 */
export function generateCSVTemplate(): string {
  const headers = ['name', 'email', 'phone', 'program', 'team', 'coach', 'enrollDate'];
  const example = [
    '김철수',
    'kim@example.com',
    '010-1234-5678',
    'YEEEYEP 인도네시아',
    '이노베이터스',
    '박코치',
    '2025-10-20',
  ];

  return [headers.join(','), example.join(',')].join('\n');
}

/**
 * Download CSV template
 */
export function downloadCSVTemplate(): void {
  const template = generateCSVTemplate();
  const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', 'student_upload_template.csv');
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
