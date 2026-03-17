import { Drawer, DrawerContent } from '@/components/ui/drawer';

interface MobileDrawerProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const MobileDrawer = ({ children, open = true, onOpenChange }: MobileDrawerProps) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
      <DrawerContent className="max-h-[70vh] rounded-t-2xl">
        <div className="overflow-y-auto px-4 pb-20">
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileDrawer;
