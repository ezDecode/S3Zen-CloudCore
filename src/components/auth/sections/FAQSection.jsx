import { motion } from 'framer-motion';
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent
} from '../../ui/accordion';

/**
 * SETUP GUIDE SECTION - AWS Configuration Steps
 * 
 * PURPOSE: Guide users through AWS S3 setup process
 * 
 * DESIGN DECISIONS:
 * - Accordion format: Space-efficient, user-controlled disclosure
 * - Step-by-step instructions: Clear, actionable guidance
 * - Code blocks: Easy to copy configurations
 */

const setupSteps = [
    {
        id: 'credentials',
        number: '01',
        title: 'Getting AWS Credentials',
        content: (
            <div className="space-y-4">
                <p className="text-white/80 font-normal">Follow these steps to create AWS Access Keys:</p>
                <ol className="list-decimal list-inside space-y-2.5 text-white/60">
                    <li>Sign in to the <a href="https://console.aws.amazon.com/" target="_blank" rel="noopener noreferrer" className="text-white/90 hover:text-white underline underline-offset-2 decoration-white/30">AWS Management Console</a></li>
                    <li>Click on your account name in the top-right corner</li>
                    <li>Select <code className="font-mono bg-white/10 px-2 py-0.5 rounded text-white/80 text-xs">Security credentials</code></li>
                    <li>Scroll down to <span className="font-normal text-white/80">Access keys</span> section</li>
                    <li>Click <code className="font-mono bg-white/10 px-2 py-0.5 rounded text-white/80 text-xs">Create access key</code></li>
                    <li>Select use case: <code className="font-mono bg-white/10 px-2 py-0.5 rounded text-white/80 text-xs">Command Line Interface (CLI)</code></li>
                    <li>Check the confirmation checkbox and click <span className="font-normal text-white/80">Next</span></li>
                    <li>Add a description tag (optional) and click <span className="font-normal text-white/80">Create access key</span></li>
                    <li className="text-amber-400/90 font-normal">⚠️ Download or copy both the Access Key ID and Secret Access Key - you won't be able to see the secret again!</li>
                </ol>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mt-4">
                    <p className="text-sm text-emerald-200/90">
                        <strong>💡 Best Practice:</strong> For production use, create an IAM user with limited permissions instead of using root account credentials.
                    </p>
                </div>
            </div>
        )
    },
    {
        id: 'bucket',
        number: '02',
        title: 'Creating an S3 Bucket',
        content: (
            <div className="space-y-4">
                <ol className="list-decimal list-inside space-y-2.5 text-white/60">
                    <li>Go to <a href="https://s3.console.aws.amazon.com/s3/" target="_blank" rel="noopener noreferrer" className="text-white/90 hover:text-white underline underline-offset-2 decoration-white/30">S3 Console</a></li>
                    <li>Click <code className="font-mono bg-white/10 px-2 py-0.5 rounded text-white/80 text-xs">Create bucket</code></li>
                    <li>Enter a unique bucket name (e.g., <code className="font-mono text-white/80">my-cloudcore-files</code>)</li>
                    <li>Select your preferred AWS Region</li>
                    <li>
                        <span className="font-normal text-white/80">Block Public Access settings:</span>
                        <ul className="list-disc list-inside ml-5 mt-2 space-y-1.5">
                            <li>Keep "Block all public access" <span className="text-emerald-400 font-normal">ENABLED</span></li>
                            <li>CloudCore uses your credentials for private access</li>
                        </ul>
                    </li>
                    <li>Keep other settings as default</li>
                    <li>Click <code className="font-mono bg-white/10 px-2 py-0.5 rounded text-white/80 text-xs">Create bucket</code></li>
                </ol>
            </div>
        )
    },
    {
        id: 'cors',
        number: '03',
        title: 'Configuring CORS',
        content: (
            <div className="space-y-4">
                <p className="text-white/80">
                    CORS (Cross-Origin Resource Sharing) must be configured to allow CloudCore to access your S3 bucket from the browser.
                </p>
                <ol className="list-decimal list-inside space-y-2.5 text-white/60">
                    <li>Open your bucket in the S3 Console</li>
                    <li>Go to the <code className="font-mono bg-white/10 px-2 py-0.5 rounded text-white/80 text-xs">Permissions</code> tab</li>
                    <li>Scroll down to <span className="font-normal text-white/80">Cross-origin resource sharing (CORS)</span></li>
                    <li>Click <code className="font-mono bg-white/10 px-2 py-0.5 rounded text-white/80 text-xs">Edit</code></li>
                    <li>Paste the following CORS configuration:</li>
                </ol>
                <pre className="bg-black/60 border border-white/10 rounded-xl p-4 overflow-x-auto text-sm font-mono text-white/90 mt-3">
{`[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag"],
        "MaxAgeSeconds": 3000
    }
]`}
                </pre>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                    <p className="text-sm text-amber-200/90">
                        <strong>⚠️ Security Note:</strong> The above configuration uses AllowedOrigins: ["*"] for development. For production, replace with your specific domain.
                    </p>
                </div>
            </div>
        )
    },
    {
        id: 'iam',
        number: '04',
        title: 'IAM Permissions Policy',
        content: (
            <div className="space-y-4">
                <p className="text-white/80">
                    For better security, create a dedicated IAM user with limited permissions instead of using root credentials.
                </p>
                <p className="text-white/80 font-normal mt-4">Creating an IAM User:</p>
                <ol className="list-decimal list-inside space-y-2.5 text-white/60">
                    <li>Go to <a href="https://console.aws.amazon.com/iam/" target="_blank" rel="noopener noreferrer" className="text-white/90 hover:text-white underline underline-offset-2 decoration-white/30">IAM Console</a></li>
                    <li>Click <code className="font-mono bg-white/10 px-2 py-0.5 rounded text-white/80 text-xs">Users</code> → <code className="font-mono bg-white/10 px-2 py-0.5 rounded text-white/80 text-xs">Create user</code></li>
                    <li>Enter a username (e.g., <code className="font-mono text-white/80">cloudcore-user</code>)</li>
                    <li>Click <span className="font-normal text-white/80">Next</span></li>
                    <li>Select <code className="font-mono bg-white/10 px-2 py-0.5 rounded text-white/80 text-xs">Attach policies directly</code></li>
                    <li>Click <code className="font-mono bg-white/10 px-2 py-0.5 rounded text-white/80 text-xs">Create policy</code> (opens new tab)</li>
                    <li>Switch to the <code className="font-mono bg-white/10 px-2 py-0.5 rounded text-white/80 text-xs">JSON</code> tab</li>
                    <li>Paste the policy below (replace <span className="font-mono text-amber-300">YOUR_BUCKET_NAME</span>):</li>
                </ol>
                <pre className="bg-black/60 border border-white/10 rounded-xl p-4 overflow-x-auto text-sm font-mono text-white/90 mt-3">
{`{
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
}`}
                </pre>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-3">
                    <p className="text-sm text-white/70 font-normal mb-2">What this policy allows:</p>
                    <ul className="list-disc list-inside space-y-1.5 text-sm text-white/60">
                        <li>List bucket contents and get bucket information</li>
                        <li>Upload, download, and delete files</li>
                        <li>Handle multipart uploads for large files</li>
                    </ul>
                </div>
            </div>
        )
    },
    {
        id: 'region',
        number: '05',
        title: 'AWS Region Selection',
        content: (
            <div className="space-y-4">
                <p className="text-white/80">
                    Choose the AWS region where your S3 bucket is located. Common regions include:
                </p>
                <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/[0.07] transition-colors">
                        <code className="font-mono text-white/90 text-sm">us-east-1</code>
                        <span className="text-white/50 ml-2 text-sm">N. Virginia</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/[0.07] transition-colors">
                        <code className="font-mono text-white/90 text-sm">us-west-2</code>
                        <span className="text-white/50 ml-2 text-sm">Oregon</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/[0.07] transition-colors">
                        <code className="font-mono text-white/90 text-sm">eu-west-1</code>
                        <span className="text-white/50 ml-2 text-sm">Ireland</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/[0.07] transition-colors">
                        <code className="font-mono text-white/90 text-sm">ap-south-1</code>
                        <span className="text-white/50 ml-2 text-sm">Mumbai</span>
                    </div>
                </div>
                <p className="text-sm text-white/50 mt-3">
                    💡 Choose a region close to your users for better performance. Find your bucket's region in the S3 Console.
                </p>
            </div>
        )
    }
];

