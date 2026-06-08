-- ═══════════════════════════════════════════════════════════════
--  SCHEMA INITIAL - ANSD Enquete Electrification Rurale
--  Migration 001 - Tables, Contraintes, Index, RLS
-- ═══════════════════════════════════════════════════════════════

-- Extensions necessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";  -- Pour les geometries GPS

-- ── TABLE : agents ───────────────────────────────────────────
CREATE TABLE agents (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  identifiant    TEXT NOT NULL UNIQUE,    -- ex: AGT-001
  nom            TEXT NOT NULL,
  prenom         TEXT NOT NULL,
  role           TEXT NOT NULL DEFAULT 'agent'
                   CHECK (role IN ('agent', 'superviseur', 'admin')),
  zone_assignee  TEXT,
  actif          BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── TABLE : questionnaires ───────────────────────────────────
CREATE TABLE questionnaires (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id        UUID NOT NULL REFERENCES agents(id) ON DELETE RESTRICT,
  statut          TEXT NOT NULL DEFAULT 'brouillon'
                    CHECK (statut IN ('brouillon','complet','soumis','valide')),
  statut_sync     TEXT NOT NULL DEFAULT 'local'
                    CHECK (statut_sync IN ('local','en_cours','synchronise','erreur')),
  -- Section A
  n_quest         TEXT,
  code_region     TEXT,
  code_dep        TEXT,
  code_arr        TEXT,
  code_cr         TEXT,
  code_village    TEXT,
  latitude        DOUBLE PRECISION CHECK (latitude  BETWEEN -90  AND 90),
  longitude       DOUBLE PRECISION CHECK (longitude BETWEEN -180 AND 180),
  milieu          SMALLINT CHECK (milieu IN (1, 2)),
  n_menage        TEXT,
  nom_chef        TEXT,
  tel_chef        TEXT,
  date_interview  DATE,
  nom_enq         TEXT,
  -- Metadonnees
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at    TIMESTAMPTZ
);

-- ── TABLE : reponses (sections B a F) ───────────────────────
CREATE TABLE reponses (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  questionnaire_id  UUID NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
  section           CHAR(1) NOT NULL CHECK (section IN ('A','B','C','D','E','F')),
  code_variable     TEXT NOT NULL,
  valeur_texte      TEXT,
  valeur_nombre     NUMERIC,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (questionnaire_id, code_variable)
);

-- ── TABLE : positions_agents ─────────────────────────────────
CREATE TABLE positions_agents (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id    UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  latitude    DOUBLE PRECISION NOT NULL CHECK (latitude  BETWEEN -90  AND 90),
  longitude   DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  precision   REAL,
  timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour les requetes frequentes
CREATE INDEX idx_questionnaires_agent     ON questionnaires(agent_id);
CREATE INDEX idx_questionnaires_statut    ON questionnaires(statut);
CREATE INDEX idx_questionnaires_date      ON questionnaires(date_interview);
CREATE INDEX idx_reponses_questionnaire   ON reponses(questionnaire_id);
CREATE INDEX idx_positions_agent          ON positions_agents(agent_id);
CREATE INDEX idx_positions_timestamp      ON positions_agents(timestamp DESC);

-- Nettoyage auto des positions de + de 7 jours (garder leger)
CREATE OR REPLACE FUNCTION purge_vieilles_positions()
RETURNS void LANGUAGE sql AS $$
  DELETE FROM positions_agents WHERE timestamp < NOW() - INTERVAL '7 days';
$$;

-- Mise a jour automatique de updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_questionnaires_updated_at
  BEFORE UPDATE ON questionnaires
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
