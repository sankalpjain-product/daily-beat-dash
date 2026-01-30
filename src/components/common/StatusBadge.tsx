import { PlanStatus, STATUS_LABELS } from '@/types/beatPlan';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: PlanStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  
  const statusClasses: Record<PlanStatus, string> = {
    draft: 'bg-muted text-muted-foreground',
    pending_approval: 'bg-warning text-warning-foreground',
    approved: 'bg-success text-success-foreground',
    sent_back: 'bg-destructive text-destructive-foreground',
    re_approval_required: 'bg-info text-info-foreground',
  };

  return (
    <span className={cn(baseClasses, statusClasses[status], className)}>
      {STATUS_LABELS[status]}
    </span>
  );
}
