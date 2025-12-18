import React, { useState } from 'react';
import { Menu, X, LayoutDashboard, FileText, Settings, LogOut, User } from 'lucide-react';
import { cn } from '../../utils/cn';

interface LayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: LayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '#' },
        { icon: FileText, label: 'Examinations', href: '#', active: true },
        { icon: User, label: 'Profile', href: '#' },
        { icon: Settings, label: 'Settings', href: '#' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <header className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center sticky top-0 z-50">
                <h1 className="text-xl font-bold text-blue-600">CBT</h1>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-600 dark:text-gray-300">
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Sidebar */}
            <aside className={cn(
                "fixed md:sticky top-0 left-0 z-40 w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform md:translate-x-0 overflow-y-auto shrink-0",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-blue-600 hidden md:block mb-8 font-mono">CBT_SYSTEM</h1>

                    <nav className="space-y-1">
                        {menuItems.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                className={cn(
                                    "flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors font-medium",
                                    item.active
                                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50"
                                )}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </a>
                        ))}
                    </nav>
                </div>

                <div className="absolute bottom-0 w-full p-6 border-t border-gray-100 dark:border-gray-700/50">
                    <button className="flex items-center space-x-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 w-full px-4 py-3 rounded-xl transition-colors font-medium">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-x-hidden">
                {children}
            </main>
        </div>
    );
}
