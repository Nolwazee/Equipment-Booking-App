import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Monitor, Server, Network, Usb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Equipment {
  id: string;
  name: string;
  description: string | null;
  category: string;
  location: string;
  status: 'available' | 'in-use' | 'maintenance';
  image_url: string | null;
}

interface EquipmentCardProps {
  equipment: Equipment;
  onBook: () => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  Computers: <Monitor className="h-12 w-12" />,
  Servers: <Server className="h-12 w-12" />,
  Networking: <Network className="h-12 w-12" />,
  Peripherals: <Usb className="h-12 w-12" />,
};

export function EquipmentCard({ equipment, onBook }: EquipmentCardProps) {
   const statusConfig = {
     available: { label: 'Available', className: 'bg-success/10 text-success border-success/20' },
     'in-use': { label: 'In Use', className: 'bg-warning/10 text-warning border-warning/20' },
     maintenance: { label: 'Maintenance', className: 'bg-destructive/10 text-destructive border-destructive/20' },
   };
 
   const status = statusConfig[equipment.status];
 
   return (
     <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 animate-fade-in">
      <div className="aspect-[4/3] bg-muted relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/20 flex items-center justify-center text-primary/30">
          {categoryIcons[equipment.category] || <Monitor className="h-12 w-12" />}
        </div>
         <Badge
           variant="outline"
           className={cn('absolute top-3 right-3', status.className)}
         >
           {status.label}
         </Badge>
       </div>
       <CardContent className="p-5">
         <div className="mb-2">
           <Badge variant="secondary" className="text-xs">
             {equipment.category}
           </Badge>
         </div>
        <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-1" title={equipment.name}>
           {equipment.name}
         </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {equipment.description || 'No description available'}
         </p>
         <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
           <MapPin className="h-3.5 w-3.5" />
           <span>{equipment.location}</span>
         </div>
       </CardContent>
       <CardFooter className="p-5 pt-0">
         <Button
          className="w-full gap-2"
          disabled={equipment.status !== 'available'}
          onClick={onBook}
        >
           <Calendar className="h-4 w-4" />
           {equipment.status === 'available' ? 'Book Now' : 'Unavailable'}
         </Button>
       </CardFooter>
     </Card>
   );
 }