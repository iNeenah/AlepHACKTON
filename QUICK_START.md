# ⚡ Quick Start Guide

¿Quieres probar el Carbon Credit Marketplace rápidamente? ¡Aquí tienes las opciones más rápidas!

## 🚀 Deploy Instantáneo (1 clic)

### Opción 1: Deploy a Vercel (Recomendado)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/iNeenah/AlepHACKTON/tree/main/hackaton)

1. Haz clic en el botón de arriba
2. Conecta tu cuenta de GitHub
3. Configura las variables de entorno (opcional para demo)
4. ¡Deploy automático en 2-3 minutos!

### Opción 2: Deploy a Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/iNeenah/AlepHACKTON)

## 💻 Desarrollo Local (5 minutos)

### Setup Automático
```bash
git clone https://github.com/iNeenah/AlepHACKTON.git
cd AlepHACKTON/hackaton
npm run setup
```

### Setup Manual
```bash
# 1. Clonar repositorio
git clone https://github.com/iNeenah/AlepHACKTON.git
cd AlepHACKTON/hackaton

# 2. Instalar dependencias
npm install

# 3. Configurar entorno
cp .env.example .env.local

# 4. Compilar contratos
npm run compile

# 5. Iniciar blockchain local
npx hardhat node

# 6. En otra terminal: Deploy contratos
npm run deploy:localhost

# 7. Crear datos de demo
npm run demo-data

# 8. Iniciar aplicación
npm run dev
```

## 🐳 Docker (1 comando)

```bash
git clone https://github.com/iNeenah/AlepHACKTON.git
cd AlepHACKTON/hackaton
docker-compose up
```

## 📱 Demo Online

Si solo quieres ver cómo funciona:
- **Live Demo**: [Próximamente]
- **Video Demo**: [Próximamente]
- **Screenshots**: Ver carpeta `/docs/screenshots`

## 🎯 Para Hackathons

### Presentación Rápida (2 minutos)
1. Abre [Vercel Deploy](https://vercel.com/new/clone?repository-url=https://github.com/iNeenah/AlepHACKTON/tree/main/hackaton)
2. Deploy automático
3. Muestra la aplicación funcionando
4. Explica las características principales

### Demo Completo (10 minutos)
1. Setup local con `npm run setup`
2. Muestra el código de los smart contracts
3. Demuestra la funcionalidad completa
4. Explica la integración con Symbiotic

## 🔧 Configuración Mínima

Para que funcione solo necesitas:
- Node.js 18+
- npm
- Un navegador moderno

¡Eso es todo! El resto se configura automáticamente.

## 🆘 ¿Problemas?

### Errores Comunes

**Error: Module not found**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Error: Port 3000 already in use**
```bash
npm run dev -- --port 3001
```

**Error: Cannot connect to blockchain**
- Asegúrate de que `npx hardhat node` esté corriendo
- Verifica que MetaMask esté conectado a localhost:8545

### Soporte Rápido
- 💬 Discord: [Únete aquí](https://discord.gg/carboncredit)
- 📧 Email: team@carboncreditmarketplace.com
- 🐛 Issues: [GitHub Issues](https://github.com/iNeenah/AlepHACKTON/issues)

## 🏆 Características Destacadas

- ✅ **Smart Contracts Seguros** - OpenZeppelin + Hardhat
- ✅ **UI Moderna** - Next.js + Tailwind CSS
- ✅ **Integración Symbiotic** - Vaults y staking
- ✅ **Responsive Design** - Funciona en móvil
- ✅ **Deploy Automático** - CI/CD con GitHub Actions
- ✅ **Documentación Completa** - Guías paso a paso

---

**¡Empieza en menos de 5 minutos! 🚀**