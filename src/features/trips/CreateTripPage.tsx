import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { PageTransition } from '@/components/motion/PageTransition';
import { cn } from '@/lib/utils/cn';
import { useTripStore } from '@/stores/tripStore';
import { useAuthStore } from '@/stores/authStore';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { formatCurrency } from '@/lib/utils/formatting';
import { ArrowRight, ArrowLeft, Check, CalendarRange, Calendar, Shuffle, CarFront, Plane, TrainFront, Car } from 'lucide-react';
import type { User } from '@/types';
import type { DateRange } from 'react-day-picker';
import { differenceInDays } from 'date-fns';

const bgImages = [
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop', // 0: Name (Mountain)
  'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=2070&auto=format&fit=crop', // 1: Crew (Friends on cliff)
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop', // 2: Dates (Lake landscape)
  'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=2128&auto=format&fit=crop', // 3: Vibe/Budget (Resort/Luxury)
  'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop', // 4: Details (Airplane/Sky)
];

export function CreateTripPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { createTrip, searchUsers } = useTripStore();
  
  const [step, setStep] = useState(1);
  const [bgIndex, setBgIndex] = useState(0);
  
  const [formData, setFormData] = useState({
    name: '',
    invitedUsers: [] as User[],
    dateFlexibility: 'exact',
    dateMonth: '',
    dateRange: undefined as DateRange | undefined,
    duration: 5,
    budgetPerPerson: 5000000,
    budgetType: 'per_person',
    budgetFlexibility: 2, // 1: Budget, 2: Comfortable, 3: Premium, 4: Don't know
    startingLocation: 'Jakarta',
    destinationType: 'domestic',
    transport: 'flight'
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setBgIndex(step - 1);
  }, [step]);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    
    if (searchRef.current) clearTimeout(searchRef.current);
    
    searchRef.current = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchUsers(searchQuery);
      // Filter out users already invited or currentUser
      const filtered = results.filter(u => 
        currentUser && u.id !== currentUser.id && !formData.invitedUsers.some(invited => invited.id === u.id)
      );
      setSearchResults(filtered);
      setIsSearching(false);
    }, 300);
    
    return () => {
      if (searchRef.current) clearTimeout(searchRef.current);
    };
  }, [searchQuery, formData.invitedUsers, searchUsers, currentUser?.id]);

  const next12Months = React.useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() + i);
      return {
        value: `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`,
        label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      };
    });
  }, []);

  const nextStep = () => setStep(s => Math.min(5, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const handleCreate = async () => {
    let finalDuration = formData.duration;
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (formData.dateFlexibility === 'exact' && formData.dateRange?.from) {
      startDate = formData.dateRange.from;
      endDate = formData.dateRange.to || formData.dateRange.from;
      finalDuration = differenceInDays(endDate, startDate) + 1;
    }

    const tripId = await createTrip({
      name: formData.name,
      origin: formData.startingLocation,
      flexibleDates: formData.dateFlexibility !== 'exact',
      dateMonth: formData.dateFlexibility === 'month' ? formData.dateMonth : undefined,
      startDate,
      endDate,
      duration: finalDuration,
      budgetPerPerson: formData.budgetType === 'per_person' ? formData.budgetPerPerson : undefined,
      totalBudget: formData.budgetType === 'total' ? formData.budgetPerPerson : undefined,
      budgetFlexibility: formData.budgetFlexibility,
      travelConstraints: `Destination Type: ${formData.destinationType}, Transport: ${formData.transport}`,
      invitedUserIds: formData.invitedUsers.map(u => u.id)
    });
    navigate(`/trips/${tripId}/preferences`);
  };

  const addTraveler = (user: User) => {
    setFormData({ ...formData, invitedUsers: [...formData.invitedUsers, user] });
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeTraveler = (userId: string) => {
    setFormData({ ...formData, invitedUsers: formData.invitedUsers.filter(u => u.id !== userId) });
  };

  return (
    <PageTransition className="relative min-h-screen w-full flex flex-col text-white overflow-hidden bg-black font-sans">
      
      {/* Dynamic Full-Bleed Background Images */}
      <AnimatePresence mode="popLayout">
        <motion.div 
          key={bgIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-black/60 z-10" />
          <img src={bgImages[bgIndex]} alt="" className="w-full h-full object-cover" />
        </motion.div>
      </AnimatePresence>

      {/* Floating Header */}
      <div className="absolute top-0 left-0 right-0 p-8 z-20 flex justify-between items-center pointer-events-none">
        <div className="font-bold tracking-tighter text-2xl text-white">Nomad.</div>
        <div className="flex gap-2">
          <span className="text-white font-medium text-sm">0{step}</span>
          <span className="text-white/40 font-medium text-sm">/ 05</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full h-full flex items-center justify-center relative z-10 px-6 sm:px-12 max-w-5xl mx-auto py-24">
        <AnimatePresence mode="wait">
        
        {/* STEP 1: NAME */}
        {step === 1 && (
          <motion.div 
            key="step1" 
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }} 
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} 
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }} 
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex flex-col"
          >
            <p className="text-accent-400 font-semibold tracking-widest uppercase text-sm mb-6">Step 01 &mdash; The Vision</p>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-8">
              Name your<br/>adventure.
            </h1>
            <div className="relative max-w-3xl">
              <input
                type="text"
                placeholder="e.g. Summer Getaway, Bali 2026..."
                className="w-full bg-transparent border-none outline-none text-3xl sm:text-5xl font-medium text-white placeholder-white/20 caret-accent-400 py-4 focus:ring-0"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && formData.name.trim() && nextStep()}
              />
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/20" />
              <motion.div 
                className="absolute bottom-0 left-0 h-[1px] bg-accent-400" 
                initial={{ width: "0%" }}
                animate={{ width: formData.name.length > 0 ? "100%" : "0%" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            
            <AnimatePresence>
              {formData.name.trim().length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mt-12"
                >
                  <button 
                    onClick={nextStep}
                    className="group flex items-center gap-4 text-white text-xl font-medium hover:text-accent-400 transition-colors"
                  >
                    <span>Press Enter or click to continue</span>
                    <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-accent-400 group-hover:bg-accent-400 group-hover:text-black transition-all">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* STEP 2: CREW */}
        {step === 2 && (
          <motion.div 
            key="step2" 
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }} 
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} 
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }} 
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-2xl mx-auto"
          >
            <p className="text-accent-400 font-semibold tracking-widest uppercase text-sm mb-6 text-center">Step 02 &mdash; The Crew</p>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-white mb-12 text-center">
              Who's joining you?
            </h1>
            
            <div className="relative">
              <input
                type="text"
                className="w-full bg-white/5 border border-white/20 rounded-full px-8 py-5 text-xl font-medium text-white placeholder-white/40 focus:outline-none focus:border-accent-400 focus:bg-white/10 transition-all shadow-2xl backdrop-blur-md"
                placeholder="Search friends by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              
              <AnimatePresence>
                {searchQuery.trim().length >= 2 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute top-full left-0 right-0 mt-4 p-2 z-30 shadow-2xl bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl max-h-64 overflow-y-auto"
                  >
                    {isSearching ? (
                      <p className="text-sm text-white/50 p-6 text-center">Searching...</p>
                    ) : searchResults.length > 0 ? (
                      <div className="space-y-1">
                        {searchResults.map(user => (
                          <button
                            key={user.id}
                            className="w-full text-left p-4 hover:bg-white/10 rounded-2xl flex items-center gap-4 transition-colors group"
                            onClick={() => addTraveler(user)}
                          >
                            <div className="w-12 h-12 rounded-full bg-accent-500/20 text-accent-400 flex items-center justify-center font-bold text-lg group-hover:bg-accent-500 group-hover:text-white transition-colors">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-white text-lg">{user.name}</p>
                              <p className="text-sm text-white/50">{user.email}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-white/50 p-6 text-center">No users found.</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-4">
              {/* Current User */}
              <div className="flex items-center gap-3 pr-4 pl-2 py-2 bg-white/10 border border-white/10 backdrop-blur-md rounded-full">
                <div className="w-10 h-10 rounded-full bg-accent-500 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(14,165,233,0.5)]">
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-medium text-white text-sm">{currentUser?.name || 'You'}</p>
                  <p className="text-xs text-white/50">Host</p>
                </div>
              </div>

              {formData.invitedUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3 pr-2 pl-2 py-2 bg-white/5 border border-white/10 backdrop-blur-md rounded-full group hover:border-error-500 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-white group-hover:bg-error-500 transition-colors">
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">{u.name.split(' ')[0]}</p>
                  </div>
                  <button onClick={() => removeTraveler(u.id)} className="w-8 h-8 rounded-full hover:bg-error-500/20 text-white/40 hover:text-error-500 flex items-center justify-center transition-colors">
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 3: DATES */}
        {step === 3 && (
          <motion.div 
            key="step3" 
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }} 
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} 
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }} 
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex flex-col md:flex-row gap-16 md:items-center"
          >
            <div className="flex-1 space-y-8">
              <p className="text-accent-400 font-semibold tracking-widest uppercase text-sm mb-2">Step 03 &mdash; Timeline</p>
              <h1 className="text-5xl sm:text-6xl font-black tracking-tighter text-white">
                When are we going?
              </h1>
              <div className="flex flex-col gap-6 pt-4">
                {[
                  { type: 'exact', label: 'Exact Dates', desc: 'I know exactly when.' },
                  { type: 'month', label: 'Sometime In...', desc: 'I have a month in mind.' },
                  { type: 'flexible', label: 'Flexible', desc: 'No rush, let’s see.' }
                ].map(opt => (
                  <button 
                    key={opt.type}
                    onClick={() => setFormData({ ...formData, dateFlexibility: opt.type })}
                    className={cn(
                      "text-left group transition-all",
                      formData.dateFlexibility === opt.type ? "opacity-100" : "opacity-40 hover:opacity-70"
                    )}
                  >
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight group-hover:text-accent-400 transition-colors">{opt.label}</h2>
                    <p className="text-sm font-medium mt-1">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex-1">
              <AnimatePresence mode="wait">
                {formData.dateFlexibility === 'exact' && (
                  <motion.div key="exact" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl">
                    <DateRangePicker 
                      selected={formData.dateRange}
                      onSelect={(range) => setFormData({ ...formData, dateRange: range })}
                      className="mx-auto text-white"
                    />
                  </motion.div>
                )}
                {formData.dateFlexibility === 'month' && (
                  <motion.div key="month" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 max-w-sm">
                    <select
                      value={formData.dateMonth}
                      onChange={(e) => setFormData({ ...formData, dateMonth: e.target.value })}
                      className="w-full bg-white/5 border border-white/20 rounded-2xl px-6 py-4 text-xl font-medium text-white focus:outline-none focus:border-accent-400 backdrop-blur-md appearance-none"
                    >
                      <option value="" disabled className="text-black">Select a month</option>
                      {next12Months.map(m => (
                        <option key={m.value} value={m.value} className="text-black">{m.label}</option>
                      ))}
                    </select>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="How many days?"
                        className="w-full bg-white/5 border border-white/20 rounded-2xl px-6 py-4 text-xl font-medium text-white placeholder-white/40 focus:outline-none focus:border-accent-400 backdrop-blur-md"
                        value={formData.duration || ''}
                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
                        min={1}
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-white/50 font-medium">Days</span>
                    </div>
                  </motion.div>
                )}
                {formData.dateFlexibility === 'flexible' && (
                  <motion.div key="flex" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-sm">
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="Roughly how many days?"
                        className="w-full bg-white/5 border border-white/20 rounded-2xl px-6 py-4 text-xl font-medium text-white placeholder-white/40 focus:outline-none focus:border-accent-400 backdrop-blur-md"
                        value={formData.duration || ''}
                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
                        min={1}
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-white/50 font-medium">Days</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* STEP 4: VIBE & BUDGET */}
        {step === 4 && (
          <motion.div 
            key="step4" 
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }} 
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} 
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }} 
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-16 md:items-center"
          >
            <div className="flex-1 space-y-12">
              <div>
                <p className="text-accent-400 font-semibold tracking-widest uppercase text-sm mb-4">Step 04 &mdash; The Vibe</p>
                <h1 className="text-5xl font-black tracking-tighter text-white">
                  Define your style.
                </h1>
              </div>

              <div className="space-y-6">
                {[
                  { id: 1, label: 'Backpacker Budget', icon: <Wallet className="w-8 h-8" /> },
                  { id: 2, label: 'Comfortable', icon: <Armchair className="w-8 h-8" /> },
                  { id: 3, label: 'Premium Luxury', icon: <Sparkles className="w-8 h-8" /> },
                  { id: 4, label: "I don't know yet", icon: <Check className="w-8 h-8" /> }
                ].map(style => (
                  <button 
                    key={style.id}
                    onClick={() => setFormData({ ...formData, budgetFlexibility: style.id })}
                    className={cn(
                      "w-full text-left flex items-center gap-6 group transition-all",
                      formData.budgetFlexibility === style.id ? "opacity-100 scale-105" : "opacity-40 hover:opacity-80"
                    )}
                  >
                    <div className={cn("transition-colors", formData.budgetFlexibility === style.id ? "text-accent-400" : "text-white")}>
                      {style.icon}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight transition-colors">{style.label}</h2>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl">
              <h3 className="text-xl font-bold text-white mb-6">Budget Estimate (IDR)</h3>
              
              <div className="flex bg-white/10 p-1 rounded-full mb-8 backdrop-blur-md">
                <button 
                  className={cn(
                    "flex-1 py-3 text-sm font-semibold rounded-full transition-all",
                    formData.budgetType === 'per_person' ? "bg-white text-black shadow-md" : "text-white/60 hover:text-white"
                  )}
                  onClick={() => setFormData({ ...formData, budgetType: 'per_person' })}
                >
                  Per person
                </button>
                <button 
                  className={cn(
                    "flex-1 py-3 text-sm font-semibold rounded-full transition-all",
                    formData.budgetType === 'total' ? "bg-white text-black shadow-md" : "text-white/60 hover:text-white"
                  )}
                  onClick={() => setFormData({ ...formData, budgetType: 'total' })}
                >
                  Total group
                </button>
              </div>

              <input
                type="number"
                className="w-full bg-transparent border-b-2 border-white/20 text-4xl font-black text-white py-4 focus:outline-none focus:border-accent-400 text-center"
                value={formData.budgetPerPerson || ''}
                onChange={(e) => setFormData({ ...formData, budgetPerPerson: parseInt(e.target.value) || 0 })}
              />
              <p className="text-center text-accent-400 font-medium mt-4 text-lg">
                {formatCurrency(formData.budgetPerPerson)}
              </p>
            </div>
          </motion.div>
        )}

        {/* STEP 5: DETAILS */}
        {step === 5 && (
          <motion.div 
            key="step5" 
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }} 
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} 
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }} 
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-2xl mx-auto"
          >
            <div className="text-center mb-12">
              <p className="text-accent-400 font-semibold tracking-widest uppercase text-sm mb-4">Step 05 &mdash; Final Details</p>
              <h1 className="text-5xl font-black tracking-tighter text-white">
                Logistics.
              </h1>
            </div>
            
            <div className="space-y-12">
              <div>
                <p className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">Starting From</p>
                <input
                  type="text"
                  className="w-full bg-transparent border-b border-white/20 text-3xl font-bold text-white py-2 focus:outline-none focus:border-accent-400 placeholder-white/20"
                  placeholder="City, Country..."
                  value={formData.startingLocation}
                  onChange={(e) => setFormData({ ...formData, startingLocation: e.target.value })}
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-6">Scope</p>
                <div className="flex gap-4">
                  {(['domestic', 'international'] as const).map(type => (
                    <button 
                      key={type} 
                      onClick={() => setFormData({ ...formData, destinationType: type })}
                      className={cn(
                        "flex-1 py-4 px-6 rounded-2xl border font-bold text-lg capitalize transition-all",
                        formData.destinationType === type ? "border-accent-400 bg-accent-500/20 text-white shadow-[0_0_15px_rgba(14,165,233,0.2)]" : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-6">Preferred Transport</p>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { id: 'any', label: 'Any', icon: <Shuffle className="w-8 h-8" /> },
                    { id: 'flight', label: 'Flight', icon: <Plane className="w-8 h-8" /> },
                    { id: 'train', label: 'Train', icon: <TrainFront className="w-8 h-8" /> },
                    { id: 'car', label: 'Car', icon: <Car className="w-8 h-8" /> }
                  ].map(t => (
                    <button 
                      key={t.id}
                      onClick={() => setFormData({ ...formData, transport: t.id })}
                      className={cn(
                        "aspect-square flex flex-col items-center justify-center gap-3 rounded-2xl border transition-all",
                        formData.transport === t.id ? "border-accent-400 bg-accent-500/20 text-accent-400 shadow-[0_0_15px_rgba(14,165,233,0.2)]" : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      {t.icon}
                      <span className="font-semibold text-sm">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-center pt-8">
                <button 
                  onClick={handleCreate} 
                  className="bg-accent-500 hover:bg-accent-400 text-white text-lg font-bold py-5 px-12 rounded-full shadow-[0_0_30px_rgba(14,165,233,0.4)] hover:scale-105 transition-all w-full md:w-auto"
                >
                  Generate Itinerary
                </button>
              </div>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      {/* Floating Bottom Navigation */}
      <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-between px-8 md:px-12 pointer-events-none">
        <div className="pointer-events-auto">
          <AnimatePresence>
            {step > 1 && (
              <motion.button 
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onClick={prevStep}
                className="w-14 h-14 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/10 hover:scale-105 transition-all"
              >
                <ArrowLeft className="w-6 h-6" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        
        <div className="pointer-events-auto">
          <AnimatePresence>
            {step < 5 && step !== 1 && (
              <motion.button 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                onClick={nextStep}
                className="w-14 h-14 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/10 hover:scale-105 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              >
                <ArrowRight className="w-6 h-6" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
