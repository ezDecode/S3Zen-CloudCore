import { motion } from 'framer-motion';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../ui/accordion';

const steps = [
    {
        id: 'credentials', num: '01', title: 'AWS Credentials',
        content: (
            <ol className="list-decimal list-inside space-y-2 text-white/60 text-sm">
                <li>Go to <a href="https://console.aws.amazon.com/" target="_blank" rel="noopener noreferrer" className="text-white/90 underline">AWS Console</a></li>
                <li>Click your account name → <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">Security credentials</code></li>
                <li>Under Access keys, click <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">Create access key</code></li>
                <li>Select <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">CLI</code> use case</li>
                <li className="text-amber-400">⚠️ Save both keys - you won't see the secret again!</li>
            </ol>
        )
    },
    {
        id: 'bucket', num: '02', title: 'Create S3 Bucket',
        content: (
            <ol className="list-decimal list-inside space-y-2 text-white/60 text-sm">
                <li>Go to <a href="https://s3.console.aws.amazon.com/s3/" target="_blank" rel="noopener noreferrer" className="text-white/90 underline">S3 Console</a></li>
                <li>Click <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">Create bucket</code></li>
                <li>Enter bucket name, select region</li>
                <li>Keep "Block all public access" <span className="text-emerald-400">enabled</span></li>
                <li>Click Create bucket</li>
            </ol>
        )
    },
    {
        id: 'cors', num: '03', title: 'Configure CORS',
        content: (
            <div className="space-y-3">
                <p className="text-white/60 text-sm">Bucket → Permissions → CORS → Edit:</p>
                <pre className="bg-black/60 border border-white/10 rounded-lg p-3 text-xs font-mono overflow-x-auto">
                    {`[{"AllowedHeaders":["*"],"AllowedMethods":["GET","PUT","POST","DELETE","HEAD"],"AllowedOrigins":["*"],"ExposeHeaders":["ETag"],"MaxAgeSeconds":3000}]`}
                </pre>
            </div>
        )
    },
    {
        id: 'iam', num: '04', title: 'IAM Policy (Recommended)',
        content: (
            <div className="space-y-3">
                <p className="text-white/60 text-sm">Create IAM user with this policy (replace YOUR_BUCKET):</p>
                <pre className="bg-black/60 border border-white/10 rounded-lg p-3 text-xs font-mono overflow-x-auto">
                    {`{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["s3:ListBucket","s3:GetBucketLocation"],"Resource":"arn:aws:s3:::YOUR_BUCKET"},{"Effect":"Allow","Action":["s3:GetObject","s3:PutObject","s3:DeleteObject"],"Resource":"arn:aws:s3:::YOUR_BUCKET/*"}]}`}
                </pre>
            </div>
        )
    }
];

export const FAQSection = () => (
    <section id="setup-guide" className="relative w-full py-20 sm:py-28 bg-black overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="text-center mb-14">
                <span className="text-xs text-white/40 uppercase tracking-widest mb-4 block">Setup Guide</span>
                <h2 className="text-4xl sm:text-5xl font-normal text-white mb-4">AWS <span className="text-white/40">Setup</span></h2>
                <p className="text-lg text-white/50">Quick steps to connect your S3 bucket</p>
            </motion.div>

            <Accordion type="single" collapsible defaultValue="credentials" className="space-y-3">
                {steps.map((s, i) => (
                    <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                        <AccordionItem value={s.id}
                            className="border border-white/[0.08] rounded-xl overflow-hidden bg-white/[0.02]">
                            <AccordionTrigger className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02]">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-mono text-white/30">{s.num}</span>
                                    <span className="text-sm text-white/90">{s.title}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-5 pb-5">{s.content}</AccordionContent>
                        </AccordionItem>
                    </motion.div>
                ))}
            </Accordion>
        </div>
    </section>
);
