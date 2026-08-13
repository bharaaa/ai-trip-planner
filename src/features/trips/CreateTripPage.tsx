import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { PageTransition } from '@/components/motion/PageTransition';
import { cn } from '@/lib/utils/cn';
import { useTripStore } from '@/stores/tripStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
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

  const handleCreate = async () => {
    const tripId = await createTrip({
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
    <PageTransition className="max-w-xl mx-auto px-6 py-12 min-h-screen flex flex-col">
      <StepIndicator 
        currentStep={step} 
        totalSteps={5} 
        className="mb-12"
      />

      <div className="flex-1 w-full max-w-lg mx-auto">
        <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key={1} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="text-center space-y-3">
              <h1 className="text-3xl font-semibold text-warm-900 tracking-tight">Let's start planning</h1>
              <p className="text-warm-600">You don't need to know where yet. We'll figure it out together.</p>
            </div>
            <div className="space-y-6">
              <Input
                label="Trip Name"
                placeholder="e.g. Summer Getaway"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                autoFocus
              />
              <div className="flex gap-4 mt-10">
                <Button 
                  onClick={nextStep} 
                  disabled={!formData.name.trim()}
                  className="w-full flex-1"
                >
                  Continue
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key={2} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="text-center space-y-3">
              <h1 className="text-3xl font-semibold text-warm-900 tracking-tight">Who's coming?</h1>
              <p className="text-warm-600">{formData.travelers.length} traveler{formData.travelers.length > 1 ? 's' : ''}</p>
            </div>
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
            <div className="flex gap-4 pt-4">
              <Button variant="secondary" onClick={prevStep} className="flex-1">Back</Button>
              <Button onClick={nextStep} className="flex-1">Continue</Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key={3} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="text-center space-y-3">
              <h1 className="text-3xl font-semibold text-warm-900 tracking-tight">When are you thinking?</h1>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { type: 'exact', label: 'I have exact dates', emoji: '📅' },
                { type: 'month', label: 'Sometime in...', emoji: '📆' },
                { type: 'flexible', label: "I'm flexible", emoji: '🤷' }
              ].map(opt => (
                <Card 
                  key={opt.type}
                  className={cn(
                    "p-5 cursor-pointer hover:border-accent-400 transition-colors flex flex-col items-center gap-2",
                    formData.dateFlexibility === opt.type ? "border-accent-400 bg-accent-50/50" : "border-warm-200"
                  )}
                  onClick={() => setFormData({ ...formData, dateFlexibility: opt.type })}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <span className="font-medium text-sm text-center text-warm-900">{opt.label}</span>
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

            <div className="flex gap-4 pt-4">
              <Button variant="secondary" onClick={prevStep} className="flex-1">Back</Button>
              <Button onClick={nextStep} className="flex-1">Continue</Button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key={4} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="text-center space-y-3">
              <h1 className="text-3xl font-semibold text-warm-900 tracking-tight">What's the budget?</h1>
            </div>
            
            <div className="flex bg-warm-100 p-1 rounded-full">
              <button 
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-full transition-all",
                  formData.budgetType === 'per_person' ? "bg-white shadow-sm text-warm-900" : "text-warm-600 hover:text-warm-900"
                )}
                onClick={() => setFormData({ ...formData, budgetType: 'per_person' })}
              >
                Per person
              </button>
              <button 
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-full transition-all",
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
              <p className="text-sm font-medium text-warm-500">
                {formatCurrency(formData.budgetPerPerson)}
              </p>
            </div>

            <div className="pt-4 space-y-4">
              <p className="text-sm font-medium text-warm-900">Trip Style</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'budget', label: 'Budget', emoji: '💸' },
                  { id: 'comfortable', label: 'Comfortable', emoji: '🛋️' },
                  { id: 'premium', label: 'Premium', emoji: '✨' },
                  { id: 'dont_know', label: "I don't know", emoji: '🤔' }
                ].map(style => (
                  <Card 
                    key={style.id}
                    className={cn(
                      "p-4 cursor-pointer flex items-center justify-center gap-3 transition-colors",
                      formData.budgetFlexibility === style.id ? "border-accent-400 bg-accent-50/50" : "border-warm-200 hover:border-warm-300"
                    )}
                    onClick={() => setFormData({ ...formData, budgetFlexibility: style.id })}
                  >
                    <span className="text-xl">{style.emoji}</span>
                    <span className={cn("text-sm font-medium", formData.budgetFlexibility === style.id ? "text-accent-700" : "text-warm-700")}>
                      {style.label}
                    </span>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="secondary" onClick={prevStep} className="flex-1">Back</Button>
              <Button onClick={nextStep} className="flex-1">Continue</Button>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key={5} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="text-center space-y-3">
              <h1 className="text-3xl font-semibold text-warm-900 tracking-tight">A few more details</h1>
            </div>
            
            <div className="space-y-8">
              <Input
                label="Starting Location"
                value={formData.startingLocation}
                onChange={(e) => setFormData({ ...formData, startingLocation: e.target.value })}
              />

              <div className="space-y-4">
                <p className="text-sm font-medium text-warm-900">Destination Type</p>
                <div className="flex gap-6">
                  {(['domestic', 'international'] as const).map(type => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer group">
                      <div className={cn(
                        "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                        formData.destinationType === type ? "border-accent-500 bg-accent-50" : "border-warm-300 group-hover:border-accent-400"
                      )}>
                        {formData.destinationType === type && <div className="w-2.5 h-2.5 rounded-full bg-accent-500" />}
                      </div>
                      <span className="capitalize font-medium text-warm-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium text-warm-900">Preferred Transport</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'any', label: 'Any', emoji: '🚖' },
                    { id: 'flight', label: 'Flight', emoji: '✈️' },
                    { id: 'train', label: 'Train', emoji: '🚆' },
                    { id: 'car', label: 'Car', emoji: '🚗' }
                  ].map(t => (
                    <Card 
                      key={t.id}
                      className={cn(
                        "p-4 cursor-pointer flex items-center justify-center gap-3 transition-colors",
                        formData.transport === t.id ? "border-accent-400 bg-accent-50/50" : "border-warm-200 hover:border-warm-300"
                      )}
                      onClick={() => setFormData({ ...formData, transport: t.id })}
                    >
                      <span className="text-xl">{t.emoji}</span>
                      <span className={cn("capitalize text-sm font-medium", formData.transport === t.id ? "text-accent-700" : "text-warm-700")}>
                        {t.label}
                      </span>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-8">
              <Button variant="secondary" onClick={prevStep} className="flex-1">Back</Button>
              <Button onClick={handleCreate} className="flex-1">Create Trip</Button>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
