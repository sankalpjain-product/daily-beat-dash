// Beat Planning Types

export type PlanStatus = 
  | 'draft' 
  | 'pending_approval' 
  | 'approved' 
  | 'sent_back' 
  | 're_approval_required';

export type VisitPurpose = 
  | 'sales_support'
  | 'collection_followup'
  | 'stock_check'
  | 'recruitment'
  | 'table_meeting'
  | 'issue_resolution'
  | 'other';

export const VISIT_PURPOSE_LABELS: Record<VisitPurpose, string> = {
  sales_support: 'Sales Support',
  collection_followup: 'Collection Follow-up',
  stock_check: 'Stock Check',
  recruitment: 'Recruitment',
  table_meeting: 'Table Meeting',
  issue_resolution: 'Issue Resolution',
  other: 'Other',
};

export const STATUS_LABELS: Record<PlanStatus, string> = {
  draft: 'Draft',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  sent_back: 'Sent Back',
  re_approval_required: 'Re-approval Required',
};

export interface TimeSlot {
  start: string; // e.g., "10:00"
  end: string;   // e.g., "13:00"
}

export interface Agent {
  id: string;
  name: string;
  location: string;
}

export interface Cluster {
  id: string;
  name: string;
}

export interface GPSCoordinates {
  latitude: number;
  longitude: number;
}

export interface CheckIn {
  timestamp: string;
  photoUrl: string;
  location?: GPSCoordinates;
  notes?: string;
  metAgentIds?: string[]; // retailers actually met (attendance)
  locationTrust?: 'verified' | 'suspected_spoof' | 'unavailable';
  spoofReason?: string;
}

// A single visit within a day - can have multiple visits per day
export interface Visit {
  id: string;
  cluster?: Cluster;
  agents: Agent[];
  purposes: VisitPurpose[];
  otherPurposeText?: string;
  timeSlot?: TimeSlot;
  checkIn?: CheckIn;
}

export interface DayPlan {
  id: string;
  dayOfWeek: number; // 0 = Monday, 5 = Saturday
  date: string;
  visits: Visit[];
  // Legacy support - still keeping top-level fields for backward compatibility
  clusters: Cluster[];
  agents: Agent[];
  purposes: VisitPurpose[];
  timeSlots: TimeSlot[];
  checkIn?: CheckIn;
}

export interface Comment {
  id: string;
  author: string;
  authorRole: 'atd' | 'rbm';
  content: string;
  timestamp: string;
  dayId?: string; // If comment is for a specific day
}

export interface WeeklyPlan {
  id: string;
  weekStartDate: string;
  atdId: string;
  atdName: string;
  hq: string;
  status: PlanStatus;
  days: DayPlan[];
  comments: Comment[];
  submittedAt?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'atd' | 'rbm';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  hq: string;
}

// Mock data
export const MOCK_CLUSTERS: Cluster[] = [
  { id: 'c1', name: 'North Zone - Sector 1' },
  { id: 'c2', name: 'North Zone - Sector 2' },
  { id: 'c3', name: 'South Zone - Market A' },
  { id: 'c4', name: 'South Zone - Market B' },
  { id: 'c5', name: 'East Zone - Highway' },
  { id: 'c6', name: 'West Zone - Mall Area' },
];

export const MOCK_AGENTS: Agent[] = [
  { id: 'a1', name: 'Raj Electronics', location: 'Sector 1' },
  { id: 'a2', name: 'Mobile World', location: 'Sector 1' },
  { id: 'a3', name: 'Tech Hub', location: 'Sector 2' },
  { id: 'a4', name: 'Phone Palace', location: 'Market A' },
  { id: 'a5', name: 'Digital Store', location: 'Market B' },
  { id: 'a6', name: 'Smart Mobiles', location: 'Highway' },
  { id: 'a7', name: 'City Phones', location: 'Mall Area' },
  { id: 'a8', name: 'Quick Connect', location: 'Sector 2' },
];

export const TIME_SLOTS = [
  { label: '10:00 AM - 1:00 PM', start: '10:00', end: '13:00' },
  { label: '2:00 PM - 5:00 PM', start: '14:00', end: '17:00' },
  { label: '5:00 PM - 7:00 PM', start: '17:00', end: '19:00' },
];

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
