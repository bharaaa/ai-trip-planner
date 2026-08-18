import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { DecisionCard } from './components/DecisionCard';
import type { Decision } from '@/types';
import { useParams } from 'react-router';
import { PageTransition } from '@/components/motion/PageTransition';
import { useTripStore } from '@/stores/tripStore';
import { useAuthStore } from '@/stores/authStore';
import { AnimatePresence, motion } from 'motion/react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Plus, Check } from 'lucide-react';

export const DecisionsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { activeTrip, addDecision, addDecisionVote, removeDecisionVote } = useTripStore();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<'open' | 'decided' | 'all'>('open');
  
  // Slide-over state
  const [isNewDecisionOpen, setIsNewDecisionOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  const decisions = activeTrip?.decisions || [];

  const filteredDecisions = decisions.filter(d => {
    if (filter === 'all') return true;
    if (filter === 'open') return d.status === 'open' || d.status === 'voting';
    if (filter === 'decided') return d.status === 'decided';
    return true;
  });

  const handleVote = (decisionId: string, optionId: string) => {
    if (!id || !user) return;
    
    // Check if user has already voted for this option
    const decision = decisions.find(d => d.id === decisionId);
    const option = decision?.options.find(o => o.id === optionId);
    const hasVoted = option?.votes.some(v => v.userId === user.id);

    if (hasVoted) {
      removeDecisionVote(id, decisionId, optionId, user.id);
    } else {
      addDecisionVote(id, decisionId, optionId, user.id, 'for');
    }
  };

  const handleCreateDecision = () => {
    if (!newTitle.trim() || !id) return;
    const newDecisionId = crypto.randomUUID();
    const newDecision: Decision = {
      id: newDecisionId,
      title: newTitle,
      description: newDescription,
      type: 'activity',
      status: 'open',
      createdAt: new Date(),
      options: [
        { id: crypto.randomUUID(), title: 'Option A', description: 'Replace with real option', votes: [] },
        { id: crypto.randomUUID(), title: 'Option B', description: 'Replace with real option', votes: [] },
      ],
      participants: []
    };
    addDecision(id, newDecision);
    setIsNewDecisionOpen(false);
    setNewTitle('');
    setNewDescription('');
  };

  // Lock scroll when slide-over is open
  useEffect(() => {
    if (isNewDecisionOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      setTimeout(() => titleInputRef.current?.focus(), 400);
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isNewDecisionOpen]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-warm-950 flex flex-col font-sans selection:bg-accent-500/30">
        <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 pt-32 md:pt-40 pb-32">
          
          <header className="mb-16">
            <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-white mb-4">
              Decisions.
            </h1>
            <p className="text-xl sm:text-2xl text-white/50 font-medium tracking-tight max-w-xl">
              Time to make some calls. Vote on options, finalize plans, and keep the crew moving.
            </p>
          </header>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 sticky top-24 z-10 bg-warm-950/90 backdrop-blur-xl py-4 border-b border-white/5">
            {/* Custom Editorial Tabs */}
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
              {[
                { id: 'open', label: 'Needs Vote' },
                { id: 'decided', label: 'Decided' },
                { id: 'all', label: 'All' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  className="relative pb-2 whitespace-nowrap"
                >
                  <span className={cn(
                    "text-lg font-bold tracking-tight transition-colors",
                    filter === tab.id ? "text-white" : "text-white/40 hover:text-white/70"
                  )}>
                    {tab.label}
                  </span>
                  {filter === tab.id && (
                    <motion.div
                      layoutId="decisions-tab-active"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-400"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setIsNewDecisionOpen(true)}
              className="group flex items-center gap-2 bg-white text-black px-5 py-3 rounded-full font-bold text-sm tracking-wide hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] shrink-0"
            >
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
              New Poll
            </button>
          </div>

          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {filteredDecisions.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-24"
                >
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-8 h-8 text-white/20" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">All caught up</h3>
                  <p className="text-white/40 font-medium">No {filter === 'open' ? 'pending decisions' : 'decisions found'}. You're good to go.</p>
                </motion.div>
              ) : (
                filteredDecisions.map(decision => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    key={decision.id}
                  >
                    <DecisionCard 
                      decision={decision} 
                      onVote={(optId) => handleVote(decision.id, optId)}
                    />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Slide-over Panel for New Decision */}
      {createPortal(
        <AnimatePresence>
          {isNewDecisionOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => setIsNewDecisionOpen(false)}
                className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md"
              />

              {/* Panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed top-0 right-0 bottom-0 z-[100] w-full sm:w-[480px] bg-warm-950 border-l border-white/5 flex flex-col shadow-2xl"
              >
                <div className="p-6 pb-0">
                  <div className="flex items-center justify-between mb-12">
                    <button
                      onClick={() => setIsNewDecisionOpen(false)}
                      className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <span className="text-xs font-semibold text-white/30 tracking-widest uppercase">New Poll</span>
                  </div>

                  <h2 className="text-4xl font-black tracking-tighter text-white mb-2">
                    What's the call?
                  </h2>
                  <p className="text-white/40 text-sm font-medium mb-12">
                    Create a poll to get the crew's vote.
                  </p>
                </div>

                <div className="flex-1 p-6 space-y-10 overflow-y-auto">
                  <div className="relative group">
                    <label className="block text-xs font-bold text-accent-400 uppercase tracking-widest mb-3 transition-colors">
                      The Question
                    </label>
                    <input
                      ref={titleInputRef}
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g., Where are we staying?"
                      className="w-full bg-transparent border-none border-b-2 border-white/10 pb-4 text-3xl font-bold text-white placeholder-white/20 focus:outline-none focus:ring-0 focus:border-accent-400 transition-colors caret-accent-400"
                    />
                  </div>

                  <div className="relative group">
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-3 group-focus-within:text-accent-400 transition-colors">
                      Details (Optional)
                    </label>
                    <textarea
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Add some context for your friends..."
                      rows={3}
                      className="w-full bg-transparent border-none border-b-2 border-white/10 pb-4 text-xl font-medium text-white placeholder-white/20 focus:outline-none focus:ring-0 focus:border-accent-400 transition-colors caret-accent-400 resize-none"
                    />
                  </div>
                  
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                    <p className="text-sm text-white/60 font-medium text-center">
                      (Option adding UI goes here in a future update)
                    </p>
                  </div>
                </div>

                <div className="p-6 border-t border-white/5 bg-warm-950/80 backdrop-blur-md">
                  <button
                    onClick={handleCreateDecision}
                    disabled={!newTitle.trim()}
                    className={cn(
                      "w-full font-bold text-lg px-5 py-4 rounded-full transition-all flex items-center justify-center gap-2",
                      !newTitle.trim()
                        ? "bg-white/10 text-white/30 cursor-not-allowed"
                        : "bg-accent-500 text-white hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(14,165,233,0.3)]"
                    )}
                  >
                    Start Poll
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </PageTransition>
  );
};
