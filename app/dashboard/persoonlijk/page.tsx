'use client'

import { useState, useEffect } from 'react'
import { Trash2, Clock, Plus, Edit2, X, Check, User } from 'lucide-react'

interface PersonalTask {
  id: string
  title: string
  description: string
  completed: boolean
  time: string
  endTime?: string
}

// Helper function to convert time string (HH:MM) to minutes for sorting
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + (minutes || 0)
}

// Sort tasks by time (ascending), with completed tasks at the end
const sortTasksByTime = (tasks: PersonalTask[]): PersonalTask[] => {
  return [...tasks].sort((a, b) => {
    // First, separate completed and incomplete tasks
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }
    // Then sort by time (ascending)
    return timeToMinutes(a.time) - timeToMinutes(b.time)
  })
}

export default function PersoonlijkPage() {
  const [tasks, setTasks] = useState<PersonalTask[]>([])
  const [newTask, setNewTask] = useState({ title: '', description: '', time: '', endTime: '' })
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editTask, setEditTask] = useState({ title: '', description: '', time: '', endTime: '' })
  const [loading, setLoading] = useState(true)

  // Load tasks from API
  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tasks?type=personal')
      if (response.ok) {
        const data = await response.json()
        setTasks(sortTasksByTime(data))
      }
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTask = async () => {
    if (newTask.title.trim()) {
      try {
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'personal',
            title: newTask.title.trim(),
            description: newTask.description.trim() || null,
            time: newTask.time || '00:00',
            endTime: newTask.endTime || null,
            completed: false,
          }),
        })

        if (response.ok) {
          const newTaskItem = await response.json()
          setTasks(sortTasksByTime([...tasks, newTaskItem]))
          setNewTask({ title: '', description: '', time: '', endTime: '' })
        }
      } catch (error) {
        console.error('Error adding task:', error)
      }
    }
  }

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          type: 'personal',
          completed: !task.completed,
        }),
      })

      if (response.ok) {
        const updatedTask = await response.json()
        const updatedTasks = tasks.map((t) => (t.id === id ? updatedTask : t))
        setTasks(sortTasksByTime(updatedTasks))
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const deleteTask = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks?id=${id}&type=personal`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const updatedTasks = tasks.filter((task) => task.id !== id)
        setTasks(sortTasksByTime(updatedTasks))
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const startEditing = (task: PersonalTask) => {
    setEditingTaskId(task.id)
    setEditTask({
      title: task.title,
      description: task.description,
      time: task.time,
      endTime: task.endTime || '',
    })
  }

  const cancelEditing = () => {
    setEditingTaskId(null)
    setEditTask({ title: '', description: '', time: '', endTime: '' })
  }

  const saveEdit = async (id: string) => {
    if (editTask.title.trim()) {
      try {
        const response = await fetch('/api/tasks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            type: 'personal',
            title: editTask.title.trim(),
            description: editTask.description.trim() || null,
            time: editTask.time || '00:00',
            endTime: editTask.endTime || null,
          }),
        })

        if (response.ok) {
          const updatedTask = await response.json()
          const updatedTasks = tasks.map((t) => (t.id === id ? updatedTask : t))
          setTasks(sortTasksByTime(updatedTasks))
          setEditingTaskId(null)
          setEditTask({ title: '', description: '', time: '', endTime: '' })
        }
      } catch (error) {
        console.error('Error updating task:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-luxury-dark-text-light">Laden...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <User className="w-8 h-8 text-luxury-gold" />
            <h1 className="text-3xl font-semibold text-luxury-dark-text">
              Persoonlijke Planning
            </h1>
          </div>
          <p className="text-luxury-dark-text-light">
            Plan en track je persoonlijke taken en afspraken
          </p>
        </div>

        {/* Add new task */}
        <div className="bg-luxury-charcoal rounded-lg border border-luxury-dark-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-luxury-dark-text mb-4">
            Nieuwe taak toevoegen
          </h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Taak titel"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full px-4 py-3 bg-luxury-charcoal-lighter border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text placeholder:text-luxury-dark-text-light"
            />
            <input
              type="text"
              placeholder="Beschrijving (optioneel)"
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
              className="w-full px-4 py-3 bg-luxury-charcoal-lighter border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text placeholder:text-luxury-dark-text-light"
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-luxury-dark-text mb-2">
                  Begin tijd
                </label>
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-luxury-dark-text-light mt-6" />
                <input
                  type="time"
                  value={newTask.time}
                  onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-luxury-charcoal-lighter border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text"
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-luxury-dark-text mb-2">
                  Eind tijd (optioneel)
                </label>
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-luxury-dark-text-light mt-6" />
                <input
                  type="time"
                  value={newTask.endTime}
                  onChange={(e) => setNewTask({ ...newTask, endTime: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-luxury-charcoal-lighter border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text"
                />
              </div>
            </div>
            <button
              onClick={addTask}
              className="w-full px-6 py-3 bg-luxury-gold text-luxury-charcoal font-semibold rounded-lg hover:bg-luxury-gold-dark transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Toevoegen
            </button>
          </div>
        </div>

        {/* Tasks list */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-luxury-dark-text mb-4">
            Vandaag ({new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })})
          </h2>

          {tasks.length === 0 ? (
            <div className="bg-luxury-charcoal rounded-lg border border-luxury-dark-border p-8 text-center">
              <p className="text-luxury-dark-text-light">Geen taken voor vandaag</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`bg-luxury-charcoal rounded-lg border border-luxury-dark-border p-6 hover:border-luxury-gold/50 transition-all ${
                  task.completed ? 'opacity-60' : ''
                }`}
              >
                {editingTaskId === task.id ? (
                  // Edit mode
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-luxury-gold font-medium">Taak bewerken</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(task.id)}
                          className="text-green-400 hover:text-green-300 transition-colors p-2"
                          title="Opslaan"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="text-luxury-dark-text-light hover:text-red-400 transition-colors p-2"
                          title="Annuleren"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={editTask.title}
                      onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                      className="w-full px-4 py-2 bg-luxury-charcoal-lighter border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text"
                      placeholder="Taak titel"
                    />
                    <input
                      type="text"
                      value={editTask.description}
                      onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                      className="w-full px-4 py-2 bg-luxury-charcoal-lighter border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text"
                      placeholder="Beschrijving (optioneel)"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <label className="block text-sm font-medium text-luxury-dark-text mb-2">
                          Begin tijd
                        </label>
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-luxury-dark-text-light mt-6" />
                        <input
                          type="time"
                          value={editTask.time}
                          onChange={(e) => setEditTask({ ...editTask, time: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 bg-luxury-charcoal-lighter border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text"
                        />
                      </div>
                      <div className="relative">
                        <label className="block text-sm font-medium text-luxury-dark-text mb-2">
                          Eind tijd (optioneel)
                        </label>
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-luxury-dark-text-light mt-6" />
                        <input
                          type="time"
                          value={editTask.endTime}
                          onChange={(e) => setEditTask({ ...editTask, endTime: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 bg-luxury-charcoal-lighter border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="mt-1 w-5 h-5 text-luxury-gold border-luxury-dark-border rounded focus:ring-luxury-gold focus:ring-2 bg-luxury-charcoal-lighter"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3
                          className={`text-lg font-semibold text-luxury-dark-text ${
                            task.completed ? 'line-through' : ''
                          }`}
                        >
                          {task.title}
                        </h3>
                        <span className="text-sm text-luxury-gold font-medium flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {task.time}
                          {task.endTime && ` - ${task.endTime}`}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-luxury-dark-text-light text-sm">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditing(task)}
                        className="text-luxury-dark-text-light hover:text-luxury-gold transition-colors p-2"
                        title="Bewerken"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-luxury-dark-text-light hover:text-red-400 transition-colors p-2"
                        title="Verwijderen"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
