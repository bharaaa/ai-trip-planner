import React from 'react';
import { cn } from '@/lib/utils/cn';
import { useNavigate, useParams, Link } from 'react-router';
import { TripHeader } from '@/components/trip/TripHeader';
import { TripProgress } from '@/components/trip/TripProgress';
import { NextDecision } from '@/components/trip/NextDecision';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const TripDashboardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Mock Trip Data
  const hasDestination = true;
  const progressPercent = 60;
  
  const mockDecision = {
    id: 'd-accom',
    title: 'Where should we stay?',
    type: 'accommodation' as const,
    status: 'voting' as const,
    options: []
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TripHeader tripName="Trip Overview" members={[]} phase="planning" />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-8">
        
        {/* Hero Section */}
        <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-terracotta/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 mb-4 inline-flex shadow-none border-none">September Escape</Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-2">
              {hasDestination ? 'Bali, Indonesia' : 'Still discovering...'}
            </h1>
            <p className="text-slate-500 font-medium">Sep 15 - 19, 2026 • 4 Members</p>
            
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
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Priority Action</h2>
          <NextDecision 
            title={mockDecision.title}
            description="Locking this in helps finalize the budget and map out the daily itinerary."
            actionLabel="Decide Now"
            onAction={() => {}}
            type={mockDecision.type}
          />
        </section>

        {/* Quick Links Grid */}
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Workspaces</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <Link to={`/trips/${id}/discover`} className="block group">
              <Card className="h-full bg-white border-slate-200 hover:border-accent-terracotta/50 hover:shadow-md transition-all p-5">
                <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  💡
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Discover</h3>
                <p className="text-sm text-slate-500">Explore ideas and align group preferences.</p>
              </Card>
            </Link>

            <Link to={`/trips/${id}/decisions`} className="block group">
              <Card className="h-full bg-white border-slate-200 hover:border-accent-terracotta/50 hover:shadow-md transition-all p-5">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  ✓
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Decisions</h3>
                <p className="text-sm text-slate-500">Vote on options and finalize details.</p>
              </Card>
            </Link>

            <Link to={`/trips/${id}/planner`} className="block group">
              <Card className="h-full bg-white border-slate-200 hover:border-accent-terracotta/50 hover:shadow-md transition-all p-5">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  🗺️
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Itinerary</h3>
                <p className="text-sm text-slate-500">Plan day-by-day activities and routes.</p>
              </Card>
            </Link>

          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Recent Updates</h2>
          <Card className="bg-white border-slate-200 shadow-sm overflow-hidden p-0">
             <div className="divide-y divide-slate-100">
               {[
                 { user: 'Andi', action: 'voted for', target: 'Villa in Seminyak', time: '2 hours ago' },
                 { user: 'Rizky', action: 'suggested', target: 'Snorkeling trip', time: '5 hours ago' },
                 { user: 'Bhara', action: 'marked as decided:', target: 'Dates (Sep 15 - 19)', time: '1 day ago' },
               ].map((act, i) => (
                 <div key={i} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                   <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium shrink-0">
                     {act.user.charAt(0)}
                   </div>
                   <p className="text-sm text-slate-600 flex-1">
                     <span className="font-medium text-slate-900">{act.user}</span> {act.action} <span className="font-medium text-slate-900">{act.target}</span>
                   </p>
                   <span className="text-xs text-slate-400 whitespace-nowrap">{act.time}</span>
                 </div>
               ))}
             </div>
          </Card>
        </section>

      </main>
    </div>
  );
};

// Ensure Badge is imported (was missing in imports)
import { Badge } from '@/components/ui/Badge';
