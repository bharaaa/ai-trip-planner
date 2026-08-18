import React from 'react';
import { useNavigate } from 'react-router';
import { Plane, Compass } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { getGreeting } from '@/lib/utils/formatting';
import { useTripStore } from '@/stores/tripStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { TripCard } from '@/features/trips/components/TripCard';
import { Card } from '@/components/ui/Card';
import { PageTransition } from '@/components/motion/PageTransition';

const HERO_BG = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop"; 

export function HomePage() {
  const navigate = useNavigate();
  const trips = useTripStore((state) => state.trips);
  const isLoadingTrips = useTripStore((state) => state.isLoadingTrips);
  const { user } = useAuthStore();
  const greeting = getGreeting();

  const firstName = user?.name?.split(' ')[0] || 'there';

  const activeTrips = trips.filter(trip => {
    const member = trip.members.find(m => m.userId === user?.id);
    return member?.status !== 'invited';
  });

  return (
    <PageTransition>
      <div className="min-h-screen bg-warm-950 flex flex-col">
        {/* Full Bleed Hero Section */}
        <section className="relative h-[65vh] min-h-[500px] flex flex-col items-center justify-center text-center overflow-hidden">
          {/* Background Image with Parallax feel */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105"
            style={{ backgroundImage: `url(${HERO_BG})`, filter: 'saturate(1.2)' }}
          />
          {/* Gradients to fade into content */}
          <div className="absolute inset-0 bg-gradient-to-t from-warm-950 via-warm-950/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-warm-950/60 to-transparent" />
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 space-y-8 mt-12 animate-fade-in">
            <div className="space-y-4">
              <p className="text-warm-300 font-bold tracking-[0.2em] uppercase text-xs md:text-sm">
                {greeting}, {firstName}
              </p>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[0.95]">
                The world <br/> is waiting.
              </h1>
            </div>

            <Button 
              size="lg" 
              className="rounded-full px-10 py-6 text-lg font-bold bg-white text-warm-950 hover:bg-warm-100 shadow-2xl transition-all duration-300 hover:scale-105 border-0"
              onClick={() => navigate('/trips/new')}
            >
              <Compass className="w-6 h-6 mr-2" /> Start a new journey
            </Button>
          </div>
        </section>

        {/* Trips Section */}
        <section className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 -mt-20 relative z-20 pb-32 animate-slide-up" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Your Adventures</h2>
          </div>
          
          {isLoadingTrips ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="h-[400px] bg-warm-900/50 rounded-3xl animate-pulse" />
              <div className="h-[400px] bg-warm-900/50 rounded-3xl animate-pulse" />
              <div className="h-[400px] bg-warm-900/50 rounded-3xl animate-pulse hidden lg:block" />
            </div>
          ) : activeTrips && activeTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTrips.map(trip => (
                <TripCard 
                  key={trip.id} 
                  trip={trip} 
                  onClick={() => navigate(`/trips/${trip.id}`)} 
                />
              ))}
            </div>
          ) : (
            <Card className="p-16 text-center border border-white/5 bg-white/5 backdrop-blur-xl flex flex-col items-center justify-center min-h-[400px] rounded-[2.5rem]">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6 text-white">
                <Plane className="w-10 h-10" />
              </div>
              <p className="text-2xl font-bold text-white mb-3 tracking-tight">Nothing planned yet.</p>
              <p className="text-warm-300 mb-8 max-w-sm text-lg leading-relaxed">That's okay. Every great trip starts with "I don't know where to go."</p>
              <Button onClick={() => navigate('/trips/new')} className="rounded-full px-8 py-6 text-base font-bold bg-accent-500 hover:bg-accent-600 text-white border-0">
                Let's figure it out
              </Button>
            </Card>
          )}
        </section>
      </div>
    </PageTransition>
  );
}
