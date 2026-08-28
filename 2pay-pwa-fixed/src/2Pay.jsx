import React, { useState, useEffect, useRef } from 'react';
import {
  Menu, Settings as SettingsIcon, Plus, Minus, Users, User, ShoppingCart,
  Home as HomeIcon, List, X, ChevronRight, ChevronDown, Wallet,
  ArrowUpRight, ArrowDownRight, Sun, Moon, Monitor, ShoppingBag, Loader2
} from 'lucide-react';

const DISPLAY_FONT = "'Space Grotesk', sans-serif";
const BODY_FONT = "'Manrope', sans-serif";

const THEMES = {
  light: {
    appBg: '#F5EFE1',
    cardBg: '#FFFDF8',
    cardBg2: '#FBF4E4',
    border: '#EAE0C8',
    divider: '#EFE7D5',
    navy: '#1E2A44',
    navyDeep: '#131B2E',
    onNavy: '#F6F1E3',
    gold: '#BD8A2E',
    goldBg: '#F3E4BE',
    green: '#3F7D58',
    greenBg: '#E3EFE6',
    rust: '#B65B3B',
    rustBg: '#F4E3D9',
    textPrimary: '#2A2620',
    textSecondary: '#8C8267',
    textFaint: '#B3A98D',
    shadow: 'rgba(43,38,28,0.08)',
  },
  dark: {
    appBg: '#121729',
    cardBg: '#1B2237',
    cardBg2: '#212944',
    border: '#2B3555',
    divider: '#262F4D',
    navy: '#2E3E63',
    navyDeep: '#0D1220',
    onNavy: '#F2ECDA',
    gold: '#E3B255',
    goldBg: '#3A3116',
    green: '#5FAE7C',
    greenBg: '#173327',
    rust: '#DE8760',
    rustBg: '#3A2419',
    textPrimary: '#F2ECDA',
    textSecondary: '#9AA1BE',
    textFaint: '#5E6789',
    shadow: 'rgba(0,0,0,0.35)',
  },
};

const NAV_ITEMS = [
  { key: 'home', label: 'Home', icon: HomeIcon },
  { key: 'transactions', label: 'Transactions', icon: List },
  { key: 'debts', label: 'Debts', icon: Users },
  { key: 'wishlist', label: 'Wishlist', icon: ShoppingCart },
  { key: 'settings', label: 'Settings', icon: SettingsIcon },
];

const CURRENCIES = ['JOD', 'USD', 'EUR', 'GBP', 'SAR', 'AED', 'EGP', 'KWD'];

