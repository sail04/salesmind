'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  DollarSign, 
  Activity, 
  User, 
  Phone, 
  Mail, 
  Building,
  Heart,
  TrendingDown,
  Edit2
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { Input, Label, Select } from '@/components/ui/Input';
import { useCurrency } from '@/lib/CurrencyContext';
import { getCustomers, saveCustomer, logActivity } from '@/lib/db';
import { Customer, mockUsers } from '@/lib/mockData';

export default function CustomersPage() {
  const { formatPrice } = useCurrency();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null);

  // Modal controls
  const [isAddCustOpen, setIsAddCustOpen] = useState(false);
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);

  // New Customer Form Fields
  const [custName, setCustName] = useState('');
  const [custCompany, setCustCompany] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custHealth, setCustHealth] = useState(85);
  const [custAssigned, setCustAssigned] = useState('u3');

  // Purchase Form Fields
  const [purchaseItem, setPurchaseItem] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');

  const loadCustomers = async () => {
    const data = await getCustomers();
    setCustomers(data);
    
    // Auto-refresh selected reference
    if (selectedCust) {
      const updated = data.find(c => c.customerId === selectedCust.customerId);
      if (updated) setSelectedCust(updated);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // Filtering
  useEffect(() => {
    if (!search) {
      setFilteredCustomers(customers);
      return;
    }
    const s = search.toLowerCase();
    const result = customers.filter(c => 
      c.name.toLowerCase().includes(s) || 
      c.company.toLowerCase().includes(s) || 
      c.email.toLowerCase().includes(s)
    );
    setFilteredCustomers(result);
  }, [customers, search]);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const newCust: Partial<Customer> = {
      name: custName,
      company: custCompany,
      email: custEmail,
      phone: custPhone,
      healthScore: Number(custHealth),
      assignedTo: custAssigned,
      purchaseHistory: []
    };
    await saveCustomer(newCust);
    setIsAddCustOpen(false);
    loadCustomers();
    
    // Reset form
    setCustName('');
    setCustCompany('');
    setCustEmail('');
    setCustPhone('');
    setCustHealth(85);
  };

  const handleAddPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCust || !purchaseItem || !purchaseAmount) return;

    const amount = Number(purchaseAmount);
    const newPurchaseItem = {
      item: purchaseItem,
      amount,
      date: new Date().toISOString().split('T')[0]
    };

    const updatedCust = {
      ...selectedCust,
      purchaseHistory: [...selectedCust.purchaseHistory, newPurchaseItem]
    };

    await saveCustomer(updatedCust);
    await logActivity(selectedCust.customerId, 'note', `Logged transaction: Closed purchase for '${purchaseItem}' valued at ₹${amount.toLocaleString('en-IN')}`);
    
    setIsPurchaseOpen(false);
    setPurchaseItem('');
    setPurchaseAmount('');
    loadCustomers();
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 50) return 'warning';
    return 'error';
  };

  const getHealthLabel = (score: number) => {
    if (score >= 80) return 'Low Churn Risk';
    if (score >= 50) return 'Medium Churn Risk';
    return 'High Churn Risk';
  };

  return (
    <AppLayout>
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)]">
        {/* Left Side: Directory List */}
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="relative flex-1">
              <Input
                placeholder="Search customers by contact, company name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-bg-card border-border-color"
              />
              <Search size={14} className="absolute left-3 top-3 text-text-muted" />
            </div>
            <Button variant="primary" size="md" onClick={() => setIsAddCustOpen(true)} leftIcon={<Plus size={16} />}>
              Add Customer
            </Button>
          </div>

          {/* Table list */}
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCustomers.length === 0 ? (
                <div className="col-span-full py-16 text-center text-xs text-text-muted glass-panel border border-border-color rounded-lg">
                  No customers found. Try a different search parameter.
                </div>
              ) : (
                filteredCustomers.map((cust) => {
                  const lifetimeRev = cust.purchaseHistory.reduce((sum, item) => sum + item.amount, 0);
                  
                  return (
                    <Card
                      key={cust.customerId}
                      hoverable
                      onClick={() => setSelectedCust(cust)}
                      className={`cursor-pointer transition-all border ${
                        selectedCust?.customerId === cust.customerId ? 'border-brand-primary/60 bg-brand-primary/5' : 'border-border-color'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-text-primary">{cust.name}</h3>
                          <p className="text-xxs text-text-muted flex items-center gap-1 mt-1">
                            <Building size={10} /> {cust.company}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-text-muted block uppercase font-bold tracking-wider">Health</span>
                          <Badge variant={getHealthColor(cust.healthScore)} glow className="mt-0.5">
                            {cust.healthScore}/100
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-color/30 text-[10px] text-text-secondary">
                        <div>
                          <span className="text-text-muted">LTV Revenue:</span>{' '}
                          <span className="font-bold text-brand-success">{formatPrice(lifetimeRev)}</span>
                        </div>
                        <div>
                          <span className="text-text-muted">Account Owner:</span>{' '}
                          {mockUsers.find(u => u.uid === cust.assignedTo)?.name.split(' ')[0]}
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Account Details panel */}
        {selectedCust && (
          <div className="w-full lg:w-96 glass-panel border border-border-color rounded-xl flex flex-col justify-between overflow-hidden">
            {/* Header section */}
            <div className="p-4 border-b border-border-color bg-bg-card/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-text-primary">{selectedCust.name}</h3>
                <span className="text-xxs text-text-muted block mt-0.5">{selectedCust.company}</span>
              </div>
              <Badge variant={getHealthColor(selectedCust.healthScore)} glow>
                {getHealthLabel(selectedCust.healthScore)}
              </Badge>
            </div>

            {/* Content panel */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Health Score Gauge indicator */}
              <div className="bg-input-bg/20 p-4 rounded-lg border border-border-color/60 text-center flex flex-col items-center justify-center">
                <Heart size={24} className={`mb-2 ${selectedCust.healthScore >= 80 ? 'text-brand-success' : selectedCust.healthScore >= 50 ? 'text-brand-warning' : 'text-brand-error'}`} />
                <span className="text-xxs text-text-muted uppercase tracking-wider block">Customer Health Meter</span>
                <span className="text-3xl font-black text-white mt-1">{selectedCust.healthScore}%</span>
                <div className="w-full bg-border-color h-1.5 rounded-full overflow-hidden mt-3 max-w-[150px]">
                  <div 
                    className={`h-full rounded-full ${selectedCust.healthScore >= 80 ? 'bg-brand-success' : selectedCust.healthScore >= 50 ? 'bg-brand-warning' : 'bg-brand-error'}`}
                    style={{ width: `${selectedCust.healthScore}%` }}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Contact Records</h4>
                <div className="space-y-2 text-xxs text-text-secondary">
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="text-text-muted" />
                    <span>{selectedCust.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="text-text-muted" />
                    <span>{selectedCust.phone}</span>
                  </div>
                </div>
              </div>

              {/* Purchase History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Purchase Log</h4>
                  <button
                    onClick={() => setIsPurchaseOpen(true)}
                    className="text-[10px] text-brand-primary hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    Add Purchase <Plus size={10} />
                  </button>
                </div>
                
                <div className="space-y-2">
                  {selectedCust.purchaseHistory.length === 0 ? (
                    <p className="text-xxs text-text-muted italic">No purchases logged for this account.</p>
                  ) : (
                    selectedCust.purchaseHistory.map((item, index) => (
                      <div key={index} className="p-2.5 bg-input-bg/30 rounded border border-border-color/40 flex items-center justify-between text-xxs">
                        <div>
                          <span className="font-bold text-text-primary block">{item.item}</span>
                          <span className="text-[9px] text-text-muted block mt-0.5">Purchased on {item.date}</span>
                        </div>
                        <span className="font-extrabold text-brand-success">{formatPrice(item.amount)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-border-color bg-bg-card/30 flex justify-between gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xxs py-1.5"
                onClick={() => alert(`Archiving Customer: ${selectedCust.name}`)}
              >
                Archive Profile
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xxs py-1.5"
                onClick={() => alert(`Schedules follow-up logic for: ${selectedCust.name}`)}
              >
                Schedule Follow-Up
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE CUSTOMER DIALOG */}
      <Dialog
        isOpen={isAddCustOpen}
        onClose={() => setIsAddCustOpen(false)}
        title="Add New Customer Profile"
        size="md"
      >
        <form onSubmit={handleAddCustomer} className="space-y-4">
          <div>
            <Label htmlFor="custName">Customer Contact Name</Label>
            <Input
              id="custName"
              value={custName}
              onChange={(e) => setCustName(e.target.value)}
              placeholder="Bruce Wayne"
              required
            />
          </div>
          <div>
            <Label htmlFor="custCompany">Company Name</Label>
            <Input
              id="custCompany"
              value={custCompany}
              onChange={(e) => setCustCompany(e.target.value)}
              placeholder="Wayne Enterprises"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="custEmail">Email Address</Label>
              <Input
                id="custEmail"
                type="email"
                value={custEmail}
                onChange={(e) => setCustEmail(e.target.value)}
                placeholder="bruce@waynecorp.com"
              />
            </div>
            <div>
              <Label htmlFor="custPhone">Phone Number</Label>
              <Input
                id="custPhone"
                value={custPhone}
                onChange={(e) => setCustPhone(e.target.value)}
                placeholder="+1 555-4444"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="custHealth">Base Health Score (0-100)</Label>
              <Input
                id="custHealth"
                type="number"
                min="0"
                max="100"
                value={custHealth}
                onChange={(e) => setCustHealth(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="custAssigned">Assigned Manager</Label>
              <Select
                id="custAssigned"
                value={custAssigned}
                onChange={(e) => setCustAssigned(e.target.value)}
                options={mockUsers.map(u => ({ value: u.uid, label: u.name }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border-color">
            <Button type="button" variant="outline" onClick={() => setIsAddCustOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Customer
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ADD TRANSACTION/PURCHASE DIALOG */}
      <Dialog
        isOpen={isPurchaseOpen}
        onClose={() => setIsPurchaseOpen(false)}
        title="Log Customer Purchase Transaction"
        size="sm"
      >
        <form onSubmit={handleAddPurchase} className="space-y-4">
          <div>
            <Label htmlFor="purchaseItem">Item/License Package</Label>
            <Input
              id="purchaseItem"
              value={purchaseItem}
              onChange={(e) => setPurchaseItem(e.target.value)}
              placeholder="Enterprise Suite Subscription - Year 2"
              required
            />
          </div>
          <div>
            <Label htmlFor="purchaseAmount">Purchase Value (₹ INR Base)</Label>
            <div className="relative">
              <Input
                id="purchaseAmount"
                type="number"
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(e.target.value)}
                placeholder="500000"
                className="pl-7"
                required
              />
              <span className="absolute left-3.5 top-2.5 text-xs text-text-muted font-bold">₹</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border-color">
            <Button type="button" variant="outline" onClick={() => setIsPurchaseOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Record Sale
            </Button>
          </div>
        </form>
      </Dialog>
    </AppLayout>
  );
}
