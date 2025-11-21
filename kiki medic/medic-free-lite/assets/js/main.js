(function () {
"use strict";

	//===== Preloader

	window.onload = function () {
		window.setTimeout(fadeout, 500);
	}

	function fadeout() {
		document.querySelector('.preloader').style.opacity = '0';
		document.querySelector('.preloader').style.display = 'none';
	}


	/*=====================================
	Sticky
	======================================= */
	window.onscroll = function () {
		var header_navbar = document.querySelector(".navbar-area");
		var sticky = header_navbar.offsetTop;

		if (window.pageYOffset > sticky) {
			header_navbar.classList.add("sticky");
		} else {
			header_navbar.classList.remove("sticky");
		}



		// show or hide the back-top-top button
		var backToTo = document.querySelector(".scroll-top");
		if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
			backToTo.style.display = "block";
		} else {
			backToTo.style.display = "none";
		}
	};

	// Get the navbar

	//======= tiny slider for slider-active
	tns({
		container: '.slider-active',
		items: 1,
		slideBy: 'page',
		autoplay: true,
		mouseDrag: true,
		gutter: 0,
		nav: true,
		controls: false,
		autoplayButtonOutput: false,
	});

	// for menu scroll 
	var pageLink = document.querySelectorAll('.page-scroll');

	pageLink.forEach(elem => {
		elem.addEventListener('click', e => {
			e.preventDefault();
			document.querySelector(elem.getAttribute('href')).scrollIntoView({
				behavior: 'smooth',
				offsetTop: 1 - 60,
			});
		});
	});

	// section menu active
	function onScroll(event) {
		var sections = document.querySelectorAll('.page-scroll');
		var scrollPos = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;

		for (var i = 0; i < sections.length; i++) {
			var currLink = sections[i];
			var val = currLink.getAttribute('href');
			var refElement = document.querySelector(val);
			var scrollTopMinus = scrollPos + 73;
			if (refElement.offsetTop <= scrollTopMinus && (refElement.offsetTop + refElement.offsetHeight > scrollTopMinus)) {
				document.querySelector('.page-scroll').classList.remove('active');
				currLink.classList.add('active');
			} else {
				currLink.classList.remove('active');
			}
		}
	};

	window.document.addEventListener('scroll', onScroll);


	//===== close navbar-collapse when a  clicked
	let navbarToggler = document.querySelector(".navbar-toggler");
	var navbarCollapse = document.querySelector(".navbar-collapse");

	document.querySelectorAll(".page-scroll").forEach(e =>
		e.addEventListener("click", () => {
			navbarToggler.classList.remove("active");
			navbarCollapse.classList.remove('show')
		})
	);
	navbarToggler.addEventListener('click', function () {
		navbarToggler.classList.toggle("active");
	})




	//======== WOW active
	new WOW().init();

// ==========================================
// FITUR KESEHATAN (GLOBAL FUNCTIONS)
// ==========================================

// 1. BMI CALCULATOR
window.calculateSidebarBMI = function() {
    const w = parseFloat(document.getElementById('sidebarWeight').value);
    const h = parseFloat(document.getElementById('sidebarHeight').value);
    
    if(!w || !h) { alert("Isi berat & tinggi dulu bro!"); return; }

    const bmi = (w / ((h/100)**2)).toFixed(1);
    let cat = "", color = "secondary", foods = [];

    if(bmi < 18.5) { cat="Kurus"; color="warning"; foods=["Perbanyak protein", "Minum susu", "Makan teratur"]; }
    else if(bmi < 25) { cat="Ideal"; color="success"; foods=["Pertahankan 4 sehat 5 sempurna"]; }
    else if(bmi < 30) { cat="Gemuk"; color="warning"; foods=["Kurangi gula", "Perbanyak sayur"]; }
    else { cat="Obesitas"; color="danger"; foods=["Hindari fastfood", "Konsultasi dokter"]; }

    document.getElementById('sidebarBmiValue').innerText = bmi;
    const badge = document.getElementById('sidebarBmiCategory');
    badge.innerText = cat;
    badge.className = "badge bg-" + color;
    
    const list = document.getElementById('sidebarFoodList');
    list.innerHTML = "";
    foods.forEach(f => list.innerHTML += `<li>- ${f}</li>`);

    document.getElementById('sidebarResult').style.display = "block";
};

// 2. WATER CALCULATOR
window.calculateWater = function() {
    const w = parseFloat(document.getElementById('waterWeight').value);
    if(!w) { alert("Berat badan berapa bro?"); return; }

    const l = (w * 0.03).toFixed(1);
    document.getElementById('waterLiters').innerText = l;
    document.getElementById('waterGlasses').innerText = Math.round((w*30)/250);
    document.getElementById('waterResult').style.display = "block";
};

// 3. BLOOD PRESSURE (TENSI)
window.checkBloodPressure = function() {
    const s = parseInt(document.getElementById('bpSystolic').value);
    const d = parseInt(document.getElementById('bpDiastolic').value);
    if(!s || !d) { alert("Isi tensi dulu!"); return; }

    let stat = "Normal", col = "#2ecc71", adv = "Tensi aman, pertahankan!";

    if(s<90 || d<60) { stat="Rendah"; col="#f39c12"; adv="Kurang darah? Istirahat & minum cukup."; }
    else if(s>=140 || d>=90) { stat="Tinggi (Hipertensi)"; col="#e74c3c"; adv="Bahaya! Kurangi garam & cek dokter."; }
    else if(s>=120 && d<80) { stat="Sedikit Naik"; col="#f1c40f"; adv="Hati-hati, jaga pola makan."; }

    const stEl = document.getElementById('bpStatus');
    stEl.innerText = stat;
    stEl.style.color = col;
    document.getElementById('bpAdvice').innerText = adv;
    document.getElementById('bpResult').style.display = "block";
};

// ==========================================
    // FITUR KIRIM KE WHATSAPP
    // ==========================================
window.sendToWhatsapp = function() {
        console.log("Tombol diklik..."); // Cek di console

        // 1. Ambil Elemen Dulu (Bukan Value-nya langsung)
        var elName = document.getElementById('waName');
        var elNumber = document.getElementById('waNumber');
        var elService = document.getElementById('waService');
        var elMessage = document.getElementById('waMessage');

        // 2. Cek Apakah Elemen Ditemukan?
        if (!elName) { alert("Error: Input Nama (id='waName') tidak ditemukan di HTML!"); return; }
        if (!elNumber) { alert("Error: Input Nomor (id='waNumber') tidak ditemukan di HTML!"); return; }
        if (!elService) { alert("Error: Dropdown Layanan (id='waService') tidak ditemukan di HTML!"); return; }
        if (!elMessage) { alert("Error: Input Pesan (id='waMessage') tidak ditemukan di HTML!"); return; }

        // 3. Ambil Nilainya
        var name = elName.value;
        var number = elNumber.value;
        var service = elService.value;
        var message = elMessage.value;

        // 4. Validasi Isian
        if (name === "" || number === "" || message === "") {
            alert("Mohon lengkapi Nama, Nomor HP, dan Pesan Anda!");
            return;
        }

        // 5. Format Nomor HP (Ubah 08xx jadi 628xx)
        // Kalau user ngetik 0812..., kita ubah jadi 62812...
        if (number.startsWith('0')) {
            number = '62' + number.substring(1);
        }

        // 6. Kirim ke WhatsApp
        // GANTI NOMOR ADMIN DISINI
        var adminPhone = "6289612224046"; 

        var text = "Halo Admin Medic, saya ingin bertanya.%0A%0A" +
                   "*Nama:* " + name + "%0A" +
                   "*No HP:* " + number + "%0A" +
                   "*Keperluan:* " + service + "%0A" +
                   "*Pesan:* " + message;

        var url = "https://wa.me/" + adminPhone + "?text=" + text;
        
        console.log("Membuka URL: " + url);
        window.open(url, '_blank');
    };

})();	