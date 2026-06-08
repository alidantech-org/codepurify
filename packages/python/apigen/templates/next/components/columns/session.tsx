'use client';

import { Badge } from '@/components/ui/badge';
import { Column } from '@/components/_core/tables/types';
import { Monitor, Globe, Smartphone, Mail } from 'lucide-react';
import { format } from 'date-fns';
import {
  ICustomerSession,
  CUSTOMER_SESSION_SORTABLE_FIELDS,
  CustomerSessionSortableField,
  CUSTOMER_SESSION_FILTERABLE_FIELDS,
  CustomerSessionFilterableField,
} from '@/server/types/entities/customer';
import { EUserType, ETrackingLayer } from '@/server/types/enums/customer.enums';


// Helper function to get user type badge color
const getUserTypeBadgeVariant = (userType: EUserType) => {
  switch (userType) {
    case EUserType.AUTHENTICATED:
      return 'default';
    case EUserType.ANONYMOUS:
      return 'secondary';
    default:
      return 'outline';
  }
};

// Helper function to get tracking layer badge color
const getTrackingLayerBadgeVariant = (trackingLayer?: ETrackingLayer) => {
  switch (trackingLayer) {
    case ETrackingLayer.DETERMINISTIC:
      return 'default';
    case ETrackingLayer.HEURISTIC:
      return 'secondary';
    case ETrackingLayer.DARK:
      return 'destructive';
    case ETrackingLayer.UNKNOWN:
    default:
      return 'outline';
  }
};

