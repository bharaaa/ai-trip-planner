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
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { StepIndicator } from './components/StepIndicator';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { formatCurrency } from '@/lib/utils/formatting';
import { CalendarRange, Calendar, Shuffle, Wallet, Armchair, Sparkles, HelpCircle, CarFront, Plane, TrainFront, Car } from 'lucide-react';
import type { User } from '@/types';
import type { DateRange } from 'react-day-picker';
import { differenceInDays } from 'date-fns';

export function CreateTripPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { createTrip, searchUsers } = useTripStore();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    invitedUsers: [] as User[],
    dateFlexibility: 'exact',
    dateMonth: '',
    dateRange: undefined as DateRange | undefined,
    duration: 5,
    budgetPerPerson: 5000000,
    budgetType: 'per_person',
    budgetFlexibility: 2, // 1: Budget, 2: Comfortable, 3: Premium, 4: Don't know
    startingLocation: 'Jakarta',
    destinationType: 'domestic',
    transport: 'flight'
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const next12Months = React.useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() + i);
      return {
        value: `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`,
        label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      };
    });
  }, []);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const handleCreate = async () => {
    let finalDuration = formData.duration;
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (formData.dateFlexibility === 'exact' && formData.dateRange?.from) {
      startDate = formData.dateRange.from;
      endDate = formData.dateRange.to || formData.dateRange.from;
      finalDuration = differenceInDays(endDate, startDate) + 1;
    }

    const tripId = await createTrip({
      name: formData.name,
      origin: formData.startingLocation,
      flexibleDates: formData.dateFlexibility !== 'exact',
      dateMonth: formData.dateFlexibility === 'month' ? formData.dateMonth : undefined,
      startDate,
      endDate,
      duration: finalDuration,
      budgetPerPerson: formData.budgetType === 'per_person' ? formData.budgetPerPerson : undefined,
      totalBudget: formData.budgetType === 'total' ? formData.budgetPerPerson : undefined,
      budgetFlexibility: formData.budgetFlexibility,
      travelConstraints: `Destination Type: ${formData.destinationType}, Transport: ${formData.transport}`,
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
          <motion.div key={1} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ type: "spring", bounce: 0, duration: 0.4 }} className="space-y-10">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-warm-950 tracking-tight">Let's plan something.</h1>
              <p className="text-lg text-warm-600">Give this adventure a name to get started.</p>
            </div>
            <div className="space-y-6">
              <Input
                label="Name your adventure"
                placeholder="e.g. Summer Getaway, Bali 2026..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                autoFocus
              />
              <div className="flex justify-center mt-12">
                <Button 
                  onClick={nextStep} 
                  disabled={!formData.name.trim()}
                  size="lg"
                  className="rounded-full px-10 text-base"
                >
                  Continue
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key={2} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ type: "spring", bounce: 0, duration: 0.4 }} className="space-y-10">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-warm-950 tracking-tight">Who are you planning with?</h1>
              <p className="text-lg text-warm-600">
                {formData.invitedUsers.length === 0 
                  ? 'Just you for now.' 
                  : `You and ${formData.invitedUsers.length} friend${formData.invitedUsers.length !== 1 ? 's' : ''}.`
                }
              </p>
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
                  label="Invite your crew"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search friends by name or email..."
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
            <div className="flex justify-center gap-4 pt-8">
              <Button variant="secondary" onClick={prevStep} size="lg" className="rounded-full px-8 text-base">Back</Button>
              <Button onClick={nextStep} size="lg" className="rounded-full px-10 text-base">Continue</Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key={3} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ type: "spring", bounce: 0, duration: 0.4 }} className="space-y-10">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-warm-950 tracking-tight">How much time do you have?</h1>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { type: 'exact', label: 'Locked In', icon: <CalendarRange className="w-6 h-6 text-warm-600 mb-1" /> },
                { type: 'month', label: 'Sometime in...', icon: <Calendar className="w-6 h-6 text-warm-600 mb-1" /> },
                { type: 'flexible', label: 'Sometime in the future', icon: <Shuffle className="w-6 h-6 text-warm-600 mb-1" /> }
              ].map(opt => (
                <Card 
                  key={opt.type}
                  className={cn(
                    "p-5 cursor-pointer hover:border-accent-400 transition-colors flex flex-col items-center gap-2",
                    formData.dateFlexibility === opt.type ? "border-accent-400 bg-accent-50/50" : "border-warm-200"
                  )}
                  onClick={() => setFormData({ ...formData, dateFlexibility: opt.type })}
                >
                  {opt.icon}
                  <span className="font-medium text-sm text-center text-warm-900">{opt.label}</span>
                </Card>
              ))}
            </div>

            <div className="space-y-4 pt-4 flex flex-col items-center">
              {formData.dateFlexibility === 'exact' && (
                <div className="w-full">
                  <p className="text-sm font-medium text-warm-900 mb-3 text-center">Select your travel dates</p>
                  <DateRangePicker 
                    selected={formData.dateRange}
                    onSelect={(range) => setFormData({ ...formData, dateRange: range })}
                    className="mx-auto"
                  />
                  {formData.dateRange?.from && formData.dateRange?.to && (
                    <p className="text-center text-sm font-medium text-warm-600 mt-4">
                      {differenceInDays(formData.dateRange.to, formData.dateRange.from) + 1} days trip
                    </p>
                  )}
                </div>
              )}
              
              {formData.dateFlexibility === 'month' && (
                <div className="w-full max-w-sm space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-warm-900">Which month?</label>
                    <Select
                      value={formData.dateMonth}
                      onChange={(val) => setFormData({ ...formData, dateMonth: val })}
                      options={next12Months}
                      placeholder="Select a month"
                    />
                  </div>
                  <Input
                    type="number"
                    label="How many days?"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
                    min={1}
                  />
                </div>
              )}

              {formData.dateFlexibility === 'flexible' && (
                <div className="w-full max-w-sm">
                  <Input
                    type="number"
                    label="How many days?"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
                    min={1}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-center gap-4 pt-8">
              <Button variant="secondary" onClick={prevStep} size="lg" className="rounded-full px-8 text-base">Back</Button>
              <Button onClick={nextStep} size="lg" className="rounded-full px-10 text-base">Continue</Button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key={4} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ type: "spring", bounce: 0, duration: 0.4 }} className="space-y-10">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-warm-950 tracking-tight">What's your vibe?</h1>
              <p className="text-lg text-warm-600">Don't know the exact budget? That's fine. We'll work with a rough number.</p>
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
                  { id: 1, label: 'Budget', icon: <Wallet className="w-5 h-5" /> },
                  { id: 2, label: 'Comfortable', icon: <Armchair className="w-5 h-5" /> },
                  { id: 3, label: 'Premium', icon: <Sparkles className="w-5 h-5" /> },
                  { id: 4, label: "I don't know", icon: <HelpCircle className="w-5 h-5" /> }
                ].map(style => (
                  <Card 
                    key={style.id}
                    className={cn(
                      "p-4 cursor-pointer flex items-center justify-center gap-3 transition-colors",
                      formData.budgetFlexibility === style.id ? "border-accent-400 bg-accent-50/50" : "border-warm-200 hover:border-warm-300"
                    )}
                    onClick={() => setFormData({ ...formData, budgetFlexibility: style.id })}
                  >
                    <div className={cn(formData.budgetFlexibility === style.id ? "text-accent-600" : "text-warm-500")}>
                      {style.icon}
                    </div>
                    <span className={cn("text-sm font-medium", formData.budgetFlexibility === style.id ? "text-accent-700" : "text-warm-700")}>
                      {style.label}
                    </span>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-8">
              <Button variant="secondary" onClick={prevStep} size="lg" className="rounded-full px-8 text-base">Back</Button>
              <Button onClick={nextStep} size="lg" className="rounded-full px-10 text-base">Continue</Button>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key={5} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ type: "spring", bounce: 0, duration: 0.4 }} className="space-y-10">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-warm-950 tracking-tight">Just a few more details.</h1>
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
                    <label 
                      key={type} 
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={() => setFormData({ ...formData, destinationType: type })}
                    >
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
                    { id: 'any', label: 'Any', icon: <CarFront className="w-5 h-5" /> },
                    { id: 'flight', label: 'Flight', icon: <Plane className="w-5 h-5" /> },
                    { id: 'train', label: 'Train', icon: <TrainFront className="w-5 h-5" /> },
                    { id: 'car', label: 'Car', icon: <Car className="w-5 h-5" /> }
                  ].map(t => (
                    <Card 
                      key={t.id}
                      className={cn(
                        "p-4 cursor-pointer flex items-center justify-center gap-3 transition-colors",
                        formData.transport === t.id ? "border-accent-400 bg-accent-50/50" : "border-warm-200 hover:border-warm-300"
                      )}
                      onClick={() => setFormData({ ...formData, transport: t.id })}
                    >
                      <div className={cn(formData.transport === t.id ? "text-accent-600" : "text-warm-500")}>
                        {t.icon}
                      </div>
                      <span className={cn("capitalize text-sm font-medium", formData.transport === t.id ? "text-accent-700" : "text-warm-700")}>
                        {t.label}
                      </span>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-12">
              <Button variant="secondary" onClick={prevStep} size="lg" className="rounded-full px-8 text-base">Back</Button>
              <Button onClick={handleCreate} size="lg" className="rounded-full px-10 text-base">Create Trip</Button>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
