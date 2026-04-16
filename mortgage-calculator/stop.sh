#!/bin/bash

# 智能房贷计算器停止脚本

echo "🛑 停止智能房贷计算器服务器..."
echo ""

# 查找并停止服务器进程
PID=$(lsof -t -i:3000 2>/dev/null)
if [ -z "$PID" ]; then
    PID=$(lsof -t -i:3001 2>/dev/null)
fi

if [ -n "$PID" ]; then
    echo "📊 找到服务器进程: PID $PID"
    echo "正在停止进程..."
    kill $PID 2>/dev/null
    
    # 等待进程停止
    sleep 1
    
    # 检查是否成功停止
    if ps -p $PID > /dev/null 2>&1; then
        echo "⚠️  进程仍在运行，强制停止..."
        kill -9 $PID 2>/dev/null
        sleep 1
    fi
    
    if ! ps -p $PID > /dev/null 2>&1; then
        echo "✅ 服务器已成功停止"
    else
        echo "❌ 无法停止服务器进程"
        exit 1
    fi
else
    echo "ℹ️  未找到运行的服务器进程"
fi

echo ""
echo "👋 再见！"