import React from 'react';
import { DailySalesReport, MonthlySalesReport } from '../../types';
import {
  DocumentArrowDownIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline';

interface ReportExportActionsProps {
  report: DailySalesReport | MonthlySalesReport;
  reportType: 'daily' | 'monthly';
  onExportPDF: () => void;
  onPrint: () => void;
}

export const ReportExportActions: React.FC<ReportExportActionsProps> = ({
  report,
  reportType,
  onExportPDF,
  onPrint,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Export & Print</h3>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={onExportPDF}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
          Export PDF
        </button>

        <button
          onClick={onPrint}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PrinterIcon className="h-4 w-4 mr-2" />
          Print Report
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>
          <strong>Report Summary:</strong>{' '}
          {reportType === 'daily'
            ? `Daily sales report for ${(report as DailySalesReport).date}`
            : `Monthly sales report for ${(report as MonthlySalesReport).month} ${(report as MonthlySalesReport).year}`}
        </p>
        <p>
          <strong>Generated:</strong> {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
};
