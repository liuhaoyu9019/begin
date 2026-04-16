// 房贷计算器核心逻辑
class MortgageCalculator {
    constructor() {
        this.initElements();
        this.bindEvents();
        this.calculate(); // 初始计算
    }

    initElements() {
        // 输入元素 - 现在在getInputValues中动态获取
        this.loanAmount = document.getElementById('loan-amount');
        this.loanTerm = document.getElementById('loan-term');
        this.interestRate = document.getElementById('interest-rate');
        this.rateType = document.getElementById('rate-type');
        this.discountRate = document.getElementById('discount-rate');
        
        // 公积金贷款元素
        this.providentLoanAmount = document.getElementById('provident-loan-amount');
        this.providentLoanTerm = document.getElementById('provident-loan-term');
        this.providentInterestRate = document.getElementById('provident-interest-rate');
        this.providentRateType = document.getElementById('provident-rate-type');
        this.providentDiscountRate = document.getElementById('provident-discount-rate');
        
        // 组合贷款元素
        this.combinedLoanAmount = document.getElementById('combined-loan-amount');
        this.combinedCommercialAmount = document.getElementById('combined-commercial-amount');
        this.combinedProvidentAmount = document.getElementById('combined-provident-amount');
        this.combinedLoanTerm = document.getElementById('combined-loan-term');
        this.combinedCommercialRate = document.getElementById('combined-commercial-rate');
        this.combinedCommercialRateType = document.getElementById('combined-commercial-rate-type');
        this.combinedProvidentRate = document.getElementById('combined-provident-rate');
        this.combinedProvidentRateType = document.getElementById('combined-provident-rate-type');
        
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
        this.resultTotalInterest = document.getElementById('result-total-interest');
        this.resultInterestFormula = document.getElementById('result-interest-formula');
        this.resultRepaymentMethod = document.getElementById('result-repayment-method');
        this.repaymentPlan = document.getElementById('repayment-plan');
        
        // 还款计划标题元素
        this.repaymentPlanTitle = document.querySelector('.result-card:nth-child(2) h4');
        
        // 按钮
        this.calculateBtn = document.getElementById('calculate-btn');
        
        // 当前活动标签类型
        this.currentTab = 'commercial';
    }

