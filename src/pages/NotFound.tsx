import { FaArrowLeft, FaGhost } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background">
      {/* Ambient background orbs */}
      <div className="orb -left-40 top-20 size-80 bg-error/20" />
      <div className="orb -right-20 top-1/2 size-96 bg-primary/20" />
      <div className="orb bottom-20 left-1/3 size-64 bg-warning/10" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* Animated ghost icon */}
        <div className="relative mb-8">
          <div className="absolute -inset-4 animate-pulse rounded-full bg-error/20" />
          <div className="relative flex size-24 animate-float items-center justify-center rounded-2xl bg-gradient-to-br from-error/80 to-error shadow-lg">
            <FaGhost className="size-12 text-white" />
          </div>
        </div>

        {/* 404 Text */}
        <h1 className="mb-2 text-8xl font-bold tracking-tighter text-white md:text-9xl">
          <span className="text-gradient">4</span>
          <span className="text-error">0</span>
          <span className="text-gradient">4</span>
        </h1>

        <h2 className="mb-4 text-2xl font-semibold text-white md:text-3xl">
          Page Not Found
        </h2>

        <p className="mb-8 max-w-md text-grey-400">
          Looks like this page got lost in the blockchain. The address
          you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            to="/"
            className="btn-primary flex items-center justify-center gap-2"
          >
            <FaArrowLeft className="size-4" />
            Back to Home
          </Link>
        </div>

        {/* Decorative element */}
        <div className="mt-16 flex items-center gap-2 text-grey-600">
          <HiSparkles className="size-4" />
          <span className="text-sm">Normalize.key</span>
          <HiSparkles className="size-4" />
        </div>
      </div>

      {/* Glitch-style decorative lines */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/4 top-1/4 h-px w-32 bg-gradient-to-r from-transparent via-error/50 to-transparent"
          style={{ transform: 'rotate(-45deg)' }}
        />
        <div
          className="absolute right-1/4 top-1/3 h-px w-48 bg-gradient-to-r from-transparent via-primary/30 to-transparent"
          style={{ transform: 'rotate(30deg)' }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 h-px w-24 bg-gradient-to-r from-transparent via-warning/40 to-transparent"
          style={{ transform: 'rotate(-15deg)' }}
        />
      </div>
    </div>
  );
}

export default NotFound;
