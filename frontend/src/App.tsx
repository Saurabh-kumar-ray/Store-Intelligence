import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  ShoppingCart, 
  AlertTriangle, 
  Activity,
  LayoutDashboard,
  Users2,
  Settings as SettingsIcon,
  ShieldAlert
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell,
  AreaChart,
  Area
} from 'recharts';

// Types
interface Metrics {
  unique_visitors: number;
  conversion_rate: number;
  avg_zone_dwell_time: number;
  queue_depth: number;
  abandonment_rate: number;
}

interface FunnelStep {
  label: string;
  count: number;
  percentage: number;
}

interface Anomaly {
  id: string;
  timestamp: string;
  type: string;
  severity: "INFO" | "WARN" | "CRITICAL";
  description: string;
}

const App: React.FC = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [funnel, setFunnel] = useState<FunnelStep[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real data with fallback to simulation/mock data if API fails
  useEffect(() => {
    const fetchData = async () => {
      try {
        const storeId = "STORE_01";
        const [metricsRes, funnelRes, anomaliesRes] = await Promise.all([
          fetch(`/api/stores/${storeId}/metrics`),
          fetch(`/api/stores/${storeId}/funnel`),
          fetch(`/api/stores/${storeId}/anomalies`)
        ]);

        if (!metricsRes.ok || !funnelRes.ok || !anomaliesRes.ok) {
          throw new Error("Failed to fetch data from API");
        }

        const metricsData = await metricsRes.json();
        const funnelData = await funnelRes.json();
        const anomaliesData = await anomaliesRes.json();

        setMetrics(metricsData);
        setFunnel(funnelData);
        setAnomalies(anomaliesData);
      } catch (error) {
        console.error("Error fetching data from API, falling back to simulated data", error);
        setMetrics({
          unique_visitors: 1240,
          conversion_rate: 18.5,
          avg_zone_dwell_time: 4.2,
          queue_depth: 8,
          abandonment_rate: 12.4
        });

        setFunnel([
          { label: "Store Entry", count: 1240, percentage: 100 },
          { label: "Zone Visit", count: 850, percentage: 68.5 },
          { label: "Queue Join", count: 320, percentage: 25.8 },
          { label: "Purchase", count: 229, percentage: 18.5 }
        ]);

        setAnomalies([
          { id: "1", timestamp: new Date().toISOString(), type: "Queue Spike (Simulated)", severity: "WARN", description: "Billing queue depth exceeded 10 people at 14:30." },
          { id: "2", timestamp: new Date().toISOString(), type: "Dead Zone (Simulated)", severity: "INFO", description: "Aisle 4 showing 0 activity for 4 hours." }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-background">
      <div className="animate-spin text-primary"><Activity size={48} /></div>
    </div>
  );

  return (
    <div className="min-h-screen p-6 lg:p-10 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Store Intelligence Platform
          </h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <Activity size={16} className="text-green-500 animate-pulse-subtle" />
            Live Feed: Store #42 - London Flagship
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg flex items-center gap-2 transition-all">
            <SettingsIcon size={18} /> Settings
          </button>
          <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-primary/20">
            <ShieldAlert size={18} /> Security Mode
          </button>
        </div>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Visitors" value={metrics?.unique_visitors.toString() || "0"} icon={<Users className="text-blue-400" />} trend="+12% vs yesterday" />
        <KPICard title="Conv. Rate" value={`${metrics?.conversion_rate}%`} icon={<TrendingUp className="text-emerald-400" />} trend="+2.4% this week" />
        <KPICard title="Avg Dwell" value={`${metrics?.avg_zone_dwell_time}m`} icon={<Clock className="text-amber-400" />} trend="-30s vs last hour" />
        <KPICard title="Queue Depth" value={metrics?.queue_depth.toString() || "0"} icon={<Users2 className="text-primary" />} trend="Current depth" />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnel Chart */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <LayoutDashboard size={20} className="text-primary" /> Conversion Funnel
          </h2>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={funnel}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="label" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Anomalies Panel */}
        <div className="glass-card rounded-2xl p-6 flex flex-col">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-red-400">
            <AlertTriangle size={20} /> Live Anomalies
          </h2>
          <div className="space-y-4 flex-1">
            {anomalies.map(anomaly => (
              <div key={anomaly.id} className={`p-4 rounded-xl border ${anomaly.severity === 'WARN' ? 'border-amber-500/30 bg-amber-500/5' : 'border-blue-500/30 bg-blue-500/5'}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${anomaly.severity === 'WARN' ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-500'}`}>
                    {anomaly.severity}
                  </span>
                  <span className="text-xs text-muted-foreground">{new Date(anomaly.timestamp).toLocaleTimeString()}</span>
                </div>
                <h3 className="font-medium">{anomaly.type}</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{anomaly.description}</p>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full py-2 text-sm font-medium text-white/60 hover:text-white transition-colors">
            View All Incident Logs
          </button>
        </div>
      </div>

      {/* Heatmap & Store Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 h-[400px]">
           <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Activity size={20} className="text-emerald-400" /> Zone Popularity (Real-time Heatmap)
          </h2>
          <div className="relative h-[280px] bg-white/5 rounded-xl border border-dashed border-white/10 flex items-center justify-center">
             {/* Simulated Heatmap Overlay */}
             <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-1 p-4 opacity-40">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className={`rounded ${i % 3 === 0 ? 'bg-red-500' : i % 2 === 0 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ opacity: Math.random() }}></div>
                ))}
             </div>
             <p className="text-sm text-white/40 z-10 font-medium">Overhead Store Map View Active</p>
          </div>
        </div>
        
        <div className="glass-card rounded-2xl p-6 h-[400px]">
           <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <ShoppingCart size={20} className="text-blue-400" /> Hourly Conversion
          </h2>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnel}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="label" hide />
                <YAxis stroke="#888" />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                  {funnel.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${1 - index*0.2})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const KPICard: React.FC<{ title: string; value: string; icon: React.ReactNode; trend: string }> = ({ title, value, icon, trend }) => (
  <div className="glass-card rounded-2xl p-6 transition-all hover:scale-[1.02] cursor-default border-t-primary/20 border-t-2">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-white/5 rounded-lg border border-white/10">{icon}</div>
      <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">{trend}</span>
    </div>
    <div className="space-y-1">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <p className="text-4xl font-bold tracking-tight">{value}</p>
    </div>
  </div>
);

export default App;
