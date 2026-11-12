import React, { useEffect, useState } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Briefcase,
  GraduationCap,
  Code,
  Edit3,
  Save,
  Plus,
  Trash2,
  X,
  MapPin,
  Building,
  Phone,
  Mail,
  User,
  Calendar,
  Award,
  Globe,
} from 'lucide-react';
import { api } from '../lib/api';

export const MyResumePage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState<any>({
    fullName: '',
    headline: '',
    email: '',
    phone: '',
    country: 'India',
    currentLocation: '',
    yearsOfExperience: 0,
    skills: [],
    workHistory: [],
    education: [],
    projects: [],
  });

  // Skill input draft
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillYears, setNewSkillYears] = useState('2');
  const [newSkillLevel, setNewSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('intermediate');

  const fetchProfile = async () => {
    try {
      const res = await api.get('/profile');
      if (res.data?.profile) {
        setProfile(res.data.profile);
        initFormData(res.data.profile);
      }
    } catch (err) {
      console.error('Failed to fetch candidate profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const initFormData = (p: any) => {
    setFormData({
      fullName: p.fullName || '',
      headline: p.headline || '',
      email: p.email || '',
      phone: p.phone || '',
      country: p.country || 'India',
      currentLocation: p.currentLocation || '',
      yearsOfExperience: p.yearsOfExperience || 0,
      skills: Array.isArray(p.skills) ? [...p.skills] : [],
      workHistory: Array.isArray(p.workHistory) ? JSON.parse(JSON.stringify(p.workHistory)) : [],
      education: Array.isArray(p.education) ? JSON.parse(JSON.stringify(p.education)) : [],
      projects: Array.isArray(p.projects) ? JSON.parse(JSON.stringify(p.projects)) : [],
    });
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const body = new FormData();
    body.append('resume', file);

    setUploading(true);
    setUploadSuccess(null);
    setSaveSuccess(null);

    try {
      const res = await api.post('/profile/upload-resume', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const extracted = res.data.profile || res.data.extractedProfile;
      setUploadSuccess('Resume successfully parsed by AI! Review and edit your verified facts below.');
      if (extracted) {
        setProfile(extracted);
        initFormData(extracted);
        // Automatically open edit / review panel so the user can verify all details
        setIsEditing(true);
      } else {
        await fetchProfile();
      }
    } catch (err: any) {
      alert(`Upload error: ${err.response?.data?.message || err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveSuccess(null);

    try {
      const payload = {
        ...formData,
        yearsOfExperience: Number(formData.yearsOfExperience) || 0,
        preferences: profile?.preferences || {
          desiredJobTitles: [formData.headline || 'Software Engineer'],
          desiredCountries: [formData.country || 'India', 'United States'],
          workplaceType: 'remote',
          currency: formData.country === 'India' ? 'INR' : 'USD',
          employmentTypes: ['full_time'],
          noticePeriodDays: 30,
          workAuthorization: [`Authorized to work in ${formData.country || 'India'}`],
          preferredIndustries: [],
        },
      };

      const res = await api.post('/profile', payload);
      setProfile(res.data.profile);
      initFormData(res.data.profile);
      setIsEditing(false);
      setSaveSuccess('Candidate details and verified facts successfully saved & updated!');
      setTimeout(() => setSaveSuccess(null), 5000);
    } catch (err: any) {
      alert(`Error saving profile: ${err.response?.data?.message || err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Work History Helpers
  const handleAddWorkHistory = () => {
    setFormData((prev: any) => ({
      ...prev,
      workHistory: [
        {
          company: '',
          role: '',
          location: prev.currentLocation || '',
          startDate: '2023-01',
          endDate: 'Present',
          current: true,
          description: '',
          achievements: ['Delivered scalable features and improved system performance'],
          technologiesUsed: prev.skills?.slice(0, 3).map((s: any) => s.name) || [],
        },
        ...prev.workHistory,
      ],
    }));
  };

  const handleUpdateWorkHistory = (index: number, field: string, value: any) => {
    setFormData((prev: any) => {
      const copy = [...prev.workHistory];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, workHistory: copy };
    });
  };

  const handleRemoveWorkHistory = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      workHistory: prev.workHistory.filter((_: any, i: number) => i !== index),
    }));
  };

  // Education Helpers
  const handleAddEducation = () => {
    setFormData((prev: any) => ({
      ...prev,
      education: [
        {
          institution: '',
          degree: 'Bachelor of Technology',
          fieldOfStudy: 'Computer Science & Engineering',
          startDate: '2019',
          endDate: '2023',
          grade: 'First Class with Distinction',
        },
        ...prev.education,
      ],
    }));
  };

  const handleUpdateEducation = (index: number, field: string, value: any) => {
    setFormData((prev: any) => {
      const copy = [...prev.education];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, education: copy };
    });
  };

  const handleRemoveEducation = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      education: prev.education.filter((_: any, i: number) => i !== index),
    }));
  };

  // Skill Helpers
  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const newSkill = {
      name: newSkillName.trim(),
      yearsOfExperience: parseInt(newSkillYears, 10) || 1,
      level: newSkillLevel,
    };
    setFormData((prev: any) => ({
      ...prev,
      skills: [...prev.skills, newSkill],
    }));
    setNewSkillName('');
  };

  const handleRemoveSkill = (skillIndex: number) => {
    setFormData((prev: any) => ({
      ...prev,
      skills: prev.skills.filter((_: any, i: number) => i !== skillIndex),
    }));
  };

  // Projects Helpers
  const handleAddProject = () => {
    setFormData((prev: any) => ({
      ...prev,
      projects: [
        {
          name: '',
          description: '',
          role: 'Lead Developer',
          liveUrl: '',
          repoUrl: '',
          technologiesUsed: [],
        },
        ...prev.projects,
      ],
    }));
  };

  const handleUpdateProject = (index: number, field: string, value: any) => {
    setFormData((prev: any) => {
      const copy = [...prev.projects];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, projects: copy };
    });
  };

  const handleRemoveProject = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      projects: prev.projects.filter((_: any, i: number) => i !== index),
    }));
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span>Verified Candidate Profile & Resume</span>
            {profile?.isVerified && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Facts</span>
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Parsed facts are preserved strictly truthful. You can review, correct, and edit any detail (address, contact info, job history, education, skills) to guarantee 100% accuracy across automated applications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {profile && !isEditing && (
            <button
              onClick={() => {
                initFormData(profile);
                setIsEditing(true);
              }}
              className="btn btn-sm btn-outline border-slate-700 hover:border-slate-500 text-slate-200 hover:bg-slate-800 rounded-lg gap-2 text-xs font-semibold"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-400" />
              <span>Review & Edit Details</span>
            </button>
          )}

          {isEditing && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="btn btn-sm btn-ghost text-slate-400 hover:text-white rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="btn btn-sm btn-success bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-2 text-xs font-bold shadow-lg shadow-emerald-900/30"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving Changes...' : 'Save & Verify Facts'}</span>
              </button>
            </div>
          )}

          <label className="btn btn-sm btn-primary bg-blue-600 hover:bg-blue-700 text-white rounded-lg gap-2 text-xs font-semibold cursor-pointer shadow-lg shadow-blue-900/30">
            <Upload className={`w-3.5 h-3.5 ${uploading ? 'animate-bounce' : ''}`} />
            <span>{uploading ? 'Parsing with AI...' : 'Upload New Resume'}</span>
            <input type="file" accept=".pdf,.docx,.doc" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Notification Alerts */}
      {uploadSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between gap-2 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{uploadSuccess}</span>
          </div>
          <button onClick={() => setUploadSuccess(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800 text-blue-300 text-xs flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="font-medium">{saveSuccess}</span>
          </div>
          <button onClick={() => setSaveSuccess(null)} className="text-blue-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Completeness Card */}
      {profile?.completeness && !isEditing && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidate Profile Completeness</span>
              <h3 className="text-2xl font-black text-white mt-1">{profile.completeness.score}% Complete</h3>
            </div>
            <div className="w-48 bg-slate-800 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
              <div
                className="bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${profile.completeness.score}%` }}
              ></div>
            </div>
          </div>

          {profile.completeness.suggestions?.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1.5">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>AI Profile Improvement Suggestions:</span>
              </span>
              <ul className="list-disc list-inside text-slate-400 space-y-1">
                {profile.completeness.suggestions.map((sug: string, i: number) => (
                  <li key={i}>{sug}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT & REVIEW MODE FORM */}
      {/* ========================================================================= */}
      {isEditing && (
        <div className="space-y-8 bg-slate-900/70 p-6 sm:p-8 rounded-2xl border border-blue-500/30 shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white">Review & Edit Candidate Facts</h3>
            </div>
            <span className="text-xs text-slate-400">All fields below will be stored as truth for AI applications</span>
          </div>

          {/* Personal Info & Address */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>Personal Details & Location / Address</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Full Name *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="input input-sm input-bordered w-full bg-slate-950 text-white rounded-lg border-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Professional Headline *</label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="input input-sm input-bordered w-full bg-slate-950 text-white rounded-lg border-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. user@example.com"
                  className="input input-sm input-bordered w-full bg-slate-950 text-white rounded-lg border-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +91 9876543210"
                  className="input input-sm input-bordered w-full bg-slate-950 text-white rounded-lg border-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Current Address / Location *</label>
                <input
                  type="text"
                  value={formData.currentLocation}
                  onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                  placeholder="e.g. 12th Main Road, Indiranagar, Bengaluru, Karnataka 560038"
                  className="input input-sm input-bordered w-full bg-slate-950 text-white rounded-lg border-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Country *</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="e.g. India or United States"
                  className="input input-sm input-bordered w-full bg-slate-950 text-white rounded-lg border-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Total Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={formData.yearsOfExperience}
                  onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                  className="input input-sm input-bordered w-full bg-slate-950 text-white rounded-lg border-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Work History Section */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-4 h-4" />
                <span>Work Experience ({formData.workHistory.length})</span>
              </h4>
              <button
                type="button"
                onClick={handleAddWorkHistory}
                className="btn btn-xs btn-outline border-emerald-600 text-emerald-400 hover:bg-emerald-950 rounded-lg gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Position</span>
              </button>
            </div>

            <div className="space-y-4">
              {formData.workHistory.map((work: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-xs font-bold text-white">Experience #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveWorkHistory(idx)}
                      className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Job Title / Role</label>
                      <input
                        type="text"
                        value={work.role}
                        onChange={(e) => handleUpdateWorkHistory(idx, 'role', e.target.value)}
                        placeholder="e.g. Senior Backend Engineer"
                        className="input input-sm input-bordered w-full bg-slate-900 text-white rounded-lg border-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Company Name</label>
                      <input
                        type="text"
                        value={work.company}
                        onChange={(e) => handleUpdateWorkHistory(idx, 'company', e.target.value)}
                        placeholder="e.g. Acme Corp"
                        className="input input-sm input-bordered w-full bg-slate-900 text-white rounded-lg border-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Location / Address</label>
                      <input
                        type="text"
                        value={work.location || ''}
                        onChange={(e) => handleUpdateWorkHistory(idx, 'location', e.target.value)}
                        placeholder="e.g. Bengaluru / Remote"
                        className="input input-sm input-bordered w-full bg-slate-900 text-white rounded-lg border-slate-700"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">Start Date</label>
                        <input
                          type="text"
                          value={work.startDate || ''}
                          onChange={(e) => handleUpdateWorkHistory(idx, 'startDate', e.target.value)}
                          placeholder="2021-06"
                          className="input input-sm input-bordered w-full bg-slate-900 text-white rounded-lg border-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">End Date</label>
                        <input
                          type="text"
                          value={work.endDate || ''}
                          onChange={(e) => handleUpdateWorkHistory(idx, 'endDate', e.target.value)}
                          placeholder="Present"
                          className="input input-sm input-bordered w-full bg-slate-900 text-white rounded-lg border-slate-700"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 text-xs font-semibold">Role Summary & Responsibilities</label>
                    <textarea
                      value={work.description || ''}
                      onChange={(e) => handleUpdateWorkHistory(idx, 'description', e.target.value)}
                      rows={2}
                      placeholder="Describe primary responsibilities and impact..."
                      className="textarea textarea-bordered w-full bg-slate-900 text-white text-xs rounded-lg border-slate-700"
                    ></textarea>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education Section */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                <span>Education & Qualifications ({formData.education.length})</span>
              </h4>
              <button
                type="button"
                onClick={handleAddEducation}
                className="btn btn-xs btn-outline border-amber-600 text-amber-400 hover:bg-amber-950 rounded-lg gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Education</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.education.map((edu: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-xs font-bold text-white">Degree #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(idx)}
                      className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Institution / University</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => handleUpdateEducation(idx, 'institution', e.target.value)}
                        placeholder="e.g. University of California"
                        className="input input-sm input-bordered w-full bg-slate-900 text-white rounded-lg border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Degree</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleUpdateEducation(idx, 'degree', e.target.value)}
                        placeholder="e.g. B.Tech / Bachelor of Science"
                        className="input input-sm input-bordered w-full bg-slate-900 text-white rounded-lg border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Field of Study</label>
                      <input
                        type="text"
                        value={edu.fieldOfStudy}
                        onChange={(e) => handleUpdateEducation(idx, 'fieldOfStudy', e.target.value)}
                        placeholder="e.g. Computer Science"
                        className="input input-sm input-bordered w-full bg-slate-900 text-white rounded-lg border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Graduation Year / Grade</label>
                      <input
                        type="text"
                        value={edu.endDate || edu.grade || ''}
                        onChange={(e) => handleUpdateEducation(idx, 'endDate', e.target.value)}
                        placeholder="e.g. 2023 or 8.5 CGPA"
                        className="input input-sm input-bordered w-full bg-slate-900 text-white rounded-lg border-slate-700"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Section */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Code className="w-4 h-4" />
              <span>Technical Skills ({formData.skills.length})</span>
            </h4>

            {/* Add Skill Row */}
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Add skill (e.g. React, Node.js, Python, AWS)..."
                className="input input-sm input-bordered bg-slate-900 text-white rounded-lg border-slate-700 flex-1 min-w-[180px]"
              />
              <select
                value={newSkillYears}
                onChange={(e) => setNewSkillYears(e.target.value)}
                className="select select-sm select-bordered bg-slate-900 text-white rounded-lg border-slate-700 text-xs"
              >
                <option value="1">1 Year Exp</option>
                <option value="2">2 Years Exp</option>
                <option value="3">3 Years Exp</option>
                <option value="5">5+ Years Exp</option>
              </select>
              <select
                value={newSkillLevel}
                onChange={(e: any) => setNewSkillLevel(e.target.value)}
                className="select select-sm select-bordered bg-slate-900 text-white rounded-lg border-slate-700 text-xs"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
              <button
                type="button"
                onClick={handleAddSkill}
                className="btn btn-sm btn-primary bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Skill</span>
              </button>
            </div>

            {/* Render Skill Tags */}
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-mono"
                >
                  <span>{skill.name}</span>
                  {skill.yearsOfExperience && (
                    <span className="text-[10px] text-slate-500">({skill.yearsOfExperience}y)</span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(idx)}
                    className="text-slate-500 hover:text-rose-400 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Bar Bottom */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn btn-sm btn-ghost text-slate-400 hover:text-white rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={saving}
              className="btn btn-sm btn-success bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg gap-2 shadow-lg shadow-emerald-900/30"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save & Verify Facts'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE: VERIFIED FACTS */}
      {/* ========================================================================= */}
      {!isEditing && (
        <>
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-xs">Loading candidate profile...</div>
          ) : !profile ? (
            <div className="p-12 text-center text-slate-400 text-xs rounded-2xl border border-slate-800 bg-slate-900/30 space-y-3">
              <FileText className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="font-semibold text-slate-300">No candidate profile or resume uploaded yet.</p>
              <p className="text-slate-500 max-w-md mx-auto">
                Click &quot;Upload New Resume&quot; above to have our AI extract your verified facts, or click below to manually create your profile.
              </p>
              <button
                onClick={() => {
                  initFormData({});
                  setIsEditing(true);
                }}
                className="btn btn-xs btn-primary bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Create Profile Manually
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Personal info & Skills */}
              <div className="space-y-6">
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4 relative group">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidate Details</h3>
                    <button
                      onClick={() => {
                        initFormData(profile);
                        setIsEditing(true);
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 opacity-80 group-hover:opacity-100"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Full Name</span>
                      <p className="font-bold text-white text-base">{profile.fullName}</p>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[11px]">Headline</span>
                      <p className="font-medium text-slate-300">{profile.headline}</p>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[11px]">Email Address</span>
                      <p className="text-slate-300 flex items-center gap-1.5 font-mono">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span>{profile.email}</span>
                      </p>
                    </div>

                    {profile.phone && (
                      <div>
                        <span className="text-slate-500 block text-[11px]">Phone Number</span>
                        <p className="text-slate-300 flex items-center gap-1.5 font-mono">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{profile.phone}</span>
                        </p>
                      </div>
                    )}

                    <div>
                      <span className="text-slate-500 block text-[11px]">Current Location / Address</span>
                      <p className="text-slate-300 flex items-start gap-1.5 leading-relaxed">
                        <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span>{profile.currentLocation || 'Location not specified'}, {profile.country}</span>
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[11px]">Total Experience</span>
                      <p className="text-slate-300 font-bold">{profile.yearsOfExperience} Years</p>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3 relative group">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-blue-400" />
                      <span>Verified Skills ({profile.skills?.length || 0})</span>
                    </h3>
                    <button
                      onClick={() => {
                        initFormData(profile);
                        setIsEditing(true);
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 opacity-80 group-hover:opacity-100"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills?.map((skill: any, idx: number) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono shadow-sm"
                      >
                        {skill.name}
                        {skill.yearsOfExperience ? ` (${skill.yearsOfExperience}y)` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Work Experience & Education & Projects */}
              <div className="lg:col-span-2 space-y-6">
                {/* Work History */}
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4 relative group">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Verified Employment History ({profile.workHistory?.length || 0})</span>
                    </h3>
                    <button
                      onClick={() => {
                        initFormData(profile);
                        setIsEditing(true);
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 opacity-80 group-hover:opacity-100"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {profile.workHistory?.map((exp: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-white">{exp.role}</h4>
                          <span className="text-[11px] font-mono text-slate-400">
                            {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-blue-400 flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          <span>{exp.company}</span>
                          {exp.location && <span>• {exp.location}</span>}
                        </p>
                        {exp.description && (
                          <p className="text-xs text-slate-300 leading-relaxed">{exp.description}</p>
                        )}
                        {exp.achievements?.length > 0 && (
                          <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-1 pt-1">
                            {exp.achievements.map((ach: string, i: number) => (
                              <li key={i}>{ach}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4 relative group">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Education ({profile.education?.length || 0})</span>
                    </h3>
                    <button
                      onClick={() => {
                        initFormData(profile);
                        setIsEditing(true);
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 opacity-80 group-hover:opacity-100"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {profile.education?.map((edu: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs text-white">{edu.institution}</h4>
                          <span className="text-[11px] font-mono text-slate-400">
                            {edu.startDate ? `${edu.startDate} - ` : ''}{edu.endDate || 'Completed'}
                          </span>
                        </div>
                        <p className="text-xs text-amber-400 font-medium">
                          {edu.degree} in {edu.fieldOfStudy}
                        </p>
                        {edu.grade && <p className="text-[11px] text-slate-400 font-mono">Grade: {edu.grade}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Projects */}
                {profile.projects?.length > 0 && (
                  <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4 relative group">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span>Highlighted Projects ({profile.projects?.length})</span>
                      </h3>
                      <button
                        onClick={() => {
                          initFormData(profile);
                          setIsEditing(true);
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 opacity-80 group-hover:opacity-100"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {profile.projects?.map((proj: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                          <h4 className="font-bold text-xs text-white">{proj.name}</h4>
                          <p className="text-[11px] text-slate-400 line-clamp-3">{proj.description}</p>
                          <div className="flex flex-wrap gap-1 pt-1">
                            {proj.technologiesUsed?.slice(0, 4).map((tech: string, i: number) => (
                              <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
