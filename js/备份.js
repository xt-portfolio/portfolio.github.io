//------------------优化性能版---------------------
// 项目翻转动画

// 内容数据 - 依次对应：正面1、背面1、正面2、背面2
const contentData = [
    {
        title: "可视化合集",
        description: "数字化配电房运维平台依托可靠的物联接入和强大的云端处理能力，建立多维预警体系，实现了对机房设备、能耗、安全、维护等各个方面的全面监控和智能管理，提升配电系统自动化、数智化水平。",
        link: "./visualization.html",
        time: "2022-2025",
        category: "可视化",
        industry: "电力能源",
        tags: ["UI/UX", "visualization"]
    },
    {
        title: "数字能源",
        description: "11111111111111111雄伟的山脉如同大地的脊梁，高耸入云，见证了千万年的地质变迁。",
        link: "./dashboard.html",
        time: "2025",
        category: "111111111111b端",
        industry: "电力能源",
        tags: ["UI/UX", "dashboard"]
    },
    {
        title: "即梦",
        description: "雄伟的山脉如同大地的脊梁，高耸入云，见证了千万年的地质变迁。",
        link: "./project.html",
        time: "2024",
        category: "移动端",
        industry: "电力能源",
        tags: ["UI/UX", "mobile"]
    },
    {
        title: "4444",
        description: "雄伟的山脉如同大地的脊梁，高耸入云，见证了千万年的地质变迁。",
        link: "./project.html",
        time: "2024",
        category: "移动端",
        industry: "电力能源",
        tags: ["UI/UX", "mobile"]
    },
];

// 获取DOM元素
const itemDescription = document.querySelector('.item-description');
const cardFaces = document.querySelectorAll('.card-face');
const card = document.querySelector('.card');

// 性能优化变量
let rafId = null;
let lastUpdateTime = 0;
const UPDATE_INTERVAL = 16; // ~60fps

// 边界状态管理
let isAtEndBoundary = false;
let isAtStartBoundary = false;
let isBoundaryAnimation = false;
let lastScrollDirection = 1;

// 初始化所有标题和标签
function initAllContent() {
    // 1. 更新滚动标题区域
    const scrollTitles = document.querySelectorAll('.item-title-scroll .item-title');
    scrollTitles.forEach((title, index) => {
        if (contentData[index]) {
            title.textContent = contentData[index].title;
        }
    });
    
    // 2. 更新所有卡片标题
    const cardTitles = document.querySelectorAll('.card-face .hover-info-container h1');
    cardTitles.forEach((title, index) => {
        if (contentData[index]) {
            title.textContent = contentData[index].title;
        }
    });
    
    // 3. 更新时间信息
    const timeValues = document.querySelectorAll('.item-value.value-time');
    timeValues.forEach((time, index) => {
        if (contentData[index]) {
            time.textContent = contentData[index].time;
        }
    });
    
    // 4. 更新分类信息
    const categoryValues = document.querySelectorAll('.item-value.value-category');
    categoryValues.forEach((category, index) => {
        if (contentData[index]) {
            category.textContent = contentData[index].category;
        }
    });
    
    // 5. 更新行业信息
    const industryValues = document.querySelectorAll('.item-value.value-industy');
    industryValues.forEach((industry, index) => {
        if (contentData[index]) {
            industry.textContent = contentData[index].industry;
        }
    });
    
    // 6. 更新卡片标签
    const cardTags = document.querySelectorAll('.card-face .project-tags');
    cardTags.forEach((tagsContainer, index) => {
        if (contentData[index] && contentData[index].tags) {
            // 清空现有标签
            tagsContainer.innerHTML = '';
            
            // 添加新标签
            contentData[index].tags.forEach(tagText => {
                const span = document.createElement('span');
                span.textContent = tagText;
                // 如果是分类标签，添加特殊类名
                if (tagText === contentData[index].category) {
                    span.classList.add('value-category');
                }
                tagsContainer.appendChild(span);
            });
        }
    });
    
    console.log('所有内容初始化完成');
}

// 为卡片面添加链接属性
cardFaces.forEach((face, index) => {
    if (contentData[index]) {
        face.setAttribute('data-link', contentData[index].link);
        console.log(`为卡片 ${index} 设置链接: ${contentData[index].link}`);
    }
});

// 吸附角度配置
const snapAngles = [0, 180, 360, 540];
const snapRange = 20;
let isSnapping = false;
let lastScrollTime = 0;

// 当前可见的卡片索引
let currentVisibleIndex = 0;

