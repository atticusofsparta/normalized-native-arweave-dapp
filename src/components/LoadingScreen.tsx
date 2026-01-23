import { HiSparkles } from 'react-icons/hi';

export function LoadingScreen() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background">
      {/* Ambient background orbs */}
      <div className="orb -left-40 top-20 size-80 bg-primary/30" />
      <div className="orb -right-20 top-1/2 size-96 bg-primary/20" />
      <div className="orb bottom-20 left-1/3 size-64 bg-warning/10" />

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Animated logo */}
        <div className="relative">
          {/* Outer glow ring */}
          <div className="absolute -inset-4 animate-ping rounded-full bg-primary/20" />
          <div className="absolute -inset-2 animate-pulse rounded-full bg-primary/30" />

          {/* Logo container */}
          <div className="relative flex size-20 animate-float items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-600 shadow-glow">
            <HiSparkles className="size-10 text-white" />
          </div>
        </div>

        {/* Brand text */}
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-wide text-white">
            <span className="text-gradient">Normalize</span>
            <span className="text-grey-400">.</span>
            <span className="text-grey-300">key</span>
          </h1>
          <p className="mt-2 text-sm text-grey-500">
            Cross-Chain Key Normalizer
          </p>
        </div>

        {/* Loading indicator */}
        <div className="flex flex-col items-center gap-4">
          {/* Animated dots */}
          <div className="flex gap-2">
            <span
              className="size-2 animate-bounce rounded-full bg-primary"
              style={{ animationDelay: '0ms' }}
            />
            <span
              className="size-2 animate-bounce rounded-full bg-primary"
              style={{ animationDelay: '150ms' }}
            />
            <span
              className="size-2 animate-bounce rounded-full bg-primary"
              style={{ animationDelay: '300ms' }}
            />
          </div>

          {/* Loading text */}
          <span className="text-xs uppercase tracking-widest text-grey-600">
            Loading
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1 w-48 overflow-hidden rounded-full bg-surface-light">
          <div
            className="h-full w-full origin-left animate-pulse bg-gradient-to-r from-primary via-primary-400 to-primary"
            style={{
              animation: 'shimmer 1.5s ease-in-out infinite',
              background:
                'linear-gradient(90deg, transparent, rgba(108, 151, 181, 0.8), transparent)',
              backgroundSize: '200% 100%',
            }}
          />
        </div>
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <p className="text-xs text-grey-700">Built for the permaweb</p>
      </div>
    </div>
  );
}
