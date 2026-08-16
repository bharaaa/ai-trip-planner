import OpenAI from 'openai';
import type { AIProvider } from './types';
import type { TripContext, TripIdea, TripReaction, Destination, Itinerary, ItineraryInsight } from '@/types';

// Read configuration from Vite environment variables
const apiKey = import.meta.env.VITE_MAIA_ROUTER_API_KEY;
const baseURL = import.meta.env.VITE_MAIA_ROUTER_BASE_URL;
const model = import.meta.env.VITE_MAIA_ROUTER_MODEL || 'moonshot/kimi-k2.6';

const openai = new OpenAI({
  apiKey: apiKey || 'dummy-key',
  baseURL: baseURL || 'https://api.maiarouter.com/v1',
  dangerouslyAllowBrowser: true, // We are calling from client-side for this prototype
});

export class MaiaProvider implements AIProvider {
  
  private buildSystemPrompt(context: TripContext): string {
    const preferencesList = context.preferences 
      ? Object.entries(context.preferences)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([cat, val]) => `${cat} (${val}%)`)
          .join(', ')
      : 'No preferences recorded';

    return `You are an expert travel agent AI. You must return a JSON object with exactly this schema:
{
  "ideas": [
    {
      "id": "unique-string-id",
      "destination": "City Name",
      "country": "Country Name",
      "countryCode": "ISO code (e.g., ID)",
      "title": "A catchy title for the trip",
      "summary": "2-3 sentences describing why this fits the group",
      "fitScore": number between 1 and 100,
      "estimatedBudget": { "min": number, "max": number },
      "bestTimeToVisit": "Months/Seasons",
      "travelStyle": "e.g., Relaxing, Adventurous",
      "keyActivities": ["Activity 1", "Activity 2", "Activity 3"],
      "confidence": number between 0 and 1,
      "imageUrl": "https://source.unsplash.com/800x600/?destination,city"
    }
  ]
}

Return EXACTLY 3 distinct destination ideas that fit the following trip context:
- Starting Location (Origin): ${context.origin}
- Travelers: ${context.travelers}
- Duration: ${context.duration} days
- Budget Per Person: ${context.budgetPerPerson}
- Group Preferences (Top 3): ${preferencesList}
- Travel Constraints & Preferred Transport: ${context.constraints || 'None specified'}

Ensure the response is valid JSON. Do not include markdown formatting like \`\`\`json around the response.`;
  }

  async generateTripIdeas(context: TripContext): Promise<TripIdea[]> {
    if (!apiKey) {
      console.warn('VITE_MAIA_ROUTER_API_KEY is not set. Please set it in .env.local');
      throw new Error('AI API Key is missing.');
    }

    try {
      const completion = await openai.chat.completions.create({
        model: model,
        messages: [
          { role: 'system', content: this.buildSystemPrompt(context) },
          { role: 'user', content: 'Please generate 3 trip ideas for our group based on our context.' }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const content = completion.choices[0].message.content;
      if (!content) throw new Error('No content returned from AI');

      const data = JSON.parse(content);
      return data.ideas as TripIdea[];
    } catch (error) {
      console.error('Failed to generate trip ideas:', error);
      throw error;
    }
  }

  async refineTripIdeas(context: TripContext, reactions: TripReaction[]): Promise<TripIdea[]> {
    const reactionSummary = reactions.map(r => `Idea ${r.tripIdeaId}: ${r.reaction} - ${r.reason || 'No reason'}`).join('\n');
    
    try {
      const completion = await openai.chat.completions.create({
        model: model,
        messages: [
          { role: 'system', content: this.buildSystemPrompt(context) },
          { role: 'user', content: `We received feedback on previous ideas:\n${reactionSummary}\n\nPlease generate 3 NEW or REFINED trip ideas that take this feedback into account. If they hated something, avoid it. If they loved something, find similar destinations.` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const content = completion.choices[0].message.content;
      if (!content) throw new Error('No content returned from AI');

      const data = JSON.parse(content);
      return data.ideas as TripIdea[];
    } catch (error) {
      console.error('Failed to refine trip ideas:', error);
      throw error;
    }
  }

  // Stubs for now
  async generateItinerary(destination: Destination, context: TripContext): Promise<Itinerary> {
    throw new Error('generateItinerary not yet implemented for Maia Provider');
  }

  async analyzeItinerary(itinerary: Itinerary, context: TripContext): Promise<ItineraryInsight[]> {
    throw new Error('analyzeItinerary not yet implemented for Maia Provider');
  }
}
