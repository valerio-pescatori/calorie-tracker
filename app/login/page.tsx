"use client";

import { SubmitEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useI18nContext } from "@/lib/i18n/i18n-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import GoogleIcon from "@/assets/google-icon.svg";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const { LL } = useI18nContext();

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">{LL.login.title()}</h1>
          <p className="text-sm text-muted-foreground">{LL.login.subtitle()}</p>
        </div>

        {status === "sent" ? (
          <div className="rounded-lg border border-border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
            {LL.login.checkInbox()} <span className="font-medium text-foreground">{email}</span>.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{LL.login.emailLabel()}</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder={LL.login.emailPlaceholder()}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "loading"}
              />
            </div>

            {status === "error" && <p className="text-sm text-destructive">{errorMsg}</p>}
            <Button type="submit" disabled={status === "loading"} className="w-full">
              {status === "loading" ? LL.login.sending() : LL.login.sendLink()}
            </Button>
          </form>
        )}

        <p className="text-center">{LL.login.or()}</p>
        <div className="flex">
          <Button
            variant="outline"
            className="size-20 mx-auto p-4 bg-white/10 rounded-xl border border-white/20 hover:bg-white/20 active:bg-white/20 transition-colors"
            onClick={() =>
              createClient().auth.signInWithOAuth({
                provider: "google",
                options: {
                  redirectTo: `${location.origin}/auth/callback`,
                },
              })
            }
          >
            <Image src={GoogleIcon} alt="Google icon" />
          </Button>
        </div>
      </div>
    </main>
  );
}
