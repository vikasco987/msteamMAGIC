// // components/TaskDetails/PaymentSection.tsx
// "use client";

// import React from "react";
// // No direct uploadToCloudinary or date-fns import needed here
// // as they are handled by the parent component or PaymentHistory itself
// import PaymentHistory from '../components/PaymentHistory';// Reusing the existing PaymentHistory component from timeline's parent directory

// interface PaymentEntry {
//   amount: string;
//   received: string;
//   updatedBy: string;
//   updatedAt: string;
//   fileUrl?: string;
// }

// interface Task {
//   id: string;
//   name: string;
//   shop: string;
//   customer: string;
//   start: string;
//   end: string;
//   progress: number;
//   assigneeIds?: string[];
//   subtasks?: any[]; // Simplified for this component, actual type is in main file
//   notes?: any[]; // Simplified for this component
//   attachments?: string[];
//   amount?: number;
//   received?: number;
//   paymentProofs?: string[];
//   paymentHistory?: PaymentEntry[];
// }

// interface PaymentSectionProps {
//   selectedTask: Task;
//   user: any; // Clerk user object
//   amount: string;
//   setAmount: (value: string) => void;
//   received: string;
//   setReceived: (value: string) => void;
//   paymentUploadStatus: string;
//   setPaymentUploadStatus: (status: string) => void;
//   handlePaymentSubmit: (e: React.FormEvent) => Promise<void>;
//   showPaymentHistory: boolean;
//   setShowPaymentHistory: (show: boolean) => void;
// }

// export default function PaymentSection({
//   selectedTask,
//   user, // Although 'user' is passed, it's not directly used in this component's JSX, but useful for 'handlePaymentSubmit'
//   amount,
//   setAmount,
//   received,
//   setReceived,
//   paymentUploadStatus,
//   setPaymentUploadStatus,
//   handlePaymentSubmit,
//   showPaymentHistory,
//   setShowPaymentHistory,
// }: PaymentSectionProps) {
//   return (
//     <div className="bg-white p-6 rounded-lg shadow-sm">
//       <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 Payment Details</h3>
//       <form onSubmit={handlePaymentSubmit} className="space-y-4">
//         <div>
//           <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
//             Total Amount (₹)
//           </label>
//           <input
//             type="number"
//             id="amount"
//             name="amount"
//             value={amount}
//             onChange={(e) => setAmount(e.target.value)}
//             className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//           />
//         </div>
//         <div>
//           <label htmlFor="received" className="block text-sm font-medium text-gray-700">
//             Amount Received (₹)
//           </label>
//           <input
//             type="number"
//             id="received"
//             name="received"
//             value={received}
//             onChange={(e) => setReceived(e.target.value)}
//             className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//           />
//         </div>
//         <div>
//           <label htmlFor="paymentFile" className="block text-sm font-medium text-gray-700">
//             Upload Payment Proof (Image/PDF)
//           </label>
//           <input
//             type="file"
//             id="paymentFile"
//             name="paymentFile"
//             accept="image/*,.pdf"
//             className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//           />
//           {paymentUploadStatus && (
//             <p className={`mt-2 text-sm ${paymentUploadStatus.startsWith("❌") ? "text-red-600" : "text-green-600"}`}>
//               {paymentUploadStatus}
//             </p>
//           )}
//         </div>
//         <button
//           type="submit"
//           className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//         >
//           Update Payment
//         </button>
//       </form>

//       {selectedTask.paymentProofs && selectedTask.paymentProofs.length > 0 && (
//         <div className="mt-6 pt-4 border-t border-gray-200">
//           <h4 className="text-md font-semibold text-gray-800 mb-3">📄 Uploaded Proofs</h4>
//           <div className="grid grid-cols-2 gap-3">
//             {selectedTask.paymentProofs.map((proofUrl: string, idx: number) => (
//               <a
//                 key={idx}
//                 href={proofUrl}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-blue-600 hover:underline text-sm truncate"
//               >
//                 Proof {idx + 1}
//               </a>
//             ))}
//           </div>
//         </div>
//       )}

