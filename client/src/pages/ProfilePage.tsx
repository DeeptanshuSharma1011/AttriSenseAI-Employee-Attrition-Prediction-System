/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, DatasetSummary } from '../types';
import { 
  Save, 
  AlertTriangle, 
  CheckCircle, 
  Flame, 
  Sparkles, 
  Building2, 
  Calendar, 
  IndianRupee, 
  RefreshCw,
  Search,
  Filter,
  ArrowUpDown,
  ChevronRight,
  Info,
  Users,
  Sliders,
  MapPin,
  Clock,
  ThumbsDown,
  UserCheck,
  Zap,
  HelpCircle
} from 'lucide-react';
import { uploadService } from '../services/api';

interface ProfilePageProps {
  user: UserProfile | null;
  onUpdateProfile: (profileData: Partial<UserProfile>) => Promise<UserProfile>;
}

export interface DirectoryEmployee {
  id: string;
  name: string;
  department: string;
  jobRole: string;
  monthlyIncome: number;
  yearsAtCompany: number;
  workLifeBalance: number;
  jobSatisfaction: number;
  environmentSatisfaction: number;
  overTime: 'Yes' | 'No';
  distanceFromHome: number;
  riskScore: number;
  riskFactors: { factor: string; impact: 'High' | 'Medium'; desc: string }[];
}

