import { useState } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { DayCard } from '@/components/beat-plan/DayCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useApp } from '@/contexts/AppContext';
import { WeeklyPlan, Comment, DAYS_OF_WEEK } from '@/types/beatPlan';
import { format, parseISO } from 'date-fns';
import { MessageCircle, Check, RotateCcw, Send, User, Image } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RBMReview() {
  const navigate = useNavigate();
  const { weeklyPlans, approvePlan, sendBackPlan, addComment, currentUser } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<WeeklyPlan | null>(null);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedDayId, setSelectedDayId] = useState<string | undefined>();

  // Get plans pending approval
  const pendingPlans = weeklyPlans.filter(p => 
    p.status === 'pending_approval' || p.status === 're_approval_required'
  );

  const handleSelectPlan = (plan: WeeklyPlan) => {
    setSelectedPlan(plan);
  };

  const handleApprove = () => {
    if (selectedPlan) {
      approvePlan(selectedPlan.id);
      setSelectedPlan(null);
    }
  };

  const handleSendBack = () => {
    if (selectedPlan && comment.trim()) {
      sendBackPlan(selectedPlan.id, comment);
      setComment('');
      setShowCommentForm(false);
      setSelectedPlan(null);
    }
  };

  const handleAddComment = () => {
    if (selectedPlan && comment.trim()) {
      addComment(selectedPlan.id, comment, selectedDayId);
      setComment('');
      setShowCommentForm(false);
      setSelectedDayId(undefined);
    }
  };

  if (selectedPlan) {
    const weekRange = `${format(parseISO(selectedPlan.weekStartDate), 'dd MMM')} - ${format(parseISO(selectedPlan.days[5].date), 'dd MMM yyyy')}`;

    return (
      <MobileLayout title="Review Plan" showBack>
        <div className="p-4 space-y-4">
          {/* Plan Header */}
          <div className="bg-card border-2 border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <User size={18} className="text-muted-foreground" />
                <span className="font-medium">{selectedPlan.atdName}</span>
              </div>
              <StatusBadge status={selectedPlan.status} />
            </div>
            <p className="text-sm text-muted-foreground">{weekRange}</p>
            <p className="text-sm text-muted-foreground">HQ: {selectedPlan.hq}</p>
          </div>

          {/* Day Cards (Read-only) */}
          <div className="space-y-3">
            {selectedPlan.days.map(day => (
              <div key={day.id} className="relative">
                <DayCard day={day} showCheckIn />
                {/* Check-in Photo */}
                {day.checkIn && (
                  <div className="mt-2 bg-card border-2 border-border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Image size={16} className="text-success" />
                      <span className="text-sm font-medium text-success">Check-in Proof</span>
                      <span className="text-xs text-muted-foreground">
                        {format(parseISO(day.checkIn.timestamp), 'hh:mm a')}
                      </span>
                    </div>
                    <img 
                      src={day.checkIn.photoUrl} 
                      alt="Check-in proof" 
                      className="rounded-lg w-full max-h-32 object-cover"
                    />
                    {day.checkIn.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{day.checkIn.notes}</p>
                    )}
                  </div>
                )}
                {/* Day Comment Button */}
                <button
                  onClick={() => {
                    setSelectedDayId(day.id);
                    setShowCommentForm(true);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-card border-2 border-border rounded-full touch-feedback"
                >
                  <MessageCircle size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Existing Comments */}
          {selectedPlan.comments.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Comments</h3>
              {selectedPlan.comments.map(c => (
                <div key={c.id} className="bg-muted rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{c.author}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(parseISO(c.timestamp), 'dd MMM, hh:mm a')}
                    </span>
                  </div>
                  <p className="text-sm">{c.content}</p>
                  {c.dayId && (
                    <span className="text-xs text-muted-foreground">
                      Re: {DAYS_OF_WEEK[selectedPlan.days.find(d => d.id === c.dayId)?.dayOfWeek || 0]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowCommentForm(true)}
              className="flex-1 btn-outline flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} />
              <span>Send Back</span>
            </button>
            <button
              onClick={handleApprove}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              <Check size={18} />
              <span>Approve</span>
            </button>
          </div>
        </div>

        {/* Comment Form Modal */}
        {showCommentForm && (
          <div className="fixed inset-0 bg-primary/50 z-50 flex items-end justify-center">
            <div className="bg-card w-full max-w-md rounded-t-2xl p-4 animate-slide-up">
              <h3 className="font-semibold mb-3">
                {selectedDayId ? 'Comment on Day' : 'Add Feedback'}
              </h3>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enter your feedback..."
                className="mobile-input min-h-[100px] resize-none mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCommentForm(false);
                    setComment('');
                    setSelectedDayId(undefined);
                  }}
                  className="flex-1 btn-outline"
                >
                  Cancel
                </button>
                {selectedDayId ? (
                  <button
                    onClick={handleAddComment}
                    disabled={!comment.trim()}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    <Send size={18} />
                    <span>Add Comment</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSendBack}
                    disabled={!comment.trim()}
                    className="flex-1 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={18} />
                    <span>Send Back</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Review Plans" showBack>
      <div className="p-4 space-y-4">
        {pendingPlans.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No plans pending approval</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {pendingPlans.length} plan(s) awaiting review
            </p>
            {pendingPlans.map(plan => (
              <button
                key={plan.id}
                onClick={() => handleSelectPlan(plan)}
                className="w-full menu-card text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User size={18} className="text-muted-foreground" />
                    <span className="font-medium">{plan.atdName}</span>
                  </div>
                  <StatusBadge status={plan.status} />
                </div>
                <p className="text-sm text-muted-foreground">
                  Week: {format(parseISO(plan.weekStartDate), 'dd MMM yyyy')}
                </p>
                <p className="text-sm text-muted-foreground">HQ: {plan.hq}</p>
              </button>
            ))}
          </>
        )}

        {/* View All Approved Plans */}
        <div className="mt-6">
          <h3 className="font-medium mb-3">Approved Plans</h3>
          {weeklyPlans.filter(p => p.status === 'approved').map(plan => (
            <button
              key={plan.id}
              onClick={() => handleSelectPlan(plan)}
              className="w-full menu-card text-left mb-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{plan.atdName}</p>
                  <p className="text-xs text-muted-foreground">
                    Week of {format(parseISO(plan.weekStartDate), 'dd MMM')}
                  </p>
                </div>
                <StatusBadge status={plan.status} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}
