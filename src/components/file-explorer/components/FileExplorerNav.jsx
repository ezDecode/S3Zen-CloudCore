/**
 * FileExplorerNav Component
 * Top navigation bar with breadcrumbs and actions
 */

import { Fragment, forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search01Icon,
    Loading03Icon,
    Home01Icon,
    Logout01Icon
} from 'hugeicons-react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
    BreadcrumbEllipsis,
} from "../../ui/breadcrumb";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { BucketSwitcher } from "./BucketSwitcher";
import { BucketManagerModal } from "../../modals/BucketManagerModal";

export const FileExplorerNav = forwardRef(({
    currentPath,
    searchQuery,
    onSearchChange,
    onNavigate,
    onRefresh,
    onLogout,
    searchInputRef,
    currentBucket,
    onBucketChange,
    isAuthenticated
}, ref) => {
    const pathParts = currentPath.split('/').filter(Boolean);
    const [showBucketManager, setShowBucketManager] = useState(false);

    return (
        <>
            <nav className="flex flex-row items-center px-3 sm:px-6 py-3 sm:py-4 border-b border-white/6 bg-[#0a0a0a]/80 backdrop-blur-xl z-10 gap-2 sm:gap-4">
                {/* Bucket Switcher */}
                <div className="shrink-0">
                    <BucketSwitcher 
                        currentBucket={currentBucket}
                        onBucketChange={onBucketChange}
                        onOpenManager={() => setShowBucketManager(true)}
                        isAuthenticated={isAuthenticated}
                    />
                </div>

                {/* Breadcrumb */}
                <div className="flex items-center min-w-0 flex-1">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem key="home">
                                <BreadcrumbLink
                                    onClick={() => onNavigate('')}
                                    className="flex items-center gap-1 cursor-pointer"
                                >
                                    <Home01Icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">Home</span>
                                </BreadcrumbLink>
                            </BreadcrumbItem>

                            {pathParts.length > 0 && pathParts.length <= 2 && (
                                <AnimatePresence mode="popLayout">
                                    {pathParts.map((part, index) => {
                                        const path = pathParts.slice(0, index + 1).join('/') + '/';
                                        const isLast = index === pathParts.length - 1;
                                        return (
                                            <Fragment key={path}>
                                                <BreadcrumbSeparator />
                                                <BreadcrumbItem>
                                                    {isLast ? (
                                                        <BreadcrumbPage>{part}</BreadcrumbPage>
                                                    ) : (
                                                        <BreadcrumbLink
                                                            onClick={() => onNavigate(path)}
                                                            className="cursor-pointer"
                                                        >
                                                            {part}
                                                        </BreadcrumbLink>
                                                    )}
                                                </BreadcrumbItem>
                                            </Fragment>
                                        );
                                    })}
                                </AnimatePresence>
                            )}

                            {pathParts.length > 2 && (
                                <>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <BreadcrumbLink
                                            onClick={() => onNavigate(pathParts.slice(0, 1).join('/') + '/')}
                                            className="cursor-pointer"
                                        >
                                            {pathParts[0]}
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>

                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger className="flex items-center gap-1 outline-none">
                                                <BreadcrumbEllipsis className="h-4 w-4" />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start" className="w-56 bg-[#0a0a0a]/95 backdrop-blur-xl border-white/[0.08]">
                                                {pathParts.slice(1, -1).map((part, index) => {
                                                    const actualIndex = index + 1;
                                                    const path = pathParts.slice(0, actualIndex + 1).join('/') + '/';
                                                    return (
                                                        <DropdownMenuItem
                                                            key={path}
                                                            onClick={() => onNavigate(path)}
                                                            className="cursor-pointer hover:bg-white/[0.04] focus:bg-white/[0.04]"
                                                        >
                                                            {part}
                                                        </DropdownMenuItem>
                                                    );
                                                })}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </BreadcrumbItem>

                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <BreadcrumbPage>{pathParts[pathParts.length - 1]}</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </>
                            )}
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
                    {/* Premium Search with Keyboard Hint */}
                    <div className="relative w-32 sm:w-48 md:w-64 group">
                        <Search01Icon className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-4 sm:w-4 h-4 sm:h-4 text-white/30 pointer-events-none" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-8 sm:pl-10 pr-16 sm:pr-20 py-1.5 sm:py-2 bg-white/3 border border-white/8 rounded-lg text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/15 focus:bg-white/5 transition-colors duration-150"
                        />
                        {/* Keyboard hint */}
                        <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                            <kbd className="px-1.5 py-0.5 text-[10px] text-white/40 bg-white/[0.04] border border-white/[0.08] rounded">
                                {navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘' : 'Ctrl'}
                            </kbd>
                            <kbd className="px-1.5 py-0.5 text-[10px] text-white/40 bg-white/[0.04] border border-white/[0.08] rounded">
                                F
                            </kbd>
                        </div>
                    </div>

                    {/* Premium Refresh */}
                    <button
                        onClick={onRefresh}
                        className="hidden sm:flex p-1.5 sm:p-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-colors duration-150 shrink-0"
                        title="Refresh"
                    >
                        <Loading03Icon className="w-4.5 h-4.5" />
                    </button>

                    {/* Premium Logout */}
                    <button
                        onClick={onLogout}
                        className="p-1.5 sm:p-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-colors duration-150 shrink-0"
                        title="Logout"
                    >
                        <Logout01Icon className="w-4 sm:w-4.5 h-4 sm:h-4.5" />
                    </button>
                </div>
            </nav>

            {/* Bucket Manager Modal */}
            <BucketManagerModal
                isOpen={showBucketManager}
                onClose={() => setShowBucketManager(false)}
                onBucketAdded={() => {
                    setShowBucketManager(false);
                    // Reload buckets
                }}
            />
        </>
    );
});

FileExplorerNav.displayName = 'FileExplorerNav';

export default FileExplorerNav;
