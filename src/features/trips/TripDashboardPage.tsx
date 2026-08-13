import React from 'react';
import { cn } from '@/lib/utils/cn';
import { useNavigate, useParams, Link } from 'react-router';
import { TripProgress } from '@/components/trip/TripProgress';
import { NextDecision } from '@/components/trip/NextDecision';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const TripDashboardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Mock Trip Data
  const hasDestination = true;
  
  const mockDecision = {
    id: 'd-accom',
    title: 'Where should we stay?',
    type: 'accommodation' as const,
    status: 'voting' as const,
    options: []
  };

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col">
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-8 animate-fade-in">
        
        {/* Hero Section */}
        <section className="gradient-warm rounded-2xl p-6 md:p-8 border border-warm-200/40 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <Badge variant="accent" className="mb-4">September Escape</Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-warm-900 tracking-tight mb-2">
              {hasDestination ? 'Bali, Indonesia' : 'Still discovering...'}
            </h1>
            <p className="text-warm-500 font-medium">Sep 15 - 19, 2026 • 4 Members</p>
            
            <div className="mt-8 max-w-2xl">
              <TripProgress 
                trip={{
                  checkpoints: [
                    { id: '1', label: 'Destination', completed: true },
                    { id: '2', label: 'Dates', completed: true },
                    { id: '3', label: 'Accommodation', completed: false },
                    { id: '4', label: 'Itinerary', completed: false },
                  ]
                }} 
              />
            </div>
          </div>
        </section>

        {/* Action Priority */}
        <section>
          <NextDecision 
            title={mockDecision.title}
            description="Locking this in helps finalize the budget and map out the daily itinerary."
            actionLabel="Decide Now"
            onAction={() => navigate(`/trips/${id}/decisions`)}
            type={mockDecision.type}
          />
        </section>

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

        {/* Recent Activity */}
        <section>
          <h2 className="text-sm font-semibold text-warm-500 uppercase tracking-wider mb-4">Recent Updates</h2>
          <Card className="bg-white border-warm-200/40 shadow-sm overflow-hidden p-0">
             <div className="divide-y divide-warm-100">
               {[
                 { user: 'Andi', action: 'voted for', target: 'Villa in Seminyak', time: '2 hours ago' },
                 { user: 'Rizky', action: 'suggested', target: 'Snorkeling trip', time: '5 hours ago' },
                 { user: 'Bhara', action: 'marked as decided:', target: 'Dates (Sep 15 - 19)', time: '1 day ago' },
               ].map((act, i) => (
                 <div key={i} className="p-4 flex items-center gap-4 hover:bg-warm-50 transition-colors">
                   <div className="w-8 h-8 rounded-full bg-warm-200 flex items-center justify-center text-xs font-medium shrink-0">
                     {act.user.charAt(0)}
                   </div>
                   <p className="text-sm text-warm-600 flex-1">
                     <span className="font-medium text-warm-900">{act.user}</span> {act.action} <span className="font-medium text-warm-900">{act.target}</span>
                   </p>
                   <span className="text-xs text-warm-400 whitespace-nowrap">{act.time}</span>
                 </div>
               ))}
             </div>
          </Card>
        </section>

      </main>
    </div>
  );
};
