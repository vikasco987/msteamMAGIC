



// 'use client';

// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { LayoutDashboard, Users, LogOut } from 'lucide-react';

// const navItems = [
//   { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
//   { label: 'Team Board', icon: Users, href: '/team-board' },
//    { label: 'Create Task', icon: LayoutDashboard, href: '/create-task' },
//   { label: 'Logout', icon: LogOut, href: '/logout' },
// ];

// export default function Sidebar() {
//   const pathname = usePathname();

//   return (
//     <aside className="w-64 h-screen bg-white shadow-md p-4">
//       <h1 className="text-2xl font-bold mb-6">TeamBoard</h1>
//       <nav className="flex flex-col gap-2">
//         {navItems.map((item) => {
//           const isActive = pathname === item.href;
//           return (
//             <Link
//               key={item.href}
//               href={item.href}
//               className={`flex items-center gap-3 px-4 py-2 rounded-md transition ${
//                 isActive ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 text-gray-700'
//               }`}
//             >
//               <item.icon size={20} />
//               <span>{item.label}</span>
//             </Link>
//           );
//         })}
//       </nav>
//     </aside>
//   );
// }




// 'use client';

// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { LayoutDashboard, Users, LogOut } from 'lucide-react';

// const navItems = [
//   { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
//   { label: 'Team Board', icon: Users, href: '/team-board' },
//   { label: 'Create Task', icon: LayoutDashboard, href: '/create-task' },
//   { label: 'Logout', icon: LogOut, href: '/logout' },
// ];

// export default function Sidebar() {
//   const pathname = usePathname();

//   return (
//     <aside className="fixed top-0 left-0 h-screen w-64 bg-white shadow-md p-4 z-50">
//       <h1 className="text-2xl font-bold mb-6">TeamBoard</h1>
//       <nav className="flex flex-col gap-2">
//         {navItems.map((item) => {
//           const isActive = pathname === item.href;
//           return (
//             <Link
//               key={item.href}
//               href={item.href}
//               className={`flex items-center gap-3 px-4 py-2 rounded-md transition ${
//                 isActive ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 text-gray-700'
//               }`}
//             >
//               <item.icon size={20} />
//               <span>{item.label}</span>
//             </Link>
//           );
//         })}
//       </nav>
//     </aside>
//   );
// }












// // components/Sidebar.tsx
// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { LayoutDashboard, Users, LogOut, Menu } from 'lucide-react';

// const navItems = [
//   { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
//   { label: 'Team Board', icon: Users, href: '/team-board' },
//   { label: 'Create Task', icon: LayoutDashboard, href: '/create-task' },
//   { label: 'Logout', icon: LogOut, href: '/logout' },
// ];

// export default function Sidebar() {
//   const pathname = usePathname();
//   const [open, setOpen] = useState(false);

//   return (
//     <>
//       <button
//         onClick={() => setOpen(!open)}
//         className="md:hidden p-4 fixed top-0 left-0 z-50 bg-white shadow-md"
//       >
//         <Menu />
//       </button>

//       <aside
//         className={`fixed top-0 left-0 h-screen w-64 bg-white shadow-md p-4 z-40 transition-transform duration-300 transform ${
//           open ? 'translate-x-0' : '-translate-x-full'
//         } md:translate-x-0 md:static md:block`}
//       >
//         <h1 className="text-2xl font-bold mb-6">TeamBoard</h1>
//         <nav className="flex flex-col gap-2">
//           {navItems.map((item) => {
//             const isActive = pathname === item.href;
//             return (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 onClick={() => setOpen(false)}
//                 className={`flex items-center gap-3 px-4 py-2 rounded-md transition ${
//                   isActive ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 text-gray-700'
//                 }`}
//               >
//                 <item.icon size={20} />
//                 <span>{item.label}</span>
//               </Link>
//             );
//           })}
//         </nav>
//       </aside>
//     </>
//   );
// }

// // components/FileDropzone.tsx
// 'use client';

// import { useDropzone } from 'react-dropzone';

// export function FileDropzone({ onDrop }: { onDrop: (files: File[]) => void }) {
//   const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
//     onDrop: acceptedFiles => onDrop(acceptedFiles),
//   });

//   return (
//     <div
//       {...getRootProps()}
//       className="border-2 border-dashed border-purple-300 p-4 rounded cursor-pointer bg-purple-50 hover:bg-purple-100"
//     >
//       <input {...getInputProps()} />
//       <p className="text-center">📂 Drag & drop files here or click to upload</p>
//       <ul className="mt-2 text-sm">
//         {acceptedFiles.map(file => (
//           <li key={file.name}>{file.name}</li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// // components/TaskForm.tsx
// // Add state:
// // const [step, setStep] = useState(0);
// // Replace step UI:
// // {step === 0 && Basic Info Form}
// // {step === 1 && Upload Fields}
// // {step === 2 && Custom Fields with FileDropzone}
// // Navigation:
// // {step > 0 && <button onClick={() => setStep(step - 1)}>⬅ Back</button>}
// // {step < 2 ? <button onClick={() => setStep(step + 1)}>➡ Next</button> : <button type="submit">Submit</button>}











// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { LayoutDashboard, Users, LogOut, Menu } from 'lucide-react';

// const navItems = [
//   { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
//   { label: 'Team Board', icon: Users, href: '/team-board' },
//   { label: 'Create Task', icon: LayoutDashboard, href: '/create-task' },
//   { label: 'Logout', icon: LogOut, href: '/logout' },
// ];

// export default function Sidebar() {
//   const pathname = usePathname();
//   const [open, setOpen] = useState(false);

//   return (
//     <>
//       {/* Toggle Button for Mobile */}
//       <button
//         onClick={() => setOpen(!open)}
//         className="md:hidden p-4 fixed top-0 left-0 z-50 bg-white shadow-md"
//         aria-label="Toggle sidebar"
//       >
//         <Menu />
//       </button>

//       {/* Sidebar */}
//       <aside
//         className={`fixed top-0 left-0 h-screen w-64 bg-white shadow-md p-4 z-40 transform transition-transform duration-300 
//         ${open ? 'translate-x-0' : '-translate-x-full'} 
//         md:translate-x-0 md:static md:block`}
//       >
//         <h1 className="text-2xl font-bold mb-6">TeamBoard</h1>
//         <nav className="flex flex-col gap-2">
//           {navItems.map((item) => {
//             const isActive = pathname === item.href;
//             return (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 onClick={() => setOpen(false)} // Close menu on mobile click
//                 className={`flex items-center gap-3 px-4 py-2 rounded-md transition ${
//                   isActive
//                     ? 'bg-blue-500 text-white'
//                     : 'hover:bg-gray-100 text-gray-700'
//                 }`}
//               >
//                 <item.icon size={20} />
//                 <span>{item.label}</span>
//               </Link>
//             );
//           })}
//         </nav>
//       </aside>
//     </>
//   );
// }






// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { LayoutDashboard, Users, LogOut, Menu } from 'lucide-react';

// const navItems = [
//   { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
//   { label: 'Team Board', icon: Users, href: '/team-board' },
//   { label: 'Create Task', icon: LayoutDashboard, href: '/create-task' },
//   { label: 'Report', icon: LayoutDashboard, href: '/report' },
//   { label: 'Logout', icon: LogOut, href: '/logout' },
// ];

// export default function Sidebar() {
//   const pathname = usePathname();
//   const [open, setOpen] = useState(false);

//   return (
//     <>
//       {/* 🔁 Mobile Menu Toggle */}
//       <button
//         onClick={() => setOpen(!open)}
//         className="md:hidden p-4 fixed top-0 left-0 z-50 bg-white shadow-md"
//         aria-label="Toggle sidebar"
//       >
//         <Menu />
//       </button>

//       {/* 🧭 Sidebar */}
//       <aside
//         className={`fixed top-0 left-0 h-screen w-64 bg-white shadow-md p-4 z-40 transform transition-transform duration-300
//           ${open ? 'translate-x-0' : '-translate-x-full'}
//           md:translate-x-0 md:static md:block`}
//       >
//         <h1 className="text-2xl font-bold mb-6">TeamBoard</h1>
//         <nav className="flex flex-col gap-2">
//           {navItems.map((item) => {
//             const isActive = pathname === item.href;
//             return (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 onClick={() => setOpen(false)} // ✅ Close sidebar after navigation on mobile
//                 className={`flex items-center gap-3 px-4 py-2 rounded-md transition ${
//                   isActive
//                     ? 'bg-blue-500 text-white'
//                     : 'hover:bg-gray-100 text-gray-700'
//                 }`}
//               >
//                 <item.icon size={20} />
//                 <span>{item.label}</span>
//               </Link>
//             );
//           })}
//         </nav>
//       </aside>
//     </>
//   );
// }

// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import {
//   LayoutDashboard,
//   Users,
//   LogOut,
//   Menu,
//   ChevronLeft,
//   ChevronRight,
// } from 'lucide-react';

// const navItems = [
//   { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
//   { label: 'Team Board', icon: Users, href: '/team-board' },
//   { label: 'Create Task', icon: LayoutDashboard, href: '/create-task' },
//   { label: 'Report', icon: LayoutDashboard, href: '/report' },
//   { label: 'Logout', icon: LogOut, href: '/logout' },
// ];

// export default function Sidebar() {
//   const pathname = usePathname();
//   const [isMobileOpen, setIsMobileOpen] = useState(false);
//   const [isCollapsed, setIsCollapsed] = useState(false);

//   const toggleMobile = () => setIsMobileOpen(!isMobileOpen);
//   const toggleCollapse = () => setIsCollapsed(!isCollapsed);

//   return (
//     <>
//       {/* 📱 Mobile Toggle */}
//       <button
//         onClick={toggleMobile}
//         className="md:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white p-2 rounded-md shadow-md"
//       >
//         <Menu />
//       </button>

//       {/* 🧭 Sidebar */}
//       <aside
//         className={`
//           fixed top-0 left-0 h-screen bg-[#111827] text-white z-40 transition-all duration-300
//           ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
//           md:translate-x-0 md:static md:flex
//           ${isCollapsed ? 'w-20' : 'w-64'}
//         `}
//       >
//         <div className="flex flex-col h-full p-4 overflow-y-auto border-r border-gray-800 relative">

//           {/* 🧲 Collapse/Expand Toggle Button (Always visible on desktop) */}
//           <button
//             onClick={toggleCollapse}
//             className={`hidden md:flex items-center justify-center absolute top-4 -right-3 w-6 h-6 rounded-full z-50
//               transition-all duration-300 shadow-md border border-white
//               ${
//                 isCollapsed
//                   ? 'bg-blue-600 hover:bg-blue-700'
//                   : 'bg-white text-black hover:bg-gray-200'
//               }`}
//           >
//             {isCollapsed ? (
//               <ChevronRight size={16} />
//             ) : (
//               <ChevronLeft size={16} />
//             )}
//           </button>

//           {/* Sidebar Title */}
//           <h2
//             className={`text-2xl font-bold mb-8 transition-opacity ${
//               isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
//             }`}
//           >
//             TeamBoard
//           </h2>

//           {/* Nav Items */}
//           <nav className="flex flex-col gap-2">
//             {navItems.map((item) => {
//               const isActive = pathname === item.href;
//               return (
//                 <Link
//                   key={item.href}
//                   href={item.href}
//                   onClick={() => setIsMobileOpen(false)}
//                   className={`flex items-center gap-3 px-4 py-2 rounded-md transition-all font-medium ${
//                     isActive
//                       ? 'bg-white text-gray-900 shadow'
//                       : 'text-gray-300 hover:bg-gray-800 hover:text-white'
//                   }`}
//                 >
//                   <item.icon size={22} />
//                   {!isCollapsed && <span>{item.label}</span>}
//                 </Link>
//               );
//             })}
//           </nav>
//         </div>
//       </aside>

//       {/* 📱 Mobile Overlay */}
//       {isMobileOpen && (
//         <div
//           className="fixed inset-0 bg-black opacity-30 z-30 md:hidden"
//           onClick={() => setIsMobileOpen(false)}
//         />
//       )}
//     </>
//   );
// }































// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { LayoutDashboard, Users, LogOut, Menu } from 'lucide-react';
// import * as Tooltip from '@radix-ui/react-tooltip';
// import { motion } from 'framer-motion';

// const navItems = [
//   { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
//   { label: 'Team Board', icon: Users, href: '/team-board' },
//   { label: 'Create Task', icon: LayoutDashboard, href: '/create-task' },
//   { label: 'Report', icon: LayoutDashboard, href: '/report' },
//   { label: 'Logout', icon: LogOut, href: '/logout' },
// ];

// export default function Sidebar() {
//   const pathname = usePathname();
//   const [isMobileOpen, setIsMobileOpen] = useState(false);
//   const [isCollapsed, setIsCollapsed] = useState(false);

//   return (
//     <>
//       {/* Toggle Button */}
//       <button
//         onClick={() => setIsMobileOpen(!isMobileOpen)}
//         className="md:hidden p-3 fixed top-4 left-4 z-50 bg-white rounded-full shadow-lg"
//         aria-label="Toggle sidebar"
//       >
//         <Menu className="text-purple-700" />
//       </button>

