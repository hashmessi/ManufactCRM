import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-bg-secondary border border-border p-3 rounded-lg shadow-xl">
        <p className="font-medium text-text-primary mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} className="text-sm flex justify-between items-center gap-4">
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <span className="font-semibold">₹{Number(entry.value).toLocaleString('en-IN')}</span>
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
    <div className="bg-bg-secondary border border-border rounded-xl p-5 shadow-lg h-full flex flex-col">
      <h3 className="text-lg font-medium text-text-primary mb-6">Revenue vs Target</h3>
      
      <div className="flex-1 min-h-[300px]">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-text-secondary">
            No revenue data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3348" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#242836' }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar 
                dataKey="revenue" 
                name="Actual Revenue" 
                radius={[4, 4, 0, 0]}
                barSize={30}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.percent >= 100 ? '#10b981' : entry.percent >= 60 ? '#6366f1' : '#ef4444'} 
                  />
                ))}
              </Bar>
              <Bar 
                dataKey="target" 
                name="Monthly Target" 
                fill="#2d3348" 
                radius={[4, 4, 0, 0]}
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
