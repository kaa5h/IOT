import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatRelativeTime } from '../../lib/utils';
import { Plus, Clock, CheckCircle2, XCircle, FileText, AlertCircle } from 'lucide-react';
import type { RequestStatus } from '../../types';

export const RequestsList: React.FC = () => {
  const navigate = useNavigate();
  const { currentUserRole, dataPointRequests } = useStore();

  const filteredRequests = useMemo(() => {
    if (currentUserRole === 'OT') {
      // OT sees requests pending their action or ones they filled
      return dataPointRequests.filter(
        (r) => r.status === 'pending_ot' || r.filledBy
      );
    } else {
      // IT sees all requests
      return dataPointRequests;
    }
  }, [dataPointRequests, currentUserRole]);

  const statusConfig: Record<RequestStatus, { label: string; color: string; icon: any }> = {
    pending_ot: { label: 'Pending OT', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    filled_by_ot: { label: 'Filled by OT', color: 'bg-blue-100 text-blue-800', icon: FileText },
    generating_scf: { label: 'Generating SCF', color: 'bg-purple-100 text-purple-800', icon: Clock },
    pending_review: { label: 'Pending Review', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
    approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
    deployed: { label: 'Deployed', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  };

  const getActionButton = (request: any) => {
    if (currentUserRole === 'OT' && request.status === 'pending_ot') {
      return (
        <Button
          size="sm"
          onClick={() => navigate(`/requests/${request.id}/fill`)}
        >
          Fill Data Points
        </Button>
      );
    }

    if (currentUserRole === 'IT' && request.status === 'pending_review') {
      return (
        <Button
          size="sm"
          onClick={() => navigate(`/requests/${request.id}/review`)}
        >
          Review SCF
        </Button>
      );
    }

    if (currentUserRole === 'IT' && request.status === 'filled_by_ot') {
      return (
        <Button
          size="sm"
          onClick={() => navigate(`/requests/${request.id}/generate`)}
        >
          Generate SCF
        </Button>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Point Requests</h1>
          <p className="text-gray-600 mt-1">
            {currentUserRole === 'IT'
              ? 'Manage data point requests from OT engineers'
              : 'View and fill data point requests from IT'}
          </p>
        </div>
        {currentUserRole === 'IT' && (
          <Button size="lg" onClick={() => navigate('/requests/create')}>
            <Plus className="h-5 w-5 mr-2" />
            Create Request
          </Button>
        )}
      </div>

      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
            <p className="text-gray-600 mb-4">
              {currentUserRole === 'IT'
                ? 'Create a request to ask OT for machine data points'
                : 'No pending requests from IT at the moment'}
            </p>
            {currentUserRole === 'IT' && (
              <Button onClick={() => navigate('/requests/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Request
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRequests.map((request) => {
            const config = statusConfig[request.status];
            const Icon = config.icon;

            return (
              <Card key={request.id} hover>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {request.machineName}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
                        >
                          <Icon className="h-3 w-3 mr-1" />
                          {config.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-600">Type:</span>
                          <span className="ml-2 font-medium">{request.machineType}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Location:</span>
                          <span className="ml-2 font-medium">{request.location}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Protocol:</span>
                          <span className="ml-2 font-medium">{request.protocol.toUpperCase()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Data Points:</span>
                          <span className="ml-2 font-medium">{request.dataPoints.length}</span>
                        </div>
                      </div>

                      {request.description && (
                        <p className="text-sm text-gray-600 mb-3">{request.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Requested by {request.requestedBy}</span>
                        <span>•</span>
                        <span>{formatRelativeTime(request.requestedAt)}</span>
                        {request.filledBy && (
                          <>
                            <span>•</span>
                            <span>Filled by {request.filledBy}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="ml-4">
                      {getActionButton(request)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
