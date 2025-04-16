import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/db";
import { checkSubscription } from "@/lib/subscription";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { generatedDocuments } from "@/lib/db/schema";
import { jsPDF } from "jspdf";
import { eq } from "drizzle-orm";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Initialize S3 client
const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const isPro = await checkSubscription();
    if (!isPro) {
      return new NextResponse("Pro subscription required", { status: 403 });
    }

    const { documentType, formData } = await req.json();

    // Generate document content using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = generatePromptForDocument(documentType, formData);
    const systemPrompt = `You are a legal document assistant. Generate a professional, legally-formatted document based on the provided information. Format the document with proper sections, headings, and legal language. Use markdown formatting for structure: use # for main headings, ## for subheadings, **bold** for important terms, *italic* for emphasis, and numbered lists where appropriate. Make sure to format the document professionally with proper legal structure.Dont mention anything about sample agreement.`;

    const result = await model.generateContent([
      { text: systemPrompt + "\n\n" + prompt },
    ]);

    const documentContent = result.response.text();

    // Create a document name
    const documentName = generateDocumentName(documentType, formData);
    const fileName = `${documentName}.pdf`;

    // Convert markdown to PDF
    const pdfBuffer = await createPDF(documentContent, documentName);

    // Upload to S3
    const s3Key = `generated-documents/${userId}/${fileName}`;
    const uploadParams = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: s3Key,
      Body: pdfBuffer,
      ContentType: "application/pdf",
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    // Generate the S3 URL
    const documentUrl = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.ap-south-1.amazonaws.com/${s3Key}`;

    // Store document reference in database
    await db.insert(generatedDocuments).values({
      userId,
      documentType,
      documentName,
      documentUrl,
      content: documentContent, // Store the raw content for editing
    });

    return NextResponse.json({
      success: true,
      documentUrl,
      documentName,
      documentId: (
        await db
          .select()
          .from(generatedDocuments)
          .where(eq(generatedDocuments.documentUrl,documentUrl))
      )[0].id,
    });
  } catch (error) {
    console.error("[DOCUMENT_GENERATION_ERROR]", error);
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

function generatePromptForDocument(
  documentType: string,
  formData: any
): string {
  switch (documentType) {
    case "agreement":
      return `
        Create a legal agreement with the following details:
        
        Title: ${formData.title}
        Effective Date: ${formData.effectiveDate}
        
        First Party: ${formData.firstPartyName}
        First Party Address: ${formData.firstPartyAddress}
        
        Second Party: ${formData.secondPartyName}
        Second Party Address: ${formData.secondPartyAddress}
        
        Agreement Terms: ${formData.agreementTerms}
        
        Termination Conditions: ${formData.terminationConditions}
        
        Governing Law: ${formData.governingLaw}
        
        Format this as a professional legal agreement with appropriate sections, clauses, and signature blocks.
      `;

    case "will":
      const assetsText = formData.assets
        .map(
          (asset: any) =>
            `Asset: ${asset.description}, Beneficiary: ${asset.beneficiary}`
        )
        .join("\n");

      return `
        Create a Last Will and Testament with the following details:
        
        Testator: ${formData.fullName}
        Address: ${formData.address}
        
        Executor: ${formData.executorName}
        Executor Address: ${formData.executorAddress}
        
        Alternate Executor: ${
          formData.alternateExecutorName || "None specified"
        }
        Alternate Executor Address: ${
          formData.alternateExecutorAddress || "None specified"
        }
        
        Specific Bequests:
        ${assetsText}
        
        Residual Beneficiary: ${formData.residualBeneficiary}
        
        Special Instructions: ${
          formData.specialInstructions || "None specified"
        }
        
        Format this as a professional Last Will and Testament with appropriate sections, clauses, and signature blocks.
      `;

    case "poa":
      const powersText = Object.entries(formData.powers)
        .filter(([_, value]) => value)
        .map(([key]) => {
          const readableKey = key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase());
          return readableKey;
        })
        .join(", ");

      return `
        Create a Power of Attorney document with the following details:
        
        Principal: ${formData.principalName}
        Principal Address: ${formData.principalAddress}
        
        Agent: ${formData.agentName}
        Agent Address: ${formData.agentAddress}
        
        Alternate Agent: ${formData.alternateAgentName || "None specified"}
        Alternate Agent Address: ${
          formData.alternateAgentAddress || "None specified"
        }
        
        Effective Date: ${formData.effectiveDate}
        Expiration Date: ${formData.expirationDate || "None specified"}
        
        Powers Granted: ${powersText}
        
        Limitations or Special Instructions: ${
          formData.limitations || "None specified"
        }
        
        Format this as a professional Power of Attorney document with appropriate sections, clauses, and signature blocks.
      `;

    case "nda":
      return `
        Create a ${
          formData.ndaType === "mutual" ? "Mutual" : "Unilateral"
        } Non-Disclosure Agreement with the following details:
        
        Disclosing Party: ${formData.disclosingPartyName}
        Disclosing Party Address: ${formData.disclosingPartyAddress}
        
        Receiving Party: ${formData.receivingPartyName}
        Receiving Party Address: ${formData.receivingPartyAddress}
        
        Effective Date: ${formData.effectiveDate}
        Term: ${formData.term}
        
        Purpose of Disclosure: ${formData.purpose}
        
        Definition of Confidential Information: ${
          formData.confidentialInformation
        }
        
        Exclusions from Confidential Information: ${
          formData.exclusions || "Standard exclusions apply"
        }
        
        Governing Law: ${formData.governingLaw}
        
        Format this as a professional ${
          formData.ndaType === "mutual" ? "Mutual" : "Unilateral"
        } Non-Disclosure Agreement with appropriate sections, clauses, and signature blocks.
      `;

    default:
      return "Please provide a valid document type.";
  }
}

function generateDocumentName(documentType: string, formData: any): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  switch (documentType) {
    case "agreement":
      return `${formData.title.replace(/\s+/g, "-")}_${timestamp}`;

    case "will":
      return `Will-and-Testament_${formData.fullName.replace(
        /\s+/g,
        "-"
      )}_${timestamp}`;

    case "poa":
      return `Power-of-Attorney_${formData.principalName.replace(
        /\s+/g,
        "-"
      )}_${timestamp}`;

    case "nda":
      return `${
        formData.ndaType === "mutual" ? "Mutual" : "Unilateral"
      }-NDA_${timestamp}`;

    default:
      return `Legal-Document_${timestamp}`;
  }
}
