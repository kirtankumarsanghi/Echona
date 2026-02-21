import { motion } from "framer-motion";

/** Reusable skeleton shimmer block */
export function SkeletonBlock({ className = "" }) {
  return (
    <div className={`animate-pulse bg-neutral-800/60 rounded-xl ${className}`} />
  );
}

/** Skeleton for a stat card */
export function SkeletonStatCard() {
  return (
    <div className="card p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-neutral-800/80" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-neutral-800/80 rounded w-20" />
        <div className="h-8 bg-neutral-800/60 rounded w-16" />
        <div className="h-3 bg-neutral-800/80 rounded w-24" />
      </div>
    </div>
  );
}

/** Skeleton for a chart card */
export function SkeletonChart({ height = "h-[300px]" }) {
  return (
    <div className="card-premium p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-neutral-800/80" />
        <div className="space-y-1">
          <div className="h-5 bg-neutral-800/80 rounded w-32" />
          <div className="h-3 bg-neutral-800/80 rounded w-48" />
        </div>
      </div>
      <div className={`${height} bg-neutral-800/40 rounded-xl`} />
    </div>
  );
}

/** Skeleton for an activity card */
export function SkeletonActivityCard() {
  return (
    <div className="card p-4 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-1">
          <div className="h-4 bg-neutral-800/80 rounded w-20" />
          <div className="h-3 bg-neutral-800/80 rounded w-28" />
        </div>
        <div className="h-6 bg-neutral-800/80 rounded w-12" />
      </div>
      <div className="h-2 bg-neutral-800/80 rounded-full" />
    </div>
  );
}

/** Full Dashboard skeleton */
export function DashboardSkeleton() {
  return (
    <div className="relative z-10 pt-14 lg:pt-4 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-pulse">
        <div className="h-8 bg-neutral-800/60 rounded w-72 mb-2" />
        <div className="h-5 bg-neutral-800/40 rounded w-80" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <SkeletonChart />
        </div>
        <SkeletonChart />
      </div>

      {/* Activity */}
      <div className="card-premium p-6">
        <div className="flex items-center gap-3 mb-6 animate-pulse">
          <div className="w-10 h-10 rounded-xl bg-neutral-800/80" />
          <div className="h-5 bg-neutral-800/80 rounded w-40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <SkeletonActivityCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Music page skeleton */
export function MusicSkeleton() {
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto animate-pulse">
      <div className="h-10 bg-neutral-800/60 rounded w-64 mb-4" />
      <div className="h-5 bg-neutral-800/40 rounded w-96 mb-8" />
      <div className="flex gap-3 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 bg-neutral-800/60 rounded-full w-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="h-20 bg-neutral-800/40 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default DashboardSkeleton;
