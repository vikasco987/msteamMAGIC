// // src/app/api/agreement/route.ts
// import { NextResponse } from "next/server";
// import PDFDocument from "pdfkit";
// import fs from "fs";
// import path from "path";
// import { Buffer } from "buffer";

// export const runtime = "nodejs"; // force Node.js runtime

// export async function POST(req: Request) {
//   try {
//     const { clientName, startDate, endDate, fee, targetSales } = await req.json();

//     // Load custom font
//     const fontPath = path.join(process.cwd(), "public/fonts/Arial.ttf");
//     if (!fs.existsSync(fontPath)) {
//       throw new Error("Font file not found at " + fontPath);
//     }

//     const doc = new PDFDocument({ font: fontPath });
//     const buffers: Buffer[] = [];

//     doc.on("data", (chunk) => buffers.push(chunk));

//     doc.fontSize(18).text(`Agreement between Magic Scale and ${clientName}`, { align: "center" });
//     doc.moveDown();
//     doc.fontSize(12).text(`Start Date: ${startDate}`);
//     doc.text(`End Date: ${endDate}`);
//     doc.text(`Fee: INR ${fee}`);
//     doc.text(`Target Sales: ${targetSales}`);
//     doc.moveDown();
//     doc.text("Thank you for doing business with us!", { align: "center" });

//     doc.end();

//     await new Promise<void>((resolve) => doc.on("end", () => resolve()));

//     const pdfBytes = Buffer.concat(buffers);
//     const filename = `${clientName}-agreement.pdf`;

//     return new NextResponse(pdfBytes, {
//       headers: {
//         "Content-Type": "application/pdf",
//         "Content-Disposition": `attachment; filename="${filename}"`,
//       },
//     });
//   } catch (err) {
//     console.error("PDF generation failed:", err);
//     return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
//   }
// }




// // src/app/api/agreement/route.ts
// import { NextResponse } from "next/server";
// import PDFDocument from "pdfkit";
// import fs from "fs";
// import path from "path";
// import { Buffer } from "buffer";

// export const runtime = "nodejs";

// export async function POST(req: Request) {
//   try {
//     const {
//       clientName,
//       clientAddress,
//       startDate,
//       endDate,
//       fee,
//       targetSales,
//     } = await req.json();

//     // ✅ Use Arial.ttf
//     const fontPath = path.join(process.cwd(), "public/fonts/Arial.ttf");
//     if (!fs.existsSync(fontPath)) {
//       throw new Error("Font file not found at " + fontPath);
//     }

//     const buffers: Buffer[] = [];
//     const doc = new PDFDocument({
//       margin: 50,
//       font: fontPath,
//     });

//     doc.on("data", (chunk) => buffers.push(chunk));
//     doc.registerFont("Arial", fontPath);
//     doc.font("Arial");

//     // -------------------------
//     // AGREEMENT CONTENT
//     // -------------------------
//     doc.fontSize(20).text("SERVICE AGREEMENT", { align: "center" });
//     doc.moveDown(2);

//     doc.fontSize(12).text(
//       `This Agreement is made and entered into on this ${startDate} To ${endDate} Between
// Magic Scale Restaurant Consultant, a [Proprietorship] having its registered office at [Near Air Force Camp , Rajokari , 110038] 
// hereinafter referred to as "Consultant," represented by [Akash Verma as Sales Manager],
// AND
// ${clientName}, a [Proprietorship] having its registered office at ${clientAddress}.`
//     );

//     doc.moveDown();
//     doc.text(
//       `WHEREAS:
// The Client operates a restaurant known as ${clientName}. The Client desires to improve its business performance and has engaged the Consultant to provide consulting services. The Consultant has agreed to provide such services on the terms and conditions set forth herein.`
//     );

//     doc.moveDown();
//     doc.text(
//       "NOW, Therefore, in consideration of the mutual covenants and promises contained herein, the parties agree as follows:"
//     );

//     doc.moveDown();
//     doc.font("Arial-Bold").text("1. Growth Target:");
//     doc.font("Arial").text(
//       `The Consultant will assist the Client in achieving a sales target of ${targetSales} in Swiggy and Zomato Marketplace, compared to the previous month's sales figures. This target will be assessed based on the Client's reported sales data. The Consultant will provide recommendations and support to achieve this target. If food quality is not maintained, and customer complaints are high, then the Consultant is not responsible for the target.`
//     );
//     doc.text("ADS budget will be INR 1500 per week.");

//     doc.moveDown();
//     doc.font("Arial-Bold").text("2. One Month Account Handling Charges:");
//     doc.font("Arial").text(
//       `The Client agrees to pay the Consultant a one-month account handling fee of INR ${fee} (Seven Thousand Only).`
//     );

//     doc.moveDown();
//     doc.font("Arial-Bold").text("3. Term and Termination:");
//     doc.font("Arial").text(
//       `This Agreement shall be valid for a period commencing on ${startDate} and ending on ${endDate}. This agreement may be terminated by either party with 15 days written notice.`
//     );

//     doc.moveDown();
//     doc.font("Arial-Bold").text("4. Scope of Services:");
//     doc.font("Arial").text("The Consultant's services may include, but are not limited to:");
//     doc.list([
//       "Menu analysis and recommendations",
//       "Marketing and promotional strategies",
//       "Operational efficiency improvements",
//       "Cost control measures",
//     ]);
//     doc.text(
//       "The specific scope of services will be mutually agreed upon and may be adjusted from time to time based on the Client's needs and progress towards the growth target."
//     );

//     doc.moveDown();
//     doc.font("Arial-Bold").text("5. Confidentiality:");
//     doc.font("Arial").text(
//       "Both parties agree to keep confidential any and all information shared during the course of this engagement."
//     );

//     doc.moveDown();
//     doc.font("Arial-Bold").text("6. Entire Agreement:");
//     doc.font("Arial").text(
//       "This Agreement constitutes the entire understanding between the parties and supersedes all prior negotiations and agreements, whether written or oral."
//     );

//     doc.moveDown(2);
//     doc.font("Arial-Bold").text("Magic Scale Restaurant Consultant");
//     doc.text("By: Akash Verma, Manager");

//     doc.moveDown();
//     doc.font("Arial-Bold").text(`${clientName}`);
//     doc.text("By: Authorized Signatory");

//     // Footer contact block
//     doc.moveDown(2);
//     doc.fontSize(10).text("Magic Scale", { continued: true }).text(" ");
//     doc.text("Near Air Force Camp, Rajokari , 110038");
//     doc.text("+91 9311330885");
//     doc.text("https://magicscale.in");

//     doc.end();

//     await new Promise<void>((resolve) => doc.on("end", () => resolve()));

//     const pdfBytes = Buffer.concat(buffers);
//     const filename = `${clientName}-agreement.pdf`;

//     return new NextResponse(pdfBytes, {
//       headers: {
//         "Content-Type": "application/pdf",
//         "Content-Disposition": `attachment; filename="${filename}"`,
//       },
//     });
//   } catch (err) {
//     console.error("PDF generation failed:", err);
//     return NextResponse.json(
//       { error: "Failed to generate PDF", details: (err as Error).message },
//       { status: 500 }
//     );
//   }
// }



// // src/app/api/agreement/route.ts
// import { NextResponse } from "next/server";
// import PDFDocument from "pdfkit";
// import fs from "fs";
// import path from "path";
// import { Buffer } from "buffer";

// export const runtime = "nodejs";

// export async function POST(req: Request) {
//   try {
//     const {
//       clientName,
//       clientAddress,
//       startDate,
//       endDate,
//       fee,
//       targetSales,
//     } = await req.json();

//     // ✅ Fonts folder path
//     const fontsPath = path.join(process.cwd(), "public", "fonts");

//     const arialPath = path.join(fontsPath, "Arial.ttf");
//     const arialBoldPath = path.join(fontsPath, "Arial-Bold.ttf");

//     if (!fs.existsSync(arialPath)) {
//       throw new Error("Font file not found at " + arialPath);
//     }
//     if (!fs.existsSync(arialBoldPath)) {
//       throw new Error("Font file not found at " + arialBoldPath);
//     }

//     const buffers: Buffer[] = [];
//     const doc = new PDFDocument({
//       margin: 50,
//     });

//     doc.on("data", (chunk) => buffers.push(chunk));

//     // ✅ Register fonts
//     doc.registerFont("Arial", arialPath);
//     doc.registerFont("Arial-Bold", arialBoldPath);

//     // ✅ Set default font immediately (prevents Helvetica.afm error)
//     doc.font("Arial");

//     // -------------------------
//     // AGREEMENT CONTENT
//     // -------------------------
//     doc.font("Arial-Bold").fontSize(20).text("SERVICE AGREEMENT", {
//       align: "center",
//     });
//     doc.moveDown(2);

//     doc.font("Arial").fontSize(12).text(
//       `This Agreement is made and entered into on this ${startDate} To ${endDate} Between
// Magic Scale Restaurant Consultant, a [Proprietorship] having its registered office at [Near Air Force Camp , Rajokari , 110038] 
// hereinafter referred to as "Consultant," represented by [Akash Verma as Sales Manager],
// AND
// ${clientName}, a [Proprietorship] having its registered office at ${clientAddress}.`
//     );

//     doc.moveDown();
//     doc.text(
//       `WHEREAS:
// The Client operates a restaurant known as ${clientName}. The Client desires to improve its business performance and has engaged the Consultant to provide consulting services. The Consultant has agreed to provide such services on the terms and conditions set forth herein.`
//     );

//     doc.moveDown();
//     doc.text(
//       "NOW, Therefore, in consideration of the mutual covenants and promises contained herein, the parties agree as follows:"
//     );

//     // Section 1
//     doc.moveDown();
//     doc.font("Arial-Bold").text("1. Growth Target:");
//     doc.font("Arial").text(
//       `The Consultant will assist the Client in achieving a sales target of ${targetSales} in Swiggy and Zomato Marketplace, compared to the previous month's sales figures. This target will be assessed based on the Client's reported sales data. The Consultant will provide recommendations and support to achieve this target. If food quality is not maintained, and customer complaints are high, then the Consultant is not responsible for the target.`
//     );
//     doc.text("ADS budget will be INR 1500 per week.");

//     // Section 2
//     doc.moveDown();
//     doc.font("Arial-Bold").text("2. One Month Account Handling Charges:");
//     doc.font("Arial").text(
//       `The Client agrees to pay the Consultant a one-month account handling fee of INR ${fee} (Seven Thousand Only).`
//     );

//     // Section 3
//     doc.moveDown();
//     doc.font("Arial-Bold").text("3. Term and Termination:");
//     doc.font("Arial").text(
//       `This Agreement shall be valid for a period commencing on ${startDate} and ending on ${endDate}. This agreement may be terminated by either party with 15 days written notice.`
//     );

//     // Section 4
//     doc.moveDown();
//     doc.font("Arial-Bold").text("4. Scope of Services:");
//     doc.font("Arial").text("The Consultant's services may include, but are not limited to:");
//     doc.list([
//       "Menu analysis and recommendations",
//       "Marketing and promotional strategies",
//       "Operational efficiency improvements",
//       "Cost control measures",
//     ]);
//     doc.text(
//       "The specific scope of services will be mutually agreed upon and may be adjusted from time to time based on the Client's needs and progress towards the growth target."
//     );

//     // Section 5
//     doc.moveDown();
//     doc.font("Arial-Bold").text("5. Confidentiality:");
//     doc.font("Arial").text(
//       "Both parties agree to keep confidential any and all information shared during the course of this engagement."
//     );

