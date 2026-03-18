"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import TypesafeI18n from "@/lib/i18n/i18n-react";
import { loadAllLocales } from "@/lib/i18n/i18n-util.sync";
import type { Locales } from "@/lib/i18n/i18n-types";
import { useStore } from "@/lib/store";
import { AddMealPanel } from "@/components/dashboard/AddMealPanel";
import { BottomNav } from "@/components/dashboard/BottomNav";

const NAV_ROUTES = ["/dashboard", "/profile"];

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNav = NAV_ROUTES.some((r) => pathname.startsWith(r));
  const isAddMealOpen = useStore((s) => s.isAddMealOpen);
  const setAddMealOpen = useStore((s) => s.setAddMealOpen);

  return (
    <>
      {children}
      {showNav && (
        <>
          <BottomNav />
          <AddMealPanel open={isAddMealOpen} onOpenChange={setAddMealOpen} />
        </>
      )}
    </>
  );
}

export function AppShell({ children, locale: initialLocale }: { children: React.ReactNode; locale: Locales }) {
  const [locale] = useState<Locales>(() => {
    loadAllLocales();
    return initialLocale;
  });

  return (
    <TypesafeI18n locale={locale}>
      <Shell>{children}</Shell>
    </TypesafeI18n>
  );
}
