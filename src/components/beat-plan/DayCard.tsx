import { DayPlan, DAYS_OF_WEEK, VISIT_PURPOSE_LABELS, Visit } from '@/types/beatPlan';
import { format, parseISO } from 'date-fns';
import { MapPin, Users, Clock, Target, CheckCircle, Plus } from 'lucide-react';

interface DayCardProps {
  day: DayPlan;
  onClick?: () => void;
  showCheckIn?: boolean;
}

interface VisitCardProps {
  visit: Visit;
  index: number;
  onClick?: () => void;
}

function VisitCard({ visit, index, onClick }: VisitCardProps) {
  const hasCheckIn = !!visit.checkIn;
  
  return (
    <div 
      className={`bg-muted/50 rounded-lg p-2 space-y-1 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Visit {index + 1}</span>
        {hasCheckIn && (
          <span className="flex items-center gap-1 text-xs text-success">
            <CheckCircle size={12} /> Done
          </span>
        )}
      </div>
      
      {visit.cluster && (
        <div className="flex items-start gap-1.5">
          <MapPin size={12} className="text-muted-foreground mt-0.5 shrink-0" />
          <span className="text-xs">{visit.cluster.name}</span>
        </div>
      )}
      
      {visit.agents.length > 0 && (
        <div className="flex items-start gap-1.5">
          <Users size={12} className="text-muted-foreground mt-0.5 shrink-0" />
          <span className="text-xs">{visit.agents.map(a => a.name).join(', ')}</span>
        </div>
      )}
      
      {visit.timeSlot && (
        <div className="flex items-start gap-1.5">
          <Clock size={12} className="text-muted-foreground mt-0.5 shrink-0" />
          <span className="text-xs">{visit.timeSlot.start} - {visit.timeSlot.end}</span>
        </div>
      )}
      
      {visit.purposes.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {visit.purposes.map(p => (
            <span key={p} className="chip text-[10px] py-0.5 px-1.5">{VISIT_PURPOSE_LABELS[p]}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export function DayCard({ day, onClick, showCheckIn = false }: DayCardProps) {
  const dayName = DAYS_OF_WEEK[day.dayOfWeek];
  const dateStr = format(parseISO(day.date), 'dd MMM');
  const isEmpty = day.visits.length === 0;
  const checkedInCount = day.visits.filter(v => v.checkIn).length;

  return (
    <div 
      className="day-card cursor-pointer touch-feedback animate-fade-in"
      onClick={onClick}
    >
      <div className="day-card-header flex items-center justify-between">
        <span>{dayName}</span>
        <div className="flex items-center gap-2">
          {showCheckIn && day.visits.length > 0 && (
            <span className="text-xs bg-card/20 px-1.5 py-0.5 rounded">
              {checkedInCount}/{day.visits.length}
            </span>
          )}
          <span className="text-sm opacity-80">{dateStr}</span>
        </div>
      </div>
      
      <div className="day-card-content">
        {isEmpty ? (
          <div className="flex items-center justify-center gap-2 text-muted-foreground py-2">
            <Plus size={16} />
            <span className="text-sm">Tap to add visits</span>
          </div>
        ) : (
          <div className="space-y-2">
            {day.visits.map((visit, index) => (
              <VisitCard key={visit.id} visit={visit} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
