import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { generatedDocuments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import DocumentEditor from "@/components/DocumentEditor";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export default async function EditDocumentPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const documentId = Number.parseInt(params.id);
  if (isNaN(documentId)) {
    redirect("/my-documents");
  }

  const documents = await db
    .select()
    .from(generatedDocuments)
    .where(eq(generatedDocuments.id, documentId));

  if (documents.length === 0 || documents[0].userId !== userId) {
    redirect("/my-documents");
  }

  const document = documents[0];

  return (
    <div className="w-screen min-h-screen bg-gradient-to-r from-rose-100 to-teal-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/my-documents"
            className="flex items-center text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Documents
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold">Edit Document</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <DocumentEditor
            documentId={document.id}
            initialContent={document.content || ""}
            initialName={document.documentName}
          />
        </div>
      </div>
    </div>
  );
}
