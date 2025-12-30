import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function ChartContainer({ title, children, className, action }: ChartContainerProps) {
  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
