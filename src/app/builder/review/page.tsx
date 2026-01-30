'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Zap, DollarSign, Shield, Cpu, AlertTriangle, CheckCircle, XCircle, Loader2, Sparkles, Share2, ArrowRight } from 'lucide-react';
import { Build, evaluateCompatibility, CompatibilityReport, Issue } from '@/lib/compatibility';
import { Badge } from '@/components/shared/Badge';
import { CompatiblePartsSheet } from '@/components/builder/CompatiblePartsSheet';

function formatINR(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

interface CompatiblePart {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  specs: Record<string, unknown>;
  image_url?: string;
}

interface AIExplanation {
  issue_explanations: Array<{
    id: string;
    summary: string;
    why_it_matters: string;
    fixes: Array<{
      title: string;
      detail: string;
      impact: 'low' | 'medium' | 'high';
    }>;
    compatible_parts?: CompatiblePart[];
  }>;
  overall_advice: {
    one_liner: string;
    top_3_actions: string[];
  };
}

const mockBuild: Build = {
  name: 'Gaming Build',
  parts: {
    cpu: {
      id: 'cpu-1',
      category: 'cpu',
      brand: 'AMD',
      name: 'Ryzen 7 5800X',
      price: 24999,
      specs: { socket: 'am4', tdp: 105, cores: 8, threads: 16 },
    },
    gpu: {
      id: 'gpu-1',
      category: 'gpu',
      brand: 'NVIDIA',
      name: 'RTX 4070',
      price: 54999,
      specs: { vram: 12, tdp: 200, length_mm: 300 },
    },
    motherboard: {
      id: 'mb-1',
      category: 'motherboard',
      brand: 'ASUS',
      name: 'ROG Strix B550-F',
      price: 17999,
      specs: { socket: 'am4', ram_type: 'ddr4', form_factor: 'ATX' },
    },
    ram: {
      id: 'ram-1',
      category: 'ram',
      brand: 'Corsair',
      name: 'Vengeance LPX 32GB',
      price: 8499,
      specs: { type: 'ddr4', capacity_gb: 32, speed_mhz: 3200 },
    },
    storage: {
      id: 'storage-1',
      category: 'storage',
      brand: 'Samsung',
      name: '980 Pro 1TB',
      price: 9999,
      specs: { type: 'NVMe', capacity_gb: 1000 },
    },
    psu: {
      id: 'psu-1',
      category: 'psu',
      brand: 'Corsair',
      name: 'RM750',
      price: 8999,
      specs: { wattage: 750, efficiency: '80+ Gold' },
    },
    case: {
      id: 'case-1',
      category: 'case',
      brand: 'NZXT',
      name: 'H510',
      price: 6999,
      specs: { max_gpu_length: 381, form_factor: 'ATX' },
    },
    cooling: {
      id: 'cool-1',
      category: 'cooling',
      brand: 'Noctua',
      name: 'NH-D15',
      price: 8999,
      specs: { type: 'Air', tdp_rating: 250 },
    },
  },
  currency: 'INR',
};

function SeverityIcon({ severity }: { severity: Issue['severity'] }) {
  switch (severity) {
    case 'pass':
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    case 'warn':
      return <AlertTriangle className="w-5 h-5 text-amber-400" />;
    case 'fail':
      return <XCircle className="w-5 h-5 text-red-400" />;
  }
}

export default function ReviewPage() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [build, setBuild] = useState<Build | null>(null);
  const [report, setReport] = useState<CompatibilityReport | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<AIExplanation | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSource, setAiSource] = useState<'deepseek' | 'fallback' | null>(null);

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<{
    title: string;
    parts: CompatiblePart[];
  } | null>(null);

  useEffect(() => {
    const storedBuild = localStorage.getItem('currentBuild');
    if (storedBuild) {
      try {
        const parsed = JSON.parse(storedBuild);
        setBuild(parsed);
      } catch {
        setBuild(mockBuild);
      }
    } else {
      setBuild(mockBuild);
    }
  }, []);

  useEffect(() => {
    if (build) {
      const result = evaluateCompatibility(build);
      setReport(result);
    }
  }, [build]);

  // Fetch AI explanation when report is ready
  useEffect(() => {
    if (build && report) {
      const fetchAIExplanation = async () => {
        setAiLoading(true);
        try {
          const response = await fetch('/api/compatibility/explain', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ build, report }),
          });

          const data = await response.json();

          if (data.success && data.explanation) {
            setAiExplanation(data.explanation);
            setAiSource(data.source);
          }
        } catch (error) {
          console.error('Failed to get AI explanation:', error);
        } finally {
          setAiLoading(false);
        }
      };

      fetchAIExplanation();
    }
  }, [build, report]);

  const handleShare = async () => {
    if (!build) return;

    setIsSharing(true);
    try {
      const response = await fetch('/api/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(build),
      });

      const data = await response.json();

      if (data.success && data.id) {
        router.push(`/build/${data.id}`);
      }
    } catch (error) {
      console.error('Failed to share build:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleShowCompatibleParts = (issueId: string, issueTitle: string) => {
    const issueExp = aiExplanation?.issue_explanations.find((e) => e.id === issueId);
    if (issueExp?.compatible_parts && issueExp.compatible_parts.length > 0) {
      setSelectedIssue({
        title: issueTitle,
        parts: issueExp.compatible_parts,
      });
      setSheetOpen(true);
    }
  };

  const handleSelectPart = (part: CompatiblePart) => {
    if (!build) return;

    // Update the build with the new part
    const updatedBuild = {
      ...build,
      parts: {
        ...build.parts,
        [part.category]: {
          id: part.id,
          category: part.category,
          brand: part.brand,
          name: part.name,
          price: part.price,
          specs: part.specs,
          image_url: part.image_url,
        },
      },
    };

    // Save to localStorage
    localStorage.setItem('currentBuild', JSON.stringify(updatedBuild));

    // Navigate back to builder
    router.push('/builder');
  };

  const { failIssues, warnIssues, passIssues } = useMemo(() => {
    if (!report) return { failIssues: [], warnIssues: [], passIssues: [] };
    return {
      failIssues: report.issues.filter((i) => i.severity === 'fail'),
      warnIssues: report.issues.filter((i) => i.severity === 'warn'),
      passIssues: report.issues.filter((i) => i.severity === 'pass'),
    };
  }, [report]);

  const getAIExplanationForIssue = (issueId: string) => {
    return aiExplanation?.issue_explanations.find((e) => e.id === issueId);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0 : 0.4 },
    },
  };

  if (!build || !report) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
      </div>
    );
  }

  const scoreColor =
    report.score >= 80
      ? 'text-green-400'
      : report.score >= 50
      ? 'text-amber-400'
      : 'text-red-400';

  const hasErrors = failIssues.length > 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="fixed inset-0 bg-gradient-radial from-white/[0.02] via-transparent to-transparent pointer-events-none" />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/builder"
              className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Back to Builder</span>
            </Link>
          </div>
          <h1 className="text-white font-semibold">Review Build</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32 lg:pb-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {build.name || 'Your Build'}
            </h2>
            <p className="text-white/50">
              {report.partsCount} parts selected
            </p>
          </motion.div>

          {/* AI Overall Advice */}
          {aiExplanation && (
            <motion.div
              variants={itemVariants}
              className="p-4 rounded-2xl border border-purple-500/20 bg-purple-500/5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-medium text-purple-400">
                  AI Analysis {aiSource === 'deepseek' ? '(DeepSeek)' : ''}
                </span>
              </div>
              <p className="text-white font-medium mb-3">{aiExplanation.overall_advice.one_liner}</p>
              {aiExplanation.overall_advice.top_3_actions.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs text-white/50 uppercase tracking-wide">Top Actions</p>
                  {aiExplanation.overall_advice.top_3_actions.map((action, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-white/70">
                      <span className="text-purple-400 font-medium">{i + 1}.</span>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {aiLoading && (
            <motion.div
              variants={itemVariants}
              className="p-4 rounded-2xl border border-white/10 bg-white/5"
            >
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                <span className="text-white/70">Getting AI analysis...</span>
              </div>
            </motion.div>
          )}

          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
          >
            <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
              <div className="flex items-center gap-2 text-white/50 mb-2">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wide">Total Price</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white">
                {formatINR(report.totalPrice)}
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
              <div className="flex items-center gap-2 text-white/50 mb-2">
                <Zap className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wide">Est. Wattage</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white">
                {report.estimatedWattage}W
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
              <div className="flex items-center gap-2 text-white/50 mb-2">
                <Cpu className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wide">Rec. PSU</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white">
                {report.recommendedPSU}W
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
              <div className="flex items-center gap-2 text-white/50 mb-2">
                <Shield className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wide">Score</span>
              </div>
              <div className={`text-xl sm:text-2xl font-bold ${scoreColor}`}>
                {report.score}/100
              </div>
            </div>
          </motion.div>

          {failIssues.length > 0 && (
            <motion.div variants={itemVariants} className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="fail" size="sm">
                  {failIssues.length} Critical
                </Badge>
                <span className="text-sm text-white/50">Must be resolved</span>
              </div>
              <AnimatePresence>
                {failIssues.map((issue, index) => {
                  const aiExp = getAIExplanationForIssue(issue.id);
                  const hasCompatibleParts = (aiExp?.compatible_parts?.length || 0) > 0;

                  return (
                    <motion.div
                      key={issue.id}
                      initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-xl border border-red-500/20 bg-red-500/5"
                    >
                      <div className="flex items-start gap-3">
                        <SeverityIcon severity={issue.severity} />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white">{issue.title}</h4>
                          <p className="text-sm text-white/60 mt-1">
                            {aiExp?.summary || issue.detail}
                          </p>
                          {aiExp?.why_it_matters && (
                            <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                              <p className="text-xs text-red-400 uppercase tracking-wide mb-1">
                                Why It Matters
                              </p>
                              <p className="text-sm text-white/80">{aiExp.why_it_matters}</p>
                            </div>
                          )}
                          <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10">
                            <p className="text-xs text-white/50 uppercase tracking-wide mb-1">
                              Suggested Fix
                            </p>
                            <p className="text-sm text-white/80">
                              {aiExp?.fixes?.[0]?.detail || issue.suggestedFix}
                            </p>
                          </div>

                          {/* Show Compatible Parts Button */}
                          {hasCompatibleParts && (
                            <button
                              onClick={() => handleShowCompatibleParts(issue.id, issue.title)}
                              className="mt-3 w-full py-2.5 px-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium hover:bg-green-500/20 transition-colors flex items-center justify-center gap-2"
                            >
                              View {aiExp?.compatible_parts?.length} Compatible Parts
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}

          {warnIssues.length > 0 && (
            <motion.div variants={itemVariants} className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="warn" size="sm">
                  {warnIssues.length} Warning{warnIssues.length > 1 ? 's' : ''}
                </Badge>
                <span className="text-sm text-white/50">Consider addressing</span>
              </div>
              <AnimatePresence>
                {warnIssues.map((issue, index) => {
                  const aiExp = getAIExplanationForIssue(issue.id);
                  const hasCompatibleParts = (aiExp?.compatible_parts?.length || 0) > 0;

                  return (
                    <motion.div
                      key={issue.id}
                      initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5"
                    >
                      <div className="flex items-start gap-3">
                        <SeverityIcon severity={issue.severity} />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white">{issue.title}</h4>
                          <p className="text-sm text-white/60 mt-1">
                            {aiExp?.summary || issue.detail}
                          </p>
                          {aiExp?.why_it_matters && (
                            <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                              <p className="text-xs text-amber-400 uppercase tracking-wide mb-1">
                                Why It Matters
                              </p>
                              <p className="text-sm text-white/80">{aiExp.why_it_matters}</p>
                            </div>
                          )}
                          <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10">
                            <p className="text-xs text-white/50 uppercase tracking-wide mb-1">
                              Suggested Fix
                            </p>
                            <p className="text-sm text-white/80">
                              {aiExp?.fixes?.[0]?.detail || issue.suggestedFix}
                            </p>
                          </div>

                          {/* Show Compatible Parts Button */}
                          {hasCompatibleParts && (
                            <button
                              onClick={() => handleShowCompatibleParts(issue.id, issue.title)}
                              className="mt-3 w-full py-2.5 px-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium hover:bg-green-500/20 transition-colors flex items-center justify-center gap-2"
                            >
                              View {aiExp?.compatible_parts?.length} Compatible Parts
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}

          {passIssues.length > 0 && (
            <motion.div variants={itemVariants} className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="pass" size="sm">
                  {passIssues.length} Passed
                </Badge>
                <span className="text-sm text-white/50">All good</span>
              </div>
              <div className="grid gap-2">
                {passIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-3 rounded-xl border border-green-500/10 bg-green-500/5 flex items-center gap-3"
                  >
                    <SeverityIcon severity={issue.severity} />
                    <div>
                      <span className="text-sm font-medium text-white">{issue.title}</span>
                      <span className="text-sm text-white/50 ml-2">{issue.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            variants={itemVariants}
            className="hidden lg:flex items-center gap-4 pt-4"
          >
            <motion.button
              onClick={handleShare}
              disabled={isSharing || hasErrors}
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              className="flex-1 py-3 px-6 rounded-xl bg-white text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-white/90 flex items-center justify-center gap-2"
            >
              {isSharing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Link...
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  Share Build Link
                </>
              )}
            </motion.button>
            <Link
              href="/builder"
              className="py-3 px-6 rounded-xl border border-white/20 text-white font-medium hover:bg-white/5 transition-colors"
            >
              Back to Builder
            </Link>
          </motion.div>

          {hasErrors && (
            <motion.p variants={itemVariants} className="hidden lg:block text-sm text-red-400">
              Resolve critical issues before sharing your build.
            </motion.p>
          )}
        </motion.div>
      </main>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a] border-t border-white/10 p-4 safe-area-inset-bottom">
        <div className="flex flex-col gap-2">
          {hasErrors && (
            <p className="text-xs text-red-400 text-center">
              Resolve critical issues before sharing
            </p>
          )}
          <div className="flex gap-3">
            <Link
              href="/builder"
              className="py-3 px-4 rounded-xl border border-white/20 text-white font-medium hover:bg-white/5 transition-colors"
            >
              Back
            </Link>
            <motion.button
              onClick={handleShare}
              disabled={isSharing || hasErrors}
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              className="flex-1 py-3 px-6 rounded-xl bg-white text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSharing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  Share Build Link
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Compatible Parts Sheet */}
      {selectedIssue && (
        <CompatiblePartsSheet
          isOpen={sheetOpen}
          onClose={() => {
            setSheetOpen(false);
            setSelectedIssue(null);
          }}
          issueTitle={selectedIssue.title}
          parts={selectedIssue.parts}
          onSelectPart={handleSelectPart}
        />
      )}
    </div>
  );
}
