// import { NextResponse } from "next/server";
// import {prisma} from "../../../../../lib/prisma"; // adjust path to your prisma client

// // GET /api/tasks/stats
// export async function GET() {
//   try {
//     // Fetch tasks with assignee + status
//     const tasks = await prisma.task.findMany({
//       include: { assignee: true },
//     });

//     if (!tasks || tasks.length === 0) {
//       return NextResponse.json({ error: "No tasks found" }, { status: 404 });
//     }

//     // Group by assignee and status
//     const stats: Record<string, Record<string, number>> = {};

//     tasks.forEach((task) => {
//       const assigneeName = task.assignee?.name || "Unassigned";
//       const status = task.status || "Unknown";

//       if (!stats[assigneeName]) {
//         stats[assigneeName] = { Todo: 0, "In Progress": 0, Done: 0 };
//       }

//       if (stats[assigneeName][status] !== undefined) {
//         stats[assigneeName][status] += 1;
//       } else {
//         stats[assigneeName][status] = 1; // fallback
//       }
//     });

//     return NextResponse.json({ stats });
//   } catch (error: any) {
//     console.error("❌ Error fetching task stats:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch task stats", details: error.message },
//       { status: 500 }
//     );
//   }
// }



















// // src/app/api/tasks/stats/route.ts
// import { NextResponse } from "next/server";
// import { prisma } from "../../../../../lib/prisma";

// export async function GET() {
//   try {
//     const tasks = await prisma.task.findMany(); // no include!

//     // Group by assigneeName
//     const stats: Record<
//       string,
//       { assignee: string; todo: number; inProgress: number; done: number }
//     > = {};

//     tasks.forEach((task) => {
//       const key = task.assigneeName || "Unassigned";
//       if (!stats[key]) {
//         stats[key] = { assignee: key, todo: 0, inProgress: 0, done: 0 };
//       }

//       if (task.status === "TODO") stats[key].todo++;
//       if (task.status === "IN_PROGRESS") stats[key].inProgress++;
//       if (task.status === "DONE") stats[key].done++;
//     });

//     return NextResponse.json({ stats: Object.values(stats) });
//   } catch (error: any) {
//     console.error("❌ Failed to fetch task stats:", error);
//     return NextResponse.json(
//       { error: `Failed to fetch task stats: ${error.message}` },
//       { status: 500 }
//     );
//   }
// }



// import { NextResponse } from "next/server";
// 

// export async function GET() {
//   try {
//     // Get only needed fields
//     const tasks = await prisma.task.findMany({
//       select: {
//         assigneeId: true,
//         assigneeName: true,
//         status: true,
//       },
//     });

//     if (!tasks.length) {
//       return NextResponse.json({ message: "No tasks found", data: [] });
//     }

//     // Aggregate manually
//     const summary: Record<
//       string,
//       { name: string; todo: number; inProgress: number; done: number }
//     > = {};

//     for (const task of tasks) {
//       const key = task.assigneeId || "unassigned";
//       const name = task.assigneeName || "Unassigned";

//       if (!summary[key]) {
//         summary[key] = { name, todo: 0, inProgress: 0, done: 0 };
//       }

//       switch (task.status) {
//         case "TODO":
//           summary[key].todo++;
//           break;
//         case "IN_PROGRESS":
//           summary[key].inProgress++;
//           break;
//         case "DONE":
//           summary[key].done++;
//           break;
//       }
//     }

//     return NextResponse.json(Object.values(summary));
//   } catch (error: any) {
//     console.error("❌ Error in /api/tasks/stats:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch task stats", details: error.message },
//       { status: 500 }
//     );
//   }
// }















// import { NextResponse } from "next/server";
// import {prisma} from "../../../../../lib/prisma";// make sure prisma client is here

// export async function GET() {
//   try {
//     // Group by assigneeId and count tasks by status
//     const tasks = await prisma.task.findMany({
//       select: {
//         status: true,
//         assigneeId: true,
//         assignee: { select: { name: true, email: true } },
//       },
//     });

