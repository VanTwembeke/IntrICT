import type { Metadata } from 'next';
import LoginClient from './LoginClient';

export const metadata: Metadata = {
  title: 'Inloggen',
  description: 'Log in op uw IntrICT-account.',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <LoginClient />;
}
