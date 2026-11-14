import React, { useEffect, useState } from 'react';
import {
  UserCheck,
  Save,
  CheckCircle2,
  ShieldCheck,
  Plus,
  X,
  MapPin,
  Briefcase,
  GraduationCap,
  Code2,
  FolderGit2,
  Sliders,
  Trash2,
  Building,
  Globe,
  User,
  AlertCircle
} from 'lucide-react';
import { api } from '../lib/api';

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<any>({
    fullName: '',
    email: '',
    phone: '',
    country: 'United States',
    currentLocation: 'San Francisco, CA',
    headline: 'Senior Full Stack & AI Systems Engineer',
    yearsOfExperience: 5,
    skills: [],
    education: [],
    workHistory: [],
    projects: [],
    preferences: {
      desiredJobTitles: ['Senior Full Stack Engineer', 'Software Engineer', 'Backend AI Engineer'],
      desiredCountries: ['United States', 'Worldwide', 'Canada', 'India'],
      workplaceType: 'remote',
      minSalary: 120000,
      maxSalary: 160000,
      currency: 'USD',
      employmentTypes: ['full_time'],
      noticePeriodDays: 30,
      workAuthorization: ['Authorized to work for any employer', 'US Citizen'],
      preferredIndustries: ['SaaS', 'AI / Machine Learning', 'FinTech', 'Cloud Infrastructure'],
    },
    isVerified: true,
  });

  const [activeTab, setActiveTab] = useState<'personal' | 'experience' | 'education' | 'skills' | 'projects' | 'preferences'>('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Chip helpers
  const [newTitle, setNewTitle] = useState('');
  const [newCountry, setNewCountry] = useState('');
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('advanced');
  const [newSkillCategory, setNewSkillCategory] = useState('Frontend');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/profile');
        if (res.data.profile) {
          setProfile(res.data.profile);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await api.post('/profile/onboarding', profile);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      alert(`Error updating profile: ${err.response?.data?.message || err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Work History Helpers
  const addWorkExperience = () => {
    const newExp = {
      company: '',
      role: '',
      location: profile.currentLocation || '',
      startDate: '2022-01',
      endDate: 'Present',
      current: true,
      description: '',
      achievements: ['Delivered core project milestones and improved software quality.'],
      technologiesUsed: [],
    };
    setProfile({
      ...profile,
      workHistory: [...(profile.workHistory || []), newExp],
    });
  };

  const updateWorkExperience = (index: number, field: string, value: any) => {
    const updated = [...profile.workHistory];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'current' && value === true) {
      updated[index].endDate = 'Present';
    }
    setProfile({ ...profile, workHistory: updated });
  };

  const removeWorkExperience = (index: number) => {
    const updated = [...profile.workHistory];
    updated.splice(index, 1);
    setProfile({ ...profile, workHistory: updated });
  };

  const addAchievementBullet = (jobIndex: number) => {
    const updated = [...profile.workHistory];
    updated[jobIndex].achievements = [...(updated[jobIndex].achievements || []), ''];
    setProfile({ ...profile, workHistory: updated });
  };

  const updateAchievementBullet = (jobIndex: number, bulletIndex: number, value: string) => {
    const updated = [...profile.workHistory];
    updated[jobIndex].achievements[bulletIndex] = value;
    setProfile({ ...profile, workHistory: updated });
  };

  const removeAchievementBullet = (jobIndex: number, bulletIndex: number) => {
    const updated = [...profile.workHistory];
    updated[jobIndex].achievements.splice(bulletIndex, 1);
    setProfile({ ...profile, workHistory: updated });
  };

  // Education Helpers
  const addEducation = () => {
    const newEdu = {
      institution: '',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      startDate: '2018',
      endDate: '2022',
      grade: 'First Class',
    };
    setProfile({
      ...profile,
      education: [...(profile.education || []), newEdu],
    });
  };

  const updateEducation = (index: number, field: string, value: any) => {
    const updated = [...profile.education];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, education: updated });
  };

  const removeEducation = (index: number) => {
    const updated = [...profile.education];
    updated.splice(index, 1);
    setProfile({ ...profile, education: updated });
  };

  // Skills Helpers
  const addSkill = () => {
    if (!newSkillName.trim()) return;
    const exists = profile.skills?.some((s: any) => s.name.toLowerCase() === newSkillName.trim().toLowerCase());
    if (exists) {
      alert('Skill already exists');
      return;
    }
    setProfile({
      ...profile,
      skills: [
        ...(profile.skills || []),
        {
          name: newSkillName.trim(),
          level: newSkillLevel,
          category: newSkillCategory,
          yearsOfExperience: 3,
        },
      ],
    });
    setNewSkillName('');
  };

  const removeSkill = (index: number) => {
    const updated = [...profile.skills];
    updated.splice(index, 1);
    setProfile({ ...profile, skills: updated });
  };

  // Projects Helpers
  const addProject = () => {
    const newProj = {
      name: '',
      role: 'Lead Developer',
      description: '',
      liveUrl: '',
      repoUrl: '',
      technologiesUsed: [],
    };
    setProfile({
      ...profile,
      projects: [...(profile.projects || []), newProj],
    });
  };

  const updateProject = (index: number, field: string, value: any) => {
    const updated = [...profile.projects];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, projects: updated });
  };

  const removeProject = (index: number) => {
    const updated = [...profile.projects];
    updated.splice(index, 1);
    setProfile({ ...profile, projects: updated });
  };

  // Preferences Helpers
  const addDesiredTitle = () => {
    if (newTitle.trim()) {
      setProfile({
        ...profile,
        preferences: {
          ...profile.preferences,
          desiredJobTitles: [...(profile.preferences?.desiredJobTitles || []), newTitle.trim()],
        },
      });
      setNewTitle('');
    }
  };

  const removeDesiredTitle = (index: number) => {
    const updated = [...profile.preferences.desiredJobTitles];
    updated.splice(index, 1);
    setProfile({
      ...profile,
      preferences: { ...profile.preferences, desiredJobTitles: updated },
    });
  };

  const addDesiredCountry = () => {
    if (newCountry.trim()) {
      setProfile({
        ...profile,
        preferences: {
          ...profile.preferences,
          desiredCountries: [...(profile.preferences?.desiredCountries || []), newCountry.trim()],
        },
      });
      setNewCountry('');
    }
  };

  const removeDesiredCountry = (index: number) => {
    const updated = [...profile.preferences.desiredCountries];
    updated.splice(index, 1);
    setProfile({
      ...profile,
      preferences: { ...profile.preferences, desiredCountries: updated },
    });
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 text-xs">Loading candidate profile facts...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Candidate Facts & Job Search Profile</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified Facts Anchor</span>
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            These verified facts strictly govern every application answer, cover letter, and recruiter outreach generated by the AI agent.
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 font-semibold text-xs px-6 h-10 shadow-lg shadow-blue-600/20"
          >
            <Save className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} />
            <span>{saving ? 'Saving...' : 'Save & Verify Facts'}</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Profile facts and address updated & verified successfully!</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('personal')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'personal'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-white bg-slate-900/50'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Personal & Address</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('experience')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'experience'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-white bg-slate-900/50'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Work Experience ({profile.workHistory?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('education')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'education'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-white bg-slate-900/50'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Education ({profile.education?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('skills')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'skills'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-white bg-slate-900/50'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Skills ({profile.skills?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('projects')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'projects'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-white bg-slate-900/50'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>Projects ({profile.projects?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'preferences'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-white bg-slate-900/50'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Search Preferences</span>
        </button>
      </div>

      {/* TAB 1: Personal & Address Information */}
      {activeTab === 'personal' && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Primary Candidate Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Full Legal Name</label>
              <input
                type="text"
                required
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Professional Headline</label>
              <input
                type="text"
                required
                value={profile.headline}
                onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Email Address</label>
              <input
                type="email"
                required
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Phone Number</label>
              <input
                type="text"
                required
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
              />
            </div>

            {/* Prominent Address / Current Location */}
            <div className="sm:col-span-2 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white text-xs">Address & Physical Location</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">
                    Current Location / Street Address <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.currentLocation}
                    onChange={(e) => setProfile({ ...profile, currentLocation: e.target.value })}
                    placeholder="e.g. Flat 402, Sector 62, Noida or 450 Mission St, San Francisco, CA"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-medium"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Used to evaluate commute, timezone compatibility, and regional job filters.</p>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Country</label>
                  <input
                    type="text"
                    required
                    value={profile.country}
                    onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                    placeholder="e.g. United States or India"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-medium"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Years of Experience</label>
              <input
                type="number"
                required
                value={profile.yearsOfExperience}
                onChange={(e) => setProfile({ ...profile, yearsOfExperience: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Work Experience */}
      {activeTab === 'experience' && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Employment History</h3>
            <button
              type="button"
              onClick={addWorkExperience}
              className="btn btn-xs btn-outline border-blue-500/40 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Work Experience</span>
            </button>
          </div>

          {profile.workHistory?.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
              No work experience entries yet. Click "Add Work Experience" above.
            </div>
          ) : (
            <div className="space-y-4">
              {profile.workHistory?.map((job: any, index: number) => (
                <div key={index} className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5" />
                      <span>Experience #{index + 1}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeWorkExperience(index)}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 p-1 hover:bg-rose-500/10 rounded-md"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">Company Name</label>
                      <input
                        type="text"
                        value={job.company}
                        onChange={(e) => updateWorkExperience(index, 'company', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Job Title / Role</label>
                      <input
                        type="text"
                        value={job.role}
                        onChange={(e) => updateWorkExperience(index, 'role', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Location</label>
                      <input
                        type="text"
                        value={job.location || ''}
                        onChange={(e) => updateWorkExperience(index, 'location', e.target.value)}
                        placeholder="e.g. San Francisco, CA or Remote"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className="block text-slate-400 mb-1">Start Date</label>
                        <input
                          type="text"
                          value={job.startDate}
                          onChange={(e) => updateWorkExperience(index, 'startDate', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-slate-400 mb-1">End Date</label>
                        <input
                          type="text"
                          disabled={job.current}
                          value={job.current ? 'Present' : job.endDate || ''}
                          onChange={(e) => updateWorkExperience(index, 'endDate', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id={`profile-current-${index}`}
                        checked={job.current || false}
                        onChange={(e) => updateWorkExperience(index, 'current', e.target.checked)}
                        className="rounded border-slate-700 bg-slate-900 text-blue-600"
                      />
                      <label htmlFor={`profile-current-${index}`} className="text-slate-300 text-xs cursor-pointer">
                        I currently work in this role
                      </label>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-400 mb-1">Role Description / Summary</label>
                      <textarea
                        rows={2}
                        value={job.description}
                        onChange={(e) => updateWorkExperience(index, 'description', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 text-xs"
                      />
                    </div>

                    {/* Achievements Bullets */}
                    <div className="sm:col-span-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-slate-400 text-xs font-semibold">
                          Key Achievements & Bullet Points
                        </label>
                        <button
                          type="button"
                          onClick={() => addAchievementBullet(index)}
                          className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Bullet Point</span>
                        </button>
                      </div>

                      {job.achievements?.map((bullet: string, bIndex: number) => (
                        <div key={bIndex} className="flex items-center gap-2">
                          <span className="text-blue-500 font-bold">•</span>
                          <input
                            type="text"
                            value={bullet}
                            onChange={(e) => updateAchievementBullet(index, bIndex, e.target.value)}
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => removeAchievementBullet(index, bIndex)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Education */}
      {activeTab === 'education' && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Education & Credentials</h3>
            <button
              type="button"
              onClick={addEducation}
              className="btn btn-xs btn-outline border-blue-500/40 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Education</span>
            </button>
          </div>

          {profile.education?.map((edu: any, index: number) => (
            <div key={index} className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Education #{index + 1}</span>
                </span>
                <button
                  type="button"
                  onClick={() => removeEducation(index)}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 p-1 hover:bg-rose-500/10 rounded-md"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Institution / University</label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Degree</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Field of Study</label>
                  <input
                    type="text"
                    value={edu.fieldOfStudy}
                    onChange={(e) => updateEducation(index, 'fieldOfStudy', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="block text-slate-400 mb-1">Graduation Year / End Date</label>
                    <input
                      type="text"
                      value={edu.endDate || ''}
                      onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-slate-400 mb-1">Grade / GPA</label>
                    <input
                      type="text"
                      value={edu.grade || ''}
                      onChange={(e) => updateEducation(index, 'grade', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: Skills */}
      {activeTab === 'skills' && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Technical Skills</h3>
          </div>

          {/* Add Skill Bar */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-[11px] text-slate-400 mb-1">Skill Name</label>
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="e.g. Docker, GraphQL, Kubernetes"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
              />
            </div>

            <div className="w-36">
              <label className="block text-[11px] text-slate-400 mb-1">Level</label>
              <select
                value={newSkillLevel}
                onChange={(e: any) => setNewSkillLevel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <div className="w-36">
              <label className="block text-[11px] text-slate-400 mb-1">Category</label>
              <select
                value={newSkillCategory}
                onChange={(e) => setNewSkillCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
              >
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Language">Language</option>
                <option value="Database">Database</option>
                <option value="DevOps">DevOps</option>
                <option value="Cloud">Cloud</option>
                <option value="AI">AI / ML</option>
              </select>
            </div>

            <div className="pt-5">
              <button
                type="button"
                onClick={addSkill}
                className="btn btn-sm btn-primary bg-blue-600 hover:bg-blue-700 text-white rounded-lg gap-1.5 text-xs h-9"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Skill</span>
              </button>
            </div>
          </div>

          {/* Skill Chips */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40">
            <div className="flex flex-wrap gap-2">
              {profile.skills?.map((skill: any, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
                >
                  <span className="font-semibold">{skill.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 capitalize">
                    {skill.level || 'advanced'}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="text-slate-500 hover:text-rose-400 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Projects */}
      {activeTab === 'projects' && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Featured Projects</h3>
            <button
              type="button"
              onClick={addProject}
              className="btn btn-xs btn-outline border-blue-500/40 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Project</span>
            </button>
          </div>

          {profile.projects?.map((proj: any, index: number) => (
            <div key={index} className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                  <FolderGit2 className="w-3.5 h-3.5" />
                  <span>Project #{index + 1}</span>
                </span>
                <button
                  type="button"
                  onClick={() => removeProject(index)}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 p-1 hover:bg-rose-500/10 rounded-md"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Project Name</label>
                  <input
                    type="text"
                    value={proj.name}
                    onChange={(e) => updateProject(index, 'name', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Role</label>
                  <input
                    type="text"
                    value={proj.role || ''}
                    onChange={(e) => updateProject(index, 'role', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={proj.description}
                    onChange={(e) => updateProject(index, 'description', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Live URL (optional)</label>
                  <input
                    type="text"
                    value={proj.liveUrl || ''}
                    onChange={(e) => updateProject(index, 'liveUrl', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Repository URL (optional)</label>
                  <input
                    type="text"
                    value={proj.repoUrl || ''}
                    onChange={(e) => updateProject(index, 'repoUrl', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 6: Preferences & Eligibility */}
      {activeTab === 'preferences' && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Search Preferences & Compensation</h3>
          </div>

          {/* Desired Titles Chips */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">Target Job Titles</label>
            <div className="flex flex-wrap gap-1.5">
              {profile.preferences?.desiredJobTitles?.map((title: string, i: number) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30"
                >
                  <span>{title}</span>
                  <button type="button" onClick={() => removeDesiredTitle(i)} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Add another target title (e.g. Lead Architect)..."
                className="w-64 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
              />
              <button
                type="button"
                onClick={addDesiredTitle}
                className="btn btn-xs btn-outline border-slate-700 text-slate-300 h-8 px-3 rounded-lg"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Target Countries Chips */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">Target Countries / Regions</label>
            <div className="flex flex-wrap gap-1.5">
              {profile.preferences?.desiredCountries?.map((country: string, i: number) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                >
                  <Globe className="w-3 h-3" />
                  <span>{country}</span>
                  <button type="button" onClick={() => removeDesiredCountry(i)} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newCountry}
                onChange={(e) => setNewCountry(e.target.value)}
                placeholder="Add country (e.g. India, United Kingdom)..."
                className="w-64 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
              />
              <button
                type="button"
                onClick={addDesiredCountry}
                className="btn btn-xs btn-outline border-slate-700 text-slate-300 h-8 px-3 rounded-lg"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Workplace Preference</label>
              <select
                value={profile.preferences?.workplaceType}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    preferences: { ...profile.preferences, workplaceType: e.target.value },
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
              >
                <option value="remote">100% Remote Only</option>
                <option value="hybrid">Hybrid Flexible</option>
                <option value="onsite">On-Site</option>
                <option value="any">Any / Open</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Minimum Base Salary</label>
              <input
                type="number"
                value={profile.preferences?.minSalary || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    preferences: { ...profile.preferences, minSalary: parseInt(e.target.value, 10) },
                  })
                }
                placeholder="e.g. 130000"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Notice Period (Days)</label>
              <input
                type="number"
                value={profile.preferences?.noticePeriodDays || 30}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    preferences: { ...profile.preferences, noticePeriodDays: parseInt(e.target.value, 10) },
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* Floating Save Actions */}
      <div className="flex justify-end pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={() => handleSave()}
          disabled={saving}
          className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 font-semibold px-8 h-11 shadow-lg shadow-blue-600/30"
        >
          <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
          <span>{saving ? 'Saving...' : 'Save & Lock Facts'}</span>
        </button>
      </div>
    </div>
  );
};
