'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles, 
  Brain, 
  Target, 
  TrendingUp, 
  MessageSquare, 
  ShieldCheck, 
  Layers, 
  Zap 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  const usps = [
    { title: 'AI Lead Scoring', desc: 'Predict conversion probabilities using Gemini analysis on engagement activity.', icon: Target },
    { title: 'AI Sales Coach', desc: 'Receive daily follow-up recommendations to recover stagnant deals.', icon: Brain },
    { title: 'AI Revenue Forecasts', desc: 'Synthesize monthly and quarterly revenue pipelines automatically.', icon: TrendingUp },
    { title: 'Meeting Summarizer', desc: 'Upload meeting transcripts and generate summaries and action items in seconds.', icon: Layers },
    { title: 'WhatsApp CRM', desc: 'Simulate capture of incoming message streams into routed pipeline leads.', icon: MessageSquare },
    { title: 'Customer Health', desc: 'Monitor engagement patterns to intercept churn indicators.', icon: ShieldCheck }
  ];

  return (
    <div className="min-h-screen bg-bg-app text-text-primary tech-grid overflow-hidden flex flex-col justify-between">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-brand-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-brand-secondary/10 blur-[120px] pointer-events-none" />

      {/* Header / Navigation */}
      <nav className="h-16 px-6 lg:px-16 border-b border-border-color/50 bg-bg-card/45 backdrop-blur-md flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
            SALESMIND
          </span>
          <span className="text-xxs border border-brand-primary/30 text-brand-primary px-1.5 py-0.5 rounded-full font-bold">
            v1.0
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight size={13} />}>
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Main Content Hero */}
      <main className="max-w-7xl mx-auto px-6 lg:px-16 py-12 lg:py-24 flex-1 flex flex-col items-center justify-center text-center relative z-10">
        {/* Tag Pill */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-brand-primary text-[10px] font-bold tracking-widest uppercase mb-8 shadow-[0_0_15px_rgba(95,90,246,0.1)]"
        >
          <Sparkles size={11} className="animate-spin" /> Powered by Google Gemini AI
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 max-w-4xl leading-tight"
        >
          Turn Leads Into Customers with <span className="gradient-text">Intelligent Automation</span>
        </motion.h1>

        {/* Tagline / Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg text-text-secondary mb-10 max-w-2xl leading-relaxed"
        >
          SalesMind is an AI-first CRM platform designed for startups, agencies, and sales teams. Maximize conversion probabilities, predict revenue growth, and auto-summarize transcripts in one unified workspace.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-20"
        >
          <Link href="/register">
            <Button variant="primary" size="lg" className="w-48" rightIcon={<ArrowRight size={16} />}>
              Try Demo Free
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="w-48">
              Sign In
            </Button>
          </Link>
        </motion.div>

        {/* USPs / Features Grid */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full text-left"
        >
          {usps.map((usp, idx) => {
            const IconComp = usp.icon;
            return (
              <motion.div key={idx} variants={itemVariants}>
                <Card hoverable className="h-full flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary mb-4">
                      <IconComp size={20} />
                    </div>
                    <h3 className="text-sm font-bold text-text-primary mb-2">{usp.title}</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">{usp.desc}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xxs font-bold text-brand-primary hover:underline cursor-pointer">
                    Learn More <Zap size={8} />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.section>
      </main>

      {/* Footer copyright */}
      <footer className="py-6 border-t border-border-color/40 bg-bg-card/20 text-center text-xxs text-text-muted select-none">
        <p>© 2026 Nexvora. All Rights Reserved. SalesMind™ v1.0</p>
      </footer>
    </div>
  );
}
