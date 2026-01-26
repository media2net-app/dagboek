import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/weights - Get all weight entries
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId') || null
    const entries = await prisma.weightEntry.findMany({
      where: userId ? { userId } : {},
      orderBy: { date: 'desc' },
    })
    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error fetching weight entries:', error)
    return NextResponse.json({ error: 'Failed to fetch weight entries' }, { status: 500 })
  }
}

// POST /api/weights - Create a new weight entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const entry = await prisma.weightEntry.create({
      data: {
        date: body.date,
        weight: body.weight,
        userId: body.userId || null,
      },
    })
    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('Error creating weight entry:', error)
    return NextResponse.json({ error: 'Failed to create weight entry' }, { status: 500 })
  }
}

// PUT /api/weights - Update a weight entry
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    const entry = await prisma.weightEntry.update({
      where: { id },
      data: updateData,
    })
    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error updating weight entry:', error)
    return NextResponse.json({ error: 'Failed to update weight entry' }, { status: 500 })
  }
}

// DELETE /api/weights - Delete a weight entry
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
    }
    await prisma.weightEntry.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting weight entry:', error)
    return NextResponse.json({ error: 'Failed to delete weight entry' }, { status: 500 })
  }
}