//       {selectedTask.paymentHistory && selectedTask.paymentHistory.length > 0 && (
//         <>
//           <button
//             onClick={() => setShowPaymentHistory(!showPaymentHistory)}
//             className="text-blue-600 text-sm font-medium underline mt-3"
//           >
//             {showPaymentHistory ? "Hide" : "🕓 View"} Payment History
//           </button>
//           {/* {showPaymentHistory && <PaymentHistory paymentHistory={selectedTask.paymentHistory} />} */}
//           <PaymentHistory
//   paymentHistory={selectedTask.paymentHistory || []}
//   taskTitle={selectedTask.name}
// />

//         </>
//       )}
//     </div>
//   );
// }

























// // components/PaymentSection.tsx
// "use client";

// import React from "react";
// import PaymentHistory from './PaymentHistory'; // Assuming PaymentHistory is in the same directory or adjust path accordingly

// interface PaymentEntry {
//   amount: number;
//   received: number;
//   updatedBy: string;
//   updatedAt: string;
//   fileUrl?: string | null;
// }

// interface Task {
//   id: string;
//   name: string;
//   shop: string;
//   customer: string;
//   start: string;
//   end: string;
//   progress: number;
//   assigneeIds?: string[];
//   subtasks?: any[];
//   notes?: any[];
//   attachments?: string[];
//   amount?: number;
//   received?: number;
//   // Removed paymentProofs as it's now handled within paymentHistory
//   paymentHistory?: PaymentEntry[];
// }

// interface PaymentSectionProps {
//   selectedTask: Task;
//   user: any; // Clerk user object - passed for context but not directly used in PaymentSection's JSX
//   amount: string;
//   setAmount: (value: string) => void;
//   received: string;
//   setReceived: (value: string) => void;
//   paymentUploadStatus: string;
//   setPaymentUploadStatus: (status: string) => void;
//   handlePaymentSubmit: (e: React.FormEvent) => Promise<void>;
//   showPaymentHistory: boolean;
//   setShowPaymentHistory: (show: boolean) => void;
// }

// export default function PaymentSection({
//   selectedTask,
//   user,
//   amount,
//   setAmount,
//   received,
//   setReceived,
//   paymentUploadStatus,
//   setPaymentUploadStatus,
//   handlePaymentSubmit,
//   showPaymentHistory,
//   setShowPaymentHistory,
// }: PaymentSectionProps) {
//   return (
//     <div className="bg-white p-6 rounded-lg shadow-sm">
//       <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 Payment Details</h3>
//       <form onSubmit={handlePaymentSubmit} className="space-y-4">
//         <div>
//           <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
//             Total Amount (₹)
//           </label>
//           <input
//             type="number"
//             id="amount"
//             name="amount"
//             value={amount}
//             onChange={(e) => setAmount(e.target.value)}
//             step="0.01"
//             placeholder="Total amount"
//             className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//           />
//         </div>
//         <div>
//           <label htmlFor="received" className="block text-sm font-medium text-gray-700">
//             Amount Received (₹)
//           </label>
//           <input
//             type="number"
//             id="received"
//             name="received"
//             value={received}
//             onChange={(e) => setReceived(e.target.value)}
//             step="0.01"
//             placeholder="Amount received"
//             className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//           />
//         </div>
//         <div>
//           <label htmlFor="paymentFile" className="block text-sm font-medium text-gray-700">
//             Upload Payment Proof (Image/PDF)
//           </label>
//           <input
//             type="file"
//             id="paymentFile"
//             name="paymentFile"
//             accept="image/*,.pdf"
//             className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//           />
//           {paymentUploadStatus && (
//             <p className={`mt-2 text-sm ${paymentUploadStatus.startsWith("❌") ? "text-red-600" : "text-green-600"}`}>
//               {paymentUploadStatus}
//             </p>
//           )}
//         </div>
//         <button
//           type="submit"
//           className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//         >
//           Update Payment
//         </button>
//       </form>

