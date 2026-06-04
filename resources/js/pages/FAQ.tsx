import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Head, Link } from '@inertiajs/react';
import {
    Bell,
    Briefcase,
    Building2,
    CalendarX,
    ChevronDown,
    CreditCard,
    Globe2,
    HelpCircle,
    LifeBuoy,
    Lock,
    Mail,
    Search,
    ShieldCheck,
    Sparkles,
    UserCheck,
    UserPlus,
    Users,
} from 'lucide-react';
import { ReactNode, useMemo, useState } from 'react';

type FAQItem = {
    id: string;
    question: string;
    icon: typeof HelpCircle;
    answer: ReactNode;
    keywords: string;
};

const FAQS: FAQItem[] = [
    {
        id: 'what-is-nexshift',
        question: 'What is NexShift?',
        icon: Sparkles,
        keywords: 'platform staffing healthcare overview about',
        answer: (
            <p>
                NexShift is a digital healthcare staffing platform that connects healthcare facilities directly with qualified
                healthcare workers, eliminating the need for traditional staffing agencies. It provides real-time job postings,
                shift booking, communication, and seamless payment management.
            </p>
        ),
    },
    {
        id: 'who-can-use',
        question: 'Who can use the NexShift platform?',
        icon: Users,
        keywords: 'workers nurses carers care home employer hospital',
        answer: (
            <>
                <p>The platform is designed for:</p>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                    <li>
                        <strong>Healthcare workers</strong> (nurses, support workers, carers, healthcare assistants, etc.)
                    </li>
                    <li>
                        <strong>Healthcare employers</strong> (care homes, domiciliary care agencies, nursing homes, supported living
                        homes, and hospitals)
                    </li>
                </ul>
            </>
        ),
    },
    {
        id: 'is-it-free',
        question: 'Is NexShift free to use?',
        icon: CreditCard,
        keywords: 'pricing cost free subscription fees',
        answer: (
            <>
                <p>Yes.</p>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                    <li>
                        <strong>Healthcare workers</strong> can download and use the app for free.
                    </li>
                    <li>
                        <strong>Employers</strong> sign up at no cost and only pay subscription fees per month.
                    </li>
                </ul>
            </>
        ),
    },
    {
        id: 'sign-up-worker',
        question: 'How do I sign up as a healthcare worker?',
        icon: UserPlus,
        keywords: 'register account onboarding download app worker',
        answer: (
            <ol className="list-decimal space-y-2 pl-6">
                <li>Download the NexShift app from the App Store or Google Play.</li>
                <li>Create an account using your email or phone number.</li>
                <li>Complete your professional profile, including certifications and experience.</li>
                <li>Upload required documents (e.g. ID, DBS, right-to-work documentation).</li>
                <li>Once verified, you can start applying for shifts immediately.</li>
            </ol>
        ),
    },
    {
        id: 'employer-register',
        question: 'How do employers register?',
        icon: Building2,
        keywords: 'employer care home hospital portal sign up',
        answer: (
            <>
                <p>Employers can:</p>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                    <li>
                        Register via the NexShift web portal. After registration, they can post available shifts, view worker
                        profiles, and manage bookings.
                    </li>
                </ul>
            </>
        ),
    },
    {
        id: 'worker-verification',
        question: 'How are healthcare workers verified?',
        icon: UserCheck,
        keywords: 'verification DBS identity right to work compliance qualifications',
        answer: (
            <>
                <p>All healthcare workers undergo a standard verification process, which includes:</p>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                    <li>Identity verification</li>
                    <li>Professional qualifications</li>
                    <li>DBS checks</li>
                    <li>Right-to-work validation</li>
                    <li>Experience review</li>
                </ul>
                <p className="mt-3">This ensures all users meet the proper professional standards.</p>
            </>
        ),
    },
    {
        id: 'book-shift',
        question: 'How do I book a shift as a healthcare worker?',
        icon: Briefcase,
        keywords: 'apply book shift application filter',
        answer: (
            <ol className="list-decimal space-y-2 pl-6">
                <li>Open the app and browse available shifts near you.</li>
                <li>Filter by date, location, pay rate, or role.</li>
                <li>Apply for a shift with one tap.</li>
                <li>Once approved by the employer, the shift will appear in your "Booked Shifts" section.</li>
            </ol>
        ),
    },
    {
        id: 'post-shifts',
        question: 'How do healthcare facilities post shifts?',
        icon: Building2,
        keywords: 'post shift employer publish approve applicants',
        answer: (
            <>
                <p>Employers can:</p>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                    <li>Add shift details (date, time, role, rate, location).</li>
                    <li>Immediately publish the shift to available workers.</li>
                    <li>Approve or decline applicants.</li>
                    <li>Communicate with selected workers directly through the app.</li>
                </ul>
            </>
        ),
    },
    {
        id: 'payment',
        question: 'How does payment work on NexShift?',
        icon: CreditCard,
        keywords: 'payment wages payout stripe paid',
        answer: (
            <>
                <p>Payments are processed digitally through secure in-app systems.</p>
                <p className="mt-2">Healthcare workers are paid based on completed and verified shifts.</p>
                <p className="mt-2">Payment timelines may vary depending on the employer's schedule.</p>
            </>
        ),
    },
    {
        id: 'cancel-shift',
        question: 'Can I cancel a shift?',
        icon: CalendarX,
        keywords: 'cancel cancellation penalty refund',
        answer: (
            <>
                <p>Yes, but cancellation rules apply:</p>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                    <li>Workers should cancel within the allowed cancellation window to avoid penalties.</li>
                    <li>Employers must follow platform cancellation guidelines to avoid inconveniencing staff.</li>
                </ul>
            </>
        ),
    },
    {
        id: 'safety-compliance',
        question: 'How does NexShift ensure safety and compliance?',
        icon: ShieldCheck,
        keywords: 'safety compliance GDPR document expiration reporting feedback',
        answer: (
            <>
                <p>NexShift maintains strict compliance measures, including:</p>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                    <li>Worker verification</li>
                    <li>Employer validation</li>
                    <li>Document expiration reminders</li>
                    <li>Reporting and feedback tools</li>
                    <li>Secure data protection under GDPR</li>
                </ul>
            </>
        ),
    },
    {
        id: 'data-secure',
        question: 'Is my data secure?',
        icon: Lock,
        keywords: 'data privacy security encryption GDPR',
        answer: (
            <p>
                Yes. NexShift uses industry-standard encryption and follows strict data protection regulations (GDPR). Your
                personal information is never shared with third parties without consent. See our{' '}
                <Link href={route('privacy-policy')} className="text-blue-600 hover:underline dark:text-blue-400">
                    Privacy Policy
                </Link>{' '}
                for more.
            </p>
        ),
    },
    {
        id: 'support',
        question: 'What should I do if I experience an issue with the app?',
        icon: LifeBuoy,
        keywords: 'support help contact issue bug',
        answer: (
            <>
                <p>You can contact support through:</p>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                    <li>The in-app support button</li>
                    <li>
                        Email{' '}
                        <a
                            href="mailto:support@nexshiftcare.co.uk"
                            className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                            support@nexshiftcare.co.uk
                        </a>
                    </li>
                </ul>
            </>
        ),
    },
    {
        id: 'outside-uk',
        question: 'Does NexShift work outside the UK?',
        icon: Globe2,
        keywords: 'international country expansion location uk',
        answer: (
            <p>
                Currently, NexShift is focused on the UK healthcare staffing market. Expansion into additional countries may be
                announced soon.
            </p>
        ),
    },
    {
        id: 'multiple-shifts',
        question: 'Can I work multiple shifts across different employers?',
        icon: Briefcase,
        keywords: 'multiple employers flexibility shifts pick',
        answer: (
            <p>
                Yes! One of the main advantages of NexShift is flexibility. You can pick shifts from multiple employers, as long
                as you meet their requirements.
            </p>
        ),
    },
    {
        id: 'notifications',
        question: 'What types of notifications will I receive?',
        icon: Bell,
        keywords: 'notifications alerts messages reminders',
        answer: (
            <>
                <p>You will receive alerts for:</p>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                    <li>New shifts available</li>
                    <li>Application updates</li>
                    <li>Booking confirmations</li>
                    <li>Payment updates</li>
                    <li>Messages from employers</li>
                    <li>Compliance reminders (ID, training, etc.)</li>
                </ul>
            </>
        ),
    },
];

