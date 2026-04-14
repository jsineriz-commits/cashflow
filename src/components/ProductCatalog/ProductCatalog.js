'use client';
import { useState } from 'react';
import { useCashflow } from '@/context/CashflowContext';
import { Plus, Trash2, X } from 'lucide-react';
import styles from './ProductCatalog.module.css';

export default function ProductCatalog() {
  const { products, addProduct, removeProduct } = useCashflow();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', cost: '', frequency: 'monthly' });

  const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;
    
    addProduct({
      name: formData.name,
      price: parseFloat(formData.price),
      cost: parseFloat(formData.cost) || 0,
      frequency: formData.frequency
    });
    setFormData({ name: '', price: '', cost: '', frequency: 'monthly' });
    setIsModalOpen(false);
  };

  return (
    <div className={`${styles.container} animate-fade-in`}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Catálogo de Productos y Servicios</h2>
          <p style={{ color: 'var(--secondary-foreground)', marginTop: '0.25rem' }}>
            Gestiona los productos base sobre los que realizarás tus proyecciones.
          </p>
        </div>
        <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Nuevo Producto
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Nombre</th>
              <th className={styles.th}>Frecuencia de Cobro</th>
              <th className={styles.th}>Precio de Venta</th>
              <th className={styles.th}>Costo Directo Unitario</th>
              <th className={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="5" className={styles.td} style={{ textAlign: 'center', padding: '2rem' }}>
                  No hay productos cargados todavía.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className={styles.tr}>
                  <td className={styles.td}>{product.name}</td>
                  <td className={styles.td}>
                    {product.frequency === 'monthly' ? 'Mensual' : product.frequency === 'annual' ? 'Anual' : 'Única vez'}
                  </td>
                  <td className={styles.td} style={{ fontWeight: '600', color: 'var(--success)' }}>
                    {formatCurrency(product.price)}
                  </td>
                  <td className={styles.td} style={{ color: 'var(--danger)' }}>
                    {formatCurrency(product.cost)}
                  </td>
                  <td className={styles.td}>
                    <button className={styles.deleteButton} onClick={() => removeProduct(product.id)}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Agregar Nuevo Producto</h3>
              <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nombre del Producto / Servicio</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                  placeholder="Ej. Suscripción Premium"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Frecuencia de Facturación</label>
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
                <label className={styles.label}>Precio de Venta</label>
                <input 
                  type="number" 
                  className={styles.input} 
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required 
                  min="0"
                  step="0.01"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Costo Directo (COGS)</label>
                <input 
                  type="number" 
                  className={styles.input} 
                  value={formData.cost}
                  onChange={(e) => setFormData({...formData, cost: e.target.value})}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--secondary-foreground)' }}>
                  Costo asociado directamente a la venta de este producto (opcional)
                </span>
              </div>

              <button type="submit" className={styles.submitButton}>
                Guardar Producto
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
