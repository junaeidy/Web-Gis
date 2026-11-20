export type InfrastructureType =
  | 'jalan_poros'
  | 'jalan_lingkungan'
  | 'jembatan'
  | 'drainase_tanggul_rob'
  | 'dermaga_tangkahan'
  | 'fasilitas_umum';

export type ReportStatus =
  | 'menunggu_verifikasi'
  | 'terverifikasi'
  | 'disetujui_kades'
  | 'dalam_pengerjaan'
  | 'selesai'
  | 'ditolak'
  | 'duplikat';

export type Dusun =
  | 'Dusun I'
  | 'Dusun II'
  | 'Dusun III'
  | 'Dusun IV'
  | 'Dusun V';

export type UserRole = 'warga' | 'perangkat_desa' | 'kepala_desa';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  nik?: string;
  dusun: Dusun;
  role: UserRole;
  createdAt?: string;
}

export type KadesDecision =
  | 'disetujui_apbdes'
  | 'tanggap_darurat'
  | 'diteruskan_kabupaten'
  | 'ditunda';

export interface KadesDisposition {
  decision: KadesDecision;
  budgetSource: string;
  approvedBudget: number;
  notes: string;
  decidedAt: string;
}

export interface Report {
  id: string;
  ticketNumber: string;
  reporterId: string;
  reporterName: string;
  reporterPhone: string;
  reporterNik?: string;
  infrastructureType: InfrastructureType;
  title: string;
  description: string;
  dusun: Dusun;
  latitude: number;
  longitude: number;
  addressDetail?: string;
  photoUrl?: string;
  status: ReportStatus;
  
  // Fitur Privasi & Partisipasi Publik
  hideReporterIdentity: boolean;
  
  // Dukungan Warga (1 Orang 1 Suara + Bisa Undo)
  supportedUserIds: string[];
  upvotes: number;
  
  // Laporan Ganda
  duplicateOfTicket?: string;

  // Disposisi Kepala Desa
  disposition?: KadesDisposition | null;

  // Penugasan & Penyelesaian Lapangan
  assignedOfficer?: string | null;
  assignedDepartment?: string | null;
  completionPhotoUrl?: string | null;
  completionNotes?: string | null;
  completedAt?: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface Criteria {
  code: 'C1' | 'C2' | 'C3' | 'C4' | 'C5';
  name: string;
  attribute: 'benefit' | 'cost';
  weight: number;
  scaleDescription: string;
}

export interface ReportEvaluation {
  id: string;
  reportId: string;
  evaluatorId?: string;
  c1DamageLevel: number; // 1-4 (Benefit)
  c2AccessUrgency: number; // 1-3 (Benefit)
  c3HazardRisk: number; // 1-3 (Benefit)
  c4Beneficiaries: number; // 1-3 (Benefit)
  c5EstimatedCost: number; // 1-3 (Cost)
  verifiedCostRupiah: number;
  verificationNotes: string;
  verifiedAt: string;
}

export interface SAWResult {
  reportId: string;
  report: Report;
  evaluation: ReportEvaluation;
  normalized: {
    c1: number;
    c2: number;
    c3: number;
    c4: number;
    c5: number;
  };
  score: number;
  rank: number;
}
