import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-bg-secondary border border-border/85 p-3 rounded-xl shadow-premium-soft select-none text-[11px] font-mono">
        <p className="font-semibold text-text-primary mb-2 border-b border-border/40 pb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} className="flex justify-between items-center gap-6 mt-1 text-text-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: entry.fill }} />
              {entry.name}:
            </span>
            <span className="font-bold text-text-primary">₹{Number(entry.value).toLocaleString('en-IN')}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ data = [] }) {
  // Add achievement percentage for coloring
  const chartData = data.map(item => ({
    ...item,
    percent: item.target > 0 ? (item.revenue / item.target) * 100 : 0
  }));

  return (
    <div className="bg-bg-secondary/40 border border-border/80 rounded-xl p-5 shadow-premium-card h-full flex flex-col transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider font-mono">Revenue Performance vs Target</h3>
        <span className="text-[10px] text-text-muted font-mono bg-bg-tertiary px-2 py-0.5 rounded border border-border/40">MONTHLY VIEWS</span>
      </div>
      
      <div className="flex-1 min-h-[280px]">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-text-muted text-xs font-mono">
            No revenue data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
              barGap={6}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.03)" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                dx={-5}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase' }} 
                verticalAlign="bottom"
                iconType="circle"
                iconSize={6}
              />
              <Bar 
                dataKey="revenue" 
                name="Actual Revenue" 
                radius={[3, 3, 0, 0]}
                barSize={16}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.percent >= 100 ? '#10b981' : entry.percent >= 60 ? '#4f8cff' : '#ef4444'} 
                  />
                ))}
              </Bar>
              <Bar 
                dataKey="target" 
                name="Monthly Target" 
                fill="rgba(255, 255, 255, 0.08)" 
                radius={[3, 3, 0, 0]}
                barSize={16}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
