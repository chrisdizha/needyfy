
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
        <Button variant="ghost" size="sm" className="h-9 px-2 min-w-0">
          <Languages className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline text-sm">{currentLang?.flag}</span>
          <span className="sm:hidden text-xs">{currentLang?.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="min-w-[160px] z-50 bg-popover border shadow-lg"
        sideOffset={5}
      >
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={`cursor-pointer focus:bg-accent focus:text-accent-foreground ${
              currentLanguage === language.code ? 'bg-accent' : ''
            }`}
          >
            <span className="mr-2 text-base">{language.flag}</span>
            <span className="text-sm">{language.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
