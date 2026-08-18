import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { useNavigate, useParams, Link } from 'react-router';
import { TripProgress } from '@/features/trips/components/TripProgress';
import { NextDecision } from '@/features/trips/components/NextDecision';
import { InviteMemberModal } from './components/InviteMemberModal';
import { TripActivityFeed } from '@/features/trips/components/TripActivityFeed';
import { EditTripDateModal } from './components/EditTripDateModal';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarGroup } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { useAuthStore } from '@/stores/authStore';
import { useTripStore } from '@/stores/tripStore';
import { useTrip } from './hooks/useTrip';
import { useTripMembers } from './hooks/useTripMembers';
import { Users, LogOut, X, UserMinus, Check, AlertCircle, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const TripDashboardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditDateOpen, setIsEditDateOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{ id: string; name: string } | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const navigate = useNavigate();
  
  const { user: currentUser } = useAuthStore();
  const { trip: activeTrip } = useTrip(id);
  const { members, removeMember } = useTripMembers(id || '');
  
  const { setActiveTrip, trips, fetchTrips } = useTripStore();

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

  const confirmLeaveTrip = async () => {
    await useTripStore.getState().leaveTrip(activeTrip!.id);
    toast.success('You have left the trip');
    navigate('/');
  };

  const confirmRemoveMember = () => {
    if (memberToRemove && activeTrip) {
      removeMember(activeTrip.id, memberToRemove.id, memberToRemove.name);
      setMemberToRemove(null);
      toast.success('Member removed successfully');
    }
  };

  if (!activeTrip) {
    return (
      <div className="min-h-screen bg-warm-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="dot-pulse flex gap-1"><span></span><span></span><span></span></div>
          <p className="text-warm-500 text-sm font-medium tracking-wide uppercase">Loading trip</p>
        </div>
      </div>
    );
  }

  const hasDestination = !!activeTrip.selectedDestination;
  
  const currentMember = activeTrip.members?.find(m => m.userId === currentUser?.id);
  const isInvited = currentMember?.status === 'invited';
  const needsPreferences = currentMember && !currentMember.preferencesSubmitted && !isInvited;
  const isAdmin = currentMember?.role === 'admin' && !isInvited;

  const nextDecision = activeTrip.decisions?.find(d => d.status === 'open' || d.status === 'voting') || null;

  let travelDateLabel = '';
  if (!activeTrip.flexibleDates && activeTrip.startDate && activeTrip.endDate) {
    travelDateLabel = `${format(new Date(activeTrip.startDate), 'MMM d')} — ${format(new Date(activeTrip.endDate), 'MMM d, yyyy')}`;
  } else if (activeTrip.flexibleDates && activeTrip.dateMonth) {
    travelDateLabel = `Sometime in ${activeTrip.dateMonth}`;
  } else {
    travelDateLabel = `Dates TBD`;
  }

  // Calculate Itinerary Progress
  const itineraryDays = activeTrip.itinerary?.days || [];
  const totalDays = activeTrip.duration || 1;
  const plannedDays = itineraryDays.filter(day => day.items && day.items.length > 0).length;
  const itineraryProgress = totalDays > 0 ? Math.round((plannedDays / totalDays) * 100) : 0;

  const bgImage = activeTrip.selectedDestination?.imageUrl || activeTrip.tripIdeas?.[0]?.imageUrl;

  return (
    <div className="flex-1 bg-warm-950 flex flex-col relative pb-32">
      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-[300px] w-full">
        {bgImage ? (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-warm-800 to-warm-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-warm-950 via-warm-950/60 to-transparent" />
      </div>

      {isInvited && (
        <div className="sticky top-0 z-50 bg-warm-900 text-white px-4 py-4 shadow-md border-b border-white/10">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-full">
                <AlertCircle className="w-5 h-5 text-accent-300" />
              </div>
              <div>
                <p className="font-semibold text-warm-50 text-base">You've been invited!</p>
                <p className="text-sm text-warm-300">Join the trip to start planning with the crew.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button 
                variant="secondary"
                className="flex-1 sm:flex-none bg-transparent border-white/20 text-white hover:bg-white/10"
                onClick={() => {
                  useTripStore.getState().rejectInvitation(activeTrip.id).then(() => {
                    toast.success('Invitation declined');
                    navigate('/');
                  });
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Decline
              </Button>
              <Button 
                variant="primary" 
                className="flex-1 sm:flex-none bg-accent-500 hover:bg-accent-600 text-white border-none shadow-md"
                onClick={() => {
                  useTripStore.getState().joinTrip(activeTrip.id).then(() => toast.success('Welcome to the crew.'));
                }}
              >
                <Check className="w-4 h-4 mr-2" />
                Join Trip
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <main className={cn("flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 lg:p-12 space-y-12 animate-fade-in -mt-32 relative z-10", isInvited && "opacity-60 pointer-events-none")}>
        
        {/* Header / Identity */}
        <section className="text-center pt-8 pb-4">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4 drop-shadow-md">
            {hasDestination ? activeTrip.selectedDestination?.name : activeTrip.name}
          </h1>
          <div className="flex items-center justify-center gap-2 text-warm-300 text-lg font-medium drop-shadow-md">
            <span>{travelDateLabel}</span>
            <span className="text-warm-500">•</span>
            <div className="flex items-center gap-2">
              <span>{activeTrip.members?.length || 1} friends</span>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
            <AvatarGroup size="lg" max={5}>
              {(activeTrip.members || []).filter(m => m.status !== 'invited').map(m => (
                <Avatar key={m.userId} name={m.name} src={m.avatarUrl} size="lg" />
              ))}
            </AvatarGroup>
          </div>
        </section>

        <hr className="border-white/10" />

        {/* Progress Overview */}
        <section className="py-4">
          <h3 className="text-[10px] font-bold tracking-widest text-warm-500 uppercase mb-6 text-center">Trip Progress</h3>
          <div className="flex justify-center">
            <div className="flex items-center gap-12 text-sm">
              <div className={cn("flex flex-col items-center gap-2", hasDestination ? "text-white" : "text-warm-500")}>
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-inner", hasDestination ? "bg-accent-500 text-white shadow-accent-500/50" : "bg-white/5 border border-white/10")}>
                  {hasDestination ? "✓" : "1"}
                </div>
                <span className="font-medium">Destination</span>
              </div>
              <div className="w-8 h-px bg-white/10"></div>
              <div className={cn("flex flex-col items-center gap-2", !activeTrip.flexibleDates ? "text-white" : "text-warm-500")}>
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-inner", !activeTrip.flexibleDates ? "bg-accent-500 text-white shadow-accent-500/50" : "bg-white/5 border border-white/10")}>
                  {!activeTrip.flexibleDates ? "✓" : "2"}
                </div>
                <span className="font-medium">Dates</span>
              </div>
              <div className="w-8 h-px bg-white/10"></div>
              <div className={cn("flex flex-col items-center gap-2", itineraryProgress > 0 ? "text-white" : "text-warm-500")}>
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-inner", itineraryProgress === 100 ? "bg-accent-500 text-white shadow-accent-500/50" : itineraryProgress > 0 ? "bg-accent-500/20 text-accent-400 border border-accent-500/30" : "bg-white/5 border border-white/10")}>
                  {itineraryProgress === 100 ? "✓" : `${itineraryProgress}%`}
                </div>
                <span className="font-medium">Itinerary</span>
              </div>
            </div>
          </div>
        </section>

        <hr className="border-white/10" />

        {/* Next Action / Priority */}
        <section className="py-8 flex flex-col items-center text-center">
          <h3 className="text-[10px] font-bold tracking-widest text-warm-500 uppercase mb-6">Up Next</h3>
          
          {needsPreferences ? (
            <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem]">
              <h4 className="text-2xl font-bold text-white mb-3">Tell us your travel vibe.</h4>
              <p className="text-warm-300 mb-6">Help the AI find the perfect destination by submitting your preferences.</p>
              <Button size="lg" className="w-full rounded-full bg-white text-warm-950 hover:bg-warm-100 font-bold" onClick={() => navigate(`/trips/${id}/preferences`)}>
                Start Survey <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : !hasDestination ? (
            <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem]">
              <h4 className="text-2xl font-bold text-white mb-3">Where should we go?</h4>
              <p className="text-warm-300 mb-6">Start exploring destinations that match everyone's vibe.</p>
              <Button size="lg" className="w-full rounded-full bg-white text-warm-950 hover:bg-warm-100 font-bold" onClick={() => navigate(`/trips/${id}/discover`)}>
                Discover Destinations <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : nextDecision ? (
            <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem]">
              <h4 className="text-2xl font-bold text-white mb-3">{nextDecision.title}</h4>
              <p className="text-warm-300 mb-6">The group is waiting on your input.</p>
              <Button size="lg" className="w-full rounded-full bg-energy-500 hover:bg-energy-600 border-none text-white shadow-sm font-bold" onClick={() => navigate(`/trips/${id}/decisions`)}>
                Decide Now <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : itineraryProgress < 100 ? (
            <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem]">
              <h4 className="text-2xl font-bold text-white mb-3">Shape the itinerary.</h4>
              <p className="text-warm-300 mb-6">You have {totalDays - plannedDays} days left to plan.</p>
              <Button size="lg" className="w-full rounded-full bg-accent-500 hover:bg-accent-600 border-none text-white shadow-sm font-bold" onClick={() => navigate(`/trips/${id}/plan`)}>
                Continue Planning <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem]">
              <h4 className="text-2xl font-bold text-white mb-3">You're ready to go ✈️</h4>
              <p className="text-warm-300 mb-6">The plan is set. Just waiting for the adventure to begin.</p>
              <Button size="lg" variant="secondary" className="w-full rounded-full" onClick={() => navigate(`/trips/${id}/plan`)}>
                Review Itinerary <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </section>

        <hr className="border-white/10" />

        {/* The Trip Visuals */}
        {hasDestination && (
          <section className="py-8">
            <h3 className="text-[10px] font-bold tracking-widest text-warm-500 uppercase mb-6 text-center">Your Trip</h3>
            <div className="w-full aspect-[21/9] md:aspect-[3/1] bg-warm-900 rounded-[2rem] overflow-hidden relative group cursor-pointer border border-white/10" onClick={() => navigate(`/trips/${id}/discover`)}>
              <img 
                src={activeTrip.selectedDestination?.imageUrl || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=2000'} 
                alt="Destination" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
                <div className="text-white">
                  <Badge className="bg-white/20 backdrop-blur-md border border-white/20 text-white mb-3 shadow-md hover:bg-white/30 tracking-wider font-bold">Destination Set</Badge>
                  <h3 className="text-4xl font-bold tracking-tight">{activeTrip.selectedDestination?.name}</h3>
                </div>
              </div>
            </div>
          </section>
        )}

        <hr className="border-white/10" />

        {/* Activity Story */}
        {!isInvited && (
          <section className="py-8 max-w-2xl mx-auto w-full">
            <h3 className="text-[10px] font-bold tracking-widest text-warm-500 uppercase mb-8 text-center">What's Happening</h3>
            <TripActivityFeed />
          </section>
        )}
        
        {/* Quick Utilities (Invite / Settings) */}
        <section className="py-8 mt-12 max-w-lg mx-auto w-full">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col sm:flex-row gap-3">
            <Button size="lg" variant="secondary" className="flex-1 bg-white/10 border-0 text-white hover:bg-white/20" onClick={() => setIsInviteModalOpen(true)}>
              <Users className="w-4 h-4 mr-2" /> Invite
            </Button>
            {isAdmin && (
              <Button size="lg" variant="secondary" className="flex-1 bg-white/10 border-0 text-white hover:bg-white/20" onClick={() => setIsEditDateOpen(true)}>
                Edit Details
              </Button>
            )}
            <Button size="lg" variant="secondary" className="flex-1 bg-error-500/20 text-error-400 border border-error-500/20 hover:bg-error-500/30 hover:text-error-300" onClick={() => setShowLeaveConfirm(true)}>
              Leave Trip
            </Button>
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

        {/* Modals for removing/leaving */}
        <Dialog open={!!memberToRemove} onClose={() => setMemberToRemove(null)}>
          <div className="flex flex-col items-center text-center p-2">
            <div className="w-16 h-16 bg-error-50 rounded-full flex items-center justify-center mb-5">
              <UserMinus className="w-8 h-8 text-error-600" />
            </div>
            <h3 className="text-2xl font-bold text-warm-900 mb-3 tracking-tight">Remove Member</h3>
            <p className="text-warm-600 text-base mb-8 px-4">
              Remove <strong className="text-warm-900">{memberToRemove?.name}</strong> from this trip?
            </p>
            <div className="flex gap-3 w-full">
              <Button variant="secondary" className="flex-1" size="lg" onClick={() => setMemberToRemove(null)}>Cancel</Button>
              <Button variant="primary" className="flex-1 bg-error-600 hover:bg-error-700 text-white border-error-600" size="lg" onClick={confirmRemoveMember}>Remove</Button>
            </div>
          </div>
        </Dialog>

        <Dialog open={showLeaveConfirm} onClose={() => setShowLeaveConfirm(false)}>
          <div className="flex flex-col items-center text-center p-2">
            <div className="w-16 h-16 bg-error-50 rounded-full flex items-center justify-center mb-5">
              <LogOut className="w-8 h-8 text-error-600 ml-1" />
            </div>
            <h3 className="text-2xl font-bold text-warm-900 mb-3 tracking-tight">Leave Trip</h3>
            <p className="text-warm-600 text-base mb-8 px-4">
              Are you sure you want to leave this trip?
            </p>
            <div className="flex gap-3 w-full">
              <Button variant="secondary" className="flex-1" size="lg" onClick={() => setShowLeaveConfirm(false)}>Cancel</Button>
              <Button variant="primary" className="flex-1 bg-error-600 hover:bg-error-700 text-white border-error-600" size="lg" onClick={confirmLeaveTrip}>Leave</Button>
            </div>
          </div>
        </Dialog>
      </main>
    </div>
  );
};
