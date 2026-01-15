import { motion } from 'framer-motion';
import { Database, Key, GitBranch, AlertTriangle } from 'lucide-react';

interface TruthRepoStatus {
  exists: boolean;
  path: string;
  claims_count: number;
  head_ref: string | null;
  has_keys: boolean;
}

interface RepoStatusProps {
  status: TruthRepoStatus | null;
  loading: boolean;
  error: string | null;
}

export function RepoStatus({ status, loading, error }: RepoStatusProps) {
  if (loading) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-zinc-800 rounded animate-pulse w-32" />
            <div className="h-3 bg-zinc-800 rounded animate-pulse w-48" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <div>
            <p className="text-red-400 font-medium">Error loading repository</p>
            <p className="text-red-400/70 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  if (!status.exists) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          <div>
            <p className="text-yellow-400 font-medium">No truth repository found</p>
            <p className="text-yellow-400/70 text-sm">
              Run <code className="bg-zinc-800 px-1 rounded">truthgit init</code> to create one
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Database className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-zinc-100 font-medium">Truth Repository</h3>
            <p className="text-zinc-500 text-sm font-mono">{status.path}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-zinc-100">{status.claims_count}</div>
            <div className="text-xs text-zinc-500">Claims</div>
          </div>

          <div className="flex items-center gap-2">
            {status.head_ref && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-800 rounded-md">
                <GitBranch className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-xs text-zinc-300 font-mono">
                  {status.head_ref.replace('ref: ', '').split('/').pop()}
                </span>
              </div>
            )}

            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${
              status.has_keys
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-zinc-800 text-zinc-400'
            }`}>
              <Key className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">
                {status.has_keys ? 'Keys' : 'No Keys'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
