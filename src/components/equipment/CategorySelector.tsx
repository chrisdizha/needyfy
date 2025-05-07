
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CategorySelectorProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
}

const CategorySelector = ({ 
  categories, 
  selectedCategory, 
  onCategoryChange 
}: CategorySelectorProps) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        Category
      </label>
      <Select
        value={selectedCategory}
        onValueChange={onCategoryChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CategorySelector;
