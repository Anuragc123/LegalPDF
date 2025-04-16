import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generatedDocuments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { jsPDF } from "jspdf";

// Initialize S3 client
const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
  },
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } =await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const documentId = Number.parseInt(params.id);
    if (isNaN(documentId)) {
      return new NextResponse("Invalid document ID", { status: 400 });
    }

    // Get document from database
    const documents = await db
      .select()
      .from(generatedDocuments)
      .where(eq(generatedDocuments.id, documentId));

    if (documents.length === 0) {
      return new NextResponse("Document not found", { status: 404 });
    }

    const document = documents[0];

    // Check if user owns the document
    if (document.userId !== userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get updated data from request
    const { documentName, content } = await req.json();

    if (!documentName || !content) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Create updated PDF
    const pdfBuffer = await createPDF(content, documentName);

    // Upload to S3 (reuse the same key to overwrite)
    const url = new URL(document.documentUrl);
    const s3Key = url.pathname.substring(1); // Remove leading slash

    const uploadParams = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: s3Key,
      Body: pdfBuffer,
      ContentType: "application/pdf",
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    // Update document in database
    await db
      .update(generatedDocuments)
      .set({
        documentName,
        content,
      })
      .where(eq(generatedDocuments.id, documentId));

    return NextResponse.json({
      success: true,
      documentId,
      documentName,
    });
  } catch (error) {
    console.error("[DOCUMENT_UPDATE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

async function createPDF(
  markdownContent: string,
  title: string
): Promise<Buffer> {
  // Create a new jsPDF instance
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Set title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(title, doc.internal.pageSize.getWidth() / 2, 20, {
    align: "center",
  });

  // Parse markdown and add to PDF
  const lines = markdownContent.split("\n");
  let y = 30; // Starting y position after title
  const pageHeight = doc.internal.pageSize.getHeight();
  const lineHeight = 7; // Default line height

  for (const line of lines) {
    // Check if we need a new page
    if (y > pageHeight - 20) {
      doc.addPage();
      y = 20; // Reset y position on new page
    }

    // Handle headings
    if (line.startsWith("# ")) {
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(line.substring(2).trim(), 20, y);
      y += lineHeight + 3;
    } else if (line.startsWith("## ")) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(line.substring(3).trim(), 20, y);
      y += lineHeight + 2;
    } else if (line.startsWith("### ")) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(line.substring(4).trim(), 20, y);
      y += lineHeight + 1;
    }
    // Handle lists
    else if (line.match(/^\d+\.\s/)) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(line, 20, y);
      y += lineHeight;
    }
    // Handle bold and italic text (simplified approach)
    else {
      let text = line;

      // Replace markdown with plain text (we can't easily do mixed formatting in jsPDF)
      text = text.replace(/\*\*(.*?)\*\*/g, "$1"); // Remove bold markers
      text = text.replace(/\*(.*?)\*/g, "$1"); // Remove italic markers

      if (text.trim()) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");

        // Split long lines to fit page width
        const textWidth =
          (doc.getStringUnitWidth(text) * 12) / doc.internal.scaleFactor;
        const pageWidth = doc.internal.pageSize.getWidth() - 40; // 20mm margins on each side

        if (textWidth > pageWidth) {
          const splitText = doc.splitTextToSize(text, pageWidth);
          doc.text(splitText, 20, y);
          y += lineHeight * splitText.length;
        } else {
          doc.text(text, 20, y);
          y += lineHeight;
        }
      } else {
        y += lineHeight / 2; // Empty line
      }
    }
  }

  // Add signature blocks if it's a legal document
  if (title.includes("Agreement") || title.includes("NDA")) {
    // Check if we need a new page for signatures
    if (y > pageHeight - 60) {
      doc.addPage();
      y = 20;
    } else {
      y += 20; // Add some space before signatures
    }

    // First signature block
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.line(20, y, 90, y);
    y += 5;
    doc.text("Signature", 20, y);
    y += 15;

    doc.line(20, y, 90, y);
    y += 5;
    doc.text("Print Name", 20, y);
    y += 15;

    doc.line(20, y, 90, y);
    y += 5;
    doc.text("Date", 20, y);

    // Second signature block
    y -= 40; // Reset to align with first signature block
    doc.line(110, y, 180, y);
    y += 5;
    doc.text("Signature", 110, y);
    y += 15;

    doc.line(110, y, 180, y);
    y += 5;
    doc.text("Print Name", 110, y);
    y += 15;

    doc.line(110, y, 180, y);
    y += 5;
    doc.text("Date", 110, y);
  }

  // Convert to buffer
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  return pdfBuffer;
}
