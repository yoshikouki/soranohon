"use client";

import { Settings2 } from "lucide-react";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { FontSize, useViewerSettings } from "@/features/book-viewer/hooks/use-viewer-settings";

const FONT_SIZE_MAP: Record<FontSize, number> = {
  sm: 0,
  base: 1,
  lg: 2,
  xl: 3,
  "2xl": 4,
};

const FONT_SIZE_VALUES: FontSize[] = ["sm", "base", "lg", "xl", "2xl"];

export const ViewerSettingsMenu = () => {
  const { showRuby, showIllustrations, fontSize, toggleRuby, toggleIllustrations, setFontSize } = useViewerSettings();

  const handleSliderChange = (value: number[]) => {
    const size = FONT_SIZE_VALUES[value[0]] || "xl";
    setFontSize(size);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <Settings2 className="size-4" />
      </div>
      <div className="p-3">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="ruby-toggle" className="font-normal text-sm">
              ふりがな
            </Label>
            <Switch id="ruby-toggle" checked={showRuby} onCheckedChange={toggleRuby} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="illustrations-toggle" className="font-normal text-sm">
              挿絵
            </Label>
            <Switch id="illustrations-toggle" checked={showIllustrations} onCheckedChange={toggleIllustrations} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="font-size" className="font-normal text-sm">
              もじのおおきさ
            </Label>
            <div className="px-2">
              <Slider
                id="font-size"
                value={[FONT_SIZE_MAP[fontSize]]}
                onValueChange={handleSliderChange}
                max={4}
                step={1}
                className="w-full"
              />
            </div>
            <div className="flex justify-between px-2 text-muted-foreground text-xs">
              <span>ちいさい</span>
              <span>おおきい</span>
            </div>
          </div>
        </div>
      </div>
      <DropdownMenuSeparator />
    </div>
  );
};
