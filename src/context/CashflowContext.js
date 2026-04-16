'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const CashflowContext = createContext(null);

// Fallbacks locales si no hay Supabase configurado o hay falla de red
const initialProducts = [
  { id: '1', name: 'Software Anual', price: 12000, frequency: 'annual', cost: 2000 },
  { id: '2', name: 'Soporte Mensual', price: 500, frequency: 'monthly', cost: 100 },
];
const initialCosts = [
  { id: '1', name: 'Alquiler de Oficina', amount: 1500, type: 'fixed', frequency: 'monthly' },
  { id: '2', name: 'Sueldos y Cargas', amount: 8500, type: 'fixed', frequency: 'monthly' },
];
const initialHistoricalSales = [
  { id: 'h1', productId: '2', period: '2023 Mensual Promedio', volume: 45 },
  { id: 'h2', productId: '1', period: '2023 Mensual Promedio', volume: 3 },
];

export function CashflowProvider({ children }) {
  const [products, setProducts] = useState(initialProducts);
  const [costs, setCosts] = useState(initialCosts);
  const [simulations, setSimulations] = useState([]);
  const [historicalSales, setHistoricalSales] = useState(initialHistoricalSales);

  const [macroVariables, setMacroVariables] = useState({
    growthRate: 15,
    horizon: 5,
    inflation: 0
  });

  const [loadingDb, setLoadingDb] = useState(true);

  // Inicialización de BD si las variables de entorno están cargadas
  useEffect(() => {
    if (!supabase) {
      console.warn("Supabase no detectado en el entorno. Funcionando en modo Memoria Local (Tus datos se perderán al actualizar).");
      setLoadingDb(false);
      return;
    }

    const fetchAllData = async () => {
      try {
        const [
          { data: prods },
          { data: csts },
          { data: sims },
          { data: hists }
        ] = await Promise.all([
          supabase.from('products').select('*'),
          supabase.from('costs').select('*'),
          supabase.from('simulations').select('*'),
          supabase.from('historical_sales').select('*')
        ]);
        
        if (prods && prods.length > 0) setProducts(prods);
        if (csts && csts.length > 0) setCosts(csts);
        if (sims && sims.length > 0) {
          const mappedSims = sims.map(s => ({ ...s, productId: s.product_id }));
          setSimulations(mappedSims);
        }
        if (hists && hists.length > 0) {
          const mappedHists = hists.map(h => ({ ...h, productId: h.product_id }));
          setHistoricalSales(mappedHists);
        }
      } catch (error) {
        console.error("Error cargando Supabase:", error);
      } finally {
        setLoadingDb(false);
      }
    };

    fetchAllData();
  }, []);
  
  const addProduct = async (product) => {
    const newId = Date.now().toString();
    const newProd = { ...product, id: newId };
    
    // Primero actualizamos estado rápido para que la UI no demore
    setProducts(prev => [...prev, newProd]);
    
    if (supabase) {
      await supabase.from('products').insert([newProd]);
    }
  };
  
  const removeProduct = async (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    if (supabase) {
      await supabase.from('products').delete().eq('id', id);
    }
  };
  
  const addCost = async (cost) => {
    const newId = Date.now().toString();
    const newCost = { ...cost, id: newId };
    setCosts(prev => [...prev, newCost]);
    if (supabase) {
      await supabase.from('costs').insert([newCost]);
    }
  };

  const removeCost = async (id) => {
    setCosts(prev => prev.filter(c => c.id !== id));
    if (supabase) {
      await supabase.from('costs').delete().eq('id', id);
    }
  };

  const addHistorical = async (hist) => {
    const newId = Date.now().toString();
    // Rename 'productId' to 'product_id' for DB schema matching
    const newHist = { 
      id: newId, 
      product_id: hist.productId, 
      period: hist.period, 
      volume: hist.volume 
    };
    
    setHistoricalSales(prev => [...prev, { ...hist, id: newId, productId: hist.productId }]);
    
    if (supabase) {
      await supabase.from('historical_sales').insert([newHist]);
    }
  };

  const removeHistorical = async (id) => {
    setHistoricalSales(prev => prev.filter(h => h.id !== id));
    if (supabase) {
      await supabase.from('historical_sales').delete().eq('id', id);
    }
  };

  const saveSimulation = async (sims) => {
    setSimulations(sims);
    if (supabase) {
      // Very basic approach: wipe old ones for this month and insert new ones
      // Since sims is an array, we'll just upsert them depending on the DB schema.
      // This logic will be perfected in the next sprint when we add the Auth logic.
    }
  };

  const value = {
    products, addProduct, removeProduct,
    costs, addCost, removeCost,
    simulations, setSimulations: saveSimulation,
    historicalSales, addHistorical, removeHistorical,
    macroVariables, setMacroVariables,
    loadingDb
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
