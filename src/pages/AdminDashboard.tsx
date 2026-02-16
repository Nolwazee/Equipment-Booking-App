 import { useState } from 'react';
 import { format } from 'date-fns';
 import { DashboardHeader } from '@/components/DashboardHeader';
 import { useEquipment, Equipment } from '@/hooks/useEquipment';
 import { useBookings, Booking } from '@/hooks/useBookings';
 import { useToast } from '@/hooks/use-toast';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Textarea } from '@/components/ui/textarea';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogDescription,
 } from '@/components/ui/dialog';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from '@/components/ui/table';
 import {
   Settings,
   Plus,
   Edit,
   Trash2,
   Calendar,
   Monitor,
   Loader2,
   Users,
 } from 'lucide-react';
 
 const categories = ['Computers', 'Networking', 'Servers', 'Peripherals', 'Software'];
 const statuses = ['available', 'in-use', 'maintenance'] as const;
 
 export default function AdminDashboard() {
   const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
   const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
   const [formData, setFormData] = useState({
     name: '',
     description: '',
     category: 'Computers',
     location: '',
     status: 'available' as typeof statuses[number],
   });
 
   const { equipment, loading: equipmentLoading, addEquipment, updateEquipment, deleteEquipment, refetch } = useEquipment();
   const { bookings, loading: bookingsLoading, deleteBooking } = useBookings(true);
   const { toast } = useToast();
 
   const openAddModal = () => {
     setEditingEquipment(null);
     setFormData({
       name: '',
       description: '',
       category: 'Computers',
       location: '',
       status: 'available',
     });
     setIsEquipmentModalOpen(true);
   };
 
   const openEditModal = (eq: Equipment) => {
     setEditingEquipment(eq);
     setFormData({
       name: eq.name,
       description: eq.description || '',
       category: eq.category,
       location: eq.location,
       status: eq.status,
     });
     setIsEquipmentModalOpen(true);
   };
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     
     try {
       if (editingEquipment) {
         await updateEquipment(editingEquipment.id, formData);
         toast({ title: 'Equipment Updated', description: 'Equipment has been updated successfully.' });
       } else {
         await addEquipment(formData);
         toast({ title: 'Equipment Added', description: 'New equipment has been added.' });
       }
       setIsEquipmentModalOpen(false);
     } catch (error) {
       toast({ title: 'Error', description: 'Failed to save equipment.', variant: 'destructive' });
     }
   };
 
   const handleDelete = async (id: string) => {
     if (!confirm('Are you sure you want to delete this equipment?')) return;
     
     try {
       await deleteEquipment(id);
       toast({ title: 'Equipment Deleted', description: 'Equipment has been removed.' });
     } catch (error) {
       toast({ title: 'Error', description: 'Failed to delete equipment.', variant: 'destructive' });
     }
   };
 
   const handleDeleteBooking = async (id: string) => {
     if (!confirm('Are you sure you want to delete this booking?')) return;
     
     try {
       await deleteBooking(id);
       toast({ title: 'Booking Deleted', description: 'Booking has been removed.' });
     } catch (error) {
       toast({ title: 'Error', description: 'Failed to delete booking.', variant: 'destructive' });
     }
   };
 
   const statusConfig = {
     available: { label: 'Available', className: 'bg-success/10 text-success' },
     'in-use': { label: 'In Use', className: 'bg-warning/10 text-warning' },
     maintenance: { label: 'Maintenance', className: 'bg-destructive/10 text-destructive' },
   };
 
   const bookingStatusConfig = {
     confirmed: { label: 'Confirmed', className: 'bg-success/10 text-success' },
     pending: { label: 'Pending', className: 'bg-warning/10 text-warning' },
     cancelled: { label: 'Cancelled', className: 'bg-muted text-muted-foreground' },
   };
 
   return (
     <div className="min-h-screen bg-background">
       <DashboardHeader />
 
       <main className="container mx-auto px-4 py-8">
         <div className="mb-8 animate-slide-up">
           <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-primary/10 rounded-lg">
               <Settings className="h-6 w-6 text-primary" />
             </div>
             <h2 className="text-3xl font-bold text-foreground">Admin Panel</h2>
           </div>
           <p className="text-muted-foreground">Manage lab equipment and view all bookings</p>
         </div>
 
         <Tabs defaultValue="equipment" className="space-y-6">
           <TabsList>
             <TabsTrigger value="equipment" className="gap-2">
               <Monitor className="h-4 w-4" />
               Equipment
             </TabsTrigger>
             <TabsTrigger value="bookings" className="gap-2">
               <Calendar className="h-4 w-4" />
               All Bookings
             </TabsTrigger>
           </TabsList>
 
           <TabsContent value="equipment" className="space-y-6">
             <div className="flex justify-between items-center">
               <div className="flex items-center gap-4">
                 <Badge variant="secondary">{equipment.length} items</Badge>
               </div>
               <Button onClick={openAddModal} className="gap-2">
                 <Plus className="h-4 w-4" />
                 Add Equipment
               </Button>
             </div>
 
             {equipmentLoading ? (
               <div className="flex justify-center py-12">
                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
               </div>
             ) : (
               <Card>
                 <Table>
                   <TableHeader>
                     <TableRow>
                       <TableHead>Name</TableHead>
                       <TableHead>Category</TableHead>
                       <TableHead>Location</TableHead>
                       <TableHead>Status</TableHead>
                       <TableHead className="text-right">Actions</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {equipment.map((eq) => (
                       <TableRow key={eq.id}>
                         <TableCell className="font-medium">{eq.name}</TableCell>
                         <TableCell>{eq.category}</TableCell>
                         <TableCell>{eq.location}</TableCell>
                         <TableCell>
                           <Badge className={statusConfig[eq.status].className}>
                             {statusConfig[eq.status].label}
                           </Badge>
                         </TableCell>
                         <TableCell className="text-right">
                           <Button
                             variant="ghost"
                             size="icon"
                             onClick={() => openEditModal(eq)}
                           >
                             <Edit className="h-4 w-4" />
                           </Button>
                           <Button
                             variant="ghost"
                             size="icon"
                             onClick={() => handleDelete(eq.id)}
                           >
                             <Trash2 className="h-4 w-4 text-destructive" />
                           </Button>
                         </TableCell>
                       </TableRow>
                     ))}
                     {equipment.length === 0 && (
                       <TableRow>
                         <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                           No equipment added yet. Click "Add Equipment" to get started.
                         </TableCell>
                       </TableRow>
                     )}
                   </TableBody>
                 </Table>
               </Card>
             )}
           </TabsContent>
 
           <TabsContent value="bookings" className="space-y-6">
             <div className="flex items-center gap-4">
               <Badge variant="secondary">{bookings.length} bookings</Badge>
             </div>
 
             {bookingsLoading ? (
               <div className="flex justify-center py-12">
                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
               </div>
             ) : (
               <Card>
                 <Table>
                   <TableHeader>
                     <TableRow>
                       <TableHead>Equipment</TableHead>
                       <TableHead>Date</TableHead>
                       <TableHead>Time</TableHead>
                       <TableHead>Status</TableHead>
                       <TableHead className="text-right">Actions</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {bookings.map((booking) => (
                       <TableRow key={booking.id}>
                         <TableCell className="font-medium">
                           {booking.equipment?.name || 'Unknown'}
                         </TableCell>
                         <TableCell>
                           {format(new Date(booking.booking_date), 'MMM d, yyyy')}
                         </TableCell>
                         <TableCell>
                           {booking.start_time} - {booking.end_time}
                         </TableCell>
                         <TableCell>
                           <Badge className={bookingStatusConfig[booking.status].className}>
                             {bookingStatusConfig[booking.status].label}
                           </Badge>
                         </TableCell>
                         <TableCell className="text-right">
                           <Button
                             variant="ghost"
                             size="icon"
                             onClick={() => handleDeleteBooking(booking.id)}
                           >
                             <Trash2 className="h-4 w-4 text-destructive" />
                           </Button>
                         </TableCell>
                       </TableRow>
                     ))}
                     {bookings.length === 0 && (
                       <TableRow>
                         <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                           No bookings yet.
                         </TableCell>
                       </TableRow>
                     )}
                   </TableBody>
                 </Table>
               </Card>
             )}
           </TabsContent>
         </Tabs>
       </main>
 
       {/* Equipment Modal */}
       <Dialog open={isEquipmentModalOpen} onOpenChange={setIsEquipmentModalOpen}>
         <DialogContent className="sm:max-w-[500px]">
           <DialogHeader>
             <DialogTitle>
               {editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}
             </DialogTitle>
             <DialogDescription>
               {editingEquipment
                 ? 'Update the equipment details'
                 : 'Add a new piece of equipment to the lab'}
             </DialogDescription>
           </DialogHeader>
 
           <form onSubmit={handleSubmit} className="space-y-4">
             <div className="space-y-2">
               <Label htmlFor="name">Name</Label>
               <Input
                 id="name"
                 value={formData.name}
                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                 placeholder="e.g., Dell OptiPlex 7090"
                 required
               />
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="description">Description</Label>
               <Textarea
                 id="description"
                 value={formData.description}
                 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                 placeholder="Brief description of the equipment"
               />
             </div>
 
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label>Category</Label>
                 <Select
                   value={formData.category}
                   onValueChange={(value) => setFormData({ ...formData, category: value })}
                 >
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     {categories.map((cat) => (
                       <SelectItem key={cat} value={cat}>
                         {cat}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
 
               <div className="space-y-2">
                 <Label>Status</Label>
                 <Select
                   value={formData.status}
                   onValueChange={(value) =>
                     setFormData({ ...formData, status: value as typeof statuses[number] })
                   }
                 >
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     {statuses.map((status) => (
                       <SelectItem key={status} value={status}>
                         {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="location">Location</Label>
               <Input
                 id="location"
                 value={formData.location}
                 onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                 placeholder="e.g., Lab A - Room 101"
                 required
               />
             </div>
 
             <div className="flex gap-3 pt-4">
               <Button
                 type="button"
                 variant="outline"
                 className="flex-1"
                 onClick={() => setIsEquipmentModalOpen(false)}
               >
                 Cancel
               </Button>
               <Button type="submit" className="flex-1">
                 {editingEquipment ? 'Update' : 'Add'} Equipment
               </Button>
             </div>
           </form>
         </DialogContent>
       </Dialog>
     </div>
   );
 }