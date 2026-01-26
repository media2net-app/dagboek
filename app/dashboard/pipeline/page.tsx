'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, X, Check, GripVertical, Trash2, Calendar, Clock, TrendingUp, Wallet } from 'lucide-react'

interface PipelineItem {
  id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high'
  projectId?: string
  dueDate?: string
  amount?: number
  createdAt: string
}

const STORAGE_KEY = 'dagboek-pipeline-items'
const PROJECTS_STORAGE_KEY = 'dagboek-projecten'

interface Project {
  id: string
  name: string
  color: string
}

const defaultItems: PipelineItem[] = [
  {
    id: '1',
    title: 'Nieuwe feature implementeren',
    description: 'User authentication toevoegen',
    status: 'todo',
    priority: 'high',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Bug fix dashboard',
    description: 'Kalender weergave corrigeren',
    status: 'in-progress',
    priority: 'medium',
    createdAt: new Date().toISOString(),
  },
]

const statuses = [
  { id: 'todo', name: 'To Do', color: 'bg-gray-500/20 border-gray-500/40' },
  { id: 'in-progress', name: 'In Progress', color: 'bg-blue-500/20 border-blue-500/40' },
  { id: 'review', name: 'Review', color: 'bg-yellow-500/20 border-yellow-500/40' },
  { id: 'done', name: 'Done', color: 'bg-green-500/20 border-green-500/40' },
]

