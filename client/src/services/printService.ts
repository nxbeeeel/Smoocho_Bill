import { Order, OrderItem, Product } from '../types';
import { offlineStorage } from './offlineStorageService';

export interface PrintableOrder extends Order {
  order_items: (OrderItem & { product?: Product })[];
}

export class PrintService {
  private static instance: PrintService;

  static getInstance(): PrintService {
    if (!PrintService.instance) {
      PrintService.instance = new PrintService();
    }
    return PrintService.instance;
  }

  // Format receipt content for thermal printing
  formatReceipt(order: PrintableOrder): string {
    const businessInfo = {
      name: 'Smoocho Bill Restaurant',
      address: '123 Food Street, Delhi',
      phone: '+91 9876543210',
      gst: 'GST: 07AAAAA0000A1Z5',
    };

    const receiptWidth = 32; // Standard thermal printer width
    const separator = '='.repeat(receiptWidth);
    const dottedLine = '-'.repeat(receiptWidth);

    let receipt = '';

    // Header
    receipt += this.centerText(businessInfo.name, receiptWidth) + '\n';
    receipt += this.centerText(businessInfo.address, receiptWidth) + '\n';
    receipt += this.centerText(businessInfo.phone, receiptWidth) + '\n';
    receipt += this.centerText(businessInfo.gst, receiptWidth) + '\n';
    receipt += separator + '\n';

    // Order Info
    receipt += `Order No: ${order.order_number}\n`;
    receipt += `Date: ${new Date(order.order_date).toLocaleString()}\n`;
    receipt += `Type: ${this.formatOrderType(order.order_type)}\n`;

    if (order.customer_name) {
      receipt += `Customer: ${order.customer_name}\n`;
    }

    if (order.customer_phone) {
      receipt += `Phone: ${order.customer_phone}\n`;
    }

    if (order.table_number) {
      receipt += `Table: ${order.table_number}\n`;
    }

    receipt += separator + '\n';

    // Items Header
    receipt += this.padText('Item', 'Qty', 'Amount', receiptWidth) + '\n';
    receipt += dottedLine + '\n';

    // Items
    order.order_items.forEach(item => {
      const itemName = this.truncateText(item.product_name, 16);
      const qty = item.quantity.toString();
      const amount = `₹${item.item_total.toFixed(2)}`;

      receipt += this.padText(itemName, qty, amount, receiptWidth) + '\n';

      if (item.special_instructions) {
        receipt += ` Note: ${item.special_instructions}\n`;
      }
    });

    receipt += dottedLine + '\n';

    // Totals
    receipt +=
      this.padTwoColumns(
        'Subtotal:',
        `₹${order.subtotal.toFixed(2)}`,
        receiptWidth
      ) + '\n';

    if (order.discount_amount > 0) {
      const discountLabel =
        order.discount_type === 'percentage'
          ? `Discount (${order.discount_amount}%):`
          : 'Discount:';
      receipt +=
        this.padTwoColumns(
          discountLabel,
          `-₹${order.discount_amount.toFixed(2)}`,
          receiptWidth
        ) + '\n';
    }

    receipt +=
      this.padTwoColumns(
        'Tax (5%):',
        `₹${order.tax_amount.toFixed(2)}`,
        receiptWidth
      ) + '\n';
    receipt += dottedLine + '\n';
    receipt +=
      this.padTwoColumns(
        'TOTAL:',
        `₹${order.total_amount.toFixed(2)}`,
        receiptWidth
      ) + '\n';
    receipt += separator + '\n';

    // Payment Info
    const payments = order.payments || [];
    if (payments.length > 0) {
      receipt += 'Payment Details:\n';
      payments.forEach(payment => {
        receipt +=
          this.padTwoColumns(
            this.formatPaymentMethod(payment.payment_method),
            `₹${payment.amount.toFixed(2)}`,
            receiptWidth
          ) + '\n';
      });
      receipt += dottedLine + '\n';
    }

    // Footer
    receipt +=
      this.centerText('Thank you for your visit!', receiptWidth) + '\n';
    receipt += this.centerText('Please visit again', receiptWidth) + '\n';
    receipt += separator + '\n';
    receipt += '\n\n\n'; // Extra spacing for tear-off

    return receipt;
  }

