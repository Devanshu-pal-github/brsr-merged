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
        <div className="min-h-screen bg-[#F2F4F5]">
            {/* Fixed Sidebar */}
            <div
                ref={sidebarRef}
                className="fixed top-0 left-0 w-52 lg:w-56 xl:w-60 h-full z-30"
            >
                <Sidebar />
            </div>

            {/* Fixed Header - shifted right of sidebar minus 10px */}
            <header
                className="
                    fixed top-0 right-0 h-[60px] z-40
                    left-[198px] 
                    lg:left-[214px] 
                    xl:left-[230px]
                "
            >
                <Header toggleSidebar={toggleSidebar} />
            </header>

            {/* Main content */}
            <main
                className="
                    pt-[10px] transition-all duration-300 
                    pl-[95px] 
                "
            >
                <div className="pl-10  ">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
