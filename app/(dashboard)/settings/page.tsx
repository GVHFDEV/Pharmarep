"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { Camera, Users, Calendar, Package } from 'lucide-react'

export default function SettingsPage() {
  const { toast } = useToast()
  const supabase = createClient()

  // Profile state
  const [fullName, setFullName] = useState('')
  const [company, setCompany] = useState('')
  const [region, setRegion] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  // Password state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  // Stats
  const [stats, setStats] = useState({ hcps: 0, visits: 0, products: 0 })

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Sessão expirada')
        setFetching(false)
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        toast.error('Erro ao carregar perfil')
      }

      if (profile) {
        setFullName(profile.full_name || '')
        setCompany(profile.company || '')
        setRegion(profile.region || '')
        setAvatarUrl(profile.avatar_url)
      }

      // Fetch stats
      const [hcpsRes, visitsRes, productsRes] = await Promise.all([
        supabase.from('hcps').select('id', { count: 'exact', head: true }).eq('active', true),
        supabase.from('visits').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('active', true),
      ])

      setStats({
        hcps: hcpsRes.count ?? 0,
        visits: visitsRes.count ?? 0,
        products: productsRes.count ?? 0,
      })
      setFetching(false)
    }
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle avatar file select
  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  // Save profile
  async function handleSaveProfile() {
    setProfileLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Sessão expirada')
      setProfileLoading(false)
      return
    }

    let uploadedAvatarUrl = avatarUrl

    // Upload avatar if new file selected
    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop()
      const filePath = `${user.id}/avatar.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, { upsert: true })

      if (uploadError) {
        toast.error('Erro ao fazer upload do avatar')
        setProfileLoading(false)
        return
      }
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)
      uploadedAvatarUrl = publicUrl
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        company: company || null,
        region: region || null,
        avatar_url: uploadedAvatarUrl,
      })
      .eq('id', user.id)

    setProfileLoading(false)
    if (error) {
      toast.error('Erro ao salvar perfil')
      return
    }
    setAvatarFile(null)
    setAvatarPreview(null)
    if (uploadedAvatarUrl) setAvatarUrl(uploadedAvatarUrl)
    toast.success('Perfil atualizado com sucesso!')
  }

  // Change password
  async function handleChangePassword() {
    setPasswordError('')
    if (newPassword.length < 8) {
      setPasswordError('A senha deve ter pelo menos 8 caracteres')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem')
      return
    }

    setPasswordLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPasswordLoading(false)

    if (error) {
      toast.error('Erro ao alterar senha')
      return
    }
    toast.success('Senha alterada com sucesso!')
    setNewPassword('')
    setConfirmPassword('')
  }

  if (fetching) {
    return (
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-xl font-semibold text-text-primary">Configurações</h1>
        <Card className="animate-pulse h-64"><div /></Card>
        <Card className="animate-pulse h-48"><div /></Card>
        <Card className="animate-pulse h-32"><div /></Card>
      </div>
    )
  }

  const displayAvatar = avatarPreview || avatarUrl

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-semibold text-text-primary">Configurações</h1>

      {/* Profile Section */}
      <Card>
        <h2 className="text-base font-medium text-text-primary mb-4">Perfil</h2>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-surface-2 border border-border flex items-center justify-center overflow-hidden">
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl font-medium text-text-muted">
                  {fullName?.charAt(0)?.toUpperCase() || '?'}
                </span>
              )}
            </div>
            <label
              htmlFor="avatar-upload"
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-accent text-text-on-accent rounded-full flex items-center justify-center cursor-pointer hover:bg-accent-hover transition-colors shadow-sm"
            >
              <Camera className="w-3.5 h-3.5" />
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <div className="text-sm text-text-secondary">
            Clique no ícone para alterar a foto
          </div>
        </div>

        {/* Profile Fields */}
        <div className="space-y-4">
          <Input
            id="full-name"
            label="Nome completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Seu nome"
          />
          <Input
            id="company"
            label="Empresa"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Nome da empresa"
          />
          <Input
            id="region"
            label="Região"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="Ex: São Paulo - SP"
          />
        </div>

        <div className="mt-5">
          <Button
            onClick={handleSaveProfile}
            loading={profileLoading}
          >
            Salvar perfil
          </Button>
        </div>
      </Card>

      {/* Security Section */}
      <Card>
        <h2 className="text-base font-medium text-text-primary mb-4">Segurança</h2>
        <div className="space-y-4">
          <Input
            id="new-password"
            label="Nova senha"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
          />
          <Input
            id="confirm-password"
            label="Confirmar nova senha"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repita a nova senha"
          />
          {passwordError && (
            <p className="text-xs text-danger">{passwordError}</p>
          )}
        </div>
        <div className="mt-5">
          <Button
            onClick={handleChangePassword}
            loading={passwordLoading}
          >
            Alterar senha
          </Button>
        </div>
      </Card>

      {/* Data Summary Section */}
      <Card>
        <h2 className="text-base font-medium text-text-primary mb-4">Resumo dos dados</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-surface-2 border border-border">
            <Users className="w-5 h-5 text-accent" />
            <span className="text-lg font-semibold text-text-primary">{stats.hcps}</span>
            <span className="text-xs text-text-secondary">HCPs</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-surface-2 border border-border">
            <Calendar className="w-5 h-5 text-accent" />
            <span className="text-lg font-semibold text-text-primary">{stats.visits}</span>
            <span className="text-xs text-text-secondary">Visitas</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-surface-2 border border-border">
            <Package className="w-5 h-5 text-accent" />
            <span className="text-lg font-semibold text-text-primary">{stats.products}</span>
            <span className="text-xs text-text-secondary">Produtos</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