// 性能优化的更新函数
function throttledUpdate() {
    const now = Date.now();
    if (now - lastUpdateTime < UPDATE_INTERVAL) {
        return;
    }
    lastUpdateTime = now;
    
    if (isBoundaryAnimation) return;
    
    const rotation = gsap.getProperty(card, "rotateX");
    const currentTime = Date.now();
    
    // 如果在边界区域，跳过吸附逻辑
    if (!isAtEndBoundary && !isAtStartBoundary) {
        if (currentTime - lastScrollTime > 100 && !isSnapping) {
            const snapTo = checkSnap(rotation);
            if (snapTo !== null && Math.abs(rotation - snapTo) > 1) {
                isSnapping = true;
                
                gsap.to(card, {
                    rotateX: snapTo,
                    duration: 0.5,
                    ease: 'power2.out',
                    onComplete: () => {
                        isSnapping = false;
                    }
                });
            }
        }
    }
    
    // 状态更新 - 使用更高效的条件判断
    let targetState = 0;
    if (rotation >= 450) targetState = 3;
    else if (rotation >= 270) targetState = 2;
    else if (rotation >= 90) targetState = 1;
    
    if (targetState !== currentVisibleIndex) {
        updateContent(targetState);
        updateVisibleFaces(targetState);
    }
}

// 更新内容的函数
function updateContent(index) {
    if (contentData[index]) {
        itemDescription.textContent = contentData[index].description;
        
        // 更新当前可见卡片的标题（确保同步）
        const visibleFace = document.querySelector('.card-face.visible');
        if (visibleFace) {
            const titleElement = visibleFace.querySelector('.hover-info-container h1');
            if (titleElement) {
                titleElement.textContent = contentData[index].title;
            }
            
            // 更新当前可见卡片的标签
            const tagsContainer = visibleFace.querySelector('.project-tags');
            if (tagsContainer && contentData[index].tags) {
                tagsContainer.innerHTML = '';
                contentData[index].tags.forEach(tagText => {
                    const span = document.createElement('span');
                    span.textContent = tagText;
                    if (tagText === contentData[index].category) {
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
    }
}

// 卡片点击处理函数
function handleCardClick(event) {
    let cardFace = event.currentTarget;
    
    if (cardFace.classList.contains('visible')) {
        const link = cardFace.getAttribute('data-link');
        if (link) {
            event.stopPropagation();
            event.preventDefault();
            window.location.href = link;
            return false;
        }
    }
    
    event.preventDefault();
    return false;
}

// 检查是否需要吸附到最近的角度
function checkSnap(rotation) {
    if (isAtEndBoundary || isAtStartBoundary || isBoundaryAnimation) {
        return null;
    }
    
    for (let i = 0; i < snapAngles.length; i++) {
        const targetAngle = snapAngles[i];
        if (Math.abs(rotation - targetAngle) <= snapRange) {
            return targetAngle;
        }
    }
    return null;
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
}

// 创建时间线动画 - 使用性能优化的配置
const tl = gsap.timeline({
    onUpdate: throttledUpdate // 使用节流函数替代直接更新
});

// 监听滚动事件 - 优化性能
let lastScrollY = window.scrollY;
let scrollTimeout = null;
window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    lastScrollDirection = currentScrollY > lastScrollY ? 1 : -1;
    lastScrollY = currentScrollY;
    lastScrollTime = Date.now();
    
    // 使用requestAnimationFrame优化性能
    if (rafId) {
        cancelAnimationFrame(rafId);
    }
    rafId = requestAnimationFrame(throttledUpdate);
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

// 优化性能的滚动触发器
ScrollTrigger.create({
    trigger: '.project-container',
    start: 'top',
    end: '+=4000',
    markers: true,
    scrub: {
        trigger: '.project-container',
        start: 'top',
        end: '+=4000',
        snap: null // 禁用内置吸附，使用自定义吸附
    },
    pin: true,
    animation: tl,
    onUpdate: (self) => {
        lastScrollTime = Date.now();
        
        // 简化边界检测逻辑
        const isNearEnd = self.progress > 0.97; // 稍微提高阈值
        const isNearStart = self.progress < 0.03;
        
        // 边界状态管理
        if (isNearEnd && !isAtEndBoundary) {
            isAtEndBoundary = true;
            isBoundaryAnimation = true;
            
            gsap.to(card, {
                rotateX: 540,
                duration: 0.3,
                ease: 'power1.out',
                onComplete: () => {
                    isBoundaryAnimation = false;
                }
            });
            
        } else if (!isNearEnd && isAtEndBoundary) {
            isAtEndBoundary = false;
        }
        
        if (isNearStart && !isAtStartBoundary) {
            isAtStartBoundary = true;
            isBoundaryAnimation = true;
            
            gsap.to(card, {
                rotateX: 0,
                duration: 0.3,
                ease: 'power1.out',
                onComplete: () => {
                    isBoundaryAnimation = false;
                }
            });
            
        } else if (!isNearStart && isAtStartBoundary) {
            isAtStartBoundary = false;
        }
        
        // 从下往上滚动到end边界时的处理
        if (isAtEndBoundary && lastScrollDirection === -1) {
            const currentRotation = gsap.getProperty(card, "rotateX");
            if (Math.abs(currentRotation - 540) > 10 && !isBoundaryAnimation) {
                isBoundaryAnimation = true;
                gsap.to(card, {
                    rotateX: 540,
                    duration: 0.2,
                    ease: 'power1.out',
                    onComplete: () => {
                        isBoundaryAnimation = false;
                    }
                });
            }
        }
        
        // 反向滚动重置
        if (self.direction === -1 && self.progress === 0) {
            isBoundaryAnimation = true;
            gsap.set(card, { rotateX: 0 });
            updateContent(0);
            updateVisibleFaces(0);
            tl.progress(0);
            
            setTimeout(() => {
                isBoundaryAnimation = false;
            }, 100);
        }
    },
    onEnter: () => {
        isAtStartBoundary = false;
        isAtEndBoundary = false;
        isBoundaryAnimation = false;
    },
    onLeave: () => {
        isAtStartBoundary = false;
        isAtEndBoundary = false;
        isBoundaryAnimation = false;
    },
    onEnterBack: () => {
        isAtStartBoundary = false;
        isAtEndBoundary = false;
        isBoundaryAnimation = true;
        
        gsap.set(card, { rotateX: 0 });
        updateContent(0);
        updateVisibleFaces(0);
        tl.progress(0);
        
        setTimeout(() => {
            isBoundaryAnimation = false;
        }, 100);
    },
    onLeaveBack: () => {
        isAtStartBoundary = false;
        isAtEndBoundary = false;
        isBoundaryAnimation = false;
    }
});

// 清理函数
function cleanup() {
    if (rafId) {
        cancelAnimationFrame(rafId);
    }
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }
}

// 页面加载完成后初始化所有内容
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，初始化所有内容');
    initAllContent();
    initClickEvents();
});

// 页面卸载时清理
window.addEventListener('beforeunload', cleanup);

// 如果DOM已经加载完成，立即初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initAllContent();
        initClickEvents();
    });
} else {
    initAllContent();
    initClickEvents();
}


