import React from 'react';
import { ResponsiveContainer, BarChart as RBarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function BarChart({ data = [], dataKey = 'value', categoryKey = 'name', color = '#6366F1', height = 120, barSize = 10 }) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RBarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(15,23,42,0.08)" />
          <XAxis dataKey={categoryKey} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <Tooltip contentStyle={{ fontSize: 12 }} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
          <Bar dataKey={dataKey} fill={color} barSize={barSize} radius={[4, 4, 0, 0]} />
        </RBarChart>
      </ResponsiveContainer>
    </div>
  );
}
