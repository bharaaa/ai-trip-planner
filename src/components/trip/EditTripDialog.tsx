import React, { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { useTripStore } from '@/stores/tripStore';

interface EditTripDialogProps {
  open: boolean;
  onClose: () => void;
  tripId: string;
}

export function EditTripDialog({ open, onClose, tripId }: EditTripDialogProps) {
  const activeTrip = useTripStore(state => state.activeTrip);
  const updateTripDetails = useTripStore(state => state.updateTripDetails);

  // We only care about origin, travelers, duration, budgetPerPerson
  const [origin, setOrigin] = useState(activeTrip?.origin || '');
  const [travelers, setTravelers] = useState(activeTrip?.travelers?.toString() || '1');
  const [duration, setDuration] = useState(activeTrip?.duration?.toString() || '1');
  const [budgetPerPerson, setBudgetPerPerson] = useState(activeTrip?.budgetPerPerson?.toString() || '0');
  const [isSaving, setIsSaving] = useState(false);

  // Reset state when opening/closing just in case it changed externally
  React.useEffect(() => {
    if (open && activeTrip) {
      setOrigin(activeTrip.origin || '');
      setTravelers(activeTrip.travelers?.toString() || '1');
      setDuration(activeTrip.duration?.toString() || '1');
      setBudgetPerPerson(activeTrip.budgetPerPerson?.toString() || '0');
    }
  }, [open, activeTrip]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateTripDetails(tripId, {
        origin,
        travelers: parseInt(travelers, 10) || 1,
        duration: parseInt(duration, 10) || 1,
        budgetPerPerson: parseInt(budgetPerPerson, 10) || 0,
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save trip details.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="sm:max-w-md w-[calc(100%-2rem)] p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-warm-900 tracking-tight">Edit Trip Details</h2>
          <p className="text-sm text-warm-500 mt-1">Adjust your budget and preferences to get better suggestions.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-warm-700">Starting Location</label>
            <input 
              type="text" 
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="E.g., Jakarta"
              className="w-full px-4 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-warm-700">Travelers</label>
              <input 
                type="number" 
                min="1"
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
                className="w-full px-4 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-warm-700">Duration (days)</label>
              <input 
                type="number" 
                min="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-warm-700">Budget Per Person (IDR)</label>
            <input 
              type="number" 
              step="100000"
              value={budgetPerPerson}
              onChange={(e) => setBudgetPerPerson(e.target.value)}
              className="w-full px-4 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
