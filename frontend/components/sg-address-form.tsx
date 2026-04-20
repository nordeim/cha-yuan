
'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { MapPin } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Zod schema for Singapore address validation
const addressSchema = z.object({
  recipientName: z.string().min(2, 'Recipient name is required'),
  blockStreet: z.string().min(5, 'Block and street address is required'),
  unitNumber: z.string().optional(),
  postalCode: z.string().regex(/^\d{6}$/, 'Postal code must be 6 digits'),
  phoneNumber: z.string().regex(/^\+65[689]\d{7}$/, 'Phone must be +65 followed by 8 digits'),
});

export type SgAddressData = z.infer<typeof addressSchema>;

interface SgAddressFormProps {
  onValidChange?: (isValid: boolean, data?: SgAddressData) => void;
  defaultValues?: Partial<SgAddressData>;
}

export function SgAddressForm({ onValidChange, defaultValues }: SgAddressFormProps) {
  const [formData, setFormData] = useState<Partial<SgAddressData>>({
    recipientName: defaultValues?.recipientName || '',
    blockStreet: defaultValues?.blockStreet || '',
    unitNumber: defaultValues?.unitNumber || '',
    postalCode: defaultValues?.postalCode || '',
    phoneNumber: defaultValues?.phoneNumber || '+65',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof SgAddressData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof SgAddressData, boolean>>>({});

  // Validate form on change
  useEffect(() => {
    const result = addressSchema.safeParse(formData);
    
    if (result.success) {
      setErrors({});
      onValidChange?.(true, result.data);
    } else {
      const fieldErrors: Partial<Record<keyof SgAddressData, string>> = {};
      const zodErrors = result.error;
      zodErrors.issues.forEach((issue) => {
        const path = issue.path[0] as keyof SgAddressData;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      onValidChange?.(false);
    }
  }, [formData, onValidChange]);

  const handleChange = (field: keyof SgAddressData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const showError = (field: keyof SgAddressData) => {
    return touched[field] && errors[field] ? errors[field] : undefined;
  };

  return (
    <div className="space-y-4">
      {/* Recipient Name */}
      <div className="space-y-2">
        <Label htmlFor="recipientName" className="text-bark-800">
          Recipient Name <span className="text-terra-500">*</span>
        </Label>
        <Input
          id="recipientName"
          value={formData.recipientName}
          onChange={(e) => handleChange('recipientName', e.target.value)}
          placeholder="e.g., John Tan"
          error={showError('recipientName')}
        />
      </div>

      {/* Block / Street */}
      <div className="space-y-2">
        <Label htmlFor="blockStreet" className="text-bark-800 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-tea-600" />
          Block / Street Address <span className="text-terra-500">*</span>
        </Label>
        <Input
          id="blockStreet"
          value={formData.blockStreet}
          onChange={(e) => handleChange('blockStreet', e.target.value)}
          placeholder="e.g., Blk 123 Jurong East St 13"
          error={showError('blockStreet')}
        />
        <p className="text-xs text-bark-700/50">
          Enter block number and street name
        </p>
      </div>

      {/* Unit Number */}
      <div className="space-y-2">
        <Label htmlFor="unitNumber" className="text-bark-800">
          Unit / Floor Number
        </Label>
        <Input
          id="unitNumber"
          value={formData.unitNumber}
          onChange={(e) => handleChange('unitNumber', e.target.value)}
          placeholder="e.g., #04-56"
          error={showError('unitNumber')}
        />
        <p className="text-xs text-bark-700/50">
          Optional. Format: #XX-YY for HDB or #-XX for landed property
        </p>
      </div>

      {/* Postal Code */}
      <div className="space-y-2">
        <Label htmlFor="postalCode" className="text-bark-800">
          Postal Code <span className="text-terra-500">*</span>
        </Label>
        <Input
          id="postalCode"
          value={formData.postalCode}
          onChange={(e) => {
            // Only allow digits
            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
            handleChange('postalCode', value);
          }}
          placeholder="e.g., 600123"
          maxLength={6}
          error={showError('postalCode')}
        />
      </div>

      {/* Phone Number */}
      <div className="space-y-2">
        <Label htmlFor="phoneNumber" className="text-bark-800">
          Phone Number <span className="text-terra-500">*</span>
        </Label>
        <Input
          id="phoneNumber"
          value={formData.phoneNumber}
          onChange={(e) => {
            let value = e.target.value;
            
            // Ensure +65 prefix
            if (!value.startsWith('+65')) {
              value = '+65' + value.replace(/^\+65/, '');
            }
            
            // Limit to +65 + 8 digits
            const digits = value.replace(/\D/g, '');
            if (digits.length <= 10) {
              handleChange('phoneNumber', value);
            }
          }}
          placeholder="+65 9123 4567"
          error={showError('phoneNumber')}
        />
        <p className="text-xs text-bark-700/50">
          Singapore mobile number starting with +65
        </p>
      </div>

      {/* Address Summary */}
      {Object.values(formData).some(Boolean) && (
        <div className="mt-6 p-4 bg-ivory-100 rounded-lg">
          <h4 className="font-medium text-bark-900 mb-2">Address Preview</h4>
          <address className="text-sm text-bark-700 not-italic">
            {formData.recipientName && <div className="font-medium">{formData.recipientName}</div>}
            {formData.blockStreet && <div>{formData.blockStreet}</div>}
            {formData.unitNumber && <div>{formData.unitNumber}</div>}
            {formData.postalCode && <div>Singapore {formData.postalCode}</div>}
            {formData.phoneNumber && formData.phoneNumber !== '+65' && (
              <div className="mt-2 text-bark-700/70">{formData.phoneNumber}</div>
            )}
          </address>
        </div>
      )}
    </div>
  );
}
