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
    EyeIcon
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
import bucketManagerService from '../../services/bucketManagerService';

export const BucketManagerModal = ({ isOpen, onClose, onBucketAdded }) => {
    const [buckets, setBuckets] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [showSecrets, setShowSecrets] = useState({});

    const [formData, setFormData] = useState({
        name: '',
        bucketName: '',
        region: 'us-east-1',
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
            loadBuckets();
        }
    }, [isOpen]);

    const loadBuckets = async () => {
        setIsLoading(true);
        try {
            const response = await bucketManagerService.getBuckets();
            setBuckets(response.data || []);
        } catch (error) {
            console.error('Failed to load buckets:', error);
            toast.error('Failed to load buckets');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            bucketName: '',
            region: 'us-east-1',
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
            if (editingId) {
                await bucketManagerService.updateBucket(editingId, formData);
                toast.success('Bucket updated');
            } else {
                await bucketManagerService.createBucket(formData);
                toast.success('Bucket added');
            }
            resetForm();
            loadBuckets();
            onBucketAdded?.();
        } catch (error) {
            console.error('Failed to save bucket:', error);
            toast.error(error.message || 'Failed to save bucket');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteBucket = async (bucketId) => {
        if (!confirm('Delete this bucket? This cannot be undone.')) return;

        try {
            setIsLoading(true);
            await bucketManagerService.deleteBucket(bucketId);
            toast.success('Bucket deleted');
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
            name: bucket.name,
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
                                                    <div className="font-medium">{bucket.name}</div>
                                                    <div className="text-sm text-zinc-400">{bucket.bucketName} • {bucket.region}</div>
                                                    {bucket.isDefault && (
                                                        <div className="text-xs text-emerald-400 mt-1">Default</div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEditBucket(bucket)}
                                                        className="p-2 hover:bg-zinc-700 rounded transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit02Icon className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteBucket(bucket.id)}
                                                        className="p-2 hover:bg-red-900/30 rounded transition-colors text-red-400"
                                                        title="Delete"
                                                    >
                                                        <Delete01Icon className="w-4 h-4" />
                                                    </button>
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
                                        <select
                                            value={formData.region}
                                            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-emerald-500 outline-none transition-colors"
                                        >
                                            <option value="us-east-1">US East (N. Virginia)</option>
                                            <option value="us-west-1">US West (N. California)</option>
                                            <option value="us-west-2">US West (Oregon)</option>
                                            <option value="eu-west-1">EU (Ireland)</option>
                                            <option value="eu-central-1">EU (Frankfurt)</option>
                                            <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                                            <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
                                        </select>
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
                                            <button
                                                onClick={() => setShowSecrets({
                                                    ...showSecrets,
                                                    [editingId]: !showSecrets[editingId]
                                                })}
                                                className="p-2 hover:bg-zinc-700 rounded transition-colors"
                                            >
                                                {showSecrets[editingId] ? (
                                                    <EyeIcon className="w-4 h-4" />
                                                ) : (
                                                    <EyeIcon className="w-4 h-4" />
                                                )}
                                            </button>
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
        </Dialog>
    );
};

export default BucketManagerModal;
