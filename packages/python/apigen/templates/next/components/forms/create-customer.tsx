'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { createCustomer } from '@/server/resources/customer/customer';
import { ICustomer } from '@/server/types/entities/customer';
import { DialogFormShell } from '@/components/_core/dialog-form-shell';
import { useDialogAction } from '@/lib/hooks/use-dialog-action';
import CreateButton from '@/components/_core/create-button';

interface NewCustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender?: string;
  dob?: string;
  streetAndHseNo?: string;
  zipcode?: string;
  city?: string;
  state?: string;
  country?: string;
  nftWalletAddress?: string;
}

interface CreateCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerCreated?: (customer: ICustomer) => void;
}

export function CreateCustomerModal({ open, onOpenChange, onCustomerCreated }: CreateCustomerModalProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const { action, isPending } = useDialogAction(createCustomer, {
    isOpen: open,
    onOpenChange,
    onSuccess: (result) => {
      const customer = result?.body?.customer as ICustomer | null;
      if (customer) {
        toast.success('Customer created successfully');
        onCustomerCreated?.(customer);
      }
    },
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      formRef.current?.reset();
    }
  }, [open]);


  return (
    <DialogFormShell
      open={open}
      onOpenChange={onOpenChange}
      action={action}
      formRef={formRef}
      title="Create New Customer"
      description="Add a new customer to your organization"
      icon={<UserPlus className="h-5 w-5" />}
      iconClassName="bg-blue-100 text-blue-800"
      maxWidth="max-w-2xl"
      isPending={isPending}
      submitText="Create Customer"
      pendingText="Creating..."
    >
      <div className="space-y-4 p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              name="firstName"
              placeholder="Enter first name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              name="lastName"
              placeholder="Enter last name"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter email address"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+1234567890"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select name="gender">
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              name="dob"
              type="date"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="streetAndHseNo">Street Address</Label>
          <Input
            id="streetAndHseNo"
            name="streetAndHseNo"
            placeholder="123 Main St"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              placeholder="New York"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State/Province</Label>
            <Input
              id="state"
              name="state"
              placeholder="NY"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="zipcode">ZIP/Postal Code</Label>
            <Input
              id="zipcode"
              name="zipcode"
              placeholder="10001"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              name="country"
              placeholder="United States"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nftWalletAddress">NFT Wallet Address</Label>
          <Input
            id="nftWalletAddress"
            name="nftWalletAddress"
            placeholder="0x..."
          />
        </div>
      </div>
    </DialogFormShell>
  );
}

interface CreateCustomerButtonProps extends React.ComponentProps<typeof Button> {
  onCustomerCreated?: (customer: ICustomer) => void;
}

export function CreateCustomerButton({ onCustomerCreated, onClick, children, ...buttonProps }: CreateCustomerButtonProps) {
  const [open, setOpen] = useState(false);

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    setOpen(true);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  const handleCustomerCreated = (customer: ICustomer) => {
    setOpen(false);
    onCustomerCreated?.(customer);
  };

  return (
    <>
      <CreateButton text="Create Customer" onClick={handleButtonClick} className='py-0 ml-2'/>
      <CreateCustomerModal open={open} onOpenChange={handleOpenChange} onCustomerCreated={handleCustomerCreated} />
    </>
  );
}
