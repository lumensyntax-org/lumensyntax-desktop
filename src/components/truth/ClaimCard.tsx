import { motion } from 'framer-motion';
import { FileCheck, Hash, Clock, Tag, Globe, AlertCircle } from 'lucide-react';

interface ClaimMetadata {
  language?: string;
  tags?: string[];
  created_at?: string;
  created_by?: string;
}

interface Claim {
  content: string;
  confidence: number;
  category: string;
  domain: string;
  state: string;
  $hash: string;
  $type: string;
  metadata: ClaimMetadata;
}

interface ClaimCardProps {
  claim: Claim;
  onClick?: () => void;
}

export function ClaimCard({ claim, onClick }: ClaimCardProps) {
  const getStateColor = (state: string) => {
    switch (state) {
      case 'verified':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'draft':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'contested':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'factual':
        return <FileCheck className="w-4 h-4" />;
      case 'empirical':
        return <Globe className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Unknown';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const truncateHash = (hash: string) => {
    if (hash.length <= 16) return hash;
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 cursor-pointer hover:border-zinc-700 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-zinc-100 font-medium leading-relaxed">
            {claim.content}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getStateColor(claim.state)}`}>
              {claim.state}
            </span>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-zinc-800 text-zinc-400">
              {getCategoryIcon(claim.category)}
              {claim.category}
            </span>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-zinc-800 text-zinc-400">
              <Globe className="w-3 h-3" />
              {claim.domain}
            </span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-2xl font-bold text-zinc-100">
            {Math.round(claim.confidence * 100)}%
          </div>
          <div className="text-xs text-zinc-500">confidence</div>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-zinc-800 text-xs text-zinc-500">
        <div className="flex items-center gap-1">
          <Hash className="w-3 h-3" />
          <span className="font-mono">{truncateHash(claim.$hash)}</span>
        </div>

        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{formatDate(claim.metadata?.created_at)}</span>
        </div>

        {claim.metadata?.tags && claim.metadata.tags.length > 0 && (
          <div className="flex items-center gap-1">
            <Tag className="w-3 h-3" />
            <span>{claim.metadata.tags.join(', ')}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
