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
  const { activeTrip, addDecision, addDecisionVote } = useTripStore();
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
    addDecisionVote(id, decisionId, optionId, user.id, 'for');
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
      <div className="min-h-screen bg-warm-50 flex flex-col">
        <div className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-warm-900 tracking-tight">Decisions</h1>
              <p className="text-warm-500 mt-1">Vote and finalize details with your group.</p>
            </div>
            
            <Button 
              variant="secondary" 
              className="shrink-0 bg-white shadow-sm border-warm-200 text-warm-700"
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
            <div className="text-center p-12 bg-warm-50 rounded-2xl border border-warm-300 border-dashed">
              <p className="text-warm-500">No decisions found for this filter.</p>
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
            className="w-full mt-4 bg-accent-400 hover:bg-accent-500 text-white" 
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
