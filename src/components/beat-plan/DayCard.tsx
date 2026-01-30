import { DayPlan, DAYS_OF_WEEK, VISIT_PURPOSE_LABELS } from '@/types/beatPlan';
import { StatusBadge } from '@/components/common/StatusBadge';
import { format, parseISO } from 'date-fns';
import { MapPin, Users, Clock, Target, Camera, CheckCircle } from 'lucide-react';

interface DayCardProps {
  day: DayPlan;
  onClick?: () => void;
  showCheckIn?: boolean;
}

export function DayCard({ day, onClick, showCheckIn = false }: DayCardProps) {
  const dayName = DAYS_OF_WEEK[day.dayOfWeek];
  const dateStr = format(parseISO(day.date), 'dd MMM');
  const isEmpty = day.clusters.length === 0 && day.agents.length === 0;

  return (
    <div 
      className="day-card cursor-pointer touch-feedback animate-fade-in"
      onClick={onClick}
    >
      <div className="day-card-header flex items-center justify-between">
        <span>{dayName}</span>
        <span className="text-sm opacity-80">{dateStr}</span>
      </div>
      
      <div className="day-card-content">
        {isEmpty ? (
          <p className="text-muted-foreground text-sm py-2">Tap to add plan</p>
        ) : (
          <>
            {/* Clusters */}
            {day.clusters.length > 0 && (
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-muted-foreground mt-0.5 shrink-0" />
                <span className="text-sm">{day.clusters.map(c => c.name).join(', ')}</span>
              </div>
            )}

            {/* Agents */}
            {day.agents.length > 0 && (
              <div className="flex items-start gap-2">
                <Users size={16} className="text-muted-foreground mt-0.5 shrink-0" />
                <span className="text-sm">{day.agents.length} agents</span>
              </div>
            )}

            {/* Purpose */}
            {day.purposes.length > 0 && (
              <div className="flex items-start gap-2">
                <Target size={16} className="text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex flex-wrap gap-1">
                  {day.purposes.map(p => (
                    <span key={p} className="chip text-xs">{VISIT_PURPOSE_LABELS[p]}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Time Slots */}
            {day.timeSlots.length > 0 && (
              <div className="flex items-start gap-2">
                <Clock size={16} className="text-muted-foreground mt-0.5 shrink-0" />
                <span className="text-sm">
                  {day.timeSlots.map(t => `${t.start}-${t.end}`).join(', ')}
                </span>
              </div>
            )}

            {/* Check-in Status */}
            {showCheckIn && day.checkIn && (
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
                <CheckCircle size={16} className="text-success" />
                <span className="text-sm text-success">Checked in</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
