import { Report, ReportEvaluation, UserProfile, ReportStatus, KadesDisposition, Dusun, InfrastructureType, UserRole, LetterRequest, LetterStatus, LetterType } from '@/types';
import { MOCK_USERS, INITIAL_LETTERS } from '@/data/mock-data';

const KEY_CURRENT_USER = 'sipdesa_smd_current_user_v3';

interface RawProfile {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  nik?: string;
  dusun: Dusun;
  role: UserRole;
}

interface RawReport {
  id: string;
  ticket_number: string;
  reporter_id?: string;
  reporter_name: string;
  reporter_phone: string;
  reporter_nik?: string;
  infrastructure_type: InfrastructureType;
  title: string;
  description: string;
  dusun: Dusun;
  latitude: number | string;
  longitude: number | string;
  address_detail?: string;
  photo_url?: string;
  status: ReportStatus;
  hide_reporter_identity?: boolean;
  duplicate_of_ticket?: string;
  kades_decision?: KadesDisposition['decision'];
  budget_source?: string;
  approved_budget?: number | string;
  disposition_notes?: string;
  disposition_at?: string;
  kades_notes?: string;
  kades_decided_at?: string;
  assigned_officer?: string;
  assigned_department?: string;
  completion_photo_url?: string;
  completion_notes?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

interface RawSupporter {
  report_id: string;
  user_id: string;
}

interface RawLetter {
  id: string;
  ticket_number: string;
  applicant_id?: string;
  applicant_name: string;
  applicant_phone: string;
  applicant_nik?: string;
  dusun: Dusun;
  letter_type: LetterType;
  purpose: string;
  business_name?: string;
  business_type?: string;
  status: LetterStatus;
  rejection_reason?: string;
  officer_notes?: string;
  processed_by?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

interface RawEvaluation {
  id: string;
  report_id: string;
  evaluator_id?: string;
  c1_damage_level: number;
  c2_access_urgency: number;
  c3_hazard_risk: number;
  c4_beneficiaries: number;
  c5_estimated_cost: number;
  verified_cost_rupiah?: number | string;
  verification_notes?: string;
  verified_at: string;
}

// -------------------------------------------------------------
// SINKRONISASI SESI PENGGUNA (DEFAULT: GUEST / TIDAK LOGIN)
// -------------------------------------------------------------
export function getSavedSessionUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(KEY_CURRENT_USER);
    if (!saved) return null;
    return JSON.parse(saved) as UserProfile;
  } catch (err) {
    console.error('Gagal membaca sesi login:', err);
    return null;
  }
}

export function saveSessionUser(user: UserProfile | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(KEY_CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEY_CURRENT_USER);
    }
  } catch (err) {
    console.error('Gagal menyimpan sesi login:', err);
  }
}

// -------------------------------------------------------------
// 1. DATA PENGGUNA (PROFILES)
// -------------------------------------------------------------
export async function fetchUsersFromDb(): Promise<{ users: UserProfile[]; error: string | null }> {
  try {
    const res = await fetch('/api/db', { cache: 'no-store' });
    if (!res.ok) {
      return { users: MOCK_USERS, error: null };
    }
    const data = await res.json();
    if (data.profiles && data.profiles.length > 0) {
      const mapped: UserProfile[] = (data.profiles as RawProfile[]).map((p) => ({
        id: p.id,
        name: p.full_name,
        email: p.email || `${p.full_name.toLowerCase().replace(/[^a-z0-9]/g, '')}@simandulang.desa.id`,
        phone: p.phone || '',
        nik: p.nik || '',
        dusun: p.dusun,
        role: p.role,
      }));
      return { users: mapped, error: null };
    }
    return { users: MOCK_USERS, error: null };
  } catch {
    return { users: MOCK_USERS, error: null };
  }
}

export async function insertUserToDb(_newUser?: UserProfile): Promise<{ success: boolean; error: string | null }> {
  void _newUser;
  return { success: true, error: null };
}

