import { motion } from 'framer-motion';
import React, { useState } from 'react';
// 💥 NEW: Import the useTranslation hook
import { useTranslation } from 'react-i18next'; 

// --- Local Icon Definitions (Ensuring no external lucide-react dependency) ---

const IconWrapper = ({ children, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {children}
  </svg>
);

const SettingsIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.47a2 2 0 0 1-1.44 1.83l-.71.3c-1.21.64-2 1.94-2 3.3v.8c0 1.36.79 2.66 2 3.3l.71.3a2 2 0 0 1 1.44 1.83v.47a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.47a2 2 0 0 1 1.44-1.83l.71-.3c1.21-.64 2-1.94 2-3.3v-.8c0-1.36-.79-2.66-2-3.3l-.71-.3a2 2 0 0 1-1.44-1.83V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </IconWrapper>
);

const Target = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </IconWrapper>
);

const Shield = (props) => (
  <IconWrapper {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </IconWrapper>
);

const Home = (props) => (
  <IconWrapper {...props}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </IconWrapper>
);

// --- MOCK PROFILE DATA (for standalone testing) ---
const mockProfile = {
    role: 'Freelancer',
    legalName: 'Samee Solutions LLC',
    taxId: 'XX-1234567',
    contactEmail: 'contact@farm2market.com',
    pricingStrategy: 'Tiered based on volume',
    deliveryRadius: '50 Miles',
    // Mocking the navigate function for isolated testing
    navigate: (route) => console.log(`Navigating to: ${route}`), 
};


// ------------------------------------
// SETTINGS COMPONENT (Control Center)
// ------------------------------------

const Settings = ({ profile = mockProfile, navigate = mockProfile.navigate }) => {
  const [activeTab, setActiveTab] = useState('account'); // 'account', 'market', 'security'
  // 💥 NEW: Use the translation hook to get the 't' function
  const { t } = useTranslation(); 

  const TabButton = ({ id, label, Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-all flex items-center gap-2 ${
        activeTab === id
          ? 'bg-gray-100 dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  // 💥 UPDATED: The title prop for SectionCard needs to be passed *already translated* or translated inside.
  // I will translate the title inside SectionCard for simplicity, though passing a key is cleaner.
  // Let's keep it simple as requested and translate the content where it is used.
  const SectionCard = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 space-y-4">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white border-b pb-2 border-gray-100 dark:border-gray-700">{t(title)}</h3>
      {children}
    </div>
  );
  
  // 💥 UPDATED: The label prop for DisplayField needs to be passed *already translated*.
  const DisplayField = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">{t(label)}</span>
      <span className="text-gray-900 dark:text-white font-medium">{value}</span>
    </div>
  );

  const TabContent = () => {
    // Ensure a profile exists before trying to access its properties
    const p = profile || mockProfile; 
    
    switch (activeTab) {
      case 'account':
        return (
          <div className="space-y-6">
            {/* 💥 t() usage for title prop */}
            <SectionCard title="Business Details">
              {/* 💥 t() usage for label prop */}
              <DisplayField label="Legal Entity Name" value={p.legalName || t('N/A')} />
              <DisplayField label="Tax ID / EIN" value={p.taxId || t('N/A')} />
              <DisplayField label="Primary Contact Email" value={p.contactEmail} />
              <button className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold hover:text-emerald-700 transition-colors">
                {/* 💥 t() usage for button text */}
                {t('Update Business Info')}
              </button>
            </SectionCard>
            {/* 💥 t() usage for title prop */}
            <SectionCard title="User Credentials">
              {/* 💥 t() usage for paragraph text (including variable context) */}
              <p className="text-gray-500 dark:text-gray-400 text-sm">{t('Last password change: 3 months ago')}</p>
              <button className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                {/* 💥 t() usage for button text */}
                {t('Change Password')}
              </button>
            </SectionCard>
          </div>
        );
      case 'market':
        // Conditional rendering based on role (e.g., only Farmers see this tab)
        if (p.role !== 'Freelancer') {
            return <p className="pt-8 text-center text-gray-500 dark:text-gray-400">{t('Marketplace configuration is only available for **Farmer** accounts.')}</p>;
        }
        
        return (
          <div className="space-y-6">
            {/* 💥 t() usage for title prop */}
            <SectionCard title="Pricing & Sales Strategy">
              {/* 💥 t() usage for label prop */}
              <DisplayField label="Pricing Model" value={p.pricingStrategy} />
              <DisplayField label="Preferred Delivery Radius" value={p.deliveryRadius} />
              <div className="mt-4">
                {/* 💥 t() usage for span text */}
                <span className="text-gray-600 dark:text-gray-400 text-sm font-medium block mb-2">{t('Preferred Buyer Segments')}</span>
                <div className="flex flex-wrap gap-2">
                  {/* 💥 t() usage inside map function for displayed text */}
                  {['Wholesalers', 'Restaurants', 'CSA Boxes'].map(segment => (
                    <span key={segment} className="bg-lime-100 dark:bg-lime-900 text-lime-800 dark:text-lime-300 text-xs px-3 py-1 rounded-full">{t(segment)}</span>
                  ))}
                </div>
              </div>
              <button className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold hover:text-emerald-700 transition-colors">
                {/* 💥 t() usage for button text */}
                {t('Define Pricing Rules')}
              </button>
            </SectionCard>
            {/* 💥 t() usage for title prop */}
            <SectionCard title="Shipping & Logistics">
                {/* 💥 t() usage for label and value props (if the value is a translatable string) */}
                <DisplayField label="Fulfillment Partner" value={t('Local Courier Network')} />
                <button className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold hover:text-emerald-700 transition-colors">
                    {/* 💥 t() usage for button text */}
                    {t('Manage Zones')}
                </button>
            </SectionCard>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-6">
            {/* 💥 t() usage for title prop */}
            <SectionCard title="API Integrations">
              {/* 💥 t() usage for paragraph text */}
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{t('Integrate your workflow tools with Farm2Market using API keys.')}</p>
              {/* 💥 t() usage for label prop */}
              <DisplayField label="Inventory Sync API Key" value="********-****-42c2-b7e1-********" />
              <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                {/* 💥 t() usage for button text */}
                {t('Revoke Key')}
              </button>
            </SectionCard>
            {/* 💥 t() usage for title prop */}
            <SectionCard title="Security Preferences">
              {/* 💥 t() usage for label and value props (since 'Enabled' is translatable content) */}
              <DisplayField label="Two-Factor Authentication" value={t('Enabled')} />
              {/* 💥 t() usage for paragraph text */}
              <p className="text-gray-500 dark:text-gray-400 text-sm">{t('Last security check: Today')}</p>
            </SectionCard>
          </div>
        );
      default:
        return null;
    }
  };


  return (
    <motion.div 
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 min-h-screen" // Added bg and min-h for context
    >
      {/* Header with Back Button */}
      <div className="mb-8 pt-10"> {/* Added pt-10 to account for Header.jsx fixed header */}
        <button 
          onClick={() => navigate('/profile')} // Changed to use the standard react-router route
          className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors font-medium mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          {/* 💥 t() usage for button text */}
          {t('Back to Profile')}
        </button>

        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-400"/> {/* 💥 t() usage for heading text */}
          {t('Farm Operations Control Center')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {/* 💥 t() usage for paragraph text */}
          {t('Manage your business compliance, marketplace strategy, and system integrations.')}
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex -mb-px space-x-4 overflow-x-auto">
          {/* 💥 t() usage for label prop values */}
          <TabButton id="account" label={t('Account & Compliance')} Icon={Home} />
          <TabButton id="market" label={t('Marketplace Configuration')} Icon={Target} />
          <TabButton id="security" label={t('Data & Security')} Icon={Shield} />
        </div>
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-6"
      >
        {TabContent()}
      </motion.div>
    </motion.div>
  );
};

export default Settings;
