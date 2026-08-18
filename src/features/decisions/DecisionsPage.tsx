import React, { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { Tabs } from '@/components/ui/Tabs';
import { DecisionCard } from './components/DecisionCard';
import type { Decision } from '@/types';
import { useParams } from 'react-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { PageTransition } from '@/components/motion/PageTransition';
import { useTripStore } from '@/stores/tripStore';
import { useAuthStore } from '@/stores/authStore';

export const DecisionsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { activeTrip, addDecision, addDecisionVote, removeDecisionVote } = useTripStore();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<'all' | 'open' | 'decided'>('open');
  const [isNewDecisionOpen, setIsNewDecisionOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

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
    // We generate UUIDs matching Supabase format usually, but here we let Supabase handle it if we want.
    // However our store expects an ID, so let's generate a temporary unique string (UUID format is better, but we'll use a random string).
    const newDecisionId = crypto.randomUUID();
    const newDecision: Decision = {
      id: newDecisionId,
      title: newTitle,
      description: newDescription,
      type: 'activity',
      status: 'open',
      createdAt: new Date(),
      options: [
        { id: crypto.randomUUID(), title: 'Surf Lesson', description: '2 hours at Echo Beach', votes: [] },
        { id: crypto.randomUUID(), title: 'Option 2', description: '', votes: [] },
      ],
      participants: []
    };
    addDecision(id, newDecision);
    setIsNewDecisionOpen(false);
    setNewTitle('');
    setNewDescription('');
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-warm-950 flex flex-col">
        <div className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 lg:p-8 pt-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Decisions</h1>
              <p className="text-lg text-warm-300 mt-2">Time to make some calls.</p>
            </div>
            
            <Button 
              variant="secondary" 
              className="shrink-0 bg-white/10 text-white border-0 hover:bg-white/20 font-bold"
              onClick={() => setIsNewDecisionOpen(true)}
            >
              + New Decision
            </Button>
          </div>

          <Tabs 
            tabs={[
              { id: 'open', label: 'Open & Voting' },
              { id: 'decided', label: 'Decided' },
              { id: 'all', label: 'All' }
            ]}
            activeTab={filter} 
            onTabChange={(v) => setFilter(v as 'open' | 'decided' | 'all')} 
            className="mb-6" 
          />

          {filteredDecisions.length === 0 ? (
            <div className="text-center p-12 bg-white/5 rounded-[2rem] border border-white/10 border-dashed">
              <p className="text-warm-400 font-medium">No decisions found for this filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDecisions.map(decision => (
                <DecisionCard 
                  key={decision.id} 
                  decision={decision} 
                  onVote={(optId) => handleVote(decision.id, optId)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog 
        open={isNewDecisionOpen} 
        onClose={() => setIsNewDecisionOpen(false)}
        title="Create New Decision"
        className="bg-warm-950 border border-white/10 text-white"
      >
        <div className="space-y-4">
          <Input 
            label="Decision Title" 
            placeholder="e.g. Where should we stay?"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
          />
          <Input 
            label="Description (Optional)" 
            placeholder="Add some context for your friends"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
          <Button 
            className="w-full mt-4 bg-accent-500 hover:bg-accent-600 border-none text-white font-bold" 
            onClick={handleCreateDecision}
            disabled={!newTitle.trim()}
          >
            Create
          </Button>
        </div>
      </Dialog>
    </PageTransition>
  );
};
