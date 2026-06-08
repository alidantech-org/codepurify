// Next.js
import Link from 'next/link';

// UI components
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Icons
import { CalendarDays, Mail, MapPin, Phone, User, Ticket, Calendar, ShoppingCart } from 'lucide-react';

// Server actions
import { getCustomerById } from '@/server/resources/customer/customer';

// Utilities
import { pages } from '@/lib/constants';
import { getDicebearUrl } from '@/lib/utils';

interface DetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function DetailsPage({ params }: DetailsPageProps) {
  const { id } = await params;
  const response = await getCustomerById(id, ['user', 'sessions']);
  const customer = response?.body?.customer;

  if (!customer) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Customer not found</p>
      </div>
    );
  }

  const fullName = `${customer.firstName} ${customer.lastName}`;
  const userFullName = customer.user ? `${customer.user.firstName} ${customer.user.lastName}` : 'N/A';
  const dob = customer.dob
    ? new Date(customer.dob).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  return (
    <>
      <div className="container max-w-5xl py-5 space-y-5 px-2 md:px-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-6">
          <Card className="flex-1 p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={customer.user?.avatar} alt={fullName} />
                <AvatarFallback className="p-0">
                  <img src={getDicebearUrl(fullName)} alt={fullName} className="h-full w-full" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">{fullName}</h1>
                    <p className="text-muted-foreground">Customer ID: {customer.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={pages.customers.orders(id)}>
                      <Button variant="outline" className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        View Orders
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {customer.gender || 'N/A'}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {dob}
                  </Badge>
                  {customer.user && (
                    <Badge variant={customer.user.status === 'active' ? 'default' : 'secondary'}>{customer.user.status}</Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Contact Information */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </div>
              <p>{customer.email || 'N/A'}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>Phone</span>
              </div>
              <p>{customer.phone || 'N/A'}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Location</span>
              </div>
              <p>
                {[customer.streetAndHseNo, customer.city, customer.state, customer.country, customer.zipcode].filter(Boolean).join(', ') ||
                  'N/A'}
              </p>
            </div>
          </div>
        </Card>

        {/* User Account Information */}
        {customer.user && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">User Account</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>Name</span>
                </div>
                <p>{userFullName}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </div>
                <p>{customer.user.email || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>Phone</span>
                </div>
                <p>{customer.user.phone || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="w-4 h-4" />
                  <span>Member Since</span>
                </div>
                <p>
                  {customer.user.createdAt
                    ? new Date(customer.user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'N/A'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Additional Customer Information */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Ticket className="w-4 h-4" />
                <span>Total Tickets</span>
              </div>
              <p>{customer.ticketCount || 'N/A'}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Total Events</span>
              </div>
              <p>{customer.eventCount || 'N/A'}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                <span>NFT Wallet Address</span>
              </div>
              <p>{customer.nftWalletAddress || 'N/A'}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="w-4 h-4" />
                <span>Created At</span>
              </div>
              <p>
                {customer.createdAt
                  ? new Date(customer.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="w-4 h-4" />
                <span>Last Updated</span>
              </div>
              <p>
                {customer.updatedAt
                  ? new Date(customer.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
