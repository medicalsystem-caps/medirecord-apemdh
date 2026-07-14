'use server';

import { login, logout, getCurrentUser, changePassword } from '@/lib/services/auth';
import { User } from '@/lib/types';

export async function loginAction(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const user = await login(email, password);
    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message || 'Login failed.' };
  }
}

export async function logoutAction(): Promise<{ success: boolean }> {
  await logout();
  return { success: true };
}

export async function getCurrentUserAction(): Promise<User | null> {
  return await getCurrentUser();
}

export async function changePasswordAction(oldPassword?: string, newPassword?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error('Unauthorized');
    }
    await changePassword(currentUser.id, oldPassword, newPassword);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to change password.' };
  }
}
