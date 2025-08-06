/**
 * PWA Validation Utilities
 * Helps validate that all PWA features are working correctly
 */

export interface PWAValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

export class PWAValidator {
  static async validateManifest(): Promise<PWAValidationResult> {
    const result: PWAValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      recommendations: []
    };

    try {
      // Check if manifest is accessible
      const response = await fetch('/manifest.json');
      if (!response.ok) {
        result.errors.push('Manifest file not accessible');
        result.isValid = false;
        return result;
      }

      const manifest = await response.json();

      // Required fields validation
      const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
      for (const field of requiredFields) {
        if (!manifest[field]) {
          result.errors.push(`Missing required field: ${field}`);
          result.isValid = false;
        }
      }

      // Icons validation
      if (manifest.icons && manifest.icons.length > 0) {
        const hasAnyPurpose = manifest.icons.some((icon: any) => 
          !icon.purpose || icon.purpose.includes('any')
        );
        if (!hasAnyPurpose) {
          result.warnings.push('No icons with "any" purpose found');
        }

        const hasMaskableIcon = manifest.icons.some((icon: any) => 
          icon.purpose && icon.purpose.includes('maskable')
        );
        if (!hasMaskableIcon) {
          result.recommendations.push('Consider adding maskable icons for better Android integration');
        }
      }

      // Shortcuts validation
      if (manifest.shortcuts) {
        for (const shortcut of manifest.shortcuts) {
          if (shortcut.icons) {
            for (const icon of shortcut.icons) {
              try {
                const iconResponse = await fetch(icon.src);
                if (!iconResponse.ok) {
                  result.warnings.push(`Shortcut icon not found: ${icon.src}`);
                }
              } catch {
                result.warnings.push(`Failed to validate shortcut icon: ${icon.src}`);
              }
            }
          }
        }
      }

      // Screenshots validation
      if (!manifest.screenshots || manifest.screenshots.length === 0) {
        result.recommendations.push('Add screenshots for better app store presentation');
      }

      return result;
    } catch (error) {
      result.errors.push(`Failed to validate manifest: ${error}`);
      result.isValid = false;
      return result;
    }
  }

  static async validateServiceWorker(): Promise<PWAValidationResult> {
    const result: PWAValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      recommendations: []
    };

    if (!('serviceWorker' in navigator)) {
      result.errors.push('Service Worker not supported in this browser');
      result.isValid = false;
      return result;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        result.warnings.push('No Service Worker registered');
        return result;
      }

      if (registration.active) {
        result.recommendations.push('Service Worker is active and working');
      } else {
        result.warnings.push('Service Worker registered but not active');
      }
    } catch (error) {
      result.errors.push(`Service Worker validation failed: ${error}`);
      result.isValid = false;
    }

    return result;
  }

  static checkInstallability(): PWAValidationResult {
    const result: PWAValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      recommendations: []
    };

    // Check if running in standalone mode
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      result.recommendations.push('App is running in standalone mode');
    } else {
      result.recommendations.push('App is not in standalone mode - users can install it');
    }

    // Check for beforeinstallprompt event support
    if ('onbeforeinstallprompt' in window) {
      result.recommendations.push('Browser supports install prompt');
    } else {
      result.warnings.push('Browser may not support install prompts');
    }

    return result;
  }

  static async runFullValidation(): Promise<{
    manifest: PWAValidationResult;
    serviceWorker: PWAValidationResult;
    installability: PWAValidationResult;
    overall: PWAValidationResult;
  }> {
    const [manifest, serviceWorker] = await Promise.all([
      this.validateManifest(),
      this.validateServiceWorker()
    ]);
    
    const installability = this.checkInstallability();

    const overall: PWAValidationResult = {
      isValid: manifest.isValid && serviceWorker.isValid && installability.isValid,
      errors: [...manifest.errors, ...serviceWorker.errors, ...installability.errors],
      warnings: [...manifest.warnings, ...serviceWorker.warnings, ...installability.warnings],
      recommendations: [...manifest.recommendations, ...serviceWorker.recommendations, ...installability.recommendations]
    };

    return {
      manifest,
      serviceWorker,
      installability,
      overall
    };
  }
}