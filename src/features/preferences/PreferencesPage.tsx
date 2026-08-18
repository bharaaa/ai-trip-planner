import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import { useTripStore } from '@/stores/tripStore';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate, useParams } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { PageTransition } from '@/components/motion/PageTransition';
import { Slider } from '@/components/ui/Slider';
import { PreferencePicker } from '@/features/discovery/components/PreferencePicker';
import { ChevronDown, Sparkles } from 'lucide-react';
import type { PreferenceCategory, Preference } from '@/types';

export const PreferencesPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { activeTrip, submitPreferences, setPhase } = useTripStore();
  
  const [selectedCategories, setSelectedCategories] = useState<Map<PreferenceCategory, number>>(new Map());
  const [showMore, setShowMore] = useState(false);
  const [pace, setPace] = useState(50);
  const [budget, setBudget] = useState(50);
  const [morning, setMorning] = useState(50);

  useEffect(() => {
    if (activeTrip && currentUser) {
      const existingPref = activeTrip.preferences?.find(p => p.userId === currentUser.id);
      if (existingPref) {
        const initialCategories = new Map<PreferenceCategory, number>();
        Object.entries(existingPref.categories).forEach(([key, val]) => {
          initialCategories.set(key as PreferenceCategory, val as number);
        });
        setSelectedCategories(initialCategories);
        setPace(existingPref.pace ?? 50);
        setBudget(existingPref.budgetPreference ?? 50);
        setMorning(existingPref.morningPreference ?? 50);
      }
    }
  }, [activeTrip, currentUser]);

  const handleToggleCategory = (category: PreferenceCategory) => {
    const newMap = new Map(selectedCategories);
    if (newMap.has(category)) {
      newMap.delete(category);
    } else {
      newMap.set(category, 5); // Default weight
    }
    setSelectedCategories(newMap);
  };

  const handleSubmit = () => {
    if (!id || !activeTrip || !currentUser) return;

    // Convert map to record
    const categoriesRecord: Record<string, number> = {};
    selectedCategories.forEach((value, key) => {
      categoriesRecord[key as string] = value;
    });

    const preference: Preference = {
      userId: currentUser.id,
      categories: categoriesRecord as Record<PreferenceCategory, number>,
      pace,
      budgetPreference: budget,
      travelTolerance: 50,
      morningPreference: morning,
    };

    submitPreferences(id, currentUser.id, preference);

    setPhase(id, 'discover');
    navigate(`/trips/${id}/discover`);
  };

  return (
    <PageTransition className="relative min-h-screen w-full bg-black text-white overflow-hidden font-sans">
      
      {/* Full-bleed background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-warm-950 via-black to-warm-950 z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(14,165,233,0.08)_0%,transparent_60%)]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-16 pb-32">
        
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 text-center space-y-4"
        >
          <p className="text-accent-400 font-semibold tracking-widest uppercase text-sm">Your Preferences</p>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tighter text-white">
            What sounds good?
          </h1>
          <p className="text-lg text-white/50 font-medium max-w-md mx-auto">
            Pick what matters most. No wrong answers.
          </p>
        </motion.header>

        {/* Categories */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12"
        >
          <PreferencePicker 
            selectedCategories={selectedCategories} 
            onToggle={handleToggleCategory} 
          />
        </motion.section>

        {/* More Preferences */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden"
        >
          <button 
            onClick={() => setShowMore(!showMore)}
            className="w-full flex items-center justify-between p-6 text-white font-medium hover:bg-white/5 transition-colors"
          >
            <span className="text-lg font-bold">Fine-tune your vibe</span>
            <motion.div
              animate={{ rotate: showMore ? 180 : 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <ChevronDown className="w-5 h-5 text-white/40" />
            </motion.div>
          </button>
          
          <AnimatePresence>
            {showMore && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-8 pt-2 space-y-10 border-t border-white/5">
                  <div className="space-y-5">
                    <div className="flex justify-between text-base font-bold text-white">
                      <span>Trip pace</span>
                    </div>
                    <Slider 
                      theme="dark"
                      value={pace} 
                      onChange={(e) => setPace(Number((e.target as HTMLInputElement).value))} 
                      max={100} 
                      labels={{ left: 'Slow & relaxed', right: 'Action packed' }} 
                    />
                  </div>

                  <div className="space-y-5">
                    <div className="flex justify-between text-base font-bold text-white">
                      <span>Budget preference</span>
                    </div>
                    <Slider 
                      theme="dark"
                      value={budget} 
                      onChange={(e) => setBudget(Number((e.target as HTMLInputElement).value))} 
                      max={100} 
                      labels={{ left: 'Budget friendly', right: 'Premium & luxury' }} 
                    />
                  </div>

                  <div className="space-y-5">
                    <div className="flex justify-between text-base font-bold text-white">
                      <span>Morning preference</span>
                    </div>
                    <Slider 
                      theme="dark"
                      value={morning} 
                      onChange={(e) => setMorning(Number((e.target as HTMLInputElement).value))} 
                      max={100} 
                      labels={{ left: 'Sleep in', right: 'Early mornings' }} 
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      </div>

      {/* Floating Submit */}
      <div className="fixed bottom-0 left-0 right-0 z-30">
        <div className="bg-gradient-to-t from-black via-black/90 to-transparent pt-12 pb-8 px-6">
          <div className="max-w-xl mx-auto">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              disabled={selectedCategories.size === 0}
              onClick={handleSubmit}
              className={cn(
                "w-full py-5 rounded-full text-lg font-bold transition-all flex items-center justify-center gap-3",
                selectedCategories.size > 0 
                  ? "bg-accent-500 hover:bg-accent-400 text-white shadow-[0_0_30px_rgba(14,165,233,0.4)] hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-white/10 text-white/30 cursor-not-allowed"
              )}
            >
              <Sparkles className="w-5 h-5" />
              Submit Preferences
            </motion.button>
            
            {selectedCategories.size > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-white/30 text-sm mt-3 font-medium"
              >
                {selectedCategories.size} {selectedCategories.size === 1 ? 'category' : 'categories'} selected
              </motion.p>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
