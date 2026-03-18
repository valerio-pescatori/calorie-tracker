"use client";

import { Home, BarChart2, Plus, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18nContext } from "@/lib/i18n/i18n-react";

interface Props {
  onAddMeal: () => void;
}

export function BottomNav({ onAddMeal }: Props) {
  const { LL } = useI18nContext();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-card/90 backdrop-blur-lg border-t border-border">
      <div className="relative max-w-2xl mx-auto flex items-end justify-around px-2 pb-safe h-16">
        {/* Home — active */}
        <button className="flex flex-col items-center justify-center gap-1 flex-1 h-full" aria-label={LL.nav.home()}>
          <Home className="h-5 w-5 text-violet-400" />
        </button>

        {/* Chart */}
        <button className="flex flex-col items-center justify-center gap-1 flex-1 h-full opacity-40" aria-label={LL.nav.stats()} disabled>
          <BarChart2 className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* + FAB — center */}
        <div className="relative flex flex-col items-center justify-end flex-1 h-full">
          <button
            onClick={onAddMeal}
            className={cn(
              "absolute -top-5 w-14 h-14 rounded-full fab-glow text-white",
              "flex items-center justify-center shadow-lg",
            )}
            aria-label={LL.nav.addMeal()}
          >
            <Plus className="h-7 w-7" />
          </button>
        </div>

        {/* Heart */}
        <button className="flex flex-col items-center justify-center gap-1 flex-1 h-full opacity-40" aria-label={LL.nav.favorites()} disabled>
          <Heart className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Profile */}
        <button className="flex flex-col items-center justify-center gap-1 flex-1 h-full opacity-40" aria-label={LL.nav.profile()} disabled>
          <User className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>
    </nav>
  );
}
