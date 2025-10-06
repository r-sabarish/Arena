'use client';

interface SkeletonLoaderProps {
    className?: string;
    count?: number;
    height?: string;
    width?: string;
    variant?: 'text' | 'circular' | 'rectangular' | 'card';
}

export default function SkeletonLoader({ 
    className = '', 
    count = 1, 
    height = 'h-4', 
    width = 'w-full',
    variant = 'text'
}: SkeletonLoaderProps) {
    const baseClasses = 'bg-slate-700/50 animate-pulse rounded';
    
    const variantClasses = {
        text: 'h-4',
        circular: 'rounded-full aspect-square',
        rectangular: 'h-20',
        card: 'h-32'
    };

    const skeletonClasses = `${baseClasses} ${variantClasses[variant]} ${height} ${width} ${className}`;

    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className={skeletonClasses} />
            ))}
        </>
    );
}

// Specific skeleton components for common use cases
export function CardSkeleton() {
    return (
        <div className="bg-gradient-to-br from-slate-800/30 via-slate-700/40 to-slate-900/30 backdrop-blur-sm border border-slate-600/20 rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
                <SkeletonLoader variant="circular" width="w-8" height="h-8" />
                <div className="flex-1">
                    <SkeletonLoader className="mb-2" width="w-3/4" />
                    <SkeletonLoader width="w-1/2" />
                </div>
            </div>
            <SkeletonLoader variant="rectangular" className="mb-3" />
            <div className="space-y-2">
                <SkeletonLoader width="w-full" />
                <SkeletonLoader width="w-5/6" />
                <SkeletonLoader width="w-4/6" />
            </div>
        </div>
    );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-slate-800/20 to-slate-700/20 backdrop-blur-sm border border-slate-600/10 rounded-lg">
                    <SkeletonLoader variant="circular" width="w-10" height="h-10" />
                    <div className="flex-1 space-y-2">
                        <SkeletonLoader width="w-3/4" />
                        <SkeletonLoader width="w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function ChartSkeleton() {
    return (
        <div className="bg-gradient-to-br from-slate-800/30 via-slate-700/40 to-slate-900/30 backdrop-blur-sm border border-slate-600/20 rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <SkeletonLoader width="w-32" height="h-6" />
                <SkeletonLoader width="w-20" height="h-6" />
            </div>
            <div className="flex items-center justify-between h-48">
                <div className="flex flex-col items-center space-y-4">
                    <SkeletonLoader variant="rectangular" width="w-16" height="h-32" />
                    <SkeletonLoader width="w-12" />
                </div>
                <div className="flex flex-col items-center space-y-4">
                    <SkeletonLoader variant="rectangular" width="w-16" height="h-24" />
                    <SkeletonLoader width="w-12" />
                </div>
            </div>
        </div>
    );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
    return (
        <div className="bg-gradient-to-br from-slate-800/30 via-slate-700/40 to-slate-900/30 backdrop-blur-sm border border-slate-600/20 rounded-lg overflow-hidden shadow-lg">
            {/* Header */}
            <div className="border-b border-slate-600/30 p-4">
                <div className="flex space-x-4">
                    {Array.from({ length: columns }).map((_, index) => (
                        <SkeletonLoader key={index} width="w-24" />
                    ))}
                </div>
            </div>
            {/* Rows */}
            <div className="divide-y divide-slate-600/30">
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div key={rowIndex} className="p-4">
                        <div className="flex space-x-4">
                            {Array.from({ length: columns }).map((_, colIndex) => (
                                <SkeletonLoader key={colIndex} width="w-20" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}