//------------------优化性能版前---------------------




//首页banner小电脑不动

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

    // 获取元素
    const spriteComputer = document.querySelector('.sprite-computer');
    const computerBox = document.querySelector('.computer-box');
    const computerGif = document.querySelector('.computer-gif');
    const computerFinal = document.querySelector('.computer-final'); // 新增获取computer-final
    const boxGif = document.querySelector('.gif-box');

    // 存储定时器
    let showTimer = null;
    let gifTimer = null;

    // 初始状态：sprite-computer一直显示，computer-box显示，其他隐藏
    spriteComputer.style.display = 'block';
    computerBox.style.display = 'block';
    computerGif.style.display = 'none';
    computerFinal.style.display = 'none'; // computer-final初始隐藏

    // 重新加载GIF函数
    function reloadGif(gifElement) {
        const gifSrc = gifElement.src;
        gifElement.src = '';
        gifElement.src = gifSrc;
    }

    // 鼠标悬停事件
    spriteComputer.addEventListener('mouseenter', function() {
        // 清除可能存在的定时器
        if (showTimer) {
            clearTimeout(showTimer);
        }
        
        // 立即隐藏computer-box
        computerBox.style.display = 'none';
        
        // 设置1秒后显示GIF和computer-final（如果还在hover状态）
        gifTimer = setTimeout(() => {
            // 重新加载GIF以确保从头播放
            reloadGif(computerGif);
            
            // 显示computer-gif和computer-final
            computerGif.style.display = 'block';
            computerFinal.style.display = 'block';
            
            // 设置透明度过渡
            computerGif.style.opacity = '0';
            computerFinal.style.opacity = '0';
            
            // 触发重绘
            void computerGif.offsetWidth;
            void computerFinal.offsetWidth;
            
            // 添加过渡效果
            computerGif.style.transition = 'opacity 0.5s ease-in-out';
            computerFinal.style.transition = 'opacity 0.5s ease-in-out';
            computerGif.style.opacity = '1';
            computerFinal.style.opacity = '1';
        }, 800);
    });

    // 鼠标离开事件
    spriteComputer.addEventListener('mouseleave', function() {
        // 清除GIF定时器
        if (gifTimer) {
            clearTimeout(gifTimer);
        }
        
        // 立即隐藏GIF和computer-final
        computerGif.style.display = 'none';
        computerGif.style.opacity = '0';
        computerFinal.style.display = 'none';
        computerFinal.style.opacity = '0';
        
        // 设置1秒后显示computer-box（带透明度过渡）
        showTimer = setTimeout(() => {
            // 重新加载box-gif以确保从头播放
            if (boxGif) {
                reloadGif(boxGif);
            }
            
            computerBox.style.display = 'block';
            computerBox.style.opacity = '0';
            
            // 触发重绘
            void computerBox.offsetWidth;
            
            // 添加过渡效果
            computerBox.style.transition = 'opacity 0.5s ease-in-out';
            computerBox.style.opacity = '1';
        }, 800);
    });
});
