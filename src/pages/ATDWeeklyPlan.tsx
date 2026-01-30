import { useState } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { DayCard } from '@/components/beat-plan/DayCard';
import { DayPlanForm } from '@/components/beat-plan/DayPlanForm';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useApp } from '@/contexts/AppContext';
import { DayPlan, DAYS_OF_WEEK } from '@/types/beatPlan';
import { format, parseISO } from 'date-fns';
import { ChevronRight, Plus, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ATDWeeklyPlan() {
  const navigate = useNavigate();
  const { currentPlan, weeklyPlans, createNewPlan, updateDayPlan, submitPlan } = useApp();
  const [editingDay, setEditingDay] = useState<DayPlan | null>(null);

  // Get the plan to display (current draft or existing)
  const displayPlan = currentPlan || weeklyPlans[0];

  const handleStartNewPlan = () => {
    createNewPlan();
  };

  const handleDayClick = (day: DayPlan) => {
    if (displayPlan?.status === 'draft' || displayPlan?.status === 'sent_back') {
      setEditingDay(day);
    }
  };

  const handleDaySave = (updatedDay: DayPlan) => {
    updateDayPlan(updatedDay);
    setEditingDay(null);
  };

  const handleSubmit = () => {
    submitPlan();
  };

  const canSubmit = displayPlan?.days.some(d => d.clusters.length > 0) && 
    (displayPlan?.status === 'draft' || displayPlan?.status === 'sent_back');

  const weekRange = displayPlan ? 
    `${format(parseISO(displayPlan.weekStartDate), 'dd MMM')} - ${format(parseISO(displayPlan.days[5].date), 'dd MMM yyyy')}` :
    '';

  return (
    <MobileLayout title="Beat Planning" showBack>
      <div className="p-4 space-y-4">
        {/* Week Header */}
        {displayPlan ? (
          <div className="bg-card border-2 border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">Weekly Plan</h2>
              <StatusBadge status={displayPlan.status} />
            </div>
            <p className="text-sm text-muted-foreground">{weekRange}</p>
            <p className="text-sm text-muted-foreground">HQ: {displayPlan.hq}</p>
          </div>
        ) : (
          <button
            onClick={handleStartNewPlan}
            className="w-full bg-card border-2 border-border border-dashed rounded-lg p-6 text-center touch-feedback"
          >
            <Plus size={32} className="mx-auto mb-2 text-muted-foreground" />
            <p className="font-medium">Create Weekly Plan</p>
            <p className="text-sm text-muted-foreground">Plan for next week (Mon-Sat)</p>
          </button>
        )}

        {/* RBM Feedback */}
        {displayPlan?.status === 'sent_back' && displayPlan.comments.length > 0 && (
          <div className="bg-destructive/10 border-2 border-destructive rounded-lg p-3">
            <p className="text-sm font-medium text-destructive mb-1">RBM Feedback:</p>
            <p className="text-sm">{displayPlan.comments[displayPlan.comments.length - 1].content}</p>
          </div>
        )}

        {/* Day Cards */}
        {displayPlan && (
          <div className="space-y-3">
            {displayPlan.days.map(day => (
              <DayCard
                key={day.id}
                day={day}
                onClick={() => handleDayClick(day)}
              />
            ))}
          </div>
        )}

        {/* Submit Button */}
        {canSubmit && (
          <button
            onClick={handleSubmit}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2"
          >
            <Send size={20} />
            <span>Submit Weekly Plan</span>
          </button>
        )}

        {/* View Existing Plans */}
        {weeklyPlans.length > 0 && !currentPlan && (
          <div className="mt-6">
            <h3 className="font-medium mb-2">Recent Plans</h3>
            {weeklyPlans.map(plan => (
              <button
                key={plan.id}
                onClick={() => navigate(`/atd/plan/${plan.id}`)}
                className="w-full menu-card flex items-center justify-between mb-2"
              >
                <div>
                  <p className="font-medium text-sm">Week of {format(parseISO(plan.weekStartDate), 'dd MMM')}</p>
                  <StatusBadge status={plan.status} className="mt-1" />
                </div>
                <ChevronRight size={20} className="text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Day Plan Form Modal */}
      {editingDay && (
        <DayPlanForm
          day={editingDay}
          onSave={handleDaySave}
          onClose={() => setEditingDay(null)}
        />
      )}
    </MobileLayout>
  );
}
