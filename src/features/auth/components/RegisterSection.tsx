import { isAxiosError } from 'axios';
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { studentVerify, registerUser, checkUsername } from '../api/register';
import uploadOssData from '@/components/api/oss/uploadOssData';

type RegisterSectionProps = {
  onRegisterSuccess?: (username: string, password: string) => void;
};

type RegisterStep = 'verify' | 'profile' | 'account';

type RegisterFormValues = {
  // Step 1: Student Verification
  realName: string;
  studentId: string;
  // Step 2: Profile
  username: string;
  avatarUrl: string;
  sexType: 'male' | 'female' | 'other' | '';
  bio: string;
  // Step 3: Account
  password: string;
  confirmPassword: string;
  phone: string;
  email: string;
};

type StepErrorInfo = {
  message: string;
};

const DEFAULT_VALUES: RegisterFormValues = {
  realName: '',
  studentId: '',
  username: '',
  avatarUrl: '',
  sexType: '',
  bio: '',
  password: '',
  confirmPassword: '',
  phone: '',
  email: '',
};

const getErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    return error.response?.data?.message || error.message || '出错了，请重试';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return '出错了，请重试';
};

type UsernameCheckStatus = 'idle' | 'checking' | 'available' | 'unavailable';

export default function RegisterSection({ onRegisterSuccess }: RegisterSectionProps) {
  const [currentStep, setCurrentStep] = useState<RegisterStep>('verify');
  const [stepError, setStepError] = useState<StepErrorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [usernameCheckStatus, setUsernameCheckStatus] = useState<UsernameCheckStatus>('idle');
  const [usernameCheckMessage, setUsernameCheckMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarFileRef = useRef<File | null>(null);

  const registerForm = useForm<RegisterFormValues>({
    defaultValues: DEFAULT_VALUES,
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      avatarFileRef.current = file;
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleUsernameBlur = async () => {
    const username = registerForm.getValues('username').trim();

    // Only check if username is not empty
    if (!username) {
      setUsernameCheckStatus('idle');
      setUsernameCheckMessage('');
      return;
    }

    setUsernameCheckStatus('checking');
    setUsernameCheckMessage('');

    try {
      const response = await checkUsername(username);

      if (response.code === 0) {
        setUsernameCheckStatus('available');
        setUsernameCheckMessage('用户名可用');
      } else if (response.code === 406) {
        setUsernameCheckStatus('unavailable');
        setUsernameCheckMessage('用户名已被注册');
      } else {
        setUsernameCheckStatus('unavailable');
        setUsernameCheckMessage(response.message || '用户名检查失败');
      }
    } catch (error) {
      setUsernameCheckStatus('unavailable');
      setUsernameCheckMessage(getErrorMessage(error));
    }
  };

  const handleNextStep = async () => {
    setStepError(null);

    if (currentStep === 'verify') {
      // Validate step 1
      const isValid = await registerForm.trigger(['realName', 'studentId']);
      if (!isValid) return;

      const realName = registerForm.getValues('realName').trim();
      const studentId = registerForm.getValues('studentId').trim();

      if (!realName || !studentId) {
        setStepError({ message: '请填写所有字段' });
        return;
      }

      // Call student verify API
      setIsLoading(true);
      try {
        await studentVerify({ realName, studentId });
        setCurrentStep('profile');
      } catch (error) {
        setStepError({ message: getErrorMessage(error) });
      } finally {
        setIsLoading(false);
      }
    } else if (currentStep === 'profile') {
      // Validate step 2
      const isValid = await registerForm.trigger(['username', 'sexType', 'bio']);
      if (!isValid) return;

      const username = registerForm.getValues('username').trim();
      if (!username) {
        setStepError({ message: '请输入用户名' });
        return;
      }

      // Check username availability before proceeding
      if (usernameCheckStatus === 'unavailable') {
        setStepError({ message: '用户名已被注册，请更换' });
        return;
      }

      if (usernameCheckStatus === 'idle' || usernameCheckStatus === 'checking') {
        setStepError({ message: '请验证用户名可用性后再继续' });
        return;
      }

      setCurrentStep('account');
    } else if (currentStep === 'account') {
      // Validate step 3
      const isValid = await registerForm.trigger(['password', 'confirmPassword', 'email']);
      if (!isValid) return;

      const password = registerForm.getValues('password').trim();
      const confirmPassword = registerForm.getValues('confirmPassword').trim();
      const email = registerForm.getValues('email').trim();

      if (!password || !confirmPassword || !email) {
        setStepError({ message: '请填写所有必填字段' });
        return;
      }

      if (password !== confirmPassword) {
        setStepError({ message: '两次密码输入不一致' });
        return;
      }

      // Call register API
      setIsLoading(true);

      // OSS Upload
      try {
        if (avatarFileRef.current) {
          const { key } = await uploadOssData(avatarFileRef.current, '/avatar');
          registerForm.setValue('avatarUrl', key);
        }
      } catch (error) {
        setStepError({ message: '头像上传失败，请重试' });
        setIsLoading(false);
        return;
      }

      try {
        const formValues = registerForm.getValues();
        await registerUser({
          realName: formValues.realName,
          studentId: formValues.studentId,
          username: formValues.username,
          avatarUrl: formValues.avatarUrl || undefined,
          sexType: formValues.sexType as 'male' | 'female' | 'other',
          bio: formValues.bio || undefined,
          email: formValues.email,
          phone: formValues.phone || undefined,
          password: formValues.password,
        });

        // Registration successful, callback to parent
        onRegisterSuccess?.(formValues.username, formValues.password);
      } catch (error) {
        setStepError({ message: getErrorMessage(error) });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 'profile') {
      setCurrentStep('verify');
    } else if (currentStep === 'account') {
      setCurrentStep('profile');
    }
    setStepError(null);
  };

  const handleBack = () => {
    setCurrentStep('verify');
    registerForm.reset(DEFAULT_VALUES);
    setStepError(null);
  };

  return (
    <div className="flex min-h-[420px] flex-col gap-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              currentStep === 'verify'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            1
          </div>
          <div
            className={`flex-1 border-b-2 transition-colors ${
              currentStep === 'profile' ? 'border-primary' : 'border-muted'
            }`}
          ></div>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              currentStep === 'profile'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            2
          </div>
          <div
            className={`flex-1 border-b-2 transition-colors ${
              currentStep === 'account' ? 'border-primary' : 'border-muted'
            }`}
          ></div>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              currentStep === 'account'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            3
          </div>
        </div>
      </div>

      {/* Step Labels */}
      <div className="text-muted-foreground flex justify-between text-xs">
        <span>学号认证</span>
        <span>个人信息</span>
        <span>账户设置</span>
      </div>

      {/* Form Container */}
      <form className="flex-1 space-y-4">
        {/* Step 1: Student Verification */}
        {currentStep === 'verify' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="realName" className="text-sm font-medium">
                真实姓名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="realName"
                placeholder="请输入真实姓名"
                className="h-10"
                {...registerForm.register('realName', {
                  required: '请输入真实姓名',
                })}
              />
              {registerForm.formState.errors.realName?.message ? (
                <p className="text-destructive text-xs">
                  {registerForm.formState.errors.realName.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentId" className="text-sm font-medium">
                学号 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="studentId"
                placeholder="请输入学号"
                className="h-10"
                {...registerForm.register('studentId', {
                  required: '请输入学号',
                })}
              />
              {registerForm.formState.errors.studentId?.message ? (
                <p className="text-destructive text-xs">
                  {registerForm.formState.errors.studentId.message}
                </p>
              ) : null}
            </div>
          </div>
        )}

        {/* Step 2: Profile Information */}
        {currentStep === 'profile' && (
          <div className="space-y-4">
            {/* Profile Card */}
            <div className="bg-card rounded-xl border border-transparent p-6 shadow-sm">
              {/* Top Section: Avatar + Username & Gender */}
              <div className="mb-6 flex gap-6">
                {/* Left: Avatar */}
                <div className="flex flex-col items-center">
                  <div
                    onClick={handleAvatarClick}
                    className="border-input bg-muted hover:border-primary hover:bg-muted/80 relative flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed transition-colors"
                  >
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <svg
                          className="text-muted-foreground h-8 w-8"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Username & Gender */}
                <div className="flex-1 space-y-4">
                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium">
                      用户名 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="username"
                      placeholder="请输入用户名"
                      className={`h-10 ${
                        registerForm.formState.errors.username
                          ? 'border-destructive focus-visible:ring-destructive'
                          : usernameCheckStatus === 'available'
                            ? 'border-green-500 focus-visible:ring-green-500'
                            : usernameCheckStatus === 'unavailable'
                              ? 'border-destructive focus-visible:ring-destructive'
                              : ''
                      }`}
                      {...registerForm.register('username', {
                        required: '请输入用户名',
                      })}
                      onBlur={handleUsernameBlur}
                    />
                    {usernameCheckStatus === 'available' ? (
                      <p className="text-xs text-green-600">{usernameCheckMessage}</p>
                    ) : usernameCheckStatus === 'unavailable' ? (
                      <p className="text-xs font-medium text-red-600">{usernameCheckMessage}</p>
                    ) : null}
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <Label htmlFor="sexType" className="text-sm font-medium">
                      性别 <span className="text-destructive">*</span>
                    </Label>
                    <select
                      id="sexType"
                      className={`bg-background focus-visible:ring-ring flex h-10 w-full rounded-lg border px-3 py-2 text-sm transition-colors outline-none focus-visible:ring-2 ${
                        registerForm.formState.errors.sexType
                          ? 'border-destructive focus-visible:ring-destructive'
                          : 'border-input'
                      }`}
                      {...registerForm.register('sexType', {
                        required: '请选择性别',
                      })}
                    >
                      <option value="">请选择性别</option>
                      <option value="male">男</option>
                      <option value="female">女</option>
                      <option value="other">其他</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bottom: Bio */}
              <div className="border-input space-y-2 border-t pt-6">
                <Label htmlFor="bio" className="text-sm font-medium">
                  个人简介
                </Label>
                <textarea
                  id="bio"
                  placeholder="请输入个人简介（可选）"
                  className="border-input bg-background focus-visible:ring-ring flex min-h-24 w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-2"
                  {...registerForm.register('bio')}
                />
              </div>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        )}

        {/* Step 3: Account Setup */}
        {currentStep === 'account' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                邮箱 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="请输入邮箱"
                className="h-10"
                {...registerForm.register('email', {
                  required: '请输入邮箱',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: '请输入有效的邮箱地址',
                  },
                })}
              />
              {registerForm.formState.errors.email?.message ? (
                <p className="text-destructive text-xs">
                  {registerForm.formState.errors.email.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                电话号码
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="请输入电话号码（可选）"
                className="h-10"
                {...registerForm.register('phone')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                密码 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="请输入密码"
                className="h-10"
                {...registerForm.register('password', {
                  required: '请输入密码',
                  minLength: {
                    value: 6,
                    message: '密码至少 6 个字符',
                  },
                })}
              />
              {registerForm.formState.errors.password?.message ? (
                <p className="text-destructive text-xs">
                  {registerForm.formState.errors.password.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                确认密码 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                className="h-10"
                {...registerForm.register('confirmPassword', {
                  required: '请确认密码',
                })}
              />
              {registerForm.formState.errors.confirmPassword?.message ? (
                <p className="text-destructive text-xs">
                  {registerForm.formState.errors.confirmPassword.message}
                </p>
              ) : null}
            </div>
          </div>
        )}

        {/* Error Message */}
        {stepError ? (
          <div className="border-destructive/20 bg-destructive/5 text-destructive flex items-start gap-2 rounded-lg border px-3 py-3 text-sm">
            <div className="flex-1">
              <div className="font-medium">{stepError.message}</div>
            </div>
          </div>
        ) : null}
      </form>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {currentStep !== 'verify' ? (
          <Button
            type="button"
            variant="outline"
            className="h-10 flex-1"
            onClick={handlePrevStep}
            disabled={isLoading}
          >
            上一步
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="h-10 flex-1"
            onClick={handleBack}
            disabled={isLoading}
          >
            取消
          </Button>
        )}

        <Button type="button" className="h-10 flex-1" onClick={handleNextStep} disabled={isLoading}>
          {isLoading ? '加载中...' : currentStep === 'account' ? '完成注册' : '下一步'}
        </Button>
      </div>
    </div>
  );
}
