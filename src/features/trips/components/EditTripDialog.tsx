import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTripStore } from '@/stores/tripStore';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils/cn';
import { ArrowLeft, MapPin, Users, Clock, Wallet } from 'lucide-react';

interface EditTripDialogProps {
  open: boolean;
  onClose: () => void;
  tripId: string;
}

export function EditTripDialog({ open, onClose, tripId }: EditTripDialogProps) {
  const activeTrip = useTripStore(state => state.activeTrip);
  const updateTripDetails = useTripStore(state => state.updateTripDetails);

  // We only care about origin, travelers, duration, budgetPerPerson
  const [origin, setOrigin] = useState(activeTrip?.origin || '');
  const [travelers, setTravelers] = useState(activeTrip?.travelers?.toString() || '1');
  const [duration, setDuration] = useState(activeTrip?.duration?.toString() || '1');
  const [budgetPerPerson, setBudgetPerPerson] = useState(activeTrip?.budgetPerPerson?.toString() || '0');
  const [isSaving, setIsSaving] = useState(false);

  // Reset state when opening/closing just in case it changed externally
  useEffect(() => {
    if (open && activeTrip) {
      setOrigin(activeTrip.origin || '');
      setTravelers(activeTrip.travelers?.toString() || '1');
      setDuration(activeTrip.duration?.toString() || '1');
      setBudgetPerPerson(activeTrip.budgetPerPerson?.toString() || '0');
    }
  }, [open, activeTrip]);

  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [open]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateTripDetails(tripId, {
        origin,
        travelers: parseInt(travelers, 10) || 1,
        duration: parseInt(duration, 10) || 1,
        budgetPerPerson: parseInt(budgetPerPerson, 10) || 0,
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save trip details.');
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
          />

          {/* Slide-over Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-[60] w-full sm:w-[440px] bg-warm-950 border-l border-white/5 flex flex-col shadow-2xl"
          >
            {/* Panel Header */}
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="text-xs font-semibold text-white/30 tracking-widest uppercase">Edit</span>
              </div>

              <h2 className="text-4xl font-black tracking-tighter text-white mb-2">
                Trip Details.
              </h2>
              <p className="text-white/40 text-sm font-medium mb-8">
                Adjust your parameters to get better suggestions.
              </p>
            </div>

            {/* Form Area */}
            <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-8">
              
              <div className="space-y-4">
                <div className="relative">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="w-4 h-4 text-white/40" />
                    <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest">Starting Location</label>
                  </div>
                  <input 
                    type="text" 
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="E.g., Jakarta"
                    className="w-full bg-transparent border-none border-b border-white/10 pb-3 text-2xl font-bold text-white placeholder-white/20 focus:outline-none focus:ring-0 caret-accent-400 transition-colors focus:border-accent-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="w-4 h-4 text-white/40" />
                      <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest">Travelers</label>
                    </div>
                    <input 
                      type="number" 
                      min="1"
                      value={travelers}
                      onChange={(e) => setTravelers(e.target.value)}
                      className="w-full bg-transparent border-none border-b border-white/10 pb-3 text-2xl font-bold text-white placeholder-white/20 focus:outline-none focus:ring-0 caret-accent-400 transition-colors focus:border-accent-400 appearance-none"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-4 h-4 text-white/40" />
                      <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest">Days</label>
                    </div>
                    <input 
                      type="number" 
                      min="1"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-transparent border-none border-b border-white/10 pb-3 text-2xl font-bold text-white placeholder-white/20 focus:outline-none focus:ring-0 caret-accent-400 transition-colors focus:border-accent-400 appearance-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <div className="flex items-center gap-3 mb-2">
                    <Wallet className="w-4 h-4 text-white/40" />
                    <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest">Budget Per Person (IDR)</label>
                  </div>
                  <input 
                    type="number" 
                    step="100000"
                    value={budgetPerPerson}
                    onChange={(e) => setBudgetPerPerson(e.target.value)}
                    className="w-full bg-transparent border-none border-b border-white/10 pb-3 text-2xl font-bold text-white placeholder-white/20 focus:outline-none focus:ring-0 caret-accent-400 transition-colors focus:border-accent-400 appearance-none"
                  />
                </div>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="p-6 border-t border-white/5 bg-warm-950/80 backdrop-blur-md">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={cn(
                  "w-full bg-white text-black font-bold text-lg px-5 py-4 rounded-full transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center",
                  isSaving ? "opacity-70 cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.98]"
                )}
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  'Save Details'
                )}
              </button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
