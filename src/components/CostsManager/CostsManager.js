'use client';
import { useState } from 'react';
import { useCashflow } from '@/context/CashflowContext';
import { Plus, Trash2, X } from 'lucide-react';
import styles from './CostsManager.module.css';

export default function CostsManager() {
  const { costs, addCost, removeCost } = useCashflow();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', amount: '', type: 'fixed', frequency: 'monthly' });

  const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) return;
    
    addCost({
      name: formData.name,
      amount: parseFloat(formData.amount),
      type: formData.type,
      frequency: formData.frequency
    });
    setFormData({ name: '', amount: '', type: 'fixed', frequency: 'monthly' });
    setIsModalOpen(false);
  };

  return (
    <div className={`${styles.container} animate-fade-in`}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Egresos y Costos Operativos</h2>
          <p style={{ color: 'var(--secondary-foreground)', marginTop: '0.25rem' }}>
            Registra los gastos fijos y recurrentes de la empresa para calcular el burn rate.
          </p>
        </div>
        <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Nuevo Gasto
        </button>
      </div>

      <div className={styles.cardsGrid}>
        {costs.map((cost) => (
          <div key={cost.id} className={styles.costCard}>
            <div className={styles.cardHeader}>
              <span className={styles.costName}>{cost.name}</span>
              <span className={styles.costType}>
                {cost.type === 'fixed' ? 'Fijo' : 'Variable'}
              </span>
            </div>
            
            <div>
              <div className={styles.costAmount}>{formatCurrency(cost.amount)}</div>
              <div className={styles.costFrequency}>
                {cost.frequency === 'monthly' ? 'Por mes' : cost.frequency === 'annual' ? 'Al año' : 'Única vez'}
              </div>
            </div>

            <button className={styles.deleteButton} onClick={() => removeCost(cost.id)} aria-label="Eliminar costo">
              <Trash2 size={18} />
            </button>
          </div>
        ))}

        {costs.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--secondary-foreground)' }}>
            No hay egresos registrados. Tus proyecciones asumirán costo cero.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Registrar Gasto</h3>
              <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nombre o Concepto</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                  placeholder="Ej. Alquiler Oficina"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Estructura de Costo</label>
                <select 
                  className={styles.input}
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="fixed">Gasto Fijo Estructural</option>
                  <option value="variable">Gasto Variable</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Frecuencia de Pago</label>
                <select 
                  className={styles.input}
                  value={formData.frequency}
                  onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                >
                  <option value="monthly">Mensual</option>
                  <option value="annual">Anual</option>
                  <option value="onetime">Única vez</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Monto Estimado</label>
                <input 
                  type="number" 
                  className={styles.input} 
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required 
                  min="0"
                  step="0.01"
                />
              </div>

              <button type="submit" className={styles.submitButton}>
                Registrar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
