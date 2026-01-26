'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Sparkles } from 'lucide-react'
import { HeroGeometric } from '@/components/ui/shape-landing-hero'
import { Button } from '@/components/ui/neon-button'

export default function LoginPage() {
  const [email, setEmail] = useState('demo@dagboek.nl')
  const [password, setPassword] = useState('demo123')
  const [isLoading, setIsLoading] = useState(false)
  const [displayTime, setDisplayTime] = useState('')
  const [displayDate, setDisplayDate] = useState('')
  const [dayOfYear, setDayOfYear] = useState('')
  const [showLogin, setShowLogin] = useState(false)
  const router = useRouter()

  // Daily motivation quotes (same as dashboard)
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
    const now = new Date()
    const bucharestTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Bucharest' }))
    const dayOfYear = Math.floor((bucharestTime.getTime() - new Date(bucharestTime.getFullYear(), 0, 0).getTime()) / 86400000)
    return motivationQuotes[dayOfYear % motivationQuotes.length]
  }

  // Get greeting based on time
  const getGreeting = () => {
    const now = new Date()
    const bucharestTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Bucharest' }))
    const hour = bucharestTime.getHours()
    
    if (hour >= 5 && hour < 12) {
      return 'Goedemorgen'
    } else if (hour >= 12 && hour < 18) {
      return 'Goedemiddag'
    } else {
      return 'Goedenavond'
    }
  }

  const dailyQuote = getDailyQuote()

  // Calculate day of year
  const getDayOfYear = (date: Date) => {
    const start = new Date(date.getFullYear(), 0, 0)
    const diff = date.getTime() - start.getTime()
    const oneDay = 1000 * 60 * 60 * 24
    return Math.floor(diff / oneDay)
  }

  // Calculate total days in year (accounting for leap years)
  const getDaysInYear = (year: number) => {
    return ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) ? 366 : 365
  }

  // Update time and date
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const bucharestTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Bucharest' }))
      
      const timeString = bucharestTime.toLocaleTimeString('nl-NL', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Europe/Bucharest',
      })
      
      const dateString = bucharestTime.toLocaleDateString('nl-NL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Europe/Bucharest',
      })
      
      // Calculate day of year
      const day = getDayOfYear(bucharestTime)
      const totalDays = getDaysInYear(bucharestTime.getFullYear())
      const dayOfYearString = `${day}/${totalDays}`
      
      setDisplayTime(timeString)
      setDisplayDate(dateString)
      setDayOfYear(dayOfYearString)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate login - replace with actual authentication
    setTimeout(() => {
      setIsLoading(false)
      router.push('/dashboard')
    }, 1000)
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* HeroGeometric Background */}
      <div className="absolute inset-0 z-0">
        <HeroGeometric 
          badge="High performance dashboard"
          title1={getGreeting()}
          title2="Chiel"
        />
      </div>

      {/* Main content - always visible, positioned below the HeroGeometric text */}
      <div className="relative z-20 flex items-end justify-center min-h-screen w-full px-6 pb-32 md:pb-40">
        <div className="w-full max-w-md">
          {!showLogin ? (
            /* Welcome screen - all in one card */
            <div className="bg-black/40 backdrop-blur-xl rounded-lg shadow-2xl border border-white/10 p-8 space-y-6 text-center">
              {/* Time and date section */}
              <div className="space-y-2 pb-4 border-b border-white/10">
                <div className="flex items-center justify-center gap-2 text-luxury-gold">
                  <Clock className="w-4 h-4" />
                  <span className="text-lg font-mono font-semibold text-white">{displayTime}</span>
                </div>
                <p className="text-xs text-white/60 capitalize">
                  {displayDate}
                </p>
                <p className="text-xs text-luxury-gold font-medium">
                  Dag {dayOfYear} van het jaar
                </p>
              </div>

              {/* Daily Motivation Quote */}
              <div className="bg-gradient-to-r from-luxury-gold/20 to-luxury-gold/10 rounded-lg border border-luxury-gold/30 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <Sparkles className="w-5 h-5 text-luxury-gold" />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-medium text-white/90 italic">
                      "{dailyQuote}"
                    </p>
                    <p className="text-xs text-white/60 mt-1">
                      Dagelijkse motivatie
                    </p>
                  </div>
                </div>
              </div>

              {/* Start dag button */}
              <div className="pt-2">
                <Button
                  onClick={() => setShowLogin(true)}
                  variant="solid"
                  size="lg"
                  neon={true}
                >
                  Start dag
                </Button>
              </div>
            </div>
          ) : (
            /* Login form - shown after clicking Start dag */
            <div className="bg-black/40 backdrop-blur-xl rounded-lg shadow-2xl border border-white/10 p-8 space-y-8">
              {/* Header */}
              <div className="text-center space-y-4">
                <h1 className="text-3xl font-semibold text-luxury-gold tracking-wider uppercase">
                  HQ
                </h1>
                
                {/* Greeting */}
                <div className="space-y-1">
                  <p className="text-xl font-medium text-white">
                    {getGreeting()}, Chiel
                  </p>
                  <p className="text-white/60 text-sm">
                    Welkom terug. Log in om verder te gaan.
                  </p>
                </div>

                {/* Live time and date */}
                <div className="bg-white/5 rounded-lg border border-white/10 p-4 space-y-2">
                  <div className="flex items-center justify-center gap-2 text-luxury-gold">
                    <Clock className="w-4 h-4" />
                    <span className="text-lg font-mono font-semibold text-white">{displayTime}</span>
                  </div>
                  <p className="text-xs text-white/60 capitalize">
                    {displayDate}
                  </p>
                  <p className="text-xs text-luxury-gold font-medium mt-1">
                    Dag {dayOfYear} van het jaar
                  </p>
                </div>

                {/* Daily Motivation Quote */}
                <div className="bg-gradient-to-r from-luxury-gold/20 to-luxury-gold/10 rounded-lg border border-luxury-gold/30 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <Sparkles className="w-5 h-5 text-luxury-gold" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-medium text-white/90 italic">
                        "{dailyQuote}"
                      </p>
                      <p className="text-xs text-white/60 mt-1">
                        Dagelijkse motivatie
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-white"
                >
                  E-mailadres
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold transition-all duration-200 text-white placeholder:text-white/40"
                  placeholder="jouw@email.nl"
                />
              </div>

              <div className="space-y-2">
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-white"
                >
                  Wachtwoord
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold transition-all duration-200 text-white placeholder:text-white/40"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-luxury-gold border-white/20 rounded focus:ring-luxury-gold focus:ring-2 bg-white/5"
                  />
                  <span className="text-white/60">Onthoud mij</span>
                </label>
                <a 
                  href="#" 
                  className="text-luxury-gold hover:text-luxury-gold-light transition-colors font-medium"
                >
                  Wachtwoord vergeten?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-luxury-gold text-luxury-charcoal font-semibold rounded-lg hover:bg-luxury-gold-dark transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Inloggen...
                  </span>
                ) : (
                  'Inloggen'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-luxury-gold/20"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black/40 px-2 text-white/60">Of</span>
              </div>
            </div>

            {/* Sign up link */}
            <div className="text-center text-sm">
              <span className="text-white/60">Nog geen account? </span>
              <a 
                href="#" 
                className="text-luxury-gold hover:text-luxury-gold-light font-semibold transition-colors"
              >
                Registreer hier
              </a>
            </div>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

