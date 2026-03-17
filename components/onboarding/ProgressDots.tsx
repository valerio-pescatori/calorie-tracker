export function ProgressDots({ current }: { current: number }) {
  return (
    <div className="flex gap-1.5 justify-center mb-6">
      {[1, 2, 3, 4].map((n) => (
        <span
          key={n}
          className={`w-2 h-2 rounded-full transition-colors duration-200 ${
            n === current ? "bg-primary" : "bg-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}
