import { useState } from 'react';
import { format } from 'date-fns';
import { DashboardHeader } from '@/components/DashboardHeader';
import { CalendarBookingView } from '@/components/CalendarBookingView';
import { BookingCountdown } from '@/components/BookingCountdown';
import { useEquipment } from '@/hooks/useEquipment';
import { useBookings } from '@/hooks/useBookings';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Beaker, Calendar, CalendarCheck, Clock, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StudentDashboard() {
  const { equipment, loading: equipmentLoading } = useEquipment();
  const { bookings, loading: bookingsLoading, createBooking, cancelBooking } = useBookings();
  const { toast } = useToast();

  const handleConfirmBooking = async (equipmentId: string, date: Date, startTime: string, endTime: string) => {
    try {
      await createBooking({
        equipment_id: equipmentId,
        booking_date: format(date, 'yyyy-MM-dd'),
        start_time: startTime,
        end_time: endTime,
      });

      const eq = equipment.find((e) => e.id === equipmentId);
      toast({
        title: 'Booking Confirmed!',
        description: `${eq?.name || 'Equipment'} booked for ${format(date, 'MMM d')} • ${startTime} - ${endTime}`,
      });
    } catch {
      toast({
        title: 'Booking Failed',
        description: 'Unable to create booking. Please try again.',
        variant: 'destructive',
      });
      throw new Error('Booking failed');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await cancelBooking(bookingId);
      toast({ title: 'Booking Cancelled', description: 'Your booking has been cancelled.' });
    } catch {
      toast({ title: 'Error', description: 'Unable to cancel booking.', variant: 'destructive' });
    }
  };

  const statusConfig = {
    confirmed: { label: 'Confirmed', className: 'bg-success/10 text-success border-success/20' },
    pending: { label: 'Pending', className: 'bg-warning/10 text-warning border-warning/20' },
    cancelled: { label: 'Cancelled', className: 'bg-muted text-muted-foreground' },
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Active session timers at top */}
        {!bookingsLoading && bookings.length > 0 && (
          <div className="mb-8">
            <BookingCountdown bookings={bookings} />
          </div>
        )}

        <Tabs defaultValue="book" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="book" className="gap-2">
              <Calendar className="h-4 w-4" />
              Book Equipment
            </TabsTrigger>
            <TabsTrigger value="bookings" className="gap-2">
              <CalendarCheck className="h-4 w-4" />
              My Bookings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="book" className="space-y-6">
            <div className="text-center py-4 animate-slide-up">
              <h2 className="text-2xl font-bold text-foreground mb-2">Book Lab Equipment</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Pick a date on the calendar to see available equipment and time slots.
              </p>
            </div>

            <CalendarBookingView
              equipment={equipment}
              bookings={bookings}
              allBookings={bookings}
              equipmentLoading={equipmentLoading}
              onConfirmBooking={handleConfirmBooking}
            />
          </TabsContent>

          <TabsContent value="bookings" className="max-w-3xl mx-auto space-y-8">
            <div className="text-center py-4 animate-slide-up">
              <h2 className="text-2xl font-bold text-foreground mb-2">My Bookings</h2>
              <p className="text-muted-foreground">View and manage your equipment reservations</p>
            </div>

            {bookingsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16 animate-fade-in">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No bookings yet</h3>
                <p className="text-muted-foreground">
                  Start by picking a date and booking equipment
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking, index) => {
                  const status = statusConfig[booking.status];
                  const isPast = new Date(booking.booking_date) < new Date(new Date().setHours(0, 0, 0, 0));

                  return (
                    <Card
                      key={booking.id}
                      className={cn('animate-slide-up overflow-hidden', isPast && 'opacity-60')}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <CardContent className="p-0">
                        <div className="flex">
                          <div className="w-2 bg-primary" />
                          <div className="flex-1 p-5">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Beaker className="h-4 w-4 text-primary" />
                                  <h4 className="font-semibold text-foreground">
                                    {booking.equipment?.name || 'Equipment'}
                                  </h4>
                                  <Badge variant="outline" className={status.className}>
                                    {status.label}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {format(new Date(booking.booking_date), 'EEE, MMM d, yyyy')}
                                  </span>
                                  <span className="flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5" />
                                    {booking.start_time} - {booking.end_time}
                                  </span>
                                </div>
                              </div>
                              {booking.status !== 'cancelled' && !isPast && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-muted-foreground hover:text-destructive"
                                  onClick={() => handleCancelBooking(booking.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
