import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ProjectDocumentService } from '@/lib/services/projects'

interface RouteContext {
  params: Promise<{ id: string }>
}

// Reorder documents
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { documentOrders } = body

    if (!Array.isArray(documentOrders)) {
      return NextResponse.json({ error: 'Invalid document orders format' }, { status: 400 })
    }

    // Validate each order entry
    for (const order of documentOrders) {
      if (!order.id || typeof order.sortOrder !== 'number') {
        return NextResponse.json({ error: 'Invalid document order entry' }, { status: 400 })
      }
    }

    // Update the sort orders
    await ProjectDocumentService.reorderDocuments(documentOrders)

    return NextResponse.json({ 
      message: 'Documents reordered successfully' 
    })
  } catch (error) {
    console.error('Error reordering documents:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}