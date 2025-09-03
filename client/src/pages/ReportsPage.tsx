import React, { useState, useEffect } from 'react';
import {
  CalendarIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { DailySummaryReport } from '../components/Reports/DailySummaryReport';
import { MonthlySummaryReport } from '../components/Reports/MonthlySummaryReport';
import { ReportFilters } from '../components/Reports/ReportFilters';
import { ReportExportActions } from '../components/Reports/ReportExportActions';
import { useReportStore } from '../store/reportStore';
import { useNotificationStore } from '../store/notificationStore';
import { ReportFilters as ReportFiltersType } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import PremiumLayout from '../components/Layout/PremiumLayout';

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly'>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  const [filters, setFilters] = useState<ReportFiltersType>({
    payment_method: 'all',
    order_type: 'all',
  });
  const [isLoading, setIsLoading] = useState(false);

  const {
    dailyReport,
    monthlyReport,
    fetchDailyReport,
    fetchMonthlyReport,
    generateReport,
    regenerateReport,
    exportToPDF,
    printReport,
    clearCache,
  } = useReportStore();

  const { addNotification } = useNotificationStore();

  // Load initial reports
  useEffect(() => {
    loadReports();
  }, [selectedDate, selectedMonth, filters]);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'daily') {
        await fetchDailyReport(selectedDate, filters);
      } else {
        const [year, month] = selectedMonth.split('-');
        await fetchMonthlyReport(month, parseInt(year), filters);
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Report Loading Failed',
        message: 'Failed to load report data. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'daily') {
        await generateReport('daily', selectedDate, filters);
        addNotification({
          type: 'success',
          title: 'Report Generated',
          message: 'Daily report has been generated successfully.',
        });
      } else {
        const [year, month] = selectedMonth.split('-');
        await generateReport('monthly', `${month}-${year}`, filters);
        addNotification({
          type: 'success',
          title: 'Report Generated',
          message: 'Monthly report has been generated successfully.',
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Report Generation Failed',
        message: 'Failed to generate report. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateReport = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'daily') {
        await regenerateReport('daily', selectedDate, filters);
        addNotification({
          type: 'success',
          title: 'Report Regenerated',
          message: 'Daily report has been regenerated successfully.',
        });
      } else {
        const [year, month] = selectedMonth.split('-');
        await regenerateReport('monthly', `${month}-${year}`, filters);
        addNotification({
          type: 'success',
          title: 'Report Regenerated',
          message: 'Monthly report has been regenerated successfully.',
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Report Regeneration Failed',
        message: 'Failed to regenerate report. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      if (activeTab === 'daily' && dailyReport) {
        await exportToPDF('daily');
        addNotification({
          type: 'success',
          title: 'PDF Exported',
          message: 'Daily report has been exported to PDF.',
        });
      } else if (activeTab === 'monthly' && monthlyReport) {
        await exportToPDF('monthly');
        addNotification({
          type: 'success',
          title: 'PDF Exported',
          message: 'Monthly report has been exported to PDF.',
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export report to PDF. Please try again.',
      });
    }
  };

  const handlePrintReport = async () => {
    try {
      if (activeTab === 'daily' && dailyReport) {
        await printReport('daily');
        addNotification({
          type: 'success',
          title: 'Report Printed',
          message: 'Daily report has been sent to printer.',
        });
      } else if (activeTab === 'monthly' && monthlyReport) {
        await printReport('monthly');
        addNotification({
          type: 'success',
          title: 'Report Printed',
          message: 'Monthly report has been sent to printer.',
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Print Failed',
        message: 'Failed to print report. Please try again.',
      });
    }
  };

  const handleFiltersChange = (newFilters: ReportFiltersType) => {
    setFilters(newFilters);
  };

  const handleClearCache = () => {
    clearCache();
    addNotification({
      type: 'success',
      title: 'Cache Cleared',
      message: 'Report cache has been cleared successfully.',
    });
  };

  const currentReport = activeTab === 'daily' ? dailyReport : monthlyReport;

  return (
    <PremiumLayout>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Reports & Analytics
                </h1>
                <p className="text-gray-600 mt-1">
                  Generate and analyze sales reports, track performance, and
                  export data
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleClearCache}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  Clear Cache
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('daily')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'daily'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <CalendarIcon className="h-5 w-5 inline mr-2" />
                  Daily Summary
                </button>
                <button
                  onClick={() => setActiveTab('monthly')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'monthly'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <ChartBarIcon className="h-5 w-5 inline mr-2" />
                  Monthly Summary
                </button>
              </nav>
            </div>
          </div>

          {/* Date/Period Selection */}
          <div className="mb-6">
            {activeTab === 'daily' ? (
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  Select Date:
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  Select Month:
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="mb-6">
            <ReportFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </div>

          {/* Action Buttons */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <button
              onClick={handleGenerateReport}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChartBarIcon className="h-4 w-4 mr-2" />
              Generate Report
            </button>

            <button
              onClick={handleRegenerateReport}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Regenerate
            </button>

            {currentReport && (
              <>
                <button
                  onClick={handleExportPDF}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  Export PDF
                </button>

                <button
                  onClick={handlePrintReport}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PrinterIcon className="h-4 w-4 mr-2" />
                  Print Report
                </button>
              </>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {/* Report Content */}
          {!isLoading && currentReport && (
            <div className="space-y-6">
              {activeTab === 'daily' && dailyReport && (
                <DailySummaryReport report={dailyReport} />
              )}

              {activeTab === 'monthly' && monthlyReport && (
                <MonthlySummaryReport report={monthlyReport} />
              )}

              {/* Export Actions */}
              <ReportExportActions
                report={currentReport}
                reportType={activeTab}
                onExportPDF={handleExportPDF}
                onPrint={handlePrintReport}
              />
            </div>
          )}

          {/* No Report State */}
          {!isLoading && !currentReport && (
            <div className="text-center py-12">
              <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No report available
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Generate a report for the selected date to view data.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleGenerateReport}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <ChartBarIcon className="h-4 w-4 mr-2" />
                  Generate Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PremiumLayout>
  );
};

export default ReportsPage;
