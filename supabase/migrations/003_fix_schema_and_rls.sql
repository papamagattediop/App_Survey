-- ═══════════════════════════════════════════════════════════════
--  MIGRATION 003 - Correction schema + RLS complet
--  A executer dans Supabase > SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────
-- 1. CORRECTION SCHEMA questionnaires
--    L'app envoie code_commune/nom_commune/nom_region
--    mais le schema original avait code_region/code_dep/etc.
-- ────────────────────────────────────────────────────────────────

-- Ajouter les colonnes manquantes (IF NOT EXISTS evite les erreurs si deja presentes)
ALTER TABLE questionnaires
  ADD COLUMN IF NOT EXISTS code_commune  TEXT,
  ADD COLUMN IF NOT EXISTS nom_commune   TEXT,
  ADD COLUMN IF NOT EXISTS nom_region    TEXT;

-- Changer date_interview en TEXT (l'app envoie "07/06/2026 14:30" pas un DATE ISO)
ALTER TABLE questionnaires
  ALTER COLUMN date_interview TYPE TEXT USING date_interview::TEXT;

-- Supprimer les anciennes colonnes inutilisees
ALTER TABLE questionnaires
  DROP COLUMN IF EXISTS code_region,
  DROP COLUMN IF EXISTS code_dep,
  DROP COLUMN IF EXISTS code_arr,
  DROP COLUMN IF EXISTS code_cr,
  DROP COLUMN IF EXISTS code_village;

-- ────────────────────────────────────────────────────────────────
-- 2. ACTIVATION RLS (au cas ou pas encore fait)
-- ────────────────────────────────────────────────────────────────

ALTER TABLE agents           ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaires   ENABLE ROW LEVEL SECURITY;
ALTER TABLE reponses         ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions_agents ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────────
-- 3. FONCTION UTILITAIRE : role de l'utilisateur courant
-- ────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM agents WHERE id = auth.uid();
$$;

-- ────────────────────────────────────────────────────────────────
-- 4. POLITIQUES RLS - TABLE agents
-- ────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "agent_lit_son_profil"         ON agents;
DROP POLICY IF EXISTS "superviseur_lit_tous_agents"  ON agents;
DROP POLICY IF EXISTS "admin_gere_agents"            ON agents;

-- Un agent lit uniquement son propre profil
CREATE POLICY "agent_lit_son_profil"
  ON agents FOR SELECT
  USING (id = auth.uid());

-- Superviseur/admin voient tous les agents
CREATE POLICY "superviseur_lit_tous_agents"
  ON agents FOR SELECT
  USING (get_user_role() IN ('superviseur', 'admin'));

-- Seul admin peut creer/modifier/supprimer des agents
CREATE POLICY "admin_gere_agents"
  ON agents FOR ALL
  USING (get_user_role() = 'admin');

-- ────────────────────────────────────────────────────────────────
-- 5. POLITIQUES RLS - TABLE questionnaires
-- ────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "agent_voit_ses_questionnaires"   ON questionnaires;
DROP POLICY IF EXISTS "agent_cree_questionnaire"        ON questionnaires;
DROP POLICY IF EXISTS "agent_modifie_ses_questionnaires" ON questionnaires;
DROP POLICY IF EXISTS "superviseur_voit_tous"           ON questionnaires;
DROP POLICY IF EXISTS "admin_valide_questionnaire"      ON questionnaires;
DROP POLICY IF EXISTS "interdire_suppression_soumis"    ON questionnaires;

-- Agent : lit uniquement SES questionnaires
CREATE POLICY "agent_select"
  ON questionnaires FOR SELECT
  USING (agent_id = auth.uid());

-- Agent : cree uniquement pour lui-meme
CREATE POLICY "agent_insert"
  ON questionnaires FOR INSERT
  WITH CHECK (agent_id = auth.uid());

-- Agent : modifie uniquement SES questionnaires non valides
CREATE POLICY "agent_update"
  ON questionnaires FOR UPDATE
  USING (agent_id = auth.uid() AND statut <> 'valide')
  WITH CHECK (agent_id = auth.uid());

-- Agent : supprime uniquement SES brouillons
CREATE POLICY "agent_delete"
  ON questionnaires FOR DELETE
  USING (agent_id = auth.uid() AND statut = 'brouillon');

-- Superviseur/admin : lit TOUS les questionnaires
CREATE POLICY "superviseur_select"
  ON questionnaires FOR SELECT
  USING (get_user_role() IN ('superviseur', 'admin'));

-- Superviseur/admin : peut mettre a jour le statut (validation)
CREATE POLICY "superviseur_update"
  ON questionnaires FOR UPDATE
  USING (get_user_role() IN ('superviseur', 'admin'));

-- ────────────────────────────────────────────────────────────────
-- 6. POLITIQUES RLS - TABLE reponses
-- ────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "agent_acces_ses_reponses"       ON reponses;
DROP POLICY IF EXISTS "superviseur_lit_toutes_reponses" ON reponses;

-- Agent : toutes operations sur les reponses de SES questionnaires
CREATE POLICY "agent_reponses"
  ON reponses FOR ALL
  USING (
    questionnaire_id IN (
      SELECT id FROM questionnaires WHERE agent_id = auth.uid()
    )
  )
  WITH CHECK (
    questionnaire_id IN (
      SELECT id FROM questionnaires WHERE agent_id = auth.uid()
    )
  );

-- Superviseur/admin : lit toutes les reponses
CREATE POLICY "superviseur_reponses_select"
  ON reponses FOR SELECT
  USING (get_user_role() IN ('superviseur', 'admin'));

-- ────────────────────────────────────────────────────────────────
-- 7. POLITIQUES RLS - TABLE positions_agents
-- ────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "agent_insere_sa_position"  ON positions_agents;
DROP POLICY IF EXISTS "superviseur_voit_positions" ON positions_agents;
DROP POLICY IF EXISTS "agent_voit_sa_position"    ON positions_agents;

-- Agent : insere et lit uniquement SA position
CREATE POLICY "agent_position_insert"
  ON positions_agents FOR INSERT
  WITH CHECK (agent_id = auth.uid());

CREATE POLICY "agent_position_select"
  ON positions_agents FOR SELECT
  USING (agent_id = auth.uid());

-- Superviseur/admin : lit TOUTES les positions
CREATE POLICY "superviseur_position_select"
  ON positions_agents FOR SELECT
  USING (get_user_role() IN ('superviseur', 'admin'));

-- ────────────────────────────────────────────────────────────────
-- 8. VERIFICATION FINALE
-- ────────────────────────────────────────────────────────────────

-- Verifier que le RLS est bien actif sur toutes les tables
SELECT
  tablename,
  rowsecurity AS rls_actif
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('agents', 'questionnaires', 'reponses', 'positions_agents')
ORDER BY tablename;

-- Lister toutes les politiques actives
SELECT
  tablename,
  policyname,
  cmd        AS operation,
  permissive
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
