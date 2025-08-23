// Admin Sidebar Toggle Utility for Mobile
export const initAdminSidebarToggle = () => {
  // Create mobile sidebar toggle button
  const createToggleButton = () => {
    const existingButton = document.querySelector('.mobile-sidebar-toggle');
    if (existingButton) return existingButton;

    const button = document.createElement('button');
    button.className = 'mobile-sidebar-toggle';
    button.innerHTML = '☰ Menu';
    button.setAttribute('aria-label', 'Toggle sidebar menu');
    
    return button;
  };

  // Create overlay for mobile sidebar
  const createOverlay = () => {
    const existingOverlay = document.querySelector('.admin-sidebar-overlay');
    if (existingOverlay) return existingOverlay;

    const overlay = document.createElement('div');
    overlay.className = 'admin-sidebar-overlay';
    document.body.appendChild(overlay);
    
    return overlay;
  };

  // Toggle sidebar function
  const toggleSidebar = () => {
    const sidebar = document.querySelector('.admin-sidebar, .ant-layout-sider, [class*="sider"]');
    const overlay = document.querySelector('.admin-sidebar-overlay');
    
    if (sidebar && overlay) {
      const isOpen = sidebar.classList.contains('open');
      
      if (isOpen) {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
        document.body.style.overflow = '';
      } else {
        sidebar.classList.add('open');
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
      }
    }
  };

  // Close sidebar function
  const closeSidebar = () => {
    const sidebar = document.querySelector('.admin-sidebar, .ant-layout-sider, [class*="sider"]');
    const overlay = document.querySelector('.admin-sidebar-overlay');
    
    if (sidebar && overlay) {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
      document.body.style.overflow = '';
    }
  };

  // Initialize on mobile screens
  const init = () => {
    if (window.innerWidth <= 767) {
      const header = document.querySelector('.admin-header, [class*="header"]');
      const button = createToggleButton();
      const overlay = createOverlay();

      // Add button to header if not already present
      if (header && !header.contains(button)) {
        header.appendChild(button);
      }

      // Add click event to toggle button
      button.addEventListener('click', toggleSidebar);

      // Add click event to overlay to close sidebar
      overlay.addEventListener('click', closeSidebar);

      // Close sidebar when clicking on menu items
      const menuItems = document.querySelectorAll('.ant-menu-item, [class*="menu-item"]');
      menuItems.forEach(item => {
        item.addEventListener('click', closeSidebar);
      });

      // Handle window resize
      const handleResize = () => {
        if (window.innerWidth > 767) {
          closeSidebar();
          button.style.display = 'none';
        } else {
          button.style.display = 'block';
        }
      };

      window.addEventListener('resize', handleResize);
      handleResize(); // Initial check
    }
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { toggleSidebar, closeSidebar, init };
};

// Auto-initialize when script is loaded
if (typeof window !== 'undefined') {
  initAdminSidebarToggle();
}
