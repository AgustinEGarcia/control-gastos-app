# Constitución del Proyecto: Control Financiero Personal 360°

Este documento establece los 6 principios innegociables que gobiernan la arquitectura, desarrollo y decisiones del sistema.

## 1. Principio de Costo $0 (Zero-Cost Infrastructure)
La aplicación debe operar de forma perpetua sin costos fijos obligatorios. Toda la arquitectura se basa en niveles gratuitos generosos (Next.js en Vercel, base de datos y autenticación en Supabase Free Tier, envío de correos vía Resend). Cualquier nueva dependencia de infraestructura debe ser libre de costo.

## 2. Principio de Seguridad y Privacidad Zero Trust
Los datos financieros son de máxima sensibilidad:
- Ninguna operación en base de datos debe saltarse las políticas de Row Level Security (RLS) de Supabase.
- Todo dato proveniente del usuario debe validarse y sanitizarse rigurosamente tanto en cliente como en servidor.
- Queda terminantemente prohibido almacenar o exponer tokens, claves privadas o contraseñas en código o repositorios.

## 3. Principio de Metodología SDD (Spec-Driven Development)
La especificación manda sobre el código:
- Ninguna funcionalidad se codifica sin antes contar con su correspondiente especificación en `specs/NNN-*/spec.md` con sintaxis EARS aprobada.
- Cualquier cambio de requisitos impacta primero en la spec y en el plan antes de tocar el código fuente.

## 4. Principio de Calidad y Anti-Regresión Continua
La integridad matemática y operativa es vital:
- Todo cálculo financiero (cuotas, conversiones ARS/USD, amortizaciones, estados de cuenta) debe estar cubierto por pruebas unitarias automatizadas con Vitest.
- Los flujos críticos de usuario (registro de gastos, vistas de deudores, login) deben validarse de extremo a extremo con Playwright.
- Todo commit debe pasar `npm test` antes de ser integrado.

## 5. Principio de Experiencia de Usuario y Estética Premium
El producto no es un MVP rústico ni genérico:
- La interfaz debe transmitir profesionalismo, confianza y dinamismo visual (Tailwind CSS, microinteracciones fluidas, tipografía moderna, modo oscuro armónico).
- Respuestas de UI instantáneas con estados de carga optimistas y feedback claro ante errores.

## 6. Principio de Idioma y Claridad Absoluta
- Todo texto de la aplicación, mensajes de error, confirmaciones, documentación y diálogos del agente deben estar redactados 100% en idioma Español.
- La terminología técnica solo se mantendrá en inglés si es el estándar universal en programación (ej. *pull request*, *deploy*, *commit*).
