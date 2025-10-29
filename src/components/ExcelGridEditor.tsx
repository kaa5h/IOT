import React, { useState, useCallback } from 'react';
import { DataGrid, type Column } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import { Button } from './ui/Button';
import { Download, Upload, Plus, Trash2, Copy, Info } from 'lucide-react';
import type { OTConfig } from '../lib/protocolColumns';

interface ExcelGridEditorProps {
  columns: Column<any>[];
  rows: OTConfig[];
  onRowsChange: (rows: OTConfig[]) => void;
  protocol: string;
  onAddRow: () => void;
}

export const ExcelGridEditor: React.FC<ExcelGridEditorProps> = ({
  columns,
  rows,
  onRowsChange,
  protocol,
  onAddRow,
}) => {
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<string>>(new Set());

  // Handle paste from clipboard
  const handlePaste = useCallback(
    async (event: React.ClipboardEvent) => {
      event.preventDefault();
      const pastedText = event.clipboardData.getData('text');

      // Parse pasted data (tab-separated values)
      const pastedRows = pastedText.split('\n').filter(row => row.trim());
      const pastedData = pastedRows.map(row => row.split('\t'));

      // Find the currently selected cell
      const activeElement = document.activeElement;
      if (!activeElement) return;

      // Get the starting row index from selection
      const selectedRowsArray = Array.from(selectedRows);
      if (selectedRowsArray.length === 0) return;

      const startRowIndex = rows.findIndex(r => r.id === selectedRowsArray[0]);
      if (startRowIndex === -1) return;

      // Create updated rows
      const newRows = [...rows];

      pastedData.forEach((pastedRowData, rowOffset) => {
        const targetRowIndex = startRowIndex + rowOffset;

        // Add new row if needed
        if (targetRowIndex >= newRows.length) {
          return;
        }

        const targetRow = { ...newRows[targetRowIndex] };

        // Update each column value
        pastedRowData.forEach((value, colIndex) => {
          if (colIndex < columns.length) {
            const columnKey = columns[colIndex].key as string;
            // Type conversion based on column
            if (typeof (targetRow as any)[columnKey] === 'number') {
              (targetRow as any)[columnKey] = parseFloat(value) || 0;
            } else {
              (targetRow as any)[columnKey] = value;
            }
          }
        });

        newRows[targetRowIndex] = targetRow;
      });

      onRowsChange(newRows);
    },
    [rows, columns, selectedRows, onRowsChange]
  );

  // Export to CSV
  const handleExportCSV = useCallback(() => {
    const csvHeaders = columns.map(col => col.name).join(',');
    const csvRows = rows.map((row: OTConfig) => {
      return columns.map(col => {
        const value = (row as any)[col.key];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',');
    });

    const csvContent = [csvHeaders, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${protocol}_config_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [rows, columns, protocol]);

  // Import from CSV
  const handleImportCSV = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());

      // Skip header row
      const dataLines = lines.slice(1);

      const importedRows: OTConfig[] = dataLines.map((line, index) => {
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const row: any = { id: `imported-${Date.now()}-${index}` };

        columns.forEach((col, colIndex) => {
          const value = values[colIndex] || '';
          // Type conversion
          if (typeof columns[colIndex] === 'number') {
            row[col.key] = parseFloat(value) || 0;
          } else {
            row[col.key] = value;
          }
        });

        return row as OTConfig;
      });

      onRowsChange([...rows, ...importedRows]);
    };

    reader.readAsText(file);
    event.target.value = ''; // Reset input
  }, [rows, columns, onRowsChange]);

  // Delete selected rows
  const handleDeleteSelected = useCallback(() => {
    if (selectedRows.size === 0) {
      alert('Please select rows to delete');
      return;
    }

    const newRows = rows.filter(row => !selectedRows.has(row.id));
    onRowsChange(newRows);
    setSelectedRows(new Set());
  }, [rows, selectedRows, onRowsChange]);

  // Duplicate selected row
  const handleDuplicateRow = useCallback(() => {
    if (selectedRows.size !== 1) {
      alert('Please select exactly one row to duplicate');
      return;
    }

    const selectedId = Array.from(selectedRows)[0];
    const rowToDuplicate = rows.find(r => r.id === selectedId);

    if (rowToDuplicate) {
      const duplicated = {
        ...rowToDuplicate,
        id: `duplicated-${Date.now()}`,
      };
      onRowsChange([...rows, duplicated]);
    }
  }, [rows, selectedRows, onRowsChange]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onAddRow}>
            <Plus className="h-4 w-4 mr-1" />
            Add Row
          </Button>
          <Button variant="outline" size="sm" onClick={handleDuplicateRow}>
            <Copy className="h-4 w-4 mr-1" />
            Duplicate
          </Button>
          <Button variant="outline" size="sm" onClick={handleDeleteSelected}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete Selected
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="import-csv">
            <Button variant="outline" size="sm" onClick={() => document.getElementById('import-csv')?.click()}>
              <Upload className="h-4 w-4 mr-1" />
              Import CSV
            </Button>
          </label>
          <input
            id="import-csv"
            type="file"
            accept=".csv"
            onChange={handleImportCSV}
            className="hidden"
          />

          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-blue-800">
          <strong>Excel-like Controls:</strong> Use <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded text-xs">Ctrl+C</kbd> to copy,
          <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded text-xs ml-1">Ctrl+V</kbd> to paste,
          <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded text-xs ml-1">Tab</kbd> to navigate cells,
          <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded text-xs ml-1">Enter</kbd> to edit. Click column headers to sort.
        </div>
      </div>

      {/* Data Grid */}
      <div className="border border-gray-200 rounded-lg overflow-hidden" onPaste={handlePaste}>
        <DataGrid
          columns={columns}
          rows={rows}
          onRowsChange={onRowsChange}
          selectedRows={selectedRows}
          onSelectedRowsChange={setSelectedRows}
          rowKeyGetter={(row) => row.id}
          className="rdg-light"
          style={{ height: 'calc(100vh - 400px)', minHeight: '400px' }}
          defaultColumnOptions={{
            sortable: true,
            resizable: true,
          }}
        />
      </div>

      {/* Row Count */}
      <div className="text-sm text-gray-600">
        Total rows: <strong>{rows.length}</strong>
        {selectedRows.size > 0 && (
          <span className="ml-4">
            Selected: <strong>{selectedRows.size}</strong>
          </span>
        )}
      </div>
    </div>
  );
};
