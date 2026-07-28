import Link from "next/link";

type AuthPageProps = {
  children?: React.ReactNode;
  configured: boolean;
  eyebrow: string;
  heading: string;
};

export function AuthPage({
  children,
  configured,
  eyebrow,
  heading,
}: AuthPageProps) {
  return (
    <div className="auth-page">
      <section className="auth-introduction" aria-labelledby="auth-heading">
        <p className="eyebrow eyebrow-light">{eyebrow}</p>
        <h1 id="auth-heading">{heading}</h1>
        <p>
          Keep your lesson path, saved phrases, and review rhythm together in
          one quiet place.
        </p>
        <Link className="text-link-light" href="/">
          Return home
        </Link>
      </section>
      <div className="auth-panel">
        {configured ? (
          children
        ) : (
          <div className="configuration-note" role="status">
            <p className="eyebrow">Local setup</p>
            <h2>Authentication is ready to connect</h2>
            <p>
              Add both Clerk keys from <code>.env.example</code> to enable this
              account flow. The rest of the app remains available without keys.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