//     // Initialize summary map
//     const summaryMap: Record<
//       string,
//       { assignee: string; todo: number; inProgress: number; done: number }
//     > = {};

//     tasks.forEach((task) => {
//       const assigneeKey =
//         task.assignee?.name || task.assignee?.email || "Unassigned";

//       if (!summaryMap[assigneeKey]) {
//         summaryMap[assigneeKey] = {
//           assignee: assigneeKey,
//           todo: 0,
//           inProgress: 0,
//           done: 0,
//         };
//       }

//       if (task.status === "Todo") summaryMap[assigneeKey].todo += 1;
//       else if (task.status === "In Progress")
//         summaryMap[assigneeKey].inProgress += 1;
//       else if (task.status === "Done") summaryMap[assigneeKey].done += 1;
//     });

//     return NextResponse.json(
//       { assigneeSummary: Object.values(summaryMap) },
//       { status: 200 }
//     );
//   } catch (err: any) {
//     console.error("Error fetching task stats:", err);
//     return NextResponse.json(
//       { error: "Failed to fetch task stats", details: err.message },
//       { status: 500 }
//     );
//   }
// }
















// import { NextResponse } from "next/server";
// import {prisma} from "../../../../../lib/prisma";

// export async function GET() {
//   try {
//     const tasks = await prisma.task.findMany({
//       select: {
//         status: true,
//         assigneeName: true,
//       },
//     });

//     const summaryMap: Record<
//       string,
//       { assignee: string; todo: number; inprogress: number; done: number }
//     > = {};

//     tasks.forEach((task) => {
//       const key = task.assigneeName || "Unassigned";

//       if (!summaryMap[key]) {
//         summaryMap[key] = { assignee: key, todo: 0, inprogress: 0, done: 0 };
//       }

//       if (task.status === "TODO") summaryMap[key].todo += 1;
//       if (task.status === "IN_PROGRESS") summaryMap[key].inprogress += 1;
//       if (task.status === "DONE") summaryMap[key].done += 1;
//     });

//     return NextResponse.json(
//       {
//         success: true,
//         data: Object.values(summaryMap),
//       },
//       { status: 200 }
//     );
//   } catch (err: any) {
//     console.error("Error fetching task stats:", err);
//     return NextResponse.json(
//       {
//         success: false,
//         error: "Failed to fetch task stats",
//         details: err.message,
//       },
//       { status: 500 }
//     );
//   }
// }













// import { NextResponse } from "next/server";
// // If your prisma export is `export const prisma = new PrismaClient()`
// import {prisma} from "../../../../../lib/prisma";
// // If yours is default export, use: import prisma from "@/lib/prisma";
// import { auth } from "@clerk/nextjs/server";

// type Row = {
//   assignee: string;     // display name
//   todo: number;
//   inprogress: number;
//   done: number;
//   total: number;
// };

// // status -> bucket
// function normalizeStatus(input?: string): "todo" | "inprogress" | "done" | "unknown" {
//   const k = (input || "")
//     .toString()
//     .trim()
//     .toLowerCase()
//     .replace(/[\s_-]/g, "");

//   if (["todo", "backlog", "open", "new"].includes(k)) return "todo";
//   if (["inprogress", "inprogess", "wip", "doing", "ongoing"].includes(k)) return "inprogress";
//   if (["done", "completed", "complete", "closed", "resolved", "finished"].includes(k)) return "done";
//   return "unknown";
// }

// export async function GET(req: Request) {
//   try {
//     const { userId } = await auth().catch(() => ({ userId: null as any }));
//     const url = new URL(req.url);
//     const scope = url.searchParams.get("scope"); // optional: "mine" or "all"

//     // If you want to show only tasks created by the logged-in user:
//     // call /api/tasks/stats?scope=mine
//     const where =
//       scope === "mine" && userId ? { createdByClerkId: userId } : {};

//     // Pull only the fields we need
//     const tasks = await prisma.task.findMany({
//       where,
//       select: {
//         status: true,
//         assigneeName: true,
//         assigneeEmail: true,
//         assigneeId: true,
//       },
//     });

