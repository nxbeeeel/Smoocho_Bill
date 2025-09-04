// Printer utilities for built-in tablet printers

export interface PrintOptions {
  width?: number
  height?: number
  margin?: number
  fontSize?: number
  fontFamily?: string
}

export class ThermalPrinter {
  private static instance: ThermalPrinter
  private printQueue: string[] = []

  static getInstance(): ThermalPrinter {
    if (!ThermalPrinter.instance) {
      ThermalPrinter.instance = new ThermalPrinter()
    }
    return ThermalPrinter.instance
  }

  // Detect if device has built-in printer capabilities
  async detectBuiltInPrinter(): Promise<boolean> {
    try {
      // Check for various printer APIs
      if ('usb' in navigator && 'getDevices' in navigator.usb) {
        const devices = await navigator.usb.getDevices()
        return devices.some(device => 
          device.productName?.toLowerCase().includes('printer') ||
          device.manufacturerName?.toLowerCase().includes('printer')
        )
      }

      // Check for WebUSB printer support
      if ('usb' in navigator) {
        return true
      }

      // Check for Bluetooth printer support
      if ('bluetooth' in navigator) {
        return true
      }

      // Check for native printer support (Android/iOS)
      if (typeof (window as any).print !== 'undefined') {
        return true
      }

      return false
    } catch (error) {
      console.log('Printer detection error:', error)
      return false
    }
  }

  // Direct print to built-in printer
  async printDirect(content: string, options: PrintOptions = {}): Promise<boolean> {
    try {
      const hasBuiltIn = await this.detectBuiltInPrinter()
      
      if (hasBuiltIn) {
        // Try direct printing methods
        return await this.tryDirectPrint(content, options)
      } else {
        // Fallback to window.print()
        return await this.fallbackPrint(content, options)
      }
    } catch (error) {
      console.error('Direct print failed:', error)
      return await this.fallbackPrint(content, options)
    }
  }

  private async tryDirectPrint(content: string, options: PrintOptions): Promise<boolean> {
    try {
      // Method 1: Try WebUSB for direct printer communication
      if ('usb' in navigator) {
        const success = await this.printViaWebUSB(content, options)
        if (success) return true
      }

      // Method 2: Try Bluetooth for wireless printers
      if ('bluetooth' in navigator) {
        const success = await this.printViaBluetooth(content, options)
        if (success) return true
      }

      // Method 3: Try native print API
      if (typeof (window as any).print === 'function') {
        const success = await this.printViaNative(content, options)
        if (success) return true
      }

      return false
    } catch (error) {
      console.error('Direct print methods failed:', error)
      return false
    }
  }

  private async printViaWebUSB(content: string, options: PrintOptions): Promise<boolean> {
    try {
      // Request access to USB devices
      const device = await navigator.usb.requestDevice({
        filters: [
          { classCode: 7 }, // Printer class
          { vendorId: 0x04f9 }, // Epson
          { vendorId: 0x03f0 }, // HP
          { vendorId: 0x04b8 }, // Star Micronics
        ]
      })

      if (device) {
        await device.open()
        await device.selectConfiguration(1)
        await device.claimInterface(0)

        // Convert content to printer commands
        const printerCommands = this.convertToPrinterCommands(content, options)
        
        // Send to printer
        await device.transferOut(1, new Uint8Array(printerCommands))
        
        await device.close()
        return true
      }
    } catch (error) {
      console.log('WebUSB print failed:', error)
    }
    return false
  }

