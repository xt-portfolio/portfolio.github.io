// 版本A：保持你的原版，只添加必要优化
const lenis = new Lenis({
    smooth: true,
    direction: 'vertical',
    gestureDirection: 'vertical',
    // 只添加这2个关键优化
    lerp: 0.08,     // 降低卡顿
    duration: 1.5   // 更平滑
});

window.addEventListener('wheel', (e) => {
    e.preventDefault();
    lenis.scrollBy(e.deltaY * 0.004, {  // 降低速度
        duration: 1.5,
        easing: (t) => 1 - Math.pow(1 - t, 4)  // 更轻的缓动
    });
}, { passive: false });

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);


// 高性能Spline优化器 - 双检测机制
class DualDetectionSplineOptimizer {
    constructor() {
        this.splineViewer = document.querySelector('spline-viewer');
        if (!this.splineViewer) return;
        
        this.init();
    }
    
    init() {
        this.isLoaded = true;
        this.isVisible = true;
        this.lastHideTime = 0;
        
        // 初始低质量
        if (this.splineViewer.setQuality) {
            this.splineViewer.setQuality('low');
        }
        
        // 1. 主检测：Intersection Observer
        this.setupIntersectionObserver();
        
        // 2. 备用检测：滚动位置检测
        this.setupScrollDetection();
    }
    
