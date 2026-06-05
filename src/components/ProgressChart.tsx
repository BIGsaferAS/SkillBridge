'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ProgressChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-zinc-500 italic">Henüz grafik oluşturulacak yeterli veri yok.</div>;
  }

  const chartData = data.map((d, index) => ({
    name: `Test ${index + 1}`,
    score: d.score,
    date: new Date(d.createdAt).toLocaleDateString()
  })).reverse(); // En eskiden en yeniye sıralamak için (Eğer DB'den desc geliyorsa)

  return (
    <div className="h-64 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} dot={{ r: 5, fill: "#10b981" }} activeDot={{ r: 8 }} />
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" opacity={0.2} />
          <XAxis dataKey="name" stroke="#888" fontSize={12} />
          <YAxis stroke="#888" fontSize={12} domain={[0, 100]} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181b', color: '#fff', border: 'none', borderRadius: '8px' }}
            itemStyle={{ color: '#10b981' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
