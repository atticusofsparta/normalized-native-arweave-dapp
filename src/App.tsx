import { wrapCreateBrowserRouter } from '@sentry/react';
import React, { Suspense, useEffect, useState } from 'react';
import {
  Route,
  RouterProvider,
  createHashRouter,
  createRoutesFromElements,
} from 'react-router-dom';

import { LoadingScreen } from './components/LoadingScreen';
import AppRouterLayout from './components/layout/AppRouterLayout';
import NotFound from './pages/NotFound';

const Home = React.lazy(() => import('./pages/Home'));

const sentryCreateBrowserRouter = wrapCreateBrowserRouter(createHashRouter);

// Wrapper to enforce minimum loading time
function DelayedHome() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 3000); // 3 second minimum

    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return <Home />;
}

function App() {
  const router = sentryCreateBrowserRouter(
    createRoutesFromElements(
      <Route element={<AppRouterLayout />} errorElement={<NotFound />}>
        <Route
          index
          element={
            <Suspense fallback={<LoadingScreen />}>
              <DelayedHome />
            </Suspense>
          }
        />
      </Route>,
    ),
  );

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
