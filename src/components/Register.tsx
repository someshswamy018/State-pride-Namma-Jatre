import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from "motion/react";
import { 
  User, 
  Mail, 
  MapPin, 
  Phone, 
  Camera, 
  FileText, 
  ChevronDown, 
  ArrowLeft,
  ChevronLeft
} from "lucide-react";
import { auth, db, storage } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { cn } from '../lib/utils';

const GENDERS = ['Male', 'Female', 'Other'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const VILLAGES = ['Bhalki', 'Humnabad', 'Bidar', 'Basavakalyan', 'Aurad', 'Kamalnagar', 'Udgir', 'Other'];
const USER_TYPES = ['Village Member', 'Tourist / Visitor', 'Event Organizer', 'Volunteer'];
const ID_PROOF_TYPES = ['Aadhaar Card', 'PAN Card', 'Driving License', 'Voter ID', 'Other'];

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    age: '',
    gender: '',
    bloodGroup: '',
    village: '',
    userType: '',
    address: '',
    idProofType: ''
  });

  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>('');
  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const [idProofPreview, setIdProofPreview] = useState<string>('');

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/login');
    }
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'id') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'profile') {
        setProfilePhoto(file);
        setProfilePhotoPreview(URL.createObjectURL(file));
      } else {
        setIdProofFile(file);
        setIdProofPreview(URL.createObjectURL(file));
      }
    }
  };

  const uploadFile = async (file: File, path: string) => {
    const fileRef = ref(storage, `all-photo/${auth.currentUser?.uid}_${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    // Comprehensive validation
    if (!formData.fullName.trim()) {
      setError('Full Name is required');
      return;
    }
    if (!formData.age || isNaN(parseInt(formData.age))) {
      setError('Valid Age is required');
      return;
    }
    if (!formData.gender) {
      setError('Please select your Gender');
      return;
    }
    if (!formData.bloodGroup) {
      setError('Please select your Blood Group');
      return;
    }
    if (!formData.village) {
      setError('Please select your Village');
      return;
    }
    if (!formData.userType) {
      setError('Please select User Type');
      return;
    }
    if (!formData.address.trim()) {
      setError('Address is required');
      return;
    }
    if (!formData.idProofType) {
      setError('Please select ID Proof Type');
      return;
    }
    if (!idProofFile) {
      setError('Please upload your ID Proof document');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let profilePhotoUrl = '';
      let idProofUrl = '';

      if (profilePhoto) {
        profilePhotoUrl = await uploadFile(profilePhoto, 'profile_photos');
      }

      if (idProofFile) {
        idProofUrl = await uploadFile(idProofFile, 'id_proofs');
      }

      const isVolunteer = formData.userType === 'Volunteer';
      const isAdminEmail = (formData.email || auth.currentUser.email || '').toLowerCase().includes('someshswamy');

      const userProfile = {
        uid: auth.currentUser.uid,
        phoneNumber: auth.currentUser.phoneNumber || '',
        email: formData.email || auth.currentUser.email || '',
        fullName: formData.fullName,
        age: parseInt(formData.age),
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        village: formData.village,
        userType: isAdminEmail ? 'Admin' : formData.userType,
        address: formData.address,
        idProofType: formData.idProofType,
        profilePhotoUrl,
        idProofUrl,
        createdAt: serverTimestamp(),
        // Volunteer specific initialization
        ...(isVolunteer && !isAdminEmail ? {
          volunteerId: `V-${Math.floor(10000 + Math.random() * 90000)}`,
          verified: false,
          assignedArea: 'Main Temple',
          totalHours: 0,
          peopleHelped: 0,
          rating: 5,
          joinedAt: serverTimestamp(),
          about: ''
        } : {})
      };

      await setDoc(doc(db, 'users', auth.currentUser.uid), userProfile);
      
      if (isAdminEmail) {
        navigate('/admin');
      } else if (isVolunteer) {
        navigate('/volunteer/home');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('Registration Error:', err);
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#FDF5E6] flex flex-col relative"
    >
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#FDF5E6] border-b border-orange-100 flex items-center px-6 py-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[#002D72]">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="ml-4 font-serif text-xl font-black text-[#002D72]">New Registration</span>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 pb-24 max-w-md mx-auto w-full">
        {/* Profile Photo Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-white border-4 border-orange-100 flex items-center justify-center overflow-hidden shadow-md">
              {profilePhotoPreview ? (
                <img src={profilePhotoPreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-orange-200" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-[#F27D26] p-2 rounded-full border-2 border-[#FDF5E6] shadow-md cursor-pointer">
              <Camera className="w-4 h-4 text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoChange(e, 'profile')} />
            </label>
          </div>
          <p className="text-xs font-bold text-[#002D72] opacity-40 uppercase tracking-widest">Profile Photo</p>
        </div>

        <div className="flex flex-col gap-6">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-[12px] font-bold uppercase tracking-wider text-[#002D72] opacity-60 ml-2 block">Full Name *</label>
            <div className="flex items-center bg-white border-2 border-orange-100 rounded-2xl p-4 shadow-sm focus-within:border-[#F27D26] transition-all">
              <input 
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter full name" 
                className="flex-1 bg-transparent border-none outline-none font-bold text-[#002D72] placeholder:text-gray-300"
              />
              <User className="w-5 h-5 text-orange-400 opacity-40" />
            </div>
          </div>

          {/* Mobile (Read Only) */}
          <div className="space-y-1">
            <label className="text-[12px] font-bold uppercase tracking-wider text-[#002D72] opacity-60 ml-2 block">Mobile Number</label>
            <div className="flex items-center bg-gray-50 border-2 border-orange-100/50 rounded-2xl p-4 shadow-sm opacity-60">
              <input 
                readOnly
                value={auth.currentUser?.phoneNumber || ''}
                className="flex-1 bg-transparent border-none outline-none font-bold text-[#002D72]"
              />
              <Phone className="w-5 h-5 text-orange-400 opacity-40" />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-[12px] font-bold uppercase tracking-wider text-[#002D72] opacity-60 ml-2 block">Email Address</label>
            <div className="flex items-center bg-white border-2 border-orange-100 rounded-2xl p-4 shadow-sm focus-within:border-[#F27D26] transition-all">
              <input 
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address" 
                className="flex-1 bg-transparent border-none outline-none font-bold text-[#002D72] placeholder:text-gray-300"
              />
              <Mail className="w-5 h-5 text-orange-400 opacity-40" />
            </div>
          </div>

          {/* Age & Gender Row */}
          <div className="flex gap-4">
             {/* Age */}
            <div className="flex-1 space-y-1">
              <label className="text-[12px] font-bold uppercase tracking-wider text-[#002D72] opacity-60 ml-2 block">Age *</label>
              <div className="flex items-center bg-white border-2 border-orange-100 rounded-2xl p-4 shadow-sm focus-within:border-[#F27D26] transition-all">
                <input 
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="Age" 
                  className="flex-1 bg-transparent border-none outline-none font-bold text-[#002D72] placeholder:text-gray-300"
                />
              </div>
            </div>
            {/* Gender */}
            <div className="flex-1 space-y-1">
              <label className="text-[12px] font-bold uppercase tracking-wider text-[#002D72] opacity-60 ml-2 block">Gender *</label>
              <div className="relative flex items-center bg-white border-2 border-orange-100 rounded-2xl shadow-sm focus-within:border-[#F27D26] transition-all">
                <select 
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-none outline-none font-bold text-[#002D72] appearance-none p-4 pr-10"
                >
                  <option value="" disabled>Select</option>
                  {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <div className="absolute right-4 pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-[#F27D26]" />
                </div>
              </div>
            </div>
          </div>

          {/* Blood Group */}
          <div className="space-y-1">
            <label className="text-[12px] font-bold uppercase tracking-wider text-[#002D72] opacity-60 ml-2 block">Blood Group *</label>
            <div className="relative flex items-center bg-white border-2 border-orange-100 rounded-2xl shadow-sm focus-within:border-[#F27D26] transition-all">
              <select 
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleInputChange}
                className="w-full bg-transparent border-none outline-none font-bold text-[#002D72] appearance-none p-4 pr-10"
              >
                <option value="" disabled>Select blood group</option>
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
              <div className="absolute right-4 pointer-events-none">
                <ChevronDown className="w-4 h-4 text-[#F27D26]" />
              </div>
            </div>
          </div>

          {/* Village */}
          <div className="space-y-1">
            <label className="text-[12px] font-bold uppercase tracking-wider text-[#002D72] opacity-60 ml-2 block">Village Name *</label>
            <div className="relative flex items-center bg-white border-2 border-orange-100 rounded-2xl shadow-sm focus-within:border-[#F27D26] transition-all">
              <select 
                name="village"
                value={formData.village}
                onChange={handleInputChange}
                className="w-full bg-transparent border-none outline-none font-bold text-[#002D72] appearance-none p-4 pr-10"
              >
                <option value="" disabled>Select village</option>
                {VILLAGES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <div className="absolute right-4 pointer-events-none">
                <ChevronDown className="w-4 h-4 text-[#F27D26]" />
              </div>
            </div>
          </div>

          {/* User Type */}
          <div className="space-y-1">
            <label className="text-[12px] font-bold uppercase tracking-wider text-[#002D72] opacity-60 ml-2 block">User Type *</label>
            <div className="relative flex items-center bg-white border-2 border-orange-100 rounded-2xl shadow-sm focus-within:border-[#F27D26] transition-all">
              <select 
                name="userType"
                value={formData.userType}
                onChange={handleInputChange}
                className="w-full bg-transparent border-none outline-none font-bold text-[#002D72] appearance-none p-4 pr-10"
              >
                <option value="" disabled>Select user type</option>
                {USER_TYPES.map(ut => <option key={ut} value={ut}>{ut}</option>)}
              </select>
              <div className="absolute right-4 pointer-events-none">
                <ChevronDown className="w-4 h-4 text-[#F27D26]" />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1">
            <label className="text-[12px] font-bold uppercase tracking-wider text-[#002D72] opacity-60 ml-2 block">Address *</label>
            <div className="flex items-start bg-white border-2 border-orange-100 rounded-2xl p-4 shadow-sm focus-within:border-[#F27D26] transition-all">
              <textarea 
                name="address"
                rows={3}
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter complete address" 
                className="flex-1 bg-transparent border-none outline-none font-bold text-[#002D72] placeholder:text-gray-300 resize-none"
              />
              <MapPin className="w-5 h-5 text-orange-400 opacity-40 mt-1" />
            </div>
          </div>

          {/* ID Proof Section */}
          <div className="space-y-4 pt-4">
             {/* ID Type */}
            <div className="space-y-1">
              <label className="text-[12px] font-bold uppercase tracking-wider text-[#002D72] opacity-60 ml-2 block">ID Proof Type *</label>
              <div className="relative flex items-center bg-white border-2 border-orange-100 rounded-2xl shadow-sm focus-within:border-[#F27D26] transition-all">
                <select 
                  name="idProofType"
                  value={formData.idProofType}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-none outline-none font-bold text-[#002D72] appearance-none p-4 pr-10"
                >
                  <option value="" disabled>Select ID proof</option>
                  {ID_PROOF_TYPES.map(id => <option key={id} value={id}>{id}</option>)}
                </select>
                <div className="absolute right-4 pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-[#F27D26]" />
                </div>
              </div>
            </div>

            {/* ID Upload */}
            <div className="space-y-1">
              <label className="text-[12px] font-bold uppercase tracking-wider text-[#002D72] opacity-60 ml-2 block">Upload ID Proof *</label>
              <label className="flex flex-col items-center justify-center bg-white border-2 border-dashed border-orange-100 rounded-2xl p-6 shadow-sm cursor-pointer hover:border-[#F27D26] transition-all">
                {idProofPreview ? (
                  <div className="w-full flex flex-col items-center gap-2">
                    <img src={idProofPreview} alt="ID Preview" className="h-32 object-contain rounded-lg" />
                    <span className="text-xs font-bold text-[#F27D26]">Tap to change</span>
                  </div>
                ) : (
                  <>
                    <FileText className="w-8 h-8 text-orange-200 mb-2" />
                    <span className="text-sm font-bold text-[#002D72] opacity-40 text-center">Tap to upload ID document or image</span>
                  </>
                )}
                <input type="file" className="hidden" onChange={(e) => handlePhotoChange(e, 'id')} />
              </label>
            </div>
          </div>
        </div>

        {error && <p className="text-red-500 text-xs font-medium ml-2 text-center bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}

        {/* Submit Button */}
        <div className="pt-4">
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
                <span>REGISTER & CONTINUE</span>
                <ChevronDown className="w-5 h-5 -rotate-90" />
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
