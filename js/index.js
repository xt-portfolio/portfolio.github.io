// 初始化 Lenis (保留原有配置)
const lenis = new Lenis({
    smooth: true,
    direction: 'vertical',
    gestureDirection: 'vertical',
    smoothWheel: true, // 启用平滑滚轮
    infinite: false,   // 禁用无限滚动
    autoResize: true   // 自动响应尺寸变化
});

// 全局动画循环控制器 - 解决多个requestAnimationFrame冲突
const animationController = {
    active: false,
    time: 0,
    lastTime: 0,
    frameId: null,
    subscribers: new Set(),
    
    start() {
        if (this.active) return;
        this.active = true;
        this.lastTime = performance.now();
        this.frameId = requestAnimationFrame(this.update.bind(this));
    },
    
    stop() {
        this.active = false;
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
    },
    
    update(currentTime) {
        if (!this.active) return;
        
        // 计算时间差，确保动画速度一致
        const deltaTime = currentTime - this.lastTime;
        this.time += deltaTime * 0.001; // 转换为秒
        this.lastTime = currentTime;
        
        // 更新所有订阅者
        this.subscribers.forEach(subscriber => {
            subscriber.update(this.time, deltaTime);
        });
        
        // 继续循环
        this.frameId = requestAnimationFrame(this.update.bind(this));
    },
    
    subscribe(subscriber) {
        this.subscribers.add(subscriber);
        if (this.subscribers.size === 1) {
            this.start();
        }
    },
    
    unsubscribe(subscriber) {
        this.subscribers.delete(subscriber);
        if (this.subscribers.size === 0) {
            this.stop();
        }
    }
};

// 集成Lenis到全局动画循环
animationController.subscribe({
    update: (time, deltaTime) => {
        lenis.raf(time * 1000); // Lenis期望的是毫秒
    }
});

// 精简版滚轮控制 (保留原有参数)
window.addEventListener('wheel', (e) => {
    e.preventDefault();
    lenis.scrollBy(e.deltaY * 0.001, {  // 保留原速度系数
        duration: 1.8,                   // 保留原时长
        easing: (t) => 1 - Math.pow(1 - t, 6) // 保留原缓动函数
    });
}, { passive: false });



// --------------------------------全局动效------------------------------------------

// 通用滑动出现动画配置项（const 名字自定义）
const staggeringOption = {
    // 延迟200毫秒
    delay: 100,
    // 移动20px
    distance: "20px",
    // 持续时间800毫秒
    duration: 800,
    // 变量函数
    easing: "ease-in-out",
    // 从上到下，如果是left就是从左到右
    origin: "bottom",
    opacity:1,
    // 重复多次
    // reset:true,
 };
// ScrollReveal().reveal("需要动的类名", { 引入上方通用配置名字，interval设置等待时间 });
ScrollReveal().reveal(".show", { ...staggeringOption ,interval:100,});
ScrollReveal().reveal(".show2", { ...staggeringOption ,interval:100,delay: 300,});

ScrollReveal().reveal(".otherDesign-card", { ...staggeringOption ,opacity:1,scale:0.93,distance: "0px",duration: 900,});
// -------------------------------手机端导航点击事件-----------------------------------
// 获取折叠按钮实例
const burgerEl = document.querySelector(".burger");
// 监听header
const headerEl = document.querySelector(".header");
// 获取所有需要点击后关闭菜单的a标签
const menuLinks = document.querySelectorAll(".header a"); // 根据实际情况调整选择器

// 切换菜单状态的函数
function toggleMenu() {
  headerEl.classList.toggle("open");
  burgerEl.classList.toggle("close");
}

// 点击按钮切换菜单
burgerEl.addEventListener("click", toggleMenu);

// 点击链接后关闭菜单
menuLinks.forEach(link => {
  link.addEventListener("click", () => {
    // 如果菜单是打开状态，则关闭它
    if (headerEl.classList.contains("open")) {
      headerEl.classList.remove("open");
      burgerEl.classList.remove("close");
    }
  });
});







//-----------------------全局文字动效----------------------