// -------------------------------------------------------------
// 2. DATA LAPORAN (MURNI DARI SUPABASE MELALUI API SERVER)
// -------------------------------------------------------------
export async function fetchReportsFromDb(): Promise<{
  reports: Report[];
  evaluations: ReportEvaluation[];
  letters: LetterRequest[];
  error: string | null;
}> {
  try {
    const res = await fetch('/api/db', { cache: 'no-store' });
    const json = await res.json();

    if (!res.ok || json.error) {
      return { reports: [], evaluations: [], letters: INITIAL_LETTERS, error: json.error || 'Gagal memuat data dari database.' };
    }

    const dbReports = (json.reports || []) as RawReport[];
    const dbSupporters = (json.supporters || []) as RawSupporter[];
    const dbEvals = (json.evaluations || []) as RawEvaluation[];

    const mappedReports: Report[] = dbReports.map((r) => {
      const reportSupporters = dbSupporters
        .filter((s) => s.report_id === r.id)
        .map((s) => s.user_id);

      const rawNotes = r.disposition_notes || r.kades_notes || '';
      let budgetSource = r.budget_source || '';
      let cleanNotes = rawNotes;

      if (!budgetSource && rawNotes.startsWith('[Sumber: ')) {
        const closeIdx = rawNotes.indexOf(']');
        if (closeIdx > 9) {
          budgetSource = rawNotes.substring(9, closeIdx).trim();
          cleanNotes = rawNotes.substring(closeIdx + 1).trim();
        }
      }

      const disposition: KadesDisposition | null = r.kades_decision
        ? {
            decision: r.kades_decision,
            budgetSource: budgetSource || 'Dana Desa (APBDes Bidang Pembangunan)',
            approvedBudget: Number(r.approved_budget) || 0,
            notes: cleanNotes || 'Telah disetujui sesuai hasil musyawarah dan rekomendasi SAW.',
            decidedAt: r.disposition_at || r.kades_decided_at || r.updated_at,
          }
        : null;

      let matchedReporterId = r.reporter_id || '';
      if (!matchedReporterId) {
        const foundUser = MOCK_USERS.find(
          (u) =>
            (r.reporter_phone && u.phone === r.reporter_phone) ||
            (r.reporter_nik && u.nik === r.reporter_nik) ||
            (r.reporter_name && u.name.toLowerCase() === r.reporter_name.toLowerCase())
        );
        if (foundUser) {
          matchedReporterId = foundUser.id;
        }
      }

      return {
        id: r.id,
        ticketNumber: r.ticket_number,
        reporterId: matchedReporterId,
        reporterName: r.reporter_name,
        reporterPhone: r.reporter_phone,
        reporterNik: r.reporter_nik,
        infrastructureType: r.infrastructure_type,
        title: r.title,
        description: r.description,
        dusun: r.dusun,
        latitude: Number(r.latitude),
        longitude: Number(r.longitude),
        addressDetail: r.address_detail,
        photoUrl: r.photo_url,
        status: r.status,
        hideReporterIdentity: Boolean(r.hide_reporter_identity),
        supportedUserIds: reportSupporters,
        upvotes: reportSupporters.length,
        duplicateOfTicket: r.duplicate_of_ticket,
        disposition,
        assignedOfficer: r.assigned_officer,
        assignedDepartment: r.assigned_department,
        completionPhotoUrl: r.completion_photo_url,
        completionNotes: r.completion_notes,
        completedAt: r.completed_at,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };
    });

    const mappedEvals: ReportEvaluation[] = dbEvals.map((e) => ({
      id: e.id,
      reportId: e.report_id,
      evaluatorId: e.evaluator_id,
      c1DamageLevel: e.c1_damage_level,
      c2AccessUrgency: e.c2_access_urgency,
      c3HazardRisk: e.c3_hazard_risk,
      c4Beneficiaries: e.c4_beneficiaries,
      c5EstimatedCost: e.c5_estimated_cost,
      verifiedCostRupiah: Number(e.verified_cost_rupiah) || 0,
      verificationNotes: e.verification_notes || '',
      verifiedAt: e.verified_at,
    }));

    const dbLetters = (json.letters || []) as RawLetter[];
    const mappedLetters: LetterRequest[] = dbLetters.length > 0
      ? dbLetters.map((l) => ({
          id: l.id,
          ticketNumber: l.ticket_number,
          applicantId: l.applicant_id || 'guest',
          applicantName: l.applicant_name,
          applicantPhone: l.applicant_phone,
          applicantNik: l.applicant_nik || '',
          dusun: l.dusun,
          letterType: l.letter_type,
          purpose: l.purpose,
          businessName: l.business_name,
          businessType: l.business_type,
          status: l.status,
          rejectionReason: l.rejection_reason,
          officerNotes: l.officer_notes,
          processedBy: l.processed_by,
          completedAt: l.completed_at,
          createdAt: l.created_at,
          updatedAt: l.updated_at,
        }))
      : INITIAL_LETTERS;

    return { reports: mappedReports, evaluations: mappedEvals, letters: mappedLetters, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Koneksi ke backend database gagal.';
    return { reports: [], evaluations: [], letters: INITIAL_LETTERS, error: msg };
  }
}

export async function insertLetterToDb(
  newLetter: Omit<LetterRequest, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'status'>
): Promise<{ letter: LetterRequest | null; ticketNumber: string; error: string | null }> {
  try {
    const res = await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'insert_letter', payload: newLetter }),
    });

    const json = await res.json();
    if (!res.ok || json.error) {
      // Fallback ticket jika Supabase belum dipasangi tabel
      const fallbackTicket = `SRT-2026-${Math.floor(100 + Math.random() * 900)}`;
      return { letter: null, ticketNumber: fallbackTicket, error: json.error || null };
    }

    const data = json.data as RawLetter;
    const created: LetterRequest = {
      id: data.id,
      ticketNumber: data.ticket_number || json.ticketNumber,
      applicantId: data.applicant_id || newLetter.applicantId,
      applicantName: data.applicant_name,
      applicantPhone: data.applicant_phone,
      applicantNik: data.applicant_nik || newLetter.applicantNik,
      dusun: data.dusun,
      letterType: data.letter_type,
      purpose: data.purpose,
      businessName: data.business_name,
      businessType: data.business_type,
      status: data.status || 'menunggu_verifikasi',
      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: data.updated_at || new Date().toISOString(),
    };

    return { letter: created, ticketNumber: created.ticketNumber, error: null };
  } catch (err: unknown) {
    const fallbackTicket = `SRT-2026-${Math.floor(100 + Math.random() * 900)}`;
    const msg = err instanceof Error ? err.message : 'Gagal menyimpan permohonan surat.';
    return { letter: null, ticketNumber: fallbackTicket, error: msg };
  }
}

