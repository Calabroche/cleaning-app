export function SignOutButton() {
  return (
    <form action="/auth/signout" method="post">
      <button
        type="submit"
        className="text-sm font-medium text-neutral-400 hover:text-neutral-700"
      >
        Déconnexion
      </button>
    </form>
  );
}
