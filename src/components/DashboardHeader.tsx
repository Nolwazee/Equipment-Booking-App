 import { useAuth } from '@/hooks/useAuth';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { Beaker, Calendar, Settings, LogOut, User, LayoutDashboard } from 'lucide-react';
 import { useNavigate, useLocation } from 'react-router-dom';
 
 export function DashboardHeader() {
   const { user, role, signOut } = useAuth();
   const navigate = useNavigate();
   const location = useLocation();
 
   const handleSignOut = async () => {
     await signOut();
     navigate('/auth');
   };
 
   const isAdmin = role === 'admin';
   const isOnAdminPage = location.pathname === '/admin';
 
   return (
     <header className="border-b border-border bg-card sticky top-0 z-50">
       <div className="container mx-auto px-4 py-4">
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
             <div className="p-2 bg-primary rounded-lg">
               <Beaker className="h-8 w-8 text-primary-foreground" />
             </div>
             <div>
               <h1 className="text-xl font-bold text-foreground">LabBook</h1>
               <p className="text-xs text-muted-foreground">IT Lab Equipment Booking</p>
             </div>
           </div>
 
           <nav className="flex items-center gap-2">
             {isAdmin && (
               <Button
                 variant={isOnAdminPage ? 'default' : 'ghost'}
                 onClick={() => navigate('/admin')}
                 className="gap-2"
               >
                 <Settings className="h-4 w-4" />
                 Admin Panel
               </Button>
             )}
             {isAdmin && isOnAdminPage && (
               <Button
                 variant="ghost"
                 onClick={() => navigate('/')}
                 className="gap-2"
               >
                 <LayoutDashboard className="h-4 w-4" />
                 Student View
               </Button>
             )}
           </nav>
 
           <div className="flex items-center gap-4">
             <div className="text-right">
               <p className="text-sm font-medium text-foreground">{user?.email}</p>
               <Badge variant={isAdmin ? 'default' : 'secondary'} className="text-xs">
                 {isAdmin ? 'Admin' : 'Student'}
               </Badge>
             </div>
             <Button variant="ghost" size="icon" onClick={handleSignOut}>
               <LogOut className="h-5 w-5" />
             </Button>
           </div>
         </div>
       </div>
     </header>
   );
 }