import { Head, Link } from '@inertiajs/react';
import { Shield, Lock, Eye, FileText, Mail, Calendar } from 'lucide-react';

export default function PrivacyPolicy() {
    const lastUpdated = 'January 2025';

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
                                        Last updated: {lastUpdated}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Introduction */}
                        <section className="mb-10">
                            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                                At NexShift, operated by <strong>Mc Heritage Consulting Limited</strong>, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our healthcare staffing platform and mobile application.
                            </p>
                            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                                By using our services, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
                            </p>
                        </section>

                        {/* Information We Collect */}
                        <section className="mb-10">
                            <div className="flex items-center gap-3 mb-6">
                                <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    1. Information We Collect
                                </h2>
                            </div>
                            
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                        1.1 Personal Information
                                    </h3>
                                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                                        We collect information that you provide directly to us, including:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                                        <li>Name, email address, phone number, and contact information</li>
                                        <li>Date of birth, gender, and other demographic information</li>
                                        <li>Professional qualifications, certifications, and licenses</li>
                                        <li>Work experience, skills, and employment history</li>
                                        <li>Bank account details and payment information</li>
                                        <li>Profile photographs and identification documents</li>
                                        <li>Location data (when using our mobile application)</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                        1.2 Automatically Collected Information
                                    </h3>
                                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                                        When you use our services, we automatically collect:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                                        <li>Device information (device type, operating system, unique device identifiers)</li>
                                        <li>IP address and browser type</li>
                                        <li>Usage data, including pages visited, features used, and time spent on the platform</li>
                                        <li>Log files and analytics data</li>
                                        <li>Cookies and similar tracking technologies</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                        1.3 Information from Third Parties
                                    </h3>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        We may receive information about you from third-party services, such as background check providers, verification services, or social media platforms (if you choose to connect your account).
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* How We Use Your Information */}
                        <section className="mb-10">
                            <div className="flex items-center gap-3 mb-6">
                                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    2. How We Use Your Information
                                </h2>
                            </div>
                            
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                We use the information we collect for the following purposes:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                                <li><strong>Service Delivery:</strong> To provide, maintain, and improve our staffing platform, including matching healthcare workers with shifts and managing applications</li>
                                <li><strong>Verification:</strong> To verify your identity, qualifications, and professional credentials</li>
                                <li><strong>Communication:</strong> To send you notifications, updates, and important information about your account, shifts, and our services</li>
                                <li><strong>Payment Processing:</strong> To process payments, manage invoices, and handle financial transactions</li>
                                <li><strong>Safety and Security:</strong> To ensure platform safety, prevent fraud, and comply with legal obligations</li>
                                <li><strong>Analytics:</strong> To analyze usage patterns, improve our services, and develop new features</li>
                                <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes</li>
                                <li><strong>Marketing:</strong> To send you promotional communications (with your consent) about our services and features</li>
                            </ul>
                        </section>

                        {/* Information Sharing */}
                        <section className="mb-10">
                            <div className="flex items-center gap-3 mb-6">
                                <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    3. Information Sharing and Disclosure
                                </h2>
                            </div>
                            
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                We do not sell your personal information. We may share your information in the following circumstances:
                            </p>
                            
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                        3.1 With Care Homes and Healthcare Facilities
                                    </h3>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        When you apply for shifts, we share relevant information (such as qualifications, experience, and availability) with care homes to facilitate the staffing process.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                        3.2 With Service Providers
                                    </h3>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        We may share information with third-party service providers who perform services on our behalf, such as payment processing, data analytics, cloud storage, and customer support.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                        3.3 Legal Requirements
                                    </h3>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        We may disclose information if required by law, court order, or government regulation, or to protect the rights, property, or safety of NexShift, our users, or others.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                        3.4 Business Transfers
                                    </h3>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Data Security */}
                        <section className="mb-10">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                                4. Data Security
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                                <li>Encryption of sensitive data in transit and at rest</li>
                                <li>Secure authentication and access controls</li>
                                <li>Regular security assessments and updates</li>
                                <li>Employee training on data protection</li>
                                <li>Compliance with industry security standards</li>
                            </ul>
                            <p className="text-gray-700 dark:text-gray-300 mt-4">
                                However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                            </p>
                        </section>

                        {/* Your Rights */}
                        <section className="mb-10">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                                5. Your Rights and Choices
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                Under applicable data protection laws (including GDPR and UK GDPR), you have the following rights:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                                <li><strong>Access:</strong> Request access to your personal information</li>
                                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                                <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal obligations)</li>
                                <li><strong>Portability:</strong> Request transfer of your data to another service provider</li>
                                <li><strong>Objection:</strong> Object to processing of your personal information for certain purposes</li>
                                <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
                                <li><strong>Withdraw Consent:</strong> Withdraw consent where processing is based on consent</li>
                            </ul>
                            <p className="text-gray-700 dark:text-gray-300 mt-4">
                                To exercise these rights, please contact us using the information provided in the "Contact Us" section below.
                            </p>
                        </section>

                        {/* Data Retention */}
                        <section className="mb-10">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                                6. Data Retention
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300">
                                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When you delete your account, we will delete or anonymize your personal information, except where we are required to retain it for legal, regulatory, or business purposes.
                            </p>
                        </section>

                        {/* Cookies */}
                        <section className="mb-10">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                                7. Cookies and Tracking Technologies
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                We use cookies and similar tracking technologies to collect and store information about your preferences and activity on our platform. You can control cookies through your browser settings, though disabling cookies may affect the functionality of our services.
                            </p>
                        </section>

                        {/* Children's Privacy */}
                        <section className="mb-10">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                                8. Children's Privacy
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300">
                                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected information from a child, we will take steps to delete such information.
                            </p>
                        </section>

                        {/* International Transfers */}
                        <section className="mb-10">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                                9. International Data Transfers
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300">
                                Your information may be transferred to and processed in countries other than your country of residence. We ensure that appropriate safeguards are in place to protect your information in accordance with this Privacy Policy and applicable data protection laws.
                            </p>
                        </section>

                        {/* Changes to Privacy Policy */}
                        <section className="mb-10">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                                10. Changes to This Privacy Policy
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300">
                                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
                            </p>
                        </section>

                        {/* Contact Us */}
                        <section className="mb-10">
                            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 p-6 rounded-xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        11. Contact Us
                                    </h2>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 mb-4">
                                    If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                                </p>
                                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                                    <p><strong>Mc Heritage Consulting Limited</strong></p>
                                    <p>Email: privacy@nexshift.com</p>
                                    <p>Address: United Kingdom</p>
                                </div>
                            </div>
                        </section>

                        {/* Footer */}
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
                                <span className="text-xl font-bold text-gray-900 dark:text-white">
                                    NexShift
                                </span>
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


