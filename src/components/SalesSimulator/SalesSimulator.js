'use client';
import { useState, useMemo } from 'react';
import { useCashflow } from '@/context/CashflowContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import styles from './SalesSimulator.module.css';
import { Target, X } from 'lucide-react';

export default function SalesSimulator() {
  const { products, simulations, setSimulations } = useCashflow();
  
  // Default to current year-month
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [formData, setFormData] = useState({ productId: '', month: currentMonth, volume: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.productId || !formData.month || !formData.volume) return;

    // Remove existing entry for same product+month if exists, then add new
    setSimulations(prev => {
      const filtered = prev.filter(s => !(s.productId === formData.productId && s.month === formData.month));
      return [...filtered, { 
        productId: formData.productId, 
        month: formData.month, 
        volume: parseInt(formData.volume, 10) 
      }];
    });

    setFormData({ ...formData, volume: '' });
  };

  const removeSimulation = (productId, month) => {
    setSimulations(prev => prev.filter(s => !(s.productId === productId && s.month === month)));
  };

  // Prepare data for the chart: Aggregate volumes per month per product
  const chartData = useMemo(() => {
    const monthsSet = new Set(simulations.map(s => s.month));
    const sortedMonths = Array.from(monthsSet).sort();

    return sortedMonths.map(month => {
      const dataPoint = { name: month };
      simulations.filter(s => s.month === month).forEach(sim => {
        const product = products.find(p => p.id === sim.productId);
        if (product) {
          dataPoint[product.name] = sim.volume;
        }
      });
      return dataPoint;
    });
  }, [simulations, products]);

  // Colors for different products
  const colors = ['var(--primary)', 'var(--accent)', 'var(--success)', 'var(--warning)'];

  return (
    <div className={`${styles.container} animate-fade-in`}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Simulador de Ventas</h2>
          <p className={styles.description}>
            Proyecta las unidades o contratos a vender mes a mes para alimentar el flujo de caja.
          </p>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* Form Column */}
        <div className={styles.formCard}>
          <h3 className={styles.cardTitle}>
            <Target size={20} />
            Nueva Previsión
          </h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Producto / Servicio</label>
              <select 
                className={styles.input}
                value={formData.productId}
                onChange={(e) => setFormData({...formData, productId: e.target.value})}
                required
              >
                <option value="">Seleccione un producto...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Mes de Proyección</label>
              <input 
                type="month" 
                className={styles.input}
                value={formData.month}
                onChange={(e) => setFormData({...formData, month: e.target.value})}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Volumen Estimado (Unidades)</label>
              <input 
                type="number" 
                className={styles.input}
                value={formData.volume}
                onChange={(e) => setFormData({...formData, volume: e.target.value})}
                required
                min="0"
              />
            </div>

            <button type="submit" className={styles.submitButton}>
              Agregar Proyección
            </button>
          </form>

          <div style={{ marginTop: '1rem', borderTop: '1px solid var(--card-border)', paddingTop: '1rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--secondary-foreground)', marginBottom: '0.5rem' }}>
              Proyecciones Cargadas
            </h4>
            <div className={styles.badges}>
              {simulations.map((sim, i) => {
                const p = products.find(prod => prod.id === sim.productId);
                if (!p) return null;
                return (
                  <span key={i} className={styles.badge}>
                    {p.name} ({sim.month}): {sim.volume}
                    <X 
                      size={12} 
                      className={styles.badgeRemove} 
                      onClick={() => removeSimulation(sim.productId, sim.month)}
                    />
                  </span>
                )
              })}
              {simulations.length === 0 && <span className={styles.label}>No hay datos.</span>}
            </div>
          </div>
        </div>

        {/* Chart Column */}
        <div className={styles.chartCard}>
          <h3 className={styles.cardTitle} style={{ marginBottom: '1.5rem' }}>Volumen de Ventas Proyectado</h3>
          {chartData.length === 0 ? (
            <div className={styles.emptyState}>
              Agrega previsiones de venta para visualizar la curva de demanda.
            </div>
          ) : (
            <div style={{ flex: 1, minHeight: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--secondary-foreground)" fontSize={12} />
                  <YAxis stroke="var(--secondary-foreground)" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--foreground)' }}
                    itemStyle={{ color: 'var(--foreground)' }}
                  />
                  <Legend />
                  {products.map((product, index) => {
                    // Check if this product has any simulations
                    const hasData = simulations.some(s => s.productId === product.id);
                    if (!hasData) return null;
                    return (
                      <Bar 
                        key={product.id} 
                        dataKey={product.name} 
                        stackId="a" 
                        fill={colors[index % colors.length]} 
                        radius={[4, 4, 0, 0]}
                      />
                    );
                  })}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
