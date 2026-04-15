import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, CheckCircle, Leaf, Handshake, Truck, User } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast'; 

// 🔑 FIXED: Adjusted relative path to account for typical component nesting (e.g., src/pages/auth/ -> src/context/)
import { useAuth } from '../context/AuthContext'; 

const SignupPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // Get the login function from the Auth context
  const { login } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'farmer',
    termsAccepted: false
  });
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!formData.termsAccepted) {
      setError('Please accept the terms and conditions.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Send registration data to the backend endpoint
     const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // 🔑 CRITICAL FIX: This allows the browser to send/receive cookies
        // across different ports (e.g., React on 3000, Express on 5000).
        credentials: 'include', 
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // 2. Success: Use the context's login function to set global auth state
        login(data); // The data object contains { user: { name, email, role }, token, success }
        
      
      
        // 3. Navigate to the main freelancer dashboard
         navigate('/dashboard');
      } else {
        // 4. Failure: Display server-side error
        const errorMessage = data.message || 'Signup failed. Please check your credentials.';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      // 5. Catch network or unexpected errors (often CORS-related if backend isn't configured)
      const errorMessage = 'Network error or unable to connect. Please ensure the backend is running and CORS is configured.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    // Google sign-up disabled - use backend auth instead
    toast.error("Google sign-up not configured. Please use email/password.");
    return;
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-200/50 to-green-50 dark:from-slate-900 dark:via-emerald-900/20 dark:to-slate-900 flex items-center justify-center px-4 py-8 font-sans transition-colors duration-500">
      {/* Toaster component to display success/error notifications */}
      <Toaster position="top-center" />
      
      {/* Background decoration (colors updated to green/emerald theme) */}
      <div className="absolute inset-0 overflow-hidden">
        <style>{`
          .animate-fade-in {
            animation: fadeIn 0.3s ease-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lime-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Back to Home */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-emerald-700 dark:hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Main Card */}
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            {/* Logo for marketplace theme */}
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-lime-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Leaf className="w-8 h-8 text-white"/>
            </div>
             <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('Join Farm2Market')}</h1>
            <p className="text-gray-600 dark:text-gray-400">{t('Sign up and start selling your produce')}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
             <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                {t('Your Role')}:
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'farmer' })}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    formData.role === 'farmer'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400'
                  }`}
                >
                  <Leaf className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-semibold">{t('Farmer')}</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'buyer' })}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    formData.role === 'buyer'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400'
                  }`}
                >
                  <User className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-semibold">{t('Buyer')}</div>
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ex: Alex Johnson"
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a strong password"
                  className="w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Password should be at least 8 characters long
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleInputChange}
                className="mt-1 rounded border-gray-400 bg-gray-200 text-emerald-600 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                I agree to the{' '}
                <a href="/terms" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 underline">
                  Terms of Service
                </a>
                {' '}and{' '}
                <a href="/privacy" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 underline">
                  Privacy Policy
                </a>
                .
              </label>
            </div>

            {/* Error Message Display */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 p-3 rounded-xl text-sm transition-all duration-300 animate-fade-in">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-emerald-600 to-lime-600 text-white py-3 px-4 rounded-xl font-semibold transition-all shadow-lg ${
                isLoading
                  ? 'opacity-50 cursor-not-allowed flex items-center justify-center'
                  : 'hover:from-emerald-700 hover:to-lime-700 hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl'
              }`}
            >
               {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('Registering...')}
                </>
              ) : (
                t('Register My Account')
              )}
            </button>
          </form>

          {/* Benefits - Updated to reflect Farmer advantages */}
          <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-semibold">Farmer Benefits:</span>
            </div>
            <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1 ml-6">
              <li className='flex items-start gap-1'>
                <Handshake className="w-3 h-3 mt-1"/> Sell **Directly** to Verified Buyers
              </li>
              <li className='flex items-start gap-1'>
                <Leaf className="w-3 h-3 mt-1"/> Higher Profits (30-40% more)
              </li>
              <li className='flex items-start gap-1'>
                <Truck className="w-3 h-3 mt-1"/> Logistics Support & Timely Pickup
              </li>
            </ul>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">or</span>
            </div>
          </div>

          {/* Social sign in stuff */}
          <div className="space-y-3">
            <button onClick={handleGoogleSignUp} className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign up with Google
            </button>
            
            <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Sign up with GitHub
            </button>
          </div>

          {/* Sign In Link */}
          <div className="text-center mt-8">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Join thousands of farmers achieving **fair pricing** and **direct sales**.
          </p>
        </div>
      </div>
    </div>
  );
};


export default SignupPage;

