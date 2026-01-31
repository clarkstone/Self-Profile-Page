// Navigation toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    // GitHub API integration
    const githubUsername = 'clarkstone'; // Change this to your actual GitHub username
    const projectsContainer = document.getElementById('projects-container');
    const repoCountEl = document.getElementById('repo-count');
    const forkCountEl = document.getElementById('fork-count');
    const starCountEl = document.getElementById('star-count');

    // Fetch GitHub repositories
    async function fetchGitHubProjects() {
        try {
            // Show loading state
            if (projectsContainer) {
                projectsContainer.innerHTML = `
                    <div class="loading-spinner">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Loading projects from GitHub...</p>
                    </div>
                `;
            }

            // Fetch user repositories
            const response = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=10&type=public`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const repos = await response.json();
            
            // Fetch user stats
            const userResponse = await fetch(`https://api.github.com/users/${githubUsername}`);
            const userData = await userResponse.json();
            
            // Update stats
            if (repoCountEl) repoCountEl.textContent = userData.public_repos || 0;
            if (forkCountEl) {
                const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
                forkCountEl.textContent = totalForks;
            }
            if (starCountEl) {
                const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
                starCountEl.textContent = totalStars;
            }
            
            // Display projects
            displayProjects(repos);
            
        } catch (error) {
            console.error('Error fetching GitHub projects:', error);
            displayError(error.message);
        }
    }

    // Display projects in the grid
    function displayProjects(repos) {
        if (!projectsContainer) return;
        
        if (repos.length === 0) {
            projectsContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>No projects found</h3>
                    <p>No public repositories found on GitHub.</p>
                </div>
            `;
            return;
        }

        const projectsHTML = repos.map(repo => {
            const description = repo.description || 'No description available';
            const language = repo.language || 'Unknown';
            const updatedAt = new Date(repo.updated_at).toLocaleDateString();
            
            return `
                <div class="project-card">
                    <div class="project-header">
                        <div class="project-name">
                            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">
                                ${repo.name}
                            </a>
                        </div>
                        ${repo.fork ? '<span class="fork-badge">Fork</span>' : ''}
                    </div>
                    
                    <div class="project-description">${description}</div>
                    
                    <div class="project-language">${language}</div>
                    
                    ${repo.topics && repo.topics.length > 0 ? `
                        <div class="project-topics">
                            ${repo.topics.slice(0, 5).map(topic => 
                                `<span class="topic-tag">${topic}</span>`
                            ).join('')}
                        </div>
                    ` : ''}
                    
                    <div class="project-meta">
                        <div class="project-stat">
                            <i class="fas fa-star"></i>
                            <span>${repo.stargazers_count}</span>
                        </div>
                        <div class="project-stat">
                            <i class="fas fa-code-branch"></i>
                            <span>${repo.forks_count}</span>
                        </div>
                        <div class="project-stat">
                            <i class="fas fa-eye"></i>
                            <span>${repo.watchers_count}</span>
                        </div>
                    </div>
                    
                    <div class="project-footer">
                        <div class="project-date">Updated ${updatedAt}</div>
                        <div class="project-links">
                            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="project-link">
                                <i class="fab fa-github"></i>
                                View
                            </a>
                            ${repo.homepage ? `
                                <a href="${repo.homepage}" target="_blank" rel="noopener noreferrer" class="project-link">
                                    <i class="fas fa-external-link-alt"></i>
                                    Demo
                                </a>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        projectsContainer.innerHTML = projectsHTML;
        
        // Add animation to project cards
        const cards = projectsContainer.querySelectorAll('.project-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    // Display error message
    function displayError(message) {
        if (!projectsContainer) return;
        
        projectsContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Unable to load projects</h3>
                <p>${message}</p>
                <p>Please check your internet connection or try again later.</p>
                <button onclick="fetchGitHubProjects()" class="btn btn-primary">Retry</button>
            </div>
        `;
    }

    // Initialize GitHub projects fetch
    if (document.getElementById('projects')) {
        fetchGitHubProjects();
        
        // Refresh projects every 5 minutes
        setInterval(fetchGitHubProjects, 5 * 60 * 1000);
    }

    // Toggle mobile menu
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        
        // Animate hamburger menu
        const spans = navToggle.querySelectorAll('span');
        spans.forEach((span, index) => {
            if (navMenu.classList.contains('active')) {
                if (index === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
                if (index === 1) span.style.opacity = '0';
                if (index === 2) span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                span.style.transform = 'none';
                span.style.opacity = '1';
            }
        });
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            const spans = navToggle.querySelectorAll('span');
            spans.forEach(span => {
                span.style.transform = 'none';
                span.style.opacity = '1';
            });
        });
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active navigation link highlighting
    window.addEventListener('scroll', function() {
        let current = '';
        const sections = document.querySelectorAll('section');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    });

    // Navbar background on scroll
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
        }
    });

    // Contact form handling
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const message = this.querySelector('textarea').value;
            
            // Basic validation
            if (!name || !email || !message) {
                showNotification('Please fill in all fields', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            // Simulate form submission (in a real application, this would send to a server)
            showNotification('Thank you for your message! I\'ll get back to you soon.', 'success');
            
            // Reset form
            this.reset();
        });
    }

    // Email validation helper
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Notification system
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 300px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;

        // Set background color based on type
        switch(type) {
            case 'success':
                notification.style.background = '#10b981';
                break;
            case 'error':
                notification.style.background = '#ef4444';
                break;
            default:
                notification.style.background = '#3b82f6';
        }

        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
    }

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.skill-category, .timeline-item, .education-item, .internship-item, .highlight-item');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Typing effect for hero title
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        heroTitle.textContent = '';
        let charIndex = 0;
        
        function typeWriter() {
            if (charIndex < originalText.length) {
                heroTitle.textContent += originalText.charAt(charIndex);
                charIndex++;
                setTimeout(typeWriter, 100);
            }
        }
        
        // Start typing effect after page load
        setTimeout(typeWriter, 500);
    }

    // Parallax effect for hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        const heroContent = document.querySelector('.hero-content');
        
        if (hero && heroContent) {
            heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
            heroContent.style.opacity = 1 - scrolled / 600;
        }
    });

    // Skill tags hover effect
    const skillTags = document.querySelectorAll('.skill-tag');
    skillTags.forEach(tag => {
        tag.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.05)';
        });
        
        tag.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Timeline items staggered animation
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.2}s`;
        item.style.animation = 'fadeInUp 0.8s ease forwards';
    });

    // Copy email functionality
    const emailElements = document.querySelectorAll('.contact-method');
    emailElements.forEach(element => {
        if (element.textContent.includes('@')) {
            element.style.cursor = 'pointer';
            element.addEventListener('click', function() {
                const email = this.textContent.trim();
                navigator.clipboard.writeText(email).then(() => {
                    showNotification('Email copied to clipboard!', 'success');
                }).catch(() => {
                    showNotification('Failed to copy email', 'error');
                });
            });
        }
    });

    // Add loading animation removal
    window.addEventListener('load', function() {
        document.body.style.opacity = '1';
    });

    // Initialize page with fade-in
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
});

// Utility functions
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

// Optimize scroll events
const optimizedScroll = debounce(function() {
    // Scroll-related operations
}, 10);

window.addEventListener('scroll', optimizedScroll);
