import React from 'react';
import {
  Compass,
  Calendar,
  GraduationCap,
  CheckSquare,
  Flame,
  Award,
  SlidersHorizontal,
} from 'lucide-react';

export type NavTab = 'home' | 'calendar' | 'university' | 'tasks' | 'habits' | 'progress' | 'settings';

interface BottomNavigationProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingTasksCount?: number;
}

interface NavItem {
  id: NavTab;
  label: string;
  subLabel: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Today', subLabel: 'Reception', icon: Compass },
  { id: 'calendar', label: 'Calendar', subLabel: 'Ledger', icon: Calendar },
  { id: 'university', label: 'Academy', subLabel: 'Classes', icon: GraduationCap },
  { id: 'tasks', label: 'Tasks', subLabel: 'Errands', icon: CheckSquare },
  { id: 'habits', label: 'Habits', subLabel: 'Streaks', icon: Flame },
  { id: 'progress', label: 'Honors', subLabel: 'RPG & XP', icon: Award },
  { id: 'settings', label: 'Settings', subLabel: 'Registry', icon: SlidersHorizontal },
];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onSelectTab,
  pendingTasksCount = 0,
}) => {
  return (
    <>
      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-t-2 border-[#2D1A29] px-2 py-1.5 md:hidden shadow-[0_-4px_10px_rgba(45,26,41,0.08)] pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]"
      >
        <div className="grid grid-cols-7 gap-0.5 items-center max-w-lg mx-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center justify-center min-h-[50px] py-1 px-0.5 rounded-lg transition-all relative ${
                  isActive
                    ? 'bg-[#F7B5CD] text-[#2D1A29] font-bold border border-[#2D1A29] shadow-[1px_1px_0px_#2D1A29]'
                    : 'text-[#521828] hover:bg-[#F5EBE1] active:scale-95'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  {item.id === 'tasks' && pendingTasksCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-[#9E2A2B] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-[#FFFFFF]">
                      {pendingTasksCount > 9 ? '9+' : pendingTasksCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight leading-tight mt-1 truncate max-w-full">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Top Sub-Bar (Symmetrical Wes Anderson Navigation Tabs) */}
      <div className="hidden md:block bg-[#FDFBF7] border-b-2 border-[#2D1A29] px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border-2 ${
                  isActive
                    ? 'bg-[#F7B5CD] text-[#2D1A29] border-[#2D1A29] shadow-[2px_2px_0px_#2D1A29] translate-y-[-1px]'
                    : 'bg-[#FFFFFF] text-[#521828] border-transparent hover:border-[#2D1A29] hover:bg-[#F5EBE1]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                <span>{item.label}</span>
                <span className="text-[10px] text-[#A62B46] normal-case opacity-70">
                  ({item.subLabel})
                </span>
                {item.id === 'tasks' && pendingTasksCount > 0 && (
                  <span className="ml-1 bg-[#2D1A29] text-[#FDFBF7] text-[10px] font-mono-numbers px-1.5 py-0.2 rounded-full">
                    {pendingTasksCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
