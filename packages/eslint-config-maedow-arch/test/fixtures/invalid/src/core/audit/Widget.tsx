// MA-004 : du JSX dans core/. Aucun import de React n'est nécessaire, le
// runtime JSX automatique s'en charge : c'est ce qui rendait cette violation
// invisible à toute règle portant sur les imports.
export function Widget() {
  return <div>Un écran n'a rien à faire dans le domaine.</div>;
}
