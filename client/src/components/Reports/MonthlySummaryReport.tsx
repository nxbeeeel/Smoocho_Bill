import React from 'react';
import { MonthlySalesReport } from '../../types';

interface MonthlySummaryReportProps {
  report: MonthlySalesReport;
}

export const MonthlySummaryReport: React.FC<MonthlySummaryReportProps> = ({
  report,
}) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">
          Monthly Sales Summary - {report.month} {report.year}
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
              ₹{report.total_profit.toLocaleString()}
            </div>
            <div className="text-sm text-purple-800">Total Profit</div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              ₹{(report.total_sales / report.total_orders).toFixed(0)}
            </div>
            <div className="text-sm text-orange-800">Average Order Value</div>
          </div>
        </div>

        {/* Payment Trends */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Payment Trends
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">
                {report.payment_trends.cash_percentage}%
              </div>
              <div className="text-sm text-gray-600">Cash</div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">
                {report.payment_trends.card_percentage}%
              </div>
              <div className="text-sm text-gray-600">Card</div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">
                {report.payment_trends.upi_percentage}%
              </div>
              <div className="text-sm text-gray-600">UPI</div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">
                {report.payment_trends.online_percentage}%
              </div>
              <div className="text-sm text-gray-600">Online</div>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profit
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{item.profit.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Usage */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Stock Usage
          </h3>
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Used
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {report.stock_usage.map(item => (
                  <tr key={item.inventory_item_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.item_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.total_used}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{item.cost.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Daily Breakdown */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Daily Breakdown
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-end justify-between h-32">
              {report.daily_breakdown.slice(0, 7).map(dayData => (
                <div key={dayData.date} className="flex flex-col items-center">
                  <div
                    className="bg-green-500 rounded-t w-8"
                    style={{ height: `${(dayData.sales / 10000) * 100}px` }}
                  ></div>
                  <div className="text-xs text-gray-600 mt-2">
                    {new Date(dayData.date).getDate()}
                  </div>
                  <div className="text-xs text-gray-500">₹{dayData.sales}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
