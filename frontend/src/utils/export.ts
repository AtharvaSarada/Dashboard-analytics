// Data export utilities for various formats

interface ExportData {
  [key: string]: any
}

interface ExportOptions {
  filename?: string
  timestamp?: boolean
  headers?: string[]
  sheetName?: string
}

/**
 * Export data as CSV file
 */
export const exportToCSV = (data: ExportData[], options: ExportOptions = {}) => {
  const {
    filename = 'export',
    timestamp = true,
    headers
  } = options

  if (!data || data.length === 0) {
    throw new Error('No data to export')
  }

  // Get headers from first object or use provided headers
  const csvHeaders = headers || Object.keys(data[0])
  
  // Create CSV content
  const csvContent = [
    // Headers row
    csvHeaders.join(','),
    // Data rows
    ...data.map(row => 
      csvHeaders.map(header => {
        const value = row[header]
        // Handle commas and quotes in data
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const finalFilename = timestamp 
    ? `${filename}_${new Date().toISOString().split('T')[0]}.csv`
    : `${filename}.csv`
  
  downloadBlob(blob, finalFilename)
}

/**
 * Export data as JSON file
 */
export const exportToJSON = (data: ExportData | ExportData[], options: ExportOptions = {}) => {
  const {
    filename = 'export',
    timestamp = true
  } = options

  if (!data) {
    throw new Error('No data to export')
  }

  const jsonContent = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
  
  const finalFilename = timestamp 
    ? `${filename}_${new Date().toISOString().split('T')[0]}.json`
    : `${filename}.json`
  
  downloadBlob(blob, finalFilename)
}

/**
 * Export data as Excel file (simple format)
 */
export const exportToExcel = (data: ExportData[], options: ExportOptions = {}) => {
  const {
    filename = 'export',
    timestamp = true,
    headers,
    sheetName = 'Sheet1'
  } = options

  if (!data || data.length === 0) {
    throw new Error('No data to export')
  }

  // Get headers from first object or use provided headers
  const excelHeaders = headers || Object.keys(data[0])
  
  // Create simple Excel XML format
  const xmlContent = createExcelXML(data, excelHeaders, sheetName)
  const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel' })
  
  const finalFilename = timestamp 
    ? `${filename}_${new Date().toISOString().split('T')[0]}.xls`
    : `${filename}.xls`
  
  downloadBlob(blob, finalFilename)
}

/**
 * Export chart as image
 */
export const exportChartAsImage = (
  canvas: HTMLCanvasElement, 
  options: ExportOptions & { format?: 'png' | 'jpeg'; quality?: number } = {}
) => {
  const {
    filename = 'chart',
    timestamp = true,
    format = 'png',
    quality = 0.92
  } = options

  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png'
  const url = canvas.toDataURL(mimeType, quality)
  
  const finalFilename = timestamp 
    ? `${filename}_${new Date().toISOString().split('T')[0]}.${format}`
    : `${filename}.${format}`
  
  // Create download link
  const link = document.createElement('a')
  link.href = url
  link.download = finalFilename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export filtered analytics data
 */
export const exportAnalyticsData = async (
  filters: any,
  format: 'csv' | 'json' | 'excel' = 'csv'
) => {
  try {
    // This would typically fetch data from your API
    const response = await fetch('/api/analytics/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ filters, format })
    })
    
    if (!response.ok) {
      throw new Error('Failed to export data')
    }
    
    const data = await response.json()
    
    switch (format) {
      case 'csv':
        exportToCSV(data.records, {
          filename: 'analytics_data',
          headers: data.headers
        })
        break
      case 'json':
        exportToJSON(data, { filename: 'analytics_data' })
        break
      case 'excel':
        exportToExcel(data.records, {
          filename: 'analytics_data',
          headers: data.headers,
          sheetName: 'Analytics Data'
        })
        break
    }
    
    return { success: true, recordCount: data.records?.length || 0 }
  } catch (error) {
    console.error('Export failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Create custom report export
 */
export const exportCustomReport = (
  reportData: {
    title: string
    summary: ExportData
    metrics: ExportData[]
    charts: { name: string; canvas: HTMLCanvasElement }[]
  },
  format: 'json' | 'html' = 'json'
) => {
  const timestamp = new Date().toISOString().split('T')[0]
  
  if (format === 'html') {
    // Create HTML report
    const htmlContent = createHTMLReport(reportData)
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' })
    downloadBlob(blob, `custom_report_${timestamp}.html`)
  } else {
    // Export as JSON with embedded chart data
    const reportWithCharts = {
      ...reportData,
      charts: reportData.charts.map(chart => ({
        name: chart.name,
        imageData: chart.canvas.toDataURL('image/png')
      })),
      exportedAt: new Date().toISOString()
    }
    
    exportToJSON(reportWithCharts, {
      filename: 'custom_report',
      timestamp: true
    })
  }
}

// Helper functions

/**
 * Download blob as file
 */
const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Create simple Excel XML format
 */
const createExcelXML = (data: ExportData[], headers: string[], sheetName: string) => {
  const xml = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="${sheetName}">
  <Table>
   <Row>
    ${headers.map(header => `<Cell><Data ss:Type="String">${escapeXML(header)}</Data></Cell>`).join('')}
   </Row>
   ${data.map(row => `
   <Row>
    ${headers.map(header => {
      const value = row[header]
      const type = typeof value === 'number' ? 'Number' : 'String'
      return `<Cell><Data ss:Type="${type}">${escapeXML(String(value))}</Data></Cell>`
    }).join('')}
   </Row>`).join('')}
  </Table>
 </Worksheet>
</Workbook>`
  
  return xml
}

/**
 * Create HTML report
 */
const createHTMLReport = (reportData: {
  title: string
  summary: ExportData
  metrics: ExportData[]
  charts: { name: string; canvas: HTMLCanvasElement }[]
}) => {
  const chartImages = reportData.charts.map(chart => ({
    name: chart.name,
    imageData: chart.canvas.toDataURL('image/png')
  }))
  
  return `<!DOCTYPE html>
<html>
<head>
    <title>${reportData.title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1, h2 { color: #333; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; }
        .chart { margin-bottom: 30px; }
        .chart img { max-width: 100%; height: auto; }
        .summary { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <h1>${reportData.title}</h1>
    <div class="summary">
        <h2>Summary</h2>
        ${Object.entries(reportData.summary).map(([key, value]) => 
          `<p><strong>${key}:</strong> ${value}</p>`
        ).join('')}
    </div>
    
    <h2>Metrics</h2>
    <table>
        <thead>
            <tr>
                ${Object.keys(reportData.metrics[0] || {}).map(key => `<th>${key}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
            ${reportData.metrics.map(metric => `
                <tr>
                    ${Object.values(metric).map(value => `<td>${value}</td>`).join('')}
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <h2>Charts</h2>
    ${chartImages.map(chart => `
        <div class="chart">
            <h3>${chart.name}</h3>
            <img src="${chart.imageData}" alt="${chart.name}">
        </div>
    `).join('')}
    
    <footer>
        <p>Generated on: ${new Date().toLocaleString()}</p>
    </footer>
</body>
</html>`
}

/**
 * Escape XML characters
 */
const escapeXML = (str: string) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Format utilities

/**
 * Format data for export with proper types and formatting
 */
export const formatDataForExport = (
  rawData: any[],
  columnDefinitions: {
    key: string
    header: string
    type: 'string' | 'number' | 'date' | 'currency' | 'percentage'
    format?: string
  }[]
) => {
  return rawData.map(row => {
    const formattedRow: ExportData = {}
    
    columnDefinitions.forEach(({ key, header, type, format }) => {
      const value = row[key]
      
      switch (type) {
        case 'number':
          formattedRow[header] = typeof value === 'number' ? value : parseFloat(value) || 0
          break
        case 'currency':
          formattedRow[header] = `$${(parseFloat(value) || 0).toFixed(2)}`
          break
        case 'percentage':
          formattedRow[header] = `${((parseFloat(value) || 0) * 100).toFixed(1)}%`
          break
        case 'date':
          formattedRow[header] = value ? new Date(value).toLocaleDateString() : ''
          break
        default:
          formattedRow[header] = value || ''
      }
    })
    
    return formattedRow
  })
}
