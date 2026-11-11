/* PayrollSettings - SaintsHub HR Module
 * Edit per-year statutory payroll configuration (PAYE bands, personal relief,
 * NSSF, SHIF, Housing Levy) without code changes.
 */
"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Trash2, AlertTriangle, ArrowLeft } from "lucide-react"
import { TableSkeleton } from "@/components/ui/skeleton"

interface BandRow {
  minSalary: number
  maxSalary: number | null
  rate: number
}

interface SettingsRecord {
  id: string
  year: number
  shifRate: number
  housingLevyRate: number
  personalRelief: number
  payeBands: BandRow[]
  nssfRate: { employeePercent: number; employerPercent: number; maxMonthly: number } | null
}

const pct = (fraction: number) => Math.round(fraction * 10000) / 100 // 0.0275 -> 2.75
const frac = (percent: number) => percent / 100

export function PayrollSettings() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(String(currentYear))
  const [years, setYears] = useState<number[]>([currentYear])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ tone: "error" | "info"; text: string } | null>(null)

  const [personalRelief, setPersonalRelief] = useState("2400")
  const [shifRate, setShifRate] = useState("2.75")
  const [housingLevyRate, setHousingLevyRate] = useState("1.5")
  const [nssfEmployee, setNssfEmployee] = useState("6")
  const [nssfEmployer, setNssfEmployer] = useState("6")
  const [nssfMax, setNssfMax] = useState("4320")
  const [bands, setBands] = useState<{ min: string; max: string; rate: string }[]>([])

  const load = useCallback(
    async (y: string) => {
      setLoading(true)
      try {
        const res = await fetch(`/api/hr/payroll/statutory?year=${encodeURIComponent(y)}`, { cache: "no-store" })
        const body = await res.json()
        if (!res.ok) {
          setMessage({ tone: "error", text: body?.error ?? "Failed to load statutory settings" })
          return
        }
        const rec = body.data?.record as SettingsRecord
        setYears(body.data?.years ?? [currentYear])
        setPersonalRelief(String(rec.personalRelief))
        setShifRate(String(pct(rec.shifRate)))
        setHousingLevyRate(String(pct(rec.housingLevyRate)))
        setNssfEmployee(String(pct(rec.nssfRate?.employeePercent ?? 0.06)))
        setNssfEmployer(String(pct(rec.nssfRate?.employerPercent ?? 0.06)))
        setNssfMax(String(rec.nssfRate?.maxMonthly ?? 4320))
        setBands(
          [...rec.payeBands]
            .sort((a, b) => a.minSalary - b.minSalary)
            .map((b) => ({
              min: String(b.minSalary),
              max: b.maxSalary === null ? "" : String(b.maxSalary),
              rate: String(pct(b.rate)),
            }))
        )
      } finally {
        setLoading(false)
      }
    },
    [currentYear]
  )

  useEffect(() => {
    load(year)
  }, [year, load])

  const updateBand = (index: number, key: "min" | "max" | "rate", value: string) =>
    setBands((prev) => prev.map((b, i) => (i === index ? { ...b, [key]: value } : b)))

  const removeBand = (index: number) =>
    setBands((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev))

  const addBand = () =>
    setBands((prev) => {
      const last = prev[prev.length - 1]
      const lastMax = last?.max ? parseFloat(last.max) : null
      return [...prev, { min: lastMax === null || Number.isNaN(lastMax) ? "" : String(lastMax), max: "", rate: "" }]
    })

  const save = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const parsedBands = bands.map((b) => ({
        minSalary: Math.round(parseFloat(b.min || "0") || 0),
        maxSalary: b.max.trim() === "" ? null : Math.round(parseFloat(b.max) || 0),
        rate: frac(parseFloat(b.rate || "0") || 0),
      }))

      const res = await fetch("/api/hr/payroll/statutory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: parseInt(year, 10),
          personalRelief: parseFloat(personalRelief) || 0,
          shifRate: frac(parseFloat(shifRate) || 0),
          housingLevyRate: frac(parseFloat(housingLevyRate) || 0),
          nssfEmployeePercent: frac(parseFloat(nssfEmployee) || 0),
          nssfEmployerPercent: frac(parseFloat(nssfEmployer) || 0),
          nssfMaxMonthly: parseFloat(nssfMax) || 0,
          payeBands: parsedBands,
        }),
      })
      const body = await res.json()
      if (!res.ok) {
        setMessage({ tone: "error", text: body?.error ?? "Failed to save settings" })
        return
      }
      setMessage({ tone: "info", text: body?.message ?? "Settings saved" })
      await load(year)
    } finally {
      setSaving(false)
    }
  }

  const yearOptions = Array.from(new Set([currentYear - 1, currentYear, currentYear + 1, ...years])).sort((a, b) => a - b)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Link href="/hr/payroll" className="inline-flex w-fit items-center gap-1 text-sm font-medium text-anglican-blue-700 hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Payroll
        </Link>
        <h2 className="text-xl font-bold">Statutory settings</h2>
        <p className="text-sm text-muted-foreground">
          Payroll rates are stored per year and apply to <strong>runs computed after saving</strong>. Finalized runs keep the rates they were computed with.
        </p>
      </div>

      <Card className="border-anglican-gold-400/60 bg-anglican-gold-400/5">
        <CardContent className="flex items-start gap-3 pt-6">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-anglican-gold-600" aria-hidden="true" />
          <p className="text-sm text-anglican-gold-900">
            These rates implement the NSSF Act 2013 phase and Finance Act 2024 (PAYE bands, SHIF 2.75%, Housing Levy 1.5% + 1.5%).
            Confirm the gazetted figures for each year with the Bursar before saving — SaintsHub does not fetch KRA rates automatically.
          </p>
        </CardContent>
      </Card>

      {message && (
        <div
          role="status"
          className={`rounded-md border px-4 py-2 text-sm ${
            message.tone === "error"
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : "border-anglican-green-700/30 bg-anglican-green-700/10 text-anglican-green-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <CardTitle className="flex items-center gap-3">
            Statutory rates
            <Badge variant="secondary" size="sm">{year}</Badge>
          </CardTitle>
          <div className="flex items-end gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="settings-year" className="text-xs font-medium text-muted-foreground">Year</label>
              <Select id="settings-year" value={year} onValueChange={(e) => setYear(e.target.value)} className="w-28" aria-label="Year">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={save} disabled={saving || loading}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton columns={4} rows={4} className="py-3" />
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Scalar rates */}
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Monthly rates</p>
                {[
                  { id: "personal-relief", label: "PAYE personal relief (KES / month)", value: personalRelief, set: setPersonalRelief, suffix: "KES" },
                  { id: "shif-rate", label: "SHIF rate (% of gross)", value: shifRate, set: setShifRate, suffix: "%" },
                  { id: "levy-rate", label: "Housing Levy rate (each side)", value: housingLevyRate, set: setHousingLevyRate, suffix: "%" },
                  { id: "nssf-employee", label: "NSSF employee", value: nssfEmployee, set: setNssfEmployee, suffix: "%" },
                  { id: "nssf-employer", label: "NSSF employer", value: nssfEmployer, set: setNssfEmployer, suffix: "%" },
                  { id: "nssf-max", label: "NSSF max contribution (KES / month)", value: nssfMax, set: setNssfMax, suffix: "KES" },
                ].map((field) => (
                  <div key={field.id} className="flex flex-col gap-1">
                    <label htmlFor={field.id} className="text-xs font-medium text-muted-foreground">{field.label}</label>
                    <div className="flex items-center gap-2">
                      <Input
                        id={field.id}
                        type="number"
                        min={0}
                        step="0.01"
                        value={field.value}
                        onChange={(e) => field.set(e.target.value)}
                        className="w-40"
                        inputMode="decimal"
                      />
                      <span className="text-xs text-muted-foreground">{field.suffix}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* PAYE bands */}
              <div className="space-y-3 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">PAYE bands (monthly chargeable pay)</p>
                  <Button variant="outline" size="sm" onClick={addBand}>
                    <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
                    Add band
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="py-2 pr-2">#</th>
                        <th className="py-2 pr-2">From (KES)</th>
                        <th className="py-2 pr-2">To (KES — blank = unlimited)</th>
                        <th className="py-2 pr-2">Rate (%)</th>
                        <th className="py-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {bands.map((band, i) => (
                        <tr key={i} className="border-b border-border/60">
                          <td className="py-1.5 pr-2 text-muted-foreground">{i + 1}</td>
                          <td className="py-1.5 pr-2">
                            <Input
                              type="number"
                              min={0}
                              step={1}
                              value={band.min}
                              onChange={(e) => updateBand(i, "min", e.target.value)}
                              className="w-32"
                              aria-label={`Band ${i + 1} lower bound`}
                            />
                          </td>
                          <td className="py-1.5 pr-2">
                            <Input
                              type="number"
                              min={0}
                              step={1}
                              value={band.max}
                              onChange={(e) => updateBand(i, "max", e.target.value)}
                              placeholder="∞"
                              className="w-32"
                              aria-label={`Band ${i + 1} upper bound`}
                            />
                          </td>
                          <td className="py-1.5 pr-2">
                            <Input
                              type="number"
                              min={0}
                              max={50}
                              step="0.5"
                              value={band.rate}
                              onChange={(e) => updateBand(i, "rate", e.target.value)}
                              className="w-24"
                              aria-label={`Band ${i + 1} rate`}
                            />
                          </td>
                          <td className="py-1.5 text-right">
                            <Button variant="ghost" size="sm" onClick={() => removeBand(i)} aria-label={`Remove band ${i + 1}`} disabled={bands.length <= 1}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground">
                  Bands must start at 0 and be contiguous — each band&rsquo;s lower bound equals the previous band&rsquo;s upper bound. Leaving “To” blank makes the last band unlimited.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
