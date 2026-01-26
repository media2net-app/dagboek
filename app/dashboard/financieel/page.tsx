'use client'

import { useState, useEffect } from 'react'
import { ArrowUp, ArrowDown, Trash2, Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react'

interface Transaction {
  id: string
  type: 'income' | 'expense'
  description: string
  amount: number
  date: string
  category: string
}

const TRANSACTIONS_STORAGE_KEY = 'dagboek-financieel-transactions'

const defaultTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    description: 'Salaris',
    amount: 68150.50,
    date: '2024-01-01',
    category: 'Werk',
  },
  {
    id: '2',
    type: 'expense',
    description: 'Boodschappen',
    amount: 125.50,
    date: '2024-01-15',
    category: 'Levensmiddelen',
  },
  {
    id: '3',
    type: 'expense',
    description: 'Sportschool abonnement',
    amount: 45,
    date: '2024-01-10',
    category: 'Fitness',
  },
]

export default function FinancieelPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // Load transactions from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(TRANSACTIONS_STORAGE_KEY)
    if (stored) {
      try {
        const parsedTransactions = JSON.parse(stored)
        // Migration: Update old salary amount to new amount
        const updatedTransactions = parsedTransactions.map((transaction: Transaction) => {
          if (transaction.id === '1' && transaction.description === 'Salaris' && transaction.amount === 3500) {
            return { ...transaction, amount: 68150.50 }
          }
          return transaction
        })
        setTransactions(updatedTransactions)
      } catch (error) {
        console.error('Error loading transactions from localStorage:', error)
        setTransactions(defaultTransactions)
      }
    } else {
      setTransactions(defaultTransactions)
    }
  }, [])

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions))
    }
  }, [transactions])

  const [newTransaction, setNewTransaction] = useState({
    type: 'expense' as 'income' | 'expense',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
  })

  const categories = [
    'Werk',
    'Levensmiddelen',
    'Fitness',
    'Transport',
    'Entertainment',
    'Huisvesting',
    'Overig',
  ]

  const addTransaction = () => {
    if (newTransaction.description.trim() && newTransaction.amount) {
      setTransactions([
        {
          id: Date.now().toString(),
          ...newTransaction,
          amount: parseFloat(newTransaction.amount),
        },
        ...transactions,
      ])
      setNewTransaction({
        type: 'expense',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: '',
      })
    }
  }

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id))
  }

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-luxury-dark-text mb-2">
            Financieel Overzicht
          </h1>
          <p className="text-luxury-dark-text-light">
            Track je inkomsten en uitgaven
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-luxury-charcoal rounded-lg border border-luxury-dark-border p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <p className="text-luxury-dark-text-light text-sm">Totaal Inkomen</p>
            </div>
            <p className="text-3xl font-semibold text-green-500">
              €{totalIncome.toFixed(2)}
            </p>
          </div>
          <div className="bg-luxury-charcoal rounded-lg border border-luxury-dark-border p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              <p className="text-luxury-dark-text-light text-sm">Totaal Uitgaven</p>
            </div>
            <p className="text-3xl font-semibold text-red-500">
              €{totalExpenses.toFixed(2)}
            </p>
          </div>
          <div className="bg-luxury-charcoal rounded-lg border border-luxury-dark-border p-6">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-luxury-gold" />
              <p className="text-luxury-dark-text-light text-sm">Saldo</p>
            </div>
            <p
              className={`text-3xl font-semibold ${
                balance >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              €{balance.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add transaction */}
          <div className="lg:col-span-1">
            <div className="bg-luxury-charcoal rounded-lg border border-luxury-dark-border p-6">
              <h2 className="text-lg font-semibold text-luxury-dark-text mb-4">
                Nieuwe Transactie
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-luxury-dark-text mb-2">
                    Type
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setNewTransaction({ ...newTransaction, type: 'income' })
                      }
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                        newTransaction.type === 'income'
                          ? 'bg-green-500/20 text-green-400 border-2 border-green-500'
                          : 'bg-luxury-charcoal-lighter text-luxury-dark-text-light border-2 border-luxury-dark-border hover:border-green-500/50'
                      }`}
                    >
                      <ArrowUp className="w-4 h-4" />
                      Inkomen
                    </button>
                    <button
                      onClick={() =>
                        setNewTransaction({ ...newTransaction, type: 'expense' })
                      }
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                        newTransaction.type === 'expense'
                          ? 'bg-red-500/20 text-red-400 border-2 border-red-500'
                          : 'bg-luxury-charcoal-lighter text-luxury-dark-text-light border-2 border-luxury-dark-border hover:border-red-500/50'
                      }`}
                    >
                      <ArrowDown className="w-4 h-4" />
                      Uitgave
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-luxury-dark-text mb-2">
                    Beschrijving
                  </label>
                  <input
                    type="text"
                    placeholder="Bijv. Boodschappen"
                    value={newTransaction.description}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-luxury-charcoal-lighter border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text placeholder:text-luxury-dark-text-light"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-luxury-dark-text mb-2">
                    Bedrag (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newTransaction.amount}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        amount: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-luxury-charcoal-lighter border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text placeholder:text-luxury-dark-text-light"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-luxury-dark-text mb-2">
                    Categorie
                  </label>
                  <select
                    value={newTransaction.category}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-luxury-charcoal-lighter border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text"
                  >
                    <option value="">Selecteer categorie</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-luxury-dark-text mb-2">
                    Datum
                  </label>
                  <input
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        date: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-luxury-charcoal-lighter border border-luxury-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-dark-text"
                  />
                </div>

                <button
                  onClick={addTransaction}
                  className="w-full px-6 py-3 bg-luxury-gold text-luxury-charcoal font-semibold rounded-lg hover:bg-luxury-gold-dark transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Toevoegen
                </button>
              </div>
            </div>
          </div>

          {/* Transactions list */}
          <div className="lg:col-span-2">
            <div className="bg-luxury-charcoal rounded-lg border border-luxury-dark-border p-6">
              <h2 className="text-lg font-semibold text-luxury-dark-text mb-4">
                Transacties
              </h2>
              <div className="space-y-3">
                {transactions.length === 0 ? (
                  <p className="text-luxury-dark-text-light text-center py-8">
                    Geen transacties geregistreerd
                  </p>
                ) : (
                  transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-luxury-charcoal-lighter rounded-lg border border-luxury-dark-border hover:border-luxury-gold/50 transition-all"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          {transaction.type === 'income' ? (
                            <ArrowUp className="w-5 h-5 text-green-500" />
                          ) : (
                            <ArrowDown className="w-5 h-5 text-red-500" />
                          )}
                          <h3 className="font-semibold text-luxury-dark-text">
                            {transaction.description}
                          </h3>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-luxury-dark-text-light ml-8">
                          <span>{transaction.category}</span>
                          <span>•</span>
                          <span>
                            {new Date(transaction.date).toLocaleDateString('nl-NL', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`text-lg font-semibold ${
                            transaction.type === 'income'
                              ? 'text-green-500'
                              : 'text-red-500'
                          }`}
                        >
                          {transaction.type === 'income' ? '+' : '-'}€
                          {transaction.amount.toFixed(2)}
                        </span>
                        <button
                          onClick={() => deleteTransaction(transaction.id)}
                          className="text-luxury-dark-text-light hover:text-red-400 transition-colors p-2"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
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
