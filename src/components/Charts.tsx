"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export function PriceTrendChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  // Aggregate data by district
  const districtData = data.reduce((acc, item) => {
    if (!acc[item.district]) {
      acc[item.district] = { name: item.district, price: 0, count: 0 };
    }
    acc[item.district].price += item.price;
    acc[item.district].count += 1;
    return acc;
  }, {} as Record<string, any>);

  const chartData = Object.values(districtData).map((d: any) => ({
    name: d.name,
    avgPrice: Math.round(d.price / d.count)
  })).sort((a, b) => b.avgPrice - a.avgPrice).slice(0, 5); // top 5

  return (
    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '8px', color: '#333333' }}
            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
            formatter={(value: any) => [`NT$ ${Number(value).toLocaleString()}`, '平均租金']}
          />
          <Bar dataKey="avgPrice" fill="#005b9f" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const COLORS = ['#005b9f', '#10b981', '#f59e0b', '#cc0000', '#8b5cf6'];
export function TypePieChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  const typeData = data.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const chartData = Object.entries(typeData).map(([name, value]) => ({ name, value }));

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '8px', color: '#333333' }}
            formatter={(value: any) => [`${value} 筆`, '數量']}
          />
          <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '14px', color: '#333333' }}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
