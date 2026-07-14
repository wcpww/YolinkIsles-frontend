import { isAxiosError } from 'axios';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLogin } from '../hooks/useLogin';
import type { LoginRequest } from '../api/login';

type LoginMethod = 'username' | 'email' | 'phone';

type LoginFormValues = {
  username: string;
  email: string;
  phone: string;
  password: string;
  code: string;
};

type LoginErrorInfo = {
  message: string;
  suggestRegister?: boolean;
  resetPassword?: boolean;
};

type LoginSectionProps = {
  onRequestRegister?: () => void;
  autoFillUsername?: string;
  autoFillPassword?: string;
  onAutoFillClear?: () => void;
};

const DEFAULT_VALUES: LoginFormValues = {
  username: '',
  email: '',
  phone: '',
  password: '',
  code: '',
};

const getLoginErrorInfo = (error: unknown): LoginErrorInfo => {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const responseMessage =
      typeof error.response?.data === 'object' && error.response?.data
        ? (error.response?.data as { message?: string }).message
        : undefined;
    const rawMessage = responseMessage || error.message;
    const lowerMessage = rawMessage?.toLowerCase() ?? '';

    if (status === 404 || lowerMessage.includes('not found') || rawMessage?.includes('不存在')) {
      return { message: '用户不存在，请先注册', suggestRegister: true };
    }

    if (status === 401 || lowerMessage.includes('password') || rawMessage?.includes('密码')) {
      return { message: '密码错误，请重新输入', resetPassword: true };
    }

    return { message: rawMessage || '登录失败，请稍后再试' };
  }

  if (error instanceof Error) {
    const rawMessage = error.message || '登录失败，请稍后再试';
    const lowerMessage = rawMessage.toLowerCase();

    if (lowerMessage.includes('not found') || rawMessage.includes('不存在')) {
      return { message: '用户不存在，请先注册', suggestRegister: true };
    }

    if (lowerMessage.includes('password') || rawMessage.includes('密码')) {
      return { message: '密码错误，请重新输入', resetPassword: true };
    }

    return { message: rawMessage };
  }

  return { message: '登录失败，请稍后再试' };
};

const buildLoginPayload = (values: LoginFormValues, method: LoginMethod): LoginRequest => {
  const trimmed = {
    username: values.username.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    password: values.password.trim(),
  };

  return {
    username: method === 'username' ? trimmed.username : null,
    email: method === 'email' ? trimmed.email : null,
    phone: method === 'phone' ? trimmed.phone : null,
    password: trimmed.password,
  };
};

