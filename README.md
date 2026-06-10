# LeadFlow CRM

CRM para gestionar leads desde multiples fuentes (WhatsApp, Instagram, Facebook, Meta Ads, Formulario Web).

## Instalacion en Railway.app (Paso a paso)

### Paso 1: Subir codigo a GitHub

1. Entra a https://github.com
2. Crea un repositorio nuevo (boton verde "New")
3. Nombre: `leadflow-crm`
4. Visibilidad: Publico (para que Railway acceda gratis)
5. NO agregues README ni .gitignore (ya los tenemos)
6. Click en "Create repository"
7. Veras una pagina con comandos. Busca la seccion "...or push an existing repository from the command line"

Si ya tienes este codigo en tu computadora:
```bash
cd leadflow-crm
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/leadflow-crm.git
git push -u origin main
```

O si prefieres subir como ZIP:
1. En la pagina del repo, click en "Add file" > "Upload files"
2. Arrastra todos los archivos (excepto node_modules y dist)
3. Click "Commit changes"

### Paso 2: Crear proyecto en Railway

1. Entra a https://railway.app
2. Click "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Elige tu repositorio `leadflow-crm`
5. Railway detectara Node.js automaticamente y empezara a construir

### Paso 3: Agregar base de datos MySQL

1. En tu proyecto Railway, click en "New" o "+"
2. Selecciona "Database" > "Add MySQL"
3. Railway creara la base de datos automaticamente
4. Ve a la pestana "Variables" de tu servicio principal
5. Agrega una nueva variable:
   - Name: `DATABASE_URL`
   - Value: Copia el valor de `MYSQL_URL` de la base de datos (aparece automaticamente)

El formato debe ser:
```
mysql://usuario:password@host:puerto/base_de_datos
```

### Paso 4: Ejecutar migraciones de base de datos

1. En Railway, ve a tu servicio principal
2. Click en pestana "Deployments"
3. Click en "Deploy logs" del ultimo deployment
4. Espera que diga "Build successful"
5. Ve a la pestana "Shell" (icono de terminal)
6. Ejecuta:
```bash
npm run db:push
```

### Paso 5: Verificar instalacion

1. Railway te da un dominio automatico tipo `leadflow-crm.up.railway.app`
2. Abre ese URL en tu navegador
3. Deberias ver el CRM funcionando

### Variables de entorno necesarias

Ve a Settings > Variables en Railway y asegurate de tener:

| Variable | Valor | Origen |
|----------|-------|--------|
| `DATABASE_URL` | mysql://... | Copiar desde MYSQL_URL de la DB |
| `NODE_ENV` | production | Agregar manualmente |

### Webhook para n8n / Make.com

Una vez instalado, el endpoint para recibir leads es:

```
POST https://TU-DOMINIO-RAILWAY.app/api/trpc/webhook.ingest
```

Body (JSON):
```json
{
  "nombre": "Maria Gonzalez",
  "email": "maria@email.com",
  "telefono": "+5491123456789",
  "fuente": "meta-ads",
  "estado": "nuevo",
  "mensaje": "Vi la campana en Instagram",
  "campana": "Campana Junio 2026",
  "tags": "instagram, interes-alta"
}
```

### Comandos utiles

En Railway Shell:
- `npm run db:push` - Crear/actualizar tablas
- `npm run db:migrate` - Ejecutar migraciones

### Problemas comunes

**Error: Database connection refused**
- Verifica que DATABASE_URL tenga el valor correcto
- Asegurate que la base de datos MySQL este activa en Railway

**Error: Build failed**
- Ve a los logs de Railway para ver el error especifico
- Asegurate que todas las dependencias esten en package.json