//     // Section 6
//     doc.moveDown();
//     doc.font("Arial-Bold").text("6. Entire Agreement:");
//     doc.font("Arial").text(
//       "This Agreement constitutes the entire understanding between the parties and supersedes all prior negotiations and agreements, whether written or oral."
//     );

//     // Signature section
//     doc.moveDown(2);
//     doc.font("Arial-Bold").text("Magic Scale Restaurant Consultant");
//     doc.font("Arial").text("By: Akash Verma, Manager");

//     doc.moveDown();
//     doc.font("Arial-Bold").text(`${clientName}`);
//     doc.font("Arial").text("By: Authorized Signatory");

//     // Footer
//     doc.moveDown(2);
//     doc.fontSize(10).font("Arial-Bold").text("Magic Scale");
//     doc.font("Arial").text("Near Air Force Camp, Rajokari , 110038");
//     doc.text("+91 9311330885");
//     doc.text("https://magicscale.in");

//     doc.end();

//     await new Promise<void>((resolve) => doc.on("end", () => resolve()));

//     const pdfBytes = Buffer.concat(buffers);
//     const filename = `${clientName}-agreement.pdf`;

//     return new NextResponse(pdfBytes, {
//       headers: {
//         "Content-Type": "application/pdf",
//         "Content-Disposition": `attachment; filename="${filename}"`,
//       },
//     });
//   } catch (err) {
//     console.error("PDF generation failed:", err);
//     return NextResponse.json(
//       { error: "Failed to generate PDF", details: (err as Error).message },
//       { status: 500 }
//     );
//   }
// }







// // src/app/api/agreement/route.ts
// import { NextResponse } from "next/server";
// import PDFDocument from "pdfkit";
// import fs from "fs";
// import path from "path";
// import { Buffer } from "buffer";

// export const runtime = "nodejs";

// export async function POST(req: Request) {
//   try {
//     const { clientName, clientAddress, startDate, endDate, fee, targetSales } =
//       await req.json();

//     // ✅ Fonts folder path
//     const fontsPath = path.join(process.cwd(), "public", "fonts");
//     const arialPath = path.join(fontsPath, "Arial.ttf");
//     const arialBoldPath = path.join(fontsPath, "Arial-Bold.ttf");

//     if (!fs.existsSync(arialPath)) {
//       throw new Error("Font file not found at " + arialPath);
//     }
//     if (!fs.existsSync(arialBoldPath)) {
//       throw new Error("Font file not found at " + arialBoldPath);
//     }

//     const buffers: Buffer[] = [];

//     // ✅ Pass font in constructor to prevent default Helvetica.afm error
//     const doc = new PDFDocument({
//       margin: 50,
//       font: arialPath,
//     });

//     doc.on("data", (chunk) => buffers.push(chunk));

//     // ✅ Register both fonts
//     doc.registerFont("Arial", arialPath);
//     doc.registerFont("Arial-Bold", arialBoldPath);

//     // -------------------------
//     // AGREEMENT CONTENT
//     // -------------------------
//     doc.font("Arial-Bold").fontSize(20).text("SERVICE AGREEMENT", {
//       align: "center",
//     });
//     doc.moveDown(2);

//     doc.font("Arial").fontSize(12).text(
//       `This Agreement is made and entered into on this ${startDate} To ${endDate} Between
// Magic Scale Restaurant Consultant, a [Proprietorship] having its registered office at [Near Air Force Camp , Rajokari , 110038] 
// hereinafter referred to as "Consultant," represented by [Akash Verma as Sales Manager],
// AND
// ${clientName}, a [Proprietorship] having its registered office at ${clientAddress}.`
//     );

//     doc.moveDown();
//     doc.text(
//       `WHEREAS:
// The Client operates a restaurant known as ${clientName}. The Client desires to improve its business performance and has engaged the Consultant to provide consulting services. The Consultant has agreed to provide such services on the terms and conditions set forth herein.`
//     );

//     doc.moveDown();
//     doc.text(
//       "NOW, Therefore, in consideration of the mutual covenants and promises contained herein, the parties agree as follows:"
//     );

//     // Section 1
//     doc.moveDown();
//     doc.font("Arial-Bold").text("1. Growth Target:");
//     doc.font("Arial").text(
//       `The Consultant will assist the Client in achieving a sales target of ${targetSales} in Swiggy and Zomato Marketplace, compared to the previous month's sales figures. This target will be assessed based on the Client's reported sales data. The Consultant will provide recommendations and support to achieve this target. If food quality is not maintained, and customer complaints are high, then the Consultant is not responsible for the target.`
//     );
//     doc.text("ADS budget will be INR 1500 per week.");

//     // Section 2
//     doc.moveDown();
//     doc.font("Arial-Bold").text("2. One Month Account Handling Charges:");
//     doc.font("Arial").text(
//       `The Client agrees to pay the Consultant a one-month account handling fee of INR ${fee} (Seven Thousand Only).`
//     );

//     // Section 3
//     doc.moveDown();
//     doc.font("Arial-Bold").text("3. Term and Termination:");
//     doc.font("Arial").text(
//       `This Agreement shall be valid for a period commencing on ${startDate} and ending on ${endDate}. This agreement may be terminated by either party with 15 days written notice.`
//     );

//     // Section 4
//     doc.moveDown();
//     doc.font("Arial-Bold").text("4. Scope of Services:");
//     doc.font("Arial").text("The Consultant's services may include, but are not limited to:");
//     doc.list([
//       "Menu analysis and recommendations",
//       "Marketing and promotional strategies",
//       "Operational efficiency improvements",
//       "Cost control measures",
//     ]);
//     doc.text(
//       "The specific scope of services will be mutually agreed upon and may be adjusted from time to time based on the Client's needs and progress towards the growth target."
//     );

//     // Section 5
//     doc.moveDown();
//     doc.font("Arial-Bold").text("5. Confidentiality:");
//     doc.font("Arial").text(
//       "Both parties agree to keep confidential any and all information shared during the course of this engagement."
//     );

//     // Section 6
//     doc.moveDown();
//     doc.font("Arial-Bold").text("6. Entire Agreement:");
//     doc.font("Arial").text(
//       "This Agreement constitutes the entire understanding between the parties and supersedes all prior negotiations and agreements, whether written or oral."
//     );

//     // Signature section
//     doc.moveDown(2);
//     doc.font("Arial-Bold").text("Magic Scale Restaurant Consultant");
//     doc.font("Arial").text("By: Akash Verma, Manager");

//     doc.moveDown();
//     doc.font("Arial-Bold").text(`${clientName}`);
//     doc.font("Arial").text("By: Authorized Signatory");

//     // Footer
//     doc.moveDown(2);
//     doc.fontSize(10).font("Arial-Bold").text("Magic Scale");
//     doc.font("Arial").text("Near Air Force Camp, Rajokari , 110038");
//     doc.text("+91 9311330885");
//     doc.text("https://magicscale.in");

//     doc.end();

//     await new Promise<void>((resolve) => doc.on("end", () => resolve()));

//     const pdfBytes = Buffer.concat(buffers);
//     const filename = `${clientName}-agreement.pdf`;

//     return new NextResponse(pdfBytes, {
//       headers: {
//         "Content-Type": "application/pdf",
//         "Content-Disposition": `attachment; filename="${filename}"`,
//       },
//     });
//   } catch (err) {
//     console.error("PDF generation failed:", err);
//     return NextResponse.json(
//       { error: "Failed to generate PDF", details: (err as Error).message },
//       { status: 500 }
//     );
//   }
// }














// // src/app/api/agreement/route.ts
// import { NextResponse } from "next/server";
// import PDFDocument from "pdfkit";
// import fs from "fs";
// import path from "path";
// import { Buffer } from "buffer";

// export const runtime = "nodejs";

// export async function POST(req: Request) {
//   try {
//     const {
//       clientName,
//       clientAddress,
//       startDate,
//       endDate,
//       fee,
//       targetSales,
//     } = await req.json();

//     // ✅ Fonts
//     const fontsPath = path.join(process.cwd(), "public", "fonts");
//     const arialPath = path.join(fontsPath, "Arial.ttf");
//     const arialBoldPath = path.join(fontsPath, "Arial-Bold.ttf");

//     if (!fs.existsSync(arialPath) || !fs.existsSync(arialBoldPath)) {
//       throw new Error("Arial fonts missing in /public/fonts");
//     }

//     const buffers: Buffer[] = [];
//     const doc = new PDFDocument({ margin: 50, font: arialPath });
//     doc.on("data", (chunk) => buffers.push(chunk));
//     doc.on("end", () => console.log("PDF generated ✅"));

//     // Register fonts
//     doc.registerFont("Arial", arialPath);
//     doc.registerFont("Arial-Bold", arialBoldPath);

//     // ---------------- HEADER ----------------
//     doc.font("Arial-Bold").fontSize(22).text(clientName, { align: "center" });
//     doc.moveDown(1);
//     doc.font("Arial").fontSize(12).text(`[${clientName}]`, { align: "center" });
//     doc.moveDown(2);

//     // ---------------- AGREEMENT INTRO ----------------
//     doc.font("Arial").fontSize(12).text(
//       `This Agreement is made and entered into on this ${startDate} To ${endDate} Between
// Magic Scale Restaurant Consultant, a [Proprietorship] having its registered office at [Near Air Force Camp, Rajokari, 110038],
// hereinafter referred to as "Consultant," represented by [Akash Verma as Sales Manager],

// AND

// ${clientName}, a [Proprietorship] having its registered office at ${clientAddress}.`
//     );
//     doc.moveDown();

//     doc.text(
//       `WHEREAS: The Client operates a restaurant known as ${clientName}. The Client desires to improve its business performance and has engaged the Consultant to provide consulting services. The Consultant has agreed to provide such services on the terms and conditions set forth herein.`
//     );
//     doc.moveDown();
//     doc.text(
//       "NOW, Therefore, in consideration of the mutual covenants and promises contained herein, the parties agree as follows:"
//     );

//     // ---------------- SECTIONS ----------------
//     doc.moveDown(2);

//     // Section 1
//     doc.font("Arial-Bold").text("1. Growth Target:");
//     doc.font("Arial").text(
//       `The Consultant will assist the Client in achieving a sales target of ${targetSales} in Swiggy and Zomato Marketplace, compared to the previous month's sales figures. This target will be assessed based on the Client's reported sales data. The Consultant will provide recommendations and support to achieve this target. If food quality is not maintained, and customer complaints are high, then the Consultant is not responsible for the target.`
//     );
//     doc.text("ADS budget will be INR 1500 per week.");
//     doc.moveDown();

//     // Section 2
//     doc.font("Arial-Bold").text("2. One Month Account Handling Charges:");
//     doc.font("Arial").text(
//       `The Client agrees to pay the Consultant a one-month account handling fee of INR ${fee} (Seven Thousand Only).`
//     );
//     doc.moveDown();

//     // Section 3
//     doc.font("Arial-Bold").text("3. Term and Termination:");
//     doc.font("Arial").text(
//       `This Agreement shall be valid for a period commencing on ${startDate} and ending on ${endDate}. This agreement may be terminated by either party with 15 days written notice.`
//     );
//     doc.moveDown();

