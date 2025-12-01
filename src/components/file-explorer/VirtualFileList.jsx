/**
 * VirtualFileList Component
 * Implements virtual scrolling for large file lists
 * Only renders visible items for better performance
 */

import React, { useMemo, useRef, useEffect } from 'react';
import { List } from 'react-window';
import { FileItem } from './FileItem';

const ITEM_HEIGHT_GRID = 140; // Height of grid item
const ITEM_HEIGHT_LIST = 60;  // Height of list item

export const VirtualFileList = ({
    items,
    selectedItems,
    onSelectItem,
    onOpenFolder,
    onDownload,
    onShare,
    onRename,
    onDelete,
    onPreview,
    onDetails,
    viewMode = 'grid',
    favorites = [],
    onToggleFavorite,
    containerHeight,
    containerWidth
}) => {
    const listRef = useRef(null);

    // Create Sets for O(1) lookup
    const selectedKeys = useMemo(() => 
        new Set(selectedItems.map(item => item.key)), 
        [selectedItems]
    );

    const favoriteKeys = useMemo(() => 
        new Set(favorites.map(item => item.key)), 
        [favorites]
    );

    // Calculate items per row for grid view
    const itemsPerRow = useMemo(() => {
        if (viewMode !== 'grid') return 1;
        
        // Responsive grid columns based on container width
        if (containerWidth >= 1536) return 8; // 2xl
        if (containerWidth >= 1280) return 6; // xl
        if (containerWidth >= 1024) return 5; // lg
        if (containerWidth >= 768) return 4;  // md
        if (containerWidth >= 640) return 3;  // sm
        return 2; // mobile
    }, [viewMode, containerWidth]);

    // Calculate row count
    const rowCount = useMemo(() => {
        if (viewMode === 'grid') {
            return Math.ceil(items.length / itemsPerRow);
        }
        return items.length;
    }, [items.length, itemsPerRow, viewMode]);

    // Item height based on view mode
    const itemHeight = viewMode === 'grid' ? ITEM_HEIGHT_GRID : ITEM_HEIGHT_LIST;

    // Row renderer
    const Row = ({ index, style }) => {
        if (viewMode === 'grid') {
            // Grid view - render multiple items per row
            const startIndex = index * itemsPerRow;
            const rowItems = items.slice(startIndex, startIndex + itemsPerRow);

            return (
                <div style={style} className="flex gap-3 px-6">
                    {rowItems.map((item) => (
                        <div key={item.key} style={{ width: `${100 / itemsPerRow}%` }}>
                            <FileItem
                                item={item}
                                isSelected={selectedKeys.has(item.key)}
                                isFavorite={favoriteKeys.has(item.key)}
                                onSelect={onSelectItem}
                                onOpen={onOpenFolder}
                                onDownload={onDownload}
                                onShare={onShare}
                                onRename={onRename}
                                onDelete={onDelete}
                                onPreview={onPreview}
                                onDetails={onDetails}
                                onToggleFavorite={onToggleFavorite}
                                viewMode={viewMode}
                            />
                        </div>
                    ))}
                </div>
            );
        } else {
            // List view - one item per row
            const item = items[index];
            
            return (
                <div style={style} className="px-6">
                    <FileItem
                        item={item}
                        isSelected={selectedKeys.has(item.key)}
                        isFavorite={favoriteKeys.has(item.key)}
                        onSelect={onSelectItem}
                        onOpen={onOpenFolder}
                        onDownload={onDownload}
                        onShare={onShare}
                        onRename={onRename}
                        onDelete={onDelete}
                        onPreview={onPreview}
                        onDetails={onDetails}
                        onToggleFavorite={onToggleFavorite}
                        viewMode={viewMode}
                    />
                </div>
            );
        }
    };

    // Scroll to top when items change
    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollToItem(0);
        }
    }, [items]);

    return (
        <List
            ref={listRef}
            height={containerHeight}
            itemCount={rowCount}
            itemSize={itemHeight}
            width={containerWidth}
            overscanCount={3} // Render 3 extra rows above/below viewport
        >
            {Row}
        </List>
    );
};
