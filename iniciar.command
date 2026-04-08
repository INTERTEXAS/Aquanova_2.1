#!/bin/bash
# ─────────────────────────────────────────────
#  AQUANOVA — Lanzador automático
# ─────────────────────────────────────────────

cd "$(dirname "$0")"

PUERTO_BACKEND=3000
PUERTO_FRONTEND=5173
SLIM_LOG="/tmp/aquanova-slim.log"
SERVER_LOG="/tmp/aquanova-server.log"

CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
RESET='\033[0m'
BOLD='\033[1m'

echo ""
echo -e "${CYAN}${BOLD}  ╔═══════════════════════════════╗${RESET}"
echo -e "${CYAN}${BOLD}  ║     AQUANOVA v12.1            ║${RESET}"
echo -e "${CYAN}${BOLD}  ║     Iniciando sistema...      ║${RESET}"
echo -e "${CYAN}${BOLD}  ╚═══════════════════════════════╝${RESET}"
echo ""

# ── Verificar Node.js ─────────────────────────
if ! command -v node &> /dev/null; then
  echo -e "${RED}  ✗ Node.js no encontrado. Instálalo en https://nodejs.org${RESET}"
  read -p "  Presiona Enter para cerrar..."
  exit 1
fi
echo -e "${GREEN}  ✓ Node.js $(node -v)${RESET}"

# ── Liberar puertos previos ───────────────────
echo -e "${YELLOW}  → Liberando puertos anteriores...${RESET}"
lsof -ti :$PUERTO_BACKEND | xargs kill -9 2>/dev/null
lsof -ti :$PUERTO_FRONTEND | xargs kill -9 2>/dev/null
sleep 1

# ── Instalar slim.sh si no está ───────────────
if ! command -v slim &> /dev/null; then
  echo -e "${YELLOW}  → Instalando slim.sh...${RESET}"
  curl -sL https://slim.sh/install.sh | sh
  export PATH="$HOME/.slim/bin:$PATH"
fi
echo -e "${GREEN}  ✓ slim.sh disponible${RESET}"

# ── Verificar dependencias node ───────────────
if [ ! -d "node_modules" ] || [ ! -d "node_modules/express" ]; then
  echo -e "${YELLOW}  → Instalando dependencias npm...${RESET}"
  npm install
fi
echo -e "${GREEN}  ✓ Dependencias listas${RESET}"

# ── Iniciar servidor Express ──────────────────
echo -e "${CYAN}  → Iniciando servidor Express (puerto $PUERTO_BACKEND)...${RESET}"
node server.js > "$SERVER_LOG" 2>&1 &
BACKEND_PID=$!

MAX=20; I=0
while ! lsof -ti :$PUERTO_BACKEND &>/dev/null; do
  sleep 0.5; I=$((I+1))
  if [ $I -ge $MAX ]; then
    echo -e "${RED}  ✗ El servidor no respondió. Revisa tu .env o base de datos.${RESET}"
    cat "$SERVER_LOG"
    read -p "  Presiona Enter para cerrar..."
    exit 1
  fi
done
echo -e "${GREEN}  ✓ Servidor Express activo (PID $BACKEND_PID)${RESET}"

# ── Iniciar Vite ──────────────────────────────
echo -e "${CYAN}  → Iniciando Vite (puerto $PUERTO_FRONTEND)...${RESET}"
npm run dev > /tmp/aquanova-vite.log 2>&1 &
FRONTEND_PID=$!

I=0
while ! lsof -ti :$PUERTO_FRONTEND &>/dev/null; do
  sleep 0.5; I=$((I+1))
  if [ $I -ge $MAX ]; then
    echo -e "${RED}  ✗ Vite no respondió.${RESET}"
    kill $BACKEND_PID 2>/dev/null
    read -p "  Presiona Enter para cerrar..."
    exit 1
  fi
done
echo -e "${GREEN}  ✓ Vite activo (PID $FRONTEND_PID)${RESET}"

# ── Iniciar slim tunnel ───────────────────────
echo -e "${CYAN}  → Creando túnel público con slim.sh...${RESET}"
> "$SLIM_LOG"
slim share --port $PUERTO_FRONTEND > "$SLIM_LOG" 2>&1 &
SLIM_PID=$!

# Esperar y extraer el link real del output de slim
URL_PUBLICA=""
I=0
while [ -z "$URL_PUBLICA" ]; do
  sleep 0.8; I=$((I+1))
  # slim.sh imprime líneas como: "https://xxxxx.slim.show"
  URL_PUBLICA=$(grep -oE 'https://[a-zA-Z0-9._-]+\.slim\.show' "$SLIM_LOG" 2>/dev/null | head -1)
  if [ $I -ge 20 ]; then
    echo -e "${YELLOW}  ⚠  No se pudo obtener el link de slim (revisa tu conexión)${RESET}"
    URL_PUBLICA="(no disponible)"
    break
  fi
done

# ── Abrir navegador ───────────────────────────
open "http://localhost:$PUERTO_FRONTEND"

# ── Panel final ───────────────────────────────
echo ""
echo -e "${CYAN}${BOLD}  ╔══════════════════════════════════════════════════╗${RESET}"
echo -e "${CYAN}${BOLD}  ║         ✓  AQUANOVA CORRIENDO                   ║${RESET}"
echo -e "${CYAN}${BOLD}  ╠══════════════════════════════════════════════════╣${RESET}"
echo -e "${CYAN}${BOLD}  ║${RESET}  Local    →  http://localhost:$PUERTO_FRONTEND              ${CYAN}${BOLD}║${RESET}"
echo -e "${CYAN}${BOLD}  ║${RESET}  API      →  http://localhost:$PUERTO_BACKEND               ${CYAN}${BOLD}║${RESET}"
echo -e "${CYAN}${BOLD}  ║${RESET}  Público  →  ${GREEN}${BOLD}$URL_PUBLICA${RESET}  ${CYAN}${BOLD}║${RESET}"
echo -e "${CYAN}${BOLD}  ╠══════════════════════════════════════════════════╣${RESET}"
echo -e "${CYAN}${BOLD}  ║${RESET}  Comparte el link público con tu clase           ${CYAN}${BOLD}║${RESET}"
echo -e "${CYAN}${BOLD}  ║${RESET}  Cierra esta ventana para detener todo           ${CYAN}${BOLD}║${RESET}"
echo -e "${CYAN}${BOLD}  ╚══════════════════════════════════════════════════╝${RESET}"
echo ""

# ── Limpiar al cerrar ─────────────────────────
trap "
  echo ''
  echo -e '${YELLOW}  Deteniendo AQUANOVA...${RESET}'
  kill $BACKEND_PID $FRONTEND_PID $SLIM_PID 2>/dev/null
  echo -e '${GREEN}  ✓ Sistema detenido.${RESET}'
  exit 0
" SIGINT SIGTERM

wait $BACKEND_PID $FRONTEND_PID
