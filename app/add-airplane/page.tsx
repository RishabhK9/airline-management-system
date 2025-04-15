import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"

interface AirplaneFormData {
  airlineID: string
  tail_num: string
  seat_capacity: number
  speed: number
  locationID: string
  plane_type: string
  maintenanced: boolean | null
  model: string | null
  neo: boolean | null
}

export default function AddAirplanePage() {
  const router = useRouter()
  const [formData, setFormData] = useState<AirplaneFormData>({
    airlineID: "",
    tail_num: "",
    seat_capacity: 0,
    speed: 0,
    locationID: "",
    plane_type: "",
    maintenanced: null,
    model: null,
    neo: null,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/airplanes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to add airplane")
      }

      router.push("/airplanes")
    } catch (error) {
      console.error("Error adding airplane:", error)
    }
  }

  return (
    <div className="container py-10">
      <Card className="max-w-2xl mx-auto p-6 border shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-6">Add New Airplane</h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <FormField
                  id="airlineID"
                  label="Airline ID"
                  value={formData.airlineID}
                  onChange={(value: string) => setFormData({ ...formData, airlineID: value })}
                  required
                  className="w-full"
                />
                <FormField
                  id="tail_num"
                  label="Tail Number"
                  value={formData.tail_num}
                  onChange={(value: string) => setFormData({ ...formData, tail_num: value })}
                  required
                  className="w-full"
                />
                <FormField
                  id="seat_capacity"
                  label="Seat Capacity"
                  type="number"
                  value={formData.seat_capacity}
                  onChange={(value: number) => setFormData({ ...formData, seat_capacity: value })}
                  required
                  className="w-full"
                />
                <FormField
                  id="speed"
                  label="Speed"
                  type="number"
                  value={formData.speed}
                  onChange={(value: number) => setFormData({ ...formData, speed: value })}
                  required
                  className="w-full"
                />
                <FormField
                  id="locationID"
                  label="Location ID"
                  value={formData.locationID}
                  onChange={(value: string) => setFormData({ ...formData, locationID: value })}
                  required
                  className="w-full"
                />
                <FormField
                  id="plane_type"
                  label="Plane Type"
                  type="select"
                  value={formData.plane_type}
                  onChange={(value: string) => setFormData({ ...formData, plane_type: value })}
                  options={[
                    { value: "Boeing", label: "Boeing" },
                    { value: "Airbus", label: "Airbus" },
                  ]}
                  required
                  className="w-full"
                />
                <FormField
                  id="maintenanced"
                  label="Maintenanced"
                  type="checkbox"
                  value={formData.maintenanced}
                  onChange={(value: boolean) => setFormData({ ...formData, maintenanced: value })}
                  allowNull={true}
                  className="w-full"
                />
                <FormField
                  id="model"
                  label="Model"
                  value={formData.model}
                  onChange={(value: string) => setFormData({ ...formData, model: value })}
                  allowNull={true}
                  className="w-full"
                />
                <FormField
                  id="neo"
                  label="Neo"
                  type="checkbox"
                  value={formData.neo}
                  onChange={(value: boolean) => setFormData({ ...formData, neo: value })}
                  allowNull={true}
                  className="w-full"
                />
              </div>
            </div>
            <div className="pt-6 border-t">
              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit">Add Airplane</Button>
              </div>
            </div>
          </div>
        </form>
      </Card>
    </div>
  )
} 