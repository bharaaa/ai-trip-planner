import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { useNavigate, useParams, Link } from 'react-router';
import { TripProgress } from '@/components/trip/TripProgress';
import { NextDecision } from '@/components/trip/NextDecision';
import { InviteMemberModal } from './components/InviteMemberModal';
import { Drawer } from '@/components/ui/Drawer';
import { TripActivityFeed } from '@/components/trip/TripActivityFeed';
import { EditTripDateModal } from './components/EditTripDateModal';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarGroup } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useTripStore } from '@/stores/tripStore';
import { useAuthStore } from '@/stores/authStore';
import { Users, Settings2, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';

export const TripDashboardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditDateOpen, setIsEditDateOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
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
  const isAdmin = currentMember?.role === 'admin';

  // Find the next open decision, or just show a fallback if none exist
  const nextDecision = activeTrip.decisions?.find(d => d.status === 'open' || d.status === 'voting') || null;

  let travelDateLabel = '';
  if (!activeTrip.flexibleDates && activeTrip.startDate && activeTrip.endDate) {
    travelDateLabel = `${format(new Date(activeTrip.startDate), 'MMM d, yyyy')} - ${format(new Date(activeTrip.endDate), 'MMM d, yyyy')}`;
  } else if (activeTrip.flexibleDates && activeTrip.dateMonth) {
    travelDateLabel = `Sometime in ${activeTrip.dateMonth} • ${activeTrip.duration} days`;
  } else {
    travelDateLabel = `Sometime in the future • ${activeTrip.duration || 7} days`;
  }

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col">
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-4 animate-fade-in">
        
        {/* Hero Section */}
        <section className="relative rounded-[var(--radius-xl)] p-8 md:p-12 border border-warm-200/60 shadow-sm overflow-hidden bg-white mt-4">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent-400 to-warm-400" />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Badge variant="accent" className="shadow-xs">Trip Overview</Badge>
              <div className="flex items-center gap-2 px-3 py-1 bg-warm-100 text-warm-700 text-sm font-medium rounded-full shadow-xs">
                <CalendarDays className="w-4 h-4" />
                {travelDateLabel}
              </div>
              {isAdmin && (
                <button 
                  onClick={() => setIsEditDateOpen(true)}
                  className="text-xs uppercase font-bold text-warm-500 hover:text-accent-600 transition-colors tracking-wider"
                >
                  Edit Dates
                </button>
              )}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-warm-950 tracking-tight mb-3">
              {hasDestination ? `${activeTrip.selectedDestination?.name}, ${activeTrip.selectedDestination?.country}` : 'Still discovering...'}
            </h1>
            <div className="mt-10 max-w-2xl">
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
            
            <div className="mt-8 flex flex-wrap gap-3">
              <Button 
                variant="primary" 
                size="md"
                onClick={() => setIsInviteModalOpen(true)} 
                className="rounded-full pl-4 pr-5 shadow-sm"
              >
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-2">
                  <Users className="w-3.5 h-3.5 text-white" />
                </div>
                Invite Friends
              </Button>
              <Button 
                variant="secondary" 
                size="md"
                onClick={() => navigate(`/trips/${id}/preferences`)} 
                className="rounded-full pl-4 pr-5"
              >
                <div className="w-6 h-6 rounded-full bg-warm-100 flex items-center justify-center mr-2 text-warm-600 group-hover:bg-warm-200 transition-colors">
                  <Settings2 className="w-3.5 h-3.5" />
                </div>
                Edit Preferences
              </Button>
              <Button 
                variant="secondary" 
                size="md"
                onClick={() => setIsActivityOpen(true)} 
                className="rounded-full pl-4 pr-5 bg-white border border-warm-200"
              >
                <div className="w-6 h-6 rounded-full bg-warm-100 flex items-center justify-center mr-2 text-warm-600 group-hover:bg-warm-200 transition-colors">
                  <span className="text-xs font-bold">A</span>
                </div>
                Activity Log
              </Button>
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
          <h2 className="text-xl font-bold text-warm-950 mb-6 tracking-tight">Explore the plan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            <Link to={`/trips/${id}/discover`} className="block group">
              <Card className="h-full bg-white border border-warm-200/60 group-hover:border-accent-300 group-hover:shadow-md transition-all duration-300 p-6 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-full bg-accent-50 text-accent-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 text-xl">
                    💡
                  </div>
                  <h3 className="text-lg font-bold text-warm-900 mb-2">Discover</h3>
                  <p className="text-sm text-warm-600 leading-relaxed">Explore ideas and align group preferences.</p>
                </div>
                <div className="mt-6 text-accent-600 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                  Open <span aria-hidden="true">&rarr;</span>
                </div>
              </Card>
            </Link>

            <Link to={`/trips/${id}/decisions`} className="block group">
              <Card className="h-full bg-white border border-warm-200/60 group-hover:border-info-300 group-hover:shadow-md transition-all duration-300 p-6 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-full bg-info-50 text-info-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 text-xl">
                    ✓
                  </div>
                  <h3 className="text-lg font-bold text-warm-900 mb-2">Decisions</h3>
                  <p className="text-sm text-warm-600 leading-relaxed">Vote on options and finalize details.</p>
                </div>
                <div className="mt-6 text-info-600 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                  Open <span aria-hidden="true">&rarr;</span>
                </div>
              </Card>
            </Link>

            <Link to={`/trips/${id}/plan`} className="block group">
              <Card className="h-full bg-white border border-warm-200/60 group-hover:border-success-300 group-hover:shadow-md transition-all duration-300 p-6 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-full bg-success-50 text-success-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 text-xl">
                    🗺️
                  </div>
                  <h3 className="text-lg font-bold text-warm-900 mb-2">Itinerary</h3>
                  <p className="text-sm text-warm-600 leading-relaxed">Plan day-by-day activities and routes.</p>
                </div>
                <div className="mt-6 text-success-600 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                  Open <span aria-hidden="true">&rarr;</span>
                </div>
              </Card>
            </Link>

          </div>
        </section>

        {/* The Crew */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-warm-950 tracking-tight">The Crew</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTrip.members?.map(member => (
              <Card key={member.userId} className="p-4 flex items-center gap-4 bg-white border border-warm-200/60 hover:shadow-sm transition-all">
                <Avatar name={member.name} src={member.avatarUrl} size="lg" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-warm-900 truncate">{member.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={member.role === 'admin' ? 'accent' : 'outline'} className="text-[10px] px-2">
                      {member.role === 'admin' ? 'Organizer' : 'Member'}
                    </Badge>
                  </div>
                </div>
                <div className="shrink-0 text-xs font-medium flex flex-col items-end gap-2">
                  {member.preferencesSubmitted ? (
                    <span className="text-success-700 flex items-center gap-1 bg-success-100 px-2 py-1 rounded-md shadow-xs">✓ Ready</span>
                  ) : (
                    <span className="text-warm-600 flex items-center gap-1 bg-warm-100 px-2 py-1 rounded-md shadow-xs">⏳ Pending</span>
                  )}
                </div>
              </Card>
            ))}
            
          </div>
        </section>

        <InviteMemberModal 
          open={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          tripId={activeTrip.id}
          existingMembers={activeTrip.members}
        />

        <EditTripDateModal 
          open={isEditDateOpen}
          onClose={() => setIsEditDateOpen(false)}
          trip={activeTrip}
          onUpdate={(data) => useTripStore.getState().updateTripDates(activeTrip.id, data)}
        />

        <Drawer 
          open={isActivityOpen} 
          onClose={() => setIsActivityOpen(false)} 
          title="Activity Log"
        >
          <TripActivityFeed />
        </Drawer>
      </main>
    </div>
  );
};
