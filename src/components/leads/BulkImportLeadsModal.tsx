'use client'

import React, { useState, useRef } from 'react'
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Download,
  ArrowRight,
  RefreshCw,
  FileText,
  ChevronRight,
  ShieldCheck
} from 'lucide-react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

interface BulkImportLeadsModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

type Step = 'upload' | 'mapping' | 'preview' | 'importing' | 'complete'

interface ColumnMapping {
  phone: string
  name: string
  category: string
  stage: string
  temperature: string
  state: string
  notes: string
}

function cleanPhoneLocal(raw: any): string {
  if (!raw) return ''
  let cleaned = String(raw).replace(/\D/g, '')
  if (cleaned.length === 10 && /^[6789]/.test(cleaned)) {
    cleaned = '91' + cleaned
  }
  return cleaned
}

export default function BulkImportLeadsModal({
  isOpen,
  onClose,
  onSuccess
}: BulkImportLeadsModalProps) {
  const [step, setStep] = useState<Step>('upload')
  const [fileName, setFileName] = useState<string>('')
  const [headers, setHeaders] = useState<string[]>([])
  const [parsedData, setParsedData] = useState<Record<string, any>[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [mapping, setMapping] = useState<ColumnMapping>({
    phone: '',
    name: '',
    category: '',
    stage: '',
    temperature: '',
    state: '',
    notes: ''
  })

  // Import Progress state
  const [progressPercent, setProgressPercent] = useState(0)
  const [importSummary, setImportSummary] = useState<{
    total: number
    inserted: number
    updated: number
    failed: number
  }>({ total: 0, inserted: 0, updated: 0, failed: 0 })
  const [importErrors, setImportErrors] = useState<{ row: number; phone: string; error: string }[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  const handleReset = () => {
    setStep('upload')
    setFileName('')
    setHeaders([])
    setParsedData([])
    setMapping({
      phone: '',
      name: '',
      category: '',
      stage: '',
      temperature: '',
      state: '',
      notes: ''
    })
    setProgressPercent(0)
    setImportSummary({ total: 0, inserted: 0, updated: 0, failed: 0 })
    setImportErrors([])
    setIsProcessing(false)
  }

  const handleModalClose = () => {
    handleReset()
    onClose()
  }

  const downloadSampleTemplate = () => {
    const csvContent = "Name,Phone Number,Category,Stage,Temperature,State,Notes\n" +
      "Rajesh Kumar,9876543210,Dealer,new,HOT,Delhi,Interested in RO spare parts\n" +
      "Amit Sharma,919812345678,Customer,contacted,WARM,Mumbai,Requested product catalog\n" +
      "Priya Verma,9711223344,Osmo Dealer,qualified,HOT,Punjab,Bulk purchase inquiry"
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'sample_leads_import_template.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const processRawFile = async (file: File) => {
    setFileName(file.name)
    const ext = file.name.split('.').pop()?.toLowerCase()

    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: 'greedy',
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const rawHeaders = results.meta.fields || Object.keys(results.data[0] as object)
            setHeaders(rawHeaders)
            const rows = (results.data as Record<string, any>[]).filter(r => Object.values(r).some(v => v !== null && v !== ''))
            setParsedData(rows)
            autoDetectMapping(rawHeaders)
            setStep('mapping')
          }
        },
        error: (err) => {
          alert(`Error parsing CSV file: ${err.message}`)
        }
      })
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          const json = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' })

          if (json.length > 0) {
            const rawHeaders = Object.keys(json[0])
            setHeaders(rawHeaders)
            setParsedData(json)
            autoDetectMapping(rawHeaders)
            setStep('mapping')
          } else {
            alert('The uploaded Excel file contains no data rows.')
          }
        } catch (err: any) {
          alert(`Error reading Excel file: ${err.message}`)
        }
      }
      reader.readAsArrayBuffer(file)
    } else {
      alert('Unsupported file format. Please upload a .csv, .xlsx, or .xls file.')
    }
  }

  const autoDetectMapping = (cols: string[]) => {
    const findMatch = (keywords: string[]) => {
      return cols.find(c => {
        const lower = c.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
        return keywords.some(k => lower.includes(k))
      }) || ''
    }

    const newMap: ColumnMapping = {
      phone: findMatch(['phone', 'mobile', 'contact', 'whatsapp', 'number', 'tel']),
      name: findMatch(['name', 'customer', 'client', 'person', 'leadname']),
      category: findMatch(['category', 'type', 'leadtype', 'osmocategory', 'role']),
      stage: findMatch(['stage', 'status', 'state']),
      temperature: findMatch(['temperature', 'quality', 'score', 'heat', 'rating']),
      state: findMatch(['state', 'location', 'city', 'region']),
      notes: findMatch(['note', 'notes', 'comment', 'description', 'remark'])
    }

    setMapping(newMap)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processRawFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processRawFile(e.target.files[0])
    }
  }

  const validRowsCount = parsedData.filter(r => {
    const rawVal = mapping.phone ? r[mapping.phone] : ''
    const cleaned = cleanPhoneLocal(rawVal)
    return cleaned && cleaned.length >= 10
  }).length

  const executeBatchImport = async () => {
    if (!mapping.phone) {
      alert('Please select a column for Phone Number before proceeding.')
      return
    }

    setStep('importing')
    setIsProcessing(true)
    setProgressPercent(0)

    // Build payload array
    const leadsToUpload = parsedData.map(row => {
      const item: Record<string, any> = {
        phone_number: row[mapping.phone]
      }
      if (mapping.name && row[mapping.name]) item.name = row[mapping.name]
      if (mapping.category && row[mapping.category]) item.osmo_category = row[mapping.category]
      if (mapping.stage && row[mapping.stage]) item.stage = row[mapping.stage]
      if (mapping.temperature && row[mapping.temperature]) item.lead_temperature = row[mapping.temperature]
      if (mapping.state && row[mapping.state]) item.state = row[mapping.state]
      if (mapping.notes && row[mapping.notes]) item.notes = row[mapping.notes]

      // Include all remaining non-mapped fields into custom metadata
      const mappedCols = new Set(Object.values(mapping).filter(Boolean))
      for (const [colName, val] of Object.entries(row)) {
        if (!mappedCols.has(colName) && val !== '' && val !== null && val !== undefined) {
          item[colName] = val
        }
      }
      return item
    })

    const BATCH_SIZE = 100
    const totalCount = leadsToUpload.length
    let totalInserted = 0
    let totalUpdated = 0
    let totalFailed = 0
    const allErrors: { row: number; phone: string; error: string }[] = []

    for (let i = 0; i < totalCount; i += BATCH_SIZE) {
      const batch = leadsToUpload.slice(i, i + BATCH_SIZE)

      try {
        const res = await fetch('/api/leads/bulk-import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leads: batch })
        })

        const data = await res.json()

        if (res.ok && data.success) {
          totalInserted += data.summary.inserted || 0
          totalUpdated += data.summary.updated || 0
          totalFailed += data.summary.failed || 0

          if (data.errors && Array.isArray(data.errors)) {
            const adjustedErrors = data.errors.map((e: any) => ({
              ...e,
              row: i + e.row
            }))
            allErrors.push(...adjustedErrors)
          }
        } else {
          totalFailed += batch.length
          allErrors.push({
            row: i + 1,
            phone: 'Batch Error',
            error: data.error || 'Server error uploading batch'
          })
        }
      } catch (err: any) {
        totalFailed += batch.length
        allErrors.push({
          row: i + 1,
          phone: 'Network Error',
          error: err.message || 'Failed to connect to server'
        })
      }

      const percent = Math.min(100, Math.round(((i + batch.length) / totalCount) * 100))
      setProgressPercent(percent)
    }

    setImportSummary({
      total: totalCount,
      inserted: totalInserted,
      updated: totalUpdated,
      failed: totalFailed
    })
    setImportErrors(allErrors)
    setIsProcessing(false)
    setStep('complete')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Bulk Import Leads</h2>
              <p className="text-xs text-slate-400">Import CSV or Excel files with auto-validation & zero UI lag</p>
            </div>
          </div>

          <button
            onClick={handleModalClose}
            disabled={isProcessing}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between px-8 py-3 bg-slate-950/40 border-b border-slate-800/60 text-xs">
          {[
            { id: 'upload', label: '1. Upload File' },
            { id: 'mapping', label: '2. Map Columns' },
            { id: 'preview', label: '3. Validate' },
            { id: 'complete', label: '4. Done' }
          ].map((s, idx) => {
            const isCurrent = step === s.id || (step === 'importing' && s.id === 'preview')
            const isPassed =
              (step === 'mapping' && idx === 0) ||
              (step === 'preview' && idx <= 1) ||
              (step === 'importing' && idx <= 2) ||
              (step === 'complete' && idx <= 3)

            return (
              <div key={s.id} className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-medium ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : isPassed
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isPassed && !isCurrent ? '✓' : idx + 1}
                </span>
                <span className={isCurrent ? 'font-semibold text-blue-400' : isPassed ? 'text-slate-300' : 'text-slate-500'}>
                  {s.label}
                </span>
                {idx < 3 && <ChevronRight className="w-3.5 h-3.5 text-slate-700 ml-2" />}
              </div>
            )
          })}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* STEP 1: UPLOAD */}
          {step === 'upload' && (
            <div className="space-y-6">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
                  isDragOver
                    ? 'border-blue-500 bg-blue-500/10 scale-[1.01]'
                    : 'border-slate-700 hover:border-slate-500 bg-slate-950/30 hover:bg-slate-950/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 shadow-inner">
                  <UploadCloud className="w-8 h-8" />
                </div>

                <h3 className="text-base font-semibold text-slate-200 mb-1">
                  Drag & Drop your leads file here
                </h3>
                <p className="text-xs text-slate-400 mb-4 text-center">
                  Supports <span className="text-slate-200 font-medium">.CSV</span>, <span className="text-slate-200 font-medium">.XLSX</span>, and <span className="text-slate-200 font-medium">.XLS</span> files up to 10,000 rows
                </p>

                <button
                  type="button"
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md shadow-blue-600/20"
                >
                  Browse Computer File
                </button>
              </div>

              {/* Sample Template Bar */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="text-xs font-medium text-slate-200">Need a sample file?</div>
                    <div className="text-[11px] text-slate-400">Download formatted CSV template with recommended headers</div>
                  </div>
                </div>
                <button
                  onClick={downloadSampleTemplate}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition-colors border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Sample CSV
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: MAPPING */}
          {step === 'mapping' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">Map File Columns</h3>
                  <p className="text-xs text-slate-400">Match your spreadsheet headers to Lead CRM fields</p>
                </div>
                <div className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  {parsedData.length} rows loaded from {fileName}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone Mapping (Required) */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-blue-500/30 space-y-1.5">
                  <label className="text-xs font-semibold text-blue-400 flex items-center justify-between">
                    <span>Phone Number * (Required)</span>
                    <span className="text-[10px] text-blue-300/80">Unique Identifier</span>
                  </label>
                  <select
                    value={mapping.phone}
                    onChange={(e) => setMapping({ ...mapping, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-blue-500/40 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">-- Select Phone Column --</option>
                    {headers.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name Mapping */}
                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Customer / Business Name</label>
                  <select
                    value={mapping.name}
                    onChange={(e) => setMapping({ ...mapping, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">-- Select Name Column (Optional) --</option>
                    {headers.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Mapping */}
                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Category / Role (Dealer, Customer, etc.)</label>
                  <select
                    value={mapping.category}
                    onChange={(e) => setMapping({ ...mapping, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">-- Select Category Column (Optional) --</option>
                    {headers.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stage Mapping */}
                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Pipeline Stage</label>
                  <select
                    value={mapping.stage}
                    onChange={(e) => setMapping({ ...mapping, stage: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">-- Select Stage Column (Optional) --</option>
                    {headers.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Temperature / Quality Mapping */}
                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Lead Quality / Temperature (HOT/WARM/COLD)</label>
                  <select
                    value={mapping.temperature}
                    onChange={(e) => setMapping({ ...mapping, temperature: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">-- Select Quality Column (Optional) --</option>
                    {headers.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>

                {/* State / Location Mapping */}
                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">State / Location</label>
                  <select
                    value={mapping.state}
                    onChange={(e) => setMapping({ ...mapping, state: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">-- Select State/Location Column (Optional) --</option>
                    {headers.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PREVIEW & VALIDATION */}
          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">Data Preview & Validation</h3>
                  <p className="text-xs text-slate-400">Reviewing top 5 sample rows out of {parsedData.length} leads</p>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {validRowsCount} Valid Phones
                  </span>
                  {parsedData.length - validRowsCount > 0 && (
                    <span className="flex items-center gap-1.5 text-rose-400 font-medium bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {parsedData.length - validRowsCount} Invalid Rows
                    </span>
                  )}
                </div>
              </div>

              {/* Table Preview */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/50">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Phone</th>
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Quality</th>
                      <th className="py-2.5 px-3">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {parsedData.slice(0, 5).map((row, idx) => {
                      const rawP = mapping.phone ? row[mapping.phone] : ''
                      const cleanP = cleanPhoneLocal(rawP)
                      const isValid = cleanP && cleanP.length >= 10

                      return (
                        <tr key={idx} className="hover:bg-slate-900/50">
                          <td className="py-2.5 px-3">
                            {isValid ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" /> Valid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                                <AlertTriangle className="w-3 h-3" /> Invalid
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-300">
                            {cleanP || rawP || '-'}
                          </td>
                          <td className="py-2.5 px-3 font-medium">
                            {mapping.name && row[mapping.name] ? row[mapping.name] : '-'}
                          </td>
                          <td className="py-2.5 px-3">
                            {mapping.category && row[mapping.category] ? row[mapping.category] : 'Unfiltered'}
                          </td>
                          <td className="py-2.5 px-3">
                            {mapping.temperature && row[mapping.temperature] ? row[mapping.temperature] : 'COLD'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400">
                            {mapping.state && row[mapping.state] ? row[mapping.state] : '-'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>
                  <strong>Conflict Resolution:</strong> Re-importing existing phone numbers will update their information safely without creating duplicate records.
                </span>
              </div>
            </div>
          )}

          {/* STEP 4: IMPORTING IN PROGRESS */}
          {step === 'importing' && (
            <div className="py-12 flex flex-col items-center justify-center space-y-6 text-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin flex items-center justify-center">
                </div>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-blue-400">
                  {progressPercent}%
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold text-slate-100 mb-1">
                  Importing Leads in Progress...
                </h3>
                <p className="text-xs text-slate-400">
                  Processing in chunks of 100 leads to guarantee zero lag and fast performance
                </p>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full max-w-md bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800 p-0.5">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* STEP 5: COMPLETE */}
          {step === 'complete' && (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 shadow-inner">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-100">Bulk Lead Import Complete!</h3>
                <p className="text-xs text-slate-400">All leads have been parsed, validated, and saved to DB</p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Total Processed</div>
                  <div className="text-lg font-bold text-slate-100 mt-0.5">{importSummary.total}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <div className="text-xs text-emerald-400">New Leads Created</div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">{importSummary.inserted}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                  <div className="text-xs text-blue-400">Existing Updated</div>
                  <div className="text-lg font-bold text-blue-400 mt-0.5">{importSummary.updated}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Skipped / Failed</div>
                  <div className={`text-lg font-bold mt-0.5 ${importSummary.failed > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                    {importSummary.failed}
                  </div>
                </div>
              </div>

              {/* Error Log if any */}
              {importErrors.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Failed Rows Details ({importErrors.length}):
                  </div>
                  <div className="max-h-32 overflow-y-auto rounded-xl bg-slate-950/80 border border-slate-800 p-3 space-y-1 text-xs">
                    {importErrors.map((err, idx) => (
                      <div key={idx} className="flex items-center justify-between text-slate-400">
                        <span>Row {err.row}: {err.phone}</span>
                        <span className="text-rose-400 font-mono text-[11px]">{err.error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/80 bg-slate-900/50">
          {step === 'upload' && (
            <button
              onClick={handleModalClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
          )}

          {step === 'mapping' && (
            <>
              <button
                onClick={() => setStep('upload')}
                className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (!mapping.phone) {
                    alert('Please select a column for Phone Number')
                    return
                  }
                  setStep('preview')
                }}
                className="flex items-center gap-2 px-5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md shadow-blue-600/20"
              >
                Next: Validate & Preview
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {step === 'preview' && (
            <>
              <button
                onClick={() => setStep('mapping')}
                className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Back
              </button>
              <button
                onClick={executeBatchImport}
                disabled={validRowsCount === 0}
                className="flex items-center gap-2 px-5 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                Start Bulk Import ({validRowsCount} Leads)
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {step === 'complete' && (
            <div className="w-full flex justify-end">
              <button
                onClick={() => {
                  handleModalClose()
                  if (onSuccess) onSuccess()
                }}
                className="px-6 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md shadow-blue-600/20"
              >
                Done & View Leads CRM
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
