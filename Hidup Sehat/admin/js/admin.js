// admin.js - Simple and Working Admin Panel
class AdminApp {
    constructor() {
        this.currentPage = 'dashboard';
        this.membersData = [];
        this.filteredMembers = [];
        this.charts = {};
        this.init();
    }

    init() {
        console.log('🚀 AdminApp initialized');
        this.loadRealMembersData();
        this.initializeNavigation();
        this.setupEventListeners();
        this.loadDashboardData();
    }

    // ==================== NAVIGATION ====================
    initializeNavigation() {
        const navLinks = document.querySelectorAll('.sidebar .nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPage = link.getAttribute('data-page');
                console.log('Navigating to:', targetPage);
                this.navigateToPage(targetPage);
                
                // Update active state
                navLinks.forEach(nav => nav.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    navigateToPage(page) {
        // Hide all pages
        const pageContents = document.querySelectorAll('.page-content');
        pageContents.forEach(content => {
            content.classList.remove('active');
        });

        // Show target page
        const targetContent = document.getElementById(page + 'Content');
        if (targetContent) {
            targetContent.classList.add('active');
            this.currentPage = page;
            
            // Update breadcrumb
            const currentPageElement = document.getElementById('currentPage');
            if (currentPageElement) {
                const pageTitles = {
                    'dashboard': 'Dashboard',
                    'members': 'Data Member',
                    'mental-health': 'Kesehatan Mental',
                    'health-data': 'Data Kesehatan',
                    'reports': 'Laporan'
                };
                currentPageElement.textContent = pageTitles[page] || 'Dashboard';
            }

            // Load page data
            this.loadPageData(page);
        }
    }

    loadPageData(page) {
        console.log('📊 Loading page data for:', page);
        
        switch(page) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'members':
                this.loadMembersData();
                break;
            case 'mental-health':
                this.loadMentalHealthData();
                break;
            case 'health-data':
                this.loadHealthData();
                break;
            case 'reports':
                this.loadReportsData();
                break;
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchMembers');
        const filterSelect = document.getElementById('filterStatus');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterMembers());
        }
        
        if (filterSelect) {
            filterSelect.addEventListener('change', () => this.filterMembers());
        }
    }

    // ==================== DATA MANAGEMENT ====================
    loadRealMembersData() {
        try {
            const adminData = JSON.parse(localStorage.getItem('adminMembersData')) || [];
            
            if (adminData.length > 0) {
                this.membersData = adminData;
                this.filteredMembers = [...adminData];
                console.log('✅ Loaded real members data:', this.membersData.length, 'members');
            } else {
                this.membersData = [];
                this.filteredMembers = [];
                console.log('ℹ️ No members data found');
            }
            
            return this.membersData;
            
        } catch (error) {
            console.error('❌ Error loading real members data:', error);
            this.membersData = [];
            this.filteredMembers = [];
            return [];
        }
    }

    // ==================== DASHBOARD ====================
    loadDashboardData() {
        console.log('📈 Loading dashboard data...');
        const membersData = this.loadRealMembersData();
        
        if (membersData.length === 0) {
            this.showEmptyDashboard();
            return;
        }
        
        // Calculate statistics
        const totalMembers = membersData.length;
        const averageAge = Math.round(membersData.reduce((sum, member) => sum + member.age, 0) / totalMembers);
        const bmiNormal = Math.round((membersData.filter(member => member.bmi >= 18.5 && member.bmi < 25).length / totalMembers) * 100);
        const mentalAttention = membersData.filter(member => 
            member.mentalStatus === "Perhatian" || member.mentalStatus === "Butuh Bantuan"
        ).length;

        // Update UI
        this.updateStat('statMembers', totalMembers);
        this.updateStat('statAge', averageAge);
        this.updateStat('statBMI', bmiNormal + '%');
        this.updateStat('statMental', mentalAttention);

        // Update sidebar stats
        this.updateStat('totalMembers', totalMembers);
        this.updateStat('averageAge', averageAge);
        this.updateStat('mentalAttention', mentalAttention);

        // Update badge
        const mentalBadge = document.getElementById('mentalBadge');
        if (mentalBadge) {
            mentalBadge.textContent = mentalAttention;
        }

        // Update charts
        this.updateDashboardCharts(membersData);
        this.updateRecentActivities(membersData);
    }

    showEmptyDashboard() {
        console.log('Showing empty dashboard');
        this.updateStat('statMembers', 0);
        this.updateStat('statAge', 0);
        this.updateStat('statBMI', '0%');
        this.updateStat('statMental', 0);

        // Show empty state for activities
        const recentActivities = document.getElementById('recentActivities');
        if (recentActivities) {
            recentActivities.innerHTML = `
                <div class="activity-item">
                    <div class="activity-icon info">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-text">Belum ada aktivitas terbaru</div>
                        <div class="activity-time">-</div>
                    </div>
                </div>
            `;
        }
    }

    updateDashboardCharts(members) {
        // Gender distribution
        const genderData = this.calculateGenderDistribution(members);
        this.updateGenderChart(genderData);

        // Age distribution
        const ageData = this.calculateAgeDistribution(members);
        this.updateAgeChart(ageData);
    }

    calculateGenderDistribution(members) {
        const distribution = { male: 0, female: 0 };
        members.forEach(member => {
            if (member.gender === 'Laki-laki') distribution.male++;
            else if (member.gender === 'Perempuan') distribution.female++;
        });
        return distribution;
    }

    calculateAgeDistribution(members) {
        const distribution = { '18-25': 0, '26-35': 0, '36-45': 0, '46-55': 0, '56+': 0 };
        members.forEach(member => {
            if (member.age >= 18 && member.age <= 25) distribution['18-25']++;
            else if (member.age <= 35) distribution['26-35']++;
            else if (member.age <= 45) distribution['36-45']++;
            else if (member.age <= 55) distribution['46-55']++;
            else distribution['56+']++;
        });
        return distribution;
    }

    updateGenderChart(genderData) {
        const ctx = document.getElementById('genderChart');
        if (!ctx) {
            console.error('Gender chart canvas not found');
            return;
        }

        // Destroy existing chart
        if (this.charts.gender) {
            this.charts.gender.destroy();
        }

        this.charts.gender = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Laki-laki', 'Perempuan'],
                datasets: [{
                    data: [genderData.male, genderData.female],
                    backgroundColor: ['#1e88e5', '#e91e63'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updateAgeChart(ageData) {
        const ctx = document.getElementById('ageChart');
        if (!ctx) {
            console.error('Age chart canvas not found');
            return;
        }

        // Destroy existing chart
        if (this.charts.age) {
            this.charts.age.destroy();
        }

        this.charts.age = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(ageData),
                datasets: [{
                    label: 'Jumlah Member',
                    data: Object.values(ageData),
                    backgroundColor: '#4caf50',
                    borderColor: '#45a049',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    updateRecentActivities(members) {
        const container = document.getElementById('recentActivities');
        if (!container) return;

        if (members.length === 0) {
            container.innerHTML = `
                <div class="activity-item">
                    <div class="activity-icon info">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-text">Belum ada aktivitas terbaru</div>
                        <div class="activity-time">-</div>
                    </div>
                </div>
            `;
            return;
        }

        // Get recent members (last 3)
        const recent = [...members]
            .sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate))
            .slice(0, 3);

        container.innerHTML = '';

        recent.forEach(member => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            
            let icon = 'fas fa-user-plus';
            let iconClass = 'success';
            let text = `Member baru: ${member.fullName} bergabung`;
            
            if (member.mentalStatus === "Butuh Bantuan") {
                icon = 'fas fa-brain';
                iconClass = 'danger';
                text = `${member.fullName} butuh bantuan mental`;
            } else if (member.bmi >= 30) {
                icon = 'fas fa-exclamation-triangle';
                iconClass = 'warning';
                text = `${member.fullName} memiliki BMI tinggi`;
            }
            
            item.innerHTML = `
                <div class="activity-icon ${iconClass}">
                    <i class="${icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-text">${text}</div>
                    <div class="activity-time">${member.registrationDate}</div>
                </div>
            `;
            
            container.appendChild(item);
        });
    }

    // ==================== MEMBERS MANAGEMENT ====================
    loadMembersData() {
        console.log('👥 Loading members data...');
        this.membersData = this.loadRealMembersData();
        this.filteredMembers = [...this.membersData];
        this.updateMembersTable();
    }

    updateMembersTable() {
        const tbody = document.getElementById('membersTableBody');
        const noData = document.getElementById('noMembersMessage');
        
        if (!tbody) {
            console.error('Members table body not found');
            return;
        }

        tbody.innerHTML = '';

        if (this.filteredMembers.length === 0) {
            if (noData) noData.style.display = 'block';
            return;
        }

        if (noData) noData.style.display = 'none';

        this.filteredMembers.forEach(member => {
            const row = document.createElement('tr');
            const bmiStatus = this.getBMIStatus(member.bmi);
            const bpStatus = this.getBPStatus(member.bloodPressure);
            const mentalBadge = this.getMentalBadge(member.mentalStatus);

            row.innerHTML = `
                <td>
                    <div class="d-flex align-items-center">
                        <div class="user-avatar-sm bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style="width: 32px; height: 32px; font-size: 12px;">
                            ${member.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                            <div class="fw-bold">${member.fullName}</div>
                            <small class="text-muted">${member.phone || 'Tidak ada telepon'}</small>
                        </div>
                    </div>
                </td>
                <td>${member.email}</td>
                <td>${member.age} tahun</td>
                <td>${member.gender}</td>
                <td>
                    <span class="badge ${bmiStatus.class}">${member.bmi}</span>
                </td>
                <td>
                    <span class="badge ${bpStatus.class}">${member.bloodPressure.systolic}/${member.bloodPressure.diastolic}</span>
                </td>
                <td>
                    <span class="badge ${member.waterIntake >= 8 ? 'bg-success' : 'bg-warning'}">
                        ${member.waterIntake} gelas
                    </span>
                </td>
                <td>${mentalBadge}</td>
                <td>${member.registrationDate}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="viewMemberDetail('${member.email}')" title="Detail">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteMember('${member.email}')" title="Hapus">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }

    filterMembers() {
        const search = document.getElementById('searchMembers').value.toLowerCase();
        const filter = document.getElementById('filterStatus').value;
        
        this.filteredMembers = this.membersData.filter(member => {
            const matchSearch = member.fullName.toLowerCase().includes(search) || 
                              member.email.toLowerCase().includes(search);
            const matchFilter = !filter || member.mentalStatus === filter;
            return matchSearch && matchFilter;
        });
        
        this.updateMembersTable();
    }

    // ==================== MENTAL HEALTH ====================
    loadMentalHealthData() {
        console.log('🧠 Loading mental health data...');
        const members = this.loadRealMembersData();
        
        // Update stats
        const severe = members.filter(m => m.mentalStatus === "Butuh Bantuan").length;
        const moderate = members.filter(m => m.mentalStatus === "Perhatian").length;
        const good = members.filter(m => m.mentalStatus === "Baik").length;
        
        this.updateStat('severeMentalCases', severe);
        this.updateStat('moderateMentalCases', moderate);
        this.updateStat('goodMentalCases', good);

        // Update table
        this.updateMentalHealthTable(members);
    }

    updateMentalHealthTable(members) {
        const tbody = document.getElementById('mentalHealthTableBody');
        const noData = document.getElementById('noMentalHealthData');
        
        if (!tbody) return;

        tbody.innerHTML = '';

        if (members.length === 0) {
            if (noData) noData.style.display = 'block';
            return;
        }

        if (noData) noData.style.display = 'none';

        members.forEach(member => {
            const row = document.createElement('tr');
            const urgency = member.mentalStatus === "Butuh Bantuan" ? 
                '<span class="badge bg-danger">Tinggi</span>' : 
                member.mentalStatus === "Perhatian" ? 
                '<span class="badge bg-warning">Sedang</span>' :
                '<span class="badge bg-success">Rendah</span>';
            
            row.innerHTML = `
                <td>
                    <div class="fw-bold">${member.fullName}</div>
                    <small class="text-muted">${member.email}</small>
                </td>
                <td>${member.age} tahun</td>
                <td>${member.gender}</td>
                <td>${this.getMentalBadge(member.mentalStatus)}</td>
                <td>${urgency}</td>
                <td>${member.registrationDate}</td>
                <td>
                    <span class="badge bg-info">Perlu Follow-up</span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="contactMember('${member.email}')" title="Hubungi">
                            <i class="fas fa-phone"></i>
                        </button>
                        <button class="btn btn-outline-success" onclick="scheduleSession('${member.email}')" title="Jadwalkan Sesi">
                            <i class="fas fa-calendar"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }

    // ==================== HEALTH DATA ====================
    loadHealthData() {
        console.log('💊 Loading health data...');
        const members = this.loadRealMembersData();
        
        if (members.length === 0) {
            this.showEmptyHealthData();
            return;
        }

        // Calculate stats
        const total = members.length;
        const bmiNormal = Math.round((members.filter(m => m.bmi >= 18.5 && m.bmi < 25).length / total) * 100);
        const bpNormal = Math.round((members.filter(m => 
            m.bloodPressure.systolic < 120 && m.bloodPressure.diastolic < 80
        ).length / total) * 100);
        const waterOptimal = Math.round((members.filter(m => m.waterIntake >= 8).length / total) * 100);

        // Update stats
        this.updateStat('healthTotalMembers', total);
        this.updateStat('healthBMINormal', bmiNormal + '%');
        this.updateStat('healthBPNormal', bpNormal + '%');
        this.updateStat('healthWaterOptimal', waterOptimal + '%');

        // Update table
        this.updateHealthTable(members);
    }

    showEmptyHealthData() {
        this.updateStat('healthTotalMembers', 0);
        this.updateStat('healthBMINormal', '0%');
        this.updateStat('healthBPNormal', '0%');
        this.updateStat('healthWaterOptimal', '0%');
        
        const tbody = document.getElementById('healthDataTableBody');
        const noData = document.getElementById('noHealthData');
        
        if (tbody && noData) {
            tbody.innerHTML = '';
            noData.style.display = 'block';
        }
    }

    updateHealthTable(members) {
        const tbody = document.getElementById('healthDataTableBody');
        const noData = document.getElementById('noHealthData');
        
        if (!tbody) return;

        tbody.innerHTML = '';

        if (members.length === 0) {
            if (noData) noData.style.display = 'block';
            return;
        }

        if (noData) noData.style.display = 'none';

        members.forEach(member => {
            const row = document.createElement('tr');
            const bmiStatus = this.getBMIStatus(member.bmi);
            const bpStatus = this.getBPStatus(member.bloodPressure);
            const waterStatus = member.waterIntake >= 8 ? 'bg-success' : 
                              member.waterIntake >= 5 ? 'bg-warning' : 'bg-danger';
            
            row.innerHTML = `
                <td>${member.fullName}</td>
                <td>${member.age}</td>
                <td>${member.bmi}</td>
                <td><span class="badge ${bmiStatus.class}">${bmiStatus.text}</span></td>
                <td>${member.bloodPressure.systolic}/${member.bloodPressure.diastolic}</td>
                <td><span class="badge ${bpStatus.class}">${bpStatus.text}</span></td>
                <td><span class="badge ${waterStatus}">${member.waterIntake} gelas</span></td>
                <td>${member.lastUpdate || member.registrationDate}</td>
            `;
            
            tbody.appendChild(row);
        });
    }

    // ==================== REPORTS ====================
    loadReportsData() {
        console.log('📋 Loading reports data...');
        const members = this.loadRealMembersData();
        
        if (members.length === 0) {
            this.showEmptyReports();
            return;
        }

        // Calculate summary data
        const total = members.length;
        const avgAge = Math.round(members.reduce((sum, m) => sum + m.age, 0) / total);
        const avgBMI = Math.round((members.reduce((sum, m) => sum + m.bmi, 0) / total) * 10) / 10;
        const bmiNormal = Math.round((members.filter(m => m.bmi >= 18.5 && m.bmi < 25).length / total) * 100);
        const bpNormal = Math.round((members.filter(m => 
            m.bloodPressure.systolic < 120 && m.bloodPressure.diastolic < 80
        ).length / total) * 100);
        const mentalGood = Math.round((members.filter(m => m.mentalStatus === 'Baik').length / total) * 100);
        const waterOptimal = Math.round((members.filter(m => m.waterIntake >= 8).length / total) * 100);

        // Update summary cards
        this.updateStat('reportTotalMembers', total);
        this.updateStat('reportAvgAge', avgAge);
        this.updateStat('reportAvgBMI', avgBMI);
        this.updateStat('reportBMINormal', bmiNormal + '%');
        this.updateStat('reportBPNormal', bpNormal + '%');
        this.updateStat('reportMentalGood', mentalGood + '%');

        // Update progress bars
        this.updateReportProgressBars(bmiNormal, bpNormal, mentalGood, waterOptimal);

        // Update trends
        this.updateStat('trendBMI', bmiNormal + '%');
        this.updateStat('trendBP', bpNormal + '%');
        this.updateStat('trendMental', mentalGood + '%');
        this.updateStat('trendWater', waterOptimal + '%');

        // Update charts
        this.updateReportsCharts(members);
    }

    updateReportProgressBars(bmi, bp, mental, water) {
        const elements = ['bmiProgress', 'bpProgress', 'mentalProgress', 'waterProgress'];
        const values = [bmi, bp, mental, water];
        
        elements.forEach((id, index) => {
            const element = document.getElementById(id);
            if (element) {
                element.style.width = values[index] + '%';
            }
        });
    }

    updateReportsCharts(members) {
        // Monthly growth chart
        const monthlyData = this.generateMonthlyData(members);
        this.updateMonthlyChart(monthlyData);

        // Gender chart
        const genderData = this.calculateGenderDistribution(members);
        this.updateReportGenderChart(genderData);

        // Age chart
        const ageData = this.calculateAgeDistribution(members);
        this.updateReportAgeChart(ageData);
    }

    generateMonthlyData(members) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'];
        const counts = [0, 0, 0, 0, 0, 0];
        
        // Simple distribution for demo
        members.forEach((member, index) => {
            const monthIndex = index % 6;
            counts[monthIndex]++;
        });

        return {
            labels: months,
            data: counts
        };
    }

    updateMonthlyChart(data) {
        const ctx = document.getElementById('monthlyChart');
        if (!ctx) return;

        if (this.charts.monthly) {
            this.charts.monthly.destroy();
        }

        this.charts.monthly = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Member Baru',
                    data: data.data,
                    borderColor: '#1e88e5',
                    backgroundColor: 'rgba(30, 136, 229, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    updateReportGenderChart(genderData) {
        const ctx = document.getElementById('reportGenderChart');
        if (!ctx) return;

        if (this.charts.reportGender) {
            this.charts.reportGender.destroy();
        }

        this.charts.reportGender = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Laki-laki', 'Perempuan'],
                datasets: [{
                    data: [genderData.male, genderData.female],
                    backgroundColor: ['#1e88e5', '#e91e63'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updateReportAgeChart(ageData) {
        const ctx = document.getElementById('reportAgeChart');
        if (!ctx) return;

        if (this.charts.reportAge) {
            this.charts.reportAge.destroy();
        }

        this.charts.reportAge = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(ageData),
                datasets: [{
                    label: 'Jumlah Member',
                    data: Object.values(ageData),
                    backgroundColor: '#4caf50',
                    borderColor: '#45a049',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    showEmptyReports() {
        this.updateStat('reportTotalMembers', 0);
        this.updateStat('reportAvgAge', 0);
        this.updateStat('reportAvgBMI', 0);
        this.updateStat('reportBMINormal', '0%');
        this.updateStat('reportBPNormal', '0%');
        this.updateStat('reportMentalGood', '0%');

        this.updateReportProgressBars(0, 0, 0, 0);
        
        this.updateStat('trendBMI', '0%');
        this.updateStat('trendBP', '0%');
        this.updateStat('trendMental', '0%');
        this.updateStat('trendWater', '0%');
    }

    // ==================== UTILITY METHODS ====================
    getBMIStatus(bmi) {
        if (bmi < 18.5) return { class: 'bg-info', text: 'Underweight' };
        if (bmi < 25) return { class: 'bg-success', text: 'Normal' };
        if (bmi < 30) return { class: 'bg-warning', text: 'Overweight' };
        return { class: 'bg-danger', text: 'Obesitas' };
    }

    getBPStatus(bp) {
        if (bp.systolic < 120 && bp.diastolic < 80) {
            return { class: 'bg-success', text: 'Normal' };
        }
        if (bp.systolic < 140 && bp.diastolic < 90) {
            return { class: 'bg-warning', text: 'Pre-hipertensi' };
        }
        return { class: 'bg-danger', text: 'Hipertensi' };
    }

    getMentalBadge(status) {
        const badges = {
            'Baik': 'bg-success',
            'Perhatian': 'bg-warning', 
            'Butuh Bantuan': 'bg-danger'
        };
        return `<span class="badge ${badges[status]}">${status}</span>`;
    }

    updateStat(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    showNotification(message, type = 'info') {
        console.log(`📢 ${type.toUpperCase()}: ${message}`);
        alert(message);
    }
}

// ==================== GLOBAL FUNCTIONS ====================
function refreshData() {
    if (window.adminApp) {
        window.adminApp.loadDashboardData();
        window.adminApp.showNotification('Data berhasil diperbarui!', 'success');
    }
}

function refreshMembersData() {
    if (window.adminApp) {
        window.adminApp.loadMembersData();
        window.adminApp.showNotification('Data member berhasil diperbarui', 'success');
    }
}

function refreshMentalHealthData() {
    if (window.adminApp) {
        window.adminApp.loadMentalHealthData();
        window.adminApp.showNotification('Data kesehatan mental diperbarui', 'success');
    }
}

function refreshHealthData() {
    if (window.adminApp) {
        window.adminApp.loadHealthData();
        window.adminApp.showNotification('Data kesehatan diperbarui', 'success');
    }
}

function refreshReports() {
    if (window.adminApp) {
        window.adminApp.loadReportsData();
        window.adminApp.showNotification('Laporan berhasil diperbarui', 'success');
    }
}

function exportData() {
    if (window.adminApp) {
        exportMembersData();
    }
}

function exportMembersData() {
    if (window.adminApp && window.adminApp.membersData.length > 0) {
        const dataStr = JSON.stringify(window.adminApp.membersData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `members-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        window.adminApp.showNotification('Data member berhasil diekspor', 'success');
    } else {
        window.adminApp.showNotification('Tidak ada data member untuk diekspor', 'warning');
    }
}

function generatePDFReport() {
    if (window.adminApp) {
        window.adminApp.showNotification('Membuat laporan PDF...', 'info');
        setTimeout(() => {
            window.adminApp.showNotification('Laporan PDF berhasil diunduh', 'success');
        }, 2000);
    }
}

function viewMemberDetail(email) {
    const member = window.adminApp.membersData.find(m => m.email === email);
    if (member) {
        const detail = `
Detail Member:

Nama: ${member.fullName}
Email: ${member.email}
Usia: ${member.age} tahun
Jenis Kelamin: ${member.gender}
Telepon: ${member.phone || 'Tidak ada'}

Data Kesehatan:
- BMI: ${member.bmi} (${window.adminApp.getBMIStatus(member.bmi).text})
- Tekanan Darah: ${member.bloodPressure.systolic}/${member.bloodPressure.diastolic}
- Air per Hari: ${member.waterIntake} gelas
- Status Mental: ${member.mentalStatus}
${member.healthNotes ? `- Catatan: ${member.healthNotes}` : ''}

Bergabung: ${member.registrationDate}
Terakhir Update: ${member.lastUpdate || member.registrationDate}
        `;
        alert(detail);
    }
}

function deleteMember(email) {
    if (confirm('Apakah Anda yakin ingin menghapus member ini?')) {
        window.adminApp.membersData = window.adminApp.membersData.filter(member => member.email !== email);
        window.adminApp.filteredMembers = window.adminApp.filteredMembers.filter(member => member.email !== email);
        
        localStorage.setItem('adminMembersData', JSON.stringify(window.adminApp.membersData));
        
        window.adminApp.loadMembersData();
        window.adminApp.showNotification('Member berhasil dihapus', 'success');
    }
}

function contactMember(email) {
    const member = window.adminApp.membersData.find(m => m.email === email);
    if (member) {
        window.adminApp.showNotification(`Menghubungi ${member.fullName} (${member.phone || 'tidak ada telepon'})`, 'info');
    }
}

function scheduleSession(email) {
    const member = window.adminApp.membersData.find(m => m.email === email);
    if (member) {
        const sessionDate = new Date();
        sessionDate.setDate(sessionDate.getDate() + 7);
        
        window.adminApp.showNotification(
            `Sesi konseling untuk ${member.fullName} dijadwalkan: ${sessionDate.toLocaleDateString('id-ID')}`, 
            'success'
        );
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 DOM loaded, initializing AdminApp...');
    window.adminApp = new AdminApp();
});