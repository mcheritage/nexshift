import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Calendar, Clock, Users, Shield, TrendingUp, CheckCircle } from 'lucide-react';

export default function LandingPage() {
    const { auth } = usePage<SharedData>().props;

    const features = [
        {
            icon: Calendar,
            title: 'Smart Shift Management',
            description: 'Efficiently schedule and manage shifts with our intuitive calendar system.'
        },
        {
            icon: Users,
            title: 'Healthcare Worker Network',
            description: 'Connect with qualified healthcare professionals ready to fill your shifts.'
        },
        {
            icon: Clock,
            title: 'Real-Time Updates',
            description: 'Get instant notifications for shift applications, approvals, and changes.'
        },
        {
            icon: Shield,
            title: 'Verified Professionals',
            description: 'All healthcare workers are verified with proper certifications and documentation.'
        },
        {
            icon: TrendingUp,
            title: 'Analytics & Reporting',
            description: 'Track performance metrics, costs, and optimize your staffing strategy.'
        },
        {
            icon: CheckCircle,
            title: 'Automated Timesheets',
            description: 'Streamline payroll with automatic timesheet generation and approval workflows.'
        }
    ];

    return (
        <>
            <Head title="Welcome to NexShift">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600&family=inter:400,500,600,700" rel="stylesheet" />
            </Head>
            
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
                    <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">N</span>
                                </div>
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    NexShift
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
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

                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
                            Healthcare Staffing,
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Simplified</span>
                        </h1>
                        <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">
                            Connect care homes with qualified healthcare professionals. 
                            Streamline shift management, reduce admin time, and ensure quality care coverage.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {!auth.user && (
                                <>
                                    <Link
                                        href={route('register')}
                                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
                                    >
                                        Start Free Trial
                                    </Link>
                                    <Link
                                        href={route('login')}
                                        className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg font-semibold rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-500 transition-all duration-200"
                                    >
                                        Login
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Everything You Need
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            Powerful features to manage your healthcare workforce
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div 
                                    key={index}
                                    className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-900"
                                >
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-xl flex items-center justify-center mb-4">
                                        <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 lg:p-20 text-center shadow-2xl">
                        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                            Ready to Transform Your Staffing?
                        </h2>
                        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                            Join hundreds of care homes already using NexShift to manage their healthcare workforce.
                        </p>
                        {!auth.user && (
                            <Link
                                href={route('register')}
                                className="inline-block px-10 py-4 bg-white text-blue-600 text-lg font-semibold rounded-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
                            >
                                Get Started Today
                            </Link>
                        )}
                    </div>
                </section>

                <footer className="border-t border-gray-200 dark:border-gray-800 mt-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold">N</span>
                                </div>
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
