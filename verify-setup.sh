#!/bin/bash
echo "=== IOT Project Status ==="
echo ""
echo "📁 Current Directory:"
pwd
echo ""
echo "🌿 Current Branch:"
git branch --show-current
echo ""
echo "📝 Latest Commits:"
git log --oneline -3
echo ""
echo "📦 Key Files Present:"
ls -lh src/pages/ | grep -E "tsx$" | awk '{print $9, "(" $5 ")"}'
echo ""
echo "🚀 Server Status:"
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "✅ Dev server is running at http://localhost:5173"
else
    echo "❌ Dev server is not running. Run: npm run dev"
fi
echo ""
echo "=== Setup Complete! ==="
