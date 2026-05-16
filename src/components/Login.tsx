import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from "motion/react";
import { Phone, ArrowRight } from "lucide-react";
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  signInWithPopup
} from "firebase/auth";
import { auth, googleProvider, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';

export default function Login() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Cleanup function to clear recaptcha on unmount
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch (e) {
          console.error('Error clearing recaptcha:', e);
        }
      }
    };
  }, []);

  const initRecaptcha = async () => {
    try {
      // 1. Clear existing verifier and widget if any to prevent duplicates
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          console.warn('Error clearing existing verifier:', e);
        }
        window.recaptchaVerifier = null;
      }

      // 2. Reset the grecaptcha if it exists (safeguard for invisible reCAPTCHA)
      if (window.grecaptcha && window.recaptchaWidgetId !== undefined) {
        try {
          window.grecaptcha.reset(window.recaptchaWidgetId);
        } catch (e) {
          // ignore reset errors
        }
      }

      // 3. Create new verifier instance
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          setError('reCAPTCHA expired. Please try again.');
          if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = null;
          }
        }
      });

      // 4. Render the verifier to get a widget ID
      window.recaptchaWidgetId = await verifier.render();
      window.recaptchaVerifier = verifier;
      
      return verifier;
    } catch (err) {
      console.error('Failed to initialize RecaptchaVerifier:', err);
      throw new Error('reCAPTCHA initialization failed. Please ensure you have added the current domain to your Firebase Authorized Domains.');
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const appVerifier = await initRecaptcha();
      const formattedNumber = `+91${phoneNumber}`;
      const confirmationResult = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
      
      // Store confirmation result in window or state for OTP screen
      window.confirmationResult = confirmationResult;
      
      navigate('/otp', { state: { phoneNumber: formattedNumber } });
    } catch (err: any) {
      console.error('OTP Send Error:', err);
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      if (err.code === 'auth/invalid-app-credential') {
        errorMessage = 'Invalid app credentials. This usually means the domain is not allowlisted in Firebase Console.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (err.code === 'auth/captcha-check-failed') {
        errorMessage = 'reCAPTCHA check failed. Please try again.';
      } else if (err.code === 'auth/internal-error') {
        errorMessage = 'Internal authentication error. Please try again later.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // If error occurs, reset verifier to allow fresh start
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {}
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Force account selection for a better user experience
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, googleProvider);
      
      if (result.user) {
        // Successful login
        console.log('Google Login Success:', result.user.uid);
        
        // Check if profile exists
        const userDoc = await getDoc(doc(db, 'users', result.user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.userType === 'Admin') {
            navigate('/admin');
          } else if (data.userType === 'Volunteer') {
            navigate('/volunteer/home');
          } else {
            navigate('/'); 
          }
        } else {
          navigate('/register'); // Redirect to registration
        }
      }
    } catch (err: any) {
      console.error('Google Login Error:', err);
      let errorMessage = 'Google login failed.';
      
      if (err.code === 'auth/unauthorized-domain') {
        // Very important for AI Studio preview
        errorMessage = `Domain unauthorized: Please add "${window.location.hostname}" to Authorized Domains in your Firebase Console (Authentication > Settings > Authorized domains).`;
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Multiple popups blocked or popup was blocked by browser. Please allow popups for this site.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Login window closed before completion. Please try again.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Only one popup request allowed at a time.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen w-full bg-[#FDF5E6] bg-gradient-to-b from-[#FFFBF0] to-[#FFF4E0] relative flex flex-col items-center py-12 px-6"
    >
      {/* reCAPTCHA Container (Required for Firebase Phone Auth) */}
      <div id="recaptcha-container"></div>
      {/* Top Decorations */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none z-0 overflow-hidden h-32">
        <div className="flex justify-between -mt-4 opacity-50">
           <svg className="w-24 h-24 text-orange-400 transform -rotate-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L9 9H2L7 14L5 21L12 17L19 21L17 14L22 9H15L12 2Z"/></svg>
           <svg className="w-24 h-24 text-yellow-400 rotate-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L9 9H2L7 14L5 21L12 17L19 21L17 14L22 9H15L12 2Z"/></svg>
        </div>
      </div>

      <div className="w-full max-w-sm flex flex-col items-center z-10">
        {/* Welcome Section */}
        <div className="text-center mt-12 mb-12">
          <h2 className="font-serif text-4xl font-black text-[#002D72] mb-2 tracking-tight">Welcome!</h2>
          <p className="text-[#555555] font-medium opacity-80">Login to continue</p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSendOtp} className="w-full flex flex-col gap-6">
          <div className="relative">
            <label className="text-[12px] font-bold uppercase tracking-wider text-[#002D72] opacity-60 ml-2 mb-1 block">
              Mobile Number
            </label>
            <div className="flex items-center bg-white border-2 border-orange-100 rounded-2xl p-4 shadow-sm focus-within:border-[#F27D26] transition-all">
              <span className="font-bold text-[#002D72] mr-3 border-r pr-3 border-gray-100">+91</span>
              <input 
                type="tel" 
                maxLength={10}
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter mobile number" 
                className="flex-1 bg-transparent border-none outline-none font-bold text-[#002D72] placeholder:text-gray-300 tracking-wider"
              />
              <Phone className="w-5 h-5 text-orange-400 opacity-40" />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs font-medium ml-2">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className={cn(
              "w-full bg-[#F27D26] text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-200 flex items-center justify-center gap-3 active:scale-95 transition-transform",
              loading && "opacity-70"
            )}
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>GET OTP</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="w-full flex items-center gap-4 my-10">
          <div className="flex-1 h-[1px] bg-[#002D72] opacity-10"></div>
          <span className="text-[12px] font-black text-[#002D72] opacity-30">OR</span>
          <div className="flex-1 h-[1px] bg-[#002D72] opacity-10"></div>
        </div>

        {/* Social Login */}
        <button 
          onClick={handleGoogleLogin} 
          disabled={loading}
          className="w-full bg-white border-2 border-gray-100 text-[#002D72] font-bold py-4 rounded-2xl flex items-center justify-center gap-4 active:scale-95 transition-transform shadow-sm"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          </div>
          <span>Continue with Google</span>
        </button>

        {/* Footer */}
        <div className="mt-auto pt-12 pb-8 flex flex-col items-center gap-2">
          <p className="text-[#555555] text-sm flex gap-1">
            New User? 
            <span 
              onClick={() => navigate('/register')}
              className="text-[#F27D26] font-bold cursor-pointer hover:underline"
            >
              Register here
            </span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

declare global {
  interface Window {
    recaptchaVerifier: any;
    recaptchaWidgetId: any;
    grecaptcha: any;
    confirmationResult: any;
  }
}
