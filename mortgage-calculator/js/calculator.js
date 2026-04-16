// 房贷计算器核心逻辑
class MortgageCalculator {
    constructor() {
        this.initElements();
        this.bindEvents();
        this.calculate(); // 初始计算
    }

    initElements() {
        // 输入元素
        this.loanAmount = document.getElementById('loan-amount');
        this.loanTerm = document.getElementById('loan-term');
        this.interestRate = document.getElementById('interest-rate');
        this.rateType = document.getElementById('rate-type');
        this.discountRate = document.getElementById('discount-rate');
        
        // 还款方式
        this.repaymentMethod = document.querySelector('input[name="repayment-method"]:checked');
        
        // 标签页
        this.tabs = document.querySelectorAll('.tab');
        this.inputGroups = document.querySelectorAll('.input-group');
        
        // 结果元素
        this.monthlyPayment = document.getElementById('monthly-payment');
        this.totalInterest = document.getElementById('total-interest');
        this.totalPayment = document.getElementById('total-payment');
        this.resultLoanAmount = document.getElementById('result-loan-amount');
        this.resultLoanTerm = document.getElementById('result-loan-term');
        this.resultInterestRate = document.getElementById('result-interest-rate');
        this.resultRepaymentMethod = document.getElementById('result-repayment-method');
        this.repaymentPlan = document.getElementById('repayment-plan');
        
        // 按钮
        this.calculateBtn = document.getElementById('calculate-btn');
    }

