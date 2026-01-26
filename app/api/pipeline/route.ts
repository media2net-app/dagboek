import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/pipeline - Get all pipeline items
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId') || null
    const items = await prisma.pipelineItem.findMany({
      where: userId ? { userId } : {},
      include: { project: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching pipeline items:', error)
    return NextResponse.json({ error: 'Failed to fetch pipeline items' }, { status: 500 })
  }
}

// POST /api/pipeline - Create a new pipeline item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const item = await prisma.pipelineItem.create({
      data: {
        title: body.title,
        description: body.description || null,
        status: body.status || 'todo',
        priority: body.priority || 'medium',
        projectId: body.projectId || null,
        dueDate: body.dueDate || null,
        amount: body.amount || null,
        userId: body.userId || null,
      },
      include: { project: true },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error creating pipeline item:', error)
    return NextResponse.json({ error: 'Failed to create pipeline item' }, { status: 500 })
  }
}

// PUT /api/pipeline - Update a pipeline item
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    const item = await prisma.pipelineItem.update({
      where: { id },
      data: updateData,
      include: { project: true },
    })
    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating pipeline item:', error)
    return NextResponse.json({ error: 'Failed to update pipeline item' }, { status: 500 })
  }
}

// DELETE /api/pipeline - Delete a pipeline item
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
    }
    await prisma.pipelineItem.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting pipeline item:', error)
    return NextResponse.json({ error: 'Failed to delete pipeline item' }, { status: 500 })
  }
}
