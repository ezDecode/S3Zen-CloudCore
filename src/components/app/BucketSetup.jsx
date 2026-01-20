/**
 * Neo-Brutalism Bucket Setup
 * First-time bucket configuration with simple form
 */

import { useState } from 'react';
import { Cloud, Key, Globe, LogOut, Loader2, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import bucketManagerService from '../../services/bucketManagerService';
import { testS3Connection } from '../../services/aws/s3Client';
import { AWS_REGIONS, DEFAULT_REGION } from '../../config/awsRegions';

export const BucketSetup = ({ user, onBucketCreated, onLogout, onSkip, isFirstTime }) => {
    const [form, setForm] = useState({
        bucketName: '',
        accessKeyId: '',
        secretAccessKey: '',
        region: DEFAULT_REGION
    });
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);
    const [error, setError] = useState('');
    const [testResult, setTestResult] = useState(null);
    const [showHelp, setShowHelp] = useState(false);

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setError('');
        setTestResult(null);
    };

    // Validate bucket name format (S3 naming rules)
    const validateBucketName = (name) => {
        if (!name || name.length < 3 || name.length > 63) {
            return 'Bucket name must be 3-63 characters';
        }
        if (!/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(name)) {
            return 'Bucket name must start/end with letter or number';
        }
        if (/\.\./.test(name) || /--/.test(name)) {
            return 'Bucket name cannot have consecutive dots or hyphens';
        }
        if (/^\d+\.\d+\.\d+\.\d+$/.test(name)) {
            return 'Bucket name cannot be an IP address';
        }
        return null;
    };

    const handleTestConnection = async () => {
        if (!form.bucketName || !form.accessKeyId || !form.secretAccessKey) {
            setError('Please fill in all fields');
            return;
        }

        const bucketError = validateBucketName(form.bucketName);
        if (bucketError) {
            setError(bucketError);
            return;
        }

        setTesting(true);
        setError('');
        setTestResult(null);

        try {
            const result = await testS3Connection({
                accessKeyId: form.accessKeyId,
                secretAccessKey: form.secretAccessKey,
                bucketName: form.bucketName,
                region: form.region
            });

            if (result.success) {
                setTestResult({ success: true, message: 'Connection successful!' });
            } else {
                setTestResult({ success: false, message: result.error || 'Connection failed' });
            }
        } catch (err) {
            setTestResult({ success: false, message: err.message || 'Connection test failed' });
        } finally {
            setTesting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.bucketName || !form.accessKeyId || !form.secretAccessKey) {
            setError('Please fill in all required fields');
            return;
        }

        const bucketError = validateBucketName(form.bucketName);
        if (bucketError) {
            setError(bucketError);
            return;
        }

        setLoading(true);
        setError('');

        try {
            // First test connection
            const testResult = await testS3Connection({
                accessKeyId: form.accessKeyId,
                secretAccessKey: form.secretAccessKey,
                bucketName: form.bucketName,
                region: form.region
            });

            if (!testResult.success) {
                setError(testResult.error || 'Could not connect to bucket');
                setLoading(false);
                return;
            }

            // Save bucket configuration
            const result = await bucketManagerService.addBucket({
                bucketName: form.bucketName,
                accessKeyId: form.accessKeyId,
                secretAccessKey: form.secretAccessKey,
                region: form.region,
                isDefault: true
            });

            if (result.success) {
                onBucketCreated(result.bucket);
            } else {
                setError(result.error || 'Failed to save bucket configuration');
            }
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-cream)] pattern-dots">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[var(--color-cream)] border-b-4 border-[var(--border-color)]">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--color-primary)] border-3 border-[var(--border-color)] flex items-center justify-center shadow-[3px_3px_0_var(--border-color)]">
                            <Cloud className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-display font-bold text-xl">CloudCore</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-[var(--color-text-secondary)] hidden sm:block">
                            {user?.email}
                        </span>
                        <button
                            onClick={onLogout}
                            className="btn btn-ghost btn-sm"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Sign Out</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-2xl mx-auto px-6 py-12">
                {/* Title */}
                <div className="text-center mb-12">
                    <h1 className="font-display text-4xl md:text-5xl font-bold uppercase mb-4">
                        {isFirstTime ? 'Connect Your Bucket' : 'Manage Bucket'}
                    </h1>
                    <p className="text-lg text-[var(--color-text-secondary)]">
                        {isFirstTime
                            ? "Let's connect your AWS S3 bucket. You'll only need to do this once."
                            : "Update your bucket configuration below."
                        }
                    </p>
                </div>

                {/* Help Card */}
                <div className="card mb-8">
                    <button
                        onClick={() => setShowHelp(!showHelp)}
                        className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors w-full"
                    >
                        <HelpCircle className="w-5 h-5" />
                        <span className="font-bold">Where do I find these credentials?</span>
                    </button>

                    {showHelp && (
                        <div className="mt-4 pt-4 border-t-2 border-[var(--border-color)] text-sm text-[var(--color-text-secondary)] space-y-2">
                            <p><strong>1.</strong> Go to AWS Console → IAM → Users</p>
                            <p><strong>2.</strong> Create a new user or select existing</p>
                            <p><strong>3.</strong> Go to Security credentials → Create access key</p>
                            <p><strong>4.</strong> Copy your Access Key ID and Secret Access Key</p>
                            <p><strong>5.</strong> Make sure the user has S3 permissions for your bucket</p>
                        </div>
                    )}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="card-elevated">
                    {/* Bucket Name */}
                    <div className="mb-6">
                        <label className="block font-display font-bold uppercase text-sm mb-2">
                            <Globe className="w-4 h-4 inline mr-2" />
                            Bucket Name
                        </label>
                        <input
                            type="text"
                            value={form.bucketName}
                            onChange={(e) => handleChange('bucketName', e.target.value)}
                            placeholder="my-awesome-bucket"
                            className="input"
                            required
                        />
                    </div>

                    {/* Access Key ID */}
                    <div className="mb-6">
                        <label className="block font-display font-bold uppercase text-sm mb-2">
                            <Key className="w-4 h-4 inline mr-2" />
                            Access Key ID
                        </label>
                        <input
                            type="text"
                            value={form.accessKeyId}
                            onChange={(e) => handleChange('accessKeyId', e.target.value)}
                            placeholder="AKIAIOSFODNN7EXAMPLE"
                            className="input font-mono"
                            required
                        />
                    </div>

                    {/* Secret Access Key */}
                    <div className="mb-6">
                        <label className="block font-display font-bold uppercase text-sm mb-2">
                            <Key className="w-4 h-4 inline mr-2" />
                            Secret Access Key
                        </label>
                        <input
                            type="password"
                            value={form.secretAccessKey}
                            onChange={(e) => handleChange('secretAccessKey', e.target.value)}
                            placeholder="••••••••••••••••••••"
                            className="input font-mono"
                            required
                        />
                    </div>

                    {/* Region */}
                    <div className="mb-6">
                        <label className="block font-display font-bold uppercase text-sm mb-2">
                            <Globe className="w-4 h-4 inline mr-2" />
                            AWS Region
                        </label>
                        <select
                            value={form.region}
                            onChange={(e) => handleChange('region', e.target.value)}
                            className="input cursor-pointer"
                        >
                            <optgroup label="🌍 Europe">
                                {AWS_REGIONS.filter(r => r.group === 'Europe').map(region => (
                                    <option key={region.value} value={region.value}>
                                        {region.label} ({region.value})
                                    </option>
                                ))}
                            </optgroup>
                            <optgroup label="🌎 Americas">
                                {AWS_REGIONS.filter(r => r.group === 'Americas').map(region => (
                                    <option key={region.value} value={region.value}>
                                        {region.label} ({region.value})
                                    </option>
                                ))}
                            </optgroup>
                            <optgroup label="🌏 Asia Pacific">
                                {AWS_REGIONS.filter(r => r.group === 'Asia Pacific').map(region => (
                                    <option key={region.value} value={region.value}>
                                        {region.label} ({region.value})
                                    </option>
                                ))}
                            </optgroup>
                            <optgroup label="🌍 Middle East & Africa">
                                {AWS_REGIONS.filter(r => r.group === 'Middle East & Africa').map(region => (
                                    <option key={region.value} value={region.value}>
                                        {region.label} ({region.value})
                                    </option>
                                ))}
                            </optgroup>
                        </select>
                        <p className="text-xs text-[var(--color-text-muted)] mt-2">
                            31 regions available worldwide
                        </p>
                    </div>

                    {/* Test Connection Result */}
                    {testResult && (
                        <div className={`flex items-center gap-2 p-4 mb-6 border-3 border-[var(--border-color)] ${testResult.success
                            ? 'bg-[var(--color-success)]/20'
                            : 'bg-[var(--color-error)]/20'
                            }`}>
                            {testResult.success ? (
                                <CheckCircle className="w-5 h-5 text-[var(--color-success)]" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-[var(--color-error)]" />
                            )}
                            <span className="font-medium">{testResult.message}</span>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="badge badge-error w-full justify-center mb-6">
                            {error}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            type="button"
                            onClick={handleTestConnection}
                            disabled={testing || loading}
                            className="btn btn-outline flex-1"
                        >
                            {testing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'Test Connection'
                            )}
                        </button>
                        <button
                            type="submit"
                            disabled={loading || testing}
                            className="btn btn-primary flex-1"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'Save & Continue'
                            )}
                        </button>
                    </div>

                    {/* Skip Option */}
                    {!isFirstTime && onSkip && (
                        <button
                            type="button"
                            onClick={onSkip}
                            className="btn btn-ghost w-full mt-4"
                        >
                            Cancel
                        </button>
                    )}
                </form>

                {/* Security Note */}
                <div className="mt-8 text-center text-sm text-[var(--color-text-muted)]">
                    <p>
                        🔒 Your credentials are encrypted with AES-256 before storage.
                        <br />
                        They never leave our secure backend.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default BucketSetup;
