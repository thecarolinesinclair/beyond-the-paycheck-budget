import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { Wallet, TrendingUp, Calendar, PiggyBank, CreditCard, Home, Settings, RotateCw, Receipt, ShoppingBag, BarChart3, CalendarDays, DollarSign, Target, Layers, Sprout, Calculator, LineChart as LineIcon, Ban, ChevronRight, Plus, Trash2, Edit2, Check, X, Sparkles, ArrowUpRight, ArrowDownRight, Coffee } from 'lucide-react';

// ====== ETSY-INSPIRED PALETTE ======
const C = {
  cream: '#FAF6F0',
  paper: '#F4ECE0',
  terracotta: '#C66B3D',
  terracottaDark: '#A0512E',
  sage: '#8FA67E',
  sageDark: '#6B8460',
  mustard: '#D4A04C',
  blush: '#E8B4A0',
  rust: '#B85C38',
  forest: '#3D5A40',
  ink: '#2D2A26',
  charcoal: '#4A4640',
  muted: '#8B8478',
  soft: '#E8DFD0',
  divider: '#DDD2BE',
};

const CATEGORIES = ['Housing','Utilities','Groceries','Dining Out','Transportation','Insurance','Healthcare','Entertainment','Subscriptions','Personal','Clothing','Gifts','Savings','Debt Payment','Investments','Education','Pets','Travel','Other'];
const CATEGORY_COLORS = ['#C66B3D','#8FA67E','#D4A04C','#E8B4A0','#B85C38','#3D5A40','#8B8478','#6B8460','#A0512E','#D4A04C','#C66B3D','#8FA67E','#E8B4A0','#B85C38','#3D5A40','#8B8478','#6B8460','#A0512E','#D4A04C'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// 50/30/20 mapping: Needs/Wants/Savings
const NEEDS = ['Housing','Utilities','Groceries','Transportation','Insurance','Healthcare','Education','Debt Payment'];
const WANTS = ['Dining Out','Entertainment','Subscriptions','Personal','Clothing','Gifts','Pets','Travel','Other'];
const SAVINGS = ['Savings','Investments'];

// ====== STORAGE HELPERS ======
const STORAGE_KEY = 'ultimate_budget_v1';
const loadData = async () => {
  try {
    const r = localStorage.getItem(STORAGE_KEY);
    return r ? JSON.parse(r) : null;
  } catch { return null; }
};
const saveData = async (data) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
};

// ====== DEFAULT DATA ======
const defaultData = () => ({
  hasSeenWelcome: false,
  setup: { name: 'My Budget', currency: '$', startMonth: new Date().getMonth(), startYear: new Date().getFullYear() },
  accounts: [
    { id: 1, name: 'Main Checking', type: 'Checking', balance: 3200 },
    { id: 2, name: 'Savings', type: 'Savings', balance: 8500 },
    { id: 3, name: 'Credit Card', type: 'Credit Card', balance: -1240 },
  ],
  recurring: [
    { id: 1, name: 'Rent', amount: 1450, category: 'Housing', day: 1, type: 'expense', account: 1 },
    { id: 2, name: 'Salary', amount: 4200, category: 'Other', day: 15, type: 'income', account: 1 },
    { id: 3, name: 'Spotify', amount: 11.99, category: 'Subscriptions', day: 5, type: 'expense', account: 1 },
    { id: 4, name: 'Internet', amount: 65, category: 'Utilities', day: 10, type: 'expense', account: 1 },
  ],
  payments: [],
  transactions: [
    { id: 1, date: new Date().toISOString().slice(0,10), name: 'Trader Joe\'s', amount: 87.42, category: 'Groceries', type: 'expense', account: 1 },
    { id: 2, date: new Date().toISOString().slice(0,10), name: 'Coffee shop', amount: 6.50, category: 'Dining Out', type: 'expense', account: 1 },
  ],
  sinkingFunds: [
    { id: 1, name: 'Vacation', goal: 2000, current: 450, deadline: '2026-08-01' },
    { id: 2, name: 'New Laptop', goal: 1500, current: 800, deadline: '2026-09-01' },
  ],
  debts: [
    { id: 1, name: 'Credit Card', balance: 1240, apr: 19.99, minPayment: 50 },
  ],
  netWorthHistory: [],
  investments: { principal: 5000, monthly: 300, years: 20, rate: 7 },
  noSpendDays: {},
  paychecks: [
    { id: 1, name: 'Primary Job', amount: 2100, frequency: 'biweekly', nextDate: new Date().toISOString().slice(0,10) },
  ],
});

