'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Shield, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input, Label, Select } from '@/components/ui/Input';
import { register } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'manager' | 'employee'>('employee');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await register(name, email, password, role);
      setSuccess('Registration successful! Redirecting to Dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Try a different email.');
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { value: 'employee', label: 'Employee' },
    { value: 'manager', label: 'Manager' }
  ];

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
        <div className="mb-6 flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-1.5 text-xxs font-bold text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft size={10} /> Back to Sign In
          </Link>
        </div>

        <Card glow className="border-border-color/80">
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>Setup an enterprise account with role-based access.</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-brand-error/10 border border-brand-error/20 rounded-md text-xs text-brand-error font-semibold flex items-center gap-2">
                <Shield size={14} /> {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-brand-success/10 border border-brand-success/20 rounded-md text-xs text-brand-success font-semibold">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Connor"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                  />
                  <User size={14} className="absolute left-3.5 top-3 text-text-muted" />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                  <Mail size={14} className="absolute left-3.5 top-3 text-text-muted" />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
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

              <div>
                <Label htmlFor="role">Select Workspace Role</Label>
                <Select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  options={roleOptions}
                />
              </div>

              <Button type="submit" variant="primary" className="w-full py-2.5 mt-4" isLoading={isLoading}>
                Register Workspace <ArrowRight size={14} className="inline ml-1" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
