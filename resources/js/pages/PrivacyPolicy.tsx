import { Head, Link } from '@inertiajs/react';
import { Shield, Lock, Eye, FileText, Mail, Calendar, Users, Globe, Database } from 'lucide-react';

export default function PrivacyPolicy() {
    const effectiveDate = '11 March 2026';

    return (
        <>
            <Head title="Privacy Policy - NexShift">
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
                                    <Shield className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                                        Privacy Policy
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Effective date: {effectiveDate} &nbsp;·&nbsp; Version 1.0
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 1. Purpose */}
                        <section className="mb-10">
                            <div className="flex items-center gap-3 mb-4">
                                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">1. Purpose</h2>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                This Privacy Policy explains how NexShift collects, uses, shares, stores and protects personal data relating to healthcare professionals, organisation users, website visitors and support contacts.
                            </p>
                        </section>

                        {/* 2. Scope */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Scope</h2>
                            <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p>
                                    This Privacy Policy applies to personal data collected through the NexShift platform, website, mobile interfaces, customer support channels, onboarding workflows and compliance processes.
                                </p>
                                <p>
                                    NexShift provides a digital workforce coordination platform. It does not, by virtue of the platform alone, provide clinical services or supervise the delivery of care. Healthcare professionals remain responsible for professional practice and healthcare organisations remain responsible for clinical governance, supervision and patient-facing operational decisions.
                                </p>
                            </div>
                        </section>

                        {/* 3. Controller Details */}
                        <section className="mb-10">
                            <div className="flex items-center gap-3 mb-4">
                                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">3. Controller Details</h2>
                            </div>
                            <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p>
                                    NexShift is the controller for the personal data described in this Policy unless a particular service or client arrangement states otherwise.
                                </p>
                                <p>
                                    For data protection enquiries or rights requests, individuals may contact NexShift through the privacy contact details published by the company.
                                </p>
                            </div>
                        </section>

                        {/* 4. Categories of Personal Data */}
                        <section className="mb-10">
                            <div className="flex items-center gap-3 mb-4">
                                <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">4. Categories of Personal Data</h2>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 mb-3">NexShift may process:</p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                                <li>identity and contact data;</li>
                                <li>professional registration and qualification data;</li>
                                <li>right to work and workforce compliance data;</li>
                                <li>platform activity and communication data;</li>
                                <li>payment and billing data;</li>
                                <li>technical and device data;</li>
                                <li>special category data where required for workforce compliance or identity assurance;</li>
                                <li>criminal offence data where a DBS-related process is lawfully required; and</li>
                                <li>limited incidental patient-confidential information where this is contained in complaints, attachments, support tickets or incident reports and cannot reasonably be excluded from the record.</li>
                            </ul>
                        </section>

                        {/* 5. Purposes and Lawful Bases */}
                        <section className="mb-10">
                            <div className="flex items-center gap-3 mb-4">
                                <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">5. Purposes and Lawful Bases</h2>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 mb-3">NexShift processes personal data to:</p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4 mb-4">
                                <li>create and manage user accounts;</li>
                                <li>verify identity and workforce eligibility;</li>
                                <li>administer bookings, staffing workflows and payments;</li>
                                <li>prevent fraud and protect platform security;</li>
                                <li>comply with legal, regulatory, safeguarding and audit obligations; and</li>
                                <li>respond to support requests, complaints and incidents.</li>
                            </ul>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p>
                                    The lawful bases used by NexShift include contract, legal obligation, legitimate interests and, where appropriate, consent.
                                </p>
                                <p>
                                    Where special category or criminal offence data is processed, NexShift also relies on the additional conditions required by law.
                                </p>
                            </div>
                        </section>

                        {/* 6. Data Sharing */}
                        <section className="mb-10">
                            <div className="flex items-center gap-3 mb-4">
                                <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">6. Data Sharing</h2>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 mb-3">NexShift may share personal data with:</p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4 mb-4">
                                <li>healthcare organisations receiving staffing or workforce management services, including hospitals, clinics, care homes, residential care providers, domiciliary care providers and community healthcare providers;</li>
                                <li>identity verification, hosting, support and analytics providers acting under contract;</li>
                                <li>payment providers and professional advisers;</li>
                                <li>regulators, law enforcement or competent authorities where required or permitted by law; and</li>
                                <li>insurers or auditors where necessary for legitimate governance purposes.</li>
                            </ul>
                            <p className="text-gray-700 dark:text-gray-300 font-medium">NexShift does not sell personal data.</p>
                        </section>

                        {/* 7. International Transfers */}
                        <section className="mb-10">
                            <div className="flex items-center gap-3 mb-4">
                                <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">7. International Transfers</h2>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                If NexShift transfers personal data outside the UK, it shall implement a lawful transfer mechanism and appropriate safeguards.
                            </p>
                        </section>

                        {/* 8. Retention */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Retention</h2>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                NexShift retains personal data only for as long as necessary for the purpose for which it was collected, subject to legal, contractual, audit and dispute preservation requirements. Detailed periods are maintained in the Data Retention Policy.
                            </p>
                        </section>

                        {/* 9. Security */}
                        <section className="mb-10">
                            <div className="flex items-center gap-3 mb-4">
                                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">9. Security</h2>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                NexShift uses technical and organisational measures designed to protect personal data against unauthorised access, loss, destruction or alteration, including access controls, encryption, logging and incident management.
                            </p>
                        </section>

                        {/* 10. Individual Rights */}
                        <section className="mb-10">
                            <div className="flex items-center gap-3 mb-4">
                                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">10. Individual Rights</h2>
                            </div>
                            <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p>
                                    Subject to applicable law, individuals may request access, rectification, erasure, restriction, portability, objection and review of qualifying automated decisions.
                                </p>
                                <p>
                                    Individuals also have the right to complain to the Information Commissioner's Office if they believe that NexShift has handled their personal data unlawfully.
                                </p>
                            </div>
                        </section>

                        {/* 11. Children */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">11. Children</h2>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                NexShift is not directed at children. Where NexShift becomes aware that it has collected personal data from a child outside an authorised business context, it shall take appropriate steps to review lawfulness and delete or restrict data where required.
                            </p>
                        </section>

                        {/* 12. Changes to this Policy */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">12. Changes to this Policy</h2>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                NexShift may update this Privacy Policy to reflect changes in law, regulatory expectations, operational practices or technology. Material changes shall be communicated through appropriate channels.
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
                                    For data protection enquiries or rights requests, please contact us:
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