    bindEvents() {
        // 标签页切换
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab));
        });

        // 利率类型切换
        this.rateType.addEventListener('change', () => this.handleRateTypeChange());
        if (this.providentRateType) {
            this.providentRateType.addEventListener('change', () => this.handleProvidentRateTypeChange());
        }
        if (this.combinedCommercialRateType) {
            this.combinedCommercialRateType.addEventListener('change', () => this.handleCombinedCommercialRateTypeChange());
        }
        if (this.combinedProvidentRateType) {
            this.combinedProvidentRateType.addEventListener('change', () => this.handleCombinedProvidentRateTypeChange());
        }

        // 还款方式切换
        document.querySelectorAll('input[name="repayment-method"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.repaymentMethod = radio;
                this.calculate();
            });
        });

        // 输入变化时实时计算 - 所有输入元素
        const allInputs = [
            this.loanAmount, this.loanTerm, this.interestRate, this.discountRate,
            this.providentLoanAmount, this.providentLoanTerm, this.providentInterestRate, this.providentDiscountRate,
            this.combinedLoanAmount, this.combinedCommercialAmount, this.combinedProvidentAmount,
            this.combinedLoanTerm, this.combinedCommercialRate, this.combinedProvidentRate
        ].filter(input => input !== null); // 过滤掉可能为null的元素
        
        allInputs.forEach(input => {
            if (input) {
                input.addEventListener('input', () => this.calculate());
            }
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
        this.currentTab = tabType;
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
    
    handleProvidentRateTypeChange() {
        const isCustom = this.providentRateType.value === 'custom';
        this.providentInterestRate.disabled = !isCustom;
        
        if (!isCustom) {
            // 设置为最新公积金利率
            this.providentInterestRate.value = '3.25';
        }
        
        this.calculate();
    }
    
    handleCombinedCommercialRateTypeChange() {
        const isCustom = this.combinedCommercialRateType.value === 'custom';
        this.combinedCommercialRate.disabled = !isCustom;
        
        if (!isCustom) {
            // 设置为最新基准利率
            this.combinedCommercialRate.value = '4.2';
        }
        
        this.calculate();
    }
    
    handleCombinedProvidentRateTypeChange() {
        const isCustom = this.combinedProvidentRateType.value === 'custom';
        this.combinedProvidentRate.disabled = !isCustom;
        
        if (!isCustom) {
            // 设置为最新公积金利率
            this.combinedProvidentRate.value = '3.25';
        }
        
        this.calculate();
    }

    getInputValues() {
        let loanAmount, loanTerm, interestRate, method;
        
        method = this.repaymentMethod.value;
        
        if (this.currentTab === 'commercial') {
            // 商业贷款
            loanAmount = parseFloat(this.loanAmount.value) * 10000; // 万元转元
            loanTerm = parseInt(this.loanTerm.value) * 12; // 年转月
            interestRate = parseFloat(this.interestRate.value) / 100; // 百分比转小数
            const discount = parseFloat(this.discountRate.value);
            interestRate = interestRate * discount;
            
        } else if (this.currentTab === 'provident') {
            // 公积金贷款
            loanAmount = parseFloat(this.providentLoanAmount.value) * 10000;
            loanTerm = parseInt(this.providentLoanTerm.value) * 12;
            interestRate = parseFloat(this.providentInterestRate.value) / 100;
            const discount = parseFloat(this.providentDiscountRate.value);
            interestRate = interestRate * discount;
            
        } else if (this.currentTab === 'combined') {
            // 组合贷款 - 需要特殊处理
            const commercialAmount = parseFloat(this.combinedCommercialAmount.value) * 10000;
            const providentAmount = parseFloat(this.combinedProvidentAmount.value) * 10000;
            loanAmount = commercialAmount + providentAmount;
            loanTerm = parseInt(this.combinedLoanTerm.value) * 12;
            
            // 计算加权平均利率
            const commercialRate = parseFloat(this.combinedCommercialRate.value) / 100;
            const providentRate = parseFloat(this.combinedProvidentRate.value) / 100;
            
            if (loanAmount > 0) {
                interestRate = (commercialAmount * commercialRate + providentAmount * providentRate) / loanAmount;
            } else {
                interestRate = 0;
            }
        } else {
            // 默认值
            loanAmount = 1000000;
            loanTerm = 240;
            interestRate = 0.042;
        }
        
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

    generateRepaymentPlan(loanAmount, monthlyRate, loanTerm, method, showAll = false) {
        const plan = [];
        let remainingPrincipal = loanAmount;
        const maxPeriods = showAll ? loanTerm : Math.min(12, loanTerm);
        
        if (method === 'equal-payment') {
            // 等额本息还款计划
            const monthlyPayment = this.calculateEqualPayment(loanAmount, monthlyRate, loanTerm);
            
            for (let i = 1; i <= maxPeriods; i++) {
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
            
            for (let i = 1; i <= maxPeriods; i++) {
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
        
        // 更新总利息数值
        if (this.resultTotalInterest) {
            this.resultTotalInterest.textContent = `${this.formatCurrency(totalInterest)} 元`;
        }
        
        this.resultRepaymentMethod.textContent = method === 'equal-payment' ? '等额本息' : '等额本金';
        
        // 更新总利息计算公式
        this.updateInterestFormula(method, monthlyPayment, loanTerm, loanAmount, totalInterest);
        
        // 更新还款计划标题
        this.updateRepaymentPlanTitle(loanTerm);
    }
    
    updateRepaymentPlanTitle(loanTerm) {
        if (this.repaymentPlanTitle) {
            const maxPeriods = Math.min(12, loanTerm);
            if (loanTerm <= 12) {
                this.repaymentPlanTitle.innerHTML = `<i class="fas fa-table"></i> 还款计划 (${loanTerm}期)`;
            } else {
                this.repaymentPlanTitle.innerHTML = `<i class="fas fa-table"></i> 还款计划 (前${maxPeriods}期)`;
            }
        }
    }
    
    updateInterestFormula(method, monthlyPayment, loanTerm, loanAmount, totalInterest) {
        let formulaText = '';
        
        if (method === 'equal-payment') {
            // 等额本息计算公式
            formulaText = '等额本息：总利息 = 月供 × 期数 - 贷款本金';
        } else {
            // 等额本金计算公式
            formulaText = '等额本金：总利息 = (期数 + 1) × 贷款本金 × 月利率 ÷ 2';
        }
        
        // 添加简要说明
        formulaText += '<br><small style="color: #666; font-size: 0.85em;">';
        if (method === 'equal-payment') {
            formulaText += '说明：每月还款额固定，前期利息多本金少，总利息相对较高。';
        } else {
            formulaText += '说明：每月本金固定，利息逐月递减，总利息相对较低。';
        }
        formulaText += '</small>';
        
        if (this.resultInterestFormula) {
            this.resultInterestFormula.innerHTML = formulaText;
        }
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
        
        // 更新显示完整还款计划按钮
        this.updateShowAllButton(loanTerm);
        
        // 更新表格说明
        this.updateTableNote(loanTerm);
    }
    
    updateTableNote(loanTerm) {
        const tableNote = document.querySelector('.table-note');
        if (tableNote) {
            if (loanTerm <= 12) {
                tableNote.innerHTML = `<i class="fas fa-lightbulb"></i> 提示：这是完整的还款计划，共${loanTerm}期`;
            } else {
                tableNote.innerHTML = `<i class="fas fa-lightbulb"></i> 提示：完整还款计划包含${loanTerm}期，此处仅展示前12期`;
            }
        }
    }
    
    updateShowAllButton(loanTerm) {
        // 移除现有的按钮
        const existingButton = document.getElementById('show-all-plan-btn');
        if (existingButton) {
            existingButton.remove();
        }
        
        // 如果贷款期数超过12期，添加显示完整还款计划按钮
        if (loanTerm > 12) {
            const button = document.createElement('button');
            button.id = 'show-all-plan-btn';
            button.className = 'show-all-btn';
            button.innerHTML = '<i class="fas fa-eye"></i> 显示完整还款计划';
            
            button.addEventListener('click', () => {
                this.showFullRepaymentPlan();
            });
            
            // 将按钮添加到还款计划表后面
            const tableNote = document.querySelector('.table-note');
            if (tableNote) {
                tableNote.parentNode.insertBefore(button, tableNote.nextSibling);
            }
        }
    }
    
    showFullRepaymentPlan() {
        const { loanAmount, loanTerm, interestRate, method } = this.getInputValues();
        const monthlyRate = interestRate / 12;
        const plan = this.generateRepaymentPlan(loanAmount, monthlyRate, loanTerm, method, true);
        
        // 清空现有内容
        this.repaymentPlan.innerHTML = '';
        
        // 添加完整的还款计划行
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
        
        // 更新按钮文本
        const button = document.getElementById('show-all-plan-btn');
        if (button) {
            button.innerHTML = '<i class="fas fa-eye-slash"></i> 显示前12期';
            button.removeEventListener('click', this.showFullRepaymentPlan);
            button.addEventListener('click', () => {
                this.updateRepaymentPlan(loanAmount, monthlyRate, loanTerm, method);
            });
        }
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
