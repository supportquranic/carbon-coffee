/**
 * Carbon Coffee - Cookie & Cache Consent Banner + Low-End Device Optimizer
 */
(function() {
  'use strict';

  // 1. Service Worker Registration (Store images and heavy assets in browser cache)
  function initServiceWorker() {
    if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      const register = () => {
        navigator.serviceWorker.register('/sw.js')
          .then((reg) => {
            // Check for updates periodically
            reg.onupdatefound = () => {
              const installingWorker = reg.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('[Carbon Cache] Assets updated in background.');
                  }
                };
              }
            };
          })
          .catch((err) => {
            console.debug('[Carbon Cache] SW registration:', err);
          });
      };

      if (document.readyState === 'complete') {
        register();
      } else {
        window.addEventListener('load', register);
      }
    }
  }

  // 2. Low-End Device Performance & Memory Optimization
  function optimizeForLowEndDevices() {
    const isLowMemory = navigator.deviceMemory && navigator.deviceMemory <= 4;
    const isLowCPU = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    const isSlowConn = navigator.connection && (navigator.connection.saveData || /2g|3g/.test(navigator.connection.effectiveType));
    const isLowEnd = isLowMemory || isLowCPU || isSlowConn;

    if (isLowEnd) {
      document.documentElement.classList.add('carbon-low-end-device');
    }

    // Pre-decode and cache images in browser memory off the main thread
    const idleCallback = window.requestIdleCallback || function(cb) { setTimeout(cb, 100); };

    idleCallback(() => {
      const images = document.querySelectorAll('img:not([decoding="async"])');
      images.forEach((img) => {
        img.decoding = 'async';
        if (img.complete && img.decode) {
          img.decode().catch(() => {});
        }
      });
    });
  }

  // 3. Cookie & Cache Consent Banner
  const CONSENT_KEY = 'carbon_cookie_consent';

  function hasUserConsented() {
    try {
      if (localStorage.getItem(CONSENT_KEY) === 'accepted') return true;
      if (document.cookie.split(';').some(c => c.trim().startsWith(CONSENT_KEY + '='))) return true;
    } catch (e) {}
    return false;
  }

  function saveConsent() {
    try {
      localStorage.setItem(CONSENT_KEY, 'accepted');
      const maxAge = 365 * 24 * 60 * 60; // 1 year
      document.cookie = CONSENT_KEY + '=accepted; max-age=' + maxAge + '; path=/; SameSite=Lax';
    } catch (e) {}
  }

  function injectConsentBanner() {
    if (hasUserConsented()) {
      initServiceWorker();
      return;
    }

    // Create banner container
    const banner = document.createElement('div');
    banner.id = 'carbon-cookie-consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Cookie and cache consent');

    banner.innerHTML = `
      <div class="carbon-consent-card">
        <div class="carbon-consent-content">
          <div class="carbon-consent-icon-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path>
              <path d="M8.5 8.5v.01"></path>
              <path d="M7 13v.01"></path>
              <path d="M11 16v.01"></path>
              <path d="M15.5 13.5v.01"></path>
            </svg>
          </div>
          <div class="carbon-consent-text">
            <h4>Fast Browsing & Cache Consent</h4>
            <p>
              We store images, brew menus, and essential design elements in necessary browser cookies and local cache storage. This eliminates patch-loading and ensures instant, lag-free performance—even on mobile and low-end devices. No marketing trackers.
            </p>
          </div>
        </div>
        <div class="carbon-consent-actions">
          <button type="button" class="carbon-btn-secondary" id="carbon-consent-necessary">Necessary Only</button>
          <button type="button" class="carbon-btn-primary" id="carbon-consent-accept">Accept & Enable Cache</button>
        </div>
      </div>
    `;

    // Inject styles for the consent banner
    const style = document.createElement('style');
    style.id = 'carbon-cookie-consent-styles';
    style.textContent = `
      #carbon-cookie-consent-banner {
        position: fixed;
        bottom: 20px;
        left: 20px;
        right: 20px;
        max-width: 520px;
        margin: 0 auto;
        z-index: 9999999;
        font-family: "Manrope", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        transform: translateY(120%);
        opacity: 0;
        transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
        pointer-events: none;
      }
      #carbon-cookie-consent-banner.carbon-consent-visible {
        transform: translateY(0);
        opacity: 1;
        pointer-events: auto;
      }
      .carbon-consent-card {
        background: rgba(252, 247, 238, 0.94);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid rgba(125, 44, 15, 0.16);
        border-radius: 20px;
        padding: 20px 22px;
        box-shadow: 0 16px 40px -8px rgba(45, 20, 5, 0.22), 0 0 0 1px rgba(255, 255, 255, 0.6) inset;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .carbon-consent-content {
        display: flex;
        align-items: flex-start;
        gap: 14px;
      }
      .carbon-consent-icon-box {
        flex-shrink: 0;
        width: 40px;
        height: 40px;
        border-radius: 12px;
        background: rgba(125, 44, 15, 0.08);
        color: #7D2C0F;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .carbon-consent-text h4 {
        margin: 0 0 4px 0;
        font-size: 15px;
        font-weight: 700;
        color: #7D2C0F;
        line-height: 1.25;
      }
      .carbon-consent-text p {
        margin: 0;
        font-size: 12.5px;
        line-height: 1.5;
        color: #5a3c2e;
      }
      .carbon-consent-actions {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 10px;
      }
      .carbon-btn-secondary {
        background: transparent;
        color: #7D2C0F;
        border: 1px solid rgba(125, 44, 15, 0.25);
        border-radius: 999px;
        padding: 8px 16px;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s, border-color 0.2s;
      }
      .carbon-btn-secondary:hover {
        background: rgba(125, 44, 15, 0.06);
        border-color: rgba(125, 44, 15, 0.4);
      }
      .carbon-btn-primary {
        background: #7D2C0F;
        color: #ffffff;
        border: none;
        border-radius: 999px;
        padding: 9px 20px;
        font-size: 12.5px;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 4px 14px rgba(125, 44, 15, 0.28);
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s, box-shadow 0.2s;
      }
      .carbon-btn-primary:hover {
        background: #62220b;
        transform: scale(1.03) translateY(-1px);
        box-shadow: 0 6px 18px rgba(125, 44, 15, 0.38);
      }
      @media (max-width: 600px) {
        #carbon-cookie-consent-banner {
          bottom: 12px;
          left: 12px;
          right: 12px;
        }
        .carbon-consent-card {
          padding: 16px;
          gap: 14px;
        }
        .carbon-consent-actions {
          flex-direction: row;
          width: 100%;
        }
        .carbon-btn-secondary, .carbon-btn-primary {
          flex: 1;
          text-align: center;
          padding: 10px 12px;
          font-size: 12px;
        }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(banner);

    // Smooth reveal after short delay
    setTimeout(() => {
      banner.classList.add('carbon-consent-visible');
    }, 600);

    function closeBanner() {
      saveConsent();
      banner.classList.remove('carbon-consent-visible');
      setTimeout(() => {
        banner.remove();
      }, 500);
      initServiceWorker();
    }

    document.getElementById('carbon-consent-accept').addEventListener('click', closeBanner);
    document.getElementById('carbon-consent-necessary').addEventListener('click', closeBanner);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      optimizeForLowEndDevices();
      injectConsentBanner();
    });
  } else {
    optimizeForLowEndDevices();
    injectConsentBanner();
  }
})();
