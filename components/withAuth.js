// components/withAuth.js
import { useMsal } from '@azure/msal-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const withAuth = (WrappedComponent) => {
  const ComponentWithAuth = (props) => {
    const { accounts } = useMsal();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
      setIsClient(true);
    }, []);

    useEffect(() => {
      if (isClient && (!accounts || accounts.length === 0)) {
        router.push('/login');
      }
    }, [accounts, isClient, router]);

    if (!isClient || !accounts || accounts.length === 0) {
      return null; // or a loading spinner
    }

    return <WrappedComponent {...props} />;
  };

  ComponentWithAuth.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return ComponentWithAuth;
};

export default withAuth;
