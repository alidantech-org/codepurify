'use client';

import { ComponentProps, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Armchair, CreditCard, Info, Monitor, Package, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IEvent, IPool } from '@/server/types/entities/event';
import { updatePool, createPool } from '@/server/resources/event/pool';
import { EPoolType, ETimeAnchor, ETimeAnchorRelation, ETimeExpressionKind, ETimeWindowType } from '@/server/types/enums/event.enums';
import { ITimeWindowFormValue, TimeWindowForm } from './time-window-form';
import CreateButton from '@/components/_core/create-button';
import { DialogFormShell } from '@/components/_core/dialog-form-shell';
import { useDialogAction } from '@/lib/hooks/use-dialog-action';
import PoolTypeField, { getAllowedPoolTypes } from './pool-form/pool-type-field';

interface PoolDialogFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  pool?: IPool;
  event: IEvent;
  isEdit?: boolean;
  onRequireRebuild: () => void;
}

const POOL_TYPE_LABELS: Record<EPoolType, string> = {
  [EPoolType.ENTRANCE]: 'General Admission',
  [EPoolType.RESERVED]: 'Reserved Seating',
  [EPoolType.ADDON]: 'Add-on Product',
  [EPoolType.BUNDLE]: 'Ticket Bundle',
  [EPoolType.VIRTUAL]: 'Virtual Access',
};

const getPoolTypeInfo = (poolType: EPoolType) => {
  switch (poolType) {
    case EPoolType.RESERVED:
      return {
        icon: Armchair,
        color: 'bg-slate-100 text-slate-800',
        description: 'Assigned seating inventory linked to the event seating arrangement.',
      };

    case EPoolType.ENTRANCE:
      return {
        icon: Users,
        color: 'bg-blue-100 text-blue-800',
        description: 'General admission or standing-area access without assigned seats.',
      };

    case EPoolType.ADDON:
      return {
        icon: Package,
        color: 'bg-green-100 text-green-800',
        description: 'Supplementary product or service that does not grant core event admission.',
      };

    case EPoolType.BUNDLE:
      return {
        icon: CreditCard,
        color: 'bg-purple-100 text-purple-800',
        description: 'A packaged pool that combines tickets, add-ons, or other inventory.',
      };

    case EPoolType.VIRTUAL:
      return {
        icon: Monitor,
        color: 'bg-orange-100 text-orange-800',
        description: 'Online or livestream access to the event.',
      };
  }
};