  // Print receipt (for thermal printer or browser print)
  async printReceipt(orderId: string): Promise<boolean> {
    try {
      // Get order details
      const order = await offlineStorage.getOrderWithItems(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Format receipt
      const receiptContent = this.formatReceipt(order);

      // Check if we're in a browser environment
      if (typeof window !== 'undefined') {
        // Browser print
        return this.printInBrowser(receiptContent, order.order_number);
      } else {
        // In Node.js environment, you would interface with thermal printer
        console.log('Thermal printer output:');
        console.log(receiptContent);
        return true;
      }
    } catch (error) {
      console.error('Print failed:', error);
      return false;
    }
  }

  // Print receipt in browser (for testing or PDF generation)
  private printInBrowser(content: string, orderNumber: string): boolean {
    try {
      const printWindow = window.open('', '_blank', 'width=300,height=600');
      if (!printWindow) {
        throw new Error('Could not open print window');
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt - ${orderNumber}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.2;
              margin: 10px;
              white-space: pre-wrap;
            }
            @media print {
              body { margin: 0; }
              @page { size: 80mm auto; margin: 0; }
            }
          </style>
        </head>
        <body>${content}</body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();

      // Give browser time to render, then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);

      return true;
    } catch (error) {
      console.error('Browser print failed:', error);
      return false;
    }
  }

  // Helper methods for formatting
  private centerText(text: string, width: number): string {
    const padding = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(padding) + text;
  }

  private padTwoColumns(left: string, right: string, width: number): string {
    const maxLeftWidth = width - right.length - 1;
    const leftText = this.truncateText(left, maxLeftWidth);
    const spaces = width - leftText.length - right.length;
    return leftText + ' '.repeat(Math.max(1, spaces)) + right;
  }

  private padText(
    left: string,
    center: string,
    right: string,
    width: number
  ): string {
    const leftWidth = 16;
    const centerWidth = 4;
    const rightWidth = width - leftWidth - centerWidth;

    return (
      this.truncateText(left, leftWidth).padEnd(leftWidth) +
      center.padStart(centerWidth) +
      right.padStart(rightWidth)
    );
  }

  private truncateText(text: string, maxLength: number): string {
    return text.length > maxLength
      ? text.substring(0, maxLength - 1) + '…'
      : text;
  }

  private formatOrderType(orderType: string): string {
    const types: Record<string, string> = {
      dine_in: 'Dine In',
      takeaway: 'Takeaway',
      zomato: 'Zomato Delivery',
      swiggy: 'Swiggy Delivery',
    };
    return types[orderType] || orderType;
  }

  private formatPaymentMethod(method: string): string {
    const methods: Record<string, string> = {
      cash: 'Cash',
      card: 'Card',
      upi: 'UPI',
      zomato: 'Zomato Payment',
      swiggy: 'Swiggy Payment',
    };
    return methods[method] || method;
  }

  // Generate receipt as HTML for display
  generateReceiptHTML(order: PrintableOrder): string {
    const content = this.formatReceipt(order);
    return `
      <div style="font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.4; max-width: 350px; margin: 0 auto; padding: 20px; background: white; white-space: pre-wrap;">
        ${content}
      </div>
    `;
  }

  // For thermal printer integration (ESC/POS commands)
  generateESCPOSCommands(order: PrintableOrder): Uint8Array {
    // This would generate actual ESC/POS thermal printer commands
    // For now, return basic commands as example
    const content = this.formatReceipt(order);
    const encoder = new TextEncoder();

    // Basic ESC/POS commands
    const commands = [
      [0x1b, 0x40], // Initialize printer
      [0x1b, 0x61, 0x01], // Center align
      encoder.encode(content),
      [0x1d, 0x56, 0x42, 0x00], // Cut paper
    ];

    // Flatten commands into single Uint8Array
    const totalLength = commands.reduce((sum, cmd) => sum + cmd.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;

    commands.forEach(cmd => {
      if (cmd instanceof Uint8Array) {
        result.set(cmd, offset);
        offset += cmd.length;
      } else {
        result.set(new Uint8Array(cmd), offset);
        offset += cmd.length;
      }
    });

    return result;
  }
}

// Export singleton instance
export const printService = PrintService.getInstance();
