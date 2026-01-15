import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, X, Copy, Check } from 'lucide-react';
import { RepoStatus } from './RepoStatus';
import { ClaimsList } from './ClaimsList';

interface TruthRepoStatus {
  exists: boolean;
  path: string;
  claims_count: number;
  head_ref: string | null;
  has_keys: boolean;
}

interface Claim {
  content: string;
  confidence: number;
  category: string;
  domain: string;
  state: string;
  $hash: string;
  $type: string;
  metadata: {
    language?: string;
    tags?: string[];
    created_at?: string;
    created_by?: string;
  };
}

export function TruthPanel() {
  const [status, setStatus] = useState<TruthRepoStatus | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [statusLoading, setStatusLoading] = useState(true);
  const [claimsLoading, setClaimsLoading] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [claimsError, setClaimsError] = useState<string | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [copied, setCopied] = useState(false);

  const loadStatus = useCallback(async () => {
    setStatusLoading(true);
    setStatusError(null);
    try {
      const result = await invoke<TruthRepoStatus>('get_truth_status');
      setStatus(result);
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : String(err));
    } finally {
      setStatusLoading(false);
    }
  }, []);

  const loadClaims = useCallback(async () => {
    setClaimsLoading(true);
    setClaimsError(null);
    try {
      const result = await invoke<Claim[]>('list_claims');
      setClaims(result);
    } catch (err) {
      setClaimsError(err instanceof Error ? err.message : String(err));
    } finally {
      setClaimsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
    loadClaims();
  }, [loadStatus, loadClaims]);

  const handleRefresh = () => {
    loadStatus();
    loadClaims();
  };

  const handleCopyHash = async (hash: string) => {
    await navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
            <Database className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-zinc-100">Truth Repository</h1>
            <p className="text-sm text-zinc-500">Local .truth/ claims and proofs</p>
          </div>
        </div>
      </div>

      <RepoStatus status={status} loading={statusLoading} error={statusError} />

      <ClaimsList
        claims={claims}
        loading={claimsLoading}
        error={claimsError}
        onRefresh={handleRefresh}
        onClaimClick={setSelectedClaim}
      />

      <AnimatePresence>
        {selectedClaim && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedClaim(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-semibold text-zinc-100">Claim Details</h2>
                <button
                  onClick={() => setSelectedClaim(null)}
                  className="p-1 text-zinc-400 hover:text-zinc-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-wide">Content</label>
                  <p className="text-zinc-100 mt-1">{selectedClaim.content}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-wide">Confidence</label>
                    <p className="text-zinc-100 mt-1 text-2xl font-bold">
                      {Math.round(selectedClaim.confidence * 100)}%
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-wide">State</label>
                    <p className="mt-1">
                      <span className={`inline-flex px-2 py-1 rounded-full text-sm ${
                        selectedClaim.state === 'verified'
                          ? 'bg-green-500/20 text-green-400'
                          : selectedClaim.state === 'draft'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {selectedClaim.state}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-wide">Domain</label>
                    <p className="text-zinc-100 mt-1">{selectedClaim.domain}</p>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-wide">Category</label>
                    <p className="text-zinc-100 mt-1">{selectedClaim.category}</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-wide">Hash</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-zinc-300 font-mono text-sm bg-zinc-800 px-2 py-1 rounded flex-1 overflow-x-auto">
                      {selectedClaim.$hash}
                    </code>
                    <button
                      onClick={() => handleCopyHash(selectedClaim.$hash)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-300 bg-zinc-800 rounded transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {selectedClaim.metadata && (
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-wide">Metadata</label>
                    <div className="mt-1 bg-zinc-800/50 rounded-lg p-3 text-sm">
                      {selectedClaim.metadata.created_at && (
                        <div className="flex justify-between text-zinc-400">
                          <span>Created</span>
                          <span className="text-zinc-300">
                            {new Date(selectedClaim.metadata.created_at).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {selectedClaim.metadata.language && (
                        <div className="flex justify-between text-zinc-400 mt-1">
                          <span>Language</span>
                          <span className="text-zinc-300">{selectedClaim.metadata.language}</span>
                        </div>
                      )}
                      {selectedClaim.metadata.tags && selectedClaim.metadata.tags.length > 0 && (
                        <div className="flex justify-between text-zinc-400 mt-1">
                          <span>Tags</span>
                          <span className="text-zinc-300">{selectedClaim.metadata.tags.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-zinc-800">
                  <pre className="text-xs text-zinc-500 bg-zinc-800/50 rounded-lg p-3 overflow-x-auto">
                    {JSON.stringify(selectedClaim, null, 2)}
                  </pre>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
