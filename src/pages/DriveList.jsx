import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Search, 
  Calendar, 
  MapPin, 
  Users, 
  GraduationCap, 
  ArrowRight, 
  Filter, 
  ShieldCheck,
  Clock,
  Sparkles
} from 'lucide-react';
import { getActiveDrives } from '../services/driveService';
import { formatDate, formatTime } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';

export default function DriveList() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDegree, setSelectedDegree] = useState('ALL');

  useEffect(() => {
    getActiveDrives()
      .then((data) => setDrives(data || []))
      .catch(() => setDrives([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = drives.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.description?.toLowerCase().includes(search.toLowerCase()) ||
      d.organizer?.toLowerCase().includes(search.toLowerCase()) ||
      d.event_location?.toLowerCase().includes(search.toLowerCase());

    const acceptedDegrees = d.eligibility_rules?.accepted_degrees || [];
    const matchesDegree =
      selectedDegree === 'ALL' ||
      acceptedDegrees.length === 0 ||
      acceptedDegrees.includes(selectedDegree);

    return matchesSearch && matchesDegree;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Header */}
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Active Campus &amp; Off-Campus Opportunities</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Available Placement Drives
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Select an active drive below to review eligibility criteria, venue details, and register for your verified QR hall ticket.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="card-white rounded-2xl p-4 mb-8 border border-slate-200/90 flex flex-col sm:flex-row items-center gap-3 shadow-sm">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search drives by title, role, company, or venue..."
            className="w-full px-4 py-2.5 rounded-xl input-light text-xs sm:text-sm pl-10"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={selectedDegree}
            onChange={(e) => setSelectedDegree(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl input-light text-xs bg-white text-slate-700"
          >
            <option value="ALL">All Degrees / Open</option>
            <option value="BE / BTech">BE / BTech</option>
            <option value="BCA">BCA</option>
            <option value="MCA">MCA</option>
            <option value="BSc">BSc</option>
            <option value="MSc">MSc</option>
            <option value="MBA">MBA</option>
          </select>
        </div>
      </div>

      {/* Drives Grid */}
      {loading ? (
        <LoadingSpinner text="Retrieving available drives from database..." />
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center card-white rounded-3xl text-slate-500 max-w-md mx-auto shadow-sm">
          <p className="text-sm font-semibold text-slate-800 mb-1">No matching drives found</p>
          <p className="text-xs text-slate-500">Try adjusting your search keywords or degree filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((drive) => {
            const remaining = drive.capacity - (drive.registration_count || 0);
            const degrees = drive.eligibility_rules?.accepted_degrees || [];
            const years = drive.eligibility_rules?.accepted_passing_years || [];

            return (
              <div
                key={drive.id}
                className="card-white card-white-hover rounded-3xl p-6 border border-slate-200/90 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {drive.organizer || 'Techmiya'}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-emerald-600">
                      {remaining} seats left
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">
                    {drive.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                    {drive.description}
                  </p>

                  {/* Schedule Details */}
                  <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{formatDate(drive.event_date)} at {formatTime(drive.event_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{drive.event_location}</span>
                    </div>
                  </div>

                  {/* Eligibility tags */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-[11px] space-y-1.5">
                    <div className="text-slate-600">
                      <strong>Accepted:</strong> {degrees.length > 0 ? degrees.join(', ') : 'All degrees welcome'}
                    </div>
                    {years.length > 0 && (
                      <div className="text-slate-600">
                        <strong>Graduation Batch:</strong> {years.join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Link
                    to={`/register?drive=${drive.id}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
                  >
                    <span>Register for this Drive</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
