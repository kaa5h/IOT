import React, { useState, useEffect } from 'react';
import { Modal, ModalBody, ModalFooter } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Loader2, ChevronRight, ChevronDown, Folder, FileText } from 'lucide-react';
import type { DeviceNode } from '../../types';
import { sleep } from '../../lib/utils';

interface DeviceBrowsingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (nodes: DeviceNode[]) => void;
  endpoint: string;
}

// Mock device tree structure
const mockDeviceTree: DeviceNode[] = [
  {
    id: '1',
    name: 'Device Root',
    address: 'ns=0;i=85',
    dataType: 'String',
    isFolder: true,
    selected: false,
    children: [
      {
        id: '1-1',
        name: 'Sensors',
        address: 'ns=2;s=Device.Sensors',
        dataType: 'String',
        isFolder: true,
        selected: false,
        children: [
          {
            id: '1-1-1',
            name: 'Temperature',
            address: 'ns=2;s=Device.Sensors.Temp',
            dataType: 'Float',
            isFolder: false,
            selected: false,
          },
          {
            id: '1-1-2',
            name: 'Pressure',
            address: 'ns=2;s=Device.Sensors.Press',
            dataType: 'Float',
            isFolder: false,
            selected: false,
          },
          {
            id: '1-1-3',
            name: 'Humidity',
            address: 'ns=2;s=Device.Sensors.Hum',
            dataType: 'Float',
            isFolder: false,
            selected: false,
          },
        ],
      },
      {
        id: '1-2',
        name: 'Actuators',
        address: 'ns=2;s=Device.Actuators',
        dataType: 'String',
        isFolder: true,
        selected: false,
        children: [
          {
            id: '1-2-1',
            name: 'Valve1',
            address: 'ns=2;s=Device.Actuators.V1',
            dataType: 'Boolean',
            isFolder: false,
            selected: false,
          },
          {
            id: '1-2-2',
            name: 'Motor1',
            address: 'ns=2;s=Device.Actuators.M1',
            dataType: 'Float',
            isFolder: false,
            selected: false,
          },
        ],
      },
    ],
  },
];

const TreeNode: React.FC<{
  node: DeviceNode;
  level: number;
  onToggle: (id: string) => void;
  expanded: Set<string>;
}> = ({ node, level, onToggle, expanded }) => {
  const [isSelected, setIsSelected] = useState(node.selected || false);

  const toggleSelected = () => {
    node.selected = !isSelected;
    setIsSelected(!isSelected);
  };

  return (
    <div>
      <div
        className="flex items-center gap-2 py-1.5 px-2 hover:bg-gray-50 rounded"
        style={{ paddingLeft: `${level * 20 + 8}px` }}
      >
        {node.isFolder && (
          <button onClick={() => onToggle(node.id)} className="text-gray-600">
            {expanded.has(node.id) ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
        {!node.isFolder && <div className="w-4" />}

        <input
          type="checkbox"
          checked={isSelected}
          onChange={toggleSelected}
          className="rounded border-gray-300 text-primary focus:ring-primary"
          disabled={node.isFolder}
        />

        {node.isFolder ? (
          <Folder className="h-4 w-4 text-gray-600" />
        ) : (
          <FileText className="h-4 w-4 text-gray-600" />
        )}

        <span className="text-sm text-gray-900">{node.name}</span>
        <span className="text-xs text-gray-500">({node.dataType})</span>
        {!node.isFolder && (
          <span className="text-xs text-gray-400 font-mono ml-auto">{node.address}</span>
        )}
      </div>

      {node.isFolder && expanded.has(node.id) && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onToggle={onToggle}
              expanded={expanded}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const DeviceBrowsingModal: React.FC<DeviceBrowsingModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  endpoint,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [deviceTree, setDeviceTree] = useState<DeviceNode[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['1', '1-1', '1-2']));
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      sleep(2000).then(() => {
        setDeviceTree(mockDeviceTree);
        setIsLoading(false);
      });
    }
  }, [isOpen]);

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };

  const getSelectedNodes = (nodes: DeviceNode[]): DeviceNode[] => {
    let selected: DeviceNode[] = [];
    for (const node of nodes) {
      if (!node.isFolder && node.selected) {
        selected.push(node);
      }
      if (node.children) {
        selected = [...selected, ...getSelectedNodes(node.children)];
      }
    }
    return selected;
  };

  const handleAddSelected = () => {
    const selected = getSelectedNodes(deviceTree);
    onSelect(selected);
  };

  const selectedCount = getSelectedNodes(deviceTree).length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Browsing: ${endpoint}`} size="lg">
      <ModalBody>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <span className="ml-3 text-gray-600">Browsing device...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="border border-gray-200 rounded-lg p-3 max-h-96 overflow-y-auto">
              {deviceTree.map((node) => (
                <TreeNode
                  key={node.id}
                  node={node}
                  level={0}
                  onToggle={toggleExpanded}
                  expanded={expanded}
                />
              ))}
            </div>
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleAddSelected} disabled={selectedCount === 0 || isLoading}>
          Add Selected ({selectedCount})
        </Button>
      </ModalFooter>
    </Modal>
  );
};
