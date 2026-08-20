import { useState } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { CheckInForm } from '@/components/beat-plan/CheckInForm';
import { useApp } from '@/contexts/AppContext';
import { DayPlan, DAYS_OF_WEEK, Visit, GPSCoordinates, VISIT_PURPOSE_LABELS } from '@/types/beatPlan';
import { format, parseISO, isToday, isBefore, startOfDay } from 'date-fns';
import { Camera, CheckCircle, MapPin, Users, Clock, ChevronDown, ChevronUp } from 'lucide-react';

export default function ATDCheckIn() {
  const { weeklyPlans, addCheckIn } = useApp();
  const [checkingIn, setCheckingIn] = useState<{ dayId: string; visitId: string } | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  // Get approved plan
  const approvedPlan = weeklyPlans.find(p => p.status === 'approved');
  
  // Find today's day plan
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayPlan = approvedPlan?.days.find(d => d.date === todayStr);

  const checkingInAgents = checkingIn
    ? approvedPlan?.days
        .find(d => d.id === checkingIn.dayId)
        ?.visits.find(v => v.id === checkingIn.visitId)?.agents ?? []
    : [];

  const handleCheckIn = (dayId: string, visitId: string) => {
    setCheckingIn({ dayId, visitId });
  };

  const handleCheckInSubmit = (photoUrl: string, metAgentIds: string[], location?: GPSCoordinates, notes?: string) => {
    if (checkingIn) {
      addCheckIn(checkingIn.dayId, checkingIn.visitId, photoUrl, metAgentIds, location, notes);
      setCheckingIn(null);
    }
  };

  const toggleDayExpand = (dayId: string) => {
    setExpandedDay(expandedDay === dayId ? null : dayId);
  };

  const renderVisitCard = (visit: Visit, day: DayPlan, isCurrentDay: boolean) => {
    const hasCheckIn = !!visit.checkIn;
    
    return (
      <div 
        key={visit.id}
        className={`bg-card border-2 rounded-lg p-3 ${hasCheckIn ? 'border-success' : 'border-border'}`}
      >
        <div className="space-y-2">
          {visit.cluster && (
            <div className="flex items-start gap-2">
              <MapPin size={14} className="text-muted-foreground mt-0.5" />
              <span className="text-sm font-medium">{visit.cluster.name}</span>
            </div>
          )}
          
          {visit.agents.length > 0 && (
            <div className="flex items-start gap-2">
              <Users size={14} className="text-muted-foreground mt-0.5" />
              <span className="text-sm">{visit.agents.map(a => a.name).join(', ')}</span>
            </div>
          )}
          
          {visit.timeSlot && (
            <div className="flex items-start gap-2">
              <Clock size={14} className="text-muted-foreground mt-0.5" />
              <span className="text-sm">{visit.timeSlot.start} - {visit.timeSlot.end}</span>
            </div>
          )}
          
          {visit.purposes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {visit.purposes.map(p => (
                <span key={p} className="chip text-xs">{VISIT_PURPOSE_LABELS[p]}</span>
              ))}
            </div>
          )}
        </div>

        {/* Check-in status or button */}
        <div className="mt-3 pt-3 border-t border-border">
          {hasCheckIn ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle size={16} />
                <span className="text-sm font-medium">Checked In</span>
                <span className="text-xs text-muted-foreground">
                  {format(parseISO(visit.checkIn!.timestamp), 'hh:mm a')}
                </span>
              </div>
              {visit.checkIn!.location && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin size={12} />
                  <span>
                    {visit.checkIn!.location.latitude.toFixed(4)}, {visit.checkIn!.location.longitude.toFixed(4)}
                  </span>
                </div>
              )}
              {visit.checkIn!.metAgentIds && visit.agents.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  Met {visit.checkIn!.metAgentIds.length} of {visit.agents.length}:{' '}
                  {visit.agents
                    .filter(a => visit.checkIn!.metAgentIds!.includes(a.id))
                    .map(a => a.name)
                    .join(', ') || 'none'}
                </div>
              )}
              {visit.checkIn!.photoUrl && (
                <img 
                  src={visit.checkIn!.photoUrl} 
                  alt="Check-in proof" 
                  className="w-full h-24 object-cover rounded-lg mt-2"
                />
              )}
            </div>
          ) : isCurrentDay ? (
            <button
              onClick={() => handleCheckIn(day.id, visit.id)}
              className="w-full btn-primary py-2 flex items-center justify-center gap-2 text-sm"
            >
              <Camera size={16} />
              <span>Check In</span>
            </button>
          ) : (
            <span className="chip bg-muted text-muted-foreground text-xs">
              {isBefore(parseISO(day.date), startOfDay(new Date())) ? 'Missed' : 'Upcoming'}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <MobileLayout title="Check In" showBack>
      <div className="p-4 space-y-4">
        {/* Today's Visits */}
        {todayPlan && todayPlan.visits.length > 0 ? (
          <div className="space-y-4">
            <div className="bg-card border-2 border-primary rounded-lg p-4">
              <h2 className="font-semibold mb-1">Today's Visits</h2>
              <p className="text-sm text-muted-foreground">
                {format(new Date(), 'EEEE, dd MMM yyyy')}
              </p>
              <p className="text-sm mt-1">
                {todayPlan.visits.filter(v => v.checkIn).length} of {todayPlan.visits.length} completed
              </p>
            </div>

            <div className="space-y-3">
              {todayPlan.visits.map((visit, index) => (
                <div key={visit.id}>
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    Visit {index + 1}
                  </div>
                  {renderVisitCard(visit, todayPlan, true)}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {approvedPlan ? 'No visits planned for today' : 'No approved plan for this week'}
            </p>
          </div>
        )}

        {/* This Week's Visits */}
        {approvedPlan && (
          <div className="mt-6">
            <h3 className="font-medium mb-3">This Week's Visits</h3>
            <div className="space-y-2">
              {approvedPlan.days.map(day => {
                const dayDate = parseISO(day.date);
                const isPast = isBefore(dayDate, startOfDay(new Date()));
                const isCurrentDay = isToday(dayDate);
                const isExpanded = expandedDay === day.id;
                const completedCount = day.visits.filter(v => v.checkIn).length;
                
                return (
                  <div key={day.id} className="border-2 border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleDayExpand(day.id)}
                      className={`w-full p-3 flex items-center justify-between bg-card ${
                        isCurrentDay ? 'border-l-4 border-l-primary' : ''
                      }`}
                    >
                      <div className="text-left">
                        <p className="font-medium text-sm">
                          {DAYS_OF_WEEK[day.dayOfWeek]} - {format(dayDate, 'dd MMM')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {day.visits.length} visit{day.visits.length !== 1 ? 's' : ''} • {completedCount} done
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {completedCount === day.visits.length && day.visits.length > 0 ? (
                          <span className="chip bg-success text-success-foreground text-xs">
                            <CheckCircle size={12} className="mr-1" /> Complete
                          </span>
                        ) : isPast && !isCurrentDay ? (
                          <span className="chip bg-destructive text-destructive-foreground text-xs">
                            Missed
                          </span>
                        ) : isCurrentDay ? (
                          <span className="chip chip-selected text-xs">Today</span>
                        ) : (
                          <span className="chip text-xs">Upcoming</span>
                        )}
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <div className="p-3 bg-muted/30 space-y-2">
                        {day.visits.length > 0 ? (
                          day.visits.map((visit, index) => (
                            <div key={visit.id}>
                              <div className="text-xs font-medium text-muted-foreground mb-1">
                                Visit {index + 1}
                              </div>
                              {renderVisitCard(visit, day, isCurrentDay)}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-2">
                            No visits planned
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Check-in Form Modal */}
      {checkingIn && (
        <CheckInForm
          agents={checkingInAgents}
          onSubmit={handleCheckInSubmit}
          onClose={() => setCheckingIn(null)}
        />
      )}
    </MobileLayout>
  );
}
