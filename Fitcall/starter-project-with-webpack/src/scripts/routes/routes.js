import HomePage from '../pages/home/home-page.js';
import LandingPage from '../pages/home/landing-page.js';
import LoginPage from '../pages/Auth/login/login-page.js';
import RegisterPage from '../pages/Auth/register/register-page.js';

const routes = {
  '/': new LandingPage(),
  '/home': new HomePage(),
  '/landing': new LandingPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  // Tambahkan route untuk handle query parameter
  '/register?step=1': new RegisterPage(),
  '/register?step=2': new RegisterPage(),
};

export default routes;