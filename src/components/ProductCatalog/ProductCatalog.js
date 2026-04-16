'use client';
import { useState } from 'react';
import { useCashflow } from '@/context/CashflowContext';
import { Plus, Trash2, X, Pencil, Package } from 'lucide-react';
import styles from './ProductCatalog.module.css';

const emptyForm = { name: '', price: '', cost: '', frequency: 'monthly' };

export default function ProductCatalog() {
  const { products, addProduct, removeProduct, updateProduct } = useCashflow();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);

  const openNewModal = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingId(product.id);
    setFormData({ name: product.name, price: product.price, cost: product.cost, frequency: product.frequency });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    const data = {
      name: formData.name,
      price: parseFloat(formData.price),
      cost: parseFloat(formData.cost) || 0,
      frequency: formData.frequency
    };

    if (editingId) {
      updateProduct(editingId, data);
    } else {
      addProduct(data);
    }
    setFormData(emptyForm);
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
        <button className={styles.addButton} onClick={openNewModal}>
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
                <td colSpan="5">
                  <div className={styles.emptyState}>
                    <Package size={40} className={styles.emptyIcon} />
                    <p className={styles.emptyTitle}>Todavía no tenés productos cargados</p>
                    <p className={styles.emptySubtitle}>Agregá tu primer producto o servicio para empezar a proyectar tu cashflow.</p>
                    <button className={styles.addButton} onClick={openNewModal}>
                      <Plus size={16} /> Agregar primer producto
                    </button>
                  </div>
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
                    <div className={styles.actionButtons}>
                      <button className={styles.editButton} onClick={() => openEditModal(product)} title="Editar producto">
                        <Pencil size={16} />
                      </button>
                      <button className={styles.deleteButton} onClick={() => removeProduct(product.id)} title="Eliminar producto">
                        <Trash2 size={16} />
                      </button>
                    </div>
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
              <h3 className={styles.modalTitle}>{editingId ? 'Editar Producto' : 'Agregar Nuevo Producto'}</h3>
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
                {editingId ? 'Guardar Cambios' : 'Guardar Producto'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
