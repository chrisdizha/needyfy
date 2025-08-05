import React, { memo, useMemo } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { useOptimizedEquipmentQuery } from '@/hooks/useOptimizedQueries';
import OptimizedEquipmentCard from './OptimizedEquipmentCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useConsolidatedPerformance } from '@/hooks/useConsolidatedPerformance';

interface OptimizedEquipmentListProps {
  limit?: number;
  filters?: {
    category?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
  };
  useVirtualization?: boolean;
}

// Memoized loading skeleton
const EquipmentCardSkeleton = memo(() => (
  <div className="space-y-3">
    <Skeleton className="h-48 w-full rounded-t-lg" />
    <div className="p-4 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  </div>
));

// Virtualized grid cell component
const VirtualizedCell = memo(({ 
  columnIndex, 
  rowIndex, 
  style, 
  data 
}: {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: any[];
}) => {
  const itemIndex = rowIndex * 3 + columnIndex; // Assuming 3 columns
  const item = data[itemIndex];

  if (!item) return null;

  return (
    <div style={style} className="p-2">
      <OptimizedEquipmentCard
        id={item.id}
        title={item.title}
        category={item.category}
        price={item.price}
        priceUnit={item.price_unit}
        image={item.photos?.[0]}
        location={item.location}
        rating={item.rating}
        totalRatings={item.total_ratings}
        isVerified={item.is_verified}
      />
    </div>
  );
});

// Grid layout component
const GridLayout = memo(({ equipment, isLoading }: { equipment: any[]; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <EquipmentCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (equipment.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No equipment found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {equipment.map((item) => (
        <OptimizedEquipmentCard
          key={item.id}
          id={item.id}
          title={item.title}
          category={item.category}
          price={item.price}
          priceUnit={item.price_unit}
          image={item.photos?.[0]}
          location={item.location}
          rating={item.rating}
          totalRatings={item.total_ratings}
          isVerified={item.is_verified}
        />
      ))}
    </div>
  );
});

// Virtualized grid layout
const VirtualizedGridLayout = memo(({ equipment }: { equipment: any[] }) => {
  const columnCount = 3;
  const rowCount = Math.ceil(equipment.length / columnCount);
  const itemWidth = 320;
  const itemHeight = 380;

  return (
    <Grid
      columnCount={columnCount}
      rowCount={rowCount}
      columnWidth={itemWidth}
      rowHeight={itemHeight}
      height={600}
      width={itemWidth * columnCount}
      itemData={equipment}
    >
      {VirtualizedCell}
    </Grid>
  );
});

const OptimizedEquipmentList = memo(({
  limit = 20,
  filters = {},
  useVirtualization = false
}: OptimizedEquipmentListProps) => {
  const { trackError } = useConsolidatedPerformance('OptimizedEquipmentList', {
    enableRenderTracking: true,
    enableMemoryTracking: true,
    logThreshold: 3
  });
  
  const { data: equipment = [], isLoading } = useOptimizedEquipmentQuery(limit, filters);

  // Memoize the equipment data to prevent unnecessary re-renders
  const memoizedEquipment = useMemo(() => Array.isArray(equipment) ? equipment : [], [equipment]);

  if (useVirtualization && memoizedEquipment.length > 50) {
    return <VirtualizedGridLayout equipment={memoizedEquipment} />;
  }

  return <GridLayout equipment={memoizedEquipment} isLoading={isLoading} />;
});

OptimizedEquipmentList.displayName = 'OptimizedEquipmentList';
EquipmentCardSkeleton.displayName = 'EquipmentCardSkeleton';
VirtualizedCell.displayName = 'VirtualizedCell';
GridLayout.displayName = 'GridLayout';
VirtualizedGridLayout.displayName = 'VirtualizedGridLayout';

export default OptimizedEquipmentList;