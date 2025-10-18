import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    // Check user authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.accessToken) {
      return NextResponse.json({ 
        error: 'Unauthorized. Please sign in with Google to upload files.' 
      }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;
    const containerNumber = formData.get('containerNumber') as string;
    const doorNumber = formData.get('doorNumber') as string;
    const fileType = formData.get('fileType') as string;

    if (!file || !fileName || !containerNumber || !doorNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const parentFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!parentFolderId) {
      return NextResponse.json({ error: 'Drive folder not configured' }, { status: 500 });
    }
    const accessToken = session.accessToken;
    const folderName = `${containerNumber}_${doorNumber}`;

    // Check if folder exists
    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${encodeURIComponent(folderName)}' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id,name)`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!searchResponse.ok) {
      const errorData = await searchResponse.json();
      console.error('Drive search error:', errorData);
      return NextResponse.json({ 
        error: 'Failed to search Drive folders',
        details: errorData 
      }, { status: 500 });
    }

    const searchData = await searchResponse.json();
    let folderId;

    if (searchData.files && searchData.files.length > 0) {
      folderId = searchData.files[0].id;
    } else {
      // Create new folder at root
      const createFolderResponse = await fetch(
        'https://www.googleapis.com/drive/v3/files',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentFolderId]
          }),
        }
      );

      if (!createFolderResponse.ok) {
        const errorData = await createFolderResponse.json();
        console.error('Folder creation error:', errorData);
        return NextResponse.json({ 
          error: 'Failed to create Drive folder',
          details: errorData 
        }, { status: 500 });
      }

      const folderData = await createFolderResponse.json();
      folderId = folderData.id;
    }

    // Upload file
    const fileBuffer = await file.arrayBuffer();
    const metadata = {
      name: fileName,
      parents: [folderId],
    };

    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const closeDelimiter = "\r\n--" + boundary + "--";

    const metadataString = JSON.stringify(metadata);
    const fileData = new Uint8Array(fileBuffer);

    let multipartRequestBody = 
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      metadataString +
      delimiter +
      `Content-Type: ${fileType === 'pdf' ? 'application/pdf' : 'image/jpeg'}\r\n` +
      'Content-Transfer-Encoding: base64\r\n\r\n' +
      Buffer.from(fileData).toString('base64') +
      closeDelimiter;

    const uploadResponse = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,webContentLink',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      }
    );

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      console.error('File upload error:', errorData);
      return NextResponse.json({ 
        error: 'Failed to upload file',
        details: errorData 
      }, { status: 500 });
    }

    const uploadData = await uploadResponse.json();

    // Make PDF publicly accessible
    if (fileType === 'pdf' && uploadData.id) {
      const permissionResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${uploadData.id}/permissions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role: 'reader',
            type: 'anyone',
          }),
        }
      );

      if (!permissionResponse.ok) {
        console.warn('Failed to make file public, but upload succeeded');
      }
    }

    return NextResponse.json({
      success: true,
      fileId: uploadData.id,
      viewLink: uploadData.webViewLink,
      downloadLink: uploadData.webContentLink,
      folderId: folderId,
    });
  } catch (error) {
    console.error('Drive API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload to Drive', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}