//     // Group by a stable key (prefer ID if present), keep a display name separately
//     const map: Record<
//       string,
//       Row & { _displayName: string } // keep internal display name field
//     > = {};

//     for (const t of tasks) {
//       const key =
//         (t.assigneeId && t.assigneeId.trim()) ||
//         (t.assigneeEmail && t.assigneeEmail.trim()) ||
//         (t.assigneeName && t.assigneeName.trim()) ||
//         "unassigned";

//       const displayName =
//         (t.assigneeName && t.assigneeName.trim()) ||
//         (t.assigneeEmail && t.assigneeEmail.trim()) ||
//         (t.assigneeId && t.assigneeId.trim()) ||
//         "Unassigned";

//       if (!map[key]) {
//         map[key] = {
//           assignee: displayName,
//           _displayName: displayName,
//           todo: 0,
//           inprogress: 0,
//           done: 0,
//           total: 0,
//         };
//       }

//       const bucket = normalizeStatus(t.status);
//       if (bucket !== "unknown") {
//         map[key][bucket] += 1 as any;
//         map[key].total += 1;
//       }
//     }

//     const data = Object.values(map)
//       .map(({ _displayName, ...rest }) => rest) // drop internal field
//       .sort((a, b) => a.assignee.localeCompare(b.assignee));

//     return NextResponse.json({ success: true, data }, { status: 200 });
//   } catch (err: any) {
//     // Deep logging so you can see what's wrong in the server console
//     console.error("GET /api/tasks/stats failed:", {
//       message: err?.message,
//       stack: err?.stack,
//       name: err?.name,
//     });
//     return NextResponse.json(
//       {
//         success: false,
//         error: "Failed to fetch task stats",
//         details: err?.message || String(err),
//       },
//       { status: 500 }
//     );
//   }
// }














// import { NextResponse } from "next/server";
// import {prisma} from "../../../../../lib/prisma";// ✅ use default export (your lib/prisma.ts should `export default prisma`)
// import { auth } from "@clerk/nextjs/server";

// type Row = {
//   assignee: string; // display name
//   todo: number;
//   inprogress: number;
//   done: number;
//   total: number;
// };

// // Normalize task status into standard buckets
// function normalizeStatus(input?: string): "todo" | "inprogress" | "done" | "unknown" {
//   const k = (input || "")
//     .toString()     
//     .trim()
//     .toLowerCase()
//     .replace(/[\s_-]/g, "");

//   if (["todo", "backlog", "open", "new"].includes(k)) return "todo";
//   if (["inprogress", "inprogess", "wip", "doing", "ongoing"].includes(k)) return "inprogress";
//   if (["done", "completed", "complete", "closed", "resolved", "finished"].includes(k)) return "done";
//   return "unknown";
// }

// export async function GET(req: Request) {
//   try {
//     // Clerk auth (safe fallback to null if not logged in)
//     const { userId } = await auth().catch(() => ({ userId: null as any }));

//     const url = new URL(req.url);
//     const scope = url.searchParams.get("scope"); // optional: "mine" or "all"

//     // Filter: if scope=mine → only show tasks created by logged-in user
//     const where =
//       scope === "mine" && userId ? { createdByClerkId: userId } : {};

//     // Fetch only needed fields from Prisma
//     const tasks = await prisma.task.findMany({
//       where,
//       select: {
//         status: true,
//         assigneeName: true,
//         assigneeEmail: true,
//         assigneeId: true,
//       },
//     });

//     // Group stats by assignee (prefer assigneeId → email → name)
//     const map: Record<
//       string,
//       Row & { _displayName: string }
//     > = {};

//     for (const t of tasks) {
//       const key =
//         (t.assigneeId && t.assigneeId.trim()) ||
//         (t.assigneeEmail && t.assigneeEmail.trim()) ||
//         (t.assigneeName && t.assigneeName.trim()) ||
//         "unassigned";

//       const displayName =
//         (t.assigneeName && t.assigneeName.trim()) ||
//         (t.assigneeEmail && t.assigneeEmail.trim()) ||
//         (t.assigneeId && t.assigneeId.trim()) ||
//         "Unassigned";

