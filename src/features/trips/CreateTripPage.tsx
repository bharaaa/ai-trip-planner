import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/utils/cn';
import { useTripStore } from '@/stores/tripStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Slider } from '@/components/ui/Slider';
import { StepIndicator } from './components/StepIndicator';
import { formatCurrency } from '@/lib/utils/formatting';

export function CreateTripPage() {
  const navigate = useNavigate();
  const createTrip = useTripStore((state) => state.createTrip);
  const currentUser = useTripStore((state) => state.currentUser);
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    travelers: [currentUser.name],
    dateFlexibility: 'exact',
    duration: 5,
    budgetPerPerson: 5000000,
    budgetType: 'per_person',
    budgetFlexibility: 'comfortable',
    startingLocation: 'Jakarta',
    destinationType: 'domestic',
    transport: 'flight'
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const handleCreate = () => {
    const tripId = createTrip({
      name: formData.name,
      origin: formData.startingLocation,
      travelers: formData.travelers.length,
      flexibleDates: formData.dateFlexibility !== 'exact'
    });
    navigate(`/trips/${tripId}/preferences`);
  };

  const handleTravelerChange = (index: number, value: string) => {
    const newTravelers = [...formData.travelers];
    newTravelers[index] = value;
    setFormData({ ...formData, travelers: newTravelers });
  };

  const addTraveler = () => {
    setFormData({ ...formData, travelers: [...formData.travelers, ''] });
  };

  const removeTraveler = (index: number) => {
    if (formData.travelers.length <= 1) return;
    const newTravelers = formData.travelers.filter((_, i) => i !== index);
    setFormData({ ...formData, travelers: newTravelers });
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 min-h-[80vh] flex flex-col">
      <StepIndicator 
        currentStep={step} 
        totalSteps={5} 
        className="mb-12"
      />

      <div className="flex-1">
        {step === 1 && (
          <div className="animate-slide-up space-y-6">
            <h1 className="text-3xl font-semibold text-warm-900">Let's start planning</h1>
            <p className="text-warm-600">You don't need to know where yet. We'll figure it out together.</p>
            <div className="space-y-4">
              <Input
                label="Trip Name"
                placeholder="e.g. Summer Getaway"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                autoFocus
              />
              <Button 
                onClick={nextStep} 
                disabled={!formData.name.trim()}
                className="w-full mt-4"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-slide-up space-y-6">
            <h1 className="text-3xl font-semibold text-warm-900">Who's coming?</h1>
            <p className="text-warm-600">{formData.travelers.length} traveler{formData.travelers.length > 1 ? 's' : ''}</p>
            <div className="space-y-4">
              {formData.travelers.map((t, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input
                      label={i === 0 ? "You" : `Traveler ${i + 1}`}
                      value={t}
                      onChange={(e) => handleTravelerChange(i, e.target.value)}
                      placeholder="Name"
                      disabled={i === 0}
                    />
                  </div>
                  {i > 0 && (
                    <Button variant="secondary" onClick={() => removeTraveler(i)}>
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="secondary" onClick={addTraveler} className="w-full">
                + Add traveler
              </Button>
            </div>
            <div className="flex gap-4 mt-8">
              <Button variant="secondary" onClick={prevStep} className="flex-1">Back</Button>
              <Button onClick={nextStep} className="flex-1">Continue</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-slide-up space-y-6">
            <h1 className="text-3xl font-semibold text-warm-900">When are you thinking?</h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(['exact', 'month', 'flexible'] as const).map(type => (
                <Card 
                  key={type}
                  className={cn(
                    "p-4 cursor-pointer hover:border-accent-400 transition-colors",
                    formData.dateFlexibility === type ? "border-accent-400 bg-accent-50/50" : ""
                  )}
                  onClick={() => setFormData({ ...formData, dateFlexibility: type })}
                >
                  <p className="font-medium text-center">
                    {type === 'exact' && "I have exact dates"}
                    {type === 'month' && "Sometime in..."}
                    {type === 'flexible' && "I'm flexible"}
                  </p>
                </Card>
              ))}
            </div>

            <div className="space-y-4 pt-4">
              <Input
                type="number"
                label="How many days?"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
                min={1}
              />
            </div>

            <div className="flex gap-4 mt-8">
              <Button variant="secondary" onClick={prevStep} className="flex-1">Back</Button>
              <Button onClick={nextStep} className="flex-1">Continue</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-slide-up space-y-6">
            <h1 className="text-3xl font-semibold text-warm-900">What's the budget?</h1>
            
            <div className="flex bg-warm-100 p-1 rounded-lg">
              <button 
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                  formData.budgetType === 'per_person' ? "bg-white shadow-sm text-warm-900" : "text-warm-600 hover:text-warm-900"
                )}
                onClick={() => setFormData({ ...formData, budgetType: 'per_person' })}
              >
                Per person
              </button>
              <button 
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                  formData.budgetType === 'total' ? "bg-white shadow-sm text-warm-900" : "text-warm-600 hover:text-warm-900"
                )}
                onClick={() => setFormData({ ...formData, budgetType: 'total' })}
              >
                Total budget
              </button>
            </div>

            <div className="space-y-4">
              <Input
                type="number"
                label="Budget (IDR)"
                value={formData.budgetPerPerson}
                onChange={(e) => setFormData({ ...formData, budgetPerPerson: parseInt(e.target.value) || 0 })}
              />
              <p className="text-sm text-warm-500">
                {formatCurrency(formData.budgetPerPerson)}
              </p>
            </div>

            <div className="pt-4 space-y-4">
              <p className="text-sm font-medium text-warm-900">Trip Style</p>
              <div className="grid grid-cols-2 gap-4">
                {(['budget', 'comfortable', 'premium', 'dont_know'] as const).map(style => (
                  <Card 
                    key={style}
                    className={cn(
                      "p-3 cursor-pointer text-center text-sm transition-colors",
                      formData.budgetFlexibility === style ? "border-accent-400 bg-accent-50/50 text-accent-700" : ""
                    )}
                    onClick={() => setFormData({ ...formData, budgetFlexibility: style })}
                  >
                    {style === 'dont_know' ? "I don't know" : style.charAt(0).toUpperCase() + style.slice(1).replace('_', ' ')}
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <Button variant="secondary" onClick={prevStep} className="flex-1">Back</Button>
              <Button onClick={nextStep} className="flex-1">Continue</Button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="animate-slide-up space-y-6">
            <h1 className="text-3xl font-semibold text-warm-900">A few more details</h1>
            
            <div className="space-y-6">
              <Input
                label="Starting Location"
                value={formData.startingLocation}
                onChange={(e) => setFormData({ ...formData, startingLocation: e.target.value })}
              />

              <div className="space-y-3">
                <p className="text-sm font-medium text-warm-900">Destination Type</p>
                <div className="flex gap-4">
                  {(['domestic', 'international'] as const).map(type => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        checked={formData.destinationType === type}
                        onChange={() => setFormData({ ...formData, destinationType: type })}
                        className="text-accent-500 focus:ring-accent-500"
                      />
                      <span className="capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-warm-900">Preferred Transport</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(['any', 'flight', 'train', 'car'] as const).map(t => (
                    <Card 
                      key={t}
                      className={cn(
                        "p-3 cursor-pointer text-center text-sm transition-colors",
                        formData.transport === t ? "border-accent-400 bg-accent-50/50 text-accent-700" : ""
                      )}
                      onClick={() => setFormData({ ...formData, transport: t })}
                    >
                      <span className="capitalize">{t}</span>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <Button variant="secondary" onClick={prevStep} className="flex-1">Back</Button>
              <Button onClick={handleCreate} className="flex-1" variant="secondary">Create Trip</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
