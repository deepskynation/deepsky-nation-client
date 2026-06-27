import { useEffect, useState } from "react";

/** True only after the client has mounted — keeps SSR and hydration markup aligned. */
export function useClientMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