//       {/* Payment History Section */}
//       {selectedTask.paymentHistory && selectedTask.paymentHistory.length > 0 ? (
//         <div className="mt-6 pt-4 border-t border-gray-200">
//           <button
//             onClick={() => setShowPaymentHistory(!showPaymentHistory)}
//             className="text-blue-600 text-sm font-medium underline"
//           >
//             {showPaymentHistory ? "Hide" : "🕓 View"} Payment History
//           </button>

//           {showPaymentHistory && (
//             <PaymentHistory
//               paymentHistory={selectedTask.paymentHistory || []}
//               taskTitle={selectedTask.name}
//             />
//           )}
//         </div>
//       ) : (
//         <p className="text-gray-500 text-sm mt-6 pt-4 border-t border-gray-200">No payment history recorded for this task yet.</p>
//       )}
//     </div>
//   );
// }
















// // components/PaymentSection.tsx
// "use client";

// import React from "react";
// import PaymentHistory from './PaymentHistory'; // Ensure this path is correct

// interface PaymentEntry {
//   amount: number;
//   received: number;
//   updatedAt: string;
//   updatedBy: string;
//   fileUrl?: string | null;
// }

// interface Task {
//   id: string;
//   name: string;
//   shop: string;
//   customer: string;
//   start: string;
//   end: string;
//   progress: number;
//   assigneeIds?: string[];
//   subtasks?: any[];
//   notes?: any[];
//   attachments?: string[];
//   amount?: number;
//   received?: number;
//   paymentHistory?: PaymentEntry[];
// }

// interface PaymentSectionProps {
//   selectedTask: Task;
//   user: any; // Clerk user object - passed for context but not directly used in PaymentSection's JSX
//   amount: string;
//   setAmount: (value: string) => void;
//   received: string;
//   setReceived: (value: string) => void;
//   paymentUploadStatus: string;
//   setPaymentUploadStatus: (status: string) => void;
//   handlePaymentSubmit: (e: React.FormEvent) => Promise<void>;
//   showPaymentHistory: boolean;
//   setShowPaymentHistory: (show: boolean) => void;
// }

// export default function PaymentSection({
//   selectedTask,
//   user, // Although 'user' is passed, it's not used directly within this component's JSX
//   amount,
//   setAmount,
//   received,
//   setReceived,
//   paymentUploadStatus,
//   setPaymentUploadStatus,
//   handlePaymentSubmit,
//   showPaymentHistory,
//   setShowPaymentHistory,
// }: PaymentSectionProps) {
//   // Determine if there's any payment history for the selected task.
//   // This check is crucial for controlling the content displayed after clicking.
//   const hasPaymentHistory = selectedTask.paymentHistory && selectedTask.paymentHistory.length > 0;

//   return (
//     <div className="bg-white p-6 rounded-lg shadow-sm">
//       <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 Payment Details</h3>
//       <form onSubmit={handlePaymentSubmit} className="space-y-4">
//         <div>
//           <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
//             Total Amount (₹)
//           </label>
//           <input
//             type="number"
//             id="amount"
//             name="amount"
//             value={amount}
//             onChange={(e) => setAmount(e.target.value)}
//             step="0.01"
//             placeholder="Total amount"
//             className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//           />
//         </div>
//         <div>
//           <label htmlFor="received" className="block text-sm font-medium text-gray-700">
//             Amount Received (₹)
//           </label>
//           <input
//             type="number"
//             id="received"
//             name="received"
//             value={received}
//             onChange={(e) => setReceived(e.target.value)}
//             step="0.01"
//             placeholder="Amount received"
//             className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//           />
//         </div>
//         <div>
//           <label htmlFor="paymentFile" className="block text-sm font-medium text-gray-700">
//             Upload Payment Proof (Image/PDF)
//           </label>
//           <input
//             type="file"
//             id="paymentFile"
//             name="paymentFile"
//             accept="image/*,.pdf"
//             className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//           />
//           {paymentUploadStatus && (
//             <p className={`mt-2 text-sm ${paymentUploadStatus.startsWith("❌") ? "text-red-600" : "text-green-600"}`}>
//               {paymentUploadStatus}
//             </p>
//           )}
//         </div>
//         <button
//           type="submit"
//           className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//         >
//           Update Payment
//         </button>
//       </form>

