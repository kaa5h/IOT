import type { Column } from 'react-data-grid';

// Common fields across all protocols
export interface BaseOTConfig {
  id: string;
  environment: string;
  location: string;
  halle: string;
  line: string;
  machineId: string;
  protocolName: string;
  templateType: string;
  templateVersion: string;
  metricName: string;
  operation: string;
}

// OPCUA specific fields
export interface OPCUAConfig extends BaseOTConfig {
  opcuaHost: string;
  opcuaPort: number;
  nodeIds: string; // Comma-separated or newline-separated
}

// Modbus specific fields
export interface ModbusConfig extends BaseOTConfig {
  modbusHost: string;
  modbusPort: number;
  modbusInitialReconnectDelay: number;
  modbusMaxReconnectDelay: number;
  modbusFactorReconnectDelay: number;
  functionCode: number;
  length: number;
  interval: number;
  address: number;
  dataType: string;
}

// S7 specific fields
export interface S7Config extends BaseOTConfig {
  s7Host: string;
  s7Port: number;
  s7Rack: number;
  s7Slot: number;
  s7PollInterval: number;
  receivingAddress: string;
}

export type OTConfig = OPCUAConfig | ModbusConfig | S7Config;

// Common columns for all protocols
const commonColumns: Column<BaseOTConfig>[] = [
  { key: 'environment', name: 'Environment', editable: true, width: 120 },
  { key: 'location', name: 'Location', editable: true, width: 120 },
  { key: 'halle', name: 'Halle', editable: true, width: 100 },
  { key: 'line', name: 'Line', editable: true, width: 100 },
  { key: 'machineId', name: 'Machine ID', editable: true, width: 150 },
  { key: 'protocolName', name: 'Protocol Name', editable: true, width: 120 },
  { key: 'templateType', name: 'Template Type', editable: true, width: 180 },
  { key: 'templateVersion', name: 'Template Version', editable: true, width: 140 },
  { key: 'metricName', name: 'Metric Name', editable: true, width: 140 },
  { key: 'operation', name: 'Operation', editable: true, width: 120 },
];

// OPCUA specific columns
const opcuaColumns: Column<any>[] = [
  ...commonColumns,
  { key: 'opcuaHost', name: 'OPCUA Host', editable: true, width: 150 },
  { key: 'opcuaPort', name: 'OPCUA Port', editable: true, width: 120 },
  { key: 'nodeIds', name: 'Node IDs', editable: true, width: 200 },
];

// Modbus specific columns
const modbusColumns: Column<any>[] = [
  ...commonColumns,
  { key: 'modbusHost', name: 'Modbus Host', editable: true, width: 150 },
  { key: 'modbusPort', name: 'Modbus Port', editable: true, width: 120 },
  { key: 'modbusInitialReconnectDelay', name: 'Initial Reconnect Delay', editable: true, width: 180 },
  { key: 'modbusMaxReconnectDelay', name: 'Max Reconnect Delay', editable: true, width: 180 },
  { key: 'modbusFactorReconnectDelay', name: 'Factor Reconnect Delay', editable: true, width: 180 },
  { key: 'functionCode', name: 'Function Code (FC)', editable: true, width: 150 },
  { key: 'length', name: 'Length', editable: true, width: 100 },
  { key: 'interval', name: 'Interval', editable: true, width: 100 },
  { key: 'address', name: 'Address', editable: true, width: 100 },
  { key: 'dataType', name: 'Data Type', editable: true, width: 120 },
];

// S7 specific columns
const s7Columns: Column<any>[] = [
  ...commonColumns,
  { key: 's7Host', name: 'S7 Host', editable: true, width: 150 },
  { key: 's7Port', name: 'S7 Port', editable: true, width: 120 },
  { key: 's7Rack', name: 'S7 Rack', editable: true, width: 100 },
  { key: 's7Slot', name: 'S7 Slot', editable: true, width: 100 },
  { key: 's7PollInterval', name: 'S7 Poll Interval', editable: true, width: 150 },
  { key: 'receivingAddress', name: 'Receiving Address', editable: true, width: 160 },
];

export function getColumnsForProtocol(protocol: string): Column<any>[] {
  switch (protocol.toLowerCase()) {
    case 'opcua':
    case 'opc ua':
      return opcuaColumns;
    case 'modbus':
    case 'modbus tcp':
      return modbusColumns;
    case 's7':
    case 'siemens s7':
      return s7Columns;
    default:
      return commonColumns;
  }
}

export function createEmptyRow(protocol: string, id: string): OTConfig {
  const baseConfig: BaseOTConfig = {
    id,
    environment: 'prod',
    location: '',
    halle: '',
    line: '',
    machineId: '',
    protocolName: protocol.toLowerCase(),
    templateType: 'machine_connectivity',
    templateVersion: '1.0.0',
    metricName: '',
    operation: 'subscribe',
  };

  switch (protocol.toLowerCase()) {
    case 'opcua':
    case 'opc ua':
      return {
        ...baseConfig,
        opcuaHost: '',
        opcuaPort: 48401,
        nodeIds: '',
      } as OPCUAConfig;

    case 'modbus':
    case 'modbus tcp':
      return {
        ...baseConfig,
        modbusHost: '',
        modbusPort: 5020,
        modbusInitialReconnectDelay: 1000,
        modbusMaxReconnectDelay: 30000,
        modbusFactorReconnectDelay: 2,
        functionCode: 3,
        length: 2,
        interval: 1000,
        address: 0,
        dataType: 'floatBE',
      } as ModbusConfig;

    case 's7':
    case 'siemens s7':
      return {
        ...baseConfig,
        s7Host: '',
        s7Port: 102,
        s7Rack: 0,
        s7Slot: 2,
        s7PollInterval: 1000,
        receivingAddress: '',
      } as S7Config;

    default:
      return baseConfig as OTConfig;
  }
}
