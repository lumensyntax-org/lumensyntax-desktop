import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Search, RefreshCw, FileText } from 'lucide-react';
import { ClaimCard } from './ClaimCard';

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

interface ClaimsListProps {
  claims: Claim[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onClaimClick?: (claim: Claim) => void;
}

type FilterState = 'all' | 'verified' | 'draft' | 'contested';
type SortBy = 'date' | 'confidence' | 'domain';

export function ClaimsList({ claims, loading, error, onRefresh, onClaimClick }: ClaimsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState<FilterState>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');

  const filteredClaims = claims
    .filter((claim) => {
      if (filterState !== 'all' && claim.state !== filterState) {
        return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          claim.content.toLowerCase().includes(query) ||
          claim.domain.toLowerCase().includes(query) ||
          claim.$hash.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'confidence':
          return b.confidence - a.confidence;
        case 'domain':
          return a.domain.localeCompare(b.domain);
        case 'date':
        default:
          const aDate = a.metadata?.created_at || '';
          const bDate = b.metadata?.created_at || '';
          return bDate.localeCompare(aDate);
      }
    });

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search claims by content, domain, or hash..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
          />
        </div>

        <select
          value={filterState}
          onChange={(e) => setFilterState(e.target.value as FilterState)}
          className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 focus:outline-none focus:border-zinc-700"
        >
          <option value="all">All States</option>
          <option value="verified">Verified</option>
          <option value="draft">Draft</option>
          <option value="contested">Contested</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 focus:outline-none focus:border-zinc-700"
        >
          <option value="date">Sort by Date</option>
          <option value="confidence">Sort by Confidence</option>
          <option value="domain">Sort by Domain</option>
        </select>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-300 hover:border-zinc-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 animate-pulse"
            >
              <div className="h-5 bg-zinc-800 rounded w-3/4 mb-3" />
              <div className="h-4 bg-zinc-800 rounded w-1/2 mb-4" />
              <div className="flex gap-2">
                <div className="h-6 bg-zinc-800 rounded w-20" />
                <div className="h-6 bg-zinc-800 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredClaims.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400 mb-2">
            {claims.length === 0
              ? 'No claims in repository'
              : 'No claims match your filters'}
          </p>
          {claims.length === 0 && (
            <p className="text-zinc-500 text-sm">
              Use <code className="bg-zinc-800 px-1 rounded">truthgit verify</code> to add claims
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredClaims.map((claim) => (
              <ClaimCard
                key={claim.$hash}
                claim={claim}
                onClick={() => onClaimClick?.(claim)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {filteredClaims.length > 0 && (
        <div className="text-center text-zinc-500 text-sm pt-2">
          Showing {filteredClaims.length} of {claims.length} claims
        </div>
      )}
    </div>
  );
}
