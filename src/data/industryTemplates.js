export const industryTemplates = [
  // --- GASTRONOMIA ---
  {
    category: "Gastronomía", id: "heladeria_fabrica", name: "Fábrica de Helados Artesanales", engineType: "volume",
    labels: { primaryVolume: "Kilos Vendidos/Mes", primaryGrowth: "Crecimiento de Kilos Anual (%)", ticket: "Precio Promedio x Kilo", cogs: "Costo Materia Prima x Kilo", fixed: "Alquiler Fabrica + Empleados", capex: "Máquinas, Pozo de Frío y Local" },
    defaults: { primaryVolume: 3500, primaryGrowth: 15, churn: 0, ticket: 15000, cogs: 4500, fixed: 8000000, capex: 50000000 }
  },
  {
    category: "Gastronomía", id: "restaurante_gourmet", name: "Restaurante Gourmet", engineType: "volume",
    labels: { primaryVolume: "Cubiertos/Comensales al Mes", primaryGrowth: "Aumento Tráfico Comercial (%)", ticket: "Ticket Promedio x Comensal ($)", cogs: "Costo Comida/Bebida x Plato", fixed: "Brigada, Mozos y Alquiler Rte.", capex: "Llave del Local, Cocina y Mobiliario" },
    defaults: { primaryVolume: 2500, primaryGrowth: 5, churn: 0, ticket: 35000, cogs: 10000, fixed: 15000000, capex: 120000000 }
  },
  {
    category: "Gastronomía", id: "cafeteria_especialidad", name: "Cafetería de Especialidad", engineType: "volume",
    labels: { primaryVolume: "Tickets (Café+Pastry) /Mes", primaryGrowth: "Aumento Clientes (%)", ticket: "Ticket Promedio (Combo)", cogs: "Costo Grano + Insumos Varios", fixed: "Sueldo Baristas y Alquiler", capex: "Máquina Espresso, Local (USD -> ARS)" },
    defaults: { primaryVolume: 4000, primaryGrowth: 10, churn: 0, ticket: 7000, cogs: 1800, fixed: 3000000, capex: 30000000 }
  },
  {
    category: "Gastronomía", id: "foodtruck_hamburguesas", name: "Foodtrack / Local Hamburgesas", engineType: "volume",
    labels: { primaryVolume: "Hamburguesas Vendidas/Mes", primaryGrowth: "Crec. Ventas (%)", ticket: "Precio Promedio Combo", cogs: "Costo Carne, Pan, Packaging", fixed: "Personal Local, Cannon/Alquiler", capex: "Compra Foodtruck/Reforma" },
    defaults: { primaryVolume: 3500, primaryGrowth: 12, churn: 0, ticket: 11000, cogs: 4000, fixed: 4500000, capex: 20000000 }
  },
  {
    category: "Gastronomía", id: "delivery_sushi", name: "Delivery Only Sushi (Dark Kitchen)", engineType: "volume",
    labels: { primaryVolume: "Pedidos Entregados/Mes", primaryGrowth: "Crec. Pedidos (%)", ticket: "Ticket Promedio Sushi", cogs: "Costo Salmón/Arroz/Delivery", fixed: "Sueldo Sushiman, Cocina Oculta", capex: "Armado Cocina, Moto" },
    defaults: { primaryVolume: 2000, primaryGrowth: 20, churn: 0, ticket: 30000, cogs: 12000, fixed: 5000000, capex: 15000000 }
  },

  // --- RETAIL E INDUMENTARIA ---
  {
    category: "Retail y Comercio", id: "tienda_ropa", name: "Tienda de Ropa (Boutique Indumentaria)", engineType: "volume",
    labels: { primaryVolume: "Prendas Vendidas al Mes", primaryGrowth: "Crec. Ventas (%)", ticket: "Precio Promedio Prenda ($)", cogs: "Costo Compra/Confección x Prenda", fixed: "Alquiler Local Comercial + Vendedor", capex: "Vidriera, Stock Inicial y Llave" },
    defaults: { primaryVolume: 800, primaryGrowth: 5, churn: 0, ticket: 45000, cogs: 15000, fixed: 6000000, capex: 25000000 }
  },
  {
    category: "Retail y Comercio", id: "hardware_store", name: "Local de Tecnología/Informática", engineType: "volume",
    labels: { primaryVolume: "Artículos Vendidos / Mes", primaryGrowth: "Crecimiento Mensual (%)", ticket: "AOV Ticket Electrónica", cogs: "Precio Mayorista / Importación", fixed: "Local y Empleados Fijos", capex: "Stock Técnico, Estanterías" },
    defaults: { primaryVolume: 400, primaryGrowth: 7, churn: 0, ticket: 120000, cogs: 80000, fixed: 5000000, capex: 150000000 }
  },
  {
    category: "Retail y Comercio", id: "supermercado_chino", name: "Supermercado de Barrio (Autoservicio)", engineType: "volume",
    labels: { primaryVolume: "Tickets Cobrados al Mes", primaryGrowth: "Tasa Aumento Ticket (%)", ticket: "Compra Promedio ($)", cogs: "Costo Mercancía (70% aprox)", fixed: "Alquiler, Energía y Empleados", capex: "Góndolas, Heladeras Comerciales" },
    defaults: { primaryVolume: 6000, primaryGrowth: 3, churn: 0, ticket: 18000, cogs: 13000, fixed: 12000000, capex: 80000000 }
  },
  {
    category: "Retail y Comercio", id: "petshop_vet", name: "Pet Shop y Veterinaria", engineType: "volume",
    labels: { primaryVolume: "Bolsas/Atenciones al Mes", primaryGrowth: "Aumento Tráfico (%)", ticket: "Gasto Medio por Mascota", cogs: "Costo Alimento Pet / Medicina", fixed: "Local y Honorarios Vet Fijos", capex: "Stock Alimentos, Consultorio" },
    defaults: { primaryVolume: 1200, primaryGrowth: 6, churn: 0, ticket: 25000, cogs: 15000, fixed: 4000000, capex: 35000000 }
  },
  {
    category: "Retail y Comercio", id: "farmacia_tradicional", name: "Farmacia Tradicional", engineType: "volume",
    labels: { primaryVolume: "Ventas Totales Mensuales", primaryGrowth: "Crec. Pacientes/Mes", ticket: "Ticket Receta/Cosmética", cogs: "Costo Droguería", fixed: "Sueldos Sindicales Farmacéuticos", capex: "Habilitación y Carga Droguería" },
    defaults: { primaryVolume: 4500, primaryGrowth: 2, churn: 0, ticket: 30000, cogs: 20000, fixed: 15000000, capex: 200000000 }
  },
  {
    category: "Retail y Comercio", id: "joyeria", name: "Joyería y Relojería", engineType: "volume",
    labels: { primaryVolume: "Piezas Vendidas Mensuales", primaryGrowth: "Aumento Clientes", ticket: "Ticket Oro/Relojes Premium", cogs: "Costo Orfebrería y Materiales", fixed: "Alquiler Seguro, Seguridad Fija", capex: "Stock Metales, Bóveda" },
    defaults: { primaryVolume: 80, primaryGrowth: 3, churn: 0, ticket: 350000, cogs: 120000, fixed: 6000000, capex: 180000000 }
  },
  {
    category: "Retail y Comercio", id: "ferreteria_mayorista", name: "Ferretería Abastecedora", engineType: "volume",
    labels: { primaryVolume: "Órdenes / Clientes Mensuales", primaryGrowth: "Crecimiento de Obra (%)", ticket: "Ticket Ferretero", cogs: "Provisión Acero/Plástico", fixed: "Costo Galpón, Logística Fija", capex: "Inversión Almacén" },
    defaults: { primaryVolume: 1500, primaryGrowth: 4, churn: 0, ticket: 85000, cogs: 50000, fixed: 7000000, capex: 60000000 }
  },
  {
    category: "Retail y Comercio", id: "vinoteca", name: "Vinoteca / Tienda de Licores", engineType: "volume",
    labels: { primaryVolume: "Botellas Vendidas / Mes", primaryGrowth: "Crec. Ventas", ticket: "Precio Promedio Botella", cogs: "Costo Bodega Mayorista", fixed: "Local y Sommelier", capex: "Cavas de Climatización y Bodega" },
    defaults: { primaryVolume: 1200, primaryGrowth: 8, churn: 0, ticket: 15000, cogs: 6500, fixed: 3000000, capex: 20000000 }
  },
  
  // --- HOTELERIA Y TURISMO ---
  {
    category: "Hotelería y Turismo", id: "hotel_boutique", name: "Hotel Boutique", engineType: "volume",
    labels: { primaryVolume: "Noches Ocupadas / Mes", primaryGrowth: "Crec. Demanda Turística (%)", ticket: "ADR - Tarifa Promedio x Noche($)", cogs: "Costo Diario Limpieza/Desayuno", fixed: "Personal 24hs, Servicios, Manten.", capex: "Inversión Construcción/Remodelación" },
    defaults: { primaryVolume: 420, primaryGrowth: 3, churn: 0, ticket: 150000, cogs: 18000, fixed: 18000000, capex: 800000000 }
  },
  {
    category: "Hotelería y Turismo", id: "agencia_viajes", name: "Agencia de Viajes y Turismo Minorista", engineType: "volume",
    labels: { primaryVolume: "Paquetes Vendidos / Mes", primaryGrowth: "Crecimiento Ventas (%)", ticket: "Valor Paquete Turístico Diario", cogs: "Pago de Vuelos/Hoteles a Mayoristas", fixed: "Sueldos Agentes y Costo Local", capex: "Franquicia de Marca y Garantías" },
    defaults: { primaryVolume: 50, primaryGrowth: 10, churn: 0, ticket: 1200000, cogs: 950000, fixed: 8000000, capex: 12000000 }
  },
  {
    category: "Hotelería y Turismo", id: "glamping_ecologico", name: "Eco-Glamping (Turismo Domos)", engineType: "volume",
    labels: { primaryVolume: "Noches Domo Vendidas", primaryGrowth: "Aumento Turismo (%)", ticket: "Tarifa Premium Glamping", cogs: "Costo Amenidades/Viandas", fixed: "Mantenimiento Parque y Staff", capex: "Instalación Domos y Terreno" },
    defaults: { primaryVolume: 150, primaryGrowth: 15, churn: 0, ticket: 180000, cogs: 20000, fixed: 6000000, capex: 150000000 }
  },
  {
    category: "Hotelería y Turismo", id: "hostel_mochileros", name: "Hostel Backpackers", engineType: "volume",
    labels: { primaryVolume: "Camas Literas Ocupadas Mensuales", primaryGrowth: "Crecimiento Backpackers", ticket: "Precio Cama + Desayuno", cogs: "Costo Fijo Sábanas y Limpieza", fixed: "Alquiler Casona y Conserjes", capex: "Reformas, Camas y Lockers" },
    defaults: { primaryVolume: 1100, primaryGrowth: 2, churn: 0, ticket: 18000, cogs: 3000, fixed: 5000000, capex: 40000000 }
  },

  // --- SERVICIOS EMPRESARIALES Y PERSONALES ---
  {
    category: "Servicios Profesionales", id: "agencia_marketing_retainer", name: "Agencia de Marketing (B2B Retainers)", engineType: "subscription",
    labels: { primaryVolume: "Nuevos Clientes / Mes", primaryGrowth: "Aceleración Nuevos Accts (%)", ticket: "Fee Agencia Mensual por Cliente", cogs: "Gastos Ads Directo y Software", fixed: "Planilla de Diseñadores / Programadores", capex: "Equipos Tecnológicos (Macbooks)" },
    defaults: { primaryVolume: 2, primaryGrowth: 5, churn: 2, ticket: 1500000, cogs: 20000, fixed: 25000000, capex: 8000000 }
  },
  {
    category: "Servicios Profesionales", id: "peluqueria_barberia", name: "Peluquería / Barbería de Cadena", engineType: "volume",
    labels: { primaryVolume: "Cortes/Servicios al Mes", primaryGrowth: "Aumento Clientela", ticket: "Precio Promedio Corte/Tintura", cogs: "Comisión Peluquero (Ej 50%)", fixed: "Alquiler y Luz de Salón", capex: "Sillones Comerciales e Imagen" },
    defaults: { primaryVolume: 800, primaryGrowth: 8, churn: 0, ticket: 12000, cogs: 6000, fixed: 1500000, capex: 8000000 }
  },
  {
    category: "Servicios Profesionales", id: "estudio_contable", name: "Estudio Contable (Monotributos y Pymes)", engineType: "subscription",
    labels: { primaryVolume: "Cuentas Nuevas / Mes", primaryGrowth: "Crecimiento Clientes", ticket: "Abono Promedio Mensual", cogs: "Sellos / Certificaciones Variables", fixed: "Sueldos Asistentes y Oficina", capex: "PCs de Oficina" },
    defaults: { primaryVolume: 10, primaryGrowth: 2, churn: 1, ticket: 80000, cogs: 2000, fixed: 15000000, capex: 5000000 }
  },
  {
    category: "Servicios Profesionales", id: "limpieza_b2b", name: "Empresa de Limpieza B2B", engineType: "subscription",
    labels: { primaryVolume: "Contratos Empresariales / Mes", primaryGrowth: "Nuevas Licitaciones", ticket: "Contrato Limpieza Oficina/Mes", cogs: "Insumos Químicos y Viáticos Obra", fixed: "Estructura Central RRHH", capex: "Máquinas Lustradoras, Furgoneta" },
    defaults: { primaryVolume: 3, primaryGrowth: 5, churn: 2, ticket: 3000000, cogs: 80000, fixed: 8000000, capex: 60000000 }
  },
  {
    category: "Servicios Profesionales", id: "estudio_arquitectura", name: "Estudio de Arquitectura / Diseño", engineType: "volume",
    labels: { primaryVolume: "Proyectos Cobrados al Mes", primaryGrowth: "Volumen Proyectos (%)", ticket: "Ticket Medio por Proyecto/Obra", cogs: "Honorarios Tercerizados Asesores", fixed: "Estructura de Oficina, CAD Software", capex: "Workstations Diseño" },
    defaults: { primaryVolume: 3, primaryGrowth: 1, churn: 0, ticket: 8000000, cogs: 2000000, fixed: 6000000, capex: 12000000 }
  },
  {
    category: "Servicios Profesionales", id: "organizacion_eventos", name: "Productora / Organización de Eventos", engineType: "volume",
    labels: { primaryVolume: "Eventos Realizados / Mes", primaryGrowth: "Crecimiento Comercial", ticket: "Precio Final Producción", cogs: "Pagos a Proveedores (Catering, DJ)", fixed: "Oficina, Sueldos Comerciales Fijos", capex: "Stock Material Técnico Propio" },
    defaults: { primaryVolume: 4, primaryGrowth: 8, churn: 0, ticket: 5000000, cogs: 3500000, fixed: 3000000, capex: 18000000 }
  },
  
  // --- SALUD Y BIENESTAR ---
  {
    category: "Salud y Bienestar", id: "gimnasio_cadena", name: "Gimnasio Comercial (Box Crossfit / Standard)", engineType: "subscription",
    labels: { primaryVolume: "Nuevos Socios (Suscripciones)", primaryGrowth: "Crecimiento Activos (%)", ticket: "Cuota de Gimnasio / Mes", cogs: "Costos uso App o Tarjeta Frecuencia", fixed: "Staff de Profes Profesionales y Alquiler Gran Galpón", capex: "Equipamiento de Musculación (Gym Equipment)" },
    defaults: { primaryVolume: 50, primaryGrowth: 15, churn: 5, ticket: 35000, cogs: 1000, fixed: 12000000, capex: 150000000 }
  },
  {
    category: "Salud y Bienestar", id: "spa_estetica", name: "Centro de Estética / Spa", engineType: "volume",
    labels: { primaryVolume: "Tratamientos Vendidos M", primaryGrowth: "Aumento Tráfico", ticket: "Sesión Promedio de Spa/Láser", cogs: "Cremas e Insumos Quirúrgicos", fixed: "Alquiler Alta Gama, Medicas", capex: "Máquina Depilación Láser y Reformas" },
    defaults: { primaryVolume: 600, primaryGrowth: 10, churn: 0, ticket: 45000, cogs: 8000, fixed: 8000000, capex: 90000000 }
  },
  {
    category: "Salud y Bienestar", id: "consultorio_odontologico", name: "Clínica Odontológica Privada", engineType: "volume",
    labels: { primaryVolume: "Pacientes Atendidos Mes", primaryGrowth: "Crec. Visitas (%)", ticket: "Ticket Medio (Tratamientos Compuestos)", cogs: "Insumos Descartables / Laboratorio", fixed: "Secretaria, Limpieza y Expensas", capex: "Sillón Odonto, RXs y Amoblamiento" },
    defaults: { primaryVolume: 200, primaryGrowth: 2, churn: 0, ticket: 80000, cogs: 22000, fixed: 3500000, capex: 60000000 }
  },
  {
    category: "Salud y Bienestar", id: "centro_psicologia", name: "Centro Psicológico / Terapeutas Grales.", engineType: "volume",
    labels: { primaryVolume: "Sesiones Realizadas / Mes", primaryGrowth: "Crecimiento Pacientes", ticket: "Valor Sesión Terapéutica", cogs: "Comisión Profesional (Retención Mínima)", fixed: "Alquiler Consultorios Fijos", capex: "Equipamiento Salas de Consulta" },
    defaults: { primaryVolume: 800, primaryGrowth: 5, churn: 0, ticket: 25000, cogs: 15000, fixed: 2500000, capex: 5000000 }
  },

  // --- TECNOLOGIA, SAAS Y SOFTWARE ---
  {
    category: "Tecnología y Software", id: "saas_b2b", name: "SaaS Enterprise (Software As A Service)", engineType: "subscription",
    labels: { primaryVolume: "Altas Mensuales Clientes", primaryGrowth: "Crec. Adquisición MRR", ticket: "Ticket MRR (Mensualidad)", cogs: "Hosting y APIs de 3ros /CAC", fixed: "Costo Ingenieros / Developers Base", capex: "Inversión Desarrollo Producto M0" },
    defaults: { primaryVolume: 15, primaryGrowth: 8, churn: 2, ticket: 250000, cogs: 10000, fixed: 35000000, capex: 80000000 }
  },
  {
    category: "Tecnología y Software", id: "app_movil_b2c", name: "Aplicación Móvil B2C (Ads/Suscripción)", engineType: "subscription",
    labels: { primaryVolume: "Nuevos Usuarios Premium", primaryGrowth: "Viralidad (%)", ticket: "Suscripción Premium Mensual", cogs: "Cloud Servidor por Usuario", fixed: "Servidores Basales + Equipo Tech", capex: "Campaña de Lanzamiento y App Dev" },
    defaults: { primaryVolume: 2000, primaryGrowth: 25, churn: 8, ticket: 5000, cogs: 100, fixed: 12000000, capex: 40000000 }
  },
  {
    category: "Tecnología y Software", id: "agencia_software_factory", name: "Software Factory (Horas de Desarrollo)", engineType: "volume",
    labels: { primaryVolume: "Horas Vendidas/Facturadas", primaryGrowth: "Crecimiento Pipeline", ticket: "Tarifa por Hora Ingeniero USD->ARS", cogs: "Variables Cloud / Certificados", fixed: "Planilla Developers en Relación L.", capex: "Oficinas y Setup Infraestructura" },
    defaults: { primaryVolume: 1200, primaryGrowth: 5, churn: 0, ticket: 45000, cogs: 2000, fixed: 30000000, capex: 20000000 }
  },

  // --- INDUSTRIA Y MANUFACTURA ---
  {
    category: "Industria y Manufactura", id: "fabrica_muebles", name: "Fábrica de Muebles / Aserradero", engineType: "volume",
    labels: { primaryVolume: "Muebles a Entregar Mes", primaryGrowth: "Aumento de Matrícula/Pedidos", ticket: "Ticket Promedio por Lote de Muebles", cogs: "Costo Madera y Pegamentos", fixed: "Gastos Naves Industriales y Sindicales", capex: "Tornos y Sierras Industriales" },
    defaults: { primaryVolume: 350, primaryGrowth: 2, churn: 0, ticket: 450000, cogs: 200000, fixed: 25000000, capex: 300000000 }
  },
  {
    category: "Industria y Manufactura", id: "cerveceria_artesanal", name: "Cervecería Artesanal (Solo Fabricación Kegs)", engineType: "volume",
    labels: { primaryVolume: "Litros de Cerveza Producidos", primaryGrowth: "Expansión Ventas (%)", ticket: "Precio de Venta x Litro Promedio", cogs: "Costo Insumos (Malta, Lúpulo, Latas)", fixed: "Alquiler Fábrica + Brewmasters", capex: "Equipos de Cocción, Fermentadores" },
    defaults: { primaryVolume: 10000, primaryGrowth: 12, churn: 0, ticket: 4000, cogs: 1600, fixed: 8000000, capex: 60000000 }
  },
  {
    category: "Industria y Manufactura", id: "confeccion_textil", name: "Taller de Confección Textil Gral.", engineType: "volume",
    labels: { primaryVolume: "Unidades Confeccionadas al M.", primaryGrowth: "Aumento Pedidos Marcas", ticket: "Precio Cobrado x Prenda Taller", cogs: "Costo de Hilos y Avios Menores", fixed: "Personal de Corte y Maquinistas", capex: "Máquinas Rectas, Overlock, Mesas" },
    defaults: { primaryVolume: 15000, primaryGrowth: 3, churn: 0, ticket: 5000, cogs: 400, fixed: 14000000, capex: 40000000 }
  },
  {
    category: "Industria y Manufactura", id: "fabrica_pinturas", name: "Fábrica de Pinturas/Químicos Base", engineType: "volume",
    labels: { primaryVolume: "Tachos (20L) Vendidos", primaryGrowth: "Crecimiento Mercado", ticket: "Precio Mayorista Envase 20L", cogs: "Costo Materia Prima Química", fixed: "Logística y Planta Química", capex: "Maquinaria Dilución y Reactores" },
    defaults: { primaryVolume: 5000, primaryGrowth: 5, churn: 0, ticket: 70000, cogs: 40000, fixed: 20000000, capex: 250000000 }
  },

  // --- LOGISTICA, SERVICIOS A CAMPO Y TRANSPORTE ---
  {
    category: "Transporte y Logística", id: "empresa_transporte_cargas", name: "Flota Transporte Camiones (Carga Terrestre)", engineType: "volume",
    labels: { primaryVolume: "Viajes Mensuales Cobrados", primaryGrowth: "Crecimiento Adq. Clientes", ticket: "Facturación Flete Promedio", cogs: "Costo de Combustible, Peajes y Viáticos", fixed: "Seguros Flota, Sueldos y Base Fija", capex: "Compra Camiones Tractores Semi" },
    defaults: { primaryVolume: 40, primaryGrowth: 2, churn: 0, ticket: 1500000, cogs: 600000, fixed: 15000000, capex: 800000000 }
  },
  {
    category: "Transporte y Logística", id: "ultima_milla", name: "Logística Última Milla (Paquetería)", engineType: "volume",
    labels: { primaryVolume: "Paquetes Entregados / Mes", primaryGrowth: "Crec. Demanda Ecomm", ticket: "Tarifa Entregador e-Commerce", cogs: "Costos de Repartidores Freelance", fixed: "Gastos Nodo Central Logístico", capex: "Flotilla de Kangos / Utilitarios" },
    defaults: { primaryVolume: 25000, primaryGrowth: 8, churn: 0, ticket: 6000, cogs: 4000, fixed: 18000000, capex: 120000000 }
  },
  {
    category: "Transporte y Logística", id: "estacion_servicio", name: "Estación de Servicio Libre", engineType: "volume",
    labels: { primaryVolume: "Litros Combustible al Mes", primaryGrowth: "Aum. Tráfico Automotor", ticket: "Precio Surtidor Litro", cogs: "Costo Mayorista Petrolera", fixed: "Salarios Playeros, Patentes, Luz", capex: "Banderazo, Surtidores, Terreno" },
    defaults: { primaryVolume: 250000, primaryGrowth: 1, churn: 0, ticket: 1100, cogs: 950, fixed: 20000000, capex: 800000000 }
  },
  {
    category: "Transporte y Logística", id: "flota_rental_autos", name: "Rent a Car (Alquiler Automóviles)", engineType: "volume",
    labels: { primaryVolume: "Días Reservados de Alquiler", primaryGrowth: "Crec Turismo (%)", ticket: "Tarifa Alquiler x Día", cogs: "Amortización Rápida y Mantenimiento", fixed: "Locales Aeropuerto, Seguros Auto Fijo", capex: "Adquisición de la Flota (50 Vehículos)" },
    defaults: { primaryVolume: 900, primaryGrowth: 4, churn: 0, ticket: 55000, cogs: 10000, fixed: 8000000, capex: 1500000000 }
  },

  // --- EDUCACION Y ENTRETENIMIENTO ---
  {
    category: "Educación", id: "colegio_privado", name: "Colegio Privado o Instituto Educativo", engineType: "subscription",
    labels: { primaryVolume: "Altas de Matrícula Mes", primaryGrowth: "Nuevas Inscripciones", ticket: "Cuota Escolar Mensual", cogs: "Costos Merienda o Directos", fixed: "Planilla Docente Plena y Manten.", capex: "Vallas, Carpetas y Construcción Campus" },
    defaults: { primaryVolume: 500, primaryGrowth: 1, churn: 2, ticket: 180000, cogs: 5000, fixed: 60000000, capex: 500000000 }
  },
  {
    category: "Educación", id: "cursos_online", name: "Plataforma de Cursos E-Learning (B2C)", engineType: "volume",
    labels: { primaryVolume: "Cursos Vendidos x Mes", primaryGrowth: "Aumento Pauta Ads", ticket: "Precio de Promedio del Curso", cogs: "Gasto de Ads P/Venta + Pasarelas", fixed: "Edición Video, Plataforma Cloud", capex: "Grabación Inicial Cursos y Setup" },
    defaults: { primaryVolume: 350, primaryGrowth: 20, churn: 0, ticket: 80000, cogs: 35000, fixed: 3000000, capex: 10000000 }
  },
  {
    category: "Entretenimiento", id: "cancha_padel_futbol", name: "Complejo de Pádel / Fútbol", engineType: "volume",
    labels: { primaryVolume: "Turnos Alquilados al Mes", primaryGrowth: "Aumento Tráfico Horas (%)", ticket: "Precio x Turno (1.5 hs)", cogs: "Limpieza Canchas y Luces", fixed: "Administración Complejo", capex: "Armado de 8 canchas Blindex" },
    defaults: { primaryVolume: 1200, primaryGrowth: 3, churn: 0, ticket: 28000, cogs: 1500, fixed: 4000000, capex: 120000000 }
  },
  {
    category: "Entretenimiento", id: "teatro_cine", name: "Sala de Teatro / MicroCine", engineType: "volume",
    labels: { primaryVolume: "Espectadores Mensuales", primaryGrowth: "Crecimiento Cultural", ticket: "AOV Ticket + Kiosco", cogs: "Reparto Regalías/Productor (Borderó)", fixed: "Alquiler Sala, Publicidad Fija", capex: "Sillas, Acústica y Puesta a Punto" },
    defaults: { primaryVolume: 2500, primaryGrowth: 2, churn: 0, ticket: 15000, cogs: 7500, fixed: 8000000, capex: 40000000 }
  },
  {
    category: "Entretenimiento", id: "productora_musica", name: "Productora Master / Shows en Vivo", engineType: "volume",
    labels: { primaryVolume: "Eventos Masivos Organizados", primaryGrowth: "Escala Eventos", ticket: "Borderó Total / Facturación Neta Show", cogs: "Costo Artista, Escenario y Rider", fixed: "Oficinas Producción Centrales", capex: "Adquisición Material, Equipos Rodantes" },
    defaults: { primaryVolume: 2, primaryGrowth: 15, churn: 0, ticket: 250000000, cogs: 180000000, fixed: 15000000, capex: 30000000 }
  },

  // --- BIENES RAICES Y AGRICULTURA (ALTO CAPITAL) ---
  {
    category: "Bienes Raíces (Real Estate)", id: "desarrollo_inmobiliario", name: "Desarrollo Inmobiliario Pozo (Construcción)", engineType: "volume",
    labels: { primaryVolume: "Departamentos Vendidos / Mes", primaryGrowth: "Velocidad de PreVenta", ticket: "Ticket Medio por Unidad Cobrada ($)", cogs: "Costo Obra Materiales/MDO P/ Depto", fixed: "Arquitectos y Marketing Proyecto", capex: "Compra Terreno Inicial Fideicomiso" },
    defaults: { primaryVolume: 2, primaryGrowth: 5, churn: 0, ticket: 90000000, cogs: 60000000, fixed: 4000000, capex: 450000000 }
  },
  {
    category: "Bienes Raíces (Real Estate)", id: "parking_comercial", name: "Playa de Estacionamiento en Centro Comercial", engineType: "volume",
    labels: { primaryVolume: "Coches Estacionados / Mes", primaryGrowth: "Tasa Flujo Vial (%)", ticket: "Ticket Medio (2hr promedio)", cogs: "Emisión de Ticket y Sistema", fixed: "Alquiler/ABL de Playa y Cajeros", capex: "Barreras, Software, Asfaltado" },
    defaults: { primaryVolume: 12000, primaryGrowth: 1, churn: 0, ticket: 4000, cogs: 50, fixed: 12000000, capex: 50000000 }
  },
  {
    category: "Bienes Raíces (Real Estate)", id: "coworking", name: "Espacio de Coworking B2B", engineType: "subscription",
    labels: { primaryVolume: "Membresías HotDesk/Mes", primaryGrowth: "Crecimiento Clientes", ticket: "Abono Puesto Fijo", cogs: "Costo Café / Servicio Directo", fixed: "Super Alquiler Premium Centro", capex: "Decoración y Oficinas de Lujo" },
    defaults: { primaryVolume: 20, primaryGrowth: 5, churn: 3, ticket: 150000, cogs: 5000, fixed: 14000000, capex: 80000000 }
  },
  {
    category: "Agro y Campo", id: "tambo_lechero", name: "Empresa Láctea (Tambo Invernada)", engineType: "volume",
    labels: { primaryVolume: "Litros Leche Extraídos / Mes", primaryGrowth: "Tasa Preñez Escala", ticket: "Cotización Litro Usina Principal", cogs: "Alimentación Vaca, Ordeñe Directo", fixed: "Peones de Campo, Tambero y Veter.", capex: "Adquisición Vacas y Sala Ordeñe" },
    defaults: { primaryVolume: 80000, primaryGrowth: 2, churn: 0, ticket: 600, cogs: 280, fixed: 12000000, capex: 250000000 }
  },
  {
    category: "Agro y Campo", id: "produccion_ganadera", name: "Engorde Ganadero a Corral (Feedlot)", engineType: "volume",
    labels: { primaryVolume: "Cabezas Faenadas Mes", primaryGrowth: "Aumento Rotación Ruedo", ticket: "Precio Venta Caballo/Novillo Mercado Liniers", cogs: "Valor Ternero Origen + Ración Feedlot", fixed: "Estructura Campo (Tractores, Personal)", capex: "Compra de Terreno y Corrales Instalados" },
    defaults: { primaryVolume: 150, primaryGrowth: 3, churn: 0, ticket: 800000, cogs: 550000, fixed: 8000000, capex: 120000000 }
  },
  {
    category: "Agro y Campo", id: "agricultura_soja", name: "Campaña Agrícola (Pool Siembra)", engineType: "volume",
    labels: { primaryVolume: "Toneladas Cosechadas / Mes", primaryGrowth: "Variación Clima/Rinde (%)", ticket: "Precio Tonelada FOB/Pizarra", cogs: "Costo Insumos (Semilla, Fert, Cosecha)", fixed: "Alquiler Campo (Arrendamiento Seco)", capex: "Capital Trabajo Inicial y Seguro Ag." },
    // El agro ocurre 1 vez al año, pero acá lo promediamos mensual como ventas devengadas.
    defaults: { primaryVolume: 250, primaryGrowth: 1, churn: 0, ticket: 450000, cogs: 180000, fixed: 8000000, capex: 100000000 }
  },

  // --- SERVICIOS CONTRATISTAS Y OFICIOS ---
  {
    category: "Servicios Contratistas", id: "empresa_seguridad", name: "Agencia de Seguridad Privada", engineType: "subscription",
    labels: { primaryVolume: "Nuevos Puestos Guardia / Mes", primaryGrowth: "Aumento Puestos", ticket: "Abono Servicio Mensual 24hs", cogs: "Costo Salarial Directo del Guardia", fixed: "Supervisores Flota y Seguros", capex: "Armas, Flota Móvil Vehículos Inicial" },
    defaults: { primaryVolume: 5, primaryGrowth: 2, churn: 1, ticket: 8000000, cogs: 6000000, fixed: 15000000, capex: 40000000 }
  },
  {
    category: "Servicios Contratistas", id: "constructora", name: "Constructora Obra Civil Menor", engineType: "volume",
    labels: { primaryVolume: "M2 Construidos/Certificados Mensual", primaryGrowth: "Expansión de Obra", ticket: "Precio de Venta / Certificado por M2 ($)", cogs: "Costo Variable Hierro/Acero MDO M2", fixed: "Oficina Constructora, Obradores Fijos", capex: "Hormigoneras, Camiones, Retroexcavadoras" },
    defaults: { primaryVolume: 300, primaryGrowth: 3, churn: 0, ticket: 800000, cogs: 500000, fixed: 20000000, capex: 80000000 }
  },
  {
    category: "Servicios Contratistas", id: "taller_mecanico", name: "Taller Mecánico Chapa y Pintura Multiservicio", engineType: "volume",
    labels: { primaryVolume: "Autos Reparados", primaryGrowth: "Aumento Tráfico Vial", ticket: "Ticket Medio Reparación/Siniestro", cogs: "Repuestos y Pinturas", fixed: "Sueldo Mecánicos, Alquiler Taller Gran Superficie", capex: "Elevadores, Cabina de Pintura y Escáneres" },
    defaults: { primaryVolume: 120, primaryGrowth: 2, churn: 0, ticket: 750000, cogs: 380000, fixed: 12000000, capex: 50000000 }
  },
  {
    category: "Servicios Contratistas", id: "instalacion_paneles", name: "Instalación Paneles Solares B2B", engineType: "volume",
    labels: { primaryVolume: "Sistemas Fotov. Instalados Mensual", primaryGrowth: "Incremento Demanda Energía Renov.", ticket: "Precio Proyecto Inst. Base 5KW", cogs: "Compra Paneles + Inverter Importado", fixed: "Planilla de Ingeniería y Cuadrilla Propia", capex: "Herramientas Pesadas y Vehículos Cuadrilla" },
    defaults: { primaryVolume: 20, primaryGrowth: 6, churn: 0, ticket: 4500000, cogs: 2800000, fixed: 10000000, capex: 30000000 }
  },
  
  // --- EXTRAS (HASTA 50) ---
  {
    category: "Educación", id: "academia_idiomas", name: "Instituto de Idiomas Offline", engineType: "subscription",
    labels: { primaryVolume: "Nuevos Alumnos", primaryGrowth: "Crecimiento Clientes", ticket: "Matricula Mensual", cogs: "Libros y Material", fixed: "Docentes y Alquiler", capex: "Aulas y Mobiliario" },
    defaults: { primaryVolume: 300, primaryGrowth: 2, churn: 5, ticket: 45000, cogs: 8000, fixed: 8000000, capex: 12000000 }
  },
  {
    category: "Entretenimiento", id: "salon_fiestas", name: "Salón de Eventos Infantiles", engineType: "volume",
    labels: { primaryVolume: "Cumpleaños / Fiestas Mensuales", primaryGrowth: "Rotación", ticket: "Precio de Fiesta (3hs)", cogs: "Animadores y Comida", fixed: "Alquiler Galpón Fiestas", capex: "Juegos Inflatables / Pelotero" },
    defaults: { primaryVolume: 20, primaryGrowth: 1, churn: 0, ticket: 350000, cogs: 80000, fixed: 3000000, capex: 25000000 }
  },
  {
    category: "Retail y Comercio", id: "concesionaria_autos", name: "Concesionaria de Autos Usados", engineType: "volume",
    labels: { primaryVolume: "Autos Vendidos", primaryGrowth: "Crecimiento de Ventas", ticket: "Valor Medio Vehículo Usado", cogs: "Precio de Compra al Dueño Anterior", fixed: "Alquiler Lote Comercial, Gestores", capex: "Capital para Stock Inicial Vehículos" },
    defaults: { primaryVolume: 10, primaryGrowth: 1, churn: 0, ticket: 12000000, cogs: 9000000, fixed: 8000000, capex: 100000000 }
  },
  {
    category: "Salud y Bienestar", id: "clinica_veterinaria", name: "Hospital Veterinario 24Hs", engineType: "volume",
    labels: { primaryVolume: "Pacientes Clínicos Mes", primaryGrowth: "Demanda", ticket: "Ticket Medio Consulta/Cirugía", cogs: "Drogas, Suturas, Laboratorio", fixed: "Medicos Guardias, Alquiler", capex: "Ecógrafo, Rayos X, Internación" },
    defaults: { primaryVolume: 400, primaryGrowth: 3, churn: 0, ticket: 60000, cogs: 15000, fixed: 12000000, capex: 80000000 }
  },
  {
    category: "Gastronomía", id: "panaderia_barrio", name: "Panadería y Confitería Clásica", engineType: "volume",
    labels: { primaryVolume: "Tickets Mensuales (Kilos+Docenas)", primaryGrowth: "Crec.", ticket: "Ticket de Compra Mediana", cogs: "Harina, Manteca, Levadura", fixed: "Maestro Panadero, Mostrador, Luz", capex: "Hornos Rotativos e Instalación" },
    defaults: { primaryVolume: 5500, primaryGrowth: 1, churn: 0, ticket: 4500, cogs: 1500, fixed: 5000000, capex: 40000000 }
  },
  {
    category: "Industria y Manufactura", id: "fabrica_plastico", name: "Inyectora de Plástico (B2B)", engineType: "volume",
    labels: { primaryVolume: "Toneladas Inyectadas", primaryGrowth: "Producción", ticket: "Precio Tonelada Plástico Manufacturado", cogs: "Costo Resina Polipropileno", fixed: "Alquiler Nave y Matrizeros", capex: "Máquinas Inyectoras, Matrices" },
    defaults: { primaryVolume: 15, primaryGrowth: 5, churn: 0, ticket: 4000000, cogs: 1800000, fixed: 12000000, capex: 250000000 }
  },
  {
    category: "Servicios Profesionales", id: "lavadero_industrial", name: "Lavadero Industrial B2B (Hoteles)", engineType: "subscription",
    labels: { primaryVolume: "Nuevos Hoteles/Mes", primaryGrowth: "Clientes", ticket: "Contrato Lavado Carga Mensual", cogs: "Detergente, Insumos y Logística", fixed: "Agua, Gas, Sueldo Operarios", capex: "Lavadoras/Planchadoras Industriales" },
    defaults: { primaryVolume: 8, primaryGrowth: 2, churn: 1, ticket: 800000, cogs: 250000, fixed: 4000000, capex: 60000000 }
  },
  {
    category: "Bienes Raíces (Real Estate)", id: "barrio_privado", name: "Loteo / Barrio Privado", engineType: "volume",
    labels: { primaryVolume: "Lotes Vendidos/Mes", primaryGrowth: "Tasa Velocidad", ticket: "Valor Medio Lote (USD->ARS)", cogs: "Trazado, Agua, Luz x Lote", fixed: "Mantenimiento Campo, Admin", capex: "Compra Fracción Tierra (Hectáreas)" },
    defaults: { primaryVolume: 3, primaryGrowth: 2, churn: 0, ticket: 40000000, cogs: 12000000, fixed: 8000000, capex: 450000000 }
  },
  {
    category: "Transporte y Logística", id: "buses_larga_distancia", name: "Línea de Buses Larga Distancia", engineType: "volume",
    labels: { primaryVolume: "Pasajeros x Mes", primaryGrowth: "Turismo", ticket: "Pasaje Promedio Fijo", cogs: "Combustible, Peajes x Viaje", fixed: "Sueldo Choferes, Terminales", capex: "Adquisición Micros Doble Piso" },
    defaults: { primaryVolume: 12000, primaryGrowth: 1, churn: 0, ticket: 55000, cogs: 22000, fixed: 150000000, capex: 800000000 }
  },
  {
    category: "Servicios Contratistas", id: "pozos_agua", name: "Perforación de Pozos de Agua", engineType: "volume",
    labels: { primaryVolume: "Perforaciones / Mes", primaryGrowth: "Campo", ticket: "Tarifa Perforación x Metro Prm.", cogs: "Costo Gasoil Maquinaria P/Obra", fixed: "Sueldo Perforistas Libres", capex: "Equipos de Perforación Móvil" },
    defaults: { primaryVolume: 8, primaryGrowth: 2, churn: 0, ticket: 2500000, cogs: 800000, fixed: 6000000, capex: 90000000 }
  },
  {
    category: "Tecnología y Software", id: "isp_fibra", name: "ISP (Proveedor Internet Fibra Óptica)", engineType: "subscription",
    labels: { primaryVolume: "Nuevas Conexiones", primaryGrowth: "Zona", ticket: "Abono Mensual Fibra", cogs: "Costo Megas Mayorista (Tránsito)", fixed: "Torreros, NOC y Cuadrillas Fijas", capex: "Tendido Fibra Óptica Inicial + OLT" },
    defaults: { primaryVolume: 150, primaryGrowth: 5, churn: 2, ticket: 22000, cogs: 5000, fixed: 18000000, capex: 150000000 }
  },
  {
    category: "Agro y Campo", id: "vivero_forestal", name: "Vivero Comercial / Forestal", engineType: "volume",
    labels: { primaryVolume: "Plantines / Árboles Verdidos", primaryGrowth: "Aumento Ventas", ticket: "Venta Mayorista Promedio", cogs: "Sustrato, Macetas, Fertilizante", fixed: "Ing Agronomo, Peones, INTA", capex: "Invernaderos y Riego Computarizado" },
    defaults: { primaryVolume: 25000, primaryGrowth: 4, churn: 0, ticket: 1800, cogs: 500, fixed: 6000000, capex: 40000000 }
  },
  {
    category: "Salud y Bienestar", id: "optica", name: "Óptica y Contactología", engineType: "volume",
    labels: { primaryVolume: "Anteojos Vendidos", primaryGrowth: "Demanda Ocular", ticket: "Precio Lente Armado + Marco", cogs: "Costo Laboratorio Optico", fixed: "Local Centro, Optómetra", capex: "Maquinaria Biseladora, Stock Marcos" },
    defaults: { primaryVolume: 350, primaryGrowth: 3, churn: 0, ticket: 120000, cogs: 55000, fixed: 5000000, capex: 45000000 }
  }
];
