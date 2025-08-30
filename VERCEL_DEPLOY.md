# 🚀 Deploy to Vercel Guide

Esta guía te ayudará a desplegar tu Carbon Credit Marketplace en Vercel de forma rápida y sencilla.

## 🌟 ¿Por qué Vercel?

- ✅ **Integración perfecta con Next.js** - Optimizaciones automáticas
- ✅ **Deploy automático desde GitHub** - Push y deploy instantáneo
- ✅ **CDN global** - Performance mundial
- ✅ **HTTPS automático** - Certificados SSL gratis
- ✅ **Preview deployments** - Testing de PRs automático
- ✅ **Gratis para proyectos open source** - Perfecto para hackathons

## 🚀 Pasos para Deploy

### 1. Preparar el Repositorio

Asegúrate de que tu código esté en GitHub:
```bash
git add .
git commit -m "🚀 Ready for Vercel deployment"
git push origin main
```

### 2. Crear Cuenta en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en "Sign Up"
3. Conecta con tu cuenta de GitHub
4. Autoriza a Vercel para acceder a tus repositorios

### 3. Importar Proyecto

1. En el dashboard de Vercel, haz clic en "New Project"
2. Busca tu repositorio `iNeenah/AlepHACKTON`
3. Haz clic en "Import"
4. Configura el directorio raíz como `hackaton`

### 4. Configurar Variables de Entorno

En la sección "Environment Variables" de Vercel, añade:

```bash
# Blockchain Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_NETWORK_ID=1337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_CHAIN_NAME=Localhost

# Para producción, usa:
# NEXT_PUBLIC_CONTRACT_ADDRESS=tu_contrato_mainnet
# NEXT_PUBLIC_NETWORK_ID=1
# NEXT_PUBLIC_RPC_URL=https://mainnet.infura.io/v3/tu_project_id
# NEXT_PUBLIC_CHAIN_NAME=Ethereum Mainnet

# App Configuration
NEXT_PUBLIC_APP_NAME=Carbon Credit Marketplace
NEXT_PUBLIC_APP_DESCRIPTION=Decentralized carbon credit trading powered by Symbiotic Protocol
```

### 5. Configurar Build Settings

Vercel debería detectar automáticamente que es un proyecto Next.js, pero verifica:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

### 6. Deploy

1. Haz clic en "Deploy"
2. Espera a que termine el build (2-3 minutos)
3. ¡Tu app estará live en una URL como `https://alep-hackton-git-main-ineenahs-projects.vercel.app`!

## 🔧 Configuración Avanzada

### Custom Domain

1. Ve a tu proyecto en Vercel
2. Haz clic en "Settings" → "Domains"
3. Añade tu dominio personalizado
4. Configura los DNS según las instrucciones

### Environment Variables por Entorno

```bash
# Development
NEXT_PUBLIC_NETWORK_ID=1337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545

# Preview (para PRs)
NEXT_PUBLIC_NETWORK_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/tu_project_id

# Production
NEXT_PUBLIC_NETWORK_ID=1
NEXT_PUBLIC_RPC_URL=https://mainnet.infura.io/v3/tu_project_id
```

### Webhooks para Deploy Automático

Vercel automáticamente hace deploy cuando:
- Haces push a `main` (production)
- Abres un PR (preview deployment)
- Haces push a cualquier branch (branch deployment)

## 📊 Monitoring y Analytics

### Vercel Analytics

1. Ve a tu proyecto en Vercel
2. Haz clic en "Analytics"
3. Habilita "Web Analytics"
4. Añade el script a tu app (ya incluido en el layout)

### Performance Monitoring

Vercel automáticamente monitorea:
- ✅ Core Web Vitals
- ✅ Build times
- ✅ Function execution
- ✅ Bandwidth usage

## 🐛 Troubleshooting

### Build Errors

**Error: Module not found**
```bash
# Solución: Verificar imports y dependencias
npm install
npm run build
```

**Error: Environment variables not found**
```bash
# Solución: Verificar variables en Vercel dashboard
# Settings → Environment Variables
```

### Runtime Errors

**Error: Cannot connect to wallet**
- Verifica que las variables de entorno estén configuradas
- Asegúrate de usar HTTPS en producción

**Error: Contract not found**
- Verifica que `NEXT_PUBLIC_CONTRACT_ADDRESS` sea correcta
- Asegúrate de que el contrato esté desplegado en la red correcta

## 🚀 Deploy Commands

### Deploy desde CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Deploy con variables específicas
vercel --prod --env NEXT_PUBLIC_NETWORK_ID=1
```

### Deploy Automático con GitHub Actions

El archivo `.github/workflows/ci.yml` ya incluye deploy automático a Vercel.

## 🔗 URLs Útiles

Después del deploy tendrás:

- **Production**: `https://tu-proyecto.vercel.app`
- **Preview**: `https://tu-proyecto-git-branch.vercel.app`
- **Dashboard**: `https://vercel.com/dashboard`

## 📱 Testing en Móvil

Vercel genera automáticamente:
- QR codes para testing móvil
- URLs de preview para cada commit
- Testing en diferentes dispositivos

## 🎯 Optimizaciones Automáticas

Vercel optimiza automáticamente:
- ✅ **Image Optimization** - Compresión y formatos modernos
- ✅ **Code Splitting** - Carga solo el código necesario
- ✅ **Edge Functions** - Ejecución cerca del usuario
- ✅ **Static Generation** - Pre-renderizado de páginas
- ✅ **CDN Global** - Distribución mundial

## 🔐 Security Headers

Ya configurados en `vercel.json`:
- Content Security Policy
- X-Frame-Options
- X-XSS-Protection
- Referrer Policy

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Vercel dashboard
2. Consulta la [documentación de Vercel](https://vercel.com/docs)
3. Únete a nuestro Discord para ayuda

---

**¡Tu Carbon Credit Marketplace estará live en minutos! 🌱✨**