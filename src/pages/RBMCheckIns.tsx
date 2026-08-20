import { useState } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useApp } from '@/contexts/AppContext';
import { DAYS_OF_WEEK, VISIT_PURPOSE_LABELS, Visit, DayPlan, WeeklyPlan } from '@/types/beatPlan';
import { format, parseISO, isToday, isBefore, startOfDay } from 'date-fns';
import {
  CheckCircle, XCircle, Clock, MapPin, Users, ChevronDown, ChevronUp, User,
} from 'lucide-react';

type VisitStatus = 'done' | 'missed' | 'pending';

function getVisitStatus(visit: Visit, dayDate: Date): VisitStatus {
  if (visit.checkIn) return 'done';
  if (isToday(dayDate)) return 'pending';
  if (isBefore(dayDate, startOfDay(new Date()))) return 'missed';
  return 'pending';
}

function StatusPill({ status }: { status: VisitStatus }) {
  const map = {
    done: { label: 'Done', cls: 'bg-success/15 text-success', Icon: CheckCircle },
    missed: { label: 'Missed', cls: 'bg-destructive/15 text-destructive', Icon: XCircle },
    pending: { label: 'Pending', cls: 'bg-muted text-muted-foreground', Icon: Clock },
  }[status];
  const { Icon } = map;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${map.cls}`}>
      <Icon size={12} /> {map.label}
    </span>
  );
}

function ATDCard({ plan }: { plan: WeeklyPlan }) {
  const [expanded, setExpanded] = useState(false);

  let done = 0;
  let missed = 0;
  let pending = 0;
  plan.days.forEach((d) => {
    const dayDate = parseISO(d.date);
    d.visits.forEach((v) => {
      const s = getVisitStatus(v, dayDate);
      if (s === 'done') done++;
      else if (s === 'missed') missed++;
      else pending++;
    });
  });
  const total = done + missed + pending;
  const completionPct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="bg-card border-2 border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full p-4 flex items-start justify-between text-left"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
            <User size={16} />
          </div>
          <div>
            <p className="font-semibold">{plan.atdName}</p>
            <p className="text-xs text-muted-foreground">{plan.hq}</p>
            <div className="flex items-center gap-3 mt-2 text-xs">
              <span className="flex items-center gap-1 text-success">
                <CheckCircle size={12} /> {done} done
              </span>
              <span className="flex items-center gap-1 text-destructive">
                <XCircle size={12} /> {missed} missed
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock size={12} /> {pending} pending
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-sm font-semibold">{completionPct}%</span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border p-3 space-y-3 bg-muted/20">
          {plan.days.map((day) => (
            <DayBreakdown key={day.id} day={day} />
          ))}
        </div>
      )}
    </div>
  );
}

function DayBreakdown({ day }: { day: DayPlan }) {
  const dayDate = parseISO(day.date);
  const dayName = DAYS_OF_WEEK[day.dayOfWeek];
  const isCurrent = isToday(dayDate);

  return (
    <div className={`rounded-lg border ${isCurrent ? 'border-primary' : 'border-border'} bg-card`}>
      <div className="px-3 py-2 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{dayName}</span>
          <span className="text-xs text-muted-foreground">{format(dayDate, 'dd MMM')}</span>
          {isCurrent && (
            <span className="text-[10px] uppercase tracking-wide bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
              Today
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {day.visits.length} visit{day.visits.length !== 1 ? 's' : ''}
        </span>
      </div>

      {day.visits.length === 0 ? (
        <p className="text-xs text-muted-foreground p-3">No visits planned</p>
      ) : (
        <div className="divide-y divide-border">
          {day.visits.map((visit, idx) => {
            const status = getVisitStatus(visit, dayDate);
            return (
              <div key={visit.id} className="p-3 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Visit {idx + 1}
                  </span>
                  <StatusPill status={status} />
                </div>
                {visit.cluster && (
                  <div className="flex items-start gap-1.5 text-xs">
                    <MapPin size={12} className="text-muted-foreground mt-0.5 shrink-0" />
                    <span>{visit.cluster.name}</span>
                  </div>
                )}
                {visit.agents.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Users size={12} className="text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">
                        Retailers scheduled: {visit.agents.length}
                        {visit.checkIn?.metAgentIds && (
                          <> · attended {visit.agents.filter((a) => visit.checkIn!.metAgentIds!.includes(a.id)).length}</>
                        )}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {visit.agents.map((a) => {
                        const met = visit.checkIn?.metAgentIds?.includes(a.id);
                        const cls = !visit.checkIn
                          ? 'bg-muted text-muted-foreground'
                          : met
                            ? 'bg-success/15 text-success'
                            : 'bg-destructive/15 text-destructive';
                        return (
                          <span
                            key={a.id}
                            className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${cls}`}
                          >
                            {visit.checkIn ? (
                              met ? <CheckCircle size={10} /> : <XCircle size={10} />
                            ) : (
                              <Clock size={10} />
                            )}
                            {a.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
                {visit.timeSlot && (
                  <div className="flex items-start gap-1.5 text-xs">
                    <Clock size={12} className="text-muted-foreground mt-0.5 shrink-0" />
                    <span>{visit.timeSlot.start} – {visit.timeSlot.end}</span>
                  </div>
                )}
                {visit.purposes.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {visit.purposes.map((p) => (
                      <span key={p} className="chip text-[10px] py-0.5 px-1.5">
                        {VISIT_PURPOSE_LABELS[p]}
                      </span>
                    ))}
                  </div>
                )}
                {visit.checkIn && (
                  <div className="mt-2 flex items-center gap-2">
                    {visit.checkIn.photoUrl && (
                      <img
                        src={visit.checkIn.photoUrl}
                        alt="check-in"
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                    <div className="text-[11px] text-muted-foreground">
                      <p>Checked in {format(parseISO(visit.checkIn.timestamp), 'hh:mm a')}</p>
                      {visit.checkIn.metAgentIds && visit.agents.length > 0 && (
                        <p>
                          Attendance {visit.checkIn.metAgentIds.length}/{visit.agents.length}
                          {visit.agents.filter((a) => !visit.checkIn!.metAgentIds!.includes(a.id)).length > 0 && (
                            <>
                              {' '}· missed:{' '}
                              {visit.agents
                                .filter((a) => !visit.checkIn!.metAgentIds!.includes(a.id))
                                .map((a) => a.name)
                                .join(', ')}
                            </>
                          )}
                        </p>
                      )}
                      {visit.checkIn.location && (
                        <p>
                          {visit.checkIn.location.latitude.toFixed(3)},{' '}
                          {visit.checkIn.location.longitude.toFixed(3)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function RBMCheckIns() {
  const { weeklyPlans } = useApp();
  const approvedPlans = weeklyPlans.filter((p) => p.status === 'approved');

  // Aggregate stats across team
  let teamDone = 0;
  let teamMissed = 0;
  let teamPending = 0;
  approvedPlans.forEach((p) =>
    p.days.forEach((d) => {
      const dayDate = parseISO(d.date);
      d.visits.forEach((v) => {
        const s = getVisitStatus(v, dayDate);
        if (s === 'done') teamDone++;
        else if (s === 'missed') teamMissed++;
        else teamPending++;
      });
    })
  );

  return (
    <MobileLayout title="Team Check-ins" showBack>
      <div className="p-4 space-y-4">
        <div className="bg-card border-2 border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-2">This week's team activity</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-success/10 rounded-lg p-2">
              <p className="text-xl font-bold text-success">{teamDone}</p>
              <p className="text-xs text-muted-foreground">Done</p>
            </div>
            <div className="bg-destructive/10 rounded-lg p-2">
              <p className="text-xl font-bold text-destructive">{teamMissed}</p>
              <p className="text-xs text-muted-foreground">Missed</p>
            </div>
            <div className="bg-muted rounded-lg p-2">
              <p className="text-xl font-bold">{teamPending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>

        {approvedPlans.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No approved plans for this week</p>
          </div>
        ) : (
          <div className="space-y-3">
            {approvedPlans.map((p) => (
              <ATDCard key={p.id} plan={p} />
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
