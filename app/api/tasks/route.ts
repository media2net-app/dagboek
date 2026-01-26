import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/tasks - Get all tasks (work or personal)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') // 'work' or 'personal'
    const userId = searchParams.get('userId') || null // For future multi-user support

    if (type === 'work') {
      const tasks = await prisma.workTask.findMany({
        where: userId ? { userId } : {},
        include: { project: true },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json(tasks)
    } else if (type === 'personal') {
      const tasks = await prisma.personalTask.findMany({
        where: userId ? { userId } : {},
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json(tasks)
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, ...taskData } = body

    if (type === 'work') {
      const task = await prisma.workTask.create({
        data: {
          title: taskData.title,
          description: taskData.description || null,
          completed: taskData.completed || false,
          time: taskData.time,
          endTime: taskData.endTime || null,
          projectId: taskData.projectId || null,
          userId: taskData.userId || null,
        },
        include: { project: true },
      })
      return NextResponse.json(task, { status: 201 })
    } else if (type === 'personal') {
      const task = await prisma.personalTask.create({
        data: {
          title: taskData.title,
          description: taskData.description || null,
          completed: taskData.completed || false,
          time: taskData.time,
          endTime: taskData.endTime || null,
          userId: taskData.userId || null,
        },
      })
      return NextResponse.json(task, { status: 201 })
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}

// PUT /api/tasks - Update a task
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, type, ...updateData } = body

    if (type === 'work') {
      const task = await prisma.workTask.update({
        where: { id },
        data: updateData,
        include: { project: true },
      })
      return NextResponse.json(task)
    } else if (type === 'personal') {
      const task = await prisma.personalTask.update({
        where: { id },
        data: updateData,
      })
      return NextResponse.json(task)
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

// DELETE /api/tasks - Delete a task
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    const type = searchParams.get('type')

    if (!id || !type) {
      return NextResponse.json({ error: 'Missing id or type parameter' }, { status: 400 })
    }

    if (type === 'work') {
      await prisma.workTask.delete({ where: { id } })
    } else if (type === 'personal') {
      await prisma.personalTask.delete({ where: { id } })
    } else {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}