//       if (!map[key]) {
//         map[key] = {
//           assignee: displayName,
//           _displayName: displayName, // internal use only
//           todo: 0,
//           inprogress: 0,
//           done: 0,
//           total: 0,
//         };
//       }

//       const bucket = normalizeStatus(t.status);
//       if (bucket !== "unknown") {
//         map[key][bucket] += 1 as any;
//         map[key].total += 1;
//       }
//     }

//     // Convert to array, drop _displayName, sort alphabetically
//     const data = Object.values(map)
//       .map(({ _displayName, ...rest }) => rest)
//       .sort((a, b) => a.assignee.localeCompare(b.assignee));

//     return NextResponse.json({ success: true, data }, { status: 200 });
//   } catch (err: any) {
//     console.error("GET /api/tasks/stats failed:", {
//       message: err?.message,
//       stack: err?.stack,
//       name: err?.name,
//     });
//     return NextResponse.json(
//       {
//         success: false,
//         error: "Failed to fetch task stats",
//         details: err?.message || String(err),
//       },
//       { status: 500 }
//     );
//   }
// }











// import { NextResponse } from "next/server";
// import { prisma } from "../../../../../lib/prisma";
// import { auth, clerkClient } from "@clerk/nextjs/server";

// type Row = {
//   assignee: string; // display name
//   todo: number;
//   inprogress: number;
//   done: number;
//   total: number;
// };

// // Normalize task status into standard buckets
// function normalizeStatus(input?: string): "todo" | "inprogress" | "done" | "unknown" {
//   const k = (input || "")
//     .toString()
//     .trim()
//     .toLowerCase()
//     .replace(/[\s_-]/g, "");

//   if (["todo", "backlog", "open", "new"].includes(k)) return "todo";
//   if (["inprogress", "inprogess", "wip", "doing", "ongoing"].includes(k)) return "inprogress";
//   if (["done", "completed", "complete", "closed", "resolved", "finished"].includes(k)) return "done";
//   return "unknown";
// }

// export async function GET(req: Request) {
//   try {
//     const { userId } = await auth().catch(() => ({ userId: null as any }));
//     const url = new URL(req.url);
//     const scope = url.searchParams.get("scope");

//     const where =
//       scope === "mine" && userId ? { createdByClerkId: userId } : {};

//     // ✅ fetch `assigneeIds` (array)
//     const tasks = await prisma.task.findMany({
//       where,
//       select: {
//         status: true,
//         assigneeIds: true,
//       },
//     });

//     const map: Record<string, Row> = {};

//     for (const t of tasks) {
//       const bucket = normalizeStatus(t.status);
//       if (bucket === "unknown") continue;

//       const assignees = t.assigneeIds?.length ? t.assigneeIds : ["unassigned"];

//       for (const uid of assignees) {
//         if (!map[uid]) {
//           map[uid] = {
//             assignee: uid === "unassigned" ? "Unassigned" : uid,
//             todo: 0,
//             inprogress: 0,
//             done: 0,
//             total: 0,
//           };
//         }
//         map[uid][bucket] += 1 as any;
//         map[uid].total += 1;
//       }
//     }

//     // 🔥 Fetch Clerk user profiles for IDs
//     const ids = Object.keys(map).filter((id) => id !== "unassigned");
//     if (ids.length > 0) {
//       const users = await clerkClient.users.getUserList({ userId: ids });
//       const userMap: Record<string, string> = {};

//       for (const u of users) {
//         userMap[u.id] =
//           u.firstName && u.lastName
//             ? `${u.firstName} ${u.lastName}`
//             : u.firstName || u.username || u.emailAddresses[0]?.emailAddress || u.id;
//       }

//       // Replace IDs with names
//       for (const id of ids) {
//         if (userMap[id]) {
//           map[id].assignee = userMap[id];
//         }
//       }
//     }

//     const data = Object.values(map).sort((a, b) => a.assignee.localeCompare(b.assignee));

