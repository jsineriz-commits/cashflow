'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Receipt, 
  TrendingUp, 
  LineChart,
  Settings
} from 'lucide-react';
import styles from './Sidebar.module.css';

const menuItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/productos', icon: Package, label: 'Catálogo y Precios' },
  { href: '/costos', icon: Receipt, label: 'Costos y Egresos' },
  { href: '/simulador', icon: TrendingUp, label: 'Simulador de Ventas' },
  { href: '/proyecciones', icon: LineChart, label: 'Proyecciones y Escenarios' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <div className={styles.logoIcon}>
          <LineChart size={32} />
        </div>
        <div className={styles.logoText}>Cashflow</div>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            >
              <Icon className={styles.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <div className={styles.avatar}>PY</div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>Mi PYME S.A.</span>
          <span className={styles.userRole}>Plan Premium</span>
        </div>
      </div>
    </aside>
  );
}
