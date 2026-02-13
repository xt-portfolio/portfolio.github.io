//------------------4个版本--------------------
// 项目翻转动画

// 内容数据 - 依次对应：正面1、背面1、正面2、背面2
const contentData = {
    'zh': [
        {
            title: "可视化合集",
            description: "数字化配电房运维平台依托可靠的物联接入和强大的云端处理能力，建立多维预警体系，实现了对机房设备、能耗、安全、维护等各个方面的全面监控和智能管理，提升配电系统自动化、数智化水平。",
            link: "./project-Visualization.html",
            time: "2022-2025",
            category: "可视化",
            role: "电力能源",
            tags: ["UI/UX", "可视化"]
        },
        {
            title: "数字能源",
            description: "数字能源管理系统通过智能监控和数据分析，优化能源使用效率，降低运营成本，推动绿色能源发展。",
            link: "./project-DigitalEnergy.html",
            time: "2024",
            category: "B端 · 移动端",
            role: "电力能源",
            tags: ["B端", "移动端"]
        },
        {
            title: "现货市场数据监控",
            description: "创新的移动端应用，为用户提供沉浸式体验和个性化服务，满足现代生活的多样化需求。",
            link: "./project-CashMacket.html",
            time: "2025",
            category: "移动端",
            role: "电力",
            tags: ["UI/UX", "移动端"]
        },
        {
            title: "智能平台",
            description: "基于人工智能技术的智能服务平台，为企业提供高效的解决方案和优质的用户体验。",
            link: "./project.html",
            time: "2024",
            category: "平台产品",
            role: "科技",
            tags: ["UI/UX", "平台"]
        },
    ],
    'en': [
        {
            title: "Visualization Collection",
            description: "Digital power distribution operation platform with reliable IoT connectivity and cloud processing, establishing multi-dimensional early warning systems for comprehensive equipment monitoring and intelligent management.",
            link: "./project-Visualization.html",
            time: "2022-2025",
            category: "Visualization",
            role: "Power Energy",
            tags: ["UI/UX", "Visualization"]
        },
        {
            title: "Digital Energy",
            description: "Energy management system optimizing efficiency through intelligent monitoring and data analysis, reducing costs and promoting green energy development.",
            link: "./project-DigitalEnergy.html",
            time: "2025",
            category: "dashboard · mobile",
            role: "UI/UX · AI Design",
            tags: ["UI/UX", "Dashboard"]
        },
        {
            title: "Instant Dream",
            description: "Innovative mobile application providing immersive experiences and personalized services for modern lifestyle needs.",
            link: "./project-CashMacket.html",
            time: "2024",
            category: "Mobile",
            role: "Technology",
            tags: ["UI/UX", "Mobile"]
        },
        {
            title: "Smart Platform",
            description: "AI-powered service platform delivering efficient solutions and excellent user experiences for enterprises.",
            link: "./project.html",
            time: "2024",
            category: "Platform",
            role: "Technology",
            tags: ["UI/UX", "Platform"]
        },
    ]
};

// 获取DOM元素
const itemDescription = document.querySelector('.item-description');
const cardFaces = document.querySelectorAll('.card-face');
const card = document.querySelector('.card');
const toggleLangBtn = document.getElementById('toggle-lang');
const langElements = document.querySelectorAll('[data-lang]');

// 当前可见的卡片索引
let currentVisibleIndex = 0;
// 当前语言状态
let currentLang = 'en';

// 自动检测浏览器语言
function detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    return browserLang.startsWith('zh') ? 'zh' : 'en';
}

// 切换语言函数
function switchLanguage() {
    // 切换语言
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    
    // 更新按钮文本
    if (toggleLangBtn) {
        toggleLangBtn.textContent = currentLang === 'zh' ? 'EN' : '中';
    }
    
    // 切换所有元素的显示状态
    langElements.forEach(element => {
        if (element.getAttribute('data-lang') === currentLang) {
            element.style.display = element.tagName === 'DIV' ? 'block' : 'inline';
        } else {
            element.style.display = 'none';
        }
    });
    
    // 更新HTML的lang属性
    document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
    
    // 保存用户选择到本地存储
    localStorage.setItem('preferredLanguage', currentLang);
    
    // 重新初始化项目内容
    initProjectContent();
}

