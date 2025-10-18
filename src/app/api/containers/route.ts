import { NextRequest, NextResponse } from 'next/server';
import { ContainerData } from '@/app/types';

// This is a simple API route for container CRUD operations
// Since we're using localStorage on the client, this is optional
// But useful if you want to add server-side storage later

export async function GET(request: NextRequest) {
  // In a real app, you'd fetch from database
  // For now, this just returns a success message
  return NextResponse.json({ 
    success: true, 
    message: 'Containers are stored in localStorage on client side' 
  });
}

export async function POST(request: NextRequest) {
  try {
    const container: ContainerData = await request.json();
    
    // Validate required fields
    if (!container.containerNumber || !container.operationType || !container.doorNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In a real app, you'd save to database here
    // For now, we just validate and return success
    
    return NextResponse.json({
      success: true,
      container: container,
      message: 'Container validated successfully'
    });
  } catch (error) {
    console.error('Container API error:', error);
    return NextResponse.json(
      { error: 'Failed to process container' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const container: ContainerData = await request.json();
    
    if (!container.id) {
      return NextResponse.json(
        { error: 'Container ID required' },
        { status: 400 }
      );
    }

    // In a real app, you'd update in database
    
    return NextResponse.json({
      success: true,
      container: container,
      message: 'Container updated successfully'
    });
  } catch (error) {
    console.error('Container API error:', error);
    return NextResponse.json(
      { error: 'Failed to update container' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Container ID required' },
        { status: 400 }
      );
    }

    // In a real app, you'd delete from database
    
    return NextResponse.json({
      success: true,
      message: 'Container deleted successfully'
    });
  } catch (error) {
    console.error('Container API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete container' },
      { status: 500 }
    );
  }
}