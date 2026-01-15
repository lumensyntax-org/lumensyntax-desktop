import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Search, Link2, Tag, Activity } from 'lucide-react';
import { AgentCard } from './AgentCard';
import { AGENTS, UNIVERSE_COLORS, STATUS_COLORS } from './agentData';
import type { Agent, AgentUniverse, AgentStatus } from './agentData';

type FilterUniverse = AgentUniverse | 'all';
type FilterStatus = AgentStatus | 'all';

export function AgentsPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUniverse, setFilterUniverse] = useState<FilterUniverse>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const filteredAgents = AGENTS.filter((agent) => {
    if (filterUniverse !== 'all' && agent.universe !== filterUniverse) {
      return false;
    }
    if (filterStatus !== 'all' && agent.status !== filterStatus) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        agent.name.toLowerCase().includes(query) ||
        agent.role.toLowerCase().includes(query) ||
        agent.description.toLowerCase().includes(query) ||
        agent.keywords.some((k) => k.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const universeStats = {
    CORE: AGENTS.filter((a) => a.universe === 'CORE').length,
    CLAUDE: AGENTS.filter((a) => a.universe === 'CLAUDE').length,
    GPT: AGENTS.filter((a) => a.universe === 'GPT').length,
    GRAVITY: AGENTS.filter((a) => a.universe === 'GRAVITY').length,
  };

  const statusStats = {
    active: AGENTS.filter((a) => a.status === 'active').length,
    standby: AGENTS.filter((a) => a.status === 'standby').length,
    inactive: AGENTS.filter((a) => a.status === 'inactive').length,
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-zinc-100">Agent Registry</h1>
            <p className="text-sm text-zinc-500">{AGENTS.length} agents across {Object.keys(universeStats).length} universes</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-3">
        {(Object.entries(universeStats) as [AgentUniverse, number][]).map(([universe, count]) => {
          const colors = UNIVERSE_COLORS[universe];
          return (
            <button
              key={universe}
              onClick={() => setFilterUniverse(filterUniverse === universe ? 'all' : universe)}
              className={`p-3 rounded-lg border transition-colors ${
                filterUniverse === universe
                  ? `${colors.bg} ${colors.border}`
                  : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className={`text-2xl font-bold ${colors.text}`}>{count}</div>
              <div className="text-xs text-zinc-500">{universe}</div>
            </button>
          );
        })}
      </div>

      {/* Status Bar */}
      <div className="flex items-center gap-4 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
        <Activity className="w-4 h-4 text-zinc-500" />
        {(Object.entries(statusStats) as [AgentStatus, number][]).map(([status, count]) => {
          const colors = STATUS_COLORS[status];
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)}
              className={`flex items-center gap-2 px-2 py-1 rounded transition-colors ${
                filterStatus === status ? colors.bg : 'hover:bg-zinc-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${colors.bg.replace('/20', '')}`} />
              <span className={`text-sm ${filterStatus === status ? colors.text : 'text-zinc-400'}`}>
                {count} {status}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search agents by name, role, or keywords..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
          />
        </div>

        {(filterUniverse !== 'all' || filterStatus !== 'all') && (
          <button
            onClick={() => {
              setFilterUniverse('all');
              setFilterStatus('all');
            }}
            className="px-3 py-2 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Agent Grid */}
      {filteredAgents.length === 0 ? (
        <div className="text-center py-12">
          <Bot className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400 mb-2">No agents match your filters</p>
          <p className="text-zinc-500 text-sm">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <AnimatePresence mode="popLayout">
            {filteredAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onClick={() => setSelectedAgent(agent)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Agent Detail Modal */}
      <AnimatePresence>
        {selectedAgent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedAgent(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-lg w-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${UNIVERSE_COLORS[selectedAgent.universe].bg}`}>
                    <Bot className={`w-6 h-6 ${UNIVERSE_COLORS[selectedAgent.universe].text}`} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-100">{selectedAgent.name}</h2>
                    <p className="text-sm text-zinc-400">{selectedAgent.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="p-1 text-zinc-400 hover:text-zinc-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${UNIVERSE_COLORS[selectedAgent.universe].bg} ${UNIVERSE_COLORS[selectedAgent.universe].text}`}>
                    {selectedAgent.universe}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${STATUS_COLORS[selectedAgent.status].bg} ${STATUS_COLORS[selectedAgent.status].text}`}>
                    {selectedAgent.status}
                  </span>
                </div>

                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-wide">Description</label>
                  <p className="text-zinc-300 mt-1">{selectedAgent.description}</p>
                </div>

                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-wide">Keywords</label>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedAgent.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-zinc-800 text-zinc-300 rounded"
                      >
                        <Tag className="w-3 h-3" />
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-wide">Connections</label>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedAgent.connections.map((conn) => (
                      <span
                        key={conn}
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-zinc-800 text-zinc-300 rounded"
                      >
                        <Link2 className="w-3 h-3" />
                        {conn}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800">
                  <button
                    disabled
                    className="w-full py-2 bg-zinc-800 text-zinc-500 rounded-lg cursor-not-allowed"
                  >
                    Invoke Agent (Coming Soon)
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
