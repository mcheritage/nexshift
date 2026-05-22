import { Head, Link } from '@inertiajs/react';
import { FileText, Users, Building2, Shield, CreditCard, Cpu, Scale, Mail, Calendar } from 'lucide-react';

export default function TermsOfService() {
    const effectiveDate = '11 March 2026';

    return (
        <>
            <Head title="Terms of Service - NexShift">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600&family=inter:400,500,600,700" rel="stylesheet" />
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
                            <Link
                                href={route('home')}
                                className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                            >
                                Back to Home
                            </Link>
                        </div>
                    </nav>
                </header>

                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 lg:p-12">
                        {/* Header */}
                        <div className="mb-12">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <Scale className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                                        Terms of Service
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Effective date: {effectiveDate} &nbsp;·&nbsp; Version 1.0
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 1. Introduction */}
                        <section className="mb-10">
                            <div className="flex items-center gap-3 mb-4">
                                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">1. Introduction</h2>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                These Terms of Service govern access to and use of the NexShift platform, website, mobile interfaces and related services by any user. By creating an account, accessing the platform or using any NexShift service, the user agrees to be bound by these Terms.
                            </p>
                        </section>

                        {/* 2. Definitions */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Definitions</h2>
                            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                                <li><strong>Platform</strong> means the NexShift digital staffing and workforce management service.</li>
                                <li><strong>User</strong> means any person or organisation accessing the Platform.</li>
                                <li><strong>Professional</strong> means a healthcare professional or worker using the Platform.</li>
                                <li><strong>Organisation</strong> means any hospital, clinic, care home, residential care provider, domiciliary care provider, community healthcare provider or other regulated healthcare organisation using the Platform.</li>
                            </ul>
                        </section>

                        {/* 3. Eligibility */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Eligibility</h2>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                A user must be legally capable of entering into a binding contract. A Professional must provide accurate and complete registration, identity and compliance information. An Organisation user must have authority to bind the Organisation.
                            </p>
                        </section>

                        {/* 4. Nature of the Service */}
                        <section className="mb-10">
                            <div className="flex items-center gap-3 mb-4">
                                <Cpu className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">4. Nature of the Service</h2>
                            </div>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p>
                                    NexShift provides a technology platform to support workforce administration, matching, compliance and related operational services. NexShift may apply verification, fraud prevention, safeguarding and security controls as a condition of access.
                                </p>
                                <p>
                                    NexShift operates as a digital workforce coordination and compliance platform. Except where NexShift expressly enters into a separate written arrangement stating otherwise, NexShift does not provide clinical services, does not supervise clinical care, and does not assume the healthcare organisation's site-level clinical governance responsibilities by reason only of platform use.
                                </p>
                            </div>
                        </section>

                        {/* 5. User Obligations */}
                        <section className="mb-10">
                            <div className="flex items-center gap-3 mb-4">
                                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">5. User Obligations</h2>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 mb-3">Users shall:</p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                                <li>provide accurate, current and complete information;</li>
                                <li>keep credentials secure and confidential;</li>
                                <li>use the Platform lawfully and in accordance with the Acceptable Use Policy;</li>
                                <li>cooperate with compliance, verification and audit requests; and</li>
                                <li>notify NexShift promptly of unauthorised access, inaccuracies or material changes.</li>
                            </ul>
                        </section>

                        {/* 6. Compliance Checks and Suspension */}
                        <section className="mb-10">
                            <div className="flex items-center gap-3 mb-4">
                                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">6. Compliance Checks and Suspension</h2>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                NexShift may require identity, credential, right to work, DBS or other compliance checks before or during access to the Platform. NexShift may suspend, restrict or terminate access where information is incomplete, inaccurate, expired, suspicious, unlawful or contrary to safeguarding or regulatory requirements.
                            </p>
                        </section>

                        {/* 6A. Allocation of Responsibility */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6A. Allocation of Responsibility</h2>
                            <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p>
                                    Healthcare Professionals remain responsible for the legality, accuracy and continuing validity of their professional information and for their own clinical judgment and regulatory compliance.
                                </p>
                                <p>
                                    Healthcare Organisations, including hospitals, clinics, care homes, residential care providers, domiciliary care providers and community healthcare providers, remain responsible for staffing decisions, patient safety, supervision, local onboarding, regulated activity decisions, site governance and compliance with any CQC, NHS, safeguarding or employment obligations applicable to their operations.
                                </p>
                            </div>
                        </section>

                        {/* 7. Fees and Payments */}
                        <section className="mb-10">
                            <div className="flex items-center gap-3 mb-4">
                                <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">7. Fees and Payments</h2>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                Where fees apply, the applicable fees, charges, invoicing terms and payment dates shall be notified separately through the Platform, a schedule or a signed commercial agreement.
                            </p>
                        </section>

                        {/* 8. Intellectual Property */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Intellectual Property</h2>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                All intellectual property rights in the Platform and related materials remain vested in NexShift or its licensors. No right, title or interest is transferred except for the limited right to use the Platform in accordance with these Terms.
                            </p>
                        </section>

                        {/* 9. Data Protection and Privacy */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Data Protection and Privacy</h2>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                NexShift processes personal data in accordance with its{' '}
                                <Link href={route('privacy-policy')} className="text-blue-600 dark:text-blue-400 hover:underline">
                                    Privacy Policy
                                </Link>{' '}
                                and applicable data protection law, including the UK General Data Protection Regulation and the Data Protection Act 2018. Users shall provide only information they are entitled to disclose and shall comply with their own legal obligations when using the Platform.
                            </p>
                        </section>

                        {/* 10. Acceptable Conduct */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Acceptable Conduct</h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-3">A user must not:</p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                                <li>misuse the Platform, probe its security or attempt unauthorised access;</li>
                                <li>upload false, defamatory, infringing, discriminatory, abusive or unlawful content;</li>
                                <li>misrepresent identity, qualifications or authority;</li>
                                <li>use the Platform to commit fraud or facilitate unlawful conduct; or</li>
                                <li>interfere with other users or Platform integrity.</li>
                            </ul>
                        </section>

                        {/* 11. Disclaimer and Service Availability */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">11. Disclaimer and Service Availability</h2>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                NexShift shall use reasonable skill and care in providing the Platform but does not warrant uninterrupted or error-free availability. The Platform may be modified, suspended or updated for maintenance, legal compliance or security reasons.
                            </p>
                        </section>

                        {/* 12. Limitation of Liability */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">12. Limitation of Liability</h2>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p>Nothing in these Terms excludes or limits liability that cannot lawfully be excluded or limited.</p>
                                <p>
                                    Subject to that sentence, NexShift shall not be liable for indirect or consequential loss, loss of profit, loss of goodwill, loss of anticipated savings or business interruption.
                                </p>
                                <p>
                                    NexShift's aggregate liability arising out of or in connection with these Terms shall be limited to the greater of: (a) the total fees paid by the user to NexShift in the twelve months preceding the claim; or (b) £10,000.
                                </p>
                            </div>
                        </section>

                        {/* 13. Indemnity */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">13. Indemnity</h2>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                The user shall indemnify and keep indemnified NexShift against losses, liabilities, claims, fines, damages and costs arising from the user's breach of these Terms, unlawful conduct, inaccurate information or misuse of the Platform.
                            </p>
                        </section>

                        {/* 14. Termination */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">14. Termination</h2>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                NexShift may suspend or terminate access immediately where required for security, fraud prevention, safeguarding, legal compliance or material breach. Clauses that by their nature should survive termination shall continue in force.
                            </p>
                        </section>

                        {/* 15. Governing Law */}
                        <section className="mb-10">
                            <div className="flex items-center gap-3 mb-4">
                                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">15. Governing Law and Dispute Resolution</h2>
                            </div>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p>
                                    These Terms and any non-contractual obligations arising out of or in connection with them shall be governed by the laws of England and Wales.
                                </p>
                                <p>
                                    The courts of England and Wales shall have exclusive jurisdiction, save that NexShift may seek interim or injunctive relief in any competent jurisdiction.
                                </p>
                            </div>
                        </section>

                        {/* 16. Changes */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">16. Changes to these Terms</h2>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                NexShift may amend these Terms from time to time. Updated terms shall take effect when published or otherwise notified.
                            </p>
                        </section>

                        {/* Contact */}
                        <section className="mb-10">
                            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 p-6 rounded-xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Us</h2>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 mb-4">
                                    If you have any questions about these Terms, please contact us:
                                </p>
                                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                                    <p><strong>NexShift — Mc Heritage Consulting Limited</strong></p>
                                    <p>Email: support@nexshiftcare.co.uk</p>
                                    <p>Address: United Kingdom</p>
                                </div>
                            </div>
                        </section>

                        {/* Back button */}
                        <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                            <Link
                                href={route('home')}
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                            >
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </main>

                <footer className="border-t border-gray-200 dark:border-gray-800 mt-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center space-x-3">
                                <img src="/favicon.png" alt="NexShift" className="w-8 h-8" />
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
