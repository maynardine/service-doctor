const container = document.querySelector('.container');
const adminBtn = document.querySelector('.admin-btn');
const userBtn = document.querySelector('.user-btn');

// Fungsi toggle form
adminBtn.addEventListener('click', () => {
    container.classList.add('active');
})

userBtn.addEventListener('click', () => {
    container.classList.remove('active');
})

// Login User - redirect ke halaman biodata user
document.getElementById('userForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('userUsername').value;
    const password = document.getElementById('userPassword').value;
    
    // Ganti dengan validasi dari teman Anda
    if (username && password) {
        // Cek apakah user sudah pernah mengisi biodata
        const existingBiodata = localStorage.getItem('userBiodata');
        
        if (existingBiodata) {
            // Jika sudah ada biodata, langsung ke halaman utama
            window.location.href = 'user/index.html';
        } else {
            // Jika belum ada biodata, redirect ke halaman biodata
            window.location.href = 'user/biodata.html';
        }
    }
});

// Login Admin - redirect ke halaman admin teman Anda  
document.getElementById('adminForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    // Ganti dengan validasi dari teman Anda
    if (username && password) {
        window.location.href = 'admin/index.html';
    }
});