document.addEventListener('DOMContentLoaded', () => {
    // 处理.split-line元素（行级动画）
    document.querySelectorAll('.split-line').forEach(el => {
        gsap.set(el, { visibility: "hidden" });
        ScrollTrigger.create({
            trigger: el,
            start: "top 80%",
            onEnter: () => animateLines(el),  // 调用行级动画函数
            once: true
        });
    });
    
    // 处理.split-animate元素（字符级动画）
    document.querySelectorAll('.split-animate').forEach(el => {
        gsap.set(el, { visibility: "hidden" });
        ScrollTrigger.create({
            trigger: el,
            start: "top 80%",
            onEnter: () => animateChars(el),  // 调用字符级动画函数
            once: true
        });
    });
    
    // 进度条监听（保留一次即可）
    window.addEventListener('scroll', updateProgressBar);
});

// 行级动画函数（仅整体行动画）
function animateLines(element) {
    gsap.set(element, { visibility: "visible" });
    
    const splitLines = new SplitText(element, {
        type: "lines",
        linesClass: "line-child"
    });
    
    gsap.set(splitLines.lines, { y: 30, opacity: 0 });
    
    gsap.to(splitLines.lines, {
        duration: 1,
        y: 0,
        opacity: 1,
        stagger: 0.3,
        ease: "power3.out"
    });
}

// 字符级动画函数（行+字符动画）
function animateChars(element) {
    gsap.set(element, { visibility: "visible" });
    
    const splitLines = new SplitText(element, {
        type: "lines",
        linesClass: "line-parent"
    });
    
    splitLines.lines.forEach((line, index) => {
        const splitChars = new SplitText(line, {
            type: "chars",
            charsClass: "char-child"
        });
        
        gsap.set(splitChars.chars, { y: "100%", opacity: 0 });
        
        gsap.to(splitChars.chars, {
            duration: 1,
            y: 0,
            opacity: 1,
            stagger: 0.03,
            delay: index * 0.2,
            ease: "power3.out"
        });
    });
}

// 进度条更新函数
function updateProgressBar() {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (scrollTop / scrollHeight) * 100;
    document.getElementById('progressBar').style.width = scrolled + '%';
}




// ------------------------------------1.首页---------------------------------

ScrollTrigger.create({
    trigger:'.banner',// 触发对象
    start:'top',//开始位置
    end:'+=900',//结束位置
    // markers:true,//显示位置标记
    scrub:true,//随着鼠标上下滚动显示出现
    // pin:true,
    animation:
    gsap.timeline()
    // .to('.bannerImg-box ',{y:-15,duration: 3,ease: 'power3.out',})
    .to('.portfolio-lable-box',{rotate:15,duration: 3,ease: 'power3.out',},'<')
    // .to('.portfolio-label-x',{y:-15,x:10,duration: 3,ease: 'power3.out',},'<')

});


 document.addEventListener('DOMContentLoaded', function() {
            const bannerBox = document.querySelector('.banner');
            const keycap = document.querySelector('.move-bg');
            
            // 视差强度控制值，可根据需要调整 (范围：1-50)
            // 值越大，视差效果越明显
            const parallaxStrength = 15;

            // 鼠标移动视差效果
            bannerBox.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // 计算鼠标在元素内的相对位置 (0到1)
                const relX = x / rect.width;
                const relY = y / rect.height;
                
                // 计算位移量 (-1到1)
                const moveX = (relX - 0.5) * 1.5;
                const moveY = (relY - 0.5) * 1.5;
                
                // 应用视差效果
                keycap.style.transform = `translateY(0%) translate(${moveX * parallaxStrength}px, ${moveY * parallaxStrength}px)`;
            });

            // 鼠标离开时重置位置
            bannerBox.addEventListener('mouseleave', function() {
                keycap.style.transform = 'translateY(0%)';
            });
        });




//skill克隆
document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('skillContainer');
    const items = container.innerHTML;
    
    // 克隆一份内容以实现无缝滚动
    container.innerHTML = items + items;
    
});




//-------------首页banner4个小元素

