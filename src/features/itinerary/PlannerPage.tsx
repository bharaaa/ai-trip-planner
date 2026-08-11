import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import { useTripStore } from '@/stores/tripStore';
import { useNavigate, useParams } from 'react-router';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';
import { TripHeader } from '@/components/trip/TripHeader';
import { TripProgress } from '@/components/trip/TripProgress';
import { NextDecision } from '@/components/trip/NextDecision';
import { MemberAvatars } from '@/components/trip/MemberAvatars';
import { ItineraryEditor } from '@/components/itinerary/ItineraryEditor';
import { MapPanel } from '@/components/map/MapPanel';
import { AILoadingState } from '@/components/ai/AILoadingState';
import { AIItineraryInsight } from '@/components/ai/AIItineraryInsight';
import { AIInsightCard } from '@/components/ai/AIInsightCard';
import { aiService } from '@/services/ai';
import type { ItineraryDay, ItineraryItem, ActivityType, Decision, DecisionStatus, DecisionType, Itinerary } from '@/types';

// Mock generation for demonstration
const mockGenerate = async (): Promise<Itinerary> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        generatedAt: new Date(),
        isAIDraft: true,
        days: [
          {
            dayNumber: 1,
            date: new Date('2026-09-15'),
            title: 'Arrival & Seminyak Sunsets',
            items: [
              { id: 'item-1', isAIGenerated: false, isMustDo: false, type: 'transport', title: 'Airport Transfer', time: '14:00', location: 'Ngurah Rai Airport' },
              { id: 'item-2', isAIGenerated: false, isMustDo: false, type: 'accommodation', title: 'Check-in to Villa', time: '15:30', location: 'Seminyak' },
              { id: 'item-3', isAIGenerated: false, type: 'food', title: 'Sunset Dinner at La Plancha', time: '17:30', location: 'La Plancha', isMustDo: true },
            ]
          }
        ]
      });
    }, 2500);
  });
};

export const PlannerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'itinerary' | 'map'>('itinerary');
  const [isGenerating, setIsGenerating] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    // In a real app we would use aiService.generateItinerary
    const generated = await mockGenerate();
    setItinerary(generated);
    setIsGenerating(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <TripHeader tripName="Itinerary Planner" members={[]} phase="planning" />
      
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        
        {/* Top Section */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Bali Escape</h1>
              <p className="text-slate-500 mt-1">Sep 15 - Sep 19 • 4 Days</p>
            </div>
            {!itinerary && !isGenerating && (
              <Button onClick={handleGenerate} className="bg-accent-terracotta hover:bg-accent-terracotta/90 text-white shadow-sm">
                Generate Draft Itinerary
              </Button>
            )}
          </div>
          
          {itinerary && (
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-start gap-4">
              <div className="flex-1">
                <NextDecision 
                  title="Choose accommodation"
                  description="This will help optimize your activities and routes."
                  actionLabel="Decide Now"
                  onAction={() => {}}
                  type="accommodation"
                />
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        {isGenerating ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <AILoadingState message="Building your personalized itinerary..." />
          </div>
        ) : !itinerary ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-slate-900 mb-2">No itinerary yet</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              Your destination is set. Let our AI craft a personalized day-by-day plan based on your group's preferences.
            </p>
            <Button size="lg" onClick={handleGenerate} className="bg-slate-900 text-white hover:bg-slate-800">
              Generate Itinerary
            </Button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-200px)]">
            
            {/* Mobile Tabs */}
            <div className="lg:hidden w-full">
              <Tabs 
                tabs={[
                  { id: 'itinerary', label: 'Itinerary' },
                  { id: 'map', label: 'Map' }
                ]}
                activeTab={activeTab} 
                onTabChange={(v) => setActiveTab(v as any)} 
                className="w-full" 
              />
            </div>

            {/* Itinerary Panel */}
            <div className={cn(
              "flex-1 overflow-y-auto pr-2 rounded-xl",
              activeTab !== 'itinerary' && "hidden lg:block",
              "lg:w-[55%] flex-shrink-0"
            )}>
              <div className="mb-6">
                 <AIInsightCard 
                  message="AI-Generated Draft: This is an AI-generated draft based on your group's preferences. Feel free to edit, rearrange, or remove activities."
                  type="info"
                 />
              </div>

              <div className="mb-6">
                 <AIItineraryInsight 
                  insight={{
                    id: 'ins-1',
                    message: 'Optimized Routing: We grouped your day 1 activities around Seminyak to minimize travel time after your flight.',
                    severity: 'medium',
                    type: 'info'
                  }}
                 />
              </div>
              
              <ItineraryEditor itinerary={itinerary} />
            </div>

            {/* Map Panel */}
            <div className={cn(
              "flex-1 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative",
              activeTab !== 'map' && "hidden lg:block",
              "lg:w-[45%] lg:sticky lg:top-6 lg:h-full min-h-[400px]"
            )}>
               <MapPanel 
                destination="Bali, Indonesia" 
                activities={itinerary.days.flatMap(d => d.items)} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
