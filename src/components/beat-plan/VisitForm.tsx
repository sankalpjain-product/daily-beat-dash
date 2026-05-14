import { useState } from 'react';
import {
  Visit,
  MOCK_CLUSTERS,
  MOCK_AGENTS,
  TIME_SLOTS,
  VisitPurpose,
  VISIT_PURPOSE_LABELS,
  Cluster,
  Agent,
  TimeSlot,
} from '@/types/beatPlan';
import { Trash2, Check, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface VisitFormProps {
  visit?: Visit;
  onSave: (visit: Visit, notes?: string) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

const TIME_SLOT_OPTIONS = [
  ...TIME_SLOTS.map((s) => ({ value: `${s.start}-${s.end}`, label: s.label, slot: { start: s.start, end: s.end } as TimeSlot })),
  { value: 'full_day', label: 'Full Day', slot: { start: '09:00', end: '18:00' } as TimeSlot },
  { value: 'custom', label: 'Custom', slot: undefined as TimeSlot | undefined },
];

const OTHER_CLUSTER_ID = '__other__';

export function VisitForm({ visit, onSave, onDelete, onCancel }: VisitFormProps) {
  const initialIsOtherCluster =
    !!visit?.cluster && !MOCK_CLUSTERS.find((c) => c.id === visit.cluster!.id);

  const [selectedCluster, setSelectedCluster] = useState<Cluster | undefined>(
    initialIsOtherCluster ? undefined : visit?.cluster
  );
  const [isOtherCluster, setIsOtherCluster] = useState(initialIsOtherCluster);
  const [otherClusterText, setOtherClusterText] = useState(
    initialIsOtherCluster ? visit!.cluster!.name : ''
  );

  const [selectedAgents, setSelectedAgents] = useState<Agent[]>(visit?.agents || []);
  const [selectedPurposes, setSelectedPurposes] = useState<VisitPurpose[]>(visit?.purposes || []);
  const [otherPurposeText, setOtherPurposeText] = useState(visit?.otherPurposeText || '');

  const initialTimeMatchesPreset = visit?.timeSlot
    ? TIME_SLOT_OPTIONS.some(
        (o) =>
          o.slot &&
          o.slot.start === visit.timeSlot!.start &&
          o.slot.end === visit.timeSlot!.end
      )
    : true;

  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | undefined>(visit?.timeSlot);
  const [isCustomTime, setIsCustomTime] = useState(!!visit?.timeSlot && !initialTimeMatchesPreset);
  const [customStart, setCustomStart] = useState(
    !initialTimeMatchesPreset && visit?.timeSlot ? visit.timeSlot.start : '09:00'
  );
  const [customEnd, setCustomEnd] = useState(
    !initialTimeMatchesPreset && visit?.timeSlot ? visit.timeSlot.end : '18:00'
  );

  const [notes, setNotes] = useState('');
  const [agentsOpen, setAgentsOpen] = useState(false);

  const isEditing = !!visit;

  const toggleAgent = (agent: Agent) => {
    setSelectedAgents((prev) =>
      prev.find((a) => a.id === agent.id)
        ? prev.filter((a) => a.id !== agent.id)
        : [...prev, agent]
    );
  };

  const togglePurpose = (purpose: VisitPurpose) => {
    setSelectedPurposes((prev) =>
      prev.includes(purpose) ? prev.filter((p) => p !== purpose) : [...prev, purpose]
    );
  };

  const handleSave = () => {
    const finalCluster: Cluster | undefined = isOtherCluster
      ? otherClusterText.trim()
        ? { id: `cluster_other_${Date.now()}`, name: otherClusterText.trim() }
        : undefined
      : selectedCluster;

    const finalTimeSlot: TimeSlot | undefined = isCustomTime
      ? { start: customStart, end: customEnd }
      : selectedTimeSlot;

    const newVisit: Visit = {
      id: visit?.id || `visit_${Date.now()}`,
      cluster: finalCluster,
      agents: selectedAgents,
      purposes: selectedPurposes,
      timeSlot: finalTimeSlot,
      checkIn: visit?.checkIn,
      otherPurposeText: selectedPurposes.includes('other') ? otherPurposeText.trim() : undefined,
    };
    onSave(newVisit, notes);
  };

  const canSave =
    (selectedAgents.length > 0 || !!selectedCluster || (isOtherCluster && otherClusterText.trim())) &&
    (!selectedPurposes.includes('other') || otherPurposeText.trim().length > 0);

  const agentsLabel =
    selectedAgents.length === 0
      ? 'Select agents'
      : selectedAgents.length === 1
      ? selectedAgents[0].name
      : `${selectedAgents.length} agents selected`;

  const clusterValue = isOtherCluster ? OTHER_CLUSTER_ID : selectedCluster?.id || '';

  const timeSlotValue = isCustomTime
    ? 'custom'
    : selectedTimeSlot
    ? `${selectedTimeSlot.start}-${selectedTimeSlot.end}`
    : '';

  return (
    <div className="space-y-4">
      {/* Route / Cluster */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Route / Cluster</label>
        <Select
          value={clusterValue}
          onValueChange={(id) => {
            if (id === OTHER_CLUSTER_ID) {
              setIsOtherCluster(true);
              setSelectedCluster(undefined);
            } else {
              setIsOtherCluster(false);
              setSelectedCluster(MOCK_CLUSTERS.find((c) => c.id === id));
            }
          }}
        >
          <SelectTrigger className="bg-card">
            <SelectValue placeholder="Select cluster" />
          </SelectTrigger>
          <SelectContent>
            {MOCK_CLUSTERS.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
            <SelectItem value={OTHER_CLUSTER_ID}>Other…</SelectItem>
          </SelectContent>
        </Select>
        {isOtherCluster && (
          <Input
            value={otherClusterText}
            onChange={(e) => setOtherClusterText(e.target.value)}
            placeholder="Enter cluster / route name"
            className="bg-card"
          />
        )}
        <p className="text-xs text-muted-foreground">
          Select the primary area you will cover
        </p>
      </div>

      {/* Agents multi-select */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Agents to Work With</label>
        <Popover open={agentsOpen} onOpenChange={setAgentsOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center justify-between rounded-md border border-input bg-card px-3 py-2 text-sm"
            >
              <span className={selectedAgents.length === 0 ? 'text-muted-foreground' : ''}>
                {agentsLabel}
              </span>
              <ChevronDown size={16} className="opacity-60" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <div className="max-h-64 overflow-y-auto py-1">
              {MOCK_AGENTS.map((agent) => {
                const checked = !!selectedAgents.find((a) => a.id === agent.id);
                return (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => toggleAgent(agent)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/50 text-left"
                  >
                    <Checkbox checked={checked} className="pointer-events-none" />
                    <div>
                      <div className="text-sm font-medium">{agent.name}</div>
                      <div className="text-xs text-muted-foreground">{agent.id.toUpperCase()}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Purpose */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Purpose of Visit</label>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          {(Object.keys(VISIT_PURPOSE_LABELS) as VisitPurpose[]).map((purpose) => {
            const checked = selectedPurposes.includes(purpose);
            return (
              <button
                key={purpose}
                type="button"
                onClick={() => togglePurpose(purpose)}
                className="flex items-center gap-2 text-left py-1"
              >
                <span
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    checked ? 'bg-secondary border-secondary' : 'border-muted-foreground/40 bg-card'
                  }`}
                >
                  {checked && <Check size={12} className="text-secondary-foreground" />}
                </span>
                <span className="text-sm">{VISIT_PURPOSE_LABELS[purpose]}</span>
              </button>
            );
          })}
        </div>
        {selectedPurposes.includes('other') && (
          <Input
            value={otherPurposeText}
            onChange={(e) => setOtherPurposeText(e.target.value)}
            placeholder="Specify other purpose"
            className="bg-card mt-1"
          />
        )}
      </div>

      {/* Time Slot */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Time Slot</label>
        <Select
          value={timeSlotValue}
          onValueChange={(v) => {
            if (v === 'custom') {
              setIsCustomTime(true);
              setSelectedTimeSlot(undefined);
            } else {
              setIsCustomTime(false);
              const opt = TIME_SLOT_OPTIONS.find((o) => o.value === v);
              setSelectedTimeSlot(opt?.slot);
            }
          }}
        >
          <SelectTrigger className="bg-card">
            <SelectValue placeholder="Select time slot" />
          </SelectTrigger>
          <SelectContent>
            {TIME_SLOT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isCustomTime && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="text-xs text-muted-foreground">Start</label>
              <Input
                type="time"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-card"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">End</label>
              <Input
                type="time"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-card"
              />
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Notes (Optional)</label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value.slice(0, 100))}
          placeholder="Add any additional context (max 100 characters)"
          className="bg-card resize-none"
          rows={2}
        />
        <p className="text-xs text-muted-foreground text-right">{notes.length}/100</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="flex-1 bg-secondary text-secondary-foreground font-medium py-2.5 rounded-md disabled:opacity-50"
        >
          Save Visit
        </button>
        <button
          onClick={onCancel}
          className="px-5 py-2.5 rounded-md border border-input bg-card font-medium"
        >
          Cancel
        </button>
        {isEditing && onDelete && (
          <button
            onClick={onDelete}
            className="p-2.5 rounded-md border border-destructive text-destructive"
            aria-label="Delete visit"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