// ---------- helpers ----------
function uid(prefix = 'id') {
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
function addDays(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}
function todayISO() {
  return addDays(0);
}
function formatRelativeDate(dateStr) {
  if (!dateStr) return '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + 'T00:00:00');
  const diffDays = Math.round((today - d) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}
function formatAmount(amount, settings, signMode = false) {
  // signMode: false = magnitude only (debt/wishlist amounts, always positive by nature)
  // 'negative' = show a minus sign when negative, nothing when positive (balance)
  // true/'both' = show + or - explicitly (transaction rows)
  const decimals = settings.showDecimals ? 2 : 0;
  const abs = Math.abs(amount).toFixed(decimals);
  if (signMode === true || signMode === 'both') {
    const sign = amount < 0 ? '\u2212' : '+';
    return `${sign}${abs} ${settings.currency}`;
  }
  if (signMode === 'negative') {
    const sign = amount < 0 ? '\u2212' : '';
    return `${sign}${abs} ${settings.currency}`;
  }
  return `${abs} ${settings.currency}`;
}
function initials(name) {
  if (!name || !name.trim()) return '2P';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
function seedData() {
  return {
    balance: 52,
    transactions: [
      { id: uid('tx'), type: 'add', description: 'Added Money', note: 'Pocket money', amount: 20, date: todayISO() },
      { id: uid('tx'), type: 'spend', description: 'Spending', note: 'Food', amount: -5, date: addDays(-1) },
      { id: uid('tx'), type: 'debt_paid', description: 'Paid Karim', note: 'Lunch debt', amount: -10, date: addDays(-2) },
      { id: uid('tx'), type: 'owed_paid', description: 'Yousef Paid You', note: 'For project', amount: 15, date: addDays(-3) },
    ],
    debtsIOwe: [
      { id: uid('d'), name: 'Ahmed', amount: 10, note: 'Lunch', date: addDays(-4), paid: false, paidDate: null },
      { id: uid('d'), name: 'Sara', amount: 2, note: 'Coffee', date: addDays(-2), paid: false, paidDate: null },
    ],
    debtsOwedToMe: [
      { id: uid('o'), name: 'Omar', amount: 15, note: 'For project', date: addDays(-5), paid: false, paidDate: null },
      { id: uid('o'), name: 'Lina', amount: 3, note: 'Movie ticket', date: addDays(-1), paid: false, paidDate: null },
    ],
    wishlist: [
      { id: uid('w'), name: 'New Game', price: 20, note: 'PS5 game', purchased: false, purchasedDate: null },
      { id: uid('w'), name: 'Headphones', price: 35, note: 'Wireless', purchased: false, purchasedDate: null },
      { id: uid('w'), name: 'Book', price: 8, note: 'Novel', purchased: false, purchasedDate: null },
    ],
    settings: {
      name: 'You',
      currency: 'JOD',
      startingBalance: 52,
      showDecimals: false,
      appearance: 'system',
    },
  };
}

// ---------- small UI atoms ----------
function Card({ children, style, className = '', t, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-3xl ${className}`}
      style={{ background: t.cardBg, border: `1px solid ${t.border}`, boxShadow: `0 6px 20px ${t.shadow}`, ...style }}
    >
      {children}
    </div>
  );
}

function ListCard({ items, renderItem, t }) {
  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: t.cardBg, border: `1px solid ${t.border}`, boxShadow: `0 6px 20px ${t.shadow}` }}>
      {items.map((item, idx) => (
        <div key={item.id} style={{ borderBottom: idx < items.length - 1 ? `1px solid ${t.divider}` : 'none' }}>
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}

function EmptyState({ t, text }) {
  return (
    <Card t={t} className="p-6 text-center">
      <p className="text-sm" style={{ color: t.textSecondary }}>{text}</p>
    </Card>
  );
}

function SectionLabel({ children, t }) {
  return (
    <div className="font-bold mb-2" style={{ color: t.textFaint, fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
      {children}
    </div>
  );
}

function ToggleSwitch({ checked, onChange, t }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="rounded-full relative transition-colors duration-200"
      style={{ width: '44px', height: '24px', background: checked ? t.gold : t.border }}
    >
      <span
        className="absolute rounded-full transition-transform duration-200"
        style={{ top: '2px', left: '2px', width: '20px', height: '20px', background: '#fff', transform: checked ? 'translateX(20px)' : 'translateX(0)' }}
      />
    </button>
  );
}

function Segmented({ options, value, onChange, t }) {
  return (
    <div className="flex p-1 rounded-2xl mb-4" style={{ background: t.cardBg2 }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="flex-1 py-2 rounded-xl text-sm font-semibold transition-colors duration-200"
          style={{ background: value === opt.value ? t.navy : 'transparent', color: value === opt.value ? t.onNavy : t.textSecondary }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function LabeledInput({ label, t, ...props }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-semibold mb-1.5" style={{ color: t.textSecondary }}>{label}</label>
      <input
        {...props}
        className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
        style={{ background: t.cardBg2, border: `1px solid ${t.border}`, color: t.textPrimary }}
      />
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick, t, color }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-2xl" style={{ background: t.cardBg, border: `1px solid ${t.border}` }}>
      <Icon size={18} style={{ color }} />
      <span className="font-semibold text-center leading-tight" style={{ color: t.textPrimary, fontSize: '10px' }}>{label}</span>
    </button>
  );
}

// ---------- overlays ----------
function BottomSheet({ open, onClose, title, children, t }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-end justify-center" style={{ zIndex: 50 }}>
      <div onClick={onClose} className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.45)', animation: 'fadeIn .2s ease' }} />
      <div className="relative w-full max-w-md rounded-t-3xl p-5" style={{ background: t.cardBg, animation: 'slideUp .25s ease', maxHeight: '85vh', overflowY: 'auto', paddingBottom: '32px' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ fontFamily: DISPLAY_FONT, color: t.textPrimary }}>{title}</h3>
          <button onClick={onClose} style={{ color: t.textSecondary }}><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ConfirmDialog({ state, onCancel, onConfirm, t }) {
  if (!state) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center px-6" style={{ zIndex: 60 }}>
      <div onClick={onCancel} className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} />
      <div className="relative w-full max-w-xs rounded-3xl p-5" style={{ background: t.cardBg, animation: 'popIn .18s ease' }}>
        <h4 className="font-bold text-base mb-1.5" style={{ color: t.textPrimary, fontFamily: DISPLAY_FONT }}>{state.title}</h4>
        <p className="text-sm mb-5" style={{ color: t.textSecondary }}>{state.message}</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: t.cardBg2, color: t.textPrimary }}>Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: t.navy, color: t.onNavy }}>{state.confirmLabel || 'Confirm'}</button>
        </div>
      </div>
    </div>
  );
}

function Drawer({ open, onClose, t, settings, onNav }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex" style={{ zIndex: 50 }}>
      <div onClick={onClose} className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.45)' }} />
      <div className="relative h-full p-5" style={{ width: '272px', background: t.cardBg, animation: 'slideRight .22s ease' }}>
        <div className="flex items-center gap-3 mb-6 mt-2">
          <div className="rounded-full flex items-center justify-center font-bold shrink-0" style={{ width: '48px', height: '48px', background: t.navy, color: t.onNavy, fontFamily: DISPLAY_FONT }}>
            {initials(settings.name)}
          </div>
          <div className="min-w-0">
            <div className="font-semibold truncate" style={{ color: t.textPrimary }}>{settings.name || 'You'}</div>
            <div className="text-xs" style={{ color: t.textSecondary }}>Welcome back</div>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.key} onClick={() => { onNav(item.key); onClose(); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left">
                <Icon size={18} style={{ color: t.textSecondary }} />
                <span className="text-sm font-medium" style={{ color: t.textPrimary }}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------- header / nav ----------
function Header({ t, onMenu, onSettings }) {
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);
  useEffect(() => {
    const goOnline = () => setOffline(false);
    const goOffline = () => setOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };
  }, []);
  return (
    <div className="shrink-0 flex items-center justify-between px-4 pt-5 pb-3">
      <button onClick={onMenu} style={{ color: t.textPrimary }}><Menu size={22} /></button>
      <div className="flex items-center gap-1.5">
        <Wallet size={19} style={{ color: t.gold }} />
        <span className="text-xl font-bold" style={{ fontFamily: DISPLAY_FONT, color: t.textPrimary, letterSpacing: '-0.01em' }}>2Pay</span>
        {offline && (
          <span className="font-semibold" style={{ fontSize: '10px', color: t.textFaint, background: t.cardBg2, border: `1px solid ${t.border}`, borderRadius: '999px', padding: '2px 7px', marginLeft: '4px' }}>
            Offline
          </span>
        )}
      </div>
      <button onClick={onSettings} style={{ color: t.textPrimary }}><SettingsIcon size={22} /></button>
    </div>
  );
}

function BottomNav({ active, onChange, t }) {
  return (
    <div className="shrink-0 flex items-stretch px-2 pt-2" style={{ background: t.cardBg, borderTop: `1px solid ${t.border}`, paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.key;
        return (
          <button key={item.key} onClick={() => onChange(item.key)} className="flex-1 flex flex-col items-center gap-1 py-1.5">
            <Icon size={20} style={{ color: isActive ? t.navy : t.textFaint }} strokeWidth={isActive ? 2.5 : 2} />
            <span className="font-semibold" style={{ color: isActive ? t.navy : t.textFaint, fontSize: '10px' }}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function LoadingScreen({ t }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3">
      <Loader2 size={26} className="animate-spin" style={{ color: t.gold }} />
      <span className="text-sm font-medium" style={{ color: t.textSecondary }}>Loading 2Pay…</span>
    </div>
  );
}

// ---------- transaction row ----------
function txMeta(type, t) {
  switch (type) {
    case 'add': return { Icon: ArrowUpRight, color: t.green, bg: t.greenBg };
    case 'owed_paid': return { Icon: ArrowUpRight, color: t.green, bg: t.greenBg };
    case 'spend': return { Icon: ArrowDownRight, color: t.rust, bg: t.rustBg };
    case 'debt_paid': return { Icon: ArrowDownRight, color: t.rust, bg: t.rustBg };
    case 'wishlist_bought': return { Icon: ShoppingBag, color: t.rust, bg: t.rustBg };
    default: return { Icon: ArrowUpRight, color: t.textSecondary, bg: t.cardBg2 };
  }
}
function TransactionRow({ tx, t, settings }) {
  const { Icon, color, bg } = txMeta(tx.type, t);
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="rounded-full flex items-center justify-center shrink-0" style={{ width: '36px', height: '36px', background: bg }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate" style={{ color: t.textPrimary }}>{tx.description}</div>
        <div className="text-xs truncate" style={{ color: t.textSecondary }}>{tx.note ? `${tx.note} · ` : ''}{formatRelativeDate(tx.date)}</div>
      </div>
      <div className="text-sm font-bold shrink-0" style={{ fontFamily: DISPLAY_FONT, color: tx.amount < 0 ? t.rust : t.green }}>
        {formatAmount(tx.amount, settings, true)}
      </div>
    </div>
  );
}

// ---------- screens ----------
function HomeScreen({ data, t, setActiveTab, openModal }) {
  const totalIOwe = data.debtsIOwe.filter((d) => !d.paid).reduce((s, d) => s + d.amount, 0);
  const totalOwed = data.debtsOwedToMe.filter((d) => !d.paid).reduce((s, d) => s + d.amount, 0);
  const wishlistCount = data.wishlist.filter((w) => !w.purchased).length;
  const recent = data.transactions.slice(0, 4);
  const fmt = (n) => formatAmount(n, data.settings);

  return (
    <div className="pb-2">
      <Card t={t} className="p-6 mb-4 relative" style={{ border: `1.5px dashed ${t.gold}66` }}>
        <div className="text-center">
          <div className="font-bold" style={{ color: t.textSecondary, fontSize: '11px', letterSpacing: '0.16em' }}>BALANCE</div>
          <div className="mt-1 mb-4 font-bold" style={{ fontFamily: DISPLAY_FONT, fontSize: '2.75rem', color: data.balance < 0 ? t.rust : t.textPrimary, letterSpacing: '-0.02em' }}>
            {formatAmount(data.balance, data.settings, 'negative')}
          </div>
          {data.balance < 0 && (
            <div className="font-semibold mb-1" style={{ color: t.rust, fontSize: '12px' }}>You're in the red</div>
          )}
          <button onClick={() => openModal('addMoney')} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-sm font-semibold" style={{ background: t.navy, color: t.onNavy }}>
            <Plus size={16} /> Add Money
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <Card t={t} className="p-4" onClick={() => setActiveTab('debts')}>
          <div className="font-bold" style={{ color: t.textSecondary, fontSize: '11px', letterSpacing: '0.06em' }}>I OWE</div>
          <div className="text-xl font-bold mt-1" style={{ fontFamily: DISPLAY_FONT, color: t.rust }}>{fmt(totalIOwe)}</div>
          <div className="flex items-center gap-0.5 text-xs mt-1.5 font-medium" style={{ color: t.textFaint }}>View <ChevronRight size={12} /></div>
        </Card>
        <Card t={t} className="p-4" onClick={() => setActiveTab('debts')}>
          <div className="font-bold" style={{ color: t.textSecondary, fontSize: '11px', letterSpacing: '0.06em' }}>OWED TO ME</div>
          <div className="text-xl font-bold mt-1" style={{ fontFamily: DISPLAY_FONT, color: t.green }}>{fmt(totalOwed)}</div>
          <div className="flex items-center gap-0.5 text-xs mt-1.5 font-medium" style={{ color: t.textFaint }}>View <ChevronRight size={12} /></div>
        </Card>
      </div>

      <Card t={t} className="p-4 mb-4 flex items-center justify-between" onClick={() => setActiveTab('wishlist')}>
        <div className="flex items-center gap-3">
          <div className="rounded-full flex items-center justify-center" style={{ width: '36px', height: '36px', background: t.goldBg }}>
            <ShoppingCart size={16} style={{ color: t.gold }} />
          </div>
          <div>
            <div className="font-bold" style={{ color: t.textSecondary, fontSize: '11px', letterSpacing: '0.06em' }}>WISHLIST</div>
            <div className="text-sm font-semibold" style={{ color: t.textPrimary }}>{wishlistCount} item{wishlistCount !== 1 ? 's' : ''}</div>
          </div>
        </div>
        <div className="flex items-center gap-0.5 text-xs font-medium" style={{ color: t.textFaint }}>View <ChevronRight size={12} /></div>
      </Card>

      <div className="grid grid-cols-4 gap-2 mb-5">
        <QuickAction icon={Plus} label="Add Money" onClick={() => openModal('addMoney')} t={t} color={t.green} />
        <QuickAction icon={Minus} label="Add Spending" onClick={() => openModal('addSpending')} t={t} color={t.rust} />
        <QuickAction icon={Users} label="Add Debt" onClick={() => openModal('addDebtIOwe')} t={t} color={t.navy} />
        <QuickAction icon={User} label="Owed to Me" onClick={() => openModal('addOwed')} t={t} color={t.navy} />
      </div>

      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold" style={{ color: t.textPrimary, letterSpacing: '0.04em' }}>RECENT TRANSACTIONS</h3>
        <button onClick={() => setActiveTab('transactions')} className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: t.gold }}>
          View all <ChevronRight size={12} />
        </button>
      </div>
      {recent.length === 0 ? (
        <EmptyState t={t} text="No transactions yet. Add money or log spending to get started." />
      ) : (
        <ListCard t={t} items={recent} renderItem={(tx) => <TransactionRow tx={tx} t={t} settings={data.settings} />} />
      )}
    </div>
  );
}

function TransactionsScreen({ data, t }) {
  return (
    <div className="pb-4">
      <h2 className="text-lg font-bold mb-3" style={{ fontFamily: DISPLAY_FONT, color: t.textPrimary }}>Transactions</h2>
      {data.transactions.length === 0 ? (
        <EmptyState t={t} text="Nothing here yet. Every add, spend, and payment will show up in this list." />
      ) : (
        <ListCard t={t} items={data.transactions} renderItem={(tx) => <TransactionRow tx={tx} t={t} settings={data.settings} />} />
      )}
    </div>
  );
}

function DebtsScreen({ data, t, onPay, openModal, confirm }) {
  const [tab, setTab] = useState('iOwe');
  const [showHistory, setShowHistory] = useState(false);
  const list = tab === 'iOwe' ? data.debtsIOwe : data.debtsOwedToMe;
  const unpaid = list.filter((d) => !d.paid);
  const paidList = list.filter((d) => d.paid);
  const color = tab === 'iOwe' ? t.rust : t.green;

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold" style={{ fontFamily: DISPLAY_FONT, color: t.textPrimary }}>Debts</h2>
        <button onClick={() => openModal(tab === 'iOwe' ? 'addDebtIOwe' : 'addOwed')} className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: t.navy, color: t.onNavy }}>
          <Plus size={14} /> Add
        </button>
      </div>
      <Segmented t={t} value={tab} onChange={(v) => { setTab(v); setShowHistory(false); }} options={[{ value: 'iOwe', label: 'I Owe' }, { value: 'owed', label: 'Owed to Me' }]} />

      {unpaid.length === 0 ? (
        <EmptyState t={t} text={tab === 'iOwe' ? "You don't owe anyone right now." : 'No one owes you right now.'} />
      ) : (
        <ListCard
          t={t}
          items={unpaid}
          renderItem={(d) => (
            <div className="flex items-center justify-between px-4 py-3.5 gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate" style={{ color: t.textPrimary }}>{d.name}</div>
                <div className="text-xs truncate" style={{ color: t.textSecondary }}>{d.note ? `${d.note} · ` : ''}{formatRelativeDate(d.date)}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-sm font-bold" style={{ fontFamily: DISPLAY_FONT, color }}>{formatAmount(d.amount, data.settings)}</div>
                <button
                  onClick={() => confirm({
                    title: tab === 'iOwe' ? 'Mark as paid?' : 'Mark as received?',
                    message: tab === 'iOwe'
                      ? `This will subtract ${formatAmount(d.amount, data.settings)} from your balance.`
                      : `This will add ${formatAmount(d.amount, data.settings)} to your balance.`,
                    confirmLabel: 'Yes',
                    onConfirm: () => onPay(tab, d.id),
                  })}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold"
                  style={{ background: t.cardBg2, color: t.navy, border: `1px solid ${t.border}` }}
                >
                  Paid
                </button>
              </div>
            </div>
          )}
        />
      )}

      {paidList.length > 0 && (
        <div className="mt-4">
          <button onClick={() => setShowHistory((s) => !s)} className="flex items-center gap-1 text-xs font-semibold mb-2" style={{ color: t.textSecondary }}>
            <ChevronDown size={14} style={{ transform: showHistory ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
            Paid history ({paidList.length})
          </button>
          {showHistory && (
            <ListCard
              t={t}
              items={paidList}
              renderItem={(d) => (
                <div className="flex items-center justify-between px-4 py-3 gap-3" style={{ opacity: 0.6 }}>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ color: t.textPrimary }}>{d.name}</div>
                    <div className="text-xs truncate" style={{ color: t.textSecondary }}>Paid {formatRelativeDate(d.paidDate)}</div>
                  </div>
                  <div className="text-sm font-bold shrink-0" style={{ fontFamily: DISPLAY_FONT, color: t.textFaint }}>{formatAmount(d.amount, data.settings)}</div>
                </div>
              )}
            />
          )}
        </div>
      )}
    </div>
  );
}

function WishlistScreen({ data, t, onBuy, openModal, confirm }) {
  const [showHistory, setShowHistory] = useState(false);
  const active = data.wishlist.filter((w) => !w.purchased);
  const purchased = data.wishlist.filter((w) => w.purchased);

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold" style={{ fontFamily: DISPLAY_FONT, color: t.textPrimary }}>Wishlist</h2>
        <button onClick={() => openModal('addWishlist')} className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: t.gold, color: t.navyDeep }}>
          <Plus size={14} /> Add
        </button>
      </div>

      {active.length === 0 ? (
        <EmptyState t={t} text="Your wishlist is empty. Add something you're saving up for." />
      ) : (
        <div className="flex flex-col gap-3">
          {active.map((item) => {
            const short = item.price - data.balance;
            const canAfford = short <= 0;
            return (
              <Card key={item.id} t={t} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold" style={{ color: t.textPrimary }}>{item.name}</div>
                    {item.note && <div className="text-xs mt-0.5" style={{ color: t.textSecondary }}>{item.note}</div>}
                  </div>
                  <div className="text-base font-bold shrink-0" style={{ fontFamily: DISPLAY_FONT, color: t.textPrimary }}>{formatAmount(item.price, data.settings)}</div>
                </div>
                <div className="flex items-center justify-between mt-3 gap-2">
                  <span className="font-semibold px-2.5 py-1 rounded-full" style={{ background: canAfford ? t.greenBg : t.rustBg, color: canAfford ? t.green : t.rust, fontSize: '11px' }}>
                    {canAfford ? 'You can afford this' : `${formatAmount(short, data.settings)} more needed`}
                  </span>
                  <button
                    onClick={() => confirm({
                      title: 'Mark as bought?',
                      message: `This will subtract ${formatAmount(item.price, data.settings)} from your balance.`,
                      confirmLabel: 'Bought it',
                      onConfirm: () => onBuy(item.id),
                    })}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold shrink-0"
                    style={{ background: t.navy, color: t.onNavy }}
                  >
                    Bought
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {purchased.length > 0 && (
        <div className="mt-4">
          <button onClick={() => setShowHistory((s) => !s)} className="flex items-center gap-1 text-xs font-semibold mb-2" style={{ color: t.textSecondary }}>
            <ChevronDown size={14} style={{ transform: showHistory ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
            Purchased ({purchased.length})
          </button>
          {showHistory && (
            <ListCard
              t={t}
              items={purchased}
              renderItem={(item) => (
                <div className="flex items-center justify-between px-4 py-3 gap-3" style={{ opacity: 0.6 }}>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ color: t.textPrimary }}>{item.name}</div>
                    <div className="text-xs truncate" style={{ color: t.textSecondary }}>Bought {formatRelativeDate(item.purchasedDate)}</div>
                  </div>
                  <div className="text-sm font-bold shrink-0" style={{ fontFamily: DISPLAY_FONT, color: t.textFaint }}>{formatAmount(item.price, data.settings)}</div>
                </div>
              )}
            />
          )}
        </div>
      )}
    </div>
  );
}

function SettingsScreen({ data, t, updateSettings, confirm }) {
  const [startingBalanceInput, setStartingBalanceInput] = useState(String(data.settings.startingBalance));
  useEffect(() => { setStartingBalanceInput(String(data.settings.startingBalance)); }, [data.settings.startingBalance]);

  return (
    <div className="pb-4 flex flex-col gap-4">
      <h2 className="text-lg font-bold" style={{ fontFamily: DISPLAY_FONT, color: t.textPrimary }}>Settings</h2>

      <div>
        <SectionLabel t={t}>Profile</SectionLabel>
        <Card t={t} className="p-4 flex items-center gap-3">
          <div className="rounded-full flex items-center justify-center font-bold shrink-0" style={{ width: '48px', height: '48px', background: t.navy, color: t.onNavy, fontFamily: DISPLAY_FONT }}>
            {initials(data.settings.name)}
          </div>
          <input
            value={data.settings.name}
            onChange={(e) => updateSettings({ name: e.target.value })}
            placeholder="Your name"
            className="flex-1 bg-transparent outline-none text-sm font-semibold min-w-0"
            style={{ color: t.textPrimary }}
          />
        </Card>
      </div>

      <div>
        <SectionLabel t={t}>Money</SectionLabel>
        <Card t={t} className="p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium" style={{ color: t.textPrimary }}>Default currency</span>
            <select
              value={data.settings.currency}
              onChange={(e) => updateSettings({ currency: e.target.value })}
              className="text-sm font-semibold px-2.5 py-1.5 rounded-lg outline-none"
              style={{ background: t.cardBg2, color: t.textPrimary, border: `1px solid ${t.border}` }}
            >
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: t.textPrimary }}>Show decimals</span>
            <ToggleSwitch t={t} checked={data.settings.showDecimals} onChange={(v) => updateSettings({ showDecimals: v })} />
          </div>
          <div>
            <span className="text-sm font-medium block mb-1.5" style={{ color: t.textPrimary }}>Starting balance</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={startingBalanceInput}
                onChange={(e) => setStartingBalanceInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl text-sm outline-none min-w-0"
                style={{ background: t.cardBg2, border: `1px solid ${t.border}`, color: t.textPrimary }}
              />
              <button
                onClick={() => {
                  const val = parseFloat(startingBalanceInput);
                  if (isNaN(val)) return;
                  confirm({
                    title: 'Save starting balance?',
                    message: `This saves ${val} ${data.settings.currency} as your starting balance reference. It will not change your current balance.`,
                    confirmLabel: 'Save',
                    onConfirm: () => updateSettings({ startingBalance: val }),
                  });
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold shrink-0"
                style={{ background: t.navy, color: t.onNavy }}
              >
                Save
              </button>
            </div>
          </div>
        </Card>
      </div>

      <div>
        <SectionLabel t={t}>Appearance</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          {[{ key: 'light', label: 'Light', icon: Sun }, { key: 'dark', label: 'Dark', icon: Moon }, { key: 'system', label: 'System', icon: Monitor }].map((opt) => {
            const Icon = opt.icon;
            const active = data.settings.appearance === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => updateSettings({ appearance: opt.key })}
                className="flex flex-col items-center gap-1.5 py-3 rounded-2xl"
                style={{ background: active ? t.navy : t.cardBg, border: `1px solid ${active ? t.navy : t.border}` }}
              >
                <Icon size={17} style={{ color: active ? t.onNavy : t.textSecondary }} />
                <span className="text-xs font-semibold" style={{ color: active ? t.onNavy : t.textSecondary }}>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <SectionLabel t={t}>App</SectionLabel>
        <InstallAppCard t={t} />
      </div>

      <p className="text-xs text-center mt-2" style={{ color: t.textFaint }}>2Pay is a manual tracker — it never connects to your bank or cards.</p>
    </div>
  );
}

function InstallAppCard({ t }) {
  const [installable, setInstallable] = useState(!!window.deferredInstallPrompt);
  const [installed, setInstalled] = useState(window.isStandalone ? window.isStandalone() : false);
  useEffect(() => {
    const onInstallable = () => setInstallable(true);
    const onInstalled = () => { setInstalled(true); setInstallable(false); };
    window.addEventListener('pwa-installable', onInstallable);
    window.addEventListener('appinstalled', onInstalled);
    return () => { window.removeEventListener('pwa-installable', onInstallable); window.removeEventListener('appinstalled', onInstalled); };
  }, []);

  if (installed) {
    return (
      <Card t={t} className="p-4 flex items-center gap-3">
        <div className="rounded-full flex items-center justify-center shrink-0" style={{ width: '36px', height: '36px', background: t.greenBg }}>
          <Wallet size={16} style={{ color: t.green }} />
        </div>
        <div className="text-sm font-medium" style={{ color: t.textPrimary }}>2Pay is installed on this device.</div>
      </Card>
    );
  }

  if (window.isIOS && window.isIOS()) {
    return (
      <Card t={t} className="p-4">
        <div className="text-sm font-medium mb-1" style={{ color: t.textPrimary }}>Add 2Pay to your Home Screen</div>
        <p className="text-xs" style={{ color: t.textSecondary }}>
          Tap the Share icon in Safari, then choose "Add to Home Screen". It'll open full-screen and work offline, just like any other app.
        </p>
      </Card>
    );
  }

  return (
    <Card t={t} className="p-4 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="text-sm font-medium" style={{ color: t.textPrimary }}>Install 2Pay</div>
        <p className="text-xs mt-0.5" style={{ color: t.textSecondary }}>
          {installable ? 'Add it to your home screen for one-tap, offline access.' : 'Your browser will offer this after a bit more use, or check its menu for "Install app".'}
        </p>
      </div>
      <button
        onClick={() => window.triggerInstall && window.triggerInstall()}
        disabled={!installable}
        className="px-3.5 py-2 rounded-xl text-xs font-bold shrink-0"
        style={{ background: t.navy, color: t.onNavy, opacity: installable ? 1 : 0.4 }}
      >
        Install
      </button>
    </Card>
  );
}

// ---------- form modals ----------
function MoneyFormModal({ open, onClose, onSubmit, t, mode }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayISO());
  useEffect(() => { if (open) { setAmount(''); setNote(''); setDate(todayISO()); } }, [open]);
  const isAdd = mode === 'add';
  const val = parseFloat(amount);
  const submit = () => {
    if (!val || val <= 0) return;
    onSubmit({ amount: val, note: note.trim(), date });
    onClose();
  };
  return (
    <BottomSheet open={open} onClose={onClose} title={isAdd ? 'Add Money' : 'Add Spending'} t={t}>
      <LabeledInput t={t} label="Amount" type="number" inputMode="decimal" min="0" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
      <LabeledInput t={t} label="Note (optional)" type="text" placeholder={isAdd ? 'e.g. Pocket money' : 'e.g. Groceries'} value={note} onChange={(e) => setNote(e.target.value)} />
      <LabeledInput t={t} label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <button onClick={submit} disabled={!val || val <= 0} className="w-full py-3 rounded-2xl font-semibold text-sm mt-2" style={{ background: isAdd ? t.green : t.rust, color: '#fff', opacity: (!val || val <= 0) ? 0.4 : 1 }}>
        {isAdd ? 'Add Money' : 'Add Spending'}
      </button>
    </BottomSheet>
  );
}

function DebtFormModal({ open, onClose, onSubmit, t, mode }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayISO());
  useEffect(() => { if (open) { setName(''); setAmount(''); setNote(''); setDate(todayISO()); } }, [open]);
  const val = parseFloat(amount);
  const valid = name.trim() && val > 0;
  const submit = () => {
    if (!valid) return;
    onSubmit({ name: name.trim(), amount: val, note: note.trim(), date });
    onClose();
  };
  return (
    <BottomSheet open={open} onClose={onClose} title={mode === 'iOwe' ? 'Add Debt' : 'Owed to Me'} t={t}>
      <LabeledInput t={t} label="Person's name" type="text" placeholder="e.g. Ahmed" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      <LabeledInput t={t} label="Amount" type="number" inputMode="decimal" min="0" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <LabeledInput t={t} label="Note (optional)" type="text" placeholder="What's it for?" value={note} onChange={(e) => setNote(e.target.value)} />
      <LabeledInput t={t} label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <button onClick={submit} disabled={!valid} className="w-full py-3 rounded-2xl font-semibold text-sm mt-2" style={{ background: t.navy, color: t.onNavy, opacity: valid ? 1 : 0.4 }}>
        {mode === 'iOwe' ? 'Add Debt' : 'Add Entry'}
      </button>
    </BottomSheet>
  );
}

function WishlistFormModal({ open, onClose, onSubmit, t }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [note, setNote] = useState('');
  useEffect(() => { if (open) { setName(''); setPrice(''); setNote(''); } }, [open]);
  const val = parseFloat(price);
  const valid = name.trim() && val > 0;
  const submit = () => {
    if (!valid) return;
    onSubmit({ name: name.trim(), price: val, note: note.trim() });
    onClose();
  };
  return (
    <BottomSheet open={open} onClose={onClose} title="Add to Wishlist" t={t}>
      <LabeledInput t={t} label="Item name" type="text" placeholder="e.g. New Game" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      <LabeledInput t={t} label="Price" type="number" inputMode="decimal" min="0" step="0.01" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} />
      <LabeledInput t={t} label="Note (optional)" type="text" placeholder="Any details" value={note} onChange={(e) => setNote(e.target.value)} />
      <button onClick={submit} disabled={!valid} className="w-full py-3 rounded-2xl font-semibold text-sm mt-2" style={{ background: t.gold, color: t.navyDeep, opacity: valid ? 1 : 0.4 }}>
        Add to Wishlist
      </button>
    </BottomSheet>
  );
}

// ---------- app ----------
export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [confirmState, setConfirmState] = useState(null);
  const [systemDark, setSystemDark] = useState(false);
  const saveTimer = useRef(null);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.error('2Pay service worker registration failed:', err);
        });
      });
    }
  }, []);

  // Real, standalone persistence. `window.storage` (used by the Claude-artifact
  // version of this app) only exists inside claude.ai's iframe — it doesn't
  // exist here, so this app previously discarded every change on reload.
  // localStorage is synchronous, works fully offline, and is what an
  // installed PWA should use.
  const STORAGE_KEY = '2pay:app-data';

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setData(raw ? JSON.parse(raw) : seedData());
    } catch (e) {
      console.error('Failed to load saved data, starting fresh:', e);
      setData(seedData());
    } finally {
      setLoading(false);
      hasLoaded.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hasLoaded.current || !data) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.error('Failed to save data:', e);
      }
    }, 250);
    return () => clearTimeout(saveTimer.current);
  }, [data]);

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemDark(mq.matches);
    const handler = (e) => setSystemDark(e.matches);
    if (mq.addEventListener) mq.addEventListener('change', handler); else mq.addListener(handler);
    return () => { if (mq.removeEventListener) mq.removeEventListener('change', handler); else mq.removeListener(handler); };
  }, []);

  const isDark = data ? (data.settings.appearance === 'dark' || (data.settings.appearance === 'system' && systemDark)) : false;
  const t = isDark ? THEMES.dark : THEMES.light;

  const openModal = (type) => setModal(type);
  const closeModal = () => setModal(null);
  const confirm = (cfg) => setConfirmState(cfg);
  const closeConfirm = () => setConfirmState(null);
  const handleConfirmYes = () => { if (confirmState && confirmState.onConfirm) confirmState.onConfirm(); setConfirmState(null); };

  const updateSettings = (patch) => setData((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));

  const handleAddMoney = ({ amount, note, date }) => {
    setData((prev) => ({
      ...prev,
      balance: +(prev.balance + amount).toFixed(2),
      transactions: [{ id: uid('tx'), type: 'add', description: 'Added Money', note, amount, date }, ...prev.transactions],
    }));
  };
  const handleAddSpending = ({ amount, note, date }) => {
    setData((prev) => ({
      ...prev,
      balance: +(prev.balance - amount).toFixed(2),
      transactions: [{ id: uid('tx'), type: 'spend', description: 'Spending', note, amount: -amount, date }, ...prev.transactions],
    }));
  };
  const handleAddDebtIOwe = ({ name, amount, note, date }) => {
    setData((prev) => ({ ...prev, debtsIOwe: [{ id: uid('d'), name, amount, note, date, paid: false, paidDate: null }, ...prev.debtsIOwe] }));
  };
  const handleAddOwed = ({ name, amount, note, date }) => {
    setData((prev) => ({ ...prev, debtsOwedToMe: [{ id: uid('o'), name, amount, note, date, paid: false, paidDate: null }, ...prev.debtsOwedToMe] }));
  };
  const handleAddWishlist = ({ name, price, note }) => {
    setData((prev) => ({ ...prev, wishlist: [{ id: uid('w'), name, price, note, purchased: false, purchasedDate: null }, ...prev.wishlist] }));
  };
  const handlePay = (tab, id) => {
    setData((prev) => {
      if (tab === 'iOwe') {
        const debt = prev.debtsIOwe.find((d) => d.id === id);
        if (!debt || debt.paid) return prev;
        return {
          ...prev,
          balance: +(prev.balance - debt.amount).toFixed(2),
          debtsIOwe: prev.debtsIOwe.map((d) => (d.id === id ? { ...d, paid: true, paidDate: todayISO() } : d)),
          transactions: [{ id: uid('tx'), type: 'debt_paid', description: `Paid ${debt.name}`, note: debt.note, amount: -debt.amount, date: todayISO() }, ...prev.transactions],
        };
      } else {
        const debt = prev.debtsOwedToMe.find((d) => d.id === id);
        if (!debt || debt.paid) return prev;
        return {
          ...prev,
          balance: +(prev.balance + debt.amount).toFixed(2),
          debtsOwedToMe: prev.debtsOwedToMe.map((d) => (d.id === id ? { ...d, paid: true, paidDate: todayISO() } : d)),
          transactions: [{ id: uid('tx'), type: 'owed_paid', description: `${debt.name} Paid You`, note: debt.note, amount: debt.amount, date: todayISO() }, ...prev.transactions],
        };
      }
    });
  };
  const handleBuyWishlist = (id) => {
    setData((prev) => {
      const item = prev.wishlist.find((w) => w.id === id);
      if (!item || item.purchased) return prev;
      return {
        ...prev,
        balance: +(prev.balance - item.price).toFixed(2),
        wishlist: prev.wishlist.map((w) => (w.id === id ? { ...w, purchased: true, purchasedDate: todayISO() } : w)),
        transactions: [{ id: uid('tx'), type: 'wishlist_bought', description: `Bought ${item.name}`, note: item.note, amount: -item.price, date: todayISO() }, ...prev.transactions],
      };
    });
  };

  return (
    <div className="w-full flex justify-center" style={{ background: t.appBg, minHeight: '100vh', fontFamily: BODY_FONT }}>
      <div className="w-full h-screen flex flex-col relative" style={{ maxWidth: '448px', background: t.appBg }}>
        {loading || !data ? (
          <LoadingScreen t={t} />
        ) : (
          <>
            <Header t={t} onMenu={() => setDrawerOpen(true)} onSettings={() => setActiveTab('settings')} />
            <main className="flex-1 overflow-y-auto px-4">
              {activeTab === 'home' && <HomeScreen data={data} t={t} setActiveTab={setActiveTab} openModal={openModal} />}
              {activeTab === 'transactions' && <TransactionsScreen data={data} t={t} />}
              {activeTab === 'debts' && <DebtsScreen data={data} t={t} onPay={handlePay} openModal={openModal} confirm={confirm} />}
              {activeTab === 'wishlist' && <WishlistScreen data={data} t={t} onBuy={handleBuyWishlist} openModal={openModal} confirm={confirm} />}
              {activeTab === 'settings' && <SettingsScreen data={data} t={t} updateSettings={updateSettings} confirm={confirm} />}
            </main>
            <BottomNav active={activeTab} onChange={setActiveTab} t={t} />

            <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} t={t} settings={data.settings} onNav={setActiveTab} />

            <MoneyFormModal open={modal === 'addMoney'} onClose={closeModal} onSubmit={handleAddMoney} t={t} mode="add" />
            <MoneyFormModal open={modal === 'addSpending'} onClose={closeModal} onSubmit={handleAddSpending} t={t} mode="spend" />
            <DebtFormModal open={modal === 'addDebtIOwe'} onClose={closeModal} onSubmit={handleAddDebtIOwe} t={t} mode="iOwe" />
            <DebtFormModal open={modal === 'addOwed'} onClose={closeModal} onSubmit={handleAddOwed} t={t} mode="owed" />
            <WishlistFormModal open={modal === 'addWishlist'} onClose={closeModal} onSubmit={handleAddWishlist} t={t} />

            <ConfirmDialog state={confirmState} onCancel={closeConfirm} onConfirm={handleConfirmYes} t={t} />
          </>
        )}
      </div>
    </div>
  );
}
