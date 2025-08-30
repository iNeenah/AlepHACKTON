# 🌱 Carbon Credit Marketplace

## Descripción

Un marketplace descentralizado de **créditos de carbono** construido en blockchain para promover la sostenibilidad ambiental. Los usuarios pueden comprar, vender y retirar créditos de carbono verificados como NFTs (ERC-721).

## ✨ Características Principales

### 🎯 Core Features
- **Minteo de NFTs**: Creación de créditos de carbono como tokens únicos
- **Marketplace**: Compra y venta descentralizada de créditos
- **Retiro de Créditos**: Sistema para compensar emisiones permanentemente
- **Verificación**: Sistema de verificadores autorizados
- **Web3 Integration**: Conexión con MetaMask y otras wallets

### 🚀 Características Avanzadas
- **Dashboard Interactivo**: Estadísticas en tiempo real con gráficos
- **Animaciones Espectaculares**: UI/UX con efectos visuales impresionantes
- **Sistema de Notificaciones**: Feedback en tiempo real con efectos sonoros
- **Responsive Design**: Optimizado para móvil y desktop
- **Multi-language**: Interfaz en español

## 🛠 Tech Stack

### Backend/Blockchain
- **Solidity ^0.8.20**: Smart contracts
- **OpenZeppelin**: Contratos seguros y auditados
- **Hardhat**: Desarrollo, testing y deployment
- **Ethers.js v6**: Interacción con blockchain

### Frontend
- **Next.js 14**: React framework con SSR
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Estilos modernos y responsivos
- **React Hooks**: Estado y efectos
- **Web3Modal**: Conexión con wallets

## 📦 Instalación y Setup

### Prerrequisitos
- Node.js v18+
- npm o yarn
- MetaMask o wallet compatible
- Git

### 1. Clonar el Repositorio
```bash
git clone <tu-repositorio>
cd crysdfsd
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Compilar Contratos
```bash
npm run compile
```

### 4. Iniciar Red Local
```bash
npx hardhat node
```

### 5. Desplegar Contratos
```bash
npm run deploy
```

### 6. Generar Datos de Demo
```bash
npx hardhat run scripts/demoData.js --network localhost
```

### 7. Iniciar Frontend
```bash
npm run dev
```

### 8. Abrir Aplicación
Visita: `http://localhost:3000`

## 🎮 Cómo Usar

### Para Usuarios
1. **Conectar Wallet**: Click en "Conectar Wallet"
2. **Explorar Marketplace**: Ver créditos disponibles
3. **Comprar Créditos**: Click en "Comprar Crédito"
4. **Ver Portfolio**: Pestaña "Mis Créditos"
5. **Retirar Créditos**: Para compensar emisiones
6. **Ver Estadísticas**: Dashboard avanzado

### Para Verificadores
1. **Conectar como Verificador**: Usar cuenta autorizada
2. **Mint Créditos**: Pestaña "Crear Nuevo"
3. **Completar Formulario**: Detalles del proyecto
4. **Confirmar Transacción**: Aprobar en wallet

## 🏗 Arquitectura

### Smart Contract (CarbonCreditNFT.sol)
```
📋 Funciones Principales:
├── mintCarbonCredit()    # Crear nuevos créditos
├── listForSale()         # Poner en venta
├── buyCarbonCredit()     # Comprar crédito
├── retireCarbonCredit()  # Retirar/usar crédito
├── getTokensByOwner()    # Obtener tokens del usuario
└── getTokensForSale()    # Obtener tokens en venta
```

### Frontend Components
```
📁 components/
├── CarbonCreditCard.tsx    # Tarjeta de crédito individual
├── MintCarbonCredit.tsx    # Formulario de creación
├── AdvancedStats.tsx       # Dashboard de estadísticas
├── NotificationSystem.tsx  # Sistema de notificaciones
├── Navbar.tsx              # Navegación principal
└── Web3Provider.tsx        # Contexto Web3
```

## 🎨 Características Visuales

### Efectos Impresionantes
- **Gradientes Animados**: Backgrounds dinámicos
- **Hover Effects**: Transformaciones suaves
- **Loading States**: Animaciones de carga
- **Progress Bars**: Indicadores de progreso
- **Glow Effects**: Efectos de brillo
- **Glass Morphism**: Efectos de cristal

### Animaciones CSS
- `animate-float`: Flotación suave
- `animate-pulse-slow`: Pulso lento
- `animate-slide-up`: Deslizamiento hacia arriba
- `holographic`: Texto holográfico
- `neon-text`: Texto con neón

## 📊 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run start        # Servidor de producción
npm run lint         # Linter
npm run compile      # Compilar contratos
npm run test         # Ejecutar tests
npm run deploy       # Desplegar contratos
```

## 🔧 Configuración de Red

### Red Local (Default)
```javascript
Chain ID: 1337
RPC URL: http://127.0.0.1:8545
Contract: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### Testnet (Sepolia)
```javascript
Chain ID: 11155111
RPC URL: [Tu URL de Sepolia]
```

## 🏆 Para Hackathons

### Demo Quick Start
1. Ejecuta todos los comandos de instalación
2. El proyecto incluye datos de demostración
3. Presenta estas características:
   - ✅ Smart contracts seguros
   - ✅ UI/UX impresionante
   - ✅ Funcionalidad completa
   - ✅ Dashboard avanzado
   - ✅ Responsive design

### Puntos Destacados
- **Impacto Social**: Combate el cambio climático
- **Tecnología Avanzada**: Blockchain + React
- **UX Excepcional**: Animaciones y efectos
- **Funcionalidad Completa**: Marketplace funcional
- **Escalabilidad**: Arquitectura modular

## 🌍 Casos de Uso

1. **Empresas**: Compensar su huella de carbono
2. **Individuos**: Offset personal de emisiones
3. **Proyectos Verdes**: Monetizar captura de carbono
4. **Inversores**: Trading de activos ambientales
5. **Gobiernos**: Políticas de carbono neutro

## 🔮 Roadmap Futuro

- [ ] Integración con IPFS para metadatos
- [ ] Soporte multi-chain (Polygon, BSC)
- [ ] Sistema de staking de créditos
- [ ] API para terceros
- [ ] Mobile app nativa
- [ ] Integración con exchanges

## 🤝 Contribución

1. Fork el proyecto
2. Crea una branch (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Add nueva característica'`)
4. Push a la branch (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📄 Licencia

MIT License - ve [LICENSE](LICENSE) para detalles.

## 🎯 Contacto

**Proyecto**: Carbon Credit Marketplace  
**Desarrollado para**: Hackathon Blockchain  
**Tecnologías**: Solidity, Next.js, TypeScript, Tailwind CSS  

---

⭐ **¡Si te gusta el proyecto, dale una estrella!** ⭐