// health-data.js - Health data management untuk admin

class HealthDataManager {
    constructor() {
        this.membersData = [];
        this.healthMetrics = {};
        this.init();
    }

    init() {
        this.loadMembersData();
        this.setupEventListeners();
    }

    loadMembersData() {
        // Simulasi data dari localStorage user
        const sampleMembers = [
            {
                id: 1,
                fullName: "Budi Santoso",
                email: "budi@email.com",
                gender: "Laki-laki",
                age: 28,
                phone: "081234567890",
                registrationDate: "2024-03-15",
                bmi: 24.5,
                bloodPressure: { systolic: 120, diastolic: 80 },
                mentalStatus: "Baik",
                lastActivity: "2024-03-20"
            },
            {
                id: 2,
                fullName: "Siti Rahayu",
                email: "siti@email.com", 
                gender: "Perempuan",
                age: 32,
                phone: "081234567891",
                registrationDate: "2024-03-16",
                bmi: 28.7,
                bloodPressure: { systolic: 135, diastolic: 85 },
                mentalStatus: "Perhatian",
                lastActivity: "2024-03-19"
            },
            {
                id: 3,
                fullName: "Ahmad Wijaya",
                email: "ahmad@email.com",
                gender: "Laki-laki",
                age: 45,
                phone: "081234567892",
                registrationDate: "2024-03-17",
                bmi: 31.2,
                bloodPressure: { systolic: 145, diastolic: 95 },
                mentalStatus: "Butuh Bantuan",
                lastActivity: "2024-03-18"
            },
            {
                id: 4,
                fullName: "Maya Sari",
                email: "maya@email.com",
                gender: "Perempuan",
                age: 22,
                phone: "081234567893",
                registrationDate: "2024-03-18",
                bmi: 18.5,
                bloodPressure: { systolic: 110, diastolic: 70 },
                mentalStatus: "Baik",
                lastActivity: "2024-03-20"
            }
        ];

        this.membersData = sampleMembers;
        this.calculateHealthMetrics();
        this.updateDashboard();
    }

    calculateHealthMetrics() {
        const metrics = {
            totalMembers: this.membersData.length,
            averageAge: 0,
            genderDistribution: { male: 0, female: 0 },
            bmiDistribution: { normal: 0, overweight: 0, obese: 0, underweight: 0 },
            bpDistribution: { normal: 0, pre: 0, high: 0 },
            mentalDistribution: { good: 0, attention: 0, help: 0 }
        };

        let totalAge = 0;

        this.membersData.forEach(member => {
            // Age calculation
            totalAge += member.age;

            // Gender distribution
            if (member.gender === "Laki-laki") metrics.genderDistribution.male++;
            else metrics.genderDistribution.female++;

            // BMI classification
            if (member.bmi < 18.5) metrics.bmiDistribution.underweight++;
            else if (member.bmi < 25) metrics.bmiDistribution.normal++;
            else if (member.bmi < 30) metrics.bmiDistribution.overweight++;
            else metrics.bmiDistribution.obese++;

            // Blood pressure classification
            if (member.bloodPressure.systolic < 120 && member.bloodPressure.diastolic < 80) {
                metrics.bpDistribution.normal++;
            } else if (member.bloodPressure.systolic < 140 && member.bloodPressure.diastolic < 90) {
                metrics.bpDistribution.pre++;
            } else {
                metrics.bpDistribution.high++;
            }

            // Mental health classification
            if (member.mentalStatus === "Baik") metrics.mentalDistribution.good++;
            else if (member.mentalStatus === "Perhatian") metrics.mentalDistribution.attention++;
            else metrics.mentalDistribution.help++;
        });

        metrics.averageAge = Math.round(totalAge / metrics.totalMembers);
        
        // Convert to percentages
        metrics.bmiDistribution = this.calculatePercentages(metrics.bmiDistribution);
        metrics.bpDistribution = this.calculatePercentages(metrics.bpDistribution);
        metrics.mentalDistribution = this.calculatePercentages(metrics.mentalDistribution);

        this.healthMetrics = metrics;
    }

