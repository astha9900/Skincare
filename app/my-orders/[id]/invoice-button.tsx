'use client'

import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { FileDown } from 'lucide-react'

export function InvoiceButton() {
  const params = useParams()
  const id = params?.id as string

  const openInvoice = () => {
    window.open(`/api/orders/${id}/invoice`, '_blank', 'noopener,noreferrer')
  }

  return (
    <Button variant="outline" onClick={openInvoice} className="w-full">
      <FileDown className="h-4 w-4 mr-2" />
      Download Invoice (PDF)
    </Button>
  )
}
