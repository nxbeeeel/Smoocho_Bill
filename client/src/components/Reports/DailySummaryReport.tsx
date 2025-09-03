import React from 'react';
import { DailySalesReport } from '../../types';

interface DailySummaryReportProps {
  report: DailySalesReport;
}

export const DailySummaryReport: React.FC<DailySummaryReportProps> = ({
  report,
}) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">
          Daily Sales Summary - {new Date(report.date).toLocaleDateString()}
        </h2>
      </div>

      <div className="px-6 py-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              ₹{report.total_sales.toLocaleString()}
            </div>
            <div className="text-sm text-blue-800">Total Sales</div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {report.total_orders}
            </div>
            <div className="text-sm text-green-800">Total Orders</div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              ₹{report.average_order_value.toFixed(2)}
            </div>
            <div className="text-sm text-purple-800">Average Order Value</div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              ₹{(report.total_sales / 8).toFixed(0)}
            </div>
            <div className="text-sm text-orange-800">Per Hour Average</div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Payment Methods
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">
                ₹{report.payment_method_breakdown.cash.amount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                Cash ({report.payment_method_breakdown.cash.count} orders)
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">
                ₹{report.payment_method_breakdown.card.amount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                Card ({report.payment_method_breakdown.card.count} orders)
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">
                ₹{report.payment_method_breakdown.upi.amount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                UPI ({report.payment_method_breakdown.upi.count} orders)
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">
                ₹
                {report.payment_method_breakdown.online.amount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                Online ({report.payment_method_breakdown.online.count} orders)
              </div>
            </div>
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Top Selling Items
          </h3>
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity Sold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {report.top_selling_items.map((item, index) => (
                  <tr key={item.product_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}. {item.product_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity_sold}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{item.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hourly Sales Chart */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Hourly Sales
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-end justify-between h-32">
              {report.hourly_sales.map(hourData => (
                <div key={hourData.hour} className="flex flex-col items-center">
                  <div
                    className="bg-blue-500 rounded-t w-8"
                    style={{ height: `${(hourData.sales / 2500) * 100}px` }}
                  ></div>
                  <div className="text-xs text-gray-600 mt-2">
                    {hourData.hour}:00
                  </div>
                  <div className="text-xs text-gray-500">₹{hourData.sales}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
