-- ═══════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY (RLS) - Securite des donnees
--  Chaque utilisateur ne voit que CE QU'IL A LE DROIT DE VOIR
-- ═══════════════════════════════════════════════════════════════

-- Activation RLS sur toutes les tables
ALTER TABLE agents            ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaires    ENABLE ROW LEVEL SECURITY;
ALTER TABLE reponses          ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions_agents  ENABLE ROW LEVEL SECURITY;

-- ── Fonction utilitaire : role de l'utilisateur courant ──────
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER AS $$
  SELECT role FROM agents WHERE id = auth.uid();
$$;

-- ════════════════════════════════════════════════════════════
--  TABLE : agents
-- ════════════════════════════════════════════════════════════

-- Un agent peut lire uniquement son propre profil
CREATE POLICY "agent_lit_son_profil"
  ON agents FOR SELECT
  USING (id = auth.uid());

-- Superviseur et admin voient tous les agents
CREATE POLICY "superviseur_lit_tous_agents"
  ON agents FOR SELECT
  USING (get_user_role() IN ('superviseur', 'admin'));

-- Seul admin peut creer / modifier les agents
CREATE POLICY "admin_gere_agents"
  ON agents FOR ALL
  USING (get_user_role() = 'admin');

-- ════════════════════════════════════════════════════════════
--  TABLE : questionnaires
-- ════════════════════════════════════════════════════════════

-- Agent : voit et gere uniquement SES questionnaires
CREATE POLICY "agent_voit_ses_questionnaires"
  ON questionnaires FOR SELECT
  USING (agent_id = auth.uid());

CREATE POLICY "agent_cree_questionnaire"
  ON questionnaires FOR INSERT
  WITH CHECK (agent_id = auth.uid());

CREATE POLICY "agent_modifie_ses_questionnaires"
  ON questionnaires FOR UPDATE
  USING (
    agent_id = auth.uid()
    AND statut NOT IN ('valide')  -- Ne peut plus modifier si valide
  );

-- Superviseur et admin : voient TOUS les questionnaires
CREATE POLICY "superviseur_voit_tous"
  ON questionnaires FOR SELECT
  USING (get_user_role() IN ('superviseur', 'admin'));

-- Admin peut valider (modifier statut -> valide)
CREATE POLICY "admin_valide_questionnaire"
  ON questionnaires FOR UPDATE
  USING (get_user_role() IN ('superviseur', 'admin'));

-- Personne ne peut SUPPRIMER un questionnaire soumis
CREATE POLICY "interdire_suppression_soumis"
  ON questionnaires FOR DELETE
  USING (
    get_user_role() = 'admin'
    AND statut = 'brouillon'
  );

-- ════════════════════════════════════════════════════════════
--  TABLE : reponses
-- ════════════════════════════════════════════════════════════

-- Agent : acces uniquement aux reponses de SES questionnaires
CREATE POLICY "agent_acces_ses_reponses"
  ON reponses FOR ALL
  USING (
    questionnaire_id IN (
      SELECT id FROM questionnaires WHERE agent_id = auth.uid()
    )
  );

-- Superviseur / admin : acces a toutes les reponses
CREATE POLICY "superviseur_lit_toutes_reponses"
  ON reponses FOR SELECT
  USING (get_user_role() IN ('superviseur', 'admin'));

-- ════════════════════════════════════════════════════════════
--  TABLE : positions_agents
-- ════════════════════════════════════════════════════════════

-- Agent : insere uniquement SA position
CREATE POLICY "agent_insere_sa_position"
  ON positions_agents FOR INSERT
  WITH CHECK (agent_id = auth.uid());

-- Superviseur / admin : voient toutes les positions
CREATE POLICY "superviseur_voit_positions"
  ON positions_agents FOR SELECT
  USING (get_user_role() IN ('superviseur', 'admin'));

-- Agent peut voir SA propre position
CREATE POLICY "agent_voit_sa_position"
  ON positions_agents FOR SELECT
  USING (agent_id = auth.uid());
