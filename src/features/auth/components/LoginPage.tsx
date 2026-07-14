import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginSection from './LoginSection';
import RegisterSection from './RegisterSection';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [autoFillUsername, setAutoFillUsername] = useState<string>('');
  const [autoFillPassword, setAutoFillPassword] = useState<string>('');

  const handleRegisterSuccess = (username: string, password: string) => {
    setAutoFillUsername(username);
    setAutoFillPassword(password);
    setActiveTab('login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 dark:from-slate-950 dark:to-slate-900">
      <div className="border-border bg-card dark:border-border dark:bg-card w-full max-w-5xl overflow-hidden rounded-2xl border shadow-xl">
        <div className="flex flex-col lg:flex-row">
          {/* Left: Image/Branding */}
          <div className="from-primary/15 to-primary/5 hidden flex-shrink-0 flex-col items-center justify-center overflow-hidden bg-gradient-to-br px-8 py-12 text-center lg:flex lg:w-2/5">
            <div className="space-y-6">
              <div>
                <h1 className="text-foreground text-4xl font-bold">Yolink</h1>
                <p className="text-muted-foreground mt-2 text-lg">Your Social Network, Your Way</p>
              </div>
              <div className="text-muted-foreground space-y-3 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <div className="bg-primary h-2 w-2 rounded-full"></div>
                  <span>Share your thoughts</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="bg-primary h-2 w-2 rounded-full"></div>
                  <span>Connect with others</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="bg-primary h-2 w-2 rounded-full"></div>
                  <span>Build community</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Login/Register Form */}
          <div className="flex flex-col gap-6 px-6 py-8 sm:px-8 lg:w-3/5 lg:py-12">
            <div className="text-center">
              <h2 className="text-foreground text-2xl font-bold">Welcome Back</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Sign in to your account to continue
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full" variant="underline">
                <TabsTrigger value="login" className="flex-1">
                  登录
                </TabsTrigger>
                <TabsTrigger value="register" className="flex-1">
                  注册
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <LoginSection
                  onRequestRegister={() => setActiveTab('register')}
                  autoFillUsername={autoFillUsername}
                  autoFillPassword={autoFillPassword}
                  onAutoFillClear={() => {
                    setAutoFillUsername('');
                    setAutoFillPassword('');
                  }}
                />
              </TabsContent>

              <TabsContent value="register" className="mt-6">
                <RegisterSection onRegisterSuccess={handleRegisterSuccess} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