//       {/* Payment History Section */}
//       <div className="mt-6 pt-4 border-t border-gray-200">
//         <button
//           onClick={() => setShowPaymentHistory(!showPaymentHistory)}
//           // Removed `disabled={!hasPaymentHistory}` to ensure the button is always clickable.
//           // The visual 'disabled' style is still applied via the className if no history exists.
//           className={`text-sm font-medium underline ${
//             hasPaymentHistory ? "text-blue-600 hover:text-blue-700" : "text-gray-400 cursor-not-allowed"
//           }`}
//         >
//           {showPaymentHistory ? "Hide" : "🕓 View"} Payment History
//         </button>

//         {/* This block conditionally renders the PaymentHistory component or a message.
//             It only appears when 'showPaymentHistory' is true (i.e., the button has been clicked to reveal content). */}
//         {showPaymentHistory && (
//           hasPaymentHistory ? (
//             // Render the PaymentHistory component if there is history
//             <PaymentHistory
//               paymentHistory={selectedTask.paymentHistory || []} // Ensure it's an array for safety
//               taskTitle={selectedTask.name}
//             />
//           ) : (
//             // Render a message if there's no history for this task
//             <p className="text-gray-500 text-sm mt-4">No payment history recorded for this task yet.</p>
//           )
//         )}
//       </div>
//     </div>
//   );
// }




















// // components/PaymentSection.tsx
// "use client";

// import React from "react";
// import PaymentHistory from "./PaymentHistory"; // Ensure this path is correct

// interface PaymentEntry {
//   amount: number;
//   received: number;
//   updatedAt: string;
//   updatedBy: string;
//   fileUrl?: string | null;
// }

// interface Task {
//   id: string;
//   name: string;
//   shop: string;
//   customer: string;
//   start: string;
//   end: string;
//   progress: number;
//   assigneeIds?: string[];
//   subtasks?: any[];
//   notes?: any[];
//   attachments?: string[];
//   amount?: number;
//   received?: number;
//   paymentHistory?: PaymentEntry[] | null;
// }

// interface PaymentSectionProps {
//   selectedTask: Task | null;
//   user: any;
//   amount: string;
//   setAmount: (value: string) => void;
//   received: string;
//   setReceived: (value: string) => void;
//   paymentUploadStatus: string;
//   setPaymentUploadStatus: (status: string) => void;
//   handlePaymentSubmit: (e: React.FormEvent) => Promise<void>;
//   showPaymentHistory: boolean;
//   setShowPaymentHistory: (show: boolean) => void;
// }

// export default function PaymentSection({
//   selectedTask,
//   user,
//   amount,
//   setAmount,
//   received,
//   setReceived,
//   paymentUploadStatus,
//   setPaymentUploadStatus,
//   handlePaymentSubmit,
//   showPaymentHistory,
//   setShowPaymentHistory,
// }: PaymentSectionProps) {
//   if (!selectedTask) {
//     return (
//       <div className="bg-white p-6 rounded-lg shadow-sm text-gray-500 text-sm">
//         No task selected.
//       </div>
//     );
//   }

//   const paymentHistoryArray = selectedTask.paymentHistory ?? [];
//   const hasPaymentHistory = paymentHistoryArray.length > 0;

//   return (
//     <div className="bg-white p-6 rounded-lg shadow-sm">
//       <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 Payment Details</h3>