//       {/* Sidebar */}
//       <motion.aside
//         initial={{ width: isCollapsed ? 80 : 256 }}
//         animate={{ width: isCollapsed ? 80 : 256 }}
//         transition={{ duration: 0.3 }}
//         className={`
//           fixed top-0 left-0 h-screen 
//           bg-gradient-to-b from-[#1e1b4b] to-[#2e1065] 
//           text-white z-40
//           transition-all duration-300 border-r border-violet-900
//           ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
//           md:translate-x-0 md:static md:flex
//         `}
//       >
//         <div className="flex flex-col h-full p-4 overflow-y-auto relative">
//           <div
//             className={`text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-8 transition-opacity duration-300 ${
//               isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
//             }`}
//           >
//             TaskNova
//           </div>

//           <nav className="flex flex-col gap-2">
//             {navItems.map((item) => {
//               const isActive = pathname === item.href;
//               return (
//                 <Tooltip.Root key={item.href}>
//                   <Tooltip.Trigger asChild>
//                     <Link
//                       href={item.href}
//                       onClick={() => setIsMobileOpen(false)}
//                       className={`flex items-center gap-3 px-4 py-2 rounded-md transition-all font-medium ${
//                         isActive
//                           ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
//                           : 'text-gray-300 hover:text-purple-300 hover:bg-white/5'
//                       }`}
//                     >
//                       <item.icon size={22} />
//                       {!isCollapsed && <span>{item.label}</span>}
//                     </Link>
//                   </Tooltip.Trigger>
//                   <Tooltip.Portal>
//                     <Tooltip.Content
//                       className="bg-black text-white text-sm px-3 py-1 rounded shadow-xl z-[9999]"
//                       side="right"
//                       sideOffset={8}
//                     >
//                       {item.label}
//                       <Tooltip.Arrow className="fill-black" />
//                     </Tooltip.Content>
//                   </Tooltip.Portal>
//                 </Tooltip.Root>
//               );
//             })}
//           </nav>

//           {/* Collapse Button */}
//           <button
//             onClick={() => setIsCollapsed(!isCollapsed)}
//             className="absolute top-4 right-4 p-2 bg-white rounded-full text-purple-700 shadow-lg hover:scale-105 transition"
//             aria-label="Collapse sidebar"
//           >
//             {isCollapsed ? '▶' : '◀'}
//           </button>
//         </div>
//       </motion.aside>
//     </>
//   );
// }







// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { LayoutDashboard, Users, LogOut, Menu } from 'lucide-react';
// import * as Tooltip from '@radix-ui/react-tooltip';
// import { motion } from 'framer-motion';

// // const navItems = [
// //   { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
// //   { label: 'Team Board', icon: Users, href: '/team-board' },
// //   { label: 'Create Task', icon: LayoutDashboard, href: '/create-task' },
// //   { label: 'Report', icon: LayoutDashboard, href: '/report' },
// //   { label: 'Logout', icon: LogOut, href: '/logout' },
// //   { label: 'KAM', icon: Users, href: '/kam' }, // Add this to navItems

// // ];

// const navItems = [
//   { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
//   { label: 'Team Board', icon: Users, href: '/team-board' },
//   { label: 'Create Task', icon: LayoutDashboard, href: '/create-task' },
//   // { label: 'Timeline', icon: LayoutDashboard, href: '/timeline' }, // ✅ NEW
//   { label: 'Assigned Task', icon: LayoutDashboard, href: '/report' },
//   { label: 'KAM', icon: Users, href: '/kam' },
//   { label: 'Timeline', icon: LayoutDashboard, href: '/timeline' },
//   // { label: 'Logout', icon: LogOut, href: '/logout' },
//   { label: 'Sales Dashboard', icon: LayoutDashboard, href: '/sales-dashboard' },

// ];


// export default function Sidebar() {
//   const pathname = usePathname();
//   const [isMobileOpen, setIsMobileOpen] = useState(false);
//   const [isCollapsed, setIsCollapsed] = useState(false);

