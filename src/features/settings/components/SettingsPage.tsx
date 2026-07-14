import { Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { getSrcPath, OSS_STYLE_PARAMETERS } from '@/components/api/oss/ossPathAssembler';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  useUserSettings,
  useUpdateProfile,
  useUpdateContact,
  useUpdatePassword,
  useUpdateAuthInfo,
} from '../hooks';

export default function SettingsPage() {
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [externalLinks, setExternalLinks] = useState<Array<{ platform: string; url: string }>>([]);
  const [newLink, setNewLink] = useState<{ platform: string; url: string }>({
    platform: '',
    url: '',
  });
  
  // 头像文件和banner文件的临时存储，等待用户提交表单时上传到 OSS
  const avatarFileRef = useRef<File | null>(null);
  const bannerFileRef = useRef<File | null>(null);

  // 查询当前用户设置信息
  const { data: currentUser } = useUserSettings();

  // 各种更新操作的 mutations
  const updateProfileMutation = useUpdateProfile();
  const updateContactMutation = useUpdateContact();
  const updatePasswordMutation = useUpdatePassword();
  const updateAuthMutation = useUpdateAuthInfo();

  const profileForm = useForm({
    defaultValues: {
      username: '',
      bio: '',
      sexType: '',
      avatarUrl: '',
      bannerUrl: '',
      location: '',
    },
  });

  useEffect(() => {
    if (currentUser) {
      profileForm.reset({
        username: currentUser.username || '',
        bio: currentUser.bio || '',
        sexType: currentUser.sexType || '',
        avatarUrl: currentUser.avatarUrl || '',
        bannerUrl: currentUser.bannerUrl || '',
        location: currentUser.location || '',
      });
      setBannerPreview(
        currentUser.bannerUrl
          ? getSrcPath(currentUser.bannerUrl, OSS_STYLE_PARAMETERS.HERO)
          : '',
      );
      setAvatarPreview(
        currentUser.avatarUrl
          ? getSrcPath(currentUser.avatarUrl, OSS_STYLE_PARAMETERS.AVATAR)
          : '',
      );
      setExternalLinks(currentUser.externalLinks || []);
    }
  }, [currentUser, profileForm]);

  const contactForm = useForm({
    defaultValues: { email: '', phone: '' },
  });

  const passwordForm = useForm({
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });

  const authForm = useForm({
    defaultValues: { realName: '', studentId: '' },
  });

  const handleAddExternalLink = () => {
    if (newLink.platform && newLink.url) {
      setExternalLinks([...externalLinks, newLink]);
      setNewLink({ platform: '', url: '' });
    }
  };

  const handleRemoveExternalLink = (index: number) => {
    setExternalLinks(externalLinks.filter((_, i) => i !== index));
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setBannerPreview(result);
      };
      reader.readAsDataURL(file);
      // 同时保存到临时file字段，等待submit时上传到OSS
      bannerFileRef.current = file;
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string; // base64字符串
        setAvatarPreview(result);
      };
      reader.readAsDataURL(file);
      // 同时保存到临时file字段，等待submit时上传到OSS
      avatarFileRef.current = file;
    }
  };

  const onProfileSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        externalLinks,
        avatarFile: avatarFileRef.current,
        bannerFile: bannerFileRef.current,
      };
      await updateProfileMutation.mutateAsync(payload);
      avatarFileRef.current = null;
      bannerFileRef.current = null;
      const updated = useAuthStore.getState().currentUserData;
      if (updated) {
        setAvatarPreview(
          updated.avatarUrl
            ? getSrcPath(updated.avatarUrl, OSS_STYLE_PARAMETERS.AVATAR)
            : '',
        );
        setBannerPreview(
          updated.bannerUrl
            ? getSrcPath(updated.bannerUrl, OSS_STYLE_PARAMETERS.HERO)
            : '',
        );
      }
      console.log('Updated user data:', useAuthStore.getState().currentUserData);
      toast.success('个人资料已更新');
    } catch (error) {
      toast.error('更新失败，请重试');
      console.error(error);
    }
  };

  const onContactSubmit = async (data: any) => {
    try {
      await updateContactMutation.mutateAsync(data);
      toast.success('联系方式已更新');
    } catch (error) {
      toast.error('更新失败，请重试');
      console.error(error);
    }
  };

  const onPasswordSubmit = async (data: any) => {
    try {
      if (data.newPassword !== data.confirmPassword) {
        toast.error('两次输入的密码不一致');
        return;
      }
      await updatePasswordMutation.mutateAsync({
        currentPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      toast.success('密码已更新');
      passwordForm.reset();
    } catch (error) {
      toast.error('更新失败，请重试');
      console.error(error);
    }
  };

  const onAuthSubmit = async (data: any) => {
    try {
      await updateAuthMutation.mutateAsync(data);
      toast.success('认证信息已提交');
      authForm.reset();
    } catch (error) {
      toast.error('提交失败，请重试');
      console.error(error);
    }
  };

  return (
    <div className="animate-in fade-in mx-auto flex w-full max-w-3xl flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">设置</h1>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">个人资料</TabsTrigger>
          <TabsTrigger value="contact">联系方式</TabsTrigger>
          <TabsTrigger value="password">修改密码</TabsTrigger>
          <TabsTrigger value="auth">认证信息</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>个人资料</CardTitle>
              <CardDescription>编辑您的个人信息和头像</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                {/* Banner & Avatar */}
                <div className="space-y-2">
                  <Label>封面图片</Label>
                  <div>
                    {/* Banner - with its own relative context */}
                    <div className="bg-muted relative h-40 w-full overflow-hidden rounded-t-lg">
                      {bannerPreview && (
                        <img
                          src={bannerPreview}
                          alt="banner"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      )}
                      <label
                        htmlFor="banner-upload"
                        className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100"
                      >
                        <Upload className="size-6 text-white" />
                        <input
                          id="banner-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleBannerUpload}
                        />
                      </label>
                    </div>

                    {/* Avatar & Username Container */}
                    <div className="bg-card flex items-end gap-4 rounded-b-lg border border-t-0 px-6 py-4">
                      {/* Avatar */}
                      <div className="relative -mt-12">
                        <Avatar className="border-card size-24 border-4">
                          <AvatarImage src={avatarPreview} alt="avatar" />
                          <AvatarFallback>
                            {profileForm.watch('username')?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <label
                          htmlFor="avatar-upload"
                          className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/30 opacity-0 transition-opacity hover:opacity-100"
                        >
                          <Upload className="size-5 text-white" />
                          <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarUpload}
                          />
                        </label>
                      </div>

                      {/* Username */}
                      <div className="flex-1 space-y-2">
                        <Label htmlFor="username">用户名</Label>
                        <Input
                          id="username"
                          {...profileForm.register('username')}
                          placeholder="输入用户名"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">个人简介</Label>
                  <Textarea
                    id="bio"
                    rows={3}
                    {...profileForm.register('bio')}
                    placeholder="介绍一下自己..."
                  />
                </div>

                {/* Sex Type & Location - One Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sexType">性别</Label>
                    <select
                      id="sexType"
                      className="border-input bg-background focus:ring-ring flex h-9 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      value={profileForm.watch('sexType')}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        profileForm.setValue('sexType', e.target.value)
                      }
                    >
                      <option value="">选择性别</option>
                      <option value="male">男</option>
                      <option value="female">女</option>
                      <option value="other">其他</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">位置</Label>
                    <Input
                      id="location"
                      {...profileForm.register('location')}
                      placeholder="例如：北京市"
                    />
                  </div>
                </div>

                {/* External Links */}
                <div className="space-y-3">
                  <Label>外部链接</Label>
                  <div className="space-y-2">
                    {externalLinks.map((link, index) => (
                      <div key={index} className="flex items-center gap-2 rounded-lg border p-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{link.platform}</p>
                          <p className="text-muted-foreground truncate text-xs">{link.url}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveExternalLink(index)}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 rounded-lg border p-3">
                    <div className="space-y-2">
                      <Label htmlFor="platform" className="text-sm">
                        平台
                      </Label>
                      <Input
                        id="platform"
                        type="text"
                        placeholder="输入平台名 (如 GitHub、Twitter)"
                        value={newLink.platform}
                        onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="link-url" className="text-sm">
                        链接
                      </Label>
                      <Input
                        id="link-url"
                        type="url"
                        placeholder="输入完整链接 URL"
                        value={newLink.url}
                        onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleAddExternalLink}
                    >
                      添加链接
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  保存更改
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>联系方式</CardTitle>
              <CardDescription>管理您的联系方式</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={contactForm.handleSubmit(onContactSubmit)}>
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <Input
                    id="email"
                    type="email"
                    {...contactForm.register('email')}
                    placeholder="输入邮箱地址"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">手机号</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...contactForm.register('phone')}
                    placeholder="输入手机号码"
                  />
                </div>
                <Button type="submit">保存更改</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>修改密码</CardTitle>
              <CardDescription>更改您的账户密码</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                <div className="space-y-2">
                  <Label htmlFor="oldPassword">当前密码</Label>
                  <Input
                    id="oldPassword"
                    type="password"
                    {...passwordForm.register('oldPassword')}
                    placeholder="输入当前密码"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">新密码</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    {...passwordForm.register('newPassword')}
                    placeholder="输入新密码"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">确认新密码</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...passwordForm.register('confirmPassword')}
                    placeholder="确认新密码"
                  />
                </div>
                <Button type="submit">更新密码</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auth Tab */}
        <TabsContent value="auth">
          <Card>
            <CardHeader>
              <CardTitle>认证信息</CardTitle>
              <CardDescription>提交您的身份验证信息</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={authForm.handleSubmit(onAuthSubmit)}>
                <div className="space-y-2">
                  <Label htmlFor="realName">真实姓名</Label>
                  <Input
                    id="realName"
                    {...authForm.register('realName')}
                    placeholder="输入真实姓名"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentId">学号</Label>
                  <Input
                    id="studentId"
                    {...authForm.register('studentId')}
                    placeholder="输入学号"
                  />
                </div>
                <Button type="submit">提交认证</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
