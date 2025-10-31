'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  UsersIcon,
  XMarkIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import WorkflowGuide from '@/components/WorkflowGuide';

interface Team {
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

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: 'leader' | 'member';
  joinDate: string;
}

interface CSVTeamData {
  teamName: string;
  programId: string;
  coachEmail: string;
  goal: string;
  description: string;
  memberEmails: string;
  leaderEmail: string;
  isValid: boolean;
  errors: string[];
}

const mockTeams: Team[] = [
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

// Mock team members
const mockTeamMembers: { [key: number]: TeamMember[] } = {
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

// Mock coaches
const mockCoaches = [
  { id: 1, name: '박코치', email: 'park.coach@example.com', specialty: '비즈니스 전략', country: '한국' },
  { id: 2, name: '김코치', email: 'kim.coach@example.com', specialty: '마케팅/세일즈', country: '한국' },
  { id: 3, name: '최코치', email: 'choi.coach@example.com', specialty: '재무/회계', country: '한국' },
  { id: 4, name: '이코치', email: 'lee.coach@example.com', specialty: '피칭 코칭', country: '미국' },
  { id: 5, name: 'John Smith', email: 'john@example.com', specialty: '법률/특허', country: '미국' },
  { id: 6, name: 'Sarah Lee', email: 'sarah@example.com', specialty: '제품 개발', country: '영국' },
  { id: 7, name: '田中太郎', email: 'tanaka@example.com', specialty: '투자 유치', country: '일본' },
  { id: 8, name: '정코치', email: 'jung.coach@example.com', specialty: '조직 운영', country: '한국' },
];

// Mock students (교육생)
const mockStudents = [
  { id: 1, name: '김철수', email: 'kim@example.com', programId: 1, programName: 'YEEEYEP 인도네시아' },
  { id: 2, name: '이영희', email: 'lee@example.com', programId: 2, programName: '하나유니브' },
  { id: 3, name: '박민수', email: 'park@example.com', programId: 3, programName: 'SuTEAM' },
  { id: 4, name: '정수진', email: 'jung@example.com', programId: 1, programName: 'YEEEYEP 인도네시아' },
  { id: 5, name: '최동욱', email: 'choi@example.com', programId: 1, programName: 'YEEEYEP 인도네시아' },
  { id: 6, name: '강민지', email: 'kang@example.com', programId: 2, programName: '하나유니브' },
  { id: 7, name: '윤서준', email: 'yoon@example.com', programId: 2, programName: '하나유니브' },
  { id: 8, name: '한지우', email: 'han@example.com', programId: 3, programName: 'SuTEAM' },
  { id: 9, name: '서예은', email: 'seo@example.com', programId: 3, programName: 'SuTEAM' },
  { id: 10, name: '임도현', email: 'lim@example.com', programId: 1, programName: 'YEEEYEP 인도네시아' },
  { id: 11, name: '조하은', email: 'cho@example.com', programId: 2, programName: '하나유니브' },
  { id: 12, name: '장성민', email: 'jang@example.com', programId: 1, programName: 'YEEEYEP 인도네시아' },
  { id: 13, name: '배수현', email: 'bae@example.com', programId: 2, programName: '하나유니브' },
  { id: 14, name: '오지훈', email: 'oh@example.com', programId: 3, programName: 'SuTEAM' },
  { id: 15, name: '송유진', email: 'song@example.com', programId: 1, programName: 'YEEEYEP 인도네시아' },
];

export default function TeamManagementPage() {
  const router = useRouter();
  const { toasts, success, error, hideToast } = useToast();

  const [teams, setTeams] = useState<Team[]>(mockTeams);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'completed'>('all');
  const [filterProgram, setFilterProgram] = useState<number>(0);

  // Modal states
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkCreateModal, setShowBulkCreateModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    goal: '',
    description: '',
    status: 'active' as Team['status'],
    coach: '',
  });
  const [createFormData, setCreateFormData] = useState({
    name: '',
    programId: 0,
    coachId: 0,
    goal: '',
    description: '',
    selectedMembers: [] as number[], // student IDs
    leaderId: 0,
  });
  const [coachSearch, setCoachSearch] = useState('');
  const [coachCountryFilter, setCoachCountryFilter] = useState<string>('all');
  const [studentSearch, setStudentSearch] = useState('');
  const [editCoachSearch, setEditCoachSearch] = useState('');
  const [editCoachCountryFilter, setEditCoachCountryFilter] = useState<string>('all');

  // CSV Bulk Create states
  const [csvData, setCsvData] = useState<CSVTeamData[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  // Get unique programs
  const programs = Array.from(new Set(teams.map((t) => ({ id: t.programId, name: t.program }))))
    .filter((p, index, self) => self.findIndex((t) => t.id === p.id) === index);

  // Get unique countries
  const countries = Array.from(new Set(mockCoaches.map((c) => c.country)));

  // Filter coaches by search and country (for create modal)
  const filteredCoaches = mockCoaches.filter((coach) => {
    const matchesSearch =
      coach.name.toLowerCase().includes(coachSearch.toLowerCase()) ||
      coach.email.toLowerCase().includes(coachSearch.toLowerCase()) ||
      coach.specialty.toLowerCase().includes(coachSearch.toLowerCase());
    const matchesCountry = coachCountryFilter === 'all' || coach.country === coachCountryFilter;
    return matchesSearch && matchesCountry;
  });

  // Filter coaches by search and country (for edit modal)
  const filteredEditCoaches = mockCoaches.filter((coach) => {
    const matchesSearch =
      coach.name.toLowerCase().includes(editCoachSearch.toLowerCase()) ||
      coach.email.toLowerCase().includes(editCoachSearch.toLowerCase()) ||
      coach.specialty.toLowerCase().includes(editCoachSearch.toLowerCase());
    const matchesCountry = editCoachCountryFilter === 'all' || coach.country === editCoachCountryFilter;
    return matchesSearch && matchesCountry;
  });

  // Filter students by program and search
  const availableStudents = mockStudents.filter((student) => {
    if (createFormData.programId === 0) return false;
    if (student.programId !== createFormData.programId) return false;
    if (studentSearch) {
      return (
        student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        student.email.toLowerCase().includes(studentSearch.toLowerCase())
      );
    }
    return true;
  });

  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.coach.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || team.status === filterStatus;
    const matchesProgram = filterProgram === 0 || team.programId === filterProgram;
    return matchesSearch && matchesStatus && matchesProgram;
  });

  const getStatusBadge = (status: Team['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    const labels = {
      active: '활동 중',
      inactive: '비활성',
      completed: '완료',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  // Open members modal
  const handleViewMembers = (team: Team) => {
    setSelectedTeam(team);
    setShowMembersModal(true);
  };

  // Open edit modal
  const handleEdit = (team: Team) => {
    setSelectedTeam(team);
    setEditFormData({
      name: team.name,
      goal: team.goal,
      description: team.description || '',
      status: team.status,
      coach: team.coach,
    });
    setShowEditModal(true);
  };

  // Save team edits
  const handleSaveEdit = () => {
    if (!selectedTeam) return;

    if (!editFormData.name.trim()) {
      error('팀명을 입력해주세요');
      return;
    }

    if (!editFormData.coach.trim()) {
      error('담당 코치를 선택해주세요');
      return;
    }

    setTeams(
      teams.map((t) =>
        t.id === selectedTeam.id
          ? {
              ...t,
              name: editFormData.name,
              goal: editFormData.goal,
              description: editFormData.description,
              status: editFormData.status,
              coach: editFormData.coach,
            }
          : t
      )
    );
    success('팀 정보가 수정되었습니다');
    setShowEditModal(false);
    setSelectedTeam(null);
  };

  // Remove team member
  const handleRemoveMember = (memberId: number) => {
    if (!selectedTeam) return;
    if (!confirm('팀원을 제거하시겠습니까?')) return;

    // Update member count
    setTeams(
      teams.map((t) =>
        t.id === selectedTeam.id ? { ...t, memberCount: t.memberCount - 1 } : t
      )
    );
    success('팀원이 제거되었습니다');
  };

  // Set team leader
  const handleSetLeader = (memberId: number) => {
    if (!selectedTeam) return;
    if (!confirm('이 팀원을 팀장으로 지정하시겠습니까?')) return;

    // In real implementation, update the team member role in the backend
    success('팀장이 변경되었습니다');
  };

  // Create new team
  const handleCreateTeam = () => {
    if (!createFormData.name.trim()) {
      error('팀명을 입력해주세요');
      return;
    }
    if (createFormData.programId === 0) {
      error('프로그램을 선택해주세요');
      return;
    }
    if (createFormData.coachId === 0) {
      error('담당 코치를 선택해주세요');
      return;
    }
    if (createFormData.selectedMembers.length === 0) {
      error('최소 1명의 팀원을 추가해주세요');
      return;
    }
    if (createFormData.leaderId === 0) {
      error('팀장을 지정해주세요');
      return;
    }

    const program = programs.find((p) => p.id === createFormData.programId);
    const coach = mockCoaches.find((c) => c.id === createFormData.coachId);

    const newTeam: Team = {
      id: teams.length + 1,
      name: createFormData.name,
      programId: createFormData.programId,
      program: program?.name || '',
      coach: coach?.name || '',
      memberCount: createFormData.selectedMembers.length,
      status: 'active',
      createdDate: new Date().toISOString().split('T')[0],
      goal: createFormData.goal,
      description: createFormData.description,
    };

    // Save team members
    const teamMembers: TeamMember[] = createFormData.selectedMembers.map((studentId) => {
      const student = mockStudents.find((s) => s.id === studentId);
      return {
        id: studentId,
        name: student?.name || '',
        email: student?.email || '',
        role: studentId === createFormData.leaderId ? 'leader' : 'member',
        joinDate: new Date().toISOString().split('T')[0],
      };
    });

    // In real implementation, save teamMembers to backend/storage
    // mockTeamMembers[newTeam.id] = teamMembers; // This would update the mock data

    setTeams([...teams, newTeam]);
    success('팀이 생성되었습니다');
    setShowCreateModal(false);
    setCreateFormData({
      name: '',
      programId: 0,
      coachId: 0,
      goal: '',
      description: '',
      selectedMembers: [],
      leaderId: 0,
    });
    setCoachSearch('');
    setCoachCountryFilter('all');
    setStudentSearch('');
  };

  // Reset coach filters when modal closes
  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setCreateFormData({
      name: '',
      programId: 0,
      coachId: 0,
      goal: '',
      description: '',
      selectedMembers: [],
      leaderId: 0,
    });
    setCoachSearch('');
    setCoachCountryFilter('all');
    setStudentSearch('');
  };

  // Toggle student selection
  const handleToggleStudent = (studentId: number) => {
    const isSelected = createFormData.selectedMembers.includes(studentId);
    if (isSelected) {
      setCreateFormData({
        ...createFormData,
        selectedMembers: createFormData.selectedMembers.filter((id) => id !== studentId),
        leaderId: createFormData.leaderId === studentId ? 0 : createFormData.leaderId,
      });
    } else {
      setCreateFormData({
        ...createFormData,
        selectedMembers: [...createFormData.selectedMembers, studentId],
      });
    }
  };

  // CSV Template Download
  const handleDownloadTemplate = () => {
    const template = [
      ['팀명', '프로그램ID', '코치이메일', '팀목표', '팀설명', '팀원이메일(;구분)', '팀장이메일'],
      [
        '이노베이터스',
        '1',
        'park.coach@example.com',
        '주차별 마일스톤 100% 달성',
        '혁신적인 솔루션으로 시장을 선도하는 팀',
        'kim@example.com;lee@example.com;park@example.com',
        'kim@example.com',
      ],
      [
        '스타트업랩',
        '2',
        'kim.coach@example.com',
        '투자 유치 달성',
        '대학생 창업가들의 실험실',
        'jung@example.com;choi@example.com;kang@example.com;yoon@example.com',
        'jung@example.com',
      ],
      ['벤처스', '3', 'choi.coach@example.com', 'MVP 출시 및 시장 검증', '빠른 실행력으로 시장을 검증하는 팀', 'jang@example.com;bae@example.com', 'jang@example.com'],
    ];

    const csvContent = template.map((row) => row.join(',')).join('\n');
    const BOM = '\uFEFF'; // UTF-8 BOM for Excel
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'team_bulk_create_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('CSV 템플릿이 다운로드되었습니다');
  };

  // CSV File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      error('CSV 파일만 업로드 가능합니다');
      return;
    }

    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file, 'UTF-8');
  };

  // Parse CSV
  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter((line) => line.trim());
    if (lines.length < 2) {
      error('CSV 파일에 데이터가 없습니다');
      return;
    }

    // Skip header
    const dataLines = lines.slice(1);
    const parsedData: CSVTeamData[] = dataLines.map((line, index) => {
      const values = line.split(',').map((v) => v.trim());
      const [teamName, programId, coachEmail, goal, description, memberEmails, leaderEmail] = values;

      const errors: string[] = [];
      if (!teamName) errors.push('팀명 누락');
      if (!programId) errors.push('프로그램ID 누락');
      if (!coachEmail) errors.push('코치이메일 누락');
      if (!memberEmails) errors.push('팀원이메일 누락');
      if (!leaderEmail) errors.push('팀장이메일 누락');

      // Validate program exists
      const program = programs.find((p) => p.id === Number(programId));
      if (programId && !program) errors.push('존재하지 않는 프로그램ID');

      // Validate coach exists
      const coach = mockCoaches.find((c) => c.email === coachEmail);
      if (coachEmail && !coach) errors.push('존재하지 않는 코치 이메일');

      // Validate member emails
      if (memberEmails) {
        const emailList = memberEmails.split(';').map((e) => e.trim());
        const invalidMembers = emailList.filter((email) => !mockStudents.find((s) => s.email === email));
        if (invalidMembers.length > 0) {
          errors.push(`존재하지 않는 팀원: ${invalidMembers.join(', ')}`);
        }
      }

      // Validate leader email
      if (leaderEmail && memberEmails) {
        const emailList = memberEmails.split(';').map((e) => e.trim());
        if (!emailList.includes(leaderEmail)) {
          errors.push('팀장은 팀원 목록에 포함되어야 함');
        }
        if (!mockStudents.find((s) => s.email === leaderEmail)) {
          errors.push('존재하지 않는 팀장 이메일');
        }
      }

      return {
        teamName: teamName || '',
        programId: programId || '',
        coachEmail: coachEmail || '',
        goal: goal || '',
        description: description || '',
        memberEmails: memberEmails || '',
        leaderEmail: leaderEmail || '',
        isValid: errors.length === 0,
        errors,
      };
    });

    setCsvData(parsedData);
    if (parsedData.every((d) => d.isValid)) {
      success(`${parsedData.length}개 팀 데이터를 불러왔습니다`);
    } else {
      const invalidCount = parsedData.filter((d) => !d.isValid).length;
      error(`${invalidCount}개 행에 오류가 있습니다. 확인해주세요.`);
    }
  };

  // Bulk Create Teams
  const handleBulkCreate = () => {
    const validData = csvData.filter((d) => d.isValid);
    if (validData.length === 0) {
      error('생성할 수 있는 유효한 데이터가 없습니다');
      return;
    }

    const newTeams: Team[] = validData.map((data, index) => {
      const program = programs.find((p) => p.id === Number(data.programId));
      const coach = mockCoaches.find((c) => c.email === data.coachEmail);
      const memberEmailList = data.memberEmails.split(';').map((e) => e.trim());

      return {
        id: teams.length + index + 1,
        name: data.teamName,
        programId: Number(data.programId),
        program: program?.name || '',
        coach: coach?.name || '',
        memberCount: memberEmailList.length,
        status: 'active',
        createdDate: new Date().toISOString().split('T')[0],
        goal: data.goal,
        description: data.description,
      };
    });

    // Create team members for each team (in real implementation, save to backend)
    validData.forEach((data, index) => {
      const memberEmailList = data.memberEmails.split(';').map((e) => e.trim());
      const teamMembers: TeamMember[] = memberEmailList.map((email) => {
        const student = mockStudents.find((s) => s.email === email);
        return {
          id: student?.id || 0,
          name: student?.name || '',
          email: email,
          role: email === data.leaderEmail ? 'leader' : 'member',
          joinDate: new Date().toISOString().split('T')[0],
        };
      });
      // mockTeamMembers[newTeams[index].id] = teamMembers; // In real implementation
    });

    setTeams([...teams, ...newTeams]);
    success(`${newTeams.length}개 팀이 생성되었습니다`);
    setShowBulkCreateModal(false);
    setCsvData([]);
    setCsvFile(null);
  };

  // Close Bulk Create Modal
  const handleCloseBulkModal = () => {
    setShowBulkCreateModal(false);
    setCsvData([]);
    setCsvFile(null);
  };

  return (
    <div>
      {/* Toasts */}
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => hideToast(toast.id)} />
      ))}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">팀 관리</h1>
        <p className="text-gray-600 mt-2">팀 구성 및 성과 관리</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600">전체 팀</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{teams.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600">활동 중인 팀</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {teams.filter((t) => t.status === 'active').length}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600">전체 팀원</p>
          <p className="text-2xl font-bold text-primary-600 mt-1">
            {teams.reduce((sum, t) => sum + t.memberCount, 0)}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600">완료된 팀</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {teams.filter((t) => t.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Program Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">프로그램:</label>
            <select
              value={filterProgram}
              onChange={(e) => setFilterProgram(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={0}>전체</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">상태:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">전체</option>
              <option value="active">활동 중</option>
              <option value="inactive">비활성</option>
              <option value="completed">완료</option>
            </select>
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="팀명, 프로그램, 코치로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Add Team Buttons */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <PlusIcon className="w-5 h-5" />
            팀 생성
          </button>
          <button
            onClick={() => setShowBulkCreateModal(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <DocumentArrowUpIcon className="w-5 h-5" />
            일괄 생성
          </button>
        </div>
      </div>

      {/* Teams Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                팀명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                프로그램
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                담당 코치
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                팀원 수
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                팀 목표
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTeams.map((team) => (
              <tr key={team.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-100 p-2 rounded-full">
                      <UsersIcon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{team.name}</div>
                      <div className="text-xs text-gray-500">{team.createdDate}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{team.program}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{team.coach}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 font-medium">{team.memberCount}명</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">{team.goal}</div>
                </td>
                <td className="px-6 py-4">{getStatusBadge(team.status)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/students/teams/kpi?teamId=${team.id}`)}
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      팀 KPI
                    </button>
                    <button
                      onClick={() => handleViewMembers(team)}
                      className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      팀원 관리
                    </button>
                    <button
                      onClick={() => handleEdit(team)}
                      className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      수정
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTeams.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>

      {/* Team Members Modal */}
      {showMembersModal && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedTeam.name} 팀원 관리</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedTeam.program} • 총 {mockTeamMembers[selectedTeam.id]?.length || 0}명
                </p>
              </div>
              <button
                onClick={() => {
                  setShowMembersModal(false);
                  setSelectedTeam(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Add Member Button */}
            <div className="mb-4">
              <button className="w-full bg-primary-50 text-primary-700 px-4 py-3 rounded-lg hover:bg-primary-100 transition-colors flex items-center justify-center gap-2 border-2 border-dashed border-primary-300">
                <PlusIcon className="w-5 h-5" />
                팀원 추가
              </button>
            </div>

            {/* Members List */}
            <div className="space-y-3">
              {(mockTeamMembers[selectedTeam.id] || []).map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-100 p-3 rounded-full">
                      <span className="text-lg font-semibold text-gray-700">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{member.name}</span>
                        {member.role === 'leader' && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            팀장
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {member.email} • 참여일: {member.joinDate}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.role !== 'leader' && (
                      <button
                        onClick={() => handleSetLeader(member.id)}
                        className="px-3 py-1 text-sm text-yellow-700 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
                        title="팀장으로 지정"
                      >
                        팀장 지정
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="팀원 제거"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t">
              <button
                onClick={() => {
                  setShowMembersModal(false);
                  setSelectedTeam(null);
                }}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {showEditModal && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">팀 정보 수정</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedTeam(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Team Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  팀명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="예: Team Alpha"
                />
              </div>

              {/* Team Goal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">팀 목표</label>
                <input
                  type="text"
                  value={editFormData.goal}
                  onChange={(e) => setEditFormData({ ...editFormData, goal: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="예: 주차별 학습 목표 100% 달성"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">팀 설명</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="팀에 대한 간단한 설명"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as Team['status'] })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="active">활동 중</option>
                  <option value="inactive">비활성</option>
                  <option value="completed">완료</option>
                </select>
              </div>

              {/* Coach Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  담당 코치 <span className="text-red-500">*</span>
                </label>

                {/* Search and Filter */}
                <div className="mb-3 flex gap-2">
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="코치 검색 (이름, 이메일, 전문분야)..."
                      value={editCoachSearch}
                      onChange={(e) => setEditCoachSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                  </div>
                  <select
                    value={editCoachCountryFilter}
                    onChange={(e) => setEditCoachCountryFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    <option value="all">모든 국가</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Coach List */}
                <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
                  {filteredEditCoaches.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      검색 결과가 없습니다
                    </div>
                  ) : (
                    filteredEditCoaches.map((coach) => (
                      <label
                        key={coach.id}
                        className={`flex items-center justify-between p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                          editFormData.coach === coach.name ? 'bg-primary-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="edit-coach"
                            value={coach.name}
                            checked={editFormData.coach === coach.name}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, coach: e.target.value })
                            }
                            className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">{coach.name}</span>
                              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                {coach.country}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 mt-0.5">
                              {coach.specialty} • {coach.email}
                            </div>
                          </div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  총 {filteredEditCoaches.length}명의 코치
                  {editCoachSearch || editCoachCountryFilter !== 'all' ? ' (필터링됨)' : ''}
                </p>
              </div>

              {/* Team Info (Read-only) */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">프로그램:</span>
                    <span className="ml-2 text-gray-900 font-medium">{selectedTeam.program}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">생성일:</span>
                    <span className="ml-2 text-gray-900">{selectedTeam.createdDate}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">팀원 수:</span>
                    <span className="ml-2 text-gray-900">{selectedTeam.memberCount}명</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t">
              <button
                onClick={handleSaveEdit}
                className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                저장
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedTeam(null);
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">팀 생성</h3>
              <button
                onClick={handleCloseCreateModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Team Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  팀명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="예: Team Alpha"
                />
              </div>

              {/* Program Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  프로그램 <span className="text-red-500">*</span>
                </label>
                <select
                  value={createFormData.programId}
                  onChange={(e) => setCreateFormData({ ...createFormData, programId: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value={0}>프로그램을 선택하세요</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Coach Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  담당 코치 <span className="text-red-500">*</span>
                </label>

                {/* Search and Filter */}
                <div className="mb-3 flex gap-2">
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="코치 검색 (이름, 이메일, 전문분야)..."
                      value={coachSearch}
                      onChange={(e) => setCoachSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                  </div>
                  <select
                    value={coachCountryFilter}
                    onChange={(e) => setCoachCountryFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    <option value="all">모든 국가</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Coach List */}
                <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
                  {filteredCoaches.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      검색 결과가 없습니다
                    </div>
                  ) : (
                    filteredCoaches.map((coach) => (
                      <label
                        key={coach.id}
                        className={`flex items-center justify-between p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                          createFormData.coachId === coach.id ? 'bg-primary-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="coach"
                            value={coach.id}
                            checked={createFormData.coachId === coach.id}
                            onChange={(e) =>
                              setCreateFormData({ ...createFormData, coachId: Number(e.target.value) })
                            }
                            className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">{coach.name}</span>
                              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                {coach.country}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 mt-0.5">
                              {coach.specialty} • {coach.email}
                            </div>
                          </div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  총 {filteredCoaches.length}명의 코치
                  {coachSearch || coachCountryFilter !== 'all' ? ' (필터링됨)' : ''}
                </p>
              </div>

              {/* Team Members Selection */}
              {createFormData.programId !== 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    팀원 선택 <span className="text-red-500">*</span>
                  </label>

                  {/* Student Search */}
                  <div className="mb-3 relative">
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="교육생 검색 (이름, 이메일)..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                  </div>

                  {/* Selected Members */}
                  {createFormData.selectedMembers.length > 0 && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs font-medium text-gray-700 mb-2">
                        선택된 팀원 ({createFormData.selectedMembers.length}명)
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {createFormData.selectedMembers.map((studentId) => {
                          const student = mockStudents.find((s) => s.id === studentId);
                          const isLeader = createFormData.leaderId === studentId;
                          return (
                            <div
                              key={studentId}
                              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                                isLeader
                                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                                  : 'bg-blue-100 text-blue-800 border border-blue-300'
                              }`}
                            >
                              <span>{student?.name}</span>
                              {isLeader && <span className="font-semibold">★</span>}
                              <button
                                onClick={() => handleToggleStudent(studentId)}
                                className="hover:bg-black/10 rounded-full p-0.5"
                              >
                                <XMarkIcon className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Available Students List */}
                  <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
                    {availableStudents.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        {createFormData.programId === 0
                          ? '먼저 프로그램을 선택해주세요'
                          : '검색 결과가 없습니다'}
                      </div>
                    ) : (
                      availableStudents.map((student) => {
                        const isSelected = createFormData.selectedMembers.includes(student.id);
                        const isLeader = createFormData.leaderId === student.id;
                        return (
                          <div
                            key={student.id}
                            className={`flex items-center justify-between p-3 border-b last:border-b-0 ${
                              isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                            }`}
                          >
                            <label className="flex items-center gap-3 flex-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleStudent(student.id)}
                                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-900">{student.name}</span>
                                  {isLeader && (
                                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                      팀장
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-600">{student.email}</div>
                              </div>
                            </label>
                            {isSelected && !isLeader && (
                              <button
                                onClick={() =>
                                  setCreateFormData({ ...createFormData, leaderId: student.id })
                                }
                                className="px-3 py-1 text-xs text-yellow-700 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
                              >
                                팀장 지정
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    해당 프로그램의 교육생 {availableStudents.length}명
                    {studentSearch ? ' (검색됨)' : ''}
                  </p>
                </div>
              )}

              {/* Team Goal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">팀 목표</label>
                <input
                  type="text"
                  value={createFormData.goal}
                  onChange={(e) => setCreateFormData({ ...createFormData, goal: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="예: 주차별 학습 목표 100% 달성"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">팀 설명</label>
                <textarea
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="팀에 대한 간단한 설명"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t">
              <button
                onClick={handleCreateTeam}
                className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                생성
              </button>
              <button
                onClick={handleCloseCreateModal}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Create Modal */}
      {showBulkCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">팀 일괄 생성 (CSV)</h3>
              <button onClick={handleCloseBulkModal} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Step 1: Download Template & Upload */}
            <div className="space-y-6">
              {/* Template Download */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">1단계: CSV 템플릿 다운로드</h4>
                <p className="text-sm text-blue-800 mb-3">
                  템플릿을 다운로드하여 Excel이나 스프레드시트에서 팀 정보를 입력하세요.
                </p>
                <button
                  onClick={handleDownloadTemplate}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <DocumentArrowDownIcon className="w-5 h-5" />
                  CSV 템플릿 다운로드
                </button>
                <div className="mt-3 text-xs text-blue-700">
                  <p className="font-semibold mb-1">CSV 형식:</p>
                  <code className="bg-blue-100 px-2 py-1 rounded block">
                    팀명, 프로그램ID, 코치이메일, 팀목표, 팀설명, 팀원이메일(;구분), 팀장이메일
                  </code>
                </div>
              </div>

              {/* File Upload */}
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-2">2단계: 작성한 CSV 파일 업로드</h4>
                <div className="flex flex-col items-center justify-center">
                  <DocumentArrowUpIcon className="w-12 h-12 text-gray-400 mb-3" />
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <span className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors inline-block">
                      CSV 파일 선택
                    </span>
                  </label>
                  {csvFile && (
                    <p className="text-sm text-gray-600 mt-2">
                      선택된 파일: <span className="font-medium">{csvFile.name}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Preview Table */}
              {csvData.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">3단계: 데이터 확인 및 생성</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto max-h-96">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100 border-b sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">상태</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">팀명</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">프로그램ID</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">코치이메일</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">팀목표</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">오류</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {csvData.map((row, index) => (
                            <tr key={index} className={row.isValid ? 'bg-white' : 'bg-red-50'}>
                              <td className="px-4 py-3">
                                {row.isValid ? (
                                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                ) : (
                                  <ExclamationCircleIcon className="w-5 h-5 text-red-600" />
                                )}
                              </td>
                              <td className="px-4 py-3 font-medium">{row.teamName}</td>
                              <td className="px-4 py-3">{row.programId}</td>
                              <td className="px-4 py-3">{row.coachEmail}</td>
                              <td className="px-4 py-3 max-w-xs truncate">{row.goal}</td>
                              <td className="px-4 py-3">
                                {row.errors.length > 0 && (
                                  <div className="text-xs text-red-600">
                                    {row.errors.join(', ')}
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="mt-4 flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div className="flex gap-6 text-sm">
                      <div>
                        <span className="text-gray-600">전체:</span>
                        <span className="ml-2 font-semibold text-gray-900">{csvData.length}개</span>
                      </div>
                      <div>
                        <span className="text-gray-600">유효:</span>
                        <span className="ml-2 font-semibold text-green-600">
                          {csvData.filter((d) => d.isValid).length}개
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">오류:</span>
                        <span className="ml-2 font-semibold text-red-600">
                          {csvData.filter((d) => !d.isValid).length}개
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleBulkCreate}
                      disabled={csvData.filter((d) => d.isValid).length === 0}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {csvData.filter((d) => d.isValid).length}개 팀 생성
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6 pt-6 border-t">
              <button
                onClick={handleCloseBulkModal}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Guide */}
      <WorkflowGuide
        title="👥 팀 관리 워크플로우"
        description="팀 생성부터 성과 관리까지의 전체 과정을 안내합니다"
        steps={[
          {
            step: 1,
            title: '검색 및 필터링',
            description: '프로그램별, 상태별 필터와 검색 기능으로 원하는 팀을 찾습니다. 팀명, 프로그램, 담당 코치로 검색할 수 있습니다.',
          },
          {
            step: 2,
            title: '팀 생성',
            description: '"팀 생성" 버튼으로 개별 팀을 생성하거나, "일괄 생성" 버튼으로 CSV 파일을 업로드하여 여러 팀을 한번에 생성합니다.',
          },
          {
            step: 3,
            title: '팀원 배정 및 팀장 지정',
            description: '프로그램에 등록된 교육생 목록에서 팀원을 선택하고, 그 중 한 명을 팀장으로 지정합니다. 검색 기능으로 빠르게 찾을 수 있습니다.',
          },
          {
            step: 4,
            title: '코치 할당',
            description: '국가별, 전문분야별 필터를 사용하여 적합한 코치를 검색하고 팀에 배정합니다. 글로벌 코치 풀에서 선택 가능합니다.',
          },
          {
            step: 5,
            title: '팀 관리 및 KPI 설정',
            description: '팀 정보를 수정하고, 팀원을 추가/제거하며, "팀 KPI" 버튼으로 팀별 목표와 세부 KPI를 설정합니다.',
          },
        ]}
        keyFeatures={[
          '개별 팀 생성 (팀명, 목표, 팀원, 코치 선택)',
          'CSV 일괄 생성 (다중 팀 한번에 생성)',
          '팀원 관리 (추가/제거, 팀장 지정)',
          '코치 검색 및 배정 (국가/전문분야 필터)',
          '프로그램별/상태별 필터링',
          '팀 KPI 관리 (팀별 목표 설정)',
          '팀 정보 수정 (팀명, 목표, 설명, 상태)',
          '팀 성과 추적 및 통계 확인',
        ]}
        tips={[
          'CSV 일괄 생성을 사용하면 여러 팀을 빠르게 생성할 수 있습니다. 먼저 "CSV 템플릿 다운로드" 버튼으로 템플릿을 받으세요.',
          '코치 배정 시 국가 필터를 사용하면 시차를 고려한 배정이 가능합니다. 글로벌 코치 풀에서 선택할 수 있습니다.',
          '팀장은 반드시 팀원 목록에 포함된 사람만 지정할 수 있습니다. 먼저 팀원으로 추가한 후 팀장으로 지정하세요.',
          '"팀 KPI" 버튼을 클릭하면 팀별 세부 목표와 진행 상황을 관리할 수 있는 페이지로 이동합니다.',
          '팀 상태를 "비활성"으로 변경하면 숨김 처리되지만 데이터는 보존됩니다. 완전히 삭제하지 않고 보관할 수 있습니다.',
        ]}
      />
    </div>
  );
}
