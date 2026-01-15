import { motion } from 'framer-motion';
import { Bot, Link2, Tag } from 'lucide-react';
import { UNIVERSE_COLORS, STATUS_COLORS } from './agentData';
import type { Agent } from './agentData';

interface AgentCardProps {
  agent: Agent;
  onClick?: () => void;
}

export function AgentCard({ agent, onClick }: AgentCardProps) {
  const universeColors = UNIVERSE_COLORS[agent.universe];
  const statusColors = STATUS_COLORS[agent.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className={`bg-zinc-900/50 border rounded-lg p-4 cursor-pointer hover:border-zinc-600 transition-colors ${universeColors.border}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${universeColors.bg}`}>
          <Bot className={`w-5 h-5 ${universeColors.text}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-zinc-100 font-semibold">{agent.name}</h3>
            <span className={`text-xs px-1.5 py-0.5 rounded ${universeColors.bg} ${universeColors.text}`}>
              {agent.universe}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${statusColors.bg} ${statusColors.text}`}>
              {agent.status}
            </span>
          </div>

          <p className="text-sm text-zinc-400 mt-0.5">{agent.role}</p>

          <p className="text-sm text-zinc-500 mt-2 line-clamp-2">
            {agent.description}
          </p>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {agent.keywords.slice(0, 4).map((keyword) => (
              <span
                key={keyword}
                className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded"
              >
                <Tag className="w-2.5 h-2.5" />
                {keyword}
              </span>
            ))}
          </div>

          {agent.connections.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-500">
              <Link2 className="w-3 h-3" />
              <span>{agent.connections.slice(0, 3).join(', ')}</span>
              {agent.connections.length > 3 && (
                <span className="text-zinc-600">+{agent.connections.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