export const FAQSection = () => {
    return (
        <section id="setup-guide" className="relative w-full py-20 sm:py-28 lg:py-36 bg-black overflow-hidden">
            {/* Premium separation line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-12">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    className="text-center mb-14 sm:mb-18 lg:mb-20"
                >
                    <span className="inline-block text-xs sm:text-sm font-normal text-white/40 uppercase tracking-widest mb-4">
                        Setup Guide
                    </span>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal text-white mb-4 sm:mb-6 tracking-tight">
                        The boring <span className="text-white/40">AWS stuff</span>
                    </h2>
                    <p className="text-lg sm:text-xl lg:text-2xl text-white/50 max-w-2xl mx-auto">
                        Follow these steps to set up your AWS credentials and start managing your S3 buckets
                    </p>
                </motion.div>

                {/* Setup Guide Accordion */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
                >
                    <Accordion type="single" collapsible defaultValue="credentials" className="space-y-4">
                        {setupSteps.map((step, index) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{
                                    duration: 0.4,
                                    delay: index * 0.05,
                                    ease: [0.4, 0, 0.2, 1]
                                }}
                            >
                                <AccordionItem
                                    value={step.id}
                                    className="border border-white/[0.08] rounded-2xl overflow-hidden bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-colors"
                                >
                                    <AccordionTrigger className="w-full flex items-center justify-between px-6 sm:px-8 py-5 sm:py-6 text-left hover:bg-white/[0.02] transition-colors">
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-mono text-white/30">{step.number}</span>
                                            <span className="text-base sm:text-lg font-normal text-white/90">
                                                {step.title}
                                            </span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 sm:px-8 pb-6 sm:pb-8 text-sm sm:text-base leading-relaxed">
                                        {step.content}
                                    </AccordionContent>
                                </AccordionItem>
                            </motion.div>
                        ))}
                    </Accordion>
                </motion.div>
            </div>
        </section>
    );
};
