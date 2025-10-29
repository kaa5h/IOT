import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatRelativeTime } from '../../lib/utils';
import {
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  Sparkles,
  Edit,
  Rocket,
  AlertCircle,
} from 'lucide-react';
import type { CollaborationStatus } from '../../types';

const statusConfig: Record<CollaborationStatus, { label: string; color: string; icon: any }> = {
  ot_data_provided: { label: 'OT Data Provided', color: 'bg-blue-100 text-blue-800', icon: Clock },
  it_draft_created: { label: 'Draft Created', color: 'bg-purple-100 text-purple-800', icon: FileText },
  llm_enhancing: { label: 'LLM Enhancing', color: 'bg-yellow-100 text-yellow-800', icon: Sparkles },
  llm_enhanced: { label: 'LLM Enhanced', color: 'bg-indigo-100 text-indigo-800', icon: Sparkles },
  it_refining: { label: 'IT Refining', color: 'bg-orange-100 text-orange-800', icon: Edit },
  ready_to_deploy: { label: 'Ready to Deploy', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  deploying: { label: 'Deploying', color: 'bg-cyan-100 text-cyan-800', icon: Rocket },
  deployed: { label: 'Deployed', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-800', icon: AlertCircle },
};

export const CollaborationList: React.FC = () => {
  const navigate = useNavigate();
  const { otRequests, currentUserRole } = useStore();

  // Filter requests based on role
  const filteredRequests = useMemo(() => {
    if (currentUserRole === 'OT') {
      // OT sees only their own requests
      return otRequests.filter((r) => r.requestedBy === 'OT User');
    }
    // IT sees all requests
    return otRequests;
  }, [otRequests, currentUserRole]);

  const getActionButton = (request: any) => {
    const { status, id } = request;

    // IT actions
    if (currentUserRole === 'IT') {
      if (status === 'ot_data_provided') {
        return (
          <Button size="sm" onClick={() => navigate(`/collaboration/${id}/it-draft`)}>
            <FileText className="h-4 w-4 mr-1" />
            Create Draft
          </Button>
        );
      }
      if (status === 'it_draft_created') {
        return (
          <Button size="sm" onClick={() => navigate(`/collaboration/${id}/llm-enhance`)}>
            <Sparkles className="h-4 w-4 mr-1" />
            Enhance with LLM
          </Button>
        );
      }
      if (status === 'llm_enhanced') {
        return (
          <Button size="sm" onClick={() => navigate(`/collaboration/${id}/refine`)}>
            <Edit className="h-4 w-4 mr-1" />
            Refine Manually
          </Button>
        );
      }
      if (status === 'ready_to_deploy') {
        return (
          <Button size="sm" onClick={() => navigate(`/collaboration/${id}/deploy`)}>
            <Rocket className="h-4 w-4 mr-1" />
            Deploy
          </Button>
        );
      }
    }

    // OT actions - mostly view only
    if (currentUserRole === 'OT') {
      if (status === 'deployed') {
        return (
          <Button variant="outline" size="sm" onClick={() => navigate(`/machines/${request.machineId}`)}>
            View Machine
          </Button>
        );
      }
      return (
        <Button variant="outline" size="sm" onClick={() => navigate(`/collaboration/${id}`)}>
          View Details
        </Button>
      );
    }

    return null;
  };

  const StatusBadge: React.FC<{ status: CollaborationStatus }> = ({ status }) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">IT/OT Collaboration</h1>
          <p className="text-gray-600 mt-1">
            {currentUserRole === 'IT'
              ? 'Manage OT requests and create SCF configurations'
              : 'Track your requests and view deployment status'}
          </p>
        </div>
        {currentUserRole === 'OT' && (
          <Button onClick={() => navigate('/collaboration/ot-request')}>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">
              {filteredRequests.length}
            </div>
            <div className="text-sm text-gray-600">Total Requests</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredRequests.filter((r) => ['ot_data_provided', 'it_draft_created', 'llm_enhancing'].includes(r.status)).length}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {filteredRequests.filter((r) => r.status === 'deployed').length}
            </div>
            <div className="text-sm text-gray-600">Deployed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {filteredRequests.filter((r) => r.status === 'failed').length}
            </div>
            <div className="text-sm text-gray-600">Failed</div>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Requests Yet</h3>
            <p className="text-gray-600 mb-4">
              {currentUserRole === 'OT'
                ? 'Create your first request to get started'
                : 'Waiting for OT to submit requests'}
            </p>
            {currentUserRole === 'OT' && (
              <Button onClick={() => navigate('/collaboration/ot-request')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Request
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.machineName}
                          </h3>
                          <StatusBadge status={request.status} />
                          <Badge>{request.requestType.replace('_', ' ')}</Badge>
                        </div>

                        <p className="text-sm text-gray-600 mb-3">
                          {request.operationalData.description}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Type:</span>
                            <span className="ml-2 font-medium">{request.machineType}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Location:</span>
                            <span className="ml-2 font-medium">{request.location}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Protocol:</span>
                            <span className="ml-2 font-medium">{request.protocol.toUpperCase()}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Requested:</span>
                            <span className="ml-2 font-medium">
                              {formatRelativeTime(request.requestedAt)}
                            </span>
                          </div>
                        </div>

                        {request.status === 'deployed' && request.deployedAt && (
                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                            <span className="text-green-800 font-medium">
                              ✓ Deployed {formatRelativeTime(request.deployedAt)}
                            </span>
                          </div>
                        )}

                        {request.status === 'failed' && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
                            <span className="text-red-800 font-medium">⚠ Deployment failed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="ml-4">{getActionButton(request)}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
