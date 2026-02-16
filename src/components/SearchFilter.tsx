import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
 
interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories?: string[];
}

const defaultCategories = ['All', 'Analysis', 'Separation', 'Molecular Biology', 'Imaging'];
 
export function SearchFilter({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories = defaultCategories,
}: SearchFilterProps) {
   return (
     <div className="space-y-4 animate-fade-in">
       <div className="relative">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
         <Input
           placeholder="Search equipment..."
           value={searchQuery}
           onChange={(e) => onSearchChange(e.target.value)}
           className="pl-10 bg-card"
         />
       </div>
 
       <div className="flex items-center gap-2 flex-wrap">
         <Filter className="h-4 w-4 text-muted-foreground" />
         {categories.map((category) => (
           <Button
             key={category}
             variant={selectedCategory === category ? 'default' : 'outline'}
             size="sm"
             onClick={() => onCategoryChange(category)}
             className={cn(
               'transition-all',
               selectedCategory === category && 'shadow-md'
             )}
           >
             {category}
           </Button>
         ))}
       </div>
     </div>
   );
 }