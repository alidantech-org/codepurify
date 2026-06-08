'use client';

import { Badge } from '@/components/ui/badge';
import { Column } from '@/components/_core/tables/types';
import { Calendar, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IOrder, ORDER_SORTABLE_FIELDS, OrderSortableField } from '@/server/types/entities/commerce';
import { EOrderStatus } from '@/server/types/enums/commerce.enums';
import { CustomerOrderActions } from '@/components/customer/actions/order-action-shell';

// Format date
const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString();
};

// Format currency (amount is in cents, convert to dollars)
const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100);
};

// Get order status info
const getOrderStatusInfo = (status: EOrderStatus) => {
  switch (status) {
    case EOrderStatus.COMPLETED:
      return { label: 'Completed', className: 'bg-green-100 text-green-800' };
    case EOrderStatus.REFUNDED:
      return { label: 'Refunded', className: 'bg-gray-100 text-gray-800' };
    case EOrderStatus.CANCELED:
      return { label: 'Cancelled', className: 'bg-red-100 text-red-800' };
    default:
      return { label: status, className: 'bg-gray-100 text-gray-800' };
  }
};


// Export order columns for DataTable
export const customerOrdersColumns: Column<IOrder>[] = [
  {
    key: 'orderNumber',
    label: 'Order #',
    className: 'w-56 font-mono text-sm',
    sortable: ORDER_SORTABLE_FIELDS.includes('orderNumber' as OrderSortableField),
    render: (value: string) => (
      <span className="font-mono text-sm font-medium">{value}</span>
    ),
  },
  {
    key: 'eventTitle',
    label: 'Event',
    className: 'min-w-[200px] max-w-[300px]',
    sortable: false,
    render: (value: any, row: IOrder) => {
      const eventTitle = value || row.eventTitle;
      const eventStartDate = row.eventStartDate;
      
      if (!eventTitle) {
        return (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-medium text-sm">Unknown Event</span>
              <span className="text-xs text-muted-foreground">No event info</span>
            </div>
          </div>
        );
      }

      return (
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <CalendarDays className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="font-medium text-sm truncate">
              {eventTitle}
            </span>
            {eventStartDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground truncate">
                  {formatDate(eventStartDate)}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    key: 'amount',
    label: 'Amount',
    className: 'w-32 text-right',
    sortable: ORDER_SORTABLE_FIELDS.includes('amount' as OrderSortableField),
    render: (value: number, row: IOrder) => (
      <div className="flex items-center justify-end">
        <span className="font-medium text-sm">
          {formatCurrency(value, row.currency)}
          {row.discount > 0 && (
            <span className="text-muted-foreground ml-1">
              (-{formatCurrency(row.discount, row.currency)})
            </span>
          )}
        </span>
      </div>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    className: 'w-24',
    sortable: ORDER_SORTABLE_FIELDS.includes('status' as OrderSortableField),
    filterable: true,
    filterOptions: [
      { label: 'All Status', value: 'all' },
      { label: 'Completed', value: EOrderStatus.COMPLETED },
      { label: 'Refunded', value: EOrderStatus.REFUNDED },
      { label: 'Cancelled', value: EOrderStatus.CANCELED },
    ],
    render: (value: EOrderStatus | string) => {
      const statusInfo = getOrderStatusInfo(value as EOrderStatus);
      return (
        <Badge className={cn('rounded-full text-xs font-medium', statusInfo.className)}>
          {statusInfo.label}
        </Badge>
      );
    },
  },
      {
    key: 'createdAt',
    label: 'Date',
    className: 'w-32',
    sortable: ORDER_SORTABLE_FIELDS.includes('createdAt' as OrderSortableField),
    render: (value: Date) => (
      <div className="flex items-center gap-1">
        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{formatDate(value)}</span>
      </div>
    ),
  },
  {
    key: 'id',
    label: '',
    className: 'w-32 text-right',
    sortable: false,
    render: (_id: string, row: IOrder) => <CustomerOrderActions row={row} />,
  },
];
