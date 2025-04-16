"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface AgreementFormProps {
  onSubmit: (data: any) => void;
  isGenerating: boolean;
}

export default function AgreementForm({
  onSubmit,
  isGenerating,
}: AgreementFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    firstPartyName: "",
    firstPartyAddress: "",
    secondPartyName: "",
    secondPartyAddress: "",
    agreementTerms: "",
    effectiveDate: "",
    terminationConditions: "",
    governingLaw: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Agreement Title</Label>
          <Input
            id="title"
            name="title"
            placeholder="e.g., Service Agreement"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="effectiveDate">Effective Date</Label>
          <Input
            id="effectiveDate"
            name="effectiveDate"
            type="date"
            value={formData.effectiveDate}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstPartyName">First Party Name</Label>
          <Input
            id="firstPartyName"
            name="firstPartyName"
            placeholder="Full legal name"
            value={formData.firstPartyName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="firstPartyAddress">First Party Address</Label>
          <Input
            id="firstPartyAddress"
            name="firstPartyAddress"
            placeholder="Legal address"
            value={formData.firstPartyAddress}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="secondPartyName">Second Party Name</Label>
          <Input
            id="secondPartyName"
            name="secondPartyName"
            placeholder="Full legal name"
            value={formData.secondPartyName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="secondPartyAddress">Second Party Address</Label>
          <Input
            id="secondPartyAddress"
            name="secondPartyAddress"
            placeholder="Legal address"
            value={formData.secondPartyAddress}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="agreementTerms">Agreement Terms</Label>
        <Textarea
          id="agreementTerms"
          name="agreementTerms"
          placeholder="Describe the terms of the agreement in detail"
          rows={5}
          value={formData.agreementTerms}
          onChange={handleChange}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="terminationConditions">Termination Conditions</Label>
          <Textarea
            id="terminationConditions"
            name="terminationConditions"
            placeholder="Conditions under which this agreement may be terminated"
            rows={3}
            value={formData.terminationConditions}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="governingLaw">Governing Law</Label>
          <Input
            id="governingLaw"
            name="governingLaw"
            placeholder="e.g., Laws of California"
            value={formData.governingLaw}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isGenerating}>
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Document...
          </>
        ) : (
          "Generate Agreement"
        )}
      </Button>
    </form>
  );
}