// Export customer session columns for DataTable
export const customerSessionColumns: Column<ICustomerSession>[] = [
  {
    key: '#',
    label: '#',
    className: 'w-12 text-left px-3',
    sortable: false,
    filterable: false,
  },
  {
    key: 'customerId',
    label: 'Customer',
    className: 'min-w-[200px] max-w-[250px]',
    sortable: CUSTOMER_SESSION_SORTABLE_FIELDS.includes('customerId' as CustomerSessionSortableField),
    render: (value: any, row: ICustomerSession) => {
      return row.customer ? (
        <div className="flex flex-col">
          <div className="font-medium text-sm truncate">
            {row.customer.firstName} {row.customer.lastName}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
            <Mail className="h-3 w-3 shrink-0" />
            <span className="truncate">{row.customer.email}</span>
          </div>
        </div>
      ) : (
        <span className="text-muted-foreground text-xs">Anonymous</span>
      );
    },
  },
  {
    key: 'userType',
    label: 'Type',
    className: 'w-24',
    sortable: CUSTOMER_SESSION_SORTABLE_FIELDS.includes('userType' as CustomerSessionSortableField),
    // filterable: CUSTOMER_SESSION_FILTERABLE_FIELDS.includes('userType' as CustomerSessionFilterableField),
    // filterOptions: [
    //   { label: 'All Types', value: 'all' },
    //   { label: 'With Customer', value: 'authenticated' },
    //   { label: 'No Customer', value: 'anonymous' },
    // ],
    render: (value: EUserType) => (
      <Badge variant={getUserTypeBadgeVariant(value)} className="text-xs">
        {value}
      </Badge>
    ),
  },
  {
    key: 'browser',
    label: 'Browser',
    className: 'min-w-[100px] max-w-[120px]',
    sortable: CUSTOMER_SESSION_SORTABLE_FIELDS.includes('browser' as CustomerSessionSortableField),
    filterable: CUSTOMER_SESSION_FILTERABLE_FIELDS.includes('browser' as CustomerSessionFilterableField),
    filterOptions: [
      { label: 'All Browsers', value: 'all' },
      { label: 'Chrome', value: 'Chrome' },
      { label: 'Firefox', value: 'Firefox' },
      { label: 'Safari', value: 'Safari' },
      { label: 'Edge', value: 'Edge' },
    ],
    render: (value: string) => <span className="text-xs capitalize truncate">{value || 'Unknown'}</span>,
  },
  {
    key: 'os',
    label: 'OS',
    className: 'min-w-[80px] max-w-[100px]',
    sortable: CUSTOMER_SESSION_SORTABLE_FIELDS.includes('os' as CustomerSessionSortableField),
    filterable: CUSTOMER_SESSION_FILTERABLE_FIELDS.includes('os' as CustomerSessionFilterableField),
    filterOptions: [
      { label: 'All OS', value: 'all' },
      { label: 'Windows', value: 'Windows' },
      { label: 'macOS', value: 'macOS' },
      { label: 'Linux', value: 'Linux' },
      { label: 'iOS', value: 'iOS' },
      { label: 'Android', value: 'Android' },
    ],
    render: (value: string) => <span className="text-xs capitalize truncate">{value || 'Unknown'}</span>,
  },
  // {
  //   key: 'trackingLayer',
  //   label: 'Tracking',
  //   className: 'w-28',
  //   sortable: CUSTOMER_SESSION_SORTABLE_FIELDS.includes('trackingLayer' as CustomerSessionSortableField),
  //   filterable: CUSTOMER_SESSION_FILTERABLE_FIELDS.includes('trackingLayer' as CustomerSessionFilterableField),
  //   filterOptions: [
  //     { label: 'All Tracking', value: 'all' },
  //     { label: 'Deterministic', value: 'deterministic' },
  //     { label: 'Heuristic', value: 'heuristic' },
  //     { label: 'Dark', value: 'dark' },
  //     { label: 'Unknown', value: 'unknown' },
  //   ],
  //   render: (value: ETrackingLayer) => (
  //     <Badge variant={getTrackingLayerBadgeVariant(value)} className="text-xs">
  //       {value || 'Unknown'}
  //     </Badge>
  //   ),
  // },
  {
    key: 'country',
    label: 'Location',
    className: 'min-w-[80px] max-w-[100px]',
    sortable: CUSTOMER_SESSION_SORTABLE_FIELDS.includes('country' as CustomerSessionSortableField),
    filterOptions: [
      { label: 'All Locations', value: 'all' },
      { label: 'With Country', value: 'has_country' },
    ],
    render: (value: string, row: ICustomerSession) => {
      const location = value || row.city || 'Unknown';
      return (
        <div className="flex items-center gap-1">
          <Globe className="h-3 w-3 text-muted-foreground shrink-0" />
          <span className="text-xs truncate">{location}</span>
        </div>
      );
    },
  },
  // {
  //   key: 'ipAddress',
  //   label: 'IP Address',
  //   className: 'min-w-[120px] max-w-[140px] overflow-hidden text-ellipsis',
  //   sortable: CUSTOMER_SESSION_SORTABLE_FIELDS.includes('ipAddress' as CustomerSessionSortableField),
  //   render: (value: string) => <span className="text-xs font-mono">{value || '-'}</span>,
  // },
  // {
  //   key: 'isDarkTraffic',
  //   label: 'Dark Traffic',
  //   className: 'w-24',
  //   sortable: CUSTOMER_SESSION_SORTABLE_FIELDS.includes('isDarkTraffic' as CustomerSessionSortableField),
  //   filterOptions: [
  //     { label: 'All Traffic', value: 'all' },
  //     { label: 'Dark Traffic', value: 'true' },
  //     { label: 'Normal Traffic', value: 'false' },
  //   ],
  //   render: (value: boolean) => (
  //     <Badge variant={value ? 'destructive' : 'secondary'} className="text-xs">
  //       {value ? 'Dark' : 'Normal'}
  //     </Badge>
  //   ),
  // },
  {
    key: 'createdAt',
    label: 'Created',
    className: 'w-32 text-xs',
    sortable: CUSTOMER_SESSION_SORTABLE_FIELDS.includes('createdAt' as CustomerSessionSortableField),
    filterable: false,
    render: (value: Date) => <span className="text-xs text-muted-foreground">{format(new Date(value), 'MMM dd, HH:mm')}</span>,
  },
];
