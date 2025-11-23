// dashboard.js - Dashboard specific functionality (Updated)

class DashboardCharts {
    constructor() {
        this.charts = {};
        this.init();
    }

    init() {
        this.initializeGenderChart();
        this.initializeAgeChart();
        this.initializeProgressChart();
    }

    initializeGenderChart() {
        const ctx = document.getElementById('genderChart');
        if (!ctx) return;

        this.charts.gender = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Laki-laki', 'Perempuan'],
                datasets: [{
                    data: [55, 45], // Sample data, will be updated
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

    initializeAgeChart() {
        const ctx = document.getElementById('ageChart');
        if (!ctx) return;

        this.charts.age = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['18-25', '26-35', '36-45', '46-55', '56+'],
                datasets: [{
                    label: 'Jumlah Member',
                    data: [25, 35, 20, 15, 5], // Sample data
                    backgroundColor: '#1e88e5',
                    borderColor: '#1565c0',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    initializeProgressChart() {
        const ctx = document.getElementById('progressChart');
        if (!ctx) return;

        this.charts.progress = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.generateLast30Days(),
                datasets: [
                    {
                        label: 'Progress Rata-rata',
                        data: this.generateProgressData(),
                        borderColor: '#1e88e5',
                        backgroundColor: 'rgba(30, 136, 229, 0.1)',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    generateLast30Days() {
        const days = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.getDate() + '/' + (date.getMonth() + 1));
        }
        return days;
    }

    generateProgressData() {
        let progress = 50;
        return Array(30).fill(0).map(() => {
            progress += (Math.random() - 0.3) * 10;
            progress = Math.max(30, Math.min(95, progress));
            return Math.round(progress);
        });
    }

    updateCharts(genderData, ageData) {
        if (this.charts.gender) {
            this.charts.gender.data.datasets[0].data = genderData;
            this.charts.gender.update();
        }
        
        if (this.charts.age) {
            this.charts.age.data.datasets[0].data = ageData;
            this.charts.age.update();
        }
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.dashboardCharts = new DashboardCharts();
});