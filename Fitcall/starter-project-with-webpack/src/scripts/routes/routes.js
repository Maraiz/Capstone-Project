import HomePage from '../pages/home/home-page';
import LandingPage from '../pages/home/landing-page';
import LoginPage from '../pages/Auth/login-page';
import RegisterPage from '../pages/Auth/register/register-page';

const routes = {
  '/': new LandingPage(), // Landing page sebagai home
  '/home': new HomePage(), // Original home page
  '/landing': new LandingPage(), // Alias
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
};

export default routes;