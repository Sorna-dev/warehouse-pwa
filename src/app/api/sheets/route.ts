import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

const getAuthClient = () => {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
};

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const auth = getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      return NextResponse.json({ error: 'Sheet ID not configured' }, { status: 500 });
    }

    // Get existing data
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'A:K',
    });

    const rows = existing.data.values || [];
    const containerIndex = rows.findIndex((row, index) => 
      index > 0 && row[2] === data.doorNumber // Match by Door Number (column C)
    );

    if (containerIndex > 0) {
      // Update existing row
      const rowNumber = containerIndex + 1;
      
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `A${rowNumber}:K${rowNumber}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[
            data.containerNumber,
            data.operationType,
            data.doorNumber,
            data.status === 'completed' ? 'Completed' : 'In Progress',
            data.totalPieces,
            data.packageTypes,
            data.materials,
            data.discrepancies || 'None',
            data.driveLink || '',
            new Date().toISOString(),
            'Warehouse Staff',
          ]],
        },
      });

      // Apply green background if completed
      if (data.status === 'completed') {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [{
              repeatCell: {
                range: {
                  sheetId: 0,
                  startRowIndex: rowNumber - 1,
                  endRowIndex: rowNumber,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: {
                      red: 0.83,
                      green: 0.93,
                      blue: 0.85,
                    },
                  },
                },
                fields: 'userEnteredFormat.backgroundColor',
              },
            }],
          },
        });
      }

      return NextResponse.json({ success: true, action: 'updated', row: rowNumber });
    } else {
      // Append new row
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'A:K',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[
            data.containerNumber,
            data.operationType,
            data.doorNumber,
            data.status === 'completed' ? 'Completed' : 'In Progress',
            data.totalPieces,
            data.packageTypes,
            data.materials,
            data.discrepancies || 'None',
            data.driveLink || '',
            new Date().toISOString(),
            'Warehouse Staff',
          ]],
        },
      });

      const newRowNumber = rows.length + 1;

      if (data.status === 'completed') {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [{
              repeatCell: {
                range: {
                  sheetId: 0,
                  startRowIndex: newRowNumber - 1,
                  endRowIndex: newRowNumber,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: {
                      red: 0.83,
                      green: 0.93,
                      blue: 0.85,
                    },
                  },
                },
                fields: 'userEnteredFormat.backgroundColor',
              },
            }],
          },
        });
      }

      return NextResponse.json({ success: true, action: 'created', row: newRowNumber });
    }
  } catch (error) {
    console.error('Sheets API error:', error);
    return NextResponse.json({ error: 'Failed to update sheet' }, { status: 500 });
  }
}