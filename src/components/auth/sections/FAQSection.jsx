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
 * - Matches SetupGuideModal content for consistency
 */

const setupSteps = [
    {
        id: 'credentials',
        title: '1. Getting AWS Credentials',
        content: (
            <div className="space-y-3">
                <p className="text-white/90 font-medium">Follow these steps to create AWS Access Keys:</p>
                <ol className="list-decimal list-inside space-y-2 text-white/70">
                    <li>Sign in to the <a href="https://console.aws.amazon.com/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80 underline">AWS Management Console</a></li>
                    <li>Click on your account name in the top-right corner</li>
                    <li>Select <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-xs">Security credentials</span></li>
                    <li>Scroll down to <span className="font-semibold">Access keys</span> section</li>
                    <li>Click <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-xs">Create access key</span></li>
                    <li>Select use case: <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-xs">Command Line Interface (CLI)</span></li>
                    <li>Check the confirmation checkbox and click <span className="font-semibold">Next</span></li>
                    <li>Add a description tag (optional) and click <span className="font-semibold">Create access key</span></li>
                    <li className="text-yellow-400 font-medium">⚠️ Download or copy both the Access Key ID and Secret Access Key - you won't be able to see the secret again!</li>
                </ol>
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 mt-3">
                    <p className="text-xs text-white/70">
                        <strong>💡 Best Practice:</strong> For production use, create an IAM user with limited permissions instead of using root account credentials.
                    </p>
                </div>
            </div>
        )
    },
    {
        id: 'bucket',
        title: '2. Creating an S3 Bucket',
        content: (
            <div className="space-y-3">
                <ol className="list-decimal list-inside space-y-2 text-white/70">
                    <li>Go to <a href="https://s3.console.aws.amazon.com/s3/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80 underline">S3 Console</a></li>
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
            </div>
        )
    },
    {
        id: 'cors',
        title: '3. Configuring CORS',
        content: (
            <div className="space-y-3">
                <p className="text-white/90">
                    CORS (Cross-Origin Resource Sharing) must be configured to allow CloudCore to access your S3 bucket from the browser.
                </p>
                <ol className="list-decimal list-inside space-y-2 text-white/70">
                    <li>Open your bucket in the S3 Console</li>
                    <li>Go to the <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-xs">Permissions</span> tab</li>
                    <li>Scroll down to <span className="font-semibold">Cross-origin resource sharing (CORS)</span></li>
                    <li>Click <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-xs">Edit</span></li>
                    <li>Paste the following CORS configuration:</li>
                </ol>
                <pre className="bg-black/40 border border-white/10 rounded-lg p-3 overflow-x-auto text-xs font-mono text-white/90 mt-2">
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
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                    <p className="text-xs text-amber-200/90">
                        <strong>⚠️ Security Note:</strong> The above configuration uses AllowedOrigins: ["*"] for development. For production, replace with your specific domain.
                    </p>
                </div>
            </div>
        )
    },
    {
        id: 'iam',
        title: '4. IAM Permissions Policy',
        content: (
            <div className="space-y-3">
                <p className="text-white/90">
                    For better security, create a dedicated IAM user with limited permissions instead of using root credentials.
                </p>
                <p className="text-white/90 font-medium">Creating an IAM User:</p>
                <ol className="list-decimal list-inside space-y-2 text-white/70">
                    <li>Go to <a href="https://console.aws.amazon.com/iam/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80 underline">IAM Console</a></li>
                    <li>Click <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-xs">Users</span> → <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-xs">Create user</span></li>
                    <li>Enter a username (e.g., <span className="font-mono">cloudcore-user</span>)</li>
                    <li>Click <span className="font-semibold">Next</span></li>
                    <li>Select <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-xs">Attach policies directly</span></li>
                    <li>Click <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-xs">Create policy</span> (opens new tab)</li>
                    <li>Switch to the <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-xs">JSON</span> tab</li>
                    <li>Paste the policy below (replace <span className="font-mono text-yellow-300">YOUR_BUCKET_NAME</span>):</li>
                </ol>
                <pre className="bg-black/40 border border-white/10 rounded-lg p-3 overflow-x-auto text-xs font-mono text-white/90 mt-2">
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
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 mt-2">
                    <p className="text-xs text-white/70"><strong>What this policy allows:</strong></p>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-white/60">
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
        title: '5. AWS Region Selection',
        content: (
            <div className="space-y-3">
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
            </div>
        )
    }
];

export const FAQSection = () => {
    return (
        <section id="setup-guide" className="relative w-full py-16 sm:py-24 lg:py-32 bg-black overflow-hidden">
            {/* Premium separation line */}
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/8 to-transparent" />

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-12">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    className="text-center mb-12 sm:mb-16 px-4"
                >
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-3 sm:mb-4 tracking-tight">
                        How to Get Started
                    </h2>
                    <p className="text-base sm:text-lg text-white/40 max-w-2xl mx-auto">
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
                    <Accordion type="single" collapsible defaultValue="credentials" className="space-y-3">
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
                                    className="border border-white/8 rounded-xl overflow-hidden bg-white/2 backdrop-blur-sm"
                                >
                                    <AccordionTrigger className="w-full flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 text-left hover:bg-white/3 transition-colors [&[data-state=open]>svg]:rotate-180">
                                        <span className="text-base sm:text-lg font-medium text-white/90 pr-4">
                                            {step.title}
                                        </span>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-5 sm:px-6 pb-5 sm:pb-6 text-sm sm:text-base leading-relaxed">
                                        {step.content}
                                    </AccordionContent>
                                </AccordionItem>
                            </motion.div>
                        ))}
                    </Accordion>
                </motion.div>

                {/* Final Notes */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="mt-8"
                >
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                        <h4 className="text-sm font-semibold text-white mb-2">✅ You're All Set!</h4>
                        <p className="text-xs text-white/70">
                            Once you've completed these steps, click "Get Started" and enter your AWS credentials to begin managing your S3 files.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
