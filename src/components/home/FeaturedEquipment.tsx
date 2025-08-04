
import OptimizedEquipmentList from '../performance/OptimizedEquipmentList';

// Re-export the optimized component for backward compatibility
const FeaturedEquipment = () => <OptimizedEquipmentList limit={8} />;

export default FeaturedEquipment;
