'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Shield, User, ArrowRight, Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input, Label } from '@/components/ui/Input';
import { login, loginWithGoogle, getCurrentUser } from '@/lib/auth';


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<'manager' | 'employee'>('manager');




  useEffect(() => {
    // If already logged in, redirect
    const user = getCurrentUser();
    if (user) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setError('');
    setIsLoading(true);
    try {
      await login(demoEmail, 'password123');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google Auth failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-app text-text-primary tech-grid flex items-center justify-center p-6 relative">
      <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full bg-brand-primary/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] rounded-full bg-brand-secondary/5 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link href="/" className="font-extrabold text-2xl tracking-widest bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
            SALESMIND
          </Link>
          <p className="text-xs text-text-muted mt-2 uppercase tracking-widest font-bold">Turn Leads Into Customers</p>
        </div>

        <Card glow className="border-border-color/80">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Enter details or select a quick-login role below.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Role selection tab bar at the top */}
            <div className="mb-6">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-2">
                Select Sign-In Role View:
              </span>
              <div className="grid grid-cols-2 gap-2 p-1 bg-input-bg/40 rounded-lg border border-border-color">
                <button
                  type="button"
                  onClick={() => {
                    setActiveRole('manager');
                    setEmail('');
                    setPassword('');
                  }}
                  className={`px-3 py-2 rounded text-xxs font-bold transition-all cursor-pointer text-center ${
                    activeRole === 'manager'
                      ? 'bg-brand-secondary text-white shadow-sm'
                      : 'text-text-secondary hover:text-text-primary hover:bg-input-bg/30'
                  }`}
                >
                  Manager
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveRole('employee');
                    setEmail('');
                    setPassword('');
                  }}
                  className={`px-3 py-2 rounded text-xxs font-bold transition-all cursor-pointer text-center ${
                    activeRole === 'employee'
                      ? 'bg-brand-accent text-white shadow-sm'
                      : 'text-text-secondary hover:text-text-primary hover:bg-input-bg/30'
                  }`}
                >
                  Employee
                </button>
              </div>
              <div className="text-[10px] text-text-muted text-center mt-2.5 bg-input-bg/10 py-1.5 rounded border border-border-color/30">
                Type the correct email and password for the selected role view.
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-brand-error/10 border border-brand-error/20 rounded-md text-xs text-brand-error font-semibold flex items-center gap-2">
                <Shield size={14} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                  <Mail size={14} className="absolute left-3.5 top-3 text-text-muted" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="password" className="mb-0">Password</Label>
                  <a href="#" className="text-[10px] text-brand-primary hover:underline font-bold">Forgot Password?</a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                  />
                  <Lock size={14} className="absolute left-3.5 top-3 text-text-muted" />
                </div>
              </div>

              <Button type="submit" variant="primary" className="w-full py-2.5 mt-2" isLoading={isLoading}>
                Sign In
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <span className="absolute inset-x-0 top-1/2 border-b border-border-color" />
              <span className="relative bg-bg-card px-3 text-xxs text-text-muted font-bold uppercase tracking-wider">
                Or Continue With
              </span>
            </div>

            {/* Google Authentication Button */}
            <Button 
              type="button" 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs"
              onClick={handleGoogleLogin}
              isLoading={googleLoading}
            >
              <Globe size={14} /> Google Account
            </Button>

            <p className="text-xxs text-center text-text-muted mt-8">
              Don't have an account?{' '}
              <Link href="/register" className="text-brand-primary hover:underline font-bold">
                Create Account <ArrowRight size={8} className="inline" />
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
