import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';

const ScoreBadge = ({ score }) => (
  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 shadow-sm">
    {score}
  </span>
);

const KeywordChip = ({ text, type = 'match' }) => (
  <span className={`px-2 py-1 rounded-lg text-xs mr-2 mb-2 inline-block shadow-sm ${type === 'match' ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'}`}>
    {text}
  </span>
);

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-4 text-gray-500 text-xl">×</button>
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <div className="max-h-[60vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

const RankedApplicants = () => {
  const { jobId } = useParams();
  const { backendUrl, companyToken } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ job: null, rankedApplicants: [] });
  const [error, setError] = useState('');
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState(null);
  const [templateType, setTemplateType] = useState('outreach');
  const [tone, setTone] = useState('professional, friendly');
  const [activeApp, setActiveApp] = useState(null);

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${backendUrl}/api/recruiter/${jobId}/rankedApplicants`, {
          headers: { token: companyToken }
        });
        if (res.data.success) {
          setData(res.data);
        } else {
          setError(res.data.message || 'Failed to fetch rankings');
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    if (backendUrl && companyToken && jobId) fetchRankings();
  }, [backendUrl, companyToken, jobId]);

  const openSummary = async (applicationId) => {
    setActiveApp(applicationId);
    setSummaryOpen(true);
    setSummaryLoading(true);
    setSummary(null);
    try {
      const encodedId = encodeURIComponent(applicationId);
      const res = await axios.get(`${backendUrl}/api/recruiter/application/${encodedId}/summary`, { headers: { token: companyToken } });
      if (res.data.success) setSummary(res.data);
      else setSummary({ error: res.data.message || 'Failed to generate summary' });
    } catch (e) {
      setSummary({ error: e.message });
    } finally {
      setSummaryLoading(false);
    }
  };

  const openEmail = (applicationId) => {
    setActiveApp(applicationId);
    setEmailOpen(true);
    setEmailTemplate(null);
  };

  const generateEmail = async (candidateName, jobTitle) => {
    setEmailLoading(true);
    try {
      const res = await axios.post(`${backendUrl}/api/recruiter/emailTemplate`, {
        templateType,
        tone,
        candidateName,
        jobTitle
      }, { headers: { token: companyToken } });
      if (res.data.success) setEmailTemplate(res.data.template);
      else setEmailTemplate({ error: res.data.message || 'Failed to generate template' });
    } catch (e) {
      setEmailTemplate({ error: e.message });
    } finally {
      setEmailLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Analyzing resumes and computing AI scores…</div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="backdrop-blur bg-white/70 dark:bg-white/5 rounded-2xl p-6 shadow-xl border border-white/40">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Ranked Applicants</h2>
            <p className="text-gray-500">Job: {data.job?.title}</p>
          </div>
        </div>
      </div>

      {data.rankedApplicants.length === 0 ? (
        <div className="text-gray-500">No applicants yet.</div>
      ) : (
        <div className="grid gap-5">
          {data.rankedApplicants.map((item, idx) => (
            <div key={item.applicationId} className="rounded-2xl p-5 bg-gradient-to-br from-white to-gray-50 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-gray-400">#{idx + 1}</div>
                  <div className="text-lg font-semibold text-gray-800">{item.applicant.name}</div>
                  <a href={item.resumeUrl} target="_blank" rel="noreferrer" className="text-blue-600 text-sm underline">Resume</a>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-500">Final</div>
                  <ScoreBadge score={item.scores.finalScore} />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl bg-white shadow-sm p-4 border border-gray-100">
                  <div className="text-xs text-gray-400">JD Match</div>
                  <div className="text-2xl font-bold text-gray-800">{item.scores.jdMatchScore}</div>
                </div>
                <div className="rounded-xl bg-white shadow-sm p-4 border border-gray-100">
                  <div className="text-xs text-gray-400">Resume Quality</div>
                  <div className="text-2xl font-bold text-gray-800">{item.scores.resumeQualityScore}</div>
                </div>
                <div className="rounded-xl bg-white shadow-sm p-4 border border-gray-100">
                  <div className="text-xs text-gray-400">Matched Keywords</div>
                  <div className="mt-2 max-h-20 overflow-y-auto">
                    {item.matchedKeywords.slice(0, 12).map(k => (
                      <KeywordChip key={k + '-m'} text={k} type="match" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-xs text-gray-400 mb-2">Missing Skills</div>
                <div className="max-h-24 overflow-y-auto">
                  {item.missingSkills.slice(0, 15).map(k => (
                    <KeywordChip key={k + '-x'} text={k} type="missing" />
                  ))}
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button onClick={() => openSummary(item.applicationId)} className="px-3 py-1.5 text-sm rounded-lg bg-gray-800 text-white hover:bg-black transition shadow-sm">AI Summary</button>
                <button onClick={() => openEmail(item.applicationId)} className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm">Generate Email</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={summaryOpen} onClose={() => setSummaryOpen(false)} title="Candidate Summary">
        {summaryLoading ? (
          <div className="text-gray-500">Generating summary…</div>
        ) : summary?.error ? (
          <div className="text-red-600">{summary.error}</div>
        ) : summary ? (
          <div className="space-y-3">
            <div>
              <div className="text-xs text-gray-400">Summary</div>
              <p className="text-gray-800 whitespace-pre-wrap">{summary.summary}</p>
            </div>
            <div>
              <div className="text-xs text-gray-400">Strengths</div>
              <ul className="list-disc list-inside text-gray-800">
                {(summary.strengths || []).map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div>
              <div className="text-xs text-gray-400">Risks</div>
              <ul className="list-disc list-inside text-gray-800">
                {(summary.risks || []).map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl bg-white shadow-sm p-4 border border-gray-100">
                <div className="text-xs text-gray-400">Fit Score</div>
                <div className="text-2xl font-bold text-gray-800">{summary.fitScore}</div>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Recommended Interview Questions</div>
              <ul className="list-disc list-inside text-gray-800">
                {(summary.recommendedInterviewQuestions || []).map((q, i) => <li key={i}>{q}</li>)}
              </ul>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal open={emailOpen} onClose={() => setEmailOpen(false)} title="Generate Email Template">
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">Type</label>
              <select className="w-full border rounded-lg px-3 py-2" value={templateType} onChange={e => setTemplateType(e.target.value)}>
                <option value="outreach">Outreach</option>
                <option value="rejection">Rejection</option>
                <option value="offer">Offer</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Tone</label>
              <input className="w-full border rounded-lg px-3 py-2" value={tone} onChange={e => setTone(e.target.value)} />
            </div>
          </div>
          <button
            onClick={() => {
              const app = data.rankedApplicants.find(a => a.applicationId === activeApp);
              generateEmail(app?.applicant?.name || 'Candidate', data.job?.title || 'the role');
            }}
            className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            {emailLoading ? 'Generating…' : 'Generate'}
          </button>

          {emailTemplate && (emailTemplate.error ? (
            <div className="text-red-600 mt-3">{emailTemplate.error}</div>
          ) : (
            <div className="mt-4 space-y-2">
              <div>
                <div className="text-xs text-gray-400">Subject</div>
                <div className="p-3 bg-gray-50 rounded-lg border">{emailTemplate.subject}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Body</div>
                <textarea readOnly className="w-full border rounded-lg p-3 h-48">{emailTemplate.body}</textarea>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigator.clipboard.writeText(`${emailTemplate.subject}\n\n${emailTemplate.body}`)} className="px-3 py-1.5 text-sm rounded-lg bg-gray-800 text-white">Copy</button>
              </div>
            </div>
          ))}
        </div>
      </Modal>

    </div>
  );
};

export default RankedApplicants;


