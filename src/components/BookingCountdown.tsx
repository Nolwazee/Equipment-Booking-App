import { useState, useEffect, useCallback } from 'react';
import { differenceInSeconds, parseISO, isToday, isAfter } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Timer, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  equipment?: {
    name: string;
    location: string;
  };
}

interface BookingCountdownProps {
  bookings: Booking[];
}

interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
}

type CountdownState = 'upcoming' | 'active' | 'ending_soon' | 'ended';

function formatTimeRemaining(seconds: number): TimeRemaining {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return { hours, minutes, seconds: secs };
}

function TimeDisplay({ time, label, urgent }: { time: number; label: string; urgent?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <span className={cn(
        "text-3xl font-bold tabular-nums",
        urgent ? "text-destructive animate-pulse" : "text-foreground"
      )}>
        {String(time).padStart(2, '0')}
      </span>
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  );
}

function playAlarm() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    // Play 3 beeps
    [0, 0.3, 0.6].forEach((delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'square';
      gain.gain.value = 0.3;
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.2);
    });
    // Vibrate if supported
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
  } catch {
    // Audio not supported
  }
}

function CountdownTimer({ booking }: { booking: Booking }) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
  const [state, setState] = useState<CountdownState>('upcoming');
  const [reminderShown, setReminderShown] = useState(false);
  const [endReminderShown, setEndReminderShown] = useState(false);
  const { toast } = useToast();

  const showReminder = useCallback((title: string, description: string, variant?: 'default' | 'destructive') => {
    toast({ title, description, variant });
  }, [toast]);

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const bookingDate = parseISO(booking.booking_date);

      const [startHour, startMin] = booking.start_time.split(':').map(Number);
      const [endHour, endMin] = booking.end_time.split(':').map(Number);

      const startDateTime = new Date(bookingDate);
      startDateTime.setHours(startHour, startMin, 0, 0);

      const endDateTime = new Date(bookingDate);
      endDateTime.setHours(endHour, endMin, 0, 0);

      if (isAfter(now, endDateTime)) {
        setState('ended');
        setTimeRemaining(null);
        if (!endReminderShown) {
          setEndReminderShown(true);
          playAlarm();
          showReminder(
            '⏰ Time\'s Up!',
            `Your session with ${booking.equipment?.name || 'equipment'} has ended. Please return the equipment.`,
            'destructive'
          );
        }
        return;
      }

      if (isAfter(now, startDateTime)) {
        const secondsLeft = differenceInSeconds(endDateTime, now);
        const totalRemaining = Math.max(0, secondsLeft);

        // Show reminder when 5 minutes left
        if (totalRemaining <= 300 && totalRemaining > 0) {
          setState('ending_soon');
          if (!reminderShown) {
            setReminderShown(true);
            showReminder(
              '⚠️ 5 Minutes Remaining!',
              `Your session with ${booking.equipment?.name || 'equipment'} ends soon. Please wrap up.`,
              'destructive'
            );
          }
        } else {
          setState('active');
        }

        setTimeRemaining(formatTimeRemaining(totalRemaining));
      } else {
        setState('upcoming');
        const secondsLeft = differenceInSeconds(startDateTime, now);
        setTimeRemaining(formatTimeRemaining(Math.max(0, secondsLeft)));
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [booking, reminderShown, endReminderShown, showReminder]);

  if (state === 'ended') {
    return (
      <Card className="overflow-hidden border-muted bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-muted-foreground">
                {booking.equipment?.name || 'Equipment'}
              </span>
            </div>
            <Badge variant="outline" className="bg-muted text-muted-foreground">
              Session Ended
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Please return the equipment if you haven't already.
          </p>
        </CardContent>
      </Card>
    );
  }

  const stateConfig = {
    upcoming: {
      icon: Clock,
      label: 'Starts in',
      className: 'border-primary/30 bg-primary/5',
      badgeClass: 'bg-primary/10 text-primary border-primary/20',
      badgeLabel: 'Upcoming',
    },
    active: {
      icon: Timer,
      label: 'Time remaining',
      className: 'border-success/30 bg-success/5',
      badgeClass: 'bg-success/10 text-success border-success/20',
      badgeLabel: 'In Progress',
    },
    ending_soon: {
      icon: AlertTriangle,
      label: 'Time remaining',
      className: 'border-destructive/30 bg-destructive/5',
      badgeClass: 'bg-destructive/10 text-destructive border-destructive/20',
      badgeLabel: 'Ending Soon!',
    },
    ended: {
      icon: CheckCircle,
      label: 'Completed',
      className: 'border-muted bg-muted/50',
      badgeClass: 'bg-muted text-muted-foreground',
      badgeLabel: 'Ended',
    },
  };

  const config = stateConfig[state];
  const Icon = config.icon;
  const isUrgent = state === 'ending_soon';

  return (
    <Card className={cn('overflow-hidden transition-all', config.className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className={cn("h-4 w-4", isUrgent ? "text-destructive" : "text-primary")} />
            <span className="font-medium text-foreground">
              {booking.equipment?.name || 'Equipment'}
            </span>
          </div>
          <Badge variant="outline" className={config.badgeClass}>
            {config.badgeLabel}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground mb-3">
          {booking.equipment?.location} • {booking.start_time} - {booking.end_time}
        </p>

        {timeRemaining && (
          <div className={cn("rounded-lg p-4", isUrgent ? "bg-destructive/5" : "bg-background/50")}>
            <p className="text-xs text-muted-foreground text-center mb-2">{config.label}</p>
            <div className="flex items-center justify-center gap-4">
              <TimeDisplay time={timeRemaining.hours} label="hrs" urgent={isUrgent} />
              <span className="text-2xl font-light text-muted-foreground">:</span>
              <TimeDisplay time={timeRemaining.minutes} label="min" urgent={isUrgent} />
              <span className="text-2xl font-light text-muted-foreground">:</span>
              <TimeDisplay time={timeRemaining.seconds} label="sec" urgent={isUrgent} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function BookingCountdown({ bookings }: BookingCountdownProps) {
  const todaysBookings = bookings.filter((booking) => {
    if (booking.status === 'cancelled') return false;
    const bookingDate = parseISO(booking.booking_date);
    if (!isToday(bookingDate)) return false;
    return true; // Show even ended ones with the "ended" state
  });

  if (todaysBookings.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Timer className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Today's Sessions</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {todaysBookings.map((booking) => (
          <CountdownTimer key={booking.id} booking={booking} />
        ))}
      </div>
    </div>
  );
}