document.addEventListener('DOMContentLoaded', function() {
    // 获取div元素和宽度（移到DOMContentLoaded内部确保DOM已加载）
    var myDiv = document.getElementById('sprite1');
    var divWidth = myDiv ? myDiv.offsetWidth : 100; // 添加默认值以防元素不存在

    const sprites = document.querySelectorAll('.banner-sprite');
  
    sprites.forEach(sprite => {
        const frames = parseInt(sprite.getAttribute('data-frames'), 10);
        const spriteImage = sprite.getAttribute('data-sprite');
        const frameWidth = divWidth; // 调整为你需要的帧宽度
        let currentFrame = 0;
        let interval = null; // 初始化为null
        let playingForward = true;
  
        // 设置雪碧图背景
        sprite.style.backgroundImage = `url('${spriteImage}')`;
        sprite.style.backgroundRepeat = 'no-repeat';
  
        function updateFrame() {
            sprite.style.backgroundPositionX = `-${currentFrame * frameWidth}px`;
        }
  
        function animateSprite() {
            if (playingForward) {
                currentFrame++;
                if (currentFrame >= frames) {
                    currentFrame = frames - 1;
                    clearInterval(interval);
                    interval = null; // 清除后设为null
                    return;
                }
            } else {
                currentFrame--;
                if (currentFrame < 0) {
                    currentFrame = 0;
                    clearInterval(interval);
                    interval = null; // 清除后设为null
                    return;
                }
            }
            updateFrame();
        }
  
        function startAnimation() {
            // 清除之前的定时器（如果存在）
            if (interval) {
                clearInterval(interval);
            }
            interval = setInterval(animateSprite, 30); // 调整动画速度
        }
  
        sprite.addEventListener('mouseenter', function() {
            playingForward = true;
            currentFrame = 0;
            startAnimation();
        });
  
        sprite.addEventListener('mouseleave', function() {
            playingForward = false;
            startAnimation();
        });

        // 初始化第一帧
        updateFrame();
    });
});
// 最简单直接的方法
setTimeout(function() {
    const loadingElements = document.querySelectorAll('.modeling-loading');
    loadingElements.forEach(element => {
        element.style.display = 'none';
    });
    console.log('3秒后强制隐藏 loading');
}, 5000); // 3秒后隐藏
// ---------------------------------------2.个人--------------------------------------------



// // 检查是否不是移动设备（屏幕宽度大于768px）
if (window.innerWidth > 768) {
  ScrollTrigger.create({
    trigger: '.experience-container', // 触发对象
    start: '-75%', // 开始位置
    end: '+=500', // 结束位置
    // markers:true,//显示位置标记
    scrub: true, // 随着鼠标上下滚动显示出现
    // pin:true,
    animation: gsap.timeline()
      .from('.experience-container', {y:80, duration: 1, ease: 'power3.out'})
  });
}




ScrollTrigger.create({
  trigger: '.personal', // 触发对象
  start: '-10%', // 开始位置
  end: '+=500', // 结束位置
//   markers:true,//显示位置标记
  scrub: true, // 随着鼠标上下滚动显示出现
//   pin:true,
  animation: gsap.timeline()
    .from('.photo-1', {rotate:-12,duration: 1, ease: 'power3.out'})
});


// 添加经验部分展开/折叠事件监听

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



// 图片切换
document.addEventListener('DOMContentLoaded', function() {
  // 初始化所有轮播组
  initSlideshow('.group1');
  initSlideshow('.group2');
  initSlideshow('.group3');
  
  // 轮播初始化函数
  function initSlideshow(selector) {
      const container = document.querySelector(selector);
      const slides = container.querySelectorAll('.slide');
      let currentSlide = 0;
      const slideCount = slides.length;
      
      function nextSlide() {
          // 当前幻灯片淡出
          slides[currentSlide].style.opacity = 0;
          
          // 计算下一张幻灯片的索引
          currentSlide = (currentSlide + 1) % slideCount;
          
          // 下一张幻灯片淡入
          slides[currentSlide].style.opacity = 1;
      }
      
      // 初始显示第一张
      slides[0].style.opacity = 1;
      
      // 每1秒切换一次
      setInterval(nextSlide, 1000);
  }
});



// ---------------------------------------3.目录 content--------------------------------------------



ScrollTrigger.create({
    trigger:'.content',// 触发对象
    start:'top ',//开始位置
    end:'+=210',//结束位置
    // markers:true,//显示位置标记
    scrub:true,//随着鼠标上下滚动显示出现
    // pin:true,
    animation:
    gsap.timeline()
    .from('.project-item .card',{scale:1.2,rotateX: 45,duration: 5,ease: 'power3.out',})
    .to('.project-item .card',{scale:1,rotateX: 0,duration: 2,ease: 'power3.out',})
});

