import React from 'react';
import { useNavigate } from 'react-router';
import { Plane } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { getGreeting } from '@/lib/utils/formatting';
import { useTripStore } from '@/stores/tripStore';
import { Button } from '@/components/ui/Button';
import { TripCard } from '@/components/trip/TripCard';
import { Card } from '@/components/ui/Card';
import type { Trip } from '@/types';
import { PageTransition } from '@/components/motion/PageTransition';

export function HomePage() {
  const navigate = useNavigate();
  const trips = useTripStore((state) => state.trips);
  const greeting = getGreeting();

  return (
    <PageTransition>
      <div className="min-h-screen">
        <section className="gradient-hero py-20 px-4 flex flex-col items-center text-center">
          <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
            <div className="space-y-4">
              <p className="text-base text-warm-500 font-medium">{greeting}</p>
              <h1 className="text-4xl md:text-5xl font-bold text-warm-900 tracking-tight">
                Ready for a new adventure?
              </h1>
            </div>

            <Button 
              size="lg" 
              className="rounded-full px-8 shadow-sm hover:shadow-md transition-shadow"
              onClick={() => navigate('/trips/new')}
            >
              <Plane className="w-4 h-4 mr-2" /> Plan a new trip
            </Button>
          </div>
        </section>

        <section className="max-w-2xl mx-auto px-4 py-12 animate-slide-up" style={{ animationDelay: '150ms' }}>
          <h2 className="text-lg font-semibold text-warm-900 mb-6">Upcoming Adventures</h2>
          
          {trips && trips.length > 0 ? (
            <div className="space-y-3">
              {trips.map(trip => (
                <TripCard 
                  key={trip.id} 
                  trip={trip} 
                  onClick={() => navigate(`/trips/${trip.id}`)} 
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center border-dashed border-warm-300 bg-warm-50/50">
              <p className="text-warm-600">No trips yet. Let's get the group chat together and plan something amazing!</p>
            </Card>
          )}
        </section>
      </div>
    </PageTransition>
  );
}
