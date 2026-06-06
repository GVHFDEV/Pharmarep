"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Eye, EyeOff, Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError("Email ou senha inválidos")
      setLoading(false)
      return
    }

    router.push("/")
    router.refresh()
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-2">
        <h2 className="text-xl font-bold text-text-primary">Bem-vindo de volta</h2>
        <p className="text-sm text-text-muted mt-1">Faça login na sua conta</p>
      </div>

      <div>
        <label htmlFor="email" className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20 transition-all"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
          Senha
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 pr-11 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-danger bg-danger-light border border-danger-border rounded-lg px-3 py-2"
          role="alert"
        >
          {error}
        </motion.p>
      )}

      <motion.button
        type="submit"
        disabled={loading}
        whileTap={{ scale: 0.98 }}
        className="w-full rounded-xl py-3 text-sm font-semibold text-white bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Entrando...</> : "Entrar"}
      </motion.button>

      <p className="text-center text-sm text-text-secondary">
        Não tem conta?{" "}
        <Link href="/register" className="font-semibold text-accent hover:underline">
          Cadastre-se
        </Link>
      </p>
    </motion.form>
  )
}
