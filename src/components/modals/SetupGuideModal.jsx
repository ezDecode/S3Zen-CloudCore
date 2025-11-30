/**
 * SetupGuideModal Component
 * Comprehensive guide for AWS S3 setup, credentials, CORS, and IAM configuration
 */

import { useState } from 'react';
import { Cancel01Icon, Book02Icon, Copy01Icon, Tick02Icon } from 'hugeicons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '../ui/accordion';

export const SetupGuideModal = ({ isOpen, onClose }) => {
    const [copied, setCopied] = useState('');

    const handleCopy = (text, label) => {
        try {
            navigator.clipboard.writeText(text);
            setCopied(label);
            toast.success(`${label} copied to clipboard`);
            setTimeout(() => setCopied(''), 2000);
        } catch (e) {
            toast.error('Unable to copy to clipboard');
        }
    };

    // CORS Configuration JSON
    const corsConfig = `[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag"],
        "MaxAgeSeconds": 3000
    }
]`;

    // IAM Policy JSON
    const iamPolicy = `{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket",
                "s3:GetBucketLocation",
                "s3:GetBucketCors"
            ],
            "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListMultipartUploadParts",
                "s3:AbortMultipartUpload"
            ],
            "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
        }
    ]
}`;

    const CodeBlock = ({ code, label }) => (
        <div className="relative">
            <pre className="bg-black/40 border border-white/10 rounded-lg p-3 overflow-x-auto text-xs font-mono text-white/90">
                {code}
            </pre>
            <button
                onClick={() => handleCopy(code, label)}
                className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 rounded-md transition-all"
                title="Copy to clipboard"
            >
                {copied === label ? (
                    <Tick02Icon className="w-4 h-4 text-green-400" />
                ) : (
                    <Copy01Icon className="w-4 h-4 text-white/70" />
                )}
            </button>
        </div>
    );

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            transition: {
                                duration: 0.32,
                                ease: [0.16, 1, 0.3, 1]
                            }
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.95,
                            y: 10,
                            transition: {
                                duration: 0.22,
                                ease: [0.4, 0, 1, 1]
                            }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-zinc-900/98 backdrop-blur-2xl rounded-2xl shadow-2xl w-full max-w-3xl border border-white/10 z-50 overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-white/8 shrink-0">
                            <div className="flex items-center gap-2.5">
                                <Book02Icon className="w-6 h-6 text-white/70" />
                                <h2 className="text-xl font-bold text-white">AWS Setup Guide</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                            >
                                <Cancel01Icon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-5 space-y-4 overflow-y-auto flex-1">
                            {/* Introduction */}
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <p className="text-sm text-white/90 leading-relaxed">
                                    Welcome to CloudCore! This guide will help you set up your AWS account to work seamlessly with our S3 file manager. Follow the steps below to get started.
                                </p>
                            </div>

                            <Accordion type="single" collapsible defaultValue="credentials" className="space-y-3">
                                {/* Section 1: AWS Credentials */}
                                <AccordionItem value="credentials" className="border border-white/8 rounded-xl overflow-hidden bg-white/3">
                                    <AccordionTrigger className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors [&[data-state=open]>svg]:rotate-180">
                                        <div className="flex items-center gap-2.5">
                                            <Book02Icon className="w-5 h-5 text-white/60" />
                                            <h3 className="text-base font-semibold text-white">1. Getting AWS Credentials</h3>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4 space-y-3 text-sm text-white/80">
                                        <p className="text-white/90 font-medium">Follow these steps to create AWS Access Keys:</p>

                                        <ol className="list-decimal list-inside space-y-2 text-white/80">
                                            <li>
                                                Sign in to the{' '}
                                                <a
                                                    href="https://console.aws.amazon.com/"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-white hover:text-white/80 underline"
                                                >
                                                    AWS Management Console
                                                </a>
                                            </li>
                                            <li>Click on your account name in the top-right corner</li>
                                            <li>Select <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-xs">Security credentials</span></li>
                                            <li>Scroll down to <span className="font-semibold">Access keys</span> section</li>
                                            <li>Click <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-xs">Create access key</span></li>
                                            <li>Select use case: <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-xs">Command Line Interface (CLI)</span></li>
                                            <li>Check the confirmation checkbox and click <span className="font-semibold">Next</span></li>
                                            <li>Add a description tag (optional) and click <span className="font-semibold">Create access key</span></li>
                                            <li className="text-yellow-400 font-medium">
                                                ⚠️ Download or copy both the <span className="font-mono">Access Key ID</span> and <span className="font-mono">Secret Access Key</span> - you won't be able to see the secret again!
                                            </li>
                                        </ol>

                                        <div className="bg-white/5 border border-white/10 rounded-lg p-3 mt-3">
                                            <p className="text-xs text-white/70">
                                                <strong>💡 Best Practice:</strong> For production use, create an IAM user with limited permissions instead of using root account credentials. See the IAM Permissions section below.
                                            </p>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Section 2: S3 Bucket Setup */}
                                <AccordionItem value="bucket" className="border border-white/8 rounded-xl overflow-hidden bg-white/3">
                                    <AccordionTrigger className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors [&[data-state=open]>svg]:rotate-180">
                                        <div className="flex items-center gap-2.5">
                                            <Book02Icon className="w-5 h-5 text-white/60" />
                                            <h3 className="text-base font-semibold text-white">2. Creating an S3 Bucket</h3>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4 space-y-3 text-sm text-white/80">
                                        <ol className="list-decimal list-inside space-y-2 text-white/80">
                                            <li>
                                                Go to{' '}
                                                <a
                                                    href="https://s3.console.aws.amazon.com/s3/"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-white hover:text-white/80 underline"
                                                >
                                                    S3 Console
                                                </a>
                                            </li>
                                            <li>Click <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-xs">Create bucket</span></li>
                                            <li>Enter a unique bucket name (e.g., <span className="font-mono">my-cloudcore-files</span>)</li>
                                            <li>Select your preferred AWS Region</li>
                                            <li>
                                                <strong>Block Public Access settings:</strong>
                                                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                                                    <li>Keep "Block all public access" <span className="text-green-400 font-medium">ENABLED</span></li>
                                                    <li>CloudCore uses your credentials for private access</li>
                                                </ul>
                                            </li>
                                            <li>Keep other settings as default</li>
                                            <li>Click <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-xs">Create bucket</span></li>
                                        </ol>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Section 3: CORS Configuration */}
                                <AccordionItem value="cors" className="border border-white/8 rounded-xl overflow-hidden bg-white/3">
                                    <AccordionTrigger className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors [&[data-state=open]>svg]:rotate-180">
                                        <div className="flex items-center gap-2.5">
                                            <Book02Icon className="w-5 h-5 text-white/60" />
                                            <h3 className="text-base font-semibold text-white">3. Configuring CORS</h3>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4 space-y-3 text-sm text-white/80">
                                        <p className="text-white/90">
                                            CORS (Cross-Origin Resource Sharing) must be configured to allow CloudCore to access your S3 bucket from the browser.
                                        </p>

                                        <ol className="list-decimal list-inside space-y-2 text-white/80">
                                            <li>Open your bucket in the S3 Console</li>
                                            <li>Go to the <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-xs">Permissions</span> tab</li>
                                            <li>Scroll down to <span className="font-semibold">Cross-origin resource sharing (CORS)</span></li>
                                            <li>Click <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-xs">Edit</span></li>
                                            <li>Paste the following CORS configuration:</li>
                                        </ol>

                                        <CodeBlock code={corsConfig} label="CORS Configuration" />

                                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                                            <p className="text-xs text-amber-200/90">
                                                <strong>⚠️ Security Note:</strong> The above configuration uses <span className="font-mono">AllowedOrigins: ["*"]</span> for development. For production, replace <span className="font-mono">["*"]</span> with your specific domain, e.g., <span className="font-mono">["https://yourdomain.com"]</span>
                                            </p>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Section 4: IAM Permissions */}
                                <AccordionItem value="iam" className="border border-white/8 rounded-xl overflow-hidden bg-white/3">
                                    <AccordionTrigger className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors [&[data-state=open]>svg]:rotate-180">
                                        <div className="flex items-center gap-2.5">
                                            <Book02Icon className="w-5 h-5 text-white/60" />
                                            <h3 className="text-base font-semibold text-white">4. IAM Permissions Policy</h3>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4 space-y-3 text-sm text-white/80">
                                        <p className="text-white/90">
                                            For better security, create a dedicated IAM user with limited permissions instead of using root credentials.
                                        </p>

                                        <p className="text-white/90 font-medium">Creating an IAM User:</p>
                                        <ol className="list-decimal list-inside space-y-2 text-white/80">
                                            <li>
                                                Go to{' '}
                                                <a
                                                    href="https://console.aws.amazon.com/iam/"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-white hover:text-white/80 underline"
                                                >
                                                    IAM Console
                                                </a>
                                            </li>
                                            <li>Click <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-xs">Users</span> → <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-xs">Create user</span></li>
                                            <li>Enter a username (e.g., <span className="font-mono">cloudcore-user</span>)</li>
                                            <li>Click <span className="font-semibold">Next</span></li>
                                            <li>Select <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-xs">Attach policies directly</span></li>
                                            <li>Click <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-xs">Create policy</span> (opens new tab)</li>
                                            <li>Switch to the <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-xs">JSON</span> tab</li>
                                            <li>Paste the policy below (replace <span className="font-mono text-yellow-300">YOUR_BUCKET_NAME</span>):</li>
                                        </ol>

                                        <CodeBlock code={iamPolicy} label="IAM Policy" />

                                        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                                            <p className="text-xs text-white/70">
                                                <strong>What this policy allows:</strong>
                                            </p>
                                            <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-white/60">
                                                <li>List bucket contents and get bucket information</li>
                                                <li>Upload, download, and delete files</li>
                                                <li>Handle multipart uploads for large files</li>
                                            </ul>
                                        </div>

                                        <ol className="list-decimal list-inside space-y-2 text-white/80" start="9">
                                            <li>Click <span className="font-semibold">Next</span>, name the policy, and create it</li>
                                            <li>Return to the user creation tab, refresh policies, and attach your new policy</li>
                                            <li>Complete user creation</li>
                                            <li>Create access keys for this user (see Step 1)</li>
                                        </ol>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Section 5: Region Selection */}
                                <AccordionItem value="region" className="border border-white/8 rounded-xl overflow-hidden bg-white/3">
                                    <AccordionTrigger className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors [&[data-state=open]>svg]:rotate-180">
                                        <div className="flex items-center gap-2.5">
                                            <Book02Icon className="w-5 h-5 text-white/60" />
                                            <h3 className="text-base font-semibold text-white">5. AWS Region Selection</h3>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4 space-y-3 text-sm text-white/80">
                                        <p className="text-white/90">
                                            Choose the AWS region where your S3 bucket is located. Common regions include:
                                        </p>

                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="bg-white/5 border border-white/10 rounded-lg p-2">
                                                <span className="font-mono text-white/90">us-east-1</span>
                                                <span className="text-white/60 ml-2">N. Virginia</span>
                                            </div>
                                            <div className="bg-white/5 border border-white/10 rounded-lg p-2">
                                                <span className="font-mono text-white/90">us-west-2</span>
                                                <span className="text-white/60 ml-2">Oregon</span>
                                            </div>
                                            <div className="bg-white/5 border border-white/10 rounded-lg p-2">
                                                <span className="font-mono text-white/90">eu-west-1</span>
                                                <span className="text-white/60 ml-2">Ireland</span>
                                            </div>
                                            <div className="bg-white/5 border border-white/10 rounded-lg p-2">
                                                <span className="font-mono text-white/90">ap-south-1</span>
                                                <span className="text-white/60 ml-2">Mumbai</span>
                                            </div>
                                        </div>

                                        <p className="text-xs text-white/60">
                                            💡 Choose a region close to your users for better performance. Find your bucket's region in the S3 Console.
                                        </p>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            {/* Final Notes */}
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <h4 className="text-sm font-semibold text-white mb-2">✅ You're All Set!</h4>
                                <p className="text-xs text-white/80">
                                    Once you've completed these steps, click "Get Started" and enter your AWS credentials to begin managing your S3 files with CloudCore.
                                </p>
                            </div>

                            {/* Support Links */}
                            <div className="border-t border-white/8 pt-4">
                                <p className="text-xs text-white/50 text-center">
                                    Need help? Check out the{' '}
                                    <a
                                        href="https://docs.aws.amazon.com/s3/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-white/70 hover:text-white underline"
                                    >
                                        AWS S3 Documentation
                                    </a>
                                    {' '}or{' '}
                                    <a
                                        href="https://github.com/ezDecode/S3Zen-CloudCore/issues"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-white/70 hover:text-white underline"
                                    >
                                        open an issue on GitHub
                                    </a>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};