'use client'

import { useState, useEffect } from 'react'
import { Calendar, Dumbbell, Wallet, Clock, TrendingUp, TrendingDown, CheckCircle2, ArrowRight, User, Fingerprint, Lock, Droplet, Plus, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  time: string
  endTime?: string
}

interface PersonalTask {
  id: string
  title: string
  description: string
  completed: boolean
  time: string
  endTime?: string
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

interface Transaction {
  id: string
  type: 'income' | 'expense'
  description: string
  amount: number
  date: string
  category: string
}

interface WaterIntake {
  date: string
  amount: number // in liters
}

const STORAGE_KEYS = {
  werk: 'dagboek-werk-tasks',
  persoonlijk: 'dagboek-persoonlijk-tasks',
  workouts: 'dagboek-fitness-workouts',
  transactions: 'dagboek-financieel-transactions',
  waterIntake: 'dagboek-water-intake',
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [personalTasks, setPersonalTasks] = useState<PersonalTask[]>([])
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedView, setSelectedView] = useState<'day' | 'week'>('day')
  const [displayTime, setDisplayTime] = useState('')
  const [displayDate, setDisplayDate] = useState('')
  const [currentTimeForCalendar, setCurrentTimeForCalendar] = useState('')
  const [financialsUnlocked, setFinancialsUnlocked] = useState(false)
  const [unlockTimeout, setUnlockTimeout] = useState<NodeJS.Timeout | null>(null)
  const [waterIntake, setWaterIntake] = useState<WaterIntake[]>([])
  const [todayWaterIntake, setTodayWaterIntake] = useState(0)

