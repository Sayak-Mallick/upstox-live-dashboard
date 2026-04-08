export default function Layout({ children }) {
  return (
    <div className="app">
      <header>Market Dashboard</header>
      <main>{children}</main>
    </div>
  );
}
