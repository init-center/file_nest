export default function AppsLayout({
  children,
  intercept_new,
}: {
  children: React.ReactNode;
  intercept_new: React.ReactNode;
}) {
  return (
    <>
      {children}
      {intercept_new}
    </>
  );
}
