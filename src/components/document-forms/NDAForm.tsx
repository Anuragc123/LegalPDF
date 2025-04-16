"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";

interface NDAFormProps {
  onSubmit: (data: any) => void;
  isGenerating: boolean;
}

export default function NDAForm({ onSubmit, isGenerating }: NDAFormProps) {
  const [formData, setFormData] = useState({
    disclosingPartyName: "",
    disclosingPartyAddress: "",
    receivingPartyName: "",
    receivingPartyAddress: "",
    effectiveDate: "",
    terminationDate: "",
    purpose: "",
    confidentialInformation: "",
    exclusions: "",
    ndaType: "unilateral", // unilateral or mutual
    governingLaw: "",
    term: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (value: string) => {
    setFormData((prev) => ({ ...prev, ndaType: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>NDA Type</Label>
        <RadioGroup
          value={formData.ndaType}
          onValueChange={handleRadioChange}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="unilateral" id="unilateral" />
            <Label htmlFor="unilateral" className="font-normal">
              Unilateral (One-way)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="mutual" id="mutual" />
            <Label htmlFor="mutual" className="font-normal">
              Mutual (Two-way)
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="disclosingPartyName">Disclosing Party Name</Label>
          <Input
            id="disclosingPartyName"
            name="disclosingPartyName"
            placeholder="Full legal name"
            value={formData.disclosingPartyName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="disclosingPartyAddress">
            Disclosing Party Address
          </Label>
          <Input
            id="disclosingPartyAddress"
            name="disclosingPartyAddress"
            placeholder="Legal address"
            value={formData.disclosingPartyAddress}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="receivingPartyName">Receiving Party Name</Label>
          <Input
            id="receivingPartyName"
            name="receivingPartyName"
            placeholder="Full legal name"
            value={formData.receivingPartyName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="receivingPartyAddress">Receiving Party Address</Label>
          <Input
            id="receivingPartyAddress"
            name="receivingPartyAddress"
            placeholder="Legal address"
            value={formData.receivingPartyAddress}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="space-y-2">
          <Label htmlFor="term">Term (Duration)</Label>
          <Input
            id="term"
            name="term"
            placeholder="e.g., 2 years, 5 years"
            value={formData.term}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="purpose">Purpose of Disclosure</Label>
        <Textarea
          id="purpose"
          name="purpose"
          placeholder="Describe the purpose for which confidential information will be shared"
          rows={3}
          value={formData.purpose}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confidentialInformation">
          Definition of Confidential Information
        </Label>
        <Textarea
          id="confidentialInformation"
          name="confidentialInformation"
          placeholder="Describe what constitutes confidential information under this agreement"
          rows={3}
          value={formData.confidentialInformation}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="exclusions">
          Exclusions from Confidential Information
        </Label>
        <Textarea
          id="exclusions"
          name="exclusions"
          placeholder="Information that is excluded from confidentiality obligations"
          rows={3}
          value={formData.exclusions}
          onChange={handleChange}
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

      <Button type="submit" className="w-full" disabled={isGenerating}>
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Document...
          </>
        ) : (
          "Generate Non-Disclosure Agreement"
        )}
      </Button>
    </form>
  );
}
