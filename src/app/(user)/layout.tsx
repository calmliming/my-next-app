import UserNav from '@/components/layout/UserNav';

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <UserNav />
    </>
  );
}
