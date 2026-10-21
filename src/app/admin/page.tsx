import { redirect } from 'next/navigation';

export default function AdminRootRedirect() {
  redirect('/terminal/admin');
}
