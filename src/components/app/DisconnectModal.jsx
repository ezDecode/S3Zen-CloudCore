import React from 'react';
import { Icon } from '@iconify/react';
import { Button } from '../ui/button';

export const DisconnectModal = ({ isOpen, onClose, onConfirm, bucketName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-background/80 backdrop-blur-md" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="w-full max-w-md bg-card shadow-2xl border border-border/50 rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-dotted border-border/50">
                    <div className="flex items-center gap-3 text-destructive">
                        <Icon icon="solar:danger-triangle-linear" className="w-5 h-5" />
                        <h2 className="font-display font-medium text-lg tracking-tight">Disconnect Bucket</h2>
                    </div>
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <Icon icon="solar:close-circle-linear" className="w-5 h-5" />
                    </Button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <p className="text-base font-medium">Are you sure you want to disconnect <span className="text-brand">{bucketName}</span>?</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            This action will only remove the bucket credentials from this application session.
                            <span className="block mt-1 font-medium text-foreground/80">Your actual data and files in S3 will not be deleted or modified.</span>
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 rounded-xl h-11"
                        >
                            Keep Connected
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={onConfirm}
                            className="flex-1 rounded-xl h-11 bg-destructive hover:bg-destructive/90"
                        >
                            Confirm Disconnect
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DisconnectModal;
