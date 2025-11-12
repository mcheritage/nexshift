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
                                <img src="/favicon.png" alt="NexShift" className="w-10 h-10" />
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
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Redefined</span>
                        </h1>
                        <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">
                            A smarter, faster, and more transparent solution connecting healthcare professionals directly with providers — eliminating inefficiencies and high agency costs.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {!auth.user && (
                                <>
                                    <Link
                                        href={route('register')}
                                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
                                    >
                                        Get Started
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

                {/* About Us Section */}
                <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 overflow-hidden">
                    {/* Background decorative elements */}
                    <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10"></div>
                    
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
                            About <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Us</span>
                        </h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto"></div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
                        {/* Card 1 */}
                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-3xl shadow-xl border border-blue-100 dark:border-gray-700 hover:shadow-2xl transition-shadow duration-300">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                Next-Generation Platform
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                Nexshift is redefining healthcare staffing. Built and owned by <span className="font-semibold text-blue-600 dark:text-blue-400">Mc Heritage Consulting Limited</span>, a UK-based digital technology company, we're replacing traditional agency systems with a smarter, faster, and more transparent solution.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-3xl shadow-xl border border-purple-100 dark:border-gray-700 hover:shadow-2xl transition-shadow duration-300">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                Transforming Workforce Management
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                We empower professionals to control their schedules while helping facilities access trusted, verified staff in real time. Nexshift bridges workforce gaps through innovative technology, automation, and human-centered design.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-3xl shadow-xl border border-indigo-100 dark:border-gray-700 hover:shadow-2xl transition-shadow duration-300">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                                <TrendingUp className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                Streamlined & Cost-Effective
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                By connecting professionals directly with employers, we eliminate inefficiencies and high costs. Our platform creates a <span className="font-semibold text-indigo-600 dark:text-indigo-400">fair and flexible staffing experience</span> that improves work-life balance and reduces operational costs.
                            </p>
                        </div>

                        {/* Card 4 */}
                        <div className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-3xl shadow-xl border border-cyan-100 dark:border-gray-700 hover:shadow-2xl transition-shadow duration-300">
                            <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                                <CheckCircle className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                Empowering Through Technology
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                We believe in <span className="font-semibold text-cyan-600 dark:text-cyan-400">empowering people through technology</span>. Our values are rooted in trust, innovation, and impact — ensuring better opportunities for professionals and quality care for patients.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Vision & Mission Section */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl">
                    <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-xl flex items-center justify-center mb-6">
                                <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                Our Vision
                            </h3>
                            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                                To build the most trusted digital platform that transforms healthcare staffing — enabling flexibility, transparency, and excellence in patient care across the UK and beyond.
                            </p>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-xl flex items-center justify-center mb-6">
                                <CheckCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                Our Mission
                            </h3>
                            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                                To empower healthcare professionals and organizations with innovative, data-driven technology that simplifies shift management, reduces staffing gaps, and enhances the overall quality of care delivery.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Core Values Section */}
                <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 overflow-hidden">
                    {/* Background pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 -z-10 rounded-3xl"></div>
                    <div className="absolute top-10 right-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl -z-10"></div>
                    <div className="absolute bottom-10 left-10 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl -z-10"></div>
                    
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                                Our Core <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Values</span>
                            </h2>
                            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-8"></div>
                        </div>
                        
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 lg:p-12 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700">
                            <div className="grid md:grid-cols-3 gap-6 mb-8">
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                        <TrendingUp className="w-10 h-10 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Innovation</h3>
                                    <p className="text-gray-600 dark:text-gray-300">Driven by cutting-edge technology</p>
                                </div>
                                
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                        <Shield className="w-10 h-10 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Trust</h3>
                                    <p className="text-gray-600 dark:text-gray-300">Built on transparency & reliability</p>
                                </div>
                                
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-gradient-to-br from-pink-600 to-pink-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                        <Users className="w-10 h-10 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Empowerment</h3>
                                    <p className="text-gray-600 dark:text-gray-300">Flexibility & choice for all</p>
                                </div>
                            </div>
                            
                            <p className="text-lg lg:text-xl text-gray-700 dark:text-gray-300 leading-relaxed text-center mb-8">
                                At Nexshift, our values are the heartbeat of everything we do. We are driven by innovation and guided by integrity, building trust through transparency and reliability. We believe in empowering healthcare professionals with flexibility and choice, while helping providers access affordable staffing solutions to deliver excellence in care.
                            </p>
                            
                            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-center mb-8">
                                Our culture thrives on collaboration, fueled by compassion for the people who make healthcare possible. Above all, we are committed to creating lasting impact — transforming the future of healthcare staffing with technology that makes work smarter, fairer, and more human.
                            </p>
                            
                            <div className="text-center">
                                <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-2xl shadow-xl">
                                    <p className="text-2xl lg:text-3xl font-bold text-white">
                                        Nexshift — Empowering the Future of Healthcare Work
                                    </p>
                                </div>
                            </div>
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
                            Ready to Transform Healthcare Staffing?
                        </h2>
                        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                            Join the future of healthcare work. Experience smarter scheduling, verified professionals, and transparent staffing — all in one platform.
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
