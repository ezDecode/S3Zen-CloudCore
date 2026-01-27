import React from 'react';
import { Icon } from '@iconify/react';
import { Button } from '../ui/button';

export const DisconnectModal = ({ isOpen, onClose, onConfirm, bucketName, isLoading, hasActiveUploads }) => {
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
                    {hasActiveUploads && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2">
                            <Icon icon="solar:shield-warning-linear" className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-destructive">Active Uploads in Progress</p>
                                <p className="text-xs text-destructive/80 leading-relaxed">
                                    You have ongoing uploads. Disconnecting now will cancel these operations.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <p className="text-base font-medium">Are you sure you want to disconnect <span className="text-brand">{bucketName}</span>?</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            This will remove the bucket configuration from your account.
                            <span className="block mt-1 font-medium text-foreground/80">Your files in S3 will remain safe and will not be deleted.</span>
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 rounded-xl h-11"
                            disabled={isLoading}
                        >
                            Keep Connected
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={onConfirm}
                            className="flex-1 rounded-xl h-11 bg-destructive hover:bg-destructive/90"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Icon icon="solar:refresh-circle-linear" className="w-4 h-4 mr-2 animate-spin" />
                                    Disconnecting...
                                </>
                            ) : (
                                'Confirm Disconnect'
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DisconnectModal;
