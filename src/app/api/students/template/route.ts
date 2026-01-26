import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Define the template headers
    const headers = [
      'Name',
      'Date of Birth', 
      'WhatsApp',
      'Course ID',
      'Course Name (Reference)',
      'Course Type',
      'Participants',
      'Final Price',
      'Discount',
      'Last Education',
      'Status'
    ];

    // Sample data rows to guide users
    const sampleData = [
      [
        'John Doe',
        '1995-01-15',
        '081234567890',
        'cmhbz2nos000av6f8ujssrcgf',
        'Microsoft Office',
        'regular',
        '1',
        '2500000',
        '0',
        'S1',
        'pending'
      ],
      [
        'Jane Smith',
        '1998-03-20',
        '081234567891',
        'cmhbz39o5000dv6f8sfv149fr',
        'Design Grafis',
        'private',
        '1',
        '3000000',
        '500000',
        'SMA',
        'confirmed'
      ],
      [
        'Bob Wilson',
        '1992-07-10',
        '081234567892',
        'cmhbz2nos000av6f8ujssrcgf',
        'Microsoft Office',
        'regular',
        '2',
        '2000000',
        '200000',
        'S1',
        'completed'
      ]
    ];

    // Instructions row
    const instructions = [
      'INSTRUCTIONS:',
      'Fill data below this row',
      'Name is required',
      'Date format: YYYY-MM-DD',
      'WhatsApp with country code',
      'Course ID must exist in system',
      'Course Type: regular/private',
      'Participants: number of people',
      'Final Price: in Rupiah',
      'Status: pending/confirmed/completed',
      'Last Education: SD/SMP/SMA/S1/S2/S3'
    ];

    // Combine all data
    const worksheetData = [
      headers,
      [], // Empty row
      instructions,
      [], // Empty row
      ...sampleData
    ];

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    const columnWidths = [
      { wch: 20 }, // Name
      { wch: 15 }, // Date of Birth
      { wch: 15 }, // WhatsApp
      { wch: 15 }, // Course ID
      { wch: 25 }, // Course Name
      { wch: 12 }, // Course Type
      { wch: 12 }, // Participants
      { wch: 12 }, // Final Price
      { wch: 12 }, // Discount
      { wch: 15 }, // Last Education
      { wch: 12 }  // Status
    ];
    worksheet['!cols'] = columnWidths;

    // Style the header row
    const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:J1');
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;
      
      worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '4472C4' } },
        alignment: { horizontal: 'center' }
      };
    }

    // Style the instructions row
    for (let col = 0; col < 10; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 2, c: col });
      if (!worksheet[cellAddress]) continue;
      
      worksheet[cellAddress].s = {
        font: { italic: true, color: { rgb: '666666' } },
        fill: { fgColor: { rgb: 'F2F2F2' } }
      };
    }

    // Add data validation for Status column (column G, index 6)
    // Note: XLSX library has limited support for data validation
    // This is more of a visual guide for users
    
    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Student Import Template');

    // Generate buffer
    const buffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx',
      compression: true 
    });

    // Create filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `student_import_template_${currentDate}.xlsx`;

    // Return the file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=\"${filename}\"`,
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error generating Excel template:', error);
    return NextResponse.json(
      { error: 'Failed to generate Excel template' },
      { status: 500 }
    );
  }
}