'use client'

import { useState, useEffect } from 'react'
import { Trash2, Plus, Edit2, X, Check, FolderKanban } from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string
  color: string
  createdAt: string
}

const STORAGE_KEY = 'dagboek-projecten'

const defaultProjects: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Nieuwe website voor klant',
    color: '#D4AF37',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Mobile App',
    description: 'iOS en Android app ontwikkeling',
    color: '#3B82F6',
    createdAt: new Date().toISOString(),
  },
]

const colorOptions = [
  { name: 'Goud', value: '#D4AF37' },
  { name: 'Blauw', value: '#3B82F6' },
  { name: 'Groen', value: '#10B981' },
  { name: 'Rood', value: '#EF4444' },
  { name: 'Paars', value: '#8B5CF6' },
  { name: 'Oranje', value: '#F59E0B' },
  { name: 'Roze', value: '#EC4899' },
  { name: 'Cyaan', value: '#06B6D4' },
]

export default function ProjectenPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [newProject, setNewProject] = useState({ name: '', description: '', color: '#D4AF37' })
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [editProject, setEditProject] = useState({ name: '', description: '', color: '#D4AF37' })

  // Load projects from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsedProjects = JSON.parse(stored)
        setProjects(parsedProjects)
      } catch (error) {
        console.error('Error loading projects from localStorage:', error)
        setProjects(defaultProjects)
      }
    } else {
      setProjects(defaultProjects)
    }
  }, [])

  // Save projects to localStorage whenever projects change
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
    }
  }, [projects])

  const addProject = () => {
    if (newProject.name.trim()) {
      const newProjectItem: Project = {
        id: Date.now().toString(),
        name: newProject.name.trim(),
        description: newProject.description.trim(),
        color: newProject.color,
        createdAt: new Date().toISOString(),
      }
      setProjects([...projects, newProjectItem])
      setNewProject({ name: '', description: '', color: '#D4AF37' })
    }
  }

  const deleteProject = (id: string) => {
    if (confirm('Weet je zeker dat je dit project wilt verwijderen? Taken die aan dit project gekoppeld zijn blijven behouden.')) {
      setProjects(projects.filter((project) => project.id !== id))
    }
  }

  const startEditing = (project: Project) => {
    setEditingProjectId(project.id)
    setEditProject({
      name: project.name,
      description: project.description,
      color: project.color,
    })
  }

  const cancelEditing = () => {
    setEditingProjectId(null)
    setEditProject({ name: '', description: '', color: '#D4AF37' })
  }

  const saveEdit = (id: string) => {
    if (editProject.name.trim()) {
      const updatedProjects = projects.map((project) =>
        project.id === id
          ? {
              ...project,
              name: editProject.name.trim(),
              description: editProject.description.trim(),
              color: editProject.color,
            }
          : project
      )
      setProjects(updatedProjects)
      setEditingProjectId(null)
      setEditProject({ name: '', description: '', color: '#D4AF37' })
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FolderKanban className="w-8 h-8 text-luxury-gold" />
            <h1 className="text-3xl font-semibold text-luxury-dark-text">
              Projecten
            </h1>
          </div>
          <p className="text-luxury-dark-text-light">
            Beheer je projecten en koppel ze aan taken
          </p>
        </div>

        {/* Add new project */}
        <div className="bg-luxury-charcoal rounded-lg border border-luxury-dark-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-luxury-dark-text mb-4">
            Nieuw project toevoegen
          </h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Project naam"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              className="w-full px-4 py-3 bg-luxury-charcoal-lighter border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text placeholder:text-luxury-dark-text-light"
            />
            <input
              type="text"
              placeholder="Beschrijving (optioneel)"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              className="w-full px-4 py-3 bg-luxury-charcoal-lighter border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text placeholder:text-luxury-dark-text-light"
            />
            <div>
              <label className="block text-sm font-medium text-luxury-dark-text mb-2">
                Kleur
              </label>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-3">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setNewProject({ ...newProject, color: color.value })}
                    className={`w-full h-12 rounded-lg border-2 transition-all ${
                      newProject.color === color.value
                        ? 'border-luxury-gold scale-110'
                        : 'border-luxury-dark-border hover:border-luxury-gold/50'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-luxury-dark-text whitespace-nowrap">
                  Custom kleur:
                </label>
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="color"
                    value={newProject.color}
                    onChange={(e) => setNewProject({ ...newProject, color: e.target.value })}
                    className="w-16 h-12 rounded-lg border-2 border-luxury-dark-border cursor-pointer bg-transparent"
                    title="Selecteer een custom kleur"
                  />
                  <input
                    type="text"
                    value={newProject.color}
                    onChange={(e) => {
                      const colorValue = e.target.value
                      if (/^#[0-9A-Fa-f]{6}$/.test(colorValue)) {
                        setNewProject({ ...newProject, color: colorValue })
                      }
                    }}
                    placeholder="#D4AF37"
                    className="flex-1 px-3 py-2 bg-luxury-charcoal-lighter border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text font-mono text-sm"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={addProject}
              className="w-full px-6 py-3 bg-luxury-gold text-luxury-charcoal font-semibold rounded-lg hover:bg-luxury-gold-dark transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Project Toevoegen
            </button>
          </div>
        </div>

        {/* Projects list */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-luxury-dark-text mb-4">
            Alle projecten ({projects.length})
          </h2>

          {projects.length === 0 ? (
            <div className="bg-luxury-charcoal rounded-lg border border-luxury-dark-border p-8 text-center">
              <FolderKanban className="w-12 h-12 text-luxury-dark-text-light mx-auto mb-4 opacity-50" />
              <p className="text-luxury-dark-text-light">Nog geen projecten</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-luxury-charcoal rounded-lg border border-luxury-dark-border p-5 hover:border-luxury-gold/50 transition-all relative group"
                >
                  {editingProjectId === project.id ? (
                    // Edit mode
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editProject.name}
                        onChange={(e) => setEditProject({ ...editProject, name: e.target.value })}
                        className="w-full px-3 py-2 bg-luxury-charcoal-lighter border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text"
                        placeholder="Project naam"
                        autoFocus
                      />
                      <input
                        type="text"
                        value={editProject.description}
                        onChange={(e) => setEditProject({ ...editProject, description: e.target.value })}
                        className="w-full px-3 py-2 bg-luxury-charcoal-lighter border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text"
                        placeholder="Beschrijving"
                      />
                      <div>
                        <label className="block text-xs font-medium text-luxury-dark-text mb-2">
                          Kleur
                        </label>
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          {colorOptions.map((color) => (
                            <button
                              key={color.value}
                              onClick={() => setEditProject({ ...editProject, color: color.value })}
                              className={`w-full h-8 rounded border-2 transition-all ${
                                editProject.color === color.value
                                  ? 'border-luxury-gold scale-110'
                                  : 'border-luxury-dark-border hover:border-luxury-gold/50'
                              }`}
                              style={{ backgroundColor: color.value }}
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="text-xs font-medium text-luxury-dark-text whitespace-nowrap">
                            Custom:
                          </label>
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="color"
                              value={editProject.color}
                              onChange={(e) => setEditProject({ ...editProject, color: e.target.value })}
                              className="w-12 h-8 rounded border-2 border-luxury-dark-border cursor-pointer bg-transparent"
                              title="Selecteer een custom kleur"
                            />
                            <input
                              type="text"
                              value={editProject.color}
                              onChange={(e) => {
                                const colorValue = e.target.value
                                if (/^#[0-9A-Fa-f]{6}$/.test(colorValue)) {
                                  setEditProject({ ...editProject, color: colorValue })
                                }
                              }}
                              placeholder="#D4AF37"
                              className="flex-1 px-2 py-1.5 bg-luxury-charcoal-lighter border border-luxury-dark-border rounded focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text font-mono text-xs"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={cancelEditing}
                          className="px-3 py-1.5 text-sm text-luxury-dark-text-light hover:text-red-400 transition-colors"
                        >
                          Annuleren
                        </button>
                        <button
                          onClick={() => saveEdit(project.id)}
                          className="px-3 py-1.5 text-sm bg-luxury-gold text-luxury-charcoal font-medium rounded hover:bg-luxury-gold-dark transition-colors"
                        >
                          Opslaan
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <>
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className="w-4 h-4 rounded flex-shrink-0 mt-1"
                          style={{ backgroundColor: project.color }}
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-luxury-dark-text mb-1">
                            {project.name}
                          </h3>
                          {project.description && (
                            <p className="text-sm text-luxury-dark-text-light">
                              {project.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-luxury-dark-border">
                        <span className="text-xs text-luxury-dark-text-light">
                          {new Date(project.createdAt).toLocaleDateString('nl-NL', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEditing(project)}
                            className="text-luxury-dark-text-light hover:text-luxury-gold transition-colors p-1.5"
                            title="Bewerken"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteProject(project.id)}
                            className="text-luxury-dark-text-light hover:text-red-400 transition-colors p-1.5"
                            title="Verwijderen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

