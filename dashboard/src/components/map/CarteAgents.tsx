'use client';

import { useEffect, useRef, useState } from 'react';
import type { PositionAgent, Questionnaire } from '@/types';

const COULEURS_AGENTS = [
  '#1A3C5E', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6',
  '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6366F1',
];

interface CarteAgentsProps {
  positions:      PositionAgent[];
  questionnaires: Questionnaire[];
}

export default function CarteAgents({ positions, questionnaires }: CarteAgentsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<any>(null);
  const [erreur,     setErreur]   = useState('');
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    let map: any;

    async function initMap() {
      if (!containerRef.current || mapRef.current) return;
      try {
        const maplibregl = (await import('maplibre-gl')).default;

        // Construire un style MapLibre avec tuiles OpenStreetMap (sans cle API)
        const style = {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '(c) OpenStreetMap',
              maxzoom: 19,
            },
          },
          layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
        };

        map = new maplibregl.Map({
          container: containerRef.current,
          style: style as any,
          center: [-14.5, 14.5],
          zoom: 6,
        });

        mapRef.current = map;

        map.on('load', () => {
          setChargement(false);

          // Couleur par agent
          const agentIds = [...new Set(positions.map(p => p.agent_id))];
          const couleurParAgent = new Map(
            agentIds.map((id, i) => [id, COULEURS_AGENTS[i % COULEURS_AGENTS.length]])
          );

          // Marqueurs dernieres positions agents
          const dernieres = new Map<string, PositionAgent>();
          for (const p of positions) {
            if (!dernieres.has(p.agent_id)) dernieres.set(p.agent_id, p);
          }

          for (const pos of dernieres.values()) {
            const couleur = couleurParAgent.get(pos.agent_id) ?? '#1A3C5E';
            const el = document.createElement('div');
            el.style.cssText = `
              width:28px; height:28px; border-radius:50% 50% 50% 0;
              background:${couleur}; border:2px solid white;
              transform:rotate(-45deg); box-shadow:0 2px 6px rgba(0,0,0,.3);
              cursor:pointer;
            `;
            const nom = pos.agents ? `${pos.agents.prenom} ${pos.agents.nom}` : pos.agent_id;
            const popup = new maplibregl.Popup({ offset: 20 }).setHTML(`
              <div style="font-family:Inter,sans-serif;padding:4px">
                <p style="font-weight:600;font-size:13px;margin:0 0 2px">${nom}</p>
                <p style="color:#64748b;font-size:11px;margin:0">${pos.agents?.identifiant ?? ''}</p>
                <p style="color:#64748b;font-size:11px;margin:4px 0 0">
                  ${new Date(pos.timestamp).toLocaleString('fr-FR')}
                </p>
              </div>
            `);
            new maplibregl.Marker({ element: el })
              .setLngLat([pos.longitude, pos.latitude])
              .setPopup(popup)
              .addTo(map);
          }

          // Points questionnaires avec GPS
          for (const q of questionnaires) {
            if (!q.latitude || !q.longitude) continue;
            const couleur = couleurParAgent.get(q.agent_id) ?? '#F59E0B';
            const el = document.createElement('div');
            el.style.cssText = `
              width:10px; height:10px; border-radius:50%;
              background:${couleur}; border:1.5px solid white;
              box-shadow:0 1px 3px rgba(0,0,0,.2); cursor:pointer;
            `;
            const popup = new maplibregl.Popup({ offset: 8 }).setHTML(`
              <div style="font-family:Inter,sans-serif;padding:4px">
                <p style="font-weight:600;font-size:12px;margin:0 0 2px">${q.nom_chef ?? 'Sans nom'}</p>
                <p style="color:#64748b;font-size:11px;margin:0">${q.nom_commune ?? ''}, ${q.nom_region ?? ''}</p>
                <p style="color:#64748b;font-size:11px;margin:4px 0 0">${q.date_interview ?? ''}</p>
              </div>
            `);
            new maplibregl.Marker({ element: el })
              .setLngLat([q.longitude, q.latitude])
              .setPopup(popup)
              .addTo(map);
          }
        });

        map.on('error', () => setErreur('Erreur de chargement de la carte'));
      } catch (e) {
        setErreur('Impossible de charger la carte');
        setChargement(false);
      }
    }

    initMap();
    return () => { map?.remove(); mapRef.current = null; };
  }, []);

  if (erreur) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200 text-slate-400 text-sm">
        {erreur}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-slate-200">
      {chargement && (
        <div className="absolute inset-0 bg-slate-50 flex items-center justify-center z-10">
          <div className="text-slate-400 text-sm">Chargement de la carte...</div>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
