'use client';
import { useCashflow } from '@/context/CashflowContext';
import { Package, Receipt, TrendingUp, LineChart } from 'lucide-react';
import Link from 'next/link';
import EconomicIndicators from '@/components/EconomicIndicators/EconomicIndicators';

export default function DashboardPage() {
  const { products, costs, simulations } = useCashflow();

  // Basic Metrics
  const activeProducts = products.length;
  const totalMonthlyCosts = costs.filter(c => c.type === 'fixed' && c.frequency === 'monthly').reduce((acc, curr) => acc + curr.amount, 0);
  const totalSimulations = simulations.length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)' }}>Bienvenido, Mi PYME S.A.</h2>
        <p style={{ color: 'var(--secondary-foreground)', marginTop: '0.25rem', marginBottom: '2rem' }}>
          Este es tu panel de control principal para gestionar la liquidez de tu negocio.
        </p>
      </div>

      <EconomicIndicators />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem'
      }}>
        <div className="glass" style={{
          padding: '1.5rem', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '1rem',
          backgroundColor: 'var(--card-bg)', boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)' }}>
            <Package size={24} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--foreground)' }}>Catálogo</h3>
          </div>
          <p style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{activeProducts}</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--secondary-foreground)' }}>Productos y servicios activos</p>
        </div>

        <div className="glass" style={{
          padding: '1.5rem', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '1rem',
          backgroundColor: 'var(--card-bg)', boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--danger)' }}>
            <Receipt size={24} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--foreground)' }}>Burn Rate Mensual</h3>
          </div>
          <p style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
            ${(totalMonthlyCosts/1000).toFixed(1)}k
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--secondary-foreground)' }}>Gastos fijos requeridos por mes</p>
        </div>

        <div className="glass" style={{
          padding: '1.5rem', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '1rem',
          backgroundColor: 'var(--card-bg)', boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--success)' }}>
            <TrendingUp size={24} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--foreground)' }}>Previsiones</h3>
          </div>
          <p style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{totalSimulations}</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--secondary-foreground)' }}>Puntos de datos simulados</p>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>Accesos Rápidos</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          
          <Link href="/productos" style={{
            padding: '1.5rem', backgroundColor: 'var(--secondary)', borderRadius: 'var(--radius-md)',
            transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', gap: '1rem'
          }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%' }}>
              <Package size={20} />
            </div>
            <div>
              <h4 style={{ fontWeight: 600 }}>Cargar Productos</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--secondary-foreground)' }}>Define tus precios y costos unitarios</p>
            </div>
          </Link>

          <Link href="/proyecciones" style={{
            padding: '1.5rem', backgroundColor: 'var(--secondary)', borderRadius: 'var(--radius-md)',
            transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', gap: '1rem'
          }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--accent)', color: 'white', borderRadius: '50%' }}>
              <LineChart size={20} />
            </div>
            <div>
              <h4 style={{ fontWeight: 600 }}>Ver Proyecciones</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--secondary-foreground)' }}>Analiza los escenarios optimistas y pesimistas</p>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}
