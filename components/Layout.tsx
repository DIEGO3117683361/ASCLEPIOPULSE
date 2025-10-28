
import React from 'react';
import BottomNav from './BottomNav';
import ScoreToast from './ScoreToast';
import StreakToast from './StreakToast';
import LevelUpModal from './LevelUpModal';
import { useUser } from '../context/UserContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { scoreUpdate, clearScoreUpdate, streakMilestone, clearStreakMilestone, levelUp, clearLevelUp } = useUser();

  return (
    <div className="bg-graphite text-gray-200 h-screen font-sans flex flex-col max-w-lg mx-auto">
      <ScoreToast scoreUpdate={scoreUpdate} onClose={clearScoreUpdate} />
      <StreakToast streakMilestone={streakMilestone} onClose={clearStreakMilestone} />
      <LevelUpModal levelUp={levelUp} onClose={clearLevelUp} />
      <main className="flex-1 w-full overflow-y-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};

export default Layout;