// 初始化语言设置
function initLanguage() {
    // 检查是否有用户保存的语言偏好
    const savedLang = localStorage.getItem('preferredLanguage');
    
    if (savedLang) {
        // 使用用户保存的语言
        currentLang = savedLang;
    } else {
        // 使用浏览器语言（非中文默认显示英文）
        currentLang = detectBrowserLanguage();
    }
    
    // 应用初始语言设置
    if (toggleLangBtn) {
        toggleLangBtn.textContent = currentLang === 'zh' ? 'EN' : '中';
    }
    
    // 显示对应语言的元素
    langElements.forEach(element => {
        if (element.getAttribute('data-lang') === currentLang) {
            element.style.display = element.tagName === 'DIV' ? 'block' : 'inline';
        } else {
            element.style.display = 'none';
        }
    });
    langElements.forEach(element => {
        if (element.getAttribute('data-lang') === currentLang) {
            element.style.display = '-webkit-box'; // 保持 line-clamp 效果
        } else {
            element.style.display = 'none';
        }
    });    // 更新HTML的lang属性
    document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
}

// 初始化项目内容
function initProjectContent() {
    const data = contentData[currentLang] || contentData['en'];
    
    // 1. 更新滚动标题区域
    const scrollTitles = document.querySelectorAll('.item-title-scroll .item-title');
    scrollTitles.forEach((title, index) => {
        if (data[index]) {
            title.textContent = data[index].title;
        }
    });
    
    // 2. 更新所有卡片标题
    const cardTitles = document.querySelectorAll('.card-face .hover-info-container h1');
    cardTitles.forEach((title, index) => {
        if (data[index]) {
            title.textContent = data[index].title;
        }
    });
    
    // 3. 更新时间信息
    const timeValues = document.querySelectorAll('.item-value.value-time');
    timeValues.forEach((time, index) => {
        if (data[index]) {
            time.textContent = data[index].time;
        }
    });
    
    // 4. 更新分类信息
    const categoryValues = document.querySelectorAll('.item-value.value-category');
    categoryValues.forEach((category, index) => {
        if (data[index]) {
            category.textContent = data[index].category;
        }
    });
    
    // 5. 更新行业信息
    const roleValues = document.querySelectorAll('.item-value.value-role');
    roleValues.forEach((role, index) => {
        if (data[index]) {
            role.textContent = data[index].role;
        }
    });
    
    // 6. 更新卡片标签
    const cardTags = document.querySelectorAll('.card-face .project-tags');
    cardTags.forEach((tagsContainer, index) => {
        if (data[index] && data[index].tags) {
            // 清空现有标签
            tagsContainer.innerHTML = '';
            
            // 添加新标签
            data[index].tags.forEach(tagText => {
                const span = document.createElement('span');
                span.textContent = tagText;
                // 如果是分类标签，添加特殊类名
                if (tagText === data[index].category) {
                    span.classList.add('value-category');
                }
                tagsContainer.appendChild(span);
            });
        }
    });
    
    // 更新初始描述
    updateContent(0);
    
    console.log(`项目内容初始化完成 - 语言: ${currentLang}`);
}

// 为卡片面添加链接属性
function initCardLinks() {
    const data = contentData[currentLang] || contentData['en'];
    cardFaces.forEach((face, index) => {
        if (data[index]) {
            face.setAttribute('data-link', data[index].link);
            console.log(`为卡片 ${index} 设置链接: ${data[index].link}`);
        }
    });
}

// 更新内容的函数
function updateContent(index) {
    const data = contentData[currentLang] || contentData['en'];
    if (data && data[index]) {
        itemDescription.textContent = data[index].description;
        
        // 更新当前可见卡片的标题（确保同步）
        const visibleFace = document.querySelector('.card-face.visible');
        if (visibleFace) {
            const titleElement = visibleFace.querySelector('.hover-info-container h1');
            if (titleElement) {
                titleElement.textContent = data[index].title;
            }
            
            // 更新当前可见卡片的标签
            const tagsContainer = visibleFace.querySelector('.project-tags');
            if (tagsContainer && data[index].tags) {
                tagsContainer.innerHTML = '';
                data[index].tags.forEach(tagText => {
                    const span = document.createElement('span');
                    span.textContent = tagText;
                    if (tagText === data[index].category) {
                        span.classList.add('value-category');
                    }
                    tagsContainer.appendChild(span);
                });
            }
        }
    }
}

