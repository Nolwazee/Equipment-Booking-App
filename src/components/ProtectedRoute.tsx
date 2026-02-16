 import { Navigate } from 'react-router-dom';
 import { useAuth } from '@/hooks/useAuth';
 import { Loader2 } from 'lucide-react';
 
 interface ProtectedRouteProps {
   children: React.ReactNode;
   requireAdmin?: boolean;
 }
 
 export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
   const { user, role, loading } = useAuth();
 
   if (loading) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-background">
         <div className="text-center">
           <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
           <p className="text-muted-foreground">Loading...</p>
         </div>
       </div>
     );
   }
 
   if (!user) {
     return <Navigate to="/auth" replace />;
   }
 
   if (requireAdmin && role !== 'admin') {
     return <Navigate to="/" replace />;
   }
 
   return <>{children}</>;
 }