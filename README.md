# Control Financiero Personal 360°

Aplicación web integral de gestión financiera personal a **costo $0 perpetuo**. Diseñada para controlar gastos fijos recurrentes, compras en cuotas en tarjetas de crédito, consumos compartidos con terceros, deudas personales multidivisa (ARS/USD), portal de deudores y alertas preventivas automáticas por correo electrónico.

---

## 🚀 Características Principales

1. **Dashboard Mensual 360° (`/dashboard`):**
   - Selector interactivo de mes y año.
   - Cálculo consolidado de cuánto debes pagar de tu bolsillo vs cuánto deben transferirte terceros.
   - Cronograma cronológico de vencimientos día por día del mes.
2. **Métodos de Pago (`/metodos-pago`):**
   - Tarjetas de crédito bancarias, Mercado Crédito y tarjetas prestadas por terceros.
   - Seguimiento visual de días de cierre y fechas límite de vencimiento.
3. **Gastos Fijos Recurrentes (`/gastos-recurrentes`):**
   - Alquiler, servicios, expensas y suscripciones.
   - Actualización rápida de monto real al recibir la factura con cálculo de desvío presupuestario.
4. **Compras en Cuotas y Consumos Compartidos (`/transacciones`):**
   - Algoritmo exacto de cuotas con compensación de centavos remanentes en la 1° cuota.
   - Asignación de compras a familiares o amigos (beneficiarios) para separar gastos reales de lo a cobrar.
   - Barra interactiva de progreso de pago por cuota.
5. **Préstamos Personales Multidivisa (`/prestamos`):**
   - Registro de deudas en Pesos (**ARS**) y Dólares (**USD**).
   - Abonos parciales con recálculo automático de saldo restante y liquidación.
6. **Portal de Deudores y Estado de Cuenta Público (`/deudores` y `/estado-cuenta/[id]`):**
   - Agenda centralizada de cobros pendientes.
   - Enlace móvil compartible vía WhatsApp para que el deudor consulte sus compras y pagos acreditados en vivo sin necesidad de crear cuenta.
7. **Alertas Preventivas por Email (`/alertas`):**
   - Integración con **Resend** a costo $0.
   - Despacho automático 24 horas antes del vencimiento de facturas y cuotas.
   - Endpoint de cron (`/api/alerts/check-due-dates`) protegido con `CRON_SECRET`.

---

## 🛠️ Stack Tecnológico

- **Frontend & Framework:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4.
- **Base de Datos & Auth:** Supabase (PostgreSQL con Row Level Security y `@supabase/ssr`).
- **Servicio de Correos:** Resend (Free tier).
- **Pruebas Automatizadas:** Vitest (55 pruebas unitarias) y Playwright (17 pruebas E2E).

---

## 📦 Puesta en Marcha en Local

### 1. Clonar e Instalar Dependencias
```bash
git clone https://github.com/AgustinEGarcia/control-gastos-app.git
cd control-gastos-app
npm install
```

### 2. Variables de Entorno (`.env.local`)
Crea un archivo `.env.local` basado en `.env.example`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
RESEND_API_KEY=re_tu_api_key_de_resend
ALERT_EMAIL_FROM=Control Financiero <onboarding@resend.dev>
CRON_SECRET=tu_clave_secreta_para_el_cron
```

### 3. Configuración de Base de Datos en Supabase
Copia el script SQL completo ubicado en [`docs/OPENSPEC.md`](docs/OPENSPEC.md) y ejecútalo en el **SQL Editor** de tu proyecto en Supabase para crear las 8 tablas y sus políticas de Row Level Security (RLS).

### 4. Iniciar Servidor de Desarrollo
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🧪 Pruebas Automatizadas

```bash
# Pruebas Unitarias (Vitest)
npm test

# Pruebas End-to-End (Playwright)
npm run test:e2e
```

---

## 🌐 Despliegue en Producción (Vercel)

1. Conecta el repositorio a [Vercel](https://vercel.com).
2. Agrega las 4 variables de entorno en la configuración del proyecto:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `RESEND_API_KEY`
   - `CRON_SECRET`
3. El archivo `vercel.json` incluido activará automáticamente el Cron Job diario para la evaluación de alertas matutinas (08:00 AM hora argentina).
