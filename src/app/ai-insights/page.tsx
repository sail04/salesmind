'use client';

import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Award, 
  RotateCw, 
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Zap,
  ArrowRight
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useCurrency } from '@/lib/CurrencyContext';
import { getLeads, getCustomers, getActivities } from '@/lib/db';
import { 
  getCoachRecommendations, 
  generateRevenueForecast, 
  analyzeLeadScore,
  CoachRecommendation, 
  RevenueForecastResponse 
} from '@/lib/gemini';
import { Lead } from '@/lib/mockData';

export default function AIInsightsPage() {
  const { formatPrice } = useCurrency();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [coachList, setCoachList] = useState<CoachRecommendation[]>([]);
  const [forecast, setForecast] = useState<RevenueForecastResponse | null>(null);
  
  // Loading & states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAIAnalytics = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const dbLeads = await getLeads();
      setLeads(dbLeads);

      const coach = await getCoachRecommendations(dbLeads);
      setCoachList(coach);

      const fore = await generateRevenueForecast(dbLeads);
      setForecast(fore);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAIAnalytics();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 55) return 'warning';
    return 'error';
  };

  // Smart Recommendations mock (matching specifications)
  const smartRecommendations = [
    { id: 'sr1', title: 'Contact Alex Rivera Today', detail: 'Identified as having a 92/100 score with key cloud demo requirements.', chance: 89, type: 'conversion' },
    { id: 'sr2', title: 'Offer Premium Package to Bruce Wayne', detail: 'Closed deal is ready for VIP SLA upgrading options.', chance: 91, type: 'renewal' }
  ];

  return (
    <AppLayout>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            Gemini AI Engine <Sparkles size={16} className="text-brand-primary animate-pulse" />
          </h2>
          <p className="text-xs text-text-muted mt-0.5">Explore predictive sales analytics and recommendations.</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => loadAIAnalytics(true)}
          isLoading={refreshing}
          leftIcon={<RotateCw size={13} />}
        >
          Re-Analyze Pipeline
        </Button>
      </div>

      {loading ? (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary"></div>
          <p className="text-xs text-text-muted font-bold tracking-widest uppercase">Analyzing CRM databases...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Columns (AI Sales Coach & Top Scored leads) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* AI Sales Coach */}
            <Card glow className="border-brand-primary/15 bg-brand-primary/[0.01]">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Brain size={18} className="text-brand-primary" />
                  <div>
                    <CardTitle>AI Sales Coach Guidelines</CardTitle>
                    <CardDescription>Daily actionable advice to push stuck pipeline deals forward.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="mt-4 space-y-4">
                {coachList.length === 0 ? (
                  <p className="text-xs text-text-muted py-4 text-center">No stuck leads detected. Pipeline healthy!</p>
                ) : (
                  coachList.map((rec) => (
                    <div key={rec.id} className="p-4 bg-input-bg/40 rounded-lg border border-border-color/65 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="absolute top-0 left-0 bottom-0 w-1 bg-brand-primary" />
                      <div className="flex-1 pl-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-extrabold text-white">{rec.leadName}</span>
                          <Badge variant="warning">Stagnant {rec.stagnantDays} Days</Badge>
                        </div>
                        <p className="text-xxs text-text-secondary leading-relaxed">{rec.recommendation}</p>
                      </div>
                      <div className="text-right sm:border-l border-border-color/40 sm:pl-4 min-w-[140px]">
                        <span className="text-[10px] text-text-muted block">Expected Lift</span>
                        <span className="text-sm font-extrabold text-brand-success block mt-0.5">+{rec.expectedIncrease}% Conversion</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Smart Recommendations */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap size={18} className="text-brand-warning" />
                  <div>
                    <CardTitle>Smart Recommendations</CardTitle>
                    <CardDescription>Next-best-actions calculated based on customer health and scores.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {smartRecommendations.map((sr) => (
                  <div key={sr.id} className="p-4 rounded-lg bg-input-bg/25 border border-border-color/50 flex flex-col justify-between h-full hover:border-brand-primary/30 transition-colors">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-brand-secondary">
                          {sr.type} recommendation
                        </span>
                        <Badge variant="success" glow>Probability {sr.chance}%</Badge>
                      </div>
                      <h4 className="text-xs font-bold text-white mb-1">{sr.title}</h4>
                      <p className="text-xxs text-text-secondary leading-relaxed mb-4">{sr.detail}</p>
                    </div>
                    <button 
                      onClick={() => alert(`Initiating workflow for recommendation: ${sr.title}`)}
                      className="text-xxs text-brand-primary hover:text-white font-bold flex items-center gap-1.5 mt-auto transition-colors cursor-pointer"
                    >
                      Execute Proposal <ArrowRight size={10} />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Lead Scores Telemetry */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Award size={18} className="text-brand-accent" />
                  <div>
                    <CardTitle>AI Lead Quality Directory</CardTitle>
                    <CardDescription>Consolidated scores for evaluating deal priority.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="mt-4">
                <div className="space-y-3">
                  {leads.sort((a, b) => b.score - a.score).map((lead) => (
                    <div key={lead.leadId} className="flex items-center justify-between p-3 bg-input-bg/15 rounded border border-border-color/40 text-xs">
                      <div>
                        <span className="font-bold text-white">{lead.name}</span>
                        <span className="text-[10px] text-text-muted block mt-0.5">{lead.company} ({lead.industry})</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xxs text-text-muted capitalize">{lead.status}</span>
                        <Badge variant={getScoreColor(lead.score)} glow className="w-16 justify-center">
                          {lead.score}/100
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column (AI Revenue Forecast & Model specs) */}
          <div className="space-y-6">
            
            {/* Revenue Forecasting */}
            <Card className="border-brand-success/15 bg-brand-success/[0.01]">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-brand-success" />
                  <div>
                    <CardTitle>AI Revenue Projections</CardTitle>
                    <CardDescription>Predictive sales revenue modeled from active pipeline.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="mt-4 space-y-5">
                {forecast ? (
                  <>
                    <div className="bg-bg-card border border-border-color p-4 rounded-lg text-center flex flex-col items-center">
                      <span className="text-[9px] font-extrabold text-text-muted uppercase tracking-wider block">Expected Revenue (Next 30 Days)</span>
                      <span className="text-2xl font-black text-brand-success mt-1">
                        {formatPrice(forecast.expectedRevenue30Days)}
                      </span>
                      <Badge variant="success" glow className="mt-2.5">
                        Confidence {forecast.confidenceScore}%
                      </Badge>
                    </div>

                    <div className="bg-bg-card border border-border-color p-4 rounded-lg text-center flex flex-col items-center">
                      <span className="text-[9px] font-extrabold text-text-muted uppercase tracking-wider block">Expected Revenue (Next 90 Days)</span>
                      <span className="text-xl font-extrabold text-white mt-1">
                        {formatPrice(forecast.expectedRevenue90Days)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Forecast Analysis Summary</span>
                      <p className="text-xxs text-text-secondary leading-relaxed bg-input-bg/30 p-3 rounded border border-border-color">
                        {forecast.analysis}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-text-muted">Projections unavailable.</p>
                )}
              </CardContent>
            </Card>

            {/* AI Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>AI Preferences</CardTitle>
              </CardHeader>
              <CardContent className="mt-4 space-y-3 text-xxs text-text-secondary">
                <div className="flex items-center justify-between">
                  <span>Engine Model</span>
                  <span className="font-bold text-white">Gemini 1.5 Flash</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pipeline Recalculations</span>
                  <span className="font-bold text-white">Automatic (5 min)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Status</span>
                  <span className="text-brand-success font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-success block" /> Sandbox Ready
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
