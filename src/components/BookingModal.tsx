 import { useState } from 'react';
 import { format } from 'date-fns';
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogDescription,
 } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
 import { Calendar } from '@/components/ui/calendar';
 import { Label } from '@/components/ui/label';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 import { CalendarIcon, Clock, MapPin } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 const timeSlots = [
   '08:00', '09:00', '10:00', '11:00', '12:00',
   '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
 ];
 
 interface Equipment {
   id: string;
   name: string;
   location: string;
   status: string;
 }
 
 interface BookingModalProps {
   equipment: Equipment | null;
   open: boolean;
   onOpenChange: (open: boolean) => void;
   onConfirm: (date: Date, startTime: string, endTime: string) => void;
 }
 
 export function BookingModal({
   equipment,
   open,
   onOpenChange,
   onConfirm,
 }: BookingModalProps) {
   const [date, setDate] = useState<Date | undefined>(new Date());
   const [startTime, setStartTime] = useState<string>('');
   const [endTime, setEndTime] = useState<string>('');
 
   const handleConfirm = () => {
     if (date && startTime && endTime) {
       onConfirm(date, startTime, endTime);
       setStartTime('');
       setEndTime('');
     }
   };
 
   const availableEndTimes = timeSlots.filter(
     (slot) => slot > startTime
   );
 
   if (!equipment) return null;
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="sm:max-w-[500px] animate-scale-in">
         <DialogHeader>
           <DialogTitle className="text-xl">Book Equipment</DialogTitle>
           <DialogDescription>
             Select a date and time to book this equipment
           </DialogDescription>
         </DialogHeader>
 
         <div className="space-y-6 py-4">
           <div className="p-4 bg-muted rounded-lg">
             <h4 className="font-medium text-foreground mb-1">{equipment.name}</h4>
             <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
               <MapPin className="h-3.5 w-3.5" />
               <span>{equipment.location}</span>
             </div>
           </div>
 
           <div className="space-y-2">
             <Label className="flex items-center gap-2">
               <CalendarIcon className="h-4 w-4 text-primary" />
               Select Date
             </Label>
             <div className="border rounded-lg p-3">
               <Calendar
                 mode="single"
                 selected={date}
                 onSelect={setDate}
                 disabled={(date) => date < new Date()}
                 className={cn("pointer-events-auto")}
               />
             </div>
           </div>
 
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label className="flex items-center gap-2">
                 <Clock className="h-4 w-4 text-primary" />
                 Start Time
               </Label>
               <Select value={startTime} onValueChange={setStartTime}>
                 <SelectTrigger>
                   <SelectValue placeholder="Select time" />
                 </SelectTrigger>
                 <SelectContent>
                   {timeSlots.slice(0, -1).map((slot) => (
                     <SelectItem key={slot} value={slot}>
                       {slot}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
 
             <div className="space-y-2">
               <Label className="flex items-center gap-2">
                 <Clock className="h-4 w-4 text-primary" />
                 End Time
               </Label>
               <Select
                 value={endTime}
                 onValueChange={setEndTime}
                 disabled={!startTime}
               >
                 <SelectTrigger>
                   <SelectValue placeholder="Select time" />
                 </SelectTrigger>
                 <SelectContent>
                   {availableEndTimes.map((slot) => (
                     <SelectItem key={slot} value={slot}>
                       {slot}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
           </div>
 
           {date && startTime && endTime && (
             <div className="p-4 bg-accent rounded-lg border border-primary/20 animate-fade-in">
               <p className="text-sm font-medium text-accent-foreground">
                 Booking Summary
               </p>
               <p className="text-sm text-muted-foreground mt-1">
                 {format(date, 'EEEE, MMMM d, yyyy')} • {startTime} - {endTime}
               </p>
             </div>
           )}
         </div>
 
         <div className="flex gap-3">
           <Button
             variant="outline"
             className="flex-1"
             onClick={() => onOpenChange(false)}
           >
             Cancel
           </Button>
           <Button
             className="flex-1"
             disabled={!date || !startTime || !endTime}
             onClick={handleConfirm}
           >
             Confirm Booking
           </Button>
         </div>
       </DialogContent>
     </Dialog>
   );
 }