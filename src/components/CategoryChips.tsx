import { Wrench, ChefHat, Shirt, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type ServiceCategory, categories } from '@/data/mockProviders';

const iconMap: Record<ServiceCategory, React.ElementType> = {
  plumber: Wrench,
  cook: ChefHat,
  drycleaner: Shirt,
  electrician: Zap,
};

interface CategoryChipsProps {
  selected: ServiceCategory | null;
  onSelect: (category: ServiceCategory | null) => void;
}

const CategoryChips = ({ selected, onSelect }: CategoryChipsProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {categories.map((cat) => {
        const Icon = iconMap[cat.id];
        const isActive = selected === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(isActive ? null : cat.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all min-h-[44px]',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-secondary text-secondary-foreground hover:bg-accent'
            )}
          >
            <Icon className="h-4 w-4" />
            {cat.label}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryChips;
