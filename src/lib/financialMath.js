// Calcula el Valor Actual Neto (VAN / NPV)
export function calculateNPV(rate, initialInvestment, cashFlows) {
  let npv = -initialInvestment;
  for (let i = 0; i < cashFlows.length; i++) {
    npv += cashFlows[i] / Math.pow(1 + rate, i + 1);
  }
  return npv;
}

// Calcula la Tasa Interna de Retorno (TIR / IRR) usando el método de Newton-Raphson
export function calculateIRR(initialInvestment, cashFlows, guess = 0.1) {
  const maxTries = 100;
  const epsilon = 0.00001;
  let rate = guess;

  for (let i = 0; i < maxTries; i++) {
    let npv = -initialInvestment;
    let dNpv = 0; // Derivada de NPV neta

    for (let j = 0; j < cashFlows.length; j++) {
      const pow = Math.pow(1 + rate, j + 1);
      npv += cashFlows[j] / pow;
      dNpv -= ((j + 1) * cashFlows[j]) / Math.pow(1 + rate, j + 2);
    }

    if (Math.abs(npv) < epsilon) {
      return rate;
    }
    
    // Newton-Raphson step
    const newRate = rate - (npv / dNpv);
    
    if (Math.abs(newRate - rate) < epsilon) {
      return newRate;
    }
    rate = newRate;
  }
  
  // Si no converge o es todo negativo
  return null;
}

// Calcula el Periodo de Recupero (Payback) en meses o años (según array de flujos)
export function calculatePayback(initialInvestment, cashFlows) {
  let cumulativeCash = -initialInvestment;
  for (let i = 0; i < cashFlows.length; i++) {
    cumulativeCash += cashFlows[i];
    if (cumulativeCash >= 0) {
      // Interpolación lineal rudimentaria para la fracción de periodo
      const previousCash = cumulativeCash - cashFlows[i];
      const fraction = Math.abs(previousCash) / cashFlows[i];
      return i + fraction; 
    }
  }
  return null; // Nunca repaga
}
