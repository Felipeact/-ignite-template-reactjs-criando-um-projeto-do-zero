/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import Image from 'next/image';

import styles from './header.module.scss'

export default function Header() {
  return (
    <div className={styles.header}>
      <a href="/">
        <Image src="/images/logo.svg" alt="logo" width="300" height="100" />
      </a>
    </div>
  );
}
