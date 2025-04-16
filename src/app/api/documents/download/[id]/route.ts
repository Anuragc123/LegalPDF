import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generatedDocuments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

// Initialize S3 client
const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
  },
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
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

    // Extract S3 key from the URL
    const url = new URL(document.documentUrl);
    const s3Key = url.pathname.substring(1); // Remove leading slash

    // Get file from S3
    const getObjectParams = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: s3Key,
    };

    const s3Response = await s3Client.send(
      new GetObjectCommand(getObjectParams)
    );

    if (!s3Response.Body) {
      return new NextResponse("File not found in storage", { status: 404 });
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of s3Response.Body as any) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    // Set headers for file download
    const headers = new Headers();
    headers.set(
      "Content-Disposition",
      `attachment; filename="${document.documentName}.pdf"`
    );
    headers.set("Content-Type", "application/pdf");
    headers.set("Content-Length", fileBuffer.length.toString());

    return new NextResponse(fileBuffer, { headers });
  } catch (error) {
    console.error("[DOCUMENT_DOWNLOAD_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
