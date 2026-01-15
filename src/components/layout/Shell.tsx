import { useState } from 'react';
import { Sidebar, type View } from './Sidebar';
import { Header } from './Header';
import { GovernancePanel } from '../governance/GovernancePanel';
import { TruthPanel } from '../truth/TruthPanel';
import { AgentsPanel } from '../agents/AgentsPanel';
import { AuditPanel } from '../audit/AuditPanel';
import { KnowledgePanel } from '../knowledge/KnowledgePanel';
import { TerminalPanel } from '../terminal';
import { SettingsPanel } from '../settings';

export function Shell() {
  const [currentView, setCurrentView] = useState<View>('governance');

  return (
    <div className="flex h-screen bg-[#0a0a12]">
      {/* Sidebar */}
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header currentView={currentView} />

        <main className="flex-1 overflow-auto p-6">
          {currentView === 'governance' && <GovernancePanel />}
          {currentView === 'agents' && <AgentsPanel />}
          {currentView === 'truth' && <TruthPanel />}
          {currentView === 'audit' && <AuditPanel />}
          {currentView === 'knowledge' && <KnowledgePanel />}
          {currentView === 'terminal' && <TerminalPanel />}
          {currentView === 'settings' && <SettingsPanel />}
        </main>
      </div>
    </div>
  );
}
