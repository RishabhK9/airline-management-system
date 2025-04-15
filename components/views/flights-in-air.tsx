"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { executeView } from "@/lib/db"
import { Loader2 } from "lucide-react"

export function FlightsInAir() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    const response = await executeView("flights_in_the_air")

    if (response.success && Array.isArray(response.data)) {
      setData(response.data)
      setError(null)
    } else {
      setError(response.error || "Failed to fetch data")
      setData([])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-end mb-4">
          <Button onClick={fetchData} disabled={loading} className="gap-2">
            {loading && <Loader2 className="size-4 animate-spin" />}
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-4 flex justify-center items-center gap-2">
            <Loader2 className="size-5 animate-spin" />
            Loading...
          </div>
        ) : error ? (
          <div className="text-center py-4 text-destructive">{error}</div>
        ) : data.length === 0 ? (
          <div className="text-center py-4 text-foreground/70">No flights currently in the air</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Departing From</TableHead>
                  <TableHead>Arriving At</TableHead>
                  <TableHead>Num Flights</TableHead>
                  <TableHead>Flight List</TableHead>
                  <TableHead>Earliest Arrival</TableHead>
                  <TableHead>Latest Arrival</TableHead>
                  <TableHead>Airplane List</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index} className="even:bg-muted/50">
                    <TableCell>{row.departing_from}</TableCell>
                    <TableCell>{row.arriving_at}</TableCell>
                    <TableCell>{row.num_flights}</TableCell>
                    <TableCell>{row.flight_list}</TableCell>
                    <TableCell>{row.earliest_arrival}</TableCell>
                    <TableCell>{row.latest_arrival}</TableCell>
                    <TableCell>{row.airplane_list}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
