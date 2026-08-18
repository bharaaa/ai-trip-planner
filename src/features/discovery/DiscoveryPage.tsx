import React, { useEffect, useState, useRef } from 'react';
import { PageTransition } from '@/components/motion/PageTransition';
import { cn } from '@/lib/utils/cn';
import { useTripStore } from '@/stores/tripStore';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate, useParams } from 'react-router';
import { GroupPreferenceSummary } from '@/features/discovery/components/GroupPreferenceSummary';
import { RecommendationGrid } from '@/features/discovery/components/RecommendationGrid';
import { AILoadingState } from '@/features/ai/components/AILoadingState';
import { GroupConsensus } from '@/features/discovery/components/GroupConsensus';
import { RefinementSummary } from '@/features/discovery/components/RefinementSummary';
import { DestinationSelection } from '@/features/discovery/components/DestinationSelection';
import { ReactionBar } from '@/features/discovery/components/ReactionBar';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { EditTripDialog } from '@/features/trips/components/EditTripDialog';
import { Button } from '@/components/ui/Button';
import { aiService } from '@/services/ai';
import { formatCurrency, formatBudgetRange } from '@/lib/utils/formatting';
import { Users, Calendar, Clock, Wallet, MapPin, RefreshCw, Bookmark, Settings2, SlidersHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import type { TripContext, ReactionType, TripIdea, TripReaction, Decision } from '@/types';

export const DiscoveryPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { activeTrip, setTripIdeas, addReaction, selectDestination, toggleIdeaSaved, addDecision } = useTripStore();

  const isAdmin = activeTrip?.members.find(m => m.userId === currentUser?.id)?.role === 'admin';

  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const fetchStarted = useRef(false);

  // Derive Context from activeTrip
  const context: TripContext = {
    origin: activeTrip?.origin || '',
    travelers: activeTrip?.travelers || 1,
    budgetPerPerson: activeTrip?.budgetPerPerson || 0,
    dateMonth: activeTrip?.dateMonth || '',
    flexibleDates: activeTrip?.flexibleDates || false,
    duration: activeTrip?.duration || 1,
    preferences: activeTrip?.preferences?.[0]?.categories || { food: 5, beach: 4, nature: 4, culture: 3, cafes: 2, nightlife: 1, adventure: 1, shopping: 1 },
    constraints: activeTrip?.travelConstraints
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
    if (activeTrip.tripIdeas.length === 0 && !isLoading && !fetchStarted.current) {
      fetchStarted.current = true;
      const fetchIdeas = async () => {
        setIsLoading(true);
        const ideas = await aiService.generateTripIdeas(context);
        setTripIdeas(activeTrip.id, ideas);
        setIsLoading(false);
      };
      fetchIdeas();
    }
  }, [activeTrip?.id, activeTrip?.tripIdeas.length, isLoading, setTripIdeas]);

  useEffect(() => {
    if (!!selectedIdeaId) {
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
  }, [!!selectedIdeaId]);

  if (!activeTrip) {
    return (
      <div className="min-h-screen bg-warm-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="dot-pulse flex gap-1"><span></span><span></span><span></span></div>
          <p className="text-warm-500 text-sm font-medium tracking-wide uppercase">Loading trip details...</p>
        </div>
      </div>
    );
  }

  const handleRefresh = async () => {
    if (!activeTrip) return;
    setIsLoading(true);
    const ideas = await aiService.generateTripIdeas(context);
    setTripIdeas(activeTrip.id, ideas);
    setIsLoading(false);
  };

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
      imageUrl: idea.imageUrl,
      selectedAt: new Date()
    });
    navigate(`/trips/${activeTrip.id}/plan`);
  };

  const handleProposeDestination = (idea: TripIdea) => {
    if (!activeTrip) return;
    
    const decision: Decision = {
      id: crypto.randomUUID(),
      type: 'destination',
      title: `Should we go to ${idea.destination}?`,
      description: idea.summary,
      status: 'open',
      options: [
        { id: crypto.randomUUID(), title: 'Yes, let\'s go!', votes: [] },
        { id: crypto.randomUUID(), title: 'No, keep looking', votes: [] }
      ],
      participants: [],
      createdAt: new Date()
    };
    
    addDecision(activeTrip.id, decision);
    navigate(`/trips/${activeTrip.id}/decisions`);
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

  let travelDateLabel = '';
  if (!activeTrip.flexibleDates && activeTrip.startDate && activeTrip.endDate) {
    travelDateLabel = `${format(new Date(activeTrip.startDate), 'MMM d, yyyy')} - ${format(new Date(activeTrip.endDate), 'MMM d, yyyy')}`;
  } else if (activeTrip.flexibleDates && activeTrip.dateMonth) {
    travelDateLabel = `Sometime in ${activeTrip.dateMonth}`;
  } else {
    travelDateLabel = 'Sometime in the future';
  }

  return (
    <PageTransition className="min-h-screen bg-warm-950 pb-32">
      <div className="max-w-7xl mx-auto px-6 pt-32 md:pt-40">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* LEFT SIDEBAR: Typography & Vibe */}
          <div className="lg:col-span-4 mb-12 lg:mb-0">
            <div className="lg:sticky lg:top-32 space-y-12">
              <div>
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-[0.9]">
                Discover
              </h1>
              <p className="text-warm-300 text-lg leading-relaxed">
                Explore destinations tailored to your group's unique vibe and constraints.
              </p>
            </div>
            
            {/* Elegant Context List */}
            <div className="space-y-4 text-warm-300">
              <div className="flex items-center gap-4">
                <Users className="w-5 h-5 text-warm-500 opacity-80" />
                <span className="text-white font-medium tracking-wide">{activeTrip.travelers} traveler{activeTrip.travelers !== 1 && 's'}</span>
              </div>
              <div className="flex items-center gap-4">
                <Calendar className="w-5 h-5 text-warm-500 opacity-80" />
                <span className="text-white font-medium tracking-wide">{travelDateLabel}</span>
              </div>
              <div className="flex items-center gap-4">
                <Clock className="w-5 h-5 text-warm-500 opacity-80" />
                <span className="text-white font-medium tracking-wide">{activeTrip.duration} days</span>
              </div>
              <div className="flex items-center gap-4">
                <Wallet className="w-5 h-5 text-warm-500 opacity-80" />
                <span className="text-white font-medium tracking-wide">{formatCurrency(activeTrip.budgetPerPerson || 0)}/person</span>
              </div>
              <div className="flex items-center gap-4">
                <MapPin className="w-5 h-5 text-warm-500 opacity-80" />
                <span className="text-white font-medium tracking-wide">From {activeTrip.origin}</span>
              </div>
              
              {isAdmin && (
                <button 
                  onClick={() => setIsEditDialogOpen(true)}
                  className="flex items-center gap-2 text-accent-400 hover:text-accent-300 font-bold transition-colors pt-4"
                >
                  <Settings2 className="w-4 h-4" />
                  <span>Edit Trip Details</span>
                </button>
              )}

              <button 
                onClick={() => navigate(`/trips/${activeTrip.id}/preferences`)}
                className="flex items-center gap-2 text-warm-400 hover:text-white font-medium transition-colors pt-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Update Preferences</span>
              </button>
            </div>

            <GroupPreferenceSummary preferences={aggregatePreferences} />
            </div>
          </div>

          {/* RIGHT COLUMN: The Feed */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-bold tracking-[0.2em] text-warm-500 uppercase">Top Matches</h2>
              {!isLoading && !isRefining && (
                <Button variant="secondary" size="sm" className="bg-white/5 hover:bg-white/10 border-0 text-white rounded-full px-4" onClick={handleRefresh}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              )}
            </div>
          
          {isLoading ? (
            <div className="py-20 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-accent-500/20 border border-accent-500/30 flex items-center justify-center mx-auto text-accent-400 animate-pulse text-2xl">
                ✨
              </div>
              <div>
                <p className="text-xl font-semibold text-white mb-2">Finding the perfect spots...</p>
                <p className="text-warm-400">Checking group preferences and constraints.</p>
              </div>
            </div>
          ) : isRefining ? (
            <div className="py-20 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-accent-500/20 border border-accent-500/30 flex items-center justify-center mx-auto text-accent-400 animate-pulse text-2xl">
                🤔
              </div>
              <div>
                <p className="text-xl font-semibold text-white mb-2">Taking notes...</p>
                <p className="text-warm-400">Refining ideas based on what you liked and didn't like.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-16">
              <RecommendationGrid 
                ideas={activeTrip.tripIdeas} 
                reactions={ideasReactions}
                userReactions={userReactions}
                onReact={handleReact}
                onToggleSave={(id, isSaved) => toggleIdeaSaved(activeTrip.id, id, isSaved)}
                onExplore={(id) => setSelectedIdeaId(id)}
              />

              {allReacted && (
                <div className="space-y-8 animate-slide-up pt-8 border-t border-white/10">
                  <h3 className="text-xl font-bold text-white text-center tracking-tight">Group Consensus</h3>
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
                        travelers={activeTrip.travelers}
                        dates={travelDateLabel}
                        budget={{ min: activeTrip.tripIdeas[0].estimatedBudget?.min || 0, max: activeTrip.tripIdeas[0].estimatedBudget?.max || 0 }}
                        isAdmin={isAdmin}
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
      </div>
      
      {/* Slide-over Panel for Exploring Idea */}
      {createPortal(
        <AnimatePresence>
          {!!selectedIdeaId && selectedIdea && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => setSelectedIdeaId(null)}
                className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md"
              />

              {/* Panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed top-0 right-0 bottom-0 z-[100] w-full md:w-[600px] lg:w-[720px] bg-warm-950 border-l border-white/5 flex flex-col shadow-2xl overflow-y-auto overflow-x-hidden"
              >
                <div className="flex flex-col text-white pb-12">
                  {/* Header Image & Core Info */}
                  <div className="relative w-full h-[400px] sm:h-[500px] shrink-0">
                    <button
                      onClick={() => setSelectedIdeaId(null)}
                      className="absolute top-6 left-6 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    
                    {selectedIdea.imageUrl ? (
                      <img 
                        src={selectedIdea.imageUrl} 
                        alt={selectedIdea.destination}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-warm-900" />
                    )}
                    
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-warm-950" />
                    
                    {/* Floating Top Right Area */}
                    <div className="absolute top-6 right-6 flex gap-2 z-10">
                      {selectedIdea.fitScore !== undefined && (
                        <div className="bg-black/40 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-lg">
                          ✨ {selectedIdea.fitScore}% Match
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleIdeaSaved(activeTrip.id, selectedIdea.id, !selectedIdea.isSaved);
                        }}
                        className="p-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-white/30 transition-all shadow-lg"
                        aria-label={selectedIdea.isSaved ? "Unsave idea" : "Save idea"}
                      >
                        <Bookmark 
                          size={18} 
                          className={selectedIdea.isSaved ? "fill-white" : ""} 
                          strokeWidth={selectedIdea.isSaved ? 2 : 1.5}
                        />
                      </button>
                    </div>

                    {/* Destination Name floating on image */}
                    <div className="absolute bottom-0 left-0 p-8 w-full">
                      <h2 className="text-5xl sm:text-7xl font-black text-white tracking-tighter mb-2 drop-shadow-md leading-[0.9]">
                        {selectedIdea.destination}
                      </h2>
                      {selectedIdea.country && (
                        <p className="text-white/80 text-xl font-medium drop-shadow-sm flex items-center gap-2">
                          <MapPin size={20} className="text-accent-400" />
                          {selectedIdea.country}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="px-8 mt-8 space-y-12">
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white/5 rounded-3xl p-6 flex flex-col items-center justify-center text-center border border-white/10 shadow-sm transition-transform hover:-translate-y-1">
                        <span className="text-3xl mb-2">💳</span>
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Budget</span>
                        <span className="text-lg font-bold text-white">{formatBudgetRange(selectedIdea.estimatedBudget.min, selectedIdea.estimatedBudget.max)}</span>
                      </div>
                      <div className="bg-white/5 rounded-3xl p-6 flex flex-col items-center justify-center text-center border border-white/10 shadow-sm transition-transform hover:-translate-y-1">
                        <span className="text-3xl mb-2">⏰</span>
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Duration</span>
                        <span className="text-lg font-bold text-white">{selectedIdea.suggestedDuration} days</span>
                      </div>
                      <div className="bg-white/5 rounded-3xl p-6 flex flex-col items-center justify-center text-center border border-white/10 shadow-sm transition-transform hover:-translate-y-1">
                        <span className="text-3xl mb-2">🎯</span>
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Style</span>
                        <span className="text-lg font-bold text-white line-clamp-1">{selectedIdea.travelStyle || 'Varied'}</span>
                      </div>
                    </div>

                    {/* Summary */}
                    <div>
                      <h4 className="text-sm font-bold text-accent-400 uppercase tracking-widest mb-4">Why it fits your group</h4>
                      <p className="text-white/80 text-lg leading-relaxed font-medium">
                        {selectedIdea.summary || selectedIdea.reasons?.[0]}
                      </p>
                    </div>

                    {/* Activities */}
                    {selectedIdea.keyActivities && selectedIdea.keyActivities.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-accent-400 uppercase tracking-widest mb-4">Key Highlights</h4>
                        <div className="flex flex-wrap gap-3">
                          {selectedIdea.keyActivities.map((activity, idx) => (
                            <span key={idx} className="px-5 py-2.5 bg-white/5 text-white rounded-full text-sm font-semibold border border-white/10 shadow-sm">
                              {activity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Reaction & Action */}
                    <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/10 shadow-inner">
                      <h4 className="text-lg font-bold text-white mb-6 text-center tracking-tight">How do you feel about this idea?</h4>
                      <div className="flex justify-center mb-10">
                        <ReactionBar 
                          ideaId={selectedIdea.id}
                          currentReaction={userReactions[selectedIdea.id]}
                          onReact={(r) => handleReact(selectedIdea.id, r)}
                        />
                      </div>
                      
                      {isAdmin ? (
                        activeTrip.members.length > 1 ? (
                          <div className="grid grid-cols-2 gap-4">
                            <button 
                              className="w-full py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-bold text-lg shadow-sm hover:bg-white/20 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
                              onClick={() => handleProposeDestination(selectedIdea)}
                            >
                              🗣️ Propose
                            </button>
                            <button 
                              className="w-full py-4 bg-white text-black rounded-2xl font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                              onClick={() => handleSelectDestination(selectedIdea)}
                            >
                              Select Direct
                            </button>
                          </div>
                        ) : (
                          <button 
                            className="w-full py-4 bg-white text-black rounded-full font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            onClick={() => handleSelectDestination(selectedIdea)}
                          >
                            Select {selectedIdea.destination}
                          </button>
                        )
                      ) : (
                        <div className="w-full py-4 bg-white/5 text-white/40 rounded-2xl font-medium text-center border border-white/10">
                          Only the organizer can select the destination
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      <EditTripDialog 
        open={isEditDialogOpen} 
        onClose={() => setIsEditDialogOpen(false)} 
        tripId={activeTrip.id} 
      />
    </PageTransition>
  );
};
