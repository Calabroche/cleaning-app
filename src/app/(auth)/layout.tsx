export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="safe-area-screen flex min-h-screen items-center justify-center bg-app-bg px-4 text-app-ink">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <div className="size-16 rounded-tile bg-accent shadow-soft" />
        </div>
        <h1 className="mb-2 text-center text-[25px] font-semibold tracking-tight">
          Cleaning App
        </h1>
        {children}
      </div>
    </div>
  );
}
