import React from 'react';
import { Compass, Layers, Activity, Settings } from 'lucide-react';

export type AndroidTab = 'detector' | 'stud_finder' | 'scope' | 'settings';

interface AndroidNavBarProps {
  activeTab: AndroidTab;
  onSelectTab: (tab: AndroidTab) => void;
  isAlert?: boolean;
}

export const AndroidNavBar: React.FC<AndroidNavBarProps> = ({
  activeTab,
  onSelectTab,
  isAlert = false,
}) => {
  const tabs = [
    { id: 'detector' as AndroidTab, label: 'Detector', icon: Compass },
    { id: 'stud_finder' as AndroidTab, label: 'Stud Finder', icon: Layers },
    { id: 'scope' as AndroidTab, label: 'Flux Scope', icon: Activity },
    { id: 'settings' as AndroidTab, label: 'Settings', icon: Settings },
  ];

  return (
    <nav
      id="android-bottom-nav"
      className="w-full bg-[#12141A] border-t border-[#232630] px-2 py-1.5 flex items-center justify-around z-30 shrink-0 select-none shadow-[0_-4px_20px_rgba(0,0,0,0.5)]"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            id={`nav-tab-${tab.id}`}
            onClick={() => onSelectTab(tab.id)}
            className="flex flex-col items-center justify-center flex-1 py-1 gap-1 cursor-pointer transition-all duration-200 group relative"
          >
            {/* Material 3 Active Indicator Pill */}
            <div
              className={`px-4 py-1 rounded-full flex items-center justify-center transition-all duration-200 ${
                isActive
                  ? isAlert
                    ? 'bg-[#FF3E3E] text-black shadow-md shadow-[#FF3E3E]/20'
                    : 'bg-[#3DDC84] text-black shadow-md shadow-[#3DDC84]/20'
                  : 'text-[#8E92A0] group-hover:text-white group-hover:bg-[#1C1F28]'
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>

            {/* Label */}
            <span
              className={`text-[10px] font-mono tracking-tight transition-colors ${
                isActive
                  ? isAlert
                    ? 'text-[#FF3E3E] font-bold'
                    : 'text-[#3DDC84] font-bold'
                  : 'text-[#8E92A0] group-hover:text-[#E0E0E0]'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
