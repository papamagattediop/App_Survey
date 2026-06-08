export interface Agent {
  id:          string;
  identifiant: string;
  nom:         string;
  prenom:      string;
  role:        'agent' | 'superviseur' | 'admin';
  actif:       boolean;
  created_at:  string;
}

export interface Questionnaire {
  id:             string;
  agent_id:       string;
  statut:         'brouillon' | 'complet' | 'soumis' | 'valide';
  statut_sync:    'local' | 'en_cours' | 'synchronise' | 'erreur';
  n_quest:        string | null;
  code_commune:   string | null;
  nom_commune:    string | null;
  nom_region:     string | null;
  latitude:       number | null;
  longitude:      number | null;
  milieu:         1 | 2 | null;
  n_menage:       string | null;
  nom_chef:       string | null;
  tel_chef:       string | null;
  date_interview: string | null;
  nom_enq:        string | null;
  created_at:     string;
  updated_at:     string;
  submitted_at:   string | null;
  agents?:        Pick<Agent, 'identifiant' | 'nom' | 'prenom'>;
}

export interface Reponse {
  id:               string;
  questionnaire_id: string;
  section:          'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  code_variable:    string;
  valeur_texte:     string | null;
  valeur_nombre:    number | null;
  created_at:       string;
}

export interface PositionAgent {
  id:        string;
  agent_id:  string;
  latitude:  number;
  longitude: number;
  precision: number | null;
  timestamp: string;
  agents?:   Pick<Agent, 'identifiant' | 'nom' | 'prenom'>;
}

export interface StatAgent extends Agent {
  total:       number;
  soumis:      number;
  en_cours:    number;
  aujourd_hui: number;
  derniere_pos: { latitude: number; longitude: number; timestamp: string } | null;
}

export interface CollecteParJour {
  date:  string;
  total: number;
}

export interface StatsGlobales {
  total:       number;
  aujourd_hui: number;
  en_cours:    number;
  soumis:      number;
}

export interface FiltresQuestionnaire {
  recherche:  string;
  statut:     string;
  agent_id:   string;
  date_debut: string;
  date_fin:   string;
}
