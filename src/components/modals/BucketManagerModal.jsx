/**
 * BucketManager Modal
 * Full CRUD operations: Add, Edit, Delete, Test Connection
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Delete01Icon,
    Edit02Icon,
    CheckmarkCircle01Icon,
    AlertCircleIcon,
    Loading03Icon,
    EyeIcon,
    ArrowDown01Icon
} from 'hugeicons-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import bucketManagerService from '../../services/bucketManagerService';

const AWS_REGIONS = [
    { value: 'us-east-1', label: 'US East (N. Virginia)' },
    { value: 'us-east-2', label: 'US East (Ohio)' },
    { value: 'us-west-1', label: 'US West (N. California)' },
    { value: 'us-west-2', label: 'US West (Oregon)' },
    { value: 'af-south-1', label: 'Africa (Cape Town)' },
    { value: 'ap-east-1', label: 'Asia Pacific (Hong Kong)' },
    { value: 'ap-south-1', label: 'Asia Pacific (Mumbai)' },
    { value: 'ap-south-2', label: 'Asia Pacific (Hyderabad)' },
    { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
    { value: 'ap-southeast-2', label: 'Asia Pacific (Sydney)' },
    { value: 'ap-southeast-3', label: 'Asia Pacific (Jakarta)' },
    { value: 'ap-southeast-4', label: 'Asia Pacific (Melbourne)' },
    { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' },
    { value: 'ap-northeast-2', label: 'Asia Pacific (Seoul)' },
    { value: 'ap-northeast-3', label: 'Asia Pacific (Osaka)' },
    { value: 'ca-central-1', label: 'Canada (Central)' },
    { value: 'ca-west-1', label: 'Canada West (Calgary)' },
    { value: 'eu-central-1', label: 'Europe (Frankfurt)' },
    { value: 'eu-central-2', label: 'Europe (Zurich)' },
    { value: 'eu-west-1', label: 'Europe (Ireland)' },
    { value: 'eu-west-2', label: 'Europe (London)' },
    { value: 'eu-west-3', label: 'Europe (Paris)' },
    { value: 'eu-north-1', label: 'Europe (Stockholm)' },
    { value: 'eu-south-1', label: 'Europe (Milan)' },
    { value: 'eu-south-2', label: 'Europe (Spain)' },
    { value: 'il-central-1', label: 'Israel (Tel Aviv)' },
    { value: 'me-south-1', label: 'Middle East (Bahrain)' },
    { value: 'me-central-1', label: 'Middle East (UAE)' },
    { value: 'sa-east-1', label: 'South America (São Paulo)' }
];

export const BucketManagerModal = ({ isOpen, onClose, onBucketAdded }) => {
    const [buckets, setBuckets] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [showSecrets, setShowSecrets] = useState({});
    const [deleteConfirm, setDeleteConfirm] = useState(null); // { id, name }

    const [formData, setFormData] = useState({
        name: '',
        bucketName: '',
        region: 'eu-north-1',
        accessKeyId: '',
        secretAccessKey: '',
        description: ''
    });

    const [validationState, setValidationState] = useState({
        isValidating: false,
        isValid: null,
        error: null
    });

    useEffect(() => {
        if (isOpen) {
            // Small delay to ensure session is available
            const timer = setTimeout(() => {
                loadBuckets();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const loadBuckets = async () => {
        setIsLoading(true);
        try {
            const response = await bucketManagerService.getBuckets();
            setBuckets(response.buckets || []);
        } catch (error) {
            console.error('[BucketManager] Failed to load buckets:', error);
            
            // Only show error for non-auth issues
            if (error.code !== 'NO_AUTH_TOKEN' && error.code !== 'UNAUTHORIZED') {
                toast.error('Failed to load buckets');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            bucketName: '',
            region: 'eu-north-1',
            accessKeyId: '',
            secretAccessKey: '',
            description: ''
        });
        setEditingId(null);
        setShowForm(false);
        setValidationState({ isValidating: false, isValid: null, error: null });
    };

    const validateBucket = async () => {
        setValidationState({ isValidating: true, isValid: null, error: null });
        try {
            const result = await bucketManagerService.validateBucket({
                displayName: formData.name || 'Test Bucket',
                bucketName: formData.bucketName,
                region: formData.region,
                accessKeyId: formData.accessKeyId,
                secretAccessKey: formData.secretAccessKey
            });

            if (result.success) {
                setValidationState({ isValidating: false, isValid: true, error: null });
                toast.success('✓ Bucket access validated');
                return true;
            } else {
                setValidationState({
                    isValidating: false,
                    isValid: false,
                    error: result.message || 'Validation failed'
                });
                toast.error(result.message || 'Failed to validate bucket');
                return false;
            }
        } catch (error) {
            setValidationState({
                isValidating: false,
                isValid: false,
                error: error.message
            });
            toast.error(error.message || 'Validation error');
            return false;
        }
    };

    const handleSaveBucket = async () => {
        if (!formData.name || !formData.bucketName || !formData.accessKeyId || !formData.secretAccessKey) {
            toast.error('Please fill all required fields');
            return;
        }

        // Validate before saving
        const isValid = await validateBucket();
        if (!isValid) return;

        try {
            setIsLoading(true);
            
            // Map frontend field names to backend expected names
            const bucketData = {
                displayName: formData.name,
                bucketName: formData.bucketName,
                region: formData.region,
                accessKeyId: formData.accessKeyId,
                secretAccessKey: formData.secretAccessKey,
                description: formData.description
            };
            
            let savedBucket;
            if (editingId) {
                const response = await bucketManagerService.updateBucket(editingId, bucketData);
                savedBucket = response.bucket;
                toast.success('Bucket updated');
            } else {
                const response = await bucketManagerService.createBucket(bucketData);
                savedBucket = response.bucket;
                toast.success('Bucket added');
            }
            
            resetForm();
            await loadBuckets();
            
            // Pass the saved bucket to parent for auto-selection
            if (onBucketAdded && savedBucket) {
                onBucketAdded(savedBucket);
            }
        } catch (error) {
            console.error('Failed to save bucket:', error);
            toast.error(error.message || 'Failed to save bucket');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteBucket = async () => {
        if (!deleteConfirm) return;

        try {
            setIsLoading(true);
            await bucketManagerService.deleteBucket(deleteConfirm.id);
            toast.success('Bucket deleted');
            setDeleteConfirm(null);
            loadBuckets();
        } catch (error) {
            console.error('Failed to delete bucket:', error);
            toast.error(error.message || 'Failed to delete bucket');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditBucket = (bucket) => {
        setFormData({
            name: bucket.displayName,
            bucketName: bucket.bucketName,
            region: bucket.region,
            accessKeyId: '',
            secretAccessKey: '',
            description: bucket.description || ''
        });
        setEditingId(bucket.id);
        setShowForm(true);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-800">
                <DialogHeader>
                    <DialogTitle>Manage Buckets</DialogTitle>
                    <DialogDescription>
                        Add, edit, or delete AWS S3 buckets
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Bucket List */}
                    <AnimatePresence mode="wait">
                        {!showForm ? (
                            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {isLoading && buckets.length === 0 ? (
                                        <div className="flex justify-center py-8">
                                            <Loading03Icon className="w-5 h-5 animate-spin" />
                                        </div>
                                    ) : buckets.length > 0 ? (
                                        buckets.map((bucket) => (
                                            <div
                                                key={bucket.id}
                                                className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium">{bucket.displayName}</div>
                                                    <div className="text-sm text-zinc-400">{bucket.bucketName} • {bucket.region}</div>
                                                    {bucket.isDefault && (
                                                        <div className="text-xs text-emerald-400 mt-1">Default</div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        onClick={() => handleEditBucket(bucket)}
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        title="Edit"
                                                    >
                                                        <Edit02Icon className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => setDeleteConfirm({ id: bucket.id, name: bucket.displayName })}
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-400 hover:bg-red-900/30"
                                                        title="Delete"
                                                    >
                                                        <Delete01Icon className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-zinc-500">
                                            No buckets configured yet
                                        </div>
                                    )}
                                </div>

                                <Button
                                    onClick={() => setShowForm(true)}
                                    className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700"
                                >
                                    + Add New Bucket
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="space-y-4">
                                    {/* Form Fields */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Bucket Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., My S3 Bucket"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-emerald-500 outline-none transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">AWS Bucket Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., my-bucket-name"
                                            value={formData.bucketName}
                                            onChange={(e) => setFormData({ ...formData, bucketName: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-emerald-500 outline-none transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Region</label>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-between bg-zinc-800 border-zinc-700 hover:border-emerald-500 hover:bg-zinc-800"
                                                >
                                                    <span className="text-sm">
                                                        {AWS_REGIONS.find(r => r.value === formData.region)?.label || 'Select Region'}
                                                    </span>
                                                    <ArrowDown01Icon className="w-4 h-4 opacity-50" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent 
                                                className="w-[var(--radix-dropdown-menu-trigger-width)] bg-zinc-900 border-zinc-800 p-2 max-h-[300px]"
                                                align="start"
                                                sideOffset={4}
                                            >
                                                {AWS_REGIONS.map((region) => (
                                                    <DropdownMenuItem
                                                        key={region.value}
                                                        className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800 rounded-md px-3 py-2 mb-1 last:mb-0"
                                                        onSelect={() => setFormData({ ...formData, region: region.value })}
                                                    >
                                                        {region.label}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Access Key ID</label>
                                        <input
                                            type="text"
                                            placeholder="AWS Access Key"
                                            value={formData.accessKeyId}
                                            onChange={(e) => setFormData({ ...formData, accessKeyId: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-emerald-500 outline-none transition-colors font-mono text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Secret Access Key</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type={showSecrets[editingId] ? 'text' : 'password'}
                                                placeholder="AWS Secret Key"
                                                value={formData.secretAccessKey}
                                                onChange={(e) => setFormData({ ...formData, secretAccessKey: e.target.value })}
                                                className="flex-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-emerald-500 outline-none transition-colors font-mono text-sm"
                                            />
                                            <Button
                                                onClick={() => setShowSecrets({
                                                    ...showSecrets,
                                                    [editingId]: !showSecrets[editingId]
                                                })}
                                                variant="ghost"
                                                size="icon"
                                                className="h-10 w-10"
                                            >
                                                <EyeIcon className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                                        <textarea
                                            placeholder="e.g., Production files, backups..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-emerald-500 outline-none transition-colors resize-none"
                                            rows="2"
                                        />
                                    </div>

                                    {/* Validation Status */}
                                    {validationState.isValid !== null && (
                                        <div className={`flex items-center gap-2 p-3 rounded-lg ${
                                            validationState.isValid
                                                ? 'bg-emerald-900/30 border border-emerald-800'
                                                : 'bg-red-900/30 border border-red-800'
                                        }`}>
                                            {validationState.isValid ? (
                                                <>
                                                    <CheckmarkCircle01Icon className="w-5 h-5 text-emerald-400" />
                                                    <span className="text-sm text-emerald-300">Bucket access validated</span>
                                                </>
                                            ) : (
                                                <>
                                                    <AlertCircleIcon className="w-5 h-5 text-red-400" />
                                                    <span className="text-sm text-red-300">{validationState.error}</span>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 justify-end pt-4">
                                        <Button
                                            onClick={resetForm}
                                            variant="outline"
                                            disabled={isLoading || validationState.isValidating}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={validateBucket}
                                            variant="secondary"
                                            disabled={isLoading || !formData.bucketName}
                                            className="gap-2"
                                        >
                                            {validationState.isValidating && (
                                                <Loading03Icon className="w-4 h-4 animate-spin" />
                                            )}
                                            Test Connection
                                        </Button>
                                        <Button
                                            onClick={handleSaveBucket}
                                            disabled={isLoading || validationState.isValid !== true}
                                            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                                        >
                                            {isLoading && <Loading03Icon className="w-4 h-4 animate-spin" />}
                                            {editingId ? 'Update Bucket' : 'Add Bucket'}
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
                <DialogContent className="max-w-md bg-zinc-900 border-zinc-800">
                    <DialogHeader>
                        <DialogTitle className="text-red-400">Delete Bucket</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deleteConfirm?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-3 justify-end mt-4">
                        <Button
                            onClick={() => setDeleteConfirm(null)}
                            variant="outline"
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeleteBucket}
                            disabled={isLoading}
                            className="bg-red-600 hover:bg-red-700 gap-2"
                        >
                            {isLoading && <Loading03Icon className="w-4 h-4 animate-spin" />}
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Dialog>
    );
};

export default BucketManagerModal;
