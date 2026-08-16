import React from 'react';
import { useNavigate } from 'react-router';
import { Plane } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { getGreeting } from '@/lib/utils/formatting';
import { useTripStore } from '@/stores/tripStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { TripCard } from '@/components/trip/TripCard';
import { Card } from '@/components/ui/Card';
import type { Trip } from '@/types';
import { PageTransition } from '@/components/motion/PageTransition';

export function HomePage() {
  const navigate = useNavigate();
  const trips = useTripStore((state) => state.trips);
  const { user } = useAuthStore();
  const greeting = getGreeting();

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <PageTransition>
      <div className="min-h-screen bg-warm-50 pb-20">
        <section className="pt-24 pb-16 px-4 flex flex-col items-center text-center">
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
            <div className="space-y-3">
              <p className="text-warm-500 font-semibold tracking-wide uppercase text-sm">
                {greeting}, {firstName}
              </p>
              <h1 className="text-4xl md:text-6xl font-bold text-warm-950 tracking-tight leading-[1.1]">
                Where should we go next?
              </h1>
            </div>

            <Button 
              size="lg" 
              className="rounded-full px-8 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
              onClick={() => navigate('/trips/new')}
            >
              <Plane className="w-5 h-5 mr-2" /> Start planning
            </Button>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 mt-8 animate-slide-up" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-warm-900">Your adventures</h2>
          </div>
          
          {trips && trips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trips.map(trip => (
                <TripCard 
                  key={trip.id} 
                  trip={trip} 
                  onClick={() => navigate(`/trips/${trip.id}`)} 
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center border-0 bg-transparent flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-16 h-16 rounded-full bg-warm-100 flex items-center justify-center mb-6 text-warm-400">
                <Plane className="w-8 h-8" />
              </div>
              <p className="text-xl font-semibold text-warm-900 mb-2">Nothing planned yet.</p>
              <p className="text-warm-500 mb-6">That's okay. Every great trip starts with "I don't know where to go."</p>
              <Button variant="secondary" onClick={() => navigate('/trips/new')} className="rounded-full">
                Let's figure it out
              </Button>
            </Card>
          )}
        </section>
      </div>
    </PageTransition>
  );
}
