import { useRef } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
    const sidebarRef = useRef(null);

    const toggleSidebar = () => {
        const sidebarToggle = sidebarRef.current.querySelector('[data-toggle-sidebar]');
        if (sidebarToggle) {
            sidebarToggle.dataset.toggleSidebar();
        }
    };

    return (
        <div className="min-h-screen bg-[#F2F4F5] flex font-sans text-[#1A1A1A]">
            {/* Fixed Sidebar */}
            <div
                ref={sidebarRef}
                className="fixed top-0 left-0 w-52 lg:w-56 xl:w-60 h-full z-40"
            >
                <Sidebar />
            </div>

            {/* Main content wrapper (includes header and main) */}
            <div className="flex-1 flex flex-col min-w-0" style={{ marginLeft: '13rem' }}>
                {/* Fixed Header */}
                <header className="fixed ml-[22px] top-0 left-[13rem] right-0 z-50 w-auto bg-white shadow-md h-[60px] flex items-center">
                    <Header toggleSidebar={toggleSidebar} />
                </header>
                {/* Main content - scrollable, with header offset */}
                <main className="flex-1 w-full min-w-0 max-w-7xl mx-auto pt-[60px] pb-10 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
