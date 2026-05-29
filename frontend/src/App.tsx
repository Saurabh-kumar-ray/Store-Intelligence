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
  ShieldAlert,
  X,
  Lock,
  Smartphone,
  Eye,
  EyeOff,
  LogOut,
  Laptop,
  Moon,
  Sun,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Cell
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

  // Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  
  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Settings State
  const [settings, setSettings] = useState({
    theme: 'dark',
    refreshInterval: 10, // in seconds
    enableAlerts: true,
    enableSound: false,
    showHeatmap: true,
    showHourlyConversion: true,
  });

  // Temporary Settings State for modal editing
  const [tempSettings, setTempSettings] = useState({ ...settings });

  // Security State
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessions, setSessions] = useState([
    { id: '1', device: 'Chrome on Windows', location: 'London, UK', status: 'Active now', isCurrent: true },
    { id: '2', device: 'Safari on iPhone 15', location: 'London, UK', status: '2 hours ago', isCurrent: false },
    { id: '3', device: 'Firefox on macOS', location: 'Paris, France', status: 'Yesterday', isCurrent: false }
  ]);
  const [loginHistory] = useState([
    { id: '1', status: 'Success', device: 'Chrome (Windows)', ip: '192.168.1.1', time: 'Today at 02:50' },
    { id: '2', status: 'Success', device: 'Safari (iOS)', ip: '82.16.2.99', time: 'Yesterday at 18:24' },
    { id: '3', status: 'Failed', device: 'Chrome (Windows)', ip: '192.168.1.1', time: '3 days ago (Invalid password)' }
  ]);

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Helper to show a temporary toast notification
  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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
    // The refresh interval is read dynamically from the settings state
    const interval = setInterval(fetchData, settings.refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [settings.refreshInterval]);

  // Settings Actions
  const handleOpenSettings = () => {
    setTempSettings({ ...settings });
    setIsSettingsOpen(true);
  };

  const handleSaveSettings = () => {
    setSettings(tempSettings);
    setIsSettingsOpen(false);
    triggerToast("Settings saved successfully!");
  };

  // Security Actions
  const handleOpenSecurity = () => {
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setIsSecurityOpen(true);
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();

    // Password change validation
    if (passwordForm.currentPassword || passwordForm.newPassword || passwordForm.confirmPassword) {
      if (!passwordForm.currentPassword) {
        triggerToast("Please enter current password to verify.", "error");
        return;
      }
      if (passwordForm.newPassword.length < 6) {
        triggerToast("New password must be at least 6 characters.", "error");
        return;
      }
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        triggerToast("Passwords do not match.", "error");
        return;
      }
      triggerToast("Password & security preferences updated successfully!");
    } else {
      triggerToast("Security preferences saved successfully!");
    }

    setIsSecurityOpen(false);
  };

  const handleRevokeSession = (id: string) => {
    setSessions(sessions.filter(s => s.id !== id));
    triggerToast("Session successfully revoked!");
  };

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
            Live Feed: Store #42 - London Flagship (Refresh: {settings.refreshInterval}s)
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleOpenSettings}
            className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer"
          >
            <SettingsIcon size={18} /> Settings
          </button>
          <button 
            onClick={handleOpenSecurity}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-primary/20 cursor-pointer"
          >
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
          <button className="mt-4 w-full py-2 text-sm font-medium text-white/60 hover:text-white transition-colors cursor-pointer">
            View All Incident Logs
          </button>
        </div>
      </div>

      {/* Heatmap & Store Overview Panel Grid (Conditional Layout based on settings) */}
      {(settings.showHeatmap || settings.showHourlyConversion) && (
        <div className={`grid grid-cols-1 ${settings.showHeatmap && settings.showHourlyConversion ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-6`}>
          {settings.showHeatmap && (
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
          )}
          
          {settings.showHourlyConversion && (
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
          )}
        </div>
      )}

      {/* --- Settings Modal --- */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass-card w-full max-w-lg rounded-2xl border border-white/10 p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <SettingsIcon size={20} className="text-primary" /> System Settings
            </h2>
            <div className="space-y-6">
              {/* Theme Settings */}
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Interface Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['dark', 'light', 'system'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTempSettings({ ...tempSettings, theme: t })}
                      className={`py-2 px-3 rounded-lg border text-sm capitalize flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        tempSettings.theme === t 
                          ? 'bg-primary/20 border-primary text-white font-medium shadow-md shadow-primary/10' 
                          : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {t === 'dark' && <Moon size={14} />}
                      {t === 'light' && <Sun size={14} />}
                      {t === 'system' && <Laptop size={14} />}
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Refresh Interval */}
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Refresh Interval</label>
                <select
                  value={tempSettings.refreshInterval}
                  onChange={(e) => setTempSettings({ ...tempSettings, refreshInterval: Number(e.target.value) })}
                  className="w-full bg-neutral-900/60 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors cursor-pointer"
                >
                  <option className="bg-neutral-900" value={5}>5 seconds (Fast)</option>
                  <option className="bg-neutral-900" value={10}>10 seconds (Standard)</option>
                  <option className="bg-neutral-900" value={30}>30 seconds (Eco)</option>
                  <option className="bg-neutral-900" value={60}>1 minute (Low Data)</option>
                </select>
              </div>

              {/* Notification Toggles */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground block mb-1">Notifications</label>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Enable Live Alerts</div>
                    <div className="text-xs text-muted-foreground font-light">Get notified on anomaly detection</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={tempSettings.enableAlerts}
                    onChange={(e) => setTempSettings({ ...tempSettings, enableAlerts: e.target.checked })}
                    className="w-9 h-5 bg-neutral-800 rounded-full appearance-none checked:bg-primary transition-all relative cursor-pointer before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-transform"
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Sound Notifications</div>
                    <div className="text-xs text-muted-foreground font-light font-light">Play a subtle beep on new alerts</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={tempSettings.enableSound}
                    onChange={(e) => setTempSettings({ ...tempSettings, enableSound: e.target.checked })}
                    className="w-9 h-5 bg-neutral-800 rounded-full appearance-none checked:bg-primary transition-all relative cursor-pointer before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-transform"
                  />
                </div>
              </div>

              {/* Dashboard Layout Preferences */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground block mb-1">Dashboard Preferences</label>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Show Live Heatmap</div>
                    <div className="text-xs text-muted-foreground font-light font-light">Render overhead store heatmap visualizer</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={tempSettings.showHeatmap}
                    onChange={(e) => setTempSettings({ ...tempSettings, showHeatmap: e.target.checked })}
                    className="w-9 h-5 bg-neutral-800 rounded-full appearance-none checked:bg-primary transition-all relative cursor-pointer before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-transform"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Show Hourly Conversion Chart</div>
                    <div className="text-xs text-muted-foreground font-light font-light">Render visual analytics for checkout steps</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={tempSettings.showHourlyConversion}
                    onChange={(e) => setTempSettings({ ...tempSettings, showHourlyConversion: e.target.checked })}
                    className="w-9 h-5 bg-neutral-800 rounded-full appearance-none checked:bg-primary transition-all relative cursor-pointer before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-transform"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="flex-1 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                className="flex-1 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium text-sm transition-colors shadow-lg shadow-primary/20 cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Security Modal --- */}
      {isSecurityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass-card w-full max-w-xl rounded-2xl border border-white/10 p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto scrollbar-thin">
            <button 
              onClick={() => setIsSecurityOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ShieldAlert size={20} className="text-primary" /> Security & Access Control
            </h2>
            
            <form onSubmit={handleSaveSecurity} className="space-y-6">
              {/* Change Password Form */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Lock size={16} /> Change Password
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Current Password */}
                  <div className="relative">
                    <label className="text-xs text-muted-foreground block mb-1">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 pr-9 text-xs focus:outline-none focus:border-primary transition-colors text-white"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 cursor-pointer"
                      >
                        {showPasswords.current ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                  
                  {/* New Password */}
                  <div className="relative">
                    <label className="text-xs text-muted-foreground block mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 pr-9 text-xs focus:outline-none focus:border-primary transition-colors text-white"
                        placeholder="Min 6 chars"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 cursor-pointer"
                      >
                        {showPasswords.new ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                  
                  {/* Confirm Password */}
                  <div className="relative">
                    <label className="text-xs text-muted-foreground block mb-1">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 pr-9 text-xs focus:outline-none focus:border-primary transition-colors text-white"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 cursor-pointer"
                      >
                        {showPasswords.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-white/5" />

              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium flex items-center gap-2">
                    <Smartphone size={16} className="text-primary" /> Two-Factor Authentication (2FA)
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${twoFactor ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/10 text-white/40'}`}>
                      {twoFactor ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground font-light">Secure your account with an extra verification code at login</div>
                </div>
                <input
                  type="checkbox"
                  checked={twoFactor}
                  onChange={(e) => setTwoFactor(e.target.checked)}
                  className="w-9 h-5 bg-neutral-800 rounded-full appearance-none checked:bg-primary transition-all relative cursor-pointer before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-transform"
                />
              </div>

              <hr className="border-white/5" />

              {/* Active Sessions */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Users2 size={16} /> Active Sessions
                </h3>
                <div className="space-y-2">
                  {sessions.map(session => (
                    <div key={session.id} className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5 text-sm">
                      <div className="space-y-0.5">
                        <div className="font-medium flex items-center gap-2">
                          {session.device}
                          {session.isCurrent && <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-1 rounded-sm">Current</span>}
                        </div>
                        <div className="text-xs text-muted-foreground font-light">{session.location}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{session.status}</span>
                        {!session.isCurrent && (
                          <button
                            type="button"
                            onClick={() => handleRevokeSession(session.id)}
                            className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <LogOut size={12} /> Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-white/5" />

              {/* Login History */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Activity size={16} /> Login History (Last 3 Attempts)
                </h3>
                <div className="overflow-x-auto border border-white/5 rounded-lg">
                  <table className="w-full text-left text-xs bg-black/10">
                    <thead>
                      <tr className="text-white/40 border-b border-white/5 bg-white/5">
                        <th className="p-3">Status</th>
                        <th className="p-3">Device</th>
                        <th className="p-3">IP Address</th>
                        <th className="p-3">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-white/80">
                      {loginHistory.map(history => (
                        <tr key={history.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3">
                            <span className={`px-1.5 py-0.5 rounded-sm font-semibold ${history.status === 'Success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                              {history.status}
                            </span>
                          </td>
                          <td className="p-3">{history.device}</td>
                          <td className="p-3 font-mono text-white/60">{history.ip}</td>
                          <td className="p-3 text-white/50">{history.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-8 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSecurityOpen(false)}
                  className="flex-1 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium text-sm transition-colors shadow-lg shadow-primary/20 cursor-pointer"
                >
                  Save Preferences
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Floating Toast Notification --- */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 py-3 px-4 rounded-xl border shadow-lg bg-neutral-900/90 text-white animate-in slide-in-from-bottom-4 duration-300 border-white/10 backdrop-blur-md">
          {toast.type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-400" />
          ) : (
            <AlertCircle size={18} className="text-red-400" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
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
