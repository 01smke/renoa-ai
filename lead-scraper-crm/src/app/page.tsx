'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit3, 
  Phone, 
  Mail, 
  MapPin, 
  Star,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Calendar,
  MoreVertical,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Home,
  Building,
  ChevronDown,
  RefreshCw,
  Download,
  Settings
} from "lucide-react"

interface Lead {
  id: string
  name: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  zip: string
  property_value: number
  property_type: string
  bedrooms: number
  bathrooms: number
  final_score: number
  tier: string
  status: string
  priority: string
  notes: string
  created_at: string
  updated_at: string
}

const statusColors = {
  'new': 'bg-blue-50 text-blue-700 border-blue-200',
  'contacted': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'interested': 'bg-green-50 text-green-700 border-green-200',
  'not_interested': 'bg-red-50 text-red-700 border-red-200',
  'closed': 'bg-gray-50 text-gray-700 border-gray-200'
}

const tierColors = {
  'Tier 1': 'bg-purple-50 text-purple-700 border-purple-200',
  'Tier 2': 'bg-blue-50 text-blue-700 border-blue-200',
  'Tier 3': 'bg-green-50 text-green-700 border-green-200'
}

const priorityColors = {
  'high': 'bg-red-50 text-red-700 border-red-200',
  'medium': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'low': 'bg-green-50 text-green-700 border-green-200'
}