export default function PipelinePage() {
  const [items, setItems] = useState<PipelineItem[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [newItem, setNewItem] = useState<{ title: string; description: string; status: PipelineItem['status']; priority: PipelineItem['priority']; projectId: string; dueDate: string; amount: string }>({ title: '', description: '', status: 'todo', priority: 'medium', projectId: '', dueDate: '', amount: '' })
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editItem, setEditItem] = useState<{ title: string; description: string; status: PipelineItem['status']; priority: PipelineItem['priority']; projectId: string; dueDate: string; amount: string }>({ title: '', description: '', status: 'todo', priority: 'medium', projectId: '', dueDate: '', amount: '' })

  const [loading, setLoading] = useState(true)

  // Load items and projects from API
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      // Load pipeline items
      const itemsResponse = await fetch('/api/pipeline')
      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json()
        setItems(itemsData)
      }

      // Load projects
      const projectsResponse = await fetch('/api/projects')
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json()
        setProjects(projectsData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addItem = async () => {
    if (newItem.title.trim()) {
      try {
        const response = await fetch('/api/pipeline', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newItem.title.trim(),
            description: newItem.description.trim() || null,
            status: newItem.status,
            priority: newItem.priority,
            projectId: newItem.projectId || null,
            dueDate: newItem.dueDate || null,
            amount: newItem.amount ? parseFloat(newItem.amount) : null,
          }),
        })

        if (response.ok) {
          const newItemObj = await response.json()
          setItems([...items, newItemObj])
          setNewItem({ title: '', description: '', status: 'todo', priority: 'medium', projectId: '', dueDate: '', amount: '' })
        }
      } catch (error) {
        console.error('Error adding item:', error)
      }
    }
  }

  const deleteItem = async (id: string) => {
    if (confirm('Weet je zeker dat je dit item wilt verwijderen?')) {
      try {
        const response = await fetch(`/api/pipeline?id=${id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          setItems(items.filter((item) => item.id !== id))
        }
      } catch (error) {
        console.error('Error deleting item:', error)
      }
    }
  }

  const moveItem = async (id: string, newStatus: PipelineItem['status']) => {
    try {
      const response = await fetch('/api/pipeline', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: newStatus,
        }),
      })

      if (response.ok) {
        const updatedItem = await response.json()
        setItems(items.map((item) => (item.id === id ? updatedItem : item)))
      }
    } catch (error) {
      console.error('Error moving item:', error)
    }
  }

  const startEditing = (item: PipelineItem) => {
    setEditingItemId(item.id)
    setEditItem({
      title: item.title,
      description: item.description,
      status: item.status,
      priority: item.priority,
      projectId: item.projectId || '',
      dueDate: item.dueDate || '',
      amount: item.amount?.toString() || '',
    })
  }

  const cancelEditing = () => {
    setEditingItemId(null)
    setEditItem({ title: '', description: '', status: 'todo', priority: 'medium', projectId: '', dueDate: '', amount: '' })
  }

  const saveEdit = async (id: string) => {
    if (editItem.title.trim()) {
      try {
        const response = await fetch('/api/pipeline', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            title: editItem.title.trim(),
            description: editItem.description.trim() || null,
            status: editItem.status,
            priority: editItem.priority,
            projectId: editItem.projectId || null,
            dueDate: editItem.dueDate || null,
            amount: editItem.amount ? parseFloat(editItem.amount) : null,
          }),
        })

        if (response.ok) {
          const updatedItem = await response.json()
          setItems(items.map((item) => (item.id === id ? updatedItem : item)))
          cancelEditing()
        }
      } catch (error) {
        console.error('Error updating item:', error)
      }
    }
  }

  const getItemsByStatus = (status: PipelineItem['status']) => {
    return items.filter((item) => item.status === status)
  }

  const getProjectColor = (projectId?: string) => {
    if (!projectId) return null
    const project = projects.find((p) => p.id === projectId)
    return project?.color || null
  }

  const getPriorityColor = (priority: PipelineItem['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-400'
      case 'medium':
        return 'text-yellow-400'
      case 'low':
        return 'text-green-400'
      default:
        return 'text-luxury-dark-text-light'
    }
  }

  // Calculate revenue
  const calculateUpcomingRevenue = () => {
    return items
      .filter((item) => item.status !== 'done' && item.amount)
      .reduce((sum, item) => sum + (item.amount || 0), 0)
  }

  const calculateDoneRevenue = () => {
    return items
      .filter((item) => item.status === 'done' && item.amount)
      .reduce((sum, item) => sum + (item.amount || 0), 0)
  }

  const upcomingRevenue = calculateUpcomingRevenue()
  const doneRevenue = calculateDoneRevenue()

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-luxury-dark-text-light">Laden...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-luxury-dark-text mb-2">
            Pipeline
          </h1>
          <p className="text-luxury-dark-text-light">
            Beheer je taken en projecten in een visuele pipeline
          </p>
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-luxury-charcoal rounded-lg border border-luxury-dark-border p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <p className="text-luxury-dark-text-light text-sm">Komende Omzet</p>
            </div>
            <p className="text-2xl font-semibold text-blue-400">
              €{upcomingRevenue.toFixed(2)}
            </p>
            <p className="text-xs text-luxury-dark-text-light mt-1">
              Items in pipeline
            </p>
          </div>

          <div className="bg-luxury-charcoal rounded-lg border border-luxury-dark-border p-6">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-green-400" />
              <p className="text-luxury-dark-text-light text-sm">Gerealiseerde Omzet</p>
            </div>
            <p className="text-2xl font-semibold text-green-400">
              €{doneRevenue.toFixed(2)}
            </p>
            <p className="text-xs text-luxury-dark-text-light mt-1">
              Afgeronde items
            </p>
          </div>
        </div>

        {/* Add new item */}
        <div className="bg-luxury-charcoal rounded-lg border border-luxury-dark-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-luxury-dark-text mb-4">
            Nieuw item toevoegen
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Titel"
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              className="px-4 py-3 bg-luxury-charcoal-lighter border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text placeholder:text-luxury-dark-text-light"
            />
            <input
              type="text"
              placeholder="Beschrijving (optioneel)"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              className="px-4 py-3 bg-luxury-charcoal-lighter border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text placeholder:text-luxury-dark-text-light"
            />
            <select
              value={newItem.status}
              onChange={(e) => setNewItem({ ...newItem, status: e.target.value as PipelineItem['status'] })}
              className="px-4 py-3 bg-luxury-charcoal-lighter border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text"
            >
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
            <select
              value={newItem.priority}
              onChange={(e) => setNewItem({ ...newItem, priority: e.target.value as PipelineItem['priority'] })}
              className="px-4 py-3 bg-luxury-charcoal-lighter border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text"
            >
              <option value="low">Laag</option>
              <option value="medium">Gemiddeld</option>
              <option value="high">Hoog</option>
            </select>
            {projects.length > 0 && (
              <select
                value={newItem.projectId}
                onChange={(e) => setNewItem({ ...newItem, projectId: e.target.value })}
                className="px-4 py-3 bg-luxury-charcoal-lighter border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text"
              >
                <option value="">Geen project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            )}
            <input
              type="date"
              value={newItem.dueDate}
              onChange={(e) => setNewItem({ ...newItem, dueDate: e.target.value })}
              className="px-4 py-3 bg-luxury-charcoal-lighter border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text"
              placeholder="Deadline (optioneel)"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Bedrag (€) - optioneel"
              value={newItem.amount}
              onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
              className="px-4 py-3 bg-luxury-charcoal-lighter border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text placeholder:text-luxury-dark-text-light"
            />
          </div>
          <button
            onClick={addItem}
            className="mt-4 w-full md:w-auto px-6 py-3 bg-luxury-gold text-luxury-charcoal font-semibold rounded-lg hover:bg-luxury-gold-dark transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Item Toevoegen
          </button>
        </div>

        {/* Pipeline Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statuses.map((status) => {
            const statusItems = getItemsByStatus(status.id as PipelineItem['status'])
            return (
              <div
                key={status.id}
                className="bg-luxury-charcoal rounded-lg border border-luxury-dark-border p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-luxury-dark-text">
                    {status.name}
                  </h3>
                  <span className="text-sm text-luxury-dark-text-light bg-luxury-charcoal-lighter px-2 py-1 rounded">
                    {statusItems.length}
                  </span>
                </div>

                <div className="space-y-3 min-h-[200px]">
                  {statusItems.length === 0 ? (
                    <div className="text-center py-8 text-luxury-dark-text-light text-sm">
                      Geen items
                    </div>
                  ) : (
                    statusItems.map((item) => {
                      const projectColor = getProjectColor(item.projectId)
                      return (
                        <div
                          key={item.id}
                          className={`bg-luxury-charcoal-lighter rounded-lg border p-4 hover:border-luxury-gold/50 transition-all ${
                            editingItemId === item.id ? 'border-luxury-gold' : 'border-luxury-dark-border'
                          }`}
                        >
                          {editingItemId === item.id ? (
                            // Edit mode
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={editItem.title}
                                onChange={(e) => setEditItem({ ...editItem, title: e.target.value })}
                                className="w-full px-3 py-2 bg-luxury-charcoal border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text"
                                placeholder="Titel"
                                autoFocus
                              />
                              <textarea
                                value={editItem.description}
                                onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                                className="w-full px-3 py-2 bg-luxury-charcoal border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text"
                                placeholder="Beschrijving"
                                rows={2}
                              />
                              <select
                                value={editItem.status}
                                onChange={(e) => setEditItem({ ...editItem, status: e.target.value as PipelineItem['status'] })}
                                className="w-full px-3 py-2 bg-luxury-charcoal border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text"
                              >
                                {statuses.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.name}
                                  </option>
                                ))}
                              </select>
                              <select
                                value={editItem.priority}
                                onChange={(e) => setEditItem({ ...editItem, priority: e.target.value as PipelineItem['priority'] })}
                                className="w-full px-3 py-2 bg-luxury-charcoal border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text"
                              >
                                <option value="low">Laag</option>
                                <option value="medium">Gemiddeld</option>
                                <option value="high">Hoog</option>
                              </select>
                              {projects.length > 0 && (
                                <select
                                  value={editItem.projectId}
                                  onChange={(e) => setEditItem({ ...editItem, projectId: e.target.value })}
                                  className="w-full px-3 py-2 bg-luxury-charcoal border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text"
                                >
                                  <option value="">Geen project</option>
                                  {projects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                      {project.name}
                                    </option>
                                  ))}
                                </select>
                              )}
                              <input
                                type="date"
                                value={editItem.dueDate}
                                onChange={(e) => setEditItem({ ...editItem, dueDate: e.target.value })}
                                className="w-full px-3 py-2 bg-luxury-charcoal border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text"
                              />
                              <input
                                type="number"
                                step="0.01"
                                placeholder="Bedrag (€) - optioneel"
                                value={editItem.amount}
                                onChange={(e) => setEditItem({ ...editItem, amount: e.target.value })}
                                className="w-full px-3 py-2 bg-luxury-charcoal border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text placeholder:text-luxury-dark-text-light"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => saveEdit(item.id)}
                                  className="flex-1 px-3 py-2 bg-luxury-gold text-luxury-charcoal font-medium rounded hover:bg-luxury-gold-dark transition-colors text-sm"
                                >
                                  <Check className="w-4 h-4 inline mr-1" />
                                  Opslaan
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="px-3 py-2 text-luxury-dark-text-light hover:text-red-400 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            // View mode
                            <>
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-luxury-dark-text mb-1">
                                    {item.title}
                                  </h4>
                                  {item.description && (
                                    <p className="text-sm text-luxury-dark-text-light mb-2">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                                <div className="flex gap-1 ml-2">
                                  <button
                                    onClick={() => startEditing(item)}
                                    className="text-luxury-dark-text-light hover:text-luxury-gold transition-colors p-1"
                                    title="Bewerken"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteItem(item.id)}
                                    className="text-luxury-dark-text-light hover:text-red-400 transition-colors p-1"
                                    title="Verwijderen"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span className={`font-medium ${getPriorityColor(item.priority)}`}>
                                  {item.priority === 'high' ? 'Hoog' : item.priority === 'medium' ? 'Gemiddeld' : 'Laag'}
                                </span>
                                {projectColor && (
                                  <span
                                    className="px-2 py-1 rounded text-white font-medium"
                                    style={{ backgroundColor: projectColor }}
                                  >
                                    {projects.find((p) => p.id === item.projectId)?.name}
                                  </span>
                                )}
                                {item.dueDate && (
                                  <span className="text-luxury-dark-text-light flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(item.dueDate).toLocaleDateString('nl-NL', {
                                      day: 'numeric',
                                      month: 'short',
                                    })}
                                  </span>
                                )}
                                {item.amount && (
                                  <span className="text-luxury-gold font-semibold flex items-center gap-1">
                                    <Wallet className="w-3 h-3" />
                                    €{item.amount.toFixed(2)}
                                  </span>
                                )}
                              </div>

                              {/* Move buttons */}
                              <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-luxury-dark-border">
                                {statuses
                                  .filter((s) => s.id !== item.status)
                                  .map((s) => (
                                    <button
                                      key={s.id}
                                      onClick={() => moveItem(item.id, s.id as PipelineItem['status'])}
                                      className="text-xs px-2 py-1 bg-luxury-charcoal border border-luxury-dark-border rounded hover:border-luxury-gold/50 transition-colors text-luxury-dark-text-light"
                                    >
                                      → {s.name}
                                    </button>
                                  ))}
                              </div>
                            </>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

