"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { executeView } from "@/lib/db"
import { Loader2 } from "lucide-react"

export function RouteSummary() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    const response = await executeView("route_summary")

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
          <div className="text-center py-4 text-foreground/70">No routes found</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Num Legs</TableHead>
                  <TableHead>Leg Sequence</TableHead>
                  <TableHead>Route Length</TableHead>
                  <TableHead>Num Flights</TableHead>
                  <TableHead>Flight List</TableHead>
                  <TableHead>Airport Sequence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index} className="even:bg-muted/50">
                    <TableCell>{row.route}</TableCell>
                    <TableCell>{row.num_legs}</TableCell>
                    <TableCell>{row.leg_sequence}</TableCell>
                    <TableCell>{row.route_length}</TableCell>
                    <TableCell>{row.num_flights}</TableCell>
                    <TableCell>{row.flight_list || "None"}</TableCell>
                    <TableCell>{row.airport_sequence}</TableCell>
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
