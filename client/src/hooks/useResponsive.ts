import { useState, useEffect } from 'react';

export interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isSmallScreen: boolean;
  isMediumScreen: boolean;
  isLargeScreen: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

export const useResponsive = (): ResponsiveState => {
  const [responsiveState, setResponsiveState] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isSmallScreen: false,
    isMediumScreen: false,
    isLargeScreen: false,
    screenWidth: 0,
    screenHeight: 0,
    orientation: 'portrait',
    deviceType: 'desktop'
  });

  useEffect(() => {
    const updateResponsiveState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Device type detection
      const isMobile = width <= 768;
      const isTablet = width > 768 && width <= 1024;
      const isDesktop = width > 1024;
      
      // Screen size detection
      const isSmallScreen = width <= 640;
      const isMediumScreen = width > 640 && width <= 1024;
      const isLargeScreen = width > 1024;
      
      // Orientation detection
      const orientation = width > height ? 'landscape' : 'portrait';
      
      // Device type determination
      let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
      if (isMobile) deviceType = 'mobile';
      else if (isTablet) deviceType = 'tablet';
      else deviceType = 'desktop';

      setResponsiveState({
        isMobile,
        isTablet,
        isDesktop,
        isSmallScreen,
        isMediumScreen,
        isLargeScreen,
        screenWidth: width,
        screenHeight: height,
        orientation,
        deviceType
      });
    };

    // Initial call
    updateResponsiveState();

    // Add event listeners
    window.addEventListener('resize', updateResponsiveState);
    window.addEventListener('orientationchange', updateResponsiveState);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateResponsiveState);
      window.removeEventListener('orientationchange', updateResponsiveState);
    };
  }, []);

  return responsiveState;
};
