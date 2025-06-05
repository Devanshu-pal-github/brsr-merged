import { Navigate, Outlet } from 'react-router-dom';
import WelcomeSidebar from '../components/WelcomePage/WelcomeSidebar';
import WelcomeHeader from '../components/WelcomePage/WelcomeHeader';

const WelcomeLayout = () => {
    // Check for auth token
    const token = localStorage.getItem('access_token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#F2F4F5] font-sans text-[#1A1A1A]">
            {/* Welcome Sidebar - fixed width */}
            <div className="w-[190px] relative h-full z-50">
                <WelcomeSidebar />
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col flex-1">
                {/* Welcome Header */}
                <WelcomeHeader />

                {/* Content Area */}
                <main className="flex-1 min-w-0 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default WelcomeLayout;
