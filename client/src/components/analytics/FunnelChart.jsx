import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Custom tooltip for the funnel
const FunnelTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-bg-secondary border border-border p-3 rounded-lg shadow-xl">
        <p className="font-medium text-text-primary mb-1">{data.stage}</p>
        <p className="text-sm text-text-secondary">Leads: <span className="font-semibold text-text-primary">{data.count}</span></p>
        {data.dropoff > 0 && (
          <p className="text-xs text-accent-danger mt-1">Drop-off: {data.dropoff}%</p>
        )}
      </div>
    );
  }
  return null;
};

export default function FunnelChart({ data = [] }) {
  // Define colors for stages (cool to warm)
  const colors = [
    '#3b82f6', // New - blue
    '#6366f1', // Contacted - indigo
    '#8b5cf6', // Qualified - violet
    '#d946ef', // Proposal - fuchsia
    '#f59e0b', // Negotiation - amber
    '#10b981', // Won - green
  ];

  // Process data to calculate drop-offs
  const processedData = data.map((item, index) => {
    let dropoff = 0;
    if (index > 0 && data[index - 1].count > 0) {
      dropoff = Math.round(((data[index - 1].count - item.count) / data[index - 1].count) * 100);
    }
    return {
      ...item,
      dropoff,
      fill: colors[index % colors.length]
    };
  });

  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-5 shadow-lg h-full flex flex-col">
      <h3 className="text-lg font-medium text-text-primary mb-6">Sales Funnel</h3>
      
      <div className="flex-1 min-h-[300px]">
        {processedData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-text-secondary">
            No pipeline data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={processedData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
            >
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="stage" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#f1f5f9', fontSize: 13, fontWeight: 500 }}
                width={100}
              />
              <Tooltip content={<FunnelTooltip />} cursor={{ fill: '#242836' }} />
              <Bar 
                dataKey="count" 
                radius={[0, 4, 4, 0]}
                barSize={32}
                label={{ position: 'right', fill: '#94a3b8', fontSize: 12, formatter: (val) => val }}
              >
                {processedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
