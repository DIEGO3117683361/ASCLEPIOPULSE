import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import VS from './pages/VS';
import Profile from './pages/Profile';
import RoutineDetail from './pages/RoutineDetail';
import LogActivity from './pages/LogActivity';
import Chat from './pages/Chat';
import CreateEditRoutine from './pages/CreateEditRoutine';
import Welcome from './pages/Welcome';
import CreateProfile from './pages/CreateProfile';
import Login from './pages/Login';
import EditProfile from './pages/EditProfile';
import PulseDetail from './pages/PulseDetail';
import CreatePulse from './pages/CreatePulse';
import LogPulseActivity from './pages/LogPulseActivity';
import AcceptPulseInvite from './pages/AcceptPulseInvite';
import SetPulseGoals from './pages/SetPulseGoals';
import Admin from './pages/Admin';
import Messages from './pages/Messages';
import DirectChat from './pages/DirectChat';
import CreateGroup from './pages/CreateGroup';
import GroupChat from './pages/GroupChat';
import GroupSettings from './pages/GroupSettings';
import Minigames from './pages/Minigames';
import ReactionGame from './pages/games/ReactionGame';
import ShadowDuel from './pages/games/ShadowDuel';

const AppRoutes: React.FC = () => {
    const { currentUser } = useUser();

    if (!currentUser) {
        return (
            <Routes>
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/login" element={<Login />} />
                <Route path="/create-profile" element={<CreateProfile />} />
                <Route path="*" element={<Navigate to="/welcome" />} />
            </Routes>
        );
    }
    
    // @ts-ignore - isAdmin is a transient property for the admin user
    if (currentUser.isAdmin) {
        return (
            <Routes>
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<Navigate to="/admin" />} />
            </Routes>
        );
    }

    return (
       <Layout>
           <Routes>
                {/* Main pages */}
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/vs" element={<VS />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/profile/:id" element={<Profile />} />

                {/* All other pages now also use the main layout */}
                <Route path="/profile/edit" element={<EditProfile />} />
                <Route path="/routine/:id" element={<RoutineDetail />} />
                <Route path="/routine/create" element={<CreateEditRoutine />} />
                <Route path="/routine/edit/:id" element={<CreateEditRoutine />} />
                <Route path="/pulse/create" element={<CreatePulse />} />
                <Route path="/pulse/:id" element={<PulseDetail />} />
                <Route path="/pulse/:id/log" element={<LogPulseActivity />} />
                <Route path="/pulse/set-goals/:id" element={<SetPulseGoals />} />
                <Route path="/pulse/accept/:id" element={<AcceptPulseInvite />} />
                <Route path="/log-activity" element={<LogActivity />} />
                <Route path="/chat/:id" element={<Chat />} />
                <Route path="/direct-chat/:id" element={<DirectChat />} />
                <Route path="/group/create" element={<CreateGroup />} />
                <Route path="/group-chat/:id" element={<GroupChat />} />
                <Route path="/group-settings/:id" element={<GroupSettings />} />
                <Route path="/minigames" element={<Minigames />} />
                <Route path="/minigames/reaction" element={<ReactionGame />} />
                <Route path="/minigames/shadow-duel" element={<ShadowDuel />} />

                
                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
       </Layout>
    );
};

const App: React.FC = () => {
    return (
        <UserProvider>
            <Router>
                <AppRoutes />
            </Router>
        </UserProvider>
    );
};

export default App;