export default function PoolDialogForm(props: PoolDialogFormProps) {
  const allowedPoolTypes = useMemo(() => getAllowedPoolTypes(props.event.type), [props.event.type]);

  const initialType = useMemo<EPoolType>(() => {
    if (props.pool?.type && allowedPoolTypes.includes(props.pool.type)) {
      return props.pool.type;
    }

    return allowedPoolTypes[0] ?? EPoolType.ENTRANCE;
  }, [allowedPoolTypes, props.pool?.type]);

  const defaultTitle = POOL_TYPE_LABELS[initialType];

  const [type, setType] = useState<EPoolType>(initialType);

  const [title, setTitle] = useState(props.pool?.title || defaultTitle);

  /**
   * Tracks whether the title is now user-owned.
   *
   * While false:
   * - title follows the selected pool type automatically.
   *
   * Once true:
   * - title becomes final/manual.
   * - pool type changes must never overwrite it.
   */
  const [hasCustomTitle, setHasCustomTitle] = useState(Boolean(props.pool?.title));

  /**
   * Keep capacity empty by default on create.
   *
   * This is intentionally a string because an empty number input cannot be represented
   * cleanly with a number state.
   */
  const [capacity, setCapacity] = useState<string>(props.pool?.capacity != null ? String(props.pool.capacity) : '');

  const [timeWindow, setTimeWindow] = useState<ITimeWindowFormValue>(
    props.pool?.timeWindow ?? {
      fromKind: ETimeExpressionKind.IMMEDIATE,
      fromAnchor: ETimeAnchor.EVENT_START,
      fromRelation: ETimeAnchorRelation.WHEN,

      untilKind: ETimeExpressionKind.IMMEDIATE,
      untilAnchor: ETimeAnchor.EVENT_END,
      untilRelation: ETimeAnchorRelation.WHEN,
    },
  );

  const { action, isPending } = useDialogAction(props.isEdit ? updatePool : createPool, {
    isOpen: props.isOpen,
    onOpenChange: props.onOpenChange,
    onSuccess: props.onRequireRebuild,
  });

  useEffect(() => {
    setType(initialType);

    if (!hasCustomTitle) {
      setTitle(POOL_TYPE_LABELS[initialType]);
    }
  }, [initialType, hasCustomTitle]);

  useEffect(() => {
    if (!hasCustomTitle) {
      setTitle(POOL_TYPE_LABELS[type]);
    }
  }, [type, hasCustomTitle]);

  const handleTitleChange = (nextTitle: string) => {
    setTitle(nextTitle);
    setHasCustomTitle(true);
  };

  const maxCapacity = props.event.maxCapacity;

  const handleCapacityChange = (nextValue: string) => {
    if (nextValue === '') {
      setCapacity('');
      return;
    }

    const parsedValue = Number(nextValue);

    if (!Number.isFinite(parsedValue)) {
      return;
    }

    const normalizedValue = Math.max(0, Math.floor(parsedValue));
    const cappedValue = typeof maxCapacity === 'number' ? Math.min(normalizedValue, maxCapacity) : normalizedValue;

    setCapacity(String(cappedValue));
  };

  const TypeInfo = getPoolTypeInfo(type);

  const eventDates = { startAt: new Date(props.event.startAt), endAt: new Date(props.event.endAt) };

  return (
    <DialogFormShell
      open={props.isOpen}
      onOpenChange={props.onOpenChange}
      action={action}
      title={props.isEdit ? 'Edit Pool' : 'Create Pool'}
      description={TypeInfo.description}
      icon={<TypeInfo.icon className="h-5 w-5" />}
      iconClassName={cn(TypeInfo.color)}
      maxWidth="max-w-3xl"
      isPending={isPending}
      submitText={props.isEdit ? 'Update Pool' : 'Create Pool'}
      pendingText="Saving..."
    >
      <input type="hidden" name="eventId" value={props.event.id} />
      <input type="hidden" name="id" value={props.pool?.id ?? ''} />
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="timeWindow" value={JSON.stringify(timeWindow)} />

      <div className="h-full overflow-y-auto">
        <div className="space-y-6 py-4">
          <div className="space-y-4 px-3 md:px-6">
            <h3 className="text-lg font-semibold">Basic Information</h3>

            <PoolTypeField
              eventType={props.event.type}
              value={type}
              onValueChange={setType}
              required
              disabled={isPending || props.isEdit}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Pool Name</Label>
                <Input
                  id="title"
                  name="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder={POOL_TYPE_LABELS[type]}
                  disabled={isPending}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {!hasCustomTitle
                    ? 'This name follows the selected pool type until you edit it.'
                    : 'Custom name set. Changing pool type will not overwrite it.'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  value={capacity}
                  onChange={(e) => handleCapacityChange(e.target.value)}
                  placeholder="Enter capacity"
                  disabled={isPending}
                  required
                  min="0"
                  max={typeof maxCapacity === 'number' ? maxCapacity : undefined}
                />

                <p className="text-xs text-muted-foreground">
                  {typeof maxCapacity === 'number'
                    ? `Capacity cannot be greater than the event max capacity of ${maxCapacity}.`
                    : 'Enter the total number of privileges available for this pool.'}
                </p>

                {/* 
                  Capacity control will become more complex later:
                  - RESERVED pools should be controlled by assigned seats from the seating arrangement.
                  - ENTRANCE pools may consume from event-level remaining capacity.
                  - ADDON pools may use independent stock capacity and may not consume event attendance capacity.
                  - VIRTUAL pools may be fixed, high-limit, or effectively unlimited.
                  - BUNDLE pools should derive availability from the minimum available capacity of their component pools.
                  - Event maxCapacity is only the first basic guard here, not the final inventory engine.
                */}
              </div>
            </div>
          </div>

          <Separator />

          <TimeWindowForm
            windowType={ETimeWindowType.VALIDITY}
            eventDates={eventDates}
            initialValue={props.pool?.timeWindow ?? timeWindow}
            onChange={setTimeWindow}
            inputName="timeWindow"
          />

          {/* <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This form only applies a basic event max-capacity check for now. Full capacity control will later need pool-aware inventory
              rules: reserved pools should be driven by assigned seating, entrance pools may need to respect remaining event capacity,
              add-ons may use independent stock, virtual access may be fixed or unlimited, and bundles should be calculated from their
              component pools.
            </AlertDescription>
          </Alert> */}
        </div>
      </div>
    </DialogFormShell>
  );
}

interface PoolDialogButtonProps extends ComponentProps<typeof Button> {
  event: IEvent;
  onPoolCreated?: () => void;
}

export function PoolDialogButton({ event, onPoolCreated, onClick, children, ...buttonProps }: PoolDialogButtonProps) {
  const [open, setOpen] = useState(false);

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    setOpen(true);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  const handleRequireRebuild = () => {
    setOpen(false);
    onPoolCreated?.();
  };

  return (
    <>
      <CreateButton text="Create Pool" type="button" onClick={handleButtonClick} {...buttonProps} />
      <PoolDialogForm isOpen={open} onOpenChange={handleOpenChange} event={event} isEdit={false} onRequireRebuild={handleRequireRebuild} />
    </>
  );
}

export function PoolDialogLinkButton({ event, onPoolCreated, onClick, children, ...buttonProps }: PoolDialogButtonProps) {
  const [open, setOpen] = useState(false);

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    setOpen(true);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  const handleRequireRebuild = () => {
    setOpen(false);
    onPoolCreated?.();
  };

  return (
    <>
      <span
        className="cursor-pointer font-medium text-primary hover:underline"
        onClick={handleButtonClick}
        role="button"
      >
        Create a new pool
      </span>
      <PoolDialogForm isOpen={open} onOpenChange={handleOpenChange} event={event} isEdit={false} onRequireRebuild={handleRequireRebuild} />
    </>
  );
}
