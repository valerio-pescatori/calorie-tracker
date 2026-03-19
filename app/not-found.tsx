import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="aurora-bg" aria-hidden="true">
        <div className="aurora-blob aurora-blob-violet" />
        <div className="aurora-blob aurora-blob-teal" />
        <div className="aurora-blob aurora-blob-indigo" />
      </div>
      <div className="text-center space-y-4">
        <p className="text-6xl font-bold text-muted-foreground/30">404</p>
        <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
        <p className="text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/dashboard"
          className="inline-block mt-2 text-sm font-medium underline underline-offset-4 hover:text-muted-foreground transition-colors"
        >
          Go to dashboard
        </Link>
      </div>
    </main>
  );
}
