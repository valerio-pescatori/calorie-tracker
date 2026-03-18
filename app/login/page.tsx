"use client";

import { SubmitEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useI18nContext } from "@/lib/i18n/i18n-react";

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
              <label htmlFor="email" className="text-sm font-medium">
                {LL.login.emailLabel()}
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder={LL.login.emailPlaceholder()}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                disabled={status === "loading"}
              />
            </div>

            {status === "error" && <p className="text-sm text-destructive">{errorMsg}</p>}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {status === "loading" ? LL.login.sending() : LL.login.sendLink()}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