//     return NextResponse.json({ success: true, data }, { status: 200 });
//   } catch (err: any) {
//     console.error("GET /api/tasks/stats failed:", err);
//     return NextResponse.json(
//       {
//         success: false,
//         error: "Failed to fetch task stats",
//         details: err?.message || String(err),
//       },
//       { status: 500 }
//     );
//   }
// }










// import { NextResponse } from "next/server";
// import { prisma } from "../../../../../lib/prisma";
// import { auth, clerkClient } from "@clerk/nextjs/server";

// type Row = {
//   assignee: string; // display name
//   todo: number;
//   inprogress: number;
//   done: number;
//   total: number;
// };

// function normalizeStatus(input?: string): "todo" | "inprogress" | "done" | "unknown" {
//   const k = (input || "")
//     .toString()
//     .trim()
//     .toLowerCase()
//     .replace(/[\s_-]/g, "");
//   if (["todo", "backlog", "open", "new"].includes(k)) return "todo";
//   if (["inprogress", "inprogess", "wip", "doing", "ongoing"].includes(k)) return "inprogress";
//   if (["done", "completed", "complete", "closed", "resolved", "finished"].includes(k)) return "done";
//   return "unknown";
// }

// export async function GET(req: Request) {
//   try {
//     const { userId } = await auth().catch(() => ({ userId: null as any }));
//     const url = new URL(req.url);
//     const scope = url.searchParams.get("scope");

//     const where =
//       scope === "mine" && userId ? { createdByClerkId: userId } : {};

//     // ⬅️ Also pull `customFields` since it may contain assigneeName
//     const tasks = await prisma.task.findMany({
//       where,
//       select: {
//         status: true,
//         assigneeIds: true,
//         customFields: true,
//       },
//     });

//     const map: Record<string, Row> = {};

//     for (const t of tasks) {
//       const bucket = normalizeStatus(t.status);
//       if (bucket === "unknown") continue;

//       // Resolve assignee(s)
//       let assignees: string[] = [];
//       if (t.assigneeIds?.length) {
//         assignees = t.assigneeIds;
//       } else {
//         assignees = ["unassigned"];
//       }

//       for (const uid of assignees) {
//         // Try to get name from customFields
//         const cf = t.customFields as any;
//         const displayName =
//           uid === "unassigned"
//             ? "Unassigned"
//             : cf?.assigneeName || uid; // fallback to Clerk ID if no name

//         if (!map[uid]) {
//           map[uid] = {
//             assignee: displayName,
//             todo: 0,
//             inprogress: 0,
//             done: 0,
//             total: 0,
//           };
//         }

//         // update counts
//         map[uid][bucket] += 1 as any;
//         map[uid].total += 1;
//       }
//     }

//     // optional: still try Clerk lookup if assignee = raw user_xxx
//     const ids = Object.keys(map).filter(
//       (id) => id !== "unassigned" && map[id].assignee.startsWith("user_")
//     );
//     await Promise.all(
//       ids.map(async (id) => {
//         try {
//           const u = await clerkClient.users.getUser(id);
//           map[id].assignee =
//             u.firstName && u.lastName
//               ? `${u.firstName} ${u.lastName}`
//               : u.firstName ||
//                 u.username ||
//                 u.emailAddresses[0]?.emailAddress ||
//                 id;
//         } catch {
//           /* leave ID as-is if Clerk fails */
//         }
//       })
//     );

//     const data = Object.values(map).sort((a, b) =>
//       a.assignee.localeCompare(b.assignee)
//     );

//     return NextResponse.json({ success: true, data }, { status: 200 });
//   } catch (err: any) {
//     console.error("GET /api/tasks/stats failed:", err);
//     return NextResponse.json(
//       { success: false, error: "Failed to fetch task stats", details: err?.message || String(err) },
//       { status: 500 }
//     );
//   }
// }













// import { NextResponse } from "next/server";
// import { prisma } from "../../../../../lib/prisma";
// import { auth } from "@clerk/nextjs/server";

// type Row = {
//   assignee: string; // display name
//   todo: number;
//   inprogress: number;
//   done: number;
//   total: number;
// };

