"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useStore } from "@/lib/store";
import { useI18nContext } from "@/lib/i18n/i18n-react";
import type { Locales } from "@/lib/i18n/i18n-types";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

function persistLocale(next: string) {
  localStorage.setItem("locale", next);
  document.cookie = `locale=${next};path=/;max-age=31536000`;
}

export default function ProfilePage() {
  const router = useRouter();
  const { LL, locale, setLocale } = useI18nContext();
  const profileExists = useStore((s) => s.profileExists);
  const hydrateProfile = useStore((s) => s.hydrateProfile);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    hydrateProfile();
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        const user = data.user;
        setEmail(user?.email ?? "");
        setDisplayName(user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "");
      });
  }, [hydrateProfile]);

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  function switchLocale(next: Locales) {
    setLocale(next);
    persistLocale(next);
  }

  return (
    <div className="relative min-h-dvh pb-28 flex flex-col">
      <main className="max-w-2xl px-4 pt-10 space-y-8 grow flex flex-col">
        {/* Avatar + name */}
        <div className="flex flex-col items-center gap-3 pt-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-violet-500/30 flex items-center justify-center text-2xl font-bold text-violet-200">
              {initials || "?"}
            </div>
            {profileExists === false && (
              <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-orange-400 border-2 border-background" />
            )}
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{displayName || "…"}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>

        <Separator />

        {/* Update goals */}
        <section className="space-y-2">
          <button
            onClick={() => router.push("/onboarding?start=path")}
            className="w-full flex items-center justify-between rounded-xl border border-border px-4 py-3 hover:bg-muted transition-colors glass-card"
          >
            <span className="text-sm font-medium text-foreground">{LL.profile.updateGoals()}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </section>

        <Separator />

        {/* Language toggle */}
        <section className="space-y-3">
          <p className="text-xs font-bold tracking-wider text-foreground/50 uppercase">{LL.profile.language()}</p>
          <div className="flex gap-2">
            {(["en", "it"] as Locales[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => switchLocale(lang)}
                className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                  locale === lang
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </section>

        {/* Logout button */}
        <Button
          variant="destructive"
          className="w-full py-6 mt-auto"
          onClick={async () => {
            const client = createClient();
            await client.auth.signOut();
            router.push("/login");
          }}
        >
          {LL.profile.logout()}
        </Button>
      </main>
    </div>
  );
}
