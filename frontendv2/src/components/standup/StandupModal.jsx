import React, { useEffect, useMemo, useState } from 'react';
import { standupAPI } from '../../services/api';

export default function StandupModal({
  open,
  onClose,
  user,
  onSubmitted,
}) {
  const [loading, setLoading] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);

  const now = useMemo(() => new Date(), []);
  const name = user?.firstName || user?.lastName ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() : (user?.name || user?.username || '');

  const [form, setForm] = useState({
    status: '',
    priority: '',
    working_hours: '',
    tasks_done: '',
    activity_type: '',
    links: '',
    progress: '',
    blockers: '',
    collaboration: '',
    next_steps: '',
  });

  useEffect(() => {
    let mounted = true;
    const checkToday = async () => {
      try {
        const res = await standupAPI.getTodayStatus();
        if (!mounted) return;
        if (res?.submitted) {
          setAlreadySubmitted(true);
        } else {
          setAlreadySubmitted(false);
        }
      } catch (e) {
        // If unauthorized, surface error, caller will handle logout redirect
        setError(e.message || 'Failed to check today\'s standup status');
      }
    };
    if (open) {
      setError('');
      checkToday();
    }
    return () => { mounted = false; };
  }, [open]);

  const validate = () => {
    const required = ['status', 'priority', 'working_hours', 'tasks_done'];
    for (const key of required) {
      if (!String(form[key] ?? '').trim()) return `${key.replace('_', ' ')} is required`;
    }
    if (isNaN(Number(form.working_hours))) return 'Working hours must be a number';
    return '';
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await standupAPI.submit({ ...form, working_hours: Number(form.working_hours) });
      const standupId = res?.standup?._id || res?.data?.standup?._id;
      if (standupId && file) {
        try {
          await standupAPI.addAttachment(standupId, { file, name: file.name });
        } catch (err) {
          // Don't block logout flow if attachment fails; surface error inline
          console.error('Attachment upload failed:', err);
        }
      }
      onSubmitted && onSubmitted();
    } catch (e) {
      setError(e.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => { /* prevent backdrop close to enforce */ }} />
      <div className="relative w-full max-w-3xl mx-4 bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Daily Standup</h3>
          <p className="text-sm text-gray-500">Please submit your daily update to continue logging out.</p>
        </div>

        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          {alreadySubmitted ? (
            <div className="text-green-700 bg-green-50 border border-green-200 rounded-md p-3">
              You already submitted today. You can proceed to logout.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="text-red-700 bg-red-50 border border-red-200 rounded-md p-3">{error}</div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100" value={name} readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date & Time</label>
                  <input className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100" value={now.toLocaleString()} readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select className="mt-1 block w-full rounded-md border-gray-300" value={form.status} onChange={(e)=>setForm(f=>({...f,status:e.target.value}))} required>
                    <option value="">Select</option>
                    <option>Delayed</option>
                    <option>On Track</option>
                    <option>Under Review</option>
                    <option>Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select className="mt-1 block w-full rounded-md border-gray-300" value={form.priority} onChange={(e)=>setForm(f=>({...f,priority:e.target.value}))} required>
                    <option value="">Select</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Working Hours</label>
                  <input type="number" min="0" step="0.5" className="mt-1 block w-full rounded-md border-gray-300" value={form.working_hours} onChange={(e)=>setForm(f=>({...f,working_hours:e.target.value}))} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Activity Type</label>
                  <input className="mt-1 block w-full rounded-md border-gray-300" value={form.activity_type} onChange={(e)=>setForm(f=>({...f,activity_type:e.target.value}))} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tasks Done Today</label>
                <textarea className="mt-1 block w-full rounded-md border-gray-300" rows={3} value={form.tasks_done} onChange={(e)=>setForm(f=>({...f,tasks_done:e.target.value}))} required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Links</label>
                  <input className="mt-1 block w-full rounded-md border-gray-300" placeholder="GitHub/Docs/Reports" value={form.links} onChange={(e)=>setForm(f=>({...f,links:e.target.value}))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Progress Done So Far</label>
                  <input className="mt-1 block w-full rounded-md border-gray-300" placeholder="e.g. 60% or details" value={form.progress} onChange={(e)=>setForm(f=>({...f,progress:e.target.value}))} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Blockers or Issues</label>
                  <textarea className="mt-1 block w-full rounded-md border-gray-300" rows={2} value={form.blockers} onChange={(e)=>setForm(f=>({...f,blockers:e.target.value}))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Collaboration</label>
                  <textarea className="mt-1 block w-full rounded-md border-gray-300" rows={2} value={form.collaboration} onChange={(e)=>setForm(f=>({...f,collaboration:e.target.value}))} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Next Steps</label>
                <textarea className="mt-1 block w-full rounded-md border-gray-300" rows={2} value={form.next_steps} onChange={(e)=>setForm(f=>({...f,next_steps:e.target.value}))} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Attachment (optional)</label>
                <input type="file" className="mt-1 block w-full" onChange={(e)=>setFile(e.target.files?.[0] || null)} />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" className="px-4 py-2 rounded-md border" onClick={onClose} disabled={loading}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-60" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit and Logout'}
                </button>
              </div>
            </form>
          )}
        </div>

        {alreadySubmitted && (
          <div className="px-6 py-4 border-t flex justify-end">
            <button className="px-4 py-2 rounded-md bg-blue-600 text-white" onClick={onSubmitted}>Proceed to Logout</button>
          </div>
        )}
      </div>
    </div>
  );
}
