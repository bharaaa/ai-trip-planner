import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { useNavigate, useParams, Link } from 'react-router';
import { TripProgress } from '@/components/trip/TripProgress';
import { NextDecision } from '@/components/trip/NextDecision';
import { InviteMemberModal } from './components/InviteMemberModal';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarGroup } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useTripStore } from '@/stores/tripStore';
import { useAuthStore } from '@/stores/authStore';

export const TripDashboardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const navigate = useNavigate();
  const { activeTrip, setActiveTrip, trips, fetchTrips } = useTripStore();
  const { user: currentUser } = useAuthStore();

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
  
  const currentMember = activeTrip.members?.find(m => m.userId === currentUser?.id);
  const needsPreferences = currentMember && !currentMember.preferencesSubmitted;

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
              {hasDestination ? `${activeTrip.selectedDestination?.name}, ${activeTrip.selectedDestination?.country}` : 'Still discovering...'}
            </h1>
            <div className="mt-8 max-w-2xl">
              <TripProgress 
                trip={{
                  checkpoints: [
                    { id: '1', label: 'Dates', completed: !activeTrip.flexibleDates },
                    { id: '2', label: 'Destination', completed: !!activeTrip.selectedDestination },
                    { id: '3', label: 'Accommodation', completed: activeTrip.decisions?.some(d => d.type === 'accommodation' && d.status === 'decided') || false },
                    { id: '4', label: 'Itinerary', completed: !!activeTrip.itinerary },
                  ]
                }} 
              />
            </div>
          </div>
        </section>

        {/* Action Priority */}
        {needsPreferences ? (
          <section>
            <NextDecision 
              title="Submit your travel preferences"
              description="Help the AI find the perfect destination by telling us what you love to do, your pace, and your budget."
              actionLabel="Start Survey"
              onAction={() => navigate(`/trips/${id}/preferences`)}
              type="destination"
            />
          </section>
        ) : nextDecision ? (
          <section>
            <NextDecision 
              title={nextDecision.title}
              description={nextDecision.description || "Locking this in helps finalize the budget and map out the daily itinerary."}
              actionLabel="Decide Now"
              onAction={() => navigate(`/trips/${id}/decisions`)}
              type={nextDecision.type}
            />
          </section>
        ) : null}

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

        {/* The Crew */}
        <section>
          <h2 className="text-sm font-semibold text-warm-500 uppercase tracking-wider mb-4">The Crew</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTrip.members?.map(member => (
              <Card key={member.userId} className="p-4 flex items-center gap-4 bg-white border-warm-200/40 hover:border-warm-300 transition-colors">
                <Avatar name={member.name} src={member.avatarUrl} size="lg" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-warm-900 truncate">{member.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={member.role === 'admin' ? 'accent' : 'outline'} className="text-[10px] px-1.5 py-0 uppercase">
                      {member.role === 'admin' ? 'Organizer' : 'Member'}
                    </Badge>
                  </div>
                </div>
                <div className="shrink-0 text-xs font-medium flex flex-col items-end gap-2">
                  {member.preferencesSubmitted ? (
                    <>
                      <span className="text-success-600 flex items-center gap-1 bg-success-50 px-2 py-1 rounded-md" title="Preferences Submitted">✓ Ready</span>
                      {member.userId === currentUser?.id && (
                        <Button 
                          size="sm" 
                          variant="secondary"
                          className="h-7 px-3 text-xs font-medium text-warm-700 border-warm-200 hover:border-warm-300 hover:bg-warm-50 shadow-sm transition-all"
                          onClick={() => navigate(`/trips/${id}/preferences`)}
                        >
                          Edit Preferences
                        </Button>
                      )}
                    </>
                  ) : (
                    <span className="text-warm-500 flex items-center gap-1 bg-warm-100 px-2 py-1 rounded-md" title="Waiting for preferences">⏳ Pending</span>
                  )}
                </div>
              </Card>
            ))}
            
            {/* Add Member Placeholder */}
            <button 
              className="p-4 flex items-center gap-4 border-2 border-dashed border-warm-200 rounded-xl hover:border-accent-400 hover:bg-accent-50/50 transition-all text-left group"
              onClick={() => setIsInviteModalOpen(true)}
            >
              <div className="w-12 h-12 rounded-full bg-warm-100 text-warm-400 flex items-center justify-center group-hover:bg-accent-100 group-hover:text-accent-500 transition-colors shrink-0">
                <span className="text-xl">+</span>
              </div>
              <div>
                <h3 className="font-semibold text-warm-700 group-hover:text-accent-600 transition-colors">Invite someone</h3>
                <p className="text-xs text-warm-500 mt-0.5">Add to this trip</p>
              </div>
            </button>
          </div>
        </section>

        <InviteMemberModal 
          open={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          tripId={activeTrip.id}
          existingMembers={activeTrip.members}
        />
      </main>
    </div>
  );
};