// 项目翻转动画

// 内容数据 - 支持中英文
const contentData = {
    'zh': [
        {
            title: "可视化合集",
            description: "数字化配电房运维平台依托可靠的物联接入和强大的云端处理能力，建立多维预警体系，实现了对机房设备、能耗、安全、维护等各个方面的全面监控和智能管理，提升配电系统自动化、数智化水平。",
            link: "./project-Visualization.html",
            time: "2022-2025",
            category: "可视化",
            industry: "电力能源",
            tags: ["UI/UX", "可视化"]
        },
        {
            title: "数字能源",
            description: "数字能源管理系统通过智能监控和数据分析，优化能源使用效率，降低运营成本，推动绿色能源发展。",
            link: "./project-DigitalEnergy.html",
            time: "2024",
            category: "B端 · 移动端",
            industry: "电力能源",
            tags: ["B端", "移动端"]
        },
        {
            title: "现货市场数据监控",
            description: "创新的移动端应用，为用户提供沉浸式体验和个性化服务，满足现代生活的多样化需求。",
            link: "./project-CashMacket.html",
            time: "2025",
            category: "移动端",
            industry: "电力",
            tags: ["UI/UX", "移动端"]
        },
        {
            title: "智能平台",
            description: "基于人工智能技术的智能服务平台，为企业提供高效的解决方案和优质的用户体验。",
            link: "./project.html",
            time: "2024",
            category: "平台产品",
            industry: "科技",
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
            industry: "Power Energy",
            tags: ["UI/UX", "Visualization"]
        },
        {
            title: "Digital Energy",
            description: "Energy management system optimizing efficiency through intelligent monitoring and data analysis, reducing costs and promoting green energy development.",
            link: "./project-DigitalEnergy.html",
            time: "2025",
            category: "B2B Product",
            industry: "Power Energy",
            tags: ["UI/UX", "Dashboard"]
        },
        {
            title: "Instant Dream",
            description: "Innovative mobile application providing immersive experiences and personalized services for modern lifestyle needs.",
            link: "./project-CashMacket.html",
            time: "2024",
            category: "Mobile",
            industry: "Technology",
            tags: ["UI/UX", "Mobile"]
        },
        {
            title: "Smart Platform",
            description: "AI-powered service platform delivering efficient solutions and excellent user experiences for enterprises.",
            link: "./project.html",
            time: "2024",
            category: "Platform",
            industry: "Technology",
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
    const industryValues = document.querySelectorAll('.item-value.value-industy');
    industryValues.forEach((industry, index) => {
        if (data[index]) {
            industry.textContent = data[index].industry;
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


// //---------------hover雪碧图播放，移开倒放----------------

// 获取所有精灵图元素
const spriteLogos = document.querySelectorAll('.sprite-container');

// 为每个精灵图添加事件监听
spriteLogos.forEach(sprite => {
    const card = sprite.closest('.otherDesign-card');
    
    // 鼠标悬停时播放正向动画
    card.addEventListener('mouseenter', () => {
        // 先移除可能存在的反向动画类
        sprite.classList.remove('sprite-reversing');
        // 添加正向动画类
        sprite.classList.add('sprite-playing');
    });
    
    // 鼠标离开时播放反向动画
    card.addEventListener('mouseleave', () => {
        // 先移除正向动画类
        sprite.classList.remove('sprite-playing');
        // 添加反向动画类
        sprite.classList.add('sprite-reversing');
    });
});





// -------------------重力掉落------------------
document.addEventListener('DOMContentLoaded', function() {
  const container = document.getElementById('physics-container');
  const tags = document.querySelectorAll('.tag');
  let engine, world, tagBodies = [], mouseConstraint;
  let isActive = false;

  function getActualRadius(element) {
    const rect = element.getBoundingClientRect();
    return Math.max(rect.width, rect.height) / 2 * 1;
  }

  function initPhysics() {
    if(engine) Matter.Engine.clear(engine);
    
    engine = Matter.Engine.create({ 
      gravity: { x: 0.2, y: 0.5 },
      enableSleeping: false
    });
    world = engine.world;

    // 添加鼠标交互约束
    const mouse = Matter.Mouse.create(container);
    mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });
    Matter.Composite.add(world, mouseConstraint);

    const wallOptions = { 
      isStatic: true, 
      render: { visible: false },
      collisionFilter: { group: -1 }
    };
    
    const walls = [
      // 左、右、底、顶四个边界
      Matter.Bodies.rectangle(0, container.offsetHeight/2, 20, container.offsetHeight, wallOptions),
      Matter.Bodies.rectangle(container.offsetWidth, container.offsetHeight/2, 20, container.offsetHeight, wallOptions),
      Matter.Bodies.rectangle(container.offsetWidth/2, container.offsetHeight, container.offsetWidth, 20, wallOptions),
      Matter.Bodies.rectangle(container.offsetWidth/2, 0, container.offsetWidth, 20, wallOptions) // 新增顶部边界
    ];
    Matter.Composite.add(world, walls);

    tagBodies = Array.from(tags).map(tag => {
      const radius = getActualRadius(tag);
      const body = Matter.Bodies.circle(
        Math.random() * (container.offsetWidth - radius*2) + radius,
        Math.random() * (container.offsetHeight/2),
        radius,
        { 
          restitution: 0.8, // 弹性系数（0-1），值越大弹跳越高
        friction: 0.05,    // 摩擦系数（0-1），值越小滑动越远
          collisionFilter: { group: 0 }
        }
      );
      body.domElement = tag;
      tag.style.transform = `translate(${body.position.x-radius}px, ${body.position.y-radius}px)`;
      return body;
    });
    Matter.Composite.add(world, tagBodies);
    Matter.Engine.run(engine);

    function update() {
      tagBodies.forEach(body => {
        const radius = getActualRadius(body.domElement);
        body.domElement.style.transform = 
          `translate(${body.position.x-radius}px, ${body.position.y-radius}px)`;
      });
      if(isActive) requestAnimationFrame(update);
    }
    update();
  }

  // 保持原有resetTags和观察者逻辑...
  // 初始立即激活物理效果
  isActive = true;
  initPhysics();

  const observer = new IntersectionObserver((entries) => {
    if(entries[0].isIntersecting) {
      if(!isActive) {
        isActive = true;
        initPhysics();
      }
    } else {
      if(isActive) {
        isActive = false;
        resetTags();
      }
    }
  }, { threshold: 0.3 });

  observer.observe(container);
});


// --------------------------------------4.其他设计-----------------------------------


// // 检查是否不是移动设备（屏幕宽度大于768px）
if (window.innerWidth > 768) {
  ScrollTrigger.create({
    trigger: '.img-roll', // 触发对象
    start: '-75%', // 开始位置
    end: '+=500', // 结束位置
    // markers:true,//显示位置标记
    scrub: true, // 随着鼠标上下滚动显示出现
    // pin:true,
    animation: gsap.timeline()
      // .from('.img-roll', {y:80,scale:0.98, duration: 1, ease: 'power3.out'})

      .from('.img-roll', {y:80, duration: 1, ease: 'power3.out'})
  });
}
// ---------------图片向右滚动动画----------------

document.addEventListener('DOMContentLoaded', () => {
    // 克隆元素并设置容器宽度
    const initScroll = (el) => {
        const clone = el.innerHTML;
        el.innerHTML = clone + clone + clone; // 三倍克隆确保无缝衔接
        el.style.width = `${el.scrollWidth / 3 * 2}px`;
        
        // 动画结束时立即重置位置
        el.addEventListener('animationiteration', () => {
            el.style.animation = 'none';
            requestAnimationFrame(() => {
                el.style.animation = '';
            });
        });
    };

    initScroll(document.getElementById('rightTrack'));
    initScroll(document.getElementById('leftTrack'));
});









// --------------------------footer-----------------------------------


ScrollTrigger.create({
    trigger:'footer',// 触发对象
    start:'0%',//开始位置
    end:'bottom',//结束位置
    // markers:true,//显示位置标记
    scrub:true,//随着鼠标上下滚动显示出现
    pin:true,
    animation:
    gsap.timeline()
    .to('.footer-mask',{ y:'-48%',duration: 100,ease: 'power1.out',})
    .from('.QRcode-box',{rotate:20,duration: 100,ease: 'power3.out',},'<')
});

// --------------------------鼠标-----------------------------------
/// 鼠标
const dot = document.getElementById('cursor-dot');
const circle = document.getElementById('cursor-circle');
let dotX = 0, dotY = 0, circleX = 0, circleY = 0;
// 初始parts值
let parts = 3;

// 更新指针位置
const updateCursorPosition = (e) => {
  dotX = e.clientX;
  dotY = e.clientY;
  updateCursorStyles();
  dot.style.opacity = circle.style.opacity = 1;
};

// 更新光标样式（考虑滚动位置）
const updateCursorStyles = () => {
  dot.style.top = `${dotY + window.scrollY}px`;
  dot.style.left = `${dotX + window.scrollX}px`;
  circle.style.top = `${circleY + window.scrollY}px`;
  circle.style.left = `${circleX + window.scrollX}px`;
};

// 平滑动画
const circleAnimation = () => {
  // 使用当前parts值进行计算
  circleX += (dotX - circleX) / parts;
  circleY += (dotY - circleY) / parts;
  updateCursorStyles();
  requestAnimationFrame(circleAnimation);
};

// 事件监听
document.addEventListener('mousemove', updateCursorPosition);

// 修改滚动事件处理 - 使用防抖优化性能
let isScrolling;
window.addEventListener('scroll', () => {
  cancelAnimationFrame(isScrolling);
  isScrolling = requestAnimationFrame(() => {
    updateCursorStyles();
  });
});

// 初始化动画
requestAnimationFrame(circleAnimation);

// 链接/按钮悬停效果
document.querySelectorAll('a, button').forEach(element => {
  element.addEventListener('mouseover', () => {
    circle.style.width = '60px';
    circle.style.height = '60px';
    circle.style.border = '1px solid #838383ff';
  });

  element.addEventListener('mouseleave', () => {
    circle.style.border = '1px solid #838383ff';
    circle.style.width = '30px';
    circle.style.height = '30px';
  });
});

// footer键盘悬停效果
document.querySelectorAll('.keyboard a,.navLinks').forEach(element => {
  element.addEventListener('mouseover', () => {
    circle.style.backgroundColor = '#ffffff80';
    circle.style.width = '70px';
    circle.style.height = '70px';
    circle.style.mixBlendMode = 'overlay';
    circle.style.filter = 'blur(8px)';
  });

  element.addEventListener('mouseleave', () => {
    circle.style.backgroundColor = '#ffffff00';
    circle.style.mixBlendMode = 'normal';
    circle.style.border = '1px solid #838383ff';
    circle.style.width = '30px';
    circle.style.height = '30px';
    circle.style.filter = 'blur(0px)';
  });
});


// 图片悬停效果 - 增加parts值修改
document.querySelectorAll('.project-item').forEach(element => {
  element.style.cursor = 'default !important';
  
  element.addEventListener('mouseover', () => {
    // 鼠标悬停图片时，将parts改为5（跟随速度变慢）
    parts = 6;
    circle.style.backgroundColor = '#ffffffff';
    circle.style.backgroundImage = 'url(../img/index/view.png)';
    circle.style.backgroundSize = 'cover';
    circle.style.width = '70px';
    circle.style.height = '70px';
    circle.style.border = '1px solid #83838329';
    circle.style.mixBlendMode = 'normal';
  });

  element.addEventListener('mouseleave', () => {
    // 离开时恢复parts原值3
    parts = 3;
    circle.style.backgroundColor = '#ffffff00';
    circle.style.mixBlendMode = 'normal';
    circle.style.border = '1px solid #838383ff';
    circle.style.width = '30px';
    circle.style.height = '30px';
    circle.style.backgroundImage = 'none';    
  });
});

// --------------------------contact鼠标-----------------------------------

  // 获取contact容器
const contactContainer = document.getElementById('footerContainer');
const navLinks = document.getElementById('navLinks');

// 在contact容器内获取所有拖尾图片
const imgTails = contactContainer.querySelectorAll(".imgTail");

// 动画配置
let animationDelay = 300; // 消失延迟 (ms)
let animationDuration = 500; // 消失动画时间 (ms)
let staggerDelay = 100; // 图片之间的消失间隔 (ms)

// 初始化变量
const coords = { 
  x: contactContainer.offsetWidth / 2, 
  y: contactContainer.offsetHeight / 2 
};

// 初始化图片位置和状态
imgTails.forEach((imgTail, index) => {
  imgTail.x = coords.x;
  imgTail.y = coords.y;
  imgTail.style.opacity = 0;
  imgTail.style.transform = "scale(1)";
});

// 鼠标移动事件 - 绑定到contact容器
let animationTimer = null;
let isMouseInContainer = false;
let isOverNav = false; // 是否在导航栏上

contactContainer.addEventListener("mousemove", function (e) {
  // 如果鼠标在导航栏上，不触发拖尾效果
  if (isOverNav) return;
  
  // 获取容器位置
  const rect = contactContainer.getBoundingClientRect();
  
  // 计算相对于容器的坐标
  coords.x = e.clientX - rect.left;
  coords.y = e.clientY - rect.top;
  
  // 清除之前的定时器
  if (animationTimer) {
    clearTimeout(animationTimer);
  }
  
  // 重置所有图片状态
  imgTails.forEach((imgTail) => {
    imgTail.style.transition = "none";
    imgTail.style.opacity = 1;
    imgTail.style.transform = "scale(1)";
  });
  
  // 设置新的定时器，在延迟后触发图片依次消失
  animationTimer = setTimeout(() => {
    // 从最后一张图片开始消失（索引从大到小）
    for (let i = imgTails.length - 1; i >= 0; i--) {
      // 计算每张图片的延迟（最后一张最先消失）
      const delay = (imgTails.length - 1 - i) * staggerDelay;
      
      setTimeout(() => {
        imgTails[i].style.transition = `transform ${animationDuration}ms ease, opacity ${animationDuration}ms ease`;
        imgTails[i].style.transform = "scale(0)";
        imgTails[i].style.opacity = "0";
      }, delay);
    }
  }, animationDelay);
  
  isMouseInContainer = true;
});

// 鼠标离开容器事件
contactContainer.addEventListener("mouseleave", function() {
  isMouseInContainer = false;
  
  // 清除动画定时器
  if (animationTimer) {
    clearTimeout(animationTimer);
  }
  
  // 立即隐藏所有图片
  imgTails.forEach((imgTail) => {
    imgTail.style.transition = `opacity 300ms ease`;
    imgTail.style.opacity = "0";
  });
});

// 导航栏鼠标事件
navLinks.addEventListener("mouseenter", function() {
  isOverNav = true;
  
  // 立即隐藏所有拖尾图片
  imgTails.forEach((imgTail) => {
    imgTail.style.transition = `all 1000ms ease`;
    // imgTail.style.opacity = "0";
    imgTail.style.scale = "0";

  });
  
  // 清除动画定时器
  if (animationTimer) {
    clearTimeout(animationTimer);
    animationTimer = null;
  }
});

navLinks.addEventListener("mouseleave", function() {
  isOverNav = false;
  imgTails.forEach((imgTail) => {
    imgTail.style.scale = "1";
  });
});

// 动画函数 - 更新位置
function animationCircle() {
  if (!isMouseInContainer || isOverNav) {
    requestAnimationFrame(animationCircle);
    return;
  }
  
  let x = coords.x;
  let y = coords.y;
  
  imgTails.forEach((imgTail, index) => {
    // 更新位置
    imgTail.style.left = (x - 60) + "px";
    imgTail.style.top = (y - 60) + "px";
    
    // 存储当前位置
    imgTail.x = x;
    imgTail.y = y;
    
    // 计算下一个位置（保持图片之间的距离）
    const nextCircle = imgTails[index + 1] || imgTails[0];
    x += (nextCircle.x - x) * 0.93;
    y += (nextCircle.y - y) * 0.93;
  });
  
  requestAnimationFrame(animationCircle);
}

// 启动动画循环
animationCircle();

// 控制面板交互
document.getElementById('delay').addEventListener('input', function() {
  animationDelay = parseInt(this.value);
  document.getElementById('delayValue').textContent = animationDelay + ' ms';
});

document.getElementById('duration').addEventListener('input', function() {
  animationDuration = parseInt(this.value);
  document.getElementById('durationValue').textContent = animationDuration + ' ms';
});

document.getElementById('stagger').addEventListener('input', function() {
  staggerDelay = parseInt(this.value);
  document.getElementById('staggerValue').textContent = staggerDelay + ' ms';
}); 



