import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import { useTripStore } from '@/stores/tripStore';
import { useNavigate, useParams } from 'react-router';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';
import { TripProgress } from '@/features/trips/components/TripProgress';
import { NextDecision } from '@/features/trips/components/NextDecision';
import { MemberAvatars } from '@/features/trips/components/MemberAvatars';
import { ItineraryEditor } from '@/features/itinerary/components/ItineraryEditor';
import { MapPanel } from '@/components/map/MapPanel';
import { AILoadingState } from '@/features/ai/components/AILoadingState';
import { AIItineraryInsight } from '@/features/ai/components/AIItineraryInsight';
import { AIInsightCard } from '@/features/ai/components/AIInsightCard';
import { aiService } from '@/services/ai';
import { PageTransition } from '@/components/motion/PageTransition';

// Remove local mockGenerate since we use aiService

export const PlannerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeTrip, setItinerary } = useTripStore();
  const [activeTab, setActiveTab] = useState<'itinerary' | 'map'>('itinerary');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const itinerary = activeTrip?.itinerary || null;

  const handleGenerate = async () => {
    if (!id || !activeTrip?.selectedDestination) return;
    setIsGenerating(true);
    try {
      // Mock Context for now until context store is fully built out
      const context = {
        origin: 'Jakarta',
        travelers: activeTrip.members?.length || 1,
        budgetPerPerson: activeTrip.budgetPerPerson || 4000000,
        dateMonth: 'September',
        flexibleDates: activeTrip.flexibleDates,
        duration: 5,
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

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-warm-950 pt-12">
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6">
          
          {/* Top Section */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">{activeTrip.selectedDestination?.name || 'Itinerary'}</h1>
                <p className="text-lg text-warm-300 mt-1">
                  {activeTrip.flexibleDates ? `${activeTrip.duration} Days` : 'Locked In Dates'}
                </p>
              </div>
              {!itinerary && !isGenerating && (
                <Button onClick={handleGenerate} size="lg" className="rounded-full bg-accent-500 hover:bg-accent-600 text-white shadow-sm hover:shadow-md transition-all font-bold">
                  ✨ Generate Draft Itinerary
                </Button>
              )}
            </div>
            
            {itinerary && (
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-xs flex items-start gap-4">
                <div className="flex-1 text-white">
                  <NextDecision 
                    title="Choose accommodation"
                    description="This will help optimize your activities and routes."
                    actionLabel="Decide Now"
                    onAction={() => {}}
                    type="accommodation"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Content Area */}
          {isGenerating ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <AILoadingState message="Building your personalized itinerary..." />
            </div>
          ) : !itinerary ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <span className="text-3xl" role="img" aria-label="sparkles">✨</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">No itinerary yet</h2>
              <p className="text-warm-400 max-w-md mx-auto mb-6">
                Your destination is set. Let our AI craft a personalized day-by-day plan based on your group's preferences.
              </p>
              <Button size="lg" onClick={handleGenerate} className="bg-accent-500 text-white hover:bg-accent-600 font-bold rounded-full">
                ✨ Generate Itinerary
              </Button>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-200px)]">
              
              {/* Mobile Tabs */}
              <div className="lg:hidden w-full">
                <Tabs 
                  tabs={[
                    { id: 'itinerary', label: 'Itinerary' },
                    { id: 'map', label: 'Map' }
                  ]}
                  activeTab={activeTab} 
                  onTabChange={(v) => setActiveTab(v as 'itinerary' | 'map')} 
                  className="w-full" 
                />
              </div>

              {/* Itinerary Panel */}
              <div className={cn(
                "flex-1 overflow-y-auto pr-2 rounded-xl",
                activeTab !== 'itinerary' && "hidden lg:block",
                "lg:w-[55%] flex-shrink-0"
              )}>
                <div className="mb-6">
                   <AIInsightCard 
                    message="AI-Generated Draft: This is an AI-generated draft based on your group's preferences. Feel free to edit, rearrange, or remove activities."
                    type="info"
                   />
                </div>

                <div className="mb-6">
                   <AIItineraryInsight 
                    insight={{
                      id: 'ins-1',
                      message: 'Optimized Routing: We grouped your day 1 activities around Seminyak to minimize travel time after your flight.',
                      severity: 'medium',
                      type: 'info'
                    }}
                   />
                </div>
                
                <ItineraryEditor itinerary={itinerary} />
              </div>

              {/* Map Panel */}
              <div className={cn(
                "flex-1 rounded-2xl overflow-hidden border border-warm-200/50 relative",
                activeTab !== 'map' && "hidden lg:block",
                "lg:w-[45%] lg:sticky lg:top-6 lg:h-full min-h-[400px]"
              )}>
                 <MapPanel 
                  destination="Bali, Indonesia" 
                  activities={itinerary.days.flatMap(d => d.items)} 
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};
