import { Card } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CallAnalyticsProps {
  callsOverTime: any[];
  callOutcomes: any[];
  sentimentData: any[];
}

const COLORS = {
  primary: 'hsl(259 94% 51%)',
  success: 'hsl(142 76% 36%)',
  warning: 'hsl(38 92% 50%)',
  danger: 'hsl(0 84% 60%)',
  secondary: 'hsl(280 100% 70%)',
};

export const CallAnalytics = ({ callsOverTime, callOutcomes, sentimentData }: CallAnalyticsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calls Over Time */}
      <Card className="p-6 glass">
        <h3 className="font-semibold mb-4">Calls Over Time</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={callsOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="calls" 
              stroke={COLORS.primary}
              strokeWidth={2}
              dot={{ fill: COLORS.primary }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Call Outcomes */}
      <Card className="p-6 glass">
        <h3 className="font-semibold mb-4">Call Outcomes</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={callOutcomes}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {callOutcomes.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={Object.values(COLORS)[index % Object.values(COLORS).length]} 
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Sentiment Analysis */}
      <Card className="p-6 glass">
        <h3 className="font-semibold mb-4">Sentiment Analysis</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={sentimentData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="sentiment" 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="count" fill={COLORS.primary} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Peak Hours Heatmap */}
      <Card className="p-6 glass">
        <h3 className="font-semibold mb-4">Call Duration Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={[
            { range: '0-1m', count: 12 },
            { range: '1-3m', count: 45 },
            { range: '3-5m', count: 67 },
            { range: '5-10m', count: 34 },
            { range: '10m+', count: 8 },
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="range" 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="count" fill={COLORS.secondary} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};