export default function LoginSection({
  onRequestRegister,
  autoFillUsername,
  autoFillPassword,
  onAutoFillClear,
}: LoginSectionProps) {
  const [method, setMethod] = useState<LoginMethod>('username');
  const [errorInfo, setErrorInfo] = useState<LoginErrorInfo | null>(null);
  const loginForm = useForm<LoginFormValues>({
    defaultValues: DEFAULT_VALUES,
  });
  const loginMutation = useLogin();

  // Auto-fill username and password when registration is successful
  useEffect(() => {
    if (autoFillUsername && autoFillPassword) {
      setMethod('username');
      loginForm.setValue('username', autoFillUsername);
      loginForm.setValue('password', autoFillPassword);
      loginForm.clearErrors();
      loginMutation.reset();
      setErrorInfo(null);

      // Clear auto-fill values after using them
      onAutoFillClear?.();
    }
  }, [autoFillUsername, autoFillPassword]);

  const handleMethodChange = (value: string) => {
    const nextMethod = value as LoginMethod;
    if (nextMethod === method) {
      return;
    }

    setMethod(nextMethod);
    loginForm.reset(DEFAULT_VALUES);
    loginForm.clearErrors();
    loginMutation.reset();
    setErrorInfo(null);
  };

  const handleSubmit = loginForm.handleSubmit(async (values) => {
    setErrorInfo(null);

    const identifierValue =
      method === 'username'
        ? values.username.trim()
        : method === 'email'
          ? values.email.trim()
          : values.phone.trim();

    if (!identifierValue) {
      loginForm.setError(method, { message: '请输入账号信息' });
      return;
    }

    if (!values.password.trim()) {
      loginForm.setError('password', { message: '请输入密码' });
      return;
    }

    try {
      const payload = buildLoginPayload(values, method);
      await loginMutation.mutateAsync(payload);
    } catch (error) {
      const info = getLoginErrorInfo(error);
      setErrorInfo(info);
      if (info.resetPassword) {
        loginForm.setValue('password', '');
      }
    }
  });

  return (
    <form className="flex min-h-[420px] flex-col gap-6" onSubmit={handleSubmit}>
      {/* Method Tabs */}
      <Tabs value={method} onValueChange={handleMethodChange} variant="underline">
        <TabsList className="w-full" variant="underline">
          <TabsTrigger value="username" className="flex-1">
            用户名
          </TabsTrigger>
          <TabsTrigger value="email" className="flex-1">
            邮箱
          </TabsTrigger>
          <TabsTrigger value="phone" className="flex-1">
            电话
          </TabsTrigger>
        </TabsList>
        <TabsContent value="username" className="mt-4">
          <div className="space-y-2">
            <Label htmlFor="login-username" className="text-sm font-medium">
              用户名
            </Label>
            <Input
              id="login-username"
              placeholder="请输入用户名"
              autoComplete="username"
              className="h-10"
              {...loginForm.register('username')}
            />
            {loginForm.formState.errors.username?.message ? (
              <p className="text-destructive text-xs">
                {loginForm.formState.errors.username.message}
              </p>
            ) : null}
          </div>
        </TabsContent>
        <TabsContent value="email" className="mt-4">
          <div className="space-y-2">
            <Label htmlFor="login-email" className="text-sm font-medium">
              邮箱
            </Label>
            <Input
              id="login-email"
              type="email"
              placeholder="请输入邮箱"
              autoComplete="email"
              className="h-10"
              {...loginForm.register('email')}
            />
            {loginForm.formState.errors.email?.message ? (
              <p className="text-destructive text-xs">{loginForm.formState.errors.email.message}</p>
            ) : null}
          </div>
        </TabsContent>
        <TabsContent value="phone" className="mt-4">
          <div className="space-y-2">
            <Label htmlFor="login-phone" className="text-sm font-medium">
              手机号
            </Label>
            <Input
              id="login-phone"
              placeholder="请输入手机号"
              autoComplete="tel"
              className="h-10"
              {...loginForm.register('phone')}
            />
            {loginForm.formState.errors.phone?.message ? (
              <p className="text-destructive text-xs">{loginForm.formState.errors.phone.message}</p>
            ) : null}
          </div>
        </TabsContent>
      </Tabs>

      {/* Form Fields Container (flex-1 to push content down) */}
      <div className="flex-1 space-y-4">
        {method === 'phone' ? (
          <div className="space-y-2">
            <Label htmlFor="login-code" className="text-sm font-medium">
              验证码
            </Label>
            <Input
              id="login-code"
              placeholder="请输入验证码"
              autoComplete="one-time-code"
              className="h-10"
              {...loginForm.register('code')}
            />
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="login-password" className="text-sm font-medium">
            密码
          </Label>
          <Input
            id="login-password"
            type="password"
            placeholder="请输入密码"
            autoComplete="current-password"
            className="h-10"
            {...loginForm.register('password')}
          />
          {loginForm.formState.errors.password?.message ? (
            <p className="text-destructive text-xs">
              {loginForm.formState.errors.password.message}
            </p>
          ) : null}
        </div>

        {errorInfo ? (
          <div className="border-destructive/20 bg-destructive/5 text-destructive flex items-start gap-2 rounded-lg border px-3 py-3 text-sm">
            <div className="flex-1">
              <div className="font-medium">{errorInfo.message}</div>
              {errorInfo.suggestRegister && onRequestRegister ? (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="text-destructive hover:text-destructive/80 mt-2 h-auto p-0"
                  onClick={onRequestRegister}
                >
                  去注册 →
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {/* Submit Button */}
      <Button type="submit" className="h-10 w-full" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? '登录中...' : '登录'}
      </Button>

      {/* Register Link */}
      {onRequestRegister ? (
        <div className="text-muted-foreground flex items-center justify-center gap-1 text-sm">
          <span>尚未认证？</span>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="text-primary hover:text-primary/80 h-auto p-0"
            onClick={onRequestRegister}
          >
            点击进入注册
          </Button>
        </div>
      ) : null}
    </form>
  );
}
