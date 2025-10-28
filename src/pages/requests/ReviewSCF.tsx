import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  Calendar,
  Rocket,
} from 'lucide-react';
import { formatRelativeTime } from '../../lib/utils';

export const ReviewSCF: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { dataPointRequests, updateRequest, addMachine } = useStore();

  const request = dataPointRequests.find((r) => r.id === id);
  const [comments, setComments] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showDeployConfirm, setShowDeployConfirm] = useState(false);

  if (!request || !request.scf) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Request or SCF not found</p>
        <Button onClick={() => navigate('/requests')} className="mt-4">
          Back to Requests
        </Button>
      </div>
    );
  }

  const handleApprove = () => {
    setIsApproving(true);
    setTimeout(() => {
      updateRequest(request.id, {
        status: 'approved',
        reviewedBy: 'IT User',
        reviewedAt: new Date().toISOString(),
        reviewComments: comments || 'Approved',
      });
      setIsApproving(false);
      setShowDeployConfirm(true);
    }, 500);
  };

  const handleReject = () => {
    if (!comments.trim()) {
      alert('Please provide rejection comments');
      return;
    }

    setIsRejecting(true);
    setTimeout(() => {
      updateRequest(request.id, {
        status: 'rejected',
        reviewedBy: 'IT User',
        reviewedAt: new Date().toISOString(),
        reviewComments: comments,
      });
      setIsRejecting(false);
      navigate('/requests');
    }, 500);
  };

  const handleDeploy = () => {
    // Create machine from SCF data
    const newMachine = {
      id: `machine-${Date.now()}`,
      name: request.machineName,
      type: request.machineType,
      location: request.location,
      description: request.description || '',
      protocol: {
        type: request.protocol,
        config: {}, // Would be parsed from SCF in real implementation
      },
      status: 'deploying' as const,
      dataPoints: request.dataPoints,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    addMachine(newMachine);

    // Update request status to deployed
    updateRequest(request.id, {
      status: 'deployed',
      machineId: newMachine.id,
    });

    // Simulate deployment
    setTimeout(() => {
      navigate(`/machines/${newMachine.id}`);
    }, 1000);
  };

  const getStatusBadge = () => {
    if (request.status === 'pending_review') {
      return <Badge className="bg-orange-100 text-orange-800">Pending Review</Badge>;
    } else if (request.status === 'approved') {
      return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
    } else if (request.status === 'rejected') {
      return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/requests')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Requests
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Review Service Commissioning File</h1>
            <p className="text-gray-600 mt-1">
              Peer review the LLM-generated SCF before deployment
            </p>
          </div>
          {getStatusBadge()}
        </div>
      </div>

      {/* Request Details Card */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Machine Name:</span>
              <span className="ml-2 font-medium">{request.machineName}</span>
            </div>
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
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Filled by:</span>
                <span className="font-medium">{request.filledBy}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Filled:</span>
                <span className="font-medium">{formatRelativeTime(request.filledAt!)}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Generated by:</span>
                <span className="font-medium">{request.scf.generatedBy} (LLM)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Points Used */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Data Points ({request.dataPoints.length})
          </h2>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      Address
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      Access
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      Polling
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {request.dataPoints.map((dp) => (
                    <tr key={dp.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{dp.name}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">{dp.address}</td>
                      <td className="px-4 py-3 text-sm">{dp.dataType}</td>
                      <td className="px-4 py-3 text-sm">{dp.access}</td>
                      <td className="px-4 py-3 text-sm">{dp.pollingRate}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated SCF */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Generated Service Commissioning File (YAML)
          </h2>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-100 font-mono whitespace-pre">
              {request.scf.yaml}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Review Actions */}
      {request.status === 'pending_review' && !showDeployConfirm && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Decision</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments (Optional for approval, required for rejection)
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Add your review comments here..."
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleApprove}
                disabled={isApproving || isRejecting}
                loading={isApproving}
                className="flex-1"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve SCF
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                disabled={isApproving || isRejecting}
                loading={isRejecting}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject SCF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deploy Confirmation */}
      {(request.status === 'approved' || showDeployConfirm) && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900 mb-1">SCF Approved</h3>
                <p className="text-sm text-green-800">
                  The Service Commissioning File has been approved and is ready for deployment.
                </p>
                {request.reviewComments && (
                  <p className="text-sm text-green-700 mt-2">
                    <span className="font-medium">Comments:</span> {request.reviewComments}
                  </p>
                )}
              </div>
            </div>

            <Button onClick={handleDeploy} size="lg" className="w-full">
              <Rocket className="h-5 w-5 mr-2" />
              Deploy to Machine
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Rejection Info */}
      {request.status === 'rejected' && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">SCF Rejected</h3>
                <p className="text-sm text-red-800 mb-2">
                  This Service Commissioning File has been rejected during peer review.
                </p>
                {request.reviewComments && (
                  <div className="mt-3 p-3 bg-white rounded border border-red-200">
                    <p className="text-sm font-medium text-red-900 mb-1">Rejection Reason:</p>
                    <p className="text-sm text-red-800">{request.reviewComments}</p>
                  </div>
                )}
                <div className="mt-3 text-sm text-red-700">
                  <span className="font-medium">Reviewed by:</span> {request.reviewedBy}
                  {' • '}
                  <span>{formatRelativeTime(request.reviewedAt!)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
