interface KpiCardProps {
  title:     string;
  value:     number | string;
  subtitle?: string;
  trend?:    'up' | 'down' | 'neutral';
  accent?:   boolean;
}

export default function KpiCard({ title, value, subtitle, trend, accent }: KpiCardProps) {
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : null;
  const trendColor = trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : '';

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-6 ${accent ? 'border-amber' : 'border-slate-100'}`}>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">{title}</p>
      <div className="flex items-end gap-2">
        <span className={`text-4xl font-bold leading-none ${accent ? 'text-amber' : 'text-navy'}`}>
          {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
        </span>
        {trendIcon && (
          <span className={`text-sm font-semibold pb-0.5 ${trendColor}`}>{trendIcon}</span>
        )}
      </div>
      {subtitle && (
        <p className="text-xs text-slate-400 mt-2">{subtitle}</p>
      )}
    </div>
  );
}
