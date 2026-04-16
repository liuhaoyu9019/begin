#!/bin/bash

# 智能房贷计算器状态检查脚本

echo "📊 智能房贷计算器状态检查"
echo "================================"
echo ""

# 检查服务器进程
echo "🔍 检查服务器进程..."
PID_3000=$(lsof -t -i:3000 2>/dev/null)
PID_3001=$(lsof -t -i:3001 2>/dev/null)

if [ -n "$PID_3000" ]; then
    echo "✅ 服务器正在运行 (端口: 3000, PID: $PID_3000)"
    PORT=3000
elif [ -n "$PID_3001" ]; then
    echo "✅ 服务器正在运行 (端口: 3001, PID: $PID_3001)"
    PORT=3001
else
    echo "❌ 服务器未运行"
    echo ""
    echo "💡 提示：运行 ./start.sh 启动服务器"
    exit 0
fi

echo ""

# 检查网站可访问性
echo "🌐 检查网站可访问性..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/ 2>/dev/null)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ 网站可正常访问 (HTTP $HTTP_CODE)"
    
    # 获取页面标题
    TITLE=$(curl -s http://localhost:$PORT/ | grep -o '<title>[^<]*</title>' | sed 's/<title>//;s/<\/title>//')
    echo "📄 页面标题: $TITLE"
else
    echo "⚠️  网站访问异常 (HTTP $HTTP_CODE)"
fi

echo ""

# 显示访问信息
echo "📱 访问信息："
echo "   本地访问: http://localhost:$PORT"
echo "   局域网访问: http://$(hostname -I | awk '{print $1}'):$PORT"

echo ""
echo "🛠️  管理命令："
echo "   启动服务器: ./start.sh"
echo "   停止服务器: ./stop.sh"
echo "   查看状态: ./status.sh"

echo ""
echo "✅ 状态检查完成"