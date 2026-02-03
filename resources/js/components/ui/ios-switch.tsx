import * as React from 'react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface IOSSwitchProps extends React.ComponentPropsWithoutRef<typeof Switch> {
  className?: string;
}

const IOSSwitch = React.forwardRef<React.ElementRef<typeof Switch>, IOSSwitchProps>(
  ({ className, ...props }, ref) => (
    <div className={cn('relative inline-flex h-7 w-12 items-center rounded-full bg-gray-300 dark:bg-gray-600 transition-colors', {
      'bg-green-500 dark:bg-green-600': props.checked,
    })}>
      <Switch
        ref={ref}
        className={cn(
          'h-6 w-6 absolute left-0.5 data-[state=checked]:translate-x-5 transition-transform duration-200 bg-white rounded-full shadow-md',
          className,
        )}
        {...props}
      />
    </div>
  ),
);
IOSSwitch.displayName = 'IOSSwitch';

export default IOSSwitch;
