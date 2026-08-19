import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import { useTripStore } from '@/stores/tripStore';
import { useNavigate, useParams } from 'react-router';
import { ItineraryEditor } from '@/features/itinerary/components/ItineraryEditor';
import { MapPanel } from '@/components/map/MapPanel';
import { aiService } from '@/services/ai';
import { PageTransition } from '@/components/motion/PageTransition';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Sparkles, Map, List, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';

export const PlannerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeTrip, setItinerary } = useTripStore();
  const [activeView, setActiveView] = useState<'itinerary' | 'map'>('itinerary');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const itinerary = activeTrip?.itinerary || null;

  const handleGenerate = async () => {
    if (!id || !activeTrip?.selectedDestination) return;
    setIsGenerating(true);
    try {
      const context = {
        origin: activeTrip.origin || 'Jakarta',
        travelers: activeTrip.members?.length || 1,
        budgetPerPerson: activeTrip.budgetPerPerson || 4000000,
        dateMonth: activeTrip.dateMonth || 'September',
        flexibleDates: activeTrip.flexibleDates,
        duration: activeTrip.duration || 5,
        preferences: activeTrip.preferences?.[0]?.categories || {
          nature: 5, culture: 5, food: 5, beach: 5, adventure: 5, nightlife: 5, shopping: 5, cafes: 5
        }
      };
      
      const generated = await aiService.generateItinerary(activeTrip.selectedDestination!, context);
      setItinerary(id, generated);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!activeTrip) return null;

  const destination = activeTrip.selectedDestination;

  // Date label
  let dateLabel = '';
  if (!activeTrip.flexibleDates && activeTrip.startDate && activeTrip.endDate) {
    dateLabel = `${format(new Date(activeTrip.startDate), 'MMM d')} – ${format(new Date(activeTrip.endDate), 'MMM d, yyyy')}`;
  } else if (activeTrip.duration) {
    dateLabel = `${activeTrip.duration} days`;
  }

  const totalActivities = itinerary?.days?.reduce((sum, d) => sum + d.items.length, 0) || 0;

  return (
    <PageTransition className="min-h-screen bg-warm-950">
      
      {/* Hero Section */}
      <div className="relative pt-32 md:pt-40 pb-16 px-6 md:px-12 max-w-7xl mx-auto">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-white/40 mb-8">
          <span className="hover:text-white/60 cursor-pointer transition-colors" onClick={() => navigate(`/trips/${id}`)}>
            {activeTrip.name || 'Trip'}
          </span>
          <span>/</span>
          <span className="text-white/70">Itinerary</span>
        </div>

        {/* Editorial Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12">
          <div className="max-w-3xl">
            {destination && (
              <p className="text-accent-400 text-sm font-bold tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
                <MapPin size={14} />
                {destination.country || destination.name}
              </p>
            )}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[0.85] mb-6">
              {destination?.name || 'Itinerary'}
            </h1>
            <p className="text-xl text-white/60 leading-relaxed max-w-2xl">
              {itinerary 
                ? 'Your day-by-day plan, crafted around your group\'s preferences.'
                : 'Your destination is set. Let AI craft a personalized day-by-day experience.'}
            </p>
          </div>

          {/* Meta Stats */}
          {(dateLabel || totalActivities > 0) && (
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 py-4 border-t lg:border-t-0 lg:border-l border-white/10 lg:pl-8">
              {dateLabel && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">When</span>
                  <span className="text-lg font-medium text-white">{dateLabel}</span>
                </div>
              )}
              {itinerary && (
                <>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Days</span>
                    <span className="text-lg font-medium text-white">{itinerary.days.length}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Activities</span>
                    <span className="text-lg font-medium text-white">{totalActivities}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* View Toggle (when itinerary exists) */}
        {itinerary && (
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1 w-fit">
            <button
              onClick={() => setActiveView('itinerary')}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all",
                activeView === 'itinerary'
                  ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                  : "text-white/50 hover:text-white/80"
              )}
            >
              <List size={16} />
              Timeline
            </button>
            <button
              onClick={() => setActiveView('map')}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all",
                activeView === 'map'
                  ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                  : "text-white/50 hover:text-white/80"
              )}
            >
              <Map size={16} />
              Map
            </button>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-white/5" />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 pb-40">
        
        <AnimatePresence mode="wait">
          {isGenerating ? (
            /* Generating State */
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="relative mb-12">
                <div className="w-24 h-24 rounded-full border border-accent-500/30 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                    className="w-20 h-20 rounded-full border-2 border-transparent border-t-accent-400"
                  />
                </div>
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-accent-400" size={28} />
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight mb-4">Crafting your journey</h2>
              <p className="text-lg text-white/40 max-w-md">
                Building a day-by-day experience tailored to your group's preferences and travel style.
              </p>
            </motion.div>

          ) : !itinerary ? (
            /* Empty State */
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8">
                <span className="text-4xl">✨</span>
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight mb-4">Ready to plan</h2>
              <p className="text-lg text-white/40 max-w-lg mx-auto mb-10 leading-relaxed">
                Your destination is locked in. Generate a personalized itinerary based on your group's vibe, budget, and travel style.
              </p>
              <button
                onClick={handleGenerate}
                className="group relative px-10 py-4 bg-white text-black rounded-full font-bold text-lg shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3"
              >
                <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                Generate Itinerary
              </button>
            </motion.div>

          ) : (
            /* Itinerary Content */
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* AI Draft Notice */}
              <div className="mb-12 flex items-start gap-4 py-5 px-6 rounded-2xl bg-accent-500/5 border border-accent-500/10">
                <Sparkles size={20} className="text-accent-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white/80 leading-relaxed">
                    <span className="text-accent-400 font-bold">AI-Generated Draft</span> — This itinerary was crafted by AI based on your group's preferences. Feel free to rearrange, edit, or remove anything.
                  </p>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-8">
                {/* Timeline Panel */}
                <div className={cn(
                  "flex-1 lg:w-[58%] flex-shrink-0",
                  activeView !== 'itinerary' && "hidden lg:block"
                )}>
                  <ItineraryEditor itinerary={itinerary} />
                </div>

                {/* Map Panel */}
                <div className={cn(
                  "flex-1 lg:w-[42%] lg:sticky lg:top-28 lg:self-start",
                  activeView !== 'map' && "hidden lg:block"
                )}>
                  <div className="rounded-3xl overflow-hidden border border-white/10 min-h-[500px] lg:min-h-[calc(100vh-200px)]">
                    <MapPanel 
                      destination={destination?.name || 'Destination'} 
                      activities={itinerary.days.flatMap(d => d.items)} 
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Generate Button (when itinerary doesn't exist and not generating) */}
      {!itinerary && !isGenerating && (
        <div className="fixed bottom-8 left-0 right-0 flex justify-center z-40 pointer-events-none md:hidden">
          <button
            onClick={handleGenerate}
            className="pointer-events-auto px-8 py-4 bg-white text-black rounded-full font-bold text-lg shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3"
          >
            <Sparkles size={20} />
            Generate Itinerary
          </button>
        </div>
      )}
    </PageTransition>
  );
};
