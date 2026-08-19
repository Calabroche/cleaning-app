export function SignOutButton() {
  return (
    <form action="/auth/signout" method="post">
      <button
        type="submit"
        className="rounded-lg bg-adm-raised px-3 py-1.5 text-[12px] font-semibold text-adm-ink hover:bg-adm-hover"
      >
        Déconnexion
      </button>
    </form>
  );
}
