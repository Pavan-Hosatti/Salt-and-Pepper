import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  getMyProfile, 
  updateProfile,
  updateStats 
} from '../services/farmerProfileService';



// Add these icon definitions at the top of Profile.jsx, after the imports

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

const Edit = (props) => (
  <IconWrapper {...props}>
    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </IconWrapper>
);

const MapPin = (props) => (
  <IconWrapper {...props}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </IconWrapper>
);

const Calendar = (props) => (
  <IconWrapper {...props}>
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </IconWrapper>
);

const Award = (props) => (
  <IconWrapper {...props}>
    <path d="m15.4 17.5 1.5 1.7a2.1 2.1 0 0 0 3.2 0l1.5-1.7" />
    <circle cx="12" cy="11" r="5" />
    <path d="M12 16l-3.2 4.4" />
    <path d="M12 16l3.2 4.4" />
    <path d="m8.6 17.5-1.5 1.7a2.1 2.1 0 0 1-3.2 0L2.4 17.5" />
  </IconWrapper>
);

const DollarSign = (props) => (
  <IconWrapper {...props}>
    <line x1="12" x2="12" y1="2" y2="22" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </IconWrapper>
);

const Seedling = (props) => (
  <IconWrapper {...props}>
    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-4-3-5s-4-4-4-4-2.2 4.5-4 6-3 3-3 5a7 7 0 0 0 7 7Z" />
    <path d="M12 10C10 10 7 12 7 15" />
  </IconWrapper>
);

const Truck = (props) => (
  <IconWrapper {...props}>
    <path d="M10 17H5a2 2 0 0 1-2-2V9.45l.9-.9c.7-.6 1.6-1 2.7-1h8.2a4 4 0 0 1 4 4v.7c0 1.5.8 2.8 2 3.4" />
    <path d="M7 17v-2" />
    <path d="M18 17v-2" />
    <path d="M8 12h8" />
    <circle cx="7" cy="17" r="2" />
    <circle cx="18" cy="17" r="2" />
  </IconWrapper>
);

const Mail = (props) => (
  <IconWrapper {...props}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </IconWrapper>
);

const CheckCircle = (props) => (
  <IconWrapper {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </IconWrapper>
);

const Phone = (props) => (
  <IconWrapper {...props}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </IconWrapper>
);

const Globe = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </IconWrapper>
);

