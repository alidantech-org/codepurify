'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Column } from '@/components/_core/tables/types';
import { EditIcon, Trash2, Mail, Phone, MapPin, Eye, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';
import {
  ICustomer,
  CUSTOMER_SORTABLE_FIELDS,
  CustomerSortableField,
  CUSTOMER_FILTERABLE_FIELDS,
  CustomerFilterableField,
} from '@/server/types/entities/customer';
import Link from 'next/link';
import { pages } from '@/lib/constants';

// Export customer columns for DataTable
export const customerColumns: Column<ICustomer>[] = [
  {
    key: '#',
    label: '#',
    className: 'w-12 text-left px-3',
    sortable: false,
    filterable: false,
  },
  {
    key: 'firstName',
    label: 'Customer',
    className: 'min-w-[200px] max-w-[250px] overflow-hidden text-ellipsis py-3',
    sortable: CUSTOMER_SORTABLE_FIELDS.includes('firstName' as CustomerSortableField),
    filterable: false, // Not in filterable fields array
    render: (value: string, row: ICustomer) => (
      <div className="flex flex-col">
        <div className="font-medium text-sm truncate">
          {value} {row.lastName}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
          <Mail className="h-3 w-3 shrink-0" />
          <span className="truncate">{row.email}</span>
        </div>
      </div>
    ),
  },
  {
    key: 'phone',
    label: 'Phone',
    className: 'min-w-[140px] max-w-[180px]',
    sortable: CUSTOMER_SORTABLE_FIELDS.includes('phone' as CustomerSortableField),
    filterable: false, // Not in filterable fields array
    render: (value: string) =>
      value ? (
        <div className="flex items-center gap-1">
          <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
          <span className="text-xs truncate">{value}</span>
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
  },
  {
    key: 'country',
    label: 'Location',
    className: 'min-w-[60px] max-w-[80px]',
    sortable: CUSTOMER_SORTABLE_FIELDS.includes('country' as CustomerSortableField),
    // filterable: CUSTOMER_FILTERABLE_FIELDS.includes('country' as CustomerFilterableField),
    // filterOptions: [
    //   { label: 'All Locations', value: 'all' },
    //   { label: 'With Country', value: 'has_country' },
    // ],
    render: (value: string, row: ICustomer) => {
      return (
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
          <span className="text-xs truncate">{value}</span>
        </div>
      );
    },
  },
  {
    key: 'city',
    label: 'City',
    className: 'min-w-[120px] max-w-[130px] overflow-hidden text-ellipsis',
    sortable: false, // Not in sortable fields array
    // filterable: CUSTOMER_FILTERABLE_FIELDS.includes('city' as CustomerFilterableField),
    // filterOptions: [
    //   { label: 'All Cities', value: 'all' },
    //   { label: 'With City', value: 'has_city' },
    // ],
    render: (value: string) =>
      value ? <span className="text-xs truncate">{value}</span> : <span className="text-muted-foreground">-</span>,
  },
  {
    key: 'stripeCustomerId',
    label: 'Payment',
    className: 'w-28',
    sortable: false,
    render: (value: string) =>
      value ? (
        <Badge
          variant="outline"
          className="rounded-full text-xs font-medium truncate max-w-[100px] bg-green-50 text-green-700 border-green-200"
        >
          Connected
        </Badge>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
  },
  {
    key: 'createdAt',
    label: 'Joined',
    className: 'w-32 text-xs',
    sortable: CUSTOMER_SORTABLE_FIELDS.includes('createdAt' as CustomerSortableField),
    render: (value: Date) => <span className="text-xs text-muted-foreground">{format(new Date(value), 'MMM dd, yyyy')}</span>,
  },
  {
    key: 'id',
    label: 'Actions',
    className: 'justify-center',
    sortable: false,
    filterable: false,
    render: (_value: string, row: ICustomer) => (
      <div className="flex items-center justify-center gap-1">
        <Button variant="ghost" size="sm" asChild title="View customer details">
          <Link href={pages.customers.detail(row.id)}>
            <Eye className="h-3.5 w-3.5" />
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild title="View customer orders">
          <Link href={pages.customers.orders(row.id)}>
            <ShoppingCart className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    ),
  },
];
