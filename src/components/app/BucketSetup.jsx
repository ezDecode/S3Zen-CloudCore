/**
 * bucket setup
 * ncdai design system implementation
 * aws configuration with grid lines and screen-line separators
 */

import { useState } from 'react';
import bucketManagerService from '../../services/bucketManagerService';
import { toast } from 'sonner';
import { Shield, Database, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';

/**
 * Separator component - diagonal striped pattern
 * Matches ncdai design system exactly
 */
function Separator({ className = '' }) {
    return (
        <div
            className={`relative flex h-8 w-full border-x border-edge ${className}`}
            style={{
                backgroundImage: 'repeating-linear-gradient(315deg, var(--pattern-foreground) 0, var(--pattern-foreground) 1px, transparent 0, transparent 50%)',
                backgroundSize: '10px 10px',
            }}
        >
            <div
                className="absolute -left-[100vw] top-0 w-[200vw] h-full -z-1"
                style={{
                    backgroundImage: 'repeating-linear-gradient(315deg, var(--pattern-foreground) 0, var(--pattern-foreground) 1px, transparent 0, transparent 50%)',
                    backgroundSize: '10px 10px',
                    opacity: 0.56,
                }}
            />
        </div>
    );
}

export const BucketSetup = ({ user, onComplete }) => {
    const [formData, setFormData] = useState({
        bucketName: '',
        region: 'eu-north-1',
        accessKeyId: '',
        secretAccessKey: '',
        endpoint: ''
    });

    const [loading, setLoading] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('idle');
    const [error, setError] = useState(null);

    const regions = [
        { value: 'us-east-1', label: 'us east (n. virginia)' },
        { value: 'us-east-2', label: 'us east (ohio)' },
        { value: 'us-west-1', label: 'us west (n. california)' },
        { value: 'us-west-2', label: 'us west (oregon)' },
        { value: 'af-south-1', label: 'africa (cape town)' },
        { value: 'ap-east-1', label: 'asia pacific (hong kong)' },
        { value: 'ap-south-1', label: 'asia pacific (mumbai)' },
        { value: 'ap-northeast-3', label: 'asia pacific (osaka)' },
        { value: 'ap-northeast-2', label: 'asia pacific (seoul)' },
        { value: 'ap-southeast-1', label: 'asia pacific (singapore)' },
        { value: 'ap-southeast-2', label: 'asia pacific (sydney)' },
        { value: 'ap-northeast-1', label: 'asia pacific (tokyo)' },
        { value: 'ca-central-1', label: 'canada (central)' },
        { value: 'eu-central-1', label: 'europe (frankfurt)' },
        { value: 'eu-west-1', label: 'europe (ireland)' },
        { value: 'eu-west-2', label: 'europe (london)' },
        { value: 'eu-south-1', label: 'europe (milan)' },
        { value: 'eu-west-3', label: 'europe (paris)' },
        { value: 'eu-north-1', label: 'europe (stockholm)' },
        { value: 'me-south-1', label: 'middle east (bahrain)' },
        { value: 'sa-east-1', label: 'south america (são paulo)' },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError(null);
    };

    const validate = () => {
        if (!formData.bucketName) return 'bucket name is required';
        if (!formData.accessKeyId) return 'access key id is required';
        if (!formData.secretAccessKey) return 'secret access key is required';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validate();
        if (validationError) { toast.error(validationError); return; }

        setLoading(true);
        setConnectionStatus('testing');
        setError(null);

        try {
            const verifyResult = await bucketManagerService.validateBucket(formData);
            if (verifyResult.success) {
                setConnectionStatus('success');
                toast.success('connection verified');
                const saveResult = await bucketManagerService.addBucket(formData);
                if (saveResult.success || (saveResult && !saveResult.error)) {
                    const bucket = saveResult.bucket || saveResult;
                    setTimeout(() => onComplete(bucket), 1000);
                } else { throw new Error(saveResult.error || 'failed to save'); }
            } else { throw new Error(verifyResult.error || 'connection failed'); }
        } catch (err) {
            if (bucketManagerService.useMock) {
                setConnectionStatus('success');
                onComplete({ ...formData, id: 'mock-' + Date.now() });
                return;
            }
            setConnectionStatus('error');
            setError(err.message || 'failed to connect to cluster');
        } finally { setLoading(false); }
    };

    return (
        <div className="max-w-screen overflow-x-hidden px-2">
            <div className="mx-auto border-x border-edge md:max-w-3xl min-h-screen flex flex-col">
                {/* top diagonal separator */}
                <Separator />

                {/* header */}
                <header className="screen-line-after px-4 py-4 flex items-center gap-3 opacity-60">
                    <Database className="w-4 h-4 text-brand" />
                    <span className="micro-label">infrastructure setup</span>
                </header>

                {/* main content */}
                <main className="flex-1 flex flex-col items-center justify-center py-12">
                    <div className="w-full max-w-md px-4 space-y-10">
                        {/* title section */}
                        <div className="space-y-4">
                            <h1 className="screen-line-after text-3xl tracking-tight lowercase pb-4" style={{ fontWeight: 500 }}>
                                cloud configuration
                            </h1>
                        </div>

                        <div className="p-0">
                            <p className="font-mono text-sm text-balance text-muted-foreground lowercase" style={{ fontWeight: 400, opacity: 0.7 }}>
                                enter your aws deployment parameters to synchronize with your storage infrastructure. keys are never stored in plaintext and remain strictly in-memory during this session.
                            </p>
                        </div>

                        <Separator />

                        {/* form */}
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 gap-8">
                                <div className="space-y-2">
                                    <label className="micro-label px-1">bucket name</label>
                                    <input
                                        type="text"
                                        name="bucketName"
                                        value={formData.bucketName}
                                        onChange={handleChange}
                                        className="input lowercase"
                                        placeholder="e.g. production-assets"
                                    />
                                </div>

                                {/* 2 column grid with background lines */}
                                <div className="relative">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2 text-left">
                                            <label className="micro-label px-1">data region</label>
                                            <select
                                                name="region"
                                                value={formData.region}
                                                onChange={handleChange}
                                                className="input appearance-none bg-background pr-10 lowercase"
                                            >
                                                {regions.map(r => (
                                                    <option key={r.value} value={r.value}>{r.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="micro-label px-1">access key id</label>
                                            <input
                                                type="text"
                                                name="accessKeyId"
                                                value={formData.accessKeyId}
                                                onChange={handleChange}
                                                className="input font-mono"
                                                placeholder="akia..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="micro-label px-1">secret access key</label>
                                    <input
                                        type="password"
                                        name="secretAccessKey"
                                        value={formData.secretAccessKey}
                                        onChange={handleChange}
                                        className="input font-mono"
                                        placeholder="••••••••••••••••"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="screen-line-before screen-line-after p-4 rounded-md bg-red-500/5 text-red-500 text-[10px] tracking-[0.1em] lowercase" style={{ fontWeight: 400, border: '1px dotted rgba(239, 68, 68, 0.2)' }}>
                                    {error}
                                </div>
                            )}

                            <div className="screen-line-before pt-6">
                                <button
                                    type="submit"
                                    disabled={loading || connectionStatus === 'success'}
                                    className="btn btn-brand w-full h-11 rounded-md text-[11px] tracking-[0.15em] lowercase"
                                >
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : connectionStatus === 'success' ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : (
                                        <>
                                            establish cluster
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>

                {/* diagonal separator */}
                <Separator />

                {/* footer */}
                <footer className="screen-line-before mt-auto">
                    <div className="px-4 py-6 flex items-center justify-between text-muted-foreground opacity-40">
                        <div className="flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5" />
                            <span className="micro-label">encrypted handshake protocol</span>
                        </div>
                        <span className="text-[9px] tracking-[0.1em] lowercase" style={{ fontWeight: 400 }}>© {new Date().getFullYear()} cloudcore lab</span>
                    </div>
                </footer>

                {/* bottom spacing */}
                <div className="h-4" />
            </div>
        </div>
    );
};

export default BucketSetup;
