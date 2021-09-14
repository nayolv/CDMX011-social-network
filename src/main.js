/* eslint-disable no-console */
import { Login } from './components/Login.js';
import { Home } from './components/Home.js';
import { Register } from './components/Register.js';
import { render } from './utils.js';

const routes = {
  '/': Login,
  '/wall': Home,
  '/register': Register,
};

const dispatchRoute = (pathname = '/') => {
  const root = document.getElementById('root');
  const component = routes[pathname];
  render(root, component());
};

export const onNavigate = (pathname) => {
  window.history.pushState(
    {}, // estado
    pathname, // title
    window.location.origin + pathname, // url
  );
  dispatchRoute(pathname);
};

firebase.auth().onAuthStateChanged((user) => {
  let pathname = window.location.pathname;
  if (user) {
    if (pathname === '/' || pathname === '/register') {
      pathname = '/wall';
    }
  } else {
    pathname = '/';
  }
  onNavigate(pathname);
});

/*
window.addEventListener('popstate', () => {
  dispatchRoute(window.location.pathname);
});
*/
window.onpopstate = (() => {
  dispatchRoute(window.location.pathname);
});
