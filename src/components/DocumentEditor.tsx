"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface DocumentEditorProps {
  documentId: number;
  initialContent: string;
  initialName: string;
}

export default function DocumentEditor({
  documentId,
  initialContent,
  initialName,
}: DocumentEditorProps) {
  const [documentName, setDocumentName] = useState(initialName);
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    if (!documentName.trim()) {
      toast.error("Document name cannot be empty");
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch(`/api/documents/${documentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentName,
          content,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save document");
      }

      toast.success("Document saved successfully");
      router.refresh();
      router.push("/my-documents");
    } catch (error) {
      console.error("Error saving document:", error);
      toast.error("Failed to save document. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="documentName">Document Name</Label>
        <Input
          id="documentName"
          value={documentName}
          onChange={(e) => setDocumentName(e.target.value)}
          placeholder="Enter document name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Document Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter document content"
          className="min-h-[400px] font-mono"
        />
        <p className="text-xs text-gray-500">
          Use markdown formatting: # for headings, ## for subheadings, **bold**,
          *italic*
        </p>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Document
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
