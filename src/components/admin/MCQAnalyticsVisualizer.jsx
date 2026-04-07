import React, { useState, useEffect } from 'react';
import { fetchMCQDistribution } from '../../utils/supabaseHelpers';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Book, RefreshCw, AlertCircle } from 'lucide-react';

export default function MCQAnalyticsVisualizer() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [className, setClassName] = useState('class10');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const classes = ['class9', 'class10', 'class11', 'class12'];

  useEffect(() => {
    loadAnalytics();
  }, [className]);

  const loadAnalytics = async () => {
    setLoading(true);
    const res = await fetchMCQDistribution(className);
    if (res.success) {
      setData(res.data);
      setLastUpdated(new Date());
    } else {
      setData([]);
    }
    setLoading(false);
  };

  const totalMCQs = data.reduce((sum, item) => sum + item.count, 0);
  const emptyChapters = data.filter(item => item.count === 0).length;

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: 'var(--text-color)' }}>{label}</p>
          <p style={{ margin: '0', color: data.count === 0 ? '#ef4444' : '#ec4899', fontSize: '1.2rem', fontWeight: 'bold' }}>
            {data.count} MCQs
          </p>
          <p style={{ margin: '4px 0 0 0', opacity: 0.7, fontSize: '0.8rem', color: 'var(--text-color)' }}>
            Subject: {data.subject.charAt(0).toUpperCase() + data.subject.slice(1)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="admin-card glass-card premium-border" style={{ flex: 1, minWidth: '350px', padding: '25px', backgroundColor: 'var(--bg-color)', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 5px 0' }}>
            <Book size={24} color={'#ec4899'} />
            Live MCQ Density Map
          </h3>
          <span style={{ fontSize: '0.8rem', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <RefreshCw size={12} className={loading ? "spin" : ""} /> Last synced: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>

        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '4px' }}>
          {classes.map(cls => (
            <button 
              key={cls}
              onClick={() => setClassName(cls)}
              style={{
                background: className === cls ? '#ec4899' : 'transparent',
                color: className === cls ? '#fff' : 'var(--text-color)',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: className === cls ? 'bold' : 'normal',
                fontSize: '0.85rem',
                opacity: className === cls ? 1 : 0.7,
                transition: 'all 0.2s'
              }}
            >
              {cls.replace('class', 'Class ')}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
        <div style={{ flex: 1, background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(236, 72, 153, 0.02))', padding: '15px', borderRadius: '12px', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
          <div style={{ fontSize: '0.8rem', opacity: 0.8, color: 'var(--text-color)' }}>Total MCQs ({className})</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ec4899' }}>{loading ? '...' : totalMCQs}</div>
        </div>
        <div style={{ flex: 1, background: emptyChapters > 0 ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.02))' : 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.02))', padding: '15px', borderRadius: '12px', border: `1px solid ${emptyChapters > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}` }}>
          <div style={{ fontSize: '0.8rem', opacity: 0.8, color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            Empty Chapters {emptyChapters > 0 && <AlertCircle size={14} color="#ef4444" />}
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: emptyChapters > 0 ? '#ef4444' : '#10b981' }}>{loading ? '...' : emptyChapters}</div>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: '250px' }}>
        {loading ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
            Analyzing Data Network...
          </div>
        ) : data.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5, flexDirection: 'column', gap: '10px' }}>
            <AlertCircle size={32} />
            No chapters configured for {className}.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="chapter" 
                stroke="var(--text-color)" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                angle={-45}
                textAnchor="end"
                tickFormatter={(val) => val.length > 15 ? val.substring(0, 15) + '...' : val}
              />
              <YAxis stroke="var(--text-color)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={28} animationDuration={1500}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.count === 0 ? '#ef4444' : '#ec4899'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
