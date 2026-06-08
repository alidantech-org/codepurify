import { getOrders } from '@/server/resources/commerce/order';
import type { OrderRelationKey } from '@/server/types/entities/commerce';
import { DataTable } from '@/components/_core/data-table';
import { TableFilters } from '@/components/_core/table-filters';
import { eventOrdersColumns } from '@/components/event/columns/order';
import { Metadata } from 'next';
import ReusableAppBar from '@/components/_core/reusable-appbar';
import { customerOrdersColumns } from '@/components/customer/columns/order';

export const metadata: Metadata = {
  title: 'Orders',
  description: 'Manage orders for your events',
};

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const dynamic = 'force-dynamic';

export default async function OrdersPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const query = await searchParams;

  // Remove tab parameter from query before sending to backend
  const { tab, ...backendQuery } = query as any;

  // Add relations to fetch customer and other related data
  const data = await getOrders({
    ...backendQuery,
    customerId: id,
  });

  // Transform pagination data to match the expected format
  const pagination = {
    page: data?.body?.pagination?.page || 1,
    limit: data?.body?.pagination?.limit || 20,
    total: data?.body?.pagination?.total || 0,
    totalPages: data?.body?.pagination?.totalPages || 0,
  };

  // Convert search params to record format for TableFilters
  const resolvedSearchParams: Record<string, string> =
    typeof query === 'object'
      ? Object.fromEntries(
          Object.entries(query)
            .filter(([_, value]) => value !== undefined)
            .map(([key, value]) => [key, Array.isArray(value) ? value[0] || '' : value || '']),
        )
      : {};

  return (
    <>
      <ReusableAppBar
        className="max-w-6xl"
        children={
          <div className="w-full">
            <TableFilters columns={customerOrdersColumns} filters={resolvedSearchParams} searchPlaceholder="Search orders..." />
          </div>
        }
        endElement={null}
      />

      <DataTable
        data={data?.body?.orders || []}
        columns={customerOrdersColumns}
        pagination={pagination}
        filters={resolvedSearchParams}
        className="py-5 mx-auto w-full max-w-6xl px-2 md:px-4"
        emptyMessage="No orders found for this customer."
      />
    </>
  );
}