    calculatePercentages(distribution) {
        const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
        const percentages = {};
        
        for (const [key, value] of Object.entries(distribution)) {
            percentages[key] = Math.round((value / total) * 100);
        }
        
        return percentages;
    }

    updateDashboard() {
        // Update stats cards
        this.updateStatCard('statMembers', this.healthMetrics.totalMembers);
        this.updateStatCard('statAge', this.healthMetrics.averageAge);
        
        const normalBMIPercentage = this.healthMetrics.bmiDistribution.normal;
        this.updateStatCard('statBMI', normalBMIPercentage + '%');
        
        const needMentalAttention = this.healthMetrics.mentalDistribution.attention + this.healthMetrics.mentalDistribution.help;
        this.updateStatCard('statMental', needMentalAttention);

        // Update sidebar stats
        this.updateStatCard('totalMembers', this.healthMetrics.totalMembers);
        this.updateStatCard('averageAge', this.healthMetrics.averageAge);
        this.updateStatCard('mentalAttention', needMentalAttention);

        // Update health progress bars
        this.updateHealthProgress('bmiNormal', this.healthMetrics.bmiDistribution.normal);
        this.updateHealthProgress('bmiOverweight', this.healthMetrics.bmiDistribution.overweight);
        this.updateHealthProgress('bmiObese', this.healthMetrics.bmiDistribution.obese);
        this.updateHealthProgress('bmiUnderweight', this.healthMetrics.bmiDistribution.underweight);

        this.updateHealthProgress('bpNormal', this.healthMetrics.bpDistribution.normal);
        this.updateHealthProgress('bpPre', this.healthMetrics.bpDistribution.pre);
        this.updateHealthProgress('bpHigh', this.healthMetrics.bpDistribution.high);

        this.updateHealthProgress('mentalGood', this.healthMetrics.mentalDistribution.good);
        this.updateHealthProgress('mentalAttention', this.healthMetrics.mentalDistribution.attention);
        this.updateHealthProgress('mentalHelp', this.healthMetrics.mentalDistribution.help);

        // Update tables
        this.updateRecentMembersTable();
        this.updateAttentionMembersTable();

        // Update notifications
        this.updateNotifications();
    }

