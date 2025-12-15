// import React from "react";
// import { parseISO, format } from "date-fns";
// import { FaDownload } from "react-icons/fa"; // Import the download icon
// import jsPDF from "jspdf"; // Import jsPDF
// import "jspdf-autotable"; // Import jspdf-autotable for table support

// // Define the interface for a single payment history entry
// interface PaymentEntry {
//   amount: number; // Amount at the time of this history entry
//   received: number; // Received amount at the time of this history entry
//   updatedAt: string; // Timestamp of when this entry was created (from backend)
//   updatedBy: string; // User who made the update (name or email from backend)
//   fileUrl?: string | null; // Optional URL for payment proof
// }

// interface PaymentHistoryProps {
//   paymentHistory: PaymentEntry[];
//   taskTitle: string; // Add taskTitle prop for export filenames
// }

// // Function to export payment history to CSV
// function exportToCSV(history: PaymentEntry[], taskTitle: string) {
//   const headers = ["Updated By", "Amount", "Received", "File URL", "Updated At"];
//   const rows = history.map((entry) => [
//     entry.updatedBy,
//     // Ensure amount and received are numbers before toFixed
//     typeof entry.amount === "number" ? entry.amount : parseFloat(entry.amount as any),
//     typeof entry.received === "number" ? entry.received : parseFloat(entry.received as any),
//     entry.fileUrl || "-",
//     new Date(entry.updatedAt).toLocaleString(),
//   ]);

//   const csvContent = [headers, ...rows]
//     .map((e) => e.map(String).join(","))
//     .join("\n");

//   const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//   const url = URL.createObjectURL(blob);
//   const link = document.createElement("a");
//   link.setAttribute("href", url);
//   link.setAttribute("download", `${taskTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_payment_history.csv`); // Sanitize filename
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
//   URL.revokeObjectURL(url); // Clean up the URL object
// }

// // Function to export payment history to PDF
// function exportToPDF(history: PaymentEntry[], taskTitle: string) {
//   const doc = new jsPDF();
//   doc.setFontSize(16);
//   doc.text(`Payment History: ${taskTitle}`, 14, 20);

//   const rows = history.map((entry) => [
//     entry.updatedBy,
//     // Ensure amount and received are numbers before toFixed
//     (typeof entry.amount === "number" ? entry.amount : parseFloat(entry.amount as any)).toFixed(2),
//     (typeof entry.received === "number" ? entry.received : parseFloat(entry.received as any)).toFixed(2),
//     entry.fileUrl || "-",
//     new Date(entry.updatedAt).toLocaleString(),
//   ]);

//   (doc as any).autoTable({
//     head: [["Updated By", "Amount (₹)", "Received (₹)", "File URL", "Updated At"]], // Updated headers for clarity
//     body: rows,
//     startY: 30,
//     theme: 'striped', // Optional: 'striped', 'grid', 'plain'
//     styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
//     columnStyles: {
//       0: { cellWidth: 30 }, // Updated By
//       1: { cellWidth: 20, halign: 'right' }, // Amount
//       2: { cellWidth: 20, halign: 'right' }, // Received
//       3: { cellWidth: 50 }, // File URL
//       4: { cellWidth: 40 }, // Updated At
//     },
//   });

//   doc.save(`${taskTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_payment_history.pdf`); // Sanitize filename
// }

// export default function PaymentHistory({ paymentHistory, taskTitle }: PaymentHistoryProps) {
//   return (
//     <div className="mt-6">
//       <h4 className="text-md font-semibold text-gray-800 mb-2">Payment History</h4>
//       <div className="space-y-3">
//         {/* Display message if no payment history is available */}
//         {paymentHistory.length === 0 && (
//           <p className="text-gray-500 text-sm">No payment history available.</p>
//         )}

//         {/* Export Buttons */}
//         {paymentHistory.length > 0 && (
//           <div className="flex justify-end gap-2 mb-4">
//             <button
//               onClick={() => exportToCSV(paymentHistory, taskTitle)}
//               className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded shadow transition-colors duration-200"
//             >
//               <FaDownload /> Export CSV
//             </button>
//             <button
//               onClick={() => exportToPDF(paymentHistory, taskTitle)}
//               className="flex items-center gap-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded shadow transition-colors duration-200"
//             >
//               <FaDownload /> Export PDF
//             </button>
//           </div>
//         )}

//         {/* Map through payment history entries and render each one */}
//         {paymentHistory.map((entry, i) => {
//           // Robust parsing for amount and received
//           const amount = typeof entry.amount === "number" ? entry.amount : parseFloat(String(entry.amount));
//           const received = typeof entry.received === "number" ? entry.received : parseFloat(String(entry.received));

//           return (
//             <div
//               key={i} // Using index as key, consider a unique ID from backend if available for better performance/reliability
//               className="p-3 bg-gray-50 border rounded-md text-sm flex flex-col gap-1"
//             >
//               {/* Display Amount and Received in a flex container for alignment */}
//               <div className="flex justify-between">
//                 <span><strong>Amount:</strong> ₹{isNaN(amount) ? 'N/A' : amount.toFixed(2)}</span>
//                 <span><strong>Received:</strong> ₹{isNaN(received) ? 'N/A' : received.toFixed(2)}</span>
//               </div>

//               {/* Display who updated it */}
//               <div>
//                 <strong>By:</strong> {entry.updatedBy}
//               </div>

//               {/* Display when it was updated, formatted using date-fns */}
//               <div>
//                 <strong>On:</strong> {format(parseISO(entry.updatedAt), "dd MMM yyyy HH:mm")}
//               </div>

//               {/* Display link to payment proof if fileUrl exists */}
//               {entry.fileUrl && (
//                 <a
//                   href={entry.fileUrl}
//                   target="_blank" // Open in a new tab
//                   rel="noopener noreferrer" // Security best practice for target="_blank"
//                   className="text-blue-600 hover:underline text-xs"
//                 >
//                   View Proof
//                 </a>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }


















// /components/PaymentHistory.tsx
"use client";

import React, { useEffect, useState } from "react";

export default function PaymentHistory({ taskId }: { taskId: string }) {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!taskId) return;

    const fetchPayments = async () => {
      try {
        const res = await fetch(`/api/payment-history?taskId=${taskId}`);
        const data = await res.json();
        setPayments(data.payments || []);
      } catch (err) {
        console.error("Failed to fetch payments", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [taskId]);

  if (loading) return <p className="text-sm text-gray-500">Loading payment history...</p>;

  if (!payments.length) {
    return <p className="text-sm text-gray-500">No payment history available.</p>;
  }

  return (
    <div>
      <h3 className="text-md font-semibold text-gray-600 mb-2">Payment History</h3>
      <ul className="space-y-2">
        {payments.map((payment) => (
          <li key={payment.id} className="border p-2 rounded bg-gray-50">
            <div className="flex justify-between text-sm">
              <span>Amount: ₹{payment.amount}</span>
              <span className="text-gray-400">{new Date(payment.createdAt).toLocaleString()}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
