import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { generatedDocuments } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Plus,
  Download,
  Calendar,
  ArrowLeft,
  Eye,
  Edit,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";

export default async function MyDocumentsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const documents = await db
    .select()
    .from(generatedDocuments)
    .where(eq(generatedDocuments.userId, userId))
    .orderBy(desc(generatedDocuments.createdAt));

  return (
    <div className="w-screen min-h-screen bg-gradient-to-r from-rose-100 to-teal-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/"
            className="flex items-center text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Documents</h1>
          <Link href="/generate-docs">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Generate New Document
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No documents yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by generating your first legal document.
              </p>
              <div className="mt-6">
                <Link href="/generate-docs">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Generate Document
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-50 rounded-md">
                      <FileText className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium">{doc.documentName}</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="mr-1 h-3 w-3" />
                        <span>
                          {formatDistanceToNow(new Date(doc.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link href={`/my-documents/${doc.id}/view`}>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/my-documents/${doc.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/api/documents/download/${doc.id}`}>
                      <Button variant="default" size="sm">
                        <Download className="mr-1 h-3 w-3" />
                        Download
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
