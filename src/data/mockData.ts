import type { Machine, Template, DataPoint } from '../types';

// Helper to generate data points
const generateDataPoints = (count: number, prefix: string): DataPoint[] => {
  const types: Array<'Float' | 'Int32' | 'Boolean' | 'String'> = ['Float', 'Int32', 'Boolean', 'String'];
  const access: Array<'read' | 'write' | 'readwrite'> = ['read', 'write', 'readwrite'];

  return Array.from({ length: count }, (_, i) => ({
    id: `dp-${prefix}-${i}`,
    name: `${prefix}_DataPoint_${i + 1}`,
    address: `ns=2;s=Device.${prefix}.Point${i + 1}`,
    dataType: types[i % types.length],
    access: access[i % access.length],
    pollingRate: [100, 500, 1000, 2000][i % 4],
  }));
};

export const mockMachines: Machine[] = [
  {
    id: 'm001',
    name: 'Assembly Line Robot 1',
    type: 'Robot',
    location: 'Production Floor A',
    description: 'Primary assembly robot for automotive parts',
    protocol: {
      type: 'opcua',
      config: {
        endpointUrl: 'opc.tcp://192.168.1.100:4840',
        securityMode: 'Sign',
        securityPolicy: 'Basic256Sha256',
        username: 'admin',
      },
    },
    status: 'connected',
    dataPoints: generateDataPoints(12, 'Robot1'),
    lastUpdated: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), // 30 days ago
  },
  {
    id: 'm002',
    name: 'Temperature Sensor Array',
    type: 'Sensor',
    location: 'Production Floor B',
    description: 'Multi-zone temperature monitoring system',
    protocol: {
      type: 'modbus',
      config: {
        ipAddress: '192.168.1.150',
        port: 502,
        unitId: 1,
      },
    },
    status: 'connected',
    dataPoints: generateDataPoints(8, 'TempSensor'),
    lastUpdated: new Date(Date.now() - 900000).toISOString(), // 15 min ago
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
  {
    id: 'm003',
    name: 'CNC Machine 5',
    type: 'CNC Machine',
    location: 'Machining Center',
    description: 'High-precision CNC milling machine',
    protocol: {
      type: 's7',
      config: {
        ipAddress: '192.168.1.200',
        rack: 0,
        slot: 1,
      },
    },
    status: 'deploying',
    dataPoints: generateDataPoints(25, 'CNC5'),
    lastUpdated: new Date(Date.now() - 60000).toISOString(), // 1 min ago
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: 'm004',
    name: 'Welding Station 3',
    type: 'Robot',
    location: 'Welding Bay',
    description: 'Automated welding robot',
    protocol: {
      type: 'opcua',
      config: {
        endpointUrl: 'opc.tcp://192.168.1.110:4840',
        securityMode: 'None',
        securityPolicy: 'None',
      },
    },
    status: 'connected',
    dataPoints: generateDataPoints(15, 'Welder3'),
    lastUpdated: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
  },
  {
    id: 'm005',
    name: 'Pressure Monitor System',
    type: 'Sensor',
    location: 'Hydraulics Room',
    description: 'Hydraulic pressure monitoring',
    protocol: {
      type: 'modbus',
      config: {
        ipAddress: '192.168.1.155',
        port: 502,
        unitId: 2,
      },
    },
    status: 'error',
    dataPoints: generateDataPoints(6, 'Pressure'),
    lastUpdated: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    id: 'm006',
    name: 'HMI Panel Controller',
    type: 'HMI',
    location: 'Control Room 1',
    description: 'Main control panel interface',
    protocol: {
      type: 'opcua',
      config: {
        endpointUrl: 'opc.tcp://192.168.1.120:4840',
        securityMode: 'SignAndEncrypt',
        securityPolicy: 'Aes256_Sha256_RsaPss',
        username: 'operator',
      },
    },
    status: 'connected',
    dataPoints: generateDataPoints(20, 'HMI'),
    lastUpdated: new Date(Date.now() - 600000).toISOString(), // 10 min ago
    createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
  },
  {
    id: 'm007',
    name: 'IoT Gateway Device',
    type: 'Custom',
    location: 'Data Center',
    description: 'Edge computing gateway for IoT devices',
    protocol: {
      type: 'mqtt',
      config: {
        brokerAddress: '192.168.1.250',
        port: 1883,
        clientId: 'iot-gateway-001',
        username: 'mqtt_user',
      },
    },
    status: 'connected',
    dataPoints: generateDataPoints(30, 'Gateway'),
    lastUpdated: new Date(Date.now() - 300000).toISOString(), // 5 min ago
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'm008',
    name: 'Packaging Line PLC',
    type: 'PLC',
    location: 'Packaging Area',
    description: 'Automated packaging line controller',
    protocol: {
      type: 's7',
      config: {
        ipAddress: '192.168.1.180',
        rack: 0,
        slot: 2,
      },
    },
    status: 'disconnected',
    dataPoints: generateDataPoints(18, 'Packaging'),
    lastUpdated: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
    createdAt: new Date(Date.now() - 86400000 * 75).toISOString(),
  },
  {
    id: 'm009',
    name: 'Quality Control Station',
    type: 'Sensor',
    location: 'QC Department',
    description: 'Automated quality inspection sensors',
    protocol: {
      type: 'opcua',
      config: {
        endpointUrl: 'opc.tcp://192.168.1.130:4840',
        securityMode: 'Sign',
        securityPolicy: 'Basic256Sha256',
      },
    },
    status: 'draft',
    dataPoints: generateDataPoints(10, 'QC'),
    lastUpdated: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'm010',
    name: 'Material Handling Robot',
    type: 'Robot',
    location: 'Warehouse',
    description: 'Automated material transport system',
    protocol: {
      type: 'opcua',
      config: {
        endpointUrl: 'opc.tcp://192.168.1.140:4840',
        securityMode: 'None',
        securityPolicy: 'None',
      },
    },
    status: 'connected',
    dataPoints: generateDataPoints(14, 'MatHandler'),
    lastUpdated: new Date(Date.now() - 1200000).toISOString(), // 20 min ago
    createdAt: new Date(Date.now() - 86400000 * 50).toISOString(),
  },
];