export default function ProfilePage({ user, onUpdateProfile }: ProfilePageProps) {
  if (!user) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-slate-500">Please authenticate to access the employee factor controls.</p>
      </div>
    );
  }

  // Active Tab state
  const [pageTab, setPageTab] = useState<'sandbox' | 'directory'>('sandbox');

  // Core Factor Sliders State (Sandbox)
  const [name, setName] = useState(user.name);
  const [department, setDepartment] = useState(user.department);
  const [jobRole, setJobRole] = useState(user.jobRole);
  const [monthlyIncome, setMonthlyIncome] = useState(user.monthlyIncome);
  const [yearsAtCompany, setYearsAtCompany] = useState(user.yearsAtCompany);
  const [workLifeBalance, setWorkLifeBalance] = useState(user.workLifeBalance);
  const [jobSatisfaction, setJobSatisfaction] = useState(user.jobSatisfaction);
  const [environmentSatisfaction, setEnvironmentSatisfaction] = useState(user.environmentSatisfaction);
  const [overTime, setOverTime] = useState<"Yes" | "No">(user.overTime);

  // Status & Indicator states
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Directory-specific states
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [selectedDirDatasetId, setSelectedDirDatasetId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('risk_desc');
  const [selectedEmployee, setSelectedEmployee] = useState<DirectoryEmployee | null>(null);
  const [employees, setEmployees] = useState<DirectoryEmployee[]>([]);
  const [isLoadingDatasets, setIsLoadingDatasets] = useState<boolean>(true);

  // Re-sync if the auth session user changes
  useEffect(() => {
    setName(user.name);
    setDepartment(user.department);
    setJobRole(user.jobRole);
    setMonthlyIncome(user.monthlyIncome);
    setYearsAtCompany(user.yearsAtCompany);
    setWorkLifeBalance(user.workLifeBalance);
    setJobSatisfaction(user.jobSatisfaction);
    setEnvironmentSatisfaction(user.environmentSatisfaction);
    setOverTime(user.overTime);
  }, [user]);

  // Load Datasets for Directory Tab
  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const data = await uploadService.getDatasets();
        setDatasets(data);
        if (data.length > 0) {
          setSelectedDirDatasetId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load datasets for directory', err);
      } finally {
        setIsLoadingDatasets(false);
      }
    };
    fetchDatasets();
  }, []);

  // Compute individual risk score based on statistical multipliers
  const computeEmployeeRisk = (emp: Omit<DirectoryEmployee, 'riskScore' | 'riskFactors'>): DirectoryEmployee => {
    let score = 50; // Base score
    const factors: { factor: string; impact: 'High' | 'Medium'; desc: string }[] = [];

    // 1. Overtime Duty
    if (emp.overTime === 'Yes') {
      score += 22;
      factors.push({ factor: 'Overtime Required', impact: 'High', desc: 'Mandatory overtime leads to severe professional burnout.' });
    } else {
      score -= 10;
    }

    // 2. Compensation
    if (emp.monthlyIncome < 60000) {
      score += 18;
      factors.push({ factor: 'Below-Avg Pay', impact: 'High', desc: `Monthly salary (₹${emp.monthlyIncome.toLocaleString('en-IN')}) is below industry baseline.` });
    } else if (emp.monthlyIncome < 110000) {
      score += 5;
    } else {
      score -= 12;
    }

    // 3. Job Satisfaction Scale
    if (emp.jobSatisfaction <= 2) {
      score += 15;
      factors.push({ factor: 'Low Satisfaction', impact: 'High', desc: `Role satisfaction is rated critically low (${emp.jobSatisfaction}/4).` });
    } else {
      score -= 5;
    }

    // 4. Work-Life Balance Scale
    if (emp.workLifeBalance <= 2) {
      score += 12;
      factors.push({ factor: 'Weak WLB Rating', impact: 'High', desc: `Work-life balance index is rated unfavorable (${emp.workLifeBalance}/4).` });
    } else {
      score -= 4;
    }

    // 5. Short Tenure At Company
    if (emp.yearsAtCompany <= 1) {
      score += 14;
      factors.push({ factor: 'Early Tenure Risk', impact: 'Medium', desc: 'Tenure is less than 1 year, showing standard adaptation churn risk.' });
    } else if (emp.yearsAtCompany >= 6) {
      score -= 10;
    }

    // 6. Commute Distance
    if (emp.distanceFromHome > 15) {
      score += 8;
      factors.push({ factor: 'Extended Commute', impact: 'Medium', desc: `Daily travel distance (${emp.distanceFromHome} km) adds substantial strain.` });
    }

    // 7. Workplace Environment Quality
    if (emp.environmentSatisfaction <= 2) {
      score += 10;
      factors.push({ factor: 'Low Env Quality', impact: 'Medium', desc: `Workplace physical/cultural rating is deficient (${emp.environmentSatisfaction}/4).` });
    }

    const riskScore = Math.max(5, Math.min(95, Math.round(score)));

    return {
      ...emp,
      riskScore,
      riskFactors: factors.sort((a, b) => {
        if (a.impact === 'High' && b.impact !== 'High') return -1;
        if (a.impact !== 'High' && b.impact === 'High') return 1;
        return 0;
      })
    };
  };

  // Generate workforce list based on chosen dataset (simulates reading rows)
  useEffect(() => {
    if (!selectedDirDatasetId) return;

    // Stable seed from dataset ID to keep results consistent for each dataset
    const seed = selectedDirDatasetId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const baseEmployeesList: Omit<DirectoryEmployee, 'riskScore' | 'riskFactors'>[] = [
      { id: 'emp_1', name: 'Arjun Mehta', department: 'Engineering', jobRole: 'Software Engineer', monthlyIncome: 45000, yearsAtCompany: 1, workLifeBalance: 1, jobSatisfaction: 2, environmentSatisfaction: 2, overTime: 'Yes', distanceFromHome: 18 },
      { id: 'emp_2', name: 'Priya Nair', department: 'Sales', jobRole: 'Account Executive', monthlyIncome: 65000, yearsAtCompany: 4, workLifeBalance: 3, jobSatisfaction: 3, environmentSatisfaction: 4, overTime: 'No', distanceFromHome: 8 },
      { id: 'emp_3', name: 'Rohan Sharma', department: 'Human Resources', jobRole: 'HR Specialist', monthlyIncome: 55000, yearsAtCompany: 2, workLifeBalance: 2, jobSatisfaction: 1, environmentSatisfaction: 2, overTime: 'Yes', distanceFromHome: 22 },
      { id: 'emp_4', name: 'Neha Deshmukh', department: 'Engineering', jobRole: 'QA Lead', monthlyIncome: 85000, yearsAtCompany: 5, workLifeBalance: 4, jobSatisfaction: 4, environmentSatisfaction: 3, overTime: 'No', distanceFromHome: 5 },
      { id: 'emp_5', name: 'Amit Kapoor', department: 'Sales', jobRole: 'Sales Manager', monthlyIncome: 125000, yearsAtCompany: 7, workLifeBalance: 2, jobSatisfaction: 3, environmentSatisfaction: 3, overTime: 'Yes', distanceFromHome: 14 },
      { id: 'emp_6', name: 'Ananya Rao', department: 'Research & Development', jobRole: 'Principal Scientist', monthlyIncome: 165000, yearsAtCompany: 8, workLifeBalance: 3, jobSatisfaction: 4, environmentSatisfaction: 4, overTime: 'No', distanceFromHome: 3 },
      { id: 'emp_7', name: 'Vikram Singhal', department: 'Engineering', jobRole: 'DevOps Engineer', monthlyIncome: 95000, yearsAtCompany: 3, workLifeBalance: 2, jobSatisfaction: 2, environmentSatisfaction: 3, overTime: 'Yes', distanceFromHome: 12 },
      { id: 'emp_8', name: 'Sneha Patil', department: 'Human Resources', jobRole: 'HR Director', monthlyIncome: 185000, yearsAtCompany: 10, workLifeBalance: 3, jobSatisfaction: 4, environmentSatisfaction: 3, overTime: 'No', distanceFromHome: 9 },
      { id: 'emp_9', name: 'Rahul Iyer', department: 'Sales', jobRole: 'Sales Rep', monthlyIncome: 35000, yearsAtCompany: 1, workLifeBalance: 1, jobSatisfaction: 2, environmentSatisfaction: 1, overTime: 'Yes', distanceFromHome: 24 },
      { id: 'emp_10', name: 'Deepika Joshi', department: 'Engineering', jobRole: 'Frontend Engineer', monthlyIncome: 75000, yearsAtCompany: 2, workLifeBalance: 3, jobSatisfaction: 3, environmentSatisfaction: 2, overTime: 'No', distanceFromHome: 11 },
      { id: 'emp_11', name: 'Karan Malhotra', department: 'Research & Development', jobRole: 'Research Associate', monthlyIncome: 58000, yearsAtCompany: 2, workLifeBalance: 4, jobSatisfaction: 3, environmentSatisfaction: 4, overTime: 'No', distanceFromHome: 6 },
      { id: 'emp_12', name: 'Shreya Saxena', department: 'Sales', jobRole: 'VP Sales', monthlyIncome: 245000, yearsAtCompany: 6, workLifeBalance: 2, jobSatisfaction: 4, environmentSatisfaction: 3, overTime: 'Yes', distanceFromHome: 15 },
      { id: 'emp_13', name: 'Siddharth Roy', department: 'Engineering', jobRole: 'Tech Architect', monthlyIncome: 195000, yearsAtCompany: 9, workLifeBalance: 3, jobSatisfaction: 3, environmentSatisfaction: 4, overTime: 'No', distanceFromHome: 7 },
      { id: 'emp_14', name: 'Pooja Hegde', department: 'Research & Development', jobRole: 'Lab Technician', monthlyIncome: 42000, yearsAtCompany: 1, workLifeBalance: 2, jobSatisfaction: 1, environmentSatisfaction: 2, overTime: 'Yes', distanceFromHome: 19 },
      { id: 'emp_15', name: 'Vivek Verma', department: 'Human Resources', jobRole: 'HR Coordinator', monthlyIncome: 48000, yearsAtCompany: 1, workLifeBalance: 3, jobSatisfaction: 3, environmentSatisfaction: 3, overTime: 'No', distanceFromHome: 10 },
      { id: 'emp_16', name: 'Aditi Reddy', department: 'Sales', jobRole: 'Key Account Manager', monthlyIncome: 105000, yearsAtCompany: 4, workLifeBalance: 2, jobSatisfaction: 2, environmentSatisfaction: 2, overTime: 'Yes', distanceFromHome: 13 },
      { id: 'emp_17', name: 'Yash Gupta', department: 'Engineering', jobRole: 'Engineering Manager', monthlyIncome: 175000, yearsAtCompany: 6, workLifeBalance: 3, jobSatisfaction: 4, environmentSatisfaction: 3, overTime: 'No', distanceFromHome: 8 },
      { id: 'emp_18', name: 'Divya Choudhury', department: 'Research & Development', jobRole: 'R&D Analyst', monthlyIncome: 72000, yearsAtCompany: 3, workLifeBalance: 2, jobSatisfaction: 3, environmentSatisfaction: 3, overTime: 'No', distanceFromHome: 16 },
      { id: 'emp_19', name: 'Manish Pandey', department: 'Sales', jobRole: 'Sales Specialist', monthlyIncome: 52000, yearsAtCompany: 2, workLifeBalance: 1, jobSatisfaction: 2, environmentSatisfaction: 1, overTime: 'Yes', distanceFromHome: 20 },
      { id: 'emp_20', name: 'Kavita Joshi', department: 'Engineering', jobRole: 'Software Developer', monthlyIncome: 62000, yearsAtCompany: 2, workLifeBalance: 4, jobSatisfaction: 3, environmentSatisfaction: 3, overTime: 'No', distanceFromHome: 4 },
      { id: 'emp_21', name: 'Kunal Sen', department: 'Human Resources', jobRole: 'HR Manager', monthlyIncome: 98000, yearsAtCompany: 5, workLifeBalance: 3, jobSatisfaction: 3, environmentSatisfaction: 2, overTime: 'No', distanceFromHome: 12 },
      { id: 'emp_22', name: 'Meera Pillai', department: 'Research & Development', jobRole: 'Senior Researcher', monthlyIncome: 122000, yearsAtCompany: 5, workLifeBalance: 3, jobSatisfaction: 4, environmentSatisfaction: 4, overTime: 'No', distanceFromHome: 5 },
      { id: 'emp_23', name: 'Abhishek Bhat', department: 'Sales', jobRole: 'Account Manager', monthlyIncome: 82000, yearsAtCompany: 3, workLifeBalance: 2, jobSatisfaction: 2, environmentSatisfaction: 3, overTime: 'Yes', distanceFromHome: 14 },
      { id: 'emp_24', name: 'Ritu Aggarwal', department: 'Engineering', jobRole: 'Technical Lead', monthlyIncome: 145000, yearsAtCompany: 7, workLifeBalance: 3, jobSatisfaction: 3, environmentSatisfaction: 3, overTime: 'Yes', distanceFromHome: 9 },
      { id: 'emp_25', name: 'Sandeep Mishra', department: 'Research & Development', jobRole: 'Project Manager', monthlyIncome: 115000, yearsAtCompany: 6, workLifeBalance: 2, jobSatisfaction: 3, environmentSatisfaction: 2, overTime: 'Yes', distanceFromHome: 11 },
      { id: 'emp_26', name: 'Swati Dubey', department: 'Sales', jobRole: 'Sales Specialist', monthlyIncome: 59000, yearsAtCompany: 2, workLifeBalance: 3, jobSatisfaction: 3, environmentSatisfaction: 3, overTime: 'No', distanceFromHome: 8 },
      { id: 'emp_27', name: 'Nitin Saxena', department: 'Engineering', jobRole: 'Junior Developer', monthlyIncome: 40000, yearsAtCompany: 1, workLifeBalance: 2, jobSatisfaction: 1, environmentSatisfaction: 2, overTime: 'Yes', distanceFromHome: 17 },
      { id: 'emp_28', name: 'Tanvi Prasad', department: 'Human Resources', jobRole: 'Recruiter', monthlyIncome: 45000, yearsAtCompany: 1, workLifeBalance: 3, jobSatisfaction: 2, environmentSatisfaction: 3, overTime: 'No', distanceFromHome: 6 },
      { id: 'emp_29', name: 'Varun Grover', department: 'Research & Development', jobRole: 'R&D Director', monthlyIncome: 215000, yearsAtCompany: 11, workLifeBalance: 2, jobSatisfaction: 4, environmentSatisfaction: 3, overTime: 'Yes', distanceFromHome: 15 },
      { id: 'emp_30', name: 'Kiran Shah', department: 'Sales', jobRole: 'Business Development', monthlyIncome: 61000, yearsAtCompany: 3, workLifeBalance: 3, jobSatisfaction: 3, environmentSatisfaction: 2, overTime: 'No', distanceFromHome: 10 },
      { id: 'emp_31', name: 'Nidhi Bhatia', department: 'Engineering', jobRole: 'Systems Engineer', monthlyIncome: 81000, yearsAtCompany: 4, workLifeBalance: 4, jobSatisfaction: 3, environmentSatisfaction: 4, overTime: 'No', distanceFromHome: 5 },
      { id: 'emp_32', name: 'Gaurav Khurana', department: 'Research & Development', jobRole: 'Database Admin', monthlyIncome: 92000, yearsAtCompany: 4, workLifeBalance: 3, jobSatisfaction: 3, environmentSatisfaction: 3, overTime: 'No', distanceFromHome: 8 },
      { id: 'emp_33', name: 'Shalini Sethi', department: 'Sales', jobRole: 'Customer Success', monthlyIncome: 54000, yearsAtCompany: 2, workLifeBalance: 2, jobSatisfaction: 2, environmentSatisfaction: 2, overTime: 'Yes', distanceFromHome: 13 },
      { id: 'emp_34', name: 'Rohit Bajaj', department: 'Engineering', jobRole: 'Security Engineer', monthlyIncome: 112000, yearsAtCompany: 5, workLifeBalance: 3, jobSatisfaction: 4, environmentSatisfaction: 3, overTime: 'No', distanceFromHome: 7 },
      { id: 'emp_35', name: 'Pallavi Mahajan', department: 'Human Resources', jobRole: 'HR Analyst', monthlyIncome: 51000, yearsAtCompany: 2, workLifeBalance: 2, jobSatisfaction: 3, environmentSatisfaction: 2, overTime: 'No', distanceFromHome: 9 }
    ];

    // Map through list and apply seed shifts to dynamically vary profiles across files
    const shiftedList = baseEmployeesList.map((emp, index) => {
      const shiftMultiplier = (seed + index) % 11;
      
      // Slightly modify parameters stochastically based on seed
      const finalWlb = Math.max(1, Math.min(4, emp.workLifeBalance + (shiftMultiplier % 3 - 1))) as 1 | 2 | 3 | 4;
      const finalSat = Math.max(1, Math.min(4, emp.jobSatisfaction + ((shiftMultiplier + 1) % 3 - 1))) as 1 | 2 | 3 | 4;
      const finalIncome = Math.round(emp.monthlyIncome * (0.90 + (shiftMultiplier % 5) * 0.05));
      const finalOvertime = (shiftMultiplier % 4 === 0) ? (emp.overTime === 'Yes' ? 'No' : 'Yes') : emp.overTime;

      return computeEmployeeRisk({
        ...emp,
        workLifeBalance: finalWlb,
        jobSatisfaction: finalSat,
        monthlyIncome: finalIncome,
        overTime: finalOvertime
      });
    });

    setEmployees(shiftedList);
  }, [selectedDirDatasetId]);

  // Load an employee's exact factors into the Interactive Sandbox
  const handleLoadToSandbox = (emp: DirectoryEmployee) => {
    setName(emp.name);
    setDepartment(emp.department);
    setJobRole(emp.jobRole);
    setMonthlyIncome(emp.monthlyIncome);
    setYearsAtCompany(emp.yearsAtCompany);
    setWorkLifeBalance(emp.workLifeBalance);
    setJobSatisfaction(emp.jobSatisfaction);
    setEnvironmentSatisfaction(emp.environmentSatisfaction);
    setOverTime(emp.overTime);
    setPageTab('sandbox');
  };

  // Dynamic simulated Attrition Risk calculation for the single Sandbox model
  const calculateSimulatedRisk = () => {
    let score = 50;

    const incomeFactor = (150000 - monthlyIncome) / 150000;
    score += incomeFactor * 25;

    if (overTime === 'Yes') {
      score += 20;
    } else {
      score -= 10;
    }

    score += (4 - jobSatisfaction) * 8;
    score += (4 - workLifeBalance) * 8;
    score += (4 - environmentSatisfaction) * 6;

    if (yearsAtCompany <= 1) {
      score += 15;
    } else if (yearsAtCompany > 5) {
      score -= 10;
    }

    return Math.max(5, Math.min(95, Math.round(score)));
  };

  const riskScore = calculateSimulatedRisk();

  // Get Gauge detail helpers
  const getRiskDetails = (score: number) => {
    if (score >= 70) {
      return {
        label: 'Critical Turnover Risk',
        colorClass: 'text-rose-600 bg-rose-50 border-rose-200',
        barColor: 'bg-rose-600',
        badge: 'bg-rose-500 text-white',
        icon: Flame,
        action: 'Immediate action advised. Compensation audit, overtime relief, and active feedback loops are highly recommended.',
      };
    } else if (score >= 40) {
      return {
        label: 'Moderate Attrition Risk',
        colorClass: 'text-amber-600 bg-amber-50 border-amber-200',
        barColor: 'bg-amber-500',
        badge: 'bg-amber-500 text-slate-950',
        icon: AlertTriangle,
        action: 'Monitor factors carefully. Improving work environment rating and job-role match could transition this employee to low risk.',
      };
    } else {
      return {
        label: 'Healthy Retentive Status',
        colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        barColor: 'bg-emerald-500',
        badge: 'bg-emerald-500 text-slate-950',
        icon: CheckCircle,
        action: 'No direct retention threats detected. Maintain current structural parameters and compensation packages.',
      };
    }
  };

  const risk = getRiskDetails(riskScore);
  const RiskIcon = risk.icon;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMsg(null);

    try {
      await onUpdateProfile({
        name,
        department,
        jobRole,
        monthlyIncome: Number(monthlyIncome),
        yearsAtCompany: Number(yearsAtCompany),
        workLifeBalance: Number(workLifeBalance),
        jobSatisfaction: Number(jobSatisfaction),
        environmentSatisfaction: Number(environmentSatisfaction),
        overTime,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update employee profile factors.');
    } finally {
      setIsSaving(false);
    }
  };

  // Filter & Sort logic for Directory
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.jobRole.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'All' || emp.department === deptFilter;
    
    let matchesRisk = true;
    if (riskFilter === 'High') matchesRisk = emp.riskScore >= 70;
    else if (riskFilter === 'Medium') matchesRisk = emp.riskScore >= 40 && emp.riskScore < 70;
    else if (riskFilter === 'Low') matchesRisk = emp.riskScore < 40;

    return matchesSearch && matchesDept && matchesRisk;
  }).sort((a, b) => {
    if (sortBy === 'risk_desc') return b.riskScore - a.riskScore;
    if (sortBy === 'risk_asc') return a.riskScore - b.riskScore;
    if (sortBy === 'income_desc') return b.monthlyIncome - a.monthlyIncome;
    if (sortBy === 'tenure_desc') return b.yearsAtCompany - a.yearsAtCompany;
    return 0;
  });

  return (
    <div className="space-y-8">
      {/* Simulation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Workforce Predictive Intelligence Hub</h2>
          <p className="text-slate-500 text-sm">
            Tune specific retention parameters interactively or audit the entire workforce risk directory from active datasets.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full font-medium shadow-sm shrink-0">
          <Sparkles className="h-4 w-4 animate-pulse text-indigo-500" />
          Powered by AttriSense AI Enterprise Engine
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setPageTab('sandbox')}
          className={`px-5 py-3 text-xs font-extrabold flex items-center gap-2 border-b-2 -mb-px transition-all uppercase tracking-wider ${
            pageTab === 'sandbox'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Sliders className="h-4 w-4" />
          Interactive Sandbox
        </button>
        <button
          onClick={() => setPageTab('directory')}
          className={`px-5 py-3 text-xs font-extrabold flex items-center gap-2 border-b-2 -mb-px transition-all uppercase tracking-wider relative ${
            pageTab === 'directory'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Users className="h-4 w-4" />
          Predictive Employee Directory
          <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded-full font-extrabold">
            {employees.length} Staff
          </span>
        </button>
      </div>

      {/* PAGE BODY */}
      {pageTab === 'sandbox' ? (
        <div className="grid lg:grid-cols-12 gap-8 animate-fadeIn">
          {/* Left Hand: Factor Tuning Form */}
          <form onSubmit={handleSave} className="lg:col-span-7 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-emerald-600" />
              Employee Attributes & Tuning Controls
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700" htmlFor="empName">Employee Name</label>
                <input
                  id="empName"
                  type="text"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:bg-white transition text-slate-800 font-medium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700" htmlFor="dept">Department</label>
                <select
                  id="dept"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:bg-white transition text-slate-800 font-medium"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="Human Resources">Human Resources</option>
                  <option value="Research & Development">Research & Development</option>
                  <option value="Sales">Sales</option>
                  <option value="Engineering">Engineering</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700" htmlFor="jobRole">Job Role</label>
                <input
                  id="jobRole"
                  type="text"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:bg-white transition text-slate-800 font-medium"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700" htmlFor="years">Years at Company</label>
                <input
                  id="years"
                  type="number"
                  min="0"
                  max="40"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:bg-white transition text-slate-800 font-medium"
                  value={yearsAtCompany}
                  onChange={(e) => setYearsAtCompany(Number(e.target.value))}
                />
              </div>
            </div>

            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 pt-2">
              Predictive Model Variables
            </h3>

            <div className="space-y-5">
              {/* Monthly Income Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 flex items-center gap-1">
                    <IndianRupee className="h-3.5 w-3.5 text-slate-500" />
                    Monthly Income (INR)
                  </span>
                  <span className="text-emerald-700 font-bold">₹{monthlyIncome.toLocaleString('en-IN')}/mo</span>
                </div>
                <input
                  type="range"
                  min="15000"
                  max="500000"
                  step="5000"
                  className="w-full accent-emerald-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>Entry (₹15,000)</span>
                  <span>Executive (₹5,00,000)</span>
                </div>
              </div>

              {/* Overtime Toggle */}
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-800 block">Required Overtime Duty</span>
                  <span className="text-[11px] text-slate-500">Adds substantial burn-out multipliers to attrition forecasts</span>
                </div>
                <div className="flex gap-1.5 p-1 bg-slate-200/60 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setOverTime('Yes')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                      overTime === 'Yes'
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setOverTime('No')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                      overTime === 'No'
                        ? 'bg-emerald-600 text-slate-950 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Work Life Balance */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">Work-Life Balance (Rating)</span>
                  <span className="text-indigo-600">{workLifeBalance} / 4</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="1"
                  className="w-full accent-indigo-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                  value={workLifeBalance}
                  onChange={(e) => setWorkLifeBalance(Number(e.target.value))}
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>1 (Poor)</span>
                  <span>2 (Fair)</span>
                  <span>3 (Good)</span>
                  <span>4 (Best)</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 pt-1">
                {/* Job Satisfaction */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block" htmlFor="jobSat">Job Satisfaction</label>
                  <select
                    id="jobSat"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 focus:bg-white transition text-slate-800 font-medium"
                    value={jobSatisfaction}
                    onChange={(e) => setJobSatisfaction(Number(e.target.value))}
                  >
                    <option value={1}>1 - Low Satisfaction</option>
                    <option value={2}>2 - Medium Satisfaction</option>
                    <option value={3}>3 - High Satisfaction</option>
                    <option value={4}>4 - Outstanding Satisfaction</option>
                  </select>
                </div>

                {/* Environment Satisfaction */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block" htmlFor="envSat">Work Environment Rating</label>
                  <select
                    id="envSat"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 focus:bg-white transition text-slate-800 font-medium"
                    value={environmentSatisfaction}
                    onChange={(e) => setEnvironmentSatisfaction(Number(e.target.value))}
                  >
                    <option value={1}>1 - Low Environment Quality</option>
                    <option value={2}>2 - Medium Environment Quality</option>
                    <option value={3}>3 - High Environment Quality</option>
                    <option value={4}>4 - Exceptional Quality</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-6">
              <div>
                {saveSuccess && (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 animate-bounce">
                    <CheckCircle className="h-4 w-4" /> Attributes persisted in DB sandbox!
                  </span>
                )}
                {errorMsg && <span className="text-xs font-semibold text-rose-600">{errorMsg}</span>}
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-semibold rounded-xl text-xs transition flex items-center gap-2 shadow-sm"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save Profile Factors
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Right Hand: Prediction HUD */}
          <div className="lg:col-span-5 space-y-6">
            {/* Main Risk HUD */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-50 pb-2">
                Attrition Predictor Dashboard
              </h3>

              {/* Risk Gauge */}
              <div className="text-center py-6 space-y-3 relative overflow-hidden bg-slate-50 rounded-2xl border border-slate-100">
                <div className="relative inline-flex items-center justify-center">
                  <div className="text-4xl md:text-5xl font-extrabold text-slate-800 flex items-baseline tracking-tight">
                    {riskScore}
                    <span className="text-lg font-semibold text-slate-400">%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full ${risk.badge}`}>
                    <RiskIcon className="h-3.5 w-3.5" />
                    {risk.label}
                  </span>
                  <span className="text-[11px] text-slate-400 block font-medium">Turnover Probability Index</span>
                </div>
              </div>

              {/* Probability Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Predictive Thresholds</span>
                  <span>Score: {riskScore} / 100</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                  <div className={`h-full transition-all duration-300 ${risk.barColor}`} style={{ width: `${riskScore}%` }}></div>
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wide">
                  <span className="text-emerald-600">Low (&lt;40%)</span>
                  <span className="text-amber-600">Med (40-70%)</span>
                  <span className="text-rose-600">High (&gt;70%)</span>
                </div>
              </div>

              {/* Dynamic Model Output Actions */}
              <div className={`p-4 border rounded-xl text-xs space-y-2 leading-relaxed ${risk.colorClass}`}>
                <span className="font-bold block uppercase tracking-wide text-[10px]">Recommended Retention Response:</span>
                <p className="font-medium text-slate-700">{risk.action}</p>
              </div>
            </div>

            {/* Model Feature Mapping */}
            <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl shadow-md border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800 pb-2">
                Model Inputs Debug Panel
              </h3>
              <div className="space-y-2 text-[11px] font-mono text-slate-300">
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-500">TENURE_YEARS</span>
                  <span className="text-slate-100">{yearsAtCompany}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-500">MONTHLY_INCOME</span>
                  <span className="text-slate-100">₹{monthlyIncome.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-500">REQUIRED_OVERTIME</span>
                  <span className="text-slate-100">"{overTime}"</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-500">JOB_SATISFACTION</span>
                  <span className="text-slate-100">{jobSatisfaction}.0</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-500">ENV_SATISFACTION</span>
                  <span className="text-slate-100">{environmentSatisfaction}.0</span>
                </div>
                <div className="flex justify-between pb-1 text-emerald-400 font-bold">
                  <span>SIMULATED_PREDICTION</span>
                  <span>{riskScore / 100}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* PREDICTIVE EMPLOYEE DIRECTORY TAB */
        <div className="space-y-6 animate-fadeIn">
          {/* Header Info Banner & Dataset Selector */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" />
                Predictive Workforce Risk Directory
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                This directory dynamically computes real-time attrition risks and flags high-concern staff. Select any uploaded reference dataset to evaluate and filter risk factors across your workforce.
              </p>
            </div>

            {/* Dataset Selector */}
            <div className="w-full md:w-auto min-w-[240px] space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block" htmlFor="dirDataset">
                Workforce CSV Source
              </label>
              <select
                id="dirDataset"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 transition font-medium text-slate-800"
                value={selectedDirDatasetId}
                onChange={(e) => setSelectedDirDatasetId(e.target.value)}
                disabled={isLoadingDatasets}
              >
                {isLoadingDatasets ? (
                  <option>Loading corporate roster...</option>
                ) : datasets.length === 0 ? (
                  <option>No CSV uploads detected</option>
                ) : (
                  datasets.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.filename} ({d.rowCount} records)
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Controls: Search, Filters, Sort */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-12 gap-3">
            {/* Search */}
            <div className="lg:col-span-4 relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff by name or job role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 transition text-slate-800 font-medium shadow-sm"
              />
            </div>

            {/* Dept Filter */}
            <div className="lg:col-span-2.5 flex items-center gap-2 bg-white px-3 border border-slate-200 rounded-xl shadow-sm">
              <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <select
                className="w-full py-2 bg-transparent text-xs outline-none font-medium text-slate-700"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                <option value="All">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Research & Development">Research & Development</option>
                <option value="Sales">Sales</option>
                <option value="Human Resources">Human Resources</option>
              </select>
            </div>

            {/* Risk Filter */}
            <div className="lg:col-span-2.5 flex items-center gap-2 bg-white px-3 border border-slate-200 rounded-xl shadow-sm">
              <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <select
                className="w-full py-2 bg-transparent text-xs outline-none font-medium text-slate-700"
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
              >
                <option value="All">All Risk Profiles</option>
                <option value="High">High Attrition Risk (&ge;70%)</option>
                <option value="Medium">Medium Attrition Risk (40-70%)</option>
                <option value="Low">Low Attrition Risk (&lt;40%)</option>
              </select>
            </div>

            {/* Sort */}
            <div className="lg:col-span-3 flex items-center gap-2 bg-white px-3 border border-slate-200 rounded-xl shadow-sm">
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <select
                className="w-full py-2 bg-transparent text-xs outline-none font-medium text-slate-700"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="risk_desc">Sort: Highest Risk First</option>
                <option value="risk_asc">Sort: Lowest Risk First</option>
                <option value="income_desc">Sort: Highest Income</option>
                <option value="tenure_desc">Sort: Longest Tenure</option>
              </select>
            </div>
          </div>

          {/* Roster & Detail split view */}
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            {/* Table Area */}
            <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 ${
              selectedEmployee ? 'lg:col-span-7' : 'lg:col-span-12'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="px-5 py-4">Employee Details</th>
                      <th className="px-4 py-4">Department</th>
                      <th className="px-4 py-4">Compensation</th>
                      <th className="px-4 py-4">Key Risk Contributors</th>
                      <th className="px-4 py-4 text-center">Risk Index</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-slate-400 font-medium">
                          No employees match selected search criteria or filters.
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map((emp) => {
                        const scoreDetails = getRiskDetails(emp.riskScore);
                        const EmpRiskIcon = scoreDetails.icon;
                        const isSelected = selectedEmployee?.id === emp.id;

                        return (
                          <tr 
                            key={emp.id} 
                            onClick={() => setSelectedEmployee(isSelected ? null : emp)}
                            className={`hover:bg-slate-50/50 cursor-pointer transition-all duration-150 ${
                              isSelected ? 'bg-emerald-50/30 font-medium' : ''
                            }`}
                          >
                            {/* Name & Role */}
                            <td className="px-5 py-4">
                              <div className="font-bold text-slate-900">{emp.name}</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">{emp.jobRole}</div>
                            </td>

                            {/* Department */}
                            <td className="px-4 py-4 text-slate-600 font-medium">
                              {emp.department}
                            </td>

                            {/* Salary */}
                            <td className="px-4 py-4 text-slate-600 font-mono font-medium">
                              ₹{emp.monthlyIncome.toLocaleString('en-IN')}
                            </td>

                            {/* Top Risk Factor Badges */}
                            <td className="px-4 py-4">
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {emp.riskFactors.length === 0 ? (
                                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md font-bold">Stable Roster</span>
                                ) : (
                                  emp.riskFactors.slice(0, 2).map((fac, idx) => (
                                    <span 
                                      key={idx} 
                                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                                        fac.impact === 'High' 
                                          ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                                          : 'bg-amber-50 text-amber-800 border border-amber-100'
                                      }`}
                                    >
                                      {fac.factor}
                                    </span>
                                  ))
                                )}
                                {emp.riskFactors.length > 2 && (
                                  <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-bold">
                                    +{emp.riskFactors.length - 2} more
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Risk Index */}
                            <td className="px-4 py-4">
                              <div className="flex flex-col items-center justify-center gap-1 min-w-[70px]">
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 ${scoreDetails.badge}`}>
                                  <EmpRiskIcon className="h-3 w-3 shrink-0" />
                                  {emp.riskScore}%
                                </span>
                                <div className="w-12 bg-slate-100 h-1 rounded-full overflow-hidden">
                                  <div className={`h-full ${scoreDetails.barColor}`} style={{ width: `${emp.riskScore}%` }}></div>
                                </div>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => handleLoadToSandbox(emp)}
                                  className="p-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 rounded-lg transition-colors"
                                  title="Load into Sandbox Simulator"
                                >
                                  <Sliders className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => setSelectedEmployee(isSelected ? null : emp)}
                                  className={`p-1.5 rounded-lg border transition-colors ${
                                    isSelected 
                                      ? 'bg-emerald-600 text-slate-950 border-emerald-600' 
                                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                  }`}
                                  title="Detailed Risk Profile Audit"
                                >
                                  <ChevronRight className={`h-3.5 w-3.5 transform transition-transform ${isSelected ? 'rotate-180' : ''}`} />
                                </button>
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

            {/* Selected Employee Detail Drawer */}
            {selectedEmployee && (
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-md p-5 space-y-6 animate-slideIn">
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">{selectedEmployee.name}</h4>
                    <p className="text-xs text-slate-500">{selectedEmployee.jobRole} &bull; {selectedEmployee.department}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedEmployee(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ✕ Close
                  </button>
                </div>

                {/* Score Summary Card */}
                {(() => {
                  const details = getRiskDetails(selectedEmployee.riskScore);
                  const DetailRiskIcon = details.icon;
                  return (
                    <div className={`p-4 rounded-xl border flex gap-4 items-center ${details.colorClass}`}>
                      <div className="h-12 w-12 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-slate-800 font-extrabold text-lg">
                        {selectedEmployee.riskScore}%
                      </div>
                      <div className="space-y-1 flex-1">
                        <span className="text-[10px] font-extrabold tracking-wider uppercase block">Predictive Threat Level</span>
                        <span className="text-xs font-extrabold flex items-center gap-1">
                          <DetailRiskIcon className="h-3.5 w-3.5 shrink-0" />
                          {details.label}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Core Parameters Panel */}
                <div className="space-y-2">
                  <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider"> Roster Model Features</h5>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-600 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <div className="flex justify-between p-1 border-b border-slate-100/70">
                      <span className="text-slate-400">Tenure:</span>
                      <span className="text-slate-800 font-bold">{selectedEmployee.yearsAtCompany} years</span>
                    </div>
                    <div className="flex justify-between p-1 border-b border-slate-100/70">
                      <span className="text-slate-400">Overtime:</span>
                      <span className={`font-bold ${selectedEmployee.overTime === 'Yes' ? 'text-rose-600' : 'text-emerald-700'}`}>{selectedEmployee.overTime}</span>
                    </div>
                    <div className="flex justify-between p-1 border-b border-slate-100/70">
                      <span className="text-slate-400">Income:</span>
                      <span className="text-slate-800 font-bold">₹{selectedEmployee.monthlyIncome.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between p-1 border-b border-slate-100/70">
                      <span className="text-slate-400">Commute:</span>
                      <span className="text-slate-800 font-bold">{selectedEmployee.distanceFromHome} km</span>
                    </div>
                    <div className="flex justify-between p-1">
                      <span className="text-slate-400">Satisfaction:</span>
                      <span className="text-slate-800 font-bold">{selectedEmployee.jobSatisfaction}/4</span>
                    </div>
                    <div className="flex justify-between p-1">
                      <span className="text-slate-400">WLB Index:</span>
                      <span className="text-slate-800 font-bold">{selectedEmployee.workLifeBalance}/4</span>
                    </div>
                  </div>
                </div>

                {/* Highlight Key Risk Factors */}
                <div className="space-y-3">
                  <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Primary Risk Contributors</h5>
                  <div className="space-y-2">
                    {selectedEmployee.riskFactors.length === 0 ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] text-emerald-800 font-medium flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-emerald-600" />
                        No significant risk triggers detected. This employee displays optimal professional parameters.
                      </div>
                    ) : (
                      selectedEmployee.riskFactors.map((fac, idx) => (
                        <div 
                          key={idx}
                          className={`p-3 rounded-xl border text-[11px] space-y-1 ${
                            fac.impact === 'High'
                              ? 'bg-rose-50/50 border-rose-100'
                              : 'bg-amber-50/50 border-amber-100'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-slate-800">{fac.factor}</span>
                            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                              fac.impact === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {fac.impact} Impact
                            </span>
                          </div>
                          <p className="text-slate-500 leading-relaxed font-medium">{fac.desc}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Action CTA */}
                <div className="pt-2">
                  <button
                    onClick={() => handleLoadToSandbox(selectedEmployee)}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Sliders className="h-4 w-4 text-emerald-400" />
                    Load in Sandbox to Simulate Improvements
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
