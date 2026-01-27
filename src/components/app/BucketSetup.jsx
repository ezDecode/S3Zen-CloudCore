/**
 * Bucket Setup
 * Modal-style configuration with stateful interactions
 */

import { useState } from 'react';
import bucketManagerService from '../../services/bucketManagerService';
import { toast } from 'sonner';
import { Icon } from '@iconify/react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export const BucketSetup = ({ user, onComplete, onBack }) => {
    const [formData, setFormData] = useState({
        bucketName: '',
        region: 'eu-north-1',
        accessKeyId: '',
        secretAccessKey: '',
        endpoint: ''
    });

    const [buttonState, setButtonState] = useState('idle'); // idle, loading, success

    const regions = [
        { value: 'us-east-1', label: 'US East (N. Virginia)' },
        { value: 'us-east-2', label: 'US East (Ohio)' },
        { value: 'us-west-1', label: 'US West (N. California)' },
        { value: 'us-west-2', label: 'US West (Oregon)' },
        { value: 'af-south-1', label: 'Africa (Cape Town)' },
        { value: 'ap-east-1', label: 'Asia Pacific (Hong Kong)' },
        { value: 'ap-south-1', label: 'Asia Pacific (Mumbai)' },
        { value: 'ap-northeast-3', label: 'Asia Pacific (Osaka)' },
        { value: 'ap-northeast-2', label: 'Asia Pacific (Seoul)' },
        { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
        { value: 'ap-southeast-2', label: 'Asia Pacific (Sydney)' },
        { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' },
        { value: 'ca-central-1', label: 'Canada (Central)' },
        { value: 'eu-central-1', label: 'Europe (Frankfurt)' },
        { value: 'eu-west-1', label: 'Europe (Ireland)' },
        { value: 'eu-west-2', label: 'Europe (London)' },
        { value: 'eu-south-1', label: 'Europe (Milan)' },
        { value: 'eu-west-3', label: 'Europe (Paris)' },
        { value: 'eu-north-1', label: 'Europe (Stockholm)' },
        { value: 'me-south-1', label: 'Middle East (Bahrain)' },
        { value: 'sa-east-1', label: 'South America (São Paulo)' },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        if (!formData.bucketName) return 'Bucket name is required';
        if (!formData.accessKeyId) return 'Access Key ID is required';
        if (!formData.secretAccessKey) return 'Secret Access Key is required';
        return null;
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        const validationError = validate();
        if (validationError) {
            toast.error(validationError);
            throw new Error(validationError); // interrupt stateful button
        }

        setButtonState('loading');

        try {
            const payload = {
                ...formData,
                displayName: formData.bucketName
            };

            // Small delay to let "establishing" text be seen if it was very fast
            await new Promise(r => setTimeout(r, 500));

            const verifyResult = await bucketManagerService.validateBucket(payload);
            if (!verifyResult.success) throw new Error(verifyResult.error || 'Connection failed');

            const saveResult = await bucketManagerService.addBucket(payload);
            if (!saveResult.success && saveResult.error) throw new Error(saveResult.error);

            setButtonState('success');
            const bucket = saveResult.bucket || saveResult;

            // Wait for success animation
            await new Promise(r => setTimeout(r, 1000));

            setFormData(prev => ({ ...prev, accessKeyId: '', secretAccessKey: '' }));
            onComplete(bucket);

        } catch (err) {
            setButtonState('idle');
            // Check for mock mode fallback
            if (bucketManagerService.useMock) {
                setButtonState('success');
                await new Promise(r => setTimeout(r, 1000));
                const bucketData = { bucketName: formData.bucketName, region: formData.region, id: 'mock-' + Date.now() };
                onComplete(bucketData);
                return;
            }

            toast.error(err.message || 'Failed to connect to cluster');
            throw err; // Re-throw to stop button success state if not mock
        }
    };

    return (
        <div className="fixed inset-0 z-[50] flex items-center justify-center bg-background/80 backdrop-blur-md p-4">
            <div className="w-full max-w-md bg-card shadow-2xl border border-border/50 rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-dotted border-border/50">
                    <div className="flex items-center gap-4">
                        <img src="/logos/logo-black.svg" alt="Orbit" className="h-8 block dark:hidden" />
                        <img src="/logos/logo-white.svg" alt="Orbit" className="h-8 hidden dark:block" />
                        <div className="h-6 w-px bg-border/50" />
                        <div>
                            <h2 className="font-display font-medium text-lg tracking-tight">
                                Storage Setup
                            </h2>
                        </div>
                    </div>

                    {onBack && (
                        <Button
                            onClick={onBack}
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <Icon icon="solar:close-circle-linear" className="w-5 h-5" />
                        </Button>
                    )}
                </div>

                {/* Body */}
                <div className="p-6">
                    <form className="space-y-5">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] tracking-widest uppercase font-semibold text-muted-foreground px-1">Bucket Name</label>
                                    <Input
                                        type="text"
                                        name="bucketName"
                                        value={formData.bucketName}
                                        onChange={handleChange}
                                        className="h-10 text-sm rounded-xl bg-background"
                                        placeholder="production-assets-s3"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] tracking-widest uppercase font-semibold text-muted-foreground px-1">Region</label>
                                    <Select
                                        name="region"
                                        value={formData.region}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}
                                    >
                                        <SelectTrigger className="h-10 w-full text-sm rounded-xl bg-background">
                                            <SelectValue placeholder="Select a region" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {regions.map(r => (
                                                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] tracking-widest uppercase font-semibold text-muted-foreground px-1">Access Key ID</label>
                                <Input
                                    type="text"
                                    name="accessKeyId"
                                    value={formData.accessKeyId}
                                    onChange={handleChange}
                                    className="h-10 text-sm rounded-xl font-mono bg-background"
                                    placeholder="AKIA..."
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] tracking-widest uppercase font-semibold text-muted-foreground px-1">Secret Access Key</label>
                                <Input
                                    type="password"
                                    name="secretAccessKey"
                                    value={formData.secretAccessKey}
                                    onChange={handleChange}
                                    className="h-10 text-sm rounded-xl font-mono bg-background"
                                    placeholder="••••••••••••••••••••••••••••"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={buttonState !== 'idle'}
                                className="w-full bg-brand hover:bg-brand/90 hover:ring-brand"
                            >
                                {buttonState === 'idle' && 'Establish Connection'}
                                {buttonState === 'loading' && 'Establishing...'}
                                {buttonState === 'success' && 'Successfully Established!'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BucketSetup;