//     // Section 4
//     doc.font("Arial-Bold").text("4. Scope of Services:");
//     doc.font("Arial").text("The Consultant's services may include, but are not limited to:");
//     doc.list([
//       "Menu analysis and recommendations",
//       "Marketing and promotional strategies",
//       "Operational efficiency improvements",
//       "Cost control measures",
//     ]);
//     doc.text(
//       "The specific scope of services will be mutually agreed upon and may be adjusted from time to time based on the Client's needs and progress towards the growth target."
//     );
//     doc.moveDown();

//     // Section 5
//     doc.font("Arial-Bold").text("5. Confidentiality:");
//     doc.font("Arial").text(
//       "Both parties agree to keep confidential any and all information shared during the course of this engagement."
//     );
//     doc.moveDown();

//     // Section 6
//     doc.font("Arial-Bold").text("6. Entire Agreement:");
//     doc.font("Arial").text(
//       "This Agreement constitutes the entire understanding between the parties and supersedes all prior negotiations and agreements, whether written or oral."
//     );

//     // ---------------- SIGNATURES ----------------
//     doc.moveDown(3);
//     doc.font("Arial-Bold").text("Magic Scale Restaurant Consultant");
//     doc.font("Arial").text("By: Akash Verma, Manager");
//     doc.moveDown(2);
//     doc.font("Arial-Bold").text(clientName);
//     doc.font("Arial").text("By: Authorized Signatory");

//     // ---------------- FOOTER ----------------
//     doc.moveDown(3);
//     doc.fontSize(10).font("Arial-Bold").text("Magic Scale", { align: "center" });
//     doc.font("Arial").text("Near Air Force Camp, Rajokari, 110038", {
//       align: "center",
//     });
//     doc.text("+91 9311330885", { align: "center" });
//     doc.text("https://magicscale.in", { align: "center" });

//     // End PDF
//     doc.end();
//     await new Promise<void>((resolve) => doc.on("end", () => resolve()));

//     const pdfBytes = Buffer.concat(buffers);
//     const filename = `${clientName}-agreement.pdf`;

//     return new NextResponse(pdfBytes, {
//       headers: {
//         "Content-Type": "application/pdf",
//         "Content-Disposition": `attachment; filename="${filename}"`,
//       },
//     });
//   } catch (err) {
//     console.error("PDF generation failed:", err);
//     return NextResponse.json(
//       { error: "Failed to generate PDF", details: (err as Error).message },
//       { status: 500 }
//     );
//   }
// }




// // src/app/api/agreement/route.ts
// import { NextResponse } from "next/server";
// import PDFDocument from "pdfkit";
// import fs from "fs";
// import path from "path";
// import { Buffer } from "buffer";

// export const runtime = "nodejs";

// export async function POST(req: Request) {
//   try {
//     const { clientName, clientAddress, startDate, endDate, fee, targetSales } = await req.json();

//     // -------------------- FONT PATHS --------------------
//     const fontsPath = path.join(process.cwd(), "public", "fonts");
//     const arialPath = path.join(fontsPath, "Arial.ttf");
//     const arialBoldPath = path.join(fontsPath, "Arial-Bold.ttf");

//     if (!fs.existsSync(arialPath) || !fs.existsSync(arialBoldPath)) {
//       throw new Error("Arial fonts missing in /public/fonts");
//     }

//     // -------------------- PDF SETUP --------------------
//     const buffers: Buffer[] = [];
//     const doc = new PDFDocument({
//       margin: 50,
//       size: "A4",
//       font: arialPath, // ✅ Set custom font to avoid Helvetica error
//     });
//     doc.on("data", (chunk) => buffers.push(chunk));
//     doc.on("end", () => console.log("PDF generated ✅"));

//     // -------------------- REGISTER FONTS --------------------
//     doc.registerFont("Arial", arialPath);
//     doc.registerFont("Arial-Bold", arialBoldPath);
//     doc.font("Arial"); // default font

//     // -------------------- BACKGROUND COLOR --------------------
//     doc.rect(0, 0, doc.page.width, doc.page.height).fill("#f5f5f5"); // light gray background
//     doc.fillColor("black"); // reset text color

//     // -------------------- HEADER --------------------
//     doc.font("Arial-Bold").fontSize(22).text(clientName, { align: "center" });
//     doc.moveDown(1);
//     doc.font("Arial").fontSize(12).text(`[${clientName}]`, { align: "center" });
//     doc.moveDown(2);

//     // -------------------- AGREEMENT INTRO --------------------
//     doc.font("Arial").fontSize(12).text(
//       `This Agreement is made and entered into on this ${startDate} To ${endDate} Between
// Magic Scale Restaurant Consultant, a [Proprietorship] having its registered office at [Near Air Force Camp, Rajokari, 110038],
// hereinafter referred to as "Consultant," represented by [Akash Verma as Sales Manager],

// AND

// ${clientName}, a [Proprietorship] having its registered office at ${clientAddress}.`
//     );
//     doc.moveDown();

//     doc.text(
//       `WHEREAS: The Client operates a restaurant known as ${clientName}. The Client desires to improve its business performance and has engaged the Consultant to provide consulting services. The Consultant has agreed to provide such services on the terms and conditions set forth herein.`
//     );
//     doc.moveDown();
//     doc.text(
//       "NOW, Therefore, in consideration of the mutual covenants and promises contained herein, the parties agree as follows:"
//     );

//     // -------------------- SECTIONS --------------------
//     doc.moveDown(2);
//     doc.font("Arial-Bold").text("1. Growth Target:");
//     doc.font("Arial").text(
//       `The Consultant will assist the Client in achieving a sales target of ${targetSales} in Swiggy and Zomato Marketplace, compared to the previous month's sales figures. This target will be assessed based on the Client's reported sales data. The Consultant will provide recommendations and support to achieve this target. If food quality is not maintained, and customer complaints are high, then the Consultant is not responsible for the target.`
//     );
//     doc.text("ADS budget will be INR 1500 per week.");
//     doc.moveDown();

//     doc.font("Arial-Bold").text("2. One Month Account Handling Charges:");
//     doc.font("Arial").text(
//       `The Client agrees to pay the Consultant a one-month account handling fee of INR ${fee} (Seven Thousand Only).`
//     );
//     doc.moveDown();

//     doc.font("Arial-Bold").text("3. Term and Termination:");
//     doc.font("Arial").text(
//       `This Agreement shall be valid for a period commencing on ${startDate} and ending on ${endDate}. This agreement may be terminated by either party with 15 days written notice.`
//     );
//     doc.moveDown();

//     doc.font("Arial-Bold").text("4. Scope of Services:");
//     doc.font("Arial").text("The Consultant's services may include, but are not limited to:");
//     doc.list([
//       "Menu analysis and recommendations",
//       "Marketing and promotional strategies",
//       "Operational efficiency improvements",
//       "Cost control measures",
//     ]);
//     doc.text(
//       "The specific scope of services will be mutually agreed upon and may be adjusted from time to time based on the Client's needs and progress towards the growth target."
//     );
//     doc.moveDown();

//     doc.font("Arial-Bold").text("5. Confidentiality:");
//     doc.font("Arial").text(
//       "Both parties agree to keep confidential any and all information shared during the course of this engagement."
//     );
//     doc.moveDown();

//     doc.font("Arial-Bold").text("6. Entire Agreement:");
//     doc.font("Arial").text(
//       "This Agreement constitutes the entire understanding between the parties and supersedes all prior negotiations and agreements, whether written or oral."
//     );

//     // -------------------- SIGNATURES --------------------
//     doc.moveDown(3);
//     doc.font("Arial-Bold").text("Magic Scale Restaurant Consultant");
//     doc.font("Arial").text("By: Akash Verma, Manager");
//     doc.moveDown(2);
//     doc.font("Arial-Bold").text(clientName);
//     doc.font("Arial").text("By: Authorized Signatory");

//     // -------------------- FOOTER --------------------
//     doc.moveDown(3);
//     doc.fontSize(10).font("Arial-Bold").text("Magic Scale", { align: "center" });
//     doc.font("Arial").text("Near Air Force Camp, Rajokari, 110038", { align: "center" });
//     doc.text("+91 9311330885", { align: "center" });
//     doc.text("https://magicscale.in", { align: "center" });

//     doc.end();
//     await new Promise<void>((resolve) => doc.on("end", () => resolve()));

//     const pdfBytes = Buffer.concat(buffers);
//     const filename = `${clientName}-agreement.pdf`;

//     return new NextResponse(pdfBytes, {
//       headers: {
//         "Content-Type": "application/pdf",
//         "Content-Disposition": `attachment; filename="${filename}"`,
//       },
//     });
//   } catch (err) {
//     console.error("PDF generation failed:", err);
//     return NextResponse.json(
//       { error: "Failed to generate PDF", details: (err as Error).message },
//       { status: 500 }
//     );
//   }
// }





// // src/app/api/agreement/route.ts
// import { NextResponse } from "next/server";
// import PDFDocument from "pdfkit";
// import fs from "fs";
// import path from "path";
// import { Buffer } from "buffer";

// export const runtime = "nodejs";

// export async function POST(req: Request) {
//   try {
//     const { clientName, clientAddress, startDate, endDate, fee, targetSales } = await req.json();

//     // -------------------- FONT PATHS --------------------
//     const fontsPath = path.join(process.cwd(), "public", "fonts");
//     const merriweatherPath = path.join(fontsPath, "Merriweather-VariableFont_opsz,wdth,wght.ttf");
//     const merriweatherBoldPath = path.join(fontsPath, "Merriweather-Bold.ttf"); // optional bold

//     if (!fs.existsSync(merriweatherPath)) {
//       throw new Error("Merriweather font missing in /public/fonts");
//     }
//     if (!fs.existsSync(merriweatherBoldPath)) {
//       console.warn("Merriweather Bold font missing; headings will use default weight");
//     }

//     // -------------------- PDF SETUP --------------------
//     const buffers: Buffer[] = [];
//     const doc = new PDFDocument({ margin: 50, size: "A4" });
//     doc.on("data", (chunk) => buffers.push(chunk));
//     doc.on("end", () => console.log("PDF generated ✅"));

//     // -------------------- REGISTER FONTS --------------------
//     doc.registerFont("Merriweather", merriweatherPath);
//     if (fs.existsSync(merriweatherBoldPath)) {
//       doc.registerFont("Merriweather-Bold", merriweatherBoldPath);
//     }
//     doc.font("Merriweather"); // default font

//     // -------------------- BACKGROUND COLOR --------------------
//     doc.rect(0, 0, doc.page.width, doc.page.height).fill("#f5f5f5"); // light gray
//     doc.fillColor("black"); // reset text color

//     // -------------------- HEADER --------------------
//     doc.font("Merriweather-Bold").fontSize(22).text(clientName, { align: "center" });
//     doc.moveDown(1);
//     doc.font("Merriweather").fontSize(12).text(`[${clientName}]`, { align: "center" });
//     doc.moveDown(2);

//     // -------------------- AGREEMENT INTRO --------------------
//     doc.font("Merriweather").fontSize(12).text(
//       `This Agreement is made and entered into on this ${startDate} To ${endDate} Between
// Magic Scale Restaurant Consultant, a [Proprietorship] having its registered office at [Near Air Force Camp, Rajokari, 110038],
// hereinafter referred to as "Consultant," represented by [Akash Verma as Sales Manager],

// AND

// ${clientName}, a [Proprietorship] having its registered office at ${clientAddress}.`
//     );
//     doc.moveDown();

