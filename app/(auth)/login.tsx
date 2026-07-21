import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, LogIn, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import { loginSchema, type LoginFormValues } from '@/schemas/authSchemas';
import type { NormalizedApiError } from '@/types/api';

export default function LoginScreen() {
  const theme = useTheme();
  const { login, isLoggingIn } = useAuth();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    resetField,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      await login(values.email, values.password);
      // Navigasi ditangani otomatis oleh guard di app/(auth)/_layout.tsx
      // begitu isAuthenticated menjadi true.
    } catch (error) {
      const apiError = error as NormalizedApiError;
      setFormError(apiError.message ?? 'Login gagal. Silakan coba lagi.');
      // Jangan pernah menyimpan/mengingat password — kosongkan setelah gagal.
      resetField('password');
    }
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.select({ ios: 24, default: 0 })}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Masuk</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Masuk dengan akun sekolah Anda untuk melanjutkan.
          </Text>

          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              render={({ field: { value, onChange, onBlur } }) => (
                <AppInput
                  label="Email"
                  icon={Mail}
                  placeholder="nama@sekolah.test"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  editable={!isLoggingIn}
                  returnKeyType="next"
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { value, onChange, onBlur } }) => (
                <AppInput
                  label="Password"
                  icon={Lock}
                  placeholder="Kata sandi"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  secureTextEntry={!isPasswordVisible}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  textContentType="password"
                  editable={!isLoggingIn}
                  returnKeyType="done"
                  onSubmitEditing={onSubmit}
                  rightElement={
                    <Pressable
                      onPress={() => setIsPasswordVisible((visible) => !visible)}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={
                        isPasswordVisible ? 'Sembunyikan password' : 'Tampilkan password'
                      }>
                      <Text style={[styles.toggleText, { color: theme.primary }]}>
                        {isPasswordVisible ? 'Sembunyikan' : 'Lihat'}
                      </Text>
                    </Pressable>
                  }
                />
              )}
            />

            {formError ? (
              <View style={[styles.formErrorBox, { borderColor: theme.danger }]}>
                <Text style={[styles.formErrorText, { color: theme.danger }]}>{formError}</Text>
              </View>
            ) : null}

            <AppButton title="Masuk" icon={LogIn} onPress={onSubmit} loading={isLoggingIn} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
  },
  form: {
    gap: Spacing.md,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: Spacing.xs,
  },
  formErrorBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: Spacing.sm,
  },
  formErrorText: {
    fontSize: 13,
  },
});