export const mockTemplates: Template[] = [
  {
    id: 't001',
    name: 'Standard OPC UA PLC Configuration',
    description: 'Basic OPC UA setup for industrial PLCs with common data points',
    protocol: 'opcua',
    tags: ['Manufacturing', 'Beginner', 'PLC'],
    machineType: 'PLC',
    config: {
      type: 'PLC',
      protocol: {
        type: 'opcua',
        config: {
          endpointUrl: 'opc.tcp://192.168.1.1:4840',
          securityMode: 'Sign',
          securityPolicy: 'Basic256Sha256',
        },
      },
      dataPoints: [
        {
          name: 'ProductionCount',
          address: 'ns=2;s=PLC.Production.Count',
          dataType: 'Int32',
          access: 'read',
          pollingRate: 1000,
        },
        {
          name: 'MachineStatus',
          address: 'ns=2;s=PLC.Status',
          dataType: 'Boolean',
          access: 'read',
          pollingRate: 500,
        },
        {
          name: 'Temperature',
          address: 'ns=2;s=PLC.Temperature',
          dataType: 'Float',
          access: 'read',
          pollingRate: 2000,
        },
      ],
    },
  },
  {
    id: 't002',
    name: 'Siemens S7-1500 Temperature Monitoring',
    description: 'Temperature monitoring configuration for Siemens S7-1500 PLCs',
    protocol: 's7',
    tags: ['Siemens', 'Intermediate', 'Monitoring'],
    machineType: 'PLC',
    config: {
      type: 'PLC',
      protocol: {
        type: 's7',
        config: {
          ipAddress: '192.168.1.1',
          rack: 0,
          slot: 1,
        },
      },
      dataPoints: [
        {
          name: 'Zone1_Temp',
          address: 'DB1.DBD0',
          dataType: 'Float',
          access: 'read',
          pollingRate: 1000,
        },
        {
          name: 'Zone2_Temp',
          address: 'DB1.DBD4',
          dataType: 'Float',
          access: 'read',
          pollingRate: 1000,
        },
        {
          name: 'TempAlarm',
          address: 'DB1.DBX8.0',
          dataType: 'Boolean',
          access: 'read',
          pollingRate: 500,
        },
      ],
    },
  },
  {
    id: 't003',
    name: 'Modbus Multi-Sensor Setup',
    description: 'Configuration for multiple Modbus TCP sensors',
    protocol: 'modbus',
    tags: ['Sensors', 'Beginner', 'Modbus'],
    machineType: 'Sensor',
    config: {
      type: 'Sensor',
      protocol: {
        type: 'modbus',
        config: {
          ipAddress: '192.168.1.1',
          port: 502,
          unitId: 1,
        },
      },
      dataPoints: [
        {
          name: 'Sensor1_Value',
          address: '40001',
          dataType: 'Float',
          access: 'read',
          pollingRate: 1000,
        },
        {
          name: 'Sensor2_Value',
          address: '40002',
          dataType: 'Float',
          access: 'read',
          pollingRate: 1000,
        },
        {
          name: 'Sensor3_Value',
          address: '40003',
          dataType: 'Float',
          access: 'read',
          pollingRate: 1000,
        },
      ],
    },
  },
  {
    id: 't004',
    name: 'MQTT IoT Gateway Basic',
    description: 'Basic MQTT configuration for IoT edge devices',
    protocol: 'mqtt',
    tags: ['IoT', 'Advanced', 'Gateway'],
    machineType: 'Custom',
    config: {
      type: 'Custom',
      protocol: {
        type: 'mqtt',
        config: {
          brokerAddress: '192.168.1.1',
          port: 1883,
          clientId: 'iot-client-001',
        },
      },
      dataPoints: [
        {
          name: 'DeviceStatus',
          address: 'devices/status',
          dataType: 'String',
          access: 'read',
          pollingRate: 5000,
        },
        {
          name: 'SensorData',
          address: 'sensors/data',
          dataType: 'Float',
          access: 'read',
          pollingRate: 1000,
        },
        {
          name: 'CommandTopic',
          address: 'devices/commands',
          dataType: 'String',
          access: 'write',
        },
      ],
    },
  },
  {
    id: 't005',
    name: 'Industrial Robot Arm (Universal Robots)',
    description: 'Configuration template for UR series collaborative robots',
    protocol: 'opcua',
    tags: ['Robotics', 'Advanced', 'Manufacturing'],
    machineType: 'Robot',
    config: {
      type: 'Robot',
      protocol: {
        type: 'opcua',
        config: {
          endpointUrl: 'opc.tcp://192.168.1.1:4840',
          securityMode: 'None',
          securityPolicy: 'None',
        },
      },
      dataPoints: [
        {
          name: 'RobotStatus',
          address: 'ns=2;s=Robot.Status',
          dataType: 'String',
          access: 'read',
          pollingRate: 500,
        },
        {
          name: 'JointPosition1',
          address: 'ns=2;s=Robot.Joint1.Position',
          dataType: 'Float',
          access: 'read',
          pollingRate: 100,
        },
        {
          name: 'JointPosition2',
          address: 'ns=2;s=Robot.Joint2.Position',
          dataType: 'Float',
          access: 'read',
          pollingRate: 100,
        },
        {
          name: 'GripperState',
          address: 'ns=2;s=Robot.Gripper.State',
          dataType: 'Boolean',
          access: 'readwrite',
          pollingRate: 500,
        },
        {
          name: 'Emergency Stop',
          address: 'ns=2;s=Robot.EmergencyStop',
          dataType: 'Boolean',
          access: 'read',
          pollingRate: 100,
        },
      ],
    },
  },
  {
    id: 't006',
    name: 'CNC Machine Monitoring',
    description: 'Standard monitoring template for CNC machines',
    protocol: 's7',
    tags: ['CNC', 'Intermediate', 'Manufacturing'],
    machineType: 'CNC Machine',
    config: {
      type: 'CNC Machine',
      protocol: {
        type: 's7',
        config: {
          ipAddress: '192.168.1.1',
          rack: 0,
          slot: 1,
        },
      },
      dataPoints: [
        {
          name: 'SpindleSpeed',
          address: 'DB10.DBD0',
          dataType: 'Float',
          access: 'read',
          pollingRate: 500,
        },
        {
          name: 'FeedRate',
          address: 'DB10.DBD4',
          dataType: 'Float',
          access: 'read',
          pollingRate: 500,
        },
        {
          name: 'ToolNumber',
          address: 'DB10.DBW8',
          dataType: 'Int32',
          access: 'read',
          pollingRate: 1000,
        },
        {
          name: 'ProgramRunning',
          address: 'DB10.DBX10.0',
          dataType: 'Boolean',
          access: 'read',
          pollingRate: 500,
        },
      ],
    },
  },
];
