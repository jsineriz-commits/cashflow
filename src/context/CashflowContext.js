'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CashflowContext = createContext(null);

const initialProducts = [
  { id: '1', name: 'Software Anual', price: 12000, frequency: 'annual', cost: 2000 },
  { id: '2', name: 'Soporte Mensual', price: 500, frequency: 'monthly', cost: 100 },
];

const initialCosts = [
  { id: '1', name: 'Alquiler de Oficina', amount: 1500, type: 'fixed', frequency: 'monthly' },
  { id: '2', name: 'Sueldos y Cargas', amount: 8500, type: 'fixed', frequency: 'monthly' },
];

const initialSimulations = [
  { productId: '1', month: '2024-01', volume: 5 },
  { productId: '2', month: '2024-01', volume: 50 },
];

export function CashflowProvider({ children }) {
  const [products, setProducts] = useState(initialProducts);
  const [costs, setCosts] = useState(initialCosts);
  const [simulations, setSimulations] = useState(initialSimulations);

  // Here we'd load/save from localStorage, but keeping it memory-only for fast dev initially
  
  const addProduct = (product) => {
    setProducts(prev => [...prev, { ...product, id: Date.now().toString() }]);
  };
  
  const removeProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };
  
  const addCost = (cost) => {
    setCosts(prev => [...prev, { ...cost, id: Date.now().toString() }]);
  };

  const removeCost = (id) => {
    setCosts(prev => prev.filter(c => c.id !== id));
  };

  const value = {
    products, addProduct, removeProduct,
    costs, addCost, removeCost,
    simulations, setSimulations
  };

  return (
    <CashflowContext.Provider value={value}>
      {children}
    </CashflowContext.Provider>
  );
}

export const useCashflow = () => {
  const context = useContext(CashflowContext);
  if (!context) {
    throw new Error('useCashflow must be used within a CashflowProvider');
  }
  return context;
};
