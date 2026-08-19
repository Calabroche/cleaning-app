export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-app-bg px-4 text-app-ink">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-[25px] font-semibold tracking-tight">
          Cleaning App
        </h1>
        {children}
      </div>
    </div>
  );
}