export async function updateLetterInDb(
  letterId: string,
  updates: Partial<LetterRequest>
): Promise<{ success: boolean; error: string | null }> {
  try {
    const res = await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_letter', payload: { letterId, updates } }),
    });

    const json = await res.json();
    if (!res.ok || json.error) {
      return { success: false, error: json.error || 'Gagal memperbarui status surat.' };
    }
    return { success: true, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal memperbarui status surat.';
    return { success: false, error: msg };
  }
}

export async function insertReportToDb(
  newReport: Omit<Report, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'status'>
): Promise<{ report: Report | null; error: string | null }> {
  try {
    const res = await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'insert_report', payload: newReport }),
    });

    const json = await res.json();
    if (!res.ok || json.error) {
      return { report: null, error: json.error || 'Gagal menyimpan laporan.' };
    }

    const data = json.data as RawReport;
    const created: Report = {
      id: data.id,
      ticketNumber: data.ticket_number,
      reporterId: data.reporter_id || newReport.reporterId || '',
      reporterName: data.reporter_name,
      reporterPhone: data.reporter_phone,
      reporterNik: data.reporter_nik,
      infrastructureType: data.infrastructure_type,
      title: data.title,
      description: data.description,
      dusun: data.dusun,
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      addressDetail: data.address_detail,
      photoUrl: data.photo_url,
      status: data.status,
      hideReporterIdentity: Boolean(data.hide_reporter_identity),
      supportedUserIds: [],
      upvotes: 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return { report: created, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal mengirim laporan ke database.';
    return { report: null, error: msg };
  }
}

export async function updateReportInDb(
  reportId: string,
  updates: Partial<Report>
): Promise<{ success: boolean; error: string | null }> {
  try {
    const res = await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_report', payload: { reportId, updates } }),
    });

    const json = await res.json();
    if (!res.ok || json.error) {
      return { success: false, error: json.error || 'Gagal memperbarui data.' };
    }
    return { success: true, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal memperbarui data laporan di sistem desa.';
    return { success: false, error: msg };
  }
}

export async function toggleSupportInDb(
  reportId: string,
  userId: string,
  alreadySupported: boolean
): Promise<{ success: boolean; error: string | null }> {
  try {
    const res = await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'toggle_support',
        payload: { reportId, userId, alreadySupported },
      }),
    });

    const json = await res.json();
    if (!res.ok || json.error) {
      return { success: false, error: json.error || 'Gagal mengubah dukungan.' };
    }
    return { success: true, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal memproses dukungan.';
    return { success: false, error: msg };
  }
}

export async function insertEvaluationToDb(
  evalData: Omit<ReportEvaluation, 'id' | 'verifiedAt'>
): Promise<{ success: boolean; error: string | null }> {
  try {
    const res = await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'insert_evaluation', payload: { evaluationData: evalData } }),
    });

    const json = await res.json();
    if (!res.ok || json.error) {
      return { success: false, error: json.error || 'Gagal menyimpan evaluasi.' };
    }
    return { success: true, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal menyimpan evaluasi.';
    return { success: false, error: msg };
  }
}

export async function seedInitialDataToSupabase(): Promise<{ success: boolean; count: number; error: string | null }> {
  try {
    const res = await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seed_data' }),
    });

    const json = await res.json();
    if (!res.ok || json.error) {
      return { success: false, count: 0, error: json.error || 'Gagal seed data.' };
    }
    return { success: true, count: json.count || 0, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal memuat data awal ke sistem desa.';
    return { success: false, count: 0, error: msg };
  }
}