    setupIntersectionObserver() {
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.showSpline();
                    } else {
                        // 延迟隐藏，避免频繁切换
                        setTimeout(() => {
                            if (!entry.isIntersecting) {
                                this.hideSpline();
                            }
                        }, 300);
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '200px'
            }
        );
        
        this.observer.observe(this.splineViewer);
    }
    
    setupScrollDetection() {
        let lastScrollCheck = 0;
        
        lenis.on('scroll', (e) => {
            const now = Date.now();
            
            // 每500ms检查一次
            if (now - lastScrollCheck < 500) return;
            lastScrollCheck = now;
            
            // 如果Spline当前是隐藏状态，检查是否应该显示
            if (!this.isVisible) {
                this.checkShouldShow();
            }
        });
        
        window.addEventListener('resize', () => {
            setTimeout(() => this.checkShouldShow(), 100);
        });
    }
    
    checkShouldShow() {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        
        // 假设Spline在页面顶部，当滚动到顶部附近时应该显示
        const shouldShow = scrollY < windowHeight * 1.5;
        
        if (shouldShow && !this.isVisible) {
            this.showSpline();
            
            if (this.observer) {
                this.observer.unobserve(this.splineViewer);
                this.observer.observe(this.splineViewer);
            }
        }
    }
    
    hideSpline() {
        if (!this.isVisible) return;
        
        this.isVisible = false;
        this.lastHideTime = Date.now();
        
        // display: none（性能最好）
        this.splineViewer.style.display = 'none';
        
        // 停止观察，因为display:none后无法检测
        if (this.observer) {
            this.observer.unobserve(this.splineViewer);
        }
        
        // 暂停渲染
        if (this.splineViewer.pause) {
            this.splineViewer.pause();
        }
        
        // 最低质量
        if (this.splineViewer.setQuality) {
            this.splineViewer.setQuality('lowest');
        }
        
        // 3秒后重新开始观察（确保可以再次显示）
        setTimeout(() => {
            if (!this.isVisible && this.observer) {
                this.splineViewer.style.display = 'block';
                this.observer.observe(this.splineViewer);
                setTimeout(() => {
                    if (!this.isVisible) {
                        this.splineViewer.style.display = 'none';
                    }
                }, 100);
            }
        }, 3000);
    }
    
    showSpline() {
        if (this.isVisible) return;
        
        this.isVisible = true;
        
        // 立即显示
        this.splineViewer.style.display = 'block';
        
        // 重新开始观察
        if (this.observer) {
            this.observer.unobserve(this.splineViewer);
            this.observer.observe(this.splineViewer);
        }
        
        // 播放
        if (this.splineViewer.play) {
            setTimeout(() => {
                this.splineViewer.play();
            }, 100);
        }
        
        // 恢复质量
        if (this.splineViewer.setQuality) {
            setTimeout(() => {
                this.splineViewer.setQuality('low');
            }, 200);
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        new DualDetectionSplineOptimizer();
    }, 2000);
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
});// ------------------------------------1.首页---------------------------------

 document.addEventListener('DOMContentLoaded', function() {
            const bannerBox = document.querySelector('.banner');
            const keycap = document.querySelector('.move-bg');
            
            // 视差强度控制值，可根据需要调整 (范围：1-50)
            // 值越大，视差效果越明显
            const parallaxStrength = 10;

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

ScrollTrigger.create({
    trigger:'.banner',// 触发对象
    start:'top',//开始位置
    end:'+=900',//结束位置
    // markers:true,//显示位置标记
    scrub:true,//随着鼠标上下滚动显示出现
    // pin:true,
    animation:
    gsap.timeline()
    // .to('.bannerImg-box ',{y:-25,duration: 3,ease: 'power3.out',})
    .to('.portfolio-lable-box',{rotate:-15,duration: 3,ease: 'power3.out',},'<')
    // .to('.portfolio-label-x',{y:-15,x:10,duration: 3,ease: 'power3.out',},'<')

});
// ---------------------------------------2.个人--------------------------------------------

// 响应式ScrollTrigger管理器
function initPersonalAnimation() {
  // 获取当前屏幕宽度
  const screenWidth = window.innerWidth;
  const isMobileLayout = screenWidth <= 1199;
  
  // 获取已有的ScrollTrigger实例（如果有）
  const existingTrigger = ScrollTrigger.getById('personal-animation');
  if (existingTrigger) {
    existingTrigger.kill(); // 移除旧实例
  }
  
  // 创建动画时间线
  const tl = gsap.timeline();
  tl.from('.photo-1', { 
    rotate: -12, 
    duration: isMobileLayout ? 1.2 : 1,
    ease: 'power3.out' 
  });
  
  // 根据屏幕尺寸创建不同的ScrollTrigger配置
  if (isMobileLayout) {
    // 移动端/平板：进入视口时播放一次
    ScrollTrigger.create({
      id: 'personal-animation',
      trigger: '.personal',
      start: 'top 80%',
      end: '+=100',
      animation: tl,
      once: true, // 只播放一次
      // markers: true
    });
  } else {
    // PC端：滚动驱动动画
    ScrollTrigger.create({
      id: 'personal-animation',
      trigger: '.personal',
      start: '-12%',
      end: '+=500',
      scrub: true, // 滚动驱动
      animation: tl,
      // markers: true,
      // pin: true
    });
  }
}

// 初始化动画
initPersonalAnimation();

// 监听窗口大小变化，重新初始化动画
window.addEventListener('resize', () => {
  // 使用防抖避免频繁触发
  clearTimeout(window.resizedTimer);
  window.resizedTimer = setTimeout(() => {
    initPersonalAnimation();
  }, 200);
});






// 数字滚动效果 - 纯数字动画，无缩放
function initNumberCountAnimation() {
    const numberCards = document.querySelectorAll('.number-card');
    const numbers = document.querySelectorAll('.number-card h1');
    
    // 目标数字
    const targetNumbers = [10, 56];
    // 动画持续时间（毫秒）
    const duration = 1200;
    // 随机跳动间隔（毫秒）
    const randomInterval = 80;
    let hasAnimated = [false, false];
    
    // 检查元素是否在视口中
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        return (
            rect.top <= windowHeight * 0.8 &&
            rect.bottom >= 0
        );
    }
    
    // 带随机效果的数字滚动动画
    function animateNumberWithRandom(index, targetNum, element) {
        if (hasAnimated[index]) return;
        
        hasAnimated[index] = true;
        
        let startTime = null;
        let lastRandomTime = 0;
        let currentDisplayNum = 0;
        
        // 先快速随机变化（1.2秒）
        function randomPhase(currentTime) {
            if (!startTime) startTime = currentTime;
            const elapsedTime = currentTime - startTime;
            
            // 随机阶段持续1.2秒
            if (elapsedTime < 1200) {
                if (currentTime - lastRandomTime > randomInterval) {
                    lastRandomTime = currentTime;
                    // 生成随机数（范围逐渐接近目标值）
                    const progress = elapsedTime / 1200;
                    const maxRandom = Math.max(1, Math.floor(targetNum * (1 - progress * 0.6)));
                    currentDisplayNum = Math.floor(Math.random() * maxRandom);
                    element.textContent = currentDisplayNum;
                }
                requestAnimationFrame(randomPhase);
            } else {
                // 进入平滑滚动阶段
                smoothPhase(currentTime);
            }
        }
        
        // 平滑滚动到目标值
        function smoothPhase(currentTime) {
            const totalElapsed = currentTime - startTime;
            const smoothProgress = Math.min((totalElapsed - 1200) / (duration - 1200), 1);
            
            // 使用缓动函数
            function easeOutQuart(t) {
                return 1 - Math.pow(1 - t, 4);
            }
            
            const easedProgress = easeOutQuart(smoothProgress);
            currentDisplayNum = Math.floor(easedProgress * targetNum);
            element.textContent = currentDisplayNum;
            
            if (smoothProgress < 1) {
                requestAnimationFrame(smoothPhase);
            } else {
                // 动画完成，显示最终数字
                element.textContent = targetNum;
            }
        }
        
        // 开始动画
        requestAnimationFrame(randomPhase);
    }
    
    // 检查所有卡片并触发动画
    function checkAndTriggerAnimation() {
        numberCards.forEach((card, index) => {
            if (isElementInViewport(card) && !hasAnimated[index]) {
                const numberElement = numbers[index];
                // 开始动画（第二个卡片延迟200ms）
                setTimeout(() => {
                    animateNumberWithRandom(index, targetNumbers[index], numberElement);
                }, index * 200);
            }
        });
    }
    
    // 监听滚动事件
    window.addEventListener('scroll', checkAndTriggerAnimation);
    
    // 监听resize事件
    window.addEventListener('resize', checkAndTriggerAnimation);
    
    // 初始检查
    setTimeout(checkAndTriggerAnimation, 300);
    
    // 如果需要重置
    function resetAnimation() {
        numbers.forEach((num, index) => {
            num.textContent = '0';
            hasAnimated[index] = false;
        });
    }
    
    // 暴露重置函数
    window.resetNumberAnimation = resetAnimation;
}

// 初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNumberCountAnimation);
} else {
    initNumberCountAnimation();
}







