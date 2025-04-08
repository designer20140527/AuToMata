document.addEventListener('DOMContentLoaded', function() {
    // 初始化变量
    let featuresScrollProgress = 0;
    let isAnimating = false;
    
    // 获取元素
    const heroBackground = document.querySelector('.hero-background');
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    const heroBtn = document.getElementById('hero-btn');
    const centerLogo = document.querySelector('.center-logo');
    const imagePlaceholder = document.querySelector('.image-placeholder');
    
    // 获取硬币图片元素
    const coin1 = document.querySelector('.coin-1');
    const coin2 = document.querySelector('.coin-2');
    const coin3 = document.querySelector('.coin-3');
    const coin4 = document.querySelector('.coin-4');
    
    // 检查硬币图片元素是否存在
    console.log('硬币元素检查：');
    console.log('硬币1:', coin1);
    console.log('硬币2:', coin2);
    console.log('硬币3:', coin3);
    console.log('硬币4:', coin4);
    console.log('图片容器:', imagePlaceholder);
    
    const testSection = document.querySelector('.test');
    const debugElement = document.getElementById('debug');
    
    // 获取feature-items，使用直接的DOM查询确保一定能获取到
    const featureItem1 = document.querySelector('.feature-item.feature-item-1');
    const featureItem2 = document.querySelector('.feature-item.feature-item-2');
    const featureItem3 = document.querySelector('.feature-item.feature-item-3');
    
    // 调试日志
    console.log('特性项目1查询:', document.querySelector('.feature-item-1'));
    console.log('特性项目2查询:', document.querySelector('.feature-item-2'));
    console.log('特性项目3查询:', document.querySelector('.feature-item-3'));
    console.log('带类选择器特性项目1查询:', document.querySelector('.feature-item.feature-item-1'));
    console.log('带类选择器特性项目2查询:', document.querySelector('.feature-item.feature-item-2'));
    console.log('带类选择器特性项目3查询:', document.querySelector('.feature-item.feature-item-3'));
    
    const sections = [
        document.querySelector('.hero'),
        document.querySelector('.test'),
        document.querySelector('.tokenomics')
    ];
    
    // 调试sections
    console.log('sections:', sections);
    
    // 初始化时只显示第一个feature-item
    if (featureItem1) {
        featureItem1.classList.add('active');
    }
    if (featureItem2) {
        featureItem2.classList.remove('active');
    }
    if (featureItem3) {
        featureItem3.classList.remove('active');
    }
    
    // 确保tokenomics初始隐藏
    const tokenomicsSection = document.querySelector('.tokenomics');
    if (tokenomicsSection) {
        tokenomicsSection.classList.remove('active');
    }
    
    // 检查背景元素是否存在
    if (!heroBackground) {
        console.error('找不到背景元素!');
        return;
    }
    
    // 强制删除可能存在的内联样式
    heroBackground.removeAttribute('style');
    
    // 获取视口高度
    const viewportHeight = window.innerHeight;
    
    // 标记
    let heroContentActive = true;
    let testSectionActive = false;
    let scrollLocked = false;
    
    // 禁用默认滚动行为
    document.body.style.overflow = 'hidden';
    
    // 手动控制滚动 - 确保初始值为0
    let scrollPosition = 0;
    let lastScrollPosition = 0;
    
    // 滚动控制相关变量
    let currentSection = 0;
    let scrolling = false;
    let touchStartY = 0;
    let lastScrollTime = 0;
    const scrollThreshold = 1000; // ms
    
    // Features滚动逻辑变量
    const featuresScrollSteps = 2; // 总共有2步: 显示第二个item和显示第三个item
    
    // 强行应用初始样式 - 确保所有元素的初始状态正确
    heroBackground.style.transform = 'scale(1)';
    centerLogo.style.transform = 'translate(-50%, -50%) scale(1)';
    heroContent.style.transform = 'translateY(0)';
    heroBtn.style.transform = 'translateY(0)';
    heroContent.style.opacity = 1;
    heroBtn.style.opacity = 1;
    testSection.style.transform = 'translateY(0)';
    
    // 确保背景图片加载
    const bgImage = new Image();
    bgImage.onload = function() {
        console.log('背景图片加载成功');
    };
    bgImage.onerror = function() {
        console.error('背景图片加载失败');
    };
    bgImage.src = 'assets/images/hero-bg.png';
    
    // 输出初始状态
    console.log('初始化背景元素：', heroBackground);
    console.log('初始化中心Logo：', centerLogo);
    
    // 初始化Lenis用于平滑缩放效果
    const lenis = new Lenis({
        duration: 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 2
    });
    
    // 当前背景缩放值
    let currentScaleRatio = 1;
    // 目标背景缩放值
    let targetScaleRatio = 1;
    
    // 当前Logo缩放值
    let currentLogoScaleRatio = 1;
    // 目标Logo缩放值
    let targetLogoScaleRatio = 1;
    
    // 硬币移动目标值
    let targetCoin1X = -50;
    let targetCoin1Y = -50;
    let targetCoin2X = -50;
    let targetCoin2Y = -50;
    let targetCoin3X = -50;
    let targetCoin3Y = -50;
    let targetCoin4X = -50;
    let targetCoin4Y = -50;
    
    // 硬币当前位置
    let currentCoin1X = -50;
    let currentCoin1Y = -50;
    let currentCoin2X = -50;
    let currentCoin2Y = -50;
    let currentCoin3X = -50;
    let currentCoin3Y = -50;
    let currentCoin4X = -50;
    let currentCoin4Y = -50;
    
    // 初始化section位置
    function initSections() {
        if (sections[0]) sections[0].style.transform = 'translateY(0)';
        if (sections[1]) sections[1].style.transform = 'translateY(0)';
        if (sections[2]) sections[2].style.transform = 'translateY(0)';
    }
    
    // 滚动到指定section
    function scrollToSection(index) {
        if (index === currentSection || scrolling) return;
        
        scrolling = true;
        currentSection = index;
        
        if (index === 0) {
            if (sections[0]) sections[0].style.transform = 'translateY(0)';
            if (sections[1]) sections[1].style.transform = 'translateY(0)';
            if (sections[2]) sections[2].style.transform = 'translateY(0)';
        } else if (index === 1) {
            if (sections[0]) sections[0].style.transform = 'translateY(-100vh)';
            if (sections[1]) sections[1].style.transform = 'translateY(-100vh)';
            if (sections[2]) sections[2].style.transform = 'translateY(0)';
            
            // 显示第一个feature-item
            if (featureItem1) featureItem1.classList.add('active');
        } else if (index === 2) {
            if (sections[0]) sections[0].style.transform = 'translateY(-200vh)';
            if (sections[1]) sections[1].style.transform = 'translateY(-200vh)';
            if (sections[2]) sections[2].style.transform = 'translateY(-100vh)';
        }

        // 500ms后允许再次滚动
        setTimeout(() => {
            scrolling = false;
        }, 500);
    }
    
    // Features滚动逻辑
    function handleFeaturesScroll(direction) {
        // 只有在当前section是1(features section)时才处理
        if (currentSection !== 1) return;
        
        if (direction === 'down') {
            featuresScrollProgress = Math.min(featuresScrollProgress + 1, featuresScrollSteps);
        } else if (direction === 'up') {
            featuresScrollProgress = Math.max(featuresScrollProgress - 1, 0);
        }
        
        // 根据滚动进度显示对应的feature-item
        if (featuresScrollProgress >= 1 && featureItem2) {
            featureItem2.classList.add('active');
        } else if (featuresScrollProgress < 1 && featureItem2) {
            featureItem2.classList.remove('active');
        }
        
        if (featuresScrollProgress >= 2 && featureItem3) {
            featureItem3.classList.add('active');
        } else if (featuresScrollProgress < 2 && featureItem3) {
            featureItem3.classList.remove('active');
        }
        
        // 当所有feature-item都显示后，再次向下滚动时切换到下一个section
        if (direction === 'down' && featuresScrollProgress >= featuresScrollSteps) {
            scrollToSection(2);
            featuresScrollProgress = 0; // 重置进度
        }
        
        // 当在features section的顶部向上滚动时，回到hero section
        if (direction === 'up' && featuresScrollProgress <= 0) {
            scrollToSection(0);
        }
    }
    
    // 更新视口尺寸
    function updateViewportDimensions() {
        viewportHeight = window.innerHeight;
    }
    
    // 重置滚动位置
    function resetScrollPosition() {
        scrollPosition = 0;
        lastScrollPosition = 0;
    }
    
    // 初始化硬币位置
    function initCoinPositions() {
        currentCoin1X = -50;
        currentCoin1Y = -50;
        currentCoin2X = -50;
        currentCoin2Y = -50;
        currentCoin3X = -50;
        currentCoin3Y = -50;
        currentCoin4X = -50;
        currentCoin4Y = -50;
    }
    
    // 添加硬币监听器
    function addCoinListeners() {
        // 如果需要为硬币添加交互事件，在这里添加
    }
    
    // 鼠标滚轮事件处理
    function handleWheel(e) {
        handleScroll(e);
    }
    
    // 处理滚动
    function handleScroll(e) {
        // 获取滚动方向和强度
        const delta = e.deltaY;
        
        // 检测滚动方向
        const scrollingDown = delta > 0;
        
        // 保存上一次滚动位置用于判断方向
        lastScrollPosition = scrollPosition;
        
        // 更新滚动位置
        scrollPosition += delta;
        
        // 限制范围
        scrollPosition = Math.max(0, scrollPosition);
        
        // 当用户向上滚动且不再处于底部时，解除锁定
        if (!scrollingDown && scrollPosition < viewportHeight * 2) {
            scrollLocked = false;
        }
        
        // 如果已到达最终位置且尝试继续向下滚动，则不处理
        if (scrollLocked && scrollingDown) {
            return;
        }
        
        // 计算目标背景缩放比例 (1 到 1.1) - 只应用于背景图片
        targetScaleRatio = 1 + (Math.min(scrollPosition, viewportHeight) / viewportHeight) * 0.1;
        
        // 计算目标Logo缩放比例 (1 到 5) - 只应用于中心Logo
        targetLogoScaleRatio = 1 + (Math.min(scrollPosition, viewportHeight) / viewportHeight) * 4;
        
        // 更新硬币位置
        updateCoinPositions();
        
        // 直接应用一些缩放来验证是否有效
        heroBackground.style.setProperty('transform', `scale(${targetScaleRatio})`, 'important');
        centerLogo.style.setProperty('transform', `translate(-50%, -50%) scale(${targetLogoScaleRatio})`, 'important');
        
        console.log('滚动触发 - 位置:', scrollPosition, '背景缩放:', targetScaleRatio, 'Logo缩放:', targetLogoScaleRatio);
        
        // 第一阶段：hero内容移动
        if (scrollPosition <= viewportHeight) {
            // 内容上移（或下移，取决于滚动方向）
            const contentTransform = -scrollPosition * 0.5;
            const btnTransform = scrollPosition * 0.5;
            
            // 应用变换 - 只应用于内容和按钮
            heroContent.style.transform = `translateY(${contentTransform}px)`;
            heroBtn.style.transform = `translateY(${btnTransform}px)`;
            
            // 设置透明度 - 只应用于内容和按钮
            const opacity = Math.max(0, 1 - (scrollPosition / viewportHeight));
            heroContent.style.opacity = opacity;
            heroBtn.style.opacity = opacity;
            
            // test部分保持不动
            testSection.style.transform = 'translateY(0)';
            
            // 隐藏tokenomics
            const tokenomicsSection = document.querySelector('.tokenomics');
            if (tokenomicsSection) {
                tokenomicsSection.classList.remove('active');
            }
            
            heroContentActive = true;
            testSectionActive = false;
            
            // 确保滚动锁已解除
            scrollLocked = false;
            
            // 重置feature显示状态 - 当回到hero部分时隐藏第2和第3个feature
            if (featureItem1) featureItem1.classList.remove('active');
            if (featureItem2) featureItem2.classList.remove('active');
            if (featureItem3) featureItem3.classList.remove('active');
            
            // 重置features滚动进度
            featuresScrollProgress = 0;
        } 
        // 第二阶段：test部分上移
        else if (scrollPosition > viewportHeight && scrollPosition <= viewportHeight * 2) {
            // 确保hero部分透明 - 只应用于内容和按钮
            heroContent.style.opacity = 0;
            heroBtn.style.opacity = 0;
            
            // 计算test部分应上移的距离
            const testTransform = -(scrollPosition - viewportHeight);
            
            // 1. 修复test section不能到达顶部的问题，改为完全上移到顶部
            testSection.style.transform = `translateY(${testTransform}px)`;
            
            // 2. 向上滚动时检测是否应该回到hero部分
            if (testTransform >= -100 && !scrollingDown) {
                // 当快接近hero部分并且向上滚动时，直接回到hero部分
                scrollPosition = viewportHeight - 1;
                
                // 立即应用变换
                const contentTransform = -(viewportHeight - 1) * 0.5;
                const btnTransform = (viewportHeight - 1) * 0.5;
                const opacity = Math.max(0, 1 - ((viewportHeight - 1) / viewportHeight));
                
                heroContent.style.transform = `translateY(${contentTransform}px)`;
                heroBtn.style.transform = `translateY(${btnTransform}px)`;
                heroContent.style.opacity = opacity;
                heroBtn.style.opacity = opacity;
                
                // 重置test section状态
                testSection.style.transform = 'translateY(0)';
                
                heroContentActive = true;
                testSectionActive = false;
                return;
            }
            
            // 当test部分完全到达顶部时
            if (Math.abs(testTransform) >= viewportHeight * 0.99) {
                // test部分固定在顶部
                testSection.style.transform = `translateY(${-viewportHeight}px)`;
                
                // Features内容滚动逻辑 - 总共需要滚动100vh的高度来显示所有feature
                const remainingScroll = scrollPosition - viewportHeight * 2;
                const featureProgress = Math.min(1, Math.max(0, remainingScroll / viewportHeight));
                
                console.log('Feature内部滚动进度:', featureProgress);
                
                // 第一个feature总是显示
                if (featureItem1) {
                    featureItem1.classList.add('active');
                }
                
                // 第二个feature在30%进度时显示
                if (featureProgress >= 0.3) {
                    if (featureItem2) featureItem2.classList.add('active');
                } else {
                    if (featureItem2) featureItem2.classList.remove('active');
                }
                
                // 第三个feature在60%进度时显示
                if (featureProgress >= 0.7) {
                    if (featureItem3) featureItem3.classList.add('active');
                } else {
                    if (featureItem3) featureItem3.classList.remove('active');
                }
                
                // 所有feature都已显示，并且用户继续向下滚动，允许切换到tokenomics
                if (featureProgress >= 0.9 && scrollingDown) {
                    // 显示tokenomics部分
                    const tokenomicsSection = document.querySelector('.tokenomics');
                    if (tokenomicsSection) {
                        tokenomicsSection.classList.add('active');
                        console.log('显示tokenomics部分!');
                    }
                    
                    // 锁定滚动，防止继续往下滚动
                    scrollLocked = true;
                }
                
                // 存储当前进度
                featuresScrollProgress = featureProgress;
            } else {
                // test部分还未完全到达顶部，只显示第一个feature
                if (featureItem1) featureItem1.classList.add('active');
                if (featureItem2) featureItem2.classList.remove('active');
                if (featureItem3) featureItem3.classList.remove('active');
                
                // 隐藏tokenomics
                const tokenomicsSection = document.querySelector('.tokenomics');
                if (tokenomicsSection) {
                    tokenomicsSection.classList.remove('active');
                }
                
                // 重置features滚动进度
                featuresScrollProgress = 0;
            }
            
            heroContentActive = false;
            testSectionActive = true;
            
            // 未到最终位置，不锁定滚动
            if (featuresScrollProgress < 0.9) {
                scrollLocked = false;
            }
        }
        
        // 防止默认滚动行为
        e.preventDefault();
        
        // 更新调试信息
        updateDebugInfo();
    }
    
    // 更新硬币位置的函数
    function updateCoinPositions() {
        // 计算硬币的移动距离，基于滚动位置，最大移动50%（增加从30%）
        const movePercent = Math.min(scrollPosition, viewportHeight) / viewportHeight * 50;
        
        // 设置目标位置 - 初始位置(-50%, -50%)加上移动量
        // coin-1向左下角移动：X减小，Y增加
        targetCoin1X = -50 - movePercent;
        targetCoin1Y = -50 + movePercent;
        
        // coin-2向左上角移动：X减小，Y减小
        targetCoin2X = -50 - movePercent;
        targetCoin2Y = -50 - movePercent;
        
        // coin-3向右下角移动：X增加，Y增加
        targetCoin3X = -50 + movePercent;
        targetCoin3Y = -50 + movePercent;
        
        // coin-4向右上角移动：X增加，Y减小 (修正，原本错误地设置为左上角)
        targetCoin4X = -50 + movePercent;
        targetCoin4Y = -50 - movePercent;
        
        console.log('更新硬币位置 - 移动百分比:', movePercent);
        console.log('硬币1目标位置:', targetCoin1X, targetCoin1Y);
        console.log('硬币2目标位置:', targetCoin2X, targetCoin2Y);
        console.log('硬币3目标位置:', targetCoin3X, targetCoin3Y);
        console.log('硬币4目标位置:', targetCoin4X, targetCoin4Y);
        
        // 添加直接应用变换的代码，确保硬币位置立即变化
        if (coin1) coin1.style.transform = `translate(${targetCoin1X}%, ${targetCoin1Y}%)`;
        if (coin2) coin2.style.transform = `translate(${targetCoin2X}%, ${targetCoin2Y}%)`;
        if (coin3) coin3.style.transform = `translate(${targetCoin3X}%, ${targetCoin3Y}%)`;
        if (coin4) coin4.style.transform = `translate(${targetCoin4X}%, ${targetCoin4Y}%)`;
    }
    
    // 触摸事件处理（用于移动设备）
    function handleTouchStart(e) {
        touchStartY = e.touches[0].clientY;
    }
    
    function handleTouchMove(e) {
        const touchY = e.touches[0].clientY;
        const deltaY = touchStartY - touchY;
        const scrollingDown = deltaY > 0;
        
        // 如果锁定且向下滚动，则阻止
        if (scrollLocked && scrollingDown) {
            e.preventDefault();
            return;
        }
        
        // 模拟鼠标滚轮事件
        handleScroll({
            deltaY: deltaY * 3,
            preventDefault: () => e.preventDefault()
        });
        
        touchStartY = touchY;
    }
    
    // 键盘事件处理
    function handleKeyDown(e) {
        let delta = 0;
        let scrollingDown = false;
        
        switch (e.key) {
            case 'ArrowUp':
                delta = -50;
                scrollingDown = false;
                break;
            case 'ArrowDown':
                delta = 50;
                scrollingDown = true;
                break;
            case 'PageUp':
                delta = -200;
                scrollingDown = false;
                break;
            case 'PageDown':
                delta = 200;
                scrollingDown = true;
                break;
            case 'Home':
                scrollPosition = 0;
                handleScroll({deltaY: 0, preventDefault: () => {}});
                break;
            case 'End':
                scrollPosition = viewportHeight * 2;
                handleScroll({deltaY: 0, preventDefault: () => {}});
                break;
            default:
                return;
        }
        
        // 如果锁定且向下滚动，则不处理
        if (scrollLocked && scrollingDown) {
            e.preventDefault();
            return;
        }
        
        handleScroll({
            deltaY: delta,
            preventDefault: () => e.preventDefault()
        });
        
        e.preventDefault();
    }
    
    // 添加一个快捷键测试功能
    document.addEventListener('keydown', function(e) {
        // 按't'键测试tokenomics显示效果
        if (e.key === 't') {
            const tokenomicsSection = document.querySelector('.tokenomics');
            if (tokenomicsSection) {
                tokenomicsSection.classList.toggle('active');
                console.log('测试切换tokenomics显示状态:', tokenomicsSection.classList.contains('active'));
            }
        }
        
        // 按'f'键测试feature-item显示效果
        if (e.key === 'f') {
            // 找到所有feature-item
            const items = document.querySelectorAll('.feature-item');
            items.forEach((item, index) => {
                // 延迟依次显示各个item
                setTimeout(() => {
                    item.classList.toggle('active');
                    console.log(`测试切换feature-item ${index+1} 显示状态:`, item.classList.contains('active'));
                }, index * 500);
            });
        }
    });
    
    // 用于动画的函数
    function animateParameters(time) {
        // 平滑更新背景缩放 - 只应用于背景图片
        currentScaleRatio = lenis.lerp(currentScaleRatio, targetScaleRatio, 0.08);
        
        // 平滑更新Logo缩放
        currentLogoScaleRatio = lenis.lerp(currentLogoScaleRatio, targetLogoScaleRatio, 0.08);
        
        // 平滑更新硬币位置
        if (coin1 && coin2 && coin3 && coin4) {
            // 平滑更新硬币位置 - 使用更高的lerp系数0.1使移动更明显
            currentCoin1X = lenis.lerp(currentCoin1X, targetCoin1X, 0.1);
            currentCoin1Y = lenis.lerp(currentCoin1Y, targetCoin1Y, 0.1);
            currentCoin2X = lenis.lerp(currentCoin2X, targetCoin2X, 0.1);
            currentCoin2Y = lenis.lerp(currentCoin2Y, targetCoin2Y, 0.1);
            currentCoin3X = lenis.lerp(currentCoin3X, targetCoin3X, 0.1);
            currentCoin3Y = lenis.lerp(currentCoin3Y, targetCoin3Y, 0.1);
            currentCoin4X = lenis.lerp(currentCoin4X, targetCoin4X, 0.1);
            currentCoin4Y = lenis.lerp(currentCoin4Y, targetCoin4Y, 0.1);
            
            // 应用硬币位置
            coin1.style.transform = `translate(${currentCoin1X}%, ${currentCoin1Y}%)`;
            coin2.style.transform = `translate(${currentCoin2X}%, ${currentCoin2Y}%)`;
            coin3.style.transform = `translate(${currentCoin3X}%, ${currentCoin3Y}%)`;
            coin4.style.transform = `translate(${currentCoin4X}%, ${currentCoin4Y}%)`;
            
            // 仅在位置变化时输出调试
            if (scrollPosition > 0) {
                console.log('当前硬币位置 - 硬币1:', currentCoin1X.toFixed(1), currentCoin1Y.toFixed(1));
            }
        }
        
        // 确保直接应用到背景DOM，使用!important确保不被覆盖
        heroBackground.style.setProperty('transform', `scale(${currentScaleRatio})`, 'important');
        
        // 确保直接应用到Logo DOM，注意保留translate属性
        centerLogo.style.setProperty('transform', `translate(-50%, -50%) scale(${currentLogoScaleRatio})`, 'important');
        
        // 更新调试信息
        updateDebugInfo();
        
        // 请求下一帧
        requestAnimationFrame(animateParameters);
    }
    
    // 更新调试信息
    function updateDebugInfo() {
        if (debugElement) {
            debugElement.innerHTML = `
                滚动位置: ${Math.round(scrollPosition)}<br>
                当前背景缩放: ${currentScaleRatio.toFixed(3)}<br>
                当前Logo缩放: ${currentLogoScaleRatio.toFixed(3)}<br>
                目标背景缩放: ${targetScaleRatio.toFixed(3)}<br>
                目标Logo缩放: ${targetLogoScaleRatio.toFixed(3)}<br>
                实际背景transform: ${heroBackground.style.transform}<br>
                实际Logo transform: ${centerLogo.style.transform}<br>
                硬币1位置: ${currentCoin1X.toFixed(1)}, ${currentCoin1Y.toFixed(1)}<br>
                硬币2位置: ${currentCoin2X.toFixed(1)}, ${currentCoin2Y.toFixed(1)}<br>
                阶段: ${scrollPosition <= viewportHeight ? 1 : scrollPosition <= viewportHeight * 2 ? 2 : 3}<br>
                锁定: ${scrollLocked ? '是' : '否'}
            `;
        }
    }
    
    // 基本初始化
    initSections();
    
    // 注册事件
    window.addEventListener('wheel', function(e) {
        console.log('滚轮事件触发!', e.deltaY);
        handleScroll(e);
    }, { passive: false });
    
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    
    // 窗口大小变化时重新加载
    window.addEventListener('resize', function() {
        location.reload();
    });
    
    // 添加测试按钮事件处理
    const testScrollBtn = document.getElementById('test-scroll');
    if (testScrollBtn) {
        testScrollBtn.addEventListener('click', function() {
            console.log('测试按钮点击 - 增加滚动位置100px');
            scrollPosition += 100;
            
            // 直接计算并应用缩放
            targetScaleRatio = 1 + (Math.min(scrollPosition, viewportHeight) / viewportHeight) * 0.1;
            targetLogoScaleRatio = 1 + (Math.min(scrollPosition, viewportHeight) / viewportHeight) * 4;
            
            // 计算硬币位置
            updateCoinPositions();
            
            // 立即应用缩放
            heroBackground.style.transform = `scale(${targetScaleRatio})`;
            centerLogo.style.transform = `translate(-50%, -50%) scale(${targetLogoScaleRatio})`;
            
            console.log('测试按钮: 位置', scrollPosition, '背景缩放', targetScaleRatio, 'Logo缩放', targetLogoScaleRatio);
            updateDebugInfo();
        });
    }
    
    // 立即开始动画循环
    requestAnimationFrame(animateParameters);

    // 更新features区域的显示
    function updateFeaturesVisibility() {
        // 获取所有特性项目
        const featureItems = document.querySelectorAll('.feature-item');
        console.log('特性项目总数:', featureItems.length);
        
        // 遍历所有特性项目并根据滚动进度设置其可见性
        featureItems.forEach((item, index) => {
            const itemThreshold = index / featureItems.length;
            
            // 如果当前滚动进度超过了此项目的阈值，则显示它
            if (featuresScrollProgress >= itemThreshold) {
                item.style.opacity = "1";
                item.style.transform = "translateY(0)";
                item.classList.add('active');
            } else {
                item.style.opacity = "0";
                item.style.transform = "translateY(20px)";
                item.classList.remove('active');
            }
        });
        
        // 当滚动进度达到最大值时显示tokenomics部分
        const tokenomicsEl = document.querySelector('.tokenomics');
        if (tokenomicsEl) {
            if (featuresScrollProgress >= 0.9) {
                tokenomicsEl.classList.add('active');
            } else {
                tokenomicsEl.classList.remove('active');
            }
        }
    }

    // 监听滚动事件，控制参数显示效果
    const featuresSection = document.querySelector('.test');
    if (featuresSection) {
        featuresSection.addEventListener('wheel', (e) => {
            if (isAnimating) return;
            
            if (e.deltaY > 0 && featuresScrollProgress < 1) {
                // 向下滚动
                featuresScrollProgress = Math.min(featuresScrollProgress + 0.1, 1);
            } else if (e.deltaY < 0 && featuresScrollProgress > 0) {
                // 向上滚动
                featuresScrollProgress = Math.max(featuresScrollProgress - 0.1, 0);
            }
            
            // 更新特性显示状态
            updateFeaturesVisibility();
            
            // 防止过快滚动
            isAnimating = true;
            setTimeout(() => {
                isAnimating = false;
            }, 100);
            
            e.preventDefault();
        }, { passive: false });
    }
    
    // 添加从tokenomics部分返回features部分的功能
    const tokenomicsContainer = document.querySelector('.tokenomics');
    if (tokenomicsContainer) {
        tokenomicsContainer.addEventListener('wheel', (e) => {
            // 只处理向上滚动的情况
            if (e.deltaY < 0 && tokenomicsContainer.classList.contains('active')) {
                // 移除active类，隐藏tokenomics部分
                tokenomicsContainer.classList.remove('active');
                
                // 重置featuresScrollProgress到最大值以下，使其能返回到features部分
                featuresScrollProgress = 0.85;
                
                // 更新特性显示
                updateFeaturesVisibility();
                
                // 防止过快滚动
                e.preventDefault();
            }
        }, { passive: false });
    }
}); 