import type { AIProvider } from './types';
import type { TripContext, TripIdea, TripReaction, Destination, Itinerary, ItineraryInsight, ItineraryDay, ActivityType } from '@/types';

const MOCK_IDEAS: TripIdea[] = [
  {
    id: 'idea_yogya',
    destination: 'Yogyakarta',
    country: 'Indonesia',
    countryCode: 'ID',
    title: 'Cultural Heritage & Culinary Journey',
    summary: 'A deep dive into Javanese culture, historical temples, and an amazing street food scene.',
    estimatedBudget: { min: 2500000, max: 3500000, currency: 'IDR' },
    fitScore: 0.91,
    reasons: ['Great mix of culture and affordable food', 'Relaxed pace suitable for the group'],
    highlights: ['Sunrise at Borobudur', 'Prambanan Temple', 'Authentic Gudeg', 'Malioboro street life'],
    tradeoffs: ['No beaches nearby', 'Can be warm during the day'],
    suggestedDuration: 4,
    travelStyle: 'Culture & Food',
    keyActivities: ['Temple Hopping', 'Culinary Tours', 'Batik Making'],
    confidence: 0.9,
    imageUrl: '/images/destinations/yogyakarta.jpg',
  },
  {
    id: 'idea_bali',
    destination: 'Bali',
    country: 'Indonesia',
    countryCode: 'ID',
    title: 'Tropical Paradise Escape',
    summary: 'The ultimate blend of beautiful beaches, rich culture, and lush nature in the Island of the Gods.',
    estimatedBudget: { min: 3500000, max: 4800000, currency: 'IDR' },
    fitScore: 0.87,
    reasons: ['World-class beaches', 'Great infrastructure for tourists'],
    highlights: ['Ubud rice terraces', 'Kuta Beach sunsets', 'Uluwatu Temple', 'Fresh seafood in Jimbaran'],
    tradeoffs: ['Can be very touristy and crowded', 'Higher budget required'],
    suggestedDuration: 5,
    travelStyle: 'Beach & Nature',
    keyActivities: ['Surfing', 'Yoga', 'Beach Clubs'],
    confidence: 0.85,
    imageUrl: '/images/destinations/bali.jpg',
  },
  {
    id: 'idea_malang',
    destination: 'Malang',
    country: 'Indonesia',
    countryCode: 'ID',
    title: 'Cool Breezes & Mountain Views',
    summary: 'A refreshing mountain city with colonial architecture, apple orchards, and a vibrant café culture.',
    estimatedBudget: { min: 2000000, max: 3000000, currency: 'IDR' },
    fitScore: 0.78,
    reasons: ['Pleasant cool climate', 'Great access to nature and Mount Bromo'],
    highlights: ['Mount Bromo sunrise', 'Apple picking in Batu', 'Colorful Jodipan Village', 'Thriving café scene'],
    tradeoffs: ['Less nightlife options', 'Requires early mornings for mountain trips'],
    suggestedDuration: 3,
    travelStyle: 'Nature & Adventure',
    keyActivities: ['Volcano Trekking', 'Café Hopping', 'Museums'],
    confidence: 0.8,
    imageUrl: '/images/destinations/malang.jpg',
  },
  {
    id: 'idea_lombok',
    destination: 'Lombok',
    country: 'Indonesia',
    countryCode: 'ID',
    title: 'Pristine Beaches & Epic Hikes',
    summary: 'A tranquil alternative to Bali with stunning unspoiled beaches and the majestic Mount Rinjani.',
    estimatedBudget: { min: 3000000, max: 4500000, currency: 'IDR' },
    fitScore: 0.82,
    reasons: ['Less crowded than Bali', 'Incredible natural landscapes'],
    highlights: ['Gili Islands', 'Pink Beach', 'Mount Rinjani', 'Sasak traditional villages'],
    tradeoffs: ['Less developed infrastructure', 'Nightlife is limited mostly to the Gilis'],
    suggestedDuration: 5,
    travelStyle: 'Beach & Adventure',
    keyActivities: ['Snorkeling', 'Hiking', 'Relaxing'],
    confidence: 0.85,
    imageUrl: '/images/destinations/lombok.jpg',
  },
  {
    id: 'idea_bandung',
    destination: 'Bandung',
    country: 'Indonesia',
    countryCode: 'ID',
    title: 'Culinary Delights & Shopping',
    summary: 'The Paris of Java offers a cool climate, amazing street food, unique cafes, and excellent shopping.',
    estimatedBudget: { min: 1800000, max: 2800000, currency: 'IDR' },
    fitScore: 0.74,
    reasons: ['Very affordable', 'Great for foodies and shoppers'],
    highlights: ['Kawah Putih (White Crater)', 'Factory outlets', 'Braga Street', 'Tea plantations in Lembang'],
    tradeoffs: ['Traffic congestion on weekends', 'No beaches'],
    suggestedDuration: 3,
    travelStyle: 'Food & Shopping',
    keyActivities: ['Shopping', 'Culinary Tours', 'Nature Walks'],
    confidence: 0.75,
    imageUrl: '/images/destinations/bandung.jpg',
  }
];

