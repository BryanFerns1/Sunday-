import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Command, Check } from 'lucide-react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HeroSection from './components/HeroSection';
import IngestionHub from './components/IngestionHub';
import RightPanel from './components/RightPanel';
import ConfigMatrix from './components/ConfigMatrix';
import GenerationStudio from './components/GenerationStudio';
import RefineDrawer from './components/RefineDrawer';
import HistoryModal from './components/HistoryModal';
import ExportCenter from './components/ExportCenter';
import { transformContent, checkHealth, fetchModelStatus } from './services/api';
import { PRESET_SOURCES } from './utils/presets';
import bg1Img from './assets/bg1.png';

export default function App() {
  const defaultPreset = PRESET_SOURCES[0];

  // Ingestion State
  const [sourceTitle, setSourceTitle] = useState(defaultPreset.title);
  const [sourceContent, setSourceContent] = useState(defaultPreset.content);
  const [sourceType, setSourceType] = useState('preset');
  const [securityClassification, setSecurityClassification] = useState(defaultPreset.classification || 'CONFIDENTIAL');

  // Active navigation state for left sidebar
  const [activeNav, setActiveNav] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Transformation Parameters State
  const [parameters, setParameters] = useState({
    selected_formats: ["advisory", "executive_summary", "presentation", "video_package", "infographic", "linkedin_post", "twitter_thread"],
    audience: defaultPreset.audience || "Cybersecurity Analysts & Threat Hunters",
    tone: defaultPreset.tone || "Critical & High Alert",
    language: "English",
    detail_level: "Standard (Comprehensive Overview)",
    objective: defaultPreset.objective || "Alert, Warn & Mitigate Threat",
    style: "Sunday Standard",
    security_classification: defaultPreset.classification || "CONFIDENTIAL",
    custom_instructions: ""
  });

  // Generation & Modals State
  const [isTransforming, setIsTransforming] = useState(false);
  const [response, setResponse] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [modelStatus, setModelStatus] = useState(null);
  const [refineModal, setRefineModal] = useState({ open: false, type: null, content: null });
  const [historyOpen, setHistoryOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [errorToast, setErrorToast] = useState(null);

  useEffect(() => {
    checkHealth().then(setSystemStatus).catch(console.error);
    fetchModelStatus().then(setModelStatus).catch(console.error);
    // Keep the connectivity / provider badges fresh
    const intervalId = setInterval(() => {
      checkHealth().then(setSystemStatus).catch(() => {});
      fetchModelStatus().then(setModelStatus).catch(() => {});
    }, 15000);
    return () => clearInterval(intervalId);
  }, []);

  const wordCount = sourceContent.trim() ? sourceContent.trim().split(/\s+/).length : 0;
  const formatCount = parameters.selected_formats?.length || 0;
  const step = response ? 3 : (sourceContent.trim() ? 2 : 1);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { 
        e.preventDefault(); 
        handleTransform(); 
      }
      if (e.key === 'Escape') setErrorToast(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sourceContent, parameters, sourceTitle, sourceType, securityClassification]);

  // Workflow Step State: 1 = Source Ingestion, 2 = Transformation Matrix, 3 = Generation Studio
  const [currentStep, setCurrentStep] = useState(1);

  const handleApplyPreset = (preset) => {
    setSourceTitle(preset.title);
    setSourceContent(preset.content);
    setSourceType('preset');
    setSecurityClassification(preset.classification || 'CONFIDENTIAL');
    setParameters(prev => ({
      ...prev,
      selected_formats: preset.default_formats || prev.selected_formats,
      audience: preset.audience || prev.audience,
      tone: preset.tone || prev.tone,
      objective: preset.objective || prev.objective,
      security_classification: preset.classification || 'CONFIDENTIAL'
    }));
  };

  const handleQuickAction = (format) => {
    if (format === 'generate') {
      if (!sourceContent.trim()) {
        setErrorToast('Please provide source intelligence content to transform.');
        return;
      }
      handleTransform();
      return;
    }

    if (format === 'social_post') {
      setParameters(prev => ({
        ...prev,
        selected_formats: ["linkedin_post", "twitter_thread"]
      }));
    } else if (format) {
      setParameters(prev => ({
        ...prev,
        selected_formats: [format]
      }));
    }

    // Advance to screen 2 to view/adjust transformation matrix
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTransform = async () => {
    if (!sourceContent.trim()) {
      setErrorToast('Please provide source intelligence content to transform.');
      return;
    }
    if (!parameters.selected_formats || parameters.selected_formats.length === 0) {
      setErrorToast('Please select at least one deliverable format in the matrix.');
      return;
    }

    setIsTransforming(true);
    setErrorToast(null);

    try {
      const payload = {
        source_title: sourceTitle,
        source_content: sourceContent,
        source_type: sourceType,
        parameters: {
          ...parameters,
          security_classification: securityClassification
        }
      };

      const result = await transformContent(payload);
      setResponse(result);
      setCurrentStep(3);

      // Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 75,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setErrorToast(err.response?.data?.detail || 'Transformation failed. Falling back to offline defense synthesis.');
    } finally {
      setIsTransforming(false);
      fetchModelStatus().then(setModelStatus).catch(() => {});
    }
  };

  const handleUpdateArtefact = (type, updatedContent) => {
    if (!response) return;
    setResponse(prev => ({
      ...prev,
      generated_artefacts: {
        ...prev.generated_artefacts,
        [type]: updatedContent
      }
    }));
  };

  const handleReset = () => {
    if (window.confirm('Reset all parameters and source inputs to default?')) {
      handleApplyPreset(PRESET_SOURCES[0]);
      setResponse(null);
      setCurrentStep(1);
      setActiveNav('home');
    }
  };

  const handleStepNavigation = (targetStep) => {
    if (targetStep === 1) {
      setCurrentStep(1);
      setActiveNav('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (targetStep === 2) {
      if (!sourceContent.trim()) {
        setErrorToast('Please provide source intelligence content before configuring the Transformation Matrix.');
        return;
      }
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (targetStep === 3) {
      if (response) {
        setCurrentStep(3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        handleTransform();
      }
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col font-sans selection:bg-[#ff7a00]/30 selection:text-white"
      style={{
        backgroundColor: '#050811',
        backgroundImage: `linear-gradient(to bottom, rgba(5, 8, 17, 0.84) 0%, rgba(5, 8, 17, 0.95) 100%), url(${bg1Img})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Top Navbar */}
      <Header
        securityClassification={securityClassification}
        setSecurityClassification={setSecurityClassification}
        systemStatus={systemStatus}
        modelStatus={modelStatus}
        onOpenHistory={() => setHistoryOpen(true)}
        onOpenExport={() => setExportOpen(true)}
        onReset={handleReset}
        hasGeneratedResults={!!response}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        onNavigateStep={handleStepNavigation}
      />

      <div className="flex-1 flex w-full">
        {/* Left Fixed Sidebar */}
        <Sidebar
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          onOpenHistory={() => setHistoryOpen(true)}
          onQuickAction={handleQuickAction}
          onNavigateStep={handleStepNavigation}
          mobileOpen={mobileMenuOpen}
          setMobileOpen={setMobileMenuOpen}
        />

        {/* Main Content Workspace with sidebar offset on desktop */}
        <main className="flex-1 w-full lg:pl-56 transition-all duration-300">
          <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            
            {/* Error Toast */}
            {errorToast && (
              <div role="alert" className="p-3.5 pl-4 bg-red-950/80 border border-red-500/40 rounded-xl text-xs sm:text-sm text-red-200 flex items-center justify-between shadow-lg backdrop-blur-md">
                <span>{errorToast}</span>
                <button onClick={() => setErrorToast(null)} aria-label="Dismiss error" className="text-red-300 hover:text-white ml-3 text-lg leading-none">&times;</button>
              </div>
            )}

            {/* Screen 1: Multi-Modal Source Ingestion Screen */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-up">
                {/* Hero Section with Heading, BG2, and Overview Metric Cards */}
                <HeroSection
                  wordCount={wordCount}
                  formatCount={formatCount}
                  securityClassification={securityClassification}
                  systemStatus={systemStatus}
                />

                {/* Main Content Workspace & Right Panel (Two-Column Layout) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Multi-Modal Source Ingestion (~75% width on desktop) */}
                  <div className="lg:col-span-8 xl:col-span-9">
                    <IngestionHub
                      sourceTitle={sourceTitle}
                      setSourceTitle={setSourceTitle}
                      sourceContent={sourceContent}
                      setSourceContent={setSourceContent}
                      sourceType={sourceType}
                      setSourceType={setSourceType}
                      onApplyPreset={handleApplyPreset}
                      onNextStep={handleStepNavigation}
                      step={currentStep}
                    />
                  </div>

                  {/* Right Column: Quick Actions & Impact Card (~25% width on desktop) */}
                  <div className="lg:col-span-4 xl:col-span-3">
                    <RightPanel
                      onQuickAction={handleQuickAction}
                      onTransform={handleTransform}
                      isTransforming={isTransforming}
                      hasContent={!!sourceContent.trim()}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Screen 2: Configurable Output Transformation Matrix Screen */}
            {currentStep === 2 && (
              <div id="transformation-matrix" className="animate-fade-up">
                <ConfigMatrix
                  parameters={parameters}
                  setParameters={setParameters}
                  onTransform={handleTransform}
                  isTransforming={isTransforming}
                  disabled={!sourceContent.trim()}
                  onBack={() => handleStepNavigation(1)}
                  onNavigateStep={handleStepNavigation}
                  sourceTitle={sourceTitle}
                  sourceType={sourceType}
                  securityClassification={securityClassification}
                  wordCount={wordCount}
                  response={response}
                />
              </div>
            )}

            {/* Screen 3: Generation Studio & Multi-Artefact Viewer Screen */}
            {currentStep === 3 && (
              <div id="generation-studio-section" className="animate-fade-up">
                {response ? (
                  <GenerationStudio
                    response={response}
                    sourceContent={sourceContent}
                    sourceTitle={sourceTitle}
                    onOpenRefine={(type, content) => setRefineModal({ open: true, type, content })}
                    onOpenExport={() => setExportOpen(true)}
                    onUpdateArtefact={handleUpdateArtefact}
                    onNavigateStep={handleStepNavigation}
                    onBackToMatrix={() => handleStepNavigation(2)}
                    onNewIngestion={() => handleStepNavigation(1)}
                  />
                ) : (
                  <div className="rounded-2xl border border-[#1b233a] bg-gradient-to-b from-[#0d1222]/95 to-[#090d18]/95 p-8 text-center space-y-4">
                    <p className="text-zinc-400 text-sm">No deliverables generated yet.</p>
                    <button
                      onClick={() => handleStepNavigation(2)}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-zinc-950 bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-110 shadow-[0_0_15px_rgba(255,122,0,0.3)] transition"
                    >
                      Return to Transformation Matrix
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Drawers and Modals */}
      <RefineDrawer
        isOpen={refineModal.open}
        onClose={() => setRefineModal({ open: false, type: null, content: null })}
        activeArtefactType={refineModal.type}
        currentArtefactContent={refineModal.content}
        onUpdateArtefact={handleUpdateArtefact}
      />

      <HistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onLoadHistoryItem={(h) => {
          setResponse(h);
          setSourceTitle(h.source_title);
          setSecurityClassification(h.security_classification);
          setCurrentStep(3);
        }}
      />

      <ExportCenter
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        artefacts={response?.generated_artefacts || {}}
        sourceTitle={sourceTitle}
        securityClassification={securityClassification}
      />

      {/* Subtle Footer */}
      <footer className="border-t border-[#161d31] py-4 px-6 text-center text-xs text-zinc-500 lg:pl-56">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-zinc-400">
            <Command className="w-3 h-3" /> + Enter to generate
          </span>
          <span className="text-zinc-600">&bull;</span>
          <span className="text-zinc-400">Sunday Content Transformation Studio</span>
          <span className="text-zinc-600">&bull;</span>
          <span className="text-[#ff9e2c]">Confidential Defense Synthesis</span>
        </div>
      </footer>
    </div>
  );
}
