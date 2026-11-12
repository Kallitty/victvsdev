import Navigation from "./Navigation";

export default function Header() {
  return (
    <header className="Header">
      <div>
        <h1>VICTVS</h1> <br />
        <span>Exam Scheduler</span>
      </div>

      <Navigation />
    </header>
  );
}