// // Normalize task status into standard buckets
// function normalizeStatus(input?: string): "todo" | "inprogress" | "done" | "unknown" {
//   const k = (input || "")
//     .toString()
//     .trim()
//     .toLowerCase()
//     .replace(/[\s_-]/g, "");

//   if (["todo", "backlog", "open", "new"].includes(k)) return "todo";
//   if (["inprogress", "inprogess", "wip", "doing", "ongoing"].includes(k)) return "inprogress";
//   if (["done", "completed", "complete", "closed", "resolved", "finished"].includes(k)) return "done";
//   return "unknown";
// }

// export async function GET(req: Request) {
//   try {
//     const { userId } = await auth().catch(() => ({ userId: null as any }));
//     const url = new URL(req.url);
//     const scope = url.searchParams.get("scope");

//     const where =
//       scope === "mine" && userId ? { createdByClerkId: userId } : {};

//     // ✅ fetch with assignee fields too
//     const tasks = await prisma.task.findMany({
//       where,
//       select: {
//         status: true,
//         assigneeIds: true,
//         assigneeName: true,  // 👈 important
//       },
//     });

//     const map: Record<string, Row> = {};

//     for (const t of tasks) {
//       const bucket = normalizeStatus(t.status);
//       if (bucket === "unknown") continue;

//       // if no assignees → count under "Unassigned"
//       const assignees =
//         t.assigneeIds?.length > 0 ? t.assigneeIds : ["unassigned"];

//       for (const uid of assignees) {
//         // ✅ Prefer stored assigneeName if available
//         const display =
//           uid === "unassigned"
//             ? "Unassigned"
//             : t.assigneeName || uid;

//         if (!map[uid]) {
//           map[uid] = {
//             assignee: display,
//             todo: 0,
//             inprogress: 0,
//             done: 0,
//             total: 0,
//           };
//         }

//         map[uid][bucket] += 1 as any;
//         map[uid].total += 1;
//       }
//     }

//     const data = Object.values(map).sort((a, b) =>
//       a.assignee.localeCompare(b.assignee)
//     );

//     return NextResponse.json({ success: true, data }, { status: 200 });
//   } catch (err: any) {
//     console.error("GET /api/tasks/stats failed:", err);
//     return NextResponse.json(
//       {
//         success: false,
//         error: "Failed to fetch task stats",
//         details: err?.message || String(err),
//       },
//       { status: 500 }
//     );
//   }
// }




















// import { NextResponse } from "next/server";
// import { prisma } from "../../../../../lib/prisma";
// import { users } from "@clerk/clerk-sdk-node";

// type Row = {
//   assignee: string;
//   todo: number;
//   inprogress: number;
//   done: number;
//   total: number;
// };

// function normalizeStatus(input?: string): "todo" | "inprogress" | "done" | "unknown" {
//   const k = (input || "").toString().trim().toLowerCase().replace(/[\s_-]/g, "");
//   if (["todo", "backlog", "open", "new"].includes(k)) return "todo";
//   if (["inprogress", "inprogess", "wip", "doing", "ongoing"].includes(k)) return "inprogress";
//   if (["done", "completed", "complete", "closed", "resolved", "finished"].includes(k)) return "done";
//   return "unknown";
// }

// export async function GET(req: Request) {
//   try {
//     // 1️⃣ fetch all tasks with assigneeIds
//     const tasks = await prisma.task.findMany({
//       select: {
//         status: true,
//         assigneeIds: true,
//       },
//     });

//     // 2️⃣ collect all unique assigneeIds
//     const allIds = new Set<string>();
//     tasks.forEach(t => {
//       (t.assigneeIds || []).forEach(id => allIds.add(id));
//     });

//     // 3️⃣ fetch Clerk users in batch
//     const clerkUsers = await Promise.all(
//       Array.from(allIds).map(id =>
//         users.getUser(id).catch(() => null)
//       )
//     );

  
//     // 4️⃣ map id → name
//     const userMap: Record<string, string> = {};
//     clerkUsers.forEach(u => {
//       if (u) {
//         const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username || u.id;
//         userMap[u.id] = name;
//       }
//     });