// 更新可见状态的函数
function updateVisibleFaces(state) {
    // 移除所有可见类
    cardFaces.forEach(face => {
        face.classList.remove('visible');
        face.style.pointerEvents = 'none';
    });
    
    // 更新当前可见索引
    currentVisibleIndex = state;
    
    // 根据当前状态添加可见类并启用点击
    let visibleFace = null;
    if (state === 0) {
        visibleFace = document.querySelector('.front-1');
    } else if (state === 1) {
        visibleFace = document.querySelector('.back-1');
    } else if (state === 2) {
        visibleFace = document.querySelector('.front-2');
    } else if (state === 3) {
        visibleFace = document.querySelector('.back-2');
    }
    
    if (visibleFace) {
        visibleFace.classList.add('visible');
        visibleFace.style.pointerEvents = 'auto';
        console.log(`设置卡片 ${state} 为可点击`);
        
        const data = contentData[currentLang] || contentData['en'];
        // 确保可见卡片的标题正确
        const titleElement = visibleFace.querySelector('.hover-info-container h1');
        if (titleElement && data && data[state]) {
            titleElement.textContent = data[state].title;
        }
        
        // 确保可见卡片的标签正确
        const tagsContainer = visibleFace.querySelector('.project-tags');
        if (tagsContainer && data && data[state] && data[state].tags) {
            tagsContainer.innerHTML = '';
            data[state].tags.forEach(tagText => {
                const span = document.createElement('span');
                span.textContent = tagText;
                if (tagText === data[state].category) {
                    span.classList.add('value-category');
                }
                tagsContainer.appendChild(span);
            });
        }
    }
}

// 卡片点击处理函数
function handleCardClick(event) {
    console.log('=== 点击事件开始 ===');
    
    let cardFace = event.currentTarget;
    console.log('点击的卡片:', cardFace);
    console.log('卡片类名:', cardFace.className);
    console.log('是否可见:', cardFace.classList.contains('visible'));
    console.log('链接:', cardFace.getAttribute('data-link'));
    
    if (cardFace.classList.contains('visible')) {
        const link = cardFace.getAttribute('data-link');
        if (link) {
            console.log('执行跳转到:', link);
            
            event.stopPropagation();
            event.preventDefault();
            
            window.location.href = link;
            
            return false;
        }
    }
    
    console.log('跳转条件不满足，阻止默认行为');
    event.preventDefault();
    return false;
}

// 初始化点击事件
function initClickEvents() {
    cardFaces.forEach(face => {
        face.removeEventListener('click', handleCardClick);
        face.addEventListener('click', handleCardClick, true);
        face.style.cursor = 'pointer';
        
        if (!face.classList.contains('visible')) {
            face.style.pointerEvents = 'none';
        }
    });
    
    console.log('点击事件初始化完成');
}

// 创建时间线动画
const tl = gsap.timeline({
    onUpdate: function() {
        const rotation = gsap.getProperty(card, "rotateX");
        
        // 根据旋转角度更新内容和可见状态
        if (rotation < 90) {
            updateContent(0);
            updateVisibleFaces(0);
        } else if (rotation < 270) {
            updateContent(1);
            updateVisibleFaces(1);
        } else if (rotation < 450) {
            updateContent(2);
            updateVisibleFaces(2);
        } else {
            updateContent(3);
            updateVisibleFaces(3);
        }
    }
});

// 保持原有GSAP动画效果
tl.to('.card', {rotateX: 0, duration: 2, ease: 'power3.out'})
  .to('.card', {rotateX: 180, duration: 30, ease: 'power3.out'})
  .to('.item-title-scroll', {y: "-25%", duration: 3, ease: 'power3.out'}, '-=20')
  .to('.item-value-scroll,.item-number-scroll', {y: -26.5, duration: 3, ease: 'power3.out'}, '<') 
  .to('.front-1', {opacity: 0, duration: 1, ease: 'power3.out'}, '+=1')
  .to('.front-2', {opacity: 1, duration: 1, ease: 'power3.out'}, '<')          
  .to('.card', {rotateX: 360, duration: 30, ease: 'power3.out'})
  .to('.item-title-scroll', {y: "-50%", duration: 3, ease: 'power3.out'}, '-=20') 
  .to('.item-value-scroll,.item-number-scroll', {y: -53, duration: 3, ease: 'power3.out'}, '<')
  .to('.back-1', {opacity: 0, duration: 1, ease: 'power3.out'}, '+=1')
  .to('.back-2', {opacity: 1, duration: 1, ease: 'power3.out'}, '<')
  .to('.card', {rotateX: 540, duration: 30, ease: 'power3.out'})
  .to('.item-title-scroll', {y: "-75%", duration: 3, ease: 'power3.out'}, '-=20') 
  .to('.item-value-scroll,.item-number-scroll', {y: -79.5, duration: 3, ease: 'power3.out'}, '<');

