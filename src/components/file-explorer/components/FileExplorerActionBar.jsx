/**
 * FileExplorerActionBar Component
 * Action bar with upload, select, sort, and view mode controls
 */

import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload02Icon,
    FolderAddIcon,
    Delete02Icon,
    Download01Icon,
    Share01Icon,
    Cancel01Icon,
    Tick01Icon,
    ArrowUp01Icon,
    PlusSignIcon,
    LayoutGridIcon,
    ListViewIcon
} from 'hugeicons-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "../../ui/drawer";
import { Button } from "../../ui/button";

export const FileExplorerActionBar = ({
    items,
    selectedItems,
    sortBy,
    sortOrder,
    viewMode,
    mobileDrawerOpen,
    onSelectAll,
    onClearSelection,
    onDownloadSelected,
    onShareSelected,
    onDelete,
    onSort,
    onSetSortOrder,
    onSetViewMode,
    onSetMobileDrawerOpen,
    onFileUpload,
    onCreateFolder
}) => {
    return (
        <div className="flex flex-row items-center justify-between px-3 sm:px-6 py-2 sm:py-3 border-b border-white/5 bg-zinc-950/50 z-10 gap-2">
            {/* Left Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                {/* New Button */}
                <div className="flex items-center">
                    {/* Desktop */}
                    <div className="hidden sm:block">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="default" className="gap-2 bg-white text-black hover:bg-zinc-200 font-bold">
                                    <PlusSignIcon className="w-4.5 h-4.5" />
                                    New
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48 bg-zinc-900 border-zinc-800">
                                <DropdownMenuItem
                                    className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800"
                                    onSelect={() => document.getElementById('desktop-file-upload').click()}
                                >
                                    <Upload02Icon className="w-4 h-4 mr-2" />
                                    Upload File
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800"
                                    onSelect={onCreateFolder}
                                >
                                    <FolderAddIcon className="w-4 h-4 mr-2" />
                                    New Folder
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <input
                            id="desktop-file-upload"
                            type="file"
                            multiple
                            onChange={onFileUpload}
                            className="hidden"
                        />
                    </div>

                    {/* Mobile */}
                    <div className="sm:hidden">
                        <Drawer open={mobileDrawerOpen} onOpenChange={onSetMobileDrawerOpen}>
                            <DrawerTrigger asChild>
                                <Button variant="default" size="icon" className="bg-white text-black hover:bg-zinc-200 rounded-lg">
                                    <PlusSignIcon className="w-4.5 h-4.5" />
                                </Button>
                            </DrawerTrigger>
                            <DrawerContent className="bg-zinc-950 border-zinc-800">
                                <DrawerHeader>
                                    <DrawerTitle>Add New</DrawerTitle>
                                    <DrawerDescription>Upload files or create folders</DrawerDescription>
                                </DrawerHeader>
                                <div className="p-4 space-y-4">
                                    <div
                                        className="border-2 border-dashed border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center gap-2 text-zinc-400 active:bg-zinc-900 transition-colors cursor-pointer"
                                        onClick={() => document.getElementById('mobile-file-upload').click()}
                                    >
                                        <Upload02Icon className="w-8 h-8 mb-2" />
                                        <span className="text-sm font-medium">Tap to upload files</span>
                                        <input
                                            id="mobile-file-upload"
                                            type="file"
                                            multiple
                                            onChange={(e) => {
                                                onFileUpload(e);
                                                onSetMobileDrawerOpen(false);
                                            }}
                                            className="hidden"
                                        />
                                    </div>
                                    <DrawerClose asChild>
                                        <Button
                                            className="w-full justify-start h-12 text-base bg-zinc-900 hover:bg-zinc-800 border-zinc-800"
                                            variant="outline"
                                            onClick={onCreateFolder}
                                        >
                                            <FolderAddIcon className="w-5 h-5 mr-3" />
                                            Create New Folder
                                        </Button>
                                    </DrawerClose>
                                </div>
                                <DrawerFooter>
                                    <DrawerClose asChild>
                                        <Button variant="outline" className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800">Cancel</Button>
                                    </DrawerClose>
                                </DrawerFooter>
                            </DrawerContent>
                        </Drawer>
                    </div>
                </div>

                {/* Select All */}
                {selectedItems.length > 0 && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onSelectAll}
                        className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 border rounded-lg text-xs sm:text-sm font-medium transition-all shrink-0 ${
                            selectedItems.length === items.length && items.length > 0
                                ? 'bg-blue-500 border-blue-500 text-white'
                                : 'bg-[rgba(255,255,255,0.05)] border-white/10 text-zinc-400 hover:text-white hover:bg-[rgba(255,255,255,0.1)]'
                        }`}
                    >
                        <Tick01Icon className="w-4 sm:w-4.5 h-4 sm:h-4.5" />
                        <span className="hidden sm:inline">
                            {selectedItems.length === items.length ? 'Remove All' : 'Select All'}
                        </span>
                    </motion.button>
                )}

                {/* Selection Actions */}
                <AnimatePresence>
                    {selectedItems.length > 0 && (
                        <>
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 'auto', opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                className="hidden sm:block h-8 w-px bg-[rgba(255,255,255,0.1)] mx-1 shrink-0"
                            />

                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0"
                            >
                                <span className="hidden md:inline text-xs text-zinc-400 font-medium px-2 whitespace-nowrap">
                                    {selectedItems.length} selected
                                </span>

                                {selectedItems.every(item => item.type === 'file') && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={onDownloadSelected}
                                        className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-[rgba(59,130,246,0.1)] border border-blue-500/20 text-blue-400 rounded-lg text-xs font-semibold hover:bg-[rgba(59,130,246,0.2)] transition-all shrink-0"
                                    >
                                        <Download01Icon className="w-4 h-4" />
                                        <span className="hidden sm:inline">Download</span>
                                    </motion.button>
                                )}

                                {selectedItems.length === 1 && selectedItems[0].type === 'file' && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={onShareSelected}
                                        className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-[rgba(34,197,94,0.1)] border border-green-500/20 text-green-400 rounded-lg text-xs font-semibold hover:bg-[rgba(34,197,94,0.2)] transition-all shrink-0"
                                    >
                                        <Share01Icon className="w-4 h-4" />
                                        <span className="hidden sm:inline">Share</span>
                                    </motion.button>
                                )}

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => onDelete(selectedItems)}
                                    className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-[rgba(239,68,68,0.1)] border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold hover:bg-[rgba(239,68,68,0.2)] transition-all shrink-0"
                                >
                                    <Delete02Icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">Delete</span>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onClearSelection}
                                    className="p-1 sm:p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all shrink-0"
                                >
                                    <Cancel01Icon className="w-4 h-4" />
                                </motion.button>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>

            {/* Sort Menu */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-1.5 sm:p-2 rounded-lg transition-all shrink-0 text-zinc-400 hover:text-white data-[state=open]:text-white data-[state=open]:bg-[rgba(255,255,255,0.1)]"
                    >
                        <ArrowUp01Icon className="w-4.5 h-4.5" />
                    </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-zinc-800">
                    <DropdownMenuLabel className="text-zinc-500 text-xs uppercase tracking-wider">Sort By</DropdownMenuLabel>
                    {['name', 'size', 'date'].map((field) => (
                        <DropdownMenuItem
                            key={field}
                            onSelect={() => onSort(field)}
                            className="justify-between capitalize cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800"
                        >
                            {field}
                            {sortBy === field && <Tick01Icon className="w-4 h-4 text-blue-500" />}
                        </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuLabel className="text-zinc-500 text-xs uppercase tracking-wider">Order</DropdownMenuLabel>
                    <DropdownMenuItem
                        onSelect={() => onSetSortOrder('asc')}
                        className="justify-between cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800"
                    >
                        Ascending
                        {sortOrder === 'asc' && <Tick01Icon className="w-4 h-4 text-blue-500" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onSelect={() => onSetSortOrder('desc')}
                        className="justify-between cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800"
                    >
                        Descending
                        {sortOrder === 'desc' && <Tick01Icon className="w-4 h-4 text-blue-500" />}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 bg-white/5 rounded-lg border border-white/10 shrink-0">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSetViewMode('grid')}
                    className={`p-1 sm:p-1.5 rounded-md transition-all ${
                        viewMode === 'grid' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                    }`}
                >
                    <LayoutGridIcon className="w-4 sm:w-4.5 h-4 sm:h-4.5" />
                </motion.button>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSetViewMode('list')}
                    className={`p-1 sm:p-1.5 rounded-md transition-all ${
                        viewMode === 'list' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                    }`}
                >
                    <ListViewIcon className="w-4 sm:w-4.5 h-4 sm:h-4.5" />
                </motion.button>
            </div>
        </div>
    );
};
