import styles from './Countdown.module.css';

/** "In 5 days", "Was due 2 months ago"... */
export function Countdown({ text, large = false }: { text: string; large?: boolean }) {
  return <span className={large ? `${styles.countdown} ${styles.large}` : styles.countdown}>{text}</span>;
}
