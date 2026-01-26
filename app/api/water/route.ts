import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/water - Get water intake entries
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId') || null
    const date = request.nextUrl.searchParams.get('date') // Optional: filter by date
    
    const where: any = userId ? { userId } : {}
    if (date) {
      where.date = date
    }

    const entries = await prisma.waterIntake.findMany({
      where,
      orderBy: { date: 'desc' },
    })
    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error fetching water intake:', error)
    return NextResponse.json({ error: 'Failed to fetch water intake' }, { status: 500 })
  }
}

// POST /api/water - Create or update water intake
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, amount, userId } = body

    // Use upsert to create or update
    const entry = await prisma.waterIntake.upsert({
      where: {
        date_userId: {
          date,
          userId: userId || null,
        },
      },
      update: {
        amount,
      },
      create: {
        date,
        amount,
        userId: userId || null,
      },
    })
    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('Error creating/updating water intake:', error)
    return NextResponse.json({ error: 'Failed to create/update water intake' }, { status: 500 })
  }
}

// DELETE /api/water - Delete water intake entry
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
    }
    await prisma.waterIntake.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting water intake:', error)
    return NextResponse.json({ error: 'Failed to delete water intake' }, { status: 500 })
  }
}