const Upload = (props) => (
  <IconWrapper {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" x2="12" y1="3" y2="15" />
  </IconWrapper>
);

const Facebook = (props) => (
  <IconWrapper {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </IconWrapper>
);

const Twitter = (props) => (
  <IconWrapper {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </IconWrapper>
);

const Instagram = (props) => (
  <IconWrapper {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </IconWrapper>
);

const Linkedin = (props) => (
  <IconWrapper {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </IconWrapper>
);

// ... rest of your Profile.jsx code

const FarmerProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    farmName: '',
    location: '',
    description: '',
    contactEmail: '',
    phoneNumber: '',
    whatsappNumber: '',
    taxId: '',
    gstNumber: '',
    businessRegistrationNumber: '',
    farmSize: { value: '', unit: 'acres' },
    farmingType: 'conventional',
    primaryCrops: '',
    secondaryCrops: '',
    expertise: '',
    certifications: [],
    infrastructure: {
      irrigationSystem: '',
      storageCapacity: '',
      processingUnits: '',
      transportation: ''
    },
    website: '',
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: ''
    }
  });

  // Fetch profile on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const data = await getMyProfile(token);
      setProfile(data);
      
      if (!data.isProfileComplete) {
        setIsEditing(true);
      }
      
      // Initialize form data if editing
      setFormData({
        farmName: data.farmName || '',
        location: data.location || '',
        description: data.description || '',
        contactEmail: data.contactEmail || '',
        phoneNumber: data.phoneNumber || '',
        whatsappNumber: data.whatsappNumber || '',
        taxId: data.taxId || '',
        gstNumber: data.gstNumber || '',
        businessRegistrationNumber: data.businessRegistrationNumber || '',
        farmSize: data.farmSize || { value: '', unit: 'acres' },
        farmingType: data.farmingType || 'conventional',
        primaryCrops: data.primaryCrops?.join(', ') || '',
        secondaryCrops: data.secondaryCrops?.join(', ') || '',
        expertise: data.expertise?.join(', ') || '',
        certifications: data.certifications || [],
        infrastructure: data.infrastructure || {
          irrigationSystem: '',
          storageCapacity: '',
          processingUnits: '',
          transportation: ''
        },
        website: data.website || '',
        socialMedia: data.socialMedia || {
          facebook: '',
          twitter: '',
          instagram: '',
          linkedin: ''
        }
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNestedInputChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleSocialMediaChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };

  const handleAddCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        { name: '', issuingAuthority: '', year: new Date().getFullYear(), validUntil: '' }
      ]
    }));
  };

  const handleCertificationChange = (index, field, value) => {
    const updatedCerts = [...formData.certifications];
    updatedCerts[index][field] = value;
    setFormData(prev => ({
      ...prev,
      certifications: updatedCerts
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      // Process array fields
      const submissionData = {
        ...formData,
        primaryCrops: formData.primaryCrops.split(',').map(item => item.trim()).filter(item => item),
        secondaryCrops: formData.secondaryCrops.split(',').map(item => item.trim()).filter(item => item),
        expertise: formData.expertise.split(',').map(item => item.trim()).filter(item => item)
      };
      
      const updatedProfile = await updateProfile(submissionData, token);
      setProfile(updatedProfile);
      setIsEditing(false);
      
      // Show success message
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format joined date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (isLoading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-200 dark:from-slate-900 dark:to-slate-800 pt-20 p-4">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 border-gray-200 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-8 shadow-xl"
          >
            <h2 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-2">
              <Seedling className="w-8 h-8"/> 
              {profile?.isProfileComplete ? 'Edit Profile' : 'Complete Your Profile'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              {profile?.isProfileComplete 
                ? 'Update your farm information to keep it current for buyers.'
                : 'Complete your profile to start listing products and connecting with buyers.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Farm/Business Name *
                  </label>
                  <input
                    type="text"
                    name="farmName"
                    value={formData.farmName}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Location (City, State) *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Farm Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Describe your farm, farming practices, mission, etc."
                />
              </div>

              {/* Contact Information */}
              <div className="border-t pt-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Contact Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Farm Details */}
              <div className="border-t pt-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Farm Details</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Farming Type
                    </label>
                    <select
                      name="farmingType"
                      value={formData.farmingType}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="organic">Organic</option>
                      <option value="conventional">Conventional</option>
                      <option value="mixed">Mixed</option>
                      <option value="hydroponic">Hydroponic</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Farm Size
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={formData.farmSize.value}
                        onChange={(e) => handleNestedInputChange('farmSize', 'value', e.target.value)}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <select
                        value={formData.farmSize.unit}
                        onChange={(e) => handleNestedInputChange('farmSize', 'unit', e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="acres">Acres</option>
                        <option value="hectares">Hectares</option>
                        <option value="sqft">Sq Ft</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Primary Crops (comma separated)
                  </label>
                  <input
                    type="text"
                    name="primaryCrops"
                    value={formData.primaryCrops}
                    onChange={handleInputChange}
                    placeholder="e.g., Tomatoes, Potatoes, Onions"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Expertise (comma separated)
                  </label>
                  <input
                    type="text"
                    name="expertise"
                    value={formData.expertise}
                    onChange={handleInputChange}
                    placeholder="e.g., Organic Farming, Crop Rotation, Irrigation Management"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

            

              {/* Form Actions */}
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-emerald-500/50 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      {profile?.isProfileComplete ? 'Update Profile' : 'Complete Profile Setup'}
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  // View Mode
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-200 dark:from-slate-900 dark:to-slate-800 pt-20 transition-colors duration-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700/50 backdrop-blur-xl rounded-2xl p-8 sticky top-8"
            >
              {/* Profile Header */}
              <div className="text-center mb-8">
                <div className="relative inline-block">
                  <div className="w-32 h-32 bg-gradient-to-r from-emerald-600 to-lime-600 rounded-full flex items-center justify-center text-4xl text-white font-bold mx-auto mb-4">
                    {getInitials(profile?.farmName || 'F')}
                  </div>
                  <button 
                    onClick={() => setIsEditing(true)}
                    data-profile-edit="true" // ✅ ADD THIS
                    className="absolute bottom-2 right-2 bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-full transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {profile?.farmName}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-4 capitalize">
                  {profile?.farmingType} Farming
                </p>
                <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{profile?.location}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(profile?.joinedDate)}</span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3 mb-8">
                <a 
                  href={`mailto:${profile?.contactEmail}`} 
                  className="flex items-center gap-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50"
                >
                  <Mail className="w-5 h-5" />
                  <span>{profile?.contactEmail}</span>
                </a>
                
                {profile?.phoneNumber && (
                  <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 p-3 rounded-lg">
                    <Phone className="w-5 h-5" />
                    <span>{profile.phoneNumber}</span>
                  </div>
                )}
                
                {profile?.taxId && (
                  <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 p-3 rounded-lg">
                    <DollarSign className="w-5 h-5" />
                    <span>Tax ID: {profile.taxId}</span>
                  </div>
                )}
              </div>

            

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {profile?.totalListings || 0}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm">Listings</div>
                </div>
                <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-lime-600 dark:text-lime-400">
                    {profile?.fulfillmentRate || 0}%
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm">Fulfillment</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* About Section */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700/50 backdrop-blur-xl rounded-2xl p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">About the Farm</h2>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {profile?.description || 'No description provided.'}
              </p>
              
              {/* Farm Details */}
              <div className="grid grid-cols-2 gap-6 mt-6 pt-6 border-t">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Farm Size</h3>
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {profile?.farmSize?.value} {profile?.farmSize?.unit}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Farming Type</h3>
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 capitalize">
                    {profile?.farmingType}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Expertise */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700/50 backdrop-blur-xl rounded-2xl p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Farming Expertise</h2>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {profile?.expertise?.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-gradient-to-r from-emerald-600 to-lime-600 px-4 py-2 rounded-full text-white font-medium"
                  >
                    {skill}
                  </span>
                ))}
                {(!profile?.expertise || profile.expertise.length === 0) && (
                  <p className="text-gray-500 dark:text-gray-400">No expertise added yet.</p>
                )}
              </div>
            </motion.div>

            {/* Primary Crops */}
            {profile?.primaryCrops && profile.primaryCrops.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/80 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700/50 backdrop-blur-xl rounded-2xl p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Primary Crops</h2>
                <div className="flex flex-wrap gap-3">
                  {profile.primaryCrops.map((crop, index) => (
                    <span
                      key={index}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 rounded-full text-white font-medium"
                    >
                      {crop}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Certifications */}
            {profile?.certifications && profile.certifications.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/80 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700/50 backdrop-blur-xl rounded-2xl p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Certifications</h2>
                <div className="space-y-4">
                  {profile.certifications.map((cert, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Award className="w-6 h-6 text-amber-600 dark:text-amber-400 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{cert.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Issued by: {cert.issuingAuthority}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                          Valid until: {new Date(cert.validUntil).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Infrastructure */}
            {profile?.infrastructure && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/80 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700/50 backdrop-blur-xl rounded-2xl p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Infrastructure</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {profile.infrastructure.irrigationSystem && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Irrigation System</h3>
                      <p className="text-gray-600 dark:text-gray-400">{profile.infrastructure.irrigationSystem}</p>
                    </div>
                  )}
                  
                  {profile.infrastructure.storageCapacity && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Storage Capacity</h3>
                      <p className="text-gray-600 dark:text-gray-400">{profile.infrastructure.storageCapacity}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerProfile;
