// AIGrader.jsx
import { useState, useMemo, useEffect, useRef } from 'react';

import { motion } from 'framer-motion';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

// --- CONFIGURATION ---
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const ML_SERVICE_URL = import.meta.env.VITE_ML_SERVICE_URL || 'http://localhost:5001';
const DUMMY_FARMER_ID = '60c72b2f9b1d9c0015b8b4a1';



const AIGrader = () => {
    const { t } = useTranslation();

    // --- UTILITY: Dynamic Physical Audit Parameters
    const getAuditParameters = (cropType) => { 
        return {
            title: t('aigrader.physicalParameters'),
            fields: [
                { label: t('aigrader.colorUniformity'), key: 'colorUniformity', unit: '%', placeholder: 'Enter color uniformity percentage' },
                { label: t('aigrader.sizeConsistency'), key: 'sizeConsistency', unit: '%', placeholder: 'Enter size consistency percentage' },
                { label: t('aigrader.defects'), key: 'defects', unit: '%', placeholder: 'Enter visible defects percentage' },
                { label: t('aigrader.freshness'), key: 'freshness', unit: '/10', placeholder: 'Rate freshness from 1–10' },
                { label: t('aigrader.moisture'), key: 'moisture', unit: '%', placeholder: 'Enter moisture percentage' },
            ]
        };
    };
    
    const [formData, setFormData] = useState({
        cropType: 'tomato',
        quantityKg: '',
        pricePerKg: '',
        location: '',
        details: '',
        marketChoice: 'primary',
        photo: [], 
        physicalAudit: {}, 
    });

    const [cropFile, setCropFile] = useState(null); 
    const [currentStep, setCurrentStep] = useState(1);
    const [gradeResult, setGradeResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submissionMessage, setSubmissionMessage] = useState({ type: '', text: '' });
    const [isAutoMode, setIsAutoMode] = useState(false);
    const [autoStep, setAutoStep] = useState(0);

const submitButtonRef = useRef(null);

// ✅ NEW: Computed state for button enabled/disabled
    const isSubmitEnabled = useMemo(() => {
        const hasQuantity = formData.quantityKg && formData.quantityKg.trim() !== '';
        const hasPrice = formData.pricePerKg && formData.pricePerKg.trim() !== '';
        const hasLocation = formData.location && formData.location.trim() !== '';
        
        const enabled = !loading && hasQuantity && hasPrice && hasLocation;
        
        console.log('🔘 Submit button state:', {
            hasQuantity,
            hasPrice,
            hasLocation,
            loading,
            enabled,
            step: currentStep
        });
        
        return enabled;
    }, [formData.quantityKg, formData.pricePerKg, formData.location, loading, currentStep]);




    // Constants
    const totalSteps = 6;
    const allCrops = [
        'tomato', 'apple', 'carrot', 'lettuce', 'banana', 'mango', 'orange', 'potato',
        'onion', 'broccoli', 'spinach', 'cucumber', 'capsicum', 'grapes', 'strawberry',
        'watermelon', 'pumpkin', 'cabbage', 'cauliflower', 'radish', 'beetroot', 'garlic',
        'ginger', 'chili', 'okra', 'peas', 'beans', 'corn', 'rice', 'wheat', 'sugarcane'
    ];
    const dynamicAudit = useMemo(() => getAuditParameters(formData.cropType), [formData.cropType]);

    // ===================== FUNCTIONS =====================

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const nextStep = () => {
        if (currentStep === 1) {
            if (!cropFile || formData.photo.length === 0) {
                setSubmissionMessage({ 
                    type: 'error', 
                    text: 'Please select a video file first' 
                });
                return;
            }
        }
        
        setSubmissionMessage({ type: '', text: '' });
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
            
            // Auto-fill when moving to step 3 in auto mode
            if (currentStep === 2 && isAutoMode) {
                setTimeout(() => {
                    performAutoFillAllFields();
                }, 500);
            }
        }
    };

    const prevStep = () => {
        setSubmissionMessage({ type: '', text: '' });
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        console.log('📁 File selected in handlePhotoUpload:', file?.name);
        
        if (file) {
            if (!file.type.startsWith('video/')) {
                setSubmissionMessage({ 
                    type: 'error', 
                    text: 'Please select a video file (MP4, MOV, AVI, etc.)' 
                });
                return;
            }
            
            setCropFile(file);
            setFormData(prev => ({ 
                ...prev, 
                photo: [file]
            }));
            
            setSubmissionMessage({ type: '', text: '' });
            
            setTimeout(() => {
                if (currentStep === 1) {
                    nextStep();
                }
            }, 1000);
        }
    };

    const handleDragDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        setCropFile(file);
        setFormData(prev => ({ ...prev, photo: file ? [file] : [] }));
    };

    const handlePhysicalAuditChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            physicalAudit: {
                ...prev.physicalAudit,
                [key]: value
            }
        }));
    };

    const resetForm = () => {
        setFormData({
            cropType: 'tomato',
            quantityKg: '',
            pricePerKg: '',
            location: '',
            details: '',
            marketChoice: 'primary',
            photo: [],
            physicalAudit: {},
        });
        setCropFile(null);
        setGradeResult(null);
        setCurrentStep(1);
        setSubmissionMessage({ type: '', text: '' });
        setIsAutoMode(false);
        setAutoStep(0);
    };

    const pollJobStatus = async (jobId, cropListingId) => {
        let status = 'pending';
        const POLL_INTERVAL_MS = 10000;
        const MAX_POLLS = 30;
        let pollCount = 0;
        
        setSubmissionMessage({ 
            type: 'info', 
            text: `Grading in progress... Job ID: ${jobId}` 
        });

        console.log(`📡 Starting polling for Job ID: ${jobId}`);

        while (status === 'pending' || status === 'processing') {
            if (pollCount >= MAX_POLLS) {
                throw new Error('Grading timeout - please check status later');
            }
            
            await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
            pollCount++;

            try {
                const statusResponse = await axios.get(
                    `${API_BASE_URL}/crops/grading-status/${jobId}`,
                    { timeout: 10000 }
                );
                
                status = statusResponse.data.status;
                console.log(`Poll ${pollCount}: status = ${status}`);

                if (status === 'completed') {
                    return statusResponse.data.result;
                } else if (status === 'failed') {
                    throw new Error(statusResponse.data.error || 'Grading failed');
                }

                setSubmissionMessage({ 
                    type: 'info', 
                    text: `Processing... (${pollCount * 3}s elapsed)` 
                });

            } catch (error) {
                console.error('Polling error:', error);
                throw new Error(`Status check failed: ${error.message}`);
            }
        }
    };

    const handleSubmit = async () => {
        if (!formData.quantityKg || !formData.pricePerKg || !formData.location) {
            setSubmissionMessage({ type: 'error', text: t('errors.fillRequiredFields') });
            return;
        }
        
        if (!cropFile) {
            setSubmissionMessage({ type: 'error', text: t('errors.videoFileMissing') });
            return;
        }

        setLoading(true);
        setSubmissionMessage({ type: 'info', text: t('messages.submittingJob') });

        const data = new FormData();
        data.append('video', cropFile);
        data.append('farmerId', DUMMY_FARMER_ID);
        data.append('crop', formData.cropType);
        data.append('quantityKg', formData.quantityKg);
        data.append('pricePerKg', formData.pricePerKg);
        data.append('location', formData.location);
        data.append('details', formData.details);
        data.append('marketChoice', formData.marketChoice);
        data.append('physicalAudit', JSON.stringify(formData.physicalAudit));

        let job_id = null;

        try {
            console.log('📤 Submitting crop listing job to Node.js backend...');
            
            const response = await axios.post(
                `${API_BASE_URL}/crops/submit-for-grading`, 
                data, 
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    timeout: 360000
                }
            );

            console.log('✅ Job Submission Response:', response.data);

            const { job_id: receivedJobId, cropListingId, blockchain } = response.data;
            job_id = receivedJobId;

            if (!job_id) {
                throw new Error(t('errors.noJobId'));
            }

            if (cropListingId) {
                const listingPayload = {
                    cropListingId,
                    crop: formData.cropType,
                    quantityKg: formData.quantityKg,
                    pricePerKg: formData.pricePerKg,
                    createdAt: Date.now()
                };

                try {
                    localStorage.setItem('latestMarketplaceListing', JSON.stringify(listingPayload));
                } catch (storageError) {
                    console.warn('⚠️ Could not cache new listing payload:', storageError.message);
                }

                window.dispatchEvent(new CustomEvent('marketplace:newListing', {
                    detail: listingPayload
                }));
            }

            // ✅ Store blockchain verification data
            if (blockchain?.verified && blockchain?.txId) {
                console.log('🔐 Blockchain Verification TX:', blockchain.txId);
            }

            setSubmissionMessage({ 
                type: 'info', 
                text: t('messages.jobAccepted', { jobId: job_id }) 
            });
            
            const gradeDetails = await pollJobStatus(job_id, cropListingId);

            setSubmissionMessage({ 
                type: 'success', 
                text: t('messages.gradedSuccess', { grade: gradeDetails.grade, confidence: gradeDetails.confidence })
            });
            
          // In AIGrader.jsx - After grade is received in handleSubmit()

setGradeResult({
  grade: gradeDetails.grade,
  qualityScore: gradeDetails.confidence,
  crop: formData.cropType,
  date: new Date().toLocaleDateString(),
  details: formData.details,
  grade_breakdown: gradeDetails.grade_breakdown || {},
  frames_analyzed: gradeDetails.frames_analyzed || 0,
  error: gradeDetails.error,
  // ✅ Add blockchain verification data
  blockchain: response.data?.blockchain
});

// ✅ FIRE EVENT for VoiceBot to catch
window.dispatchEvent(new CustomEvent('gradeResultReceived', {
  detail: {
    grade: gradeDetails.grade,
    qualityScore: gradeDetails.confidence,
    crop: formData.cropType,
    timestamp: Date.now()
  }
}));

setCurrentStep(6);

        } catch (error) {
            console.error('❌ Submission/Grading error:', error);
            
            let errorMessage = t('errors.submissionFailed');
            if (job_id) {
                errorMessage = t('errors.gradingFailedWithId', { jobId: job_id });
            } else if (error.response) {
                errorMessage = error.response.data?.message || error.message;
            } else {
                errorMessage = error.message;
            }
            
            setSubmissionMessage({ 
                type: 'error', 
                text: errorMessage 
            });
        } finally {
            setLoading(false);
        }
    };

    // ===================== AUTOMATION FUNCTIONS =====================

    const performAutoFillAllFields = () => {
        console.log('🤖 Starting auto-fill of ALL fields...');
        
        const defaults = {
            cropType: 'tomato',
            quantityKg: '100',
            pricePerKg: '50',
            location: 'ಬೆಂಗಳೂರು',
            details: 'ಈ ಬೆಳೆ ತಾಜಾ ಮತ್ತು ಉತ್ತಮ ಗುಣಮಟ್ಟದ್ದಾಗಿದೆ. ಸಾವಯವ ಕೃಷಿ ವಿಧಾನಗಳನ್ನು ಬಳಸಿ ಬೆಳೆಸಲಾಗಿದೆ.',
            marketChoice: 'primary'
        };
        
        setFormData(prev => ({ 
            ...prev, 
            ...defaults,
            photo: prev.photo || []
        }));
        
        const physicalDefaults = {
            colorUniformity: '85',
            sizeConsistency: '80',
            defects: '5',
            freshness: '8',
            moisture: '12'
        };
        
        setFormData(prev => ({
            ...prev,
            physicalAudit: physicalDefaults
        }));
        
        console.log('✅ Auto-fill complete!');
        setAutoStep(2);
        
        setSubmissionMessage({ 
            type: 'success', 
            text: 'Auto-fill complete! All fields have been filled automatically.' 
        });
    };

    const autoClickNextButton = () => {
        console.log('🤖 Looking for Next button to auto-click...');
        
        const buttons = document.querySelectorAll('button');
        let nextButton = null;
        
        for (const button of buttons) {
            const buttonText = button.textContent || '';
            if ((buttonText.includes('Next') || buttonText.includes('ನೆಕ್ಸ್ಟ್')) && 
                !button.disabled && 
                button.offsetParent !== null) {
                nextButton = button;
                break;
            }
        }
        
        if (!nextButton) {
            nextButton = document.querySelector('button.bg-indigo-600:not([disabled])');
        }
        
        if (nextButton) {
            console.log('✅ Found Next button, clicking...');
            nextButton.click();
            return true;
        }
        
        console.log('❌ Next button not found');
        return false;
    };

    const autoClickSubmitButton = () => {
        console.log('🤖 Looking for Submit button to auto-click...');
        
        const buttons = document.querySelectorAll('button');
        let submitButton = null;
        
        for (const button of buttons) {
            const buttonText = button.textContent || '';
            if ((buttonText.includes('Submit') || buttonText.includes('ಸಲ್ಲಿಸು')) && 
                !button.disabled) {
                submitButton = button;
                break;
            }
        }
        
        if (!submitButton) {
            submitButton = document.querySelector('button.bg-gradient-to-r:not([disabled])');
        }
        
        if (submitButton && !submitButton.disabled) {
            console.log('✅ Found Submit button, clicking...');
            submitButton.click();
            return true;
        }
        
        console.log('❌ Submit button not found or disabled');
        return false;
    };

    // ===================== USEEFFECT HOOKS =====================

    useEffect(() => {
        window.updateAIGraderFile = (file) => {
            console.log('🎯 Global function called with file:', file?.name);
            
            if (file) {
                setCropFile(file);
                setFormData(prev => ({ 
                    ...prev, 
                    photo: [file] 
                }));
                
                console.log('✅ File updated via global function:', file.name);
                setSubmissionMessage({ type: '', text: '' });
                
                setTimeout(() => {
                    if (currentStep === 1) {
                        setCurrentStep(2);
                    }
                }, 500);
            }
        };
        
        return () => {
            delete window.updateAIGraderFile;
        };
    }, [currentStep]);

    useEffect(() => {
        const handleVoiceCommand = (event) => {
            console.log('🎯 Voice command received:', event.data);
            
            if (event.data?.type === 'voice_automation') {
                console.log('🤖 Processing voice automation:', event.data.command);
                
                switch (event.data.command) {
                    case 'auto_fill_form':
                        setIsAutoMode(true);
                        performAutoFillAllFields();
                        break;
                        
                    case 'auto_next_step':
                        if (currentStep < totalSteps) {
                            setCurrentStep(prev => prev + 1);
                        }
                        break;
                        
                    case 'auto_submit':
                        handleSubmit();
                        break;
                        
                    case 'auto_select_crop':
                        if (event.data.value) {
                            setFormData(prev => ({ ...prev, cropType: event.data.value }));
                        }
                        break;
                }
            }
        };
        
        window.addEventListener('message', handleVoiceCommand);
        
        window.voiceAutomation = {
            autoFillField: (fieldName, value) => {
                console.log(`🤖 Auto-filling ${fieldName} with:`, value);
                
                if (fieldName === 'cropType') {
                    setFormData(prev => ({ ...prev, cropType: value }));
                } else if (fieldName === 'quantityKg') {
                    setFormData(prev => ({ ...prev, quantityKg: value }));
                } else if (fieldName === 'pricePerKg') {
                    setFormData(prev => ({ ...prev, pricePerKg: value }));
                } else if (fieldName === 'location') {
                    setFormData(prev => ({ ...prev, location: value }));
                } else if (fieldName.startsWith('physicalAudit_')) {
                    const paramKey = fieldName.replace('physicalAudit_', '');
                    setFormData(prev => ({
                        ...prev,
                        physicalAudit: { ...prev.physicalAudit, [paramKey]: value }
                    }));
                }
            },
            
            autoNextStep: () => {
                console.log('🤖 Auto-clicking Next button');
                if (currentStep < totalSteps) {
                    setCurrentStep(prev => prev + 1);
                }
            },
            
            autoSubmitForm: () => {
                console.log('🤖 Auto-submitting form');
                handleSubmit();
            },
            
            autoFillAllFields: () => {
                console.log('🤖 Auto-filling ALL fields');
                performAutoFillAllFields();
            }
        };
        
        return () => {
            window.removeEventListener('message', handleVoiceCommand);
            delete window.voiceAutomation;
        };
    }, [currentStep, totalSteps]);

    useEffect(() => {
        if (isAutoMode && currentStep === 5) {
            const allFilled = formData.quantityKg && formData.pricePerKg && formData.location;
            
            if (allFilled) {
                console.log('✅ All fields filled, auto-submitting in 2 seconds...');
                setAutoStep(5);
                
                const timer = setTimeout(() => {
                    console.log('🤖 Auto-submitting form now...');
                    handleSubmit();
                }, 2000);
                
                return () => clearTimeout(timer);
            }
        }
    }, [isAutoMode, currentStep, formData]);

    // ✅ NEW: Fire event when submit button becomes enabled
    useEffect(() => {
        if (isSubmitEnabled && currentStep === 5) {
            console.log('✅ SUBMIT BUTTON IS NOW ENABLED! Firing event...');
            
            // Emit event for voice automation to catch
            window.dispatchEvent(new CustomEvent('submitButtonEnabled', { 
                detail: { 
                    enabled: true,
                    timestamp: Date.now()
                } 
            }));
        }
    }, [isSubmitEnabled, currentStep]);

    // ✅ NEW: Make submit button globally accessible for automation
    useEffect(() => {
        if (submitButtonRef.current && currentStep === 5) {
            window.__submitButton = submitButtonRef.current;
            console.log('🎯 Submit button ref stored globally:', submitButtonRef.current);
        }
        
        return () => {
            if (window.__submitButton) {
                delete window.__submitButton;
                console.log('🧹 Cleaned up global submit button ref');
            }
        };
    }, [currentStep]);

    // Add these useEffect hooks to AIGrader.jsx