// ====== UTILITY ======
const fmt = (n, curr = '$') => `${n < 0 ? '-' : ''}${curr}${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtShort = (n, curr = '$') => `${n < 0 ? '-' : ''}${curr}${Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

// ====== MAIN APP ======
export default function App() {
  const [data, setData] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboards');
  const [activeTab, setActiveTab] = useState('overview');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await loadData();
      setData(stored || defaultData());
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (loaded && data) saveData(data);
  }, [data, loaded]);

  if (!loaded || !data) {
    return <div style={{ minHeight: '100vh', background: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'serif', color: C.muted }}>Brewing your budget...</div>;
  }

  const update = (patch) => setData(prev => ({ ...prev, ...patch }));
  const curr = data.setup.currency;

  // Show welcome screen if user hasn't dismissed it
  if (!data.hasSeenWelcome) {
    return <Welcome onStart={() => update({ hasSeenWelcome: true })} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: C.cream, fontFamily: '"Nunito Sans", system-ui, sans-serif', color: C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700&family=Nunito+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-track { background: ${C.cream}; }
        ::-webkit-scrollbar-thumb { background: ${C.soft}; border-radius: 5px; }
        ::-webkit-scrollbar-thumb:hover { background: ${C.divider}; }
        .display { font-family: 'Fraunces', Georgia, serif; font-weight: 500; letter-spacing: -0.01em; }
        .display-italic { font-family: 'Fraunces', Georgia, serif; font-style: italic; font-weight: 400; }
        button { font-family: inherit; cursor: pointer; }
        input, select, textarea { font-family: inherit; }
        input:focus, select:focus, textarea:focus { outline: 2px solid ${C.terracotta}40; outline-offset: 1px; }
        .card { background: ${C.paper}; border-radius: 14px; padding: 24px; border: 1px solid ${C.divider}; }
        .card-hover:hover { border-color: ${C.terracotta}80; transition: border-color 0.2s; }
        .btn-primary { background: ${C.terracotta}; color: white; border: none; padding: 10px 18px; border-radius: 10px; font-weight: 600; font-size: 14px; display: inline-flex; align-items: center; gap: 6px; transition: all 0.15s; }
        .btn-primary:hover { background: ${C.terracottaDark}; transform: translateY(-1px); }
        .btn-ghost { background: transparent; color: ${C.charcoal}; border: 1px solid ${C.divider}; padding: 8px 14px; border-radius: 10px; font-weight: 500; font-size: 13px; transition: all 0.15s; }
        .btn-ghost:hover { background: ${C.soft}; }
        .btn-icon { background: transparent; border: none; color: ${C.muted}; padding: 6px; border-radius: 6px; display: inline-flex; transition: all 0.15s; }
        .btn-icon:hover { background: ${C.soft}; color: ${C.ink}; }
        .input { width: 100%; padding: 10px 12px; background: ${C.cream}; border: 1px solid ${C.divider}; border-radius: 8px; font-size: 14px; color: ${C.ink}; }
        .label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: ${C.muted}; margin-bottom: 6px; display: block; }
        .pill { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .grain { position: relative; }
        .grain::before { content:''; position: absolute; inset: 0; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E"); opacity: 0.04; pointer-events: none; border-radius: inherit; }
      `}</style>

      <Layout data={data} setData={setData} update={update} activeSection={activeSection} setActiveSection={setActiveSection} activeTab={activeTab} setActiveTab={setActiveTab} curr={curr} />
    </div>
  );
}

// ====== LAYOUT ======
function Layout({ data, setData, update, activeSection, setActiveSection, activeTab, setActiveTab, curr }) {
  const sections = {
    transactions: { label: 'Transactions', icon: CreditCard, color: C.terracotta, tabs: [
      { id: 'setup', label: 'Easy Setup', icon: Settings },
      { id: 'accounts', label: 'Bank Accounts', icon: Wallet },
      { id: 'recurring', label: 'Recurring', icon: RotateCw },
      { id: 'payments', label: 'Payments', icon: Receipt },
      { id: 'variable', label: 'Variable', icon: ShoppingBag },
    ]},
    dashboards: { label: 'Dashboards', icon: BarChart3, color: C.sage, tabs: [
      { id: 'overview', label: 'All-in-One', icon: Home },
      { id: 'annual', label: 'Annual Totals', icon: TrendingUp },
      { id: 'calendar', label: 'Calendar', icon: CalendarDays },
      { id: 'paycheck', label: 'Paycheck', icon: DollarSign },
    ]},
    monthly: { label: 'Monthly Insights', icon: Calendar, color: C.mustard, tabs: MONTHS.map((m, i) => ({ id: `m${i}`, label: m, icon: Calendar })) },
    wealth: { label: 'Build Wealth', icon: Sprout, color: C.forest, tabs: [
      { id: 'fifty', label: '50/30/20', icon: Target },
      { id: 'distribution', label: 'Expenses', icon: Layers },
      { id: 'sinking', label: 'Sinking Funds', icon: PiggyBank },
      { id: 'debt', label: 'Debt Payoff', icon: Calculator },
      { id: 'networth', label: 'Net Worth', icon: TrendingUp },
      { id: 'invest', label: 'Investments', icon: LineIcon },
      { id: 'nospend', label: 'No-Spend', icon: Ban },
    ]},
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* SIDEBAR */}
      <aside style={{ width: 260, background: C.paper, borderRight: `1px solid ${C.divider}`, padding: '28px 18px', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', flexShrink: 0 }}>
        <div style={{ marginBottom: 28, paddingLeft: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.terracotta, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${C.terracotta}40` }}>
              <Sparkles size={18} color="white" />
            </div>
            <div>
              <div className="display" style={{ fontSize: 16, lineHeight: 1, color: C.ink }}>Beyond the Paycheck</div>
              <div style={{ fontSize: 10, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>Budget System</div>
            </div>
          </div>
        </div>

        {Object.entries(sections).map(([key, section]) => {
          const Icon = section.icon;
          const isOpen = activeSection === key;
          return (
            <div key={key} style={{ marginBottom: 6 }}>
              <button
                onClick={() => { setActiveSection(key); if (!isOpen) setActiveTab(section.tabs[0].id); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  background: isOpen ? 'white' : 'transparent', border: 'none', borderRadius: 10,
                  color: C.ink, fontSize: 14, fontWeight: 600, textAlign: 'left',
                  boxShadow: isOpen ? `0 2px 6px ${C.divider}80` : 'none',
                }}
              >
                <div style={{ width: 26, height: 26, borderRadius: 6, background: section.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={14} color={section.color} />
                </div>
                <span>{section.label}</span>
                <ChevronRight size={14} style={{ marginLeft: 'auto', transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', color: C.muted }} />
              </button>
              {isOpen && (
                <div style={{ marginTop: 4, marginLeft: 8, paddingLeft: 12, borderLeft: `2px solid ${section.color}40` }}>
                  {section.tabs.map(tab => {
                    const TabIcon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                          background: isActive ? section.color + '15' : 'transparent', border: 'none', borderRadius: 7,
                          color: isActive ? section.color : C.charcoal, fontSize: 13, fontWeight: isActive ? 600 : 500, textAlign: 'left', marginBottom: 1,
                        }}
                      >
                        <TabIcon size={12} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <div style={{ marginTop: 28, padding: 14, background: C.cream, borderRadius: 10, border: `1px dashed ${C.divider}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Coffee size={12} color={C.terracotta} />
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.terracotta }}>Daily tip</div>
          </div>
          <p className="display-italic" style={{ fontSize: 13, lineHeight: 1.4, color: C.charcoal, margin: 0 }}>"A budget tells your money where to go instead of wondering where it went."</p>
        </div>

        <button
          onClick={() => update({ hasSeenWelcome: false })}
          style={{
            width: '100%', marginTop: 12, padding: '10px 12px', background: 'transparent',
            border: `1px solid ${C.divider}`, borderRadius: 10, color: C.charcoal,
            fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <Sparkles size={12} color={C.terracotta} /> Revisit tutorial
        </button>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, padding: '32px 40px', maxWidth: 'calc(100vw - 260px)', overflow: 'hidden' }}>
        <Header section={sections[activeSection]} tab={sections[activeSection].tabs.find(t => t.id === activeTab)} data={data} curr={curr} />
        <div style={{ marginTop: 28 }}>
          <Router activeSection={activeSection} activeTab={activeTab} data={data} setData={setData} update={update} curr={curr} />
        </div>
      </main>
    </div>
  );
}

// ====== WELCOME / TUTORIAL ======
function Welcome({ onStart }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      kicker: 'Welcome',
      title: 'Beyond the Paycheck',
      italic: 'Budget System.',
      lead: 'A complete money command center — 28 thoughtfully built tabs across 4 sections that work together to give you a true picture of your financial life.',
      body: (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginTop: 8 }}>
          {[
            { icon: CreditCard, color: C.terracotta, title: 'Transactions', desc: 'Set up accounts, recurring bills, paychecks, and log daily spending.' },
            { icon: BarChart3, color: C.sage, title: 'Dashboards', desc: 'See the whole picture: cash flow, calendars, and paycheck planning.' },
            { icon: Calendar, color: C.mustard, title: 'Monthly Insights', desc: '12 dedicated monthly views — start your budget any month of the year.' },
            { icon: Sprout, color: C.forest, title: 'Build Wealth', desc: '50/30/20 splits, sinking funds, debt payoff, net worth, and forecasts.' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} style={{ padding: 16, background: C.cream, borderRadius: 12, border: `1px solid ${C.divider}` }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: s.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <Icon size={16} color={s.color} />
                </div>
                <div className="display" style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            );
          })}
        </div>
      ),
    },
    {
      kicker: 'Step 1',
      title: 'Start with',
      italic: 'setup.',
      lead: "Before tracking anything, lay the foundation. This takes about 5–10 minutes, and you'll only do it once.",
      body: (
        <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
          {[
            { n: '1', t: 'Easy Setup', d: 'Name your budget, pick your currency, and choose a starting month.' },
            { n: '2', t: 'Bank Accounts', d: 'Add every account you own — checking, savings, credit cards. Negative balances mark liabilities.' },
            { n: '3', t: 'Recurring Transactions', d: 'List every income source and fixed bill (rent, subscriptions, utilities). These auto-populate calendars and dashboards.' },
            { n: '4', t: 'Paycheck Dashboard', d: 'Add your paychecks with frequency. The system converts weekly/biweekly into accurate monthly figures.' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: 14, background: C.cream, borderRadius: 10 }}>
              <div className="display" style={{ width: 32, height: 32, borderRadius: '50%', background: C.terracotta, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{s.n}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{s.t}</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{s.d}</div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      kicker: 'Step 2',
      title: 'Track as you',
      italic: 'go.',
      lead: 'Once foundation is set, daily upkeep takes 60 seconds. The trick is consistency — small habits, not perfection.',
      body: (
        <div style={{ marginTop: 8 }}>
          <div style={{ padding: 18, background: `linear-gradient(135deg, ${C.terracotta}15, ${C.mustard}15)`, borderRadius: 12, border: `1px solid ${C.divider}`, marginBottom: 14 }}>
            <div className="display" style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: C.terracottaDark }}>🪴 The daily ritual</div>
            <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: C.charcoal, lineHeight: 1.7 }}>
              <li>Open <strong>Variable Transactions</strong> and log anything you spent today.</li>
              <li>Pick a category — accurate categorization makes every dashboard work.</li>
              <li>If today was a no-spend day, tap it in the <strong>No-Spend Challenge</strong>.</li>
            </ol>
          </div>
          <div style={{ padding: 18, background: `linear-gradient(135deg, ${C.sage}15, ${C.forest}10)`, borderRadius: 12, border: `1px solid ${C.divider}` }}>
            <div className="display" style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: C.forest }}>🌿 The weekly review</div>
            <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: C.charcoal, lineHeight: 1.7 }}>
              <li>Check <strong>All-in-One Dashboard</strong> — are you on track this month?</li>
              <li>Review <strong>50/30/20</strong> — are needs, wants, and savings balanced?</li>
              <li>Update account balances if anything's drifted.</li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      kicker: 'Step 3',
      title: 'Build wealth,',
      italic: 'one goal at a time.',
      lead: 'The Build Wealth section is where this budget transforms from tracking into strategy.',
      body: (
        <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
          {[
            { icon: Target, c: C.terracotta, t: '50/30/20 Rule', d: '50% needs, 30% wants, 20% savings. The system auto-sorts your categories and shows where you sit.' },
            { icon: PiggyBank, c: C.sage, t: 'Sinking Funds', d: 'Save toward specific goals (vacation, laptop, emergency). Set a target and deadline — we calculate your monthly contribution.' },
            { icon: Calculator, c: C.rust, t: 'Debt Payoff', d: 'Choose Avalanche (save most interest) or Snowball (quick wins). See your exact debt-free date.' },
            { icon: TrendingUp, c: C.forest, t: 'Net Worth', d: 'Snapshot your net worth periodically to watch the line climb over months and years.' },
            { icon: LineIcon, c: C.mustard, t: 'Investment Forecast', d: 'See what compound interest does over decades. Adjust contribution and return rate to model scenarios.' },
            { icon: Ban, c: C.charcoal, t: 'No-Spend Challenge', d: 'Mark days you spent nothing. Build streaks. Watch mindful spending compound like interest.' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, background: C.cream, borderRadius: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: s.c + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={17} color={s.c} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{s.t}</div>
                  <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{s.d}</div>
                </div>
              </div>
            );
          })}
        </div>
      ),
    },
    {
      kicker: 'Pro tips',
      title: 'Get the most',
      italic: 'out of it.',
      lead: "A few habits that turn this tool into a transformation, not just a tracker.",
      body: (
        <div style={{ display: 'grid', gap: 12, marginTop: 8 }}>
          {[
            { emoji: '☕', t: 'Same time, same place', d: 'Pair logging with a daily ritual — morning coffee, evening tea. Habits stick when they have an anchor.' },
            { emoji: '🎯', t: 'Set sinking funds before you need them', d: 'Christmas, car repairs, vacations. The money is always going to come up — you just decide whether you saw it coming.' },
            { emoji: '📸', t: 'Snapshot your net worth monthly', d: 'On the 1st of every month, hit "Snapshot Today." Six months in, the trend line tells a story.' },
            { emoji: '🔥', t: 'Start a no-spend streak', d: "Even 2 days a week with zero discretionary spending compounds fast. Don't aim for perfect — aim for visible." },
            { emoji: '🌱', t: "Don't panic over the first month", d: "Your first month's data will be messy. That's diagnosis, not failure. By month three, patterns emerge." },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: 14, background: C.cream, borderRadius: 10 }}>
              <div style={{ fontSize: 22, flexShrink: 0 }}>{s.emoji}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{s.t}</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{s.d}</div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div style={{ minHeight: '100vh', background: C.cream, fontFamily: '"Nunito Sans", system-ui, sans-serif', color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700&family=Nunito+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .display { font-family: 'Fraunces', Georgia, serif; font-weight: 500; letter-spacing: -0.01em; }
        .display-italic { font-family: 'Fraunces', Georgia, serif; font-style: italic; font-weight: 400; }
        button { font-family: inherit; cursor: pointer; }
      `}</style>
      <div style={{ maxWidth: 780, width: '100%', background: C.paper, borderRadius: 20, padding: '48px 52px', border: `1px solid ${C.divider}`, boxShadow: `0 24px 64px ${C.ink}15`, position: 'relative' }}>
        {/* Decorative corner */}
        <div style={{ position: 'absolute', top: -1, right: -1, width: 120, height: 120, borderRadius: '0 20px 0 100px', background: `linear-gradient(135deg, ${C.terracotta}20, ${C.mustard}10)`, pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: C.terracotta, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${C.terracotta}40` }}>
            <Sparkles size={20} color="white" />
          </div>
          <div>
            <div className="display" style={{ fontSize: 17, lineHeight: 1, color: C.ink, fontWeight: 600 }}>Beyond the Paycheck</div>
            <div style={{ fontSize: 10, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>Budget System</div>
          </div>
        </div>

        {/* Kicker */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: C.terracotta + '20', color: C.terracottaDark, borderRadius: 100, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
          {current.kicker}
        </div>

        {/* Title */}
        <h1 className="display" style={{ fontSize: 44, lineHeight: 1.05, margin: 0, marginBottom: 14, color: C.ink, fontWeight: 500 }}>
          {current.title}{' '}
          <span className="display-italic" style={{ color: C.terracotta }}>{current.italic}</span>
        </h1>

        {/* Lead */}
        <p style={{ fontSize: 16, lineHeight: 1.6, color: C.charcoal, margin: 0, marginBottom: 24, maxWidth: 620 }}>
          {current.lead}
        </p>

        {/* Body */}
        <div style={{ marginBottom: 32 }}>
          {current.body}
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              style={{
                width: i === step ? 28 : 8, height: 8, borderRadius: 100,
                background: i === step ? C.terracotta : (i < step ? C.terracotta + '60' : C.divider),
                border: 'none', padding: 0, transition: 'all 0.2s',
              }}
            />
          ))}
          <span style={{ marginLeft: 'auto', fontSize: 12, color: C.muted, fontWeight: 600 }}>
            {step + 1} of {steps.length}
          </span>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              style={{ padding: '12px 20px', background: 'transparent', color: C.charcoal, border: `1px solid ${C.divider}`, borderRadius: 10, fontWeight: 600, fontSize: 14 }}
            >
              ← Back
            </button>
          )}
          {!isLast ? (
            <>
              <button
                onClick={() => setStep(step + 1)}
                style={{ padding: '12px 22px', background: C.terracotta, color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: `0 4px 12px ${C.terracotta}40` }}
              >
                Continue <ChevronRight size={16} />
              </button>
              <button
                onClick={onStart}
                style={{ padding: '12px 16px', background: 'transparent', color: C.muted, border: 'none', fontSize: 13, fontWeight: 500 }}
              >
                Skip tour
              </button>
            </>
          ) : (
            <>
              <div style={{ width: '100%', padding: '10px 14px', background: C.soft, borderRadius: 8, fontSize: 12, color: C.muted, textAlign: 'center', marginBottom: 8 }}>
                💡 This tool saves your data to your browser. For best results use it on the same device and browser each time. Clearing your browser cache will reset your data.
              </div>
              <button
                onClick={onStart}
                style={{ padding: '14px 28px', background: C.terracotta, color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: `0 4px 12px ${C.terracotta}40` }}
              >
                <Sparkles size={16} /> Let's begin
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Header({ section, tab, data, curr }) {
  const totalAssets = data.accounts.filter(a => a.balance > 0).reduce((s, a) => s + a.balance, 0);
  const totalDebt = data.accounts.filter(a => a.balance < 0).reduce((s, a) => s + a.balance, 0);
  const netWorth = totalAssets + totalDebt;

  return (
    <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span className="pill" style={{ background: section.color + '20', color: section.color }}>{section.label}</span>
        </div>
        <h1 className="display" style={{ fontSize: 38, lineHeight: 1, margin: 0, color: C.ink }}>
          {tab?.label}
          <span className="display-italic" style={{ color: section.color, marginLeft: 8, fontSize: 36 }}>.</span>
        </h1>
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: C.paper, padding: '12px 18px', borderRadius: 12, border: `1px solid ${C.divider}` }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Net Worth</div>
          <div className="display" style={{ fontSize: 22, color: netWorth >= 0 ? C.sageDark : C.rust, fontWeight: 600 }}>{fmt(netWorth, curr)}</div>
        </div>
      </div>
    </header>
  );
}

// ====== ROUTER ======
function Router({ activeSection, activeTab, data, setData, update, curr }) {
  const props = { data, setData, update, curr };

  if (activeSection === 'transactions') {
    if (activeTab === 'setup') return <Setup {...props} />;
    if (activeTab === 'accounts') return <Accounts {...props} />;
    if (activeTab === 'recurring') return <Recurring {...props} />;
    if (activeTab === 'payments') return <Payments {...props} />;
    if (activeTab === 'variable') return <Variable {...props} />;
  }
  if (activeSection === 'dashboards') {
    if (activeTab === 'overview') return <Overview {...props} />;
    if (activeTab === 'annual') return <AnnualTotals {...props} />;
    if (activeTab === 'calendar') return <AutoCalendar {...props} />;
    if (activeTab === 'paycheck') return <PaycheckDash {...props} />;
  }
  if (activeSection === 'monthly') {
    const monthIdx = parseInt(activeTab.replace('m', ''));
    return <Monthly {...props} monthIdx={monthIdx} />;
  }
  if (activeSection === 'wealth') {
    if (activeTab === 'fifty') return <FiftyThirtyTwenty {...props} />;
    if (activeTab === 'distribution') return <ExpenseDistribution {...props} />;
    if (activeTab === 'sinking') return <SinkingFunds {...props} />;
    if (activeTab === 'debt') return <DebtCalculator {...props} />;
    if (activeTab === 'networth') return <NetWorth {...props} />;
    if (activeTab === 'invest') return <InvestmentForecast {...props} />;
    if (activeTab === 'nospend') return <NoSpend {...props} />;
  }
  return <div>Coming soon</div>;
}

// ====== REUSABLE COMPONENTS ======
function Stat({ label, value, sub, icon: Icon, color = C.terracotta, trend }) {
  return (
    <div className="card grain" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <span className="label">{label}</span>
        {Icon && (
          <div style={{ width: 32, height: 32, borderRadius: 8, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={16} color={color} />
          </div>
        )}
      </div>
      <div className="display" style={{ fontSize: 28, color: C.ink, fontWeight: 600, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.muted, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
        {trend === 'up' && <ArrowUpRight size={12} color={C.sageDark} />}
        {trend === 'down' && <ArrowDownRight size={12} color={C.rust} />}
        {sub}
      </div>}
    </div>
  );
}

function EmptyState({ icon: Icon, title, message, onAction, actionLabel }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', background: C.paper, borderRadius: 14, border: `1px dashed ${C.divider}` }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <Icon size={24} color={C.muted} />
      </div>
      <h3 className="display" style={{ fontSize: 20, color: C.ink, margin: 0, marginBottom: 6 }}>{title}</h3>
      <p style={{ fontSize: 14, color: C.muted, marginBottom: 20, maxWidth: 360, margin: '0 auto 20px' }}>{message}</p>
      {onAction && <button className="btn-primary" onClick={onAction}><Plus size={14} /> {actionLabel}</button>}
    </div>
  );
}

// ====== SETUP ======
function Setup({ data, update, curr }) {
  return (
    <div style={{ maxWidth: 720 }}>
      <div className="card grain">
        <h3 className="display" style={{ margin: 0, marginBottom: 6, fontSize: 22 }}>Welcome aboard</h3>
        <p style={{ fontSize: 14, color: C.muted, marginTop: 0, marginBottom: 24 }}>Let's get your budget set up. You can change these any time.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <div>
            <label className="label">Budget Name</label>
            <input className="input" value={data.setup.name} onChange={e => update({ setup: { ...data.setup, name: e.target.value } })} />
          </div>
          <div>
            <label className="label">Currency Symbol</label>
            <select className="input" value={data.setup.currency} onChange={e => update({ setup: { ...data.setup, currency: e.target.value } })}>
              <option value="$">$ USD</option>
              <option value="€">€ EUR</option>
              <option value="£">£ GBP</option>
              <option value="¥">¥ JPY</option>
              <option value="₹">₹ INR</option>
              <option value="C$">C$ CAD</option>
              <option value="A$">A$ AUD</option>
            </select>
          </div>
          <div>
            <label className="label">Starting Month</label>
            <select className="input" value={data.setup.startMonth} onChange={e => update({ setup: { ...data.setup, startMonth: parseInt(e.target.value) } })}>
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Starting Year</label>
            <input type="number" className="input" value={data.setup.startYear} onChange={e => update({ setup: { ...data.setup, startYear: parseInt(e.target.value) || new Date().getFullYear() } })} />
          </div>
        </div>
      </div>

      <div className="card grain" style={{ marginTop: 18 }}>
        <h3 className="display" style={{ margin: 0, marginBottom: 16, fontSize: 18 }}>Quick start checklist</h3>
        <div style={{ display: 'grid', gap: 10 }}>
          {[
            { d: 'Add your bank accounts and current balances', t: 'accounts', has: data.accounts.length > 0 },
            { d: 'Set up recurring income and bills', t: 'recurring', has: data.recurring.length > 0 },
            { d: 'Log a few recent variable transactions', t: 'variable', has: data.transactions.length > 0 },
            { d: 'Define sinking fund goals', t: 'sinking', has: data.sinkingFunds.length > 0 },
            { d: 'Track your debts (if any)', t: 'debt', has: data.debts.length > 0 },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: C.cream, borderRadius: 10 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: s.has ? C.sage : 'white', border: `2px solid ${s.has ? C.sage : C.divider}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {s.has && <Check size={12} color="white" />}
              </div>
              <span style={{ fontSize: 14, color: s.has ? C.muted : C.ink, textDecoration: s.has ? 'line-through' : 'none' }}>{s.d}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ====== ACCOUNTS ======
function Accounts({ data, update, curr }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'Checking', balance: '' });

  const add = () => {
    if (!form.name) return;
    update({ accounts: [...data.accounts, { id: Date.now(), name: form.name, type: form.type, balance: parseFloat(form.balance) || 0 }] });
    setForm({ name: '', type: 'Checking', balance: '' });
  };
  const remove = (id) => update({ accounts: data.accounts.filter(a => a.id !== id) });
  const save = (id, patch) => update({ accounts: data.accounts.map(a => a.id === id ? { ...a, ...patch } : a) });

  const totalAssets = data.accounts.filter(a => a.balance > 0).reduce((s, a) => s + a.balance, 0);
  const totalDebt = Math.abs(data.accounts.filter(a => a.balance < 0).reduce((s, a) => s + a.balance, 0));

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 22 }}>
        <Stat label="Total Assets" value={fmt(totalAssets, curr)} icon={Wallet} color={C.sage} />
        <Stat label="Total Liabilities" value={fmt(totalDebt, curr)} icon={CreditCard} color={C.rust} />
        <Stat label="Net Position" value={fmt(totalAssets - totalDebt, curr)} icon={TrendingUp} color={C.terracotta} />
      </div>

      <div className="card grain" style={{ marginBottom: 18 }}>
        <h3 className="display" style={{ margin: 0, marginBottom: 16, fontSize: 18 }}>Add an account</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
          <div><label className="label">Name</label><input className="input" placeholder="e.g. Main Checking" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
          <div><label className="label">Type</label>
            <select className="input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              <option>Checking</option><option>Savings</option><option>Credit Card</option><option>Investment</option><option>Cash</option><option>Loan</option>
            </select>
          </div>
          <div><label className="label">Balance</label><input type="number" step="0.01" className="input" placeholder="0.00" value={form.balance} onChange={e => setForm({...form, balance: e.target.value})} /></div>
          <button className="btn-primary" onClick={add}><Plus size={14}/> Add</button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        {data.accounts.length === 0 ? (
          <EmptyState icon={Wallet} title="No accounts yet" message="Add your first bank or credit account to start tracking." />
        ) : data.accounts.map(a => (
          <div key={a.id} className="card card-hover" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: a.balance >= 0 ? C.sage + '25' : C.rust + '25', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {a.type === 'Credit Card' ? <CreditCard size={20} color={C.rust} /> : a.type === 'Savings' ? <PiggyBank size={20} color={C.sage} /> : <Wallet size={20} color={a.balance >= 0 ? C.sage : C.rust} />}
            </div>
            {editing === a.id ? (
              <>
                <input className="input" style={{ flex: 1 }} value={a.name} onChange={e => save(a.id, { name: e.target.value })} />
                <select className="input" style={{ width: 140 }} value={a.type} onChange={e => save(a.id, { type: e.target.value })}>
                  <option>Checking</option><option>Savings</option><option>Credit Card</option><option>Investment</option><option>Cash</option><option>Loan</option>
                </select>
                <input type="number" step="0.01" className="input" style={{ width: 120 }} value={a.balance} onChange={e => save(a.id, { balance: parseFloat(e.target.value) || 0 })} />
                <button className="btn-icon" onClick={() => setEditing(null)}><Check size={16} color={C.sageDark} /></button>
              </>
            ) : (
              <>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: C.ink }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{a.type}</div>
                </div>
                <div className="display" style={{ fontSize: 20, fontWeight: 600, color: a.balance >= 0 ? C.ink : C.rust }}>{fmt(a.balance, curr)}</div>
                <button className="btn-icon" onClick={() => setEditing(a.id)}><Edit2 size={14} /></button>
                <button className="btn-icon" onClick={() => remove(a.id)}><Trash2 size={14} /></button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ====== RECURRING ======
function Recurring({ data, update, curr }) {
  const [form, setForm] = useState({ name: '', amount: '', category: 'Other', day: 1, type: 'expense', account: data.accounts[0]?.id || 1 });

  const add = () => {
    if (!form.name || !form.amount) return;
    update({ recurring: [...data.recurring, { id: Date.now(), name: form.name, amount: parseFloat(form.amount), category: form.category, day: parseInt(form.day), type: form.type, account: parseInt(form.account) }] });
    setForm({ name: '', amount: '', category: 'Other', day: 1, type: 'expense', account: data.accounts[0]?.id || 1 });
  };
  const remove = (id) => update({ recurring: data.recurring.filter(r => r.id !== id) });

  const monthlyIncome = data.recurring.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
  const monthlyExpense = data.recurring.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 22 }}>
        <Stat label="Monthly Income" value={fmt(monthlyIncome, curr)} icon={ArrowUpRight} color={C.sage} />
        <Stat label="Monthly Bills" value={fmt(monthlyExpense, curr)} icon={ArrowDownRight} color={C.rust} />
        <Stat label="Net Monthly" value={fmt(monthlyIncome - monthlyExpense, curr)} icon={TrendingUp} color={C.terracotta} />
      </div>

      <div className="card grain" style={{ marginBottom: 18 }}>
        <h3 className="display" style={{ margin: 0, marginBottom: 16, fontSize: 18 }}>Add recurring item</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.3fr 1fr 1fr auto', gap: 10, alignItems: 'end' }}>
          <div><label className="label">Name</label><input className="input" placeholder="e.g. Rent, Salary" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
          <div><label className="label">Amount</label><input type="number" step="0.01" className="input" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} /></div>
          <div><label className="label">Category</label>
            <select className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div><label className="label">Day of Month</label><input type="number" min="1" max="31" className="input" value={form.day} onChange={e => setForm({...form, day: e.target.value})} /></div>
          <div><label className="label">Type</label>
            <select className="input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              <option value="income">Income</option><option value="expense">Expense</option>
            </select>
          </div>
          <button className="btn-primary" onClick={add}><Plus size={14}/></button>
        </div>
      </div>

      <div style={{ background: C.paper, borderRadius: 14, border: `1px solid ${C.divider}`, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 0.8fr 0.8fr 60px', gap: 12, padding: '12px 18px', background: C.soft, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted }}>
          <div>Name</div><div>Category</div><div>Amount</div><div>Day</div><div>Type</div><div></div>
        </div>
        {data.recurring.length === 0 ? (
          <div style={{ padding: 36, textAlign: 'center', color: C.muted }}>No recurring transactions yet.</div>
        ) : data.recurring.map(r => (
          <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 0.8fr 0.8fr 60px', gap: 12, padding: '14px 18px', alignItems: 'center', borderTop: `1px solid ${C.divider}`, fontSize: 14 }}>
            <div style={{ fontWeight: 600 }}>{r.name}</div>
            <div><span className="pill" style={{ background: C.cream, color: C.charcoal }}>{r.category}</span></div>
            <div className="display" style={{ fontWeight: 600, color: r.type === 'income' ? C.sageDark : C.ink }}>{fmt(r.amount, curr)}</div>
            <div>{r.day}</div>
            <div><span className="pill" style={{ background: r.type === 'income' ? C.sage + '25' : C.rust + '25', color: r.type === 'income' ? C.sageDark : C.rust }}>{r.type}</span></div>
            <button className="btn-icon" onClick={() => remove(r.id)}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ====== PAYMENTS (upcoming) ======
function Payments({ data, curr }) {
  const today = new Date();
  const upcoming = useMemo(() => {
    const items = [];
    data.recurring.forEach(r => {
      for (let m = 0; m < 3; m++) {
        const d = new Date(today.getFullYear(), today.getMonth() + m, r.day);
        if (d >= today) items.push({ ...r, dueDate: d });
      }
    });
    return items.sort((a,b) => a.dueDate - b.dueDate).slice(0, 20);
  }, [data.recurring]);

  return (
    <div>
      <div className="card grain" style={{ marginBottom: 18 }}>
        <h3 className="display" style={{ margin: 0, marginBottom: 6, fontSize: 18 }}>Upcoming Payments</h3>
        <p style={{ fontSize: 13, color: C.muted, marginTop: 0, marginBottom: 0 }}>Generated automatically from your recurring transactions.</p>
      </div>

      {upcoming.length === 0 ? (
        <EmptyState icon={Receipt} title="No upcoming payments" message="Set up recurring transactions to see them appear here." />
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {upcoming.map((p, i) => {
            const daysAway = Math.ceil((p.dueDate - today) / (1000 * 60 * 60 * 24));
            const urgent = daysAway <= 3;
            return (
              <div key={i} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 56, textAlign: 'center', padding: '6px 0', background: urgent ? C.rust + '15' : C.cream, borderRadius: 8, border: `1px solid ${urgent ? C.rust + '30' : C.divider}` }}>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 700, color: urgent ? C.rust : C.muted, letterSpacing: '0.05em' }}>{MONTHS[p.dueDate.getMonth()].slice(0,3)}</div>
                  <div className="display" style={{ fontSize: 20, fontWeight: 600, color: urgent ? C.rust : C.ink, lineHeight: 1 }}>{p.dueDate.getDate()}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{p.category} · in {daysAway} {daysAway === 1 ? 'day' : 'days'}</div>
                </div>
                <div className="display" style={{ fontSize: 18, fontWeight: 600, color: p.type === 'income' ? C.sageDark : C.ink }}>
                  {p.type === 'income' ? '+' : ''}{fmt(p.amount, curr)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ====== VARIABLE TRANSACTIONS ======
function Variable({ data, update, curr }) {
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0,10), name: '', amount: '', category: 'Other', type: 'expense', account: data.accounts[0]?.id || 1 });
  const [filter, setFilter] = useState('all');

  const add = () => {
    if (!form.name || !form.amount) return;
    update({ transactions: [{ id: Date.now(), ...form, amount: parseFloat(form.amount), account: parseInt(form.account) }, ...data.transactions] });
    setForm({ ...form, name: '', amount: '' });
  };
  const remove = (id) => update({ transactions: data.transactions.filter(t => t.id !== id) });

  const filtered = filter === 'all' ? data.transactions : data.transactions.filter(t => t.type === filter);

  return (
    <div>
      <div className="card grain" style={{ marginBottom: 18 }}>
        <h3 className="display" style={{ margin: 0, marginBottom: 16, fontSize: 18 }}>Log a transaction</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1.3fr 1fr auto', gap: 10, alignItems: 'end' }}>
          <div><label className="label">Date</label><input type="date" className="input" value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></div>
          <div><label className="label">Description</label><input className="input" placeholder="e.g. Trader Joe's" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
          <div><label className="label">Amount</label><input type="number" step="0.01" className="input" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} /></div>
          <div><label className="label">Category</label>
            <select className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div><label className="label">Type</label>
            <select className="input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              <option value="expense">Expense</option><option value="income">Income</option>
            </select>
          </div>
          <button className="btn-primary" onClick={add}><Plus size={14}/></button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {['all','expense','income'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 14px', borderRadius: 100, border: 'none', fontSize: 13, fontWeight: 600,
            background: filter === f ? C.ink : 'transparent', color: filter === f ? 'white' : C.charcoal, cursor: 'pointer',
            textTransform: 'capitalize'
          }}>{f}</button>
        ))}
      </div>

      <div style={{ background: C.paper, borderRadius: 14, border: `1px solid ${C.divider}`, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1.3fr 1fr 60px', gap: 12, padding: '12px 18px', background: C.soft, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted }}>
          <div>Date</div><div>Description</div><div>Category</div><div>Amount</div><div></div>
        </div>
        {filtered.length === 0 ? (
          <div style={{ padding: 36, textAlign: 'center', color: C.muted }}>No transactions yet.</div>
        ) : filtered.map(t => (
          <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1.3fr 1fr 60px', gap: 12, padding: '12px 18px', alignItems: 'center', borderTop: `1px solid ${C.divider}`, fontSize: 14 }}>
            <div style={{ color: C.muted, fontSize: 13 }}>{t.date}</div>
            <div style={{ fontWeight: 600 }}>{t.name}</div>
            <div><span className="pill" style={{ background: C.cream, color: C.charcoal }}>{t.category}</span></div>
            <div className="display" style={{ fontWeight: 600, color: t.type === 'income' ? C.sageDark : C.ink }}>{t.type === 'income' ? '+' : '-'}{fmt(t.amount, curr).replace('-','')}</div>
            <button className="btn-icon" onClick={() => remove(t.id)}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ====== OVERVIEW DASHBOARD ======
function Overview({ data, curr }) {
  const totalAssets = data.accounts.filter(a => a.balance > 0).reduce((s, a) => s + a.balance, 0);
  const totalDebt = Math.abs(data.accounts.filter(a => a.balance < 0).reduce((s, a) => s + a.balance, 0));
  const monthlyIncome = data.recurring.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
  const monthlyBills = data.recurring.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);

  const thisMonth = new Date().toISOString().slice(0,7);
  const thisMonthTx = data.transactions.filter(t => t.date.startsWith(thisMonth));
  const monthSpent = thisMonthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0) + monthlyBills;
  const monthEarned = thisMonthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) + monthlyIncome;

  const byCategory = useMemo(() => {
    const map = {};
    thisMonthTx.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    data.recurring.filter(r => r.type === 'expense').forEach(r => {
      map[r.category] = (map[r.category] || 0) + r.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [data]);

  const last6 = useMemo(() => {
    const out = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0,7);
      const monthTx = data.transactions.filter(t => t.date.startsWith(key));
      const income = monthTx.filter(t => t.type === 'income').reduce((s,t) => s+t.amount, 0) + monthlyIncome;
      const expense = monthTx.filter(t => t.type === 'expense').reduce((s,t) => s+t.amount, 0) + monthlyBills;
      out.push({ month: MONTHS[d.getMonth()].slice(0,3), income, expense, net: income - expense });
    }
    return out;
  }, [data, monthlyIncome, monthlyBills]);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 22 }}>
        <Stat label="This Month In" value={fmt(monthEarned, curr)} icon={ArrowUpRight} color={C.sage} />
        <Stat label="This Month Out" value={fmt(monthSpent, curr)} icon={ArrowDownRight} color={C.rust} />
        <Stat label="This Month Net" value={fmt(monthEarned - monthSpent, curr)} icon={TrendingUp} color={C.terracotta} />
        <Stat label="Savings Rate" value={`${monthEarned > 0 ? Math.round(((monthEarned - monthSpent) / monthEarned) * 100) : 0}%`} icon={PiggyBank} color={C.mustard} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 18 }}>
        <div className="card grain">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <h3 className="display" style={{ margin: 0, fontSize: 18 }}>Income vs. Expenses</h3>
            <span style={{ fontSize: 12, color: C.muted }}>Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={last6}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.divider} vertical={false} />
              <XAxis dataKey="month" stroke={C.muted} fontSize={11} />
              <YAxis stroke={C.muted} fontSize={11} tickFormatter={v => `${curr}${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
              <Tooltip contentStyle={{ background: C.paper, border: `1px solid ${C.divider}`, borderRadius: 8, fontSize: 13 }} formatter={v => fmt(v, curr)} />
              <Bar dataKey="income" fill={C.sage} radius={[6,6,0,0]} />
              <Bar dataKey="expense" fill={C.terracotta} radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card grain">
          <h3 className="display" style={{ margin: 0, marginBottom: 16, fontSize: 18 }}>Where it goes</h3>
          {byCategory.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={byCategory.slice(0, 6)} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                    {byCategory.slice(0,6).map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i]} />)}
                  </Pie>
                  <Tooltip formatter={v => fmt(v, curr)} contentStyle={{ background: C.paper, border: `1px solid ${C.divider}`, borderRadius: 8, fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: 8 }}>
                {byCategory.slice(0,4).map((c, i) => (
                  <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, marginBottom: 4 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: CATEGORY_COLORS[i] }} />
                    <span style={{ flex: 1, color: C.charcoal }}>{c.name}</span>
                    <span style={{ fontWeight: 600 }}>{fmt(c.value, curr)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div style={{ padding: 30, textAlign: 'center', color: C.muted, fontSize: 13 }}>No expenses logged this month</div>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card grain">
          <h3 className="display" style={{ margin: 0, marginBottom: 14, fontSize: 18 }}>Account Balances</h3>
          {data.accounts.map(a => {
            const pct = totalAssets > 0 && a.balance > 0 ? (a.balance / totalAssets) * 100 : 0;
            return (
              <div key={a.id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{a.name}</span>
                  <span className="display" style={{ fontSize: 14, fontWeight: 600, color: a.balance >= 0 ? C.ink : C.rust }}>{fmt(a.balance, curr)}</span>
                </div>
                <div style={{ height: 6, background: C.cream, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: a.balance >= 0 ? C.sage : C.rust, borderRadius: 3 }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="card grain">
          <h3 className="display" style={{ margin: 0, marginBottom: 14, fontSize: 18 }}>Recent Activity</h3>
          {data.transactions.slice(0, 5).map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${C.divider}` }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: t.type === 'income' ? C.sage + '25' : C.rust + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {t.type === 'income' ? <ArrowUpRight size={14} color={C.sageDark} /> : <ArrowDownRight size={14} color={C.rust} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{t.date} · {t.category}</div>
              </div>
              <div className="display" style={{ fontSize: 14, fontWeight: 600, color: t.type === 'income' ? C.sageDark : C.ink }}>
                {t.type === 'income' ? '+' : '-'}{fmt(t.amount, curr).replace('-','')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ====== ANNUAL TOTALS ======
function AnnualTotals({ data, curr }) {
  const monthlyIncome = data.recurring.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
  const monthlyBills = data.recurring.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
  const year = new Date().getFullYear();

  const data12 = useMemo(() => {
    return MONTHS.map((m, i) => {
      const key = `${year}-${String(i+1).padStart(2,'0')}`;
      const tx = data.transactions.filter(t => t.date.startsWith(key));
      const income = tx.filter(t => t.type === 'income').reduce((s,t)=>s+t.amount,0) + monthlyIncome;
      const expense = tx.filter(t => t.type === 'expense').reduce((s,t)=>s+t.amount,0) + monthlyBills;
      return { month: m.slice(0,3), income, expense, net: income - expense };
    });
  }, [data, monthlyIncome, monthlyBills, year]);

  const totalIncome = data12.reduce((s,m) => s + m.income, 0);
  const totalExpense = data12.reduce((s,m) => s + m.expense, 0);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 22 }}>
        <Stat label={`${year} Total In`} value={fmt(totalIncome, curr)} icon={ArrowUpRight} color={C.sage} />
        <Stat label={`${year} Total Out`} value={fmt(totalExpense, curr)} icon={ArrowDownRight} color={C.rust} />
        <Stat label={`${year} Net`} value={fmt(totalIncome - totalExpense, curr)} icon={TrendingUp} color={C.terracotta} />
        <Stat label="Avg Monthly Save" value={fmt((totalIncome - totalExpense)/12, curr)} icon={PiggyBank} color={C.mustard} />
      </div>

      <div className="card grain" style={{ marginBottom: 18 }}>
        <h3 className="display" style={{ margin: 0, marginBottom: 16, fontSize: 18 }}>{year} Cash Flow</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data12}>
            <defs>
              <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.sage} stopOpacity={0.4} />
                <stop offset="100%" stopColor={C.sage} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.terracotta} stopOpacity={0.35} />
                <stop offset="100%" stopColor={C.terracotta} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.divider} vertical={false} />
            <XAxis dataKey="month" stroke={C.muted} fontSize={11} />
            <YAxis stroke={C.muted} fontSize={11} tickFormatter={v => `${curr}${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
            <Tooltip contentStyle={{ background: C.paper, border: `1px solid ${C.divider}`, borderRadius: 8 }} formatter={v => fmt(v, curr)} />
            <Area type="monotone" dataKey="income" stroke={C.sageDark} fill="url(#gIncome)" strokeWidth={2} />
            <Area type="monotone" dataKey="expense" stroke={C.terracotta} fill="url(#gExpense)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="card grain">
        <h3 className="display" style={{ margin: 0, marginBottom: 16, fontSize: 18 }}>Month by Month</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {data12.map(m => (
            <div key={m.month} style={{ padding: 14, background: C.cream, borderRadius: 10, border: `1px solid ${C.divider}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: C.muted, letterSpacing: '0.08em' }}>{m.month}</div>
              <div className="display" style={{ fontSize: 18, fontWeight: 600, color: m.net >= 0 ? C.sageDark : C.rust, marginTop: 4 }}>{fmt(m.net, curr)}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{fmt(m.income, curr)} in · {fmt(m.expense, curr)} out</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ====== CALENDAR ======
function AutoCalendar({ data, curr }) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const eventsByDay = useMemo(() => {
    const map = {};
    data.recurring.forEach(r => {
      if (r.day <= daysInMonth) {
        if (!map[r.day]) map[r.day] = [];
        map[r.day].push(r);
      }
    });
    data.transactions.forEach(t => {
      const [y,m,d] = t.date.split('-').map(Number);
      if (y === viewYear && m - 1 === viewMonth) {
        if (!map[d]) map[d] = [];
        map[d].push(t);
      }
    });
    return map;
  }, [data, viewMonth, viewYear, daysInMonth]);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-ghost" onClick={() => { const d = new Date(viewYear, viewMonth - 1); setViewMonth(d.getMonth()); setViewYear(d.getFullYear()); }}>‹</button>
          <button className="btn-ghost" onClick={() => { setViewMonth(today.getMonth()); setViewYear(today.getFullYear()); }}>Today</button>
          <button className="btn-ghost" onClick={() => { const d = new Date(viewYear, viewMonth + 1); setViewMonth(d.getMonth()); setViewYear(d.getFullYear()); }}>›</button>
        </div>
        <h3 className="display" style={{ margin: 0, fontSize: 22 }}>{MONTHS[viewMonth]} <span className="display-italic" style={{ color: C.terracotta }}>{viewYear}</span></h3>
        <div style={{ width: 120 }} />
      </div>

      <div className="card" style={{ padding: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: C.muted, letterSpacing: '0.08em', padding: '6px 8px', textAlign: 'center' }}>{d}</div>
          ))}
          {cells.map((day, i) => {
            const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
            const events = day ? (eventsByDay[day] || []) : [];
            const dayIncome = events.filter(e => e.type === 'income').reduce((s,e) => s + e.amount, 0);
            const dayExpense = events.filter(e => e.type === 'expense').reduce((s,e) => s + e.amount, 0);
            return (
              <div key={i} style={{
                aspectRatio: '1 / 1.1', padding: 8, background: day ? (isToday ? C.terracotta + '15' : C.cream) : 'transparent',
                borderRadius: 8, border: isToday ? `1.5px solid ${C.terracotta}` : `1px solid ${day ? C.divider : 'transparent'}`,
                display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden', minHeight: 70
              }}>
                {day && (
                  <>
                    <div style={{ fontSize: 13, fontWeight: isToday ? 700 : 500, color: isToday ? C.terracotta : C.ink }}>{day}</div>
                    {dayIncome > 0 && <div style={{ fontSize: 10, color: C.sageDark, fontWeight: 600 }}>+{fmtShort(dayIncome, curr)}</div>}
                    {dayExpense > 0 && <div style={{ fontSize: 10, color: C.rust, fontWeight: 600 }}>-{fmtShort(dayExpense, curr)}</div>}
                    {events.slice(0,2).map((e, j) => (
                      <div key={j} style={{ fontSize: 9, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</div>
                    ))}
                    {events.length > 2 && <div style={{ fontSize: 9, color: C.muted }}>+{events.length - 2}</div>}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ====== PAYCHECK DASHBOARD ======
function PaycheckDash({ data, update, curr }) {
  const [form, setForm] = useState({ name: '', amount: '', frequency: 'biweekly', nextDate: new Date().toISOString().slice(0,10) });

  const add = () => {
    if (!form.name || !form.amount) return;
    update({ paychecks: [...data.paychecks, { id: Date.now(), ...form, amount: parseFloat(form.amount) }] });
    setForm({ name: '', amount: '', frequency: 'biweekly', nextDate: new Date().toISOString().slice(0,10) });
  };
  const remove = (id) => update({ paychecks: data.paychecks.filter(p => p.id !== id) });

  const calcMonthly = (p) => {
    if (p.frequency === 'weekly') return p.amount * 4.33;
    if (p.frequency === 'biweekly') return p.amount * 2.17;
    if (p.frequency === 'monthly') return p.amount;
    if (p.frequency === 'semimonthly') return p.amount * 2;
    return p.amount;
  };

  const totalMonthly = data.paychecks.reduce((s,p) => s + calcMonthly(p), 0);
  const totalAnnual = totalMonthly * 12;
  const monthlyBills = data.recurring.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 22 }}>
        <Stat label="Monthly Take-Home" value={fmt(totalMonthly, curr)} icon={DollarSign} color={C.sage} />
        <Stat label="Annual Income" value={fmt(totalAnnual, curr)} icon={TrendingUp} color={C.terracotta} />
        <Stat label="After Fixed Bills" value={fmt(totalMonthly - monthlyBills, curr)} icon={PiggyBank} color={C.mustard} />
      </div>

      <div className="card grain" style={{ marginBottom: 18 }}>
        <h3 className="display" style={{ margin: 0, marginBottom: 16, fontSize: 18 }}>Add a paycheck</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.3fr 1fr auto', gap: 10, alignItems: 'end' }}>
          <div><label className="label">Source</label><input className="input" placeholder="e.g. Day Job" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
          <div><label className="label">Amount</label><input type="number" step="0.01" className="input" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} /></div>
          <div><label className="label">Frequency</label>
            <select className="input" value={form.frequency} onChange={e => setForm({...form, frequency: e.target.value})}>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="semimonthly">Semi-monthly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div><label className="label">Next Pay Date</label><input type="date" className="input" value={form.nextDate} onChange={e => setForm({...form, nextDate: e.target.value})} /></div>
          <button className="btn-primary" onClick={add}><Plus size={14}/></button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        {data.paychecks.map(p => {
          const monthly = calcMonthly(p);
          return (
            <div key={p.id} className="card card-hover" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: C.sage + '25', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={20} color={C.sageDark} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{p.frequency} · next: {p.nextDate}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="display" style={{ fontSize: 18, fontWeight: 600 }}>{fmt(p.amount, curr)}</div>
                <div style={{ fontSize: 11, color: C.muted }}>≈ {fmt(monthly, curr)}/mo</div>
              </div>
              <button className="btn-icon" onClick={() => remove(p.id)}><Trash2 size={14} /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ====== MONTHLY VIEW ======
function Monthly({ data, monthIdx, curr }) {
  const year = new Date().getFullYear();
  const key = `${year}-${String(monthIdx+1).padStart(2,'0')}`;
  const tx = data.transactions.filter(t => t.date.startsWith(key));
  const monthlyRecurringIn = data.recurring.filter(r => r.type === 'income').reduce((s,r) => s + r.amount, 0);
  const monthlyRecurringOut = data.recurring.filter(r => r.type === 'expense').reduce((s,r) => s + r.amount, 0);

  const income = tx.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0) + monthlyRecurringIn;
  const expense = tx.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0) + monthlyRecurringOut;
  const net = income - expense;

  const byCategory = {};
  tx.filter(t => t.type === 'expense').forEach(t => { byCategory[t.category] = (byCategory[t.category] || 0) + t.amount; });
  data.recurring.filter(r => r.type === 'expense').forEach(r => { byCategory[r.category] = (byCategory[r.category] || 0) + r.amount; });
  const catData = Object.entries(byCategory).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 22 }}>
        <Stat label="Income" value={fmt(income, curr)} icon={ArrowUpRight} color={C.sage} />
        <Stat label="Expenses" value={fmt(expense, curr)} icon={ArrowDownRight} color={C.rust} />
        <Stat label="Net Saved" value={fmt(net, curr)} icon={PiggyBank} color={net >= 0 ? C.sage : C.rust} />
        <Stat label="Savings Rate" value={`${income > 0 ? Math.round((net/income)*100) : 0}%`} icon={Target} color={C.terracotta} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16 }}>
        <div className="card grain">
          <h3 className="display" style={{ margin: 0, marginBottom: 14, fontSize: 18 }}>Transactions in {MONTHS[monthIdx]}</h3>
          {tx.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: C.muted, fontSize: 13 }}>No variable transactions logged for this month yet.</div>
          ) : (
            <div style={{ maxHeight: 360, overflowY: 'auto' }}>
              {tx.map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${C.divider}` }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: t.type === 'income' ? C.sage : C.terracotta }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{t.date} · {t.category}</div>
                  </div>
                  <div className="display" style={{ fontSize: 14, fontWeight: 600, color: t.type === 'income' ? C.sageDark : C.ink }}>
                    {t.type === 'income' ? '+' : '-'}{fmt(t.amount, curr).replace('-','')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card grain">
          <h3 className="display" style={{ margin: 0, marginBottom: 14, fontSize: 18 }}>Spending Breakdown</h3>
          {catData.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: C.muted, fontSize: 13 }}>No expenses yet</div>
          ) : catData.slice(0, 8).map((c, i) => {
            const pct = (c.value / expense) * 100;
            return (
              <div key={c.name} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{c.name}</span>
                  <span style={{ fontSize: 12, color: C.muted }}>{fmt(c.value, curr)} · {pct.toFixed(0)}%</span>
                </div>
                <div style={{ height: 6, background: C.cream, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: CATEGORY_COLORS[i], borderRadius: 3 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ====== 50/30/20 ======
function FiftyThirtyTwenty({ data, curr }) {
  const monthlyIncome = data.recurring.filter(r => r.type === 'income').reduce((s,r) => s + r.amount, 0);
  const monthlyRecurringExp = data.recurring.filter(r => r.type === 'expense').reduce((s,r) => s + r.amount, 0);

  const thisMonth = new Date().toISOString().slice(0,7);
  const monthTx = data.transactions.filter(t => t.date.startsWith(thisMonth));

  const allExpenses = [
    ...data.recurring.filter(r => r.type === 'expense').map(r => ({ amount: r.amount, category: r.category })),
    ...monthTx.filter(t => t.type === 'expense').map(t => ({ amount: t.amount, category: t.category })),
  ];

  const needs = allExpenses.filter(e => NEEDS.includes(e.category)).reduce((s,e) => s+e.amount, 0);
  const wants = allExpenses.filter(e => WANTS.includes(e.category)).reduce((s,e) => s+e.amount, 0);
  const savings = allExpenses.filter(e => SAVINGS.includes(e.category)).reduce((s,e) => s+e.amount, 0);

  const targetNeeds = monthlyIncome * 0.5;
  const targetWants = monthlyIncome * 0.3;
  const targetSavings = monthlyIncome * 0.2;

  const Bar = ({ label, actual, target, color, items }) => {
    const pct = target > 0 ? Math.min((actual / target) * 100, 200) : 0;
    const over = actual > target;
    return (
      <div className="card grain" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <div>
            <h3 className="display" style={{ margin: 0, fontSize: 18 }}>{label}</h3>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{items.join(' · ')}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="display" style={{ fontSize: 22, fontWeight: 600, color: over ? C.rust : C.ink }}>{fmt(actual, curr)}</div>
            <div style={{ fontSize: 12, color: C.muted }}>of {fmt(target, curr)}</div>
          </div>
        </div>
        <div style={{ height: 10, background: C.cream, borderRadius: 5, overflow: 'hidden', position: 'relative' }}>
          <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: color, borderRadius: 5, transition: 'width 0.3s' }} />
          {over && <div style={{ position: 'absolute', top: 0, left: '100%', width: `${pct - 100}%`, maxWidth: '50%', height: '100%', background: C.rust, opacity: 0.6 }} />}
        </div>
        <div style={{ fontSize: 11, color: over ? C.rust : C.muted, marginTop: 6, fontWeight: 600 }}>
          {over ? `${fmt(actual - target, curr)} over budget` : `${fmt(target - actual, curr)} remaining`} · {pct.toFixed(0)}% used
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="card grain" style={{ marginBottom: 22, background: `linear-gradient(135deg, ${C.terracotta}, ${C.rust})`, color: 'white', border: 'none' }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.85 }}>The 50/30/20 Rule</div>
        <h2 className="display" style={{ fontSize: 24, margin: '6px 0 8px', fontWeight: 500 }}>Balance your month, build your wealth.</h2>
        <p style={{ fontSize: 14, opacity: 0.9, margin: 0, maxWidth: 600 }}>Half for what you need, a third for what you love, and a fifth for the future you. Based on monthly income of <strong>{fmt(monthlyIncome, curr)}</strong>.</p>
      </div>

      <Bar label="50% · Needs" actual={needs} target={targetNeeds} color={C.terracotta} items={NEEDS.slice(0,5)} />
      <Bar label="30% · Wants" actual={wants} target={targetWants} color={C.mustard} items={WANTS.slice(0,5)} />
      <Bar label="20% · Savings & Debt" actual={savings} target={targetSavings} color={C.sage} items={SAVINGS} />
    </div>
  );
}

// ====== EXPENSE DISTRIBUTION ======
function ExpenseDistribution({ data, curr }) {
  const thisMonth = new Date().toISOString().slice(0,7);
  const allExpenses = [
    ...data.recurring.filter(r => r.type === 'expense').map(r => ({ amount: r.amount, category: r.category, name: r.name })),
    ...data.transactions.filter(t => t.type === 'expense' && t.date.startsWith(thisMonth)).map(t => ({ amount: t.amount, category: t.category, name: t.name })),
  ];

  const total = allExpenses.reduce((s,e) => s + e.amount, 0);
  const byCat = {};
  allExpenses.forEach(e => { byCat[e.category] = (byCat[e.category] || 0) + e.amount; });
  const catData = Object.entries(byCat).map(([name, value]) => ({ name, value, pct: total > 0 ? (value/total)*100 : 0 })).sort((a,b) => b.value - a.value);

  return (
    <div>
      <div className="card grain" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <h3 className="display" style={{ margin: 0, fontSize: 20 }}>Where every dollar goes</h3>
          <span style={{ fontSize: 13, color: C.muted }}>Total: <strong style={{ color: C.ink }}>{fmt(total, curr)}</strong></span>
        </div>
        {catData.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 24, alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={catData} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={120} paddingAngle={2}>
                  {catData.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => fmt(v, curr)} contentStyle={{ background: C.paper, border: `1px solid ${C.divider}`, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div>
              {catData.map((c, i) => (
                <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${C.divider}` }}>
                  <div style={{ width: 14, height: 14, borderRadius: 4, background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                  <span style={{ fontSize: 13, color: C.muted }}>{c.pct.toFixed(1)}%</span>
                  <span className="display" style={{ fontSize: 14, fontWeight: 600, minWidth: 90, textAlign: 'right' }}>{fmt(c.value, curr)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : <div style={{ padding: 40, textAlign: 'center', color: C.muted }}>Add some expenses to see your distribution</div>}
      </div>
    </div>
  );
}

// ====== SINKING FUNDS ======
function SinkingFunds({ data, update, curr }) {
  const [form, setForm] = useState({ name: '', goal: '', current: '', deadline: '' });

  const add = () => {
    if (!form.name || !form.goal) return;
    update({ sinkingFunds: [...data.sinkingFunds, { id: Date.now(), name: form.name, goal: parseFloat(form.goal), current: parseFloat(form.current) || 0, deadline: form.deadline }] });
    setForm({ name: '', goal: '', current: '', deadline: '' });
  };
  const remove = (id) => update({ sinkingFunds: data.sinkingFunds.filter(s => s.id !== id) });
  const updateFund = (id, patch) => update({ sinkingFunds: data.sinkingFunds.map(s => s.id === id ? { ...s, ...patch } : s) });

  return (
    <div>
      <div className="card grain" style={{ marginBottom: 18 }}>
        <h3 className="display" style={{ margin: 0, marginBottom: 16, fontSize: 18 }}>Create a sinking fund</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.2fr auto', gap: 10, alignItems: 'end' }}>
          <div><label className="label">Goal Name</label><input className="input" placeholder="e.g. Vacation, Car Fund" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
          <div><label className="label">Target Amount</label><input type="number" className="input" value={form.goal} onChange={e => setForm({...form, goal: e.target.value})} /></div>
          <div><label className="label">Currently Saved</label><input type="number" className="input" value={form.current} onChange={e => setForm({...form, current: e.target.value})} /></div>
          <div><label className="label">Target Date</label><input type="date" className="input" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} /></div>
          <button className="btn-primary" onClick={add}><Plus size={14}/></button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {data.sinkingFunds.map(f => {
          const pct = (f.current / f.goal) * 100;
          const remaining = f.goal - f.current;
          const monthsLeft = f.deadline ? Math.max(1, Math.ceil((new Date(f.deadline) - new Date()) / (1000*60*60*24*30))) : null;
          const monthly = monthsLeft ? remaining / monthsLeft : null;
          return (
            <div key={f.id} className="card grain" style={{ position: 'relative' }}>
              <button className="btn-icon" onClick={() => remove(f.id)} style={{ position: 'absolute', top: 16, right: 16 }}><Trash2 size={14} /></button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: C.sage + '25', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PiggyBank size={20} color={C.sageDark} />
                </div>
                <div>
                  <h3 className="display" style={{ margin: 0, fontSize: 20 }}>{f.name}</h3>
                  {f.deadline && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>by {f.deadline}</div>}
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <span className="display" style={{ fontSize: 22, fontWeight: 600 }}>{fmt(f.current, curr)}</span>
                  <span style={{ fontSize: 13, color: C.muted }}>of {fmt(f.goal, curr)}</span>
                </div>
                <div style={{ height: 10, background: C.cream, borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: `linear-gradient(90deg, ${C.sage}, ${C.sageDark})`, borderRadius: 5 }} />
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>{pct.toFixed(1)}% complete · {fmt(remaining, curr)} to go</div>
              </div>
              {monthly && monthly > 0 && (
                <div style={{ padding: 10, background: C.cream, borderRadius: 8, fontSize: 12, marginBottom: 10 }}>
                  💡 Save <strong>{fmt(monthly, curr)}/month</strong> to hit your goal
                </div>
              )}
              <div style={{ display: 'flex', gap: 6 }}>
                <input type="number" className="input" placeholder="+ Add" style={{ flex: 1 }} onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v)) { updateFund(f.id, { current: f.current + v }); e.target.value = ''; }
                  }
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ====== DEBT CALCULATOR ======
function DebtCalculator({ data, update, curr }) {
  const [form, setForm] = useState({ name: '', balance: '', apr: '', minPayment: '' });
  const [strategy, setStrategy] = useState('avalanche');
  const [extra, setExtra] = useState(100);

  const add = () => {
    if (!form.name || !form.balance) return;
    update({ debts: [...data.debts, { id: Date.now(), name: form.name, balance: parseFloat(form.balance), apr: parseFloat(form.apr) || 0, minPayment: parseFloat(form.minPayment) || 0 }] });
    setForm({ name: '', balance: '', apr: '', minPayment: '' });
  };
  const remove = (id) => update({ debts: data.debts.filter(d => d.id !== id) });

  const totalDebt = data.debts.reduce((s,d) => s + d.balance, 0);
  const totalMin = data.debts.reduce((s,d) => s + d.minPayment, 0);

  // Simulation
  const sim = useMemo(() => {
    if (data.debts.length === 0) return { months: 0, totalPaid: 0, totalInterest: 0, schedule: [] };
    const sorted = [...data.debts].sort((a,b) => strategy === 'avalanche' ? b.apr - a.apr : a.balance - b.balance);
    let debts = sorted.map(d => ({ ...d }));
    const totalPayment = totalMin + extra;
    let months = 0;
    let totalInterest = 0;
    const schedule = [];

    while (debts.some(d => d.balance > 0) && months < 600) {
      months++;
      let available = totalPayment;
      // Apply interest first
      debts.forEach(d => {
        if (d.balance > 0) {
          const i = d.balance * (d.apr / 100 / 12);
          d.balance += i;
          totalInterest += i;
        }
      });
      // Pay minimums
      debts.forEach(d => {
        if (d.balance > 0) {
          const pay = Math.min(d.minPayment, d.balance);
          d.balance -= pay;
          available -= pay;
        }
      });
      // Extra to first active debt by strategy
      for (let d of debts) {
        if (d.balance > 0 && available > 0) {
          const extraPay = Math.min(available, d.balance);
          d.balance -= extraPay;
          available -= extraPay;
        }
      }
      schedule.push({ month: months, balance: debts.reduce((s,d) => s + Math.max(0,d.balance), 0) });
    }
    return { months, totalPaid: totalDebt + totalInterest, totalInterest, schedule };
  }, [data.debts, strategy, extra, totalMin, totalDebt]);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 22 }}>
        <Stat label="Total Debt" value={fmt(totalDebt, curr)} icon={CreditCard} color={C.rust} />
        <Stat label="Min. Monthly" value={fmt(totalMin, curr)} icon={Calendar} color={C.terracotta} />
        <Stat label="Debt-Free In" value={sim.months > 0 ? `${Math.floor(sim.months/12)}y ${sim.months%12}m` : '—'} icon={Target} color={C.sage} />
      </div>

      <div className="card grain" style={{ marginBottom: 18 }}>
        <h3 className="display" style={{ margin: 0, marginBottom: 16, fontSize: 18 }}>Add a debt</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 10, alignItems: 'end' }}>
          <div><label className="label">Name</label><input className="input" placeholder="e.g. Visa, Student Loan" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
          <div><label className="label">Balance</label><input type="number" className="input" value={form.balance} onChange={e => setForm({...form, balance: e.target.value})} /></div>
          <div><label className="label">APR %</label><input type="number" step="0.01" className="input" value={form.apr} onChange={e => setForm({...form, apr: e.target.value})} /></div>
          <div><label className="label">Min Payment</label><input type="number" className="input" value={form.minPayment} onChange={e => setForm({...form, minPayment: e.target.value})} /></div>
          <button className="btn-primary" onClick={add}><Plus size={14}/></button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 16, marginBottom: 18 }}>
        <div className="card grain">
          <h3 className="display" style={{ margin: 0, marginBottom: 16, fontSize: 18 }}>Payoff Strategy</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <button onClick={() => setStrategy('avalanche')} style={{
              flex: 1, padding: '10px 12px', borderRadius: 10, border: `2px solid ${strategy === 'avalanche' ? C.terracotta : C.divider}`,
              background: strategy === 'avalanche' ? C.terracotta + '15' : 'white', cursor: 'pointer', textAlign: 'left'
            }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: strategy === 'avalanche' ? C.terracotta : C.ink }}>Avalanche</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Highest APR first · saves most $</div>
            </button>
            <button onClick={() => setStrategy('snowball')} style={{
              flex: 1, padding: '10px 12px', borderRadius: 10, border: `2px solid ${strategy === 'snowball' ? C.terracotta : C.divider}`,
              background: strategy === 'snowball' ? C.terracotta + '15' : 'white', cursor: 'pointer', textAlign: 'left'
            }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: strategy === 'snowball' ? C.terracotta : C.ink }}>Snowball</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Smallest balance first · quick wins</div>
            </button>
          </div>
          <label className="label">Extra Monthly Payment</label>
          <input type="number" className="input" value={extra} onChange={e => setExtra(parseFloat(e.target.value) || 0)} />
          <div style={{ marginTop: 16, padding: 14, background: C.cream, borderRadius: 10 }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Interest you'll pay</div>
            <div className="display" style={{ fontSize: 22, fontWeight: 600, color: C.rust }}>{fmt(sim.totalInterest, curr)}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>Total paid: <strong>{fmt(sim.totalPaid, curr)}</strong></div>
          </div>
        </div>

        <div className="card grain">
          <h3 className="display" style={{ margin: 0, marginBottom: 16, fontSize: 18 }}>Debt Payoff Timeline</h3>
          {sim.schedule.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={sim.schedule}>
                <defs>
                  <linearGradient id="gDebt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.rust} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={C.rust} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.divider} vertical={false} />
                <XAxis dataKey="month" stroke={C.muted} fontSize={11} label={{ value: 'Months', position: 'insideBottom', offset: -2, fontSize: 11, fill: C.muted }} />
                <YAxis stroke={C.muted} fontSize={11} tickFormatter={v => `${curr}${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
                <Tooltip contentStyle={{ background: C.paper, border: `1px solid ${C.divider}`, borderRadius: 8 }} formatter={v => fmt(v, curr)} />
                <Area type="monotone" dataKey="balance" stroke={C.rust} fill="url(#gDebt)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div style={{ padding: 40, textAlign: 'center', color: C.muted }}>Add a debt to see the payoff timeline</div>}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        {data.debts.map(d => (
          <div key={d.id} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: C.rust + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={20} color={C.rust} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{d.name}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{d.apr}% APR · min {fmt(d.minPayment, curr)}/mo</div>
            </div>
            <div className="display" style={{ fontSize: 20, fontWeight: 600, color: C.rust }}>{fmt(d.balance, curr)}</div>
            <button className="btn-icon" onClick={() => remove(d.id)}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ====== NET WORTH ======
function NetWorth({ data, update, curr }) {
  const totalAssets = data.accounts.filter(a => a.balance > 0).reduce((s, a) => s + a.balance, 0);
  const totalLiab = Math.abs(data.accounts.filter(a => a.balance < 0).reduce((s, a) => s + a.balance, 0)) + data.debts.reduce((s,d) => s+d.balance, 0);
  const netWorth = totalAssets - totalLiab;

  const snapshot = () => {
    const today = new Date().toISOString().slice(0,10);
    const history = (data.netWorthHistory || []).filter(h => h.date !== today);
    update({ netWorthHistory: [...history, { date: today, value: netWorth }].sort((a,b) => a.date.localeCompare(b.date)) });
  };

  return (
    <div>
      <div className="card grain" style={{ marginBottom: 22, background: `linear-gradient(135deg, ${C.forest}, ${C.sageDark})`, color: 'white', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.85 }}>Your Net Worth</div>
            <div className="display" style={{ fontSize: 48, fontWeight: 600, marginTop: 8, lineHeight: 1 }}>{fmt(netWorth, curr)}</div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 10 }}>
              {fmt(totalAssets, curr)} in assets · {fmt(totalLiab, curr)} in liabilities
            </div>
          </div>
          <button onClick={snapshot} style={{ background: 'white', color: C.forest, border: 'none', padding: '10px 16px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            📸 Snapshot Today
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        <div className="card grain">
          <h3 className="display" style={{ margin: 0, marginBottom: 16, fontSize: 18 }}>Net Worth Over Time</h3>
          {(data.netWorthHistory || []).length > 1 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.netWorthHistory}>
                <defs>
                  <linearGradient id="gNW" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.sage} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={C.sage} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.divider} vertical={false} />
                <XAxis dataKey="date" stroke={C.muted} fontSize={11} />
                <YAxis stroke={C.muted} fontSize={11} tickFormatter={v => `${curr}${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
                <Tooltip contentStyle={{ background: C.paper, border: `1px solid ${C.divider}`, borderRadius: 8 }} formatter={v => fmt(v, curr)} />
                <Area type="monotone" dataKey="value" stroke={C.sageDark} fill="url(#gNW)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div style={{ padding: 60, textAlign: 'center', color: C.muted, fontSize: 13 }}>Take snapshots over time to see growth.<br/>Hit "Snapshot Today" above to begin.</div>}
        </div>

        <div className="card grain">
          <h3 className="display" style={{ margin: 0, marginBottom: 16, fontSize: 18 }}>Composition</h3>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: C.sageDark, letterSpacing: '0.08em', marginBottom: 8 }}>Assets</div>
            {data.accounts.filter(a => a.balance > 0).map(a => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, borderBottom: `1px solid ${C.divider}` }}>
                <span>{a.name}</span>
                <span className="display" style={{ fontWeight: 600 }}>{fmt(a.balance, curr)}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: C.rust, letterSpacing: '0.08em', marginBottom: 8 }}>Liabilities</div>
            {data.accounts.filter(a => a.balance < 0).map(a => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, borderBottom: `1px solid ${C.divider}` }}>
                <span>{a.name}</span>
                <span className="display" style={{ fontWeight: 600, color: C.rust }}>{fmt(Math.abs(a.balance), curr)}</span>
              </div>
            ))}
            {data.debts.map(d => (
              <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, borderBottom: `1px solid ${C.divider}` }}>
                <span>{d.name}</span>
                <span className="display" style={{ fontWeight: 600, color: C.rust }}>{fmt(d.balance, curr)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ====== INVESTMENT FORECAST ======
function InvestmentForecast({ data, update, curr }) {
  const inv = data.investments;
  const set = (patch) => update({ investments: { ...inv, ...patch } });

  const forecast = useMemo(() => {
    const out = [];
    const r = inv.rate / 100 / 12;
    let bal = inv.principal;
    for (let y = 0; y <= inv.years; y++) {
      out.push({ year: y, balance: Math.round(bal), contributions: inv.principal + inv.monthly * 12 * y });
      for (let m = 0; m < 12; m++) {
        bal = bal * (1 + r) + inv.monthly;
      }
    }
    return out;
  }, [inv]);

  const final = forecast[forecast.length - 1];
  const totalContrib = final.contributions;
  const interestEarned = final.balance - totalContrib;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 22 }}>
        <Stat label={`In ${inv.years} years`} value={fmt(final.balance, curr)} icon={TrendingUp} color={C.sage} />
        <Stat label="Total Contributed" value={fmt(totalContrib, curr)} icon={Wallet} color={C.terracotta} />
        <Stat label="Interest Earned" value={fmt(interestEarned, curr)} icon={Sparkles} color={C.mustard} sub={`${((interestEarned/totalContrib)*100).toFixed(0)}% growth on contributions`} />
      </div>

      <div className="card grain" style={{ marginBottom: 18 }}>
        <h3 className="display" style={{ margin: 0, marginBottom: 16, fontSize: 18 }}>Forecast inputs</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <div><label className="label">Starting Amount</label><input type="number" className="input" value={inv.principal} onChange={e => set({ principal: parseFloat(e.target.value) || 0 })} /></div>
          <div><label className="label">Monthly Contribution</label><input type="number" className="input" value={inv.monthly} onChange={e => set({ monthly: parseFloat(e.target.value) || 0 })} /></div>
          <div><label className="label">Annual Return (%)</label><input type="number" step="0.1" className="input" value={inv.rate} onChange={e => set({ rate: parseFloat(e.target.value) || 0 })} /></div>
          <div><label className="label">Years</label><input type="number" className="input" value={inv.years} onChange={e => set({ years: parseInt(e.target.value) || 1 })} /></div>
        </div>
      </div>

      <div className="card grain">
        <h3 className="display" style={{ margin: 0, marginBottom: 16, fontSize: 18 }}>Growth projection</h3>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={forecast}>
            <defs>
              <linearGradient id="gBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.sage} stopOpacity={0.5} />
                <stop offset="100%" stopColor={C.sage} stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="gContrib" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.terracotta} stopOpacity={0.5} />
                <stop offset="100%" stopColor={C.terracotta} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.divider} vertical={false} />
            <XAxis dataKey="year" stroke={C.muted} fontSize={11} label={{ value: 'Years', position: 'insideBottom', offset: -2, fontSize: 11, fill: C.muted }} />
            <YAxis stroke={C.muted} fontSize={11} tickFormatter={v => `${curr}${v >= 1000000 ? (v/1000000).toFixed(1)+'M' : v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
            <Tooltip contentStyle={{ background: C.paper, border: `1px solid ${C.divider}`, borderRadius: 8 }} formatter={v => fmt(v, curr)} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" name="Balance" dataKey="balance" stroke={C.sageDark} fill="url(#gBalance)" strokeWidth={2.5} />
            <Area type="monotone" name="Contributions" dataKey="contributions" stroke={C.terracotta} fill="url(#gContrib)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ====== NO-SPEND CHALLENGE ======
function NoSpend({ data, update, curr }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());

  const toggleDay = (dateKey) => {
    const days = { ...(data.noSpendDays || {}) };
    days[dateKey] = !days[dateKey];
    update({ noSpendDays: days });
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthKey = `${year}-${String(month+1).padStart(2,'0')}`;
  const monthNoSpend = Object.entries(data.noSpendDays || {}).filter(([k, v]) => k.startsWith(monthKey) && v).length;

  // streak
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0,10);
    if (data.noSpendDays?.[key]) streak++;
    else break;
  }

  // year total
  const yearTotal = Object.entries(data.noSpendDays || {}).filter(([k, v]) => k.startsWith(String(year)) && v).length;

  return (
    <div>
      <div className="card grain" style={{ marginBottom: 22, background: `linear-gradient(135deg, ${C.mustard}, ${C.terracotta})`, color: 'white', border: 'none' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.85 }}>This Month</div>
            <div className="display" style={{ fontSize: 38, fontWeight: 600, lineHeight: 1, marginTop: 4 }}>{monthNoSpend}<span style={{ fontSize: 18, opacity: 0.7 }}> / {daysInMonth}</span></div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>no-spend days</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.85 }}>Current Streak</div>
            <div className="display" style={{ fontSize: 38, fontWeight: 600, lineHeight: 1, marginTop: 4 }}>{streak}🔥</div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>day{streak === 1 ? '' : 's'} in a row</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.85 }}>This Year</div>
            <div className="display" style={{ fontSize: 38, fontWeight: 600, lineHeight: 1, marginTop: 4 }}>{yearTotal}</div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>total mindful days</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 className="display" style={{ fontSize: 22, margin: 0 }}>{MONTHS[month]} <span className="display-italic" style={{ color: C.mustard }}>{year}</span></h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-ghost" onClick={() => { const d = new Date(year, month-1); setMonth(d.getMonth()); setYear(d.getFullYear()); }}>‹</button>
          <button className="btn-ghost" onClick={() => { const d = new Date(year, month+1); setMonth(d.getMonth()); setYear(d.getFullYear()); }}>›</button>
        </div>
      </div>

      <div className="card grain">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: C.muted, letterSpacing: '0.08em', padding: '6px 8px', textAlign: 'center' }}>{d}</div>
          ))}
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            const isNoSpend = data.noSpendDays?.[dateKey];
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const isFuture = new Date(dateKey) > today;
            return (
              <button
                key={i}
                disabled={isFuture}
                onClick={() => toggleDay(dateKey)}
                style={{
                  aspectRatio: '1', borderRadius: 10, border: isToday ? `2px solid ${C.terracotta}` : `1px solid ${C.divider}`,
                  background: isNoSpend ? C.sage : (isFuture ? C.cream : 'white'),
                  color: isNoSpend ? 'white' : (isFuture ? C.muted : C.ink),
                  fontWeight: isNoSpend ? 700 : 500, fontSize: 15,
                  cursor: isFuture ? 'not-allowed' : 'pointer',
                  opacity: isFuture ? 0.5 : 1,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
                  transition: 'all 0.15s',
                }}
              >
                <span>{day}</span>
                {isNoSpend && <span style={{ fontSize: 10 }}>✓</span>}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 18, padding: 14, background: C.cream, borderRadius: 10, fontSize: 13, color: C.charcoal, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sparkles size={16} color={C.terracotta} />
          <span>Click any past or current day to mark it as a no-spend day. Watch the streaks build.</span>
        </div>
      </div>
    </div>
  );
}
