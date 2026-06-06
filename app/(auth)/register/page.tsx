"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")

    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.")
      return
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.")
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          company,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Try to create the profile, but don't block signup if it fails
    if (data.user) {
      try {
        await supabase.from("profiles").insert({
          id: data.user.id,
          full_name: fullName,
          email,
          company,
        })
      } catch {
        // Profile insert may fail if the table doesn't exist yet.
        // That's okay — profile can be created later.
      }
    }

    router.push("/")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="fullName"
          className="block text-sm font-medium text-text-primary mb-1.5"
        >
          Nome Completo
        </label>
        <input
          id="fullName"
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Seu nome completo"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-border-focus"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-text-primary mb-1.5"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-border-focus"
        />
      </div>

      <div>
        <label
          htmlFor="company"
          className="block text-sm font-medium text-text-primary mb-1.5"
        >
          Empresa/Laboratório
        </label>
        <input
          id="company"
          type="text"
          required
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Nome da empresa ou laboratório"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-border-focus"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-text-primary mb-1.5"
        >
          Senha
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 8 caracteres"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-border-focus"
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-text-primary mb-1.5"
        >
          Confirmar Senha
        </label>
        <input
          id="confirmPassword"
          type="password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repita a senha"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-border-focus"
        />
      </div>

      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-text-on-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Cadastrando..." : "Cadastrar"}
      </button>

      <p className="text-center text-sm text-text-secondary">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="font-medium text-accent hover:text-accent-hover"
        >
          Entrar
        </Link>
      </p>
    </form>
  )
}