//       <form onSubmit={handlePaymentSubmit} className="space-y-4">
//         <div>
//           <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
//             Total Amount (₹)
//           </label>
//           <input
//             type="number"
//             id="amount"
//             name="amount"
//             value={amount}
//             onChange={(e) => setAmount(e.target.value)}
//             step="0.01"
//             placeholder="Total amount"
//             className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//           />
//         </div>
//         <div>
//           <label htmlFor="received" className="block text-sm font-medium text-gray-700">
//             Amount Received (₹)
//           </label>
//           <input
//             type="number"
//             id="received"
//             name="received"
//             value={received}
//             onChange={(e) => setReceived(e.target.value)}
//             step="0.01"
//             placeholder="Amount received"
//             className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//           />
//         </div>
//         <div>
//           <label htmlFor="paymentFile" className="block text-sm font-medium text-gray-700">
//             Upload Payment Proof (Image/PDF)
//           </label>
//           <input
//             type="file"
//             id="paymentFile"
//             name="paymentFile"
//             accept="image/*,.pdf"
//             className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//           />
//           {paymentUploadStatus && (
//             <p
//               className={`mt-2 text-sm ${
//                 paymentUploadStatus.startsWith("❌") ? "text-red-600" : "text-green-600"
//               }`}
//             >
//               {paymentUploadStatus}
//             </p>
//           )}
//         </div>
//         <button
//           type="submit"
//           className="inline-flex justify-center py-2 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700"
//         >
//           Update Payment
//         </button>
//       </form>

//       {/* Payment History */}
//       <div className="mt-6 pt-4 border-t border-gray-200">
//         <button
//           onClick={() => setShowPaymentHistory(!showPaymentHistory)}
//           className={`text-sm font-medium underline ${
//             hasPaymentHistory ? "text-blue-600 hover:text-blue-700" : "text-gray-400 cursor-not-allowed"
//           }`}
//         >
//           {showPaymentHistory ? "Hide" : "🕓 View"} Payment History
//         </button>

//         {showPaymentHistory &&
//           (hasPaymentHistory ? (
//             <PaymentHistory
//               paymentHistory={paymentHistoryArray}
//               taskTitle={selectedTask.name}
//             />
//           ) : (
//             <p className="text-gray-500 text-sm mt-4">
//               No payment history recorded for this task yet.
//             </p>
//           ))}
//       </div>
//     </div>
//   );
// }














// // components/PaymentSection.tsx
// "use client";

// import React from "react";
// import PaymentHistory from "./PaymentHistory";

// interface PaymentEntry {
//   amount: number;
//   received: number;
//   updatedAt: string;
//   updatedBy: string;
//   fileUrl?: string | null;
// }

// interface Task {
//   id: string;
//   name: string;
//   shop: string;
//   customer: string;
//   start: string;
//   end: string;
//   progress: number;
//   assigneeIds?: string[];
//   subtasks?: any[];
//   notes?: any[];
//   attachments?: string[];
//   amount?: number;
//   received?: number;
//   paymentHistory?: PaymentEntry[] | null;
// }

// interface PaymentSectionProps {
//   selectedTask: Task | null;
//   user: any;
//   amount: string;
//   setAmount: (value: string) => void;
//   received: string;
//   setReceived: (value: string) => void;
//   paymentUploadStatus: string;
//   setPaymentUploadStatus: (status: string) => void;
//   showPaymentHistory: boolean;
//   setShowPaymentHistory: (show: boolean) => void;
// }

// export default function PaymentSection({
//   selectedTask,
//   user,
//   amount,
//   setAmount,
//   received,
//   setReceived,
//   paymentUploadStatus,
//   setPaymentUploadStatus,
//   showPaymentHistory,
//   setShowPaymentHistory,
// }: PaymentSectionProps) {
//   if (!selectedTask) {
//     return (
//       <div className="bg-white p-6 rounded-lg shadow-sm text-gray-500 text-sm">
//         No task selected.
//       </div>
//     );
//   }

//   const paymentHistoryArray = selectedTask.paymentHistory ?? [];
//   const hasPaymentHistory = paymentHistoryArray.length > 0;
//   const amountLocked = !!selectedTask.amount; // lock if already set

//   const handlePaymentSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const method = amountLocked ? "PATCH" : "POST";
//       const res = await fetch(`/api/tasks/${selectedTask.id}/payments`, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           amount: amountLocked ? undefined : Number(amount),
//           received: Number(received),
//           updatedBy: user?.name || "Unknown",
//         }),
//       });

//       if (!res.ok) {
//         const err = await res.json();
//         throw new Error(err.error || "Failed to update payment");
//       }

//       setPaymentUploadStatus("✅ Payment updated successfully!");
//       setAmount("");
//       setReceived("");
//     } catch (err: any) {
//       console.error("Payment error:", err.message);
//       setPaymentUploadStatus("❌ " + err.message);
//     }
//   };

