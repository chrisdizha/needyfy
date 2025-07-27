
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

export function LanguageSelector() {
  const { changeLanguage, currentLanguage, languages } = useI18n();

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 px-2 min-w-[40px] relative">
          <Languages className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="text-base sm:text-sm">{currentLang?.flag}</span>
          <span className="sr-only">Language selector</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="min-w-[180px] z-[100] bg-popover border shadow-lg"
        sideOffset={5}
      >
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={`cursor-pointer focus:bg-accent focus:text-accent-foreground hover:bg-accent transition-colors ${
              currentLanguage === language.code ? 'bg-accent text-accent-foreground' : ''
            }`}
          >
            <span className="mr-3 text-lg">{language.flag}</span>
            <span className="text-sm font-medium">{language.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
