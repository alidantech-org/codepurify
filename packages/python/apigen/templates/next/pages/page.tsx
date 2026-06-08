// Core UI components
import ReusableAppBar from '@/components/_core/reusable-appbar';
import { DataTable } from '@/components/_core/data-table';
import { TableFilters } from '@/components/_core/table-filters';

// Customer-specific components
import { ViewToggle } from '@/components/customer/actions/view-toggle';
import { customerColumns } from '@/components/customer/columns/customer';
import { customerSessionColumns } from '@/components/customer/columns/session';
import { CreateCustomerButton } from '@/components/customer/forms/create-customer';

// Server resource functions
import { getCustomers } from '@/server/resources/customer/customer';
import { getCustomerSessions } from '@/server/resources/customer/customer-session';

// Server resource types
import { CustomerListResponse } from '@/server/resources/customer/customer/action.type';
import { CustomerSessionListResponse } from '@/server/resources/customer/customer-session/action.type';

type Props = {
  searchParams: Promise<{
    showSessions?: string;
  }>;
};

export const dynamic = 'force-dynamic';

export default async function CustomersPage(props: Props) {
  const searchParams = await props.searchParams;

  const showSessions = searchParams.showSessions === 'true';
  const { showSessions: _, ...queryParams } = searchParams;

  // Fetch data based on the current view
  const response = showSessions
    ? await getCustomerSessions({
        ...queryParams,
        relations: ['customer'],
      })
    : await getCustomers(queryParams);

  const data = response.body as CustomerListResponse | CustomerSessionListResponse;

  // Transform pagination data to match the expected format
  const pagination = {
    page: data?.pagination?.page || 1,
    limit: data?.pagination?.limit || 20,
    total: data?.pagination?.total || 0,
    totalPages: data?.pagination?.totalPages || 1,
  };

  // Convert search params to record format for TableFilters
  const resolvedSearchParams: Record<string, string> =
    typeof searchParams === 'object'
      ? Object.fromEntries(
          Object.entries(searchParams)
            .filter(([_, value]) => value !== undefined)
            .map(([key, value]) => [key, Array.isArray(value) ? value[0] || '' : value || '']),
        )
      : {};

  // Determine data based on current view
  const sessionData = (data as CustomerSessionListResponse)?.customerSessions || [];
  const customerData = (data as CustomerListResponse)?.customers || [];
  const searchPlaceholder = showSessions ? 'Search sessions...' : 'Search customers...';

  return (
    <>
      <ReusableAppBar
        className="w-full max-w-6xl"
        children={
          <div className="w-full">
            {showSessions ? (
              <TableFilters columns={customerSessionColumns} filters={resolvedSearchParams} searchPlaceholder={searchPlaceholder} />
            ) : (
              <TableFilters columns={customerColumns} filters={resolvedSearchParams} searchPlaceholder={searchPlaceholder} />
            )}
          </div>
        }
        endElement={
          <div className="hidden md:flex items-center gap-2">
            <ViewToggle />
            <CreateCustomerButton />
          </div>
        }
      />

      {showSessions ? (
        <DataTable
          data={sessionData}
          columns={customerSessionColumns}
          pagination={pagination}
          filters={resolvedSearchParams}
          className="py-5 mx-auto w-full max-w-6xl px-2 md:px-4"
          emptyMessage="No sessions found."
        />
      ) : (
        <DataTable
          data={customerData}
          columns={customerColumns}
          pagination={pagination}
          filters={resolvedSearchParams}
          className="py-5 mx-auto w-full max-w-6xl px-2 md:px-4"
          emptyMessage="No customers found."
        />
      )}
    </>
  );
}
