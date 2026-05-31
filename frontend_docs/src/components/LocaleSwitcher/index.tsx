import type {ReactNode} from 'react';
import {useEffect, useRef, useState} from 'react';
import clsx from 'clsx';
import type {HomeLocale} from '@site/src/data/homeContent';
import styles from './styles.module.css';

const LOCALES = [
  {code: 'zh' as const, name: '中文', flag: '🇨🇳'},
  {code: 'en' as const, name: 'English', flag: '🇺🇸'},
];

type Props = {
  locale: HomeLocale;
  onChange: (locale: HomeLocale) => void;
};

export default function LocaleSwitcher({locale, onChange}: Props): ReactNode {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className={styles.root} ref={ref}>
      <button
        type="button"
        className={styles.trigger}
        title={current.name}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}>
        <span className={styles.flag}>{current.flag}</span>
        <span className={styles.code}>{current.code.toUpperCase()}</span>
        <svg
          className={clsx(styles.chevron, isOpen && styles.chevronOpen)}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {isOpen && (
        <div className={styles.menu}>
          {LOCALES.map((item) => (
            <button
              key={item.code}
              type="button"
              className={clsx(styles.option, item.code === locale && styles.optionActive)}
              onClick={() => {
                onChange(item.code);
                setIsOpen(false);
              }}>
              <span className={styles.flag}>{item.flag}</span>
              <span>{item.name}</span>
              {item.code === locale && (
                <svg className={styles.check} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
