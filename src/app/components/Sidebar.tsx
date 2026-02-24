"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
  ClipboardList,
  ClipboardCheck,
  Building2,
  LineChart,
  ShoppingCart,
  FileSpreadsheet,
  CalendarCheck,
  UserSquare2,
  History,
  HandCoins,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Settings,
  ShieldCheck,
  Compass,
  Zap,
  Briefcase
} from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignOutButton } from '@clerk/nextjs';
import NotificationBell from './NotificationBell';

// --- NAVIGATION GROUPS ---
const NAVIGATION_GROUPS = [
  {
    title: "Core Fleet",
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/', roles: ['admin', 'master', 'seller'] },
      { label: 'Team Board', icon: Users, href: '/team-board', roles: ['admin', 'master', 'seller', 'user'] },
      { label: 'Create Task', icon: ClipboardList, href: '/create-task', roles: ['admin', 'master', 'seller', 'user'] },
      { label: 'Assigned Task', icon: ClipboardCheck, href: '/report', roles: ['admin', 'master', 'seller'] },
    ]
  },
  {
    title: "Intelligence",
    items: [
      { label: 'Recovery Hub', icon: HandCoins, href: '/payments/recovery', roles: ['admin', 'master', 'seller'] },
      { label: 'KAM Strategy', icon: Building2, href: '/kam', roles: ['admin', 'master', 'seller'] },
      { label: 'Sales Matrix', icon: TrendingUp, href: '/sales-dashboard', roles: ['master'] },
      { label: 'My Growth', icon: ShoppingCart, href: '/seller/dashboard', roles: ['seller', 'admin', 'master'] },
      { label: 'CRM Forms', icon: Briefcase, href: '/crm/forms', roles: ['admin', 'master', 'seller', 'user'] },
    ]
  },
  {
    title: "Operations",
    items: [
      { label: 'Attendance', icon: CalendarCheck, href: '/dashboard/attendance', roles: ['admin', 'master', 'seller'] },
      { label: 'Tish Control', icon: ShieldCheck, href: '/dashboard/attendance/tish', roles: ['admin', 'master'] },
      { label: 'Activity Log', icon: History, href: '/activities', roles: ['admin', 'master', 'seller', 'user'] },
      { label: 'Lifecycle Report', icon: LineChart, href: '/activities/report', roles: ['admin', 'master'] },
      { label: 'Customers', icon: UserSquare2, href: '/customers', roles: ['admin', 'master', 'seller'] },
    ]
  },
  {
    title: "Resources",
    items: [
      { label: 'Agreements', icon: FileSpreadsheet, href: '/FullDashboard/agreement', roles: ['admin', 'master', 'seller'] },
      { label: 'Timeline', icon: LineChart, href: '/timeline', roles: ['admin', 'master', 'seller'] },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Auto-collapse on smaller screens, expand on large
    const handleResize = () => {
      if (window.innerWidth < 1280) setIsCollapsed(true);
      else setIsCollapsed(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!mounted) return <div className="w-20 lg:w-64 h-screen bg-[#0f172a]" />;

  const userRole = isLoaded ? (user?.publicMetadata?.role as string || 'user') : 'user';

  return (
    <>
      {/* Mobile Trigger */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="xl:hidden fixed top-5 left-5 z-[100] p-3 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-100"
      >
        <Menu size={20} />
      </button>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] xl:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? 88 : 280,
          x: isMobileOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 1280 ? -300 : 0)
        }}
        className={`fixed xl:sticky top-0 left-0 h-screen bg-[#0f172a] text-slate-300 z-[90] 
          border-r border-slate-800 transition-all duration-300 ease-in-out flex flex-col shadow-2xl overflow-hidden`}
      >
        {/* Glow Effects */}
        <div className="absolute top-0 left-0 w-full h-32 bg-indigo-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-full h-32 bg-purple-500/10 blur-[100px] pointer-events-none" />

        {/* Brand Header */}
        <div className="p-6 flex items-center justify-between relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
              <Zap className="text-white fill-white" size={20} />
            </div>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col"
              >
                <span className="text-xl font-black text-white leading-none tracking-tight">MAGIC<span className="text-indigo-400">SCALE</span></span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Enterprise OS</span>
              </motion.div>
            )}
          </Link>
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors shrink-0 xl:flex hidden"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          {isCollapsed && (
            <button
              onClick={() => setIsCollapsed(false)}
              className="absolute -right-3 top-20 w-6 h-6 bg-indigo-600 text-white rounded-full items-center justify-center shadow-lg xl:flex hidden hover:scale-110 transition-transform"
            >
              <ChevronRight size={14} />
            </button>
          )}
        </div>

        {/* Multi-tier Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 scrollbar-hide relative z-10">

          {userRole !== 'user' && (
            <div className="space-y-2">
              <NotificationBell isCollapsed={isCollapsed} />
            </div>
          )}

          {NAVIGATION_GROUPS.map((group, gIdx) => {
            // Filter group items by role
            const visibleItems = group.items.filter(i => i.roles.includes(userRole));
            if (visibleItems.length === 0) return null;

            return (
              <div key={gIdx} className="space-y-2">
                {!isCollapsed && (
                  <h3 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-4">
                    {group.title}
                  </h3>
                )}
                {visibleItems.map((item, iIdx) => {
                  const isActive = pathname === item.href;
                  return (
                    <Tooltip.Root key={iIdx} delayDuration={0}>
                      <Tooltip.Trigger asChild>
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileOpen(false)}
                          className={`group flex items-center gap-3 px-4 py-3 rounded-[14px] transition-all relative
                            ${isActive
                              ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20'
                              : 'hover:bg-slate-800/50 hover:text-white text-slate-400'}`}
                        >
                          <item.icon size={20} className={`shrink-0 ${isActive ? 'text-white' : 'group-hover:text-indigo-400'}`} />

                          {!isCollapsed && (
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-sm font-bold truncate"
                            >
                              {item.label}
                            </motion.span>
                          )}

                          {isActive && !isCollapsed && (
                            <motion.div
                              layoutId="activeHighlight"
                              className="absolute right-2 w-1.5 h-1.5 rounded-full bg-indigo-200 shadow-sm"
                            />
                          )}
                        </Link>
                      </Tooltip.Trigger>
                      {isCollapsed && (
                        <Tooltip.Portal>
                          <Tooltip.Content
                            side="right"
                            sideOffset={15}
                            className="bg-slate-900 text-white text-[11px] font-black px-4 py-2 rounded-xl shadow-2xl border border-slate-800 z-[1000] uppercase tracking-widest"
                          >
                            {item.label}
                            <Tooltip.Arrow className="fill-slate-900" />
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      )}
                    </Tooltip.Root>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* User Workspace Profile */}
        <div className="p-4 bg-slate-800/20 border-t border-slate-800/50 backdrop-blur-md relative z-10">
          <div className="flex items-center gap-3 p-2">
            <div className="shrink-0 relative">
              {isLoaded && user && (
                <img src={user.imageUrl} className="w-10 h-10 rounded-[14px] ring-2 ring-slate-800 shadow-lg" alt="Profile" />
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#0f172a] rounded-full" />
            </div>

            {!isCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-black text-white truncate">{user?.firstName || 'Innovator'}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">{userRole} Workspace</span>
              </motion.div>
            )}

            {!isCollapsed && (
              <SignOutButton>
                <button className="p-2 hover:bg-red-500/10 hover:text-red-400 text-slate-500 rounded-xl transition-all">
                  <LogOut size={16} />
                </button>
              </SignOutButton>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
}
