import React, { useEffect, useState } from 'react';
import { PageTransition } from '@/components/motion/PageTransition';
import { cn } from '@/lib/utils/cn';
import { useTripStore } from '@/stores/tripStore';
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
import type { TripContext, ReactionType, TripIdea, TripReaction } from '@/types';

export const DiscoveryPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeTrip, currentUser, setTripIdeas, addReaction, selectDestination } = useTripStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);

  // Mock Context
  const context: TripContext = {
    origin: 'Jakarta',
    travelers: 4,
    budgetPerPerson: 4000000,
    dateMonth: 'September',
    flexibleDates: true,
    duration: 5,
    preferences: { food: 5, beach: 4, nature: 4, culture: 3, cafes: 2, nightlife: 1, adventure: 1, shopping: 1 } as any
  };

  const aggregatePreferences = [
    { category: 'food', label: 'Food', score: 95, emoji: '🍜' },
    { category: 'beach', label: 'Beach', score: 80, emoji: '🌊' },
    { category: 'nature', label: 'Nature', score: 75, emoji: '🌿' },
    { category: 'culture', label: 'Culture', score: 60, emoji: '🏛' },
    { category: 'cafes', label: 'Cafés', score: 40, emoji: '☕' },
    { category: 'nightlife', label: 'Nightlife', score: 20, emoji: '🎉' },
  ];

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
    addReaction(activeTrip.id, {
      tripIdeaId: ideaId,
      userId: currentUser.id,
      userName: currentUser.name,
      reaction: type,
    });

    // Simulate other members reacting
    const members = activeTrip.members.filter(m => m.userId !== currentUser.id);
    members.forEach((m, index) => {
      setTimeout(() => {
        const mockReactionTypes: ReactionType[] = ['love', 'maybe', 'nope'];
        const randomReact = mockReactionTypes[Math.floor(Math.random() * mockReactionTypes.length)];
        
        addReaction(activeTrip.id, {
          tripIdeaId: ideaId,
          userId: m.userId,
          userName: m.name,
          reaction: type === 'love' && Math.random() > 0.5 ? 'love' : randomReact,
        });
      }, (index + 1) * 800);
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

    if (r.userId === currentUser.id) {
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
            <span className="text-sm">👥</span>
            <span>4 friends</span>
          </div>
          <div className="hidden sm:block text-warm-300">•</div>
          <div className="flex items-center gap-2">
            <span className="text-sm">📅</span>
            <span>September</span>
          </div>
          <div className="hidden sm:block text-warm-300">•</div>
          <div className="flex items-center gap-2">
            <span className="text-sm">⏳</span>
            <span>4–5 days</span>
          </div>
          <div className="hidden sm:block text-warm-300">•</div>
          <div className="flex items-center gap-2">
            <span className="text-sm">💰</span>
            <span>Rp 4M/person</span>
          </div>
          <div className="hidden sm:block text-warm-300">•</div>
          <div className="flex items-center gap-2">
            <span className="text-sm">📍</span>
            <span>Jakarta</span>
          </div>
        </div>

        <GroupPreferenceSummary preferences={aggregatePreferences} />
        
        <hr className="border-warm-200/60" />

        <div>
          <h2 className="text-2xl font-semibold text-warm-900 tracking-tight mb-8">Here's what we found</h2>
          
          {isLoading ? (
            <AILoadingState 
              message="Finding places that fit your group..."
              steps={[
                { label: "Analyzing group preferences", completed: true },
                { label: "Checking travel constraints", completed: true },
                { label: "Generating personalized ideas", completed: false }
              ]} 
            />
          ) : isRefining ? (
            <AILoadingState message="Refining ideas based on your group's feedback..." />
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
                      <DestinationSelection
                        destination={{ name: activeTrip.tripIdeas[0].destination }}
                        travelers={4}
                        dates="Sep 10 - Sep 15, 2024"
                        budget={{ min: 3500000, max: 4500000 }}
                        onConfirm={() => handleSelectDestination(activeTrip.tripIdeas[0])}
                      />
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
            
            <button 
              className="w-full py-3.5 bg-warm-900 text-white rounded-xl font-medium shadow-sm hover:bg-warm-800 transition-colors"
              onClick={() => handleSelectDestination(selectedIdea)}
            >
              Select this destination
            </button>
          </div>
        )}
      </Dialog>
    </PageTransition>
  );
};
