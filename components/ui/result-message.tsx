import { CheckCircle, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ResultMessageProps {
  success: boolean
  message: string
}

export function ResultMessage({ success, message }: ResultMessageProps) {
  if (!message) return null

  return (
    <Alert variant={success ? "default" : "destructive"} className="mt-6">
      {success ? <CheckCircle className="size-4" /> : <XCircle className="size-4" />}
      <AlertTitle>{success ? "Success" : "Error"}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
