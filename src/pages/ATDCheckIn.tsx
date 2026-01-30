import { useState } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { DayCard } from '@/components/beat-plan/DayCard';
import { CheckInForm } from '@/components/beat-plan/CheckInForm';
import { useApp } from '@/contexts/AppContext';
import { DayPlan, DAYS_OF_WEEK } from '@/types/beatPlan';
import { format, parseISO, isToday, isBefore, startOfDay } from 'date-fns';
import { Camera, CheckCircle } from 'lucide-react';

export default function ATDCheckIn() {
  const { weeklyPlans, addCheckIn } = useApp();
  const [checkingInDay, setCheckingInDay] = useState<DayPlan | null>(null);

  // Get approved plan
  const approvedPlan = weeklyPlans.find(p => p.status === 'approved');
  
  // Find today's day plan
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayPlan = approvedPlan?.days.find(d => d.date === todayStr);

  const handleCheckIn = (day: DayPlan) => {
    if (!day.checkIn) {
      setCheckingInDay(day);
    }
  };

  const handleCheckInSubmit = (photoUrl: string, notes?: string) => {
    if (checkingInDay) {
      addCheckIn(checkingInDay.id, photoUrl, notes);
      setCheckingInDay(null);
    }
  };

  return (
    <MobileLayout title="Check In" showBack>
      <div className="p-4 space-y-4">
        {/* Today's Plan */}
        {todayPlan ? (
          <div className="space-y-4">
            <div className="bg-card border-2 border-border rounded-lg p-4">
              <h2 className="font-semibold mb-1">Today's Plan</h2>
              <p className="text-sm text-muted-foreground">
                {format(new Date(), 'EEEE, dd MMM yyyy')}
              </p>
            </div>

            <DayCard day={todayPlan} showCheckIn />

            {todayPlan.checkIn ? (
              <div className="bg-success/10 border-2 border-success rounded-lg p-4 text-center">
                <CheckCircle size={32} className="mx-auto mb-2 text-success" />
                <p className="font-medium text-success">Already Checked In</p>
                <p className="text-sm text-muted-foreground">
                  {format(parseISO(todayPlan.checkIn.timestamp), 'hh:mm a')}
                </p>
                {todayPlan.checkIn.photoUrl && (
                  <img 
                    src={todayPlan.checkIn.photoUrl} 
                    alt="Check-in proof" 
                    className="mt-3 rounded-lg w-full max-h-48 object-cover"
                  />
                )}
              </div>
            ) : (
              <button
                onClick={() => handleCheckIn(todayPlan)}
                className="w-full btn-primary py-4 flex items-center justify-center gap-2"
              >
                <Camera size={24} />
                <span className="text-lg font-medium">Check In Now</span>
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No approved plan for today</p>
          </div>
        )}

        {/* This Week's Check-ins */}
        {approvedPlan && (
          <div className="mt-6">
            <h3 className="font-medium mb-3">This Week's Visits</h3>
            <div className="space-y-2">
              {approvedPlan.days.map(day => {
                const dayDate = parseISO(day.date);
                const isPast = isBefore(dayDate, startOfDay(new Date()));
                const isCurrentDay = isToday(dayDate);
                
                return (
                  <div 
                    key={day.id}
                    className={`bg-card border-2 rounded-lg p-3 flex items-center justify-between ${
                      isCurrentDay ? 'border-primary' : 'border-border'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {DAYS_OF_WEEK[day.dayOfWeek]} - {format(dayDate, 'dd MMM')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {day.clusters.map(c => c.name).join(', ') || 'No route set'}
                      </p>
                    </div>
                    <div>
                      {day.checkIn ? (
                        <span className="chip bg-success text-success-foreground">
                          <CheckCircle size={12} className="mr-1" /> Done
                        </span>
                      ) : isPast && !isCurrentDay ? (
                        <span className="chip bg-destructive text-destructive-foreground">
                          Missed
                        </span>
                      ) : isCurrentDay ? (
                        <button
                          onClick={() => handleCheckIn(day)}
                          className="chip chip-selected"
                        >
                          Check In
                        </button>
                      ) : (
                        <span className="chip">Upcoming</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Check-in Form Modal */}
      {checkingInDay && (
        <CheckInForm
          onSubmit={handleCheckInSubmit}
          onClose={() => setCheckingInDay(null)}
        />
      )}
    </MobileLayout>
  );
}
