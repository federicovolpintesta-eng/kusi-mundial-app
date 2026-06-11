# 🏆 Kusi Mundial - Prode App Los Pinos

Plataforma interactiva de pronósticos deportivos (Prode) diseñada exclusivamente para el Hotel Resort **Los Pinos**. Permite a los huéspedes y al staff (empleados) competir de manera independiente prediciendo los resultados de los partidos del Mundial 2026.

## ✨ Características Principales

* **Entornos Separados:** Flujos de autenticación e interfaces totalmente divididos para Huéspedes (acceso por número de habitación) y Empleados (acceso por DNI/Pasaporte).
* **Leaderboards Independientes:** Tablas de posiciones automatizadas y exclusivas para cada grupo. 
* **Live Screens:** Pantallas en modo TV (1080p) diseñadas para proyectarse en atriles/tótems o televisores en vivo, mostrando los fixtures y los top 10 del ranking en tiempo real.
* **Panel de Administración:** Dashboard protegido (`/admin`) para la generación de reportes, filtrado de métricas (Staff vs Huéspedes) y exportación/impresión física (PDF/Papel) de los rankings.
* **Sistema de Puntajes:** Sistema inteligente que otorga 3 puntos por acierto exacto de goles, y 1 punto por acierto de ganador o empate.
* **Optimizado para Móviles:** Diseño *Mobile-First*, pensado para que el usuario escanee el QR en el hotel y participe al instante desde su celular con una UI moderna (Glassmorphism).

## 🛠️ Stack Tecnológico

* **Frontend:** Next.js 14, React, TailwindCSS, TypeScript.
* **Backend y Base de Datos:** Supabase (PostgreSQL) para persistencia de datos en la nube.
* **Despliegue (Hosting):** Vercel (Edge Network).
* **Activos Digitales:** Puppeteer (Generación de cartelería PDF y Carteles Digitales).

## 🚀 Instalación y Desarrollo Local

1. **Clonar el repositorio**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd kusi-mundial-app
   ```

2. **Instalar las dependencias**
   ```bash
   npm install
   ```

3. **Configurar Variables de Entorno**
   Crea un archivo `.env.local` en la raíz del proyecto y agrega tus llaves de Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_llave_anonima_de_supabase
   ```

4. **Ejecutar el servidor de desarrollo**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el resultado.

## 🗂 Estructura de Rutas

* `/` - Landing de acceso para Huéspedes.
* `/empleados` - Landing de acceso para el Staff.
* `/fixture` - Pantalla principal donde se cargan los pronósticos.
* `/admin` - Panel de control y reportes de impresión (protegido por contraseña).
* `/live` - Vista de solo lectura diseñada para proyectar en las pantallas de huéspedes.
* `/live-empleados` - Vista de solo lectura para las áreas comunes del staff.
* `/success` - Pantalla de confirmación luego de enviar el formulario.

## 📄 Licencia y Propiedad

Este software ha sido desarrollado a medida como una solución interna para el resort Los Pinos. Todos los derechos reservados.
