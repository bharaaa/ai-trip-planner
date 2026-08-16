import React, { useEffect, useState } from 'react';
import { PageTransition } from '@/components/motion/PageTransition';
import { cn } from '@/lib/utils/cn';
import { useTripStore } from '@/stores/tripStore';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate, useParams } from 'react-router';
import { GroupPreferenceSummary } from '@/components/discovery/GroupPreferenceSummary';
import { RecommendationGrid } from '@/components/discovery/RecommendationGrid';
import { AILoadingState } from '@/components/ai/AILoadingState';
import { GroupConsensus } from '@/features/discovery/components/GroupConsensus';
import { RefinementSummary } from '@/features/discovery/components/RefinementSummary';
import { DestinationSelection } from '@/features/discovery/components/DestinationSelection';
import { ReactionBar } from '@/features/discovery/components/ReactionBar';
import { Dialog } from '@/components/ui/Dialog';
import { aiService } from '@/services/ai';
import { formatCurrency } from '@/lib/utils/formatting';
import { Users, Calendar, Clock, Wallet, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import type { TripContext, ReactionType, TripIdea, TripReaction } from '@/types';

export const DiscoveryPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { activeTrip, setTripIdeas, addReaction, selectDestination } = useTripStore();

  const isAdmin = activeTrip?.members.find(m => m.userId === currentUser?.id)?.role === 'admin';

  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);

  // Derive Context from activeTrip
  const context: TripContext = {
    origin: activeTrip?.origin || '',
    travelers: activeTrip?.travelers || 1,
    budgetPerPerson: activeTrip?.budgetPerPerson || 0,
    dateMonth: activeTrip?.dateMonth || '',
    flexibleDates: activeTrip?.flexibleDates || false,
    duration: activeTrip?.duration || 1,
    preferences: activeTrip?.preferences?.[0]?.categories || { food: 5, beach: 4, nature: 4, culture: 3, cafes: 2, nightlife: 1, adventure: 1, shopping: 1 }
  };

  const aggregatedScores: Record<string, number> = {};
  if (activeTrip?.preferences?.length) {
    activeTrip.preferences.forEach(p => {
      Object.entries(p.categories).forEach(([cat, val]) => {
        aggregatedScores[cat] = (aggregatedScores[cat] || 0) + val;
      });
    });
  }

  const maxCategoryScore = Math.max(...Object.values(aggregatedScores), 1);
  
  const getCategoryMeta = (cat: string) => {
    const meta: Record<string, { label: string; emoji: string }> = {
      food: { label: 'Food', emoji: '🍜' },
      beach: { label: 'Beach', emoji: '🌊' },
      nature: { label: 'Nature', emoji: '🌿' },
      culture: { label: 'Culture', emoji: '🏛' },
      cafes: { label: 'Cafés', emoji: '☕' },
      nightlife: { label: 'Nightlife', emoji: '🎉' },
      adventure: { label: 'Adventure', emoji: '🏄' },
      shopping: { label: 'Shopping', emoji: '🛍' },
    };
    return meta[cat] || { label: cat, emoji: '✨' };
  };

  const aggregatePreferences = Object.entries(aggregatedScores)
    .map(([cat, score]) => ({
      category: cat,
      ...getCategoryMeta(cat),
      score: Math.round((score / maxCategoryScore) * 100)
    }))
    .sort((a, b) => b.score - a.score);

  useEffect(() => {
    if (!activeTrip) return;
    if (activeTrip.tripIdeas.length === 0 && !isLoading) {
      const fetchIdeas = async () => {
        setIsLoading(true);
        const ideas = await aiService.generateTripIdeas(context);
        setTripIdeas(activeTrip.id, ideas);
        setIsLoading(false);
      };
      fetchIdeas();
    }
  }, [activeTrip, activeTrip?.tripIdeas, isLoading, context, setTripIdeas]);

  if (!activeTrip) return null;

  const handleReact = (ideaId: string, type: ReactionType) => {
    if (!currentUser) return;
    addReaction(activeTrip.id, {
      tripIdeaId: ideaId,
      userId: currentUser.id,
      userName: currentUser.name,
      reaction: type,
    });
  };

  const handleRefine = async () => {
    setIsRefining(true);
    const newIdeas = await aiService.refineTripIdeas(context, activeTrip.reactions);
    setTripIdeas(activeTrip.id, newIdeas);
    setIsRefining(false);
  };

  const handleSelectDestination = (idea: TripIdea) => {
    selectDestination(activeTrip.id, {
      name: idea.destination,
      country: idea.country,
      countryCode: idea.countryCode,
      selectedAt: new Date()
    });
    navigate(`/trips/${activeTrip.id}/plan`);
  };

  // Maps for RecommendationGrid
  const ideasReactions: Record<string, TripReaction[]> = {};
  const userReactions: Record<string, ReactionType> = {};
  
  activeTrip.reactions.forEach(r => {
    if (!ideasReactions[r.tripIdeaId]) {
      ideasReactions[r.tripIdeaId] = [];
    }
    ideasReactions[r.tripIdeaId].push(r);

    if (currentUser && r.userId === currentUser.id) {
      userReactions[r.tripIdeaId] = r.reaction;
    }
  });

  const totalPossibleReactions = activeTrip.tripIdeas.length * activeTrip.members.length;
  const currentTotalReactions = activeTrip.reactions.length;
  const allReacted = currentTotalReactions >= totalPossibleReactions && activeTrip.tripIdeas.length > 0;

  const selectedIdea = activeTrip.tripIdeas.find(i => i.id === selectedIdeaId);

  return (
    <PageTransition className="min-h-screen bg-warm-50 pb-32">
      <div className="max-w-6xl mx-auto px-6 pt-12 space-y-10">
        
        {/* Context Bar */}
        <div className="bg-warm-100 rounded-xl px-5 py-4 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-medium text-warm-700 shadow-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{activeTrip.travelers} traveler{activeTrip.travelers !== 1 && 's'}</span>
          </div>
          <div className="hidden sm:block text-warm-300">•</div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{activeTrip.flexibleDates ? activeTrip.dateMonth || 'Flexible' : 'Specific Dates'}</span>
          </div>
          <div className="hidden sm:block text-warm-300">•</div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{activeTrip.duration} days</span>
          </div>
          <div className="hidden sm:block text-warm-300">•</div>
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            <span>{formatCurrency(activeTrip.budgetPerPerson || 0)}/person</span>
          </div>
          <div className="hidden sm:block text-warm-300">•</div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{activeTrip.origin}</span>
          </div>
        </div>

        <GroupPreferenceSummary preferences={aggregatePreferences} />
        
        <hr className="border-warm-200/60" />

        <div>
          <h2 className="text-3xl font-bold text-warm-950 tracking-tight mb-8">Where to?</h2>
          
          {isLoading ? (
            <div className="py-20 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-accent-100 flex items-center justify-center mx-auto text-accent-600 animate-pulse">
                ✨
              </div>
              <div>
                <p className="text-xl font-semibold text-warm-900 mb-2">Finding the perfect spots...</p>
                <p className="text-warm-500">Checking group preferences and constraints.</p>
              </div>
            </div>
          ) : isRefining ? (
            <div className="py-20 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-accent-100 flex items-center justify-center mx-auto text-accent-600 animate-pulse">
                🤔
              </div>
              <div>
                <p className="text-xl font-semibold text-warm-900 mb-2">Taking notes...</p>
                <p className="text-warm-500">Refining ideas based on what you liked and didn't like.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-16">
              <RecommendationGrid 
                ideas={activeTrip.tripIdeas} 
                reactions={ideasReactions}
                userReactions={userReactions}
                onReact={handleReact}
                onExplore={(id) => setSelectedIdeaId(id)}
              />

              {allReacted && (
                <div className="space-y-8 animate-slide-up pt-8 border-t border-warm-200/60">
                  <h3 className="text-xl font-semibold text-warm-900 text-center tracking-tight">Group Consensus</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {activeTrip.tripIdeas.map(idea => (
                      <GroupConsensus 
                        key={idea.id}
                        ideaName={idea.destination}
                        reactions={ideasReactions[idea.id] || []}
                        fitScore={idea.fitScore || 80}
                      />
                    ))}
                  </div>

                  <RefinementSummary 
                    likes={['Food', 'Nature']} 
                    dislikes={['Nightlife']} 
                    onRefine={handleRefine} 
                  />

                  {activeTrip.tripIdeas.length > 0 && (
                    <div className="pt-8">
                      {(() => {
                        let travelDateLabel = '';
                        if (!activeTrip.flexibleDates && activeTrip.startDate && activeTrip.endDate) {
                          travelDateLabel = `${format(new Date(activeTrip.startDate), 'MMM d, yyyy')} - ${format(new Date(activeTrip.endDate), 'MMM d, yyyy')}`;
                        } else if (activeTrip.flexibleDates && activeTrip.dateMonth) {
                          travelDateLabel = `Sometime in ${activeTrip.dateMonth} • ${activeTrip.duration} days`;
                        } else {
                          travelDateLabel = `Sometime in the future • ${activeTrip.duration || 7} days`;
                        }

                        return (
                          <DestinationSelection
                            destination={{ name: activeTrip.tripIdeas[0].destination }}
                            travelers={activeTrip.travelers}
                            dates={travelDateLabel}
                            budget={{ min: activeTrip.tripIdeas[0].estimatedBudget?.min || 0, max: activeTrip.tripIdeas[0].estimatedBudget?.max || 0 }}
                            isAdmin={isAdmin}
                            onConfirm={() => handleSelectDestination(activeTrip.tripIdeas[0])}
                          />
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal for Exploring Idea */}
      <Dialog open={!!selectedIdeaId} onClose={() => setSelectedIdeaId(null)}>
        {selectedIdea && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-warm-900 tracking-tight">{selectedIdea.destination}</h2>
            <p className="text-warm-600 mb-6">{selectedIdea.reasons?.[0]}</p>
            
            <div className="mb-8">
              <h4 className="font-medium text-warm-900 mb-4">How do you feel about this destination?</h4>
              <ReactionBar 
                ideaId={selectedIdea.id}
                currentReaction={userReactions[selectedIdea.id]}
                onReact={(r) => handleReact(selectedIdea.id, r)}
              />
            </div>
            
            {isAdmin ? (
              <button 
                className="w-full py-3.5 bg-warm-900 text-white rounded-xl font-medium shadow-sm hover:bg-warm-800 transition-colors"
                onClick={() => handleSelectDestination(selectedIdea)}
              >
                Select this destination
              </button>
            ) : (
              <div className="w-full py-3.5 bg-warm-100 text-warm-500 rounded-xl font-medium text-center border border-warm-200/50">
                Only the organizer can select the destination
              </div>
            )}
          </div>
        )}
      </Dialog>
    </PageTransition>
  );
};
