import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from '@widgets/Header/Header';
import { FeedPage } from '@pages/feed/FeedPage';
import { PetDetailPage } from '@pages/pet-detail/PetDetailPage';
import { ChatsPage } from '@pages/chats/ChatsPage';
import { CreatePage } from '@pages/create-profile/CreatePage';
import { EditPage } from '@pages/create-profile/EditPage';
import { ProfilePage } from '@pages/profile/ProfilePage';
import { PreferencesPage } from '@pages/preferences/PreferencesPage';
import { LoginPage } from '@pages/auth/LoginPage';
import { RegisterPage } from '@pages/auth/RegisterPage';
import { StoriesPage } from '@pages/stories/StoriesPage';
import { useAppInit } from './useAppInit';
import { ProtectedRoute } from './ProtectedRoute';

function AppShell() {
  useAppInit();
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="animate-fade-in">
        <Routes>
          <Route path="/" element={<FeedPage />} />
          <Route path="/stories" element={<StoriesPage />} />
          <Route path="/pet/:id" element={<PetDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/chats"
            element={
              <ProtectedRoute>
                <ChatsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <ProtectedRoute>
                <EditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/preferences"
            element={
              <ProtectedRoute>
                <PreferencesPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
