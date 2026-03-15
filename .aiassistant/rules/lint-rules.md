---
apply: always
---

# Reglas de Calidad y Estilo de Código (Linting & Formatting)

Este proyecto utiliza una combinación de **Prettier**, **ESLint** y **TypeScript (tsconfig)** para garantizar la calidad y consistencia del código. Al generar o modificar código, se deben seguir estrictamente estas reglas para evitar errores del linter.

## 1. Formateo (Prettier)
Basado en `.prettierrc`:
- **Indentación**: Usar 4 espacios (`tabWidth: 4`). No usar tabs (`useTabs: false`).
- **Ancho de línea**: Máximo 100 caracteres (`printWidth: 100`).
- **Comillas**: Usar comillas dobles (`"`) por defecto (`singleQuote: false`).
- **Punto y coma**: Siempre incluir punto y coma al final de las sentencias (`semi: true`).
- **Espaciado en objetos**: Incluir espacios entre llaves (`bracketSpacing: true`), ej: `{ key: value }`.
- **Paréntesis en funciones flecha**: Siempre incluirlos, incluso para un solo argumento (`arrowParens: "always"`), ej: `(x) => x`.
- **Fin de línea**: Automático (`endOfLine: "auto"`).

## 2. Reglas de TypeScript y ESLint
Basado en `eslint.config.mjs` y `tsconfig.json`:

### Tipado Estricto
- **Devolución de funciones**: Todas las funciones deben tener un tipo de retorno explícito (`@typescript-eslint/explicit-function-return-type: "error"`).
- **Accesibilidad de miembros**: Siempre especificar la accesibilidad (`public`, `private`, `protected`) en miembros de clases (`@typescript-eslint/explicit-member-accessibility: "error"`).
- **Importación de tipos**: Usar `import type` cuando solo se necesiten tipos para mejorar la eficiencia y evitar ciclos (`@typescript-eslint/consistent-type-imports: "error"`).
- **No Implicit Any**: No se permite el uso de `any` implícito (`noImplicitAny: true`).
- **Strict Null Checks**: Se deben manejar explícitamente los valores nulos y no definidos (`strictNullChecks: true`).

### Estilo de Código
- **Decoradores**: El proyecto utiliza decoradores de NestJS (`experimentalDecorators: true`, `emitDecoratorMetadata: true`).
- **Paths (Alias)**: Usar los alias definidos en `tsconfig.json`:
  - `@app/*` para archivos dentro de `./src/*`.
  - `@root/*` para archivos en la raíz del proyecto.
- **Clases Extranjeras**: Se permiten clases sin métodos o con solo estáticos si es necesario (`@typescript-eslint/no-extraneous-class: "off"`).

## 3. Guía de Aplicación
- Al crear una nueva clase (ej. un Gateway de NestJS), asegúrate de que todos los métodos tengan su modificador de acceso y su tipo de retorno.
- Al importar servicios o DTOs de otros módulos, utiliza el alias `@app/`.
- Prioriza las configuraciones de TypeScript `strictTypeChecked` y `stylisticTypeChecked` heredadas en el linter.
