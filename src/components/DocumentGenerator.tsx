"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import SubscriptionButton from "@/components/SubscriptionButton";
import AgreementForm from "@/components/document-forms/AgreementForm";
import WillForm from "@/components/document-forms/WillForm";
import PowerOfAttorneyForm from "@/components/document-forms/PowerOfAttorneyForm";
import NDAForm from "@/components/document-forms/NDAForm";

const documentTypes = [
  {
    id: "agreement",
    name: "Agreement",
    description: "Create a legal agreement between parties",
  },
  {
    id: "will",
    name: "Will & Testament",
    description: "Create a last will and testament document",
  },
  {
    id: "poa",
    name: "Power of Attorney",
    description: "Create a power of attorney document",
  },
  {
    id: "nda",
    name: "Non-Disclosure Agreement",
    description: "Create a non-disclosure agreement",
  },
];

export default function DocumentGenerator({
  isPro,
  userId,
}: {
  isPro: boolean;
  userId: string;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("agreement");
  const router = useRouter();

  const renderForm = () => {
    switch (activeTab) {
      case "agreement":
        return (
          <AgreementForm
            onSubmit={handleGenerateDocument}
            isGenerating={isGenerating}
          />
        );
      case "will":
        return (
          <WillForm
            onSubmit={handleGenerateDocument}
            isGenerating={isGenerating}
          />
        );
      case "poa":
        return (
          <PowerOfAttorneyForm
            onSubmit={handleGenerateDocument}
            isGenerating={isGenerating}
          />
        );
      case "nda":
        return (
          <NDAForm
            onSubmit={handleGenerateDocument}
            isGenerating={isGenerating}
          />
        );
      default:
        return null;
    }
  };

  const handleGenerateDocument = async (formData: any) => {
    if (!isPro) {
      toast.error("You need a Pro subscription to generate documents.");
      return;
    }

    // Check if any field is empty
    const hasEmptyField = Object.values(formData).some((value) => {
      if (typeof value === "string") return value.trim() === "";
      if (Array.isArray(value)) {
        return (
          value.length === 0 ||
          value.some((item) => {
            if (typeof item === "object") {
              return Object.values(item).some(
                (v) => typeof v === "string" && v.trim() === ""
              );
            }
            return false;
          })
        );
      }
      if (typeof value === "object" && value !== null) {
        // For objects like powers in PowerOfAttorneyForm, check if at least one is true
        if ("powers" in formData) {
          return Object.values(formData.powers).every((v) => v === false);
        }
      }
      return false;
    });

    if (hasEmptyField) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setIsGenerating(true);

      const response = await fetch("/api/generate-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentType: activeTab,
          formData,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate document");
      }

      const data = await response.json();

      toast.success("Your document has been generated successfully.");

      // Redirect to my-documents page
      router.push("/my-documents");
    } catch (error) {
      console.error("Error generating document:", error);
      toast.error("Failed to generate document. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Legal Document Generator
          </CardTitle>
          <CardDescription>
            Generate professional legal documents tailored to your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isPro && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-md flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <p className="text-sm text-amber-700">
                Document generation requires a Pro subscription.
                <span className="ml-2">
                  <SubscriptionButton isPro={isPro} />
                </span>
              </p>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-6">
              {documentTypes.map((type) => (
                <TabsTrigger key={type.id} value={type.id}>
                  {type.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {documentTypes.map((type) => (
              <TabsContent key={type.id} value={type.id} className="mt-0">
                <div className="mb-4">
                  <h3 className="text-lg font-medium">{type.name}</h3>
                  <p className="text-sm text-gray-500">{type.description}</p>
                </div>
                {activeTab === type.id && renderForm()}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
