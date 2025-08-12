'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { formatDistance } from 'date-fns';

interface InspectionRequest {
  id: string;
  request_id: string;
  will_participate: boolean | null;
  request: {
    id: string;
    address: string;
    category: string;
    description: string;
    inspection_date: string;
    status: string;
    customer: {
      name: string;
    };
  };
}

export function InspectionParticipation() {
  const [inspectionRequests, setInspectionRequests] = useState<InspectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchInspectionRequests();
  }, []);

  const fetchInspectionRequests = async () => {
    try {
      const response = await fetch('/api/contractor/inspection-requests');
      if (response.ok) {
        const data = await response.json();
        setInspectionRequests(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch inspection requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleParticipation = async (requestId: string, willParticipate: boolean) => {
    setUpdating(requestId);
    try {
      const response = await fetch('/api/contractor/inspection-interest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request_id: requestId,
          will_participate: willParticipate,
        }),
      });

      if (response.ok) {
        // Update local state
        setInspectionRequests(prev =>
          prev.map(item =>
            item.request_id === requestId
              ? { ...item, will_participate: willParticipate }
              : item
          )
        );
      }
    } catch (error) {
      console.error('Failed to update participation:', error);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingInspections = inspectionRequests.filter(
    item => item.will_participate === null && item.request.status === 'INSPECTION_SCHEDULED'
  );

  const confirmedInspections = inspectionRequests.filter(
    item => item.will_participate === true
  );

  return (
    <div className="space-y-6">
      {/* Pending Inspection Invitations */}
      {pendingInspections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Pending Inspection Invitations
            </CardTitle>
            <CardDescription>
              Please confirm your participation for upcoming site visits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingInspections.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="font-medium">{item.request.customer.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {item.request.address}
                    </p>
                  </div>
                  <Badge variant="outline">{item.request.category}</Badge>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Inspection on{' '}
                    {new Date(item.request.inspection_date).toLocaleDateString()}
                  </span>
                  <span className="text-muted-foreground">
                    ({formatDistance(new Date(item.request.inspection_date), new Date(), {
                      addSuffix: true,
                    })})
                  </span>
                </div>

                <p className="text-sm text-muted-foreground">
                  {item.request.description}
                </p>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => handleParticipation(item.request_id, true)}
                    disabled={updating === item.request_id}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Will Attend
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleParticipation(item.request_id, false)}
                    disabled={updating === item.request_id}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Cannot Attend
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Confirmed Inspections */}
      {confirmedInspections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Confirmed Inspections
            </CardTitle>
            <CardDescription>
              You&apos;ve confirmed participation for these site visits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {confirmedInspections.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{item.request.customer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.request.address}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{item.request.category}</Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(item.request.inspection_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {item.request.status === 'BIDDING_OPEN' && (
                  <div className="pt-2">
                    <Button size="sm" className="w-full">
                      <Clock className="h-4 w-4 mr-1" />
                      Submit Bid
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {pendingInspections.length === 0 && confirmedInspections.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No inspection invitations at this time
          </CardContent>
        </Card>
      )}
    </div>
  );
}