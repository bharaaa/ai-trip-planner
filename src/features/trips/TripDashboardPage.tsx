import React, { useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import { useNavigate, useParams, Link } from 'react-router';
import { TripProgress } from '@/components/trip/TripProgress';
import { NextDecision } from '@/components/trip/NextDecision';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useTripStore } from '@/stores/tripStore';

export const TripDashboardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeTrip, setActiveTrip, trips, fetchTrips } = useTripStore();

  useEffect(() => {
    if (trips.length === 0) {
      fetchTrips();
    }
  }, [fetchTrips, trips.length]);

  useEffect(() => {
    if (id && (!activeTrip || activeTrip.id !== id)) {
      setActiveTrip(id);
    }
  }, [id, activeTrip, setActiveTrip]);

  if (!activeTrip) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <p className="text-warm-500">Loading trip data...</p>
      </div>
    );
  }

  const hasDestination = !!activeTrip.selectedDestination;
  
  // Find the next open decision, or just show a fallback if none exist
  const nextDecision = activeTrip.decisions?.find(d => d.status === 'open' || d.status === 'voting') || null;

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col">
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-8 animate-fade-in">
        
        {/* Hero Section */}
        <section className="gradient-warm rounded-2xl p-6 md:p-8 border border-warm-200/40 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <Badge variant="accent" className="mb-4">Trip Dashboard</Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-warm-900 tracking-tight mb-2">
              {hasDestination ? `${activeTrip.selectedDestination?.title}, ${activeTrip.selectedDestination?.country}` : 'Still discovering...'}
            </h1>
            <p className="text-warm-500 font-medium">
              {activeTrip.members?.length || 1} Members
            </p>
            
            <div className="mt-8 max-w-2xl">
              <TripProgress 
                trip={{
                  checkpoints: [
                    { id: '1', label: 'Destination', completed: !!activeTrip.selectedDestination },
                    { id: '2', label: 'Dates', completed: !activeTrip.flexibleDates },
                    { id: '3', label: 'Accommodation', completed: activeTrip.decisions?.some(d => d.type === 'accommodation' && d.status === 'decided') || false },
                    { id: '4', label: 'Itinerary', completed: !!activeTrip.itinerary },
                  ]
                }} 
              />
            </div>
          </div>
        </section>

        {/* Action Priority */}
        {nextDecision && (
          <section>
            <NextDecision 
              title={nextDecision.title}
              description={nextDecision.description || "Locking this in helps finalize the budget and map out the daily itinerary."}
              actionLabel="Decide Now"
              onAction={() => navigate(`/trips/${id}/decisions`)}
              type={nextDecision.type}
            />
          </section>
        )}

        {/* Quick Links Grid */}
        <section>
          <h2 className="text-sm font-semibold text-warm-500 uppercase tracking-wider mb-4">Workspaces</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <Link to={`/trips/${id}/discover`} className="block group">
              <Card className="h-full bg-white border-warm-200/40 hover:border-accent-400/50 hover:shadow-md transition-all p-5">
                <div className="w-10 h-10 rounded-lg bg-accent-50 text-accent-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  💡
                </div>
                <h3 className="font-semibold text-warm-900 mb-1">Discover</h3>
                <p className="text-sm text-warm-500">Explore ideas and align group preferences.</p>
              </Card>
            </Link>

            <Link to={`/trips/${id}/decisions`} className="block group">
              <Card className="h-full bg-white border-warm-200/40 hover:border-accent-400/50 hover:shadow-md transition-all p-5">
                <div className="w-10 h-10 rounded-lg bg-info-50 text-info-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  ✓
                </div>
                <h3 className="font-semibold text-warm-900 mb-1">Decisions</h3>
                <p className="text-sm text-warm-500">Vote on options and finalize details.</p>
              </Card>
            </Link>

            <Link to={`/trips/${id}/plan`} className="block group">
              <Card className="h-full bg-white border-warm-200/40 hover:border-accent-400/50 hover:shadow-md transition-all p-5">
                <div className="w-10 h-10 rounded-lg bg-success-50 text-success-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  🗺️
                </div>
                <h3 className="font-semibold text-warm-900 mb-1">Itinerary</h3>
                <p className="text-sm text-warm-500">Plan day-by-day activities and routes.</p>
              </Card>
            </Link>

          </div>
        </section>

      </main>
    </div>
  );
};
