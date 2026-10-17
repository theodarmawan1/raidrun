import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PhoneShell } from './components/layout/PhoneShell';
import { MapPlaceholderScreen } from './components/screens/MapPlaceholderScreen';
import { MapDiscoveryScreen } from './components/screens/MapDiscoveryScreen';
import { EventsScreen } from './components/screens/EventsScreen';
import { DeckScreen } from './components/screens/DeckScreen';
import { PartyScreen } from './components/screens/PartyScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { HubScreen } from './components/screens/HubScreen';
import { RaidLobbyScreen } from './components/screens/RaidLobbyScreen';
import { RunScreen } from './components/screens/RunScreen';
import { RaidResultsScreen } from './components/screens/RaidResultsScreen';
import { RunCompleteScreen } from './components/screens/RunCompleteScreen';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <PhoneShell>
        <Routes>
          <Route path="/" element={<MapPlaceholderScreen />} />
          <Route path="/hub" element={<HubScreen />} />
          <Route path="/map" element={<MapDiscoveryScreen />} />
          <Route path="/events" element={<EventsScreen />} />
          <Route path="/deck" element={<DeckScreen />} />
          <Route path="/party" element={<PartyScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/raid" element={<RaidLobbyScreen />} />
          <Route path="/raid/lobby" element={<RaidLobbyScreen />} />
          <Route path="/run" element={<RunScreen />} />
          <Route path="/raid/results" element={<RaidResultsScreen />} />
          <Route path="/raid/victory" element={<RunCompleteScreen />} />
          <Route path="/run/complete" element={<RunCompleteScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PhoneShell>
    </BrowserRouter>
  );
};

export default App;