    updateStatCard(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    updateHealthProgress(elementId, percentage) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.width = percentage + '%';
            element.textContent = percentage + '%';
        }
    }

    updateRecentMembersTable() {
        const tbody = document.getElementById('recentMembersBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.membersData.slice(0, 5).forEach(member => {
            const row = document.createElement('tr');
            
            const bmiStatus = this.getBMIStatus(member.bmi);
            const bpStatus = this.getBPStatus(member.bloodPressure);
            const mentalBadge = this.getMentalBadge(member.mentalStatus);

            row.innerHTML = `
                <td>
                    <div class="d-flex align-items-center">
                        <img src="https://via.placeholder.com/32" alt="Avatar" class="rounded-circle me-2" width="32">
                        <div>
                            <div class="fw-bold">${member.fullName}</div>
                            <small class="text-muted">${member.email}</small>
                        </div>
                    </div>
                </td>
                <td>${member.age} tahun</td>
                <td>${member.gender}</td>
                <td>
                    <span class="badge ${bmiStatus.class}">${member.bmi} (${bmiStatus.text})</span>
                </td>
                <td>
                    <span class="badge ${bpStatus.class}">${member.bloodPressure.systolic}/${member.bloodPressure.diastolic}</span>
                </td>
                <td>${mentalBadge}</td>
                <td>${new Date(member.registrationDate).toLocaleDateString('id-ID')}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewMemberDetail(${member.id})">Detail</button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }

    updateAttentionMembersTable() {
        const tbody = document.getElementById('attentionMembersBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        const attentionMembers = this.membersData.filter(member => 
            member.bmi >= 30 || 
            member.bloodPressure.systolic >= 140 || 
            member.mentalStatus !== "Baik"
        );

        attentionMembers.forEach(member => {
            const row = document.createElement('tr');
            
            const issues = [];
            if (member.bmi >= 30) issues.push('Obesitas');
            if (member.bloodPressure.systolic >= 140) issues.push('Hipertensi');
            if (member.mentalStatus !== "Baik") issues.push('Kesehatan Mental');

            const bmiStatus = this.getBMIStatus(member.bmi);
            const bpStatus = this.getBPStatus(member.bloodPressure);

            row.innerHTML = `
                <td>
                    <div class="d-flex align-items-center">
                        <img src="https://via.placeholder.com/32" alt="Avatar" class="rounded-circle me-2" width="32">
                        <div>
                            <div class="fw-bold">${member.fullName}</div>
                            <small class="text-muted">${member.email}</small>
                        </div>
                    </div>
                </td>
                <td>${member.age} tahun</td>
                <td>${issues.join(', ')}</td>
                <td>
                    <span class="badge ${bmiStatus.class}">${member.bmi}</span>
                </td>
                <td>
                    <span class="badge ${bpStatus.class}">${member.bloodPressure.systolic}/${member.bloodPressure.diastolic}</span>
                </td>
                <td><span class="badge bg-warning">Perlu Perhatian</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-warning" onclick="contactMember(${member.id})">Hubungi</button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }

    getBMIStatus(bmi) {
        if (bmi < 18.5) return { class: 'bg-info', text: 'Underweight' };
        if (bmi < 25) return { class: 'bg-success', text: 'Normal' };
        if (bmi < 30) return { class: 'bg-warning', text: 'Overweight' };
        return { class: 'bg-danger', text: 'Obesitas' };
    }

    getBPStatus(bp) {
        if (bp.systolic < 120 && bp.diastolic < 80) return { class: 'bg-success' };
        if (bp.systolic < 140 && bp.diastolic < 90) return { class: 'bg-warning' };
        return { class: 'bg-danger' };
    }

    getMentalBadge(status) {
        const badges = {
            'Baik': 'bg-success',
            'Perhatian': 'bg-warning', 
            'Butuh Bantuan': 'bg-danger'
        };
        return `<span class="badge ${badges[status]}">${status}</span>`;
    }

    updateNotifications() {
        const attentionCount = this.membersData.filter(member => 
            member.bmi >= 30 || 
            member.bloodPressure.systolic >= 140 || 
            member.mentalStatus !== "Baik"
        ).length;

        document.getElementById('notificationCount').textContent = attentionCount;

        const notificationList = document.getElementById('notificationList');
        if (attentionCount > 0) {
            notificationList.innerHTML = `
                <li><h6 class="dropdown-header">Notifikasi (${attentionCount})</h6></li>
                <li><a class="dropdown-item" href="mental-health.html"><i class="fas fa-brain me-2"></i>${this.healthMetrics.mentalDistribution.help} member butuh bantuan mental</a></li>
                <li><a class="dropdown-item" href="health-data.html"><i class="fas fa-heart-pulse me-2"></i>${this.healthMetrics.bpDistribution.high}% memiliki hipertensi</a></li>
                <li><a class="dropdown-item" href="members.html"><i class="fas fa-weight-scale me-2"></i>${this.healthMetrics.bmiDistribution.obese}% mengalami obesitas</a></li>
            `;
        }
    }

    setupEventListeners() {
        // Setup any additional event listeners here
    }
}

// Global functions
function refreshData() {
    if (window.healthDataManager) {
        window.healthDataManager.loadMembersData();
        window.adminApp.showNotification('Data berhasil diperbarui!', 'success');
    }
}

function exportData() {
    if (window.healthDataManager) {
        const dataStr = JSON.stringify(window.healthDataManager.membersData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `health-data-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        window.adminApp.showNotification('Data berhasil diekspor!', 'success');
    }
}

function viewMemberDetail(memberId) {
    window.adminApp.showNotification(`Membuka detail member ID: ${memberId}`, 'info');
    // Navigate to member detail page
    window.location.href = `member-detail.html?id=${memberId}`;
}

function contactMember(memberId) {
    window.adminApp.showNotification(`Menghubungi member ID: ${memberId}`, 'info');
    // Implement contact functionality
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.healthDataManager = new HealthDataManager();
});