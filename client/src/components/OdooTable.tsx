import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface OdooTableProps {
  children: React.ReactNode;
  className?: string;
}

export function OdooTable({ children, className = "" }: OdooTableProps) {
  return (
    <div className="rounded-md border border-gray-200 overflow-hidden">
      <Table className={`bg-white ${className}`}>
        {children}
      </Table>
    </div>
  );
}

export function OdooTableHeader({ children }: { children: React.ReactNode }) {
  return (
    <TableHeader className="bg-gray-50">
      {children}
    </TableHeader>
  );
}

export function OdooTableRow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <TableRow className={`hover:bg-gray-50 border-gray-200 ${className}`}>
      {children}
    </TableRow>
  );
}

export function OdooTableCell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <TableCell className={`text-sm text-gray-900 ${className}`}>
      {children}
    </TableCell>
  );
}

export function OdooTableHead({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <TableHead className={`text-xs font-medium text-gray-700 bg-gray-50 ${className}`}>
      {children}
    </TableHead>
  );
}

export { TableBody };