// skill列表的鼠标跟随效果
document.addEventListener('DOMContentLoaded', function() {
    const skillLists = document.querySelectorAll('.skill-list');
    let followImage = null;
    let isFollowing = false;
    let currentAlignFunction = null;
    
    // 清理鼠标跟随效果
    function cleanupMouseFollowEffect() {
        if (followImage) {
            gsap.set(followImage, { autoAlpha: 0 });
        }
        if (currentAlignFunction) {
            document.removeEventListener("mousemove", currentAlignFunction);
            currentAlignFunction = null;
        }
        isFollowing = false;
    }
    
    // 初始化鼠标跟随效果
    function initMouseFollowEffect() {
        // 如果已经存在跟随图片，先彻底移除
        if (followImage && followImage.parentNode) {
            followImage.parentNode.removeChild(followImage);
            followImage = null;
        }
        
        // 清理事件监听
        cleanupMouseFollowEffect();
        
        // 创建跟随鼠标的图片元素
        followImage = document.createElement('img');
        followImage.className = 'skillImg-follow';
        followImage.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            z-index: 9999;
            pointer-events: none;
            width: 250px;
            aspect-ratio: 16/9;
            object-fit: cover;
            opacity: 0;
            transform: none; /* 修改点1: 从 translate(-50%, -50%) 改为 none，移除居中变换 */
        `;
        document.body.appendChild(followImage);
        
        let firstEnter = true;
        
        // 对齐函数 - 控制图片位置
        const align = (e) => {
            if (!followImage || !isFollowing) return;
            
            // 计算右下角位置：图片左上角相对于指针的偏移
            const offsetX = 0; // 向右偏移20像素
            const offsetY = 0; // 向下偏移20像素
            
            if (firstEnter) {
                gsap.set(followImage, { 
                    x: e.clientX + offsetX,  /* 修改点2: 添加向右偏移，让图片在指针右侧 */
                    y: e.clientY + offsetY   /* 修改点3: 添加向下偏移，让图片在指针下方 */
                });
                firstEnter = false;
            } else {
                gsap.to(followImage, { 
                    x: e.clientX + offsetX,  /* 修改点4: 同上，保持右下角位置 */
                    y: e.clientY + offsetY,  /* 修改点5: 同上，保持右下角位置 */
                    duration: 1.5,
                    ease: "power3"
                });
            }
        };
        
        // 保存对齐函数引用以便清理
        currentAlignFunction = align;
        
        const fade = gsap.to(followImage, {
            autoAlpha: 1,
            ease: "none",
            paused: true,
            duration: 0.1,
            onReverseComplete: () => {
                isFollowing = false;
                firstEnter = true;
            }
        });
        
        // 为每个skill列表项添加鼠标事件
        skillLists.forEach((skillItem) => {
            const image = skillItem.querySelector('img');
            if (!image) return;
            
            skillItem.addEventListener("mouseenter", (e) => {
                firstEnter = true;
                followImage.src = image.src;
                fade.play();
                isFollowing = true;
                document.addEventListener("mousemove", align);
                align(e);
            });
            
            skillItem.addEventListener("mouseleave", () => {
                fade.reverse();
                document.removeEventListener("mousemove", align);
            });
        });
        
        // 监听整个skill-lists容器的鼠标离开事件
        const skillListsContainer = document.querySelector('.skill-lists');
        if (skillListsContainer) {
            skillListsContainer.addEventListener('mouseleave', (e) => {
                // 检查鼠标是否真的离开了skill容器区域
                const rect = skillListsContainer.getBoundingClientRect();
                const isOutsideContainer = 
                    e.clientY < rect.top - 10 || 
                    e.clientY > rect.bottom + 10 || 
                    e.clientX < rect.left - 10 || 
                    e.clientX > rect.right + 10;
                
                if (isOutsideContainer && isFollowing) {
                    // 强制隐藏跟随图片
                    gsap.to(followImage, {
                        autoAlpha: 0,
                        duration: 0.1,
                        onComplete: () => {
                            document.removeEventListener("mousemove", align);
                            isFollowing = false;
                            firstEnter = true;
                        }
                    });
                }
            });
            
            // 监听整个文档的鼠标移动，检查是否在skill容器外
            document.addEventListener('mousemove', (e) => {
                if (!isFollowing) return;
                
                const rect = skillListsContainer.getBoundingClientRect();
                const isOutsideContainer = 
                    e.clientY < rect.top - 10 || 
                    e.clientY > rect.bottom + 10 || 
                    e.clientX < rect.left - 10 || 
                    e.clientX > rect.right + 10;
                
                if (isOutsideContainer) {
                    // 鼠标在skill容器外，隐藏跟随图片
                    gsap.to(followImage, {
                        autoAlpha: 0,
                        duration: 0.1,
                        onComplete: () => {
                            document.removeEventListener("mousemove", align);
                            isFollowing = false;
                            firstEnter = true;
                        }
                    });
                }
            });
        }
    }
    
    // 确保页面加载后立即初始化效果
    setTimeout(() => {
        initMouseFollowEffect();
    }, 100);
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


gsap.from('.skill-list', {
    scrollTrigger: ".skill-list",// 此行代码表示触发动画的元素，只需要增加该行代码，就可以实现想要的效果。
    // x: -50,
    y: 30,
    stagger: 0.3 , // 每个元素间隔0.2秒
    duration: 1,
    ease: 'power1.out',
});


// 内容数据 - 依次对应：正面1、背面1、正面2（原背面2移除）
const contentData = {
    'zh': [
        {
            title: "数字能源",
            description: "这是一个全链路数字能源管理系统，整合发电、配电、能源管理与充电运营等核心模块，通过 PC 与移动端双平台协同与可视化技术，实现能源全生命周期的高效管控与智能运维。",
            link: "./project-DigitalEnergy.html",
            time: "2025",
            category: "B端 · 移动端",
            role: "UI/UX · AI · 交互设计",
            tags: ["B端", "移动端"]
        },
        {
            title: "可视化合集",
            description: "汇聚近年可视化设计代表作，聚焦电力能源领域核心场景与需求，在项目中我主要负责三维建模、可视化界面设计，动效输出等",
            link: "./project-Visualization.html",
            time: "2022-2025",
            category: "可视化",
            role: "UI/UX · 三维建模",
            tags: ["可视化", "三维建模"]
        },
        {
            title: "现货市场数据监控",
            description: "这是一款面向电力能源行业的智慧运维与数据管理平台，聚焦发电站、电力现货市场的全链路数据监控、异常管理与业务操作。",
            link: "./project-CashMacket.html",
            time: "2025",
            category: "移动端",
            role: "UI/UX· AI",
            tags: ["UI/UX", "移动端"]
        }
    ],
    'en': [
        {
            title: "Digital Energy",
            description: "This is a full-link digital energy management system that integrates core modules including power generation, distribution, energy management, and charging operation. It enables efficient control and intelligent O&M across the entire energy lifecycle through dual-platform collaboration and visualization. ",
            link: "./project-DigitalEnergy.html",
            time: "2025",
            category: "dashboard · mobile",
            role: "UI/UX · AI Design · Interaction Redesign",
            tags: ["dashboard", "mobile"]
        },
        {
            title: "Visualization Collection",
            description: "Gathering representative works of visual design in recent years, focusing on core scenarios and requirements in the field of power energy. In the project, I was mainly responsible for 3D modeling, visual interface design, dynamic effect output, etc. ",
            link: "./project-Visualization.html",
            time: "2022-2025",
            category: "Visualization",
            role: "UI/UX · 3D modeling",
            tags: ["UI/UX", "3D modeling"]
        },
        {
            title: "Instant Dream",
            description: "This is a smart operation and data management platform for the power energy industry, focusing on full chain data monitoring, anomaly management, and business operations for power plants and spot markets. ",
            link: "./project-CashMacket.html",
            time: "2024",
            category: "Mobile",
            role: "UI/UX · AI Design",
            tags: ["Mobile"]
        }
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
            element.style.display = '-webkit-box'; // 保持 line-clamp 效果
        } else {
            element.style.display = 'none';
        }
    });
    
    // 更新HTML的lang属性
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
        // 0-90度: 项目1 (front-1)
        // 90-270度: 项目2 (back-1)
        // 270-360度: 项目3 (front-2)
        if (rotation < 90) {
            updateContent(0);
            updateVisibleFaces(0);
        } else if (rotation < 270) {
            updateContent(1);
            updateVisibleFaces(1);
        } else {
            updateContent(2);
            updateVisibleFaces(2);
        }
    }
});

// 调整后的动画序列 - 总旋转角度改为360度（移除540度的动画）
tl.to('.card', {rotateX: 0, duration: 2, ease: 'power3.out'})
  .to('.card', {rotateX: 180, duration: 30, ease: 'power3.out'})
  .to('.item-title-scroll', {y: "-25%", duration: 3, ease: 'power3.out'}, '-=20')
  .to('.item-value-scroll,.item-number-scroll', {y: -26.5, duration: 3, ease: 'power3.out'}, '<') 
  .to('.front-1', {opacity: 0, duration: 1, ease: 'power3.out'}, '+=1')
  .to('.front-2', {opacity: 1, duration: 1, ease: 'power3.out'}, '<')          
  .to('.card', {rotateX: 360, duration: 30, ease: 'power3.out'})
  .to('.item-title-scroll', {y: "-50%", duration: 3, ease: 'power3.out'}, '-=20') 
  .to('.item-value-scroll,.item-number-scroll', {y: -53, duration: 3, ease: 'power3.out'}, '<')
  .to('.back-1', {opacity: 0, duration: 1, ease: 'power3.out'}, '+=1');

// 修复边界问题的滚动触发器
ScrollTrigger.create({
    trigger: '.project-container',
    start: 'top',
    end: '+=3000', // 缩短总滚动距离（从4000改为3000）
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
            // 只有当卡片明显偏离360度时才重置
            if (Math.abs(currentRotation - 360) > 5) {
                gsap.set(card, { rotateX: 360 });
                updateContent(2);
                updateVisibleFaces(2);
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
        friction: 0.1,    // 摩擦系数（0-1），值越小滑动越远
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

// --------------------------------------5.笔记-----------------------------------
// 书籍内容数据 - 支持中英文
// 书籍内容数据 - 支持中英文（最终优化版）
const booksContentData = {
    'zh': [
        {
            title: "HTML, CSS, JS",
            description: "从基础的HTML页面结构到复杂的CSS样式设计，再到JavaScript交互逻辑，系统学习前端开发的核心技术与交互动效的实现，理解开发逻辑与实现方式，提升与开发团队的沟通效率，确保设计稿的精准还原与最佳用户体验。"
        },
        {
            title: "AI | 随想录",
            description: "探索AI绘画与视频生成的创作新边界，系统学习Stable Diffusion等工具，掌握风格关键词与高效工作流，提升设计效率，激发创意灵感与视觉表现力。"
        },
        {
            title: "AE | 动效学习",
            description: "深入学习UI动效设计原理，掌握交互动画、微交互与页面过渡效果，创造流畅自然的用户体验，提升产品界面的视觉层次与交互品质。"
        },
        {
            title: "C4D | 三维探索",
            description: "学习Cinema 4D三维技术在UI设计中的应用，掌握三维图标、场景搭建与质感表现，为界面设计增添深度感、空间感与视觉冲击力。"
        }
    ],
    'en': [
        {
            title: "HTML, CSS, JS",
            description: "Mastering core front-end fundamentals (HTML/CSS/JS) from structure to interaction, I focus on motion effect and interaction implementation to enhance developers communication and design accuracy."
        },
        {
            title: "AI Reflections",
            description: "Explore new frontiers in AI painting and video generation, systematically learn tools like Stable Diffusion, master style keywords and efficient workflows to enhance design efficiency and inspire creative ideas and visual expression."
        },
        {
            title: "AE Motion Learning",
            description: "Deeply learn UI motion design principles, master interactive animations, micro-interactions and page transition effects to create smooth, natural user experiences and enhance the visual hierarchy and interactive quality of product interfaces."
        },
        {
            title: "C4D 3D Exploration",
            description: "Learn the application of Cinema 4D 3D technology in UI design, master 3D icons, scene construction and texture representation to add depth, spatiality and visual impact to interface design."
        }
    ]
};

// 获取DOM元素
const booksItems = document.querySelectorAll('.books__item');
const dynamicTitle = document.getElementById('dynamic-title');
const dynamicDescription = document.getElementById('dynamic-description');

// 当前语言状态（从主项目同步）
let currentBooksLang = 'en';

// 更新书籍内容函数
function updateBookContent(bookIndex) {
    const data = booksContentData[currentBooksLang] || booksContentData['en'];
    
    if (data && data[bookIndex] && dynamicTitle && dynamicDescription) {
        console.log(`更新书籍内容: ${data[bookIndex].title}`);
        
        // 添加更新动画类
        dynamicTitle.classList.add('content-updating');
        dynamicDescription.classList.add('content-updating');
        
        // 延迟后更新内容并显示
        setTimeout(() => {
            // 更新内容
            dynamicTitle.textContent = data[bookIndex].title;
            dynamicDescription.textContent = data[bookIndex].description;
            
            // 移除更新类，添加更新完成类
            dynamicTitle.classList.remove('content-updating');
            dynamicDescription.classList.remove('content-updating');
            dynamicTitle.classList.add('content-updated');
            dynamicDescription.classList.add('content-updated');
            
            // 清除动画类
            setTimeout(() => {
                dynamicTitle.classList.remove('content-updated');
                dynamicDescription.classList.remove('content-updated');
            }, 500);
        }, 200);
    }
}

// 更新语言函数
function updateBooksLanguage(lang) {
    currentBooksLang = lang;
    console.log(`切换书籍语言到: ${lang}`);
    
    // 如果当前有悬停的书籍，更新其内容
    if (typeof currentHoverIndex !== 'undefined') {
        updateBookContent(currentHoverIndex);
    } else {
        // 否则显示第一本书的内容
        updateBookContent(0);
    }
}

// 跟踪当前悬停的书籍
let currentHoverIndex = 0;

// 初始化书籍悬停事件
function initBooksHoverEvents() {
    booksItems.forEach((book, index) => {
        // 移除旧的事件
        book.removeEventListener('mouseenter', handleBookHover);
        book.removeEventListener('mouseleave', handleBookLeave);
        
        // 添加新的事件
        book.addEventListener('mouseenter', () => handleBookHover(index));
        book.addEventListener('mouseleave', handleBookLeave);
    });
    
    // 默认显示第一本书的内容
    updateBookContent(0);
}

function handleBookHover(index) {
    console.log(`悬停书籍 ${index + 1}`);
    currentHoverIndex = index;
    updateBookContent(index);
}

function handleBookLeave() {
    // 鼠标离开时保持当前显示的内容
    console.log('鼠标离开书籍');
}

// 监听主项目的语言切换
function setupLanguageSync() {
    // 方法1：监听主toggle按钮的点击
    const mainToggleBtn = document.getElementById('toggle-lang');
    if (mainToggleBtn) {
        mainToggleBtn.addEventListener('click', function() {
            const newLang = this.textContent === 'EN' ? 'zh' : 'en';
            updateBooksLanguage(newLang);
        });
    }
    
    // 方法2：监听localStorage变化
    window.addEventListener('storage', function(e) {
        if (e.key === 'preferredLanguage') {
            updateBooksLanguage(e.newValue || 'en');
        }
    });
    
    // 方法3：设置一个全局事件监听
    window.addEventListener('languageChanged', function(e) {
        if (e.detail && e.detail.lang) {
            updateBooksLanguage(e.detail.lang);
        }
    });
    
    // 初始同步语言
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang) {
        updateBooksLanguage(savedLang);
    }
}

// 简化版本：直接与主项目语言同步
function syncWithMainLanguage() {
    // 定期检查语言状态
    setInterval(() => {
        const savedLang = localStorage.getItem('preferredLanguage');
        const mainToggleBtn = document.getElementById('toggle-lang');
        
        if (savedLang && savedLang !== currentBooksLang) {
            currentBooksLang = savedLang;
            console.log('同步语言到:', savedLang);
            
            // 更新当前显示的内容
            if (typeof currentHoverIndex !== 'undefined') {
                updateBookContent(currentHoverIndex);
            }
        }
        
        // 从按钮文本获取语言状态
        if (mainToggleBtn) {
            const btnLang = mainToggleBtn.textContent === 'EN' ? 'zh' : 'en';
            if (btnLang !== currentBooksLang) {
                currentBooksLang = btnLang;
                console.log('从按钮同步语言到:', btnLang);
                
                if (typeof currentHoverIndex !== 'undefined') {
                    updateBookContent(currentHoverIndex);
                }
            }
        }
    }, 1000); // 每秒检查一次
}

// 初始化函数
function initBooksModule() {
    console.log('初始化书籍模块...');
    
    // 初始语言设置
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    currentBooksLang = savedLang;
    
    // 初始化悬停事件
    initBooksHoverEvents();
    
    // 设置语言同步
    setupLanguageSync();
    syncWithMainLanguage();
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBooksModule);
} else {
    initBooksModule();
}

// 暴露函数供外部调用
window.updateBooksLanguage = updateBooksLanguage;



// --------------------------footer-----------------------------------

// 获取footer元素
const footerElement = document.querySelector('footer');
// 获取footer-mask元素
const footerMask = document.querySelector('.footer-mask');
// 获取QRcode-box元素
const qrCodeBox = document.querySelector('.QRcode-box');

// 判断是否为移动端/平板（≤1199px）
const isTabletOrMobile = window.matchMedia("(max-width: 1199px)").matches;

if (isTabletOrMobile) {
    // ============ 移动端/平板样式 (≤1199px) ============
    // 1. 设置footer的margin-top
    if (footerElement) {
        footerElement.style.setProperty('margin-top', '-24px', 'important');
    }
    
    // 2. 调整footer-mask
    if (footerMask) {
        footerMask.style.position = 'relative';
        footerMask.style.top = 'auto';
    }
    
    // 3. QRcode出现时触发一次动画
    if (qrCodeBox) {
        ScrollTrigger.create({
            trigger: 'footer',
            start: 'top 80%',
            once: true,
            onEnter: () => {
                gsap.fromTo(qrCodeBox, 
                    { rotate: 20, opacity: 0.7 },
                    { rotate: 0, opacity: 1, duration: 1, ease: 'power3.out' }
                );
            }
        });
    }
    
} else {
    // ============ PC端：保持原有ScrollTrigger动画 ============
    ScrollTrigger.create({
        trigger: 'footer',
        start: '0%',
        end: 'bottom',
        scrub: true,
        pin: true,
        animation: gsap.timeline()
            .to('.footer-mask', { y: '-48%', duration: 100, ease: 'power1.out' })
            .from('.QRcode-box', { rotate: 20, duration: 100, ease: 'power3.out' }, '<')
    });
}


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
    circle.style.backgroundImage = 'url(https://pub-ac179314a4564e7fb50bc94b77165669.r2.dev/img/index/view.png)';
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

// 获取contact容器和所有拖尾图片
const contactContainer = document.getElementById('footerContainer');
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

// 鼠标移动事件
let animationTimer = null;
let isMouseInContainer = false;

contactContainer.addEventListener("mousemove", function (e) {
  // 检查鼠标是否在.no-trail元素上
  const noTrailElements = document.querySelectorAll('.no-trail');
  let isOverNoTrail = false;
  
  noTrailElements.forEach(element => {
    const rect = element.getBoundingClientRect();
    if (e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom) {
      isOverNoTrail = true;
    }
  });
  
  // 如果在.no-trail元素上，不触发拖尾
  if (isOverNoTrail) {
    // 立即隐藏所有图片
    imgTails.forEach(imgTail => {
      imgTail.style.transition = 'opacity 200ms ease';
      imgTail.style.opacity = '0';
    });
    return;
  }
  
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
  
  // 设置新的定时器
  animationTimer = setTimeout(() => {
    for (let i = imgTails.length - 1; i >= 0; i--) {
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
  
  if (animationTimer) {
    clearTimeout(animationTimer);
  }
  
  imgTails.forEach((imgTail) => {
    imgTail.style.transition = `opacity 300ms ease`;
    imgTail.style.opacity = "0";
  });
});

// 动画函数
function animationCircle() {
  const noTrailElements = document.querySelectorAll('.no-trail');
  let mouseEvent;
  
  // 检查当前鼠标是否在.no-trail元素上
  try {
    mouseEvent = new MouseEvent('mousemove');
  } catch(e) {
    requestAnimationFrame(animationCircle);
    return;
  }
  
  // 判断是否应该停止动画（简化逻辑）
  if (!isMouseInContainer) {
    requestAnimationFrame(animationCircle);
    return;
  }
  
  let x = coords.x;
  let y = coords.y;
  
  imgTails.forEach((imgTail, index) => {
    imgTail.style.left = (x - 60) + "px";
    imgTail.style.top = (y - 60) + "px";
    
    imgTail.x = x;
    imgTail.y = y;
    
    const nextCircle = imgTails[index + 1] || imgTails[0];
    x += (nextCircle.x - x) * 0.93;
    y += (nextCircle.y - y) * 0.93;
  });
  
  requestAnimationFrame(animationCircle);
}

// 启动动画循环
animationCircle();

// 控制面板交互（如果存在的话）
if (document.getElementById('delay')) {
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
}