//   // Handle Ctrl+B shortcut
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.ctrlKey && e.key.toLowerCase() === 'b') {
//         e.preventDefault();
//         setIsCollapsed(prev => !prev);
//       }
//     };
//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, []);

//   return (
//     <>
//       {/* Toggle Button */}
//       <button
//         onClick={() => setIsMobileOpen(!isMobileOpen)}
//         className="md:hidden p-3 fixed top-4 left-4 z-50 bg-white rounded-full shadow-lg"
//         aria-label="Toggle sidebar"
//       >
//         <Menu className="text-purple-700" />
//       </button>

//       {/* Sidebar */}
//       <motion.aside
//         initial={{ width: isCollapsed ? 80 : 256 }}
//         animate={{ width: isCollapsed ? 80 : 256 }}
//         transition={{ duration: 0.3 }}
//         className={`
//           fixed top-0 left-0 h-screen 
//           bg-gradient-to-b from-[#1e1b4b] to-[#2e1065] 
//           text-white z-40
//           transition-all duration-300 border-r border-violet-900
//           ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
//           md:translate-x-0 md:static md:flex
//         `}
//       >
//         <div className="flex flex-col h-full p-4 overflow-y-auto relative">
//           <div
//             className={`text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-8 transition-opacity duration-300 ${
//               isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
//             }`}
//           >
//             TaskNova
//           </div>

//           <nav className="flex flex-col gap-2">
//             {navItems.map((item) => {
//               const isActive = pathname === item.href;
//               return (
//                 <Tooltip.Root key={item.href}>
//                   <Tooltip.Trigger asChild>
//                     <Link
//                       href={item.href}
//                       onClick={() => setIsMobileOpen(false)}
//                       className={`flex items-center gap-3 px-4 py-2 rounded-md transition-all font-medium ${
//                         isActive
//                           ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
//                           : 'text-gray-300 hover:text-purple-300 hover:bg-white/5'
//                       }`}
//                     >
//                       <item.icon size={22} />
//                       {!isCollapsed && <span>{item.label}</span>}
//                     </Link>
//                   </Tooltip.Trigger>
//                   <Tooltip.Portal>
//                     <Tooltip.Content
//                       className="bg-black text-white text-sm px-3 py-1 rounded shadow-xl z-[9999]"
//                       side="right"
//                       sideOffset={8}
//                     >
//                       {item.label}
//                       <Tooltip.Arrow className="fill-black" />
//                     </Tooltip.Content>
//                   </Tooltip.Portal>
//                 </Tooltip.Root>
//               );
//             })}
//           </nav>

//           {/* Collapse Button */}
//           <button
//             onClick={() => setIsCollapsed(!isCollapsed)}
//             className="absolute top-4 right-4 p-2 bg-white rounded-full text-purple-700 shadow-lg hover:scale-105 transition"
//             aria-label="Collapse sidebar"
//           >
//             {isCollapsed ? '▶' : '◀'}
//           </button>
//         </div>
//       </motion.aside>
//     </>
//   );
// }















// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';


// import { usePathname } from 'next/navigation';
// import { LayoutDashboard, Users, LogOut, Menu } from 'lucide-react';
// import * as Tooltip from '@radix-ui/react-tooltip';
// import { motion } from 'framer-motion';
// import { useUser } from '@clerk/nextjs'; // Import useUser

// const allNavItems = [
//   { label: 'Dashboard', icon: LayoutDashboard, href: '/', roles: ['admin', 'master'] },
//   { label: 'Team Board', icon: Users, href: '/team-board', roles: ['admin', 'master', 'seller','user'] },
//   { label: 'Create Task', icon: LayoutDashboard, href: '/create-task', roles: ['admin', 'master','seller','user'] },
//   { label: 'Assigned Task', icon: LayoutDashboard, href: '/report', roles: ['admin', 'master', 'seller'] },
//   { label: 'KAM', icon: Users, href: '/kam', roles: ['admin', 'master', 'seller'] },
//   { label: 'Timeline', icon: LayoutDashboard, href: '/timeline', roles: ['admin', 'master', 'seller'] },
//   { label: 'Sales Dashboard', icon: LayoutDashboard, href: '/sales-dashboard', roles: ['admin', 'master'] },
//   // Logout will be added dynamically if user is logged in
// ];

// export default function Sidebar() {
//   const pathname = usePathname();
//   const [isMobileOpen, setIsMobileOpen] = useState(false);
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const { user, isLoaded } = useUser(); // Get user and isLoaded from Clerk

//   const userRole = isLoaded ? (user?.publicMetadata?.role || "guest") : "guest";

//   // Filter nav items based on user role
//   const visibleNavItems = allNavItems.filter(item =>
//     item.roles.includes(userRole)
//   );

//   // Add logout item if user is logged in
//   if (isLoaded && user) {
//     visibleNavItems.push({ label: 'Logout', icon: LogOut, href: '/sign-out', roles: ['admin', 'master', 'seller', 'guest'] }); // Sign out route
//   }

//   // Handle Ctrl+B shortcut
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.ctrlKey && e.key.toLowerCase() === 'b') {
//         e.preventDefault();
//         setIsCollapsed(prev => !prev);
//       }
//     };
//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, []);

//   return (
//     <>
//       {/* Toggle Button */}
//       <button
//         onClick={() => setIsMobileOpen(!isMobileOpen)}
//         className="md:hidden p-3 fixed top-4 left-4 z-50 bg-white rounded-full shadow-lg"
//         aria-label="Toggle sidebar"
//       >
//         <Menu className="text-purple-700" />
//       </button>

//       {/* Sidebar */}
//       <motion.aside
//         initial={{ width: isCollapsed ? 80 : 256 }}
//         animate={{ width: isCollapsed ? 80 : 256 }}
//         transition={{ duration: 0.3 }}
//         className={`
//           fixed top-0 left-0 h-screen 
//           bg-gradient-to-b from-[#1e1b4b] to-[#2e1065] 
//           text-white z-40
//           transition-all duration-300 border-r border-violet-900
//           ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
//           md:translate-x-0 md:static md:flex
//         `}
//       >
//         <div className="flex flex-col h-full p-4 overflow-y-auto relative">
//           <div
//             className={`text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-8 transition-opacity duration-300 ${
//               isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
//             }`}
//           >
//             TaskNova
//           </div>

//           <nav className="flex flex-col gap-2">
//             {visibleNavItems.map((item) => {
//               const isActive = pathname === item.href;
//               return (
//                 <Tooltip.Root key={item.href}>
//                   <Tooltip.Trigger asChild>
//                     <Link
//                       href={item.href}
//                       onClick={() => setIsMobileOpen(false)}
//                       className={`flex items-center gap-3 px-4 py-2 rounded-md transition-all font-medium ${
//                         isActive
//                           ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
//                           : 'text-gray-300 hover:text-purple-300 hover:bg-white/5'
//                       }`}
//                     >
//                       <item.icon size={22} />
//                       {!isCollapsed && <span>{item.label}</span>}
//                     </Link>
//                   </Tooltip.Trigger>
//                   <Tooltip.Portal>
//                     <Tooltip.Content
//                       className="bg-black text-white text-sm px-3 py-1 rounded shadow-xl z-[9999]"
//                       side="right"
//                       sideOffset={8}
//                     >
//                       {item.label}
//                       <Tooltip.Arrow className="fill-black" />
//                     </Tooltip.Content>
//                   </Tooltip.Portal>
//                 </Tooltip.Root>
//               );
//             })}
//           </nav>

//           {/* Collapse Button */}
//           <button
//             onClick={() => setIsCollapsed(!isCollapsed)}
//             className="absolute top-4 right-4 p-2 bg-white rounded-full text-purple-700 shadow-lg hover:scale-105 transition"
//             aria-label="Collapse sidebar"
//           >
//             {isCollapsed ? '▶' : '◀'}
//           </button>
//         </div>
//       </motion.aside>
//     </>
//   );
// }













// // Sidebar.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { LayoutDashboard, Users, LogOut, Menu } from 'lucide-react';
// import * as Tooltip from '@radix-ui/react-tooltip';
// import { motion } from 'framer-motion';
// import { useUser } from '@clerk/nextjs'; // Import useUser

// const allNavItems = [
//   { label: 'Dashboard', icon: LayoutDashboard, href: '/', roles: ['admin', 'master'] },
//   { label: 'Team Board', icon: Users, href: '/team-board', roles: ['admin', 'master', 'seller','user'] },
//   { label: 'Create Task', icon: LayoutDashboard, href: '/create-task', roles: ['admin', 'master','seller','user'] },
//   { label: 'Assigned Task', icon: LayoutDashboard, href: '/report', roles: ['admin', 'master', 'seller'] },
//   { label: 'KAM', icon: Users, href: '/kam', roles: ['admin', 'master', 'seller'] },
//   { label: 'Timeline', icon: LayoutDashboard, href: '/timeline', roles: ['admin', 'master', 'seller','temp'] },
//  //{ label: 'Tish View', icon: LayoutDashboard, href: '/tish', roles: ['admin', 'master', 'seller'] }, // ✅ Added this line
//   { label: 'Sales Dashboard', icon: LayoutDashboard, href: '/sales-dashboard', roles: ['admin', 'master'] },
//   // Logout will be added dynamically if user is logged in
// ];

// export default function Sidebar() {
//   const pathname = usePathname();
//   const [isMobileOpen, setIsMobileOpen] = useState(false);
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const { user, isLoaded } = useUser(); // Get user and isLoaded from Clerk

//   const userRole = isLoaded ? (user?.publicMetadata?.role || "guest") : "guest";

//   // Filter nav items based on user role
//   const visibleNavItems = allNavItems.filter(item =>
//     item.roles.includes(userRole)
//   );

//   // Add logout item if user is logged in
//   if (isLoaded && user) {
//     visibleNavItems.push({ label: 'Logout', icon: LogOut, href: '/sign-out', roles: ['admin', 'master', 'seller', 'guest'] }); // Sign out route
//   }

//   // Handle Ctrl+B shortcut
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.ctrlKey && e.key.toLowerCase() === 'b') {
//         e.preventDefault();
//         setIsCollapsed(prev => !prev);
//       }
//     };
//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, []);

//   return (
//     <>
//       {/* Toggle Button */}
//       <button
//         onClick={() => setIsMobileOpen(!isMobileOpen)}
//         className="md:hidden p-3 fixed top-4 left-4 z-50 bg-white rounded-full shadow-lg"
//         aria-label="Toggle sidebar"
//       >
//         <Menu className="text-purple-700" />
//       </button>

//       {/* Sidebar */}
//       <motion.aside
//         initial={{ width: isCollapsed ? 80 : 256 }}
//         animate={{ width: isCollapsed ? 80 : 256 }}
//         transition={{ duration: 0.3 }}
//         className={`
//           fixed top-0 left-0 h-screen
//           bg-gradient-to-b from-[#1e1b4b] to-[#2e1065]
//           text-white z-40
//           transition-all duration-300 border-r border-violet-900
//           ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
//           md:translate-x-0 md:static md:flex
//         `}
//       >
//         <div className="flex flex-col h-full p-4 overflow-y-auto relative">
//           <div
//             className={`text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-8 transition-opacity duration-300 ${
//               isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
//             }`}
//           >
//             TaskNova
//           </div>

//           <nav className="flex flex-col gap-2">
//             {visibleNavItems.map((item) => {
//               const isActive = pathname === item.href;
//               return (
//                 <Tooltip.Root key={item.href}>
//                   <Tooltip.Trigger asChild>
//                     <Link
//                       href={item.href}
//                       onClick={() => setIsMobileOpen(false)}
//                       className={`flex items-center gap-3 px-4 py-2 rounded-md transition-all font-medium ${
//                         isActive
//                           ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
//                           : 'text-gray-300 hover:text-purple-300 hover:bg-white/5'
//                       }`}
//                     >
//                       <item.icon size={22} />
//                       {!isCollapsed && <span>{item.label}</span>}
//                     </Link>
//                   </Tooltip.Trigger>
//                   <Tooltip.Portal>
//                     <Tooltip.Content
//                       className="bg-black text-white text-sm px-3 py-1 rounded shadow-xl z-[9999]"
//                       side="right"
//                       sideOffset={8}
//                     >
//                       {item.label}
//                       <Tooltip.Arrow className="fill-black" />
//                     </Tooltip.Content>
//                   </Tooltip.Portal>
//                 </Tooltip.Root>
//               );
//             })}
//           </nav>

//           {/* Collapse Button */}
//           <button
//             onClick={() => setIsCollapsed(!isCollapsed)}
//             className="absolute top-4 right-4 p-2 bg-white rounded-full text-purple-700 shadow-lg hover:scale-105 transition"
//             aria-label="Collapse sidebar"
//           >
//             {isCollapsed ? '▶' : '◀'}
//           </button>
//         </div>
//       </motion.aside>
//     </>
//   );
// }













// // Sidebar.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import {
//   LayoutDashboard,
//   Users,
//   LogOut,
//   Menu,
//   ClipboardList,
//   ClipboardCheck,
//   Building2,
//   LineChart,
//   ShoppingCart,
// } from 'lucide-react';
// import * as Tooltip from '@radix-ui/react-tooltip';
// import { motion } from 'framer-motion';
// import { useUser } from '@clerk/nextjs';

// const allNavItems = [
//   { label: 'Dashboard', icon: LayoutDashboard, href: '/', roles: ['admin', 'master'] },
//   { label: 'Team Board', icon: Users, href: '/team-board', roles: ['admin', 'master', 'seller', 'user'] },
//   { label: 'Create Task', icon: ClipboardList, href: '/create-task', roles: ['admin', 'master', 'seller', 'user'] },
//   { label: 'Assigned Task', icon: ClipboardCheck, href: '/report', roles: ['admin', 'master', 'seller'] },
//   { label: 'KAM', icon: Building2, href: '/kam', roles: ['admin', 'master', 'seller'] },
//   { label: 'Timeline', icon: LineChart, href: '/timeline', roles: ['admin', 'master', 'seller', 'temp'] },
//   { label: 'Sales Dashboard', icon: ShoppingCart, href: '/sales-dashboard', roles: ['admin', 'master'] },
// ];

// export default function Sidebar() {
//   const pathname = usePathname();
//   const [isMobileOpen, setIsMobileOpen] = useState(false);
//   // Initially collapsed for desktop, will expand on hover
//   const [isCollapsed, setIsCollapsed] = useState(true);
//   const { user, isLoaded } = useUser();

//   const userRole = isLoaded ? (user?.publicMetadata?.role || "guest") : "guest";

//   const visibleNavItems = allNavItems.filter(item =>
//     item.roles.includes(userRole)
//   );

//   if (isLoaded && user) {
//     visibleNavItems.push({ label: 'Logout', icon: LogOut, href: '/sign-out', roles: ['admin', 'master', 'seller', 'guest'] });
//   }

//   // Remove Ctrl+B shortcut as it's no longer needed for this behavior
//   // useEffect(() => {
//   //   const handleKeyDown = (e: KeyboardEvent) => {
//   //     if (e.ctrlKey && e.key.toLowerCase() === 'b') {
//   //       e.preventDefault();
//   //       setIsCollapsed(prev => !prev);
//   //     }
//   //   };
//   //   window.addEventListener('keydown', handleKeyDown);
//   //   return () => window.removeEventListener('keydown', handleKeyDown);
//   // }, []);

//   return (
//     <>
//       {/* Toggle Button for Mobile */}
//       <button
//         onClick={() => setIsMobileOpen(!isMobileOpen)}
//         className="md:hidden p-3 fixed top-4 left-4 z-50 bg-white rounded-full shadow-lg"
//         aria-label="Toggle sidebar"
//       >
//         <Menu className="text-purple-700" />
//       </button>

//       {/* Sidebar */}
//       <motion.aside
//         initial={false} // Disable initial animation as we control it with animate prop
//         animate={{ width: isCollapsed ? 80 : 256 }}
//         transition={{ duration: 0.3 }}
//         // Event handlers for hover
//         onMouseEnter={() => setIsCollapsed(false)}
//         onMouseLeave={() => setIsCollapsed(true)}
//         className={`
//           fixed top-0 left-0 h-screen
//           bg-gradient-to-b from-[#1e1b4b] to-[#2e1065]
//           text-white z-40
//           transition-all duration-300 border-r border-violet-900
//           ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
//           md:translate-x-0 md:static md:flex
//           overflow-hidden // Hide overflow content when collapsed
//         `}
//       >
//         <div className="flex flex-col h-full p-4 relative">
//           <div
//             className={`text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-8 transition-opacity duration-300 ${
//               isCollapsed ? 'opacity-0 w-0' : 'opacity-100' // Changed w-0 for smooth hide
//             }`}
//           >
//             TaskNova
//           </div>

//           <nav className="flex flex-col gap-2">
//             {visibleNavItems.map((item) => {
//               const isActive = pathname === item.href;
//               return (
//                 <Tooltip.Root key={item.href}>
//                   <Tooltip.Trigger asChild>
//                     <Link
//                       href={item.href}
//                       onClick={() => setIsMobileOpen(false)}
//                       className={`flex items-center gap-3 px-4 py-2 rounded-md transition-all font-medium ${
//                         isActive
//                           ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
//                           : 'text-gray-300 hover:text-purple-300 hover:bg-white/5'
//                       }`}
//                     >
//                       <item.icon size={22} />
//                       {!isCollapsed && (
//                         <motion.span
//                           initial={{ opacity: 0, width: 0 }}
//                           animate={{ opacity: 1, width: 'auto' }}
//                           transition={{ duration: 0.2, delay: 0.1 }}
//                           className="whitespace-nowrap overflow-hidden"
//                         >
//                           {item.label}
//                         </motion.span>
//                       )}
//                     </Link>
//                   </Tooltip.Trigger>
//                   {isCollapsed && ( // Only show tooltip when collapsed
//                     <Tooltip.Portal>
//                       <Tooltip.Content
//                         className="bg-black text-white text-sm px-3 py-1 rounded shadow-xl z-[9999]"
//                         side="right"
//                         sideOffset={8}
//                       >
//                         {item.label}
//                         <Tooltip.Arrow className="fill-black" />
//                       </Tooltip.Content>
//                     </Tooltip.Portal>
//                   )}
//                 </Tooltip.Root>
//               );
//             })}
//           </nav>

//           {/* Removed the manual collapse button */}
//           {/* <button
//             onClick={() => setIsCollapsed(!isCollapsed)}
//             className="absolute top-4 right-4 p-2 bg-white rounded-full text-purple-700 shadow-lg hover:scale-105 transition"
//             aria-label="Collapse sidebar"
//           >
//             {isCollapsed ? '▶' : '◀'}
//           </button> */}
//         </div>
//       </motion.aside>
//     </>
//   );
// }
















// // Sidebar.tsx
// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { FileSpreadsheet, Contact2, ListChecks } from 'lucide-react';

// // import {
// //   LayoutDashboard,
// //   Users,
// //   LogOut,
// //   Menu,
// //   ClipboardList,
// //   ClipboardCheck,
// //   Building2,
// //   LineChart,
// //   ShoppingCart,
// // } from 'lucide-react';
// // import * as Tooltip from '@radix-ui/react-tooltip';
// // import { motion } from 'framer-motion';
// // import { useUser } from '@clerk/nextjs';

// // const allNavItems = [
// //   { label: 'Dashboard', icon: LayoutDashboard, href: '/', roles: ['admin', 'master'] },
// //   { label: 'Team Board', icon: Users, href: '/team-board', roles: ['admin', 'master', 'seller', 'user'] },
// //   { label: 'Create Task', icon: ClipboardList, href: '/create-task', roles: ['admin', 'master', 'seller', 'user'] },
// //   { label: 'Assigned Task', icon: ClipboardCheck, href: '/report', roles: ['admin', 'master', 'seller'] },
// //   { label: 'KAM', icon: Building2, href: '/kam', roles: ['admin', 'master', 'seller'] },
// //   { label: 'Timeline', icon: LineChart, href: '/timeline', roles: ['admin', 'master', 'seller', 'temp'] },
// //     // { label: 'Add Future', icon: ClipboardList, href: '/addfuture', roles: ['admin', 'master', 'seller', 'user'] },
// //   { label: 'Sales Dashboard', icon: ShoppingCart, href: '/sales-dashboard', roles: ['admin', 'master'] },
// // ];




// import {
//   LayoutDashboard,
//   Users,
//   LogOut,
//   Menu,
//   ClipboardList,
//   ClipboardCheck,
//   Building2,
//   LineChart,
//   ShoppingCart,
//   FileSpreadsheet
// } from 'lucide-react';

// const allNavItems = [
//   { label: 'Dashboard', icon: LayoutDashboard, href: '/', roles: ['admin', 'master'] },
//   { label: 'Team Board', icon: Users, href: '/team-board', roles: ['admin', 'master', 'seller', 'user'] },
//   { label: 'Create Task', icon: ClipboardList, href: '/create-task', roles: ['admin', 'master', 'seller', 'user'] },
//   { label: 'Assigned Task', icon: ClipboardCheck, href: '/report', roles: ['admin', 'master', 'seller'] },
//   { label: 'KAM', icon: Building2, href: '/kam', roles: ['admin', 'master', 'seller'] },
//   { label: 'Timeline', icon: LineChart, href: '/timeline', roles: ['admin', 'master', 'seller', 'temp'] },
//   { label: 'Leads', icon: FileSpreadsheet, href: '/leads', roles: ['admin', 'master', 'seller', 'user'] }, // NEW
//   { label: 'Sales Dashboard', icon: ShoppingCart, href: '/sales-dashboard', roles: ['admin', 'master'] },
// ];


// export default function Sidebar() {
//   const pathname = usePathname();
//   const [isMobileOpen, setIsMobileOpen] = useState(false);
//   const [isCollapsed, setIsCollapsed] = useState(true);
//   const { user, isLoaded } = useUser();

//   const userRole = isLoaded ? (user?.publicMetadata?.role || 'guest') : 'guest';

//   const visibleNavItems = allNavItems.filter((item) => item.roles.includes(userRole));

//   if (isLoaded && user) {
//     visibleNavItems.push({
//       label: 'Logout',
//       icon: LogOut,
//       href: '/sign-out',
//       roles: ['admin', 'master', 'seller', 'guest'],
//     });
//   }

//   return (
//     <>
//       {/* Toggle Button for Mobile */}
//       <button
//         onClick={() => setIsMobileOpen(!isMobileOpen)}
//         className="md:hidden p-3 fixed top-4 left-4 z-50 bg-white rounded-full shadow-lg"
//         aria-label="Toggle sidebar"
//       >
//         <Menu className="text-purple-700" />
//       </button>

//       {/* Sidebar */}
//       <motion.aside
//         initial={false}
//         animate={{ width: isCollapsed ? 80 : 256 }}
//         transition={{ duration: 0.3 }}
//         onMouseEnter={() => setIsCollapsed(false)}
//         onMouseLeave={() => setIsCollapsed(true)}
//         className={`fixed top-0 left-0 h-screen
//           bg-gradient-to-b from-[#1e1b4b] to-[#2e1065]
//           text-white z-40
//           transition-all duration-300 border-r border-violet-900
//           ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
//           md:translate-x-0 md:static md:flex
//           overflow-hidden
//         `}
//       >
//         <div className="flex flex-col h-full p-4 relative">
//           {/* Logo */}
//           <div
//             className={`text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-8 transition-opacity duration-300 ${
//               isCollapsed ? 'opacity-0 w-0' : 'opacity-100'
//             }`}
//           >
//             TaskNova
//           </div>

//           {/* Navigation */}
//           <nav className="flex flex-col gap-2">
//             {visibleNavItems.map((item) => {
//               const isActive = pathname === item.href;
//               return (
//                 <Tooltip.Root key={item.href}>
//                   <Tooltip.Trigger asChild>
//                     {/* FIX: Wrap Link inside span to avoid hydration mismatch */}
//                     <span>
//                       <Link
//                         href={item.href}
//                         onClick={() => setIsMobileOpen(false)}
//                         className={`flex items-center gap-3 px-4 py-2 rounded-md transition-all font-medium ${
//                           isActive
//                             ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
//                             : 'text-gray-300 hover:text-purple-300 hover:bg-white/5'
//                         }`}
//                       >
//                         <item.icon size={22} />
//                         {!isCollapsed && (
//                           <motion.span
//                             initial={{ opacity: 0, width: 0 }}
//                             animate={{ opacity: 1, width: 'auto' }}
//                             transition={{ duration: 0.2, delay: 0.1 }}
//                             className="whitespace-nowrap overflow-hidden"
//                           >
//                             {item.label}
//                           </motion.span>
//                         )}
//                       </Link>
//                     </span>
//                   </Tooltip.Trigger>
//                   {isCollapsed && (
//                     <Tooltip.Portal>
//                       <Tooltip.Content
//                         className="bg-black text-white text-sm px-3 py-1 rounded shadow-xl z-[9999]"
//                         side="right"
//                         sideOffset={8}
//                       >
//                         {item.label}
//                         <Tooltip.Arrow className="fill-black" />
//                       </Tooltip.Content>
//                     </Tooltip.Portal>
//                   )}
//                 </Tooltip.Root>
//               );
//             })}
//           </nav>
//         </div>
//       </motion.aside>
//     </>
//   );
// }























// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import {
//   LayoutDashboard,
//   Users,
//   LogOut,
//   Menu,
//   ClipboardList,
//   ClipboardCheck,
//   Building2,
//   LineChart,
//   ShoppingCart,
//   FileSpreadsheet,
//   CalendarCheck,
// } from 'lucide-react';
// import * as Tooltip from '@radix-ui/react-tooltip';
// import { BarChart3 } from "lucide-react";
// import { motion } from 'framer-motion';
// import { useUser } from '@clerk/nextjs';

// const allNavItems = [
//   { label: 'Dashboard', icon: LayoutDashboard, href: '/', roles: ['admin', 'master', 'seller'] },
//   { label: 'Team Board', icon: Users, href: '/team-board', roles: ['admin', 'master', 'seller', 'user'] },
//   { label: 'Create Task', icon: ClipboardList, href: '/create-task', roles: ['admin', 'master', 'seller', 'user'] },
//   { label: 'Assigned Task', icon: ClipboardCheck, href: '/report', roles: ['admin', 'master', 'seller'] },
//   { label: 'KAM', icon: Building2, href: '/kam', roles: ['admin', 'master', 'seller'] },
//   { label: 'Timeline', icon: LineChart, href: '/timeline', roles: ['admin', 'master', 'seller', 'temp'] },
// //  { label: 'Leads', icon: FileSpreadsheet, href: '/leads', roles: ['admin', 'master', 'seller', 'user'] },
//    { label: 'MySales Dashboard', icon: ShoppingCart,  href: '/seller/dashboard', roles: ['seller','admin'] },
//   { label: 'Sales Dashboard', icon: BarChart3, href: '/sales-dashboard', roles: ['admin', 'master'] },

//   { 
//   label: 'Agreement', 
//   icon: FileSpreadsheet, 
//   href: '/FullDashboard/agreement', 
//   roles: ['admin', 'master', 'seller'] 
// },
// { label: 'Attendance', icon: CalendarCheck, href: '/dashboard/attendance', roles: ['admin', 'master', 'seller'] },
// { label: 'Tish', icon: CalendarCheck, href: '/dashboard/attendance/tish', roles: ['admin', 'master'] },

  

//   // ✅ NEW: Attendance Admin Link
// //   { label: 'Attendance', icon: CalendarCheck, href: '/admin/attendance', roles: ['admin', 'master'] },
// //  { label: 'Attendance', icon: CalendarCheck, href: '/dashboard/attendance', roles: ['admin', 'master', 'user', 'seller'] },


// ];

// export default function Sidebar() {
//   const pathname = usePathname();
//   const [isMobileOpen, setIsMobileOpen] = useState(false);
//   const [isCollapsed, setIsCollapsed] = useState(true);
//   const { user, isLoaded } = useUser();

//   const userRole = isLoaded ? (user?.publicMetadata?.role || 'guest') : 'guest';
//   const visibleNavItems = allNavItems.filter((item) => item.roles.includes(userRole));

//   if (isLoaded && user) {
//     visibleNavItems.push({
//       label: 'Logout',
//       icon: LogOut,
//       href: '/sign-out',
//       roles: ['admin', 'master', 'seller', 'guest'],
//     });
//   }

//   return (
//     <>
//       {/* Toggle Button for Mobile */}
//       <button
//         onClick={() => setIsMobileOpen(!isMobileOpen)}
//         className="md:hidden p-3 fixed top-4 left-4 z-50 bg-white rounded-full shadow-lg"
//         aria-label="Toggle sidebar"
//       >
//         <Menu className="text-purple-700" />
//       </button>

//       {/* Sidebar */}
//       <motion.aside
//         initial={false}
//         animate={{ width: isCollapsed ? 80 : 256 }}
//         transition={{ duration: 0.3 }}
//         onMouseEnter={() => setIsCollapsed(false)}
//         onMouseLeave={() => setIsCollapsed(true)}
//         className={`fixed top-0 left-0 h-screen
//           bg-gradient-to-b from-[#1e1b4b] to-[#2e1065]
//           text-white z-40
//           transition-all duration-300 border-r border-violet-900
//           ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
//           md:translate-x-0 md:static md:flex
//           overflow-hidden
//         `}
//       >
//         <div className="flex flex-col h-full p-4 relative">
//           {/* Logo */}
//           <div
//             className={`text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-8 transition-opacity duration-300 ${
//               isCollapsed ? 'opacity-0 w-0' : 'opacity-100'
//             }`}
//           >
//             TaskNova
//           </div>

//           {/* Navigation */}
//           <nav className="flex flex-col gap-2">
//             {visibleNavItems.map((item) => {
//               const isActive = pathname === item.href;
//               return (
//                 <Tooltip.Root key={item.href}>
//                   <Tooltip.Trigger asChild>
//                     <span>
//                       <Link
//                         href={item.href}
//                         onClick={() => setIsMobileOpen(false)}
//                         className={`flex items-center gap-3 px-4 py-2 rounded-md transition-all font-medium ${
//                           isActive
//                             ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
//                             : 'text-gray-300 hover:text-purple-300 hover:bg-white/5'
//                         }`}
//                       >
//                         <item.icon size={22} />
//                         {!isCollapsed && (
//                           <motion.span
//                             initial={{ opacity: 0, width: 0 }}
//                             animate={{ opacity: 1, width: 'auto' }}
//                             transition={{ duration: 0.2, delay: 0.1 }}
//                             className="whitespace-nowrap overflow-hidden"
//                           >
//                             {item.label}
//                           </motion.span>
//                         )}
//                       </Link>
//                     </span>
//                   </Tooltip.Trigger>
//                   {isCollapsed && (
//                     <Tooltip.Portal>
//                       <Tooltip.Content
//                         className="bg-black text-white text-sm px-3 py-1 rounded shadow-xl z-[9999]"
//                         side="right"
//                         sideOffset={8}
//                       >
//                         {item.label}
//                         <Tooltip.Arrow className="fill-black" />
//                       </Tooltip.Content>
//                     </Tooltip.Portal>
//                   )}
//                 </Tooltip.Root>
//               );
//             })}
//           </nav>
//         </div>
//       </motion.aside>
//     </>
//   );
// }
















'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { BarChart3 } from "lucide-react";
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';

// ✅ Navigation Items
const allNavItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/', roles: ['admin', 'master', 'seller'] },
  { label: 'Team Board', icon: Users, href: '/team-board', roles: ['admin', 'master', 'seller', 'user'] },
  { label: 'Create Task', icon: ClipboardList, href: '/create-task', roles: ['admin', 'master', 'seller', 'user'] },
  { label: 'Assigned Task', icon: ClipboardCheck, href: '/report', roles: ['admin', 'master', 'seller'] },
  { label: 'KAM', icon: Building2, href: '/kam', roles: ['admin', 'master', 'seller'] },
  { label: 'Timeline', icon: LineChart, href: '/timeline', roles: ['admin', 'master', 'seller', 'temp'] },
  { label: 'MySales Dashboard', icon: ShoppingCart, href: '/seller/dashboard', roles: ['seller', 'admin'] },
  { label: 'Sales Dashboard', icon: BarChart3, href: '/sales-dashboard', roles: ['admin', 'master'] },

  // Agreement
  { label: 'Agreement', icon: FileSpreadsheet, href: '/FullDashboard/agreement', roles: ['admin', 'master', 'seller'] },

  // Attendance + Tish
  { label: 'Attendance', icon: CalendarCheck, href: '/dashboard/attendance', roles: ['admin', 'master', 'seller'] },
  { label: 'Tish', icon: CalendarCheck, href: '/dashboard/attendance/tish', roles: ['admin', 'master'] },

  // ✅ NEW: Customers Page
  { label: 'Customers', icon: UserSquare2, href: '/customers', roles: ['admin', 'master', 'seller'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { user, isLoaded } = useUser();

  const userRole = isLoaded ? (user?.publicMetadata?.role || 'guest') : 'guest';
  const visibleNavItems = allNavItems.filter((item) => item.roles.includes(userRole));

  // Add logout when user is loaded
  if (isLoaded && user) {
    visibleNavItems.push({
      label: 'Logout',
      icon: LogOut,
      href: '/sign-out',
      roles: ['admin', 'master', 'seller', 'guest'],
    });
  }

  return (
    <>
      {/* Toggle Button for Mobile */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden p-3 fixed top-4 left-4 z-50 bg-white rounded-full shadow-lg"
        aria-label="Toggle sidebar"
      >
        <Menu className="text-purple-700" />
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ duration: 0.3 }}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
        className={`fixed top-0 left-0 h-screen
          bg-gradient-to-b from-[#1e1b4b] to-[#2e1065]
          text-white z-40
          transition-all duration-300 border-r border-violet-900
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:flex
          overflow-hidden
        `}
      >
        <div className="flex flex-col h-full p-4 relative">
          {/* Logo */}
          <div
            className={`text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-8 transition-opacity duration-300 ${
              isCollapsed ? 'opacity-0 w-0' : 'opacity-100'
            }`}
          >
            TaskNova
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2">
            {visibleNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Tooltip.Root key={item.href}>
                  <Tooltip.Trigger asChild>
                    <span>
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2 rounded-md transition-all font-medium ${
                          isActive
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                            : 'text-gray-300 hover:text-purple-300 hover:bg-white/5'
                        }`}
                      >
                        <item.icon size={22} />
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            transition={{ duration: 0.2, delay: 0.1 }}
                            className="whitespace-nowrap overflow-hidden"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </Link>
                    </span>
                  </Tooltip.Trigger>
                  {isCollapsed && (
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="bg-black text-white text-sm px-3 py-1 rounded shadow-xl z-[9999]"
                        side="right"
                        sideOffset={8}
                      >
                        {item.label}
                        <Tooltip.Arrow className="fill-black" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  )}
                </Tooltip.Root>
              );
            })}
          </nav>
        </div>
      </motion.aside>
    </>
  );
}
