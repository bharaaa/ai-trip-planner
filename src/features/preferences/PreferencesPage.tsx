import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import { useTripStore } from '@/stores/tripStore';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate, useParams } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { PageTransition } from '@/components/motion/PageTransition';
import { ArrowRight, Check } from 'lucide-react';
import type { PreferenceCategory, Preference } from '@/types';

const CATEGORIES: { id: PreferenceCategory; label: string; image: string }[] = [
  { id: 'beach', label: 'Beach & Coast', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80' },
  { id: 'food', label: 'Food & Dining', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop&q=80' },
  { id: 'nature', label: 'Nature & Wildlife', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&auto=format&fit=crop&q=80' },
  { id: 'culture', label: 'Culture & History', image: 'https://images.unsplash.com/photo-1533669955142-6a73332af4db?w=800&auto=format&fit=crop&q=80' },
  { id: 'nightlife', label: 'Nightlife', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80' },
  { id: 'adventure', label: 'Adventure', image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&auto=format&fit=crop&q=80' },
  { id: 'cafes', label: 'Cafés & Chill', image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80' },
  { id: 'shopping', label: 'Shopping & Markets', image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&auto=format&fit=crop&q=80' },
];

const SLIDER_DATA = [
  { key: 'pace', label: 'Trip Pace', left: 'Slow & relaxed', right: 'Action packed' },
  { key: 'budget', label: 'Budget', left: 'Budget friendly', right: 'Premium luxury' },
  { key: 'morning', label: 'Mornings', left: 'Sleep in', right: 'Early riser' },
];

export const PreferencesPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { activeTrip, submitPreferences, setPhase } = useTripStore();
  
  const [selectedCategories, setSelectedCategories] = useState<Map<PreferenceCategory, number>>(new Map());
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
      newMap.set(category, 5);
    }
    setSelectedCategories(newMap);
  };

  const sliderValues: Record<string, number> = { pace, budget, morning };
  const sliderSetters: Record<string, (v: number) => void> = {
    pace: setPace,
    budget: setBudget,
    morning: setMorning,
  };

  const handleSubmit = () => {
    if (!id || !activeTrip || !currentUser) return;

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
    <PageTransition className="relative min-h-screen w-full bg-warm-950 text-white font-sans">
      
      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-[320px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-warm-950 z-10" />
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1600&auto=format&fit=crop&q=80" 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-20 px-6 sm:px-12 pb-10 max-w-5xl mx-auto w-full">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-accent-400 font-semibold tracking-widest uppercase text-xs mb-4"
          >
            {activeTrip?.name || 'Your Trip'}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-7xl font-black tracking-tighter text-white"
          >
            What do you<br />want to feel?
          </motion.h1>
        </div>
      </div>

      {/* Category Photo Grid */}
      <div className="relative z-10 px-6 sm:px-12 max-w-6xl mx-auto -mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {CATEGORIES.map((cat, i) => {
            const isSelected = selectedCategories.has(cat.id);
            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => handleToggleCategory(cat.id)}
                className={cn(
                  "relative aspect-[3/4] rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300",
                  isSelected ? "ring-2 ring-accent-400 ring-offset-2 ring-offset-warm-950 scale-[0.97]" : "hover:scale-[0.98]"
                )}
              >
                <img src={cat.image} alt={cat.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                
                {/* Darkened overlay */}
                <div className={cn(
                  "absolute inset-0 transition-all duration-300",
                  isSelected 
                    ? "bg-accent-500/30" 
                    : "bg-black/40 group-hover:bg-black/30"
                )} />
                
                {/* Selection badge */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      className="absolute top-3 right-3 z-20 w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(14,165,233,0.6)]"
                    >
                      <Check className="w-4 h-4 text-white stroke-[3]" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Label at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-10 bg-gradient-to-t from-black/70 to-transparent">
                  <span className="text-white font-bold text-sm sm:text-base tracking-tight">{cat.label}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Sliders Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="relative z-10 px-6 sm:px-12 max-w-3xl mx-auto mt-16 mb-32 space-y-0"
      >
        <h2 className="text-3xl font-black tracking-tighter text-white mb-10">Fine-tune your vibe.</h2>
        
        {SLIDER_DATA.map((s, i) => {
          const val = sliderValues[s.key];
          const pct = val;
          return (
            <div key={s.key} className="py-8 border-t border-white/5">
              <div className="flex justify-between items-baseline mb-6">
                <span className="text-lg font-bold text-white">{s.label}</span>
                <span className="text-sm font-semibold text-accent-400">{pct}%</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={val}
                  onChange={(e) => sliderSetters[s.key](Number(e.target.value))}
                  className="w-full appearance-none h-2 rounded-full outline-none cursor-pointer bg-white/10
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(255,255,255,0.3)] [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-webkit-slider-thumb]:border-0
                    [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-[0_0_15px_rgba(255,255,255,0.3)] [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:border-0"
                  style={{
                    background: `linear-gradient(to right, rgba(14,165,233,0.6) 0%, rgba(14,165,233,0.6) ${pct}%, rgba(255,255,255,0.1) ${pct}%, rgba(255,255,255,0.1) 100%)`
                  }}
                />
              </div>
              <div className="flex justify-between mt-3">
                <span className="text-xs font-medium text-white/30">{s.left}</span>
                <span className="text-xs font-medium text-white/30">{s.right}</span>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Floating Submit */}
      <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
        <div className="bg-gradient-to-t from-warm-950 via-warm-950/95 to-transparent pt-16 pb-8 px-6">
          <div className="max-w-lg mx-auto pointer-events-auto">
            <button
              disabled={selectedCategories.size === 0}
              onClick={handleSubmit}
              className={cn(
                "w-full py-5 rounded-full text-lg font-bold transition-all flex items-center justify-center gap-3 group",
                selectedCategories.size > 0 
                  ? "bg-white text-warm-950 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-white/10 text-white/30 cursor-not-allowed"
              )}
            >
              Continue
              {selectedCategories.size > 0 && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
            {selectedCategories.size > 0 && (
              <p className="text-center text-white/25 text-xs mt-3 font-medium tracking-wide">
                {selectedCategories.size} selected
              </p>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
