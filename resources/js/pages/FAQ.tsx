import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { type SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
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
    Phone,
    Search,
    Send,
    ShieldCheck,
    Sparkles,
    UserCheck,
    UserPlus,
    Users,
    X,
    type LucideIcon,
} from 'lucide-react';
import { ReactNode, useMemo, useState } from 'react';

type FAQItem = {
    id: string;
    question: string;
    icon: LucideIcon;
    answer: ReactNode;
    keywords: string;
};

type FAQSection = {
    title: string;
    icon: LucideIcon;
    color: string;
    items: FAQItem[];
};

const sections: FAQSection[] = [
    {
        title: 'For Healthcare Providers',
        icon: Building2,
        color: 'from-blue-600 to-blue-700',
        items: [
            {
                id: 'employer-register',
                question: 'How do employers register?',
                icon: Building2,
                keywords: 'employer care home hospital portal sign up register',
                answer: (
                    <>
                        <p>Employers can register via the NexShift web portal. After registration, they can:</p>
                        <ul className="mt-3 list-disc space-y-2 pl-6">
                            <li>Post available shifts</li>
                            <li>View worker profiles</li>
                            <li>Manage bookings</li>
                        </ul>
                    </>
                ),
            },
            {
                id: 'post-shifts',
                question: 'How do healthcare facilities post shifts?',
                icon: Briefcase,
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
                id: 'hourly-rates',
                question: 'Can we set our own hourly rates?',
                icon: CreditCard,
                keywords: 'rates pricing hourly wage employer',
                answer: (
                    <p>Yes. Providers can set their preferred hourly rates, subject to applicable minimum wage requirements.</p>
                ),
            },
            {
                id: 'agency-markup',
                question: 'Are there agency mark-ups?',
                icon: CreditCard,
                keywords: 'agency markup subscription fees pricing',
                answer: (
                    <p>No. NexShift operates on a monthly subscription model rather than charging agency mark-ups.</p>
                ),
            },
            {
                id: 'shift-fill-speed',
                question: 'How quickly can shifts be filled?',
                icon: Bell,
                keywords: 'speed fast urgent emergency shift fill',
                answer: (
                    <p>Shifts are visible to eligible professionals in real time and may receive applications within minutes. NexShift is designed to support urgent and last-minute staffing requirements.</p>
                ),
            },
            {
                id: 'cancel-shift',
                question: 'Can shifts be cancelled?',
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
        ],
    },
    {
        title: 'For Healthcare Workers',
        icon: UserCheck,
        color: 'from-purple-600 to-purple-700',
        items: [
            {
                id: 'sign-up-worker',
                question: 'How do I sign up as a healthcare worker?',
                icon: UserPlus,
                keywords: 'register account onboarding download app worker sign up',
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
                question: 'How do I book a shift?',
                icon: Briefcase,
                keywords: 'apply book shift application filter browse',
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
                id: 'multiple-shifts',
                question: 'Can I work multiple shifts across different employers?',
                icon: Briefcase,
                keywords: 'multiple employers flexibility shifts pick',
                answer: (
                    <p>Yes. One of the main advantages of NexShift is flexibility. You can pick shifts from multiple employers, as long as you meet their requirements.</p>
                ),
            },
            {
                id: 'required-documents',
                question: 'What documents are required to register?',
                icon: ShieldCheck,
                keywords: 'documents DBS ID right to work qualifications training',
                answer: (
                    <ul className="list-disc space-y-2 pl-6">
                        <li>Proof of identity</li>
                        <li>Right to Work documentation</li>
                        <li>DBS certificate</li>
                        <li>Qualifications and training certificates</li>
                        <li>Professional registrations where applicable</li>
                    </ul>
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
        ],
    },
    {
        title: 'General Questions',
        icon: Globe2,
        color: 'from-emerald-600 to-emerald-700',
        items: [
            {
                id: 'what-is-nexshift',
                question: 'What is NexShift?',
                icon: Sparkles,
                keywords: 'platform staffing healthcare overview about nexshift',
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
                keywords: 'workers nurses carers care home employer hospital who',
                answer: (
                    <>
                        <p>The platform is designed for:</p>
                        <ul className="mt-3 list-disc space-y-2 pl-6">
                            <li><strong>Healthcare workers</strong> — nurses, support workers, carers, healthcare assistants, etc.</li>
                            <li><strong>Healthcare employers</strong> — care homes, domiciliary care agencies, nursing homes, supported living homes, and hospitals.</li>
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
                        <ul className="list-disc space-y-2 pl-6">
                            <li><strong>Healthcare workers</strong> can download and use the app for free.</li>
                            <li><strong>Employers</strong> sign up at no cost and pay a monthly subscription fee.</li>
                        </ul>
                        <p className="mt-3">Contact us at <a href="mailto:support@nexshiftcare.co.uk" className="text-blue-600 hover:underline dark:text-blue-400">support@nexshiftcare.co.uk</a> for current pricing.</p>
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
                        <p className="mt-2">Healthcare workers are paid based on completed and verified shifts. Payment timelines may vary depending on the employer's schedule.</p>
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
                question: 'What should I do if I experience an issue?',
                icon: LifeBuoy,
                keywords: 'support help contact issue bug problem',
                answer: (
                    <>
                        <p>You can contact support through:</p>
                        <ul className="mt-3 list-disc space-y-2 pl-6">
                            <li>The in-app support button</li>
                            <li>Email <a href="mailto:support@nexshiftcare.co.uk" className="text-blue-600 hover:underline dark:text-blue-400">support@nexshiftcare.co.uk</a></li>
                            <li>Phone <a href="tel:+447876519260" className="text-blue-600 hover:underline dark:text-blue-400">+44 7876 519260</a></li>
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
                    <p>Currently, NexShift is focused on the UK healthcare staffing market. Expansion into additional countries may be announced soon.</p>
                ),
            },
        ],
    },
];

// Flatten all items for search
const ALL_ITEMS = sections.flatMap((s) => s.items.map((item) => ({ ...item, sectionTitle: s.title })));

export default function FAQ() {
    const { auth } = usePage<SharedData>().props;
    const [showContact, setShowContact] = useState(false);
    const [query, setQuery] = useState('');
    const [openId, setOpenId] = useState<string | null>(null);

    const { data, setData, post, processing, errors, wasSuccessful, reset } = useForm({
        name: '', email: '', message: '',
    });

    function handleContactSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('contact.store'), { onSuccess: () => reset() });
    }

    const isSearching = query.trim().length > 0;

    const searchResults = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return ALL_ITEMS.filter(
            (item) => item.question.toLowerCase().includes(q) || item.keywords.toLowerCase().includes(q),
        );
    }, [query]);

    return (
        <>
            <Head title="FAQ - NexShift">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600&family=inter:400,500,600,700" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                {/* Navbar */}
                <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
                    <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <Link href={route('home')} className="flex items-center space-x-3">
                                <img src="/favicon.png" alt="NexShift" className="w-10 h-10" />
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    NexShift
                                </span>
                            </Link>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setShowContact(true)}
                                    className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                                >
                                    Contact Us
                                </button>
                                {auth.user ? (
                                    <Link href={route('dashboard')} className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200">
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link href={route('login')} className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                                            Log in
                                        </Link>
                                        <Link href={route('register')} className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200">
                                            Get Started
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </nav>
                </header>

                {/* Contact Modal */}
                {showContact && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Us</h3>
                                <button onClick={() => setShowContact(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            {wasSuccessful ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Send className="w-8 h-8 text-green-600 dark:text-green-400" />
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 font-medium">Message sent! We'll be in touch soon.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleContactSubmit} className="space-y-4">
                                    <div>
                                        <input type="text" placeholder="Your name" value={data.name} onChange={e => setData('name', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <input type="email" placeholder="Your email" value={data.email} onChange={e => setData('email', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <textarea placeholder="Your message" rows={4} value={data.message} onChange={e => setData('message', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                                        {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                                    </div>
                                    <button type="submit" disabled={processing}
                                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2">
                                        <Send className="w-4 h-4" /> {processing ? 'Sending...' : 'Send Message'}
                                    </button>
                                </form>
                            )}
                            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3 text-sm text-gray-600 dark:text-gray-400">
                                <a href="mailto:support@nexshiftcare.co.uk" className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    <Mail className="w-4 h-4" /> support@nexshiftcare.co.uk
                                </a>
                                <a href="tel:+447876519260" className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    <Phone className="w-4 h-4" /> +44 7876 519260
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                    {/* Hero */}
                    <div className="mb-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                                <HelpCircle className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                                    Frequently Asked Questions
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    Everything you need to know about NexShift.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="mb-10">
                        <div className="relative">
                            <Search className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search questions..."
                                className="w-full rounded-xl border border-gray-200 bg-white py-4 pr-4 pl-12 text-gray-900 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                            />
                        </div>
                        {isSearching && (
                            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                                {searchResults.length === 0
                                    ? 'No matches — try a different keyword.'
                                    : `${searchResults.length} question${searchResults.length === 1 ? '' : 's'} found`}
                            </p>
                        )}
                    </div>

                    {/* Search results (flat list) */}
                    {isSearching ? (
                        <div className="space-y-3">
                            {searchResults.map((item) => {
                                const Icon = item.icon;
                                const isOpen = openId === item.id;
                                return (
                                    <Collapsible key={item.id} open={isOpen} onOpenChange={(open) => setOpenId(open ? item.id : null)}
                                        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                                        <CollapsibleTrigger className="group flex w-full items-center justify-between gap-4 p-6 text-left">
                                            <div className="flex items-center gap-4">
                                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${isOpen ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100 dark:bg-gray-700 dark:text-blue-400 dark:group-hover:bg-gray-600'}`}>
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{item.sectionTitle}</p>
                                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{item.question}</h3>
                                                </div>
                                            </div>
                                            <ChevronDown className={`h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''}`} />
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <div className="px-6 pt-1 pb-6 pl-20 text-gray-700 leading-relaxed dark:text-gray-300">
                                                {item.answer}
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                );
                            })}
                        </div>
                    ) : (
                        /* Sectioned view */
                        <div className="space-y-12">
                            {sections.map((section) => {
                                const SectionIcon = section.icon;
                                return (
                                    <div key={section.title}>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className={`w-10 h-10 bg-gradient-to-br ${section.color} rounded-xl flex items-center justify-center shadow`}>
                                                <SectionIcon className="w-5 h-5 text-white" />
                                            </div>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{section.title}</h2>
                                        </div>
                                        <div className="space-y-3">
                                            {section.items.map((item) => {
                                                const Icon = item.icon;
                                                const isOpen = openId === item.id;
                                                return (
                                                    <Collapsible key={item.id} open={isOpen} onOpenChange={(open) => setOpenId(open ? item.id : null)}
                                                        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                                                        <CollapsibleTrigger className="group flex w-full items-center justify-between gap-4 p-6 text-left">
                                                            <div className="flex items-center gap-4">
                                                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${isOpen ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100 dark:bg-gray-700 dark:text-blue-400 dark:group-hover:bg-gray-600'}`}>
                                                                    <Icon className="h-5 w-5" />
                                                                </div>
                                                                <h3 className="text-base font-semibold text-gray-900 dark:text-white">{item.question}</h3>
                                                            </div>
                                                            <ChevronDown className={`h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''}`} />
                                                        </CollapsibleTrigger>
                                                        <CollapsibleContent>
                                                            <div className="px-6 pt-1 pb-6 pl-20 text-gray-700 leading-relaxed dark:text-gray-300">
                                                                {item.answer}
                                                            </div>
                                                        </CollapsibleContent>
                                                    </Collapsible>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* CTA */}
                    <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
                        <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                                    <Mail className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="mb-2 text-2xl font-bold">Still have questions?</h2>
                                    <p className="text-blue-100">Our team is happy to help.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowContact(true)}
                                className="inline-flex shrink-0 items-center rounded-lg bg-white px-6 py-3 font-medium text-blue-600 transition-all duration-200 hover:bg-blue-50 hover:shadow-lg"
                            >
                                Contact Support
                            </button>
                        </div>
                    </div>
                </main>

                <footer className="border-t border-gray-200 dark:border-gray-800 mt-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center space-x-3">
                                <img src="/favicon.png" alt="NexShift" className="w-8 h-8" />
                                <span className="text-xl font-bold text-gray-900 dark:text-white">NexShift</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                                <a href="mailto:support@nexshiftcare.co.uk" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1">
                                    <Mail className="w-3.5 h-3.5" /> support@nexshiftcare.co.uk
                                </a>
                                <a href="tel:+447876519260" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1">
                                    <Phone className="w-3.5 h-3.5" /> +44 7876 519260
                                </a>
                                <Link href={route('privacy-policy')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</Link>
                                <Link href={route('terms')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</Link>
                                <span>© {new Date().getFullYear()} NexShift. All rights reserved.</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
