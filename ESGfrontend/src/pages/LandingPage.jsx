import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Users2, ClipboardCheck, ArrowRight } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('User');

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
            return;
        }
        const storedUserName = localStorage.getItem('user_name');
        if (storedUserName) {
            setUserName(storedUserName);
        }
        document.title = `Welcome to BRSR`;    }, [navigate]);
    
    const quickActions = [
        {
            icon: FileText,
            title: 'General Details',
            description: 'Fill in your company details and general information',
            link: '/general'
        },
        {
            icon: Users2,
            title: 'Team Management',
            description: 'Manage your team members and their roles',
            link: '#'
        },
        {
            icon: ClipboardCheck,
            title: 'Recent Activities',
            description: 'Check your recent submissions and updates',
            link: '#'
        }
    ];

    return (
        <main className="flex-1 min-w-0 overflow-y-auto p-6">
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#1A2341]">
                    Welcome back, {userName}
                </h1>
                <p className="text-[#4B5563] mt-2">
                    Get started with your BRSR reporting journey
                </p>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {quickActions.map((action, index) => (
                    <div
                        key={index}
                        onClick={() => action.link !== '#' && navigate(action.link)}
                        className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <action.icon className="w-8 h-8 text-[#14B8A6]" />
                            <ArrowRight className="w-5 h-5 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-[#1A2341] mb-2">
                            {action.title}
                        </h3>
                        <p className="text-sm text-[#4B5563]">
                            {action.description}
                        </p>
                    </div>
                ))}
            </div>

            {/* Additional Content Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#1A2341] mb-4">
                    Getting Started with BRSR
                </h2>
                <div className="prose max-w-none text-[#4B5563]">
                    <p>
                        Business Responsibility and Sustainability Report (BRSR) is a comprehensive 
                        framework that helps companies report their environmental, social, and 
                        governance (ESG) performance. Use this platform to:
                    </p>
                    <ul className="mt-4 space-y-2 list-disc pl-5">
                        <li>Complete your BRSR disclosures</li>
                        <li>Track your sustainability performance</li>
                        <li>Generate detailed reports</li>
                        <li>Collaborate with your team</li>
                    </ul>
                </div>
            </div>
        </main>
    );
};

export default LandingPage;