//     doc.text(
//       `WHEREAS: The Client operates a restaurant known as ${clientName}. The Client desires to improve its business performance and has engaged the Consultant to provide consulting services. The Consultant has agreed to provide such services on the terms and conditions set forth herein.`
//     );
//     doc.moveDown();
//     doc.text(
//       "NOW, Therefore, in consideration of the mutual covenants and promises contained herein, the parties agree as follows:"
//     );

//     // -------------------- SECTIONS --------------------
//     doc.moveDown(2);

//     doc.font("Merriweather-Bold").text("1. Growth Target:");
//     doc.font("Merriweather").text(
//       `The Consultant will assist the Client in achieving a sales target of ${targetSales} in Swiggy and Zomato Marketplace, compared to the previous month's sales figures. This target will be assessed based on the Client's reported sales data. The Consultant will provide recommendations and support to achieve this target. If food quality is not maintained, and customer complaints are high, then the Consultant is not responsible for the target.`
//     );
//     doc.text("ADS budget will be INR 1500 per week.");
//     doc.moveDown();

//     doc.font("Merriweather-Bold").text("2. One Month Account Handling Charges:");
//     doc.font("Merriweather").text(
//       `The Client agrees to pay the Consultant a one-month account handling fee of INR ${fee} (Seven Thousand Only).`
//     );
//     doc.moveDown();

//     doc.font("Merriweather-Bold").text("3. Term and Termination:");
//     doc.font("Merriweather").text(
//       `This Agreement shall be valid for a period commencing on ${startDate} and ending on ${endDate}. This agreement may be terminated by either party with 15 days written notice.`
//     );
//     doc.moveDown();

//     doc.font("Merriweather-Bold").text("4. Scope of Services:");
//     doc.font("Merriweather").text("The Consultant's services may include, but are not limited to:");
//     doc.list([
//       "Menu analysis and recommendations",
//       "Marketing and promotional strategies",
//       "Operational efficiency improvements",
//       "Cost control measures",
//     ]);
//     doc.text(
//       "The specific scope of services will be mutually agreed upon and may be adjusted from time to time based on the Client's needs and progress towards the growth target."
//     );
//     doc.moveDown();

//     doc.font("Merriweather-Bold").text("5. Confidentiality:");
//     doc.font("Merriweather").text(
//       "Both parties agree to keep confidential any and all information shared during the course of this engagement."
//     );
//     doc.moveDown();

//     doc.font("Merriweather-Bold").text("6. Entire Agreement:");
//     doc.font("Merriweather").text(
//       "This Agreement constitutes the entire understanding between the parties and supersedes all prior negotiations and agreements, whether written or oral."
//     );

//     // -------------------- SIGNATURES --------------------
//     doc.moveDown(3);
//     doc.font("Merriweather-Bold").text("Magic Scale Restaurant Consultant");
//     doc.font("Merriweather").text("By: Akash Verma, Manager");
//     doc.moveDown(2);
//     doc.font("Merriweather-Bold").text(clientName);
//     doc.font("Merriweather").text("By: Authorized Signatory");

//     // -------------------- FOOTER --------------------
//     doc.moveDown(3);
//     doc.fontSize(10).font("Merriweather-Bold").text("Magic Scale", { align: "center" });
//     doc.font("Merriweather").text("Near Air Force Camp, Rajokari, 110038", { align: "center" });
//     doc.text("+91 9311330885", { align: "center" });
//     doc.text("https://magicscale.in", { align: "center" });

//     // -------------------- END PDF --------------------
//     doc.end();
//     await new Promise<void>((resolve) => doc.on("end", () => resolve()));

//     const pdfBytes = Buffer.concat(buffers);
//     const filename = `${clientName}-agreement.pdf`;

//     return new NextResponse(pdfBytes, {
//       headers: {
//         "Content-Type": "application/pdf",
//         "Content-Disposition": `attachment; filename="${filename}"`,
//       },
//     });
//   } catch (err) {
//     console.error("PDF generation failed:", err);
//     return NextResponse.json(
//       { error: "Failed to generate PDF", details: (err as Error).message },
//       { status: 500 }
//     );
//   }
// }




// // src/app/api/agreement/route.ts
// import { NextResponse } from "next/server";
// import PDFDocument from "pdfkit";
// import fs from "fs";
// import path from "path";

// export const runtime = "nodejs";

// export async function POST(req: Request) {
//   try {
//     const { clientName, clientAddress, startDate, endDate, fee, targetSales } =
//       await req.json();

//     // -------------------- FONT PATHS --------------------
//     const fontsPath = path.join(process.cwd(), "public", "fonts");
//     const regularFont = path.join(fontsPath, "Merriweather-Regular.ttf");
//     const boldFont = path.join(fontsPath, "Merriweather-Bold.ttf");

//     if (!fs.existsSync(regularFont) || !fs.existsSync(boldFont)) {
//       throw new Error("Merriweather fonts missing in /public/fonts");
//     }

//     // -------------------- PDF SETUP --------------------
//     const buffers: Buffer[] = [];
//     const doc = new PDFDocument({ margin: 50, size: "A4" }); // no font here
//     doc.on("data", (chunk: Buffer) => buffers.push(chunk));
//     doc.on("end", () => console.log("PDF generated ✅"));

//     // -------------------- REGISTER FONTS --------------------
//     doc.registerFont("Regular", regularFont);
//     doc.registerFont("Bold", boldFont);
//     doc.font("Regular"); // default font

//     // -------------------- BACKGROUND --------------------
//     doc.rect(0, 0, doc.page.width, doc.page.height).fill("#f5f5f5");
//     doc.fillColor("black");

//     // -------------------- HEADER --------------------
//     doc.font("Bold").fontSize(22).text(clientName, { align: "center" });
//     doc.moveDown(1);
//     doc.font("Regular").fontSize(12).text(`[${clientName}]`, { align: "center" });
//     doc.moveDown(2);

//     // -------------------- AGREEMENT BODY --------------------
//     doc.font("Regular").text(
//       `This Agreement is made and entered into on this ${startDate} To ${endDate} Between
// Magic Scale Restaurant Consultant, a [Proprietorship] having its registered office at [Near Air Force Camp, Rajokari, 110038],
// hereinafter referred to as "Consultant," represented by [Akash Verma as Sales Manager],

// AND

// ${clientName}, a [Proprietorship] having its registered office at ${clientAddress}.`
//     );
//     doc.moveDown();
//     doc.text(
//       `WHEREAS: The Client operates a restaurant known as ${clientName}. The Client desires to improve its business performance and has engaged the Consultant to provide consulting services. The Consultant has agreed to provide such services on the terms and conditions set forth herein.`
//     );
//     doc.moveDown();
//     doc.text(
//       "NOW, Therefore, in consideration of the mutual covenants and promises contained herein, the parties agree as follows:"
//     );
//     doc.moveDown(2);

//     // -------------------- SECTIONS --------------------
//     doc.font("Bold").text("1. Growth Target:");
//     doc.font("Regular").text(
//       `The Consultant will assist the Client in achieving a sales target of ${targetSales} in Swiggy and Zomato Marketplace, compared to the previous month's sales figures. This target will be assessed based on the Client's reported sales data. The Consultant will provide recommendations and support to achieve this target. If food quality is not maintained, and customer complaints are high, then the Consultant is not responsible for the target.`
//     );
//     doc.text("ADS budget will be INR 1500 per week.");
//     doc.moveDown();

//     doc.font("Bold").text("2. One Month Account Handling Charges:");
//     doc.font("Regular").text(
//       `The Client agrees to pay the Consultant a one-month account handling fee of INR ${fee} (Seven Thousand Only).`
//     );
//     doc.moveDown();

//     doc.font("Bold").text("3. Term and Termination:");
//     doc.font("Regular").text(
//       `This Agreement shall be valid for a period commencing on ${startDate} and ending on ${endDate}. This agreement may be terminated by either party with 15 days written notice.`
//     );
//     doc.moveDown();

//     doc.font("Bold").text("4. Scope of Services:");
//     doc.font("Regular").text("The Consultant's services may include, but are not limited to:");
//     doc.list([
//       "Menu analysis and recommendations",
//       "Marketing and promotional strategies",
//       "Operational efficiency improvements",
//       "Cost control measures",
//     ]);
//     doc.text(
//       "The specific scope of services will be mutually agreed upon and may be adjusted from time to time based on the Client's needs and progress towards the growth target."
//     );
//     doc.moveDown();

//     doc.font("Bold").text("5. Confidentiality:");
//     doc.font("Regular").text(
//       "Both parties agree to keep confidential any and all information shared during the course of this engagement."
//     );
//     doc.moveDown();

//     doc.font("Bold").text("6. Entire Agreement:");
//     doc.font("Regular").text(
//       "This Agreement constitutes the entire understanding between the parties and supersedes all prior negotiations and agreements, whether written or oral."
//     );

//     // -------------------- SIGNATURES --------------------
//     doc.moveDown(3);
//     doc.font("Bold").text("Magic Scale Restaurant Consultant");
//     doc.font("Regular").text("By: Akash Verma, Manager");
//     doc.moveDown(2);
//     doc.font("Bold").text(clientName);
//     doc.font("Regular").text("By: Authorized Signatory");

//     // -------------------- FOOTER --------------------
//     doc.moveDown(3);
//     doc.font("Bold").fontSize(10).text("Magic Scale", { align: "center" });
//     doc.font("Regular").text("Near Air Force Camp, Rajokari, 110038", { align: "center" });
//     doc.text("+91 9311330885", { align: "center" });
//     doc.text("https://magicscale.in", { align: "center" });

//     doc.end();
//     await new Promise<void>((resolve) => doc.on("end", () => resolve()));

//     const pdfBytes = Buffer.concat(buffers);
//     const filename = `${clientName}-agreement.pdf`;

//     return new NextResponse(pdfBytes, {
//       headers: {
//         "Content-Type": "application/pdf",
//         "Content-Disposition": `attachment; filename="${filename}"`,
//       },
//     });
//   } catch (err) {
//     console.error("PDF generation failed:", err);
//     return NextResponse.json(
//       { error: "Failed to generate PDF", details: (err as Error).message },
//       { status: 500 }
//     );
//   }
// }








// // src/app/api/agreement/route.ts
// import { NextResponse } from "next/server";
// import fs from "fs";
// import path from "path";

// export const runtime = "nodejs";

// export async function POST(req: Request) {
//   try {
//     const { clientName, clientAddress, startDate, endDate, fee, targetSales } = await req.json();

//     // -------------------- FONT PATHS --------------------
//     const fontsPath = path.join(process.cwd(), "public", "fonts");
//     const regularFont = path.join(fontsPath, "Merriweather-Regular.ttf");
//     const boldFont = path.join(fontsPath, "Merriweather-Bold.ttf");

//     if (!fs.existsSync(regularFont) || !fs.existsSync(boldFont)) {
//       throw new Error("Merriweather fonts missing in /public/fonts");
//     }

//     // -------------------- DYNAMIC IMPORT OF COMMONJS PDFKIT --------------------
//     const PDFKitModule = await import("pdfkit"); 
//     const PDFDocument = PDFKitModule.default || PDFKitModule; // ✅ get constructor

//     // -------------------- PDF SETUP --------------------
//     const doc = new PDFDocument({ margin: 50, size: "A4" }); // do not set font here
//     const buffers: Buffer[] = [];
//     doc.on("data", (chunk: Buffer) => buffers.push(chunk));
//     doc.on("end", () => console.log("PDF generated ✅"));

