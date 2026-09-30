import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell
} from 'recharts';

interface ChartPlaceholderProps {
  height?: number;
  title?: string;
}

const enrollmentData = [
  { month: 'Apr', trainees: 420, target: 450 },
  { month: 'May', trainees: 580, target: 550 },
  { month: 'Jun', trainees: 720, target: 700 },
  { month: 'Jul', trainees: 890, target: 850 },
  { month: 'Aug', trainees: 1080, target: 1000 },
  { month: 'Sep', trainees: 1247, target: 1150 },
];

const placementData = [
  { sector: 'Dairy Coops', rate: 84 },
  { sector: 'Banking & Credit', rate: 76 },
  { sector: 'Agri-Marketing', rate: 69 },
  { sector: 'Handloom & Textile', rate: 61 },
  { sector: 'Fisheries', rate: 58 },
  { sector: 'Sugar Federations', rate: 72 },
];

const categoryData = [
  { category: 'Primary PACS', count: 480, share: '38%' },
  { category: 'District Unions', count: 340, share: '27%' },
  { category: 'State Federations', count: 250, share: '20%' },
  { category: 'Multi-State Coops', count: 177, share: '15%' },
];

const completionData = [
  { month: 'Apr', target: 85, achieved: 84.2 },
  { month: 'May', target: 85, achieved: 86.8 },
  { month: 'Jun', target: 85, achieved: 85.5 },
  { month: 'Jul', target: 85, achieved: 87.1 },
  { month: 'Aug', target: 85, achieved: 86.4 },
  { month: 'Sep', target: 85, achieved: 87.3 },
];

const SECTOR_COLORS = ['#16a34a', '#22c55e', '#4ade80', '#ca8a04', '#eab308', '#2563eb'];

export function ChartPlaceholder({ height = 300, title = '' }: ChartPlaceholderProps) {
  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes('enrollment')) {
    return (
      <div style={{ width: '100%', height }} className="pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={enrollmentData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="enrollmentGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} />
            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend />
            <Area type="monotone" dataKey="trainees" name="Trainees Enrolled" stroke="#16a34a" strokeWidth={2.5} fillOpacity={1} fill="url(#enrollmentGrad)" />
            <Area type="monotone" dataKey="target" name="Target Capacity" stroke="#ca8a04" strokeWidth={2} strokeDasharray="4 4" fill="none" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (lowerTitle.includes('placement')) {
    return (
      <div style={{ width: '100%', height }} className="pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={placementData} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="sector" stroke="#9ca3af" fontSize={11} interval={0} angle={-15} textAnchor="end" tickLine={false} />
            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} unit="%" />
            <Tooltip
              formatter={(value: any) => [`${value}%`, 'Placement Rate']}
              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
              {placementData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={SECTOR_COLORS[index % SECTOR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (lowerTitle.includes('dropout') || lowerTitle.includes('heatmap') || lowerTitle.includes('distribution')) {
    return (
      <div style={{ width: '100%', height }} className="pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={categoryData} margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
            <XAxis type="number" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="category" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              formatter={(value: any) => [value, 'Total Enrolled Trainees']}
              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
            />
            <Bar dataKey="count" fill="#2563eb" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (lowerTitle.includes('completion')) {
    return (
      <div style={{ width: '100%', height }} className="pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={completionData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} />
            <YAxis domain={[75, 100]} stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} unit="%" />
            <Tooltip
              formatter={(val: any) => [`${val}%`]}
              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
            />
            <Legend />
            <Line type="monotone" dataKey="achieved" name="Achieved Completion %" stroke="#16a34a" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="target" name="Benchmark Target %" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }} className="pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={enrollmentData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} />
          <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
          <Area type="monotone" dataKey="trainees" stroke="#16a34a" fill="#dcfce7" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}