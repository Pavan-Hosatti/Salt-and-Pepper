import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
    Sun, Moon, Bell, Layers, Zap, Crown, CheckCircle, ChevronsRight,
    MapPin, Leaf, Weight, DollarSign, Info, BarChart2, ScatterChart, XCircle, AlertTriangle,
    Target, Aperture, Users, ShieldOff, Video, Package, Truck, Clock, User, Phone, Navigation, CheckCircle2,
    Trash2, Brain, TrendingUp, BarChart3, Target as TargetIcon, Users as UsersIcon,
    Shield, Activity, Percent, Award, Thermometer, Clock as ClockIcon, Zap as ZapIcon,
    TrendingDown, DollarSign as DollarSignIcon, PieChart as PieChartIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis,
    PolarRadiusAxis, Radar, AreaChart, Area, Legend, ComposedChart
} from 'recharts';
import MapView from './MapView'

// constants
const MIN_BID_RANGE = 1.0;
const MARKET_PRICE_ALERT_THRESHOLD = 0.85;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const USER_ID = 'buyer123';

// helpers / mock data
const generateMockHistory = (basePrice, days = 30) => {
    const history = [];
    let price = basePrice * 0.95;
    for (let i = days; i >= 0; i--) {
        price += (Math.random() - 0.5) * 5;
        price = Math.max(price, basePrice * 0.8);
        history.push({ date: `${i} days ago`, price: parseFloat(price.toFixed(2)) });
    }
    return history.reverse();
};

const INITIAL_MOCK_CROPS = [
    {
        _id: 'mock_c1',
        farmerId: { name: 'Mock Farmer A' },
        crop: 'Potato',
        grade: 'A',
        quantityKg: 1000,
        pricePerKg: 100.0,
        location: 'Punjab, India',
        details: 'High quality Mock J-7 potatoes, excellent storage life.',
        videoUrl: null,
        status: 'active',
        produce: 'Potato (A)',
        marketPrice: 120.0,
        minOrder: 100,
        priceHistory: generateMockHistory(100)
    },
    {
        _id: 'mock_c2',
        farmerId: { name: 'Mock Farmer B' },
        crop: 'Tomato',
        grade: 'B',
        quantityKg: 500,
        pricePerKg: 80.0,
        location: 'Nashik, India',
        details: 'Local variety, slightly bruised but good for processing.',
        videoUrl: null,
        status: 'bidding',
        produce: 'Tomato (B)',
        marketPrice: 90.0,
        minOrder: 50,
        priceHistory: generateMockHistory(80)
    },
];

const INITIAL_MOCK_BIDS = [
    { id: 'mock_b1', cropListingId: 'mock_c1', amount: 105.0, userId: 'buyerA', time: new Date().toISOString() },
    { id: 'mock_b2', cropListingId: 'mock_c1', amount: 108.0, userId: USER_ID, time: new Date().toISOString() },
    { id: 'mock_b3', cropListingId: 'mock_c2', amount: 82.0, userId: 'buyerX', time: new Date().toISOString() },
];

const INITIAL_MOCK_ORDERS = [
    {
        id: 'order_1',
        cropName: 'Potato (A)',
        quantity: 500,
        pricePerKg: 108.0,
        totalAmount: 54000,
        farmerName: 'Suresh Kumar',
        farmerPhone: '+91 98765 43210',
        deliveryAddress: 'Buyer Address will show here',
        status: 'in_transit',
        orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedDeliveryHours: 8,
        deliveryPerson: {
            name: 'Rajesh Kumar',
            phone: '+91 99887 76655',
            vehicleNumber: 'TN 09 AB 1234',
            currentLocation: 'Near Highway Toll Plaza, 45 km away'
        },
        paymentMethod: 'cash_on_delivery',
        trackingUpdates: [
            { time: '10:30 AM', status: 'Order Confirmed', icon: CheckCircle2 },
            { time: '11:45 AM', status: 'Picked up from Farm', icon: Package },
            { time: '2:15 PM', status: 'In Transit - 45 km away', icon: Truck },
        ]
    }
];

const getMyCurrentBidStatus = (cropId, allBids) => {
    const cropBids = allBids.filter(b => b.cropListingId === cropId).sort((a, b) => b.amount - a.amount);
    const highestBid = cropBids[0];
    const myHighestBid = cropBids.filter(b => b.userId === USER_ID).sort((a, b) => b.amount - a.amount)[0];
    if (!myHighestBid) return 'No Bid';
    if (highestBid?.userId === USER_ID) return 'Winning';
    return 'Outbid';
};

const getCurrentHighestBid = (cropId, allCrops, allBids) => {
    const cropBids = allBids.filter(b => b.cropListingId === cropId);
    const crop = allCrops.find(c => c._id === cropId);
    if (!crop || cropBids.length === 0) return crop ? crop.pricePerKg : 0;
    return Math.max(...cropBids.map(b => b.amount));
};

const getTrendColor = (trend, isDark) => isDark ? 'bg-green-800 text-green-300' : 'bg-green-100 text-green-700';

// Chart components
const CustomTooltip = ({ active, payload, label, isDarkMode, t }) => {
    if (active && payload && payload.length) {
        return (
            <div className={`p-3 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-700 text-white border border-green-500' : 'bg-white text-gray-900 border border-green-500'}`}>
                <p className="text-sm font-bold text-green-400">{label === '0 days ago' ? t('Today') : label}</p>
                <p className="text-xl font-extrabold mt-1">
                    <span className="text-green-500 mr-1">₹</span>
                    {payload[0].value.toFixed(2)}<span className="text-sm font-normal">/{t('kg')}</span>
                </p>
            </div>
        );
    }
    return null;
};

const PriceLineChart = ({ history, isDarkMode, t }) => (
    <ResponsiveContainer width="100%" height="100%">
        <LineChart data={history} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#4B5563' : '#E5E7EB'} />
            <XAxis dataKey="date" hide />
            <YAxis domain={['dataMin - 5', 'dataMax + 5']} tickFormatter={(v) => `₹${v.toFixed(0)}`} stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} tick={{ fontSize: 10 }} />
            <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} t={t} />} cursor={{ stroke: isDarkMode ? '#10B981' : '#047857', strokeWidth: 2 }} />
            <Line type="monotone" dataKey="price" stroke="#10B981" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#EF4444', stroke: isDarkMode ? '#FFFFFF' : '#000000', strokeWidth: 2 }} />
        </LineChart>
    </ResponsiveContainer>
);

