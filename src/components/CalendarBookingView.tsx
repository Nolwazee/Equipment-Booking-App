import { useState, useMemo } from 'react';
import { format, isSameDay, parseISO } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CalendarIcon, Clock, MapPin, Monitor, Server, Network, Usb, Beaker, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Equipment } from '@/hooks/useEquipment';
import { Booking } from '@/hooks/useBookings';

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
];

const categoryIcons: Record<string, React.ReactNode> = {
  Computers: <Monitor className="h-5 w-5" />,
  Servers: <Server className="h-5 w-5" />,
  Networking: <Network className="h-5 w-5" />,
  Peripherals: <Usb className="h-5 w-5" />,
};

interface CalendarBookingViewProps {
  equipment: Equipment[];
  bookings: Booking[];
  allBookings: Booking[];
  equipmentLoading: boolean;
  onConfirmBooking: (equipmentId: string, date: Date, startTime: string, endTime: string) => Promise<void>;
}

export function CalendarBookingView({
  equipment,
  bookings,
  allBookings,
  equipmentLoading,
  onConfirmBooking,
}: CalendarBookingViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Get bookings for a given date to determine equipment availability
  const getBookingsForDate = (date: Date) => {
    return allBookings.filter(
      (b) => b.status !== 'cancelled' && isSameDay(parseISO(b.booking_date), date)
    );
  };

  const dateBookings = useMemo(() => getBookingsForDate(selectedDate), [selectedDate, allBookings]);

  // Determine which equipment is available on the selected date
  const availableEquipment = useMemo(() => {
    return equipment.filter((eq) => {
      if (eq.status === 'maintenance') return false;
      // Check if there's a slot free (not booked for every single time slot)
      const eqBookings = dateBookings.filter((b) => b.equipment_id === eq.id);
      // If booked for fewer slots than total, it's available
      return eqBookings.length < timeSlots.length - 1;
    });
  }, [equipment, dateBookings]);

  // Get booked time slots for selected equipment on selected date
  const bookedSlots = useMemo(() => {
    if (!selectedEquipment) return [];
    return dateBookings
      .filter((b) => b.equipment_id === selectedEquipment.id)
      .map((b) => ({ start: b.start_time, end: b.end_time }));
  }, [selectedEquipment, dateBookings]);

  const isSlotBooked = (slot: string) => {
    return bookedSlots.some((b) => slot >= b.start && slot < b.end);
  };

  const availableStartTimes = timeSlots.slice(0, -1).filter((slot) => !isSlotBooked(slot));

  // Fixed 1-hour slots: end time is always startTime + 1 hour
  const getEndTimeForStart = (start: string) => {
    const hour = parseInt(start.split(':')[0], 10) + 1;
    return `${String(hour).padStart(2, '0')}:00`;
  };

  // Dates that have bookings (for calendar dots)
  const datesWithBookings = useMemo(() => {
    return bookings
      .filter((b) => b.status !== 'cancelled')
      .map((b) => parseISO(b.booking_date));
  }, [bookings]);

  const handleEquipmentSelect = (eq: Equipment) => {
    setSelectedEquipment(eq);
    setStartTime('');
    setEndTime('');
  };

  const handleConfirm = async () => {
    if (!selectedEquipment || !startTime || !endTime) return;
    setIsBooking(true);
    try {
      await onConfirmBooking(selectedEquipment.id, selectedDate, startTime, endTime);
      setConfirmDialogOpen(false);
      setSelectedEquipment(null);
      setStartTime('');
      setEndTime('');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar panel */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Select Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(d) => {
              if (d) {
                setSelectedDate(d);
                setSelectedEquipment(null);
                setStartTime('');
                setEndTime('');
              }
            }}
            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0)) || date.getDay() === 0 || date.getDay() === 6}
            className={cn('p-3 pointer-events-auto')}
            modifiers={{ hasBooking: datesWithBookings }}
            modifiersClassNames={{ hasBooking: 'bg-primary/20 font-bold' }}
          />
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-3 h-3 rounded bg-primary/20" />
            <span>You have bookings on this day</span>
          </div>
        </CardContent>
      </Card>

      {/* Available equipment panel */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Beaker className="h-5 w-5 text-primary" />
            Available Equipment on {format(selectedDate, 'EEE, MMM d, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {equipmentLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : availableEquipment.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No equipment available on this date.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableEquipment.map((eq) => {
                const eqBookingsCount = dateBookings.filter(
                  (b) => b.equipment_id === eq.id
                ).length;
                const isSelected = selectedEquipment?.id === eq.id;

                return (
                  <div
                    key={eq.id}
                    onClick={() => handleEquipmentSelect(eq)}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all',
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/40 hover:bg-accent/30'
                    )}
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
                      {categoryIcons[eq.category] || <Monitor className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">{eq.name}</h4>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {eq.location}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {eq.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {eqBookingsCount > 0 ? (
                        <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/20">
                          {eqBookingsCount} booked
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                          Fully open
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Time selection for chosen equipment */}
          {selectedEquipment && (
            <div className="mt-6 p-4 border border-primary/20 rounded-lg bg-accent/20 animate-fade-in">
              <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Select Time for {selectedEquipment.name}
              </h4>

              <div className="space-y-2">
                <Label>Select 1-Hour Time Slot</Label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {availableStartTimes.map((slot) => {
                    const end = getEndTimeForStart(slot);
                    const isSelected = startTime === slot;
                    return (
                      <Button
                        key={slot}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className="text-xs"
                        onClick={() => { setStartTime(slot); setEndTime(end); }}
                      >
                        {slot} - {end}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {startTime && endTime && (
                <Button
                  className="w-full mt-4"
                  onClick={() => setConfirmDialogOpen(true)}
                >
                  Book {selectedEquipment.name} • {startTime} - {endTime}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[400px] animate-scale-in">
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
            <DialogDescription>Review your booking details below.</DialogDescription>
          </DialogHeader>
          {selectedEquipment && (
            <div className="space-y-4 py-2">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="font-medium text-foreground">{selectedEquipment.name}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {selectedEquipment.location}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {startTime} - {endTime}
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setConfirmDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleConfirm} disabled={isBooking}>
                  {isBooking && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Confirm
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