//     // -------------------- REGISTER FONTS --------------------
//     doc.registerFont("Regular", regularFont);
//     doc.registerFont("Bold", boldFont);
//     doc.font("Regular"); // default font

//     // -------------------- BACKGROUND --------------------
//     doc.rect(0, 0, doc.page.width, doc.page.height).fill("#f5f5f5");
//     doc.fillColor("black");

//     // -------------------- HEADER --------------------
//     doc.font("Bold").fontSize(22).text(clientName, { align: "center" });
//     doc.moveDown(1);
//     doc.font("Regular").fontSize(12).text(`[${clientName}]`, { align: "center" });
//     doc.moveDown(2);

//     // -------------------- BODY --------------------
//     doc.text(
//       `This Agreement is made and entered into on this ${startDate} To ${endDate} Between
// Magic Scale Restaurant Consultant, a [Proprietorship] having its registered office at [Near Air Force Camp, Rajokari, 110038],
// hereinafter referred to as "Consultant," represented by [Akash Verma as Sales Manager],

// AND

// ${clientName}, a [Proprietorship] having its registered office at ${clientAddress}.`
//     );
//     doc.moveDown();
//     doc.text(
//       `WHEREAS: The Client operates a restaurant known as ${clientName}. The Client desires to improve its business performance and has engaged the Consultant to provide consulting services. The Consultant has agreed to provide such services on the terms and conditions set forth herein.`
//     );
//     doc.moveDown();
//     doc.text("NOW, Therefore, in consideration of the mutual covenants and promises contained herein, the parties agree as follows:");
//     doc.moveDown(2);

//     // -------------------- SECTIONS --------------------
//     doc.font("Bold").text("1. Growth Target:");
//     doc.font("Regular").text(
//       `The Consultant will assist the Client in achieving a sales target of ${targetSales} in Swiggy and Zomato Marketplace, compared to the previous month's sales figures. This target will be assessed based on the Client's reported sales data. The Consultant will provide recommendations and support to achieve this target. If food quality is not maintained, and customer complaints are high, then the Consultant is not responsible for the target.`
//     );
//     doc.text("ADS budget will be INR 1500 per week.");
//     doc.moveDown();

//     doc.font("Bold").text("2. One Month Account Handling Charges:");
//     doc.font("Regular").text(`The Client agrees to pay the Consultant a one-month account handling fee of INR ${fee} (Seven Thousand Only).`);
//     doc.moveDown();

//     doc.font("Bold").text("3. Term and Termination:");
//     doc.font("Regular").text(`This Agreement shall be valid for a period commencing on ${startDate} and ending on ${endDate}. This agreement may be terminated by either party with 15 days written notice.`);
//     doc.moveDown();

//     doc.font("Bold").text("4. Scope of Services:");
//     doc.font("Regular").text("The Consultant's services may include, but are not limited to:");
//     doc.list([
//       "Menu analysis and recommendations",
//       "Marketing and promotional strategies",
//       "Operational efficiency improvements",
//       "Cost control measures",
//     ]);
//     doc.text(
//       "The specific scope of services will be mutually agreed upon and may be adjusted from time to time based on the Client's needs and progress towards the growth target."
//     );
//     doc.moveDown();

//     doc.font("Bold").text("5. Confidentiality:");
//     doc.font("Regular").text("Both parties agree to keep confidential any and all information shared during the course of this engagement.");
//     doc.moveDown();

//     doc.font("Bold").text("6. Entire Agreement:");
//     doc.font("Regular").text("This Agreement constitutes the entire understanding between the parties and supersedes all prior negotiations and agreements, whether written or oral.");

//     // -------------------- SIGNATURES --------------------
//     doc.moveDown(3);
//     doc.font("Bold").text("Magic Scale Restaurant Consultant");
//     doc.font("Regular").text("By: Akash Verma, Manager");
//     doc.moveDown(2);
//     doc.font("Bold").text(clientName);
//     doc.font("Regular").text("By: Authorized Signatory");

//     // -------------------- FOOTER --------------------
//     doc.moveDown(3);
//     doc.font("Bold").fontSize(10).text("Magic Scale", { align: "center" });
//     doc.font("Regular").text("Near Air Force Camp, Rajokari, 110038", { align: "center" });
//     doc.text("+91 9311330885", { align: "center" });
//     doc.text("https://magicscale.in", { align: "center" });

//     doc.end();
//     await new Promise<void>((resolve) => doc.on("end", () => resolve()));

//     const pdfBytes = Buffer.concat(buffers);
//     const filename = `${clientName}-agreement.pdf`;

//     return new NextResponse(pdfBytes, {
//       headers: {
//         "Content-Type": "application/pdf",
//         "Content-Disposition": `attachment; filename="${filename}"`,
//       },
//     });
//   } catch (err) {
//     console.error("PDF generation failed:", err);
//     return NextResponse.json(
//       { error: "Failed to generate PDF", details: (err as Error).message },
//       { status: 500 }
//     );
//   }
// }























// // src/app/api/agreement/route.ts
// import { NextResponse } from "next/server";
// import PDFDocument from "pdfkit";
// import fs from "fs";
// import path from "path";
// import { Buffer } from "buffer";

// export const runtime = "nodejs";

// export async function POST(req: Request) {
//   try {
//     const { clientName, clientAddress, startDate, endDate, fee, targetSales } =
//       await req.json();

//     // -------------------- FONT PATHS --------------------
//     const fontsPath = path.join(process.cwd(), "public", "fonts");
//     const arialPath = path.join(fontsPath, "Arial.ttf");
//     const arialBoldPath = path.join(fontsPath, "Arial-Bold.ttf");

//     if (!fs.existsSync(arialPath) || !fs.existsSync(arialBoldPath)) {
//       throw new Error("Arial fonts missing in /public/fonts");
//     }

//     // -------------------- LOGO PATH --------------------
//     const logoPath = path.join(process.cwd(), "public", "logo.png");
//     const logoExists = fs.existsSync(logoPath);

//     // -------------------- PDF SETUP --------------------
//     const buffers: Buffer[] = [];
//     const doc = new PDFDocument({
//       margin: 60, // ✅ ensures equal margins on all sides
//       size: "A4",
//       font: arialPath,
//       bufferPages: true,
//     });

//     doc.on("data", (chunk) => buffers.push(chunk));
//     const finished = new Promise<void>((resolve) =>
//       doc.on("end", () => resolve())
//     );

//     // -------------------- REGISTER FONTS --------------------
//     doc.registerFont("Arial", arialPath);
//     doc.registerFont("Arial-Bold", arialBoldPath);

//     // -------------------- AGREEMENT DATE --------------------
//     const today = new Date();
//     const agreementDate = today.toLocaleDateString("en-GB", {
//       day: "2-digit",
//       month: "long",
//       year: "numeric",
//     });

//     // -------------------- HEADER FUNCTION --------------------
//     const renderHeader = () => {
//       const margin = doc.page.margins.left;

//       // Left side: Logo + Client Name
//       if (logoExists) {
//         doc.image(logoPath, margin, 30, { width: 70 });
//       }
//       doc.font("Arial-Bold")
//         .fontSize(12)
//         .fillColor("#0B3D91")
//         .text(clientName, margin, 110, { width: 200 });

//       // Right side: Company info
//       const rightX = doc.page.width - doc.page.margins.right - 200;
//       doc.font("Arial-Bold").fontSize(11).fillColor("#0B3D91")
//         .text("Magic Scale", rightX, 40, { align: "right", width: 200 });
//       doc.font("Arial").fontSize(10).fillColor("black")
//         .text("Near Air Force Camp, Rajokari, 110038", rightX, 55, {
//           align: "right",
//           width: 200,
//         });
//       doc.text("+91 8826073117", rightX, 70, { align: "right", width: 200 });
//       doc.fillColor("blue")
//         .text("https://magicscale.in", rightX, 85, {
//           align: "right",
//           width: 200,
//           link: "https://magicscale.in",
//         });

//       // Horizontal line separator
//       doc.moveTo(margin, 140).lineTo(doc.page.width - margin, 140).stroke("#0B3D91");

//       // Agreement Date centered below header
//       doc.font("Arial").fontSize(10).fillColor("gray")
//         .text(`Agreement created on: ${agreementDate}`, 0, 150, {
//           align: "center",
//           width: doc.page.width,
//         });

//       // ✅ Reset Y position after header
//       doc.y = 180;
//     };

//     // -------------------- RENDER HEADER ON FIRST PAGE --------------------
//     renderHeader();

//     // -------------------- MAIN TITLE --------------------
//     doc.moveDown(1);
//     doc.font("Arial-Bold")
//       .fontSize(24)
//       .fillColor("#0B3D91")
//       .text("SERVICE AGREEMENT", { align: "center" });
//     doc.moveDown(2);

//     // -------------------- CLIENT INFO --------------------
//     const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

//     doc.font("Arial").fontSize(12).fillColor("black");
//     doc.text("This Agreement is made and entered into on this ", doc.page.margins.left, doc.y, {
//       continued: true,
//       width: contentWidth,
//     });
//     doc.fillColor("#FF0000").font("Arial-Bold").text(`${startDate}`, { continued: true });
//     doc.font("Arial").fillColor("black").text(" To ", { continued: true });
//     doc.fillColor("#FF0000").font("Arial-Bold").text(`${endDate}`);
//     doc.moveDown(0.5);

//     doc.text("Between:", { underline: true, width: contentWidth });
//     doc.moveDown(0.3);

//     doc.font("Arial-Bold").fillColor("#0B3D91").text("Magic Scale Restaurant Consultant", {
//       width: contentWidth,
//     });
//     doc.font("Arial").fillColor("black").text(
//       "A Proprietorship having its registered office at Near Air Force Camp, Rajokari, 110038. Represented by Akash Verma as Sales Manager.",
//       { indent: 20, width: contentWidth }
//     );
//     doc.moveDown(0.5);

//     doc.font("Arial-Bold").fillColor("#0B3D91").text(clientName, { width: contentWidth });
//     doc.font("Arial").fillColor("black").text(
//       `A Proprietorship having its registered office at ${clientAddress}.`,
//       { indent: 20, width: contentWidth }
//     );
//     doc.moveDown(1);

//     // -------------------- WHEREAS --------------------
//     doc.font("Arial-Bold").fillColor("#0B3D91").fontSize(14).text("WHEREAS:", {
//       width: contentWidth,
//     });
//     doc.moveDown(0.3);
//     doc.font("Arial").fillColor("black").fontSize(12).text(
//       `The Client operates a restaurant known as ${clientName}. The Client desires to improve its business performance and has engaged the Consultant to provide consulting services. The Consultant has agreed to provide such services on the terms and conditions set forth herein.`,
//       { indent: 20, width: contentWidth, lineGap: 2 }
//     );
//     doc.moveDown(0.3);
//     doc.font("Arial-Bold").text(
//       "NOW, Therefore, in consideration of the mutual covenants and promises contained herein, the parties agree as follows:",
//       { indent: 0, width: contentWidth, lineGap: 2 }
//     );
//     doc.moveDown(1);

//     // -------------------- CLAUSE HELPER --------------------
//     const addClause = (title: string, content: string, highlight = false) => {
//       if (doc.y > doc.page.height - 180) {
//         doc.addPage();
//         renderHeader();
//       }

//       doc.moveDown(0.8);

//       doc.font("Arial-Bold").fillColor("#0B3D91").fontSize(14).text(title, {
//         width: contentWidth,
//         align: "left",
//       });
//       doc.moveDown(0.2);

