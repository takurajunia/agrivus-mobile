import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const hasInternet = state.isInternetReachable;
      const connected = state.isConnected;
      const online = hasInternet === false ? false : !!connected;
      setIsOnline(online);
    });

    return () => unsubscribe();
  }, []);

  return { isOnline };
};
