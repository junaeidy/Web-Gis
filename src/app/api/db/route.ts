import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { INITIAL_REPORTS, INITIAL_EVALUATIONS, INITIAL_LETTERS } from '@/data/mock-data';

export async function GET() {
  if (!supabaseServer) {
    return NextResponse.json(
      { error: 'Kredensial Supabase belum terpasang di environment server.' },
      { status: 500 }
    );
  }

  try {
    const [repRes, evalRes, supRes, profRes, ltrRes] = await Promise.all([
      supabaseServer.from('reports').select('*').order('created_at', { ascending: false }),
      supabaseServer.from('report_evaluations').select('*'),
      supabaseServer.from('report_supporters').select('*'),
      supabaseServer.from('profiles').select('*'),
      supabaseServer.from('letter_requests').select('*').order('created_at', { ascending: false }),
    ]);

    if (repRes.error) {
      return NextResponse.json({ error: repRes.error.message }, { status: 400 });
    }

    return NextResponse.json({
      reports: repRes.data || [],
      evaluations: evalRes.data || [],
      supporters: supRes.data || [],
      profiles: profRes.data || [],
      letters: ltrRes.data || [],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error saat query Supabase.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!supabaseServer) {
    return NextResponse.json(
      { error: 'Kredensial Supabase belum terpasang di server.' },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { action, payload } = body;

    if (action === 'insert_report') {
      const { count } = await supabaseServer.from('reports').select('*', { count: 'exact', head: true });
      const nextNum = ((count || 0) + 1).toString().padStart(3, '0');
      const ticketNumber = `SMD-2026-${nextNum}`;

      const insertData = {
        ticket_number: ticketNumber,
        reporter_name: payload.reporterName,
        reporter_phone: payload.reporterPhone,
        reporter_nik: payload.reporterNik,
        hide_reporter_identity: payload.hideReporterIdentity,
        infrastructure_type: payload.infrastructureType,
        title: payload.title,
        description: payload.description,
        dusun: payload.dusun,
        latitude: payload.latitude,
        longitude: payload.longitude,
        address_detail: payload.addressDetail,
        photo_url: payload.photoUrl,
        status: 'menunggu_verifikasi',
      };

      const { data, error } = await supabaseServer.from('reports').insert(insertData).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ data });
    }

    if (action === 'update_report') {
      const { reportId, updates } = payload;
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.status) updateData.status = updates.status;
      if (updates.duplicateOfTicket) updateData.duplicate_of_ticket = updates.duplicateOfTicket;
      if (updates.assignedOfficer !== undefined) updateData.assigned_officer = updates.assignedOfficer;
      if (updates.assignedDepartment !== undefined) updateData.assigned_department = updates.assignedDepartment;
      if (updates.completionPhotoUrl !== undefined) updateData.completion_photo_url = updates.completionPhotoUrl;
      if (updates.completionNotes !== undefined) updateData.completion_notes = updates.completionNotes;
      if (updates.completedAt !== undefined) updateData.completed_at = updates.completedAt;

      if (updates.disposition) {
        updateData.kades_decision = updates.disposition.decision;
        updateData.budget_source = updates.disposition.budgetSource;
        updateData.approved_budget = updates.disposition.approvedBudget;
        updateData.disposition_notes = updates.disposition.notes || '';
        updateData.disposition_at = updates.disposition.decidedAt || new Date().toISOString();
      }

      let { error } = await supabaseServer.from('reports').update(updateData).eq('id', reportId);

      // Jika kolom budget_source belum ditambahkan di Supabase, fallback otomatis tanpa error
      if (error && error.message.includes('budget_source')) {
        delete updateData.budget_source;
        if (updates.disposition) {
          updateData.disposition_notes = updates.disposition.budgetSource
            ? `[Sumber: ${updates.disposition.budgetSource}] ${updates.disposition.notes || ''}`
            : (updates.disposition.notes || '');
        }
        const retry = await supabaseServer.from('reports').update(updateData).eq('id', reportId);
        error = retry.error;
      }

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true });
    }

    if (action === 'insert_evaluation') {
      const { evaluationData } = payload;
      const evalPayload = {
        report_id: evaluationData.reportId,
        c1_damage_level: evaluationData.c1DamageLevel,
        c2_access_urgency: evaluationData.c2AccessUrgency,
        c3_hazard_risk: evaluationData.c3HazardRisk,
        c4_beneficiaries: evaluationData.c4Beneficiaries,
        c5_estimated_cost: evaluationData.c5EstimatedCost,
        verified_cost_rupiah: evaluationData.verifiedCostRupiah,
        verification_notes: evaluationData.verificationNotes,
        verified_at: new Date().toISOString(),
      };

      const { error: evalErr } = await supabaseServer.from('report_evaluations').upsert(evalPayload, {
        onConflict: 'report_id',
      });
      if (evalErr) return NextResponse.json({ error: evalErr.message }, { status: 400 });

      // Update status laporan menjadi terverifikasi
      await supabaseServer
        .from('reports')
        .update({ status: 'terverifikasi', updated_at: new Date().toISOString() })
        .eq('id', evaluationData.reportId);

      return NextResponse.json({ success: true });
    }

    if (action === 'toggle_support') {
      const { reportId, userId, alreadySupported } = payload;
      if (alreadySupported) {
        const { error } = await supabaseServer
          .from('report_supporters')
          .delete()
          .eq('report_id', reportId)
          .eq('user_id', userId);
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      } else {
        const { error } = await supabaseServer
          .from('report_supporters')
          .insert({ report_id: reportId, user_id: userId });
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'seed_data') {
      let count = 0;
      for (const r of INITIAL_REPORTS) {
        const rPayload: Record<string, unknown> = {
          ticket_number: r.ticketNumber,
          reporter_name: r.reporterName,
          reporter_phone: r.reporterPhone,
          reporter_nik: r.reporterNik,
          hide_reporter_identity: r.hideReporterIdentity,
          infrastructure_type: r.infrastructureType,
          title: r.title,
          description: r.description,
          dusun: r.dusun,
          latitude: r.latitude,
          longitude: r.longitude,
          address_detail: r.addressDetail,
          photo_url: r.photoUrl,
          status: r.status,
          assigned_officer: r.assignedOfficer,
          assigned_department: r.assignedDepartment,
          completion_photo_url: r.completionPhotoUrl,
          completion_notes: r.completionNotes,
          completed_at: r.completedAt,
          created_at: r.createdAt,
          updated_at: r.updatedAt,
        };

        if (r.disposition) {
          rPayload.kades_decision = r.disposition.decision;
          rPayload.approved_budget = r.disposition.approvedBudget;
          rPayload.disposition_notes = r.disposition.budgetSource
            ? `[Sumber: ${r.disposition.budgetSource}] ${r.disposition.notes || ''}`
            : (r.disposition.notes || '');
          rPayload.disposition_at = r.disposition.decidedAt || new Date().toISOString();
        }

        const { data: created, error } = await supabaseServer
          .from('reports')
          .upsert(rPayload, { onConflict: 'ticket_number' })
          .select()
          .single();

        if (!error && created) {
          count++;
          const ev = INITIAL_EVALUATIONS.find((e) => e.reportId === r.id);
          if (ev) {
            await supabaseServer.from('report_evaluations').upsert(
              {
                report_id: created.id,
                c1_damage_level: ev.c1DamageLevel,
                c2_access_urgency: ev.c2AccessUrgency,
                c3_hazard_risk: ev.c3HazardRisk,
                c4_beneficiaries: ev.c4Beneficiaries,
                c5_estimated_cost: ev.c5EstimatedCost,
                verified_cost_rupiah: ev.verifiedCostRupiah,
                verification_notes: ev.verificationNotes,
                verified_at: ev.verifiedAt,
              },
              { onConflict: 'report_id' }
            );
          }
        }
      }

      return NextResponse.json({ success: true, count });
    }

    if (action === 'insert_letter') {
      const { count } = await supabaseServer.from('letter_requests').select('*', { count: 'exact', head: true });
      const nextNum = ((count || 0) + 1).toString().padStart(3, '0');
      const ticketNumber = `SRT-2026-${nextNum}`;

      const insertData = {
        ticket_number: ticketNumber,
        applicant_name: payload.applicantName,
        applicant_phone: payload.applicantPhone,
        applicant_nik: payload.applicantNik,
        dusun: payload.dusun,
        letter_type: payload.letterType,
        purpose: payload.purpose,
        business_name: payload.businessName || null,
        business_type: payload.businessType || null,
        status: 'menunggu_verifikasi',
      };

      const { data, error } = await supabaseServer.from('letter_requests').insert(insertData).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ data, ticketNumber });
    }

    if (action === 'update_letter') {
      const { letterId, updates } = payload;
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.officerNotes !== undefined) updateData.officer_notes = updates.officerNotes;
      if (updates.rejectionReason !== undefined) updateData.rejection_reason = updates.rejectionReason;
      if (updates.processedBy !== undefined) updateData.processed_by = updates.processedBy;
      if (updates.status === 'selesai') updateData.completed_at = new Date().toISOString();

      const { error } = await supabaseServer.from('letter_requests').update(updateData).eq('id', letterId);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Aksi tidak dikenal.' }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error saat memproses request.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
