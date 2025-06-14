
import CategorySelector from "./CategorySelector";
import PriceField from "./PriceField";

interface EquipmentCategoryPriceFieldsProps {
  categories: string[];
  selectedCategory: string;
  price: string;
  priceUnit: string;
  onCategoryChange: (value: string) => void;
  onPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPriceUnitChange: (value: string) => void;
}

const EquipmentCategoryPriceFields = ({
  categories,
  selectedCategory,
  price,
  priceUnit,
  onCategoryChange,
  onPriceChange,
  onPriceUnitChange
}: EquipmentCategoryPriceFieldsProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <CategorySelector
      categories={categories}
      selectedCategory={selectedCategory}
      onCategoryChange={onCategoryChange}
    />
    <PriceField
      price={price}
      priceUnit={priceUnit}
      onPriceChange={onPriceChange}
      onPriceUnitChange={onPriceUnitChange}
    />
  </div>
);

export default EquipmentCategoryPriceFields;
