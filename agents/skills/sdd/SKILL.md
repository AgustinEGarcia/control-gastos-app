---
name: sdd
description: Úsala siempre que trabajes con Spec-Driven Development (docs/constitution.md o cualquier archivo dentro de specs/).
---

# Spec-Driven Development (SDD)

## Flujo
Constitución → Spec → Clarificación → Plan → Tareas → Implementación → Validación → Cambio.
- Nunca pases a la siguiente fase sin aprobación.
- La spec manda: si no está en la spec, no se implementa.
- Todo cambio de requisitos va primero a la spec, luego al plan/tareas, y por último al código.
- Cada spec vive en: specs/NNN-nombre/ con spec.md, plan.md y tasks.md.
- Actualiza MEMORY.md al cambiar de fase.

## Plantilla de spec (spec.md)
# Spec NNN — <Nombre>
Estado: borrador | aprobada | implementada

## Contexto, Usuarios e Historias (HU-1)
## Definiciones, Casos límite y Fuera de alcance
## Requisitos no funcionales y de Seguridad (Cifrado, Rate limits, Autenticación)
## Requisitos Funcionales (EARS)
- RF-x: CUANDO <evento>, EL SISTEMA <respuesta>.
- RF-x: SI <condición no deseada>, ENTONCES EL SISTEMA <respuesta>.

## Plan (plan.md) y Tareas (tasks.md)
Plan: Funciones puras, pseudocódigo, Interfaz (o endpoints API si es backend), justificaciones.
Tareas: - [ ] **Tn. <Descripción>.** Hecho cuando: <comprobación>. Máx 30 min.

## Implementación
Una tarea por vez: tests en rojo, código, correr tests del stack en verde, marcar y parar.
