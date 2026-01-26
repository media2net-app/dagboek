'use client'

import { useState, useEffect } from 'react'
import { Scale, Calendar, Plus, CheckCircle2, Clock, Edit2, Trash2, X, Check } from 'lucide-react'

interface WeightEntry {
  id: string
  date: string
  weight: number
}

interface Workout {
  id: string
  name: string
  date: string
  time?: string
  endTime?: string
  exercises: string[]
  completed: boolean
}

export default function FitnessPage() {
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([])
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [newWeight, setNewWeight] = useState('')
  const [newWorkout, setNewWorkout] = useState({ name: '', date: '', time: '', endTime: '', exercises: '' })
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null)
  const [editWorkout, setEditWorkout] = useState({ name: '', date: '', time: '', endTime: '', exercises: '' })
  const [loading, setLoading] = useState(true)

  // Load data from API
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      // Load weights
      const weightsResponse = await fetch('/api/weights')
      if (weightsResponse.ok) {
        const weightsData = await weightsResponse.json()
        setWeightEntries(weightsData)
      }

      // Load workouts
      const workoutsResponse = await fetch('/api/workouts')
      if (workoutsResponse.ok) {
        const workoutsData = await workoutsResponse.json()
        setWorkouts(workoutsData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addWeightEntry = async () => {
    if (newWeight) {
      try {
        const response = await fetch('/api/weights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: new Date().toISOString().split('T')[0],
            weight: parseFloat(newWeight),
          }),
        })

        if (response.ok) {
          const newEntry = await response.json()
          setWeightEntries([newEntry, ...weightEntries])
          setNewWeight('')
        }
      } catch (error) {
        console.error('Error adding weight entry:', error)
      }
    }
  }

  const deleteWeightEntry = async (id: string) => {
    if (confirm('Weet je zeker dat je deze gewichtsregistratie wilt verwijderen?')) {
      try {
        const response = await fetch(`/api/weights?id=${id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          setWeightEntries(weightEntries.filter((entry) => entry.id !== id))
        }
      } catch (error) {
        console.error('Error deleting weight entry:', error)
      }
    }
  }

  const addWorkout = async () => {
    if (newWorkout.name.trim()) {
      try {
        const response = await fetch('/api/workouts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newWorkout.name,
            date: newWorkout.date || new Date().toISOString().split('T')[0],
            time: newWorkout.time || '17:00',
            endTime: newWorkout.endTime || null,
            exercises: newWorkout.exercises
              .split(',')
              .map((e) => e.trim())
              .filter((e) => e),
            completed: false,
          }),
        })

        if (response.ok) {
          const newWorkoutItem = await response.json()
          setWorkouts([...workouts, newWorkoutItem])
          setNewWorkout({ name: '', date: '', time: '', endTime: '', exercises: '' })
        }
      } catch (error) {
        console.error('Error adding workout:', error)
      }
    }
  }

  const toggleWorkout = async (id: string) => {
    const workout = workouts.find(w => w.id === id)
    if (!workout) return

    try {
      const response = await fetch('/api/workouts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          completed: !workout.completed,
        }),
      })

      if (response.ok) {
        const updatedWorkout = await response.json()
        setWorkouts(workouts.map((w) => (w.id === id ? updatedWorkout : w)))
      }
    } catch (error) {
      console.error('Error updating workout:', error)
    }
  }

  const startEditing = (workout: Workout) => {
    setEditingWorkoutId(workout.id)
    setEditWorkout({
      name: workout.name,
      date: workout.date,
      time: workout.time || '',
      endTime: workout.endTime || '',
      exercises: workout.exercises.join(', '),
    })
  }

  const cancelEditing = () => {
    setEditingWorkoutId(null)
    setEditWorkout({ name: '', date: '', time: '', endTime: '', exercises: '' })
  }

  const saveEdit = async (id: string) => {
    try {
      const response = await fetch('/api/workouts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name: editWorkout.name,
          date: editWorkout.date,
          time: editWorkout.time || null,
          endTime: editWorkout.endTime || null,
          exercises: editWorkout.exercises
            .split(',')
            .map((e) => e.trim())
            .filter((e) => e),
        }),
      })

      if (response.ok) {
        const updatedWorkout = await response.json()
        setWorkouts(workouts.map((w) => (w.id === id ? updatedWorkout : w)))
        cancelEditing()
      }
    } catch (error) {
      console.error('Error updating workout:', error)
    }
  }

  const deleteWorkout = async (id: string) => {
    try {
      const response = await fetch(`/api/workouts?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setWorkouts(workouts.filter((workout) => workout.id !== id))
      }
    } catch (error) {
      console.error('Error deleting workout:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-luxury-dark-text-light">Laden...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-luxury-dark-text mb-2">
            Fitness Tracking
          </h1>
          <p className="text-luxury-dark-text-light">
            Registreer je gewicht en plan je trainingen
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weight Tracking */}
          <div className="space-y-6">
            <div className="bg-luxury-charcoal rounded-lg border border-luxury-dark-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Scale className="w-5 h-5 text-luxury-gold" />
                <h2 className="text-lg font-semibold text-luxury-dark-text">
                  Gewicht Registratie
                </h2>
              </div>

              {/* Add weight */}
              <div className="mb-6 flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  placeholder="Gewicht (kg)"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="flex-1 px-4 py-3 bg-luxury-charcoal-lighter border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text placeholder:text-luxury-dark-text-light"
                />
                <button
                  onClick={addWeightEntry}
                  className="px-6 py-3 bg-luxury-gold text-luxury-charcoal font-semibold rounded-lg hover:bg-luxury-gold-dark transition-all duration-200 flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Toevoegen
                </button>
              </div>

              {/* Weight history */}
              <div className="space-y-2">
                {weightEntries.length === 0 ? (
                  <p className="text-luxury-dark-text-light text-center py-4">
                    Geen gewicht geregistreerd
                  </p>
                ) : (
                  weightEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 bg-luxury-charcoal-lighter rounded-lg border border-luxury-dark-border group"
                    >
                      <span className="text-luxury-dark-text">
                        {new Date(entry.date).toLocaleDateString('nl-NL', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-luxury-gold font-semibold text-lg">
                          {entry.weight} kg
                        </span>
                        <button
                          onClick={() => deleteWeightEntry(entry.id)}
                          className="text-luxury-dark-text-light hover:text-red-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
                          title="Verwijderen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Workout Planning */}
          <div className="space-y-6">
            <div className="bg-luxury-charcoal rounded-lg border border-luxury-dark-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-luxury-gold" />
                <h2 className="text-lg font-semibold text-luxury-dark-text">
                  Training Planning
                </h2>
              </div>

              {/* Add workout */}
              <div className="mb-6 space-y-3">
                <input
                  type="text"
                  placeholder="Training naam"
                  value={newWorkout.name}
                  onChange={(e) =>
                    setNewWorkout({ ...newWorkout, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-luxury-charcoal-lighter border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text placeholder:text-luxury-dark-text-light"
                />
                <input
                  type="date"
                  value={newWorkout.date}
                  onChange={(e) =>
                    setNewWorkout({ ...newWorkout, date: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-luxury-charcoal-lighter border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <label className="block text-sm font-medium text-luxury-dark-text mb-2">
                      Begin tijd
                    </label>
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-luxury-dark-text-light mt-6" />
                    <input
                      type="time"
                      value={newWorkout.time}
                      onChange={(e) =>
                        setNewWorkout({ ...newWorkout, time: e.target.value })
                      }
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
                      value={newWorkout.endTime}
                      onChange={(e) =>
                        setNewWorkout({ ...newWorkout, endTime: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 bg-luxury-charcoal-lighter border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Oefeningen (gescheiden door komma's)"
                  value={newWorkout.exercises}
                  onChange={(e) =>
                    setNewWorkout({ ...newWorkout, exercises: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-luxury-charcoal-lighter border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text placeholder:text-luxury-dark-text-light"
                />
                <button
                  onClick={addWorkout}
                  className="w-full px-6 py-3 bg-luxury-gold text-luxury-charcoal font-semibold rounded-lg hover:bg-luxury-gold-dark transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Training Toevoegen
                </button>
              </div>

              {/* Workout list */}
              <div className="space-y-3">
                {workouts.length === 0 ? (
                  <p className="text-luxury-dark-text-light text-center py-4">
                    Geen trainingen gepland
                  </p>
                ) : (
                  workouts.map((workout) => (
                    <div
                      key={workout.id}
                      className={`p-4 bg-luxury-charcoal-lighter rounded-lg border ${
                        workout.completed
                          ? 'border-luxury-gold/50'
                          : 'border-luxury-dark-border'
                      } hover:border-luxury-gold/50 transition-all`}
                    >
                      {editingWorkoutId === workout.id ? (
                        // Edit mode
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-luxury-gold font-medium">Training bewerken</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => saveEdit(workout.id)}
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
                            value={editWorkout.name}
                            onChange={(e) => setEditWorkout({ ...editWorkout, name: e.target.value })}
                            className="w-full px-4 py-2 bg-luxury-charcoal border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text"
                            placeholder="Training naam"
                            autoFocus
                          />
                          <input
                            type="date"
                            value={editWorkout.date}
                            onChange={(e) => setEditWorkout({ ...editWorkout, date: e.target.value })}
                            className="w-full px-4 py-2 bg-luxury-charcoal border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text"
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                              <label className="block text-sm font-medium text-luxury-dark-text mb-2">
                                Begin tijd
                              </label>
                              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-luxury-dark-text-light mt-6" />
                              <input
                                type="time"
                                value={editWorkout.time}
                                onChange={(e) => setEditWorkout({ ...editWorkout, time: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 bg-luxury-charcoal border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text"
                              />
                            </div>
                            <div className="relative">
                              <label className="block text-sm font-medium text-luxury-dark-text mb-2">
                                Eind tijd (optioneel)
                              </label>
                              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-luxury-dark-text-light mt-6" />
                              <input
                                type="time"
                                value={editWorkout.endTime}
                                onChange={(e) => setEditWorkout({ ...editWorkout, endTime: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 bg-luxury-charcoal border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text"
                              />
                            </div>
                          </div>
                          <input
                            type="text"
                            value={editWorkout.exercises}
                            onChange={(e) => setEditWorkout({ ...editWorkout, exercises: e.target.value })}
                            className="w-full px-4 py-2 bg-luxury-charcoal border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text"
                            placeholder="Oefeningen (gescheiden door komma's)"
                          />
                        </div>
                      ) : (
                        // View mode
                        <>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3
                                className={`font-semibold text-luxury-dark-text ${
                                  workout.completed ? 'line-through opacity-60' : ''
                                }`}
                              >
                                {workout.name}
                              </h3>
                              <div className="flex items-center gap-3 text-sm text-luxury-dark-text-light mt-1">
                                <p className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(workout.date).toLocaleDateString('nl-NL', {
                                    day: 'numeric',
                                    month: 'long',
                                  })}
                                </p>
                                {workout.time && (
                                  <p className="flex items-center gap-1 text-luxury-gold">
                                    <Clock className="w-3 h-3" />
                                    {workout.time}
                                    {workout.endTime && ` - ${workout.endTime}`}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <input
                                type="checkbox"
                                checked={workout.completed}
                                onChange={() => toggleWorkout(workout.id)}
                                className="w-5 h-5 text-luxury-gold border-luxury-dark-border rounded focus:ring-luxury-gold focus:ring-2 bg-luxury-charcoal"
                              />
                              <button
                                onClick={() => startEditing(workout)}
                                className="text-luxury-dark-text-light hover:text-luxury-gold transition-colors p-2"
                                title="Bewerken"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteWorkout(workout.id)}
                                className="text-luxury-dark-text-light hover:text-red-400 transition-colors p-2"
                                title="Verwijderen"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {workout.exercises.length > 0 && (
                            <ul className="list-disc list-inside text-sm text-luxury-dark-text-light mt-2 ml-2">
                              {workout.exercises.map((exercise, idx) => (
                                <li key={idx}>{exercise}</li>
                              ))}
                            </ul>
                          )}
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
