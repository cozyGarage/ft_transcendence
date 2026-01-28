import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import RightSidebar from '@/components/layout/RightSidebar';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { playerApi } from '@/api/player';

export default function MainLayout() {
  const { player, fetchCurrentPlayer } = useAuthStore();
  const { connectWebSocket, disconnectWebSocket } = useNotificationStore();

  useEffect(() => {
    // Fetch current player data on mount
    fetchCurrentPlayer();
    
    // Update online status periodically
    const updateOnlineStatus = () => {
      playerApi.updateOnlineStatus().catch(console.error);
    };
    
    updateOnlineStatus();
    const interval = setInterval(updateOnlineStatus, 60000); // Every minute
    
    return () => clearInterval(interval);
  }, [fetchCurrentPlayer]);

  useEffect(() => {
    // Connect notification WebSocket when player is available
    if (player?.user?.id) {
      connectWebSocket(player.user.id);
    }
    
    return () => {
      disconnectWebSocket();
    };
  }, [player?.user?.id, connectWebSocket, disconnectWebSocket]);

  return (
    <div className="min-h-screen flex bg-dark">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-20 lg:ml-64 transition-all duration-300">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Right Sidebar (Notifications/Friends) */}
      <RightSidebar />
    </div>
  );
}