//       if (highlight) {
//         const boxY = doc.y;
//         const boxHeight = doc.heightOfString(content, { width: contentWidth - 20 });

//         doc.rect(doc.page.margins.left, boxY - 2, contentWidth, boxHeight + 12).fill("#f7f7f7");
//         doc.fillColor("black").font("Arial").fontSize(12).text(content, doc.page.margins.left + 10, boxY + 4, {
//           width: contentWidth - 20,
//           align: "justify",
//           lineGap: 3,
//         });
//         doc.moveDown(1.2);
//       } else {
//         doc.fillColor("black").font("Arial").fontSize(12).text(content, {
//           width: contentWidth,
//           align: "justify",
//           lineGap: 3,
//         });
//       }
//     };

//     // -------------------- CLAUSES --------------------
//     addClause(
//       "1. Growth Target:",
//       `The Consultant will assist the Client in achieving a sales target of ${targetSales} in Swiggy and Zomato Marketplace, compared to the previous month's sales figures. ADS budget will be INR 1500 per week. Important: Food quality must be maintained; Consultant is not responsible if complaints are high.`,
//       true
//     );

    
//      addClause(
//       "                     2. One Month Account Handling Charges:",
//       `The Client agrees to pay the Consultant a one-month account handling fee of INR ${fee}.`,
//       true
//     );

//     addClause(
//       "3. Term and Termination:",
//       `This Agreement shall be valid for a period commencing on ${startDate} and ending on ${endDate}. Termination by either party requires 15 days written notice.`
//     );


//     addClause(
//       "4. Scope of Services:",
//       `Consultant services include:\n- Menu analysis and recommendations\n- Marketing and promotional strategies\n- Operational efficiency improvements\n- Cost control measures`
//     );

//     addClause(
//       "5. Confidentiality:",
//       `Both parties agree to keep all shared information confidential.`
//     );

//     addClause(
//       "6. Entire Agreement:",
//       `This Agreement constitutes the entire understanding between the parties and supersedes all prior negotiations and agreements.`
//     );

//     // -------------------- SIGNATURES --------------------
//     doc.moveDown(2);
//     doc.font("Arial-Bold").text("Magic Scale Restaurant Consultant", {
//       width: contentWidth,
//     });
//     doc.font("Arial").text("By: Akash Verma, Manager");

//     doc.moveDown(2);
//     doc.font("Arial-Bold").text(clientName, { width: contentWidth });
//     doc.font("Arial").text("By: Authorized Signatory");

//     // -------------------- FOOTER: PAGE NUMBERS --------------------
//     const pages = doc.bufferedPageRange();
//     for (let i = 0; i < pages.count; i++) {
//       doc.switchToPage(i);
//       renderHeader();
//       doc.font("Arial").fontSize(10).fillColor("gray");
//       doc.text(
//         `Page ${i + 1} of ${pages.count}`,
//         doc.page.margins.left,
//         doc.page.height - 50,
//         {
//           align: "center",
//           width: contentWidth,
//         }
//       );
//     }

//     // -------------------- END PDF --------------------
//     doc.end();
//     await finished;

//     const pdfBytes = Buffer.concat(buffers);
//     const filename = `${clientName}-agreement.pdf`;

//     return new NextResponse(pdfBytes, {
//       headers: {
//         "Content-Type": "application/pdf",
//         "Content-Disposition": `attachment; filename="${filename}"`,
//       },
//     });
//   } catch (err) {
//     console.error("Failed to create PDF document:", err);
//     return NextResponse.json(
//       { error: "Failed to generate PDF", details: (err as Error).message },
//       { status: 500 }
//     );
//   }
// }







// // src/app/api/agreement/route.ts
// import { NextResponse } from "next/server";
// import PDFDocument from "pdfkit";
// import fs from "fs";
// import path from "path";
// import { Buffer } from "buffer";

// export const runtime = "nodejs";

// export async function POST(req: Request) {
//   try {
//     const { clientName, clientAddress, startDate, endDate, fee, targetSales } = await req.json();

//     // -------------------- FONT PATHS --------------------
//     const fontsPath = path.join(process.cwd(), "public", "fonts");
//     const arialPath = path.join(fontsPath, "Arial.ttf");
//     const arialBoldPath = path.join(fontsPath, "Arial-Bold.ttf");

//     if (!fs.existsSync(arialPath) || !fs.existsSync(arialBoldPath)) {
//       throw new Error("Arial fonts missing in /public/fonts");
//     }

//     // -------------------- LOGO & ICON PATHS --------------------
//     const logoPath = path.join(process.cwd(), "public/logo.png");
//     const growthIcon = path.join(process.cwd(), "src/assets/icons/growth.png");
//     const feeIcon = path.join(process.cwd(), "src/assets/icons/fee.png");
//     const calendarIcon = path.join(process.cwd(), "src/assets/icons/calendar.png");

//     const logoExists = fs.existsSync(logoPath);
//     const growthExists = fs.existsSync(growthIcon);
//     const feeExists = fs.existsSync(feeIcon);
//     const calendarExists = fs.existsSync(calendarIcon);

//     // -------------------- PDF SETUP --------------------
//     const buffers: Buffer[] = [];
//     const doc = new PDFDocument({
//       margin: 60,
//       size: "A4",
//       bufferPages: true,
//       font: arialPath,
//     });

//     doc.registerFont("Arial", arialPath);
//     doc.registerFont("Arial-Bold", arialBoldPath);

//     doc.on("data", (chunk) => buffers.push(chunk));
//     const finished = new Promise<void>((resolve) => doc.on("end", () => resolve()));

//     const today = new Date();
//     const agreementDate = today.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

//     // -------------------- HEADER --------------------
//     const renderHeader = () => {
//       const margin = doc.page.margins.left;
//       let logoHeight = 0;

//       // Logo - Increased size
//       if (logoExists) {
//         logoHeight = 90; // new height
//         doc.image(logoPath, margin, 30, { width: 90, height: logoHeight });
//       }

//       // Customer name below logo, centered with respect to logo
//       doc.font("Arial-Bold").fontSize(16).fillColor("#0B3D91");
//       const nameWidth = doc.widthOfString(clientName);
//       doc.text(clientName, margin + (90 - nameWidth) / 2, 30 + logoHeight + 10);

//       // Right side: Company info
//       const rightX = doc.page.width - doc.page.margins.right - 200;
//       doc.font("Arial-Bold").fontSize(12).fillColor("#0B3D91")
//         .text("Magic Scale", rightX, 40, { align: "right", width: 200 });
//       doc.font("Arial").fontSize(10).fillColor("black")
//         .text("Near Air Force Camp, Rajokari, 110038", rightX, 60, { align: "right" });
//       doc.text("+91 8826073117", rightX, 75, { align: "right" });
//       doc.fillColor("blue")
//         .text("https://magicscale.in", rightX, 90, { align: "right", link: "https://magicscale.in" });

//       // Colored line
//       doc.moveTo(margin, 140).lineTo(doc.page.width - margin, 140).lineWidth(2).stroke("#0B3D91");

//       // Agreement date
//       doc.font("Arial").fontSize(10).fillColor("gray")
//         .text(`Agreement created on: ${agreementDate}`, 0, 150, { align: "center" });

//       doc.y = 180;
//     };

//     renderHeader();

//     // -------------------- TITLE --------------------
//     doc.moveDown(1);
//     doc.font("Arial-Bold").fontSize(26).fillColor("#0B3D91")
//       .text("SERVICE AGREEMENT", { align: "center" });
//     doc.moveDown(2);

//     const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

//     // Intro
//     doc.font("Arial").fontSize(12).fillColor("black");
//     doc.text("This Agreement is made and entered into on this ", doc.page.margins.left, doc.y, { continued: true });
//     if (calendarExists) doc.image(calendarIcon, doc.x, doc.y - 3, { width: 12 });
//     doc.fillColor("#FF0000").font("Arial-Bold").text(`${startDate}`, { continued: true });
//     doc.font("Arial").fillColor("black").text(" To ", { continued: true });
//     doc.fillColor("#FF0000").font("Arial-Bold").text(`${endDate}`);
//     doc.moveDown(0.5);

//     doc.font("Arial-Bold").fillColor("#0B3D91").text("Between:", { underline: true, width: contentWidth });
//     doc.moveDown(0.3);

//     doc.font("Arial-Bold").fillColor("#0B3D91").text("Magic Scale Restaurant Consultant");
//     doc.font("Arial").fillColor("black").text(
//       "A Proprietorship having its registered office at Near Air Force Camp, Rajokari, 110038. Represented by Akash Verma as Sales Manager.",
//       { indent: 20, lineGap: 2 }
//     );
//     doc.moveDown(0.5);

//     doc.font("Arial-Bold").fillColor("#0B3D91").text(clientName);
//     doc.font("Arial").fillColor("black").text(`A Proprietorship having its registered office at ${clientAddress}.`, { indent: 20, lineGap: 2 });
//     doc.moveDown(1);

//     doc.font("Arial-Bold").fillColor("#0B3D91").fontSize(14).text("WHEREAS:");
//     doc.moveDown(0.3);
//     doc.font("Arial").fillColor("black").fontSize(12).text(
//       `The Client operates a restaurant known as ${clientName}. The Client desires to improve its business performance and has engaged the Consultant to provide consulting services. The Consultant has agreed to provide such services on the terms and conditions set forth herein.`,
//       { indent: 20, lineGap: 2 }
//     );
//     doc.moveDown(0.3);
//     doc.font("Arial-Bold").text(
//       "NOW, Therefore, in consideration of the mutual covenants and promises contained herein, the parties agree as follows:",
//       { indent: 0, lineGap: 2 }
//     );
//     doc.moveDown(1);

//     // -------------------- CLAUSES WITH ICONS --------------------
//     const addClauseWithIcon = (iconPath: string | null, title: string, content: string, highlight = false) => {
//       if (doc.y > doc.page.height - 180) { doc.addPage(); renderHeader(); }
//       doc.moveDown(0.8);

//       // Draw icon
//       if (iconPath && fs.existsSync(iconPath)) {
//         doc.image(iconPath, doc.page.margins.left, doc.y, { width: 14, height: 14 });
//         doc.font("Arial-Bold").fillColor("#0B3D91").fontSize(14)
//           .text(`  ${title}`, doc.page.margins.left + 18, doc.y - 2);
//       } else {
//         doc.font("Arial-Bold").fillColor("#0B3D91").fontSize(14)
//           .text(`📌 ${title}`, doc.page.margins.left);
//       }

//       doc.moveDown(0.2);

//       if (highlight) {
//         const boxY = doc.y;
//         const boxHeight = doc.heightOfString(content, { width: contentWidth - 20 });
//         doc.roundedRect(doc.page.margins.left, boxY - 4, contentWidth, boxHeight + 12, 4).fill("#f7f7f7");
//         doc.fillColor("black").font("Arial").fontSize(12)
//            .text(content, doc.page.margins.left + 10, boxY + 4, { width: contentWidth - 20, align: "justify", lineGap: 3 });
//         doc.moveDown(1.2);
//       } else {
//         doc.fillColor("black").font("Arial").fontSize(12)
//            .text(content, { width: contentWidth, align: "justify", lineGap: 3 });
//       }
//     };

