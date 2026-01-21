
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
// Fix: Import the correct DistributionPoint type from types.ts
import { DistributionPoint } from '../types';

interface Props {
  // Fix: Use DistributionPoint array and string for userRange
  data: DistributionPoint[];
  userRange: string;
}

const DistributionChart: React.FC<Props> = ({ data, userRange }) => {
  return (
    <div className="w-full h-64 mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <XAxis 
            // Fix: Use ageRange property from DistributionPoint
            dataKey="ageRange" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#64748b' }}
          />
          <YAxis hide />
          <Tooltip 
            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-2 border border-slate-200 shadow-sm rounded-lg text-xs">
                    {/* Fix: Use ageRange instead of range */}
                    <p className="font-bold text-slate-700">{payload[0].payload.ageRange} 岁区间</p>
                    <p className="text-blue-600">占比: {payload[0].value?.toString()}%</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="percentage" radius={[4, 4, 0, 0]} barSize={40}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                // Fix: Use ageRange instead of range
                fill={entry.ageRange === userRange ? '#3b82f6' : '#cbd5e1'} 
              />
            ))}
            <LabelList 
                dataKey="percentage" 
                position="top" 
                formatter={(val: number) => `${val.toFixed(1)}%`}
                style={{ fontSize: '10px', fill: '#94a3b8' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DistributionChart;
