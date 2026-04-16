#!/bin/bash

# 智能房贷计算器启动脚本

echo "🚀 启动智能房贷计算器..."
echo "📁 项目目录: $(pwd)"
echo ""

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误：Node.js 未安装"
    echo "请先安装 Node.js：https://nodejs.org/"
    exit 1
fi

# 检查是否在正确的目录
if [ ! -f "server.js" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 检查端口是否被占用
PORT=3000
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口 $PORT 已被占用，尝试使用其他端口..."
    PORT=3001
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
        echo "❌ 错误：端口 3000 和 3001 都被占用"
        echo "请手动关闭占用端口的进程或修改 server.js 中的端口号"
        exit 1
    fi
    # 修改端口号
    sed -i "s/const PORT = 3000;/const PORT = $PORT;/" server.js
    echo "✅ 已修改端口为: $PORT"
fi

echo "🔧 检查依赖..."
echo "✅ Node.js 版本: $(node --version)"
echo ""

echo "🌐 启动服务器..."
echo "----------------------------------------"
node server.js