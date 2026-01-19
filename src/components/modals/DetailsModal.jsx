/**
 * DetailsModal Component
 * Modal for displaying file details
 */

import { InformationCircleIcon } from 'hugeicons-react';
import { Modal } from './Modal';
import { formatBytes, formatDate } from '../../lib/utils';
import { Button } from '../ui/button';

export const DetailsModal = ({ isOpen, onClose, item }) => {
    if (!item) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="File Details"
            icon={InformationCircleIcon}
            iconColor="text-blue-400"
            zIndex="z-[100]"
        >
            <div className="space-y-4">
                {/* File Name */}
                <div className="space-y-1">
                    <label className="text-xs text-zinc-500 uppercase tracking-wider font-normal">Name</label>
                    <p className="text-white text-sm break-all bg-white/5 p-3 rounded-lg border border-white/10">
                        {item.name}
                    </p>
                </div>

                {/* File Size */}
                <div className="space-y-1">
                    <label className="text-xs text-zinc-500 uppercase tracking-wider font-normal">Size</label>
                    <p className="text-white text-sm bg-white/5 p-3 rounded-lg border border-white/10">
                        {item.type === 'folder' ? '-' : formatBytes(item.size)}
                    </p>
                </div>

                {/* Last Modified */}
                <div className="space-y-1">
                    <label className="text-xs text-zinc-500 uppercase tracking-wider font-normal">Last Modified</label>
                    <p className="text-white text-sm bg-white/5 p-3 rounded-lg border border-white/10">
                        {item.lastModified ? formatDate(item.lastModified) : '-'}
                    </p>
                </div>

                {/* Type */}
                <div className="space-y-1">
                    <label className="text-xs text-zinc-500 uppercase tracking-wider font-normal">Type</label>
                    <p className="text-white text-sm bg-white/5 p-3 rounded-lg border border-white/10 capitalize">
                        {item.type}
                    </p>
                </div>
            </div>

            <div className="pt-4">
                <Button
                    onClick={onClose}
                    variant="secondary"
                    className="w-full"
                >
                    Close
                </Button>
            </div>
        </Modal>
    );
};
