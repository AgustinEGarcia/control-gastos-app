# Spec 008 — Dashboard Consolidado Mensual 360°
Estado: implementada

## Contexto, Usuarios e Historias
Como usuario de Control Financiero 360°, necesito una pantalla principal centralizada (Dashboard Mensual) que consolide en un solo vistazo la totalidad de mis obligaciones financieras para un mes específico (por defecto, el mes en curso): cuánto dinero debo desembolsar de mi bolsillo (gastos fijos + cuotas propias de tarjetas), cuánto dinero deben reembolsarme terceros (cuotas asignadas a deudores) y el cronograma ordenado día por día de todos los pagos que vencen en ese período.

- **HU-1:** Como usuario autenticado, quiero ver en la pantalla principal un resumen ejecutivo con: Total a Pagar Propio del mes, Total a Cobrar a Terceros del mes y Neto Financiero.
- **HU-2:** Como usuario, quiero poder cambiar de mes y año (ej. ver marzo 2026, abril 2026) para proyectar y anticipar mis obligaciones de meses futuros.
- **HU-3:** Como usuario, quiero un cronograma cronológico unificado que liste todos los vencimientos del mes seleccionado (gastos fijos y cuotas de tarjetas) ordenados por día del mes con su estado de pago.
- **HU-4:** Como usuario no autenticado, quiero ver la landing page institucional con acceso claro para iniciar sesión.

## Definiciones, Casos límite y Fuera de alcance
- **Definiciones:**
  - *Mes Seleccionado:* Par `(año, mes)` con base 1-12.
  - *Gastos Fijos del Mes:* Gastos activos (`is_active = true`), computando su monto real facturado (`actual_amount`) o estimado (`estimated_amount`), asignados al día `payment_day` de ese mes.
  - *Cuotas Propias del Mes:* Cuotas de transacciones donde `beneficiary_person_id` es nulo y su `due_date` cae dentro de ese mes.
  - *Cuotas Prestadas del Mes:* Cuotas de transacciones donde `beneficiary_person_id` está asignado a un tercero y su `due_date` cae dentro de ese mes.
  - *Total a Pagar Propio:* `Gastos Fijos + Cuotas Propias`.
  - *Total a Cobrar a Terceros:* `Cuotas Prestadas`.
- **Casos límite:**
  - Meses sin compras ni gastos: Muestra métricas en $0 y mensaje amigable de mes despejado.
  - Cuotas que abarcan cambio de año: Filtradas exactamente por `year` y `month` de `due_date`.
  - Días inválidos en meses cortos (ej. día 31 en febrero): Ajustados al último día del mes correspondiente.

## Requisitos No Funcionales y de Seguridad
- **RNF-1 (Performance):** Carga paralela de gastos, transacciones y personas mediante `Promise.all` para respuesta en menos de 500ms.
- **RNF-2 (Aesthetic):** Diseño financiero premium de alto impacto (KPI cards con gradientes sutiles, microanimaciones de progreso, selección fluida de meses).
- **RNF-3 (Costo $0):** Cálculos procesados en el cliente y cliente de Supabase sin servidores de cómputo adicionales.

## Requisitos Funcionales (EARS)
- **RF-1 (Permanente):** MIENTRAS el usuario autenticado visite el dashboard, EL SISTEMA presentará el resumen financiero consolidado del mes seleccionado.
- **RF-2 (Evento):** CUANDO el usuario cambie el mes o año en el selector, EL SISTEMA recalculará de inmediato todas las métricas y el cronograma de vencimientos.
- **RF-3 (Evento):** CUANDO un usuario no autenticado visite `/`, EL SISTEMA presentará la landing page informativa con acceso a login.
- **RF-4 (Permanente):** MIENTRAS se visualice el cronograma del mes, EL SISTEMA listará los compromisos ordenados cronológicamente por día, diferenciando gastos fijos de cuotas en tarjetas y compras compartidas.
