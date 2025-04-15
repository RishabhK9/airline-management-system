"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface Option {
  value: string
  label: string
}

interface FormFieldProps {
  id: string
  label: string
  type?: "text" | "number" | "select" | "checkbox" | "null"
  placeholder?: string
  value: any
  onChange: (value: any) => void
  options?: Option[]
  required?: boolean
  allowNull?: boolean
  className?: string
}

export function FormField({
  id,
  label,
  type = "text",
  placeholder = "",
  value,
  onChange,
  options = [],
  required = false,
  allowNull = false,
  className,
}: FormFieldProps) {
  const [isNull, setIsNull] = useState(value === null)

  const handleNullToggle = (checked: boolean) => {
    setIsNull(checked)
    if (checked) {
      onChange(null)
    } else {
      onChange(type === "number" ? 0 : "")
    }
  }

  const handleChange = (newValue: any) => {
    if (isNull) return
    onChange(newValue)
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <Label htmlFor={id}>{label}</Label>
        {allowNull && (
          <div className="flex items-center space-x-2">
            <Checkbox id={`${id}-null`} checked={isNull} onCheckedChange={handleNullToggle} />
            <Label htmlFor={`${id}-null`} className="text-xs text-muted-foreground">
              NULL
            </Label>
          </div>
        )}
      </div>

      {type === "select" ? (
        <Select value={isNull ? "" : String(value)} onValueChange={handleChange} disabled={isNull}>
          <SelectTrigger id={id} className={required && !value && !isNull ? "border-destructive" : ""}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : type === "checkbox" ? (
        <Checkbox id={id} checked={value === true} onCheckedChange={handleChange} disabled={isNull} />
      ) : (
        <Input
          id={id}
          type={type === "number" ? "number" : "text"}
          placeholder={placeholder}
          value={isNull ? "" : value}
          onChange={(e) =>
            handleChange(type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)
          }
          disabled={isNull}
          className={required && !value && !isNull ? "border-destructive" : ""}
        />
      )}
    </div>
  )
}
