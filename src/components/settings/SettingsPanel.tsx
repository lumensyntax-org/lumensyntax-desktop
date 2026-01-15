import { useState, useEffect } from 'react';
import {
  Settings,
  Palette,
  FolderOpen,
  Terminal,
  Shield,
  Save,
  RefreshCw,
} from 'lucide-react';

interface AppSettings {
  vaultPath: string;
  truthRepoPath: string;
  theme: 'dark' | 'light' | 'system';
  terminalFontSize: number;
  defaultRiskProfile: 'low' | 'medium' | 'high';
  autoSaveAudit: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  vaultPath: '~/Documents/Obsidian Vault',
  truthRepoPath: '~/Almacen_IA/LumenSyntax-Main',
  theme: 'dark',
  terminalFontSize: 14,
  defaultRiskProfile: 'medium',
  autoSaveAudit: true,
};

interface SettingsSectionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}

function SettingsSection({ icon, title, description, children }: SettingsSectionProps) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
          <p className="text-sm text-zinc-500">{description}</p>
        </div>
      </div>
      <div className="space-y-4 ml-14">
        {children}
      </div>
    </div>
  );
}

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function InputField({ label, value, onChange, placeholder }: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm text-zinc-400 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
      />
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  return (
    <div>
      <label className="block text-sm text-zinc-400 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-purple-500 transition-colors"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface ToggleFieldProps {
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

function ToggleField({ label, description, value, onChange }: ToggleFieldProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-zinc-200">{label}</p>
        <p className="text-xs text-zinc-500">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-colors ${
          value ? 'bg-purple-500' : 'bg-zinc-700'
        }`}
      >
        <div
          className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
            value ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}

export function SettingsPanel() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = localStorage.getItem('lumensyntax-settings');
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('lumensyntax-settings', JSON.stringify(settings));
      setHasChanges(false);
      setSaveMessage('Settings saved successfully');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setSaveMessage('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zinc-500/20 to-zinc-600/20 flex items-center justify-center">
            <Settings className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-zinc-100">Settings</h1>
            <p className="text-xs text-zinc-500">Configure LumenSyntax Desktop</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveMessage && (
            <span className={`text-sm ${saveMessage.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
              {saveMessage}
            </span>
          )}
          <button
            onClick={resetSettings}
            className="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-1"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={saveSettings}
            disabled={!hasChanges || isSaving}
            className={`px-4 py-1.5 text-sm rounded-lg flex items-center gap-1 transition-colors ${
              hasChanges
                ? 'bg-purple-500 hover:bg-purple-600 text-white'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Paths */}
          <SettingsSection
            icon={<FolderOpen className="w-5 h-5 text-blue-400" />}
            title="Paths"
            description="Configure file system locations"
          >
            <InputField
              label="Obsidian Vault Path"
              value={settings.vaultPath}
              onChange={(v) => updateSetting('vaultPath', v)}
              placeholder="~/Documents/Obsidian Vault"
            />
            <InputField
              label="Truth Repository Path"
              value={settings.truthRepoPath}
              onChange={(v) => updateSetting('truthRepoPath', v)}
              placeholder="~/Almacen_IA/LumenSyntax-Main"
            />
          </SettingsSection>

          {/* Appearance */}
          <SettingsSection
            icon={<Palette className="w-5 h-5 text-purple-400" />}
            title="Appearance"
            description="Customize the look and feel"
          >
            <SelectField
              label="Theme"
              value={settings.theme}
              onChange={(v) => updateSetting('theme', v as 'dark' | 'light' | 'system')}
              options={[
                { value: 'dark', label: 'Dark' },
                { value: 'light', label: 'Light (Coming Soon)' },
                { value: 'system', label: 'System' },
              ]}
            />
          </SettingsSection>

          {/* Terminal */}
          <SettingsSection
            icon={<Terminal className="w-5 h-5 text-green-400" />}
            title="Terminal"
            description="Terminal emulator settings"
          >
            <SelectField
              label="Font Size"
              value={settings.terminalFontSize.toString()}
              onChange={(v) => updateSetting('terminalFontSize', parseInt(v))}
              options={[
                { value: '12', label: '12px' },
                { value: '14', label: '14px (Default)' },
                { value: '16', label: '16px' },
                { value: '18', label: '18px' },
              ]}
            />
          </SettingsSection>

          {/* Governance */}
          <SettingsSection
            icon={<Shield className="w-5 h-5 text-amber-400" />}
            title="Governance"
            description="Default governance settings"
          >
            <SelectField
              label="Default Risk Profile"
              value={settings.defaultRiskProfile}
              onChange={(v) => updateSetting('defaultRiskProfile', v as 'low' | 'medium' | 'high')}
              options={[
                { value: 'low', label: 'Low - More permissive' },
                { value: 'medium', label: 'Medium - Balanced (Default)' },
                { value: 'high', label: 'High - Conservative' },
              ]}
            />
            <ToggleField
              label="Auto-save Audit Entries"
              description="Automatically save all verification results to the audit log"
              value={settings.autoSaveAudit}
              onChange={(v) => updateSetting('autoSaveAudit', v)}
            />
          </SettingsSection>

          {/* Version Info */}
          <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-6 text-center">
            <p className="text-zinc-400 text-sm mb-2">LumenSyntax Desktop</p>
            <p className="text-2xl font-light text-zinc-200 mb-1">v0.1.0</p>
            <p className="text-xs text-zinc-600">Phase 6 - Terminal & Settings</p>
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-zinc-500">
              <span>Built with Tauri 2.0</span>
              <span>•</span>
              <span>React 19</span>
              <span>•</span>
              <span>xterm.js</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
