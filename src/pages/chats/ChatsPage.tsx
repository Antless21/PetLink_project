import { useState } from 'react';
import { ChatSidebar } from '@widgets/ChatSidebar/ChatSidebar';
import { ChatWindow } from '@widgets/ChatWindow/ChatWindow';
import { cn } from '@shared/lib/cn';

export function ChatsPage() {
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  return (
    <div className="h-[calc(100vh-120px)] md:h-[calc(100vh-132px)]">
      <div className="h-full flex bg-cream-50">
        {/* Sidebar */}
        <div
          className={cn(
            'w-full md:w-80 lg:w-96 shrink-0 border-r border-cream-200',
            mobileView === 'chat' ? 'hidden md:block' : 'block',
          )}
        >
          <ChatSidebar onSelect={() => setMobileView('chat')} />
        </div>

        {/* Window */}
        <div
          className={cn(
            'flex-1',
            mobileView === 'list' ? 'hidden md:flex' : 'flex',
          )}
        >
          <ChatWindow onBack={() => setMobileView('list')} />
        </div>
      </div>
    </div>
  );
}
