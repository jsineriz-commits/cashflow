'use client';
import { useState } from 'react';
import { useCashflow } from '@/context/CashflowContext';
import { Plus, Trash2, X } from 'lucide-react';
import styles from './HistoricalManager.module.css';

export default function HistoricalManager() {
  const { products, historicalSales, addHistorical, removeHistorical } = useCashflow();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ productId: '', period: 'Promedio Mensual Últimos 6m', volume: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.productId || !formData.volume) return;
    
    addHistorical({
      productId: formData.productId,
      period: formData.period,
      volume: parseInt(formData.volume, 10)
    });
    setFormData({ ...formData, volume: '' });
    setIsModalOpen(false);
  };

  return (
    <div className={`${styles.container} animate-fade-in`}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Línea Base Histórica</h2>
          <p style={{ color: 'var(--secondary-foreground)', marginTop: '0.25rem' }}>
            Carga el promedio de ventas actuales. Esto será el punto T-0 para tus proyecciones a 1, 5 o 10 años.
          </p>
        </div>
        <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Cargar Realidad Actual
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Producto / Servicio</th>
              <th className={styles.th}>Período de Referencia</th>
              <th className={styles.th}>Volumen Base (Mensual)</th>
              <th className={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {historicalSales.length === 0 ? (
              <tr>
                <td colSpan="4" className={styles.td} style={{ textAlign: 'center', padding: '2.5rem' }}>
                  No hay datos históricos. La proyección a largo plazo iniciará desde cero.
                </td>
              </tr>
            ) : (
              historicalSales.map(hist => {
                const product = products.find(p => p.id === hist.productId);
                return (
                  <tr key={hist.id} className={styles.tr}>
                    <td className={styles.td} style={{ fontWeight: 600 }}>{product ? product.name : 'Producto Eliminado'}</td>
                    <td className={styles.td}>{hist.period}</td>
                    <td className={styles.td} style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{hist.volume} unidades/mes</td>
                    <td className={styles.td}>
                      <button className={styles.deleteButton} onClick={() => removeHistorical(hist.id)}>
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3>Registrar Base Histórica</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ color: 'var(--secondary-foreground)' }}><X /></button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Producto</label>
                <select className={styles.input} value={formData.productId} onChange={e => setFormData({...formData, productId: e.target.value})} required>
                  <option value="">Seleccione...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Período de Referencia</label>
                <input type="text" className={styles.input} value={formData.period} onChange={e => setFormData({...formData, period: e.target.value})} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Volumen (Unidades Mensuales a HOY)</label>
                <input type="number" className={styles.input} value={formData.volume} onChange={e => setFormData({...formData, volume: e.target.value})} required />
              </div>
              <button type="submit" className={styles.addButton} style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}>
                Guardar Base
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