export default function FAQ() {
    const [query, setQuery] = useState('');
    const [openId, setOpenId] = useState<string | null>(FAQS[0].id);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return FAQS;
        return FAQS.filter(
            (item) =>
                item.question.toLowerCase().includes(q) || item.keywords.toLowerCase().includes(q),
        );
    }, [query]);

    return (
        <>
            <Head title="FAQ - NexShift">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600&family=inter:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-900/80">
                    <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <Link href={route('home')} className="flex items-center space-x-3">
                                <img src="/favicon.png" alt="NexShift" className="h-10 w-10" />
                                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
                                    NexShift
                                </span>
                            </Link>
                            <Link
                                href={route('home')}
                                className="px-6 py-2 font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                            >
                                Back to Home
                            </Link>
                        </div>
                    </nav>
                </header>

                <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
                    {/* Hero */}
                    <div className="mb-10 text-center">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
                            <HelpCircle className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="mb-3 text-4xl font-bold text-gray-900 lg:text-5xl dark:text-white">
                            Frequently Asked Questions
                        </h1>
                        <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
                            Everything you need to know about using NexShift — whether you're a healthcare worker looking for
                            shifts or a facility looking for qualified staff.
                        </p>
                    </div>

                    {/* Search */}
                    <div className="mb-8">
                        <div className="relative">
                            <Search className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search questions..."
                                className="w-full rounded-xl border border-gray-200 bg-white py-4 pr-4 pl-12 text-gray-900 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                                aria-label="Search FAQs"
                            />
                        </div>
                        {query && (
                            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                                {filtered.length === 0
                                    ? 'No matches — try a different keyword.'
                                    : `${filtered.length} question${filtered.length === 1 ? '' : 's'} found`}
                            </p>
                        )}
                    </div>

                    {/* FAQ list */}
                    <div className="space-y-3">
                        {filtered.map((item) => {
                            const Icon = item.icon;
                            const isOpen = openId === item.id;
                            return (
                                <Collapsible
                                    key={item.id}
                                    open={isOpen}
                                    onOpenChange={(open) => setOpenId(open ? item.id : null)}
                                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                                >
                                    <CollapsibleTrigger className="group flex w-full items-center justify-between gap-4 p-6 text-left">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                                    isOpen
                                                        ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white'
                                                        : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100 dark:bg-gray-700 dark:text-blue-400 dark:group-hover:bg-gray-600'
                                                }`}
                                            >
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {item.question}
                                            </h3>
                                        </div>
                                        <ChevronDown
                                            className={`h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 ${
                                                isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
                                            }`}
                                        />
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="overflow-hidden">
                                        <div className="px-6 pt-1 pb-6 pl-20 text-gray-700 leading-relaxed dark:text-gray-300">
                                            {item.answer}
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            );
                        })}
                    </div>

                    {/* Still have questions CTA */}
                    <div className="mt-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-8 text-white shadow-xl lg:p-12">
                        <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                                    <Mail className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="mb-2 text-2xl font-bold">Still have questions?</h2>
                                    <p className="text-blue-50">
                                        Our support team is here to help. Reach out and we'll get back to you.
                                    </p>
                                </div>
                            </div>
                            <a
                                href="mailto:support@nexshiftcare.co.uk"
                                className="inline-flex shrink-0 items-center rounded-lg bg-white px-6 py-3 font-medium text-blue-600 transition-all duration-200 hover:bg-blue-50 hover:shadow-lg"
                            >
                                Contact Support
                            </a>
                        </div>
                    </div>
                </main>

                <footer className="mt-20 border-t border-gray-200 dark:border-gray-800">
                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                            <div className="flex items-center space-x-3">
                                <img src="/favicon.png" alt="NexShift" className="h-8 w-8" />
                                <span className="text-xl font-bold text-gray-900 dark:text-white">NexShift</span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">
                                © {new Date().getFullYear()} NexShift. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
