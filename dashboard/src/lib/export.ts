/**
 * Service d'export des donnees
 * Supporte : CSV, Excel (.xlsx), JSON
 */
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export function exportCSV(data: Record<string, unknown>[], nom: string): void {
  const csv = Papa.unparse(data, { header: true });
  telecharger(csv, `${nom}.csv`, 'text/csv;charset=utf-8;');
}

export function exportExcel(data: Record<string, unknown>[], nom: string): void {
  const ws   = XLSX.utils.json_to_sheet(data);
  const wb   = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Donnees');
  const buf  = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  telechargerBlob(blob, `${nom}.xlsx`);
}

export function exportJSON(data: unknown, nom: string): void {
  const json = JSON.stringify(data, null, 2);
  telecharger(json, `${nom}.json`, 'application/json');
}

function telecharger(contenu: string, nom: string, type: string): void {
  const blob = new Blob([contenu], { type });
  telechargerBlob(blob, nom);
}

function telechargerBlob(blob: Blob, nom: string): void {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href    = url;
  a.download = nom;
  a.click();
  URL.revokeObjectURL(url);
}

// Formate les donnees brutes Supabase pour l'export
export function formaterPourExport(
  questionnaires: any[],
  reponses: any[]
): Record<string, unknown>[] {
  return questionnaires.map(q => {
    const reps = reponses
      .filter(r => r.questionnaire_id === q.id)
      .reduce((acc: any, r: any) => {
        acc[r.code_variable] = r.valeur_texte ?? r.valeur_nombre;
        return acc;
      }, {});

    return {
      id:             q.id,
      n_quest:        q.n_quest,
      agent:          q.agents?.identifiant ?? '',
      nom_agent:      q.agents ? `${q.agents.prenom} ${q.agents.nom}` : '',
      statut:         q.statut,
      date_interview: q.date_interview,
      code_commune:   q.code_commune,
      nom_commune:    q.nom_commune,
      nom_region:     q.nom_region,
      latitude:       q.latitude,
      longitude:      q.longitude,
      milieu:         q.milieu === 1 ? 'Urbain' : q.milieu === 2 ? 'Rural' : '',
      n_menage:       q.n_menage,
      nom_chef:       q.nom_chef,
      tel_chef:       q.tel_chef,
      nom_enq:        q.nom_enq,
      submitted_at:   q.submitted_at,
      created_at:     q.created_at,
      ...reps,
    };
  });
}
