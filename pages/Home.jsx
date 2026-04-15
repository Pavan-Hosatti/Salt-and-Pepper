import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Sprout, BarChart3, Gavel, Truck, DollarSign,
  Play, ArrowRight, Leaf, ShieldCheck, Mic, 
  Globe, TrendingUp, Users, Video, Activity,
  ChevronRight, BrainCircuit, Box, Shield, Zap
} from 'lucide-react';

// Glowing abstract blobs for background
const BackgroundGlow = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/30 blur-[130px] rounded-full mix-blend-screen animate-pulse duration-[8000ms]" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse duration-[10000ms]" />
    <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-cyan-600/20 blur-[100px] rounded-full mix-blend-screen animate-pulse duration-[6000ms]" />
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
  </div>
);

const BentoCard = ({ title, desc, icon: Icon, span, delay, className, colorClass }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: delay }}
    whileHover={{ scale: 1.02 }}
    className={`relative group overflow-hidden rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 p-8 shadow-2xl transition-all ${span} ${className}`}
  >
    {/* Hover Glow */}
    <div className={`absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl bg-gradient-to-r ${colorClass} blur-xl`} />
    
    <div className="relative z-10 h-full flex flex-col">
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorClass} p-[1px] mb-8`}>
        <div className="w-full h-full bg-[#0A0D14] rounded-2xl flex items-center justify-center">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-gray-400 font-medium leading-relaxed flex-grow">{desc}</p>
      
      <div className="mt-8 flex justify-end">
        <ArrowRight className="w-6 h-6 text-white/30 group-hover:text-white transition-colors duration-300 transform group-hover:translate-x-2" />
      </div>
    </div>
  </motion.div>
);

export default function Home() {
  const { t } = useTranslation();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);

  return (
    <div className="min-h-screen bg-[#030712] text-white selection:bg-emerald-500/30 overflow-hidden font-sans">
      <BackgroundGlow />
      
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[95vh] flex items-center pt-24 pb-12 px-6 z-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center w-full">
          
          <motion.div className="relative z-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-semibold tracking-wide text-gray-300">Agricultural OS 2.0 Is Live</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-6xl sm:text-7xl lg:text-[5.5rem] font-black leading-[1.05] tracking-tighter mb-8"
            >
              Farm to Market. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 pb-2 inline-block">
                Rewired by AI.
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl text-gray-400 font-medium leading-relaxed max-w-xl mb-12"
            >
              The premium command center for modern farmers. Autonomous video grading. Real-time competitive bidding. Zero middlemen. Uncompromising security.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-wrap items-center gap-6"
            >
              <Link to="/marketplace" className="group relative px-8 py-4 bg-white text-black font-black text-lg rounded-2xl overflow-hidden shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.6)] transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative z-10 flex items-center gap-2">
                  Launch Marketplace
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
              
              <Link to="/aigrader" className="group px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-xl text-white font-bold text-lg rounded-2xl transition-all duration-300 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                </div>
                Try AI Grader
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero Visual - Floating UI Elements for Hero Section */}
          <motion.div 
            style={{ y }}
            className="hidden lg:block relative h-[600px] w-full"
          >
            {/* Main Center Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotateY: 30 }}
              animate={{ opacity: 1, scale: 1, rotateY: -10 }}
              transition={{ duration: 2, ease: "backOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 p-6 bg-gray-900/40 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl shadow-emerald-500/20"
              style={{ transformPerspective: 1200 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <Sprout className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">Active</div>
              </div>
              <h4 className="text-xl font-bold mb-1">Premium Tomato</h4>
              <p className="text-gray-400 text-sm mb-6">Grade A • 500 KG</p>
              
              <div className="space-y-4">
                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: "85%" }} transition={{ delay: 1, duration: 1.5 }} className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" />
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-gray-400">Current Bid</span>
                  <span className="text-emerald-400">₹45,000</span>
                </div>
              </div>
            </motion.div>

            {/* Orbiting Card 1 */}
            <motion.div 
              initial={{ opacity: 0, x: 100, y: -50 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              animate={{ y: [0, -15, 0] }}
              transition={{ y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
              className="absolute top-20 -right-4 w-64 p-5 bg-[#0a1128]/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-xl"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <span className="font-bold">AI Vision Model</span>
              </div>
              <p className="text-sm text-gray-400 leading-tight">YOLOv8 detected 0 defects. Confidence: 98.4%.</p>
            </motion.div>

            {/* Orbiting Card 2 */}
            <motion.div 
              initial={{ opacity: 0, x: -100, y: 50 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              animate={{ y: [0, 20, 0] }}
              transition={{ y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 } }}
              className="absolute bottom-20 -left-8 w-60 p-5 bg-[#08181a]/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-xl"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="font-bold">Algorand Verified</span>
              </div>
              <p className="text-xs font-mono text-gray-500 break-all">TX: 0x9f5b2...a8c4</p>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* ===== BENTO GRID FEATURES ===== */}
      <section className="relative py-32 px-6 z-10 bg-[#030712]/50 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black mb-6 tracking-tight">
              Powerful tools.<br/> <span className="text-gray-500">Unfair advantage.</span>
            </h2>
            <p className="text-xl text-gray-400">Everything you need to bypass intermediaries, command premium prices, and build a modern agricultural enterprise.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
            <BentoCard 
              span="lg:col-span-2 lg:row-span-2"
              title="Autonomous Video Grading"
              desc="Forget manual inspections. Upload a smartphone video of your harvest. Our custom-trained AI models identify crop types, estimate weight, and assign rigorous quality grades in milliseconds."
              icon={Video}
              delay={0.1}
              colorClass="from-emerald-500 to-green-500"
              className="min-h-[350px] lg:min-h-full"
            />
            
            <BentoCard 
              span="lg:col-span-1"
              title="Real-Time Bidding Arena"
              desc="Instantly list your graded crops to a nationwide network of verified buyers. Watch bids roll in live."
              icon={Activity}
              delay={0.2}
              colorClass="from-cyan-500 to-blue-500"
            />
            
            <BentoCard 
              span="lg:col-span-1"
              title="Blockchain Integrity"
              desc="Every transaction, bid, and smart agreement is permanently etched into the Algorand blockchain."
              icon={Shield}
              delay={0.3}
              colorClass="from-indigo-500 to-purple-500"
            />
            
            <BentoCard 
              span="lg:col-span-1"
              title="Native Voice Engine"
              desc="Speak Kannada directly to the app. Our LLM-powered engine executes complex tasks hands-free."
              icon={Mic}
              delay={0.4}
              colorClass="from-orange-500 to-rose-500"
            />

            <BentoCard 
              span="lg:col-span-2"
              title="Automated Logistics"
              desc="Once a bid is won, the system auto-generates delivery manifests and tracks shipments via GPS."
              icon={Truck}
              delay={0.5}
              colorClass="from-blue-500 to-indigo-600"
              className="sm:col-span-2"
            />
          </div>
        </div>
      </section>

      {/* ===== BOTTOM CTA ===== */}
      <section className="relative py-32 px-6 z-10 border-t border-white/10">
        <div className="max-w-5xl mx-auto p-[1px] rounded-[3rem] bg-gradient-to-b from-white/10 to-transparent">
          <div className="bg-[#050B14] rounded-[3rem] p-16 md:p-24 text-center border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-emerald-500/10 blur-[100px]" />
            
            <h2 className="text-4xl md:text-6xl font-black mb-8 relative z-10 tracking-tight">
              Ready to claim your true worth?
            </h2>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto relative z-10">
              Join thousands of farmers already operating on the most advanced agricultural network.
            </p>
            
            <div className="relative z-10 flex justify-center">
              <Link to="/signup" className="group px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xl rounded-2xl shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-300 flex items-center gap-3">
                Create Free Account
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
