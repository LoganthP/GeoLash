import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", registrations: 45, verifications: 38, disputes: 5 },
  { month: "Feb", registrations: 52, verifications: 45, disputes: 8 },
  { month: "Mar", registrations: 61, verifications: 55, disputes: 4 },
  { month: "Apr", registrations: 48, verifications: 42, disputes: 6 },
  { month: "May", registrations: 73, verifications: 68, disputes: 3 },
  { month: "Jun", registrations: 85, verifications: 78, disputes: 7 },
  { month: "Jul", registrations: 92, verifications: 86, disputes: 5 },
];

export function ActivityChart() {
  return (
    <div className="glass-card rounded-xl card-shadow p-4">
      <h3 className="font-display font-semibold mb-4">Monthly Activity</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(173, 80%, 40%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(173, 80%, 40%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorVerifications" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(220, 13%, 91%)",
                borderRadius: "8px",
                boxShadow: "0 4px 12px -2px rgba(0,0,0,0.1)",
              }}
            />
            <Area
              type="monotone"
              dataKey="registrations"
              stroke="hsl(173, 80%, 40%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRegistrations)"
              name="Registrations"
            />
            <Area
              type="monotone"
              dataKey="verifications"
              stroke="hsl(142, 76%, 36%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorVerifications)"
              name="Verifications"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">Registrations</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="text-sm text-muted-foreground">Verifications</span>
        </div>
      </div>
    </div>
  );
}
