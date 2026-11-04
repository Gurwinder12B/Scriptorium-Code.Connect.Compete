import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { problemsApi, submissionsApi } from '../services/api';
import { Problem, Submission } from '../types';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Badge } from '../components/common/Badge';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Layers,
  Sparkles,
  ArrowLeft,
  Terminal,
  AlertTriangle,
} from 'lucide-react';

export const ProblemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editor State
  const [selectedLanguage, setSelectedLanguage] = useState<string>('python');
  const [sourceCode, setSourceCode] = useState<string>('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [latestSubmission, setLatestSubmission] = useState<Submission | null>(null);
  const [activeTab, setActiveTab] = useState<'statement' | 'submissions'>('statement');
  const [userSubmissions, setUserSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    async function loadProblem() {
      if (!id) return;
      try {
        const data = await problemsApi.getProblem(id);
        setProblem(data);
        // Load starter template
        const template = data.starter_templates?.[selectedLanguage] || '# Write your solution here\n';
        setSourceCode(template);
      } catch (err: any) {
        setError(err.message || 'Failed to load problem.');
      } finally {
        setLoading(false);
      }
    }
    loadProblem();
  }, [id]);

  // When language changes, update starter template
  const handleLanguageChange = (newLang: string) => {
    setSelectedLanguage(newLang);
    if (problem?.starter_templates?.[newLang]) {
      setSourceCode(problem.starter_templates[newLang]);
    } else {
      if (newLang === 'javascript') {
        setSourceCode('// JavaScript solution template\n');
      } else if (newLang === 'cpp') {
        setSourceCode('#include <iostream>\nusing namespace std;\nint main() {\n    return 0;\n}\n');
      } else {
        setSourceCode('# Python solution template\n');
      }
    }
  };

  const handleResetCode = () => {
    if (problem?.starter_templates?.[selectedLanguage]) {
      setSourceCode(problem.starter_templates[selectedLanguage]);
    } else {
      setSourceCode('');
    }
  };

  const handleSubmitCode = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to submit your solution.');
      return;
    }
    if (!problem || !sourceCode.trim()) return;

    setIsSubmitting(true);
    try {
      const sub = await submissionsApi.submitCode({
        problem_id: problem.id,
        language: selectedLanguage,
        source_code: sourceCode,
      });
      setLatestSubmission(sub);
      // Reload problem data to refresh acceptance rate and user solve state
      const updatedProblem = await problemsApi.getProblem(problem.id);
      setProblem(updatedProblem);
    } catch (err: any) {
      alert(err.message || 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadSubmissionsHistory = async () => {
    if (!problem || !isAuthenticated) return;
    try {
      const history = await submissionsApi.listSubmissions(problem.id);
      setUserSubmissions(history);
    } catch (e) {
      console.error('Failed to load submission history:', e);
    }
  };

  if (loading) return <LoadingSpinner text="Loading coding environment..." />;
  if (error || !problem) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Problem Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">{error || 'This problem might not be available.'}</p>
        <Link to="/problems" className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold">
          Return to Library
        </Link>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-slate-100">
      {/* Top Problem Navigation & Control Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-4">
          <Link
            to="/problems"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            title="Back to Problems"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-slate-900">
              {problem.id}. {problem.title}
            </h1>
            <Badge
              variant={
                problem.difficulty === 'EASY'
                  ? 'easy'
                  : problem.difficulty === 'MEDIUM'
                  ? 'medium'
                  : 'hard'
              }
            >
              {problem.difficulty}
            </Badge>
            {problem.user_status === 'SOLVED' && (
              <Badge variant="success" size="sm">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Solved
              </Badge>
            )}
          </div>
        </div>

        {/* Right Action Area: Language Selector & Submit */}
        <div className="flex items-center space-x-3">
          <select
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="python">Python 3</option>
            <option value="javascript">JavaScript (Node)</option>
            <option value="cpp">C++ (GCC)</option>
          </select>

          <button
            onClick={handleResetCode}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            title="Reset to starter template"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleSubmitCode}
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition disabled:opacity-50 gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {isSubmitting ? 'Evaluating...' : 'Submit Code'}
          </button>
        </div>
      </div>

      {/* Main Split-Pane Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Pane: Problem Statement / Submissions History */}
        <div className="w-full lg:w-1/2 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
          {/* Statement / Submissions Tab Bar */}
          <div className="flex border-b border-slate-200 px-6 pt-2 bg-slate-50 shrink-0">
            <button
              onClick={() => setActiveTab('statement')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
                activeTab === 'statement'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Problem Description
            </button>
            <button
              onClick={() => {
                setActiveTab('submissions');
                loadSubmissionsHistory();
              }}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
                activeTab === 'submissions'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              My Submissions
            </button>
          </div>

          {/* Left Pane Content Area */}
          <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6">
            {activeTab === 'statement' ? (
              <>
                <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {problem.description_markdown}
                </div>

                {/* Input / Output Formats */}
                <div className="space-y-4 pt-4 border-t border-slate-100 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-1">Input Format</h4>
                    <pre className="p-3 bg-slate-50 rounded-lg text-slate-700 font-mono whitespace-pre-wrap border border-slate-200">
                      {problem.input_format}
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-1">Output Format</h4>
                    <pre className="p-3 bg-slate-50 rounded-lg text-slate-700 font-mono whitespace-pre-wrap border border-slate-200">
                      {problem.output_format}
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-1">Constraints</h4>
                    <pre className="p-3 bg-slate-50 rounded-lg text-slate-700 font-mono whitespace-pre-wrap border border-slate-200">
                      {problem.constraints}
                    </pre>
                  </div>
                </div>

                {/* Sample Test Cases */}
                {problem.sample_test_cases && problem.sample_test_cases.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Sample Test Cases
                    </h4>
                    {problem.sample_test_cases.map((tc, idx) => (
                      <div key={tc.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                        <p className="font-bold text-slate-700">Example {idx + 1}:</p>
                        <div className="space-y-1">
                          <span className="text-slate-400 font-medium">Input:</span>
                          <pre className="p-2 bg-white rounded border border-slate-200 font-mono text-slate-800">
                            {tc.input_data}
                          </pre>
                        </div>
                        <div className="space-y-1">
                          <span className="text-slate-400 font-medium">Expected Output:</span>
                          <pre className="p-2 bg-white rounded border border-slate-200 font-mono text-slate-800">
                            {tc.expected_output}
                          </pre>
                        </div>
                        {tc.explanation && (
                          <p className="text-slate-500 italic mt-1">
                            <span className="font-medium">Explanation:</span> {tc.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Submissions History */
              <div className="space-y-3">
                {userSubmissions.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">
                    No submissions yet for this challenge.
                  </p>
                ) : (
                  userSubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        {sub.status === 'ACCEPTED' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-500" />
                        )}
                        <div>
                          <p className={`font-bold ${sub.status === 'ACCEPTED' ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {sub.status}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(sub.created_at).toLocaleString()} &bull; {sub.language}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-slate-500">
                        {sub.execution_time_ms ? `${sub.execution_time_ms} ms` : ''}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Monaco Editor & Submission Result Output Console */}
        <div className="w-full lg:w-1/2 flex flex-col overflow-hidden bg-slate-900">
          {/* Monaco Editor Container */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              theme="vs-dark"
              language={selectedLanguage === 'python' ? 'python' : selectedLanguage === 'cpp' ? 'cpp' : 'javascript'}
              value={sourceCode}
              onChange={(val) => setSourceCode(val || '')}
              options={{
                fontSize: 13,
                fontFamily: 'JetBrains Mono, monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                tabSize: 4,
                lineNumbers: 'on',
                automaticLayout: true,
              }}
            />
          </div>

          {/* Submission Verdict Console Panel */}
          {latestSubmission && (
            <div className="border-t border-slate-800 bg-slate-950 p-4 shrink-0 max-h-56 overflow-y-auto font-mono text-xs text-slate-300 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-slate-400" />
                  <span className="font-bold uppercase tracking-wider text-slate-400">Execution Result:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                      latestSubmission.status === 'ACCEPTED'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {latestSubmission.status}
                  </span>
                </div>

                {latestSubmission.is_simulated && (
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                    Simulated Sandbox Mode
                  </span>
                )}
              </div>

              {/* Execution Metrics */}
              <div className="flex items-center gap-6 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Runtime: <strong className="text-slate-200">{latestSubmission.execution_time_ms || 0} ms</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-slate-500" />
                  Memory: <strong className="text-slate-200">{Math.round((latestSubmission.memory_used_kb || 0) / 1024)} MB</strong>
                </span>
              </div>

              {/* Output Sample or Error Message */}
              {latestSubmission.error_message ? (
                <div className="p-2.5 rounded bg-rose-950/60 border border-rose-900/60 text-rose-300 text-xs whitespace-pre-wrap">
                  {latestSubmission.error_message}
                </div>
              ) : latestSubmission.stdout_sample ? (
                <div>
                  <p className="text-[10px] text-slate-500 mb-1">Standard Output Sample:</p>
                  <pre className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300 text-xs">
                    {latestSubmission.stdout_sample}
                  </pre>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
