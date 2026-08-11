import React, { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { TripHeader } from '@/components/trip/TripHeader';
import { Tabs } from '@/components/ui/Tabs';
import { DecisionCard } from './components/DecisionCard';
import type { Decision } from '@/types';
import { useParams } from 'react-router';
import { Button } from '@/components/ui/Button';

// Mock Decisions
const MOCK_DECISIONS: Decision[] = [
  {
    id: 'd1',
    title: 'Where should we go?',
    description: 'Destination selection',
    type: 'destination',
    status: 'decided',
    decidedOption: 'o1',
    participants: [],
    createdAt: new Date(),
    options: [
      { id: 'o1', title: 'Bali, Indonesia', votes: [{ userId: 'u1', vote: 'for' }, { userId: 'u2', vote: 'for' }] }
    ]
  },
  {
    id: 'd2',
    title: 'When are we going?',
    description: 'Dates for the trip',
    type: 'dates',
    status: 'decided',
    decidedOption: 'o2',
    participants: [],
    createdAt: new Date(),
    options: [
      { id: 'o2', title: 'Sep 15 - 19', votes: [{ userId: 'u1', vote: 'for' }, { userId: 'u3', vote: 'for' }] }
    ]
  },
  {
    id: 'd3',
    title: 'Where should we stay?',
    description: 'Accommodation style',
    type: 'accommodation',
    status: 'voting',
    participants: [],
    createdAt: new Date(),
    options: [
      { id: 'o3', title: 'Villa in Seminyak', description: 'Private pool, 4 beds', votes: [{ userId: 'u1', vote: 'for' }, { userId: 'u2', vote: 'for' }] },
      { id: 'o4', title: 'Hotel in Kuta', description: 'Beachfront, breakfast incl.', votes: [{ userId: 'u3', vote: 'for' }] },
      { id: 'o5', title: 'Airbnb in Ubud', description: 'Jungle views', votes: [] },
    ]
  },
  {
    id: 'd4',
    title: 'How do we get around?',
    description: 'Transportation mode',
    type: 'transportation',
    status: 'open',
    participants: [],
    createdAt: new Date(),
    options: [
      { id: 'o6', title: 'Rent scooters', votes: [] },
      { id: 'o7', title: 'Hire a driver', votes: [] },
      { id: 'o8', title: 'Mix of both', votes: [] },
    ]
  },
  {
    id: 'd5',
    title: 'What should we do on Day 2?',
    description: 'Main activity for the second day',
    type: 'activity',
    status: 'open',
    participants: [],
    createdAt: new Date(),
    options: [
      { id: 'o9', title: 'Beach day at Canggu', votes: [] },
      { id: 'o10', title: 'Uluwatu Temple tour', votes: [] },
      { id: 'o11', title: 'Snorkeling trip', votes: [] },
    ]
  }
];

export const DecisionsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [decisions, setDecisions] = useState(MOCK_DECISIONS);
  const [filter, setFilter] = useState<'all' | 'open' | 'decided'>('open');

  const filteredDecisions = decisions.filter(d => {
    if (filter === 'all') return true;
    if (filter === 'open') return d.status === 'open' || d.status === 'voting';
    if (filter === 'decided') return d.status === 'decided';
    return true;
  });

  const handleVote = (decisionId: string, optionId: string) => {
    // Mock vote logic
    console.log('Voted for', optionId, 'in decision', decisionId);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TripHeader tripName="Group Decisions" members={[]} phase="deciding" />
      
      <div className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Decisions</h1>
            <p className="text-slate-500 mt-1">Vote and finalize details with your group.</p>
          </div>
          
          <Button variant="secondary" className="shrink-0 bg-white shadow-sm border-slate-200 text-slate-700">
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
          onTabChange={(v) => setFilter(v as any)} 
          className="mb-6" 
        />

        {filteredDecisions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
            <p className="text-slate-500">No decisions found for this filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
  );
};