//     addClauseWithIcon(growthExists ? growthIcon : null, "1. Growth Target:", `The Consultant will assist the Client in achieving a sales target of ${targetSales} in Swiggy and Zomato Marketplace, compared to the previous month's sales figures. ADS budget will be INR 1500 per week. Important: Food quality must be maintained; Consultant is not responsible if complaints are high.`, true);
//     addClauseWithIcon(feeExists ? feeIcon : null, "2. One Month Account Handling Charges:", `The Client agrees to pay the Consultant a one-month account handling fee of INR ${fee}.`, true);
//     addClauseWithIcon(null, "3. Term and Termination:", `This Agreement shall be valid for a period commencing on ${startDate} and ending on ${endDate}. Termination by either party requires 15 days written notice.`);
//     addClauseWithIcon(null, "4. Scope of Services:", `Consultant services include:\n- Menu analysis and recommendations\n- Marketing and promotional strategies\n- Operational efficiency improvements\n- Cost control measures`);
//     addClauseWithIcon(null, "5. Confidentiality:", `Both parties agree to keep all shared information confidential.`);
//     addClauseWithIcon(null, "6. Entire Agreement:", `This Agreement constitutes the entire understanding between the parties and supersedes all prior negotiations and agreements.`);

//     // -------------------- SIGNATURES --------------------
//     doc.moveDown(2);
//     doc.font("Arial-Bold").text("Magic Scale Restaurant Consultant");
//     doc.font("Arial").text("By: Akash Verma, Manager");
//     doc.moveDown(2);
//     doc.font("Arial-Bold").text(clientName);
//     doc.font("Arial").text("By: Authorized Signatory");

//     // -------------------- FOOTER --------------------
//     const pages = doc.bufferedPageRange();
//     for (let i = 0; i < pages.count; i++) {
//       doc.switchToPage(i);
//       doc.font("Arial").fontSize(10).fillColor("gray")
//         .text(`Page ${i + 1} of ${pages.count}`, doc.page.margins.left, doc.page.height - 50, { align: "center", width: contentWidth });
//     }

//     doc.end();
//     await finished;

//     const pdfBytes = Buffer.concat(buffers);
//     const filename = `${clientName}-agreement.pdf`;
//     return new NextResponse(pdfBytes, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${filename}"` } });

//   } catch (err) {
//     console.error("Failed to create PDF document:", err);
//     return NextResponse.json({ error: "Failed to generate PDF", details: (err as Error).message }, { status: 500 });
//   }
// }





















// // src/app/api/agreement/route.ts
// import { NextResponse } from "next/server";
// import PDFDocument from "pdfkit";
// import fs from "fs";
// import path from "path";
// import { Buffer } from "buffer";

// export const runtime = "nodejs";

// export async function POST(req: Request) {
//   try {
//     const { clientName, clientAddress, startDate, endDate, fee, targetSales } = await req.json();

//     // -------------------- FONT PATHS --------------------
//     const fontsPath = path.join(process.cwd(), "public/fonts");
//     const arialPath = path.join(fontsPath, "Arial.ttf");
//     const arialBoldPath = path.join(fontsPath, "Arial-Bold.ttf");

//     if (!fs.existsSync(arialPath) || !fs.existsSync(arialBoldPath)) {
//       throw new Error("Arial fonts missing in /public/fonts");
//     }

//     // -------------------- LOGO & ICON PATHS --------------------
//     const logoPath = path.join(process.cwd(), "public/logo.png");
//     const growthIcon = path.join(process.cwd(), "src/assets/icons/growth.png");
//     const feeIcon = path.join(process.cwd(), "src/assets/icons/fee.png");
//     const calendarIcon = path.join(process.cwd(), "src/assets/icons/calendar.png");
//     const defaultIcon = path.join(process.cwd(), "src/assets/icons/bullet.png"); // default icon for all other clauses
//     const backgroundPath = path.join(process.cwd(), "public/bg.png"); // background image

//     const logoExists = fs.existsSync(logoPath);
//     const growthExists = fs.existsSync(growthIcon);
//     const feeExists = fs.existsSync(feeIcon);
//     const calendarExists = fs.existsSync(calendarIcon);
//     const defaultExists = fs.existsSync(defaultIcon);
//     const backgroundExists = fs.existsSync(backgroundPath);

//     // -------------------- PDF SETUP --------------------
//     const buffers: Buffer[] = [];
//     const doc = new PDFDocument({
//       margin: 60,
//       size: "A4",
//       bufferPages: true,
//       font: arialPath,
//     });

//     doc.registerFont("Arial", arialPath);
//     doc.registerFont("Arial-Bold", arialBoldPath);

//     doc.on("data", (chunk) => buffers.push(chunk));
//     const finished = new Promise<void>((resolve) => doc.on("end", () => resolve()));

//     const today = new Date();
//     const agreementDate = today.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
//     const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

//     // -------------------- HEADER --------------------
//     const renderHeader = () => {
//       const margin = doc.page.margins.left;
//       let logoHeight = 0;

//       if (backgroundExists) {
//         doc.image(backgroundPath, 0, 0, { width: doc.page.width, height: doc.page.height });
//       }

//       if (logoExists) {
//         logoHeight = 90;
//         doc.image(logoPath, margin, 30, { width: 90, height: logoHeight });
//       }

//       const rightX = doc.page.width - doc.page.margins.right - 200;
//       doc.font("Arial-Bold").fontSize(12).fillColor("#0B3D91")
//         .text("Magic Scale", rightX, 40, { align: "right", width: 200 });
//       doc.font("Arial").fontSize(10).fillColor("black")
//         .text("Near Air Force Camp, Rajokari, 110038", rightX, 60, { align: "right" });
//       doc.text("+91 8826073117", rightX, 75, { align: "right" });
//       doc.fillColor("blue")
//         .text("https://magicscale.in", rightX, 90, { align: "right", link: "https://magicscale.in" });

//       doc.moveTo(margin, 140).lineTo(doc.page.width - margin, 140).lineWidth(2).stroke("#0B3D91");

//       // Customer Name slightly right and more above line
//       doc.font("Arial-Bold").fontSize(16).fillColor("#0B3D91");
//       doc.text(clientName, margin + 40, 110); // 40px right, 30px above line

//       // Agreement date centered below
//       doc.font("Arial").fontSize(10).fillColor("gray")
//         .text(`Agreement created on: ${agreementDate}`, 0, 150, { align: "center" });

//       doc.y = 180;
//     };

//     // -------------------- CLAUSES --------------------
//     const addClauseWithIcon = (iconPath: string, title: string, content: string, highlight = false) => {
//       if (doc.y > doc.page.height - 180) { 
//         doc.addPage(); 
//         renderHeader(); 
//       }
//       doc.moveDown(0.8);

//       if (fs.existsSync(iconPath)) {
//         doc.image(iconPath, doc.page.margins.left, doc.y, { width: 14, height: 14 });
//         doc.font("Arial-Bold").fillColor("#0B3D91").fontSize(14)
//           .text(`  ${title}`, doc.page.margins.left + 18, doc.y - 2);
//       } else {
//         doc.font("Arial-Bold").fillColor("#0B3D91").fontSize(14)
//           .text(`📌 ${title}`, doc.page.margins.left);
//       }

//       doc.moveDown(0.2);

//       if (highlight) {
//         const boxY = doc.y;
//         const boxHeight = doc.heightOfString(content, { width: contentWidth - 20 });
//         doc.roundedRect(doc.page.margins.left, boxY - 4, contentWidth, boxHeight + 12, 4).fill("#f7f7f7");
//         doc.fillColor("black").font("Arial").fontSize(12)
//           .text(content, doc.page.margins.left + 10, boxY + 4, { width: contentWidth - 20, align: "justify", lineGap: 3 });
//         doc.moveDown(1.2);
//       } else {
//         doc.fillColor("black").font("Arial").fontSize(12)
//           .text(content, { width: contentWidth, align: "justify", lineGap: 3 });
//       }
//     };

//     // -------------------- BUILD PDF --------------------
//     renderHeader();

//     doc.moveDown(1);
//     doc.font("Arial-Bold").fontSize(26).fillColor("#0B3D91").text("SERVICE AGREEMENT", { align: "center" });
//     doc.moveDown(2);

//     // Intro
//     doc.font("Arial").fontSize(12).fillColor("black");
//     doc.text("This Agreement is made and entered into on this ", doc.page.margins.left, doc.y, { continued: true });
//     if (calendarExists) doc.image(calendarIcon, doc.x, doc.y - 3, { width: 12 });
//     doc.fillColor("#FF0000").font("Arial-Bold").text(`${startDate}`, { continued: true });
//     doc.font("Arial").fillColor("black").text(" To ", { continued: true });
//     doc.fillColor("#FF0000").font("Arial-Bold").text(`${endDate}`);
//     doc.moveDown(0.5);

//     doc.font("Arial-Bold").fillColor("#0B3D91").text("Between:", { underline: true, width: contentWidth });
//     doc.moveDown(0.3);

//     doc.font("Arial-Bold").fillColor("#0B3D91").text("Magic Scale Restaurant Consultant");
//     doc.font("Arial").fillColor("black").text(
//       "A Proprietorship having its registered office at Near Air Force Camp, Rajokari, 110038. Represented by Akash Verma as Sales Manager.",
//       { indent: 20, lineGap: 2 }
//     );
//     doc.moveDown(0.5);

//     doc.font("Arial-Bold").fillColor("#0B3D91").text(clientName);
//     doc.font("Arial").fillColor("black").text(`A Proprietorship having its registered office at ${clientAddress}.`, { indent: 20, lineGap: 2 });
//     doc.moveDown(1);

//     doc.font("Arial-Bold").fillColor("#0B3D91").fontSize(14).text("WHEREAS:");
//     doc.moveDown(0.3);
//     doc.font("Arial").fillColor("black").fontSize(12).text(
//       `The Client operates a restaurant known as ${clientName}. The Client desires to improve its business performance and has engaged the Consultant to provide consulting services. The Consultant has agreed to provide such services on the terms and conditions set forth herein.`,
//       { indent: 20, lineGap: 2 }
//     );
//     doc.moveDown(0.3);
//     doc.font("Arial-Bold").text(
//       "NOW, Therefore, in consideration of the mutual covenants and promises contained herein, the parties agree as follows:",
//       { indent: 0, lineGap: 2 }
//     );
//     doc.moveDown(1);

//     // -------------------- CLAUSES WITH ICONS --------------------
//     addClauseWithIcon(growthExists ? growthIcon : defaultIcon, "1. Growth Target:", `The Consultant will assist the Client in achieving a sales target of ${targetSales} in Swiggy and Zomato Marketplace, compared to the previous month's sales figures. ADS budget will be INR 1500 per week. Important: Food quality must be maintained; Consultant is not responsible if complaints are high.`, true);

//     addClauseWithIcon(feeExists ? feeIcon : defaultIcon, "2. One Month Account Handling Charges:", `The Client agrees to pay the Consultant a one-month account handling fee of INR ${fee}.`, true);

//     addClauseWithIcon(defaultIcon, "3. Term and Termination:", `This Agreement shall be valid for a period commencing on ${startDate} and ending on ${endDate}. Termination by either party requires 15 days written notice.`);

//     addClauseWithIcon(defaultIcon, "4. Scope of Services:", `Consultant services include:\n- Menu analysis and recommendations\n- Marketing and promotional strategies\n- Operational efficiency improvements\n- Cost control measures`);

//     addClauseWithIcon(defaultIcon, "5. Confidentiality:", `Both parties agree to keep all shared information confidential.`);