//   return (
//     <div className="bg-white p-6 rounded-lg shadow-sm">
//       <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 Payment Details</h3>

//       <form onSubmit={handlePaymentSubmit} className="space-y-4">
//         <div>
//           <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
//             Total Amount (₹)
//           </label>
//           <input
//             type="number"
//             id="amount"
//             name="amount"
//             value={amountLocked ? selectedTask.amount : amount}
//             onChange={(e) => setAmount(e.target.value)}
//             step="0.01"
//             placeholder="Total amount"
//             disabled={amountLocked} // lock once set
//             className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 
//                        focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm 
//                        disabled:bg-gray-100 disabled:cursor-not-allowed"
//           />
//         </div>
//         <div>
//           <label htmlFor="received" className="block text-sm font-medium text-gray-700">
//             Amount Received (₹)
//           </label>
//           <input
//             type="number"
//             id="received"
//             name="received"
//             value={received}
//             onChange={(e) => setReceived(e.target.value)}
//             step="0.01"
//             placeholder="Amount received"
//             className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 
//                        focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//           />
//         </div>
//         <div>
//           <label htmlFor="paymentFile" className="block text-sm font-medium text-gray-700">
//             Upload Payment Proof (Image/PDF)
//           </label>
//           <input
//             type="file"
//             id="paymentFile"
//             name="paymentFile"
//             accept="image/*,.pdf"
//             className="mt-1 block w-full text-sm text-gray-500 
//                        file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 
//                        file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 
//                        hover:file:bg-blue-100"
//           />
//           {paymentUploadStatus && (
//             <p
//               className={`mt-2 text-sm ${
//                 paymentUploadStatus.startsWith("❌") ? "text-red-600" : "text-green-600"
//               }`}
//             >
//               {paymentUploadStatus}
//             </p>
//           )}
//         </div>
//         <button
//           type="submit"
//           className="inline-flex justify-center py-2 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700"
//         >
//           {amountLocked ? "Add Received Payment" : "Set Amount & Received"}
//         </button>
//       </form>

//       {/* Payment History */}
//       <div className="mt-6 pt-4 border-t border-gray-200">
//         <button
//           onClick={() => setShowPaymentHistory(!showPaymentHistory)}
//           className={`text-sm font-medium underline ${
//             hasPaymentHistory
//               ? "text-blue-600 hover:text-blue-700"
//               : "text-gray-400 cursor-not-allowed"
//           }`}
//         >
//           {showPaymentHistory ? "Hide" : "🕓 View"} Payment History
//         </button>

//         {showPaymentHistory &&
//           (hasPaymentHistory ? (
//             <PaymentHistory paymentHistory={paymentHistoryArray} taskTitle={selectedTask.name} />
//           ) : (
//             <p className="text-gray-500 text-sm mt-4">
//               No payment history recorded for this task yet.
//             </p>
//           ))}
//       </div>
//     </div>
//   );
// }















// // components/PaymentSection.tsx
// "use client";

// import React from "react";
// import PaymentHistory from "./PaymentHistory";

// interface PaymentEntry {
//   amount: number;
//   received: number;
//   updatedAt: string;
//   updatedBy: string;
//   fileUrl?: string | null;
// }

// interface Task {
//   id: string;
//   name: string;
//   shop: string;
//   customer: string;
//   start: string;
//   end: string;
//   progress: number;
//   assigneeIds?: string[];
//   subtasks?: any[];
//   notes?: any[];
//   attachments?: string[];
//   amount?: number;
//   received?: number;
//   paymentHistory?: PaymentEntry[] | null;
// }

// interface PaymentSectionProps {
//   selectedTask: Task | null;
//   user: any;
//   amount: string;
//   setAmount: (value: string) => void;
//   received: string;
//   setReceived: (value: string) => void;
//   paymentUploadStatus: string;
//   setPaymentUploadStatus: (status: string) => void;
//   showPaymentHistory: boolean;
//   setShowPaymentHistory: (show: boolean) => void;
// }

