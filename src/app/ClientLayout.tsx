// 'use client';

// import {
//   SignedIn,
//   SignedOut,
//   SignInButton,
//   SignUpButton,
//   UserButton,
//   useUser,
// } from '@clerk/nextjs';
// import Sidebar from '@/app/components/Sidebar';

// export default function ClientLayout({ children }: { children: React.ReactNode }) {
//   const { user, isLoaded } = useUser();

//   return (
//     <div className="flex min-h-screen bg-gray-100 text-gray-900 antialiased">
//       {/* Sidebar */}
//       <Sidebar />

//       <div className="flex-1 flex flex-col min-h-screen">
//         {/* Header */}
//         <header className="flex justify-between items-center px-6 py-4 bg-white shadow border-b">
//           <div>
//             <h1 className="text-xl font-bold">ClickUp Clone</h1>

//             {/* ✅ Show user name and role with safe type casting */}
//             {isLoaded && user && (
//               <p className="text-sm text-gray-500">
//                 {/* Logged in as: {user.firstName} ({user.publicMetadata?.role as string || 'no role'}) */}
//                 Logged in as: {user.firstName} ({String(user.publicMetadata?.role || 'no role')})

//               </p>
//             )}
//           </div>

//           <div className="flex gap-4 items-center">
//             <SignedOut>
//               <SignInButton mode="redirect" forceRedirectUrl="/dashboard" />
//               <SignUpButton mode="redirect" forceRedirectUrl="/dashboard" />
//             </SignedOut>

//             <SignedIn>
//               <UserButton afterSignOutUrl="/" />
//             </SignedIn>
//           </div>
//         </header>

//         {/* Main content */}
//         <main className="flex-1 p-6 overflow-y-auto">{children}</main>
//       </div>
//     </div>
//   );
// }


// 'use client';

// import {
//   SignedIn,
//   SignedOut,
//   SignInButton,
//   SignUpButton,
//   UserButton,
//   useUser,
// } from '@clerk/nextjs';
// import Sidebar from '../app/components/Sidebar';

// export default function ClientLayout({ children }: { children: React.ReactNode }) {
//   const { user, isLoaded } = useUser();

//   return (
//     <div className="flex">
//       {/* Fixed Sidebar */}
//       <Sidebar />

//       {/* Right content wrapper shifted right by sidebar width */}
//       <div className="ml-64 flex flex-col h-screen w-full">
//         {/* Header */}
//         <header className="flex justify-between items-center px-6 py-4 bg-white shadow border-b">
//           <div>
//             <h1 className="text-xl font-bold">ClickUp Clone</h1>
//             {isLoaded && user && (
//               <p className="text-sm text-gray-500">
//                 Logged in as: {user.firstName} (
//                 {String(user.publicMetadata?.role || 'no role')})
//               </p>
//             )}
//           </div>

//           <div className="flex gap-4 items-center">
//             <SignedOut>
//               <SignInButton mode="redirect" forceRedirectUrl="/dashboard" />
//               <SignUpButton mode="redirect" forceRedirectUrl="/dashboard" />
//             </SignedOut>

//             <SignedIn>
//               <UserButton afterSignOutUrl="/" />
//             </SignedIn>
//           </div>
//         </header>

//         {/* Scrollable right section */}
//         <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
//           {children}
//         </main>
//       </div>
// //     </div>
// //   );
// // }








// 'use client';

// import {
//   SignedIn,
//   SignedOut,
//   SignInButton,
//   SignUpButton,
//   UserButton,
//   useUser,
// } from '@clerk/nextjs';
// import Sidebar from '../app/components/Sidebar';

// export default function ClientLayout({ children }: { children: React.ReactNode }) {
//   const { user, isLoaded } = useUser();

//   return (
//     <div className="flex">
//       {/* Fixed Sidebar */}
//       <Sidebar />

//       {/* Right side content - takes full width, scrollable */}
//       <div className="flex flex-col h-screen w-full">
//         {/* Header */}
//         <header className="flex justify-between items-center px-6 py-4 bg-white shadow border-b">
//           <div>
//             <h1 className="text-xl font-bold">ClickUp Clone</h1>
//             {isLoaded && user && (
//               <p className="text-sm text-gray-500">
//                 Logged in as: {user.firstName} (
//                 {String(user.publicMetadata?.role || 'no role')})
//               </p>
//             )}
//           </div>

//           <div className="flex gap-4 items-center">
//             <SignedOut>
//               <SignInButton mode="redirect" forceRedirectUrl="/dashboard" />
//               <SignUpButton mode="redirect" forceRedirectUrl="/dashboard" />
//             </SignedOut>

//             <SignedIn>
//               <UserButton afterSignOutUrl="/" />
//             </SignedIn>
//           </div>
//         </header>

//         {/* Scrollable content */}
//         <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }







// 'use client';

// import {
//   SignedIn,
//   SignedOut,
//   SignInButton,
//   SignUpButton,
//   UserButton,
//   useUser,
// } from '@clerk/nextjs';
// import Sidebar from '../app/components/Sidebar';
// import { useEffect, useState } from 'react';

// export default function ClientLayout({ children }: { children: React.ReactNode }) {
//   const { user, isLoaded } = useUser();
//   const [userRoleText, setUserRoleText] = useState('');

//   useEffect(() => {
//     if (isLoaded && user) {
//       const role = String(user.publicMetadata?.role || 'no role');
//       setUserRoleText(`Logged in as: ${user.firstName} (${role})`);
//     }
//   }, [isLoaded, user]);

