import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Area, AreaChart } from 'recharts';

export default function MiniLineChart({ data = [], color = '#6366F1', height = 80, smooth = true }) {
  const strokeWidth = 2;
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="miniGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="x" hide />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip cursor={{ stroke: color, strokeOpacity: 0.2 }} content={() => null} />
          <Area type={smooth ? 'monotone' : 'linear'} dataKey="y" stroke={color} strokeWidth={strokeWidth} fill="url(#miniGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
