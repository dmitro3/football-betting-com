import { lazy } from 'react';

import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';

const SportsPage = Loadable(lazy(() => import('views/sports')));
// const InplayPage = Loadable(lazy(() => import('views/sports/inplay')));
// const UpcomingPage = Loadable(lazy(() => import('views/sports/upcoming')));
// const EventsPage = Loadable(lazy(() => import('views/sports/events')));
const BetsPage = Loadable(lazy(() => import('views/sports/bets')));

const MainRoutes = {
    path: '/',
    element: <MainLayout />,
    children: [
        {
            path: '/',
            element: <SportsPage />
        },
        {
            path: '/:sportsId',
            element: <SportsPage />
        },
        {
            path: '/:sportsId/:tabId',
            element: <SportsPage />
        },
        // {
        //     path: '/sports',
        //     element: <SportsPage />
        // },
        // {
        //     path: '/sports/:sportsId',
        //     element: <SportsPage />
        // },
        // {
        //     path: '/sports/:sportsId/:tabId',
        //     element: <SportsPage />
        // },
        // {
        //     path: '/inplay',
        //     element: <InplayPage />
        // },
        // {
        //     path: '/inplay/:sportsId',
        //     element: <InplayPage />
        // },
        // {
        //     path: '/upcoming',
        //     element: <UpcomingPage />
        // },
        // {
        //     path: '/upcoming/:sportsId',
        //     element: <UpcomingPage />
        // },
        // {
        //     path: '/events/:id',
        //     element: <EventsPage />
        // },
        {
            path: '/bets/:id',
            element: <BetsPage />
        }
    ]
};

export default MainRoutes;
