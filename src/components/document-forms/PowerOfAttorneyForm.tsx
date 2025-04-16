"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

interface PowerOfAttorneyFormProps {
  onSubmit: (data: any) => void;
  isGenerating: boolean;
}

export default function PowerOfAttorneyForm({
  onSubmit,
  isGenerating,
}: PowerOfAttorneyFormProps) {
  const [formData, setFormData] = useState({
    principalName: "",
    principalAddress: "",
    agentName: "",
    agentAddress: "",
    alternateAgentName: "",
    alternateAgentAddress: "",
    effectiveDate: "",
    expirationDate: "",
    powers: {
      realEstate: false,
      personalProperty: false,
      financialMatters: false,
      taxMatters: false,
      legalProceedings: false,
      healthcare: false,
      businessOperations: false,
      giftGiving: false,
    },
    limitations: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePowerChange = (power: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      powers: {
        ...prev.powers,
        [power]: checked,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="principalName">Principal Name</Label>
          <Input
            id="principalName"
            name="principalName"
            placeholder="Your full legal name"
            value={formData.principalName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="principalAddress">Principal Address</Label>
          <Input
            id="principalAddress"
            name="principalAddress"
            placeholder="Your legal address"
            value={formData.principalAddress}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="agentName">Agent Name</Label>
          <Input
            id="agentName"
            name="agentName"
            placeholder="Full name of your agent"
            value={formData.agentName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="agentAddress">Agent Address</Label>
          <Input
            id="agentAddress"
            name="agentAddress"
            placeholder="Address of your agent"
            value={formData.agentAddress}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="alternateAgentName">Alternate Agent Name</Label>
          <Input
            id="alternateAgentName"
            name="alternateAgentName"
            placeholder="Full name of alternate agent"
            value={formData.alternateAgentName}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="alternateAgentAddress">Alternate Agent Address</Label>
          <Input
            id="alternateAgentAddress"
            name="alternateAgentAddress"
            placeholder="Address of alternate agent"
            value={formData.alternateAgentAddress}
            onChange={handleChange}
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
          <Label htmlFor="expirationDate">Expiration Date (if any)</Label>
          <Input
            id="expirationDate"
            name="expirationDate"
            type="date"
            value={formData.expirationDate}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Powers Granted</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="realEstate"
              checked={formData.powers.realEstate}
              onCheckedChange={(checked) =>
                handlePowerChange("realEstate", checked as boolean)
              }
            />
            <Label htmlFor="realEstate" className="font-normal">
              Real Estate Transactions
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="personalProperty"
              checked={formData.powers.personalProperty}
              onCheckedChange={(checked) =>
                handlePowerChange("personalProperty", checked as boolean)
              }
            />
            <Label htmlFor="personalProperty" className="font-normal">
              Personal Property Transactions
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="financialMatters"
              checked={formData.powers.financialMatters}
              onCheckedChange={(checked) =>
                handlePowerChange("financialMatters", checked as boolean)
              }
            />
            <Label htmlFor="financialMatters" className="font-normal">
              Financial Matters
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="taxMatters"
              checked={formData.powers.taxMatters}
              onCheckedChange={(checked) =>
                handlePowerChange("taxMatters", checked as boolean)
              }
            />
            <Label htmlFor="taxMatters" className="font-normal">
              Tax Matters
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="legalProceedings"
              checked={formData.powers.legalProceedings}
              onCheckedChange={(checked) =>
                handlePowerChange("legalProceedings", checked as boolean)
              }
            />
            <Label htmlFor="legalProceedings" className="font-normal">
              Legal Proceedings
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="healthcare"
              checked={formData.powers.healthcare}
              onCheckedChange={(checked) =>
                handlePowerChange("healthcare", checked as boolean)
              }
            />
            <Label htmlFor="healthcare" className="font-normal">
              Healthcare Decisions
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="businessOperations"
              checked={formData.powers.businessOperations}
              onCheckedChange={(checked) =>
                handlePowerChange("businessOperations", checked as boolean)
              }
            />
            <Label htmlFor="businessOperations" className="font-normal">
              Business Operations
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="giftGiving"
              checked={formData.powers.giftGiving}
              onCheckedChange={(checked) =>
                handlePowerChange("giftGiving", checked as boolean)
              }
            />
            <Label htmlFor="giftGiving" className="font-normal">
              Gift Giving
            </Label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="limitations">Limitations or Special Instructions</Label>
        <Textarea
          id="limitations"
          name="limitations"
          placeholder="Any limitations or special instructions for your agent"
          rows={4}
          value={formData.limitations}
          onChange={handleChange}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isGenerating}>
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Document...
          </>
        ) : (
          "Generate Power of Attorney"
        )}
      </Button>
    </form>
  );
}