export default function CRM() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [tierFilter, setTierFilter] = useState('all')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingNotes, setEditingNotes] = useState(false)
  const [notes, setNotes] = useState('')

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    interested: 0,
    totalValue: 0
  })

  useEffect(() => {
    fetchLeads()
  }, [])

  useEffect(() => {
    filterLeads()
  }, [leads, searchTerm, statusFilter, tierFilter])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/leads')
      const data = await response.json()
      
      if (data.leads) {
        setLeads(data.leads)
        calculateStats(data.leads)
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (leadsData: Lead[]) => {
    const newStats = {
      total: leadsData.length,
      new: leadsData.filter(lead => lead.status === 'new').length,
      contacted: leadsData.filter(lead => lead.status === 'contacted').length,
      interested: leadsData.filter(lead => lead.status === 'interested').length,
      totalValue: leadsData.reduce((sum, lead) => sum + (lead.property_value || 0), 0)
    }
    setStats(newStats)
  }

  const filterLeads = () => {
    let filtered = leads

    if (searchTerm) {
      filtered = filtered.filter(lead => 
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.includes(searchTerm) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter)
    }

    if (tierFilter !== 'all') {
      filtered = filtered.filter(lead => lead.tier === tierFilter)
    }

    setFilteredLeads(filtered)
  }

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: leadId,
          updates: { status: newStatus }
        })
      })

      if (response.ok) {
        const updatedLeads = leads.map(lead => 
          lead.id === leadId ? { ...lead, status: newStatus } : lead
        )
        setLeads(updatedLeads)
        calculateStats(updatedLeads)
        
        // Update modal if open
        if (selectedLead?.id === leadId) {
          setSelectedLead({ ...selectedLead, status: newStatus })
        }
      }
    } catch (error) {
      console.error('Error updating lead status:', error)
    }
  }

  const updateLeadNotes = async (leadId: string, newNotes: string) => {
    try {
      const response = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: leadId,
          updates: { notes: newNotes }
        })
      })

      if (response.ok) {
        const updatedLeads = leads.map(lead => 
          lead.id === leadId ? { ...lead, notes: newNotes } : lead
        )
        setLeads(updatedLeads)
        setEditingNotes(false)
      }
    } catch (error) {
      console.error('Error updating notes:', error)
    }
  }

  const openLeadModal = (lead: Lead) => {
    setSelectedLead(lead)
    setNotes(lead.notes || '')
    setShowModal(true)
  }

  const formatPropertyType = (type: string) => {
    if (!type) return 'Unknown'
    return type.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <AlertCircle className="w-4 h-4" />
      case 'contacted': return <Clock className="w-4 h-4" />
      case 'interested': return <CheckCircle className="w-4 h-4" />
      case 'not_interested': return <XCircle className="w-4 h-4" />
      case 'closed': return <CheckCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-slate-200/60">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Lead Management
              </h1>
              <p className="text-slate-600 text-sm font-medium mt-0.5">
                {stats.total} total leads • {stats.new} new • {stats.interested} interested
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 px-4 bg-white/50 hover:bg-slate-50 border-slate-200 transition-all duration-200"
                onClick={fetchLeads}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button 
                className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Lead
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Leads</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">New Leads</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Interested</p>
                  <p className="text-2xl font-bold text-green-600">{stats.interested}</p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Value</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalValue)}</p>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search leads by name, address, phone, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white/50 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-sm"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2.5 border border-slate-200 rounded-xl bg-white/50 focus:bg-white focus:border-blue-300 transition-all duration-200 text-sm min-w-[120px]"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="interested">Interested</option>
                  <option value="not_interested">Not Interested</option>
                  <option value="closed">Closed</option>
                </select>

                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="px-3 py-2.5 border border-slate-200 rounded-xl bg-white/50 focus:bg-white focus:border-blue-300 transition-all duration-200 text-sm min-w-[100px]"
                >
                  <option value="all">All Tiers</option>
                  <option value="Tier 1">Tier 1</option>
                  <option value="Tier 2">Tier 2</option>
                  <option value="Tier 3">Tier 3</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3 text-slate-600">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span className="font-medium">Loading leads...</span>
                </div>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No leads found</h3>
                <p className="text-slate-600 mb-4 max-w-sm">
                  {searchTerm || statusFilter !== 'all' || tierFilter !== 'all' 
                    ? 'Try adjusting your search or filters to find more leads.'
                    : 'Get started by adding your first lead to the CRM.'}
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Lead
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Lead</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Property</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Score</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Status</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Priority</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Date</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead, index) => (
                      <tr 
                        key={lead.id} 
                        className="border-b border-slate-100 hover:bg-slate-50/50 transition-all duration-200 cursor-pointer group"
                        onClick={() => openLeadModal(lead)}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {lead.name?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {lead.name || 'Unknown'}
                              </p>
                              <p className="text-sm text-slate-600">{lead.phone || 'No phone'}</p>
                              <p className="text-xs text-slate-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {lead.city}, {lead.state}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-slate-900">{formatPropertyType(lead.property_type)}</p>
                            <p className="text-sm text-slate-600">{lead.bedrooms} bed • {lead.bathrooms} bath</p>
                            <p className="text-sm font-semibold text-slate-700">
                              {formatCurrency(lead.property_value || 0)}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor((lead.final_score || 0) / 20) 
                                      ? 'text-yellow-400 fill-current' 
                                      : 'text-slate-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <Badge className={`${tierColors[lead.tier as keyof typeof tierColors] || 'bg-gray-50 text-gray-700 border-gray-200'} text-xs font-medium`}>
                              {lead.tier || 'Unknown'}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Score: {lead.final_score || 0}</p>
                        </td>
                        <td className="py-4 px-6">
                          <Badge className={`${statusColors[lead.status as keyof typeof statusColors] || 'bg-gray-50 text-gray-700 border-gray-200'} text-xs font-medium flex items-center gap-1 w-fit`}>
                            {getStatusIcon(lead.status)}
                            {lead.status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown'}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <Badge className={`${priorityColors[lead.priority as keyof typeof priorityColors] || 'bg-gray-50 text-gray-700 border-gray-200'} text-xs font-medium`}>
                            {lead.priority?.charAt(0).toUpperCase() + lead.priority?.slice(1) || 'Unknown'}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-slate-600">{formatDate(lead.created_at)}</p>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-3 text-xs"
                              onClick={(e) => {
                                e.stopPropagation()
                                openLeadModal(lead)
                              }}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lead Details Modal */}
      {showModal && selectedLead && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {selectedLead.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{selectedLead.name || 'Unknown Lead'}</h2>
                    <p className="text-slate-600">{selectedLead.address}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ×
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <Phone className="w-5 h-5 text-slate-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Phone</p>
                      <p className="text-slate-600">{selectedLead.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <Mail className="w-5 h-5 text-slate-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Email</p>
                      <p className="text-slate-600">{selectedLead.email || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Property Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-sm font-medium text-slate-900">Type</p>
                    <p className="text-slate-600">{formatPropertyType(selectedLead.property_type)}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-sm font-medium text-slate-900">Bedrooms</p>
                    <p className="text-slate-600">{selectedLead.bedrooms || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-sm font-medium text-slate-900">Bathrooms</p>
                    <p className="text-slate-600">{selectedLead.bathrooms || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-sm font-medium text-slate-900">Value</p>
                    <p className="text-slate-600 font-semibold">{formatCurrency(selectedLead.property_value || 0)}</p>
                  </div>
                </div>
              </div>

              {/* Lead Status */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Lead Status</h3>
                <div className="flex flex-wrap gap-3">
                  <select
                    value={selectedLead.status}
                    onChange={(e) => updateLeadStatus(selectedLead.id, e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="interested">Interested</option>
                    <option value="not_interested">Not Interested</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Notes</h3>
                {editingNotes ? (
                  <div className="space-y-3">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes about this lead..."
                      className="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none"
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateLeadNotes(selectedLead.id, notes)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Save Notes
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingNotes(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-slate-600 mb-3 p-3 bg-slate-50 rounded-xl min-h-[60px]">
                      {selectedLead.notes || 'No notes added yet.'}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingNotes(true)}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      {selectedLead.notes ? 'Edit Notes' : 'Add Notes'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}