// export default function PaymentSection({
//   selectedTask,
//   user,
//   amount,
//   setAmount,
//   received,
//   setReceived,
//   paymentUploadStatus,
//   setPaymentUploadStatus,
//   showPaymentHistory,
//   setShowPaymentHistory,
// }: PaymentSectionProps) {
//   if (!selectedTask) {
//     return (
//       <div className="bg-white p-6 rounded-lg shadow-sm text-gray-500 text-sm">
//         No task selected.
//       </div>
//     );
//   }

//   const paymentHistoryArray = selectedTask.paymentHistory ?? [];
//   const hasPaymentHistory = paymentHistoryArray.length > 0;
//   const amountLocked = !!selectedTask.amount; // lock if already set

//   const handlePaymentSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const formData = new FormData();

//       if (!amountLocked && amount) {
//         formData.append("amount", amount);
//       }

//       if (received) {
//         formData.append("received", received);
//       }

//       formData.append("updatedBy", user?.name || "Unknown");

//       const fileInput = document.getElementById("paymentFile") as HTMLInputElement;
//       if (fileInput?.files?.[0]) {
//         formData.append("file", fileInput.files[0]); // <-- must match backend

//       }

//       const method = amountLocked ? "PATCH" : "POST";
//       const res = await fetch(`/api/tasks/${selectedTask.id}/payments`, {
//         method,
//         body: formData, // no headers!
//       });

//       if (!res.ok) {
//         const err = await res.json();
//         throw new Error(err.error || "Upload failed");
//       }

//       setPaymentUploadStatus("✅ Payment updated successfully!");
//        if (data.task) {
//     setSelectedTask(data.task); // <-- ensure parent passes this setter
//   }
//       setAmount("");
//       setReceived("");
//       if (fileInput) fileInput.value = ""; // reset file input
//     } catch (err: any) {
//       console.error("Payment error:", err.message);
//       setPaymentUploadStatus("❌ " + err.message);
//     }
//   };

//   return (
//     <div className="bg-white p-6 rounded-lg shadow-sm">
//       <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 Payment Details</h3>

//       <form onSubmit={handlePaymentSubmit} className="space-y-4">
//         <div>
//           <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
//             Total Amount (₹)
//           </label>
//           <input
//             type="number"
//             id="amount"
//             name="amount"
//             value={amountLocked ? selectedTask.amount : amount}
//             onChange={(e) => setAmount(e.target.value)}
//             step="0.01"
//             placeholder="Total amount"
//             disabled={amountLocked}
//             className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 
//                        focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm 
//                        disabled:bg-gray-100 disabled:cursor-not-allowed"
//           />
//         </div>

//         <div>
//           <label htmlFor="received" className="block text-sm font-medium text-gray-700">
//             Amount Received (₹)
//           </label>
//           <input
//             type="number"
//             id="received"
//             name="received"
//             value={received}
//             onChange={(e) => setReceived(e.target.value)}
//             step="0.01"
//             placeholder="Amount received"
//             className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 
//                        focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//           />
//         </div>

//         <div>
//           <label htmlFor="paymentFile" className="block text-sm font-medium text-gray-700">
//             Upload Payment Proof (Image/PDF)
//           </label>
//           <input
//             type="file"
//             id="paymentFile"
//             name="paymentFile"
//             accept="image/*,.pdf"
//             className="mt-1 block w-full text-sm text-gray-500 
//                        file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 
//                        file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 
//                        hover:file:bg-blue-100"
//           />
//           {paymentUploadStatus && (
//             <p
//               className={`mt-2 text-sm ${
//                 paymentUploadStatus.startsWith("❌") ? "text-red-600" : "text-green-600"
//               }`}
//             >
//               {paymentUploadStatus}
//             </p>
//           )}
//         </div>

//         <button
//           type="submit"
//           className="inline-flex justify-center py-2 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700"
//         >
//           {amountLocked ? "Add Received Payment" : "Set Amount & Received"}
//         </button>
//       </form>

