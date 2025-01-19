'use client';

import { useState } from 'react';
import Loading from "./loading/loading";
import Dashboard from "./dashboard/dashboard";

export default function Home() {
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);

  return (
    <>
      <Loading onLoadingComplete={() => setIsLoadingComplete(true)} />
      {isLoadingComplete && <Dashboard />}
    </>
  );
}
