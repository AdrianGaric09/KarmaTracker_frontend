<template>
    <div :style="startBgStyle">
      <div :style="startContainerStyle">
        <div 
          :style="startTitleStyle"
          @mouseenter="startHovered = true"
          @mouseleave="startHovered = false"
          @click="goToProceed"
        >
          START
        </div>
        
        <div :style="menuListStyle">
          <div 
            :style="getMenuItemStyle('profile')"
            @mouseenter="hoveredItem = 'profile'"
            @mouseleave="hoveredItem = ''"
          >
            <span :style="bulletStyle">•</span>
            PROFILE
          </div>
          <div 
            :style="getMenuItemStyle('luck')"
            @mouseenter="hoveredItem = 'luck'"
            @mouseleave="hoveredItem = ''"
          >
            <span :style="bulletStyle">•</span>
            TEST MY LUCK
          </div>
          <div 
            :style="getMenuItemStyle('items')"
            @mouseenter="hoveredItem = 'items'"
            @mouseleave="hoveredItem = ''"
          >
            <span :style="bulletStyle">•</span>
            MY ITEMS
          </div>
          <div 
            :style="getMenuItemStyle('points')"
            @mouseenter="hoveredItem = 'points'"
            @mouseleave="hoveredItem = ''"
          >
            <span :style="bulletStyle">•</span>
            MY POINTS
          </div>
          <div 
            :style="getMenuItemStyle('contact')"
            @mouseenter="hoveredItem = 'contact'"
            @mouseleave="hoveredItem = ''"
          >
            <span :style="bulletStyle">•</span>
            CONTACT
          </div>
        </div>
        
        <div 
          :style="logoutStyle"
          @mouseenter="logoutHover = true"
          @mouseleave="logoutHover = false"
        >
          Logout
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'StartPage',
    data(){ return{ startHovered: false, hoveredItem: '', logoutHover: false }; },
   methods: { 
     goToProceed(){ this.$router.push('/proceed'); },
     getMenuItemStyle(itemType){ const isHovered = this.hoveredItem === itemType; return { fontSize: '1.5rem', color: isHovered ? '#fff': '#ccc', fontWeight: isHovered ? '700': '500', letterSpacing: '1px', textShadow: isHovered ? '0 5px 5px #000000': '0 3px 3px #000000', cursor: 'default', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }; }
   },
   computed: { 
     startBgStyle(){ return{ height: '100vh', width: '100vw', background: '#4A4441', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'MedievalSharp', system-ui, sans-serif" }; },
     startContainerStyle(){ return{ background: 'transparent', border: '4px solid #FFD400', padding: '5rem 8rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }; },
     startTitleStyle(){ return{ fontSize: '4.5rem', color: '#fff', fontWeight: '700', letterSpacing: '2px', textShadow: '0 10px 10px #000000', cursor: 'pointer', transition: 'all 0.3s ease', ...(this.startHovered &&{ WebkitTextStroke: '1px #fff', textShadow: '0 20px 20px #000000' }) }; },
     menuListStyle(){ return{ display: 'flex', flexDirection: 'column', gap: '1.8rem', alignItems: 'flex-start', margin: '50px 0' }; },
     bulletStyle(){ return{ color: '#666', fontSize: '1.2rem', fontWeight: 'bold' }; },
     logoutStyle(){ return{ fontSize: '1.2rem', color: '#ccc', textDecoration: 'underline', cursor: 'none', transition: 'all 0.2s ease', textShadow: '0 2px 2px #000000', opacity: this.logoutHover ? 0: 0.8 }; }
   } }
  </script>
  
  <style>
  @import url('https://fonts.googleapis.com/css2?family=MedievalSharp&display=swap');
  </style>