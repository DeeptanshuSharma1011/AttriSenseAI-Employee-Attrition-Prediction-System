/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Database, 
  UploadCloud, 
  FileSpreadsheet, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  Calendar, 
  User, 
  Loader2, 
  ChevronRight, 
  ArrowRight, 
  Sparkles, 
  TrendingDown,
  Info
} from 'lucide-react';
import { uploadService } from '../services/api';
import { DatasetSummary } from '../types';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/Button';
import { Card, CardHeader, CardContent, CardFooter } from '../components/Card';
import { Badge } from '../components/Badge';
import { Alert } from '../components/Alert';

export default function DatasetUploadPage() {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<DatasetSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Upload states
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadingFileName, setUploadingFileName] = useState<string>('');

  // Fetch datasets on load
  const loadDatasets = async () => {
    setIsLoading(true);
    try {
      const data = await uploadService.getDatasets();
      setDatasets(data);
      if (data.length > 0) {
        // Automatically select the first/newest dataset to display validation details
        setSelectedDataset(data[0]);
      }
    } catch (error) {
      showToast('Failed to retrieve datasets index.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDatasets();
  }, []);

  // Handle Drag Events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle Drop Event
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await processUploadedFile(file);
    }
  };

  // Handle Input Select Event
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await processUploadedFile(file);
    }
  };

  // Process and Upload CSV File
  const processUploadedFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      showToast('Invalid format. Please select a comma-separated values (.csv) file.', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadingFileName(file.name);

    try {
      const summary = await uploadService.upload(file, (progress) => {
        setUploadProgress(progress);
      });
      
      showToast(`Successfully processed "${file.name}" dataset.`, 'success');
      
      // Reload datasets list
      const data = await uploadService.getDatasets();
      setDatasets(data);
      setSelectedDataset(summary);
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'CSV parse and validation pipeline failed.';
      showToast(errMsg, 'error');
    } finally {
      setIsUploading(false);
      setUploadingFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle Delete Dataset
  const handleDeleteDataset = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this dataset? This action is irreversible.')) {
      return;
    }

    try {
      await uploadService.deleteDataset(id);
      showToast('Dataset deleted successfully.', 'success');
      
      // Remove from states
      const updated = datasets.filter(ds => ds.id !== id);
      setDatasets(updated);
      
      if (selectedDataset?.id === id) {
        setSelectedDataset(updated.length > 0 ? updated[0] : null);
      }
    } catch (err) {
      showToast('Failed to delete selected dataset.', 'error');
    }
  };

  // Trigger File Input Click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Database className="h-6 w-6 text-emerald-600" />
            Dataset Upload & CSV Validation
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl">
            Ingest structured HR records to perform real-time diagnostic checks, class distribution balance ratios, and schema validations.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Uploader and List */}
        <div className="lg:col-span-5 space-y-6">
          {/* File Upload Dropzone */}
          <div
            id="dropzone-container"
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            className={`relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 group flex flex-col items-center justify-center min-h-[220px] ${
              dragActive 
                ? 'border-emerald-500 bg-emerald-50/40' 
                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".csv"
              className="hidden"
            />

            {isUploading ? (
              <div className="space-y-4 w-full max-w-xs">
                <Loader2 className="h-10 w-10 text-emerald-600 animate-spin mx-auto" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800 truncate">Uploading {uploadingFileName}</p>
                  <p className="text-xs text-slate-500">Parsing structure & checking features...</p>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-150"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <span className="text-xs font-semibold text-slate-600">{uploadProgress}% Complete</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-slate-100 group-hover:text-slate-700 mx-auto transition-colors">
                  <UploadCloud className="h-6 w-6 text-slate-400 group-hover:text-emerald-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900">
                    Drag & drop your CSV file here, or <span className="text-emerald-600 font-semibold group-hover:underline">browse</span>
                  </p>
                  <p className="text-xs text-slate-400">
                    Supports structured Comma-Separated Values (.csv) up to 10MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Uploaded Datasets Listing */}
          <Card>
            <CardHeader 
              title={`Workspace Datasets (${datasets.length})`}
              className="pb-2"
            />
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="h-6 w-6 text-slate-400 animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Retrieving operational records...</p>
                </div>
              ) : datasets.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <FileSpreadsheet className="h-8 w-8 text-slate-300 mx-auto" />
                  <p className="text-xs">No corporate datasets loaded in session workspace.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto">
                  {datasets.map((ds) => {
                    const isSelected = selectedDataset?.id === ds.id;
                    const isValid = ds.validationReport?.isValid ?? true;
                    return (
                      <div
                        key={ds.id}
                        onClick={() => setSelectedDataset(ds)}
                        className={`flex items-center justify-between p-4 cursor-pointer transition-colors text-left ${
                          isSelected 
                            ? 'bg-emerald-50/50 border-l-4 border-emerald-500' 
                            : 'hover:bg-slate-50 border-l-4 border-transparent'
                        }`}
                      >
                        <div className="space-y-1 min-w-0 pr-2">
                          <p className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                            <FileSpreadsheet className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            {ds.filename}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-slate-400 font-medium">
                            <span>{ds.rowCount} rows</span>
                            <span>&bull;</span>
                            <span>{ds.fileSizeKb} KB</span>
                            <span>&bull;</span>
                            <span className="flex items-center gap-0.5"><User className="h-2.5 w-2.5" /> {ds.uploadedBy || 'Operator'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isValid ? (
                            <Badge variant="success" className="text-[9px] px-1.5 py-0">Model Ready</Badge>
                          ) : (
                            <Badge variant="warning" className="text-[9px] px-1.5 py-0">Review needed</Badge>
                          )}
                          <button
                            onClick={(e) => handleDeleteDataset(ds.id, e)}
                            className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Delete Dataset"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Detailed CSV Validation & Analysis Report */}
        <div className="lg:col-span-7">
          {selectedDataset ? (
            <div className="space-y-6">
              {/* Report Header Overview */}
              <Card className="border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Retention Audit Diagnostic</span>
                    <h2 className="text-lg font-extrabold tracking-tight truncate max-w-md">{selectedDataset.filename}</h2>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(selectedDataset.uploadedAt).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    {(selectedDataset.validationReport?.isValid ?? true) ? (
                      <div className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Valid for ML Training
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-300 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Incomplete Schema
                      </div>
                    )}
                  </div>
                </div>

                {/* Metadata KPI Counters */}
                <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 bg-white">
                  <div className="p-4 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Features Checked</span>
                    <p className="text-xl font-extrabold text-slate-900 mt-1">{selectedDataset.columnCount}</p>
                  </div>
                  <div className="p-4 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Observations</span>
                    <p className="text-xl font-extrabold text-slate-900 mt-1">{selectedDataset.rowCount}</p>
                  </div>
                  <div className="p-4 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Missing Values</span>
                    <p className="text-xl font-extrabold text-slate-900 mt-1">
                      {selectedDataset.validationReport?.totalMissingValues ?? 0}
                    </p>
                  </div>
                </div>

                {/* Class Distribution Section */}
                <div className="p-6 bg-white space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <TrendingDown className="h-3.5 w-3.5 text-slate-400" />
                      Target Class Balance (Attrition Yes vs No)
                    </h3>
                    <span className="text-xs font-medium text-slate-500">
                      Attrition Event Rate: {selectedDataset.rowCount > 0 ? Math.round((selectedDataset.classDistribution.attrited / selectedDataset.rowCount) * 100) : 0}%
                    </span>
                  </div>

                  {/* Horizontal visual balance meter */}
                  {selectedDataset.rowCount > 0 && (
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-slate-100 rounded-lg flex overflow-hidden shadow-inner">
                        <div 
                          className="bg-emerald-500 h-full transition-all duration-300 relative group"
                          style={{ width: `${(selectedDataset.classDistribution.retained / selectedDataset.rowCount) * 100}%` }}
                          title={`Retained: ${selectedDataset.classDistribution.retained} employees`}
                        ></div>
                        <div 
                          className="bg-rose-500 h-full transition-all duration-300 relative group"
                          style={{ width: `${(selectedDataset.classDistribution.attrited / selectedDataset.rowCount) * 100}%` }}
                          title={`Attrited: ${selectedDataset.classDistribution.attrited} employees`}
                        ></div>
                      </div>

                      <div className="flex justify-between items-center text-xs text-slate-600 font-semibold pt-1">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                          <span>Retained ({selectedDataset.classDistribution.retained} rows, {Math.round((selectedDataset.classDistribution.retained / selectedDataset.rowCount) * 100)}%)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                          <span>Attrited ({selectedDataset.classDistribution.attrited} rows, {Math.round((selectedDataset.classDistribution.attrited / selectedDataset.rowCount) * 100)}%)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Data quality alerts */}
              {selectedDataset.validationReport?.warnings && selectedDataset.validationReport.warnings.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Diagnostic Warnings</h3>
                  <div className="space-y-2">
                    {selectedDataset.validationReport.warnings.map((warning, index) => {
                      const bgClass = warning.severity === 'High' 
                        ? 'bg-rose-50 border-rose-100' 
                        : warning.severity === 'Medium' 
                          ? 'bg-amber-50 border-amber-100' 
                          : 'bg-slate-50 border-slate-100';

                      const badgeClass = warning.severity === 'High' 
                        ? 'bg-rose-100 text-rose-800' 
                        : warning.severity === 'Medium' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-slate-200 text-slate-800';

                      return (
                        <div key={index} className={`p-4 rounded-xl border flex gap-3 items-start text-left ${bgClass}`}>
                          <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${
                            warning.severity === 'High' ? 'text-rose-500' : warning.severity === 'Medium' ? 'text-amber-500' : 'text-slate-500'
                          }`} />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${badgeClass}`}>
                                {warning.severity} Risk
                              </span>
                              <span className="text-xs font-bold text-slate-800">Field: {warning.field}</span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">{warning.message}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CSV Data Preview Table */}
              {selectedDataset.validationReport?.previewRows && selectedDataset.validationReport.previewRows.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Interactive Preview (First 5 Rows)</h3>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Diagnostic Mode</span>
                  </div>
                  <Card className="overflow-hidden border border-slate-150">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/75 border-b border-slate-200">
                            {Object.keys(selectedDataset.validationReport.previewRows[0]).slice(0, 7).map((header) => (
                              <th key={header} className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                                {header}
                              </th>
                            ))}
                            {Object.keys(selectedDataset.validationReport.previewRows[0]).length > 7 && (
                              <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                                + {Object.keys(selectedDataset.validationReport.previewRows[0]).length - 7} more
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {selectedDataset.validationReport.previewRows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-50/50">
                              {Object.entries(row).slice(0, 7).map(([key, value], cIdx) => (
                                <td key={cIdx} className="p-3 text-xs text-slate-600 font-medium whitespace-nowrap">
                                  {key.toLowerCase() === 'attrition' ? (
                                    <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                                      String(value).toLowerCase() === 'yes' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                                    }`}>
                                      {String(value)}
                                    </span>
                                  ) : (
                                    String(value)
                                  )}
                                </td>
                              ))}
                              {Object.keys(row).length > 7 && (
                                <td className="p-3 text-xs text-slate-400 italic">
                                  ...
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400 space-y-4 shadow-sm">
              <Database className="h-12 w-12 text-slate-300 mx-auto animate-pulse" />
              <div className="space-y-1.5 max-w-sm mx-auto">
                <p className="text-sm font-bold text-slate-900">No Dataset Audited</p>
                <p className="text-xs">
                  Load or select an uploaded corporate CSV dataset from the left panel to execute retention checks, warning analysis, and preview distributions.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
