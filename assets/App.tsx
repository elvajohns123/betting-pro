
import { paths } from 'src/routes/paths';
import Box, { BoxProps } from '@mui/material/Box';
// i18n
import 'src/locales/i18n';

// scrollbar
import 'simplebar-react/dist/simplebar.min.css';

// lightbox
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';

// carousel
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// image
import 'react-lazy-load-image-component/src/effects/blur.css';

import 'src/assets/css/main.css';
import 'src/assets/scss/sportsicon.scss';

// ----------------------------------------------------------------------
import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router';
import { Toaster } from 'react-hot-toast';
import DisableDevtool from 'disable-devtool';
// routes
import Router from 'src/routes/sections';
// theme
import ThemeProvider from 'src/theme';
// locales
import { LocalizationProvider } from 'src/locales';
// hooks
import { useScrollToTop } from 'src/hooks/use-scroll-to-top';
import SnackbarProvider from 'src/components/snackbar/snackbar-provider';
// store
import { useDispatch, useSelector } from 'src/store';
import { ChangePage } from 'src/store/reducers/menu';
import { SetBetsId, SetClickId, SetCode } from 'src/store/reducers/auth';

// components
import ProgressBar from 'src/components/progress-bar';
import { MotionLazy } from 'src/components/animate/motion-lazy';
import { SettingsProvider, SettingsDrawer } from 'src/components/settings';
import { ApiProvider } from 'src/contexts/ApiContext';
import { AuthConsumer } from 'src/utils/authcheck';
import { authenticateSockets, sockets } from 'src/utils/socket';
import axios from 'src/utils/axios';
import { API_PATH } from './config-global';

// ----------------------------------------------------------------------

export default function App() {
  useScrollToTop();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { isLoggedIn, token, user } = useSelector((store) => store.auth);


  // const trackCurrentPage = async (userId: string, currentPage: string) => {
  //   try {
  //     const response = await axios.post(API_PATH.TRACK_VISIT_PAGE, {
  //       userId,
  //       currentPage,
  //     }, {
  //       timeout: 5000,
  //     });
  //   } catch (error) {
  //     console.error('Error tracking current page:', error.message);
  //   }
  // };


  const openSms = async (id: string) => {
    await axios.post(API_PATH.OPEN_SMS, { id });
  };

  // useEffect(() => {
  //   let timeInterval: NodeJS.Timeout | undefined;
  //   let dailyCheckInterval: NodeJS.Timeout | undefined;
  
  //   if (isLoggedIn && user?._id) {
  //     timeInterval = setInterval(() => {
  //       timeSpentRef.current += 1;
  //       if (timeSpentRef.current % 5 === 0) {
  //         checkBackendResponse(user._id, timeSpentRef.current);
  //       }
  //     }, 1000);
  
  //     dailyCheckInterval = setInterval(() => {
  //       resetDailyTimer();
  //     }, 60000);
  //   }
  
  //   return () => {
  //     if (timeInterval) clearInterval(timeInterval);
  //     if (dailyCheckInterval) clearInterval(dailyCheckInterval);
  //     if (user?._id && timeSpentRef.current > 0) {
  //       checkBackendResponse(user._id, timeSpentRef.current);
  //     }
  //     timeSpentRef.current = 0;
  //     lastResetRef.current = Date.now();
  //     console.log('Timer reset due to logout or tab close');
  //   };
  // }, [isLoggedIn, user?._id]);




  
  // useEffect(() => {
  //   if (isLoggedIn && user?._id) {
  //     trackCurrentPage(user._id, pathname);
  //   }
  // }, [isLoggedIn, user?._id, pathname]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!isLoggedIn) {
      const c: any = params.get('c');
      if (c) {
        dispatch(SetCode(c));
        dispatch(ChangePage('register'));
        return;
      }

      const signup: any = params.get('sign');
      if (signup) {
        dispatch(ChangePage('register'));
        return;
      }
    }

    const b: any = params.get('b');
    if (b) {
      dispatch(SetBetsId(b));
      dispatch(ChangePage('bets'));
    }

    const sms: any = params.get('sms');
    if (sms)
      openSms(sms);

    // affiliate
    const clickid: any = params.get('clickid');
    if (clickid) {
      dispatch(SetClickId(clickid));
    }
  }, [pathname, isLoggedIn, dispatch]);

  /* eslint-disable */
  useEffect(() => {
    if (!sockets.length) return;
    console.log(sockets);

    sockets.forEach((socket, index) => {
      socket.on('connect', () => {
        console.log('Socket server connected...', index);
      });

      socket.on('disconnect', () => {
        console.log('Socket server disconnected from client', index);
      });
    });

    return () => {
      sockets.forEach((socket) =>
        socket.close()
      );
    };
  }, [sockets]);

  useEffect(() => {
    if (isLoggedIn && token) authenticateSockets(token);
  }, [isLoggedIn, token]);

  const link = location.origin;
  const isDevLink = link.includes("http://");
  // if (!isDevLink) DisableDevtool();

  /* eslint-enable */

  return (
    <Box sx={{ backgroundColor: '#040807', minHeight: '100vh' }}>
      <LocalizationProvider>
        <SettingsProvider
          defaultSettings={{
            themeMode: 'dark',
            themeDirection: 'ltr',
            themeContrast: 'default',
            themeLayout: 'vertical',
            themeColorPresets: 'default',
            themeStretch: false,
          }}
        >
          <ThemeProvider>
            <MotionLazy>
              <SnackbarProvider>
                <SettingsDrawer />
                <ProgressBar />
                <ApiProvider>
                  <AuthConsumer>
                    <Router />
                  </AuthConsumer>
                </ApiProvider>
              </SnackbarProvider>
            </MotionLazy>
          </ThemeProvider>
          <Toaster
            position="top-center"
            reverseOrder={false}
          />
        </SettingsProvider>
      </LocalizationProvider>
    </Box>
  );
}