//     // 5️⃣ build stats
//     const map: Record<string, Row> = {};

//     tasks.forEach(t => {
//       const bucket = normalizeStatus(t.status);
//       if (bucket === "unknown") return;

//       const assignees = t.assigneeIds?.length ? t.assigneeIds : ["unassigned"];

//       assignees.forEach(uid => {
//         const display = uid === "unassigned" ? "Unassigned" : userMap[uid] || uid;

//         if (!map[uid]) {
//           map[uid] = { assignee: display, todo: 0, inprogress: 0, done: 0, total: 0 };
//         }

//         map[uid][bucket] += 1 as any;
//         map[uid].total += 1;
//       });
//     });

//     const data = Object.values(map).sort((a, b) => a.assignee.localeCompare(b.assignee));

//     return NextResponse.json({ success: true, data }, { status: 200 });
//   } catch (err: any) {
//     console.error("GET /api/tasks/stats failed:", err);
//     return NextResponse.json(
//       { success: false, error: "Failed to fetch task stats", details: err?.message || String(err) },
//       { status: 500 }
//     );
//   }
// }








import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { users } from "@clerk/clerk-sdk-node";

type Row = {
  assignee: string;
  todo: number;
  inprogress: number;
  done: number;
  total: number;
};

function normalizeStatus(input?: string): "todo" | "inprogress" | "done" | "unknown" {
  const k = (input || "").toString().trim().toLowerCase().replace(/[\s_-]/g, "");
  if (["todo", "backlog", "open", "new"].includes(k)) return "todo";
  if (["inprogress", "inprogess", "wip", "doing", "ongoing"].includes(k)) return "inprogress";
  if (["done", "completed", "complete", "closed", "resolved", "finished"].includes(k)) return "done";
  return "unknown";
}

export async function GET(req: Request) {
  try {
    // 1️⃣ fetch all tasks with assigneeIds
    const tasks = await prisma.task.findMany({
      select: {
        status: true,
        assigneeIds: true,
      },
    });

    // 2️⃣ collect all unique assigneeIds
    const allIds = new Set<string>();
    tasks.forEach(t => {
      (t.assigneeIds || []).forEach(id => allIds.add(id));
    });

    // 3️⃣ fetch Clerk users in batch
    const clerkUsers = await Promise.all(
      Array.from(allIds).map(id =>
        users.getUser(id).catch(() => null)
      )
    );

    // 4️⃣ map id → name
    const userMap: Record<string, string> = {};
    clerkUsers.forEach(u => {
      if (u) {
        const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username || u.id;
        userMap[u.id] = name;
      }
    });

    // 5️⃣ build stats per assignee
    const map: Record<string, Row> = {};
    tasks.forEach(t => {
      const bucket = normalizeStatus(t.status);
      if (bucket === "unknown") return;

      const assignees = t.assigneeIds?.length ? t.assigneeIds : ["unassigned"];

      assignees.forEach(uid => {
        const display = uid === "unassigned" ? "Unassigned" : userMap[uid] || uid;

        if (!map[uid]) {
          map[uid] = { assignee: display, todo: 0, inprogress: 0, done: 0, total: 0 };
        }

        map[uid][bucket] += 1;
        map[uid].total += 1;
      });
    });

    // Convert to array
    let data = Object.values(map).sort((a, b) => a.assignee.localeCompare(b.assignee));

    // ✅ Filter to default 6 persons only
    const defaultAssignees = ["Akash Verma","Prince","Ravi kant","Rishi","Sachin","Vikash Bidawat"];
    data = data.filter(d => defaultAssignees.includes(d.assignee));

    // 6️⃣ calculate totals across filtered assignees
    const totals = data.reduce(
      (acc, curr) => {
        acc.todo += curr.todo;
        acc.inprogress += curr.inprogress;
        acc.done += curr.done;
        return acc;
      },
      { todo: 0, inprogress: 0, done: 0 }
    );

    return NextResponse.json({ success: true, data, totals }, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/tasks/stats failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch task stats", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