export class MockAIProvider implements AIProvider {
  private async delay(ms: number = 1500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async generateTripIdeas(context: TripContext): Promise<TripIdea[]> {
    await this.delay();
    // Return top 3 ideas
    return MOCK_IDEAS.slice(0, 3);
  }

  async refineTripIdeas(context: TripContext, reactions: TripReaction[]): Promise<TripIdea[]> {
    await this.delay();
    const activeIdeas = [...MOCK_IDEAS];
    
    // Filter out ideas with 'nope'
    const nopedIdeaIds = reactions.filter(r => r.reaction === 'nope').map(r => r.tripIdeaId);
    
    // We want to return a mixed list based on reactions, but for mock purposes:
    // Just return ideas that aren't noped, prioritizing loved ones
    const refinedIdeas = activeIdeas
      .filter(idea => !nopedIdeaIds.includes(idea.id))
      .sort((a, b) => {
        const aLove = reactions.some(r => r.tripIdeaId === a.id && r.reaction === 'love');
        const bLove = reactions.some(r => r.tripIdeaId === b.id && r.reaction === 'love');
        if (aLove && !bLove) return -1;
        if (!aLove && bLove) return 1;
        return b.fitScore - a.fitScore;
      });

    return refinedIdeas.slice(0, 3); // always return top 3 suitable ideas
  }

  async generateItinerary(destination: Destination, context: TripContext): Promise<Itinerary> {
    await this.delay(2000); // Takes slightly longer to generate an itinerary
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 30); // 30 days from now
    
    const days: ItineraryDay[] = [
      {
        dayNumber: 1,
        date: startDate,
        title: 'Arrival & Sunset',
        items: [
          {
            id: 'item_1',
            time: '14:00',
            title: 'Check-in to Hotel',
            type: 'accommodation',
            location: 'Seminyak, Bali',
            duration: 60,
            isAIGenerated: true,
            isMustDo: false,
          },
          {
            id: 'item_2',
            time: '17:00',
            title: 'Sunset at La Plancha',
            description: 'Enjoy colorful bean bags and a spectacular sunset with drinks.',
            type: 'beach',
            location: 'Double Six Beach',
            duration: 120,
            isAIGenerated: true,
            isMustDo: true,
          },
          {
            id: 'item_3',
            time: '19:30',
            title: 'Welcome Dinner',
            description: 'Authentic Balinese cuisine at a local favorite.',
            type: 'food',
            location: "Made's Warung",
            duration: 90,
            isAIGenerated: true,
            isMustDo: false,
          }
        ]
      },
      {
        dayNumber: 2,
        date: new Date(startDate.getTime() + 86400000),
        title: 'Culture & Rice Terraces',
        items: [
          {
            id: 'item_4',
            time: '09:00',
            title: 'Tegalalang Rice Terrace',
            description: 'Morning walk through the iconic rice terraces before it gets too hot.',
            type: 'nature',
            location: 'Ubud',
            duration: 120,
            isAIGenerated: true,
            isMustDo: true,
          },
          {
            id: 'item_5',
            time: '12:00',
            title: 'Lunch with a View',
            type: 'food',
            location: 'Ubud Center',
            duration: 90,
            isAIGenerated: true,
            isMustDo: false,
          },
          {
            id: 'item_6',
            time: '14:00',
            title: 'Sacred Monkey Forest Sanctuary',
            description: 'Explore the forest and ancient temples while observing the macaques.',
            type: 'culture',
            location: 'Ubud',
            duration: 120,
            isAIGenerated: true,
            isMustDo: true,
          }
        ]
      },
      {
        dayNumber: 3,
        date: new Date(startDate.getTime() + 86400000 * 2),
        title: 'Island Hopping & Snorkeling',
        items: [
          {
            id: 'item_7',
            time: '08:00',
            title: 'Boat to Nusa Penida',
            type: 'transport',
            location: 'Sanur Harbor',
            duration: 60,
            isAIGenerated: true,
            isMustDo: true,
          },
          {
            id: 'item_8',
            time: '10:00',
            title: 'Kelingking Beach Viewpoint',
            description: 'Iconic T-Rex shaped cliff. Steep hike down optional.',
            type: 'nature',
            location: 'Nusa Penida',
            duration: 90,
            isAIGenerated: true,
            isMustDo: true,
          },
          {
            id: 'item_9',
            time: '13:00',
            title: 'Snorkeling at Crystal Bay',
            type: 'adventure',
            location: 'Nusa Penida',
            duration: 120,
            isAIGenerated: true,
            isMustDo: true,
          }
        ]
      },
      {
        dayNumber: 4,
        date: new Date(startDate.getTime() + 86400000 * 3),
        title: 'Relaxation & Departure',
        items: [
          {
            id: 'item_10',
            time: '10:00',
            title: 'Morning Spa Session',
            description: 'Traditional Balinese massage to relax before the flight.',
            type: 'custom',
            location: 'Seminyak',
            duration: 120,
            isAIGenerated: true,
            isMustDo: false,
          },
          {
            id: 'item_11',
            time: '13:00',
            title: 'Last Minute Souvenir Shopping',
            type: 'shopping',
            location: 'Seminyak Square',
            duration: 90,
            isAIGenerated: true,
            isMustDo: false,
          },
          {
            id: 'item_12',
            time: '16:00',
            title: 'Head to Airport',
            type: 'departure',
            location: 'Ngurah Rai International Airport',
            duration: 60,
            isAIGenerated: true,
            isMustDo: true,
          }
        ]
      }
    ];

    return {
      days,
      generatedAt: new Date(),
      isAIDraft: true,
    };
  }

  async analyzeItinerary(itinerary: Itinerary, context: TripContext): Promise<ItineraryInsight[]> {
    await this.delay(1000);
    return [
      {
        id: 'insight_1',
        type: 'warning',
        message: 'Day 3 has a very packed schedule. The travel time between Kelingking Beach and Crystal Bay might take longer than expected.',
        severity: 'medium',
        relatedItemIds: ['item_8', 'item_9'],
        suggestion: 'Consider adding an extra 30 minutes of buffer time for travel.',
      },
      {
        id: 'insight_2',
        type: 'suggestion',
        message: 'You have no dinner plans listed for Day 2 in Ubud.',
        severity: 'low',
        suggestion: 'Add a dinner reservation at Locavore or a local warung.',
      },
      {
        id: 'insight_3',
        type: 'info',
        message: 'Great balance of activities! You\'ve covered culture, nature, and relaxation.',
        severity: 'low',
      }
    ];
  }
}
