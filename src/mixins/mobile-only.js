export const mobileOnlyMixin = {
  data() {
    return {
      windowWidth: window.innerWidth,
      isMobile: window.innerWidth <= 767,
      isTablet: window.innerWidth >= 768 && window.innerWidth <= 1023,
      isSmallDevice: window.innerWidth <= 1023, // Mobile + Tablet
      isDesktop: window.innerWidth >= 1024,
    }
  },
  
  computed: {
    isMobileView() {
      return this.windowWidth <= 767
    },
    
    isTabletView() {
      return this.windowWidth >= 768 && this.windowWidth <= 1023
    },
    
    isSmallDeviceView() {
      return this.windowWidth <= 1023
    },
    
    isDesktopView() {
      return this.windowWidth >= 1024
    },
    
    mobileButtonStyle() {
      if (this.isDesktopView) return {} // No changes on desktop
      
      return {
        padding: this.isMobileView ? '0.5rem 1rem' : '0.75rem 1.25rem',
        fontSize: this.isMobileView ? '0.875rem' : '0.9375rem',
        minHeight: this.isMobileView ? '40px' : '44px',
        width: this.isMobileView ? '100%' : 'auto',
        borderRadius: '0.5rem'
      }
    },
    
    mobileInputStyle() {
      if (this.isDesktopView) return {} // No changes on desktop
      
      return {
        padding: this.isMobileView ? '0.5rem' : '0.75rem',
        fontSize: this.isMobileView ? '0.875rem' : '0.9375rem',
        minHeight: this.isMobileView ? '40px' : '44px',
        width: this.isMobileView ? '100%' : 'auto',
        borderRadius: '0.5rem'
      }
    },
    
    mobileCardStyle() {
      if (this.isDesktopView) return {} // No changes on desktop
      
      return {
        padding: this.isMobileView ? '0.75rem' : '1.25rem',
        borderRadius: this.isMobileView ? '0.75rem' : '1rem',
        margin: this.isMobileView ? '0.25rem' : '0.5rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }
    },
    
    mobileTextStyle() {
      if (this.isDesktopView) return {} // No changes on desktop
      
      return {
        fontSize: this.isMobileView ? '0.875rem' : '0.9375rem',
        lineHeight: this.isMobileView ? '1.4' : '1.5'
      }
    },
    
    mobileContainerStyle() {
      if (this.isDesktopView) return {} // No changes on desktop
      
      return {
        width: '100%',
        maxWidth: '100vw',
        margin: '0 auto',
        padding: this.isMobileView ? '0.5rem' : '0.75rem',
        overflowX: 'hidden'
      }
    }
  },
  
  methods: {
    handleResize() {
      this.windowWidth = window.innerWidth
      this.isMobile = window.innerWidth <= 767
      this.isTablet = window.innerWidth >= 768 && window.innerWidth <= 1023
      this.isSmallDevice = window.innerWidth <= 1023
      this.isDesktop = window.innerWidth >= 1024
    },
    
    getMobileClass(baseClass, mobileClass = '', tabletClass = '') {
      if (this.isDesktopView) return baseClass // No changes on desktop
      
      let classes = [baseClass]
      
      if (this.isMobileView && mobileClass) {
        classes.push(mobileClass)
      } else if (this.isTabletView && tabletClass) {
        classes.push(tabletClass)
      }
      
      return classes.join(' ')
    },
    
    shouldShowOnMobile() {
      return this.isMobileView
    },
    
    shouldShowOnTablet() {
      return this.isTabletView
    },
    
    shouldShowOnSmallDevice() {
      return this.isSmallDeviceView
    },
    
    shouldShowOnDesktop() {
      return this.isDesktopView
    },
    
    getMobileSpacing(size = 'md') {
      if (this.isDesktopView) return '' // No changes on desktop
      
      const sizes = {
        xs: { mobile: '0.25rem', tablet: '0.375rem' },
        sm: { mobile: '0.5rem', tablet: '0.625rem' },
        md: { mobile: '0.75rem', tablet: '1rem' },
        lg: { mobile: '1rem', tablet: '1.25rem' },
        xl: { mobile: '1.25rem', tablet: '1.5rem' }
      }
      
      const sizeObj = sizes[size] || sizes.md
      
      if (this.isMobileView) return sizeObj.mobile
      if (this.isTabletView) return sizeObj.tablet
      return sizeObj.mobile
    },
    
    getMobileGridColumns() {
      if (this.isDesktopView) return 1 // No changes on desktop
      
      if (this.isMobileView) return 1
      if (this.isTabletView) return 2
      return 1
    }
  },
  
  mounted() {
    // Add resize event listener
    window.addEventListener('resize', this.handleResize)
    
    // Initial resize check
    this.handleResize()
  },
  
  beforeUnmount() {
    // Remove resize event listener
    window.removeEventListener('resize', this.handleResize)
  }
}

export const mobileOnlyUtils = {
  // Check if current viewport is mobile
  isMobile() {
    return window.innerWidth <= 767
  },
  
  // Check if current viewport is tablet
  isTablet() {
    return window.innerWidth >= 768 && window.innerWidth <= 1023
  },
  
  // Check if current viewport is small device (mobile + tablet)
  isSmallDevice() {
    return window.innerWidth <= 1023
  },
  
  // Check if current viewport is desktop
  isDesktop() {
    return window.innerWidth >= 1024
  },
  
  // Get current device type
  getDeviceType() {
    const width = window.innerWidth
    if (width <= 767) return 'mobile'
    if (width <= 1023) return 'tablet'
    return 'desktop'
  },
  
  // Get mobile-specific font size (only for small devices)
  getMobileFontSize(baseSize = 16) {
    if (window.innerWidth >= 1024) return baseSize // No changes on desktop
    
    const width = window.innerWidth
    if (width <= 767) return Math.round(baseSize * 0.875) // Mobile
    if (width <= 1023) return Math.round(baseSize * 0.9375) // Tablet
    return baseSize
  },
  
  // Get mobile-specific padding (only for small devices)
  getMobilePadding(size = 'md') {
    if (window.innerWidth >= 1024) return '' // No changes on desktop
    
    const sizes = {
      xs: { mobile: 4, tablet: 6 },
      sm: { mobile: 8, tablet: 10 },
      md: { mobile: 12, tablet: 16 },
      lg: { mobile: 16, tablet: 20 },
      xl: { mobile: 20, tablet: 24 }
    }
    
    const sizeObj = sizes[size] || sizes.md
    const width = window.innerWidth
    
    if (width <= 767) return `${sizeObj.mobile}px`
    if (width <= 1023) return `${sizeObj.tablet}px`
    return `${sizeObj.mobile}px`
  }
}
