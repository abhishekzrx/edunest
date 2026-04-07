import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function ChapterPerformanceChart({ data }) {
  
  if (!data || data.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-color)', opacity: 0.6 }}>
        No chapter data available.
      </div>
    );
  }

  // Custom tool-tip to align with Premium UI
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          padding: '16px',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          minWidth: '200px'
        }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#fff', fontSize: '1.05rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
            {label}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {payload.map((entry, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: entry.color, display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color, display: 'inline-block' }}></span>
                  {entry.name}
                </span>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="rgba(255,255,255,0.05)" />
        <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 12 }} />
        <YAxis 
          dataKey="chapter" 
          type="category" 
          stroke="#94a3b8" 
          tick={{ fontSize: 12, fill: '#cbd5e1' }} 
          width={100} 
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Legend wrapperStyle={{ paddingTop: '10px' }} />
        
        {/* Stacked Bars */}
        <Bar dataKey="correct" name="Correct" stackId="a" fill="#10b981" animationDuration={1000} radius={[0, 0, 0, 0]} />
        <Bar dataKey="skipped" name="Skipped" stackId="a" fill="#eab308" animationDuration={1000} radius={[0, 0, 0, 0]} />
        <Bar dataKey="incorrect" name="Incorrect" stackId="a" fill="#ef4444" animationDuration={1000} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
