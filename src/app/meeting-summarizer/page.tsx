'use client';

import React, { useState } from 'react';
import { 
  FolderSync, 
  Sparkles, 
  Upload, 
  Play, 
  Copy, 
  Check, 
  Calendar, 
  ListTodo,
  ShieldCheck,
  UserPlus
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Textarea, Label } from '@/components/ui/Input';
import { generateMeetingSummary, MeetingSummaryResponse } from '@/lib/gemini';
import { saveTask } from '@/lib/db';

export default function MeetingSummarizerPage() {
  const [transcript, setTranscript] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MeetingSummaryResponse | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [syncedTasks, setSyncedTasks] = useState<{ [key: number]: boolean }>({});

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
      // Mocking transcription text loading
      setTranscript(
        `John: Welcome team. Let's discuss Wayne Enterprises. Bruce wants to proceed with the core Enterprise Suite by next Tuesday.\n` +
        `Sarah: Great. What are their security compliance protocols? We must align with GDPR and SOC2.\n` +
        `John: Yes. He said data must be encrypted at rest. Also they need real-time export logs.\n` +
        `John: Sarah, please draft the SLA agreement. I will prepare the custom pricing spreadsheet.\n` +
        `Sarah: Let's meet again on June 22 to finalize.`
      );
    }
  };

  const handleSummarize = async () => {
    if (!transcript.trim()) return;

    setLoading(true);
    try {
      const summary = await generateMeetingSummary(transcript);
      setResult(summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleSyncToTasks = async (item: { item: string; assignee: string; dueDate: string }, index: number) => {
    try {
      await saveTask({
        title: item.item,
        description: `Synced from AI Meeting Summary. Assignee: ${item.assignee}`,
        dueDate: new Date(item.dueDate).toISOString(),
        status: 'pending'
      });
      setSyncedTasks(prev => ({ ...prev, [index]: true }));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)]">
        {/* Left Column: Input Form & Upload */}
        <div className="w-full lg:w-96 flex-shrink-0 space-y-6 overflow-y-auto pr-1">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FolderSync size={18} className="text-brand-primary" />
                <div>
                  <CardTitle>Transcript Source</CardTitle>
                  <CardDescription>Paste meeting notes or upload an audio file.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="mt-4 space-y-4">
              {/* Audio Upload mock */}
              <div className="border border-dashed border-border-color rounded-lg p-4 text-center hover:border-brand-primary/40 transition-colors relative">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload size={20} className="mx-auto text-text-muted mb-2" />
                <span className="text-xxs font-bold text-text-primary block">
                  {audioFile ? audioFile.name : 'Upload Audio Recording'}
                </span>
                <span className="text-[9px] text-text-muted mt-1 block">Supports WAV, MP3, M4A up to 25MB</span>
              </div>

              {audioFile && (
                <div className="p-3 bg-input-bg/30 rounded border border-border-color/65 flex items-center justify-between text-xxs">
                  <span className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-success opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-success"></span>
                    </span>
                    Audio Loaded
                  </span>
                  <button
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className="px-2.5 py-1 bg-input-bg hover:bg-border-color border border-border-color/80 rounded font-bold cursor-pointer transition-colors"
                  >
                    {isPlayingAudio ? 'Pause' : 'Listen'}
                  </button>
                </div>
              )}

              {/* Waveform Equalizer animation */}
              {isPlayingAudio && (
                <div className="flex items-center justify-center gap-0.5 h-6 bg-brand-primary/5 rounded border border-brand-primary/10">
                  {[...Array(10)].map((_, i) => (
                    <span
                      key={i}
                      className="w-1 bg-brand-primary rounded-full animate-bounce"
                      style={{ 
                        height: `${Math.floor(Math.random() * 16) + 4}px`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '0.6s'
                      }}
                    />
                  ))}
                </div>
              )}

              <div className="space-y-1.5 pt-2">
                <Label htmlFor="transcriptText">Transcript / Raw Text Notes</Label>
                <Textarea
                  id="transcriptText"
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Paste Zoom transcript or quick scribbled meeting notes..."
                  className="min-h-[160px] text-xxs"
                />
              </div>

              <Button
                variant="primary"
                className="w-full py-2"
                onClick={handleSummarize}
                isLoading={loading}
                disabled={!transcript.trim()}
                leftIcon={<Sparkles size={13} />}
              >
                Summarize Transcript
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: AI Generated Summary Report */}
        <div className="flex-1 glass-panel border border-border-color rounded-xl overflow-hidden flex flex-col justify-between">
          <div className="p-4 border-b border-border-color bg-bg-card/45 flex items-center justify-between">
            <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <Sparkles size={14} className="text-brand-primary" /> AI Summary Dashboard
            </span>
            {result && <Badge variant="success">Synthesized Successfully</Badge>}
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {!result ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-text-muted py-16">
                <FolderSync size={32} className="text-border-color mb-3" />
                <p className="text-xs font-bold">No summary generated yet.</p>
                <p className="text-[10px] text-text-muted mt-1 max-w-xs leading-relaxed">
                  Input meeting text or upload audio files in the left sidebar configuration panel and trigger analysis.
                </p>
              </div>
            ) : (
              <div className="space-y-6 text-xs text-text-secondary">
                {/* Executive Summary */}
                <div className="space-y-2">
                  <h3 className="font-extrabold text-white text-xs uppercase tracking-wider">Executive Summary</h3>
                  <p className="bg-input-bg/15 p-3 rounded border border-border-color leading-relaxed text-xxs">
                    {result.summary}
                  </p>
                </div>

                {/* Key Decisions */}
                <div className="space-y-2">
                  <h3 className="font-extrabold text-white text-xs uppercase tracking-wider">Key Decisions Made</h3>
                  <ul className="list-disc list-inside space-y-1 bg-input-bg/15 p-3 rounded border border-border-color text-xxs pl-4">
                    {result.keyDecisions.map((dec, idx) => (
                      <li key={idx} className="leading-relaxed">{dec}</li>
                    ))}
                  </ul>
                </div>

                {/* Customer Requirements */}
                <div className="space-y-2">
                  <h3 className="font-extrabold text-white text-xs uppercase tracking-wider">Customer Requirements</h3>
                  <ul className="list-disc list-inside space-y-1 bg-input-bg/15 p-3 rounded border border-border-color text-xxs pl-4">
                    {result.requirements.map((req, idx) => (
                      <li key={idx} className="leading-relaxed">{req}</li>
                    ))}
                  </ul>
                </div>

                {/* Action Items with Sync trigger */}
                <div className="space-y-3">
                  <h3 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <ListTodo size={14} className="text-brand-primary" /> Action Items Checklist
                  </h3>
                  <div className="space-y-2.5">
                    {result.actionItems.map((item, idx) => (
                      <div key={idx} className="p-3 bg-input-bg/30 rounded border border-border-color flex items-center justify-between gap-3 text-xxs">
                        <div>
                          <p className="font-bold text-white leading-normal">{item.item}</p>
                          <div className="flex items-center gap-3 mt-1.5 text-[9px] text-text-muted">
                            <span>Assignee: <strong className="text-text-secondary">{item.assignee}</strong></span>
                            <span>Due Date: <strong>{item.dueDate}</strong></span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyText(`${item.item} - Assignee: ${item.assignee}, Due: ${item.dueDate}`, idx)}
                            className="p-1.5 rounded hover:bg-input-bg text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                            title="Copy details"
                          >
                            {copiedIndex === idx ? <Check size={12} className="text-brand-success" /> : <Copy size={12} />}
                          </button>
                          
                          <Button
                            variant={syncedTasks[idx] ? 'ghost' : 'outline'}
                            size="sm"
                            className="text-[9px] py-1 px-2.5"
                            onClick={() => handleSyncToTasks(item, idx)}
                            disabled={syncedTasks[idx]}
                          >
                            {syncedTasks[idx] ? (
                              <span className="text-brand-success font-semibold flex items-center gap-1">
                                <ShieldCheck size={10} /> Synced
                              </span>
                            ) : (
                              'Sync to Tasks'
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Meeting */}
                <div className="flex items-center justify-between bg-brand-primary/5 p-3 rounded-lg border border-brand-primary/10 text-xxs">
                  <span className="font-semibold text-brand-primary flex items-center gap-1.5">
                    <Calendar size={13} /> Proposed Next Meeting Date
                  </span>
                  <span className="font-bold text-white">{result.nextMeetingDate}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
