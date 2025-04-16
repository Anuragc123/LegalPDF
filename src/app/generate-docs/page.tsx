import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DocumentGenerator from "@/components/DocumentGenerator";
import { checkSubscription } from "@/lib/subscription";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function GenerateDocsPage() {
  const { userId } = await auth();
  const isPro = await checkSubscription();

  if (!userId) {
    redirect("/sign-in");
  }

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

        <h1 className="text-3xl font-bold mb-6 text-center">
          Generate Legal Documents
        </h1>
        <DocumentGenerator isPro={isPro} userId={userId} />
      </div>
    </div>
  );
}