// ✅ EXPOSE FORM DATA GLOBALLY for voice automation
useEffect(() => {
  window.__aiGraderFormData = formData;
  console.log('📊 Global form data updated:', formData);
}, [formData]);

// ✅ EXPOSE STATE UPDATE FUNCTION
useEffect(() => {
  window.updateAIGraderFormData = (data) => {
    console.log('🔧 Updating form data via global function:', data);
    setFormData(prev => ({ ...prev, ...data }));
  };
  
  window.updateAIGraderPhysicalAudit = (audit) => {
    console.log('🔧 Updating physical audit via global function:', audit);
    setFormData(prev => ({
      ...prev,
      physicalAudit: { ...prev.physicalAudit, ...audit }
    }));
  };
  
  return () => {
    delete window.updateAIGraderFormData;
    delete window.updateAIGraderPhysicalAudit;
  };
}, []);

// ✅ FIRE EVENT when submit button becomes enabled
useEffect(() => {
  if (isSubmitEnabled && currentStep === 5) {
    console.log('🎉 SUBMIT BUTTON ENABLED! Firing event...');
    
    // Fire custom event
    window.dispatchEvent(new CustomEvent('submitButtonEnabled', { 
      detail: { 
        enabled: true,
        timestamp: Date.now(),
        formData: formData // Include current form data
      } 
    }));
    
    // Also set a flag for polling to check
    window.__submitButtonReady = true;
  } else {
    window.__submitButtonReady = false;
  }
}, [isSubmitEnabled, currentStep, formData]);



    // ===================== ICON COMPONENTS =====================

    const CameraIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-yellow-400">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z" />
            <circle cx="12" cy="13" r="3" />
        </svg>
    );
    
    const CheckIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-blue-400">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-8.82" />
            <path d="M22 4L12 14.01l-3-3" />
        </svg>
    );
    
    const DetailsIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-green-400">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
    );
    
    const MarketIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-purple-400">
            <path d="M3 6l4-4 4 4" />
            <path d="M11 20h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h2v-6H1v6h22v-6h-2v6h-2" />
        </svg>
    );
    
    const Globe = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-blue-400">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a15.3 15.3 0 0 0 4 10a15.3 15.3 0 0 0-4 10a15.3 15.3 0 0 0-4-10a15.3 15.3 0 0 0 4-10z" />
            <path d="M2.5 7H21.5" />
            <path d="M2.5 17H21.5" />
        </svg>
    );
    
    const Lock = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-purple-400">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    );

    // ===================== RENDER STEP =====================

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <CameraIcon />
                            <h2 className="text-2xl font-bold text-indigo-900 dark:text-white">{t('step1.title')}</h2>
                        </div>
                        
                        {cropFile && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-green-700 font-medium">
                                        Voice-selected: <span className="font-bold">{cropFile.name}</span>
                                    </span>
                                </div>
                            </div>
                        )}
                        
                        <div 
                            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 h-56 cursor-pointer hover:border-indigo-400 transition-all"
                            onDragOver={e => e.preventDefault()}
                            onDrop={handleDragDrop}
                        >
                            <input 
                                type="file" 
                                accept="video/*"
                                data-voice-upload="true"
                                name="videoFile"
                                onChange={handlePhotoUpload}
                                className="hidden" 
                                id="photo-upload" 
                            />
                            <label 
                                htmlFor="photo-upload" 
                                className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-gray-400 dark:text-gray-400"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                <p className="text-lg font-semibold text-indigo-500">{t('step1.uploadPrompt')}</p>
                            </label>
                        </div>
                        
                        {(formData.photo.length > 0 || cropFile) && (
                            <div className="mt-4">
                                <div className="relative group">
                                    <div className="w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 flex flex-col items-center justify-center rounded-lg border-2 border-green-500 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                <span className="text-green-600 text-lg">📹</span>
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-green-800 truncate">
                                                    {cropFile?.name || 'Video File'}
                                                </p>
                                                <p className="text-xs text-green-600">
                                                    {cropFile?.type || 'video/mp4'} • {(cropFile?.size / (1024 * 1024)).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {cropFile && (
                                            <div className="mt-2 flex items-center gap-1">
                                                <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                                    Selected via Voice
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <button
                                        onClick={() => {
                                            setCropFile(null);
                                            setFormData(prev => ({ ...prev, photo: [] }));
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-500 w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                        title="Remove file"
                                    >
                                        <span className="text-white text-sm">×</span>
                                    </button>
                                </div>
                                
                                <div className="mt-4 text-center">
                                    <button
                                        onClick={nextStep}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                                    >
                                        Continue to Step 2 →
                                    </button>
                                    <p className="text-xs text-gray-500 mt-2">
                                        File selected! Click "Next" or say "Next" to continue
                                    </p>
                                </div>
                            </div>
                        )}
                        
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-4 font-medium">{t('step1.description')}</p>
                    </div>
                );

            case 2:
                return (
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <DetailsIcon />
                            <h2 className="text-2xl font-bold text-indigo-900 dark:text-white">{t('step2.title')}</h2>
                        </div>
                        <select
                            name="cropType" 
                            value={formData.cropType}
                            onChange={(e) => handleInputChange('cropType', e.target.value)}
                            className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl p-4 border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none mb-4 appearance-none"
                        >
                            {allCrops.map(crop => (
                                <option key={crop} value={crop}>
                                    {crop.charAt(0).toUpperCase() + crop.slice(1)}
                                </option>
                            ))}
                        </select>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('step2.description')}</p>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        {isAutoMode && autoStep >= 1 && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                                    <span className="text-green-700 text-sm font-medium">
                                        🤖 Auto-filled: Quantity: {formData.quantityKg || '100'}kg, 
                                        Price: ₹{formData.pricePerKg || '50'}/kg, 
                                        Location: {formData.location || 'ಬೆಂಗಳೂರು'}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3 mb-6">
                            <DetailsIcon />
                            <h2 className="text-2xl font-bold text-indigo-900 dark:text-white">{t('step3.title')}</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-yellow-50 rounded-xl border-l-4 border-yellow-600">
                                <label className="text-sm font-semibold text-yellow-700 block mb-2">{t('step3.quantityLabel')}</label>
                                <input
                                    type="number"
                                    name="quantityKg"
                                    value={formData.quantityKg}
                                    onChange={(e) => handleInputChange('quantityKg', e.target.value)}
                                    placeholder={t('step3.quantityPlaceholder')}
                                    className="w-full bg-white text-gray-900 rounded-lg p-3 border border-yellow-300 focus:border-yellow-500 focus:outline-none"
                                    required
                                />
                            </div>
                            <div className="p-4 bg-yellow-50 rounded-xl border-l-4 border-yellow-600">
                                <label className="text-sm font-semibold text-yellow-700 block mb-2">{t('step3.locationLabel')}</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={(e) => handleInputChange('location', e.target.value)}
                                    placeholder={t('step3.locationPlaceholder')}
                                    className="w-full bg-white text-gray-900 rounded-lg p-3 border border-yellow-300 focus:border-yellow-500 focus:outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-indigo-50 rounded-xl border-l-4 border-indigo-600">
                            <label className="text-sm font-semibold text-indigo-700 block mb-2">{t('step3.priceLabel')}</label>
                            <input
                                type="number"
                                name="pricePerKg"
                                value={formData.pricePerKg}
                                onChange={(e) => handleInputChange('pricePerKg', e.target.value)}
                                placeholder={t('step3.pricePlaceholder')}
                                className="w-full bg-white text-gray-900 rounded-lg p-3 border border-indigo-300 focus:border-indigo-500 focus:outline-none"
                                required
                            />
                            <p className="text-xs text-indigo-500 mt-2">{t('step3.priceDescription')}</p>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white pt-4 border-t border-gray-200">
                            {t('step3.auditSection')} {t(dynamicAudit.title)}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {dynamicAudit.fields.map(field => (
                                <div key={field.key}>
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">{t(field.label)} ({field.unit})</label>
                                    <input
                                        type="text"
                                        value={formData.physicalAudit[field.key] || ''}
                                        onChange={(e) => handlePhysicalAuditChange(field.key, e.target.value)}
                                        placeholder={t(field.placeholder)}
                                        className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl p-4 border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                            ))}
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-4 font-medium">{t('step3.auditDescription')}</p>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <DetailsIcon />
                                <h2 className="text-2xl font-bold text-indigo-900 dark:text-white">{t('step4.title')}</h2>
                            </div>
                            <textarea
                                value={formData.details}
                                onChange={(e) => handleInputChange('details', e.target.value)}
                                placeholder={t('step4.placeholder')}
                                className="w-full h-40 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl p-6 border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                            />
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 font-medium">{t('step4.description')}</p>
                        </div>
                    </div>
                );

           // Add this to your AIGrader.jsx in the step 5 render section

// Replace the current submit button in case 5 with this:

case 5:
    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <MarketIcon />
                <h2 className="text-2xl font-bold text-indigo-900 dark:text-white">{t('step5.title')}</h2>
            </div>
            <div className="space-y-6">
                <div
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.marketChoice === 'primary'
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800'
                    }`}
                    onClick={() => handleInputChange('marketChoice', 'primary')}
                    data-market="primary"
                >
                    <div className="flex items-center gap-4">
                        <Globe />
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('step5.primaryMarket.title')}</h3>
                            <p className="text-gray-500 dark:text-gray-400">{t('step5.primaryMarket.description')}</p>
                        </div>
                    </div>
                </div>

                <div
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.marketChoice === 'zero-waste'
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800'
                    }`}
                    onClick={() => handleInputChange('marketChoice', 'zero-waste')}
                >
                    <div className="flex items-center gap-4">
                        <Lock />
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('step5.zeroWasteMarket.title')}</h3>
                            <p className="text-gray-500 dark:text-gray-400">{t('step5.zeroWasteMarket.description')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ✅ UPDATED SUBMIT BUTTON - Enhanced for voice automation */}
            <button
                ref={submitButtonRef}
                id="final-submit-button"
                data-automation="submit-crop"
                data-voice-submit="true"
                onClick={(e) => {
                    console.log('🖱️ Submit button clicked!', {
                        disabled: e.currentTarget.disabled,
                        loading,
                        hasQuantity: !!formData.quantityKg,
                        hasPrice: !!formData.pricePerKg,
                        hasLocation: !!formData.location
                    });
                    handleSubmit();
                }}
                disabled={!isSubmitEnabled}
                className={`w-full mt-6 px-8 py-3 rounded-xl font-semibold transition-all transform ${
                    !isSubmitEnabled
                        ? 'bg-gray-400 cursor-not-allowed opacity-50'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]'
                }`}
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        {t('submitButton.loading')}
                    </span>
                ) : (
                    <>
                        <span className="inline-block mr-2">📤</span>
                        {t('submitButton.submit')}
                    </>
                )}
            </button>
            
            {/* ✅ Debug info for development */}
            {process.env.NODE_ENV === 'development' && currentStep === 5 && (
                <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
                    <div className="font-bold text-indigo-600 dark:text-indigo-400 mb-1">🐛 Debug Info:</div>
                    <div className="text-gray-700 dark:text-gray-300">
                        <div>Button Enabled: {isSubmitEnabled ? '✅ YES' : '❌ NO'}</div>
                        <div>Quantity: {formData.quantityKg || '❌ empty'}</div>
                        <div>Price: {formData.pricePerKg || '❌ empty'}</div>
                        <div>Location: {formData.location || '❌ empty'}</div>
                        <div>Loading: {loading ? 'YES' : 'NO'}</div>
                    </div>
                </div>
            )}
            
            {/* ✅ Visual status indicator for automation */}
            {isAutoMode && isSubmitEnabled && (
                <div className="mt-3 text-center animate-pulse">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-300 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                        <span className="text-sm text-green-700 font-medium">
                            ✅ Ready for auto-submission
                        </span>
                    </div>
                </div>
            )}
        </div>
    );

    case 6:
                return (
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <CheckIcon />
                            <h2 className="text-2xl font-bold text-indigo-900 dark:text-white">
                                {gradeResult?.error ? 'Submission Complete' : t('step6.title')}
                            </h2>
                        </div>
                        
                        {gradeResult?.error && (
                            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                                <p className="text-yellow-800 font-semibold">⚠️ Grading Status: Pending</p>
                                <p className="text-sm text-yellow-700 mt-2">{gradeResult.error}</p>
                                <p className="text-xs text-yellow-600 mt-1">
                                    Your crop has been listed but AI grading is temporarily unavailable. 
                                    The grade will be updated once the ML service is back online.
                                </p>
                            </div>
                        )}
                        
                        {gradeResult && (
                            <div className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl p-8 border border-gray-300 dark:border-gray-600 shadow-2xl space-y-6">
                                
                                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{t('step6.gradeLabel')}</p>
                                        <h3 className={`text-4xl font-extrabold mt-1 ${
                                            gradeResult.grade === 'Pending' 
                                                ? 'text-yellow-600 dark:text-yellow-400' 
                                                : 'text-green-600 dark:text-green-400'
                                        }`}>
                                            {gradeResult.grade}
                                        </h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{t('step6.qualityScoreLabel')}</p>
                                        <p className="text-3xl font-extrabold text-indigo-900 dark:text-white">
                                            {gradeResult.qualityScore > 0 ? `${gradeResult.qualityScore}%` : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                {!gradeResult.error && gradeResult.grade !== 'Pending' && (
                                    <div className="bg-green-50 p-4 rounded-lg border border-green-200 space-y-3">
                                        <div>
                                            <p className="text-sm font-semibold text-green-700">Indicative Grade Value (IGV)</p>
                                            <h3 className="text-3xl font-bold text-green-900">
                                                ₹{((parseFloat(formData.pricePerKg) || 50) * (1 + (gradeResult.qualityScore - 80) / 100)).toFixed(2)}/kg
                                            </h3>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-gray-100 rounded-lg">
                                        <p className="text-sm font-semibold text-indigo-700 mb-1">Analysis Details</p>
                                        <p className="text-xs text-gray-700">Frames Analyzed: {gradeResult.frames_analyzed || 0}</p>
                                        <p className="text-xs text-gray-700">Crop Type: {gradeResult.crop}</p>
                                    </div>
                                    <div className="p-3 bg-gray-100 rounded-lg">
                                        <p className="text-sm font-semibold text-indigo-700 mb-1">Grade Breakdown</p>
                                        {gradeResult.grade_breakdown && Object.keys(gradeResult.grade_breakdown).length > 0 ? (
                                            Object.entries(gradeResult.grade_breakdown).map(([grade, conf]) => (
                                                <p key={grade} className="text-xs text-gray-700">
                                                    Grade {grade}: {conf.toFixed(1)}%
                                                </p>
                                            ))
                                        ) : (
                                            <p className="text-xs text-gray-500">Not available</p>
                                        )}
                                    </div>
                                </div>

                                {/* ✅ BLOCKCHAIN VERIFICATION BADGE WITH HASH & ALGORAND LINK */}
                                {gradeResult.blockchain?.verified && (
                                    <div className="mt-4 p-5 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl border-2 border-emerald-300 dark:border-emerald-600 shadow-lg">
                                        <div className="flex items-start gap-3">
                                            <svg className="w-10 h-10 text-emerald-600 dark:text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                            </svg>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h4 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">🔐 Video Stored on Blockchain</h4>
                                                    <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-bold">✓ VERIFIED</span>
                                                </div>
                                                <p className="text-sm text-emerald-700 dark:text-emerald-400 mb-4">Your crop video has been hashed and stored on Algorand TestNet for tamper-proof verification</p>
                                                
                                                {/* Video Hash Display - PROMINENT */}
                                                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-2 border-emerald-300 dark:border-emerald-500 shadow-inner">
                                                    <p className="text-sm text-emerald-700 dark:text-emerald-300 font-bold mb-2">📄 Video Hash (SHA-256):</p>
                                                    <p className="text-base font-mono text-gray-800 dark:text-gray-100 break-all bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded border border-emerald-200 dark:border-emerald-600">
                                                        {gradeResult.blockchain.hash || 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'}
                                                    </p>
                                                </div>
                                                
                                                {/* Algorand Explorer Link */}
                                                <a 
                                                    href={gradeResult.blockchain.explorerUrl || 'https://lora.algokit.io/testnet/application/756282697'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-lg text-sm font-bold transition-all shadow-md hover:shadow-lg"
                                                >
                                                    🔗 View on Algorand Explorer →
                                                </a>
                                                
                                                <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-3 font-medium">
                                                    Network: Algorand TestNet | App ID: {gradeResult.blockchain.appId || '756282697'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={resetForm}
                                    className="w-full mt-4 bg-gradient-to-r from-green-500 to-teal-500 text-white px-8 py-3 rounded-xl font-extrabold text-lg hover:scale-[1.02] transition-transform"
                                >
                                    List Another Crop
                                </button>
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 pt-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-indigo-900 dark:text-white mb-4">{t('header.title')}</h1>
                    <p className="text-indigo-700 dark:text-gray-300">{t('header.subtitle')}</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-12">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-500">{t('progress.step', { current: currentStep, total: totalSteps })}</span>
                        <span className="text-gray-500">{Math.round((currentStep / totalSteps) * 100)}% {t('progress.complete')}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <motion.div
                            className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                        ></motion.div>
                    </div>
                </motion.div>

                {submissionMessage.text && (
                    <div className={`p-4 mb-6 rounded-lg font-semibold ${
                        submissionMessage.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' :
                        submissionMessage.type === 'error' ? 'bg-red-100 text-red-700 border border-red-300' :
                        'bg-blue-100 text-blue-700 border border-blue-300'
                    }`}>
                        {submissionMessage.text}
                    </div>
                )}

{isAutoMode && (
  <div className="p-3 mb-4 bg-blue-50 border border-blue-200 rounded-lg">
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
      <span className="text-blue-700 font-medium">
        🤖 Auto Mode Active - Step {autoStep} of 5
      </span>
    </div>
    <p className="text-xs text-blue-600 mt-1">
      The system is automatically filling your form. Sit back and relax!
    </p>
  </div>
)}                

                <motion.div 
                    key={currentStep}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-2xl"
                >
                    {renderStep()}

                    <div className="flex justify-between items-center mt-12">
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 1 || loading}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                                currentStep === 1 || loading
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500' 
                                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300 hover:scale-[1.03] dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
                            }`}
                        >
                            {t('navigation.previous')}
                        </button>

                        {currentStep < 5 ? (
                            <button
                                onClick={nextStep}
                                disabled={loading}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                                    loading
                                        ? 'bg-indigo-300 text-white cursor-wait'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-[1.03]'
                                }`}
                            >
                                {t('navigation.next')}
                            </button>
                        ) : currentStep === 5 ? (
                             <button
                                onClick={handleSubmit}
                                disabled={loading || !formData.quantityKg || !formData.pricePerKg}
                                className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-wait"
                            >
                                {loading ? t('submitButton.loading') : t('submitButton.submit')}
                            </button>
                        ) : (
                            <button
                                onClick={resetForm}
                                className="px-6 py-3 rounded-xl font-semibold bg-green-500 text-white hover:bg-green-600 transition-colors"
                            >
                                {t('navigation.newGrade')}
                            </button>
                        )}
                    </div>
                </motion.div>

                {history.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-12">
                        <h2 className="text-2xl font-bold text-indigo-900 dark:text-white mb-6">{t('history.title')}</h2>
                        <div className="space-y-4">
                            {history.map((item, index) => (
                                <div key={index} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md flex justify-between items-center border border-gray-100 dark:border-gray-700">
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-white">{t('history.crop', { crop: item.crop })}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('history.date', { date: item.date })}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-xl font-bold ${
                                            item.grade === 'A' ? 'text-green-600' :
                                            item.grade === 'B' ? 'text-yellow-600' :
                                            'text-red-600'
                                        }`}>{t('history.grade', { grade: item.grade })}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{item.qualityScore}%</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default AIGrader;


