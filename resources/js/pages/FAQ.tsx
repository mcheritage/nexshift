import { type SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { HelpCircle, ChevronDown, ChevronUp, Building2, UserCheck, Globe, type LucideIcon, Mail, Phone, X, Send } from 'lucide-react';
import { useState } from 'react';

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQSection {
    title: string;
    icon: LucideIcon;
    color: string;
    items: FAQItem[];
}

const sections: FAQSection[] = [
    {
        title: 'For Healthcare Providers',
        icon: Building2,
        color: 'from-blue-600 to-blue-700',
        items: [
            {
                question: 'What is Nexshift?',
                answer: 'Nexshift is a digital healthcare workforce platform that connects healthcare providers directly with vetted healthcare professionals in real time.',
            },
            {
                question: 'How does Nexshift work for healthcare providers?',
                answer: 'Healthcare providers can post available shifts, set preferred hourly rates, receive applications from qualified professionals, and manage bookings through the platform.',
            },
            {
                question: 'What types of healthcare providers can use Nexshift?',
                answer: 'Care Homes, Nursing Homes, Supported Living Services, Residential Care Services, Healthcare Organisations, and NHS and Private Healthcare Providers.',
            },
            {
                question: 'Can we set our own hourly rates?',
                answer: 'Yes. Providers can set their preferred hourly rates, subject to applicable minimum wage requirements.',
            },
            {
                question: 'Are there agency mark-ups?',
                answer: 'No. Nexshift operates on a monthly subscription model rather than charging agency mark-ups.',
            },
            {
                question: 'How quickly can shifts be filled?',
                answer: 'Shifts are visible to eligible professionals in real time and may receive applications within minutes.',
            },
            {
                question: 'Are healthcare professionals vetted?',
                answer: 'Yes. Professionals undergo identity, right-to-work, compliance, qualification and other relevant checks before approval.',
            },
            {
                question: 'Can we fill emergency or last-minute shifts?',
                answer: 'Yes. Nexshift is designed to support urgent staffing requirements.',
            },
            {
                question: 'Is Nexshift available outside normal working hours?',
                answer: 'Yes. The platform is available 24/7.',
            },
            {
                question: 'How much does Nexshift cost?',
                answer: 'Nexshift operates on a monthly subscription model. Contact us at support@nexshiftcare.co.uk for current pricing.',
            },
            {
                question: 'Do we have to commit to a long-term contract?',
                answer: 'No. Flexible subscription options are available.',
            },
            {
                question: 'How do we get started?',
                answer: 'Register your organisation, complete onboarding, and begin posting shifts.',
            },
        ],
    },
    {
        title: 'For Healthcare Professionals',
        icon: UserCheck,
        color: 'from-purple-600 to-purple-700',
        items: [
            {
                question: 'Who can join Nexshift?',
                answer: 'Healthcare Assistants, Senior Care Assistants, Support Workers, Nurses, Residential Care Workers, Mental Health Support Workers and other healthcare professionals.',
            },
            {
                question: 'How do I register?',
                answer: 'Register through the Nexshift website or mobile app and complete onboarding.',
            },
            {
                question: 'Is the Nexshift app available on mobile devices?',
                answer: 'Yes. Available on Google Play Store and Apple App Store.',
            },
            {
                question: 'Can I choose my own shifts?',
                answer: 'Yes. Professionals can browse and apply for shifts that match their preferences.',
            },
            {
                question: 'Can I work around my existing job?',
                answer: 'Yes. Nexshift supports flexible working arrangements.',
            },
            {
                question: 'Is there a registration fee?',
                answer: 'No. Registration is free for healthcare professionals.',
            },
            {
                question: 'How do I know a provider is legitimate?',
                answer: 'All healthcare providers are verified before approval.',
            },
            {
                question: 'How do I get paid?',
                answer: "Payments are processed according to the provider's agreed payment schedule.",
            },
            {
                question: 'What documents are required?',
                answer: 'Proof of identity, Right to Work documentation, DBS certificate, qualifications, training certificates, and professional registrations where applicable.',
            },
            {
                question: 'How long does onboarding take?',
                answer: 'Timelines depend on document verification and compliance checks.',
            },
            {
                question: 'Can I update my availability?',
                answer: 'Yes. Availability can be updated through the app.',
            },
            {
                question: 'Can I work in multiple locations?',
                answer: 'Yes, subject to availability and travel preferences.',
            },
        ],
    },
    {
        title: 'General Questions',
        icon: Globe,
        color: 'from-emerald-600 to-emerald-700',
        items: [
            {
                question: 'Is Nexshift a staffing agency?',
                answer: 'No. Nexshift is a digital healthcare workforce platform.',
            },
            {
                question: 'What makes Nexshift different from traditional agencies?',
                answer: 'Real-time shift visibility, provider-controlled rates, subscription pricing, reduced agency dependency, and greater flexibility.',
            },
            {
                question: 'Is my data secure?',
                answer: 'Yes. Nexshift operates in accordance with UK data protection requirements.',
            },
            {
                question: "What is Nexshift's mission?",
                answer: 'To transform healthcare staffing by making workforce management more efficient, transparent, accessible, and affordable.',
            },
            {
                question: 'How can I contact Nexshift?',
                answer: 'Email us at support@nexshiftcare.co.uk, call +44 7876 519260, or visit www.nexshiftcare.co.uk.',
            },
        ],
    },
];

function AccordionItem({ question, answer }: FAQItem) {
    const [open, setOpen] = useState(false);

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-6 py-4 text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors gap-4"
            >
                <span className="text-gray-900 dark:text-white font-medium">{question}</span>
                {open ? (
                    <ChevronUp className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
            </button>
            {open && (
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/40 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{answer}</p>
                </div>
            )}
        </div>
    );
}

export default function FAQ() {
    const { auth } = usePage<SharedData>().props;
    const [showContact, setShowContact] = useState(false);
    const { data, setData, post, processing, errors, wasSuccessful, reset } = useForm({
        name: '', email: '', message: '',
    });

    function handleContactSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('contact.store'), {
            onSuccess: () => reset(),
        });
    }

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
                                    <Link
                                        href={route('dashboard')}
                                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                                        >
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
                    <div className="mb-12">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <HelpCircle className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                                    Frequently Asked Questions
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Everything you need to know about NexShift.
                                </p>
                            </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Can't find what you're looking for? Reach out to us at{' '}
                            <a
                                href="mailto:support@nexshiftcare.co.uk"
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                support@nexshiftcare.co.uk
                            </a>{' '}
                            or call{' '}
                            <a
                                href="tel:+447876519260"
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                +44 7876 519260
                            </a>
                            .
                        </p>
                    </div>

                    <div className="space-y-12">
                        {sections.map((section) => {
                            const Icon = section.icon;
                            return (
                                <div key={section.title}>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div
                                            className={`w-10 h-10 bg-gradient-to-br ${section.color} rounded-xl flex items-center justify-center shadow`}
                                        >
                                            <Icon className="w-5 h-5 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {section.title}
                                        </h2>
                                    </div>
                                    <div className="space-y-3">
                                        {section.items.map((item) => (
                                            <AccordionItem key={item.question} {...item} />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white shadow-xl">
                        <h3 className="text-2xl font-bold mb-2">Still have questions?</h3>
                        <p className="text-blue-100 mb-6">Our team is happy to help.</p>
                        <a
                            href="mailto:support@nexshiftcare.co.uk"
                            className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
                        >
                            Contact Support
                        </a>
                    </div>
                </main>

                <footer className="border-t border-gray-200 dark:border-gray-800 mt-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center space-x-3">
                                <img src="/favicon.png" alt="NexShift" className="w-8 h-8" />
                                <span className="text-xl font-bold text-gray-900 dark:text-white">NexShift</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                                <Link href={route('privacy-policy')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Privacy Policy
                                </Link>
                                <Link href={route('terms')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Terms of Service
                                </Link>
                                <span>© {new Date().getFullYear()} NexShift. All rights reserved.</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