//       {/* Payment History */}
//       <div className="mt-6 pt-4 border-t border-gray-200">
//         <button
//           onClick={() => setShowPaymentHistory(!showPaymentHistory)}
//           className={`text-sm font-medium underline ${
//             hasPaymentHistory
//               ? "text-blue-600 hover:text-blue-700"
//               : "text-gray-400 cursor-not-allowed"
//           }`}
//         >
//           {showPaymentHistory ? "Hide" : "🕓 View"} Payment History
//         </button>

//         {showPaymentHistory &&
//           (hasPaymentHistory ? (
//             <PaymentHistory paymentHistory={paymentHistoryArray} taskTitle={selectedTask.name} />
//           ) : (
//             <p className="text-gray-500 text-sm mt-4">
//               No payment history recorded for this task yet.
//             </p>
//           ))}
//       </div>
//     </div>
//   );
// }



















// components/PaymentSection.tsx
"use client";

import React from "react";
import PaymentHistory from "./PaymentHistory"; // Ensure this path is correct

interface PaymentEntry {
  amount: number;
  received: number;
  updatedAt: string;
  updatedBy: string;
  fileUrl?: string | null;
}

interface Task {
  id: string;
  name: string;
  shop: string;
  customer: string;
  start: string;
  end: string;
  progress: number;
  assigneeIds?: string[];
  subtasks?: any[];
  notes?: any[];
  attachments?: string[];
  amount?: number;
  received?: number;
  paymentHistory?: PaymentEntry[] | null;
}

interface PaymentSectionProps {
  selectedTask: Task | null;
  user: any;
  amount: string;
  setAmount: (value: string) => void;
  received: string;
  setReceived: (value: string) => void;
  paymentUploadStatus: string;
  setPaymentUploadStatus: (status: string) => void;
  handlePaymentSubmit: (e: React.FormEvent) => Promise<void>;
  showPaymentHistory: boolean;
  setShowPaymentHistory: (show: boolean) => void;
}

export default function PaymentSection({
  selectedTask,
  user,
  amount,
  setAmount,
  received,
  setReceived,
  paymentUploadStatus,
  setPaymentUploadStatus,
  handlePaymentSubmit,
  showPaymentHistory,
  setShowPaymentHistory,
}: PaymentSectionProps) {
  if (!selectedTask) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm text-gray-500 text-sm">
        No task selected.
      </div>
    );
  }

  const paymentHistoryArray = selectedTask.paymentHistory ?? [];
  const hasPaymentHistory = paymentHistoryArray.length > 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 Payment Details</h3>

      <form onSubmit={handlePaymentSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Total Amount (₹)
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            placeholder="Total amount"
            className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="received" className="block text-sm font-medium text-gray-700">
            Amount Received (₹)
          </label>
          <input
            type="number"
            id="received"
            name="received"
            value={received}
            onChange={(e) => setReceived(e.target.value)}
            step="0.01"
            placeholder="Amount received"
            className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="paymentFile" className="block text-sm font-medium text-gray-700">
            Upload Payment Proof (Image/PDF)
          </label>
          <input
            type="file"
            id="paymentFile"
            name="paymentFile"
            accept="image/*,.pdf"
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {paymentUploadStatus && (
            <p
              className={`mt-2 text-sm ${
                paymentUploadStatus.startsWith("❌") ? "text-red-600" : "text-green-600"
              }`}
            >
              {paymentUploadStatus}
            </p>
          )}
        </div>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Update Payment
        </button>
      </form>

      {/* Payment History */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={() => setShowPaymentHistory(!showPaymentHistory)}
          className={`text-sm font-medium underline ${
            hasPaymentHistory ? "text-blue-600 hover:text-blue-700" : "text-gray-400 cursor-not-allowed"
          }`}
        >
          {showPaymentHistory ? "Hide" : "🕓 View"} Payment History
        </button>

        {showPaymentHistory &&
          (hasPaymentHistory ? (
            <PaymentHistory
              paymentHistory={paymentHistoryArray}
              taskTitle={selectedTask.name}
            />
          ) : (
            <p className="text-gray-500 text-sm mt-4">
              No payment history recorded for this task yet.
            </p>
          ))}
      </div>
    </div>
  );
}





