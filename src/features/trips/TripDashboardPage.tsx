import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { useNavigate, useParams, Link } from 'react-router';
import { PageTransition } from '@/components/motion/PageTransition';
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
import { Users, LogOut, X, UserMinus, Check, AlertCircle, ArrowRight, Calendar } from 'lucide-react';
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

  const itineraryDays = activeTrip.itinerary?.days || [];
  const totalDays = activeTrip.duration || 1;
  const plannedDays = itineraryDays.filter(day => day.items && day.items.length > 0).length;
  const itineraryProgress = totalDays > 0 ? Math.round((plannedDays / totalDays) * 100) : 0;

  const bgImage = activeTrip.selectedDestination?.imageUrl || activeTrip.tripIdeas?.[0]?.imageUrl;

  return (
    <PageTransition className="flex-1 bg-warm-950 flex flex-col relative pb-32">
      {/* Immersive Hero Section */}
      <div className="relative h-[65vh] min-h-[500px] w-full flex flex-col justify-end">
        {bgImage ? (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-warm-800 to-warm-900" />
        )}
        
        {/* Elegant Vignette & Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-warm-950 via-warm-950/40 to-transparent" />
        
        {/* Hero Content (Overlaid on bottom left) */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-8 pb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 animate-slide-up">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-6 leading-[0.9] drop-shadow-lg">
              {hasDestination ? activeTrip.selectedDestination?.name : activeTrip.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-warm-200 text-lg md:text-xl font-medium drop-shadow-md">
              <span className="flex items-center gap-2"><Calendar className="w-5 h-5 text-warm-400" /> {travelDateLabel}</span>
              <span className="text-white/20 hidden sm:block">•</span>
              <span className="flex items-center gap-2"><Users className="w-5 h-5 text-warm-400" /> {activeTrip.members?.length || 1} travelers</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 shrink-0">
            <AvatarGroup size="lg" max={5}>
              {(activeTrip.members || []).filter(m => m.status !== 'invited').map(m => (
                <Avatar key={m.userId} name={m.name} src={m.avatarUrl} size="lg" className="border-2 border-warm-950" />
              ))}
            </AvatarGroup>
          </div>
        </div>
      </div>

      {isInvited && (
        <div className="sticky top-0 z-50 bg-warm-900 text-white px-6 py-4 shadow-xl border-b border-white/10">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
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
                className="flex-1 sm:flex-none bg-transparent border-white/20 text-white hover:bg-white/10 rounded-full"
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
                className="flex-1 sm:flex-none bg-accent-500 hover:bg-accent-600 text-white border-none shadow-md rounded-full px-6"
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
      
      <main className={cn("flex-1 max-w-6xl w-full mx-auto px-6 md:px-8 space-y-20 py-12 relative z-10", isInvited && "opacity-60 pointer-events-none")}>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* LEFT COLUMN: Main Journey & Activity (2/3 width) */}
          <div className="lg:col-span-8 space-y-20">
            
            {/* Elegant Journey Progress */}
            <section className="animate-fade-in">
              <h3 className="text-sm font-bold tracking-[0.2em] text-warm-500 uppercase mb-8">The Journey</h3>
              <div className="flex flex-col sm:flex-row gap-4 sm:items-stretch">
                {/* Destination */}
                <div className={cn("flex-1 bg-white/5 backdrop-blur-md rounded-3xl p-6 border transition-colors", hasDestination ? "border-accent-500/50 bg-accent-500/5 shadow-[0_0_30px_rgba(var(--accent-500),0.05)]" : "border-white/10")}>
                  <div className="flex items-start justify-between mb-8">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-lg", hasDestination ? "bg-accent-500 text-white" : "bg-white/10 text-warm-400")}>
                      {hasDestination ? <Check className="w-5 h-5" /> : "1"}
                    </div>
                    {hasDestination && <Badge className="bg-accent-500/20 text-accent-300 border-none">Set</Badge>}
                  </div>
                  <h4 className="text-white font-bold text-xl mb-1">Destination</h4>
                  <p className="text-warm-400 text-sm">Where are we going?</p>
                </div>
                
                {/* Dates */}
                <div className={cn("flex-1 bg-white/5 backdrop-blur-md rounded-3xl p-6 border transition-colors", !activeTrip.flexibleDates ? "border-accent-500/50 bg-accent-500/5 shadow-[0_0_30px_rgba(var(--accent-500),0.05)]" : "border-white/10")}>
                  <div className="flex items-start justify-between mb-8">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-lg", !activeTrip.flexibleDates ? "bg-accent-500 text-white" : "bg-white/10 text-warm-400")}>
                      {!activeTrip.flexibleDates ? <Check className="w-5 h-5" /> : "2"}
                    </div>
                    {!activeTrip.flexibleDates && <Badge className="bg-accent-500/20 text-accent-300 border-none">Locked</Badge>}
                  </div>
                  <h4 className="text-white font-bold text-xl mb-1">Dates</h4>
                  <p className="text-warm-400 text-sm">When are we going?</p>
                </div>
                
                {/* Itinerary */}
                <div className={cn("flex-1 bg-white/5 backdrop-blur-md rounded-3xl p-6 border transition-colors", itineraryProgress > 0 ? "border-accent-500/50 bg-accent-500/5 shadow-[0_0_30px_rgba(var(--accent-500),0.05)]" : "border-white/10")}>
                  <div className="flex items-start justify-between mb-8">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold", itineraryProgress === 100 ? "bg-accent-500 text-white" : itineraryProgress > 0 ? "bg-accent-500/20 text-accent-400 border border-accent-500/30" : "bg-white/10 text-warm-400")}>
                      {itineraryProgress === 100 ? <Check className="w-5 h-5" /> : `${itineraryProgress}%`}
                    </div>
                    {itineraryProgress === 100 && <Badge className="bg-accent-500/20 text-accent-300 border-none">Complete</Badge>}
                  </div>
                  <h4 className="text-white font-bold text-xl mb-1">Itinerary</h4>
                  <p className="text-warm-400 text-sm">What are we doing?</p>
                </div>
              </div>
            </section>

            {/* Activity Story */}
            {!isInvited && (
              <section className="animate-fade-in" style={{ animationDelay: '100ms' }}>
                <h3 className="text-sm font-bold tracking-[0.2em] text-warm-500 uppercase mb-8">What's Happening</h3>
                <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 sm:p-10">
                  <TripActivityFeed />
                </div>
              </section>
            )}
            
          </div>
          
          {/* RIGHT COLUMN: Sidebar (Up Next & Actions) (1/3 width) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Priority Action Card (Glassmorphic) */}
            <div className="bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/20 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity group-hover:opacity-100 opacity-50" />
              
              <h3 className="text-[10px] font-bold tracking-widest text-accent-400 uppercase mb-6 relative z-10">Priority Action</h3>
              
              <div className="relative z-10">
                {needsPreferences ? (
                  <>
                    <h4 className="text-3xl font-bold text-white mb-3 tracking-tight">Tell us your vibe.</h4>
                    <p className="text-warm-300 mb-8 leading-relaxed">Help the AI find the perfect destination by submitting your preferences.</p>
                    <Button size="lg" className="w-full rounded-2xl bg-white text-warm-950 hover:bg-warm-100 font-bold h-14" onClick={() => navigate(`/trips/${id}/preferences`)}>
                      Start Survey <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </>
                ) : !hasDestination ? (
                  <>
                    <h4 className="text-3xl font-bold text-white mb-3 tracking-tight">Where to?</h4>
                    <p className="text-warm-300 mb-8 leading-relaxed">Start exploring destinations that match everyone's vibe.</p>
                    <Button size="lg" className="w-full rounded-2xl bg-white text-warm-950 hover:bg-warm-100 font-bold h-14" onClick={() => navigate(`/trips/${id}/discover`)}>
                      Discover Places <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </>
                ) : nextDecision ? (
                  <>
                    <h4 className="text-3xl font-bold text-white mb-3 tracking-tight">{nextDecision.title}</h4>
                    <p className="text-warm-300 mb-8 leading-relaxed">The group is waiting on your input.</p>
                    <Button size="lg" className="w-full rounded-2xl bg-energy-500 hover:bg-energy-600 border-none text-white shadow-sm font-bold h-14" onClick={() => navigate(`/trips/${id}/decisions`)}>
                      Decide Now <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </>
                ) : itineraryProgress < 100 ? (
                  <>
                    <h4 className="text-3xl font-bold text-white mb-3 tracking-tight">Shape the trip.</h4>
                    <p className="text-warm-300 mb-8 leading-relaxed">You have {totalDays - plannedDays} days left to plan.</p>
                    <Button size="lg" className="w-full rounded-2xl bg-accent-500 hover:bg-accent-600 border-none text-white shadow-sm font-bold h-14" onClick={() => navigate(`/trips/${id}/plan`)}>
                      Build Itinerary <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </>
                ) : (
                  <>
                    <h4 className="text-3xl font-bold text-white mb-3 tracking-tight">You're ready ✈️</h4>
                    <p className="text-warm-300 mb-8 leading-relaxed">The plan is set. Just waiting for the adventure to begin.</p>
                    <Button size="lg" variant="secondary" className="w-full rounded-2xl h-14 bg-white/10 hover:bg-white/20 border-0 text-white" onClick={() => navigate(`/trips/${id}/plan`)}>
                      Review Itinerary <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            {/* Quick Utilities */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-6 space-y-3">
              <h3 className="text-[10px] font-bold tracking-widest text-warm-500 uppercase mb-4 pl-2">Settings</h3>
              
              <button onClick={() => setIsInviteModalOpen(true)} className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white/5 text-white transition-colors group">
                <div className="flex items-center gap-3 font-medium">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-warm-300 group-hover:bg-white/20 transition-colors"><Users className="w-4 h-4" /></div>
                  Invite Friends
                </div>
                <ArrowRight className="w-4 h-4 text-warm-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </button>
              
              {isAdmin && (
                <button onClick={() => setIsEditDateOpen(true)} className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white/5 text-white transition-colors group">
                  <div className="flex items-center gap-3 font-medium">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-warm-300 group-hover:bg-white/20 transition-colors"><Calendar className="w-4 h-4" /></div>
                    Edit Details
                  </div>
                  <ArrowRight className="w-4 h-4 text-warm-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </button>
              )}
              
              <button onClick={() => setShowLeaveConfirm(true)} className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-error-500/10 text-error-400 transition-colors group mt-2">
                <div className="flex items-center gap-3 font-medium">
                  <div className="w-8 h-8 rounded-full bg-error-500/10 flex items-center justify-center text-error-400 group-hover:bg-error-500/20 transition-colors"><LogOut className="w-4 h-4" /></div>
                  Leave Trip
                </div>
              </button>
            </div>
            
          </div>
        </div>
        
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
    </PageTransition>
  );
};
