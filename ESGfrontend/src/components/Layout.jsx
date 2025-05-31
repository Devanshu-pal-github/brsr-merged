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
                className="fixed top-0 left-0 h-full w-[18vw] min-w-[180px] max-w-[320px] z-40 transition-all duration-500 bg-[#000D30]"
            >
                <Sidebar />
            </div>

            {/* Main content wrapper (includes header and main) */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-500" style={{ marginLeft: '18vw' }}>
                {/* Fixed Header */}
                <header className="fixed top-0 w-full right-0 z-50 w-auto bg-[#000D30] shadow-md h-[8vh] min-h-[56px] flex items-center transition-all duration-500">
                    <Header toggleSidebar={toggleSidebar} />
                </header>
                {/* Main content - scrollable, with header offset */}
                <main className="flex-1 w-full min-w-0 max-w-[90vw] mx-auto pt-[8vh] pb-[3vh] overflow-y-auto transition-all duration-500 px-[2vw]">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