//     addClauseWithIcon(defaultIcon, "6. Entire Agreement:", `This Agreement constitutes the entire understanding between the parties and supersedes all prior negotiations and agreements.`);

//     // Signatures
//     doc.moveDown(2);
//     doc.font("Arial-Bold").text("Magic Scale Restaurant Consultant");
//     doc.font("Arial").text("By: Akash Verma, Manager");
//     doc.moveDown(2);
//     doc.font("Arial-Bold").text(clientName);
//     doc.font("Arial").text("By: Authorized Signatory");

//     // Footer
//     const pages = doc.bufferedPageRange();
//     for (let i = 0; i < pages.count; i++) {
//       doc.switchToPage(i);
//       doc.font("Arial").fontSize(10).fillColor("gray")
//         .text(`Page ${i + 1} of ${pages.count}`, doc.page.margins.left, doc.page.height - 50, { align: "center", width: contentWidth });
//     }

//     doc.end();
//     await finished;

//     const pdfBytes = Buffer.concat(buffers);
//     const filename = `${clientName}-agreement.pdf`;
//     return new NextResponse(pdfBytes, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${filename}"` } });

//   } catch (err) {
//     console.error("Failed to create PDF document:", err);
//     return NextResponse.json({ error: "Failed to generate PDF", details: (err as Error).message }, { status: 500 });
//   }
// }



















// src/app/api/agreement/route.ts
import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { Buffer } from "buffer";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { clientName, clientAddress, startDate, endDate, fee, targetSales } = await req.json();

    // -------------------- FONT PATHS --------------------
    const fontsPath = path.join(process.cwd(), "public/fonts");
    const arialPath = path.join(fontsPath, "Arial.ttf");
    const arialBoldPath = path.join(fontsPath, "Arial-Bold.ttf");

    if (!fs.existsSync(arialPath) || !fs.existsSync(arialBoldPath)) {
      throw new Error("Arial fonts missing in /public/fonts");
    }

    // -------------------- LOGO & ICON PATHS --------------------
    const logoPath = path.join(process.cwd(), "public/logo.png");
    const calendarIcon = path.join(process.cwd(), "src/assets/icons/calendar.png"); // for date
    const backgroundPath = path.join(process.cwd(), "public/bg.png");

    // Clause icons (unique for each clause)
    const clauseIcons = [
      path.join(process.cwd(), "src/assets/icons/growth.png"),   // 1. Growth Target
      path.join(process.cwd(), "src/assets/icons/fee.png"),      // 2. Fee
      path.join(process.cwd(), "src/assets/icons/term.png"),     // 3. Term & Termination
      path.join(process.cwd(), "src/assets/icons/scope.png"),    // 4. Scope of Services
      path.join(process.cwd(), "src/assets/icons/confidentiality.png"), // 5. Confidentiality
      path.join(process.cwd(), "src/assets/icons/entire.png"),   // 6. Entire Agreement
    ];

    const logoExists = fs.existsSync(logoPath);
    const calendarExists = fs.existsSync(calendarIcon);
    const backgroundExists = fs.existsSync(backgroundPath);
    const clauseExists = clauseIcons.map(icon => fs.existsSync(icon));

    // -------------------- PDF SETUP --------------------
    const buffers: Buffer[] = [];
    const doc = new PDFDocument({
      margin: 60,
      size: "A4",
      bufferPages: true,
      font: arialPath,
    });

    doc.registerFont("Arial", arialPath);
    doc.registerFont("Arial-Bold", arialBoldPath);

    doc.on("data", (chunk) => buffers.push(chunk));
    const finished = new Promise<void>((resolve) => doc.on("end", () => resolve()));

    const today = new Date();
    const agreementDate = today.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
    const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    // -------------------- HEADER --------------------
    const renderHeader = () => {
      const margin = doc.page.margins.left;
      let logoHeight = 0;

      if (backgroundExists) {
        doc.image(backgroundPath, 0, 0, { width: doc.page.width, height: doc.page.height });
      }

      if (logoExists) {
        logoHeight = 90;
        doc.image(logoPath, margin, 30, { width: 90, height: logoHeight });
      }

      const rightX = doc.page.width - doc.page.margins.right - 200;
      doc.font("Arial-Bold").fontSize(12).fillColor("#0B3D91")
        .text("Magic Scale", rightX, 40, { align: "right", width: 200 });
      doc.font("Arial").fontSize(10).fillColor("black")
        .text("Near Air Force Camp, Rajokari, 110038", rightX, 60, { align: "right" });
      doc.text("+91 8826073117", rightX, 75, { align: "right" });
      doc.fillColor("blue")
        .text("https://magicscale.in", rightX, 90, { align: "right", link: "https://magicscale.in" });

      doc.moveTo(margin, 140).lineTo(doc.page.width - margin, 140).lineWidth(2).stroke("#0B3D91");

      doc.font("Arial-Bold").fontSize(16).fillColor("#0B3D91");
      doc.text(clientName, margin + 40, 110);
      doc.font("Arial").fontSize(10).fillColor("gray")
        .text(`Agreement created on: ${agreementDate}`, 0, 150, { align: "center" });

      doc.y = 180;
    };

    // -------------------- CLAUSES --------------------
    const addClauseWithIcon = (iconPath: string, title: string, content: string, highlight = false) => {
      if (doc.y > doc.page.height - 180) { 
        doc.addPage(); 
        renderHeader(); 
      }
      doc.moveDown(0.8);

      if (fs.existsSync(iconPath)) {
        doc.image(iconPath, doc.page.margins.left, doc.y, { width: 14, height: 14 });
        doc.font("Arial-Bold").fillColor("#0B3D91").fontSize(14)
          .text(`  ${title}`, doc.page.margins.left + 18, doc.y - 2);
      } else {
        doc.font("Arial-Bold").fillColor("#0B3D91").fontSize(14)
          .text(`📌 ${title}`, doc.page.margins.left);
      }

      doc.moveDown(0.2);

      if (highlight) {
        const boxY = doc.y;
        const boxHeight = doc.heightOfString(content, { width: contentWidth - 20 });
        doc.roundedRect(doc.page.margins.left, boxY - 4, contentWidth, boxHeight + 12, 4).fill("#f7f7f7");
        doc.fillColor("black").font("Arial").fontSize(12)
          .text(content, doc.page.margins.left + 10, boxY + 4, { width: contentWidth - 20, align: "justify", lineGap: 3 });
        doc.moveDown(1.2);
      } else {
        doc.fillColor("black").font("Arial").fontSize(12)
          .text(content, { width: contentWidth, align: "justify", lineGap: 3 });
      }
    };

    // -------------------- BUILD PDF --------------------
    renderHeader();

    doc.moveDown(1);
    doc.font("Arial-Bold").fontSize(26).fillColor("#0B3D91").text("SERVICE AGREEMENT", { align: "center" });
    doc.moveDown(2);

    // Intro
    doc.font("Arial").fontSize(12).fillColor("black");
    doc.text("This Agreement is made and entered into on this ", doc.page.margins.left, doc.y, { continued: true });
    if (calendarExists) doc.image(calendarIcon, doc.x, doc.y - 3, { width: 12 });
    doc.fillColor("#FF0000").font("Arial-Bold").text(`${startDate}`, { continued: true });
    doc.font("Arial").fillColor("black").text(" To ", { continued: true });
    doc.fillColor("#FF0000").font("Arial-Bold").text(`${endDate}`);
    doc.moveDown(0.5);

    doc.font("Arial-Bold").fillColor("#0B3D91").text("Between:", { underline: true, width: contentWidth });
    doc.moveDown(0.3);

    doc.font("Arial-Bold").fillColor("#0B3D91").text("Magic Scale Restaurant Consultant");
    doc.font("Arial").fillColor("black").text(
      "A Proprietorship having its registered office at Near Air Force Camp, Rajokari, 110038. Represented by Akash Verma as Sales Manager.",
      { indent: 20, lineGap: 2 }
    );
    doc.moveDown(0.5);

    doc.font("Arial-Bold").fillColor("#0B3D91").text(clientName);
    doc.font("Arial").fillColor("black").text(`A Proprietorship having its registered office at ${clientAddress}.`, { indent: 20, lineGap: 2 });
    doc.moveDown(1);

    doc.font("Arial-Bold").fillColor("#0B3D91").fontSize(14).text("WHEREAS:");
    doc.moveDown(0.3);
    doc.font("Arial").fillColor("black").fontSize(12).text(
      `The Client operates a restaurant known as ${clientName}. The Client desires to improve its business performance and has engaged the Consultant to provide consulting services. The Consultant has agreed to provide such services on the terms and conditions set forth herein.`,
      { indent: 20, lineGap: 2 }
    );
    doc.moveDown(0.3);
    doc.font("Arial-Bold").text(
      "NOW, Therefore, in consideration of the mutual covenants and promises contained herein, the parties agree as follows:",
      { indent: 0, lineGap: 2 }
    );
    doc.moveDown(1);

    // -------------------- CLAUSES WITH UNIQUE ICONS --------------------
    addClauseWithIcon(clauseExists[0] ? clauseIcons[0] : "", "1. Growth Target:", `The Consultant will assist the Client in achieving a sales target of ${targetSales} in Swiggy and Zomato Marketplace, compared to the previous month's sales figures. ADS budget will be INR 1500 per week. Important: Food quality must be maintained; Consultant is not responsible if complaints are high.`, true);

    addClauseWithIcon(clauseExists[1] ? clauseIcons[1] : "", "2. One Month Account Handling Charges:", `The Client agrees to pay the Consultant a one-month account handling fee of INR ${fee}.`, true);

    addClauseWithIcon(clauseExists[2] ? clauseIcons[2] : "", "3. Term and Termination:", `This Agreement shall be valid for a period commencing on ${startDate} and ending on ${endDate}. Termination by either party requires 15 days written notice.`);

    addClauseWithIcon(clauseExists[3] ? clauseIcons[3] : "", "4. Scope of Services:", `Consultant services include:\n- Menu analysis and recommendations\n- Marketing and promotional strategies\n- Operational efficiency improvements\n- Cost control measures`);

    addClauseWithIcon(clauseExists[4] ? clauseIcons[4] : "", "5. Confidentiality:", `Both parties agree to keep all shared information confidential.`);

    addClauseWithIcon(clauseExists[5] ? clauseIcons[5] : "", "6. Entire Agreement:", `This Agreement constitutes the entire understanding between the parties and supersedes all prior negotiations and agreements.`);

    // Signatures
    doc.moveDown(2);
    doc.font("Arial-Bold").text("Magic Scale Restaurant Consultant");
    doc.font("Arial").text("By: Akash Verma, Manager");
    doc.moveDown(2);
    doc.font("Arial-Bold").text(clientName);
    doc.font("Arial").text("By: Authorized Signatory");

    // Footer
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.font("Arial").fontSize(10).fillColor("gray")
        .text(`Page ${i + 1} of ${pages.count}`, doc.page.margins.left, doc.page.height - 50, { align: "center", width: contentWidth });
    }

    doc.end();
    await finished;

    const pdfBytes = Buffer.concat(buffers);
    const filename = `${clientName}-agreement.pdf`;
    return new NextResponse(pdfBytes, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${filename}"` } });

  } catch (err) {
    console.error("Failed to create PDF document:", err);
    return NextResponse.json({ error: "Failed to generate PDF", details: (err as Error).message }, { status: 500 });
  }
}