    bindEvents() {
        // 标签页切换
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab));
        });

        // 利率类型切换
        this.rateType.addEventListener('change', () => this.handleRateTypeChange());

        // 还款方式切换
        document.querySelectorAll('input[name="repayment-method"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.repaymentMethod = radio;
                this.calculate();
            });
        });

        // 输入变化时实时计算
        const inputs = [this.loanAmount, this.loanTerm, this.interestRate, this.discountRate];
        inputs.forEach(input => {
            input.addEventListener('input', () => this.calculate());
        });

        // 计算按钮
        this.calculateBtn.addEventListener('click', () => this.calculate());
    }

    switchTab(selectedTab) {
        // 更新标签状态
        this.tabs.forEach(tab => tab.classList.remove('active'));
        selectedTab.classList.add('active');

        // 显示对应的输入区域
        const tabType = selectedTab.dataset.tab;
        this.inputGroups.forEach(group => {
            group.classList.remove('active');
            if (group.id === `${tabType}-inputs`) {
                group.classList.add('active');
            }
        });

        // 重新计算
        this.calculate();
    }

    handleRateTypeChange() {
        const isCustom = this.rateType.value === 'custom';
        this.interestRate.disabled = !isCustom;
        
        if (!isCustom) {
            // 设置为最新基准利率
            this.interestRate.value = '4.2';
        }
        
        this.calculate();
    }

    getInputValues() {
        const loanAmount = parseFloat(this.loanAmount.value) * 10000; // 万元转元
        const loanTerm = parseInt(this.loanTerm.value) * 12; // 年转月
        let interestRate = parseFloat(this.interestRate.value) / 100; // 百分比转小数
        const discount = parseFloat(this.discountRate.value);
        
        // 应用折扣
        interestRate = interestRate * discount;
        
        const method = this.repaymentMethod.value;
        
        return {
            loanAmount,
            loanTerm,
            interestRate,
            method
        };
    }

    calculateEqualPayment(loanAmount, monthlyRate, loanTerm) {
        // 等额本息计算公式
        if (monthlyRate === 0) {
            return loanAmount / loanTerm;
        }
        
        const factor = Math.pow(1 + monthlyRate, loanTerm);
        const monthlyPayment = loanAmount * monthlyRate * factor / (factor - 1);
        
        return monthlyPayment;
    }

    calculateEqualPrincipal(loanAmount, monthlyRate, loanTerm) {
        // 等额本金计算
        const monthlyPrincipal = loanAmount / loanTerm;
        const payments = [];
        
        for (let i = 0; i < loanTerm; i++) {
            const remainingPrincipal = loanAmount - (monthlyPrincipal * i);
            const monthlyInterest = remainingPrincipal * monthlyRate;
            const monthlyPayment = monthlyPrincipal + monthlyInterest;
            payments.push(monthlyPayment);
        }
        
        return payments;
    }

    generateRepaymentPlan(loanAmount, monthlyRate, loanTerm, method) {
        const plan = [];
        let remainingPrincipal = loanAmount;
        
        if (method === 'equal-payment') {
            // 等额本息还款计划
            const monthlyPayment = this.calculateEqualPayment(loanAmount, monthlyRate, loanTerm);
            
            for (let i = 1; i <= Math.min(12, loanTerm); i++) {
                const monthlyInterest = remainingPrincipal * monthlyRate;
                const monthlyPrincipal = monthlyPayment - monthlyInterest;
                remainingPrincipal -= monthlyPrincipal;
                
                plan.push({
                    period: i,
                    payment: monthlyPayment,
                    principal: monthlyPrincipal,
                    interest: monthlyInterest,
                    remaining: remainingPrincipal > 0 ? remainingPrincipal : 0
                });
            }
        } else {
            // 等额本金还款计划
            const monthlyPrincipal = loanAmount / loanTerm;
            
            for (let i = 1; i <= Math.min(12, loanTerm); i++) {
                const monthlyInterest = remainingPrincipal * monthlyRate;
                const monthlyPayment = monthlyPrincipal + monthlyInterest;
                remainingPrincipal -= monthlyPrincipal;
                
                plan.push({
                    period: i,
                    payment: monthlyPayment,
                    principal: monthlyPrincipal,
                    interest: monthlyInterest,
                    remaining: remainingPrincipal > 0 ? remainingPrincipal : 0
                });
            }
        }
        
        return plan;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('zh-CN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    formatNumber(amount) {
        return new Intl.NumberFormat('zh-CN').format(Math.round(amount));
    }

    calculate() {
        try {
            const { loanAmount, loanTerm, interestRate, method } = this.getInputValues();
            const monthlyRate = interestRate / 12;
            
            let monthlyPayment, totalInterest, totalPayment;
            
            if (method === 'equal-payment') {
                // 等额本息计算
                monthlyPayment = this.calculateEqualPayment(loanAmount, monthlyRate, loanTerm);
                totalPayment = monthlyPayment * loanTerm;
                totalInterest = totalPayment - loanAmount;
            } else {
                // 等额本金计算
                const payments = this.calculateEqualPrincipal(loanAmount, monthlyRate, loanTerm);
                totalPayment = payments.reduce((sum, payment) => sum + payment, 0);
                totalInterest = totalPayment - loanAmount;
                monthlyPayment = payments[0]; // 第一个月还款额
            }
            
            // 更新结果
            this.updateResults(loanAmount, loanTerm, interestRate, method, monthlyPayment, totalInterest, totalPayment);
            
            // 生成还款计划
            this.updateRepaymentPlan(loanAmount, monthlyRate, loanTerm, method);
            
        } catch (error) {
            console.error('计算错误:', error);
            this.showError('计算过程中出现错误，请检查输入值');
        }
    }

    updateResults(loanAmount, loanTerm, interestRate, method, monthlyPayment, totalInterest, totalPayment) {
        // 更新摘要结果
        this.monthlyPayment.textContent = this.formatCurrency(monthlyPayment);
        this.totalInterest.textContent = this.formatCurrency(totalInterest);
        this.totalPayment.textContent = this.formatCurrency(totalPayment);
        
        // 更新贷款详情
        this.resultLoanAmount.textContent = `${this.formatCurrency(loanAmount / 10000)} 万元`;
        this.resultLoanTerm.textContent = `${loanTerm / 12}年 (${loanTerm}期)`;
        this.resultInterestRate.textContent = `${(interestRate * 100).toFixed(2)}%`;
        this.resultRepaymentMethod.textContent = method === 'equal-payment' ? '等额本息' : '等额本金';
    }

    updateRepaymentPlan(loanAmount, monthlyRate, loanTerm, method) {
        const plan = this.generateRepaymentPlan(loanAmount, monthlyRate, loanTerm, method);
        
        // 清空现有内容
        this.repaymentPlan.innerHTML = '';
        
        // 添加新的还款计划行
        plan.forEach(item => {
            const row = document.createElement('tr');
            row.className = 'fade-in';
            
            row.innerHTML = `
                <td>第${item.period}期</td>
                <td>${this.formatCurrency(item.payment)}</td>
                <td>${this.formatCurrency(item.principal)}</td>
                <td>${this.formatCurrency(item.interest)}</td>
                <td>${this.formatCurrency(item.remaining)}</td>
            `;
            
            this.repaymentPlan.appendChild(row);
        });
    }

    showError(message) {
        // 在实际应用中，这里可以显示错误提示
        console.error(message);
    }
}

// 页面加载完成后初始化计算器
document.addEventListener('DOMContentLoaded', () => {
    const calculator = new MortgageCalculator();
    
    // 移动端菜单切换
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        });
        
        // 点击导航链接后关闭菜单（移动端）
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    navLinks.style.display = 'none';
                }
            });
        });
    }
    
    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // 响应式导航栏
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            navLinks.style.display = 'flex';
        } else {
            navLinks.style.display = 'none';
        }
    });
});

// 工具函数：格式化日期
function formatDate(date) {
    return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(date);
}

// 工具函数：验证输入
function validateInput(value, min, max) {
    const numValue = parseFloat(value);
    return !isNaN(numValue) && numValue >= min && numValue <= max;
}