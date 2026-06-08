'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { CollecteParJour } from '@/types';

interface CollectesChartProps {
  data: CollecteParJour[];
}

// Composant defini en dehors pour eviter le warning setState-during-render de Recharts
const TooltipCustom = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  let dateLabel = item?.date ?? '';
  try {
    dateLabel = format(parseISO(item.date), 'EEEE d MMMM', { locale: fr });
  } catch {}
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="text-slate-500 text-xs mb-1 capitalize">{dateLabel}</p>
      <p className="font-bold text-navy">
        {payload[0].value} collecte{payload[0].value !== 1 ? 's' : ''}
      </p>
    </div>
  );
};

export default function CollectesChart({ data }: CollectesChartProps) {
  const formatted = data.map(d => ({
    ...d,
    dateLabel: (() => {
      try { return format(parseISO(d.date), 'dd/MM', { locale: fr }); }
      catch { return d.date; }
    })(),
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={formatted} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="dateLabel"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          content={TooltipCustom}
          cursor={{ fill: '#f1f5f9' }}
          isAnimationActive={false}
        />
        <Bar
          dataKey="total"
          fill="#1A3C5E"
          radius={[3, 3, 0, 0]}
          maxBarSize={32}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
