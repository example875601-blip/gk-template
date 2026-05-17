document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    const logo = document.getElementById('logo');
    const logoKontakt = document.getElementById('logo-kontakt');
    const navLinks = document.querySelectorAll('.nav-menu a');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    });

    if (logo) {
        logo.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    if (logoKontakt) {
        logoKontakt.addEventListener('click', () => {
            window.location.href = "index.html";
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.includes('#')) {
                const [path, targetId] = href.split('#');
                const isHomePage = window.location.pathname === '/' || 
                                   window.location.pathname.endsWith('index.html') || 
                                   path === 'index.html' || path === '';

                if (isHomePage) {
                    const targetSection = document.querySelector('#' + targetId);
                    if (targetSection) {
                        e.preventDefault();
                        const headerHeight = header.offsetHeight;
                        const targetPosition = targetSection.offsetTop - headerHeight;
                        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                    }
                }
            }
        });
    });

    // Wczytywanie galerii z pliku galeria.json (Netlify CMS)
    const galleryContainer = document.getElementById('cms-gallery');
    if (galleryContainer) {
        // Cache buster by zawsze pobierało nową wersję po aktualizacji z telefonu
        fetch('galeria.json?t=' + new Date().getTime())
        .then(response => {
            if (!response.ok) throw new Error("Brak pliku galeria.json");
            return response.json();
        })
        .then(data => {
            if (data && data.images && data.images.length > 0) {
                galleryContainer.innerHTML = ''; 
                
                data.images.forEach(itemData => {
                    const title = itemData.title || "Realizacja Wykończenia";
                    // Netlify CMS dopisuje uploader, dlatego url zostaje z /images/uploads/...
                    const imgUrl = itemData.image; 
                    
                    const item = document.createElement('div');
                    item.className = 'gallery-item';
                    item.innerHTML = `
                        <img src="${imgUrl}" alt="${title}">
                        <div class="gallery-overlay">
                            <span>${title}</span>
                        </div>
                    `;
                    galleryContainer.appendChild(item);
                });
                initCMSLightbox();
            } else {
                galleryContainer.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">Galeria jest pusta. Zaloguj się w panelu (/admin) i dodaj zdjęcia.</p>';
            }
        })
        .catch(err => {
            console.error(err);
            galleryContainer.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: #e74c3c;">Nie udało się załadować zdjęć galerii.</p>';
        });
    }

    function initCMSLightbox() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxCaption = document.getElementById('lightbox-caption');
        const lightboxClose = document.querySelector('.lightbox-close');

        if(galleryItems.length > 0 && lightbox) {
            galleryItems.forEach(item => {
                item.addEventListener('click', () => {
                    const img = item.querySelector('img');
                    const captionText = item.querySelector('.gallery-overlay span').textContent;
                    lightbox.style.display = "block";
                    lightboxImg.src = img.src;
                    lightboxCaption.textContent = captionText;
                });
            });

            lightboxClose.addEventListener('click', () => { lightbox.style.display = "none"; });
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) { lightbox.style.display = "none"; }
            });
        }
    }

    // Formularz
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            formStatus.textContent = "Wysyłanie wiadomości...";
            formStatus.style.display = "block";
            formStatus.style.backgroundColor = "#3498db";
            formStatus.style.color = "#fff";

            const formData = new FormData(contactForm);
            fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData })
            .then(async (response) => {
                let json = await response.json();
                if (response.status == 200) {
                    formStatus.textContent = "Dziękujemy! Wiadomość została wysłana. Skontaktujemy się wkrótce.";
                    formStatus.style.backgroundColor = "#2ecc71";
                    contactForm.reset();
                } else {
                    formStatus.textContent = json.message || "Wystąpił błąd. Spróbuj ponownie później.";
                    formStatus.style.backgroundColor = "#e74c3c";
                }
            }).catch(error => {
                formStatus.textContent = "Brak połączenia z internetem. Nie udało się wysłać.";
                formStatus.style.backgroundColor = "#e74c3c";
            });
        });
    }
});
