import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Download, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ExternalLink, 
  Filter, 
  RefreshCw, 
  ShieldCheck, 
  GraduationCap,
  Building2,
  Check
} from 'lucide-react';
import { getAllCandidates, markAttendance } from '../api/api';
import toast from 'react-hot-toast';

export default function Admin() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllCandidates();
      if (res.success && res.candidates) {
        setCandidates(res.candidates);
      }
    } catch (err) {
      toast.error('Failed to load candidate list');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
    toast.success('Roster refreshed');
  };

  const handleToggleAttendance = async (candidate) => {
    if (candidate.attendance === 'Present') {
      toast('Candidate is already marked Present', { icon: 'ℹ️' });
      return;
    }
    try {
      await markAttendance(candidate.id);
      toast.success(`Marked ${candidate.fullName} as Present!`);
      // Update local state
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidate.id
            ? { ...c, attendance: 'Present', checkInTime: new Date().toLocaleTimeString() }
            : c
        )
      );
    } catch (err) {
      toast.error('Failed to update attendance');
    }
  };

  // CSV Export
  const exportCsv = () => {
    if (!candidates.length) return;
    const headers = [
      'Registration ID',
      'Full Name',
      'Email',
      'Phone',
      'College',
      'Degree & Branch',
      'Passing Year',
      'CGPA',
      'Primary Skill',
      'Attendance',
      'Check-in Time',
      'Registered At',
    ];

    const rows = candidates.map((c) => [
      `"${c.id}"`,
      `"${c.fullName}"`,
      `"${c.email}"`,
      `"${c.phone}"`,
      `"${c.college}"`,
      `"${c.degreeBranch}"`,
      `"${c.passingYear}"`,
      `"${c.cgpa}"`,
      `"${c.primarySkill}"`,
      `"${c.attendance || 'Pending'}"`,
      `"${c.checkInTime || ''}"`,
      `"${c.registeredAt || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Techmiya-Job-Drive-Candidates-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exported candidate roster CSV');
  };

  // Filter candidates
  const filtered = candidates.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.college.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.degreeBranch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.primarySkill && c.primarySkill.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.phone.includes(searchTerm);

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PRESENT' && c.attendance === 'Present') ||
      (statusFilter === 'PENDING' && c.attendance !== 'Present');

    const matchesYear = yearFilter === 'ALL' || c.passingYear === yearFilter;

    return matchesSearch && matchesStatus && matchesYear;
  });

  const totalCount = candidates.length;
  const presentCount = candidates.filter((c) => c.attendance === 'Present').length;
  const pendingCount = totalCount - presentCount;
  const collegesCount = new Set(candidates.map((c) => c.college)).size;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Placement Desk Admin Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Candidate Roster &amp; Attendance
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time candidate registrations, check-in statuses, and resume links.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={exportCsv}
            disabled={!candidates.length}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all hover:scale-105"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="glass-panel rounded-2xl p-4">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Registered</span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">{totalCount}</span>
        </div>

        <div className="glass-panel rounded-2xl p-4 border-l-4 border-l-emerald-500">
          <span className="text-[10px] uppercase font-bold text-emerald-400 block">Present / Checked In</span>
          <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">{presentCount}</span>
        </div>

        <div className="glass-panel rounded-2xl p-4 border-l-4 border-l-amber-500">
          <span className="text-[10px] uppercase font-bold text-amber-400 block">Pending Check-In</span>
          <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">{pendingCount}</span>
        </div>

        <div className="glass-panel rounded-2xl p-4">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Colleges Represented</span>
          <span className="text-2xl font-black text-indigo-300 font-mono mt-1 block">{collegesCount}</span>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="glass-panel rounded-2xl p-4 mb-6 border border-white/10 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search candidate name, ID, college, branch, skill, or phone..."
            className="w-full px-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm pl-10"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl glass-input text-xs bg-slate-900 text-slate-200"
          >
            <option value="ALL">All Status</option>
            <option value="PRESENT">Present (Checked In)</option>
            <option value="PENDING">Pending Check-In</option>
          </select>

          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl glass-input text-xs bg-slate-900 text-slate-200"
          >
            <option value="ALL">All Batches</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Pass ID</th>
                <th className="py-3.5 px-4 font-semibold">Candidate</th>
                <th className="py-3.5 px-4 font-semibold">College &amp; Branch</th>
                <th className="py-3.5 px-4 font-semibold">Batch &amp; CGPA</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    Loading candidates roster...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No candidates found matching the criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((cand) => {
                  const isPresent = cand.attendance === 'Present';
                  return (
                    <tr key={cand.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-400 whitespace-nowrap">
                        <Link to={`/verify/${cand.id}`} className="hover:underline">
                          {cand.id}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{cand.fullName}</div>
                        <div className="text-[11px] text-slate-400">{cand.email} • {cand.phone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-200 line-clamp-1">{cand.college}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{cand.degreeBranch}</div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-medium text-slate-300">Class of {cand.passingYear}</span>
                        <div className="text-[11px] text-indigo-400 font-semibold">{cand.cgpa}</div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isPresent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[10px]">
                            <CheckCircle2 className="w-3 h-3" /> PRESENT
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-[10px]">
                            <Clock className="w-3 h-3" /> PENDING
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {!isPresent ? (
                            <button
                              onClick={() => handleToggleAttendance(cand)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-colors"
                              title="Mark candidate present"
                            >
                              Check In
                            </button>
                          ) : (
                            <span className="text-[11px] text-emerald-400 font-medium">Checked In</span>
                          )}
                          <Link
                            to={`/verify/${cand.id}`}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="View verification profile"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
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
  );
}
