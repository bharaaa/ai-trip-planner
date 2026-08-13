import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { PageTransition } from '@/components/motion/PageTransition';
import { cn } from '@/lib/utils/cn';
import { useTripStore } from '@/stores/tripStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { StepIndicator } from './components/StepIndicator';
import { formatCurrency } from '@/lib/utils/formatting';
import type { User } from '@/types';

export function CreateTripPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { createTrip, searchUsers } = useTripStore();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    invitedUsers: [] as User[],
    dateFlexibility: 'exact',
    duration: 5,
    budgetPerPerson: 5000000,
    budgetType: 'per_person',
    budgetFlexibility: 'comfortable',
    startingLocation: 'Jakarta',
    destinationType: 'domestic',
    transport: 'flight'
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    
    if (searchRef.current) clearTimeout(searchRef.current);
    
    searchRef.current = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchUsers(searchQuery);
      // Filter out users already invited or currentUser
      const filtered = results.filter(u => 
        currentUser && u.id !== currentUser.id && !formData.invitedUsers.some(invited => invited.id === u.id)
      );
      setSearchResults(filtered);
      setIsSearching(false);
    }, 300);
    
    return () => {
      if (searchRef.current) clearTimeout(searchRef.current);
    };
  }, [searchQuery, formData.invitedUsers, searchUsers, currentUser?.id]);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const handleCreate = async () => {
    const tripId = await createTrip({
      name: formData.name,
      origin: formData.startingLocation,
      flexibleDates: formData.dateFlexibility !== 'exact',
      invitedUserIds: formData.invitedUsers.map(u => u.id)
    });
    navigate(`/trips/${tripId}/preferences`);
  };

  const addTraveler = (user: User) => {
    setFormData({ ...formData, invitedUsers: [...formData.invitedUsers, user] });
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeTraveler = (userId: string) => {
    setFormData({ ...formData, invitedUsers: formData.invitedUsers.filter(u => u.id !== userId) });
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
              <p className="text-warm-600">You and {formData.invitedUsers.length} traveler{formData.invitedUsers.length !== 1 ? 's' : ''}</p>
            </div>
            
            <div className="space-y-4 relative">
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 bg-white border border-warm-200 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center font-bold text-accent-700">
                    {currentUser?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-warm-900">{currentUser?.name || 'You'} (You)</p>
                    <p className="text-xs text-warm-500">{currentUser?.email || ''}</p>
                  </div>
                </div>

                {formData.invitedUsers.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 p-3 bg-white border border-warm-200 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-warm-100 flex items-center justify-center font-bold text-warm-700">
                      {u.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-warm-900">{u.name}</p>
                      <p className="text-xs text-warm-500">{u.email}</p>
                    </div>
                    <Button variant="secondary" onClick={() => removeTraveler(u.id)} className="text-sm px-3">
                      Remove
                    </Button>
                  </div>
                ))}
              </div>

              <div className="relative">
                <Input
                  label="Invite Friends"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                />
                
                {searchQuery.trim().length >= 2 && (
                  <Card className="absolute top-full left-0 right-0 mt-2 p-2 z-10 shadow-lg border-warm-200 max-h-60 overflow-y-auto">
                    {isSearching ? (
                      <p className="text-sm text-warm-500 p-4 text-center">Searching...</p>
                    ) : searchResults.length > 0 ? (
                      <div className="space-y-1">
                        {searchResults.map(user => (
                          <button
                            key={user.id}
                            className="w-full text-left p-3 hover:bg-warm-50 rounded-lg flex items-center gap-3 transition-colors"
                            onClick={() => addTraveler(user)}
                          >
                            <div className="w-8 h-8 rounded-full bg-warm-200 flex items-center justify-center font-medium text-warm-700 text-sm">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-warm-900 text-sm">{user.name}</p>
                              <p className="text-xs text-warm-500">{user.email}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-warm-500 p-4 text-center">No users found.</p>
                    )}
                  </Card>
                )}
              </div>
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
