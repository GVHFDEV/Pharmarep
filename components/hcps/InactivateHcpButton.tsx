"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/Button"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { useToast } from "@/components/ui/Toast"

interface InactivateHcpButtonProps {
  hcpId: string
  hcpName: string
}

export function InactivateHcpButton({ hcpId, hcpName }: InactivateHcpButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function handleInactivate() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from("hcps")
      .update({ active: false })
      .eq("id", hcpId)
    setLoading(false)

    if (error) {
      toast.error("Erro ao inativar HCP")
      return
    }

    toast.success("HCP inativado com sucesso")
    setShowConfirm(false)
    router.push("/hcps")
    router.refresh()
  }

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setShowConfirm(true)}>
        Inativar
      </Button>
      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleInactivate}
        title="Inativar HCP"
        message={`Tem certeza que deseja inativar "${hcpName}"? O registro não será excluído, apenas ocultado da lista.`}
        confirmLabel="Inativar"
        loading={loading}
      />
    </>
  )
}
