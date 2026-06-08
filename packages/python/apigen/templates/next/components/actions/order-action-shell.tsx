'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Calendar, Download, EditIcon, Eye, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { deleteOrder, patchOrder } from '@/server/resources/commerce/order';
import { IOrder } from '@/server/types/entities/commerce';
import { EOrderStatus } from '@/server/types/enums/commerce.enums';

type CustomerOrderActionsProps = {
  row: IOrder;
};

const formatDate = (date: Date | string) => new Date(date).toLocaleDateString();

const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100);
};

export function CustomerOrderActions({ row }: CustomerOrderActionsProps) {
  const router = useRouter();
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState<EOrderStatus>(row.status);

  const customerId = row.customerId || row.customer?.id;

  const handleDownloadReceipt = () => {
    const receipt = [
      `Receipt: ${row.orderNumber}`,
      `Customer: ${row.customerName || row.customer?.email || customerId || 'Customer'}`,
      `Event: ${row.eventTitle || 'Unknown Event'}`,
      `Date: ${formatDate(row.createdAt)}`,
      `Status: ${row.status}`,
      `Subtotal: ${formatCurrency(row.subtotal, row.currency)}`,
      `Discount: ${formatCurrency(row.discount, row.currency)}`,
      `Amount: ${formatCurrency(row.amount, row.currency)}`,
    ].join('\n');
    const blob = new Blob([receipt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${row.orderNumber || row.id}-receipt.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Receipt downloaded');
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = (await deleteOrder(row.id)) as { error?: string; message?: string; success?: boolean; ok?: boolean };

      if (result?.error || result?.success === false || result?.ok === false) {
        toast.error(result.error || result.message || 'Failed to delete order');
        return;
      }

      toast.success('Order deleted');
      setIsDeleteOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete order');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);

    try {
      const formData = new FormData();
      formData.set('id', row.id);
      formData.set('status', status);
      const result = (await patchOrder(null, formData)) as { error?: string; message?: string; success?: boolean; ok?: boolean };

      if (result?.error || result?.success === false || result?.ok === false) {
        toast.error(result.error || result.message || 'Failed to update order');
        return;
      }

      toast.success('Order updated');
      setIsEditOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update order');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" title="View order" onClick={() => setIsViewOpen(true)}>
          <Eye className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" title="Download receipt" onClick={handleDownloadReceipt}>
          <Download className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" title="Edit order" onClick={() => setIsEditOpen(true)}>
          <EditIcon className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-600 hover:bg-red-50" title="Delete order" onClick={() => setIsDeleteOpen(true)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{row.orderNumber}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div>
              <div className="font-medium">{row.eventTitle || 'Unknown Event'}</div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(row.eventStartDate || row.createdAt)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-muted-foreground">Amount</div>
                <div className="font-medium">{formatCurrency(row.amount, row.currency)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Status</div>
                <div className="font-medium">{row.status}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Subtotal</div>
                <div className="font-medium">{formatCurrency(row.subtotal, row.currency)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Discount</div>
                <div className="font-medium">{formatCurrency(row.discount, row.currency)}</div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit order</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as EOrderStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={EOrderStatus.COMPLETED}>Completed</SelectItem>
                <SelectItem value={EOrderStatus.REFUNDED}>Refunded</SelectItem>
                <SelectItem value={EOrderStatus.CANCELED}>Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete order?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete {row.orderNumber}. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Keep order</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
