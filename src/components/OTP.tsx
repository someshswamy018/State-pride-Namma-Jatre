import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from "motion/react";
import { ChevronLeft } from "lucide-react";
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cn } from '../lib/utils';

export default function OTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const phoneNumber = location.state?.phoneNumber || '+91 XXXXX XXXXX';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(25);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    const newOtp = ['', '', '', '', '', ''];
    val.split('').slice(0, 6).forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
  };

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter complete 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (window.confirmationResult) {
        const result = await window.confirmationResult.confirm(code);
        const user = result.user;

        // Check if user profile exists in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          // Navigate to registration for new users
          navigate('/register');
        } else {
          const data = userDocSnap.data();
          if (data.userType === 'Admin') {
            navigate('/admin');
          } else if (data.userType === 'Volunteer') {
            navigate('/volunteer/home');
          } else {
            navigate('/'); 
          }
        }
      } else {
        setError('Verification session expired. Please go back and try again.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Invalid OTP. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeypadPress = (val: string) => {
    if (val === 'delete') {
      const newOtp = [...otp];
      let lastIdx = -1;
      for (let i = newOtp.length - 1; i >= 0; i--) {
        if (newOtp[i] !== '') {
          lastIdx = i;
          break;
        }
      }
      if (lastIdx !== -1) {
        newOtp[lastIdx] = '';
        setOtp(newOtp);
        if (inputRef.current) {
          inputRef.current.value = newOtp.join('');
        }
      }
      return;
    }

    const firstEmptyIdx = otp.findIndex(v => v === '');
    if (firstEmptyIdx !== -1) {
      const newOtp = [...otp];
      newOtp[firstEmptyIdx] = val;
      setOtp(newOtp);
      
      // Update hidden input too
      if (inputRef.current) {
        inputRef.current.value = newOtp.join('');
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen w-full bg-[#FDF5E6] flex flex-col items-center py-12 px-6"
    >
      {/* Header */}
      <div className="w-full flex items-center mb-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full active:bg-orange-50 transition-colors">
          <ChevronLeft className="w-8 h-8 text-[#002D72]" />
        </button>
      </div>

      <div className="w-full max-w-sm flex flex-col items-center">
        <h2 className="font-serif text-3xl font-black text-[#002D72] mb-3 text-center">Verify Your Number</h2>
        <p className="text-[#555555] text-sm font-medium opacity-80 text-center mb-12">
          Enter the OTP sent to <span className="font-bold text-[#F27D26]">{phoneNumber}</span>
        </p>

        {/* OTP Input Boxes */}
        <div 
          className="relative flex gap-2 mb-8 justify-center w-full cursor-pointer"
          onClick={() => inputRef.current?.focus()}
        >
          {/* Hidden Input for Keyboard Support */}
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={otp.join('')}
            onChange={handleInputChange}
            className="absolute inset-0 opacity-0 cursor-default"
            autoFocus
          />
          
          {otp.map((digit, i) => {
            const isActive = otp.findIndex(v => v === '') === i;
            return (
              <div 
                key={i} 
                className={cn(
                  "w-12 h-14 bg-white border-2 rounded-xl flex items-center justify-center font-serif text-2xl font-black transition-all",
                  digit ? "border-[#F27D26] text-[#F27D26]" : "border-gray-100 text-[#002D72]",
                  isActive && "border-[#F27D26] ring-4 ring-orange-100 scale-105"
                )}
              >
                {digit}
              </div>
            );
          })}
        </div>

        {error && <p className="text-red-500 text-xs font-semibold mb-6">{error}</p>}

        {/* Timer */}
        <p className="text-[#555555] text-sm font-bold mb-8">
          Resend OTP in <span className="text-[#F27D26]">00:{timer.toString().padStart(2, '0')}</span>
        </p>

        <button 
          onClick={handleVerify}
          disabled={loading}
          className={cn(
            "w-full bg-[#F27D26] text-white font-black py-4 rounded-xl shadow-lg shadow-orange-200 mb-12 active:scale-95 transition-transform flex items-center justify-center",
            loading && "opacity-70"
          )}
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "VERIFY"
          )}
        </button>

        {/* Custom Numeric Keypad */}
        <div className="w-full grid grid-cols-3 gap-y-4 gap-x-8 mt-auto px-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'delete'].map((num, i) => {
            if (num === '') return <div key={i} />;
            return (
              <button 
                key={i}
                onClick={() => handleKeypadPress(num.toString())}
                className="h-14 flex items-center justify-center text-2xl font-black text-[#002D72] rounded-2xl active:bg-orange-50 transition-colors"
              >
                {num === 'delete' ? (
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z"/></svg>
                ) : num}
              </button>
            )
          })}
        </div>
      </div>
    </motion.div>
  );
}
