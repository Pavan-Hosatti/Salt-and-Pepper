import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  Briefcase, DollarSign, Clock, Users, Star, MessageSquare,
  FileText, Zap, TrendingUp, Search, Filter, Plus, MapPin,
  CheckCircle, AlertCircle, Activity, Leaf, Tractor, ArrowRight,
  BarChart3, Settings, ShieldCheck, Box, BrainCircuit
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MainLayout = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="flex h-screen bg-[#030712] text-white overflow-hidden selection:bg-emerald-500/30">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="w-64 border-r border-white/10 bg-white/[0.02] backdrop-blur-3xl flex flex-col pt-24 pb-8 px-4 z-20 hidden md:flex"
      >
        <div className="px-4 mb-8">
          <p className="text-xs font-bold tracking-widest text-emerald-500 uppercase mb-1">Command Center</p>
          <h2 className="text-2xl font-black text-white">Dashboard</h2>
        </div>
        
        <nav className="flex-1 space-y-2">
          {[
            { id: 'overview', icon: Activity, label: 'Overview' },
            { id: 'crops', icon: Leaf, label: 'My Harvests' },
            { id: 'bids', icon: DollarSign, label: 'Live Bids' },
            { id: 'agreements', icon: ShieldCheck, label: 'Contracts' },
            { id: 'analytics', icon: BarChart3, label: 'Analytics' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                activeTab === item.id 
                  ? 'bg-emerald-500/10 text-emerald-400 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)] border border-emerald-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-emerald-400' : 'text-gray-500'}`} />
              {item.label}
              {activeTab === item.id && (
                <motion.div layoutId="activeInd" className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/5 relative overflow-hidden">
          <div className="absolute top-[-20px] right-[-20px] w-20 h-20 bg-emerald-500/20 blur-xl rounded-full" />
          <p className="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-2"><Zap className="w-3 h-3" /> Pro Active</p>
          <p className="text-sm text-gray-300 font-medium leading-tight">Your crops are automatically graded by AI.</p>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pt-24 pb-12 px-6 lg:px-12 relative z-10 w-full overflow-x-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-[-10%] right-[10%] w-[30%] h-[30%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[130px] rounded-full pointer-events-none" />
        
        {children}
      </main>
    </div>
  );
};

const StatCard = ({ title, value, detail, icon: Icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="relative group p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700`} />
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div>
        <p className="text-gray-400 font-medium text-sm mb-1">{title}</p>
        <h3 className="text-3xl font-black text-white">{value}</h3>
      </div>
      <div className={`w-12 h-12 rounded-xl bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center text-${color}-400`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    <div className="flex items-center gap-2 relative z-10">
      <TrendingUp className={`w-4 h-4 text-${color}-400`} />
      <span className={`text-${color}-400 text-sm font-bold`}>{detail}</span>
      <span className="text-gray-500 text-sm ml-1">vs last month</span>
    </div>
  </motion.div>
);

const revenueData = [
  { name: 'Week 1', total: 12000, bids: 4 },
  { name: 'Week 2', total: 18000, bids: 7 },
  { name: 'Week 3', total: 15000, bids: 5 },
  { name: 'Week 4', total: 24000, bids: 12 },
  { name: 'Week 5', total: 29000, bids: 15 },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [crops, setCrops] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for fresh appearance
  const mockCrops = [
    { _id: 'c1', crop: 'Premium Tomatoes', quantityKg: 500, pricePerKg: 45, location: 'Bangalore Rural', status: 'listed', grade: 'A' },
    { _id: 'c2', crop: 'Organic Potato', quantityKg: 1200, pricePerKg: 28, location: 'Mysore', status: 'bidding', grade: 'A+' }
  ];

  const mockBids = [
    { _id: 'b1', cropName: 'Premium Tomatoes', bidAmount: 48, quantity: 200, buyerName: 'FreshMart Ltd', status: 'pending', timestamp: new Date(Date.now() - 3600000) }
  ];

  useEffect(() => {
    setTimeout(() => {
      setCrops(mockCrops);
      setMyBids(mockBids);
      setIsLoading(false);
    }, 600);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/10 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      
      {/* Mobile nav indicator */}
      <div className="md:hidden flex overflow-x-auto gap-4 mb-8 pb-2 no-scrollbar border-b border-white/10">
        {['overview', 'crops', 'bids', 'analytics'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-4 py-2 font-bold text-sm transition-colors ${activeTab === tab ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-500'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-end mb-10">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} 
            className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2"
          >
            Welcome back, {user?.name || 'Producer'}.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg"
          >
            Your agricultural portfolio is performing <span className="text-emerald-400 font-bold">14% better</span> than market averages.
          </motion.p>
        </div>
        
        <motion.button 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
          onClick={() => navigate('/aigrader')}
          className="hidden md:flex bg-emerald-500 hover:bg-emerald-400 text-[#030712] font-black px-6 py-3 rounded-xl items-center gap-2 transform hover:scale-105 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]"
        >
          <Plus className="w-5 h-5 stroke-[3]" /> List New Harvest
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
            
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <StatCard title="Total Revenue" value="₹98,000" detail="+14.2%" icon={DollarSign} color="emerald" delay={0.1} />
              <StatCard title="Active Listings" value="2" detail="+1" icon={Box} color="blue" delay={0.2} />
              <StatCard title="Live Bids" value="1" detail="New" icon={Activity} color="indigo" delay={0.3} />
              <StatCard title="Blockchain Proofs" value="14" detail="Verified" icon={ShieldCheck} color="cyan" delay={0.4} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
              {/* Revenue Chart */}
              <div className="xl:col-span-2 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">Revenue Projection</h3>
                  <button className="text-sm font-semibold text-emerald-400 hover:text-emerald-300">Detailed Report &rarr;</button>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', color: '#fff' }}
                        itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Action Feed */}
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col">
                <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
                <div className="flex-1 space-y-6">
                  {[
                    { title: "New Bid Received", desc: "FreshMart bid ₹48/kg on Premium Tomatoes", icon: Activity, color: "emerald", time: "1h ago" },
                    { title: "AI Grading Complete", desc: "Organic Potato graded at A+", icon: BrainCircuit, color: "indigo", time: "3h ago" },
                    { title: "Platform Broadcast", desc: "Tomato demand up 12% in Bangalore", icon: TrendingUp, color: "cyan", time: "1d ago" }
                  ].map((act, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className={`p-3 bg-${act.color}-500/10 border border-${act.color}-500/20 rounded-xl text-${act.color}-400 shrink-0`}>
                        <act.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white mb-1">{act.title}</h4>
                        <p className="text-sm text-gray-400 leading-tight">{act.desc}</p>
                        <p className="text-xs text-gray-500 mt-2 font-mono">{act.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-gray-300 transition-colors">
                  View All Activity
                </button>
              </div>
            </div>

          </motion.div>
        )}

        {/* Other tabs omitted for brevity but they should utilize the same UI blocks when built out */}
        {(activeTab === 'crops' || activeTab === 'bids') && (
          <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {crops.map((crop, i) => (
                <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl group hover:border-emerald-500/30 transition-all duration-300">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                      <Leaf className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/5 border border-white/10 text-gray-300">
                      {crop.status}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">{crop.crop}</h3>
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-6 pb-6 border-b border-white/10">
                    <MapPin className="w-4 h-4" /> {crop.location}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">AI Grade</p>
                      <p className="text-2xl font-black text-emerald-400">{crop.grade}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Volume</p>
                      <p className="text-2xl font-black text-white">{crop.quantityKg} kg</p>
                    </div>
                  </div>
                </div>
              ))}
              
              <div 
                onClick={() => navigate('/aigrader')}
                className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 border-dashed backdrop-blur-xl flex flex-col items-center justify-center min-h-[300px] cursor-pointer hover:bg-emerald-500/10 transition-colors group"
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="w-8 h-8 stroke-[3]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Upload Next Harvest</h3>
                <p className="text-emerald-400/70 text-sm">AI Video Grader ready</p>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </MainLayout>
  );
}