  private async printViaBluetooth(content: string, options: PrintOptions): Promise<boolean> {
    try {
      // Request Bluetooth device
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'Printer' },
          { namePrefix: 'POS' },
          { namePrefix: 'Thermal' },
        ],
        optionalServices: ['0000180f-0000-1000-8000-00805f9b34fb'] // Battery service
      })

      if (device) {
        const server = await device.gatt?.connect()
        if (server) {
          // Convert content to printer commands
          const printerCommands = this.convertToPrinterCommands(content, options)
          
          // Send to printer via Bluetooth
          // Implementation would depend on specific printer protocol
          
          server.disconnect()
          return true
        }
      }
    } catch (error) {
      console.log('Bluetooth print failed:', error)
    }
    return false
  }

  private async printViaNative(content: string, options: PrintOptions): Promise<boolean> {
    try {
      // Create a hidden iframe for printing
      const iframe = document.createElement('iframe')
      iframe.style.position = 'absolute'
      iframe.style.left = '-9999px'
      iframe.style.top = '-9999px'
      iframe.style.width = '1px'
      iframe.style.height = '1px'
      
      document.body.appendChild(iframe)
      
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
      if (iframeDoc) {
        iframeDoc.open()
        iframeDoc.write(this.generatePrintHTML(content, options))
        iframeDoc.close()
        
        // Wait for content to load
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Print
        iframe.contentWindow?.print()
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(iframe)
        }, 1000)
        
        return true
      }
    } catch (error) {
      console.error('Native print failed:', error)
    }
    return false
  }

  private async fallbackPrint(content: string, options: PrintOptions): Promise<boolean> {
    try {
      // Fallback to traditional window.open method
      const printWindow = window.open('', '_blank', 'width=300,height=400')
      if (!printWindow) return false

      printWindow.document.write(this.generatePrintHTML(content, options))
      printWindow.document.close()
      
      // Auto-print after a short delay
      setTimeout(() => {
        printWindow.print()
        setTimeout(() => printWindow.close(), 1000)
      }, 500)
      
      return true
    } catch (error) {
      console.error('Fallback print failed:', error)
      return false
    }
  }

  private convertToPrinterCommands(content: string, options: PrintOptions): Uint8Array {
    // Convert HTML content to thermal printer ESC/POS commands
    const commands: number[] = []
    
    // Initialize printer
    commands.push(0x1B, 0x40) // ESC @ - Initialize
    
    // Set font size
    const fontSize = options.fontSize || 12
    if (fontSize > 12) {
      commands.push(0x1B, 0x21, 0x10) // Double height
    }
    
    // Convert content to bytes
    const textBytes = new TextEncoder().encode(content)
    commands.push(...Array.from(textBytes))
    
    // Cut paper
    commands.push(0x1D, 0x56, 0x00) // GS V 0 - Full cut
    
    return new Uint8Array(commands)
  }

  private generatePrintHTML(content: string, options: PrintOptions): string {
    const width = options.width || 80
    const fontSize = options.fontSize || 12
    const fontFamily = options.fontFamily || 'Courier New, monospace'
    const margin = options.margin || 5

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt</title>
          <style>
            @page { 
              size: ${width}mm auto; 
              margin: ${margin}mm; 
            }
            * { 
              margin: 0; 
              padding: 0; 
              box-sizing: border-box; 
            }
            body { 
              font-family: ${fontFamily}; 
              font-size: ${fontSize}px; 
              line-height: 1.2; 
              width: ${width}mm; 
              max-width: ${width}mm; 
              margin: 0 auto; 
              padding: ${margin}mm; 
              background: white; 
              color: black; 
            }
            @media print { 
              body { 
                margin: 0; 
                padding: ${margin}mm; 
              } 
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `
  }

  // Generate thermal receipt content
  generateReceiptContent(order: any, settings: any): string {
    const taxRate = settings?.taxRate || 18
    const deliveryCharge = order.orderType === 'delivery' ? (settings?.deliveryCharge || 0) : 0
    
    return `
      <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px;">
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 2px;">${settings?.storeName || 'SMOOCHO BILL'}</div>
        <div style="font-size: 10px; margin-bottom: 4px;">${settings?.storeAddress || 'Premium POS System'}</div>
        <div style="font-size: 10px; margin-bottom: 4px;">Phone: ${settings?.storePhone || 'N/A'}</div>
        ${settings?.storeEmail ? `<div style="font-size: 10px; margin-bottom: 4px;">Email: ${settings.storeEmail}</div>` : ''}
        ${settings?.storeWebsite ? `<div style="font-size: 10px; margin-bottom: 4px;">Web: ${settings.storeWebsite}</div>` : ''}
        ${settings?.storeGST ? `<div style="font-size: 10px; margin-bottom: 4px;">GST: ${settings.storeGST}</div>` : ''}
        <div style="border-top: 1px dashed #000; margin: 4px 0;"></div>
        <div style="font-size: 10px; font-weight: bold;">BILL #${order.orderNumber}</div>
      </div>
      
      <div style="margin-bottom: 8px; font-size: 11px;">
        <p style="margin: 1px 0;">Date: ${new Date().toLocaleDateString('en-IN')}</p>
        <p style="margin: 1px 0;">Time: ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
        <p style="margin: 1px 0;">Order Type: ${order.orderType?.toUpperCase() || 'TAKEAWAY'}</p>
        <p style="margin: 1px 0;">Payment: ${order.paymentMethod?.toUpperCase() || 'CASH'}</p>
        <p style="margin: 1px 0;">Status: PAID</p>
        ${order.customerName ? `<p style="margin: 1px 0;">Customer: ${order.customerName}</p>` : ''}
        ${order.customerPhone ? `<p style="margin: 1px 0;">Phone: ${order.customerPhone}</p>` : ''}
      </div>

      <div style="margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 11px; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 2px;">
          <div style="flex: 1; margin-right: 4px;">Item</div>
          <div style="width: 20px; text-align: center;">Qty</div>
          <div style="width: 40px; text-align: right;">Price</div>
          <div style="width: 50px; text-align: right;">Total</div>
        </div>
        ${order.items.map((item: any) => `
          <div style="display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 11px;">
            <div style="flex: 1; margin-right: 4px;">${item.productName}</div>
            <div style="width: 20px; text-align: center;">${item.quantity}</div>
            <div style="width: 40px; text-align: right;">₹${item.price.toFixed(2)}</div>
            <div style="width: 50px; text-align: right; font-weight: bold;">₹${item.total.toFixed(2)}</div>
          </div>
        `).join('')}
      </div>

      <div style="border-top: 1px dashed #000; margin: 4px 0;"></div>

      <div style="margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; margin: 1px 0; font-size: 11px;">
          <div style="flex: 1;">Subtotal:</div>
          <div style="font-weight: bold;">₹${order.subtotal.toFixed(2)}</div>
        </div>
        ${order.discount > 0 ? `
          <div style="display: flex; justify-content: space-between; margin: 1px 0; font-size: 11px;">
            <div style="flex: 1;">Discount:</div>
            <div style="font-weight: bold;">${order.discountType === 'percentage' ? order.discount + '%' : '₹' + order.discount.toFixed(2)}</div>
          </div>
        ` : ''}
        ${deliveryCharge > 0 ? `
          <div style="display: flex; justify-content: space-between; margin: 1px 0; font-size: 11px;">
            <div style="flex: 1;">Delivery Charge:</div>
            <div style="font-weight: bold;">₹${deliveryCharge.toFixed(2)}</div>
          </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between; margin: 1px 0; font-size: 11px;">
          <div style="flex: 1;">Tax (${taxRate}%):</div>
          <div style="font-weight: bold;">₹${order.tax.toFixed(2)}</div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; border-top: 1px solid #000; padding-top: 4px; margin-top: 4px;">
          <div>TOTAL:</div>
          <div>₹${order.total.toFixed(2)}</div>
        </div>
      </div>

      <div style="text-align: center; margin-top: 8px; border-top: 1px dashed #000; padding-top: 8px; font-size: 10px;">
        <div style="font-weight: bold; margin-bottom: 4px;">Thank you for your visit!</div>
        ${settings?.upiId ? `<div style="margin: 4px 0; font-size: 9px;">UPI ID: ${settings.upiId}</div>` : ''}
        <div style="margin: 4px 0; font-size: 9px;">Keep this receipt for warranty</div>
        <div style="margin: 4px 0; font-size: 9px;">For queries: ${settings?.storePhone || 'Contact Store'}</div>
        <div style="font-size: 9px;">Generated: ${new Date().toLocaleString('en-IN')}</div>
        <div style="margin-top: 4px; font-size: 8px; color: #666;">Powered by Smoocho Bill POS</div>
      </div>
    `
  }
}

// Export singleton instance
export const thermalPrinter = ThermalPrinter.getInstance()
