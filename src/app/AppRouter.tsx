import React from 'react';
import Link from 'next/link';

const AppRouter: React.FC = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link href="/">
            Home
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default AppRouter;