// 修复边界问题的滚动触发器
ScrollTrigger.create({
    trigger: '.project-container',
    start: 'top',
    end: '+=4000',
    // markers: true,
    scrub: true,
    pin: true,
    animation: tl,
    onUpdate: (self) => {
        // 当滚动到起点附近时，使用更宽松的条件
        if (self.progress <= 0.01 && self.direction === -1) {
            const currentRotation = gsap.getProperty(card, "rotateX");
            // 只有当卡片明显偏离0度时才重置
            if (Math.abs(currentRotation) > 5) {
                gsap.set(card, { rotateX: 0 });
                updateContent(0);
                updateVisibleFaces(0);
                tl.progress(0);
            }
        }
        
        // 当滚动到终点时，防止振动
        if (self.progress >= 0.99) {
            const currentRotation = gsap.getProperty(card, "rotateX");
            // 只有当卡片明显偏离540度时才重置
            if (Math.abs(currentRotation - 540) > 5) {
                gsap.set(card, { rotateX: 540 });
                updateContent(3);
                updateVisibleFaces(3);
            }
        }
    }
});

// 页面加载完成后初始化所有内容
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，初始化所有内容');
    initLanguage();
    initProjectContent();
    initCardLinks();
    initClickEvents();
    
    // 添加按钮事件监听
    if (toggleLangBtn) {
        toggleLangBtn.addEventListener('click', switchLanguage);
    }
});

// 如果DOM已经加载完成，立即初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initLanguage();
        initProjectContent();
        initCardLinks();
        initClickEvents();
        
        if (toggleLangBtn) {
            toggleLangBtn.addEventListener('click', switchLanguage);
        }
    });
} else {
    initLanguage();
    initProjectContent();
    initCardLinks();
    initClickEvents();
    
    if (toggleLangBtn) {
        toggleLangBtn.addEventListener('click', switchLanguage);
    }
}


//------------------优化性能版前---------------------



// spline优化（备用）
class SimpleSplineOptimizer {
    constructor() {
        this.splineViewer = document.querySelector('spline-viewer');
        if (!this.splineViewer) return;
        
        this.init();
    }
    
    init() {
        console.log('启动简单Spline优化');
        
        // 初始低质量
        if (this.splineViewer.setQuality) {
            this.splineViewer.setQuality('low');
        }
        
        // 添加CSS类用于控制
        this.splineViewer.classList.add('spline-optimized');
        
        // 监听滚动
        let scrollTimer;
        const checkVisibility = () => {
            const rect = this.splineViewer.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            // 判断是否在视口内（上下各200px缓冲）
            const isVisible = (
                rect.bottom > -200 && 
                rect.top < windowHeight + 200
            );
            
            if (isVisible) {
                this.show();
            } else {
                this.hide();
            }
        };
        
        // 使用requestAnimationFrame优化性能
        let rafId;
        const update = () => {
            checkVisibility();
            rafId = requestAnimationFrame(update);
        };
        
        // 只在用户滚动时检查
        let isScrolling = false;
        window.addEventListener('scroll', () => {
            if (!isScrolling) {
                isScrolling = true;
                update();
                
                setTimeout(() => {
                    isScrolling = false;
                    cancelAnimationFrame(rafId);
                }, 1000);
            }
        }, { passive: true });
        
        // 初始检查
        setTimeout(checkVisibility, 1000);
    }
    
    hide() {
        if (this.splineViewer.classList.contains('hidden')) return;
        
        this.splineViewer.classList.add('hidden');
        
        if (this.splineViewer.pause) {
            this.splineViewer.pause();
        }
    }
    
    show() {
        if (!this.splineViewer.classList.contains('hidden')) return;
        
        this.splineViewer.classList.remove('hidden');
        
        setTimeout(() => {
            if (this.splineViewer.play) {
                this.splineViewer.play();
            }
        }, 100);
    }
}

// CSS部分（添加到你的CSS文件）
/*
.spline-optimized {
    transition: opacity 0.3s ease, visibility 0.3s ease;
}

.spline-optimized.hidden {
    opacity: 0.01 !important;
    visibility: hidden !important;
    pointer-events: none !important;
    position: absolute !important;
    left: -9999px !important;
}
*/

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        new SimpleSplineOptimizer();
    }, 2000); // 等待2秒确保Spline加载
});



// 个人经验点击展开（只有一个版本）

document.querySelectorAll('.resume-item-header').forEach(header => {
    header.addEventListener('click', () => {
        const currentSection = header.parentElement;
        const isActive = currentSection.classList.contains('active');
        
        // 先移除所有项目的active类
        document.querySelectorAll('.resume-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // 如果点击的不是已激活项目，则添加active
        if (!isActive) {
            currentSection.classList.add('active');
        }
        
        // 强制Lenis重新计算滚动
        setTimeout(() => lenis.resize(), 500);
    });
});