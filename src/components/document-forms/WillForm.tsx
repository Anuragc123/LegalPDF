"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, PlusCircle, X } from "lucide-react";

interface WillFormProps {
  onSubmit: (data: any) => void;
  isGenerating: boolean;
}

export default function WillForm({ onSubmit, isGenerating }: WillFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    executorName: "",
    executorAddress: "",
    alternateExecutorName: "",
    alternateExecutorAddress: "",
    assets: [{ description: "", beneficiary: "" }],
    residualBeneficiary: "",
    specialInstructions: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssetChange = (index: number, field: string, value: string) => {
    const updatedAssets = [...formData.assets];
    updatedAssets[index] = { ...updatedAssets[index], [field]: value };
    setFormData((prev) => ({ ...prev, assets: updatedAssets }));
  };

  const addAsset = () => {
    setFormData((prev) => ({
      ...prev,
      assets: [...prev.assets, { description: "", beneficiary: "" }],
    }));
  };

  const removeAsset = (index: number) => {
    if (formData.assets.length > 1) {
      const updatedAssets = formData.assets.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, assets: updatedAssets }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Legal Name</Label>
          <Input
            id="fullName"
            name="fullName"
            placeholder="Your full legal name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Legal Address</Label>
          <Input
            id="address"
            name="address"
            placeholder="Your current legal address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="executorName">Executor Name</Label>
          <Input
            id="executorName"
            name="executorName"
            placeholder="Full name of your executor"
            value={formData.executorName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="executorAddress">Executor Address</Label>
          <Input
            id="executorAddress"
            name="executorAddress"
            placeholder="Address of your executor"
            value={formData.executorAddress}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="alternateExecutorName">Alternate Executor Name</Label>
          <Input
            id="alternateExecutorName"
            name="alternateExecutorName"
            placeholder="Full name of alternate executor"
            value={formData.alternateExecutorName}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="alternateExecutorAddress">
            Alternate Executor Address
          </Label>
          <Input
            id="alternateExecutorAddress"
            name="alternateExecutorAddress"
            placeholder="Address of alternate executor"
            value={formData.alternateExecutorAddress}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Assets and Beneficiaries</Label>
        {formData.assets.map((asset, index) => (
          <div key={index} className="flex items-start gap-2 mb-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-grow">
              <Input
                placeholder="Asset description"
                value={asset.description}
                onChange={(e) =>
                  handleAssetChange(index, "description", e.target.value)
                }
                required
              />
              <Input
                placeholder="Beneficiary name"
                value={asset.beneficiary}
                onChange={(e) =>
                  handleAssetChange(index, "beneficiary", e.target.value)
                }
                required
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeAsset(index)}
              disabled={formData.assets.length <= 1}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addAsset}
          className="mt-2"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Asset
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="residualBeneficiary">Residual Beneficiary</Label>
        <Input
          id="residualBeneficiary"
          name="residualBeneficiary"
          placeholder="Who receives remaining assets not specifically mentioned"
          value={formData.residualBeneficiary}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialInstructions">Special Instructions</Label>
        <Textarea
          id="specialInstructions"
          name="specialInstructions"
          placeholder="Any special instructions or wishes"
          rows={4}
          value={formData.specialInstructions}
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
          "Generate Will & Testament"
        )}
      </Button>
    </form>
  );
}
