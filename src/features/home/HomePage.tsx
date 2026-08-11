import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/utils/cn';
import { getGreeting } from '@/lib/utils/formatting';
import { useTripStore } from '@/stores/tripStore';
import { Button } from '@/components/ui/Button';
import { TripCard } from '@/components/trip/TripCard';
import { Card } from '@/components/ui/Card';
import type { Trip } from '@/types';

export function HomePage() {
  const navigate = useNavigate();
  const trips = useTripStore((state) => state.trips);
  
  useEffect(() => {
    // Initialize mock trips if empty
    if (trips.length === 0) {
      useTripStore.setState({
        trips: [
          {
            id: '1',
            name: 'Japan Adventure',
            status: 'planning',
            phase: 'plan',
            progress: 72,
            members: [
              { userId: '1', name: 'Bhara', role: 'admin', joinedAt: new Date(), preferencesSubmitted: true },
              { userId: '2', name: 'A', role: 'member', joinedAt: new Date(), preferencesSubmitted: true },
              { userId: '3', name: 'B', role: 'member', joinedAt: new Date(), preferencesSubmitted: true },
              { userId: '4', name: 'C', role: 'member', joinedAt: new Date(), preferencesSubmitted: true }
            ],
            destination: 'Japan',
            dates: 'Oct 2026',
            createdAt: new Date(),
            updatedAt: new Date(),
            preferences: [],
            tripIdeas: [],
            reactions: [],
            decisions: [],
            tasks: [],
            expenses: [],
            currency: 'IDR',
            budgetFlexibility: 50,
            travelers: 4
          } as unknown as Trip,
          {
            id: '2',
            name: 'Bali Escape',
            status: 'ready',
            phase: 'book',
            progress: 91,
            members: [
              { userId: '1', name: 'Bhara', role: 'admin', joinedAt: new Date(), preferencesSubmitted: true },
              { userId: '2', name: 'A', role: 'member', joinedAt: new Date(), preferencesSubmitted: true },
              { userId: '3', name: 'B', role: 'member', joinedAt: new Date(), preferencesSubmitted: true }
            ],
            destination: 'Bali, Indonesia',
            dates: 'Dec 2026',
            createdAt: new Date(),
            updatedAt: new Date(),
            preferences: [],
            tripIdeas: [],
            reactions: [],
            decisions: [],
            tasks: [],
            expenses: [],
            currency: 'IDR',
            budgetFlexibility: 50,
            travelers: 3
          } as unknown as Trip
        ]
      });
    }
  }, [trips.length]);

  const greeting = getGreeting();

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 min-h-screen">
      <div className="flex flex-col items-center text-center space-y-8 animate-fade-in">
        <div className="space-y-4">
          <p className="text-lg text-warm-600 font-medium">{greeting}</p>
          <h1 className="text-4xl md:text-5xl font-semibold text-warm-900 tracking-tight">
            Where are we going?
          </h1>
        </div>

        <Button 
          size="lg" 
          className="rounded-full px-8 shadow-sm hover:shadow-md transition-shadow"
          onClick={() => navigate('/trips/new')}
        >
          + Start a trip
        </Button>
      </div>

      <div className="mt-24 animate-slide-up" style={{ animationDelay: '150ms' }}>
        <h2 className="text-xl font-medium text-warm-900 mb-6">Your trips</h2>
        
        {trips && trips.length > 0 ? (
          <div className="space-y-4">
            {trips.map(trip => (
              <TripCard 
                key={trip.id} 
                trip={trip} 
                onClick={() => navigate(`/trips/${trip.id}`)} 
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center border-dashed bg-warm-50/50">
            <p className="text-warm-600">No trips yet. Start planning your next adventure.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
