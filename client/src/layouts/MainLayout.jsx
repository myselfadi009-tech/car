import { Outlet } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar.jsx';
import Footer from '../components/footer/Footer.jsx';

export default function MainLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
