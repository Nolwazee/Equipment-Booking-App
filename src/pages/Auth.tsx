 import { useState } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { useAuth } from '@/hooks/useAuth';
 import { auth, db } from '@/integrations/firebase/config';
 import { doc, getDoc } from 'firebase/firestore';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { useToast } from '@/hooks/use-toast';
 import { Beaker, LogIn, UserPlus, Loader2 } from 'lucide-react';
 import { z } from 'zod';
 import { DEMO_CREDENTIALS } from '@/lib/credentials';
 
 const emailSchema = z.string().email('Please enter a valid email address');
 const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
 const nameSchema = z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long');
 
 export default function Auth() {
   const [isLoading, setIsLoading] = useState(false);
   const [loginEmail, setLoginEmail] = useState('');
   const [loginPassword, setLoginPassword] = useState('');
   const [signupEmail, setSignupEmail] = useState('');
   const [signupPassword, setSignupPassword] = useState('');
   const [signupName, setSignupName] = useState('');
   const [errors, setErrors] = useState<Record<string, string>>({});
 
   const { signIn, signUp } = useAuth();
   const { toast } = useToast();
   const navigate = useNavigate();
 
   const validateField = (field: string, value: string, schema: z.ZodString) => {
     try {
       schema.parse(value);
       setErrors((prev) => ({ ...prev, [field]: '' }));
       return true;
     } catch (e) {
       if (e instanceof z.ZodError) {
         setErrors((prev) => ({ ...prev, [field]: e.errors[0].message }));
       }
       return false;
     }
   };
 
   const handleLogin = async (e: React.FormEvent) => {
     e.preventDefault();
     
     const emailValid = validateField('loginEmail', loginEmail, emailSchema);
     const passwordValid = validateField('loginPassword', loginPassword, passwordSchema);
     
     if (!emailValid || !passwordValid) return;
 
     setIsLoading(true);
     const { error } = await signIn(loginEmail, loginPassword);
 
     if (error) {
       setIsLoading(false);
       let message = 'An error occurred during login';
       if (error.message.includes('Invalid login credentials')) {
         message = 'Invalid email or password';
       } else if (error.message.includes('Email not confirmed')) {
         message = 'Please verify your email before logging in';
       }
       toast({
         title: 'Login Failed',
         description: message,
         variant: 'destructive',
       });
     } else {
       // Fetch user role to determine redirect destination
       const user = auth.currentUser;
       if (user) {
         try {
           // Check if user is the admin by email
           let role = 'student';
           if (user.email === DEMO_CREDENTIALS.admin.email) {
             role = 'admin';
           } else {
             // Fetch role from Firestore for other users
             const userRoleDoc = await getDoc(doc(db, 'user_roles', user.uid));
             if (userRoleDoc.exists()) {
               role = userRoleDoc.data().role;
             }
           }
           
           toast({
             title: 'Welcome back!',
             description: 'You have successfully logged in.',
           });
           
           // Redirect to admin dashboard if admin, otherwise student dashboard
           if (role === 'admin') {
             navigate('/admin');
           } else {
             navigate('/');
           }
         } catch (err) {
           console.error('Error fetching user role:', err);
           // Default to student dashboard if role fetch fails
           navigate('/');
         }
       } else {
         navigate('/');
       }
       setIsLoading(false);
     }
   };
 
   const handleSignup = async (e: React.FormEvent) => {
     e.preventDefault();
 
     const emailValid = validateField('signupEmail', signupEmail, emailSchema);
     const passwordValid = validateField('signupPassword', signupPassword, passwordSchema);
     const nameValid = validateField('signupName', signupName, nameSchema);
 
     if (!emailValid || !passwordValid || !nameValid) return;
 
     setIsLoading(true);
     const { error } = await signUp(signupEmail, signupPassword, signupName);
     setIsLoading(false);
 
      if (error) {
        let message = 'An error occurred during registration';
        if (error.message.includes('User already registered')) {
          message = 'An account with this email already exists';
        }
        toast({
          title: 'Registration Failed',
          description: message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Account Created!',
          description: 'Welcome to LabBook! You can now start booking equipment.',
        });
        navigate('/');
      }
   };
 
   return (
     <div className="min-h-screen bg-background flex items-center justify-center p-4">
       <div className="w-full max-w-md animate-slide-up">
         <div className="text-center mb-8">
           <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
             <Beaker className="h-8 w-8 text-primary-foreground" />
           </div>
           <h1 className="text-2xl font-bold text-foreground">LabBook</h1>
           <p className="text-muted-foreground">IT Lab Equipment Booking System</p>
         </div>
 
         <Card>
           <Tabs defaultValue="login">
             <CardHeader className="pb-4">
               <TabsList className="grid w-full grid-cols-2">
                 <TabsTrigger value="login" className="gap-2">
                   <LogIn className="h-4 w-4" />
                   Login
                 </TabsTrigger>
                 <TabsTrigger value="signup" className="gap-2">
                   <UserPlus className="h-4 w-4" />
                   Sign Up
                 </TabsTrigger>
               </TabsList>
             </CardHeader>
 
             <CardContent>
               <TabsContent value="login" className="mt-0">
                 <CardTitle className="text-lg mb-1">Welcome Back</CardTitle>
                 <CardDescription className="mb-6">
                   Enter your credentials to access your account
                 </CardDescription>
 
                 <form onSubmit={handleLogin} className="space-y-4">
                   <div className="space-y-2">
                     <Label htmlFor="login-email">Email</Label>
                     <Input
                       id="login-email"
                       type="email"
                       placeholder="you@university.edu"
                       value={loginEmail}
                       onChange={(e) => setLoginEmail(e.target.value)}
                       disabled={isLoading}
                     />
                     {errors.loginEmail && (
                       <p className="text-sm text-destructive">{errors.loginEmail}</p>
                     )}
                   </div>
 
                   <div className="space-y-2">
                     <Label htmlFor="login-password">Password</Label>
                     <Input
                       id="login-password"
                       type="password"
                       placeholder="••••••••"
                       value={loginPassword}
                       onChange={(e) => setLoginPassword(e.target.value)}
                       disabled={isLoading}
                     />
                     {errors.loginPassword && (
                       <p className="text-sm text-destructive">{errors.loginPassword}</p>
                     )}
                   </div>
 
                   <Button type="submit" className="w-full" disabled={isLoading}>
                     {isLoading ? (
                       <Loader2 className="h-4 w-4 animate-spin" />
                     ) : (
                       'Login'
                     )}
                   </Button>
                 </form>
               </TabsContent>
 
               <TabsContent value="signup" className="mt-0">
                 <CardTitle className="text-lg mb-1">Create Account</CardTitle>
                 <CardDescription className="mb-6">
                   Register to start booking lab equipment
                 </CardDescription>
 
                 <form onSubmit={handleSignup} className="space-y-4">
                   <div className="space-y-2">
                     <Label htmlFor="signup-name">Full Name</Label>
                     <Input
                       id="signup-name"
                       type="text"
                       placeholder="John Doe"
                       value={signupName}
                       onChange={(e) => setSignupName(e.target.value)}
                       disabled={isLoading}
                     />
                     {errors.signupName && (
                       <p className="text-sm text-destructive">{errors.signupName}</p>
                     )}
                   </div>
 
                   <div className="space-y-2">
                     <Label htmlFor="signup-email">Email</Label>
                     <Input
                       id="signup-email"
                       type="email"
                       placeholder="you@university.edu"
                       value={signupEmail}
                       onChange={(e) => setSignupEmail(e.target.value)}
                       disabled={isLoading}
                     />
                     {errors.signupEmail && (
                       <p className="text-sm text-destructive">{errors.signupEmail}</p>
                     )}
                   </div>
 
                   <div className="space-y-2">
                     <Label htmlFor="signup-password">Password</Label>
                     <Input
                       id="signup-password"
                       type="password"
                       placeholder="••••••••"
                       value={signupPassword}
                       onChange={(e) => setSignupPassword(e.target.value)}
                       disabled={isLoading}
                     />
                     {errors.signupPassword && (
                       <p className="text-sm text-destructive">{errors.signupPassword}</p>
                     )}
                   </div>
 
                   <Button type="submit" className="w-full" disabled={isLoading}>
                     {isLoading ? (
                       <Loader2 className="h-4 w-4 animate-spin" />
                     ) : (
                       'Create Account'
                     )}
                   </Button>
                 </form>
               </TabsContent>
             </CardContent>
           </Tabs>
         </Card>
 
         <p className="text-center text-sm text-muted-foreground mt-6">
           Students register as students by default.
           <br />
           Contact IT admin for admin access.
         </p>
       </div>
     </div>
   );
 }