//   return (
//     <div className="flex">
//       {/* Fixed Sidebar */}
//       <Sidebar />

//       {/* Right side content - takes full width, scrollable */}
//       <div className="flex flex-col h-screen w-full">
//         {/* Header */}
//         <header className="flex justify-between items-center px-6 py-4 bg-white shadow border-b">
//           <div>
//             <h1 className="text-xl font-bold">ClickUp Clone</h1>
//             {isLoaded && user && (
//               <p className="text-sm text-gray-500">{userRoleText}</p>
//             )}
//           </div>

//           <div className="flex gap-4 items-center">
//             <SignedOut>
//               <SignInButton mode="redirect" forceRedirectUrl="/dashboard" />
//               <SignUpButton mode="redirect" forceRedirectUrl="/dashboard" />
//             </SignedOut>

//             <SignedIn>
//               <UserButton afterSignOutUrl="/" />
//             </SignedIn>
//           </div>
//         </header>

//         {/* Scrollable content */}
//         <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }




// 'use client';

// import {
//   SignedIn,
//   SignedOut,
//   SignInButton,
//   SignUpButton,
//   UserButton,
//   useUser,
// } from '@clerk/nextjs';
// import Sidebar from '../app/components/Sidebar';
// import { useEffect, useState } from 'react';

// export default function ClientLayout({ children }: { children: React.ReactNode }) {
//   const { user, isLoaded } = useUser();
//   const [userRoleText, setUserRoleText] = useState('');

//   useEffect(() => {
//     if (isLoaded && user) {
//       const role = String(user.publicMetadata?.role || 'no role');
//       setUserRoleText(`Logged in as: ${user.firstName} (${role})`);
//     }
//   }, [isLoaded, user]);

//   return (
//     <div className="flex h-full w-full overflow-hidden">
//       {/* Fixed Sidebar */}
//       <Sidebar />

//       {/* Main content layout */}
//       <div className="flex flex-col flex-1 overflow-hidden">
//         {/* Header */}
//         <header className="flex justify-between items-center px-6 py-4 bg-white shadow border-b">
//           <div>
//             <h1 className="text-xl font-bold">ClickUp Clone</h1>
//             {isLoaded && user && (
//               <p className="text-sm text-gray-500">{userRoleText}</p>
//             )}
//           </div>

//           <div className="flex gap-4 items-center">
//             <SignedOut>
//               <SignInButton mode="redirect" forceRedirectUrl="/dashboard" />
//               <SignUpButton mode="redirect" forceRedirectUrl="/dashboard" />
//             </SignedOut>

//             <SignedIn>
//               <UserButton afterSignOutUrl="/" />
//             </SignedIn>
//           </div>
//         </header>

//         {/* Scrollable content */}
//         <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }













// 'use client';

// import {
//   SignedIn,
//   SignedOut,
//   SignInButton,
//   SignUpButton,
//   UserButton,
//   useUser,
// } from '@clerk/nextjs';
// import { useEffect, useState } from 'react';
// import Sidebar from '../app/components/Sidebar';
// // ❌ Removed: import SecondaryNavbar from '../app/components/SecondaryNavbar';

// export default function ClientLayout({ children }: { children: React.ReactNode }) {
//   const { user, isLoaded } = useUser();
//   const [userRoleText, setUserRoleText] = useState('');

//   useEffect(() => {
//     if (isLoaded && user) {
//       const role = String(user.publicMetadata?.role || 'no role');
//       setUserRoleText(`Logged in as: ${user.firstName} (${role})`);
//     }
//   }, [isLoaded, user]);

//   return (
//     <div className="flex h-full w-full overflow-hidden">
//       {/* Sidebar */}
//       <Sidebar />

//       {/* Main layout */}
//       <div className="flex flex-col flex-1 overflow-hidden">
//         {/* Top Header */}
//         <header className="flex justify-between items-center px-6 py-4 bg-white shadow border-b">
//           <div>
//             <h1 className="text-xl font-bold">MagicScale</h1>
//             {isLoaded && user && (
//               <p className="text-sm text-gray-500">{userRoleText}</p>
//             )}
//           </div>

//           <div className="flex gap-4 items-center">
//             <SignedOut>
//               <SignInButton mode="redirect" forceRedirectUrl="/dashboard" />
//               <SignUpButton mode="redirect" forceRedirectUrl="/dashboard" />
//             </SignedOut>
//             <SignedIn>
//               <UserButton afterSignOutUrl="/" />
//             </SignedIn>
//           </div>
//         </header>

//         {/* ❌ Removed: <SecondaryNavbar /> */}

//         {/* Page content */}
//         <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }















// components/ClientLayout.tsx
'use client';

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import Sidebar from '../app/components/Sidebar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const [userRoleText, setUserRoleText] = useState('');

  useEffect(() => {
    if (isLoaded && user) {
      const role = String(user.publicMetadata?.role || 'no role');
      setUserRoleText(`Logged in as: ${user.firstName} (${role})`);
    }
  }, [isLoaded, user]);

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main layout */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Header */}
        <header className="flex justify-between items-center px-6 py-4 bg-white shadow border-b">
          <div>
            <h1 className="text-xl font-bold">MagicScale</h1>
            {isLoaded && user && (
              <p className="text-sm text-gray-500">{userRoleText}</p>
            )}
          </div>

          <div className="flex gap-4 items-center">
            <SignedOut>
              <SignInButton mode="redirect" forceRedirectUrl="/dashboard" />
              <SignUpButton mode="redirect" forceRedirectUrl="/dashboard" />
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