  // Load all data from localStorage
  useEffect(() => {
    // Load tasks
    const storedTasks = localStorage.getItem(STORAGE_KEYS.werk)
    if (storedTasks) {
      try {
        const parsedTasks = JSON.parse(storedTasks)
        console.log('[DEBUG] Loaded tasks from localStorage:', parsedTasks.map((t: Task) => ({ id: t.id, title: t.title, time: t.time, completed: t.completed })))
        setTasks(parsedTasks)
      } catch (error) {
        console.error('Error loading tasks:', error)
      }
    } else {
      console.log('[DEBUG] No tasks found in localStorage')
    }

    // Load personal tasks
    const storedPersonalTasks = localStorage.getItem(STORAGE_KEYS.persoonlijk)
    if (storedPersonalTasks) {
      try {
        setPersonalTasks(JSON.parse(storedPersonalTasks))
      } catch (error) {
        console.error('Error loading personal tasks:', error)
      }
    }

    // Load workouts
    const storedWorkouts = localStorage.getItem(STORAGE_KEYS.workouts)
    if (storedWorkouts) {
      try {
        setWorkouts(JSON.parse(storedWorkouts))
      } catch (error) {
        console.error('Error loading workouts:', error)
      }
    }

    // Load transactions
    const storedTransactions = localStorage.getItem(STORAGE_KEYS.transactions)
    if (storedTransactions) {
      try {
        const parsedTransactions = JSON.parse(storedTransactions)
        // Migration: Update old salary amount to new amount
        const updatedTransactions = parsedTransactions.map((transaction: Transaction) => {
          if (transaction.id === '1' && transaction.description === 'Salaris' && transaction.amount === 3500) {
            return { ...transaction, amount: 68150.50 }
          }
          return transaction
        })
        setTransactions(updatedTransactions)
        // Save updated transactions back to localStorage
        localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(updatedTransactions))
      } catch (error) {
        console.error('Error loading transactions:', error)
      }
    }

    // Don't load financials lock state - always start locked

    // Load water intake
    const storedWaterIntake = localStorage.getItem(STORAGE_KEYS.waterIntake)
    if (storedWaterIntake) {
      try {
        const parsedWaterIntake = JSON.parse(storedWaterIntake)
        setWaterIntake(parsedWaterIntake)
        // Calculate today's water intake
        const today = new Date().toISOString().split('T')[0]
        const todayEntry = parsedWaterIntake.find((entry: WaterIntake) => entry.date === today)
        setTodayWaterIntake(todayEntry ? todayEntry.amount : 0)
      } catch (error) {
        console.error('Error loading water intake:', error)
      }
    }
  }, [])

  // Update current time every second (Bucharest timezone)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const bucharestTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Bucharest' }))
      
      // Format time with seconds
      const timeString = bucharestTime.toLocaleTimeString('nl-NL', {
        timeZone: 'Europe/Bucharest',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      
      // Format date
      const dateString = bucharestTime.toLocaleDateString('nl-NL', {
        timeZone: 'Europe/Bucharest',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
      
      setDisplayTime(timeString)
      setDisplayDate(dateString)
    }

    updateTime() // Initial update
    const interval = setInterval(updateTime, 1000) // Update every second

    return () => clearInterval(interval)
  }, [])

  // Get today's date and week dates (Bucharest timezone)
  const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Bucharest' }))
  const todayStr = today.toISOString().split('T')[0]
  
  const getWeekDates = () => {
    const dates = []
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Start on Sunday
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
  }

  const weekDates = getWeekDates()

  // Filter tasks and workouts for today or week
  const getTodayTasks = () => {
    const sorted = tasks.sort((a, b) => {
      // Sort completed tasks to the end
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }
      const timeA = a.time.split(':').map(Number)
      const timeB = b.time.split(':').map(Number)
      return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1])
    })
    console.log('[DEBUG] getTodayTasks():', sorted.map(t => ({ id: t.id, title: t.title, time: t.time, completed: t.completed })))
    return sorted
  }

  const getTodayPersonalTasks = () => {
    return personalTasks.sort((a, b) => {
      // Sort completed tasks to the end
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }
      const timeA = a.time.split(':').map(Number)
      const timeB = b.time.split(':').map(Number)
      return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1])
    })
  }

  const getTodayWorkouts = () => {
    return workouts.filter(workout => workout.date === todayStr).sort((a, b) => {
      // Sort completed workouts to the end
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }
      return 0
    })
  }

  const getWeekTasks = () => {
    return tasks.sort((a, b) => {
      // Sort completed tasks to the end
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }
      return 0
    })
  }

  const getWeekWorkouts = () => {
    return workouts.filter(workout => weekDates.includes(workout.date)).sort((a, b) => {
      // Sort completed workouts to the end
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }
      return 0
    })
  }

  // Financial calculations
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses

  const todayIncome = transactions
    .filter(t => t.type === 'income' && t.date === todayStr)
    .reduce((sum, t) => sum + t.amount, 0)

  const todayExpenses = transactions
    .filter(t => t.type === 'expense' && t.date === todayStr)
    .reduce((sum, t) => sum + t.amount, 0)

  const weekIncome = transactions
    .filter(t => t.type === 'income' && weekDates.includes(t.date))
    .reduce((sum, t) => sum + t.amount, 0)

  const weekExpenses = transactions
    .filter(t => t.type === 'expense' && weekDates.includes(t.date))
    .reduce((sum, t) => sum + t.amount, 0)

  const displayTasks = selectedView === 'day' ? getTodayTasks() : getWeekTasks()
  const displayWorkouts = selectedView === 'day' ? getTodayWorkouts() : getWeekWorkouts()
  const displayIncome = selectedView === 'day' ? todayIncome : weekIncome
  const displayExpenses = selectedView === 'day' ? todayExpenses : weekExpenses

  // Generate time slots from 05:00 to 18:00
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 5; hour <= 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  // Update current time every second (Bucharest timezone)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const bucharestTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Bucharest' }))
      
      // Format time with seconds for display
      const timeString = bucharestTime.toLocaleTimeString('nl-NL', {
        timeZone: 'Europe/Bucharest',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      
      // Format time without seconds for calendar comparison
      const timeStringNoSeconds = `${bucharestTime.getHours().toString().padStart(2, '0')}:${bucharestTime.getMinutes().toString().padStart(2, '0')}`
      
      // Format date
      const dateString = bucharestTime.toLocaleDateString('nl-NL', {
        timeZone: 'Europe/Bucharest',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
      
      setDisplayTime(timeString)
      setDisplayDate(dateString)
      setCurrentTimeForCalendar(timeStringNoSeconds)
    }

    updateTime() // Initial update
    const interval = setInterval(updateTime, 1000) // Update every second

    return () => clearInterval(interval)
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (unlockTimeout) {
        clearTimeout(unlockTimeout)
      }
    }
  }, [unlockTimeout])

  // Get current time for calendar (Bucharest timezone)
  const getCurrentTime = () => {
    return currentTimeForCalendar || (() => {
      const now = new Date()
      const bucharestTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Bucharest' }))
      return `${bucharestTime.getHours().toString().padStart(2, '0')}:${bucharestTime.getMinutes().toString().padStart(2, '0')}`
    })()
  }

  const currentTime = getCurrentTime()

  // Check if time slot is in the past
  const isTimePast = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    const [currentHours, currentMinutes] = currentTime.split(':').map(Number)
    const slotMinutes = hours * 60 + minutes
    const currentSlotMinutes = currentHours * 60 + currentMinutes
    return slotMinutes < currentSlotMinutes
  }

  // Helper function to get end time (defaults to +1 hour if not set)
  const getEndTime = (startTime: string, endTime?: string): string => {
    if (endTime) return endTime
    const [hours, minutes] = startTime.split(':').map(Number)
    const endHours = (hours + 1) % 24
    return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  // Helper function to check if a time slot overlaps with an item's time range
  const isTimeSlotInRange = (slotTime: string, startTime: string, endTime: string): boolean => {
    const [slotHour, slotMin] = slotTime.split(':').map(Number)
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)
    
    const slotMinutes = slotHour * 60 + slotMin
    const slotEndMinutes = slotMinutes + 60 // Time slot is 1 hour long
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    
    // Handle case where end time is next day (e.g., 23:00 - 01:00)
    if (endMinutes < startMinutes) {
      // Task spans midnight, check if slot overlaps
      return (slotMinutes < endMinutes) || (slotEndMinutes > startMinutes)
    }
    
    // Check if time slot overlaps with task time range
    // Slot overlaps if: slot starts before task ends AND slot ends after task starts
    return slotMinutes < endMinutes && slotEndMinutes > startMinutes
  }

  // Get items for a specific time slot
  const getItemsForTimeSlot = (timeSlot: string) => {
    const items: Array<{ type: 'task' | 'personal' | 'workout'; item: Task | PersonalTask | Workout }> = []

    // Get work tasks for this time slot (include completed tasks)
    const allTasks = getTodayTasks()
    console.log(`[DEBUG] TimeSlot ${timeSlot}: All tasks:`, allTasks.map(t => ({ id: t.id, title: t.title, time: t.time, completed: t.completed })))
    
    const tasksForSlot = allTasks.filter((task) => {
      const endTime = getEndTime(task.time, task.endTime)
      const inRange = isTimeSlotInRange(timeSlot, task.time, endTime)
      if (task.completed) {
        console.log(`[DEBUG] TimeSlot ${timeSlot}: Checking completed task "${task.title}" (${task.time} - ${endTime}): inRange=${inRange}`)
      }
      return inRange
    })
    
    console.log(`[DEBUG] TimeSlot ${timeSlot}: Tasks for slot:`, tasksForSlot.map(t => ({ id: t.id, title: t.title, completed: t.completed })))
    
    tasksForSlot.forEach((task) => {
      // Only add if not already in items (avoid duplicates)
      if (!items.some(item => item.type === 'task' && (item.item as Task).id === task.id)) {
        items.push({ type: 'task', item: task })
        if (task.completed) {
          console.log(`[DEBUG] TimeSlot ${timeSlot}: Added completed task "${task.title}" to items`)
        }
      }
    })

    // Get personal tasks for this time slot (include completed tasks)
    const personalTasksForSlot = getTodayPersonalTasks().filter((task) => {
      const endTime = getEndTime(task.time, task.endTime)
      return isTimeSlotInRange(timeSlot, task.time, endTime)
    })
    personalTasksForSlot.forEach((task) => {
      if (!items.some(item => item.type === 'personal' && (item.item as PersonalTask).id === task.id)) {
        items.push({ type: 'personal', item: task })
      }
    })

    // Get workouts for today at this time slot (include completed workouts)
    const workoutsForSlot = getTodayWorkouts().filter((workout) => {
      if (!workout.time) return false
      const endTime = getEndTime(workout.time, workout.endTime)
      return isTimeSlotInRange(timeSlot, workout.time, endTime)
    })
    workoutsForSlot.forEach((workout) => {
      if (!items.some(item => item.type === 'workout' && (item.item as Workout).id === workout.id)) {
        items.push({ type: 'workout', item: workout })
      }
    })

    if (items.length > 0) {
      const completedItems = items.filter(item => {
        if (item.type === 'task') return (item.item as Task).completed
        if (item.type === 'personal') return (item.item as PersonalTask).completed
        if (item.type === 'workout') return (item.item as Workout).completed
        return false
      })
      if (completedItems.length > 0) {
        console.log(`[DEBUG] TimeSlot ${timeSlot}: Returning ${items.length} items, ${completedItems.length} completed:`, completedItems.map(i => ({
          type: i.type,
          title: i.type === 'task' ? (i.item as Task).title : i.type === 'personal' ? (i.item as PersonalTask).title : (i.item as Workout).name
        })))
      }
    }
    return items
  }

  // Add water intake
  const addWaterIntake = (amount: number) => {
    const today = new Date().toISOString().split('T')[0]
    const updatedIntake = [...waterIntake]
    const todayIndex = updatedIntake.findIndex((entry) => entry.date === today)
    
    if (todayIndex >= 0) {
      updatedIntake[todayIndex].amount += amount
    } else {
      updatedIntake.push({ date: today, amount })
    }
    
    setWaterIntake(updatedIntake)
    setTodayWaterIntake(updatedIntake.find((entry) => entry.date === today)?.amount || 0)
    localStorage.setItem(STORAGE_KEYS.waterIntake, JSON.stringify(updatedIntake))
  }

  const waterGoal = 4 // liters per day
  const waterProgress = Math.min((todayWaterIntake / waterGoal) * 100, 100)

  // Helper function to calculate time difference in minutes
  const calculateTimeDifference = (startTime: string, endTime: string): number => {
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)
    
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    
    // Handle case where end time is next day
    if (endMinutes < startMinutes) {
      return (24 * 60 - startMinutes) + endMinutes
    }
    
    return endMinutes - startMinutes
  }

  // Calculate total planned time for today
  const calculateTotalWorkTime = () => {
    // Tasks only have time (HH:MM), no date, so all tasks are considered for today
    return tasks.reduce((total, task) => {
      const endTime = getEndTime(task.time, task.endTime)
      const minutes = calculateTimeDifference(task.time, endTime)
      return total + minutes
    }, 0)
  }

  const calculateTotalPersonalTime = () => {
    // Personal tasks only have time (HH:MM), no date, so all tasks are considered for today
    return personalTasks.reduce((total, task) => {
      const endTime = getEndTime(task.time, task.endTime)
      const minutes = calculateTimeDifference(task.time, endTime)
      return total + minutes
    }, 0)
  }

  const calculateTotalWorkoutTime = () => {
    // Workouts have a date field, so filter by today
    const todayWorkouts = workouts.filter(workout => workout.date === todayStr && workout.time)
    
    return todayWorkouts.reduce((total, workout) => {
      if (!workout.time) return total
      const endTime = getEndTime(workout.time, workout.endTime)
      const minutes = calculateTimeDifference(workout.time, endTime)
      return total + minutes
    }, 0)
  }

  // Format minutes to hours and minutes
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) {
      return `${mins}m`
    }
    if (mins === 0) {
      return `${hours}u`
    }
    return `${hours}u ${mins}m`
  }

  const totalWorkTime = calculateTotalWorkTime()
  const totalPersonalTime = calculateTotalPersonalTime()
  const totalWorkoutTime = calculateTotalWorkoutTime()

  // Daily motivation quotes
  const motivationQuotes = [
    "Discipline is choosing between what you want now and what you want most.",
    "The only way to do great work is to love what you do.",
    "Success is the sum of small efforts repeated day in and day out.",
    "The future depends on what you do today.",
    "Don't watch the clock; do what it does. Keep going.",
    "The way to get started is to quit talking and begin doing.",
    "Innovation distinguishes between a leader and a follower.",
    "Life is what happens to you while you're busy making other plans.",
    "The only limit to our realization of tomorrow will be our doubts of today.",
    "It does not matter how slowly you go as long as you do not stop.",
    "Quality is not an act, it is a habit.",
    "The secret of getting ahead is getting started.",
    "You don't have to be great to start, but you have to start to be great.",
    "The best time to plant a tree was 20 years ago. The second best time is now.",
    "Your limitation—it's only your imagination.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Success doesn't just find you. You have to go out and get it.",
    "The harder you work for something, the greater you'll feel when you achieve it.",
    "Dream bigger. Do bigger.",
    "Don't stop when you're tired. Stop when you're done.",
    "Wake up with determination. Go to bed with satisfaction.",
    "Do something today that your future self will thank you for.",
    "Little things make big things happen.",
    "Don't wait for opportunity. Create it.",
    "Great things never come from comfort zones.",
    "Dream it. Believe it. Build it.",
    "If you want to achieve greatness, stop asking for permission.",
    "The way to get started is to quit talking and begin doing.",
    "Innovation distinguishes between a leader and a follower.",
  ]

  // Get daily quote based on date (same quote for the same day)
  const getDailyQuote = () => {
    const today = new Date()
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
    return motivationQuotes[dayOfYear % motivationQuotes.length]
  }

  const dailyQuote = getDailyQuote()

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Daily Motivation Quote */}
        <div className="bg-gradient-to-r from-luxury-gold/20 to-luxury-gold/10 rounded-lg border border-luxury-gold/30 p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <Sparkles className="w-6 h-6 text-luxury-gold" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-medium text-luxury-dark-text italic">
                "{dailyQuote}"
              </p>
              <p className="text-sm text-luxury-dark-text-light mt-2">
                Dagelijkse motivatie
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-luxury-dark-text mb-2">
                Dashboard Overzicht
              </h1>
              <p className="text-luxury-dark-text-light">
                Gecombineerde planning van werk, fitness en financiën
              </p>
            </div>
            {/* Current Date & Time */}
            <div className="text-right">
              <div className="bg-luxury-charcoal rounded-lg border border-luxury-dark-border px-6 py-4 min-w-[280px]">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-luxury-gold flex-shrink-0" />
                  <p className="text-sm font-medium text-luxury-dark-text">
                    {displayDate || 'Laden...'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-luxury-gold flex-shrink-0" />
                  <p className="text-2xl font-mono font-semibold text-luxury-gold tabular-nums">
                    {displayTime || '--:--:--'}
                  </p>
                  <span className="text-xs text-luxury-dark-text-light ml-1">
                    EET
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setSelectedView('day')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedView === 'day'
                ? 'bg-luxury-gold text-luxury-charcoal'
                : 'bg-luxury-charcoal text-luxury-dark-text-light border border-luxury-dark-border hover:border-luxury-gold/50'
            }`}
          >
            Vandaag
          </button>
          <button
            onClick={() => setSelectedView('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedView === 'week'
                ? 'bg-luxury-gold text-luxury-charcoal'
                : 'bg-luxury-charcoal text-luxury-dark-text-light border border-luxury-dark-border hover:border-luxury-gold/50'
            }`}
          >
            Deze Week
          </button>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-luxury-charcoal rounded-lg border border-luxury-dark-border p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <p className="text-luxury-dark-text-light text-sm">
                {selectedView === 'day' ? 'Inkomen Vandaag' : 'Inkomen Deze Week'}
              </p>
            </div>
            {financialsUnlocked ? (
              <>
                <p className="text-2xl font-semibold text-green-500">
                  €{displayIncome.toFixed(2)}
                </p>
                <p className="text-xs text-luxury-dark-text-light mt-1">
                  Totaal: €{totalIncome.toFixed(2)}
                </p>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Lock className="w-6 h-6 text-luxury-dark-text-light" />
                <p className="text-2xl font-semibold text-luxury-dark-text-light">
                  ••••••
                </p>
              </div>
            )}
          </div>

          <div className="bg-luxury-charcoal rounded-lg border border-luxury-dark-border p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              <p className="text-luxury-dark-text-light text-sm">
                {selectedView === 'day' ? 'Uitgaven Vandaag' : 'Uitgaven Deze Week'}
              </p>
            </div>
            {financialsUnlocked ? (
              <>
                <p className="text-2xl font-semibold text-red-500">
                  €{displayExpenses.toFixed(2)}
                </p>
                <p className="text-xs text-luxury-dark-text-light mt-1">
                  Totaal: €{totalExpenses.toFixed(2)}
                </p>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Lock className="w-6 h-6 text-luxury-dark-text-light" />
                <p className="text-2xl font-semibold text-luxury-dark-text-light">
                  ••••••
                </p>
              </div>
            )}
          </div>

          <div className="bg-luxury-charcoal rounded-lg border border-luxury-dark-border p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-luxury-gold" />
                <p className="text-luxury-dark-text-light text-sm">Totaal Saldo</p>
              </div>
              {!financialsUnlocked && (
                <button
                  onClick={() => {
                    // Clear any existing timeout
                    if (unlockTimeout) {
                      clearTimeout(unlockTimeout)
                    }
                    // Unlock financials
                    setFinancialsUnlocked(true)
                    // Auto-lock after 30 seconds
                    const timeout = setTimeout(() => {
                      setFinancialsUnlocked(false)
                      setUnlockTimeout(null)
                    }, 30000)
                    setUnlockTimeout(timeout)
                  }}
                  className="p-2 text-luxury-gold hover:text-luxury-gold-light hover:bg-luxury-charcoal-lighter rounded-lg transition-all"
                  title="Ontgrendel met Face ID"
                >
                  <Fingerprint className="w-5 h-5" />
                </button>
              )}
            </div>
            {financialsUnlocked ? (
              <>
                <p
                  className={`text-2xl font-semibold ${
                    balance >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  €{balance.toFixed(2)}
                </p>
                <p className="text-xs text-luxury-dark-text-light mt-1">
                  {selectedView === 'day' 
                    ? `Vandaag: €${(todayIncome - todayExpenses).toFixed(2)}`
                    : `Deze week: €${(weekIncome - weekExpenses).toFixed(2)}`
                  }
                </p>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Lock className="w-6 h-6 text-luxury-dark-text-light" />
                <p className="text-2xl font-semibold text-luxury-dark-text-light">
                  ••••••
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Water Intake Tracker */}
        <div className="bg-luxury-charcoal rounded-lg border border-luxury-dark-border p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Droplet className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-luxury-dark-text">
              Waterinname Vandaag
            </h2>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-luxury-dark-text-light">
                {todayWaterIntake.toFixed(1)}L / {waterGoal}L
              </span>
              <span className={`text-sm font-semibold ${
                waterProgress >= 100 ? 'text-green-400' : 
                waterProgress >= 75 ? 'text-blue-400' : 
                'text-luxury-dark-text-light'
              }`}>
                {waterProgress.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-luxury-charcoal-lighter rounded-full h-4 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  waterProgress >= 100 ? 'bg-green-400' : 
                  waterProgress >= 75 ? 'bg-blue-500' : 
                  'bg-blue-400'
                }`}
                style={{ width: `${waterProgress}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => addWaterIntake(0.5)}
              className="flex-1 min-w-[120px] px-4 py-2 bg-blue-500/20 border border-blue-500/40 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              +0.5L
            </button>
            <button
              onClick={() => addWaterIntake(1)}
              className="flex-1 min-w-[120px] px-4 py-2 bg-blue-500/20 border border-blue-500/40 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              +1L
            </button>
            <button
              onClick={() => addWaterIntake(1.5)}
              className="flex-1 min-w-[120px] px-4 py-2 bg-blue-500/20 border border-blue-500/40 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              +1.5L
            </button>
            <button
              onClick={() => addWaterIntake(2)}
              className="flex-1 min-w-[120px] px-4 py-2 bg-blue-500/20 border border-blue-500/40 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              +2L
            </button>
          </div>
        </div>

        {/* Total Planned Time Card */}
        <div className="bg-luxury-charcoal rounded-lg border border-luxury-dark-border p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-luxury-gold" />
            <h2 className="text-lg font-semibold text-luxury-dark-text">
              Totaal Ingeplande Tijd Vandaag
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-luxury-charcoal-lighter rounded-lg border border-luxury-dark-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-luxury-gold" />
                <p className="text-sm text-luxury-dark-text-light">Werk</p>
              </div>
              <p className="text-2xl font-semibold text-luxury-gold">
                {formatTime(totalWorkTime)}
              </p>
            </div>

            <div className="bg-luxury-charcoal-lighter rounded-lg border border-luxury-dark-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Dumbbell className="w-4 h-4 text-green-400" />
                <p className="text-sm text-luxury-dark-text-light">Sport</p>
              </div>
              <p className="text-2xl font-semibold text-green-400">
                {formatTime(totalWorkoutTime)}
              </p>
            </div>

            <div className="bg-luxury-charcoal-lighter rounded-lg border border-luxury-dark-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-blue-400" />
                <p className="text-sm text-luxury-dark-text-light">Privé</p>
              </div>
              <p className="text-2xl font-semibold text-blue-400">
                {formatTime(totalPersonalTime)}
              </p>
            </div>
          </div>
        </div>

        {/* Day Calendar and Planning Cards - Only show when "day" view is selected */}
        {selectedView === 'day' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Day Calendar - Left column */}
            <div className="bg-luxury-charcoal rounded-lg border border-luxury-dark-border p-6">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5 text-luxury-gold" />
                <h2 className="text-lg font-semibold text-luxury-dark-text">
                  Dag Kalender - {new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h2>
              </div>
              
              <div className="space-y-1 max-h-[600px] overflow-y-auto">
                {timeSlots.map((timeSlot) => {
                  const isPast = isTimePast(timeSlot)
                  const items = getItemsForTimeSlot(timeSlot)
                  
                  return (
                    <div
                      key={timeSlot}
                      className={`flex border-l-2 ${
                        isPast
                          ? 'border-luxury-dark-border bg-luxury-charcoal-lighter/30 opacity-60'
                          : 'border-luxury-gold/50 bg-luxury-charcoal-lighter'
                      } rounded-r-lg transition-all`}
                    >
                      {/* Time label */}
                      <div className={`w-20 px-3 py-3 flex-shrink-0 ${
                        isPast ? 'text-luxury-dark-text-light' : 'text-luxury-gold font-medium'
                      }`}>
                        {timeSlot}
                      </div>
                      
                      {/* Content area */}
                      <div className="flex-1 py-3 pr-3">
                        {items.length === 0 ? (
                          <div className="text-luxury-dark-text-light text-sm">
                            {isPast ? 'Verlopen' : 'Vrij'}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {items.map((item, idx) => {
                              if (item.type === 'task') {
                                const task = item.item as Task
                                return (
                                  <div
                                    key={`task-${task.id}-${idx}`}
                                    className={`rounded px-3 py-2 ${
                                      task.completed 
                                        ? 'bg-gray-500/20 border border-gray-500/30' 
                                        : 'bg-luxury-gold/20 border border-luxury-gold/40'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Calendar className={`w-4 h-4 flex-shrink-0 ${
                                        task.completed ? 'text-gray-400' : 'text-luxury-gold'
                                      }`} />
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium truncate ${
                                          task.completed 
                                            ? 'line-through text-gray-400' 
                                            : 'text-luxury-dark-text'
                                        }`}>
                                          {task.title}
                                        </p>
                                        {task.description && (
                                          <p className={`text-xs truncate ${
                                            task.completed 
                                              ? 'line-through text-gray-500' 
                                              : 'text-luxury-dark-text-light'
                                          }`}>
                                            {task.description}
                                          </p>
                                        )}
                                      </div>
                                      <span className={`text-xs font-medium whitespace-nowrap ${
                                        task.completed ? 'text-gray-400' : 'text-luxury-gold'
                                      }`}>
                                        {task.time} - {getEndTime(task.time, task.endTime)}
                                      </span>
                                    </div>
                                  </div>
                                )
                              } else if (item.type === 'personal') {
                                const personalTask = item.item as PersonalTask
                                return (
                                  <div
                                    key={`personal-${personalTask.id}-${idx}`}
                                    className={`rounded px-3 py-2 ${
                                      personalTask.completed 
                                        ? 'bg-gray-500/20 border border-gray-500/30' 
                                        : 'bg-blue-500/20 border border-blue-500/40'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <User className={`w-4 h-4 flex-shrink-0 ${
                                        personalTask.completed ? 'text-gray-400' : 'text-blue-400'
                                      }`} />
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium truncate ${
                                          personalTask.completed 
                                            ? 'line-through text-gray-400' 
                                            : 'text-luxury-dark-text'
                                        }`}>
                                          {personalTask.title}
                                        </p>
                                        {personalTask.description && (
                                          <p className={`text-xs truncate ${
                                            personalTask.completed 
                                              ? 'line-through text-gray-500' 
                                              : 'text-luxury-dark-text-light'
                                          }`}>
                                            {personalTask.description}
                                          </p>
                                        )}
                                      </div>
                                      <span className={`text-xs font-medium whitespace-nowrap ${
                                        personalTask.completed ? 'text-gray-400' : 'text-blue-400'
                                      }`}>
                                        {personalTask.time} - {getEndTime(personalTask.time, personalTask.endTime)}
                                      </span>
                                    </div>
                                  </div>
                                )
                              } else {
                                const workout = item.item as Workout
                                return (
                                  <div
                                    key={`workout-${workout.id}-${idx}`}
                                    className={`rounded px-3 py-2 ${
                                      workout.completed 
                                        ? 'bg-gray-500/20 border border-gray-500/30' 
                                        : 'bg-green-500/20 border border-green-500/40'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Dumbbell className={`w-4 h-4 flex-shrink-0 ${
                                        workout.completed ? 'text-gray-400' : 'text-green-400'
                                      }`} />
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium truncate ${
                                          workout.completed 
                                            ? 'line-through text-gray-400' 
                                            : 'text-luxury-dark-text'
                                        }`}>
                                          {workout.name}
                                        </p>
                                        {workout.exercises.length > 0 && (
                                          <p className={`text-xs truncate ${
                                            workout.completed 
                                              ? 'line-through text-gray-500' 
                                              : 'text-luxury-dark-text-light'
                                          }`}>
                                            {workout.exercises.slice(0, 2).join(', ')}
                                            {workout.exercises.length > 2 && ` +${workout.exercises.length - 2}`}
                                          </p>
                                        )}
                                      </div>
                                      {workout.time && (
                                        <span className={`text-xs font-medium whitespace-nowrap ${
                                          workout.completed ? 'text-gray-400' : 'text-green-400'
                                        }`}>
                                          {workout.time} - {getEndTime(workout.time, workout.endTime)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )
                              }
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            {/* Right column - Planning Cards */}
            <div className="space-y-6">
              {/* Work Tasks */}
              <div className="bg-luxury-charcoal rounded-lg border border-luxury-dark-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-luxury-gold" />
                    <h2 className="text-lg font-semibold text-luxury-dark-text">
                      Werk Planning
                    </h2>
                  </div>
                  <Link
                    href="/dashboard/werk"
                    className="text-luxury-gold hover:text-luxury-gold-light text-sm flex items-center gap-1 transition-colors"
                  >
                    Bekijk alles
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {displayTasks.length === 0 ? (
                  <p className="text-luxury-dark-text-light text-sm text-center py-4">
                    Geen {selectedView === 'day' ? 'taken voor vandaag' : 'taken deze week'}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {displayTasks.slice(0, 5).map((task) => (
                      <div
                        key={task.id}
                        className={`p-3 bg-luxury-charcoal-lighter rounded-lg border border-luxury-dark-border flex items-start gap-3 ${
                          task.completed ? 'opacity-60' : ''
                        }`}
                      >
                        <Clock className="w-4 h-4 text-luxury-gold mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className={`font-medium text-luxury-dark-text text-sm ${
                              task.completed ? 'line-through' : ''
                            }`}>
                              {task.title}
                            </h3>
                            <span className="text-xs text-luxury-gold font-medium whitespace-nowrap">
                              {task.time} - {getEndTime(task.time, task.endTime)}
                            </span>
                          </div>
                          {task.description && (
                            <p className={`text-xs text-luxury-dark-text-light truncate ${
                              task.completed ? 'line-through' : ''
                            }`}>
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {displayTasks.length > 5 && (
                      <p className="text-xs text-luxury-dark-text-light text-center pt-2">
                        +{displayTasks.length - 5} meer taken
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Fitness Workouts */}
              <div className="bg-luxury-charcoal rounded-lg border border-luxury-dark-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-luxury-gold" />
                    <h2 className="text-lg font-semibold text-luxury-dark-text">
                      Fitness Planning
                    </h2>
                  </div>
                  <Link
                    href="/dashboard/fitness"
                    className="text-luxury-gold hover:text-luxury-gold-light text-sm flex items-center gap-1 transition-colors"
                  >
                    Bekijk alles
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {displayWorkouts.length === 0 ? (
                  <p className="text-luxury-dark-text-light text-sm text-center py-4">
                    Geen {selectedView === 'day' ? 'trainingen voor vandaag' : 'trainingen deze week'}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {displayWorkouts.slice(0, 5).map((workout) => (
                      <div
                        key={workout.id}
                        className={`p-3 bg-luxury-charcoal-lighter rounded-lg border border-luxury-dark-border ${
                          workout.completed ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`font-medium text-luxury-dark-text text-sm ${
                            workout.completed ? 'line-through' : ''
                          }`}>
                            {workout.name}
                          </h3>
                          <div className="flex flex-col items-end gap-1">
                            {workout.time && (
                              <span className="text-xs text-green-400 font-medium whitespace-nowrap">
                                {workout.time} - {getEndTime(workout.time, workout.endTime)}
                              </span>
                            )}
                            <span className="text-xs text-luxury-dark-text-light">
                              {new Date(workout.date).toLocaleDateString('nl-NL', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>
                          </div>
                        </div>
                        {workout.exercises.length > 0 && (
                          <p className={`text-xs text-luxury-dark-text-light ${
                            workout.completed ? 'line-through' : ''
                          }`}>
                            {workout.exercises.slice(0, 2).join(', ')}
                            {workout.exercises.length > 2 && ` +${workout.exercises.length - 2}`}
                          </p>
                        )}
                      </div>
                    ))}
                    {displayWorkouts.length > 5 && (
                      <p className="text-xs text-luxury-dark-text-light text-center pt-2">
                        +{displayWorkouts.length - 5} meer trainingen
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/dashboard/werk"
            className="bg-luxury-charcoal rounded-lg border border-luxury-dark-border p-6 hover:border-luxury-gold/50 transition-all group"
          >
            <div className="mb-4 text-luxury-gold group-hover:scale-110 transition-transform">
              <Calendar className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-semibold text-luxury-dark-text mb-2">
              Werk Planning
            </h2>
            <p className="text-luxury-dark-text-light text-sm">
              Beheer je dagelijkse werkzaamheden
            </p>
          </Link>

          <Link
            href="/dashboard/fitness"
            className="bg-luxury-charcoal rounded-lg border border-luxury-dark-border p-6 hover:border-luxury-gold/50 transition-all group"
          >
            <div className="mb-4 text-luxury-gold group-hover:scale-110 transition-transform">
              <Dumbbell className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-semibold text-luxury-dark-text mb-2">
              Fitness
            </h2>
            <p className="text-luxury-dark-text-light text-sm">
              Track gewicht en plan trainingen
            </p>
          </Link>

          <Link
            href="/dashboard/financieel"
            className="bg-luxury-charcoal rounded-lg border border-luxury-dark-border p-6 hover:border-luxury-gold/50 transition-all group"
          >
            <div className="mb-4 text-luxury-gold group-hover:scale-110 transition-transform">
              <Wallet className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-semibold text-luxury-dark-text mb-2">
              Financieel
            </h2>
            <p className="text-luxury-dark-text-light text-sm">
              Beheer inkomsten en uitgaven
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
