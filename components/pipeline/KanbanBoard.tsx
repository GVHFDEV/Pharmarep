"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { PIPELINE_STAGES, PRIORITIES } from "@/lib/utils/constants"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { BottomSheet } from "@/components/ui/BottomSheet"
import { useToast } from "@/components/ui/Toast"
import { formatDate } from "@/lib/utils/formatters"
import type { PipelineDeal, HCP } from "@/types"

const STAGE_ORDER = [
  "prospeccao",
  "primeiro_contato",
  "visita_agendada",
  "em_relacionamento",
  "convertido",
  "perdido",
] as const

type Stage = (typeof STAGE_ORDER)[number]

const PRIORITY_VARIANT: Record<string, "danger" | "warning" | "neutral"> = {
  high: "danger",
  medium: "warning",
  low: "neutral",
}

const PRIORITY_LABEL: Record<string, string> = {
  high: "Alta",
  medium: "Média",
  low: "Baixa",
}

export function KanbanBoard() {
  const [deals, setDeals] = useState<PipelineDeal[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewDeal, setShowNewDeal] = useState(false)
  const [hcps, setHcps] = useState<Pick<HCP, "id" | "name" | "specialty">[]>([])
  const [hcpSearch, setHcpSearch] = useState("")
  const [selectedHcp, setSelectedHcp] = useState<Pick<HCP, "id" | "name" | "specialty"> | null>(null)
  const [newTitle, setNewTitle] = useState("")
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium")
  const [saving, setSaving] = useState(false)

  const { toast } = useToast()
  const supabase = createClient()

  const fetchDeals = useCallback(async () => {
    const { data, error } = await supabase
      .from("pipeline_deals")
      .select("*, hcp:hcps(name, specialty)")
      .order("created_at", { ascending: false })

    if (error) {
      toast.error("Erro ao carregar pipeline")
      return
    }

    setDeals(data ?? [])
    setLoading(false)
  }, [])

  const fetchHcps = useCallback(async (search: string) => {
    const query = supabase
      .from("hcps")
      .select("id, name, specialty")
      .eq("active", true)
      .order("name")
      .limit(10)

    if (search) {
      query.ilike("name", `%${search}%`)
    }

    const { data } = await query

    setHcps(data ?? [])
  }, [])

  useEffect(() => {
    fetchDeals()
  }, [fetchDeals])

  useEffect(() => {
    if (showNewDeal) {
      fetchHcps(hcpSearch)
    }
  }, [showNewDeal, hcpSearch, fetchHcps])

  const groupedDeals = STAGE_ORDER.reduce(
    (acc, stage) => {
      acc[stage] = deals.filter((d) => d.stage === stage)
      return acc
    },
    {} as Record<Stage, PipelineDeal[]>
  )

  const moveDeal = async (deal: PipelineDeal, direction: "forward" | "backward") => {
    const currentIndex = STAGE_ORDER.indexOf(deal.stage as Stage)
    const newIndex = direction === "forward" ? currentIndex + 1 : currentIndex - 1

    if (newIndex < 0 || newIndex >= STAGE_ORDER.length) return

    const newStage = STAGE_ORDER[newIndex]
    const previousDeals = [...deals]

    // Optimistic update
    setDeals((prev) =>
      prev.map((d) => (d.id === deal.id ? { ...d, stage: newStage } : d))
    )

    const { error } = await supabase
      .from("pipeline_deals")
      .update({ stage: newStage, updated_at: new Date().toISOString() })
      .eq("id", deal.id)

    if (error) {
      // Rollback
      setDeals(previousDeals)
      toast.error("Erro ao mover deal")
    }
  }

  const handleCreateDeal = async () => {
    if (!selectedHcp || !newTitle.trim()) return

    setSaving(true)

    const { data, error } = await supabase
      .from("pipeline_deals")
      .insert({
        hcp_id: selectedHcp.id,
        title: newTitle.trim(),
        priority: newPriority,
        stage: "prospeccao" as Stage,
      })
      .select("*, hcp:hcps(name, specialty)")
      .single()

    if (error) {
      toast.error("Erro ao criar deal")
      setSaving(false)
      return
    }

    setDeals((prev) => [data, ...prev])
    toast.success("Deal criado com sucesso")
    resetForm()
    setSaving(false)
    setShowNewDeal(false)
  }

  const resetForm = () => {
    setSelectedHcp(null)
    setHcpSearch("")
    setNewTitle("")
    setNewPriority("medium")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      {/* Kanban columns */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {PIPELINE_STAGES.map((stage) => {
            const stageDeals = groupedDeals[stage.value as Stage] ?? []

            return (
              <div
                key={stage.value}
                className="bg-surface-2 border border-border rounded-xl p-4 min-w-[280px] max-w-[320px] flex-shrink-0"
              >
                {/* Column header */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-text-primary">
                    {stage.label}{" "}
                    <span className="text-text-muted font-normal">
                      ({stageDeals.length})
                    </span>
                  </h3>
                  <button
                    onClick={() => setShowNewDeal(true)}
                    className="p-1 rounded-md text-text-muted hover:text-accent hover:bg-accent-light transition-colors"
                    aria-label={`Adicionar deal em ${stage.label}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Deal cards */}
                <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
                  {stageDeals.map((deal) => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      onMoveForward={() => moveDeal(deal, "forward")}
                      onMoveBackward={() => moveDeal(deal, "backward")}
                      isFirst={STAGE_ORDER.indexOf(deal.stage as Stage) === 0}
                      isLast={
                        STAGE_ORDER.indexOf(deal.stage as Stage) ===
                        STAGE_ORDER.length - 1
                      }
                    />
                  ))}

                  {stageDeals.length === 0 && (
                    <p className="text-xs text-text-muted text-center py-4">
                      Nenhum deal
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* New deal BottomSheet */}
      <BottomSheet
        open={showNewDeal}
        onClose={() => {
          setShowNewDeal(false)
          resetForm()
        }}
        title="Novo Deal"
      >
        <div className="flex flex-col gap-4">
          {/* HCP search */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              HCP
            </label>
            {selectedHcp ? (
              <div className="flex items-center justify-between bg-surface-2 border border-border rounded-lg px-3 py-2">
                <div>
                  <p className="text-sm text-text-primary">{selectedHcp.name}</p>
                  <p className="text-xs text-text-muted">{selectedHcp.specialty}</p>
                </div>
                <button
                  onClick={() => setSelectedHcp(null)}
                  className="text-xs text-accent hover:underline"
                >
                  Alterar
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  placeholder="Buscar HCP..."
                  value={hcpSearch}
                  onChange={(e) => setHcpSearch(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                />
                {hcps.length > 0 && (
                  <ul className="mt-1 border border-border rounded-lg bg-surface max-h-40 overflow-y-auto">
                    {hcps.map((hcp) => (
                      <li key={hcp.id}>
                        <button
                          onClick={() => {
                            setSelectedHcp(hcp)
                            setHcpSearch("")
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-surface-2 transition-colors"
                        >
                          <p className="text-sm text-text-primary">{hcp.name}</p>
                          <p className="text-xs text-text-muted">{hcp.specialty}</p>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Título
            </label>
            <input
              type="text"
              placeholder="Nome do deal..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Prioridade
            </label>
            <select
              value={newPriority}
              onChange={(e) =>
                setNewPriority(e.target.value as "low" | "medium" | "high")
              }
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <Button
            onClick={handleCreateDeal}
            disabled={!selectedHcp || !newTitle.trim()}
            loading={saving}
            className="w-full mt-2"
          >
            Criar Deal
          </Button>
        </div>
      </BottomSheet>
    </>
  )
}

// Deal Card component
function DealCard({
  deal,
  onMoveForward,
  onMoveBackward,
  isFirst,
  isLast,
}: {
  deal: PipelineDeal
  onMoveForward: () => void
  onMoveBackward: () => void
  isFirst: boolean
  isLast: boolean
}) {
  return (
    <div className="bg-surface border border-border rounded-lg p-3 shadow-sm">
      {/* HCP name and specialty */}
      <p className="text-sm font-medium text-text-primary truncate">
        {deal.hcp?.name ?? "HCP"}
      </p>
      <p className="text-xs text-text-muted truncate">{deal.hcp?.specialty}</p>

      {/* Title */}
      <p className="text-xs text-text-secondary mt-1 truncate">{deal.title}</p>

      {/* Priority + date row */}
      <div className="flex items-center justify-between mt-2">
        <Badge variant={PRIORITY_VARIANT[deal.priority]}>
          {PRIORITY_LABEL[deal.priority]}
        </Badge>
        {deal.expected_close && (
          <span className="text-[11px] text-text-muted">
            {formatDate(deal.expected_close)}
          </span>
        )}
      </div>

      {/* Move arrows */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
        <button
          onClick={onMoveBackward}
          disabled={isFirst}
          className="p-1 rounded text-text-muted hover:text-accent hover:bg-accent-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Mover para estágio anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={onMoveForward}
          disabled={isLast}
          className="p-1 rounded text-text-muted hover:text-accent hover:bg-accent-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Mover para próximo estágio"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
