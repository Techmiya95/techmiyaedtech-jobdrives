import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Briefcase, 
  ShieldCheck, 
  Download, 
  Search, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ExternalLink, 
  LogOut, 
  Plus, 
  Filter, 
  RefreshCw, 
  AlertTriangle,
  X,
  Mail,
  Trash2,
  Calendar,
  Lock,
  Layers
} from 'lucide-react';
import { 
  getAdminRegistrations, 
  getResumeSignedUrl, 
  cancelRegistration, 
  getAuditLogs 
} from '../services/adminService';
import { getAllDrivesForAdmin, createDrive, updateDrive } from '../services/driveService';
import { checkInTicket } from '../services/ticketService';
import { formatDate } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('registrations'); // 'registrations' | 'drives' | 'checkin' | 'audit'
  const [registrations, setRegistrations] = useState([]);
  const [drives, setDrives] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters for registrations
  const [search, setSearch] = useState('');
  const [driveFilter, setDriveFilter] = useState('ALL');
  const [attendanceFilter, setAttendanceFilter] = useState('ALL');

  // Drive Creation Modal State
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [newDrive, setNewDrive] = useState({
    name: '',
    organizer: 'Techmiya EdTech',
    description: '',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 30 * 86400000).toISOString(),
    event_date: new Date(Date.now() + 15 * 86400000).toISOString(),
    event_location: 'Main Auditorium, Bengaluru',
    capacity: 150,
    accepted_degrees: 'BE / BTech, BCA, MCA',
    accepted_years: '2024, 2025, 2026',
    is_active: true,
  });

  // Fast check-in input
  const [checkInInput, setCheckInInput] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [regsData, drivesData, auditData] = await Promise.all([
        getAdminRegistrations(),
        getAllDrivesForAdmin(),
        getAuditLogs(),
      ]);
      setRegistrations(regsData || []);
      setDrives(drivesData || []);
      setAuditLogs(auditData || []);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Open Authorized Signed Resume Link
  const handleOpenResume = async (reg) => {
    try {
      toast.loading('Generating secure signed resume link...', { id: 'resume-link' });
      const signedUrl = await getResumeSignedUrl(reg.resume_path, reg.resume_base64);
      toast.dismiss('resume-link');
      window.open(signedUrl, '_blank');
    } catch (err) {
      toast.dismiss('resume-link');
      toast.error('Could not open resume');
    }
  };

  // Cancel Registration with recorded reason
  const handleCancelReg = async (ticketId) => {
    const reason = prompt('Please enter the reason for cancelling this registration:');
    if (!reason) return;

    try {
      await cancelRegistration(ticketId, reason);
      toast.success(`Cancelled registration ${ticketId}`);
      loadAllData();
    } catch (err) {
      toast.error('Failed to cancel registration');
    }
  };

  // Fast Check-In Handler
  const handleFastCheckIn = async (e) => {
    e.preventDefault();
    if (!checkInInput.trim()) return;
    setCheckingIn(true);
    try {
      const res = await checkInTicket(checkInInput.trim(), session?.email || 'Admin');
      toast.success(`Checked In: ${res.candidate_name} (${res.ticket_id})`);
      setCheckInInput('');
      loadAllData();
    } catch (err) {
      toast.error(err.message || 'Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  };

  // Create Drive Handler
  const handleCreateDriveSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: newDrive.name,
        organizer: newDrive.organizer,
        description: newDrive.description,
        start_date: newDrive.start_date,
        end_date: newDrive.end_date,
        event_date: newDrive.event_date,
        event_location: newDrive.event_location,
        capacity: Number(newDrive.capacity) || 100,
        eligibility_rules: {
          accepted_degrees: newDrive.accepted_degrees.split(',').map((s) => s.trim()).filter(Boolean),
          accepted_passing_years: newDrive.accepted_years.split(',').map((s) => s.trim()).filter(Boolean),
        },
        is_active: newDrive.is_active,
      };

      await createDrive(payload);
      toast.success('New Placement Drive created!');
      setIsDriveModalOpen(false);
      loadAllData();
    } catch (err) {
      toast.error(err.message || 'Failed to create drive');
    }
  };

  // Export CSV
  const exportCsv = () => {
    if (!filteredRegistrations.length) return;
    const headers = [
      'Ticket ID',
      'Candidate Name',
      'Email',
      'Phone',
      'Drive Name',
      'Degree',
      'Passing Year',
      'Techmiya Student',
      'Status',
      'Attendance',
      'Registered At',
    ];

    const rows = filteredRegistrations.map((r) => [
      `"${r.ticket_id}"`,
      `"${r.full_name}"`,
      `"${r.email}"`,
      `"${r.phone}"`,
      `"${r.drive_name}"`,
      `"${r.degree}"`,
      `"${r.passing_year}"`,
      `"${r.is_techmiya_student ? 'Yes' : 'No'}"`,
      `"${r.status}"`,
      `"${r.attendance}"`,
      `"${r.created_at}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Techmiya-Registrations-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exported candidate records to CSV');
  };

  // Filtered registrations
  const filteredRegistrations = registrations.filter((r) => {
    const matchesSearch =
      r.full_name.toLowerCase().includes(search.toLowerCase()) ||
      r.ticket_id.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search);

    const matchesDrive = driveFilter === 'ALL' || r.drive_id === driveFilter;
    const matchesAttendance =
      attendanceFilter === 'ALL' ||
      (attendanceFilter === 'PRESENT' && r.attendance === 'Present') ||
      (attendanceFilter === 'PENDING' && r.attendance !== 'Present');

    return matchesSearch && matchesDrive && matchesAttendance;
  });

  const totalRegistered = registrations.length;
  const totalPresent = registrations.filter((r) => r.attendance === 'Present').length;
  const totalDrives = drives.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 border border-blue-200 text-blue-700">
              Organizer &amp; Placement Console
            </span>
            <span className="text-xs text-slate-500">
              Direct access • Live candidate registrations &amp; drive controls
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5 tracking-tight">
            Candidate Roster &amp; Drive Management
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadAllData}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            title="Refresh records"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={exportCsv}
            disabled={!filteredRegistrations.length}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/25 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-8">
        <div className="card-white rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Registered</span>
          <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">{totalRegistered}</span>
        </div>

        <div className="card-white rounded-2xl p-4 border-l-4 border-l-emerald-500 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-emerald-600 block">Checked In (Present)</span>
          <span className="text-2xl font-black text-emerald-600 font-mono mt-1 block">{totalPresent}</span>
        </div>

        <div className="card-white rounded-2xl p-4 border-l-4 border-l-amber-500 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-amber-600 block">Pending Arrival</span>
          <span className="text-2xl font-black text-amber-600 font-mono mt-1 block">{totalRegistered - totalPresent}</span>
        </div>

        <div className="card-white rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Active Drives</span>
          <span className="text-2xl font-black text-blue-600 font-mono mt-1 block">{totalDrives}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('registrations')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'registrations'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Candidate Registrations ({filteredRegistrations.length})
        </button>

        <button
          onClick={() => setActiveTab('drives')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'drives'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Manage Drives ({drives.length})
        </button>

        <button
          onClick={() => setActiveTab('checkin')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'checkin'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Desk Check-In Scanner
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'audit'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Security Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: REGISTRATIONS TABLE */}
      {activeTab === 'registrations' && (
        <div className="space-y-4">
          {/* Search & Actions Bar */}
          <div className="card-white rounded-2xl p-4 border border-slate-200/90 flex flex-col md:flex-row items-center gap-3 shadow-sm">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ticket ID, student name, email, phone..."
                className="w-full px-4 py-2 rounded-xl input-light text-xs sm:text-sm pl-9"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={driveFilter}
                onChange={(e) => setDriveFilter(e.target.value)}
                className="px-3 py-2 rounded-xl input-light text-xs bg-white text-slate-700"
              >
                <option value="ALL">All Drives</option>
                {drives.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>

              <select
                value={attendanceFilter}
                onChange={(e) => setAttendanceFilter(e.target.value)}
                className="px-3 py-2 rounded-xl input-light text-xs bg-white text-slate-700"
              >
                <option value="ALL">All Status</option>
                <option value="PRESENT">Present</option>
                <option value="PENDING">Pending</option>
              </select>

              <button
                onClick={exportCsv}
                disabled={!filteredRegistrations.length}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="card-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">Ticket ID</th>
                    <th className="py-3.5 px-4 font-bold">Student Name</th>
                    <th className="py-3.5 px-4 font-bold">Drive &amp; Degree</th>
                    <th className="py-3.5 px-4 font-bold">Resume Document</th>
                    <th className="py-3.5 px-4 font-bold">Status</th>
                    <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-500">
                        <LoadingSpinner text="Loading candidate registrations..." />
                      </td>
                    </tr>
                  ) : filteredRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-500">
                        No registrations match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredRegistrations.map((reg) => {
                      const isPresent = reg.attendance === 'Present';
                      const isCancelled = reg.status === 'cancelled';
                      return (
                        <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                            {reg.ticket_id}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{reg.full_name}</div>
                            <div className="text-[11px] text-slate-500">{reg.email} • {reg.phone}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-slate-800 line-clamp-1">{reg.drive_name}</div>
                            <div className="text-[11px] text-slate-500">
                              {reg.degree} (Class of {reg.passing_year})
                            </div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <button
                              onClick={() => handleOpenResume(reg)}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
                              title="Generate secure short-lived signed URL"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>View Resume</span>
                              <ExternalLink className="w-3 h-3 opacity-60" />
                            </button>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {isCancelled ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                                CANCELLED
                              </span>
                            ) : isPresent ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
                                <CheckCircle2 className="w-3 h-3" /> PRESENT
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-fit">
                                <Clock className="w-3 h-3" /> PENDING
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {!isCancelled && !isPresent && (
                                <button
                                  onClick={async () => {
                                    try {
                                      await checkInTicket(reg.ticket_id, 'Admin');
                                      toast.success(`Marked ${reg.full_name} Present!`);
                                      loadAllData();
                                    } catch (e) {
                                      toast.error(e.message);
                                    }
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors shadow-sm"
                                >
                                  Check In
                                </button>
                              )}
                              {!isCancelled && (
                                <button
                                  onClick={() => handleCancelReg(reg.ticket_id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Cancel registration"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE DRIVES */}
      {activeTab === 'drives' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Placement Drives Configuration
            </h3>
            <button
              onClick={() => setIsDriveModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Drive</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drives.map((d) => (
              <div key={d.id} className="card-white card-white-hover rounded-3xl p-6 border border-slate-200/90 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      d.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {d.is_active ? 'ACTIVE' : 'ARCHIVED'}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      Cap: {d.registration_count || 0} / {d.capacity}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mb-1">{d.name}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4">{d.description}</p>

                  <div className="text-xs text-slate-600 space-y-1.5 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>{formatDate(d.event_date)}</span>
                    </div>
                    <div className="truncate text-slate-500">
                      {d.event_location}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={async () => {
                      try {
                        await updateDrive(d.id, { is_active: !d.is_active });
                        toast.success(`Drive status updated!`);
                        loadAllData();
                      } catch (e) {
                        toast.error(e.message);
                      }
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    {d.is_active ? 'Close Drive' : 'Reactivate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DESK CHECK-IN SCANNER */}
      {activeTab === 'checkin' && (
        <div className="max-w-xl mx-auto card-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-bold text-slate-900">Desk Check-In &amp; Attendance</h3>
            <p className="text-xs text-slate-500 mt-1">
              Enter candidate ticket ID or scan QR pass to mark attendance. Duplicate check-ins are strictly blocked.
            </p>
          </div>

          <form onSubmit={handleFastCheckIn} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Ticket ID / Token
              </label>
              <input
                type="text"
                value={checkInInput}
                onChange={(e) => setCheckInInput(e.target.value)}
                placeholder="e.g. TMI-2026-8F3A7C21"
                className="w-full px-4 py-3 rounded-xl input-light text-sm uppercase font-mono tracking-wider text-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={checkingIn}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
            >
              {checkingIn ? 'Verifying...' : 'Authorize & Check In Candidate'}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={() => navigate('/verify')}
              className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              <span>Or switch to camera scanner viewfinder</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="card-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-800 uppercase tracking-wider">
            Security &amp; Action Audit Trail
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No audit events recorded yet.</div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-blue-600 font-mono text-[11px] block">{log.action}</span>
                    <span className="text-slate-700">{log.target_type}: {log.target_id}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 text-[11px] block">Actor: {log.actor}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{log.timestamp || log.created_at}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CREATE DRIVE MODAL */}
      {isDriveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Create New Placement Drive</h3>
              <button onClick={() => setIsDriveModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDriveSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Drive Name</label>
                <input
                  type="text"
                  required
                  value={newDrive.name}
                  onChange={(e) => setNewDrive({ ...newDrive, name: e.target.value })}
                  placeholder="e.g. AI & Cloud Engineer Hiring Drive 2026"
                  className="w-full px-3 py-2 rounded-xl input-light bg-slate-50 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Organizer</label>
                <input
                  type="text"
                  required
                  value={newDrive.organizer}
                  onChange={(e) => setNewDrive({ ...newDrive, organizer: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl input-light bg-slate-50 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description</label>
                <textarea
                  value={newDrive.description}
                  onChange={(e) => setNewDrive({ ...newDrive, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl input-light bg-slate-50 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Max Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={newDrive.capacity}
                    onChange={(e) => setNewDrive({ ...newDrive, capacity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl input-light bg-slate-50 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Location / Venue</label>
                  <input
                    type="text"
                    value={newDrive.event_location}
                    onChange={(e) => setNewDrive({ ...newDrive, event_location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl input-light bg-slate-50 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Accepted Degrees (comma-separated)</label>
                <input
                  type="text"
                  value={newDrive.accepted_degrees}
                  onChange={(e) => setNewDrive({ ...newDrive, accepted_degrees: e.target.value })}
                  placeholder="BE / BTech, BCA, MCA, BSc"
                  className="w-full px-3 py-2 rounded-xl input-light bg-slate-50 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Accepted Passing Years</label>
                <input
                  type="text"
                  value={newDrive.accepted_years}
                  onChange={(e) => setNewDrive({ ...newDrive, accepted_years: e.target.value })}
                  placeholder="2024, 2025, 2026"
                  className="w-full px-3 py-2 rounded-xl input-light bg-slate-50 text-slate-800"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDriveModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20"
                >
                  Save &amp; Publish Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
