'use client'

import { useState, useEffect } from 'react'
import { Trash2, Plus, Edit2, X, Check, StickyNote } from 'lucide-react'

interface Note {
  id: string
  content: string
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = 'dagboek-notities'

const defaultNotes: Note[] = [
  {
    id: '1',
    content: 'Bel terug naar klant over offerte',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    content: 'Koffie halen voor team meeting',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export default function NotitiesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState('')
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editNote, setEditNote] = useState('')
  const [loading, setLoading] = useState(true)

  // Load notes from API
  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/notes')
      if (response.ok) {
        const data = await response.json()
        setNotes(data)
      }
    } catch (error) {
      console.error('Error loading notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const addNote = async () => {
    if (newNote.trim()) {
      try {
        const response = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: newNote.trim(),
          }),
        })

        if (response.ok) {
          const newNoteItem = await response.json()
          setNotes([newNoteItem, ...notes])
          setNewNote('')
        }
      } catch (error) {
        console.error('Error adding note:', error)
      }
    }
  }

  const deleteNote = async (id: string) => {
    try {
      const response = await fetch(`/api/notes?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setNotes(notes.filter((note) => note.id !== id))
      }
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  const startEditing = (note: Note) => {
    setEditingNoteId(note.id)
    setEditNote(note.content)
  }

  const cancelEditing = () => {
    setEditingNoteId(null)
    setEditNote('')
  }

  const saveEdit = async (id: string) => {
    if (editNote.trim()) {
      try {
        const response = await fetch('/api/notes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            content: editNote.trim(),
          }),
        })

        if (response.ok) {
          const updatedNote = await response.json()
          const updatedNotes = notes.map((n) => (n.id === id ? updatedNote : n))
          // Sort by updatedAt (most recent first)
          const sortedNotes = updatedNotes.sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
          setNotes(sortedNotes)
          setEditingNoteId(null)
          setEditNote('')
        }
      } catch (error) {
        console.error('Error updating note:', error)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (editingNoteId) {
        saveEdit(editingNoteId)
      } else {
        addNote()
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
            <StickyNote className="w-8 h-8 text-luxury-gold" />
            <h1 className="text-3xl font-semibold text-luxury-dark-text">
              Notities
            </h1>
          </div>
          <p className="text-luxury-dark-text-light">
            Snel notities en taken toevoegen zonder planning
          </p>
        </div>

        {/* Add new note */}
        <div className="bg-luxury-charcoal rounded-lg border border-luxury-dark-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-luxury-dark-text mb-4">
            Nieuwe notitie toevoegen
          </h2>
          <div className="flex gap-3">
            <textarea
              placeholder="Typ je notitie hier..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={handleKeyPress}
              rows={3}
              className="flex-1 px-4 py-3 bg-luxury-charcoal-lighter border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text placeholder:text-luxury-dark-text-light resize-none"
            />
            <button
              onClick={addNote}
              className="px-6 py-3 bg-luxury-gold text-luxury-charcoal font-semibold rounded-lg hover:bg-luxury-gold-dark transition-all duration-200 flex items-center gap-2 h-fit"
            >
              <Plus className="w-5 h-5" />
              Toevoegen
            </button>
          </div>
          <p className="text-xs text-luxury-dark-text-light mt-2">
            Tip: Druk op Enter om toe te voegen (Shift+Enter voor nieuwe regel)
          </p>
        </div>

        {/* Notes list */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-luxury-dark-text mb-4">
            Alle notities ({notes.length})
          </h2>

          {notes.length === 0 ? (
            <div className="bg-luxury-charcoal rounded-lg border border-luxury-dark-border p-8 text-center">
              <StickyNote className="w-12 h-12 text-luxury-dark-text-light mx-auto mb-4 opacity-50" />
              <p className="text-luxury-dark-text-light">Nog geen notities</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-luxury-charcoal rounded-lg border border-luxury-dark-border p-5 hover:border-luxury-gold/50 transition-all relative group"
                >
                  {editingNoteId === note.id ? (
                    // Edit mode
                    <div className="space-y-3">
                      <textarea
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                        onKeyDown={handleKeyPress}
                        rows={4}
                        className="w-full px-3 py-2 bg-luxury-charcoal-lighter border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text resize-none"
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={cancelEditing}
                          className="px-3 py-1.5 text-sm text-luxury-dark-text-light hover:text-red-400 transition-colors"
                        >
                          Annuleren
                        </button>
                        <button
                          onClick={() => saveEdit(note.id)}
                          className="px-3 py-1.5 text-sm bg-luxury-gold text-luxury-charcoal font-medium rounded hover:bg-luxury-gold-dark transition-colors"
                        >
                          Opslaan
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <>
                      <p className="text-luxury-dark-text whitespace-pre-wrap break-words mb-3">
                        {note.content}
                      </p>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-luxury-dark-border">
                        <span className="text-xs text-luxury-dark-text-light">
                          {new Date(note.updatedAt).toLocaleDateString('nl-NL', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEditing(note)}
                            className="text-luxury-dark-text-light hover:text-luxury-gold transition-colors p-1.5"
                            title="Bewerken"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteNote(note.id)}
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

