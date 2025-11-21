import { Head, Link } from '@inertiajs/react';
import { Trash2, AlertTriangle, CheckCircle, FileText, Mail, Calendar, Shield } from 'lucide-react';

export default function AccountDeletion() {
    const lastUpdated = 'January 2025';

    return (
        <>
            <Head title="Account Deletion - NexShift">
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
                                <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <Trash2 className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                                        Account Deletion Request
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Last updated: {lastUpdated}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Important Notice */}
                        <div className="mb-10 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 p-6 rounded-lg">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
                                        Important Notice
                                    </h3>
                                    <p className="text-red-800 dark:text-red-300">
                                        Account deletion is permanent and cannot be undone. Once your account is deleted, you will lose access to all your data, shift history, applications, and other information associated with your NexShift account. Please ensure you have downloaded any important information before proceeding.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Introduction */}
                        <section className="mb-10">
                            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                                At <strong>NexShift</strong>, operated by <strong>Mc Heritage Consulting Limited</strong>, we respect your right to control your personal data. This page provides clear instructions on how to request the deletion of your account and associated data.
                            </p>
                            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                                If you wish to delete your NexShift account, please follow the steps outlined below. We will process your request in accordance with applicable data protection laws and our privacy policy.
                            </p>
                        </section>

                        {/* Steps to Request Account Deletion */}
                        <section className="mb-10">
                            <div className="flex items-center gap-3 mb-6">
                                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    How to Request Account Deletion
                                </h2>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 p-6 rounded-xl border-l-4 border-blue-600">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                        Step 1: Delete Your Account via the Mobile App
                                    </h3>
                                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                                        The easiest way to delete your account is directly through the NexShift mobile application:
                                    </p>
                                    <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300 ml-2">
                                        <li>Open the NexShift mobile app on your device</li>
                                        <li>Navigate to your Profile or Settings section</li>
                                        <li>Select "Delete Account" or "Account Settings"</li>
                                        <li>Follow the on-screen instructions to confirm your identity</li>
                                        <li>Enter your password and type "DELETE MY ACCOUNT" to confirm</li>
                                        <li>Your account will be permanently deleted immediately upon confirmation</li>
                                    </ol>
                                </div>

                                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 p-6 rounded-xl border-l-4 border-purple-600">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                        Step 2: Alternative - Request Deletion via Email
                                    </h3>
                                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                                        If you are unable to access the mobile app, you can request account deletion by email:
                                    </p>
                                    <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300 ml-2">
                                        <li>Send an email to <strong className="text-blue-600 dark:text-blue-400">privacy@nexshift.com</strong></li>
                                        <li>Use the subject line: "Account Deletion Request"</li>
                                        <li>Include the following information:
                                            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                                <li>Your full name</li>
                                                <li>The email address associated with your NexShift account</li>
                                                <li>A clear statement requesting account deletion</li>
                                                <li>Any additional verification information if requested</li>
                                            </ul>
                                        </li>
                                        <li>We will verify your identity and process your request within 30 days</li>
                                        <li>You will receive a confirmation email once your account has been deleted</li>
                                    </ol>
                                </div>

                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-600 p-6 rounded-xl">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                        Important Notes
                                    </h3>
                                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-2">
                                        <li>You must be logged into your account to delete it via the mobile app</li>
                                        <li>Account deletion requires password verification for security purposes</li>
                                        <li>If you have pending shifts, applications, or financial transactions, please resolve these before deleting your account</li>
                                        <li>Once deleted, you will not be able to recover any data or restore your account</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Data Deletion Information */}
                        <section className="mb-10">
                            <div className="flex items-center gap-3 mb-6">
                                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    What Data is Deleted
                                </h2>
                            </div>
                            
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        Data That Will Be Permanently Deleted
                                    </h3>
                                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                                        When you delete your NexShift account, the following data will be permanently removed from our systems:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                                        <li><strong>Account Information:</strong> Your profile data including name, email address, phone number, date of birth, gender, and bio</li>
                                        <li><strong>Profile Details:</strong> Profile photos, qualifications, certifications, skills, work experience, and professional information</li>
                                        <li><strong>Healthcare Profile:</strong> Your complete healthcare worker profile and associated data</li>
                                        <li><strong>Bank Details:</strong> All banking and payment information stored in your account</li>
                                        <li><strong>Documents:</strong> All uploaded documents including identification, certificates, and verification documents</li>
                                        <li><strong>Applications:</strong> All shift applications you have submitted</li>
                                        <li><strong>Timesheets:</strong> All timesheet records associated with your account</li>
                                        <li><strong>Notifications:</strong> All notification history and preferences</li>
                                        <li><strong>Authentication Tokens:</strong> All active session tokens and API access tokens</li>
                                        <li><strong>Wallet Information:</strong> Wallet balance and transaction history (subject to financial record retention requirements)</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                        Data That May Be Retained
                                    </h3>
                                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                                        Certain data may be retained for legal, regulatory, or business purposes, even after account deletion:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                                        <li><strong>Financial Records:</strong> Financial transaction records, invoices, and payment history may be retained for up to 7 years as required by tax and accounting regulations</li>
                                        <li><strong>Activity Logs:</strong> System activity logs and audit trails may be retained for security and compliance purposes (user identification will be anonymized where possible)</li>
                                        <li><strong>Shift Records:</strong> Historical shift records may be retained in anonymized form for business analytics and compliance purposes</li>
                                        <li><strong>Legal Obligations:</strong> Any data required to be retained by law, regulation, or court order will be kept for the required retention period</li>
                                        <li><strong>Dispute Resolution:</strong> Data related to ongoing disputes, investigations, or legal proceedings may be retained until resolution</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Data Retention Period */}
                        <section className="mb-10">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                                Data Retention Period
                            </h2>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl">
                                <p className="text-gray-700 dark:text-gray-300 mb-4">
                                    <strong>Immediate Deletion:</strong> Most personal data and account information will be deleted immediately upon account deletion confirmation.
                                </p>
                                <p className="text-gray-700 dark:text-gray-300 mb-4">
                                    <strong>Extended Retention:</strong> Financial records and transaction data may be retained for up to 7 years from the date of the last transaction, in compliance with UK tax and accounting regulations.
                                </p>
                                <p className="text-gray-700 dark:text-gray-300">
                                    <strong>Anonymized Data:</strong> Some data may be converted to anonymized form and retained indefinitely for business analytics, provided it cannot be used to identify you personally.
                                </p>
                            </div>
                        </section>

                        {/* Contact Information */}
                        <section className="mb-10">
                            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 p-6 rounded-xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        Contact Us
                                    </h2>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 mb-4">
                                    If you have questions about account deletion, need assistance with the process, or wish to request deletion via email, please contact us:
                                </p>
                                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                                    <p><strong>Mc Heritage Consulting Limited</strong></p>
                                    <p>Email: <a href="mailto:privacy@nexshift.com" className="text-blue-600 dark:text-blue-400 hover:underline">privacy@nexshift.com</a></p>
                                    <p>Address: United Kingdom</p>
                                    <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                                        We aim to respond to all account deletion requests within 30 days of receipt.
                                    </p>
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

