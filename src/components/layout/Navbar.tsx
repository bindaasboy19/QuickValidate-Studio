import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Rocket, LogOut, User as UserIcon } from 'lucide-react';

export function Navbar() {
  const { user, profile, signIn, signOut } = useAuth();

  return (
    <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="bg-orange-600 p-2 rounded-lg">
              <Rocket className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              QuickValidate <span className="text-orange-600">Studio</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 mr-4">
                  <UserIcon className="h-4 w-4" />
                  <span>{profile?.displayName || user.email}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={signOut} className="text-gray-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button onClick={signIn} className="bg-orange-600 hover:bg-orange-700 text-white">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
