// admin.js - Main JavaScript untuk Admin Hidup Sehat (REVISI)

class AdminApp {
    constructor() {
        this.currentPage = 'dashboard';
        this.membersData = [];
        this.filteredMembers = [];
        this.init();
    }

    init() {
        console.log('AdminApp initialized');
        this.initializeNavigation();
        this.setupEventListeners();
        this.loadRealMembersData();
        this.loadDashboardData();
    }

    initializeNavigation() {
        const navLinks = document.querySelectorAll('.sidebar .nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPage = link.getAttribute('data-page');
                this.navigateToPage(targetPage);
                
                navLinks.forEach(nav => nav.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    navigateToPage(page) {
        console.log('Navigating to:', page);
        
        const pageContents = document.querySelectorAll('.page-content');
        pageContents.forEach(content => {
            content.classList.remove('active');
        });

        const targetContent = document.getElementById(page + 'Content');
        if (targetContent) {
            targetContent.classList.add('active');
            this.currentPage = page;
            
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

            this.loadPageData(page);
        }
    }

    loadPageData(page) {
        console.log('Loading page data for:', page);
        
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
        const searchInput = document.getElementById('searchMembers');
        const filterSelect = document.getElementById('filterStatus');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterMembers());
        }
        
        if (filterSelect) {
            filterSelect.addEventListener('change', () => this.filterMembers());
        }
    }

    // ==================== LOAD REAL DATA ====================
    loadRealMembersData() {
        try {
            // Get data from localStorage where admin stores user data
            const adminData = JSON.parse(localStorage.getItem('adminMembersData')) || [];
            
            if (adminData.length > 0) {
                this.membersData = adminData;
                console.log('Loaded real members data:', this.membersData);
            } else {
                // If no data yet, use empty array
                this.membersData = [];
                console.log('No members data found, using empty array');
            }
            
            this.filteredMembers = [...this.membersData];
            return this.membersData;
            
        } catch (error) {
            console.error('Error loading real members data:', error);
            this.membersData = [];
            this.filteredMembers = [];
            return [];
        }
    }

    // ==================== DASHBOARD ====================
    loadDashboardData() {
        try {
            const membersData = this.loadRealMembersData();
            
            if (membersData.length === 0) {
                this.showEmptyDashboard();
                return;
            }
            
            const genderDistribution = this.calculateGenderDistribution(membersData);
            const ageDistribution = this.calculateAgeDistribution(membersData);
            
            const dashboardData = {
                totalMembers: membersData.length,
                averageAge: Math.round(membersData.reduce((sum, member) => sum + member.age, 0) / membersData.length),
                bmiNormal: Math.round((membersData.filter(member => member.bmi >= 18.5 && member.bmi < 25).length / membersData.length) * 100),
                mentalAttention: membersData.filter(member => 
                    member.mentalStatus === "Perhatian" || member.mentalStatus === "Butuh Bantuan"
                ).length,
                genderDistribution: genderDistribution,
                ageDistribution: ageDistribution
            };

            this.updateDashboardUI(dashboardData);
            this.updateDashboardCharts(genderDistribution, ageDistribution);
            this.updateRecentActivities(membersData);
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showEmptyDashboard();
        }
    }

    showEmptyDashboard() {
        this.updateStat('statMembers', 0);
        this.updateStat('statAge', 0);
        this.updateStat('statBMI', '0%');
        this.updateStat('statMental', 0);
        
        this.updateStat('totalMembers', 0);
        this.updateStat('averageAge', 0);
        this.updateStat('mentalAttention', 0);
        
        const mentalBadge = document.getElementById('mentalBadge');
        if (mentalBadge) {
            mentalBadge.textContent = '0';
        }
        
        // Show empty state for charts
        const genderCtx = document.getElementById('genderChart');
        const ageCtx = document.getElementById('ageChart');
        
        if (genderCtx) {
            genderCtx.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-users fa-2x text-muted mb-2"></i>
                    <p class="text-muted">Belum ada data member</p>
                </div>
            `;
        }
        
        if (ageCtx) {
            ageCtx.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-chart-bar fa-2x text-muted mb-2"></i>
                    <p class="text-muted">Belum ada data untuk ditampilkan</p>
                </div>
            `;
        }
    }

    updateDashboardUI(data) {
        this.updateStat('statMembers', data.totalMembers);
        this.updateStat('statAge', data.averageAge);
        this.updateStat('statBMI', data.bmiNormal + '%');
        this.updateStat('statMental', data.mentalAttention);

        this.updateStat('totalMembers', data.totalMembers);
        this.updateStat('averageAge', data.averageAge);
        this.updateStat('mentalAttention', data.mentalAttention);

        const mentalBadge = document.getElementById('mentalBadge');
        if (mentalBadge) {
            mentalBadge.textContent = data.mentalAttention;
        }
    }

    updateDashboardCharts(genderDistribution, ageDistribution) {
        this.updateGenderChart(genderDistribution);
        this.updateAgeChart(ageDistribution);
    }

    updateRecentActivities(members) {
        const activitiesContainer = document.getElementById('recentActivities');
        if (!activitiesContainer) return;
        
        if (members.length === 0) {
            activitiesContainer.innerHTML = `
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
        
        // Sort members by registration date (newest first)
        const recentMembers = [...members]
            .sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate))
            .slice(0, 3);
        
        activitiesContainer.innerHTML = '';
        
        recentMembers.forEach(member => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            
            let icon = 'fas fa-user-plus';
            let iconClass = 'success';
            let text = `Member baru: ${member.fullName} bergabung`;
            
            if (member.mentalStatus === "Butuh Bantuan") {
                icon = 'fas fa-brain';
                iconClass = 'danger';
                text = `${member.fullName} melaporkan gejala stres berat`;
            } else if (member.bmi >= 30) {
                icon = 'fas fa-exclamation-triangle';
                iconClass = 'warning';
                text = `${member.fullName} memiliki BMI tinggi (${member.bmi})`;
            }
            
            activityItem.innerHTML = `
                <div class="activity-icon ${iconClass}">
                    <i class="${icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-text">${text}</div>
                    <div class="activity-time">${member.registrationDate}</div>
                </div>
            `;
            
            activitiesContainer.appendChild(activityItem);
        });
    }

    updateGenderChart(genderDistribution) {
        const ctx = document.getElementById('genderChart');
        if (!ctx) {
            console.error('Gender chart element not found');
            return;
        }
        
        if (this.genderChart) {
            this.genderChart.destroy();
        }
        
        this.genderChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Laki-laki', 'Perempuan'],
                datasets: [{
                    data: [genderDistribution.male, genderDistribution.female],
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

    updateAgeChart(ageDistribution) {
        const ctx = document.getElementById('ageChart');
        if (!ctx) {
            console.error('Age chart element not found');
            return;
        }
        
        if (this.ageChart) {
            this.ageChart.destroy();
        }
        
        this.ageChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(ageDistribution),
                datasets: [{
                    label: 'Jumlah Member',
                    data: Object.values(ageDistribution),
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

    // ==================== MEMBERS MANAGEMENT ====================
    loadMembersData() {
        try {
            this.membersData = this.loadRealMembersData();
            this.filteredMembers = [...this.membersData];
            
            this.updateMembersStats();
            this.updateMembersTable();
            
            return this.membersData;
        } catch (error) {
            console.error('Error loading members data:', error);
            return [];
        }
    }

    updateMembersStats() {
        const totalMembers = this.membersData.length;
        const needAttention = this.membersData.filter(member => 
            member.mentalStatus === "Butuh Bantuan" || 
            member.bmi >= 30 || 
            member.bloodPressure.systolic >= 140
        ).length;
        
        const avgAge = totalMembers > 0 ? 
            Math.round(this.membersData.reduce((sum, member) => sum + member.age, 0) / this.membersData.length) : 0;
        
        const newThisWeek = totalMembers; // Simplified for demo

        this.updateStat('totalMembersCount', totalMembers);
        this.updateStat('avgAgeCount', avgAge);
        this.updateStat('needAttentionCount', needAttention);
        this.updateStat('newThisWeek', newThisWeek);
    }

    updateMembersTable() {
        const tbody = document.getElementById('membersTableBody');
        const noMembersMessage = document.getElementById('noMembersMessage');
        
        if (!tbody) {
            console.error('membersTableBody not found!');
            return;
        }

        if (this.filteredMembers.length === 0) {
            tbody.innerHTML = '';
            if (noMembersMessage) noMembersMessage.style.display = 'block';
            return;
        }

        if (noMembersMessage) noMembersMessage.style.display = 'none';

        tbody.innerHTML = '';

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
        const searchTerm = document.getElementById('searchMembers').value.toLowerCase();
        const statusFilter = document.getElementById('filterStatus').value;
        
        this.filteredMembers = this.membersData.filter(member => {
            const matchesSearch = member.fullName.toLowerCase().includes(searchTerm) || 
                                member.email.toLowerCase().includes(searchTerm);
            const matchesStatus = !statusFilter || member.mentalStatus === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
        
        this.updateMembersTable();
    }

    deleteMember(email) {
        if (confirm('Apakah Anda yakin ingin menghapus member ini?')) {
            this.membersData = this.membersData.filter(member => member.email !== email);
            this.filteredMembers = this.filteredMembers.filter(member => member.email !== email);
            
            localStorage.setItem('adminMembersData', JSON.stringify(this.membersData));
            
            this.updateMembersStats();
            this.updateMembersTable();
            this.showNotification('Member berhasil dihapus', 'success');
        }
    }

    // ==================== MENTAL HEALTH ====================
    loadMentalHealthData() {
        console.log('Loading mental health data...');
        try {
            const membersData = this.loadRealMembersData();
            this.updateMentalHealthStats(membersData);
            this.updateMentalHealthTable(membersData);
        } catch (error) {
            console.error('Error loading mental health data:', error);
        }
    }

    updateMentalHealthStats(members) {
        console.log('Updating mental health stats with:', members.length, 'members');
        
        const severe = members.filter(m => m.mentalStatus === "Butuh Bantuan").length;
        const moderate = members.filter(m => m.mentalStatus === "Perhatian").length;
        const good = members.filter(m => m.mentalStatus === "Baik").length;
        const total = members.length;
        
        this.updateStat('severeMentalCases', severe);
        this.updateStat('moderateMentalCases', moderate);
        this.updateStat('goodMentalCases', good);
        
        this.updateMentalHealthProgress(good, moderate, severe, total);
    }

    updateMentalHealthProgress(good, moderate, severe, total) {
        const goodPercent = total > 0 ? Math.round((good / total) * 100) : 0;
        const moderatePercent = total > 0 ? Math.round((moderate / total) * 100) : 0;
        const severePercent = total > 0 ? Math.round((severe / total) * 100) : 0;
        
        this.updateHealthProgressBar('mentalGoodBar', goodPercent);
        this.updateHealthProgressBar('mentalModerateBar', moderatePercent);
        this.updateHealthProgressBar('mentalSevereBar', severePercent);
    }

    updateMentalHealthTable(members) {
        const tbody = document.getElementById('mentalHealthTableBody');
        const noDataMessage = document.getElementById('noMentalHealthData');
        
        if (!tbody) {
            console.error('mentalHealthTableBody not found!');
            return;
        }
        
        tbody.innerHTML = '';
        
        const attentionMembers = members.filter(member => 
            member.mentalStatus === "Perhatian" || member.mentalStatus === "Butuh Bantuan"
        );
        
        if (attentionMembers.length === 0) {
            if (noDataMessage) noDataMessage.style.display = 'block';
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-4 text-muted">
                        <i class="fas fa-brain fa-2x mb-2"></i>
                        <p>Tidak ada member yang membutuhkan perhatian mental</p>
                        <small>Semua member dalam kondisi baik</small>
                    </td>
                </tr>
            `;
            return;
        }
        
        if (noDataMessage) noDataMessage.style.display = 'none';
        
        attentionMembers.forEach(member => {
            const row = document.createElement('tr');
            const urgency = member.mentalStatus === "Butuh Bantuan" ? 
                '<span class="badge bg-danger">Tinggi</span>' : 
                '<span class="badge bg-warning">Sedang</span>';
            
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
                        <button class="btn btn-outline-info" onclick="viewMentalNotes('${member.email}')" title="Catatan">
                            <i class="fas fa-notes-medical"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }

    // ==================== HEALTH DATA ====================
    loadHealthData() {
        console.log('Loading health data...');
        try {
            const membersData = this.loadRealMembersData();
            
            if (membersData.length === 0) {
                this.showEmptyHealthData();
                return;
            }
            
            const bmiStats = this.calculateBMIStats(membersData);
            const bpStats = this.calculateBPStats(membersData);
            const waterStats = this.calculateWaterStats(membersData);
            
            this.updateHealthStats(membersData.length, bmiStats, bpStats, waterStats);
            this.updateHealthCharts(bmiStats, bpStats);
            this.updateHealthTable(membersData);
            
        } catch (error) {
            console.error('Error loading health data:', error);
            this.showEmptyHealthData();
        }
    }

    showEmptyHealthData() {
        this.updateStat('healthTotalMembers', 0);
        this.updateStat('healthBMINormal', '0%');
        this.updateStat('healthBPNormal', '0%');
        this.updateStat('healthWaterOptimal', '0%');
        
        // Reset progress bars
        this.updateHealthProgressBar('bmiNormalBar', 0);
        this.updateHealthProgressBar('bmiOverweightBar', 0);
        this.updateHealthProgressBar('bmiObeseBar', 0);
        this.updateHealthProgressBar('bmiUnderweightBar', 0);
        
        this.updateHealthProgressBar('bpNormalBar', 0);
        this.updateHealthProgressBar('bpPreBar', 0);
        this.updateHealthProgressBar('bpHighBar', 0);
        
        const tbody = document.getElementById('healthDataTableBody');
        const noDataMessage = document.getElementById('noHealthData');
        
        if (tbody && noDataMessage) {
            tbody.innerHTML = '';
            noDataMessage.style.display = 'block';
        }
    }

    calculateBMIStats(members) {
        const stats = {
            normal: 0,
            overweight: 0,
            obese: 0,
            underweight: 0
        };
        
        members.forEach(member => {
            if (member.bmi < 18.5) stats.underweight++;
            else if (member.bmi < 25) stats.normal++;
            else if (member.bmi < 30) stats.overweight++;
            else stats.obese++;
        });
        
        const total = members.length;
        if (total > 0) {
            stats.normal = Math.round((stats.normal / total) * 100);
            stats.overweight = Math.round((stats.overweight / total) * 100);
            stats.obese = Math.round((stats.obese / total) * 100);
            stats.underweight = Math.round((stats.underweight / total) * 100);
        }
        
        return stats;
    }

    calculateBPStats(members) {
        const stats = {
            normal: 0,
            pre: 0,
            high: 0
        };
        
        members.forEach(member => {
            if (member.bloodPressure.systolic < 120 && member.bloodPressure.diastolic < 80) {
                stats.normal++;
            } else if (member.bloodPressure.systolic < 140 && member.bloodPressure.diastolic < 90) {
                stats.pre++;
            } else {
                stats.high++;
            }
        });
        
        const total = members.length;
        if (total > 0) {
            stats.normal = Math.round((stats.normal / total) * 100);
            stats.pre = Math.round((stats.pre / total) * 100);
            stats.high = Math.round((stats.high / total) * 100);
        }
        
        return stats;
    }

    calculateWaterStats(members) {
        const stats = {
            optimal: 0,
            moderate: 0,  
            low: 0
        };
        
        members.forEach(member => {
            if (member.waterIntake >= 8) stats.optimal++;
            else if (member.waterIntake >= 5) stats.moderate++;
            else stats.low++;
        });
        
        const total = members.length;
        if (total > 0) {
            stats.optimal = Math.round((stats.optimal / total) * 100);
            stats.moderate = Math.round((stats.moderate / total) * 100);
            stats.low = Math.round((stats.low / total) * 100);
        }
        
        return stats;
    }

    calculateGenderDistribution(members) {
        const distribution = {
            male: 0,
            female: 0
        };
        
        members.forEach(member => {
            if (member.gender === 'Laki-laki') distribution.male++;
            else if (member.gender === 'Perempuan') distribution.female++;
        });
        
        return distribution;
    }

    calculateAgeDistribution(members) {
        const distribution = {
            '18-25': 0,
            '26-35': 0,
            '36-45': 0,
            '46-55': 0,
            '56+': 0
        };
        
        members.forEach(member => {
            if (member.age >= 18 && member.age <= 25) distribution['18-25']++;
            else if (member.age <= 35) distribution['26-35']++;
            else if (member.age <= 45) distribution['36-45']++;
            else if (member.age <= 55) distribution['46-55']++;
            else distribution['56+']++;
        });
        
        return distribution;
    }

    updateHealthStats(totalMembers, bmiStats, bpStats, waterStats) {
        this.updateStat('healthTotalMembers', totalMembers);
        this.updateStat('healthBMINormal', bmiStats.normal + '%');
        this.updateStat('healthBPNormal', bpStats.normal + '%');
        this.updateStat('healthWaterOptimal', waterStats.optimal + '%');
    }

    updateHealthCharts(bmiStats, bpStats) {
        this.updateHealthProgressBar('bmiNormalBar', bmiStats.normal);
        this.updateHealthProgressBar('bmiOverweightBar', bmiStats.overweight);
        this.updateHealthProgressBar('bmiObeseBar', bmiStats.obese);
        this.updateHealthProgressBar('bmiUnderweightBar', bmiStats.underweight);
        
        this.updateHealthProgressBar('bpNormalBar', bpStats.normal);
        this.updateHealthProgressBar('bpPreBar', bpStats.pre);
        this.updateHealthProgressBar('bpHighBar', bpStats.high);
    }

    updateHealthProgressBar(elementId, percentage) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.width = percentage + '%';
            element.textContent = percentage + '%';
        } else {
            console.warn('Element not found:', elementId);
        }
    }

    updateHealthTable(members) {
        const tbody = document.getElementById('healthDataTableBody');
        const noDataMessage = document.getElementById('noHealthData');
        
        if (!tbody) {
            console.error('healthDataTableBody not found!');
            return;
        }
        
        tbody.innerHTML = '';
        
        if (members.length === 0) {
            if (noDataMessage) noDataMessage.style.display = 'block';
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-4 text-muted">
                        <i class="fas fa-heartbeat fa-2x mb-2"></i>
                        <p>Belum ada data kesehatan</p>
                        <small>Data akan muncul setelah member mengisi form kesehatan</small>
                    </td>
                </tr>
            `;
            return;
        }
        
        if (noDataMessage) noDataMessage.style.display = 'none';
        
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
        console.log('Loading reports data...');
        try {
            const membersData = this.loadRealMembersData();
            this.generateRealTimeReports(membersData);
        } catch (error) {
            console.error('Error loading reports data:', error);
        }
    }

    generateRealTimeReports(members) {
        if (members.length === 0) {
            this.showEmptyReports();
            return;
        }
        
        const monthlyData = this.generateMonthlyData(members);
        const genderData = this.calculateGenderDistribution(members);
        const ageData = this.calculateAgeDistribution(members);
        const healthData = this.calculateHealthSummary(members);
        
        this.updateMonthlyChart(monthlyData);
        this.updateReportGenderChart(genderData);
        this.updateReportAgeChart(ageData);
        
        this.updateReportsSummary(healthData, members.length);
    }

    generateMonthlyData(members) {
        const monthlyCounts = {};
        const now = new Date();
        
        // Generate realistic data based on actual registration dates
        members.forEach(member => {
            const regDate = new Date(member.registrationDate);
            const monthKey = regDate.toLocaleDateString('id-ID', { month: 'short' });
            monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + 1;
        });
        
        // Fill in missing months with 0
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = date.toLocaleDateString('id-ID', { month: 'short' });
            if (!monthlyCounts[monthKey]) {
                monthlyCounts[monthKey] = 0;
            }
        }
        
        // Sort by month
        const sortedMonths = Object.keys(monthlyCounts).sort((a, b) => {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
            return months.indexOf(a) - months.indexOf(b);
        });
        
        return {
            labels: sortedMonths.slice(-6), // Last 6 months
            data: sortedMonths.slice(-6).map(month => monthlyCounts[month])
        };
    }

    calculateHealthSummary(members) {
        const total = members.length;
        if (total === 0) return {};
        
        const bmiNormal = members.filter(m => m.bmi >= 18.5 && m.bmi < 25).length;
        const bpNormal = members.filter(m => 
            m.bloodPressure.systolic < 120 && m.bloodPressure.diastolic < 80
        ).length;
        const mentalGood = members.filter(m => m.mentalStatus === 'Baik').length;
        const waterOptimal = members.filter(m => m.waterIntake >= 8).length;
        
        return {
            bmiNormal: Math.round((bmiNormal / total) * 100),
            bpNormal: Math.round((bpNormal / total) * 100),
            mentalGood: Math.round((mentalGood / total) * 100),
            waterOptimal: Math.round((waterOptimal / total) * 100),
            avgAge: Math.round(members.reduce((sum, m) => sum + m.age, 0) / total),
            avgBMI: Math.round((members.reduce((sum, m) => sum + m.bmi, 0) / total) * 10) / 10
        };
    }

    updateMonthlyChart(monthlyData) {
        const ctx = document.getElementById('monthlyChart');
        if (!ctx) {
            console.error('Monthly chart element not found');
            return;
        }
        
        if (this.monthlyChart) {
            this.monthlyChart.destroy();
        }
        
        this.monthlyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyData.labels,
                datasets: [{
                    label: 'Member Baru',
                    data: monthlyData.data,
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
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
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
        if (!ctx) {
            console.error('Report gender chart element not found');
            return;
        }
        
        if (this.reportGenderChart) {
            this.reportGenderChart.destroy();
        }
        
        this.reportGenderChart = new Chart(ctx, {
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
        if (!ctx) {
            console.error('Report age chart element not found');
            return;
        }
        
        if (this.reportAgeChart) {
            this.reportAgeChart.destroy();
        }
        
        this.reportAgeChart = new Chart(ctx, {
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

    updateReportsSummary(healthData, totalMembers) {
        console.log('Updating reports summary:', healthData);
        
        this.updateStat('reportTotalMembers', totalMembers);
        this.updateStat('reportAvgAge', healthData.avgAge || 0);
        this.updateStat('reportAvgBMI', healthData.avgBMI || 0);
        this.updateStat('reportBMINormal', (healthData.bmiNormal || 0) + '%');
        this.updateStat('reportBPNormal', (healthData.bpNormal || 0) + '%');
        this.updateStat('reportMentalGood', (healthData.mentalGood || 0) + '%');
        this.updateStat('reportWaterOptimal', (healthData.waterOptimal || 0) + '%');
        
        this.updateReportProgressBars(
            healthData.bmiNormal || 0,
            healthData.bpNormal || 0,
            healthData.mentalGood || 0,
            healthData.waterOptimal || 0
        );
        
        this.updateStat('trendBMI', (healthData.bmiNormal || 0) + '%');
        this.updateStat('trendBP', (healthData.bpNormal || 0) + '%');
        this.updateStat('trendMental', (healthData.mentalGood || 0) + '%');
        this.updateStat('trendWater', (healthData.waterOptimal || 0) + '%');
    }

    updateReportProgressBars(bmi, bp, mental, water) {
        const bmiProgress = document.getElementById('bmiProgress');
        const bpProgress = document.getElementById('bpProgress');
        const mentalProgress = document.getElementById('mentalProgress');
        const waterProgress = document.getElementById('waterProgress');
        
        if (bmiProgress) bmiProgress.style.width = bmi + '%';
        if (bpProgress) bpProgress.style.width = bp + '%';
        if (mentalProgress) mentalProgress.style.width = mental + '%';
        if (waterProgress) waterProgress.style.width = water + '%';
    }

    showEmptyReports() {
        const monthlyCtx = document.getElementById('monthlyChart');
        const genderCtx = document.getElementById('reportGenderChart');
        const ageCtx = document.getElementById('reportAgeChart');
        
        const emptyHTML = `
            <div class="text-center py-4">
                <i class="fas fa-chart-bar fa-3x text-muted mb-3"></i>
                <p class="text-muted">Belum ada data untuk ditampilkan</p>
                <small class="text-muted">Data akan muncul setelah member mendaftar</small>
            </div>
        `;
        
        if (monthlyCtx) monthlyCtx.innerHTML = emptyHTML;
        if (genderCtx) genderCtx.innerHTML = emptyHTML;
        if (ageCtx) ageCtx.innerHTML = emptyHTML;
        
        this.updateStat('reportTotalMembers', 0);
        this.updateStat('reportAvgAge', 0);
        this.updateStat('reportAvgBMI', 0);
        this.updateStat('reportBMINormal', '0%');
        this.updateStat('reportBPNormal', '0%');
        this.updateStat('reportMentalGood', '0%');
        this.updateStat('reportWaterOptimal', '0%');
        
        this.updateReportProgressBars(0, 0, 0, 0);
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
        } else {
            console.warn('Stat element not found:', elementId);
        }
    }

    showNotification(message, type = 'info') {
        console.log('Notification:', message);
        alert(message);
    }

    // Tambahkan method ini di class AdminApp
    generateSampleData() {
        const sampleData = [
            {
                fullName: "Budi Santoso",
                email: "budi.santoso@example.com",
                gender: "Laki-laki",
                age: 28,
                phone: "081234567890",
                weight: 75,
                height: "170",
                bmi: 25.9,
                bloodPressure: { systolic: 130, diastolic: 85 },
                waterIntake: 6,
                mentalStatus: "Perhatian",
                healthNotes: "Sering merasa stres karena pekerjaan",
                registrationDate: "23/11/2024",
                lastUpdate: "23/11/2024",
                userId: "1"
            },
            {
                fullName: "Sari Dewi",
                email: "sari.dewi@example.com",
                gender: "Perempuan", 
                age: 32,
                phone: "081234567891",
                weight: 58,
                height: "160",
                bmi: 22.7,
                bloodPressure: { systolic: 115, diastolic: 75 },
                waterIntake: 8,
                mentalStatus: "Butuh Bantuan",
                healthNotes: "Mengalami anxiety dan kesulitan tidur",
                registrationDate: "22/11/2024",
                lastUpdate: "23/11/2024",
                userId: "2"
            },
            {
                fullName: "Ahmad Rizki",
                email: "ahmad.rizki@example.com",
                gender: "Laki-laki",
                age: 35,
                phone: "081234567892",
                weight: 80,
                height: "175",
                bmi: 26.1,
                bloodPressure: { systolic: 140, diastolic: 90 },
                waterIntake: 4,
                mentalStatus: "Baik",
                healthNotes: "Tidak ada keluhan khusus",
                registrationDate: "21/11/2024",
                lastUpdate: "23/11/2024",
                userId: "3"
            }
        ];

        // Simpan sample data ke localStorage
        localStorage.setItem('adminMembersData', JSON.stringify(sampleData));
        console.log('Sample data generated:', sampleData);
        return sampleData;
    }

    // Modifikasi method loadRealMembersData menjadi:
    loadRealMembersData() {
        try {
            // Get data from localStorage
            let adminData = JSON.parse(localStorage.getItem('adminMembersData')) || [];
            
            // Jika tidak ada data, generate sample data untuk testing
            if (adminData.length === 0) {
                console.log('No members data found, generating sample data...');
                adminData = this.generateSampleData();
            }
            
            this.membersData = adminData;
            this.filteredMembers = [...this.membersData];
            
            console.log('Loaded members data:', this.membersData);
            return this.membersData;
            
        } catch (error) {
            console.error('Error loading members data:', error);
            // Fallback to sample data
            this.membersData = this.generateSampleData();
            this.filteredMembers = [...this.membersData];
            return this.membersData;
        }
    }
}

// ==================== FUNGSI GLOBAL ====================
function refreshMembersData() {
    if (window.adminApp) {
        window.adminApp.loadRealMembersData();
        window.adminApp.loadMembersData();
        window.adminApp.showNotification('Data member berhasil diperbarui', 'success');
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
    if (window.adminApp) {
        window.adminApp.deleteMember(email);
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

function viewMentalNotes(email) {
    const member = window.adminApp.membersData.find(m => m.email === email);
    if (member) {
        const notes = member.healthNotes || "Tidak ada catatan kesehatan tambahan";
        alert(`Catatan Kesehatan untuk ${member.fullName}:\n\n${notes}`);
    }
}

function refreshHealthData() {
    if (window.adminApp) {
        window.adminApp.loadHealthData();
        window.adminApp.showNotification('Data kesehatan diperbarui', 'success');
    }
}

function refreshMentalHealthData() {
    if (window.adminApp) {
        window.adminApp.loadMentalHealthData();
        window.adminApp.showNotification('Data kesehatan mental diperbarui', 'success');
    }
}

function refreshData() {
    if (window.adminApp) {
        window.adminApp.loadDashboardData();
        window.adminApp.showNotification('Data berhasil diperbarui!', 'success');
    }
}

function exportData() {
    if (window.adminApp) {
        exportMembersData();
    }
}

function exportHealthReport() {
    if (window.adminApp) {
        window.adminApp.showNotification('Mengekspor laporan kesehatan...', 'info');
    }
}

function addMentalNote() {
    if (window.adminApp) {
        window.adminApp.showNotification('Membuka form tambah catatan mental...', 'info');
    }
}

function refreshReports() {
    if (window.adminApp) {
        window.adminApp.loadReportsData();
        window.adminApp.showNotification('Laporan berhasil diperbarui', 'success');
    }
}

function generatePDFReport() {
    if (window.adminApp) {
        window.adminApp.showNotification('Membuat laporan PDF...', 'info');
        setTimeout(() => {
            const dataStr = JSON.stringify(window.adminApp.membersData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `laporan-kesehatan-${new Date().toISOString().split('T')[0]}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
            
            window.adminApp.showNotification('Laporan PDF berhasil diunduh', 'success');
        }, 2000);
    }
}

// Tambahkan fungsi global ini
function refreshHealthData() {
    if (window.adminApp) {
        window.adminApp.loadHealthData();
        window.adminApp.showNotification('Data kesehatan diperbarui', 'success');
    }
}

function refreshMentalHealthData() {
    if (window.adminApp) {
        window.adminApp.loadMentalHealthData();
        window.adminApp.showNotification('Data kesehatan mental diperbarui', 'success');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing AdminApp...');
    window.adminApp = new AdminApp();
});
