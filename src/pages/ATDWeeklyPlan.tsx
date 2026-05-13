import { MobileLayout } from '@/components/layout/MobileLayout';
import { DayCard } from '@/components/beat-plan/DayCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useApp } from '@/contexts/AppContext';
import { DAYS_OF_WEEK, Visit } from '@/types/beatPlan';
import { format, parseISO } from 'date-fns';
import { ChevronRight, Plus, Send, AlertCircle, Save, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ATDWeeklyPlan() {
  const navigate = useNavigate();
  const {
    currentPlan,
    weeklyPlans,
    createNewPlan,
    submitPlan,
    addVisitToDay,
    updateVisit,
    deleteVisit,
  } = useApp();

  // Prefer the active draft, then sent_back, then pending, then approved
  const displayPlan =
    currentPlan ||
    weeklyPlans.find((p) => p.status === 'draft') ||
    weeklyPlans.find((p) => p.status === 'sent_back') ||
    weeklyPlans.find((p) => p.status === 'pending_approval') ||
    weeklyPlans[0];

  const isEditable =
    !!currentPlan &&
    (displayPlan?.status === 'draft' || displayPlan?.status === 'sent_back');

  const handleStartNewPlan = () => createNewPlan();
  const handleSubmit = () => submitPlan();

  const totalVisits =
    displayPlan?.days.reduce((sum, d) => sum + d.visits.length, 0) || 0;
  const daysPlanned =
    displayPlan?.days.filter((d) => d.visits.length > 0).length || 0;

  const canSubmit =
    totalVisits > 0 &&
    (displayPlan?.status === 'draft' || displayPlan?.status === 'sent_back');

  const weekRange = displayPlan
    ? `${format(parseISO(displayPlan.weekStartDate), 'EEE dd MMM')} – ${format(
        parseISO(displayPlan.days[5].date),
        'EEE dd MMM yyyy'
      )}`
    : '';

  const lastRbmComment =
    displayPlan?.status === 'sent_back'
      ? displayPlan.comments.filter((c) => c.authorRole === 'rbm').pop()
      : null;

  const headerTitle = isEditable ? 'Create Weekly Beat Plan' : 'Beat Planning';

  return (
    <MobileLayout title={headerTitle} showBack>
      <div className="p-4 space-y-4 pb-32">
        {/* Plan summary */}
        {displayPlan && (
          <div className="bg-card border-2 border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-1.5">
              <p className="text-sm text-muted-foreground">
                {isEditable
                  ? 'Plan your field visits for next week'
                  : 'Weekly plan summary'}
              </p>
              <StatusBadge status={displayPlan.status} />
            </div>
            <h2 className="text-xl font-bold mb-2">Weekly Plan</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar size={14} />
              <span>{weekRange}</span>
            </div>
          </div>
        )}

        {/* Create Next Week Plan Button - always available */}
        {!currentPlan && (
          <button
            onClick={handleStartNewPlan}
            className="w-full bg-card border-2 border-border border-dashed rounded-lg p-6 text-center touch-feedback"
          >
            <Plus size={32} className="mx-auto mb-2 text-muted-foreground" />
            <p className="font-medium">Create Weekly Plan</p>
            <p className="text-sm text-muted-foreground">
              Plan for next week (Mon-Sat)
            </p>
          </button>
        )}

        {/* RBM Feedback Banner */}
        {lastRbmComment && (
          <div className="bg-destructive/10 border-2 border-destructive rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive mb-1">
                  Sent Back by RBM
                </p>
                <p className="text-sm">{lastRbmComment.content}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {lastRbmComment.author} •{' '}
                  {format(parseISO(lastRbmComment.timestamp), 'dd MMM, hh:mm a')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Day Cards */}
        {displayPlan && (
          <div className="space-y-3">
            {displayPlan.days.map((day) => (
              <DayCard
                key={day.id}
                day={day}
                editable={isEditable}
                onAddVisit={(v) => addVisitToDay(day.id, v)}
                onUpdateVisit={(v) => updateVisit(day.id, v)}
                onDeleteVisit={(id) => deleteVisit(day.id, id)}
                onClick={() => {
                  if (!isEditable) navigate(`/atd/plan/${displayPlan.id}`);
                }}
              />
            ))}
          </div>
        )}

        {/* View Existing Plans */}
        {weeklyPlans.length > 0 && !currentPlan && (
          <div className="mt-6">
            <h3 className="font-medium mb-2">Recent Plans</h3>
            {weeklyPlans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => navigate(`/atd/plan/${plan.id}`)}
                className="w-full menu-card flex items-center justify-between mb-2"
              >
                <div>
                  <p className="font-medium text-sm">
                    Week of {format(parseISO(plan.weekStartDate), 'dd MMM')}
                  </p>
                  <StatusBadge status={plan.status} className="mt-1" />
                </div>
                <ChevronRight size={20} className="text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sticky bottom action bar */}
      {isEditable && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 pt-3 pb-4 max-w-md mx-auto">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>
              <span className="font-medium">Days planned:</span>{' '}
              <span className="text-muted-foreground">{daysPlanned} / 6</span>
            </span>
            <span>
              <span className="font-medium">Total visits:</span>{' '}
              <span className="text-muted-foreground">{totalVisits}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md border border-input bg-card font-medium">
              <Save size={16} />
              <span>Save as Draft</span>
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md bg-secondary text-secondary-foreground font-medium disabled:opacity-50"
            >
              <Send size={16} />
              <span>Submit for Approval</span>
            </button>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}
