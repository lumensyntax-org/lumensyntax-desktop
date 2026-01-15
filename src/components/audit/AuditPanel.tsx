import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  Shield,
  Search,
} from 'lucide-react';

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  claim: string;
  domain: string;
  risk_profile: string;
  result_status: string;
  result_action: string;
  confidence: number;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  proceed: <CheckCircle className="w-4 h-4 text-green-400" />,
  abort: <XCircle className="w-4 h-4 text-red-400" />,
  escalate: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
  revise: <ArrowUpRight className="w-4 h-4 text-blue-400" />,
};

const ACTION_COLORS: Record<string, string> = {
  proceed: 'border-green-500/30 bg-green-500/10',
  abort: 'border-red-500/30 bg-red-500/10',
  escalate: 'border-yellow-500/30 bg-yellow-500/10',
  revise: 'border-blue-500/30 bg-blue-500/10',
};

const RISK_COLORS: Record<string, { bg: string; text: string }> = {
  low: { bg: 'bg-green-500/20', text: 'text-green-400' },
  medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  high: { bg: 'bg-red-500/20', text: 'text-red-400' },
};

export function AuditPanel() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');

  const loadAuditTrail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<AuditEntry[]>('get_audit_trail');
      setEntries(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAuditTrail();
  }, [loadAuditTrail]);

  const filteredEntries = entries.filter((entry) => {
    if (filterAction !== 'all' && entry.result_action !== filterAction) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        entry.claim.toLowerCase().includes(query) ||
        entry.domain.toLowerCase().includes(query) ||
        entry.id.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const stats = {
    total: entries.length,
    proceed: entries.filter((e) => e.result_action === 'proceed').length,
    abort: entries.filter((e) => e.result_action === 'abort').length,
    escalate: entries.filter((e) => e.result_action === 'escalate').length,
    revise: entries.filter((e) => e.result_action === 'revise').length,
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch {
      return '';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
            <History className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-zinc-100">Audit Trail</h1>
            <p className="text-sm text-zinc-500">Governance decision history</p>
          </div>
        </div>

        <button
          onClick={loadAuditTrail}
          disabled={loading}
          className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-300 hover:border-zinc-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-5 gap-3">
        <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
          <div className="text-2xl font-bold text-zinc-100">{stats.total}</div>
          <div className="text-xs text-zinc-500">Total</div>
        </div>
        <button
          onClick={() => setFilterAction(filterAction === 'proceed' ? 'all' : 'proceed')}
          className={`p-3 rounded-lg border transition-colors ${
            filterAction === 'proceed'
              ? 'border-green-500/30 bg-green-500/10'
              : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
          }`}
        >
          <div className="text-2xl font-bold text-green-400">{stats.proceed}</div>
          <div className="text-xs text-zinc-500">Proceed</div>
        </button>
        <button
          onClick={() => setFilterAction(filterAction === 'abort' ? 'all' : 'abort')}
          className={`p-3 rounded-lg border transition-colors ${
            filterAction === 'abort'
              ? 'border-red-500/30 bg-red-500/10'
              : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
          }`}
        >
          <div className="text-2xl font-bold text-red-400">{stats.abort}</div>
          <div className="text-xs text-zinc-500">Abort</div>
        </button>
        <button
          onClick={() => setFilterAction(filterAction === 'escalate' ? 'all' : 'escalate')}
          className={`p-3 rounded-lg border transition-colors ${
            filterAction === 'escalate'
              ? 'border-yellow-500/30 bg-yellow-500/10'
              : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
          }`}
        >
          <div className="text-2xl font-bold text-yellow-400">{stats.escalate}</div>
          <div className="text-xs text-zinc-500">Escalate</div>
        </button>
        <button
          onClick={() => setFilterAction(filterAction === 'revise' ? 'all' : 'revise')}
          className={`p-3 rounded-lg border transition-colors ${
            filterAction === 'revise'
              ? 'border-blue-500/30 bg-blue-500/10'
              : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
          }`}
        >
          <div className="text-2xl font-bold text-blue-400">{stats.revise}</div>
          <div className="text-xs text-zinc-500">Revise</div>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search audit entries by claim, domain, or ID..."
          className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
        />
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 animate-pulse"
            >
              <div className="h-4 bg-zinc-800 rounded w-3/4 mb-3" />
              <div className="h-3 bg-zinc-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={loadAuditTrail}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="text-center py-12">
          <History className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400 mb-2">
            {entries.length === 0
              ? 'No audit entries yet'
              : 'No entries match your filters'}
          </p>
          <p className="text-zinc-500 text-sm">
            Governance decisions will appear here automatically
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-zinc-800" />

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative pl-12"
                >
                  {/* Timeline node */}
                  <div
                    className={`absolute left-0 w-10 h-10 rounded-full border-2 flex items-center justify-center bg-zinc-950 ${
                      ACTION_COLORS[entry.result_action] || 'border-zinc-800'
                    }`}
                  >
                    {ACTION_ICONS[entry.result_action] || <Shield className="w-4 h-4 text-zinc-400" />}
                  </div>

                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-zinc-100 font-medium line-clamp-2">
                          {entry.claim}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            entry.result_action === 'proceed'
                              ? 'bg-green-500/20 text-green-400'
                              : entry.result_action === 'abort'
                              ? 'bg-red-500/20 text-red-400'
                              : entry.result_action === 'escalate'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {entry.result_action.toUpperCase()}
                          </span>

                          <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                            {entry.domain}
                          </span>

                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            RISK_COLORS[entry.risk_profile]?.bg || 'bg-zinc-800'
                          } ${RISK_COLORS[entry.risk_profile]?.text || 'text-zinc-400'}`}>
                            {entry.risk_profile} risk
                          </span>

                          <span className="text-xs text-zinc-500">
                            {Math.round(entry.confidence * 100)}% confidence
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 text-xs text-zinc-500">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(entry.timestamp)}
                        </div>
                        <div className="text-xs text-zinc-600 mt-1">
                          {formatDate(entry.timestamp)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                      <span className="text-zinc-500 font-mono">
                        {entry.id}
                      </span>
                      <span className={`${
                        entry.result_status === 'PASSED'
                          ? 'text-green-400'
                          : entry.result_status === 'MYSTERY'
                          ? 'text-purple-400'
                          : entry.result_status === 'GAP'
                          ? 'text-yellow-400'
                          : 'text-red-400'
                      }`}>
                        {entry.result_status}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {filteredEntries.length > 0 && (
        <div className="text-center text-zinc-500 text-sm">
          Showing {filteredEntries.length} of {entries.length} entries
        </div>
      )}
    </div>
  );
}
