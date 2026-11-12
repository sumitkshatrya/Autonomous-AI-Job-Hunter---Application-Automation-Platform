import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  User,
  Briefcase,
  GraduationCap,
  Code2,
  FolderGit2,
  Sliders,
  MapPin,
  Plus,
  Trash2,
  X,
  AlertCircle,
  Building,
  Calendar,
  Globe,
  Award
} from 'lucide-react';
import { api } from '../lib/api';

export const OnboardingWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [reviewTab, setReviewTab] = useState<'personal' | 'experience' | 'education' | 'skills' | 'projects' | 'preferences'>('personal');

  // Input helpers for adding chips
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('advanced');
  const [newSkillCategory, setNewSkillCategory] = useState('Frontend');
  const [newTitle, setNewTitle] = useState('');
  const [newCountry, setNewCountry] = useState('');

  const [parsedProfile, setParsedProfile] = useState<any>({
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+1 (555) 234-5678',
    country: 'United States',
    currentLocation: 'San Francisco, CA',
    headline: 'Senior Full Stack & AI Systems Engineer',
    yearsOfExperience: 5,
    skills: [
      { name: 'TypeScript', level: 'advanced', category: 'Language', yearsOfExperience: 5 },
      { name: 'React', level: 'advanced', category: 'Frontend', yearsOfExperience: 5 },
      { name: 'Node.js', level: 'advanced', category: 'Backend', yearsOfExperience: 5 },
      { name: 'MongoDB', level: 'intermediate', category: 'Database', yearsOfExperience: 3 },
      { name: 'Docker', level: 'intermediate', category: 'DevOps', yearsOfExperience: 3 },
    ],
    education: [
      {
        institution: 'Columbia University',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        startDate: '2016',
        endDate: '2020',
        grade: '3.9 GPA',
      },
    ],
    workHistory: [
      {
        company: 'Vanguard Systems',
        role: 'Full Stack Engineer',
        location: 'San Francisco, CA',
        startDate: '2020-07',
        endDate: 'Present',
        current: true,
        description: 'Engineered cloud microservices and responsive web applications.',
        achievements: [
          'Increased system availability to 99.99% through automated failover and containerization',
          'Reduced API response times by 45% via Redis caching and optimized database indexes',
        ],
        technologiesUsed: ['TypeScript', 'React', 'Node.js', 'MongoDB', 'Docker'],
      },
    ],
    projects: [
      {
        name: 'AutoApply AI Platform',
        description: 'Autonomous job hunting engine with ATS adapters and real-time email intelligence.',
        role: 'Lead Architect',
        liveUrl: 'https://autoapply.ai',
        repoUrl: 'https://github.com/autoapply/autoapply-ai',
        technologiesUsed: ['TypeScript', 'Node.js', 'React', 'MongoDB'],
      },
    ],
    preferences: {
      desiredJobTitles: ['Senior Full Stack Engineer', 'Lead Frontend Engineer', 'Software Engineer'],
      desiredCountries: ['United States', 'Worldwide', 'Canada', 'India'],
      workplaceType: 'remote',
      minSalary: 135000,
      maxSalary: 175000,
      currency: 'USD',
      employmentTypes: ['full_time'],
      noticePeriodDays: 30,
      workAuthorization: ['Authorized to work in country of residence', 'Open to Remote'],
      preferredIndustries: ['SaaS', 'Cloud', 'AI', 'FinTech'],
    },
    isVerified: true,
  });

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    try {
      const res = await api.post('/profile/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.extractedProfile) {
        setParsedProfile((prev: any) => ({
          ...prev,
          ...res.data.extractedProfile,
          preferences: prev.preferences,
        }));
      }
      setStep(2); // Jump directly to Review & Fact Verification Step
      setReviewTab('personal');
    } catch (err: any) {
      alert(`Resume upload notification: ${err.response?.data?.message || err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    try {
      await api.post('/profile/onboarding', parsedProfile);
      // Trigger initial discovery and matching in background
      await api.post('/jobs/discover');
      await api.post('/matching/evaluate');
      navigate('/');
    } catch (err: any) {
      alert(`Error saving onboarding: ${err.message}`);
    }
  };

  // Work History Helpers
  const addWorkExperience = () => {
    const newExp = {
      company: '',
      role: '',
      location: parsedProfile.currentLocation || '',
      startDate: '2022-01',
      endDate: 'Present',
      current: true,
      description: '',
      achievements: ['Delivered core project milestones and improved software quality.'],
      technologiesUsed: [],
    };
    setParsedProfile({
      ...parsedProfile,
      workHistory: [...parsedProfile.workHistory, newExp],
    });
  };

  const updateWorkExperience = (index: number, field: string, value: any) => {
    const updated = [...parsedProfile.workHistory];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'current' && value === true) {
      updated[index].endDate = 'Present';
    }
    setParsedProfile({ ...parsedProfile, workHistory: updated });
  };

  const removeWorkExperience = (index: number) => {
    const updated = [...parsedProfile.workHistory];
    updated.splice(index, 1);
    setParsedProfile({ ...parsedProfile, workHistory: updated });
  };

  const addAchievementBullet = (jobIndex: number) => {
    const updated = [...parsedProfile.workHistory];
    updated[jobIndex].achievements = [...(updated[jobIndex].achievements || []), ''];
    setParsedProfile({ ...parsedProfile, workHistory: updated });
  };

  const updateAchievementBullet = (jobIndex: number, bulletIndex: number, value: string) => {
    const updated = [...parsedProfile.workHistory];
    updated[jobIndex].achievements[bulletIndex] = value;
    setParsedProfile({ ...parsedProfile, workHistory: updated });
  };

  const removeAchievementBullet = (jobIndex: number, bulletIndex: number) => {
    const updated = [...parsedProfile.workHistory];
    updated[jobIndex].achievements.splice(bulletIndex, 1);
    setParsedProfile({ ...parsedProfile, workHistory: updated });
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
    setParsedProfile({
      ...parsedProfile,
      education: [...parsedProfile.education, newEdu],
    });
  };

  const updateEducation = (index: number, field: string, value: any) => {
    const updated = [...parsedProfile.education];
    updated[index] = { ...updated[index], [field]: value };
    setParsedProfile({ ...parsedProfile, education: updated });
  };

  const removeEducation = (index: number) => {
    const updated = [...parsedProfile.education];
    updated.splice(index, 1);
    setParsedProfile({ ...parsedProfile, education: updated });
  };

  // Skills Helpers
  const addSkill = () => {
    if (!newSkillName.trim()) return;
    const exists = parsedProfile.skills.some((s: any) => s.name.toLowerCase() === newSkillName.trim().toLowerCase());
    if (exists) {
      alert('Skill already exists');
      return;
    }
    setParsedProfile({
      ...parsedProfile,
      skills: [
        ...parsedProfile.skills,
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
    const updated = [...parsedProfile.skills];
    updated.splice(index, 1);
    setParsedProfile({ ...parsedProfile, skills: updated });
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
    setParsedProfile({
      ...parsedProfile,
      projects: [...parsedProfile.projects, newProj],
    });
  };

  const updateProject = (index: number, field: string, value: any) => {
    const updated = [...parsedProfile.projects];
    updated[index] = { ...updated[index], [field]: value };
    setParsedProfile({ ...parsedProfile, projects: updated });
  };

  const removeProject = (index: number) => {
    const updated = [...parsedProfile.projects];
    updated.splice(index, 1);
    setParsedProfile({ ...parsedProfile, projects: updated });
  };

  // Preferences Helpers
  const addDesiredTitle = () => {
    if (newTitle.trim()) {
      setParsedProfile({
        ...parsedProfile,
        preferences: {
          ...parsedProfile.preferences,
          desiredJobTitles: [...parsedProfile.preferences.desiredJobTitles, newTitle.trim()],
        },
      });
      setNewTitle('');
    }
  };

  const removeDesiredTitle = (index: number) => {
    const updated = [...parsedProfile.preferences.desiredJobTitles];
    updated.splice(index, 1);
    setParsedProfile({
      ...parsedProfile,
      preferences: { ...parsedProfile.preferences, desiredJobTitles: updated },
    });
  };

  const addDesiredCountry = () => {
    if (newCountry.trim()) {
      setParsedProfile({
        ...parsedProfile,
        preferences: {
          ...parsedProfile.preferences,
          desiredCountries: [...parsedProfile.preferences.desiredCountries, newCountry.trim()],
        },
      });
      setNewCountry('');
    }
  };

  const removeDesiredCountry = (index: number) => {
    const updated = [...parsedProfile.preferences.desiredCountries];
    updated.splice(index, 1);
    setParsedProfile({
      ...parsedProfile,
      preferences: { ...parsedProfile.preferences, desiredCountries: updated },
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] flex flex-col justify-center items-center p-4 sm:p-8">
      <div className="w-full max-w-4xl space-y-6">
        {/* Progress Tracker */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              1
            </span>
            <span className="text-xs font-semibold text-slate-300">Resume Ingestion</span>
          </div>
          <div className="h-[1px] w-12 bg-slate-800"></div>
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              2
            </span>
            <span className="text-xs font-semibold text-slate-300">Review & Edit Facts</span>
          </div>
          <div className="h-[1px] w-12 bg-slate-800"></div>
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              3
            </span>
            <span className="text-xs font-semibold text-slate-300">Autonomous Setup</span>
          </div>
        </div>

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="p-8 rounded-3xl border border-slate-800 bg-[#0d121f] text-center space-y-6">
            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-xl font-bold text-white">Upload Your Resume (PDF / DOCX)</h2>
              <p className="text-xs text-slate-400">
                AutoApply AI parses your contact details, exact address/location, work history, education, skills, and projects. You will review and edit every single detail in the next step before autonomous applications begin.
              </p>
            </div>

            <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-8 max-w-md mx-auto cursor-pointer transition-colors bg-slate-950/40">
              <Upload className={`w-10 h-10 mx-auto text-blue-500 mb-3 ${uploading ? 'animate-bounce' : ''}`} />
              <p className="text-sm font-bold text-slate-200">
                {uploading ? 'Reading & Extracting Resume Facts...' : 'Drag & drop or choose file'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">PDF, DOCX, DOC up to 10MB</p>
              <input type="file" accept=".pdf,.docx,.doc" onChange={handleResumeUpload} className="hidden" id="resume-input" />
              <label htmlFor="resume-input" className="btn btn-sm btn-outline border-slate-700 text-slate-300 mt-4 rounded-xl cursor-pointer">
                Browse Files
              </label>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-slate-500 hover:text-slate-300 underline"
              >
                Or proceed directly to Manual Review & Profile Editor →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Comprehensive Review & Edit Section */}
        {step === 2 && (
          <div className="p-6 sm:p-8 rounded-3xl border border-slate-800 bg-[#0d121f] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Review & Edit Extracted Facts</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Fact Verification Anchor</span>
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Please inspect every extracted field below. You can freely edit or correct your address, role titles, dates, companies, education, skills, and preferences.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn btn-sm btn-primary bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 font-semibold text-xs px-4"
                >
                  <span>Confirm Facts & Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Sub-tab Navigation */}
            <div className="flex flex-wrap gap-1.5 border-b border-slate-800 pb-3">
              <button
                type="button"
                onClick={() => setReviewTab('personal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  reviewTab === 'personal'
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-white bg-slate-900/60'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Personal & Address</span>
              </button>

              <button
                type="button"
                onClick={() => setReviewTab('experience')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  reviewTab === 'experience'
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-white bg-slate-900/60'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Experience ({parsedProfile.workHistory?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setReviewTab('education')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  reviewTab === 'education'
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-white bg-slate-900/60'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Education ({parsedProfile.education?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setReviewTab('skills')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  reviewTab === 'skills'
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-white bg-slate-900/60'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Skills ({parsedProfile.skills?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setReviewTab('projects')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  reviewTab === 'projects'
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-white bg-slate-900/60'
                }`}
              >
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>Projects ({parsedProfile.projects?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setReviewTab('preferences')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  reviewTab === 'preferences'
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-white bg-slate-900/60'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Preferences</span>
              </button>
            </div>

            {/* TAB 1: Personal & Address Details */}
            {reviewTab === 'personal' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2">
                  <MapPin className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
                  <div>
                    <span className="font-bold">Address & Contact Review:</span> Check your street address, city, state, postal code, and country below. Fix any typos or incorrect details extracted from your resume.
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Full Legal Name</label>
                    <input
                      type="text"
                      value={parsedProfile.fullName}
                      onChange={(e) => setParsedProfile({ ...parsedProfile, fullName: e.target.value })}
                      placeholder="e.g. Rahul Sharma or Jane Doe"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Professional Headline</label>
                    <input
                      type="text"
                      value={parsedProfile.headline}
                      onChange={(e) => setParsedProfile({ ...parsedProfile, headline: e.target.value })}
                      placeholder="e.g. Senior Full Stack Engineer & Distributed Systems Architect"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Email Address</label>
                    <input
                      type="email"
                      value={parsedProfile.email}
                      onChange={(e) => setParsedProfile({ ...parsedProfile, email: e.target.value })}
                      placeholder="e.g. candidate@example.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Phone Number</label>
                    <input
                      type="text"
                      value={parsedProfile.phone}
                      onChange={(e) => setParsedProfile({ ...parsedProfile, phone: e.target.value })}
                      placeholder="e.g. +1 (555) 234-5678 or +91 98765 43210"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* PROMINENT CURRENT LOCATION & ADDRESS */}
                  <div className="sm:col-span-2 p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
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
                          value={parsedProfile.currentLocation}
                          onChange={(e) => setParsedProfile({ ...parsedProfile, currentLocation: e.target.value })}
                          placeholder="e.g. Flat 402, Sector 62, Noida or 450 Mission St, San Francisco, CA 94105"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-medium focus:border-emerald-500 focus:outline-none"
                        />
                        <p className="text-[11px] text-slate-500 mt-1">Used to evaluate commute, timezone compatibility, and regional job filters.</p>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Country</label>
                        <input
                          type="text"
                          value={parsedProfile.country}
                          onChange={(e) => setParsedProfile({ ...parsedProfile, country: e.target.value })}
                          placeholder="e.g. United States, India, Canada, United Kingdom"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-medium focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Total Years of Experience</label>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={parsedProfile.yearsOfExperience}
                      onChange={(e) => setParsedProfile({ ...parsedProfile, yearsOfExperience: parseInt(e.target.value, 10) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Work Experience */}
            {reviewTab === 'experience' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    Review extracted employment history. Edit companies, job titles, dates, or add/remove achievements.
                  </p>
                  <button
                    type="button"
                    onClick={addWorkExperience}
                    className="btn btn-xs btn-outline border-blue-500/40 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Work Experience</span>
                  </button>
                </div>

                {parsedProfile.workHistory?.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                    No work experience entries yet. Click "Add Work Experience" above to add your employment history.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {parsedProfile.workHistory.map((job: any, index: number) => (
                      <div key={index} className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-4 relative">
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
                              placeholder="e.g. Google, Stripe, Vanguard Systems"
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 mb-1">Job Title / Role</label>
                            <input
                              type="text"
                              value={job.role}
                              onChange={(e) => updateWorkExperience(index, 'role', e.target.value)}
                              placeholder="e.g. Senior Software Engineer"
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
                                placeholder="e.g. 2021-08 or Aug 2021"
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
                                placeholder="e.g. 2024-01 or Present"
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 disabled:opacity-50"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                            <input
                              type="checkbox"
                              id={`current-${index}`}
                              checked={job.current || false}
                              onChange={(e) => updateWorkExperience(index, 'current', e.target.checked)}
                              className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
                            />
                            <label htmlFor={`current-${index}`} className="text-slate-300 text-xs cursor-pointer">
                              I currently work in this role
                            </label>
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-slate-400 mb-1">Role Description / Summary</label>
                            <textarea
                              rows={2}
                              value={job.description}
                              onChange={(e) => updateWorkExperience(index, 'description', e.target.value)}
                              placeholder="Summarize your primary duties and responsibilities..."
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 text-xs"
                            />
                          </div>

                          {/* Achievements Bullets */}
                          <div className="sm:col-span-2 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="block text-slate-400 text-xs font-semibold">
                                Key Achievements & Metric Bullets
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
                                  placeholder="e.g. Scaled system throughput by 30%..."
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
            {reviewTab === 'education' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    Review academic credentials. Edit institutions, degrees, graduation years, or grades.
                  </p>
                  <button
                    type="button"
                    onClick={addEducation}
                    className="btn btn-xs btn-outline border-blue-500/40 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Education</span>
                  </button>
                </div>

                {parsedProfile.education?.map((edu: any, index: number) => (
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
                          placeholder="e.g. Columbia University or Delhi Technological University"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Degree</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                          placeholder="e.g. Bachelor of Science, B.Tech, M.S."
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Field of Study</label>
                        <input
                          type="text"
                          value={edu.fieldOfStudy}
                          onChange={(e) => updateEducation(index, 'fieldOfStudy', e.target.value)}
                          placeholder="e.g. Computer Science, Information Technology"
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
                            placeholder="e.g. 2021"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-slate-400 mb-1">Grade / GPA</label>
                          <input
                            type="text"
                            value={edu.grade || ''}
                            onChange={(e) => updateEducation(index, 'grade', e.target.value)}
                            placeholder="e.g. 3.9 GPA or 8.8 CGPA"
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
            {reviewTab === 'skills' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-400">
                  Manage your technical skills and competencies. The AI matcher uses these to rank job postings and calculate match percentages.
                </p>

                {/* Add Skill Bar */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[180px]">
                    <label className="block text-[11px] text-slate-400 mb-1">Skill Name</label>
                    <input
                      type="text"
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      placeholder="e.g. GraphQL, Tailwind CSS, Kubernetes"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                    />
                  </div>

                  <div className="w-36">
                    <label className="block text-[11px] text-slate-400 mb-1">Proficiency Level</label>
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
                    {parsedProfile.skills?.map((skill: any, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:border-slate-700 transition-colors"
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
            {reviewTab === 'projects' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    Review prominent projects highlighting your genuine real-world problem solving.
                  </p>
                  <button
                    type="button"
                    onClick={addProject}
                    className="btn btn-xs btn-outline border-blue-500/40 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Project</span>
                  </button>
                </div>

                {parsedProfile.projects?.map((proj: any, index: number) => (
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
                          placeholder="e.g. Distributed Task Orchestrator"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Your Role</label>
                        <input
                          type="text"
                          value={proj.role || ''}
                          onChange={(e) => updateProject(index, 'role', e.target.value)}
                          placeholder="e.g. Lead Architect or Full Stack Developer"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-slate-400 mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={proj.description}
                          onChange={(e) => updateProject(index, 'description', e.target.value)}
                          placeholder="Describe the problem, architecture, and impact of the project..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Live URL (optional)</label>
                        <input
                          type="text"
                          value={proj.liveUrl || ''}
                          onChange={(e) => updateProject(index, 'liveUrl', e.target.value)}
                          placeholder="https://example.com"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Repository URL (optional)</label>
                        <input
                          type="text"
                          value={proj.repoUrl || ''}
                          onChange={(e) => updateProject(index, 'repoUrl', e.target.value)}
                          placeholder="https://github.com/..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 6: Preferences */}
            {reviewTab === 'preferences' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-400">
                  Configure search filters for autonomous job discovery, salary ranges, and workplace preference.
                </p>

                {/* Desired Titles */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">Target Job Titles</label>
                  <div className="flex flex-wrap gap-2">
                    {parsedProfile.preferences?.desiredJobTitles?.map((title: string, i: number) => (
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

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Add target title (e.g. Lead DevOps Engineer)..."
                      className="w-72 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
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

                {/* Target Countries */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">Target Countries / Regions</label>
                  <div className="flex flex-wrap gap-2">
                    {parsedProfile.preferences?.desiredCountries?.map((country: string, i: number) => (
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

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={newCountry}
                      onChange={(e) => setNewCountry(e.target.value)}
                      placeholder="Add country (e.g. United Kingdom, Germany)..."
                      className="w-72 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Workplace Type</label>
                    <select
                      value={parsedProfile.preferences?.workplaceType}
                      onChange={(e) =>
                        setParsedProfile({
                          ...parsedProfile,
                          preferences: { ...parsedProfile.preferences, workplaceType: e.target.value },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                    >
                      <option value="remote">100% Remote Only</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="onsite">On-Site</option>
                      <option value="any">Any / Open</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Minimum Base Salary</label>
                    <input
                      type="number"
                      value={parsedProfile.preferences?.minSalary || ''}
                      onChange={(e) =>
                        setParsedProfile({
                          ...parsedProfile,
                          preferences: { ...parsedProfile.preferences, minSalary: parseInt(e.target.value, 10) },
                        })
                      }
                      placeholder="e.g. 130000"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Notice Period (Days)</label>
                    <input
                      type="number"
                      value={parsedProfile.preferences?.noticePeriodDays || 30}
                      onChange={(e) =>
                        setParsedProfile({
                          ...parsedProfile,
                          preferences: { ...parsedProfile.preferences, noticePeriodDays: parseInt(e.target.value, 10) },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Navigation Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn btn-sm btn-ghost text-slate-400 text-xs"
              >
                ← Back to Resume Upload
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn btn-sm btn-primary bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 font-semibold text-xs px-6 h-10 shadow-lg shadow-blue-600/20"
                >
                  <span>Confirm Verified Facts & Proceed</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Setup & Launch */}
        {step === 3 && (
          <div className="p-8 rounded-3xl border border-slate-800 bg-[#0d121f] text-center space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-xl font-bold text-white">Autonomous Operation Ready!</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your verified candidate facts (including contact details, address, work history, education, and skills) are anchored. AutoApply AI is prepared to discover opportunities worldwide, generate company-specific applications, submit them through authorized adapters, and alert you on interview invitations.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs max-w-md mx-auto space-y-2">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Verified Candidate: <strong>{parsedProfile.fullName}</strong> ({parsedProfile.currentLocation})</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Work Experiences: {parsedProfile.workHistory?.length || 0} verified roles</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Skills Loaded: {parsedProfile.skills?.length || 0} technical competencies</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Autonomous Apply Threshold: 75% match score</span>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn btn-sm btn-ghost text-slate-400 text-xs"
              >
                ← Back to Fact Review
              </button>

              <button
                onClick={handleCompleteOnboarding}
                className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 text-xs font-bold px-8 h-11 shadow-lg shadow-blue-600/30"
              >
                <span>Launch Autonomous Job Hunter</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
