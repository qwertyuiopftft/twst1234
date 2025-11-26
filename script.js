let scene, camera, renderer, particles, particleGeometry, particleMaterial;
let mouseX = 0, mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

function initThreeJS() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const particleCount = 2000;
    particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 200;
        positions[i + 1] = (Math.random() - 0.5) * 200;
        positions[i + 2] = (Math.random() - 0.5) * 100;
        colors[i] = 1;
        colors[i + 1] = 1;
        colors[i + 2] = 1;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    particleMaterial = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    const geometries = [
        new THREE.TorusGeometry(10, 3, 16, 100),
        new THREE.OctahedronGeometry(8),
        new THREE.IcosahedronGeometry(7)
    ];

    geometries.forEach((geo) => {
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true,
            transparent: true,
            opacity: 0.1
        });
        const mesh = new THREE.Mesh(geo, material);
        mesh.position.set(
            (Math.random() - 0.5) * 50,
            (Math.random() - 0.5) * 50,
            (Math.random() - 0.5) * 30
        );
        mesh.userData = { 
            rotationSpeed: 0.001 + Math.random() * 0.002,
            floatSpeed: 0.0005 + Math.random() * 0.001
        };
        scene.add(mesh);
    });

    animate();
}

function animate() {
    requestAnimationFrame(animate);

    if (particles) {
        particles.rotation.y += 0.0005;
        particles.rotation.x += 0.0002;
    }

    camera.position.x += (mouseX * 0.05 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 0.05 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    scene.children.forEach(child => {
        if (child instanceof THREE.Mesh && child.userData.rotationSpeed) {
            child.rotation.x += child.userData.rotationSpeed;
            child.rotation.y += child.userData.rotationSpeed;
            child.position.y += Math.sin(Date.now() * child.userData.floatSpeed) * 0.01;
        }
    });

    renderer.render(scene, camera);
}

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX) / windowHalfX;
    mouseY = (event.clientY - windowHalfY) / windowHalfY;
});

window.addEventListener('resize', () => {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.about-card, .tech-card, .stat-card, .learning-card').forEach(el => {
        observer.observe(el);
    });
}

function initParallax() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        document.querySelectorAll('.section').forEach((section) => {
            const speed = 0.5;
            const yPos = -(scrolled * speed);
            section.style.transform = `translateY(${yPos * 0.1}px)`;
        });
    });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    initScrollAnimations();
    initParallax();
});

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const optimizedScroll = debounce(() => {}, 10);
window.addEventListener('scroll', optimizedScroll);

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

setTimeout(() => {
    document.querySelectorAll('.about-card, .tech-card, .learning-card').forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('shimmer');
            setTimeout(() => {
                card.classList.remove('shimmer');
            }, 1000);
        }, index * 200);
    });
}, 500);

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

function createRipple(event) {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
    circle.classList.add('ripple');
    
    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) {
        ripple.remove();
    }
    button.appendChild(circle);
}

document.querySelectorAll('.btn-primary, .btn-secondary, .btn-small, #send-btn').forEach(button => {
    button.addEventListener('click', createRipple);
});

function preloadResources() {
    const links = [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://cdnjs.cloudflare.com' }
    ];
    links.forEach(link => {
        const linkElement = document.createElement('link');
        linkElement.rel = link.rel;
        linkElement.href = link.href;
        document.head.appendChild(linkElement);
    });
}

preloadResources();

window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    setTimeout(() => {
        document.querySelectorAll('.hero-content > *').forEach((el, index) => {
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 300);
});

const revealSection = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
};

const sectionObserver = new IntersectionObserver(revealSection, {
    threshold: 0.15
});

document.querySelectorAll('.section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    sectionObserver.observe(section);
});