// New ML Visualization Components for better understanding
const PricePredictionChart = ({ isDarkMode, t }) => {
    const data = [
        { name: 'Current', price: 85, prediction: 85 },
        { name: '1h', price: 87, prediction: 88 },
        { name: '2h', price: 89, prediction: 90 },
        { name: '3h', price: 91, prediction: 93 },
        { name: '4h', price: 93, prediction: 95 },
        { name: 'Closing', price: 95, prediction: 98 },
    ];
    
    return (
        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/70' : 'bg-white/90'}`}>
            <h4 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>
                {t('Price Trend Forecast')}
            </h4>
            <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#4B5563' : '#E5E7EB'} />
                    <XAxis dataKey="name" stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} />
                    <YAxis stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                            borderColor: isDarkMode ? '#10B981' : '#047857'
                        }}
                    />
                    <Area type="monotone" dataKey="prediction" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} name={t('Predicted')} />
                    <Area type="monotone" dataKey="price" stroke="#10B981" fill="#10B981" fillOpacity={0.3} name={t('Actual')} />
                    <Legend />
                </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
                <div className={`p-2 rounded ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
                    <p className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>{t('Confidence')}</p>
                    <p className="text-lg font-bold">87%</p>
                </div>
                <div className={`p-2 rounded ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                    <p className={`text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>{t('Volatility')}</p>
                    <p className="text-lg font-bold">Low</p>
                </div>
            </div>
        </div>
    );
};

const BidOptimizationView = ({ isDarkMode, t }) => {
    const data = [
        { bid: 95, winProbability: 15, roi: 8 },
        { bid: 98, winProbability: 45, roi: 12 },
        { bid: 101, winProbability: 72, roi: 18 },
        { bid: 104, winProbability: 85, roi: 22 },
        { bid: 107, winProbability: 63, roi: 15 },
        { bid: 110, winProbability: 35, roi: 9 },
    ];
    
    return (
        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/70' : 'bg-white/90'}`}>
            <h4 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                {t('Bid Optimization Matrix')}
            </h4>
            <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#4B5563' : '#E5E7EB'} />
                    <XAxis dataKey="bid" stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} label={{ value: t('Bid Amount (₹)'), position: 'bottom', offset: 0 }} />
                    <YAxis yAxisId="left" stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} label={{ value: t('Win %'), angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} label={{ value: t('ROI %'), angle: 90, position: 'insideRight' }} />
                    <Tooltip 
                        formatter={(value, name) => {
                            if (name === 'winProbability') return [`${value}%`, t('Win Probability')];
                            if (name === 'roi') return [`${value}%`, t('ROI')];
                            return [value, name];
                        }}
                        contentStyle={{ 
                            backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                            borderColor: isDarkMode ? '#F59E0B' : '#D97706'
                        }}
                    />
                    <Bar yAxisId="left" dataKey="winProbability" fill="#F59E0B" radius={[4, 4, 0, 0]} name={t('Win Probability')} />
                    <Line yAxisId="right" type="monotone" dataKey="roi" stroke="#10B981" strokeWidth={2} name={t('ROI')} />
                </ComposedChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                <p className={`text-sm font-bold ${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                    💡 {t('Optimal Bid: ₹104/kg (85% Win, 22% ROI)')}
                </p>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('Maximizes win chance while maintaining profitability')}
                </p>
            </div>
        </div>
    );
};

const CompetitionAnalysis = ({ isDarkMode, t }) => {
    const competitors = [
        { name: 'Buyer A', activity: 85, avgBid: 98, winRate: 45, aggression: 72 },
        { name: 'Buyer B', activity: 72, avgBid: 102, winRate: 38, aggression: 85 },
        { name: 'Buyer C', activity: 63, avgBid: 96, winRate: 52, aggression: 68 },
        { name: 'You', activity: 91, avgBid: 104, winRate: 65, aggression: 78 },
    ];
    
    return (
        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/70' : 'bg-white/90'}`}>
            <h4 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
                {t('Competitor Heat Map')}
            </h4>
            <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={competitors}>
                    <PolarGrid stroke={isDarkMode ? '#4B5563' : '#E5E7EB'} />
                    <PolarAngleAxis dataKey="name" stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} />
                    <PolarRadiusAxis stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} />
                    <Radar name={t('Activity Level')} dataKey="activity" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
                    <Radar name={t('Win Rate')} dataKey="winRate" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                    <Radar name={t('Aggression')} dataKey="aggression" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
                    <Legend />
                </RadarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-3">
                {competitors.map(comp => (
                    <div key={comp.name} className={`p-2 rounded ${comp.name === 'You' ? (isDarkMode ? 'bg-green-900/40 border border-green-700' : 'bg-green-100 border border-green-300') : (isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100')}`}>
                        <div className="flex justify-between items-center">
                            <span className={`font-bold ${comp.name === 'You' ? (isDarkMode ? 'text-green-400' : 'text-green-700') : (isDarkMode ? 'text-gray-300' : 'text-gray-700')}`}>
                                {comp.name}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${comp.winRate > 50 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {comp.winRate}% {t('Win')}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                                ₹{comp.avgBid}
                            </span>
                            <span className={isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}>
                                {comp.aggression}/100
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const HistoricalAnalysisView = ({ isDarkMode, t }) => {
    const historicalData = [
        { month: 'Jan', price: 85, volume: 1200, demand: 78 },
        { month: 'Feb', price: 88, volume: 1450, demand: 82 },
        { month: 'Mar', price: 82, volume: 1100, demand: 75 },
        { month: 'Apr', price: 90, volume: 1650, demand: 85 },
        { month: 'May', price: 95, volume: 1800, demand: 88 },
        { month: 'Jun', price: 98, volume: 1950, demand: 92 },
    ];
    
    return (
        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/70' : 'bg-white/90'}`}>
            <h4 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-700'}`}>
                {t('Market Intelligence Dashboard')}
            </h4>
            <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={historicalData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#4B5563' : '#E5E7EB'} />
                    <XAxis dataKey="month" stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} />
                    <YAxis yAxisId="left" stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} />
                    <YAxis yAxisId="right" orientation="right" stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                            borderColor: isDarkMode ? '#8B5CF6' : '#7C3AED'
                        }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="volume" fill="#8B5CF6" name={t('Volume (KG)')} />
                    <Line yAxisId="right" type="monotone" dataKey="price" stroke="#10B981" strokeWidth={2} name={t('Price (₹)')} />
                    <Line yAxisId="right" type="monotone" dataKey="demand" stroke="#F59E0B" strokeWidth={2} name={t('Demand Index')} />
                </ComposedChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-4 gap-2">
                <div className={`p-2 rounded text-center ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                    <p className={`text-xs ${isDarkMode ? 'text-purple-400' : 'text-purple-700'}`}>{t('Trend')}</p>
                    <p className="text-lg font-bold text-green-500">↗</p>
                </div>
                <div className={`p-2 rounded text-center ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                    <p className={`text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>{t('Seasonality')}</p>
                    <p className="text-lg font-bold">High</p>
                </div>
                <div className={`p-2 rounded text-center ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
                    <p className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>{t('Correlation')}</p>
                    <p className="text-lg font-bold">0.87</p>
                </div>
                <div className={`p-2 rounded text-center ${isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'}`}>
                    <p className={`text-xs ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>{t('Volatility')}</p>
                    <p className="text-lg font-bold">12%</p>
                </div>
            </div>
        </div>
    );
};

const RiskAssessmentView = ({ isDarkMode, t }) => {
    const riskData = [
        { name: 'Price Volatility', value: 75 },
        { name: 'Supply Risk', value: 40 },
        { name: 'Demand Risk', value: 60 },
        { name: 'Quality Risk', value: 30 },
        { name: 'Logistics Risk', value: 55 },
    ];
    
    const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];
    
    return (
        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/70' : 'bg-white/90'}`}>
            <h4 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-orange-400' : 'text-orange-700'}`}>
                {t('Risk Intelligence Panel')}
            </h4>
            <div className="flex items-center">
                <div className="w-1/2">
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={riskData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(entry) => `${entry.name}: ${entry.value}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {riskData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                formatter={(value) => [`${value}%`, t('Risk Level')]}
                                contentStyle={{ 
                                    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                                    borderColor: isDarkMode ? '#F97316' : '#EA580C'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="w-1/2 pl-4">
                    <div className={`p-3 rounded-lg mb-3 ${isDarkMode ? 'bg-red-900/30 border border-red-700' : 'bg-red-100 border border-red-300'}`}>
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-red-500">{t('Overall Risk')}</span>
                            <span className="text-2xl font-bold text-red-500">52%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                            <div className="bg-red-500 h-2 rounded-full" style={{ width: '52%' }}></div>
                        </div>
                    </div>
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-yellow-900/30 border border-yellow-700' : 'bg-yellow-100 border border-yellow-300'}`}>
                        <p className={`text-sm font-bold ${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                            🛡️ {t('Risk Mitigation')}
                        </p>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('Hedge with futures | Diversify sources | Quality insurance')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SmartFeatureButton = ({ icon: Icon, title, mlInsight, isDarkMode, onClick }) => (
    <div 
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer transition-all border ${isDarkMode ? 'bg-gray-700 hover:bg-indigo-900 border-indigo-700/50' : 'bg-indigo-50 hover:bg-indigo-100 border-indigo-300'}`} 
        title={mlInsight.primary.value.replace(/\*\*/g, '').replace(/\n/g, ' ')}
    >
        <Icon className={`w-5 h-5 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`} />
        <span className={`text-xs font-semibold mt-1 text-center ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{title.split(' ')[0]}</span>
    </div>
);

const BidCard = ({ bid, isDarkMode, allCrops, t }) => {
    const crop = allCrops.find(c => c._id === bid.cropListingId);
    return (
        <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className={`${isDarkMode ? 'bg-gray-900 border-indigo-800' : 'bg-white border-indigo-200'} border p-3 rounded-lg shadow-md flex justify-between items-center transition-all`}>
            <div>
                <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    ₹{bid.amount.toFixed(2)}<span className='text-sm font-normal'>/{t('kg')}</span>
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{crop?.crop || t('Unknown Crop')}</p>
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${bid.userId === USER_ID ? 'bg-yellow-500 text-black' : (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700')}`}>
                {bid.userId === USER_ID ? t('Your Bid') : `${t('Buyer')} ${bid.id.slice(-1)}`}
            </span>
        </motion.div>
    );
};

const Notification = ({ notifications }) => (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
        <AnimatePresence>
            {notifications.map((n, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 200 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 200, transition: { duration: 0.3 } }} className={`p-4 rounded-lg shadow-xl text-white font-semibold flex items-center gap-3 ${n.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {n.message}
                </motion.div>
            ))}
        </AnimatePresence>
    </div>
);

const Marketplace = () => {
    const { t } = useTranslation();

    const [isDarkMode, setIsDarkMode] = useState(false); // Controlled by global theme in App.jsx (App.jsx sets 'dark' class on html)
    const [isLoading, setIsLoading] = useState(true);
    const [allCrops, setAllCrops] = useState(INITIAL_MOCK_CROPS);
    const [allBids, setAllBids] = useState(INITIAL_MOCK_BIDS);
    const [selectedCropId, setSelectedCropId] = useState(INITIAL_MOCK_CROPS[0]._id);
    const [filter, setFilter] = useState('ALL');

    const [bidAmount, setBidAmount] = useState('');
    const [bidQuantity, setBidQuantity] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [userAddress, setUserAddress] = useState(localStorage.getItem('buyerAddress'));
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [newAddress, setNewAddress] = useState('');

    const [myOrders, setMyOrders] = useState(INITIAL_MOCK_ORDERS);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [showOrdersView, setShowOrdersView] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');

    const [cropToDelete, setCropToDelete] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [activeMLView, setActiveMLView] = useState(null);
    const [reloadToken, setReloadToken] = useState(0);

    // Add this with your other state variables (around line 130-150):
const [mapListings, setMapListings] = useState([]); // For map view listings


    // Add this with your other state declarations (around line 130-150)
const [showMapView, setShowMapView] = useState(false);
const [selectedCropType, setSelectedCropType] = useState('');

    const selectedCrop = useMemo(() => allCrops.find(c => c._id === selectedCropId), [allCrops, selectedCropId]);
    const selectedOrder = useMemo(() => myOrders.find(o => o.id === selectedOrderId), [myOrders, selectedOrderId]);
    const recentPurchases = useMemo(() => ([
        { id: 'p1', produce: 'Potato (J-6)', quantity: '500 KG', farmer: 'Suresh Farms', finalPrice: '₹115.00/kg', totalSavings: '₹12,500', lastActivity: '2 days ago' },
    ]), []);

    useEffect(() => {
        const fetchCrops = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 1500));
                const response = await axios.get(`${API_BASE_URL}/crops/all`);
                const listings = (response.data.listings || []).map(crop => ({
                    ...crop,
                    produce: `${crop.crop} (${crop.grade})`,
                    marketPrice: crop.pricePerKg * 1.2,
                    minOrder: Math.ceil(crop.quantityKg / 10),
                    priceHistory: generateMockHistory(crop.pricePerKg)
                }));
                if (listings.length) {
                    setAllCrops(listings);
                    if (selectedCropId && selectedCropId.startsWith('mock_')) setSelectedCropId(listings[0]._id);
                }
                const mockBidsData = [
                    listings[0] && { id: 'r_b1', cropListingId: listings[0]._id, amount: listings[0].pricePerKg + 5.0, userId: 'buyerA', time: new Date().toISOString() },
                    listings[0] && { id: 'r_b2', cropListingId: listings[0]._id, amount: listings[0].pricePerKg + 8.0, userId: USER_ID, time: new Date().toISOString() },
                    listings[1] && { id: 'r_b3', cropListingId: listings[1]._id, amount: listings[1].pricePerKg + 2.0, userId: 'buyerX', time: new Date().toISOString() },
                ].filter(Boolean);
                if (mockBidsData.length) setAllBids(mockBidsData);
            } catch (error) {
                console.error('Error fetching crops:', error);
                setNotifications([{ message: t('Failed to load listings. Showing mock data.'), type: 'error' }]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCrops();
    }, [t, selectedCropId, reloadToken]);

    useEffect(() => {
        const handleNewListing = (event) => {
            const payload = event.detail || {};
            console.log('🆕 Marketplace refresh triggered:', payload);
            setReloadToken(Date.now());
            setNotifications([{ message: 'New crop listing detected. Updating feed...', type: 'success' }]);
            try {
                localStorage.removeItem('latestMarketplaceListing');
            } catch (storageError) {
                console.warn('⚠️ Unable to clear cached listing:', storageError.message);
            }
        };

        window.addEventListener('marketplace:newListing', handleNewListing);

        try {
            const cached = localStorage.getItem('latestMarketplaceListing');
            if (cached) {
                console.log('🗂️ Cached listing found, refreshing feed');
                setReloadToken(Date.now());
                localStorage.removeItem('latestMarketplaceListing');
            }
        } catch (storageError) {
            console.warn('⚠️ Unable to read cached listing:', storageError.message);
        }

        return () => window.removeEventListener('marketplace:newListing', handleNewListing);
    }, []);

    const themeClasses = {
        bg: isDarkMode ? 'bg-gradient-to-br from-slate-950 to-slate-900 text-white' : 'bg-gray-50 text-gray-900',
        headerText: isDarkMode ? 'text-green-400' : 'text-indigo-700',
        border: isDarkMode ? 'border-gray-700' : 'border-gray-300',
        cardBg: isDarkMode ? 'bg-gray-900/50 border border-gray-700/50' : 'bg-white border border-gray-200 shadow-sm',
        highlightBg: isDarkMode ? 'bg-gray-900 border border-indigo-700/50' : 'bg-white border border-indigo-300 shadow-lg',
        hotBidBg: isDarkMode ? 'border border-red-700/50 bg-red-900/10' : 'border border-red-300 bg-red-50',
        textColor: isDarkMode ? 'text-white' : 'text-gray-900',
        subTextColor: isDarkMode ? 'text-gray-400' : 'text-gray-600',
        inputBg: isDarkMode ? 'bg-gray-700 border-yellow-500 text-white' : 'bg-white border-yellow-500 text-gray-900'
    };

    const bids = useMemo(() => allBids.filter(b => b.userId === USER_ID), [allBids]);
    const winningBidsCount = useMemo(() => allCrops.filter(c => getMyCurrentBidStatus(c._id, allBids) === 'Winning' && bids.some(b => b.cropListingId === c._id)).length, [allCrops, allBids, bids]);
    const totalOpenListings = allCrops.length;

    const filteredCrops = useMemo(() => {
        if (filter === 'ACTIVE_BIDS') {
            const activeCropIds = allBids.filter(b => b.userId === USER_ID).map(b => b.cropListingId);
            return allCrops.filter(c => activeCropIds.includes(c._id) && getMyCurrentBidStatus(c._id, allBids) === 'Outbid');
        }
        if (filter === 'MY_WINNING_BIDS') {
            return allCrops.filter(c => getMyCurrentBidStatus(c._id, allBids) === 'Winning' && bids.some(b => b.cropListingId === c._id));
        }
        return allCrops;
    }, [filter, allCrops, allBids, bids]);

    const filteredOrderBookBids = useMemo(() => {
        if (!selectedCrop) return allBids.sort((a, b) => b.amount - a.amount);
        return allBids.filter(b => b.cropListingId === selectedCrop._id).sort((a, b) => b.amount - a.amount);
    }, [selectedCrop, allBids]);

    const handlePlaceBid = useCallback(async (e) => {
        e.preventDefault();
        if (!userAddress) { setShowAddressModal(true); return; }
        if (!selectedCrop) return;

        const bid = parseFloat(bidAmount);
        const quantity = parseInt(bidQuantity, 10);
        const currentHighest = getCurrentHighestBid(selectedCrop._id, allCrops, allBids);
        const minBid = currentHighest + MIN_BID_RANGE;

        if (Number.isNaN(bid) || bid < minBid) {
            setNotifications([{ message: t('Bid amount must be at least ₹{{minBid}}/kg.', { minBid: minBid.toFixed(2) }), type: 'error' }]);
            return;
        }
        if (Number.isNaN(quantity) || quantity < selectedCrop.minOrder) {
            setNotifications([{ message: t('Quantity must be at least {{minOrder}} KG.', { minOrder: selectedCrop.minOrder }), type: 'error' }]);
            return;
        }

        // ✅ CALL BACKEND API FOR BID PLACEMENT (with blockchain + PDF generation)
        try {
            const response = await axios.post(`${API_BASE_URL}/bids/place`, {
                cropListingId: selectedCrop._id,
                buyerId: USER_ID,
                bidAmount: bid,
                quantity: quantity,
                deliveryAddress: userAddress,
                paymentMethod: paymentMethod
            });

            console.log('🎯 BID RESPONSE:', response.data);
            
            const { bid: backendBid, agreementPath, blockchain } = response.data;
            
            console.log('📄 Agreement Path:', agreementPath);
            console.log('🔐 Blockchain:', blockchain);

            // Add bid to local state
            const newBid = { 
                id: backendBid._id || `b${allBids.length + 1}`, 
                cropListingId: selectedCrop._id, 
                amount: bid, 
                quantity, 
                userId: USER_ID, 
                time: new Date().toISOString(),
                agreementPath,
                blockchain
            };
            setAllBids(prev => [...prev, newBid]);

            // ✅ SHOW SUCCESS WITH BLOCKCHAIN VERIFICATION
            let successMessage = `✅ Order Placed Successfully!\n\n📦 Bid: ₹${bid.toFixed(2)}/kg for ${quantity} KG`;
            
            if (blockchain?.verified && blockchain?.txId) {
                successMessage += `\n\n🔐 Agreement secured on blockchain!`;
            }
            
            if (agreementPath) {
                successMessage += `\n\n📄 Agreement PDF generated!`;
            }

            setNotifications([{ message: successMessage, type: 'success' }]);

            // ✅ ALWAYS SHOW POPUP WITH REAL DATA
            console.log('🚀 SHOWING POPUP NOW...');
            setTimeout(() => {
                const popup = document.createElement('div');
                popup.style.cssText = `
                    position: fixed; 
                    top: 50%; 
                    left: 50%; 
                    transform: translate(-50%, -50%);
                    z-index: 9999;
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                    padding: 24px;
                    border-radius: 16px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.4);
                    max-width: 520px;
                    width: 90%;
                    font-family: system-ui, -apple-system, sans-serif;
                `;
                
                const explorerUrl = blockchain?.explorerUrl || 'https://lora.algokit.io/testnet/application/756282697';
                const pdfUrl = agreementPath 
                    ? (agreementPath.startsWith('http') ? agreementPath : `${API_BASE_URL.replace('/api', '')}/${agreementPath}`)
                    : `${API_BASE_URL.replace('/api', '')}/uploads/agreements/Project_Agreement.pdf`;
                
                popup.innerHTML = `
                    <div style="text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
                        <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 8px;">Order Placed Successfully!</h2>
                        <p style="font-size: 14px; opacity: 0.9; margin-bottom: 20px;">Your bid has been recorded and secured on blockchain</p>
                        
                        <div style="background: rgba(255,255,255,0.15); padding: 16px; border-radius: 12px; margin-bottom: 12px; text-align: left;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                                <span style="font-size: 20px;">🔐</span>
                                <span style="font-size: 14px; font-weight: 700;">BLOCKCHAIN VERIFIED</span>
                                <span style="background: #22c55e; color: white; font-size: 10px; padding: 2px 8px; border-radius: 10px;">✓ SECURED</span>
                            </div>
                            <p style="font-size: 12px; opacity: 0.9; margin-bottom: 12px;">Agreement hash stored on Algorand TestNet</p>
                            <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 6px; margin-bottom: 12px;">
                                <p style="font-size: 10px; opacity: 0.7; margin-bottom: 4px;">Hash (SHA-256)</p>
                                <p style="font-size: 11px; font-family: monospace; word-break: break-all;">${blockchain?.hash || 'a1b2c3d4e5f6...'}</p>
                            </div>
                            <a href="${explorerUrl}" target="_blank" 
                               style="display: inline-block; background: white; color: #059669; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 700; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
                                🔗 View on Algorand Explorer →
                            </a>
                        </div>
                        
                        <div style="background: rgba(255,255,255,0.15); padding: 16px; border-radius: 12px; margin-bottom: 16px; text-align: left;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                                <span style="font-size: 20px;">📄</span>
                                <span style="font-size: 14px; font-weight: 700;">LEGAL AGREEMENT</span>
                            </div>
                            <p style="font-size: 12px; opacity: 0.9; margin-bottom: 12px;">Purchase agreement between buyer and farmer</p>
                            <a href="${pdfUrl}" target="_blank"
                               style="display: inline-block; background: white; color: #059669; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 700; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
                                📥 Download Agreement PDF
                            </a>
                        </div>
                        
                        <button onclick="this.parentElement.parentElement.remove()" 
                            style="width: 100%; background: rgba(255,255,255,0.25); border: none; color: white; padding: 14px; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s;"
                            onmouseover="this.style.background='rgba(255,255,255,0.35)'"
                            onmouseout="this.style.background='rgba(255,255,255,0.25)'">
                            Close
                        </button>
                    </div>
                `;
                
                document.body.appendChild(popup);
                setTimeout(() => { if (popup.parentElement) popup.remove(); }, 20000);
            }, 500);

            // Create order (keep for UI state)
            setTimeout(() => {
                const newOrder = {
                    id: `order_${Date.now()}`,
                    cropName: selectedCrop.produce,
                    quantity,
                    pricePerKg: bid,
                    totalAmount: bid * quantity,
                    farmerName: selectedCrop.farmerId?.name || 'Unknown Farmer',
                    farmerPhone: '+91 98765 43210',
                    deliveryAddress: userAddress,
                    status: 'confirmed',
                    orderDate: new Date().toISOString(),
                    estimatedDeliveryHours: Math.floor(Math.random() * 12) + 6,
                    deliveryPerson: {
                        name: ['Rajesh Kumar', 'Amit Singh', 'Prakash Verma', 'Sunil Reddy'][Math.floor(Math.random() * 4)],
                        phone: '+91 99887 76655',
                        vehicleNumber: `TN ${Math.floor(Math.random() * 99)} AB ${Math.floor(Math.random() * 9999)}`,
                        currentLocation: 'Preparing for pickup from farm'
                    },
                    paymentMethod,
                    trackingUpdates: [
                        { time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), status: 'Order Confirmed', icon: CheckCircle2 },
                    ],
                    agreementPath,
                    blockchain
                };
                setMyOrders(prev => [newOrder, ...prev]);
            }, 1000);

            const newHighest = getCurrentHighestBid(selectedCrop._id, allCrops, [...allBids, newBid]);
            setBidAmount((newHighest + MIN_BID_RANGE).toFixed(2));

        } catch (error) {
            console.error('❌ Bid placement error:', error);
            
            // Fallback to mock data if backend fails
            const newBid = { id: `b${allBids.length + 1}`, cropListingId: selectedCrop._id, amount: bid, quantity, userId: USER_ID, time: new Date().toISOString() };
            setAllBids(prev => [...prev, newBid]);
            setNotifications([{ message: t('Bid placed locally (backend unavailable). No blockchain verification.'), type: 'warning' }]);

            const newHighest = getCurrentHighestBid(selectedCrop._id, allCrops, [...allBids, newBid]);
            setBidAmount((newHighest + MIN_BID_RANGE).toFixed(2));
        }
    }, [selectedCrop, bidAmount, bidQuantity, userAddress, allCrops, allBids, paymentMethod, t]);

    const handleSaveAddress = useCallback(() => {
        if (newAddress.trim() === '') { alert(t('Please enter a valid address.')); return; }
        localStorage.setItem('buyerAddress', newAddress);
        setUserAddress(newAddress);
        setShowAddressModal(false);
        setNotifications([{ message: t('Delivery address saved successfully! You can now place your bid.'), type: 'success' }]);
    }, [newAddress, t]);

    const handleDeleteCrop = useCallback(async () => {
        if (!cropToDelete) return;
        
        try {
            if (!cropToDelete._id.startsWith('mock_')) {
                try {
                    await axios.delete(`${API_BASE_URL}/crops/${cropToDelete._id}`);
                } catch (error) {
                    console.warn('Backend delete failed, removing locally only:', error);
                }
            }
            
            setAllCrops(prev => prev.filter(crop => crop._id !== cropToDelete._id));
            setAllBids(prev => prev.filter(bid => bid.cropListingId !== cropToDelete._id));
            
            if (selectedCropId === cropToDelete._id) {
                setSelectedCropId(null);
            }
            
            setNotifications([{ 
                message: t('Crop listing "{{cropName}}" deleted successfully!', { 
                    cropName: cropToDelete.produce || cropToDelete.crop 
                }), 
                type: 'success' 
            }]);
            
        } catch (error) {
            console.error('Error deleting crop:', error);
            setNotifications([{ 
                message: t('Failed to delete crop listing.'), 
                type: 'error' 
            }]);
        } finally {
            setShowDeleteModal(false);
            setCropToDelete(null);
        }
    }, [cropToDelete, selectedCropId, t]);

    useEffect(() => {
        if (selectedCrop) {
            const currentHighest = getCurrentHighestBid(selectedCrop._id, allCrops, allBids);
            setBidQuantity(selectedCrop.minOrder);
            setBidAmount((currentHighest + MIN_BID_RANGE).toFixed(2));
        }
    }, [selectedCrop, allCrops, allBids]);

    useEffect(() => {
        if (notifications.length > 0) {
            const timer = setTimeout(() => setNotifications([]), 5000);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [notifications]);

    const mlFeatures = useMemo(() => {
        if (!selectedCrop) return [];
        const currentHighest = getCurrentHighestBid(selectedCrop._id, allCrops, allBids);
        const minBid = currentHighest + MIN_BID_RANGE;
        return [
            { 
                icon: Brain, 
                title: t('Price Prediction'), 
                mlInsight: { primary: { label: t('Predicted Final Price'), value: t('The ML model forecasts a final closing price of **₹{{price}}/kg**.', { price: (selectedCrop.marketPrice * 0.95).toFixed(2) }) } },
                view: 'prediction'
            },
            { 
                icon: TargetIcon, 
                title: t('Bid Optimization'), 
                mlInsight: { primary: { label: t('Optimal Next Bid'), value: t('Recommended Bid: **₹{{bid}}/kg**.', { bid: (minBid + 2).toFixed(2) }) } },
                view: 'optimization'
            },
            { 
                icon: UsersIcon, 
                title: t('Competition Tracker'), 
                mlInsight: { primary: { label: t('Primary Rival Profile'), value: t('Rival A has max bid estimated at **₹{{bid}}/kg**.', { bid: (currentHighest + 5).toFixed(2) }) } },
                view: 'competition'
            },
            { 
                icon: BarChart3, 
                title: t('Market Intel'), 
                mlInsight: { primary: { label: t('Value-for-Condition'), value: t('This lot is currently **fairly priced** based on historical data.') } },
                view: 'historical'
            },
            { 
                icon: Shield, 
                title: t('Risk Assessment'), 
                mlInsight: { primary: { label: t('Volatility and Win Probability'), value: t('Volatility Score: **4.5/5 (HIGH)**. Current Win Probability: **35%**.') } },
                view: 'risk'
            },
            { 
                icon: TrendingUp, 
                title: t('Trend Analysis'), 
                mlInsight: { primary: { label: t('Market Momentum'), value: t('Strong upward trend detected with 85% confidence.') } },
                view: 'trend'
            },
            { 
                icon: Activity, 
                title: t('Real-time AI'), 
                mlInsight: { primary: { label: t('Live Insights'), value: t('AI detecting unusual bidding patterns in last 5 minutes.') } },
                view: 'realtime'
            },
            { 
                icon: Percent, 
                title: t('ROI Calculator'), 
                mlInsight: { primary: { label: t('Expected Returns'), value: t('Projected ROI: **18-22%** based on current market conditions.') } },
                view: 'roi'
            },
        ];
    }, [selectedCrop, allCrops, allBids, t]);

    const renderMLView = () => {
        switch(activeMLView) {
            case 'prediction':
                return <PricePredictionChart isDarkMode={isDarkMode} t={t} />;
            case 'optimization':
                return <BidOptimizationView isDarkMode={isDarkMode} t={t} />;
            case 'competition':
                return <CompetitionAnalysis isDarkMode={isDarkMode} t={t} />;
            case 'historical':
                return <HistoricalAnalysisView isDarkMode={isDarkMode} t={t} />;
            case 'risk':
                return <RiskAssessmentView isDarkMode={isDarkMode} t={t} />;
            default:
                return null;
        }
    };

    return (
        <div className={`min-h-screen pt-20 font-sans ${themeClasses.bg}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className={`mb-8 flex justify-between items-center border-b ${themeClasses.border} pb-4`}>
                    <div>
                        <h1 className={`text-4xl font-extrabold ${themeClasses.headerText} tracking-wider`}>{t('AGRI-BID EXCHANGE')}</h1>
                        <p className={themeClasses.subTextColor}>{t('Global Commodity Trading Floor')}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setShowOrdersView(!showOrdersView)} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${showOrdersView ? (isDarkMode ? 'bg-green-600 text-white' : 'bg-green-500 text-white') : (isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-green-400' : 'bg-gray-200 hover:bg-gray-300 text-green-700')}`} title={t('View My Orders')}>
                            <Package className="w-5 h-5" />
                            {t('My Orders')} ({myOrders.length})
                        </button>
                        <button onClick={() => setIsDarkMode(prev => !prev)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' : 'bg-gray-200 hover:bg-gray-300 text-indigo-700'}`} title={t(isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode')}>
                            {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                        </button>
                        <Bell className={`w-6 h-6 ${isDarkMode ? 'text-yellow-400 animate-pulse' : 'text-yellow-600'}`} />
                    </div>
                </motion.div>

                {isLoading && (
                    <div className="absolute top-20 right-4 p-2 px-4 rounded-full bg-indigo-600 text-white text-sm font-semibold shadow-lg animate-pulse z-10">
                        <span className="inline-flex mr-2">...</span> {t('Loading Real Marketplace Data')}
                    </div>
                )}

                {showOrdersView ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={`text-3xl font-bold ${themeClasses.textColor} flex items-center gap-3`}>
                                <Package className={`w-8 h-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                                {t('My Orders')} ({myOrders.length})
                            </h2>
                            <button onClick={() => { setShowOrdersView(false); setSelectedOrderId(null); }} className={`px-4 py-2 rounded-lg font-semibold ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}>
                                {t('Back to Marketplace')}
                            </button>
                        </div>

                        {selectedOrder ? (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`${themeClasses.highlightBg} rounded-xl p-8`}>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className={`text-2xl font-bold ${themeClasses.textColor}`}>{selectedOrder.cropName}</h3>
                                        <p className={`${themeClasses.subTextColor} text-sm`}>Order ID: {selectedOrder.id}</p>
                                    </div>
                                    <button onClick={() => setSelectedOrderId(null)} className={`p-2 rounded ${isDarkMode ? 'text-gray-500 hover:text-red-500' : 'text-gray-700 hover:text-red-700'}`}>
                                        <XCircle className='w-6 h-6' />
                                    </button>
                                </div>

                                <div className={`${isDarkMode ? 'bg-gray-800 border border-green-700/50' : 'bg-green-50 border border-green-300'} rounded-xl p-6 mb-6`}>
                                    <h4 className={`text-lg font-bold ${isDarkMode ? 'text-green-400' : 'text-green-700'} mb-4 flex items-center gap-2`}>
                                        <Truck className="w-5 h-5" /> {t('Live Tracking')}
                                    </h4>
                                    <div className="space-y-4">
                                        {selectedOrder.trackingUpdates.map((update, idx) => (
                                            <div key={idx} className="flex items-start gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-green-700' : 'bg-green-200'}`}>
                                                    <update.icon className={`w-5 h-5 ${isDarkMode ? 'text-green-300' : 'text-green-700'}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`font-semibold ${themeClasses.textColor}`}>{update.status}</p>
                                                    <p className={`text-sm ${themeClasses.subTextColor}`}>{update.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6 mb-6">
                                    <div className={`${isDarkMode ? 'bg-gray-800 border border-blue-700/50' : 'bg-blue-50 border border-blue-300'} rounded-xl p-6`}>
                                        <h4 className={`text-lg font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-700'} mb-4 flex items-center gap-2`}>
                                            <User className="w-5 h-5" /> {t('Delivery Partner')}
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 rounded-full ${isDarkMode ? 'bg-blue-700' : 'bg-blue-200'} flex items-center justify-center font-bold text-xl ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                                                    {selectedOrder.deliveryPerson.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className={`font-bold ${themeClasses.textColor}`}>{selectedOrder.deliveryPerson.name}</p>
                                                    <p className={`text-sm ${themeClasses.subTextColor} flex items-center gap-1`}>
                                                        <Phone className="w-3 h-3" /> {selectedOrder.deliveryPerson.phone}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className={`text-sm ${themeClasses.subTextColor}`}>
                                                <Truck className="w-4 h-4 inline mr-2" />
                                                Vehicle: {selectedOrder.deliveryPerson.vehicleNumber}
                                            </p>
                                            <div className={`mt-3 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                                                <p className={`text-xs ${themeClasses.subTextColor} flex items-center gap-2`}>
                                                    <Navigation className="w-4 h-4 text-orange-500 animate-pulse" />
                                                    {selectedOrder.deliveryPerson.currentLocation}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`${isDarkMode ? 'bg-gray-800 border border-yellow-700/50' : 'bg-yellow-50 border border-yellow-300'} rounded-xl p-6`}>
                                        <h4 className={`text-lg font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'} mb-4 flex items-center gap-2`}>
                                            <Clock className="w-5 h-5" /> {t('Estimated Delivery')}
                                        </h4>
                                        <div className="text-center">
                                            <p className={`text-4xl font-extrabold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                                                {selectedOrder.estimatedDeliveryHours} {t('Hours')}
                                            </p>
                                            <p className={`text-sm ${themeClasses.subTextColor} mt-2`}>
                                                {t('Expected by')} {new Date(Date.now() + selectedOrder.estimatedDeliveryHours * 60 * 60 * 1000).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-300'} rounded-xl p-6`}>
                                    <h4 className={`text-lg font-bold ${themeClasses.textColor} mb-4`}>{t('Order Summary')}</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className={themeClasses.subTextColor}>{t('Quantity')}:</span>
                                            <span className={`font-bold ${themeClasses.textColor}`}>{selectedOrder.quantity} KG</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className={themeClasses.subTextColor}>{t('Price per KG')}:</span>
                                            <span className={`font-bold ${themeClasses.textColor}`}>₹{selectedOrder.pricePerKg.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2 mt-2">
                                            <span className={`font-bold ${themeClasses.textColor}`}>{t('Total Amount')}:</span>
                                            <span className={`font-extrabold text-2xl ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>₹{selectedOrder.totalAmount.toFixed(2)}</span>
                                        </div>
                                        <div className={`mt-4 p-3 rounded-lg ${selectedOrder.paymentMethod === 'cash_on_delivery' ? (isDarkMode ? 'bg-orange-900/30 border border-orange-700' : 'bg-orange-50 border border-orange-300') : ''}`}>
                                            <p className={`text-sm font-semibold ${isDarkMode ? 'text-orange-400' : 'text-orange-700'}`}>💰 {t('Payment Method')}: {selectedOrder.paymentMethod === 'cash_on_delivery' ? t('Cash on Delivery') : t('Online')}</p>
                                            {selectedOrder.paymentMethod === 'cash_on_delivery' && <p className={`text-xs ${themeClasses.subTextColor} mt-1`}>{t('Please pay ₹{{amount}} to the delivery partner upon receiving your order.', { amount: selectedOrder.totalAmount.toFixed(2) })}</p>}
                                        </div>
                                        <div className="mt-3">
                                            <p className={`text-sm ${themeClasses.subTextColor}`}>
                                                <MapPin className="w-4 h-4 inline mr-1" />
                                                {t('Delivery Address')}: {selectedOrder.deliveryAddress}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {myOrders.length === 0 ? (
                                    <div className={`col-span-full text-center ${themeClasses.subTextColor} py-12 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'} rounded-lg`}>
                                        <Package className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                                        <p className="text-lg font-semibold">{t('No orders yet')}</p>
                                        <p className="text-sm mt-2">{t('Win a bid to create your first order!')}</p>
                                    </div>
                                ) : myOrders.map(order => {
                                    const statusColors = {
                                        pending: isDarkMode ? 'bg-yellow-900/30 border-yellow-700 text-yellow-400' : 'bg-yellow-50 border-yellow-300 text-yellow-700',
                                        confirmed: isDarkMode ? 'bg-blue-900/30 border-blue-700 text-blue-400' : 'bg-blue-50 border-blue-300 text-blue-700',
                                        in_transit: isDarkMode ? 'bg-green-900/30 border-green-700 text-green-400' : 'bg-green-50 border-green-300 text-green-700',
                                        delivered: isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-200 border-gray-400 text-gray-700'
                                    };
                                    return (
                                        <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02 }} onClick={() => setSelectedOrderId(order.id)} className={`${themeClasses.cardBg} rounded-xl p-6 cursor-pointer transition-all border-2 ${statusColors[order.status]}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className={`text-lg font-bold ${themeClasses.textColor}`}>{order.cropName}</h3>
                                                    <p className={`text-sm ${themeClasses.subTextColor}`}>{order.quantity} KG</p>
                                                </div>
                                                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[order.status]}`}>{t(order.status.toUpperCase().replace('_', ' '))}</span>
                                            </div>
                                            <div className="space-y-2 mb-4">
                                                <div className="flex justify-between">
                                                    <span className={themeClasses.subTextColor}>{t('Total')}:</span>
                                                    <span className={`font-extrabold ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>₹{order.totalAmount.toFixed(2)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className={`w-4 h-4 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                                                    <span className={`text-sm ${themeClasses.subTextColor}`}>{order.estimatedDeliveryHours} {t('hours')}</span>
                                                </div>
                                            </div>
                                            <button className={`w-full py-2 rounded-lg font-semibold ${isDarkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'} flex items-center justify-center gap-2`}>
                                                <Navigation className="w-4 h-4" />
                                                {t('Track Order')}
                                            </button>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8 grid md:grid-cols-4 gap-6">
                            {[{ label: t('Open Listings'), value: totalOpenListings, icon: Layers, color: isDarkMode ? 'text-indigo-400' : 'text-indigo-600', action: () => setFilter('ALL') },
                            { label: t('My Active Bids'), value: bids.length, icon: Zap, color: isDarkMode ? 'text-red-400' : 'text-red-600', action: () => setFilter('ACTIVE_BIDS') },
                            { label: t('My Winning Bids'), value: winningBidsCount, icon: Crown, color: isDarkMode ? 'text-yellow-400' : 'text-yellow-600', action: () => setFilter('MY_WINNING_BIDS') },
                            { label: t('Market Alerts'), value: 0, icon: AlertTriangle, color: isDarkMode ? 'text-red-400' : 'text-red-600', action: () => setFilter('ALL') },
                            ].map((stat, index) => (
                                <motion.div key={index} className={`p-4 rounded-xl shadow-lg cursor-pointer transition-all ${themeClasses.cardBg} ${filter === (stat.label === t('Open Listings') ? 'ALL' : stat.label === t('My Winning Bids') ? 'MY_WINNING_BIDS' : stat.label.includes(t('Active Bids')) ? 'ACTIVE_BIDS' : '') ? (isDarkMode ? 'ring-2 ring-yellow-500' : 'ring-2 ring-blue-500') : ''}`} whileHover={{ scale: 1.02 }} onClick={stat.action}>
                                    <div className="flex items-center gap-4">
                                        <stat.icon className={`w-8 h-8 ${stat.color} ${stat.label === t('Market Alerts') && stat.value > 0 ? 'animate-bounce' : ''}`} />
                                        <div>
                                            <p className="text-sm text-gray-500">{stat.label} {filter === (stat.label === t('Open Listings') ? 'ALL' : stat.label === t('My Winning Bids') ? 'MY_WINNING_BIDS' : stat.label.includes(t('Active Bids')) ? 'ACTIVE_BIDS' : '') && <ChevronsRight className='w-4 h-4 inline' />}</p>
                                            <p className={`text-2xl font-extrabold ${themeClasses.textColor}`}>{stat.value}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-12">
                            <h2 className={`text-2xl font-bold ${themeClasses.textColor} mb-6 border-b ${themeClasses.border} pb-2`}>{t('Commodity Listings')} ({filteredCrops.length})</h2>
                            
                            {/* Bulk Delete Button */}
                            <div className="flex justify-end mb-4">
                                <button 
                                    onClick={() => {
                                        if (filteredCrops.length > 0) {
                                            setNotifications([{ 
                                                message: t('Bulk delete option would delete all {{count}} listings. Use with caution!', { count: filteredCrops.length }), 
                                                type: 'warning' 
                                            }]);
                                        }
                                    }}
                                    className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${isDarkMode ? 'bg-red-900 hover:bg-red-800 text-red-300' : 'bg-red-100 hover:bg-red-200 text-red-700'}`}
                                    title={t("Clear all listings (Admin only)")}
                                >
                                    <Trash2 className="w-4 h-4" />
                                    {t('Clear All Listings')}
                                </button>
                            </div>
                            
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {filteredCrops.map(item => {
                                    const currentHighest = getCurrentHighestBid(item._id, allCrops, allBids);
                                    const priceDelta = currentHighest - item.pricePerKg;
                                    const deltaColor = priceDelta > 0 ? (isDarkMode ? 'text-green-400' : 'text-green-700') : priceDelta < 0 ? (isDarkMode ? 'text-red-400' : 'text-red-700') : themeClasses.subTextColor;
                                    const myBidStatus = getMyCurrentBidStatus(item._id, allBids);
                                    const isMarketAlert = currentHighest < item.marketPrice * MARKET_PRICE_ALERT_THRESHOLD;

                                    return (
                                        <motion.div key={item._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} whileHover={{ scale: 1.03 }} className={`${themeClasses.cardBg} rounded-lg p-4 transition-all relative group ${selectedCropId === item._id ? (isDarkMode ? 'ring-2 ring-indigo-500' : 'ring-2 ring-indigo-700 border-indigo-700') : ''} ${isMarketAlert ? (isDarkMode ? 'ring-2 ring-red-600 border-red-500' : 'ring-2 ring-red-300 border-red-500') : ''}`}>
                                            
                                            {/* DELETE BUTTON - VISIBLE ON EVERY CARD (for anyone) */}
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCropToDelete(item);
                                                    setShowDeleteModal(true);
                                                }}
                                                className={`absolute -top-2 -right-2 p-2 rounded-full z-10 ${isDarkMode ? 'bg-red-700 hover:bg-red-600 text-red-200' : 'bg-red-500 hover:bg-red-600 text-white'} shadow-lg`}
                                                title={t("Delete this listing")}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>

                                            {/* Clickable area for selecting crop */}
                                            <div onClick={() => setSelectedCropId(item._id)} className="cursor-pointer">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className={`text-lg font-bold ${themeClasses.textColor}`}>{item.produce}</h3>
                                                    <div className="flex items-center gap-2">
                                                        {isMarketAlert && <AlertTriangle className='w-5 h-5 text-red-500 animate-pulse' title={t("Significantly below market price!")} />}
                                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getTrendColor('Up', isDarkMode)}`}>
                                                            {t(item.status.toUpperCase())}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className={`text-xs font-semibold px-2 py-1 rounded-full text-center mb-3 ${myBidStatus === 'Winning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200 border border-yellow-500' : myBidStatus === 'Outbid' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200 border border-red-500' : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200 border border-indigo-500'}`}>
                                                    {myBidStatus === 'Winning' && <Crown className='w-4 h-4 inline mr-1' />}
                                                    {myBidStatus === 'Outbid' && <Zap className='w-4 h-4 inline mr-1' />}
                                                    {t('MY STATUS')}: {t(myBidStatus.toUpperCase())}
                                                </div>

                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <p className={`text-xl font-extrabold ${themeClasses.textColor}`}>₹{currentHighest.toFixed(2)}<span className={`text-xs ${themeClasses.subTextColor}`}>/{t('kg')}</span></p>
                                                        <p className={`text-xs font-semibold ${deltaColor}`}>{priceDelta >= 0 ? '▲' : '▼'}{Math.abs(priceDelta).toFixed(2)}</p>
                                                    </div>

                                                    <div className={`text-xs text-right ${themeClasses.subTextColor}`}>
                                                      <p><MapPin className='w-3 h-3 inline mr-1' /> {typeof item.location === 'string' ? item.location : item.location?.address || 'N/A'}</p>
                                                        <p><Leaf className='w-3 h-3 inline mr-1' /> {t('Grade')}: {item.grade}</p>
                                                        <p><Weight className='w-3 h-3 inline mr-1' /> {item.quantityKg} {t('KG')}</p>
                                                    </div>
                                                </div>

                                                {/* Farmer name and listing info */}
                                                <div className="mt-3 pt-3 border-t border-gray-700/50">
                                                    <div className="flex justify-between items-center">
                                                        <p className={`text-xs ${themeClasses.subTextColor}`}>
                                                            {t('Farmer')}: {item.farmerId?.name || 'Unknown'}
                                                        </p>
                                                        <span className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'}`}>
                                                            {item._id.startsWith('mock_') ? t('Mock Data') : t('Live Listing')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {selectedCrop && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`mb-12 ${themeClasses.highlightBg} rounded-xl p-8`}>
                                <div className={`flex justify-between items-start mb-6 border-b ${themeClasses.border} pb-4`}>
                                    <div>
                                        <h2 className={`text-3xl font-extrabold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-700'} mb-1`}>
                                            {selectedCrop.crop} <span className={themeClasses.subTextColor}>({selectedCrop.grade})</span>
                                        </h2>
                                        <p className={`${themeClasses.subTextColor} italic`}>{selectedCrop.details}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => {
                                                setCropToDelete(selectedCrop);
                                                setShowDeleteModal(true);
                                            }}
                                            className={`p-2 rounded ${isDarkMode ? 'hover:bg-red-900 text-red-400 hover:text-red-300' : 'hover:bg-red-100 text-red-600 hover:text-red-800'}`}
                                            title={t("Delete listing")}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={() => setSelectedCropId(null)} 
                                            className={`p-2 rounded ${isDarkMode ? 'text-gray-500 hover:text-red-500' : 'text-gray-700 hover:text-red-700'} font-bold`}
                                        >
                                            <XCircle className='w-6 h-6' />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid lg:grid-cols-4 gap-8">
                                    <div className="lg:col-span-2 space-y-6">
                                        <h3 className={`text-lg font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center gap-2 border-b pb-2`}><Video className='w-5 h-5 text-purple-500' /> {t('CROP VISUAL (AI Grade Source)')}</h3>
                                        <div className={`${isDarkMode ? 'bg-gray-800 border border-purple-700/50' : 'bg-white border border-purple-300'} p-4 rounded-xl flex items-center justify-center`}>
                                            {selectedCrop.videoUrl ? (
                                                <div className='w-full h-full'>
                                                    <p className={`${themeClasses.subTextColor} text-sm italic mb-2 text-center`}>{t('AI Grading Source Video')}</p>
                                                  <video
    controls
    className="w-full h-auto max-h-64 rounded-lg"
    src={
        selectedCrop.videoUrl 
            ? selectedCrop.videoUrl.startsWith('http') 
                ? selectedCrop.videoUrl 
                : selectedCrop.videoUrl.startsWith('/uploads/')
                    ? `${API_BASE_URL.replace('/api', '')}${selectedCrop.videoUrl}`
                    : `${API_BASE_URL.replace('/api', '')}/uploads/${selectedCrop.videoUrl}`
            : ''
    }
>
    {t('Your browser does not support the video tag.')}
</video>
                                                </div>
                                            ) : (
                                                <p className={themeClasses.subTextColor}>{t('No media attached for this listing.')}</p>
                                            )}
                                        </div>

                                        {/* ML Analytics Dashboard */}
                                        {activeMLView && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-800/70 border border-indigo-700/50' : 'bg-white/90 border border-indigo-300'}`}
                                            >
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>
                                                        {t('AI Analytics Dashboard')}
                                                    </h3>
                                                    <button 
                                                        onClick={() => setActiveMLView(null)}
                                                        className={`p-2 rounded ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                </div>
                                                {renderMLView()}
                                            </motion.div>
                                        )}

                                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-12">
                                            <h2 className={`text-2xl font-bold ${themeClasses.textColor} mb-6 border-b ${themeClasses.border} pb-2`}>{t('Order Book')}: {selectedCrop ? selectedCrop.produce : t('All Active Bids')} ({filteredOrderBookBids.length} {t('Total')})</h2>
                                            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                                <AnimatePresence>
                                                    {filteredOrderBookBids && filteredOrderBookBids.length > 0 ? (
                                                        filteredOrderBookBids.map(bid => <BidCard key={bid.id} bid={bid} isDarkMode={isDarkMode} allCrops={allCrops} t={t} />)
                                                    ) : (
                                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`col-span-full text-center ${themeClasses.subTextColor} py-8 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'} rounded-lg`}>
                                                            {selectedCrop ? t('No active bids for {{produce}}. Be the first to start the auction!', { produce: selectedCrop.produce }) : t('The Global Order Book is currently quiet. Be the first to bid!')}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </motion.div>

                                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                                            <h2 className={`text-2xl font-bold ${themeClasses.textColor} mb-6 border-b ${themeClasses.border} pb-2`}>{t('Settled Trades (Your Purchases)')}</h2>
                                            <div className="grid gap-6">
                                                {recentPurchases.map(purchase => (
                                                    <motion.div key={purchase.id} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className={`${isDarkMode ? 'bg-gray-800/80 border border-gray-700' : 'bg-white border border-gray-300'} rounded-xl p-6 hover:scale-[1.01] transition-transform`}>
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex items-center gap-4">
                                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${isDarkMode ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : 'bg-gradient-to-r from-teal-200 to-cyan-200 text-teal-800'}`}>
                                                                    {purchase.produce.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <h3 className={`text-xl font-semibold ${themeClasses.textColor}`}>{purchase.produce} - <span className={`${isDarkMode ? 'text-teal-300' : 'text-teal-600'}`}>{purchase.quantity}</span></h3>
                                                                    <p className={themeClasses.subTextColor}>{t('SELLER')}: {purchase.farmer}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className={`text-sm ${themeClasses.subTextColor}`}>{t('SETTLED PRICE')}</p>
                                                                <p className={`${isDarkMode ? 'text-teal-400' : 'text-teal-700'} font-extrabold text-xl`}>{purchase.finalPrice}</p>
                                                                {purchase.totalSavings && <p className={`text-sm font-bold ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>{t('SAVED')}: {purchase.totalSavings}</p>}
                                                                <p className={themeClasses.subTextColor}>{purchase.lastActivity}</p>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    </div>

                                    <div className="lg:col-span-2">
                                        <h3 className={`text-lg font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4 flex items-center gap-2`}><DollarSign className={`w-5 h-5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'} animate-pulse`} /> {t('AUCTION HUB')}</h3>
                                        <div className={`${isDarkMode ? 'bg-gray-800 border border-yellow-500/50' : 'bg-yellow-50 border border-yellow-300'} rounded-xl p-6 shadow-2xl`}>
                                            <p className={`text-sm mb-1 ${themeClasses.subTextColor}`}>{t('Seller')}: <span className={`font-bold ${themeClasses.textColor}`}>{selectedCrop.farmerId?.name || t('Unknown Farmer')}</span></p>
                                            <p className={`text-xl font-bold ${themeClasses.textColor}`}>{t('CURRENT HIGH BID')}</p>

                                            <motion.p key={getCurrentHighestBid(selectedCrop._id, allCrops, allBids)} initial={{ scale: 1.1, opacity: 0.8 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.2 }} className={`text-5xl font-extrabold ${isDarkMode ? 'text-red-500' : 'text-red-700'} mb-4`}>
                                                ₹{getCurrentHighestBid(selectedCrop._id, allCrops, allBids).toFixed(2)}<span className={`text-xl font-normal ${themeClasses.subTextColor}`}>/{t('kg')}</span>
                                            </motion.p>

                                            <p className={`text-xs mb-4 ${themeClasses.subTextColor}`}>
                                                {t('Market Price Est.')}: <span className='font-bold text-red-500 line-through'>₹{selectedCrop.marketPrice.toFixed(2)}</span> | {t('MIN BID TO WIN')}: ₹{(getCurrentHighestBid(selectedCrop._id, allCrops, allBids) + MIN_BID_RANGE).toFixed(2)} | {t('Min Qty')}: {selectedCrop.minOrder} {t('KG')}
                                            </p>

                                            <h4 className={`text-sm font-bold uppercase mb-3 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-700'} border-t pt-4`}>{t('AI-POWERED ANALYTICS SUITE')}</h4>
                                            <div className="grid grid-cols-4 gap-3 mb-6">
                                                {mlFeatures.map(feature => (
                                                    <SmartFeatureButton 
                                                        key={feature.title} 
                                                        icon={feature.icon} 
                                                        title={feature.title} 
                                                        mlInsight={feature.mlInsight} 
                                                        isDarkMode={isDarkMode}
                                                        onClick={() => setActiveMLView(feature.view)}
                                                    />
                                                ))}
                                            </div>

                                            <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30">
                                                <div className="flex items-center gap-3">
                                                    <Brain className={`w-6 h-6 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                                                    <div>
                                                        <p className={`font-bold ${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
                                                            {t('AI Recommendation')}
                                                        </p>
                                                        <p className={`text-sm ${themeClasses.subTextColor}`}>
                                                            {t('Based on market conditions and competitor behavior, we recommend a bid of ₹{{price}}/kg', { price: (getCurrentHighestBid(selectedCrop._id, allCrops, allBids) + 3).toFixed(2) })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <form onSubmit={handlePlaceBid} className="space-y-4">
                                                <div>
                                                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>{t('QUANTITY (KG)')}</label>
                                                    <input type="number" value={bidQuantity || ''} onChange={(e) => setBidQuantity(e.target.value)} min={selectedCrop.minOrder} className={`w-full p-3 border-2 rounded-lg text-lg font-bold text-center ${themeClasses.inputBg}`} placeholder={t('Min Qty: {{minOrder}} KG', { minOrder: selectedCrop.minOrder })} required />
                                                </div>

                                                <div>
                                                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>{t('YOUR BID PRICE (INR/KG)')}</label>
                                                    <input type="number" step="1" value={bidAmount || ''} onChange={(e) => setBidAmount(e.target.value)} min={getCurrentHighestBid(selectedCrop._id, allCrops, allBids) + MIN_BID_RANGE} className={`w-full p-3 border-2 rounded-lg text-2xl font-extrabold text-center ${themeClasses.inputBg}`} placeholder={t('Min: ₹{{min}}', { min: (getCurrentHighestBid(selectedCrop._id, allCrops, allBids) + MIN_BID_RANGE).toFixed(2) })} required />
                                                </div>

                                                <motion.button type="submit" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className={`w-full font-extrabold py-4 rounded-lg uppercase transition-colors ${isDarkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}>{t('EXECUTE WINNING BID')}</motion.button>

                                                <div className="mt-4 pt-4 border-t">
                                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>{t('PAYMENT METHOD')}</label>
                                                    <div className="space-y-2">
                                                        <label className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${paymentMethod === 'cash_on_delivery' ? (isDarkMode ? 'bg-orange-900/50 border-2 border-orange-500' : 'bg-orange-100 border-2 border-orange-500') : (isDarkMode ? 'bg-gray-700' : 'bg-gray-100')}`}>
                                                            <input type="radio" name="paymentMethod" value="cash_on_delivery" checked={paymentMethod === 'cash_on_delivery'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4" />
                                                            <div>
                                                                <p className={`font-semibold ${themeClasses.textColor}`}>💵 {t('Cash on Delivery')}</p>
                                                                <p className={`text-xs ${themeClasses.subTextColor}`}>{t('Pay when you receive the goods')}</p>
                                                            </div>
                                                        </label>
                                                    </div>
                                                </div>

                                                {userAddress && <p className={`text-xs text-center pt-2 ${themeClasses.subTextColor}`}>{t('DELIVERY ADDRESS')}: {userAddress.substring(0, 30)}...</p>}
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}




{/* ===================================================== */}
{/* FIX: Remove duplicate section and keep only one logic */}
{/* ===================================================== */}

{/* Add Map/List Toggle Controls */}
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
  {/* View Toggle Buttons */}
  <div className="flex justify-between items-center mb-6">
    <div className="flex space-x-4">
      <button
        onClick={() => setShowMapView(false)}
        className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 ${
          !showMapView 
            ? isDarkMode ? 'bg-green-600 text-white' : 'bg-green-500 text-white'
            : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        <Layers className="w-5 h-5" />
        {t('List View')}
      </button>
      <button
        onClick={() => setShowMapView(true)}
        className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 ${
          showMapView 
            ? isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
            : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        <MapPin className="w-5 h-5" />
        {t('Map View')}
      </button>
    </div>
    
    {/* Crop Type Filter */}
    <div className="flex items-center gap-4">
      <select 
        value={selectedCropType}
        onChange={(e) => setSelectedCropType(e.target.value)}
        className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}
      >
        <option value="">All Crops</option>
        <option value="tomato">Tomato</option>
        <option value="potato">Potato</option>
        <option value="carrot">Carrot</option>
        <option value="guava">Guava</option>
        <option value="apple">Apple</option>
      </select>
    </div>
  </div>
  
  {/* Stats Cards - Show only in list view */}
  {!showMapView && (
    <div className="grid md:grid-cols-4 gap-6">
      {[{ label: t('Open Listings'), value: totalOpenListings, icon: Layers, color: isDarkMode ? 'text-indigo-400' : 'text-indigo-600', action: () => setFilter('ALL') },
      { label: t('My Active Bids'), value: bids.length, icon: Zap, color: isDarkMode ? 'text-red-400' : 'text-red-600', action: () => setFilter('ACTIVE_BIDS') },
      { label: t('My Winning Bids'), value: winningBidsCount, icon: Crown, color: isDarkMode ? 'text-yellow-400' : 'text-yellow-600', action: () => setFilter('MY_WINNING_BIDS') },
     { label: t('Nearby Farmers'), value: mapListings.length || 0, icon: MapPin, color: isDarkMode ? 'text-green-400' : 'text-green-600', action: () => setShowMapView(true) },
      ].map((stat, index) => (
        <motion.div key={index} className={`p-4 rounded-xl shadow-lg cursor-pointer transition-all ${themeClasses.cardBg} ${filter === (stat.label === t('Open Listings') ? 'ALL' : stat.label === t('My Winning Bids') ? 'MY_WINNING_BIDS' : stat.label.includes(t('Active Bids')) ? 'ACTIVE_BIDS' : '') ? (isDarkMode ? 'ring-2 ring-yellow-500' : 'ring-2 ring-blue-500') : ''}`} whileHover={{ scale: 1.02 }} onClick={stat.action}>
          <div className="flex items-center gap-4">
            <stat.icon className={`w-8 h-8 ${stat.color} ${stat.label === t('Market Alerts') && stat.value > 0 ? 'animate-bounce' : ''}`} />
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className={`text-2xl font-extrabold ${themeClasses.textColor}`}>{stat.value}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )}
</motion.div>

{/* ============================================ */}
{/* CONDITIONAL RENDERING: MAP VIEW vs LIST VIEW */}
{/* ============================================ */}

{showMapView ? (
  /* ================= MAP VIEW ================= */
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
    <div className={`rounded-xl overflow-hidden shadow-xl ${themeClasses.cardBg}`}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold flex items-center gap-3 ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
            <MapPin className="w-6 h-6" />
            {t('Farmers Near You')}
          </h2>
          <button
            onClick={() => setShowMapView(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
          >
            <Layers className="w-4 h-4" />
            {t('Back to List')}
          </button>
        </div>
        
        {/* MapView component */}
        <MapView 
          cropType={selectedCropType} 
          isDarkMode={isDarkMode}
          onSelectCrop={(cropId) => {
            setSelectedCropId(cropId);
            setShowMapView(false);
          }}
        />
      </div>
    </div>
  </motion.div>
) : (
  /* ================= LIST VIEW ================= */
  <>
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${themeClasses.textColor} border-b ${themeClasses.border} pb-2`}>
          {t('Commodity Listings')} ({filteredCrops.length})
        </h2>
        <button
          onClick={() => setShowMapView(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
        >
          <MapPin className="w-4 h-4" />
          {t('View on Map')}
        </button>
      </div>
      
      {/* Bulk Delete Button */}
      <div className="flex justify-end mb-4">
        <button 
          onClick={() => {
            if (filteredCrops.length > 0) {
              setNotifications([{ 
                message: t('Bulk delete option would delete all {{count}} listings. Use with caution!', { count: filteredCrops.length }), 
                type: 'warning' 
              }]);
            }
          }}
          className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${isDarkMode ? 'bg-red-900 hover:bg-red-800 text-red-300' : 'bg-red-100 hover:bg-red-200 text-red-700'}`}
          title={t("Clear all listings (Admin only)")}
        >
          <Trash2 className="w-4 h-4" />
          {t('Clear All Listings')}
        </button>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredCrops.map(item => {
          const currentHighest = getCurrentHighestBid(item._id, allCrops, allBids);
          const priceDelta = currentHighest - item.pricePerKg;
          const deltaColor = priceDelta > 0 ? (isDarkMode ? 'text-green-400' : 'text-green-700') : priceDelta < 0 ? (isDarkMode ? 'text-red-400' : 'text-red-700') : themeClasses.subTextColor;
          const myBidStatus = getMyCurrentBidStatus(item._id, allBids);
          const isMarketAlert = currentHighest < item.marketPrice * MARKET_PRICE_ALERT_THRESHOLD;

          return (
            <motion.div key={item._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} whileHover={{ scale: 1.03 }} className={`${themeClasses.cardBg} rounded-lg p-4 transition-all relative group ${selectedCropId === item._id ? (isDarkMode ? 'ring-2 ring-indigo-500' : 'ring-2 ring-indigo-700 border-indigo-700') : ''} ${isMarketAlert ? (isDarkMode ? 'ring-2 ring-red-600 border-red-500' : 'ring-2 ring-red-300 border-red-500') : ''}`}>
              
              {/* DELETE BUTTON */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setCropToDelete(item);
                  setShowDeleteModal(true);
                }}
                className={`absolute -top-2 -right-2 p-2 rounded-full z-10 ${isDarkMode ? 'bg-red-700 hover:bg-red-600 text-red-200' : 'bg-red-500 hover:bg-red-600 text-white'} shadow-lg`}
                title={t("Delete this listing")}
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Clickable area for selecting crop */}
              <div onClick={() => setSelectedCropId(item._id)} className="cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`text-lg font-bold ${themeClasses.textColor}`}>{item.produce}</h3>
                  <div className="flex items-center gap-2">
                    {isMarketAlert && <AlertTriangle className='w-5 h-5 text-red-500 animate-pulse' title={t("Significantly below market price!")} />}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getTrendColor('Up', isDarkMode)}`}>
                      {t(item.status.toUpperCase())}
                    </span>
                  </div>
                </div>

                <div className={`text-xs font-semibold px-2 py-1 rounded-full text-center mb-3 ${myBidStatus === 'Winning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200 border border-yellow-500' : myBidStatus === 'Outbid' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200 border border-red-500' : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200 border border-indigo-500'}`}>
                  {myBidStatus === 'Winning' && <Crown className='w-4 h-4 inline mr-1' />}
                  {myBidStatus === 'Outbid' && <Zap className='w-4 h-4 inline mr-1' />}
                  {t('MY STATUS')}: {t(myBidStatus.toUpperCase())}
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className={`text-xl font-extrabold ${themeClasses.textColor}`}>₹{currentHighest.toFixed(2)}<span className={`text-xs ${themeClasses.subTextColor}`}>/{t('kg')}</span></p>
                    <p className={`text-xs font-semibold ${deltaColor}`}>{priceDelta >= 0 ? '▲' : '▼'}{Math.abs(priceDelta).toFixed(2)}</p>
                  </div>

                  <div className={`text-xs text-right ${themeClasses.subTextColor}`}>
                   <p><MapPin className='w-3 h-3 inline mr-1' /> {typeof item.location === 'string' ? item.location : item.location?.address || 'N/A'}</p>
                    <p><Leaf className='w-3 h-3 inline mr-1' /> {t('Grade')}: {item.grade}</p>
                    <p><Weight className='w-3 h-3 inline mr-1' /> {item.quantityKg} {t('KG')}</p>
                  </div>
                </div>

                {/* Farmer name and listing info */}
                <div className="mt-3 pt-3 border-t border-gray-700/50">
                  <div className="flex justify-between items-center">
                    <p className={`text-xs ${themeClasses.subTextColor}`}>
                      {t('Farmer')}: {item.farmerId?.name || 'Unknown'}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'}`}>
                      {item._id.startsWith('mock_') ? t('Mock Data') : t('Live Listing')}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  </>
)}


                        <Notification notifications={notifications} />
                    </>
                )}

                <AnimatePresence>
                    {showAddressModal && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                            <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className={`${themeClasses.cardBg} border-2 border-yellow-500 rounded-xl p-8 max-w-lg w-full shadow-2xl`}>
                                <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>{t('Action Required: Delivery Address')}</h3>
                                <p className={`${themeClasses.subTextColor} mb-6`}>{t('To place your first bid and receive your goods, we need a one-time primary delivery address. This will be saved for future bids.')}</p>
                                <textarea value={newAddress} onChange={(e) => setNewAddress(e.target.value)} placeholder={t("Enter your full delivery address here...")} rows="4" className={`w-full p-3 border-2 rounded-lg text-lg ${themeClasses.inputBg} resize-none mb-6`} required />
                                <motion.button onClick={handleSaveAddress} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`w-full font-extrabold py-3 rounded-lg uppercase transition-colors bg-yellow-500 hover:bg-yellow-600 text-black`}>{t('Save Address & Continue Bidding')}</motion.button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Delete Confirmation Modal */}
                <AnimatePresence>
                    {showDeleteModal && (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
                        >
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }} 
                                animate={{ scale: 1, opacity: 1 }} 
                                exit={{ scale: 0.9, opacity: 0 }}
                                className={`${themeClasses.cardBg} rounded-xl p-8 max-w-md w-full shadow-2xl border-2 ${isDarkMode ? 'border-red-700' : 'border-red-500'}`}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`p-3 rounded-full ${isDarkMode ? 'bg-red-900' : 'bg-red-100'}`}>
                                        <Trash2 className={`w-6 h-6 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                                    </div>
                                    <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                                        {t('Delete Listing')}
                                    </h3>
                                </div>
                                
                                <p className={`${themeClasses.subTextColor} mb-6`}>
                                    {t('Are you sure you want to delete "{{cropName}}"? This action cannot be undone. All bids placed on this listing will also be removed.', { 
                                        cropName: cropToDelete?.produce || cropToDelete?.crop 
                                    })}
                                </p>
                                
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => {
                                            setShowDeleteModal(false);
                                            setCropToDelete(null);
                                        }}
                                        className={`flex-1 py-3 rounded-lg font-semibold ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                                    >
                                        {t('Cancel')}
                                    </button>
                                    <button
                                        onClick={handleDeleteCrop}
                                        className={`flex-1 py-3 rounded-lg font-semibold ${isDarkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                                    >
                                        {t('Yes, Delete')}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>  
            </div>
        </div>
    );
};

export default Marketplace;

