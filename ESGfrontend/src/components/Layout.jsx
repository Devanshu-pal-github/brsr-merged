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
        <div className="min-h-screen w-screen bg-[#F2F4F5] font-sans text-[#1A1A1A] grid grid-cols-[minmax(220px,280px)_1fr] grid-rows-[auto_1fr]" style={{overflow:'hidden'}}>
            {/* Sidebar: visually balanced, always full height */}
            <aside className="row-span-2 col-span-1 h-screen bg-[#000D30] z-40 transition-all duration-500 flex flex-col">
                <Sidebar />
            </aside>

            {/* Navbar: always meets sidebar, never shredded */}
            <header className="col-span-1 row-span-1 h-[64px] min-h-[56px] max-h-[90px] bg-[#000D30] shadow-md flex items-center px-6 transition-all duration-500 z-50">
                <Header toggleSidebar={toggleSidebar} />
            </header>

            {/* Main content: fills remaining space, always aligned */}
            <main className="col-span-1 row-span-1 flex flex-col min-w-0 max-w-full pt-0 pb-0 overflow-y-auto transition-all duration-500 px-6" style={{height:'calc(100vh - 64px)'}}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
