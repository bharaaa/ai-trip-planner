import React, { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { useTripStore } from '@/stores/tripStore';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate, useParams } from 'react-router';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { PreferencePicker } from '@/components/discovery/PreferencePicker';
import type { PreferenceCategory, Preference } from '@/types';
const ChevronUp = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m18 15-6-6-6 6"/></svg>
);
const ChevronDown = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>
);

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
    <div className="min-h-screen bg-warm-50/50 pb-32">
      <div className="max-w-2xl mx-auto px-6 pt-12">
        <header className="mb-10 text-center space-y-3">
          <h1 className="text-3xl font-semibold text-warm-900 tracking-tight mb-2">What sounds good?</h1>
          <p className="text-warm-600 text-base">Pick what matters most to your group. No wrong answers.</p>
        </header>

        <main className="space-y-8">
          <section>
            <PreferencePicker 
              selectedCategories={selectedCategories} 
              onToggle={handleToggleCategory} 
            />
          </section>

          <section className="bg-white rounded-2xl border border-warm-200 overflow-hidden shadow-sm transition-all duration-300">
            <button 
              onClick={() => setShowMore(!showMore)}
              className="w-full flex items-center justify-between p-6 text-warm-900 font-medium hover:bg-warm-50 transition-colors"
            >
              <span className="text-lg font-semibold">More preferences</span>
              {showMore ? <ChevronUp className="w-5 h-5 text-warm-500" /> : <ChevronDown className="w-5 h-5 text-warm-500" />}
            </button>
            
            {showMore && (
              <div className="px-6 pb-8 pt-2 space-y-10 animate-slide-up">
                <div className="space-y-5">
                  <div className="flex justify-between text-base font-semibold text-warm-900">
                    <span>Trip pace</span>
                  </div>
                  <Slider 
                    value={pace} 
                    onChange={(e) => setPace(Number(e.target.value))} 
                    max={100} 
                    labels={{ left: 'Slow & relaxed', right: 'Action packed' }} 
                  />
                </div>

                <div className="space-y-5">
                  <div className="flex justify-between text-base font-semibold text-warm-900">
                    <span>Budget preference</span>
                  </div>
                  <Slider 
                    value={budget} 
                    onChange={(e) => setBudget(Number(e.target.value))} 
                    max={100} 
                    labels={{ left: 'Budget friendly', right: 'Premium & luxury' }} 
                  />
                </div>

                <div className="space-y-5">
                  <div className="flex justify-between text-base font-semibold text-warm-900">
                    <span>Morning preference</span>
                  </div>
                  <Slider 
                    value={morning} 
                    onChange={(e) => setMorning(Number(e.target.value))} 
                    max={100} 
                    labels={{ left: 'Sleep in', right: 'Early mornings' }} 
                  />
                </div>
              </div>
            )}
          </section>
        </main>

        <div className="fixed bottom-0 left-0 right-0 p-4 glass-heavy shadow-up border-t border-warm-200/50 flex justify-center z-10">
          <div className="max-w-2xl w-full">
            <Button 
              className="w-full shadow-lg shadow-accent-500/20" 
              size="lg"
              disabled={selectedCategories.size === 0}
              onClick={handleSubmit}
            >
              Submit preferences
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
