'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Mail, Phone, CirclePlus } from 'lucide-react';

import { toast } from 'sonner';
import { ICustomer } from '@/server/types/entities/customer';
import { getCustomers } from '@/server/resources/customer/customer';
import { CreateCustomerModal } from '@/components/customer/forms/create-customer';
import { IBaseQueryDto } from '@/server/types/entities/base.types';
import { ESortOrder } from '@/server/types/enums/base';

interface CustomerSelectorProps {
  eventId: string;
  excludeCustomerId?: string;
  onCustomerSelected: (customer: ICustomer) => void;
  className?: string;
}

export function CustomerSelector({ eventId, excludeCustomerId, onCustomerSelected, className = '' }: CustomerSelectorProps) {
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [query, setQuery] = useState<IBaseQueryDto<ICustomer>>({
    page: 1,
    limit: 20,
    sortBy: 'firstName',
    sortOrder: [ESortOrder.ASC],
    search: '',
  });
  const [createCustomerOpen, setCreateCustomerOpen] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Reset and fetch when search or sort changes
  useEffect(() => {
    if (query.page === 1) {
      fetchCustomers();
    }
  }, [query.search, query.sortBy, query.sortOrder]);

  // Intersection Observer for infinite scroll
  const loadMoreCustomers = useCallback(async () => {
    if (hasMore && !loading && !loadingMore) {
      const nextPage = (query.page || 1) + 1;
      setQuery((prev) => ({ ...prev, page: nextPage }));
      await fetchCustomers(true);
    }
  }, [hasMore, loading, loadingMore, query.page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMoreCustomers();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, loadMoreCustomers]);

  const fetchCustomers = async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    try {
      const { body: response } = await getCustomers(query);

      if (response && response.customers) {
        // Filter out the current customer by email if excludeCustomerId is provided
        let filteredCustomers = response.customers;

        // If we have an excludeCustomerId, we need to find the customer first to get their email
        if (excludeCustomerId) {
          // Find the excluded customer to get their email for filtering
          const excludedCustomer = response.customers.find((c) => c.id === excludeCustomerId);
          if (excludedCustomer && excludedCustomer.email) {
            filteredCustomers = response.customers.filter((customer) => customer.email !== excludedCustomer.email);
          }
        }

        if (isLoadMore) {
          setCustomers((prev) => [...prev, ...filteredCustomers]);
        } else {
          setCustomers(filteredCustomers);
        }

        // Check if there are more pages
        const totalPages = response.pagination?.totalPages || 1;
        const currentPage = response.pagination?.page || 1;
        setHasMore(currentPage < totalPages);
      } else {
        if (!isLoadMore) {
          setCustomers([]);
        }
        setHasMore(false);
      }
    } catch (error) {
      toast.error('Failed to fetch customers');
      console.error('Error fetching customers:', error);
      if (!isLoadMore) {
        setCustomers([]);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Emit selected customer to parent whenever selection changes
  const emitSelectedCustomer = useCallback(() => {
    const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId);
    if (selectedCustomer) {
      onCustomerSelected(selectedCustomer);
    }
  }, [selectedCustomerId, customers, onCustomerSelected]);

  useEffect(() => {
    emitSelectedCustomer();
  }, [emitSelectedCustomer]);

  const handleCustomerSelection = (customerId: string) => {
    setSelectedCustomerId(customerId);
  };

  const handleSort = (field: keyof ICustomer) => {
    setQuery((prev) => {
      const currentSortBy = Array.isArray(prev.sortBy) ? prev.sortBy[0] : prev.sortBy;
      const currentSortOrder = prev.sortOrder?.[0] || ESortOrder.ASC;

      if (currentSortBy === field) {
        return {
          ...prev,
          sortOrder: [currentSortOrder === ESortOrder.ASC ? ESortOrder.DESC : ESortOrder.ASC],
          page: 1,
        };
      } else {
        return {
          ...prev,
          sortBy: field,
          sortOrder: [ESortOrder.ASC],
          page: 1,
        };
      }
    });
  };


  const handleCustomerCreated = (customer: ICustomer) => {
    // Refresh the customer list
    setQuery((prev) => ({ ...prev, page: 1 }));
    fetchCustomers();
    // Auto-select the newly created customer
    setSelectedCustomerId(customer.id);
    onCustomerSelected(customer);
  };

  return (
    <div className={`flex flex-col h-full mt-2 ${className}`}>
      {/* <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-sm font-medium">Select Customer</h3>
        <div className="text-sm text-muted-foreground">
          {selectedCustomerId ? "1 selected" : "None selected"}
        </div>
      </div> */}

      {/* Search and Filters */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={query.search || ''}
            onChange={(e) => setQuery((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
            className="pl-10 rounded"
          />
        </div>
        <Button variant="default" size="sm" onClick={() => setCreateCustomerOpen(true)} className="gap-1 rounded">
          <CirclePlus className="h-3 w-3" />
          Create
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2 text-sm text-muted-foreground">Loading customers...</span>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-2">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className={`flex items-center gap-3 p-3 rounded-sm border cursor-pointer transition-all hover:bg-muted/50 hover:shadow-sm ${
                  selectedCustomerId === customer.id ? 'bg-primary/5 border-primary/50' : 'bg-background border-border'
                }`}
                onClick={() => handleCustomerSelection(customer.id)}
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-muted">
                    <img
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${customer.firstName} ${customer.lastName}`}
                      alt={`${customer.firstName} ${customer.lastName}`}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.dataset.fallback) {
                          parent.dataset.fallback = 'true';
                          const initials =
                            `${customer.firstName?.charAt(0) || ''}${customer.lastName?.charAt(0) || customer.email?.charAt(0) || ''}`
                              .toUpperCase()
                              .slice(0, 2);
                          parent.innerHTML = `<div class="h-full w-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">${initials}</div>`;
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Customer Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">
                      {customer.firstName} {customer.lastName}
                    </h4>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                    {customer.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Radio button */}
                <div className="flex items-center">
                  <Checkbox
                    checked={selectedCustomerId === customer.id}
                    onChange={() => handleCustomerSelection(customer.id)}
                    className="pointer-events-none"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Load more trigger for infinite scroll */}
          {hasMore && customers.length > 0 && (
            <div ref={loadMoreRef} className="py-4 flex justify-center">
              {loadingMore && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading more customers...
                </div>
              )}
            </div>
          )}

          {/* End of list message */}
          {!hasMore && customers.length > 0 && (
            <div className="py-4 text-center text-sm text-muted-foreground">
              Showing all {customers.length} customers
            </div>
          )}
        </div>
      )}

      {/* Create Customer Modal */}
      <CreateCustomerModal open={createCustomerOpen} onOpenChange={setCreateCustomerOpen} onCustomerCreated={handleCustomerCreated} />
    </div>
  );
}
