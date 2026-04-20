# Restart Next.js dev server
cd /home/project/tea-culture/cha-yuan/frontend && pkill -f "next dev" 2>/dev/null; sleep 2; nohup npm run dev > /tmp/nextjs.log 2>&1 & sleep 5 && echo "Frontend restarted"
