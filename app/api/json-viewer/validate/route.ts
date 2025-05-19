import { NextRequest, NextResponse } from 'next/server'
import { validateJsonForViewer } from '@/lib/utils/json-validation'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const validationResult = validateJsonForViewer(body)
    
    if (validationResult.error) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      )
    }
    
    // Calculate size information
    const originalSize = JSON.stringify(body).length
    const truncatedSize = validationResult.data ? JSON.stringify(validationResult.data).length : 0
    
    return NextResponse.json({
      success: true,
      data: validationResult.data,
      metadata: {
        isTruncated: validationResult.truncated,
        originalSize,
        truncatedSize,
        warnings: validationResult.truncated ? 
          [`Data was truncated: ${validationResult.truncationInfo.totalTruncated} total truncations`] : []
      }
    })
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}